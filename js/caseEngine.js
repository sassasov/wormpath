export function seededRandom(seed = `${Date.now()}`) {
  let hash = 2166136261;
  for (const character of String(seed)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  let state = hash >>> 0 || 1;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle(items, random = Math.random) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

export function scoreQuestion(question, response) {
  if (question.format === "single") return response === question.answer ? 1 : 0;
  if (question.format === "order") {
    const canonical = new Map(question.answer.map((item, index) => [item, index]));
    let agreeing = 0;
    let pairs = 0;
    for (let left = 0; left < response.length; left += 1) {
      for (let right = left + 1; right < response.length; right += 1) {
        pairs += 1;
        if (canonical.get(response[left]) < canonical.get(response[right])) agreeing += 1;
      }
    }
    return pairs ? agreeing / pairs : 0;
  }
  if (question.format === "truth-grid") {
    const correct = question.statements.reduce((count, statement, index) => count + (response?.[index] === statement.truth ? 1 : 0), 0);
    return [0, 0, 0.2, 0.6, 1][correct];
  }
  return 0;
}

export function levelFor(percent) {
  if (percent >= 86) return { name: "Professor", note: "You consistently separate observations, models, and stronger causal tests." };
  if (percent >= 72) return { name: "PhD", note: "You reason well through mechanisms, perturbations, and experimental limitations." };
  if (percent >= 60) return { name: "MSc", note: "You connect most data to mechanisms; revisit the cases where alternatives remained plausible." };
  if (percent >= 45) return { name: "BSc", note: "Your core pathway logic is working. Practice predictions and experimental controls next." };
  return { name: "School", note: "A useful starting point. Case debriefs will help turn separate facts into connected models." };
}

function questionCounts(total) {
  const cases = total === 20 ? 6 : total === 50 ? 15 : 30;
  const counts = Array(cases).fill(3);
  let remaining = total - cases * 3;
  for (let index = 0; remaining > 0; index = (index + 1) % cases) {
    counts[index] += 1;
    remaining -= 1;
  }
  return counts;
}

export function buildAssessment(cases, total, seed = `${Date.now()}`, options = {}) {
  if (![20, 50, 100].includes(total) && !(options.caseCount === 1 && total === 4)) throw new Error("Assessment length must be 20, 50, or 100");
  const random = seededRandom(seed);
  const eligible = cases.filter(item => item.reviewStatus === "verified" && item.questions.length >= 4);
  const counts = options.caseCount === 1 ? [Math.min(total, 4)] : questionCounts(total);
  if (eligible.length < counts.length) throw new Error("Not enough verified cases for this assessment");
  const articleCases = shuffle(eligible.filter(item => item.articleDerived), random);
  const originalCases = shuffle(eligible.filter(item => !item.articleDerived), random);
  const selected = [];
  const desiredArticles = Math.min(articleCases.length, Math.ceil(counts.length * 0.25));
  selected.push(...articleCases.slice(0, desiredArticles));
  selected.push(...originalCases.slice(0, counts.length - selected.length));
  if (selected.length < counts.length) {
    const used = new Set(selected.map(item => item.id));
    selected.push(...shuffle(eligible.filter(item => !used.has(item.id)), random).slice(0, counts.length - selected.length));
  }
  return shuffle(selected, random).map((caseItem, index) => ({
    case: caseItem,
    questions: shuffle(caseItem.questions, random).slice(0, counts[index])
  }));
}

function groupScores(responses, key) {
  const groups = new Map();
  for (const item of responses) {
    for (const name of [].concat(item.question[key] || []).filter(Boolean)) {
      const group = groups.get(name) || { name, earned: 0, total: 0 };
      group.earned += item.score;
      group.total += 1;
      groups.set(name, group);
    }
  }
  return [...groups.values()]
    .map(group => ({ ...group, percent: Math.round(group.earned / group.total * 100) }))
    .sort((left, right) => right.total - left.total || right.percent - left.percent);
}

export class CaseSession {
  constructor(cases, total, options = {}) {
    this.length = total;
    this.seed = options.seed || `${Date.now()}-${Math.random()}`;
    this.caseBlocks = buildAssessment(cases, total, this.seed, options);
    this.caseIndex = 0;
    this.questionIndex = 0;
    this.responses = [];
  }

  currentBlock() { return this.caseBlocks[this.caseIndex] || null; }
  currentCase() { return this.currentBlock()?.case || null; }
  currentQuestion() { return this.currentBlock()?.questions[this.questionIndex] || null; }

  submit(response, confidence = 2) {
    const question = this.currentQuestion();
    if (!question) throw new Error("No active question");
    const score = scoreQuestion(question, response);
    const result = { caseId: this.currentCase().id, question, response, confidence, score };
    this.responses.push(result);
    return result;
  }

  advance() {
    const block = this.currentBlock();
    if (!block) return { finished: true };
    if (this.questionIndex + 1 < block.questions.length) {
      this.questionIndex += 1;
      return { caseChanged: false, finished: false };
    }
    this.caseIndex += 1;
    this.questionIndex = 0;
    return { caseChanged: true, finished: this.caseIndex >= this.caseBlocks.length };
  }

  caseProgress() {
    const block = this.currentBlock();
    return block ? { position: this.questionIndex + 1, total: block.questions.length } : { position: 0, total: 0 };
  }

  summary() {
    const earned = this.responses.reduce((sum, item) => sum + item.score, 0);
    const percent = Math.round(earned / this.length * 100);
    const misconceptions = new Map();
    for (const response of this.responses.filter(item => item.score < 0.6)) {
      for (const label of response.question.misconceptions || []) misconceptions.set(label, (misconceptions.get(label) || 0) + 1);
    }
    return {
      earned,
      total: this.length,
      percent,
      level: levelFor(percent),
      reasoning: groupScores(this.responses, "reasoningSkills"),
      knowledge: groupScores(this.responses, "knowledgeDomains"),
      mistakes: this.responses.filter(item => item.score < 1),
      misconceptions: [...misconceptions.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
      confidenceGap: this.responses.filter(item => item.confidence === 3 && item.score < 0.6).length
    };
  }
}
