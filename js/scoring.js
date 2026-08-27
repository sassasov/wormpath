const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));

export const LEVELS = [
  { name: "School", minimum: 1, description: "Understands major biological concepts and recognizable pathways, with molecular detail still developing." },
  { name: "BSc", minimum: 1.7, description: "Understands core genes, pathway order, basic molecular functions, and standard cell biology." },
  { name: "MSc", minimum: 2.6, description: "Can reconstruct mechanisms, distinguish neighboring genes, and predict straightforward perturbations." },
  { name: "PhD", minimum: 3.5, description: "Can reason through epistasis, pathway perturbations, experimental data, and mechanistic caveats." },
  { name: "Professor", minimum: 4.25, description: "Consistently handles difficult topology, ambiguity, experimental limitations, and advanced mechanistic reasoning." }
];

export function scoreAnswer(question, answer) {
  if (question.type === "single") return answer === question.correct ? 1 : 0;

  if (question.type === "multi") {
    const selected = new Set(answer);
    const correct = new Set(question.correct);
    const truePositives = [...selected].filter((value) => correct.has(value)).length;
    const falsePositives = [...selected].filter((value) => !correct.has(value)).length;
    const wrongOptionCount = Math.max(1, question.options.length - correct.size);
    const sensitivity = truePositives / correct.size;
    const falsePositiveRate = falsePositives / wrongOptionCount;
    return clamp(sensitivity - falsePositiveRate, 0, 1);
  }

  if (question.type === "completion") {
    const correctCount = question.correct.reduce((count, value, index) => count + (answer[index] === value ? 1 : 0), 0);
    return correctCount / question.correct.length;
  }

  if (question.type === "ordering") {
    const canonicalIndex = new Map(question.correct.map((item, index) => [item, index]));
    let agreeingPairs = 0;
    let totalPairs = 0;
    for (let left = 0; left < answer.length; left += 1) {
      for (let right = left + 1; right < answer.length; right += 1) {
        totalPairs += 1;
        if (canonicalIndex.get(answer[left]) < canonicalIndex.get(answer[right])) agreeingPairs += 1;
      }
    }
    return totalPairs ? agreeingPairs / totalPairs : 0;
  }

  return 0;
}

export function expectedScore(ability, difficulty) {
  return 1 / (1 + Math.exp(1.35 * (difficulty - ability)));
}

export function updateAbility({ ability, difficulty, score, category, total }) {
  const learningRate = total <= 20 ? 0.52 : total <= 50 ? 0.36 : 0.27;
  const discrimination = ["epistasis", "experiment", "topology"].includes(category) ? 1.12 : 1;
  const delta = learningRate * discrimination * (score - expectedScore(ability, difficulty));
  return clamp(ability + delta, 0.75, 5.15);
}

export function levelForAbility(ability) {
  return [...LEVELS].reverse().find((level) => ability >= level.minimum) || LEVELS[0];
}

export function overallAbilityScore(ability) {
  return Math.round(clamp(10 + ((ability - 1) / 4) * 85, 0, 100));
}

export function summarizeResponses(responses, key, minimumCount = 1) {
  const groups = new Map();
  for (const response of responses) {
    const groupKey = response[key];
    if (!groups.has(groupKey)) groups.set(groupKey, []);
    groups.get(groupKey).push(response.score);
  }
  return [...groups.entries()]
    .filter(([, scores]) => scores.length >= minimumCount)
    .map(([id, scores]) => ({ id, count: scores.length, percent: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length * 100) }))
    .sort((a, b) => b.percent - a.percent);
}

export function isFullyCorrect(score) {
  return score >= 0.999;
}
