import test from "node:test";
import assert from "node:assert/strict";
import { OLYMPIAD_CASES, CASE_SOURCES } from "../data/olympiadCases.js";
import { CaseSession, scoreQuestion } from "../js/caseEngine.js";

test("Olympiad release contains fifty sourced four-question cases", () => {
  assert.equal(OLYMPIAD_CASES.length, 50);
  assert.equal(new Set(OLYMPIAD_CASES.map(item => item.id)).size, 50);
  assert.ok(OLYMPIAD_CASES.every(item => item.reviewStatus === "verified"));
  assert.ok(OLYMPIAD_CASES.every(item => item.questions.length === 4));
  assert.ok(OLYMPIAD_CASES.every(item => item.sourceIds.length && item.sourceIds.every(id => CASE_SOURCES[id])));
  const questions = OLYMPIAD_CASES.flatMap(item => item.questions);
  assert.equal(questions.length, 200);
  assert.equal(new Set(questions.map(item => item.id)).size, 200);
  assert.ok(questions.every(item => item.format === "single" || item.format === "truth-grid"));
  assert.ok(questions.filter(item => item.format === "single").every(item => new Set(item.options).size === item.options.length));
});

test("twenty, fifty, and one hundred decisions stay grouped into cases", () => {
  for (const [length, caseCount] of [[20, 6], [50, 15], [100, 30]]) {
    const session = new CaseSession(OLYMPIAD_CASES, length, { seed: `group-${length}` });
    assert.equal(session.caseBlocks.length, caseCount);
    assert.equal(session.caseBlocks.reduce((sum, block) => sum + block.questions.length, 0), length);
    assert.ok(session.caseBlocks.every(block => block.questions.length >= 3 && block.questions.length <= 4));
  }
});

test("four-statement partial-credit rule matches the specification", () => {
  const question = OLYMPIAD_CASES[0].questions.find(item => item.format === "truth-grid");
  const correct = Object.fromEntries(question.statements.map((statement, index) => [index, statement.truth]));
  const responseWith = count => Object.fromEntries(question.statements.map((statement, index) => [index, index < count ? statement.truth : !statement.truth]));
  assert.equal(scoreQuestion(question, correct), 1);
  assert.equal(scoreQuestion(question, responseWith(3)), 0.6);
  assert.equal(scoreQuestion(question, responseWith(2)), 0.2);
  assert.equal(scoreQuestion(question, responseWith(1)), 0);
});

