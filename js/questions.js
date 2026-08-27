import { genes } from "../data/genes.js";
import { pathways } from "../data/pathways.js";
import { curatedQuestions } from "../data/curatedQuestions.js";
import { cellTypes, interTissueScenarios, organelleFailureScenarios, organelles, organelleById, reporters, traffickingRoutes } from "../data/spatialAtlas.js?v=20260827-5";

export const categoryLabels = {
  geneFunction: "Gene → function",
  functionGene: "Function → gene",
  ordering: "Mechanism ordering",
  topology: "Pathway topology",
  perturbation: "Perturbation prediction",
  epistasis: "Genetic epistasis",
  experiment: "Experimental interpretation",
  geneOrganelle: "Gene → organelle",
  geneTissue: "Gene → tissue",
  organelleFunction: "Organelle biology",
  localization: "Regulated localization",
  trafficking: "Trace the protein",
  anatomy: "C. elegans anatomy",
  interTissue: "Inter-tissue signaling"
};

const spatialCategories = new Set(["geneOrganelle", "organelleFunction", "localization", "trafficking"]);
const anatomyCategories = new Set(["geneTissue", "anatomy", "interTissue"]);

function domainForCategory(category) {
  if (spatialCategories.has(category)) return "cellBiology";
  if (anatomyCategories.has(category)) return "anatomy";
  return "molecular";
}

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
  const shared = (candidate) => candidate.pathways.some((pathway) => record.pathways.includes(pathway));
  const samePathway = shuffle(genes.filter((candidate) => candidate.gene !== record.gene && shared(candidate)), rng);
  const closeDifficulty = shuffle(genes.filter((candidate) => candidate.gene !== record.gene && !shared(candidate) && Math.abs(candidate.difficulty - record.difficulty) <= 1), rng);
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

function answerText(question) {
  const answer = question.correct;
  if (Array.isArray(answer)) return answer.join(question.type === "ordering" ? " → " : "; ");
  return String(answer || "the supported answer");
}

function firstSentences(text, count = 2) {
  return String(text || "").match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.slice(0, count).join(" ").trim() || "";
}

function plainify(text) {
  return String(text || "")
    .replaceAll("selective nucleocytoplasmic transport", "controlled movement between the nucleus and the rest of the cell")
    .replaceAll("encodes", "contains the instructions for making")
    .replaceAll("curated", "well-supported")
    .replaceAll("spatial association", "known location")
    .replaceAll("spatial context", "known location")
    .replaceAll("subcellular", "inside-the-cell")
    .replaceAll("nucleocytoplasmic", "between the nucleus and the rest of the cell")
    .replaceAll("Connected compartments include", "It connects with")
    .replaceAll("nuclear envelope", "the membrane around the nucleus")
    .replaceAll("cytosol", "the fluid inside the cell")
    .replaceAll("macromolecules", "large molecules such as proteins and RNA")
    .replaceAll("transcriptional output", "change in gene activity")
    .replaceAll("transcriptionally activates", "helps turn on")
    .replaceAll("transcription", "turning genes on or off")
    .replaceAll("phosphorylates and activates", "adds a phosphate tag that switches on")
    .replaceAll("phosphorylates and inhibits", "adds a phosphate tag that blocks")
    .replaceAll("phosphorylates", "adds a phosphate tag to")
    .replaceAll("cytosolic", "in the fluid inside the cell")
    .replaceAll("luminal hydrolases", "digestive enzymes inside the compartment")
    .replaceAll("proteolysis", "protein breakdown")
    .replaceAll("ubiquitinated substrates", "proteins tagged with ubiquitin")
    .replaceAll("cell autonomous", "caused by the gene acting inside that same cell")
    .replaceAll("allele strength", "how strongly the mutation changes the gene")
    .replaceAll("orthogonal strategy", "different kind of test")
    .replaceAll("fate specification", "deciding what kind of cell each cell becomes")
    .replaceAll("carry out", "help with")
    .replaceAll("Specialized structures include", "Important cell features include");
}

function sentenceCase(text) {
  return text ? `${text[0].toUpperCase()}${text.slice(1)}` : "";
}

const conceptDefinitions = [
  { pattern: /\bLIN-3\/EGF\b|anchor[- ]cell EGF/i, text: "The anchor cell is a nearby organizer cell. It releases LIN-3, an EGF-like growth message, to neighboring cells." },
  { pattern: /\bvulval precursor|\bvulva\b/i, text: "The vulva is the worm's egg-laying opening; vulval precursor cells are the immature cells that build it." },
  { pattern: /\bbasolateral\b/i, text: "Basolateral means the side and bottom surfaces of a cell." },
  { pattern: /\bligand\b/i, text: "A ligand is a signal molecule that binds to a receiving protein called a receptor." },
  { pattern: /\breceptor\b/i, text: "A receptor is a protein that receives a signal and starts a response in the cell." },
  { pattern: /\btranscription factor\b/i, text: "A transcription factor is a protein that helps turn particular genes on or off." },
  { pattern: /\bphosphorylat/i, text: "Phosphorylation means adding a small chemical tag that can change a protein's activity." },
  { pattern: /\breporter\b|::GFP|p::GFP/i, text: "A reporter is a visible experimental signal used as an indirect readout; it does not measure every part of the process." },
  { pattern: /\bepistasis\b/i, text: "Epistasis uses combinations of gene changes to work out which step acts earlier or later in a pathway." },
  { pattern: /\bnuclear pore\b/i, text: "A nuclear pore is a gated opening in the membrane that surrounds the nucleus." },
  { pattern: /\bautophagosome\b/i, text: "An autophagosome is a temporary double-membrane sac that carries cell material to the lysosome for recycling." },
  { pattern: /\blysosome\b/i, text: "A lysosome is an acidic recycling compartment that breaks down cell material." },
  { pattern: /\bendosome\b/i, text: "An endosome is a sorting compartment for material brought in from the cell surface." }
];

export function buildPlainExplanation(question) {
  if (question.plainExplanation) return question.plainExplanation;
  const answer = answerText(question);
  const detail = sentenceCase(plainify(firstSentences(question.explanation, question.category === "organelleFunction" ? 1 : 2)));
  let explanation;

  switch (question.category) {
    case "geneFunction":
    case "functionGene":
      explanation = `The supported answer is ${answer}. ${detail}`;
      break;
    case "geneOrganelle":
      explanation = `The supported cell location or locations are ${answer}. A cell compartment is a part of the cell with a particular job. ${detail}`;
      break;
    case "geneTissue":
      explanation = `The supported cells or tissues are ${answer}. This means the gene has been observed or shown to matter there; it does not mean every action of the gene happens only there. ${detail}`;
      break;
    case "organelleFunction":
    case "anatomy":
    case "interTissue":
      explanation = `The answer is ${answer}. ${detail}`;
      break;
    case "localization":
      explanation = `The answer is ${answer}. Localization simply means where a protein is found inside a cell. Moving to a different place can change what that protein is able to do. ${detail}`;
      break;
    case "trafficking":
    case "ordering":
      explanation = `The correct order is ${answer}. This follows the route the material or signal takes from one step to the next. ${detail}`;
      break;
    case "experiment":
      explanation = `The answer is ${answer}. ${detail}`;
      break;
    case "topology":
      explanation = `The modeled relationship is ${answer}. In a pathway, “activates” means helps switch on, while “inhibits” means blocks or reduces. ${detail}`;
      break;
    case "perturbation":
      explanation = `The best local prediction is ${answer}. “Local” means the effect expected for this part of the pathway; other pathways or tissues can change the final whole-animal result. ${detail}`;
      break;
    case "epistasis":
      explanation = `The best prediction is ${answer}. Epistasis compares combined gene changes to work out which step acts earlier or later. ${detail}`;
      break;
    default:
      explanation = `The supported answer is ${answer}. ${detail}`;
  }

  const searchable = `${question.prompt || ""} ${question.explanation || ""} ${answer}`;
  const definitions = conceptDefinitions.filter((entry) => entry.pattern.test(searchable) && !explanation.includes(entry.text)).slice(0, 2).map((entry) => entry.text);
  return `${explanation} ${definitions.join(" ")}`.replace(/\s+/g, " ").trim();
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
    if (record.organelles.length) {
      correctStatements.push(`Has an established spatial association with the ${record.organelles[0].organelle.replaceAll("_", " ")}.`);
    }

    const wrongFunctions = takeDistinct(
      candidates.map((candidate) => `Functions as ${candidate.molecularFunction}.`),
      correctStatements.length,
      (statement) => statement,
      new Set(correctStatements)
    );

    const distractorGenes = takeDistinct(candidates, 5, (candidate) => candidate.gene, new Set([record.gene]));
    const geneOptions = shuffle([record.gene, ...distractorGenes.map((candidate) => candidate.gene)].slice(0, 6), rng);

    const questions = [
      {
        id: `gene-function:${record.gene}`,
        type: "multi",
        category: "geneFunction",
        domain: "molecular",
        pathway: record.pathway,
        difficulty: record.difficulty,
        prompt: `<i>${record.gene}</i> — which descriptions apply?`,
        instruction: "Select every supported statement. Incorrect selections reduce credit.",
        options: shuffle([...correctStatements, ...wrongFunctions], rng),
        correct: correctStatements,
        explanation: record.description,
        genes: [record.gene],
        referenceIds: record.references
      }
    ];

    if (record.recognitionSafe && geneOptions.length >= 4) questions.push({
        id: `function-gene:${record.gene}`,
        type: "single",
        category: "functionGene",
        domain: "molecular",
        pathway: record.pathway,
        difficulty: record.difficulty,
        prompt: record.recognitionPrompt,
        instruction: "Which gene is described?",
        options: geneOptions,
        correct: record.gene,
        explanation: record.description,
        genes: [record.gene],
        referenceIds: record.references
    });

    const spatialEntries = record.organelles.map((entry) => organelleById.get(entry.organelle)).filter(Boolean);
    if (spatialEntries.length) {
      const correct = [...new Set(spatialEntries.map((entry) => entry.name))].slice(0, 4);
      const distractors = takeDistinct(shuffle(organelles.filter((entry) => !correct.includes(entry.name)), rng), Math.max(2, 6 - correct.length), (entry) => entry.name).map((entry) => entry.name);
      questions.push({
        id: `gene-organelle:${record.gene}`,
        type: "multi",
        category: "geneOrganelle",
        domain: "cellBiology",
        pathway: record.pathway,
        difficulty: Math.max(2, record.difficulty),
        prompt: `<i>${record.gene}</i> — which compartments are established spatial contexts for this gene product?`,
        instruction: "Select the supported compartments; expression and site of action are not automatically identical.",
        options: shuffle([...correct, ...distractors], rng),
        correct,
        explanation: record.description,
        genes: [record.gene],
        referenceIds: record.references
      });
    }

    const tissueEntries = record.tissues.map((id) => cellTypes.find((entry) => entry.id === id)).filter(Boolean);
    if (tissueEntries.length && tissueEntries.length <= 3) {
      const correct = [...new Set(tissueEntries.map((entry) => entry.name))];
      const distractors = takeDistinct(shuffle(cellTypes.filter((entry) => !correct.includes(entry.name)), rng), Math.max(2, 6 - correct.length), (entry) => entry.name).map((entry) => entry.name);
      questions.push({
        id: `gene-tissue:${record.gene}`,
        type: "multi",
        category: "geneTissue",
        domain: "anatomy",
        pathway: record.pathway,
        difficulty: Math.max(2, record.difficulty),
        prompt: `<i>${record.gene}</i> has a curated role or expression context in which C. elegans cells or tissues?`,
        instruction: "Select every supported spatial context.",
        options: shuffle([...correct, ...distractors], rng),
        correct,
        explanation: `${record.description} Tissue expression does not by itself prove that every known molecular function occurs in that tissue.`,
        genes: [record.gene],
        referenceIds: record.references
      });
    }

    if (record.localizationStates.length > 1) {
      const locationPool = [...new Set(genes.flatMap((candidate) => candidate.localizationStates.map((state) => state.location)))];
      record.localizationStates.forEach((state, index) => {
        const distractors = takeDistinct(shuffle(locationPool.filter((value) => value !== state.location), rng), 4);
        questions.push({
          id: `localization:${record.gene}:${index}`,
          type: "single",
          category: "localization",
          domain: "cellBiology",
          pathway: record.pathway,
          difficulty: Math.max(3, record.difficulty),
          prompt: `Under ${state.condition}, what localization state is expected for ${record.gene.toUpperCase()}?`,
          options: shuffle([state.location, ...distractors], rng),
          correct: state.location,
          explanation: record.description,
          genes: [record.gene],
          referenceIds: record.references
        });
      });
    }

    return questions;
  });
}

function randomNames(items, correct, count, rng, key = (item) => item.name) {
  return takeDistinct(shuffle(items.filter((item) => key(item) !== correct), rng), count, key).map(key);
}

function generateAtlasQuestions(seed) {
  const rng = createRng(`${seed}:atlas`);
  const geneNames = new Set(genes.map((record) => record.gene));
  const questions = [];

  for (const organelle of organelles) {
    const functionAnswer = plainify(organelle.functions[0]);
    const functionDistractors = takeDistinct(shuffle(organelles.filter((candidate) => candidate.id !== organelle.id).flatMap((candidate) => candidate.functions).map(plainify), rng), 4);
    questions.push({
      id: `organelle-function:${organelle.id}`,
      type: "single", category: "organelleFunction", domain: "cellBiology", pathway: "cellAtlas", difficulty: 2,
      prompt: `Which function is most characteristic of the ${organelle.name}?`,
      options: shuffle([functionAnswer, ...functionDistractors], rng), correct: functionAnswer,
      explanation: `${organelle.name}: ${organelle.functions.join("; ")}. Key properties include ${organelle.properties.join(" and ")}.`, genes: organelle.keyGenes, referenceIds: organelle.referenceIds
    });

    const process = organelle.functions[0];
    questions.push({
      id: `function-organelle:${organelle.id}`,
      type: "single", category: "organelleFunction", domain: "cellBiology", pathway: "cellAtlas", difficulty: 2,
      prompt: `Where does ${plainify(process)} primarily occur?`,
      options: shuffle([organelle.name, ...randomNames(organelles, organelle.name, 5, rng)], rng), correct: organelle.name,
      explanation: `${process} is a defining function of the ${organelle.name}. Connected compartments include ${organelle.connectedCompartments.map((value) => value.replaceAll("_", " ")).join(", ") || "none assigned"}.`, genes: organelle.keyGenes, referenceIds: organelle.referenceIds
    });

    const correctGenes = organelle.keyGenes.filter((name) => geneNames.has(name)).slice(0, 4);
    if (correctGenes.length >= 2) {
      const distractorGenes = takeDistinct(shuffle(genes.filter((record) => !correctGenes.includes(record.gene) && !record.organelles.some((entry) => entry.organelle === organelle.id)), rng), Math.max(2, 7 - correctGenes.length), (record) => record.gene).map((record) => record.gene);
      questions.push({
        id: `organelle-genes:${organelle.id}`,
        type: "multi", category: "geneOrganelle", domain: "cellBiology", pathway: "cellAtlas", difficulty: 3,
        prompt: `Which genes or gene products are strongly associated with the ${organelle.name}?`,
        instruction: "Select all supported associations.", options: shuffle([...correctGenes, ...distractorGenes], rng), correct: correctGenes,
        explanation: `${correctGenes.join(", ")} are representative curated associations for the ${organelle.name}; they may contribute different molecular roles within that compartment.`, genes: correctGenes, referenceIds: organelle.referenceIds
      });
    }
  }

  for (const cellType of cellTypes) {
    const functionAnswer = cellType.majorFunctions[0];
    const functionDistractors = takeDistinct(shuffle(cellTypes.filter((candidate) => candidate.id !== cellType.id).flatMap((candidate) => candidate.majorFunctions), rng), 4);
    questions.push({
      id: `cell-function:${cellType.id}`,
      type: "single", category: "anatomy", domain: "anatomy", pathway: "cellAtlas", difficulty: 2,
      prompt: `Which function is most directly associated with ${cellType.name}?`, options: shuffle([functionAnswer, ...functionDistractors], rng), correct: functionAnswer,
      explanation: `${cellType.name} carry out ${cellType.majorFunctions.join(", ")}. Specialized structures include ${cellType.specializedStructures.join(", ")}.`, plainExplanation: cellType.plainExplanation, genes: cellType.representativeGenes, referenceIds: cellType.referenceIds
    });
    const correctGenes = cellType.representativeGenes.filter((name) => geneNames.has(name)).slice(0, 4);
    if (correctGenes.length >= 2) {
      const distractors = takeDistinct(shuffle(genes.filter((record) => !correctGenes.includes(record.gene) && !record.tissues.includes(cellType.id)), rng), Math.max(2, 7 - correctGenes.length), (record) => record.gene).map((record) => record.gene);
      questions.push({
        id: `cell-genes:${cellType.id}`,
        type: "multi", category: "geneTissue", domain: "anatomy", pathway: "cellAtlas", difficulty: 3,
        prompt: `Which genes are representative of ${cellType.name} biology or commonly used spatial contexts?`, instruction: "Select every supported gene.",
        options: shuffle([...correctGenes, ...distractors], rng), correct: correctGenes,
        explanation: `Representative genes include ${correctGenes.join(", ")}. A marker or promoter can identify a tissue without being its universal identity regulator.`, genes: correctGenes, referenceIds: cellType.referenceIds
      });
    }
  }

  for (const route of traffickingRoutes) {
    questions.push({ id: `trace:${route.id}`, type: "ordering", category: "trafficking", domain: "cellBiology", pathway: route.pathway, difficulty: route.difficulty, prompt: route.prompt, instruction: "Place the compartments or events in order.", items: route.items, explanation: route.explanation, genes: [], referenceIds: route.referenceIds });
  }

  for (const scenario of organelleFailureScenarios) {
    questions.push({
      id: `organelle-failure:${scenario.id}`, type: "single", category: "perturbation", domain: "cellBiology", pathway: scenario.pathway, difficulty: scenario.difficulty,
      prompt: `What is the most defensible prediction if ${scenario.defect}?`, options: shuffle([scenario.correct, ...scenario.distractors], rng), correct: scenario.correct,
      explanation: scenario.explanation, genes: organelleById.get(scenario.organelle)?.keyGenes || [], referenceIds: organelleById.get(scenario.organelle)?.referenceIds || []
    });
  }

  for (const scenario of interTissueScenarios) {
    questions.push({
      id: `inter-tissue:${scenario.id}`, type: "single", category: "interTissue", domain: "anatomy", pathway: scenario.pathway, difficulty: scenario.difficulty,
      prompt: `${scenario.source} produces ${scenario.signal}. Where is the receiving response executed?`,
      options: shuffle([scenario.target, ...randomNames(cellTypes, scenario.target, 4, rng)], rng), correct: scenario.target,
      explanation: scenario.explanation, genes: [], referenceIds: [pathways[scenario.pathway]?.reference].filter(Boolean)
    });
  }

  for (const item of reporters) {
    const otherReadouts = takeDistinct(shuffle(reporters.filter((candidate) => candidate.id !== item.id).map((candidate) => candidate.directReadout), rng), 4);
    const otherLimits = takeDistinct(shuffle(reporters.filter((candidate) => candidate.id !== item.id).map((candidate) => candidate.doesNotProve), rng), 4);
    const otherControls = takeDistinct(shuffle(reporters.filter((candidate) => candidate.id !== item.id).map((candidate) => candidate.usefulControl), rng), 4);
    const compartmentName = organelleById.get(item.compartmentId)?.name || item.compartmentId.replaceAll("_", " ");
    questions.push(
      { id: `reporter-readout:${item.id}`, type: "single", category: "experiment", domain: "molecular", pathway: item.pathway, difficulty: item.difficulty, prompt: `What does increased ${item.name} signal most directly report?`, options: shuffle([item.directReadout, ...otherReadouts], rng), correct: item.directReadout, explanation: `${item.name} directly reports ${item.directReadout}; it does not by itself prove ${item.doesNotProve}.`, genes: item.genes, referenceIds: [pathways[item.pathway]?.reference].filter(Boolean) },
      { id: `reporter-limit:${item.id}`, type: "single", category: "experiment", domain: "molecular", pathway: item.pathway, difficulty: Math.min(5, item.difficulty + 1), prompt: `Which conclusion is NOT established by ${item.name} signal alone?`, options: shuffle([item.doesNotProve, ...otherLimits], rng), correct: item.doesNotProve, explanation: `A reporter has a defined measurement layer. Here, ${item.name} does not prove ${item.doesNotProve}.`, genes: item.genes, referenceIds: [pathways[item.pathway]?.reference].filter(Boolean) },
      { id: `reporter-space:${item.id}`, type: "single", category: "experiment", domain: "cellBiology", pathway: item.pathway, difficulty: item.difficulty, prompt: `Which compartment is most relevant when interpreting ${item.name} in this context?`, options: shuffle([compartmentName, ...randomNames(organelles, compartmentName, 5, rng)], rng), correct: compartmentName, explanation: `${item.name} is interpreted here in relation to the ${compartmentName}, while expression and site of molecular action remain distinct concepts.`, genes: item.genes, referenceIds: [pathways[item.pathway]?.reference].filter(Boolean) },
      { id: `reporter-control:${item.id}`, type: "single", category: "experiment", domain: "molecular", pathway: item.pathway, difficulty: Math.min(5, item.difficulty + 1), prompt: `Which follow-up would most strengthen a mechanistic interpretation of ${item.name}?`, options: shuffle([item.usefulControl, ...otherControls], rng), correct: item.usefulControl, explanation: `A useful orthogonal strategy is to ${item.usefulControl}.`, genes: item.genes, referenceIds: [pathways[item.pathway]?.reference].filter(Boolean) },
      { id: `reporter-context:${item.id}`, type: "single", category: "experiment", domain: "molecular", pathway: item.pathway, difficulty: item.difficulty, prompt: `${item.name} is most appropriately interpreted in which experimental context?`, options: shuffle([item.context, ...takeDistinct(shuffle(reporters.filter((candidate) => candidate.id !== item.id).map((candidate) => candidate.context), rng), 4)], rng), correct: item.context, explanation: `${item.name} is a useful measurement in ${item.context}, provided the inference is limited to what the reporter directly measures.`, genes: item.genes, referenceIds: [pathways[item.pathway]?.reference].filter(Boolean) }
    );
  }

  return questions;
}

function generatePathwayQuestions(seed) {
  const rng = createRng(`${seed}:pathway-edges`);
  const questions = [];
  for (const [pathwayId, pathway] of Object.entries(pathways)) {
    for (const [index, relationship] of (pathway.edges || []).entries()) {
      const correctRelation = `${relationship.from} ${relationship.relation} ${relationship.to}`;
      const relationDistractors = [
        `${relationship.to} ${relationship.relation} ${relationship.from}`,
        `${relationship.from} inhibits ${relationship.to}`,
        `${relationship.from} is physically identical to ${relationship.to}`,
        `${relationship.to} is unrelated to ${relationship.from}`
      ].filter((option) => option !== correctRelation);
      questions.push({
        id: `edge:${pathwayId}:${index}`, type: "single", category: "topology", domain: "molecular", pathway: pathwayId, difficulty: index > 2 ? 4 : 3,
        prompt: `Which relationship is represented in the curated ${pathway.shortName} model?`, options: shuffle([correctRelation, ...relationDistractors], rng), correct: correctRelation,
        explanation: `${relationship.from} ${relationship.relation} ${relationship.to} in the context of ${relationship.context}. Pathway diagrams are models of a defined output, not claims that the whole system is a rigid line.`, genes: [], referenceIds: [pathway.reference].filter(Boolean)
      });

      const perturbationCorrect = relationship.relation === "inhibits"
        ? `Reducing ${relationship.from} can release ${relationship.to} from this inhibitory input, all else equal`
        : `Reducing ${relationship.from} is expected to weaken signaling toward ${relationship.to} in this branch`;
      questions.push({
        id: `edge-perturb:${pathwayId}:${index}`, type: "single", category: "perturbation", domain: "molecular", pathway: pathwayId, difficulty: 4,
        prompt: `What is the most defensible local prediction for the ${relationship.from} → ${relationship.to} relationship?`,
        options: shuffle([perturbationCorrect, `${relationship.from} and ${relationship.to} must be the same protein`, `The perturbation proves every organismal phenotype is cell autonomous`, `No downstream measurement could ever change`], rng), correct: perturbationCorrect,
        explanation: `This prediction is restricted to the curated ${relationship.context} relationship; parallel pathways, feedback, tissue context, and allele strength can modify the observed phenotype.`, genes: [], referenceIds: [pathway.reference].filter(Boolean)
      });

      const epistasisCorrect = relationship.relation === "inhibits"
        ? `Loss of the inhibited target ${relationship.to} can block the output expected from removing ${relationship.from}`
        : `A null lesion in downstream ${relationship.to} is expected to block this branch even if upstream ${relationship.from} is activated`;
      questions.push({
        id: `edge-epistasis:${pathwayId}:${index}`, type: "single", category: "epistasis", domain: "molecular", pathway: pathwayId, difficulty: 5,
        prompt: `Which epistasis prediction best follows from the curated relationship ${correctRelation}?`,
        options: shuffle([epistasisCorrect, `The two genes must encode the same molecular species`, `Upstream activation always bypasses loss of every downstream component`, `The result would prove identical expression in every tissue`], rng), correct: epistasisCorrect,
        explanation: `Epistasis constrains functional order for a defined output. It does not by itself prove direct binding, universal tissue autonomy, or absence of parallel branches.`, genes: [], referenceIds: [pathway.reference].filter(Boolean)
      });
    }
  }
  return questions;
}

function prepareCuratedQuestion(question, seed) {
  const rng = createRng(`${seed}:${question.id}`);
  const prepared = { ...question, domain: question.domain || domainForCategory(question.category), referenceIds: question.referenceIds || [pathways[question.pathway]?.reference].filter(Boolean) };
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
  const atlas = generateAtlasQuestions(seed).map((question) => prepareCuratedQuestion(question, seed));
  const pathwayGenerated = generatePathwayQuestions(seed).map((question) => prepareCuratedQuestion(question, seed));
  const curated = curatedQuestions.map((question) => prepareCuratedQuestion(question, seed));
  const pool = [...generated, ...atlas, ...pathwayGenerated, ...curated].map((question) => {
    const prepared = { ...question, domain: question.domain || domainForCategory(question.category) };
    return { ...prepared, plainExplanation: buildPlainExplanation(prepared) };
  });
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
  const domainCounts = countValues(state.responses, "domain");
  const rng = createRng(`${state.seed}:pick:${state.usedIds.length}:${state.ability.toFixed(3)}`);

  const ranked = available.map((question) => {
    const difficultyFit = 5 - Math.abs(question.difficulty - targetDifficulty) * 1.65;
    const categoryCoverage = 2.1 / (1 + (categoryCounts[question.category] || 0));
    const pathwayCoverage = 1.55 / (1 + (pathwayCounts[question.pathway] || 0));
    const domainCoverage = 1.2 / (1 + (domainCounts[question.domain] || 0));
    const focusBonus = state.focus === "cellAtlas" && question.domain !== "molecular" ? 2.2 : state.focus === "cellAtlas" ? -0.8 : 0;
    const neighboringBonus = Math.abs(question.difficulty - targetDifficulty) <= 1 ? 0.8 : 0;
    const advancedMix = state.usedIds.length > 5 && ["ordering", "topology", "perturbation", "epistasis", "experiment"].includes(question.category) ? 0.45 : 0;
    return { question, score: difficultyFit + categoryCoverage + pathwayCoverage + domainCoverage + focusBonus + neighboringBonus + advancedMix + rng() * 0.45 };
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
