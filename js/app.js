import { pathways, pathwayDiagrams, references } from "../data/pathways.js";
import { featuredLearningPathways, learningCollections, learningPortals } from "../data/learning.js";
import { buildQuestionPool, categoryLabels, getPathwayName, selectNextQuestion } from "./questions.js?v=20260827-5";
import { isFullyCorrect, levelForAbility, overallAbilityScore, scoreAnswer, summarizeResponses, updateAbility } from "./scoring.js";

const STORAGE_KEY = "wormpath:assessment:v2";

const elements = {
  landing: document.querySelector("#landing-screen"),
  assessment: document.querySelector("#assessment-screen"),
  results: document.querySelector("#results-screen"),
  review: document.querySelector("#review-screen"),
  learning: document.querySelector("#learning-screen"),
  startButton: document.querySelector("#start-button"),
  quitButton: document.querySelector("#quit-button"),
  position: document.querySelector("#question-position"),
  category: document.querySelector("#category-label"),
  progress: document.querySelector(".progress-track"),
  progressFill: document.querySelector("#progress-fill"),
  card: document.querySelector("#question-card"),
  pathway: document.querySelector("#question-pathway"),
  prompt: document.querySelector("#question-prompt"),
  instruction: document.querySelector("#question-instruction"),
  visual: document.querySelector("#question-visual"),
  form: document.querySelector("#answer-form"),
  answerArea: document.querySelector("#answer-area"),
  answerError: document.querySelector("#answer-error"),
  submit: document.querySelector("#submit-answer"),
  feedback: document.querySelector("#feedback-panel"),
  resultsContent: document.querySelector("#results-content"),
  reviewList: document.querySelector("#review-list"),
  backResults: document.querySelector("#back-results"),
  learnButton: document.querySelector("#learn-button"),
  backLearning: document.querySelector("#back-learning"),
  learningContent: document.querySelector("#learning-content")
};

let state = loadState();
let pool = state ? buildQuestionPool(state.seed) : [];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || saved.version !== 2) return null;
    return saved;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function saveState() {
  if (state) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function makeState(total, forcedIds = null, startingAbility = 2, focus = "mixed") {
  return {
    version: 2,
    seed: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`,
    total,
    ability: startingAbility,
    streak: 0,
    usedIds: [],
    responses: [],
    currentQuestionId: null,
    order: null,
    locked: false,
    paused: false,
    complete: false,
    focus,
    forcedIds
  };
}

function showScreen(name) {
  for (const [key, element] of Object.entries({ landing: elements.landing, assessment: elements.assessment, results: elements.results, review: elements.review, learning: elements.learning })) {
    element.classList.toggle("hidden", key !== name);
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function selectedLength() {
  return Number(document.querySelector('input[name="length"]:checked')?.value || 20);
}

function selectedFocus() {
  return document.querySelector('input[name="focus"]:checked')?.value || "mixed";
}

function updateLengthCards() {
  document.querySelectorAll(".length-card").forEach((card) => {
    const input = card.querySelector("input");
    card.classList.toggle("selected", input.checked);
  });
  document.querySelectorAll(".focus-card").forEach((card) => card.classList.toggle("selected", card.querySelector("input").checked));
  const canContinue = state && !state.complete && state.paused && state.total === selectedLength();
  elements.startButton.innerHTML = canContinue ? `Continue assessment <span aria-hidden="true">→</span>` : `Start assessment <span aria-hidden="true">→</span>`;
}

function currentQuestion() {
  return pool.find((question) => question.id === state?.currentQuestionId) || null;
}

function ensureCurrentQuestion() {
  let question = currentQuestion();
  if (!question) {
    question = selectNextQuestion(pool, state);
    if (!question) return null;
    state.currentQuestionId = question.id;
    state.locked = false;
    state.order = question.type === "ordering" ? [...question.items] : null;
    saveState();
  }
  return question;
}

function startAssessment() {
  const total = selectedLength();
  const resume = state && !state.complete && state.paused && state.total === total;
  if (!resume) {
    state = makeState(total, null, 2, selectedFocus());
    pool = buildQuestionPool(state.seed);
  }
  state.paused = false;
  saveState();
  renderAssessment();
}

function renderAssessment() {
  showScreen("assessment");
  const question = ensureCurrentQuestion();
  if (!question) {
    renderResults();
    return;
  }

  const answeredPosition = state.responses.length;
  const displayPosition = state.locked ? answeredPosition : answeredPosition + 1;
  const progress = Math.round((answeredPosition / state.total) * 100);
  elements.position.textContent = `Question ${displayPosition} / ${state.total}`;
  elements.category.textContent = categoryLabels[question.category] || question.category;
  elements.progress.setAttribute("aria-valuenow", String(progress));
  elements.progressFill.style.width = `${progress}%`;
  elements.pathway.textContent = getPathwayName(question.pathway);
  elements.pathway.style.borderColor = `${pathways[question.pathway]?.color || "#83d6ad"}55`;
  elements.prompt.innerHTML = question.prompt;
  elements.instruction.textContent = question.instruction || defaultInstruction(question);
  elements.answerError.textContent = "";
  elements.visual.innerHTML = "";
  elements.feedback.classList.add("hidden");
  elements.submit.classList.remove("hidden");
  elements.submit.disabled = false;
  elements.submit.textContent = "Lock answer";

  renderAnswer(question);
  if (state.locked) renderLockedFeedback(question);
  elements.card.animate?.([{ opacity: .55, transform: "translateY(8px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 260, easing: "ease-out" });
}

function defaultInstruction(question) {
  if (question.type === "multi") return "Select every supported answer. Incorrect selections reduce credit.";
  if (question.type === "ordering") return "Reconstruct the mechanism in causal order.";
  return "Choose the best answer.";
}

function renderAnswer(question) {
  if (question.type === "single" || question.type === "multi") {
    const inputType = question.type === "single" ? "radio" : "checkbox";
    elements.answerArea.innerHTML = `<div class="option-list">${question.options.map((option, index) => `
      <label class="answer-option">
        <input type="${inputType}" name="answer" value="${escapeHtml(option)}" ${state.locked ? "disabled" : ""}>
        <span>${escapeHtml(option)}</span>
      </label>`).join("")}</div>`;
  } else if (question.type === "ordering") {
    renderOrdering(question);
  } else if (question.type === "completion") {
    renderCompletion(question);
  }

  if (state.locked) restoreLockedAnswer(question);
}

function renderOrdering(question) {
  elements.answerArea.innerHTML = `<div class="ordering-list" aria-label="Ordered pathway events">${state.order.map((item, index) => `
    <div class="order-item" draggable="${!state.locked}" data-index="${index}">
      <span>${escapeHtml(item)}</span>
      <span class="order-controls">
        <button type="button" aria-label="Move ${escapeHtml(item)} up" data-move="up" data-index="${index}" ${state.locked || index === 0 ? "disabled" : ""}>↑</button>
        <button type="button" aria-label="Move ${escapeHtml(item)} down" data-move="down" data-index="${index}" ${state.locked || index === state.order.length - 1 ? "disabled" : ""}>↓</button>
      </span>
    </div>`).join("")}</div>`;

  if (state.locked) return;
  elements.answerArea.querySelectorAll("[data-move]").forEach((button) => button.addEventListener("click", () => {
    const index = Number(button.dataset.index);
    moveOrder(index, button.dataset.move === "up" ? index - 1 : index + 1, question);
  }));

  let draggedIndex = null;
  elements.answerArea.querySelectorAll(".order-item").forEach((item) => {
    item.addEventListener("dragstart", () => { draggedIndex = Number(item.dataset.index); });
    item.addEventListener("dragover", (event) => event.preventDefault());
    item.addEventListener("drop", (event) => {
      event.preventDefault();
      if (draggedIndex !== null) moveOrder(draggedIndex, Number(item.dataset.index), question);
    });
  });
}

function moveOrder(from, to, question) {
  if (to < 0 || to >= state.order.length || from === to) return;
  const next = [...state.order];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  state.order = next;
  saveState();
  renderOrdering(question);
}

function renderCompletion(question) {
  const containsRelations = question.sequence.some((part) => part === "→" || part === "⊣");
  let blankIndex = 0;
  const parts = [];
  question.sequence.forEach((part, index) => {
    if (part === null) {
      const options = question.options[blankIndex];
      parts.push(`<select aria-label="Missing pathway component ${blankIndex + 1}" data-blank="${blankIndex}" ${state.locked ? "disabled" : ""}><option value="">Choose…</option>${options.map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`).join("")}</select>`);
      blankIndex += 1;
    } else if (part === "→" || part === "⊣") {
      parts.push(`<span class="pathway-arrow ${part === "⊣" ? "inhibit" : ""}" aria-label="${part === "⊣" ? "inhibits" : "activates"}">${part}</span>`);
    } else {
      parts.push(`<span class="pathway-node">${escapeHtml(part)}</span>`);
    }
    if (!containsRelations && index < question.sequence.length - 1) parts.push(`<span class="pathway-arrow" aria-hidden="true">→</span>`);
  });
  elements.answerArea.innerHTML = `<div class="completion-row">${parts.join("")}</div>`;
}

function getAnswer(question) {
  if (question.type === "single") return elements.answerArea.querySelector('input[name="answer"]:checked')?.value || null;
  if (question.type === "multi") return [...elements.answerArea.querySelectorAll('input[name="answer"]:checked')].map((input) => input.value);
  if (question.type === "ordering") return [...state.order];
  if (question.type === "completion") return [...elements.answerArea.querySelectorAll("select")].map((select) => select.value);
  return null;
}

function answerIsValid(question, answer) {
  if (question.type === "single") return Boolean(answer);
  if (question.type === "multi") return answer.length > 0;
  if (question.type === "completion") return answer.length === question.correct.length && answer.every(Boolean);
  return Array.isArray(answer) && answer.length > 0;
}

function submitAnswer(event) {
  event.preventDefault();
  if (!state || state.locked) return;
  const question = currentQuestion();
  const answer = getAnswer(question);
  if (!answerIsValid(question, answer)) {
    elements.answerError.textContent = question.type === "completion" ? "Complete every missing position before locking your answer." : "Choose at least one answer before continuing.";
    return;
  }

  const score = scoreAnswer(question, answer);
  const oldAbility = state.ability;
  state.ability = updateAbility({ ability: state.ability, difficulty: question.difficulty, score, category: question.category, total: state.total });
  state.streak = score >= .75 ? Math.max(1, state.streak + 1) : score <= .25 ? Math.min(-1, state.streak - 1) : 0;
  state.responses.push({
    questionId: question.id,
    category: question.category,
    domain: question.domain,
    pathway: question.pathway,
    difficulty: question.difficulty,
    answer,
    correct: question.correct,
    score,
    abilityBefore: oldAbility,
    abilityAfter: state.ability
  });
  state.usedIds.push(question.id);
  state.locked = true;
  saveState();
  renderAssessment();
  elements.feedback.focus();
}

function restoreLockedAnswer(question) {
  const response = state.responses.at(-1);
  if (!response || response.questionId !== question.id) return;
  if (question.type === "single" || question.type === "multi") {
    const answers = new Set(Array.isArray(response.answer) ? response.answer : [response.answer]);
    elements.answerArea.querySelectorAll("input").forEach((input) => { input.checked = answers.has(input.value); });
  } else if (question.type === "completion") {
    elements.answerArea.querySelectorAll("select").forEach((select, index) => { select.value = response.answer[index]; });
  }
}

function correctAnswerText(question) {
  if (question.type === "ordering") return question.correct.join(" → ");
  if (question.type === "completion") return question.correct.join("; ");
  if (Array.isArray(question.correct)) return question.correct.join("; ");
  return question.correct;
}

function playerAnswerText(response) {
  if (Array.isArray(response.answer)) return response.answer.join(response.category === "ordering" ? " → " : "; ") || "No answer";
  return response.answer || "No answer";
}

function diagramMarkup(pathwayId) {
  const diagram = pathwayDiagrams[pathwayId];
  if (!diagram) return "";
  return `<div class="pathway-diagram" aria-label="Correct pathway diagram">${diagram.map((node, index) => `${index ? `<span class="pathway-arrow ${diagram[index - 1].relation === "inhibits" ? "inhibit" : ""}">${diagram[index - 1].relation === "inhibits" ? "⊣" : "→"}</span>` : ""}<span class="pathway-node">${escapeHtml(node.label)}</span>`).join("")}</div>`;
}

function renderLockedFeedback(question) {
  const response = state.responses.at(-1);
  const correct = isFullyCorrect(response.score);
  elements.answerArea.querySelectorAll("input, select, button").forEach((control) => { control.disabled = true; });
  elements.submit.classList.add("hidden");
  const pathwayDiagram = question.type === "ordering" || question.category === "topology" ? diagramMarkup(question.pathway) : "";
  const finalQuestion = state.responses.length >= state.total;
  elements.feedback.innerHTML = `
    <p class="feedback-title ${correct ? "" : "incorrect"}">${correct ? "Correct" : response.score > 0 ? `Partly correct · ${Math.round(response.score * 100)}% credit` : "Not quite"}</p>
    ${correct ? "" : `<p><strong>Correct answer:</strong> ${escapeHtml(correctAnswerText(question))}</p>`}
    <p class="feedback-kicker">Why this answer works</p>
    <p class="feedback-explanation">${escapeHtml(question.plainExplanation || question.explanation)}</p>
    <details class="advanced-explanation"><summary>Show more biological detail</summary><p>${escapeHtml(question.explanation)}</p></details>
    ${pathwayDiagram}
    <button id="next-question" class="primary-button">${finalQuestion ? "Reveal my assessment" : "Next question"} <span aria-hidden="true">→</span></button>`;
  elements.feedback.classList.remove("hidden");
  document.querySelector("#next-question").addEventListener("click", nextQuestion);
}

function nextQuestion() {
  if (state.responses.length >= state.total) {
    state.complete = true;
    state.currentQuestionId = null;
    saveState();
    renderResults();
    return;
  }
  state.currentQuestionId = null;
  state.order = null;
  state.locked = false;
  saveState();
  renderAssessment();
}

function metricMarkup(metrics, labeler) {
  if (!metrics.length) return `<p class="study-note">Not enough observations yet.</p>`;
  return `<div class="metric-list">${metrics.map((metric) => `<div class="metric-row"><span>${escapeHtml(labeler(metric.id))}</span><div class="metric-track"><i style="width:${metric.percent}%"></i></div><b>${metric.percent}%</b></div>`).join("")}</div>`;
}

function learningDiagram(pathwayId) {
  const pathway = pathways[pathwayId];
  const nodes = (pathwayDiagrams[pathwayId] || pathway?.nodes?.map((label) => ({ label, relation: "activates" })) || []).slice(0, 7);
  if (!nodes.length) return "";
  const nodeWidth = 132;
  const gap = 42;
  const width = nodes.length * nodeWidth + (nodes.length - 1) * gap + 32;
  const svgNodes = nodes.map((node, index) => {
    const x = 16 + index * (nodeWidth + gap);
    const label = node.label.length > 22 ? `${node.label.slice(0, 20)}…` : node.label;
    const arrow = index < nodes.length - 1
      ? `<text x="${x + nodeWidth + gap / 2}" y="50" text-anchor="middle" class="map-arrow ${node.relation === "inhibits" ? "inhibit" : ""}">${node.relation === "inhibits" ? "⊣" : "→"}</text>`
      : "";
    return `<g><rect x="${x}" y="26" width="${nodeWidth}" height="48" rx="10"></rect><text x="${x + nodeWidth / 2}" y="54" text-anchor="middle">${escapeHtml(label)}</text>${arrow}</g>`;
  }).join("");
  return `<div class="learning-map-scroll"><svg class="learning-map" viewBox="0 0 ${width} 100" role="img" aria-label="${escapeHtml(pathway.name)} pathway component map"><title>${escapeHtml(pathway.name)} pathway component map</title>${svgNodes}</svg></div>`;
}

function renderLearning() {
  const portalMarkup = learningPortals.map((portal) => `<a class="learning-resource" href="${portal.url}" target="_blank" rel="noopener noreferrer"><small>${escapeHtml(portal.kind)}</small><strong>${escapeHtml(portal.name)}</strong><span>${escapeHtml(portal.description)}</span><b>Open resource ↗</b></a>`).join("");
  const collectionMarkup = learningCollections.map((collection) => `<article class="learning-collection"><h3>${escapeHtml(collection.title)}</h3><p>${escapeHtml(collection.description)}</p><div>${collection.pathwayIds.filter((id) => pathways[id]).map((id) => `<a href="#learn-map-${id}">${escapeHtml(pathways[id].shortName)}</a>`).join("")}</div></article>`).join("");
  const mapMarkup = featuredLearningPathways.filter((id) => pathways[id]).map((id) => {
    const pathway = pathways[id];
    const reference = references[pathway.reference];
    return `<article id="learn-map-${id}" class="learning-pathway-card">
      <div class="learning-pathway-heading"><div><small>Visual pathway map</small><h3>${escapeHtml(pathway.name)}</h3></div>${reference ? `<a href="${reference.url}" target="_blank" rel="noopener noreferrer">Read the article ↗</a>` : ""}</div>
      <p>${escapeHtml(pathway.description)}</p>
      ${learningDiagram(id)}
      <div class="learning-detail"><span><b>Outputs</b>${escapeHtml((pathway.outputs || []).join(" · ") || "Context-dependent outputs")}</span><span><b>Common trap</b>${escapeHtml(pathway.commonMisconceptions?.[0] || "Treat the diagram as a model for a defined output, not the whole biological network.")}</span></div>
    </article>`;
  }).join("");
  elements.learningContent.innerHTML = `
    <section class="learning-section"><div class="section-heading"><p>Trusted starting points</p><h2>Articles, databases, and anatomy</h2></div><div class="learning-resources">${portalMarkup}</div></section>
    <section class="learning-section"><div class="section-heading"><p>Guided routes</p><h2>Learn by biological problem</h2></div><div class="learning-collections">${collectionMarkup}</div></section>
    <section class="learning-section"><div class="section-heading"><p>Component pictures</p><h2>Visual pathway maps</h2></div><div class="learning-pathways">${mapMarkup}</div></section>`;
  showScreen("learning");
}

function renderResults() {
  if (!state) return;
  state.complete = true;
  state.paused = false;
  saveState();
  showScreen("results");
  const level = levelForAbility(state.ability);
  const overall = overallAbilityScore(state.ability);
  const categoryMetrics = summarizeResponses(state.responses, "category");
  const domainMetrics = summarizeResponses(state.responses, "domain");
  const pathwayMinimum = state.total >= 50 ? 3 : 2;
  const pathwayMetrics = summarizeResponses(state.responses, "pathway", pathwayMinimum);
  const strongest = pathwayMetrics.slice(0, 3);
  const needsWork = [...pathwayMetrics].sort((a, b) => a.percent - b.percent).slice(0, 3);
  const mistakes = state.responses.filter((response) => !isFullyCorrect(response.score));
  const studyAreas = needsWork.length ? needsWork.map((item) => pathways[item.id]?.shortName || item.id).join(", ") : "mechanistic experiments and neighboring pathway steps";

  elements.resultsContent.innerHTML = `
    <div class="result-hero">
      <div>
        <p class="eyebrow compact"><span></span>Your estimated level</p>
        <h1 id="results-title">${escapeHtml(level.name)}</h1>
        <p class="result-summary">${escapeHtml(level.description)}</p>
      </div>
      <div class="ability-orbit"><div class="ability-score"><strong>${overall}</strong><span>ability score / 100</span></div></div>
    </div>
    <div class="result-grid">
      <section class="result-panel full"><h2>Knowledge domains</h2>${metricMarkup(domainMetrics, (id) => ({ molecular: "Molecular knowledge", cellBiology: "Cell biology", anatomy: "C. elegans anatomy" })[id] || id)}</section>
      <section class="result-panel full"><h2>Reasoning profile</h2>${metricMarkup(categoryMetrics, (id) => categoryLabels[id] || id)}</section>
      <section class="result-panel"><h2>Pathway evidence</h2>${metricMarkup(pathwayMetrics, (id) => pathways[id]?.shortName || id)}</section>
      <section class="result-panel">
        <h2>Where the signal is strongest</h2>
        <div class="strength-columns">
          <div><h3>Strongest areas</h3><ul>${strongest.length ? strongest.map((item) => `<li><span>${escapeHtml(pathways[item.id]?.shortName || item.id)}</span><b>${item.percent}%</b></li>`).join("") : "<li>More pathway sampling needed</li>"}</ul></div>
          <div><h3>Needs work</h3><ul>${needsWork.length ? needsWork.map((item) => `<li><span>${escapeHtml(pathways[item.id]?.shortName || item.id)}</span><b>${item.percent}%</b></li>`).join("") : "<li>No low-confidence area identified</li>"}</ul></div>
        </div>
      </section>
      <section class="result-panel full">
        <h2>What to study next</h2>
        <p class="study-note">Rebuild ${escapeHtml(studyAreas)} from perturbation to phenotype. For every reporter, practice naming what it measures directly, what alternative mechanisms remain, and which orthogonal control would distinguish them.</p>
      </section>
    </div>
    <div class="result-actions">
      ${mistakes.length ? `<button id="review-mistakes" class="primary-button">Review mistakes <span>(${mistakes.length}) →</span></button><button id="retry-mistakes" class="secondary-button">Retry mistakes</button>` : ""}
      <button id="new-assessment" class="secondary-button">New assessment</button>
    </div>`;

  document.querySelector("#review-mistakes")?.addEventListener("click", renderReview);
  document.querySelector("#retry-mistakes")?.addEventListener("click", retryMistakes);
  document.querySelector("#new-assessment").addEventListener("click", resetToLanding);
}

function renderReview() {
  showScreen("review");
  const misses = state.responses.filter((response) => !isFullyCorrect(response.score));
  elements.reviewList.innerHTML = misses.map((response, index) => {
    const question = pool.find((item) => item.id === response.questionId);
    return `<article class="review-item">
      <span class="result-chip">${escapeHtml(getPathwayName(response.pathway))} · ${escapeHtml(categoryLabels[response.category])}</span>
      <h2>${index + 1}. ${question.prompt}</h2>
      <div class="review-answer">
        <div><small>Your answer</small><p>${escapeHtml(playerAnswerText(response))}</p></div>
        <div><small>Correct answer</small><p>${escapeHtml(correctAnswerText(question))}</p></div>
      </div>
      <p class="review-explanation"><strong>Plain-language explanation:</strong> ${escapeHtml(question.plainExplanation || question.explanation)}</p>
      <details class="advanced-explanation"><summary>Show more biological detail</summary><p>${escapeHtml(question.explanation)}</p></details>
      <p class="review-explanation"><strong>Relevant genes:</strong> ${question.genes.map((gene) => `<i>${escapeHtml(gene)}</i>`).join(", ")}</p>
    </article>`;
  }).join("");
}

function retryMistakes() {
  const oldAbility = state.ability;
  const focus = state.focus || "mixed";
  const forcedIds = state.responses.filter((response) => !isFullyCorrect(response.score)).map((response) => response.questionId);
  state = makeState(forcedIds.length, forcedIds, oldAbility, focus);
  pool = buildQuestionPool(state.seed);
  saveState();
  renderAssessment();
}

function resetToLanding() {
  localStorage.removeItem(STORAGE_KEY);
  state = null;
  pool = [];
  document.querySelector('input[name="length"][value="20"]').checked = true;
  document.querySelector('input[name="focus"][value="mixed"]').checked = true;
  updateLengthCards();
  showScreen("landing");
}

elements.startButton.addEventListener("click", startAssessment);
elements.form.addEventListener("submit", submitAnswer);
elements.quitButton.addEventListener("click", () => {
  state.paused = true;
  saveState();
  const lengthInput = document.querySelector(`input[name="length"][value="${state.total}"]`);
  if (lengthInput) lengthInput.checked = true;
  updateLengthCards();
  showScreen("landing");
});
elements.backResults.addEventListener("click", renderResults);
document.querySelectorAll('input[name="length"]').forEach((input) => input.addEventListener("change", updateLengthCards));
document.querySelectorAll('input[name="focus"]').forEach((input) => input.addEventListener("change", updateLengthCards));
elements.learnButton.addEventListener("click", () => {
  if (state && !state.complete) {
    state.paused = true;
    saveState();
  }
  renderLearning();
});
elements.backLearning.addEventListener("click", () => {
  updateLengthCards();
  showScreen("landing");
});

updateLengthCards();
if (state?.complete) renderResults();
else if (state && !state.paused) renderAssessment();
else showScreen("landing");
