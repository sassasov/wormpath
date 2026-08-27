import test from "node:test";
import assert from "node:assert/strict";
import { buildQuestionPool, selectNextQuestion } from "../js/questions.js";
import { levelForAbility, scoreAnswer, updateAbility } from "../js/scoring.js";
import { genes } from "../data/genes.js";
import { pathways } from "../data/pathways.js";
import { cellTypes, organelles } from "../data/spatialAtlas.js";

function answerFor(question, pattern) {
  if (pattern === "correct") return Array.isArray(question.correct) ? [...question.correct] : question.correct;
  if (question.type === "single") return question.options.find((option) => option !== question.correct);
  if (question.type === "multi") return question.options.filter((option) => !question.correct.includes(option));
  if (question.type === "ordering") return [...question.correct].reverse();
  if (question.type === "completion") return question.options.map((options, index) => options.find((option) => option !== question.correct[index]));
  return null;
}

function simulate(total, pattern, seed, focus = "mixed") {
  const pool = buildQuestionPool(seed);
  const state = { seed, total, focus, ability: 2, streak: 0, usedIds: [], responses: [], forcedIds: null };
  for (let index = 0; index < total; index += 1) {
    const question = selectNextQuestion(pool, state);
    assert.ok(question, `question ${index + 1} should exist`);
    assert.ok(!state.usedIds.includes(question.id), "question IDs must not repeat");
    const answer = answerFor(question, pattern);
    const score = scoreAnswer(question, answer);
    state.ability = updateAbility({ ability: state.ability, difficulty: question.difficulty, score, category: question.category, total });
    state.streak = score >= .75 ? Math.max(1, state.streak + 1) : score <= .25 ? Math.min(-1, state.streak - 1) : 0;
    state.responses.push({ questionId: question.id, category: question.category, pathway: question.pathway, domain: question.domain, score });
    state.usedIds.push(question.id);
  }
  return state;
}

test("question pool is large, varied, and uniquely identified", () => {
  const pool = buildQuestionPool("pool-test");
  assert.ok(pool.length >= 1500, `expected at least 1500 questions, got ${pool.length}`);
  assert.equal(new Set(pool.map((question) => question.id)).size, pool.length);
  assert.ok(new Set(pool.map((question) => question.pathway)).size >= 40);
  assert.ok(new Set(pool.map((question) => question.category)).size >= 12);
  assert.deepEqual([...new Set(pool.map((question) => question.domain))].sort(), ["anatomy", "cellBiology", "molecular"]);
  assert.ok(pool.filter((question) => question.category === "experiment").length >= 75);
  assert.ok(pool.filter((question) => question.category === "epistasis").length >= 50);
});

test("biology database meets the expanded scale and spatial model", () => {
  assert.ok(genes.length >= 250 && genes.length <= 400, `expected 250–400 genes, got ${genes.length}`);
  assert.ok(Object.keys(pathways).length >= 40);
  assert.ok(organelles.length >= 35);
  assert.ok(cellTypes.length >= 20);
  assert.ok(genes.filter((record) => record.pathways.length > 1).length >= 25);
  assert.ok(genes.filter((record) => record.organelles.length).length >= 250);
  assert.ok(genes.every((record) => record.description.length >= 300));
});

test("function-to-gene prompts never reveal the answer name", () => {
  const questions = buildQuestionPool("blind-prompts").filter((question) => question.category === "functionGene");
  assert.ok(questions.length >= 250);
  for (const question of questions) {
    assert.ok(!question.prompt.toLowerCase().includes(question.correct.toLowerCase()), `${question.id} reveals ${question.correct}`);
  }
});

test("post-answer explanations include a plain-language teaching layer", () => {
  const questions = buildQuestionPool("plain-language");
  assert.ok(questions.every((question) => question.plainExplanation?.length >= 60));
  const vulval = questions.find((question) => question.id === "cell-function:vulval_precursor");
  assert.ok(vulval);
  assert.match(vulval.plainExplanation, /egg-laying opening/i);
  assert.match(vulval.plainExplanation, /anchor cell.*growth message/i);
  assert.match(vulval.plainExplanation, /LET-23 receptors/i);
  assert.doesNotMatch(vulval.plainExplanation, /anchor-cell EGF/i);
});

test("20, 50, and 100 question sessions contain no duplicate IDs", () => {
  for (const total of [20, 50, 100]) {
    const session = simulate(total, "correct", `length-${total}`);
    assert.equal(session.usedIds.length, total);
    assert.equal(new Set(session.usedIds).size, total);
  }
});

test("Cell Atlas focus strongly favors spatial biology and anatomy", () => {
  const session = simulate(50, "correct", "cell-atlas-focus", "cellAtlas");
  const spatialCount = session.responses.filter((response) => response.domain !== "molecular").length;
  assert.ok(spatialCount >= 35, `expected at least 35 spatial questions, got ${spatialCount}`);
});

test("selecting every option cannot win a multiple-selection question", () => {
  const question = buildQuestionPool("integrity").find((item) => item.type === "multi");
  assert.ok(question);
  assert.ok(scoreAnswer(question, question.options) < 1);
});

test("ordering awards evidence for pairwise-correct partial mechanisms", () => {
  const question = buildQuestionPool("ordering").find((item) => item.type === "ordering");
  const almost = [...question.correct];
  [almost[0], almost[1]] = [almost[1], almost[0]];
  const score = scoreAnswer(question, almost);
  assert.ok(score > 0 && score < 1);
});

test("School-like and Professor-like patterns separate cleanly", () => {
  const school = simulate(20, "wrong", "school-pattern");
  const professor = simulate(100, "correct", "professor-pattern");
  assert.equal(levelForAbility(school.ability).name, "School");
  assert.equal(levelForAbility(professor.ability).name, "Professor");
  assert.ok(professor.ability - school.ability > 2.5);
});

test("a wrong answer far above current ability causes only a small penalty", () => {
  const next = updateAbility({ ability: 2, difficulty: 5, score: 0, category: "experiment", total: 20 });
  assert.ok(next > 1.9, `expected a modest penalty, got ${next}`);
});
