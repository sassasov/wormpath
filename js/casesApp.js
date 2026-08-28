import { OLYMPIAD_CASES, CASE_SOURCES } from "../data/olympiadCases.js";
import { genes } from "../data/genes.js";
import { CaseSession } from "./caseEngine.js";

const app = document.querySelector("#app");
const state = { view: "home", session: null, response: null, confidence: 2, feedback: null, completedCase: null, geneQuery: "" };

const escapeHtml = value => String(value ?? "").replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
const sourceLinks = ids => ids.map(id => CASE_SOURCES[id]).filter(Boolean).map(source => `<a href="${source.url}" target="_blank" rel="noreferrer"><span>${escapeHtml(source.kind)}</span>${escapeHtml(source.title)} ↗</a>`).join("");

function pathwayMap(nodes) {
  return `<div class="case-pathway">${nodes.map((node, index) => `<span>${escapeHtml(node)}</span>${index < nodes.length - 1 ? "<i>→</i>" : ""}`).join("")}</div>`;
}

function dataTable(data) {
  return `<div class="case-data"><div class="data-label">Evidence panel</div><div class="table-wrap"><table><thead><tr>${data.columns.map(column => `<th>${escapeHtml(column)}</th>`).join("")}</tr></thead><tbody>${data.rows.map(row => `<tr>${row.map(cell => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div><small>Read the pattern, not just one cell. Schematic values are labeled in the case provenance.</small></div>`;
}

function startAssessment(length, mode = "assessment") {
  let cases = OLYMPIAD_CASES;
  let total = length;
  let options = {};
  if (mode === "daily") {
    const index = Math.floor(Date.now() / 86400000) % cases.length;
    cases = [cases[index]];
    total = 4;
    options = { caseCount: 1, seed: `daily-${Math.floor(Date.now() / 86400000)}` };
  }
  if (mode === "research") {
    cases = cases.filter(item => item.articleDerived);
    total = 4;
    options = { caseCount: 1, seed: `research-${Date.now()}` };
  }
  state.session = new CaseSession(cases, total, options);
  state.response = null;
  state.feedback = null;
  state.confidence = 2;
  state.view = "quiz";
  render();
}

function renderHome() {
  app.innerHTML = `
    <section class="case-home page-shell">
      <div class="case-hero">
        <p class="eyebrow"><span></span> C. elegans Olympiad laboratory</p>
        <h1>Stop collecting facts.<br><em>Start solving biology.</em></h1>
        <p>Each case begins with a biological problem, then reveals data in stages. You will decide what the evidence supports, predict a perturbation, and choose the experiment that separates competing mechanisms.</p>
        <div class="reasoning-ribbon"><span>observation</span><i>→</i><span>model</span><i>→</i><span>prediction</span><i>→</i><span>experiment</span></div>
      </div>
      <aside class="case-launch">
        <span class="case-number">${OLYMPIAD_CASES.length} connected cases · ${OLYMPIAD_CASES.length * 4} linked questions</span>
        <h2>Choose an assessment</h2>
        <p>Cases stay together. You will answer 3–4 connected questions before seeing the full mechanism.</p>
        <button data-length="20"><strong>20</strong><span><b>Quick field test</b><small>6 biological cases</small></span><i>→</i></button>
        <button data-length="50" class="featured"><strong>50</strong><span><b>Olympiad standard</b><small>15 biological cases</small></span><i>→</i></button>
        <button data-length="100"><strong>100</strong><span><b>Deep mechanism exam</b><small>30 biological cases</small></span><i>→</i></button>
      </aside>
    </section>
    <section class="secondary-modes page-shell">
      <article><span>Daily case</span><h3>One experiment, four decisions</h3><p>A deterministic case that changes each day.</p><button data-mode="daily">Solve today’s case →</button></article>
      <article><span>Research challenge</span><h3>Read data inspired by a paper</h3><p>Primary-source cases with an explicit evidence trail.</p><button data-mode="research">Start journal club →</button></article>
      <article><span>Learning library</span><h3>Pathways, genes, and source links</h3><p>Review the map without entering an assessment.</p><button data-nav="learn">Open the library →</button></article>
    </section>
    <section class="identity-panel page-shell"><div><span>WormPath identity</span><h2>Genetics reveals mechanism.</h2></div><p>Double mutants, tissue-specific rescue, temporal perturbations, and reporters turn invisible molecular events into testable pathway order.</p></section>`;
}

function renderQuestionControl(question) {
  if (question.format === "single") return `<div class="case-options">${question.options.map((option, index) => `<button data-answer="${escapeHtml(option)}" class="${state.response === option ? "selected" : ""}"><span>${String.fromCharCode(65 + index)}</span><b>${escapeHtml(option)}</b></button>`).join("")}</div>`;
  const answers = state.response || {};
  return `<div class="truth-grid">${question.statements.map((statement, index) => `<div><p>${index + 1}. ${escapeHtml(statement.text)}</p><button data-truth-index="${index}" data-truth="true" class="${answers[index] === true ? "selected" : ""}">Supported</button><button data-truth-index="${index}" data-truth="false" class="${answers[index] === false ? "selected" : ""}">Not supported</button></div>`).join("")}</div>`;
}

function responseReady(question) {
  if (question.format === "single") return typeof state.response === "string";
  return question.statements.every((_, index) => typeof state.response?.[index] === "boolean");
}

function renderQuiz() {
  const session = state.session;
  const caseItem = session.currentCase();
  const question = session.currentQuestion();
  const caseProgress = session.caseProgress();
  const overall = Math.round(session.responses.length / session.length * 100);
  app.innerHTML = `
    <section class="case-quiz page-shell">
      <div class="quiz-head"><button data-nav="home">×</button><div><span>Case ${session.caseIndex + 1} / ${session.caseBlocks.length}</span><b>Question ${session.responses.length + 1} / ${session.length}</b></div><div class="case-progress"><i style="width:${overall}%"></i></div></div>
      <div class="case-layout">
        <aside class="case-dossier">
          <span class="dossier-label">Case ${String(session.caseIndex + 1).padStart(2, "0")} · part ${caseProgress.position}/${caseProgress.total}</span>
          <h1>${escapeHtml(caseItem.title)}</h1>
          <p class="case-context">${escapeHtml(caseItem.context)}</p>
          <div class="background-box"><b>What you need to know</b><p>${escapeHtml(caseItem.background)}</p></div>
          ${dataTable(caseItem.data)}
          <div class="provenance-note"><b>${escapeHtml(caseItem.sourceType)}</b><span>${escapeHtml(caseItem.evidenceLevel)} evidence · ${escapeHtml(caseItem.reviewStatus)}</span></div>
        </aside>
        <article class="reasoning-card">
          <div class="reasoning-meta"><span>${escapeHtml(question.skill)}</span><span>${escapeHtml(caseItem.domain)}</span></div>
          <h2>${escapeHtml(question.prompt)}</h2>
          ${renderQuestionControl(question)}
          <div class="confidence-row"><span>How confident are you?</span>${[[1,"Unsure"],[2,"Fairly sure"],[3,"Very sure"]].map(([value,label]) => `<button data-confidence="${value}" class="${state.confidence === value ? "selected" : ""}">${label}</button>`).join("")}</div>
          <button class="lock-answer" data-submit ${responseReady(question) ? "" : "disabled"}>Check reasoning</button>
        </article>
      </div>
    </section>`;
}

function renderFeedback() {
  const { result, caseItem } = state.feedback;
  const question = result.question;
  const correct = result.score === 1;
  const partial = result.score > 0 && !correct;
  app.innerHTML = `
    <section class="case-feedback page-shell ${correct ? "is-correct" : partial ? "is-partial" : "is-wrong"}">
      <article>
        <div class="feedback-title"><span>${correct ? "✓" : partial ? "½" : "×"}</span><div><p>${correct ? "Reasoning holds" : partial ? "Partly supported" : "Revise the model"}</p><h1>${correct ? "Good inference." : partial ? "Some claims work; inspect the rest." : "The evidence points elsewhere."}</h1></div></div>
        <div class="score-chip">${Math.round(result.score * 100)}% credit</div>
        <section><span>Plain explanation</span><p>${escapeHtml(question.explanation)}</p></section>
        ${question.format === "truth-grid" ? `<div class="statement-review">${question.statements.map((statement, index) => `<div class="${result.response[index] === statement.truth ? "right" : "wrong"}"><b>${statement.truth ? "Supported" : "Not supported"}</b><p>${escapeHtml(statement.text)}</p><small>${escapeHtml(statement.why)}</small></div>`).join("")}</div>` : `<section><span>Why the alternatives fail</span><p>${escapeHtml(question.whyOthersFail)}</p></section>`}
        <div class="mini-model"><span>Working pathway model</span>${pathwayMap(caseItem.mechanism)}</div>
        <button data-next>${state.session.questionIndex + 1 === state.session.currentBlock().questions.length ? "Finish case" : "Next part"} →</button>
      </article>
    </section>`;
}

function renderDebrief() {
  const caseItem = state.completedCase;
  const finished = state.session.caseIndex >= state.session.caseBlocks.length;
  app.innerHTML = `
    <section class="debrief-shell page-shell">
      <article>
        <p class="eyebrow">Case debrief</p><h1>${escapeHtml(caseItem.title)}</h1>
        <div class="debrief-grid"><section><span>Mechanism</span>${pathwayMap(caseItem.mechanism)}<p>${escapeHtml(caseItem.conclusion)}</p></section><section><span>Where it happens</span><h3>${escapeHtml(caseItem.where)}</h3><p><b>Key genes:</b> ${caseItem.genes.map(escapeHtml).join(", ")}</p></section></div>
        <div class="caveat-box"><b>What this case cannot prove</b><p>${escapeHtml(caseItem.limitation)}</p></div>
        <div class="case-sources"><span>Open the evidence</span>${sourceLinks(caseItem.sourceIds)}</div>
        <button data-after-debrief>${finished ? "See assessment profile" : "Open next case"} →</button>
      </article>
    </section>`;
}

function scoreBars(groups) {
  return groups.slice(0, 8).map(group => `<div class="reason-score"><div><b>${escapeHtml(group.name)}</b><span>${group.percent}%</span></div><i><span style="width:${group.percent}%"></span></i><small>${group.total} decisions</small></div>`).join("");
}

function renderResults() {
  const result = state.session.summary();
  app.innerHTML = `
    <section class="case-results page-shell">
      <div class="result-banner"><div><span>${result.percent}%</span><small>${result.earned.toFixed(1)} / ${result.total} points</small></div><section><p class="eyebrow">Practice level—not a population percentile</p><h1>${result.level.name}</h1><p>${escapeHtml(result.level.note)}</p><button data-length="${result.total >= 20 ? result.total : 20}">Try a new set →</button></section></div>
      <div class="result-panels"><article><h2>Reasoning skills</h2>${scoreBars(result.reasoning)}</article><article><h2>Knowledge domains</h2>${scoreBars(result.knowledge)}</article></div>
      <div class="misconception-panel"><div><p class="eyebrow">Patterns to revisit</p><h2>Where your model slipped</h2></div>${result.misconceptions.length ? result.misconceptions.slice(0,5).map(item => `<span>${escapeHtml(item.name)} <b>${item.count}</b></span>`).join("") : "<p>No recurring misconception appeared in this set.</p>"}${result.confidenceGap ? `<p>${result.confidenceGap} high-confidence answer${result.confidenceGap === 1 ? "" : "s"} earned low credit. Review these first.</p>` : ""}</div>
      <button class="return-home" data-nav="home">Return home</button>
    </section>`;
}

function renderLearn() {
  const search = state.geneQuery.toLowerCase().trim();
  const filteredGenes = genes.filter(gene => !search || `${gene.gene} ${gene.description} ${gene.pathways.join(" ")}`.toLowerCase().includes(search)).slice(0, 36);
  const uniqueCases = OLYMPIAD_CASES.filter((item, index, all) => all.findIndex(other => other.mechanism.join() === item.mechanism.join()) === index);
  app.innerHTML = `
    <section class="case-library page-shell">
      <div class="library-head"><div><p class="eyebrow">Learning library</p><h1>Build the map before the exam.</h1><p>Open a pathway picture, read the plain background, then follow the source. Gene descriptions remain available as a secondary reference—not as the main game.</p></div><button data-nav="home">Back home</button></div>
      <div class="lesson-grid">${uniqueCases.map(item => `<article><span>${escapeHtml(item.domain)}</span><h2>${escapeHtml(item.title.replace(/:.*$/, ""))}</h2><p>${escapeHtml(item.background)}</p>${pathwayMap(item.mechanism)}<small>${escapeHtml(item.where)}</small><div>${sourceLinks(item.sourceIds)}</div></article>`).join("")}</div>
      <section class="gene-library"><div><p class="eyebrow">Gene reference</p><h2>Search the existing WormPath database</h2></div><input id="gene-query" type="search" value="${escapeHtml(state.geneQuery)}" placeholder="Search a gene, pathway, or function…"><div>${filteredGenes.map(gene => `<article><h3>${escapeHtml(gene.gene)}</h3><p>${escapeHtml(gene.description)}</p><span>${gene.pathways.map(escapeHtml).join(" · ")}</span></article>`).join("")}</div></section>
    </section>`;
}

function render() {
  if (state.view === "home") renderHome();
  if (state.view === "quiz") renderQuiz();
  if (state.view === "feedback") renderFeedback();
  if (state.view === "debrief") renderDebrief();
  if (state.view === "results") renderResults();
  if (state.view === "learn") renderLearn();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.addEventListener("click", event => {
  const nav = event.target.closest("[data-nav]");
  if (nav) { state.view = nav.dataset.nav; state.session = nav.dataset.nav === "home" ? null : state.session; return render(); }
  const length = event.target.closest("[data-length]");
  if (length) return startAssessment(Number(length.dataset.length));
  const mode = event.target.closest("[data-mode]");
  if (mode) return startAssessment(4, mode.dataset.mode);
  const answer = event.target.closest("[data-answer]");
  if (answer) { state.response = answer.dataset.answer; return renderQuiz(); }
  const truth = event.target.closest("[data-truth-index]");
  if (truth) { state.response = { ...(state.response || {}), [truth.dataset.truthIndex]: truth.dataset.truth === "true" }; return renderQuiz(); }
  const confidence = event.target.closest("[data-confidence]");
  if (confidence) { state.confidence = Number(confidence.dataset.confidence); return renderQuiz(); }
  if (event.target.closest("[data-submit]")) {
    const result = state.session.submit(state.response, state.confidence);
    state.feedback = { result, caseItem: state.session.currentCase() };
    state.view = "feedback";
    return render();
  }
  if (event.target.closest("[data-next]")) {
    const completed = state.session.currentCase();
    const outcome = state.session.advance();
    state.response = null; state.confidence = 2;
    if (outcome.caseChanged) { state.completedCase = completed; state.view = "debrief"; }
    else state.view = "quiz";
    return render();
  }
  if (event.target.closest("[data-after-debrief]")) {
    state.view = state.session.caseIndex >= state.session.caseBlocks.length ? "results" : "quiz";
    return render();
  }
});

document.addEventListener("input", event => {
  if (event.target.id === "gene-query") { state.geneQuery = event.target.value; renderLearn(); document.querySelector("#gene-query")?.focus(); }
});

render();

