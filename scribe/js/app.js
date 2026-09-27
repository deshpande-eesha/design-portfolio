import { STRINGS, t, speakChar } from "./i18n.js";
import {
  PAPERS,
  getPaper,
  findPaperByUtterance,
  findQuestionIndex,
  sectionForQuestion,
  nextSection,
  getQuestion,
  getTable,
  getArrangement,
  lookupTableCell,
  lookupChar,
} from "./papers.js";
import { parseIntent, matchOptionByText } from "./intents.js";
import { canListen, createListener, speak, stopSpeaking, splitSentences } from "./speech.js";

const state = {
  screen: "setup",
  language: "en",
  contrast: "standard",
  scribeOn: false,
  paperId: null,
  questionIndex: 0,
  answers: {},
  rate: 1.18,
  listening: false,
  speaking: false,
  pending: null,
  lastHeard: "",
  lastSpoken: "",
  interim: "",
  micError: "",
  lastDirections: "",
  heardArrangement: "",
  endsAt: 0,
  timeUp: false,
  flags: {},
  chunks: [],
  chunkIndex: 0,
  lastRewindAt: 0,
  sectionEnds: {},
  sectionExpired: {},
};

let listener = null;
let speakingToken = 0;
let timerId = null;

const $ = (sel) => document.querySelector(sel);

function bundle() {
  return STRINGS[state.language];
}

function paper() {
  return getPaper(state.paperId);
}

function question() {
  const current = paper();
  return current ? getQuestion(current, state.questionIndex) : null;
}

function markedCount() {
  return Object.keys(state.answers).length;
}

function optionKeys(q) {
  return (q?.options || []).map((opt) => opt.key);
}

function resolveOptionKey(q, key) {
  if (!q) return null;
  const keys = optionKeys(q);
  if (keys.includes(key)) return key;
  const map = { 1: "a", 2: "b", 3: "c", 4: "d", 5: "e", a: "1", b: "2", c: "3", d: "4", e: "5" };
  const mapped = map[key];
  if (mapped && keys.includes(mapped)) return mapped;
  const i = Number(key) - 1;
  if (!Number.isNaN(i) && keys[i]) return keys[i];
  return null;
}

function optionLabel(key) {
  return String(key).toUpperCase();
}

function remainingMs() {
  return Math.max(0, (state.endsAt || 0) - Date.now());
}

function minutesLeft() {
  const ms = remainingMs();
  if (ms <= 0) return 0;
  return Math.floor(ms / 60000);
}

function clockLabel() {
  const ms = remainingMs();
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function currentSection() {
  const current = paper();
  const q = question();
  if (!current || !q) return null;
  return sectionForQuestion(current, q.number);
}

function sectionName(section) {
  if (!section) return "";
  return state.language === "hi" ? section.nameHi || section.name : section.name;
}

function ensureSectionTimer(section) {
  if (!section || state.sectionEnds[section.id]) return;
  state.sectionEnds[section.id] = Date.now() + section.minutes * 60 * 1000;
}

function sectionRemainingMs(section) {
  if (!section) return 0;
  ensureSectionTimer(section);
  return Math.max(0, (state.sectionEnds[section.id] || 0) - Date.now());
}

function sectionMinutesLeft(section) {
  const ms = sectionRemainingMs(section);
  if (ms <= 0) return 0;
  return Math.floor(ms / 60000);
}

function sectionClock(section) {
  const ms = sectionRemainingMs(section);
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function handleSectionTimeUp(section) {
  state.sectionExpired[section.id] = true;
  const current = paper();
  const upcoming = nextSection(current, section);
  if (!upcoming) {
    sayNow(`${t(state.language, "sectionTimeUp", sectionName(section))} ${t(state.language, "askPreview")}`);
    state.pending = "review";
    return;
  }
  const idx = current.questions.findIndex((item) => item.number >= upcoming.from);
  sayNow(`${t(state.language, "sectionTimeUp", sectionName(section))} ${t(state.language, "nextSection", sectionName(upcoming), upcoming.minutes)}`).then(() => {
    if (idx >= 0) goToIndex(idx);
  });
}

function unansweredIndexes() {
  const current = paper();
  if (!current) return [];
  return current.questions
    .map((item, index) => ({ item, index }))
    .filter((row) => !state.answers[row.item.number])
    .map((row) => row.index);
}

function flaggedIndexes() {
  const current = paper();
  if (!current) return [];
  return current.questions
    .map((item, index) => ({ item, index }))
    .filter((row) => state.flags[row.item.number])
    .map((row) => row.index);
}

function nextInList(indexes) {
  if (!indexes.length) return -1;
  const next = indexes.find((index) => index > state.questionIndex);
  return next === undefined ? indexes[0] : next;
}

function orientationLine() {
  const current = paper();
  const q = question();
  if (!current || !q) return "";
  const mark = t(state.language, "markState", state.answers[q.number] ? optionLabel(state.answers[q.number]) : "");
  const flagged = state.flags[q.number] ? `, ${t(state.language, "flagged")}` : "";
  const section = currentSection();
  const paperMins = minutesLeft();
  let timeBit = t(state.language, "timeLeftShort", paperMins);
  if (section && (current.sections || []).length > 1) {
    timeBit = `${t(state.language, "sectionTimeLeft", sectionMinutesLeft(section), sectionName(section))} ${t(state.language, "paperMinutes", paperMins)}`;
  }
  const line = t(state.language, "orient", state.questionIndex + 1, current.questions.length, `${mark}${flagged}`, timeBit);
  if (section && (current.sections || []).length > 1) {
    return `${sectionName(section)}. ${line}`;
  }
  return line;
}

function isEcho(heard) {
  const h = (heard || "").toLowerCase().trim();
  if (!h) return true;
  const s = (state.lastSpoken || "").toLowerCase();
  if (!s || h.length < 10) return false;
  return s.includes(h) || h.includes(s.slice(0, Math.min(32, s.length)));
}

function startTimer(minutes) {
  stopTimer();
  state.timeUp = false;
  state.endsAt = Date.now() + minutes * 60 * 1000;
  timerId = window.setInterval(() => {
    const node = $("[data-timer]");
    if (node) {
      node.textContent = clockLabel();
      node.classList.toggle("is-low", remainingMs() <= 60 * 1000);
    }
    const sectionNode = $("[data-section-timer]");
    const section = currentSection();
    if (sectionNode && section) {
      sectionNode.textContent = sectionClock(section);
      sectionNode.classList.toggle("is-low", sectionRemainingMs(section) <= 60 * 1000);
    }
    if (section && sectionRemainingMs(section) <= 0 && !state.sectionExpired[section.id]) {
      handleSectionTimeUp(section);
    }
    if (remainingMs() <= 0 && !state.timeUp) {
      handleTimeUp();
    }
  }, 1000);
}

function stopTimer() {
  if (timerId) {
    window.clearInterval(timerId);
    timerId = null;
  }
}

function handleTimeUp() {
  if (state.timeUp) return;
  state.timeUp = true;
  stopTimer();
  if (state.screen === "exam") {
    sayNow(t(state.language, "timeUp")).then(() => openReview());
  }
}

function speakLang() {
  return paper()?.language || state.language;
}

async function sayNow(text, lang = state.language) {
  if (!state.scribeOn || !text) return;
  stopSpeaking();
  const token = ++speakingToken;
  const chunks = splitSentences(text);
  state.chunks = chunks.length ? chunks : [text];
  state.chunkIndex = 0;
  state.speaking = true;
  const rate = lang === "hi" ? Math.max(0.95, state.rate - 0.08) : state.rate;
  if (state.scribeOn) listener?.start();
  for (let i = 0; i < state.chunks.length; i += 1) {
    if (token !== speakingToken) return;
    state.chunkIndex = i;
    state.lastSpoken = state.chunks[i];
    updateLive(state.chunks[i]);
    renderDock();
    await speak(state.chunks[i], { lang, rate, pitch: 1.12 });
  }
  if (token !== speakingToken) return;
  state.speaking = false;
  renderDock();
}

function bargeIn() {
  if (!state.speaking) return;
  speakingToken += 1;
  stopSpeaking();
  state.speaking = false;
  renderDock();
}

function updateLive(text) {
  const live = $("#scribe-live");
  if (live) live.textContent = text;
}

function setContrast() {
  document.documentElement.dataset.contrast = state.contrast;
  document.documentElement.lang = state.language === "hi" ? "hi" : "en";
}

function ensureListener() {
  if (listener || !canListen()) return;
  listener = createListener({
    lang: state.language,
    onStart() {
      state.listening = true;
      renderDock();
    },
    onEnd() {
      state.listening = false;
      state.interim = "";
      renderDock();
    },
    onError(error) {
      state.micError = error;
      renderDock();
    },
    onResult({ final, interim }) {
      const heard = final || interim;
      if (state.speaking && heard && !isEcho(heard)) {
        bargeIn();
      }
      state.interim = interim;
      if (final && !isEcho(final)) {
        state.lastHeard = final;
        handleUtterance(final);
      }
      renderDock();
    },
  });
}

function startListening() {
  if (!state.scribeOn) return;
  ensureListener();
  listener?.setLang(state.language);
  listener?.start();
}

function stopListening() {
  listener?.stop();
  state.listening = false;
}

function render() {
  setContrast();
  const app = $("#app");
  if (state.screen === "setup") app.innerHTML = setupView();
  else if (state.screen === "papers") app.innerHTML = papersView();
  else if (state.screen === "review") app.innerHTML = reviewView();
  else app.innerHTML = examView();
  bindChrome();
  if (state.screen === "exam" || state.screen === "review" || state.screen === "papers") {
    renderDock();
  }
}

function setupView() {
  const s = bundle();
  return `
    <section class="setup">
      <p class="eyebrow">${s.setupEyebrow}</p>
      <h1>${s.setupTitle}</h1>
      <p class="lead">${s.setupLead}</p>
      <ul class="rules" aria-label="${s.appName}">
        <li>${state.language === "hi" ? "पढ़ता है — प्रश्न, विकल्प, तालिका, शृंखला।" : "Reads — questions, options, tables, character strings."}</li>
        <li>${state.language === "hi" ? "बताता है — पेपर में लिखा कोई मान, दोबारा पुष्टि।" : "Looks up — any value already on the paper, and reconfirms."}</li>
        <li>${state.language === "hi" ? "चिह्नित करता है — आप विकल्प बोलते हैं।" : "Marks — you say the option, it fills the sheet."}</li>
        <li class="rules-no">${state.language === "hi" ? "हल नहीं करता।" : "Does not solve."}</li>
      </ul>
      <div class="field-row">
        <fieldset>
          <legend>${s.langLabel}</legend>
          <div class="seg" role="radiogroup">
            <button type="button" class="seg-btn ${state.language === "en" ? "is-on" : ""}" data-lang="en" aria-pressed="${state.language === "en"}">English</button>
            <button type="button" class="seg-btn ${state.language === "hi" ? "is-on" : ""}" data-lang="hi" aria-pressed="${state.language === "hi"}">हिंदी</button>
          </div>
        </fieldset>
        <fieldset>
          <legend>${s.contrastLabel}</legend>
          <div class="seg" role="radiogroup">
            <button type="button" class="seg-btn ${state.contrast === "standard" ? "is-on" : ""}" data-contrast="standard" aria-pressed="${state.contrast === "standard"}">${s.contrastStandard}</button>
            <button type="button" class="seg-btn ${state.contrast === "high" ? "is-on" : ""}" data-contrast="high" aria-pressed="${state.contrast === "high"}">${s.contrastHigh}</button>
          </div>
        </fieldset>
      </div>
      <p class="hint">${s.chromeHint}</p>
      <button type="button" class="btn-primary" data-turn-on>${s.turnOn}</button>
    </section>
  `;
}

function papersView() {
  const s = bundle();
  return `
    <section class="papers">
      <header class="topbar">${topbar()}</header>
      <div class="papers-copy">
        <h1>${s.choosePaper}</h1>
        <p class="lead">${s.choosePaperLead}</p>
      </div>
      <div class="paper-grid">
        ${PAPERS.map((item) => `
          <button type="button" class="paper-card" data-paper="${item.id}">
            <span class="paper-kicker">${item.subject}</span>
            <span class="paper-title">${state.language === "hi" ? item.titleHi : item.title}</span>
            <span class="paper-blurb">${state.language === "hi" ? item.blurbHi : item.blurb}</span>
            <span class="paper-meta">${item.questions.length} ${state.language === "hi" ? "प्रश्न" : "questions"} · ${item.language === "hi" ? "हिंदी" : "English"}</span>
          </button>
        `).join("")}
      </div>
      ${dockMarkup()}
    </section>
  `;
}

function examView() {
  const s = bundle();
  const currentPaper = paper();
  const q = question();
  if (!currentPaper || !q) return papersView();
  const total = currentPaper.questions.length;
  const table = getTable(currentPaper, q);
  const arrangement = getArrangement(currentPaper, q);
  const marked = state.answers[q.number];

  return `
    <section class="exam">
      <header class="topbar">${topbar()}</header>
      <div class="exam-grid">
        <article class="q-card" aria-labelledby="q-heading">
          <p class="q-kicker" id="q-heading">${s.questionOf(state.questionIndex + 1, total)} · ${currentSection() ? sectionName(currentSection()) : currentPaper.subject}</p>
          ${q.directions ? `<p class="directions"><span>${s.directions}.</span> ${q.directions.replace(/^Directions[^:]+:\s*/i, "")}</p>` : ""}
          <h2 class="q-stem">
            <span class="q-num">${q.number}.</span>
            ${q.stem}
          </h2>
          ${arrangement ? arrangementBlock(arrangement, s) : ""}
          ${table ? tableBlock(table, s) : ""}
          ${listBlock(q.statements, s.statements, "statement")}
          ${listBlock(q.conclusions, s.conclusions, "conclusion")}
          <div class="options" role="list">
            ${q.options.map((opt) => `
              <button type="button" class="option ${marked === opt.key ? "is-marked" : ""}" data-mark="${opt.key}" role="listitem" aria-pressed="${marked === opt.key}">
                <span class="option-key">${opt.key}</span>
                <span class="option-text">${opt.text}</span>
              </button>
            `).join("")}
          </div>
          ${currentPaper.image ? `<details class="scan"><summary>${state.language === "hi" ? "मूल पेपर" : "Original paper scan"}</summary><img src="${currentPaper.image}" alt="${currentPaper.title}" onerror="this.parentElement.hidden=true"></details>` : ""}
          <div class="q-tools">
            <button type="button" class="btn-ghost ${state.flags[q.number] ? "is-on" : ""}" data-flag aria-pressed="${Boolean(state.flags[q.number])}">${s.flag}</button>
            <button type="button" class="btn-ghost" data-unanswered>${s.unanswered}</button>
          </div>
        </article>
        <aside class="sheet" aria-label="${s.answerSheet}">
          <h2>${s.answerSheet}</h2>
          <p class="sheet-count">${s.statusLine(markedCount(), total, q.number)}</p>
          <ol class="sheet-list">
            ${currentPaper.questions.map((item, i) => {
              const ans = state.answers[item.number];
              return `<li>
                <button type="button" class="sheet-item ${i === state.questionIndex ? "is-current" : ""} ${ans ? "is-filled" : ""} ${state.flags[item.number] ? "is-flagged" : ""}" data-goto-index="${i}">
                  <span>${item.number}${state.flags[item.number] ? "*" : ""}</span>
                  <span>${ans ? optionLabel(ans) : "–"}</span>
                </button>
              </li>`;
            }).join("")}
          </ol>
          <button type="button" class="btn-ghost" data-review>${s.review}</button>
        </aside>
      </div>
      ${dockMarkup()}
    </section>
  `;
}

function reviewView() {
  const s = bundle();
  const currentPaper = paper();
  if (!currentPaper) return papersView();
  return `
    <section class="review">
      <header class="topbar">${topbar()}</header>
      <div class="review-body">
        <h1>${s.reviewTitle}</h1>
        <p class="lead">${s.reviewLead}</p>
        <ol class="review-list">
          ${currentPaper.questions.map((item) => {
            const ans = state.answers[item.number];
            const opt = item.options.find((o) => o.key === ans);
            return `<li>
              <strong>${state.language === "hi" ? "प्रश्न" : "Q"} ${item.number}</strong>
              <span>${ans ? `${s.optionWord} ${optionLabel(ans)} — ${opt?.text || ""}` : s.emptyMark}</span>
            </li>`;
          }).join("")}
        </ol>
        <div class="review-actions">
          <button type="button" class="btn-ghost" data-back-exam>${s.back}</button>
          <button type="button" class="btn-primary" data-finish>${s.submit}</button>
        </div>
      </div>
      ${dockMarkup()}
    </section>
  `;
}

function topbar() {
  const s = bundle();
  return `
    <div class="brand">
      <a href="../index.html" class="brand-back">${s.back}</a>
      <span class="brand-name">${s.appName}</span>
      <span class="brand-tag">${s.appTag}</span>
    </div>
    <div class="topbar-actions">
      ${state.screen === "exam" && state.endsAt ? `<span class="timer ${remainingMs() <= 60000 ? "is-low" : ""}" data-timer aria-label="${t(state.language, "timerLabel")}">${clockLabel()}</span>` : ""}
      ${state.screen === "exam" && currentSection() && (paper()?.sections || []).length > 1 ? `<span class="timer ${sectionRemainingMs(currentSection()) <= 60000 ? "is-low" : ""}" data-section-timer aria-label="${sectionName(currentSection())}">${sectionClock(currentSection())}</span>` : ""}
      <button type="button" class="seg-btn ${state.language === "en" ? "is-on" : ""}" data-lang="en">EN</button>
      <button type="button" class="seg-btn ${state.language === "hi" ? "is-on" : ""}" data-lang="hi">हिं</button>
      <button type="button" class="scribe-toggle ${state.scribeOn ? "is-on" : ""}" data-scribe-toggle aria-pressed="${state.scribeOn}">
        ${state.scribeOn ? s.scribeOn : s.scribeOff}
      </button>
    </div>
  `;
}

function dockMarkup() {
  const s = bundle();
  return `
    <div class="dock" id="dock">
      <button type="button" class="mic ${state.listening ? "is-live" : ""}" data-mic aria-pressed="${state.listening}" aria-label="${s.tapToSpeak}">
        <span class="mic-dot"></span>
        Mic
      </button>
      <div class="dock-copy">
        <p class="dock-status" data-dock-status>${!canListen() ? s.micUnsupported : s.tapToSpeak}</p>
        <p class="dock-heard" data-dock-heard></p>
        <p class="dock-spoken" data-dock-spoken></p>
      </div>
      <div class="dock-actions">
        <button type="button" data-act="read">${s.repeat}</button>
        <button type="button" data-act="rewind">${state.language === "hi" ? "पंक्ति" : "Last line"}</button>
        <button type="button" data-act="flag">${s.flag}</button>
        <button type="button" data-act="unanswered">${s.unanswered}</button>
        <button type="button" data-act="options">${s.readOptions}</button>
        <button type="button" data-act="prev">${s.prev}</button>
        <button type="button" data-act="skip">${s.skip}</button>
        <button type="button" data-act="next">${s.next}</button>
        <button type="button" data-act="help">${s.help}</button>
      </div>
      <form class="type-row" data-type-form>
        <label class="sr-only" for="command-input">${s.typePlaceholder}</label>
        <input id="command-input" name="command" autocomplete="off" placeholder="${s.typePlaceholder}">
        <button type="submit">${s.send}</button>
      </form>
    </div>
  `;
}

function arrangementBlock(arrangement, s) {
  return `
    <div class="arr">
      <h3>${s.arrangement}</h3>
      <p class="arr-chars" lang="en">${arrangement.chars.join(" ")}</p>
    </div>
  `;
}

function tableBlock(table, s) {
  return `
    <div class="table-wrap">
      <h3>${s.table}</h3>
      <p class="table-title">${table.title}</p>
      <table>
        <thead>
          <tr>
            <th>State</th>
            ${table.columns.map((col) => `<th>${col.label}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${table.rows.map((row) => `
            <tr>
              <th scope="row">${row.label}</th>
              ${table.columns.map((col) => `<td>${row[col.id]}</td>`).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function listBlock(items, title, cls) {
  if (!items?.length) return "";
  return `
    <div class="${cls}s">
      <h3>${title}</h3>
      <ol>
        ${items.map((item) => `<li><span>${item.key}.</span> ${item.text}</li>`).join("")}
      </ol>
    </div>
  `;
}

function renderDock() {
  const s = bundle();
  const status = $("[data-dock-status]");
  const heard = $("[data-dock-heard]");
  const spoken = $("[data-dock-spoken]");
  const mic = $("[data-mic]");
  if (!status) return;
  if (!canListen()) status.textContent = s.micUnsupported;
  else if (!state.scribeOn) status.textContent = s.scribeOff;
  else if (state.speaking) status.textContent = `${s.saathi}…`;
  else if (state.listening) status.textContent = s.listening;
  else status.textContent = s.tapToSpeak;
  if (heard) {
    const line = state.interim || state.lastHeard;
    heard.textContent = line ? `${s.you}: ${line}` : "";
  }
  if (spoken) spoken.textContent = state.lastSpoken ? `${s.saathi}: ${state.lastSpoken}` : "";
  if (mic) mic.classList.toggle("is-live", state.listening);
}

function bindChrome() {
  $("[data-turn-on]")?.addEventListener("click", () => turnScribe(true));
  document.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.language = btn.dataset.lang;
      listener?.setLang(state.language);
      render();
    });
  });
  document.querySelectorAll("[data-contrast]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.contrast = btn.dataset.contrast;
      render();
    });
  });
  $("[data-scribe-toggle]")?.addEventListener("click", () => turnScribe(!state.scribeOn));
  document.querySelectorAll("[data-paper]").forEach((btn) => {
    btn.addEventListener("click", () => openPaper(btn.dataset.paper));
  });
  document.querySelectorAll("[data-mark]").forEach((btn) => {
    btn.addEventListener("click", () => markAnswer(btn.dataset.mark));
  });
  document.querySelectorAll("[data-goto-index]").forEach((btn) => {
    btn.addEventListener("click", () => goToIndex(Number(btn.dataset.gotoIndex)));
  });
  $("[data-review]")?.addEventListener("click", () => openReview());
  $("[data-flag]")?.addEventListener("click", () => handleIntent({ type: "FLAG" }));
  $("[data-unanswered]")?.addEventListener("click", () => handleIntent({ type: "NEXT_UNANSWERED" }));
  $("[data-back-exam]")?.addEventListener("click", () => {
    state.screen = "exam";
    render();
  });
  $("[data-finish]")?.addEventListener("click", () => {
    stopTimer();
    state.endsAt = 0;
    state.screen = "papers";
    state.paperId = null;
    state.answers = {};
    render();
    sayNow(t(state.language, "turnedOn"));
  });
  $("[data-mic]")?.addEventListener("click", () => {
    if (!state.scribeOn) {
      turnScribe(true);
      return;
    }
    if (state.listening) stopListening();
    else startListening();
    renderDock();
  });
  document.querySelectorAll("[data-act]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const act = btn.dataset.act;
      if (act === "read") handleIntent({ type: "READ_QUESTION" });
      if (act === "rewind") handleIntent({ type: "REWIND" });
      if (act === "flag") handleIntent({ type: "FLAG" });
      if (act === "unanswered") handleIntent({ type: "NEXT_UNANSWERED" });
      if (act === "options") handleIntent({ type: "READ_OPTIONS" });
      if (act === "next") handleIntent({ type: "NEXT" });
      if (act === "skip") handleIntent({ type: "SKIP" });
      if (act === "prev") handleIntent({ type: "PREV" });
      if (act === "help") handleIntent({ type: "HELP" });
    });
  });
  $("[data-type-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = $("#command-input");
    const value = input.value.trim();
    if (!value) return;
    input.value = "";
    state.lastHeard = value;
    handleUtterance(value);
    renderDock();
  });
}

function turnScribe(on) {
  state.scribeOn = on;
  if (on) {
    if (state.screen === "setup") state.screen = "papers";
    render();
    sayNow(t(state.language, "turnedOn"));
    startListening();
  } else {
    stopListening();
    stopSpeaking();
    const message = t(state.language, "turnedOff");
    state.lastSpoken = message;
    updateLive(message);
    render();
  }
}

function openPaper(id) {
  const next = getPaper(id);
  if (!next) {
    sayNow(t(state.language, "paperNotFound"));
    return;
  }
  state.paperId = id;
  state.questionIndex = 0;
  state.answers = {};
  state.flags = {};
  state.sectionEnds = {};
  state.sectionExpired = {};
  state.pending = null;
  state.lastDirections = "";
  state.heardArrangement = "";
  state.screen = "exam";
  const mins = next.durationMinutes || 20;
  startTimer(mins);
  ensureSectionTimer(sectionForQuestion(next, next.questions[0].number));
  render();
  const firstSection = sectionForQuestion(next, next.questions[0].number);
  const sectionBit =
    firstSection && (next.sections || []).length > 1
      ? t(state.language, "nextSection", sectionName(firstSection), firstSection.minutes)
      : "";
  const intro = `${t(state.language, "paperLoaded", state.language === "hi" ? next.titleHi : next.title, next.questions.length)} ${t(state.language, "paperTime", mins)} ${sectionBit}`;
  sayNow(intro).then(() => readCurrent());
}

function goToIndex(index, { announce = true } = {}) {
  const current = paper();
  if (!current) return;
  if (index < 0) {
    sayNow(t(state.language, "atFirst"));
    return;
  }
  if (index >= current.questions.length) {
    state.pending = "review";
    sayNow(t(state.language, "askPreview"));
    return;
  }
  state.questionIndex = index;
  state.pending = null;
  const landed = current.questions[index];
  ensureSectionTimer(sectionForQuestion(current, landed.number));
  render();
  if (announce) readCurrent();
}

function openReview() {
  state.screen = "review";
  render();
  const current = paper();
  const lines = current.questions.map((item) => {
    const ans = state.answers[item.number];
    return ans
      ? `${state.language === "hi" ? "प्रश्न" : "Question"} ${item.number}, ${t(state.language, "optionWord")} ${optionLabel(ans)}.`
      : `${state.language === "hi" ? "प्रश्न" : "Question"} ${item.number}, ${t(state.language, "emptyMark")}.`;
  });
  sayNow(`${t(state.language, "reviewTitle")}. ${lines.join(" ")}`);
}

async function markAnswer(rawKey, { changed = false, label = "" } = {}) {
  const q = question();
  const current = paper();
  if (!q) return;
  const key = resolveOptionKey(q, rawKey);
  if (!key) {
    sayNow(t(state.language, "noSuchOption", rawKey, optionKeys(q).join(", ")));
    return;
  }
  const already = state.answers[q.number];
  state.answers[q.number] = key;
  state.pending = null;
  render();

  const optName = optionLabel(key);
  let confirm;
  if (already && already === key) {
    confirm = t(state.language, "alreadyMarked", optName);
    await sayNow(confirm);
    return;
  }
  if (already && already !== key) {
    confirm = t(state.language, "changedConfirm", optName);
  } else if (label) {
    confirm = t(state.language, "matchedConfirm", optName, label);
  } else {
    confirm = t(state.language, "markedConfirm", optName);
  }

  const isLast = state.questionIndex >= (current?.questions.length || 1) - 1;
  if (isLast) {
    state.pending = "review";
    await sayNow(`${t(state.language, "markedConfirm", optName)} ${t(state.language, "askPreview")}`);
    return;
  }
  await sayNow(t(state.language, "markedNext", optName));
  goToIndex(state.questionIndex + 1);
}

function readCurrent(prefix = "") {
  const q = question();
  const current = paper();
  if (!q) return;
  const parts = [];
  if (prefix) parts.push(prefix);
  parts.push(orientationLine() + ".");
  if (q.directions && q.directions !== state.lastDirections) {
    parts.push(q.directions);
    state.lastDirections = q.directions;
  }
  parts.push(q.speak || q.stem);
  if (q.statements) {
    parts.push(t(state.language, "statements") + ".");
    q.statements.forEach((item) => parts.push(`${item.key}. ${item.text}`));
  }
  if (q.conclusions) {
    parts.push(t(state.language, "conclusions") + ".");
    q.conclusions.forEach((item) => parts.push(`${item.key}. ${item.text}`));
  }
  const arrangement = getArrangement(current, q);
  if (arrangement && state.heardArrangement !== current.id) {
    parts.push(t(state.language, "arrangement") + ".");
    parts.push(arrangement.chars.map((ch) => speakChar(ch, speakLang())).join(", "));
    state.heardArrangement = current.id;
  }
  parts.push(t(state.language, "options") + ".");
  q.options.forEach((opt) => parts.push(`${optionLabel(opt.key)}, ${opt.text}.`));
  sayNow(parts.join(" "), speakLang());
}

function rewindLast() {
  if (!state.chunks.length) {
    sayNow(t(state.language, "rewindEmpty"));
    return;
  }
  if (Date.now() - state.lastRewindAt < 2800) {
    state.chunkIndex = Math.max(0, state.chunkIndex - 1);
  }
  state.lastRewindAt = Date.now();
  const chunk = state.chunks[state.chunkIndex];
  const token = ++speakingToken;
  stopSpeaking();
  state.speaking = true;
  state.lastSpoken = chunk;
  updateLive(chunk);
  renderDock();
  const lang = speakLang();
  const rate = lang === "hi" ? Math.max(0.95, state.rate - 0.08) : state.rate;
  speak(chunk, { lang, rate, pitch: 1.12 }).then(() => {
    if (token !== speakingToken) return;
    state.speaking = false;
    renderDock();
  });
}

function readOptions() {
  const q = question();
  if (!q) return;
  const parts = q.options.map((opt) => `${optionLabel(opt.key)}, ${opt.text}.`);
  sayNow(parts.join(" "), speakLang());
}

function readTable() {
  const current = paper();
  const q = question();
  const table = getTable(current, q) || current?.tables?.["crimes-2012"];
  if (!table) {
    sayNow(t(state.language, "tableMissing"));
    return;
  }
  const parts = [table.title];
  table.rows.forEach((row) => {
    const cells = table.columns.map((col) => `${col.label} ${row[col.id]}`);
    parts.push(`${row.label}: ${cells.join(", ")}.`);
  });
  sayNow(parts.join(" "), speakLang());
}

function handleUtterance(text) {
  if (!state.scribeOn && parseIntent(text).type !== "SCRIBE_ON") {
    return;
  }
  const intent = parseIntent(text, {
    screen: state.screen,
    pending: state.pending,
  });
  handleIntent(intent, text);
}

function handleIntent(intent, utterance = "") {
  const q = question();
  const current = paper();

  switch (intent.type) {
    case "SCRIBE_ON":
      turnScribe(true);
      break;
    case "SCRIBE_OFF":
      turnScribe(false);
      break;
    case "LANGUAGE":
      state.language = intent.lang;
      listener?.setLang(state.language);
      render();
      sayNow(intent.lang === "hi" ? "भाषा हिंदी है।" : "Language is English.");
      break;
    case "SELECT_PAPER": {
      const found = findPaperByUtterance(intent.utterance || utterance);
      if (found) openPaper(found.id);
      else sayNow(t(state.language, "paperNotFound"));
      break;
    }
    case "HELP":
      sayNow(t(state.language, "helpSpeech"));
      break;
    case "REFUSE_SOLVE":
      sayNow(t(state.language, "refuseSolve"));
      break;
    case "NEXT":
      state.pending = null;
      goToIndex(state.questionIndex + 1);
      break;
    case "SKIP": {
      const currentPaper = paper();
      const last = state.questionIndex >= (currentPaper?.questions.length || 1) - 1;
      if (last) {
        state.pending = "review";
        sayNow(`${t(state.language, "skipped")} ${t(state.language, "askPreview")}`);
        break;
      }
      sayNow(t(state.language, "skippedNext")).then(() => goToIndex(state.questionIndex + 1));
      break;
    }
    case "PREV":
      goToIndex(state.questionIndex - 1);
      break;
    case "STAY":
      state.pending = null;
      sayNow(t(state.language, "staying"));
      break;
    case "TIME_LEFT": {
      if (!state.endsAt || state.screen === "setup" || state.screen === "papers") {
        sayNow(t(state.language, "timeNone"));
        break;
      }
      const section = currentSection();
      if (section && (paper()?.sections || []).length > 1) {
        sayNow(`${t(state.language, "sectionTimeLeft", sectionMinutesLeft(section), sectionName(section))} ${t(state.language, "timeLeft", minutesLeft())}`);
      } else {
        sayNow(t(state.language, "timeLeft", minutesLeft()));
      }
      break;
    }
    case "REWIND":
      rewindLast();
      break;
    case "FLAG": {
      const currentQ = question();
      if (!currentQ) break;
      if (state.flags[currentQ.number]) {
        delete state.flags[currentQ.number];
        render();
        sayNow(t(state.language, "unflagged"));
      } else {
        state.flags[currentQ.number] = true;
        render();
        sayNow(t(state.language, "flaggedOn"));
      }
      break;
    }
    case "UNFLAG": {
      const currentQ = question();
      if (currentQ) delete state.flags[currentQ.number];
      render();
      sayNow(t(state.language, "unflagged"));
      break;
    }
    case "NEXT_UNANSWERED": {
      const idx = nextInList(unansweredIndexes());
      if (idx < 0) sayNow(t(state.language, "noUnanswered"));
      else sayNow(t(state.language, "goingUnanswered", paper().questions[idx].number)).then(() => goToIndex(idx));
      break;
    }
    case "NEXT_FLAGGED": {
      const idx = nextInList(flaggedIndexes());
      if (idx < 0) sayNow(t(state.language, "noFlagged"));
      else sayNow(t(state.language, "goingFlagged", paper().questions[idx].number)).then(() => goToIndex(idx));
      break;
    }
    case "NEXT_SECTION": {
      const upcoming = nextSection(paper(), currentSection());
      if (!upcoming) {
        sayNow(t(state.language, "lastSection"));
        break;
      }
      const idx = paper().questions.findIndex((item) => item.number >= upcoming.from);
      sayNow(t(state.language, "nextSection", sectionName(upcoming), upcoming.minutes)).then(() => {
        if (idx >= 0) goToIndex(idx);
      });
      break;
    }
    case "FIND_QUESTION": {
      const idx = findQuestionIndex(current, intent.utterance || utterance);
      if (idx < 0) sayNow(t(state.language, "questionNotFound"));
      else {
        const n = current.questions[idx].number;
        sayNow(t(state.language, "foundQuestion", n)).then(() => goToIndex(idx));
      }
      break;
    }
    case "GOTO": {
      const idx = current?.questions.findIndex((item) => item.number === intent.number);
      if (idx < 0) sayNow(t(state.language, "gotoMissing", intent.number, current.questions.length));
      else goToIndex(idx);
      break;
    }
    case "READ_QUESTION":
      readCurrent();
      break;
    case "READ_OPTIONS":
      readOptions();
      break;
    case "READ_OPTION": {
      const key = resolveOptionKey(q, intent.key);
      const opt = q?.options.find((item) => item.key === key);
      if (!opt) sayNow(t(state.language, "noOption", intent.key));
      else sayNow(`${t(state.language, "optionWord")} ${optionLabel(opt.key)}. ${opt.text}`, speakLang());
      break;
    }
    case "READ_STATEMENTS":
      if (!q?.statements) sayNow(t(state.language, "noStatement"));
      else sayNow(q.statements.map((item) => `${item.key}. ${item.text}`).join(" "), speakLang());
      break;
    case "READ_STATEMENT": {
      const item = q?.statements?.find((row) => row.key.toUpperCase() === String(intent.key).toUpperCase());
      if (!item) sayNow(t(state.language, "noStatement"));
      else sayNow(`${item.key}. ${item.text}`, speakLang());
      break;
    }
    case "READ_CONCLUSIONS":
      if (!q?.conclusions) sayNow(t(state.language, "unknown"));
      else sayNow(q.conclusions.map((item) => `${item.key}. ${item.text}`).join(" "), speakLang());
      break;
    case "READ_TABLE":
      readTable();
      break;
    case "LOOKUP_TABLE": {
      const table = getTable(current, q) || current?.tables?.["crimes-2012"];
      const hit = lookupTableCell(table, intent.utterance || utterance);
      if (!hit) sayNow(t(state.language, "tableNotFound"));
      else sayNow(t(state.language, "tableValue", hit.column, hit.row, hit.value));
      break;
    }
    case "READ_ARRANGEMENT": {
      const arr = getArrangement(current, q) || current?.arrangements?.alpha;
      if (!arr) sayNow(t(state.language, "arrangementMissing"));
      else sayNow(arr.chars.map((ch) => speakChar(ch, speakLang())).join(", "), speakLang());
      break;
    }
    case "LOOKUP_CHAR": {
      const arr = getArrangement(current, q) || current?.arrangements?.alpha;
      const ch = lookupChar(arr, intent.position, intent.from);
      if (!ch) sayNow(t(state.language, "arrangementMissing"));
      else sayNow(t(state.language, "charValue", intent.position, t(state.language, intent.from === "right" ? "fromRight" : "fromLeft"), ch));
      break;
    }
    case "MARK":
      markAnswer(intent.key, { changed: intent.changed });
      break;
    case "MATCH_OPTION": {
      const matches = matchOptionByText(q, intent.utterance || utterance);
      if (matches.length === 1) {
        markAnswer(matches[0].key, { label: matches[0].text });
      } else if (matches.length > 1) {
        sayNow(t(state.language, "ambiguousMatch", matches.map((item) => optionLabel(item.key)).join(", ")));
      } else {
        sayNow(t(state.language, utterance.trim().split(/\s+/).length > 2 ? "noTextMatch" : "unknown"));
      }
      break;
    }
    case "MARK_NONE": {
      const last = q?.options?.[q.options.length - 1];
      if (last) markAnswer(last.key);
      else sayNow(t(state.language, "unknown"));
      break;
    }
    case "UNMARK":
      if (q) {
        delete state.answers[q.number];
        render();
        sayNow(t(state.language, "unmarked"));
      }
      break;
    case "STATUS_CURRENT":
      if (!q) break;
      if (!state.answers[q.number]) sayNow(t(state.language, "nothingMarked"));
      else sayNow(t(state.language, "currentMark", optionLabel(state.answers[q.number]), q.number));
      break;
    case "STATUS":
      sayNow(t(state.language, "statusLine", markedCount(), current?.questions.length || 0, q?.number || 0));
      break;
    case "REVIEW":
      openReview();
      break;
    case "SLOWER":
      state.rate = Math.max(0.85, state.rate - 0.1);
      sayNow(t(state.language, "slower"));
      break;
    case "FASTER":
      state.rate = Math.min(1.5, state.rate + 0.1);
      sayNow(t(state.language, "faster"));
      break;
    case "PAUSE":
      bargeIn();
      sayNow(t(state.language, "paused"));
      break;
    case "UNKNOWN":
      sayNow(t(state.language, "unknown"));
      break;
    default:
      break;
  }
}

document.addEventListener("keydown", (event) => {
  if (event.target.matches("input, textarea")) return;
  if (event.code === "Space") {
    event.preventDefault();
    if (!state.scribeOn) turnScribe(true);
    else if (state.listening) stopListening();
    else startListening();
    renderDock();
  }
  if (state.screen !== "exam") return;
  if (event.key === "n" || event.key === "N") handleIntent({ type: "NEXT" });
  if (event.key === "p" || event.key === "P") handleIntent({ type: "PREV" });
  if (event.key === "r" || event.key === "R") handleIntent({ type: "REWIND" });
  if (event.key === "u" || event.key === "U") handleIntent({ type: "NEXT_UNANSWERED" });
  if (event.key === "f" || event.key === "F") handleIntent({ type: "FLAG" });
  if (event.key === "h" || event.key === "H") handleIntent({ type: "HELP" });
  if (["1", "2", "3", "4", "5"].includes(event.key)) handleIntent({ type: "MARK", key: event.key });
});

render();
