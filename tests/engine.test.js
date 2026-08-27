import test from "node:test";
import assert from "node:assert/strict";
import { buildQuestionPool, selectNextQuestion } from "../js/questions.js";
import { levelForAbility, scoreAnswer, updateAbility } from "../js/scoring.js";

function answerFor(question, pattern) {
  if (pattern === "correct") return Array.isArray(question.correct) ? [...question.correct] : question.correct;
  if (question.type === "single") return question.options.find((option) => option !== question.correct);
  if (question.type === "multi") return question.options.filter((option) => !question.correct.includes(option));
  if (question.type === "ordering") return [...question.correct].reverse();
  if (question.type === "completion") return question.options.map((options, index) => options.find((option) => option !== question.correct[index]));
  return null;
}

function simulate(total, pattern, seed) {
  const pool = buildQuestionPool(seed);
  const state = { seed, total, ability: 2, streak: 0, usedIds: [], responses: [], forcedIds: null };
  for (let index = 0; index < total; index += 1) {
    const question = selectNextQuestion(pool, state);
    assert.ok(question, `question ${index + 1} should exist`);
    assert.ok(!state.usedIds.includes(question.id), "question IDs must not repeat");
    const answer = answerFor(question, pattern);
    const score = scoreAnswer(question, answer);
    state.ability = updateAbility({ ability: state.ability, difficulty: question.difficulty, score, category: question.category, total });
    state.streak = score >= .75 ? Math.max(1, state.streak + 1) : score <= .25 ? Math.min(-1, state.streak - 1) : 0;
    state.responses.push({ questionId: question.id, category: question.category, pathway: question.pathway, score });
    state.usedIds.push(question.id);
  }
  return state;
}

test("question pool is large, varied, and uniquely identified", () => {
  const pool = buildQuestionPool("pool-test");
  assert.ok(pool.length >= 200, `expected at least 200 questions, got ${pool.length}`);
  assert.equal(new Set(pool.map((question) => question.id)).size, pool.length);
  assert.ok(new Set(pool.map((question) => question.pathway)).size >= 15);
  assert.ok(new Set(pool.map((question) => question.category)).size >= 7);
});

test("20, 50, and 100 question sessions contain no duplicate IDs", () => {
  for (const total of [20, 50, 100]) {
    const session = simulate(total, "correct", `length-${total}`);
    assert.equal(session.usedIds.length, total);
    assert.equal(new Set(session.usedIds).size, total);
  }
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
