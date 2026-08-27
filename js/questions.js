import { genes } from "../data/genes.js";
import { pathways } from "../data/pathways.js";
import { curatedQuestions } from "../data/curatedQuestions.js";

export const categoryLabels = {
  geneFunction: "Gene → function",
  functionGene: "Function → gene",
  ordering: "Mechanism ordering",
  topology: "Pathway topology",
  perturbation: "Perturbation prediction",
  epistasis: "Genetic epistasis",
  experiment: "Experimental interpretation"
};

export function hashSeed(value) {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function createRng(seed) {
  let state = hashSeed(seed) || 1;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle(items, rng) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function geneCandidates(record, rng) {
  const samePathway = shuffle(genes.filter((candidate) => candidate.gene !== record.gene && candidate.pathway === record.pathway), rng);
  const closeDifficulty = shuffle(genes.filter((candidate) => candidate.gene !== record.gene && candidate.pathway !== record.pathway && Math.abs(candidate.difficulty - record.difficulty) <= 1), rng);
  return [...samePathway, ...closeDifficulty];
}

function takeDistinct(items, count, key = (item) => item, excluded = new Set()) {
  const result = [];
  const seen = new Set(excluded);
  for (const item of items) {
    const value = key(item);
    if (!seen.has(value)) {
      result.push(item);
      seen.add(value);
    }
    if (result.length === count) break;
  }
  return result;
}

function generateGeneQuestions(seed) {
  const rng = createRng(`${seed}:genes`);
  return genes.flatMap((record) => {
    const candidates = geneCandidates(record, rng);
    const process = record.biologicalProcesses[0];
    const correctStatements = [
      `Functions as ${record.molecularFunction}.`,
      `Participates in ${process}.`
    ];
    if (record.cellularLocalization.length) {
      correctStatements.push(`Can localize to ${record.cellularLocalization[0]}.`);
    }

    const wrongFunctions = takeDistinct(
      candidates.map((candidate) => `Functions as ${candidate.molecularFunction}.`),
      correctStatements.length,
      (statement) => statement,
      new Set(correctStatements)
    );

    const distractorGenes = takeDistinct(candidates, 5, (candidate) => candidate.gene, new Set([record.gene]));
    const geneOptions = shuffle([record.gene, ...distractorGenes.map((candidate) => candidate.gene)].slice(0, 6), rng);

    return [
      {
        id: `gene-function:${record.gene}`,
        type: "multi",
        category: "geneFunction",
        pathway: record.pathway,
        difficulty: record.difficulty,
        prompt: `<i>${record.gene}</i> — which descriptions apply?`,
        instruction: "Select every supported statement. Incorrect selections reduce credit.",
        options: shuffle([...correctStatements, ...wrongFunctions], rng),
        correct: correctStatements,
        explanation: record.explanation,
        genes: [record.gene],
        referenceIds: record.references
      },
      {
        id: `function-gene:${record.gene}`,
        type: "single",
        category: "functionGene",
        pathway: record.pathway,
        difficulty: record.difficulty,
        prompt: record.explanation,
        instruction: "Which gene is described?",
        options: geneOptions,
        correct: record.gene,
        explanation: `${record.gene} encodes ${record.molecularFunction}.`,
        genes: [record.gene],
        referenceIds: record.references
      }
    ];
  });
}

function prepareCuratedQuestion(question, seed) {
  const rng = createRng(`${seed}:${question.id}`);
  const prepared = { ...question };
  if (question.type === "single" || question.type === "multi") {
    prepared.options = shuffle(question.options, rng);
  }
  if (question.type === "ordering") {
    prepared.correct = [...question.items];
    prepared.items = shuffle(question.items, rng);
    if (prepared.items.every((item, index) => item === question.items[index])) {
      [prepared.items[0], prepared.items[1]] = [prepared.items[1], prepared.items[0]];
    }
  }
  if (question.type === "completion") {
    prepared.options = question.options.map((options) => shuffle(options, rng));
    prepared.correct = [...question.blanks];
  }
  return prepared;
}

export function buildQuestionPool(seed = "wormpath") {
  const generated = generateGeneQuestions(seed);
  const curated = curatedQuestions.map((question) => prepareCuratedQuestion(question, seed));
  const pool = [...generated, ...curated];
  const ids = new Set(pool.map((question) => question.id));
  if (ids.size !== pool.length) throw new Error("Question pool contains duplicate IDs.");
  return pool;
}

function countValues(responses, key) {
  return responses.reduce((counts, response) => {
    const value = response[key];
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}

export function selectNextQuestion(pool, state) {
  if (state.forcedIds?.length) {
    const nextForced = state.forcedIds.find((id) => !state.usedIds.includes(id));
    return pool.find((question) => question.id === nextForced) || null;
  }

  const used = new Set(state.usedIds);
  const available = pool.filter((question) => !used.has(question.id));
  if (!available.length) return null;

  const streakNudge = state.streak >= 2 ? 0.35 : state.streak <= -2 ? -0.35 : 0;
  const targetDifficulty = Math.max(1, Math.min(5, state.ability + streakNudge));
  const categoryCounts = countValues(state.responses, "category");
  const pathwayCounts = countValues(state.responses, "pathway");
  const rng = createRng(`${state.seed}:pick:${state.usedIds.length}:${state.ability.toFixed(3)}`);

  const ranked = available.map((question) => {
    const difficultyFit = 5 - Math.abs(question.difficulty - targetDifficulty) * 1.65;
    const categoryCoverage = 2.1 / (1 + (categoryCounts[question.category] || 0));
    const pathwayCoverage = 1.55 / (1 + (pathwayCounts[question.pathway] || 0));
    const neighboringBonus = Math.abs(question.difficulty - targetDifficulty) <= 1 ? 0.8 : 0;
    const advancedMix = state.usedIds.length > 5 && ["ordering", "topology", "perturbation", "epistasis", "experiment"].includes(question.category) ? 0.45 : 0;
    return { question, score: difficultyFit + categoryCoverage + pathwayCoverage + neighboringBonus + advancedMix + rng() * 0.45 };
  }).sort((a, b) => b.score - a.score);

  const top = ranked.slice(0, Math.min(10, ranked.length));
  const totalWeight = top.reduce((sum, entry) => sum + Math.max(0.1, entry.score), 0);
  let cursor = rng() * totalWeight;
  for (const entry of top) {
    cursor -= Math.max(0.1, entry.score);
    if (cursor <= 0) return entry.question;
  }
  return top[0].question;
}

export function getPathwayName(pathwayId) {
  return pathways[pathwayId]?.name || pathwayId;
}
