/* Schwa — application */
(function () {
"use strict";

/* ───────────────────────── utils ───────────────────────── */

const $  = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

function dayKey(d) {
  const x = d || new Date();
  return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0");
}
function addDays(key, n) {
  const [y, m, d] = key.split("-").map(Number);
  const x = new Date(y, m - 1, d + n);
  return dayKey(x);
}
function daysBetween(a, b) {
  const pa = a.split("-").map(Number), pb = b.split("-").map(Number);
  return Math.round((new Date(pb[0], pb[1] - 1, pb[2]) - new Date(pa[0], pa[1] - 1, pa[2])) / 864e5);
}
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const clone = o => JSON.parse(JSON.stringify(o));

const ICON = {
  today:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 7h16M4 12h16M4 17h10" stroke-linecap="round"/></svg>',
  ear:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M7 8a5 5 0 1 1 10 0c0 2.5-2 3.4-2.8 4.6-.7 1-.5 2.2-1.2 3.1-.6.8-1.6 1-2.4.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.5 8.5a1.6 1.6 0 0 1 3 .6" stroke-linecap="round"/><path d="M8 19c-.6 1-1.6 1.6-2.7 1.6" stroke-linecap="round"/></svg>',
  lab:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M10 3v6.2L4.6 18a2 2 0 0 0 1.7 3h11.4a2 2 0 0 0 1.7-3L14 9.2V3" stroke-linejoin="round"/><path d="M8.5 3h7M7.6 14h8.8" stroke-linecap="round"/></svg>',
  cards:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="6" width="14" height="12" rx="2"/><path d="M7 3h11a3 3 0 0 1 3 3v9" stroke-linecap="round"/></svg>',
  write:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 20h16" stroke-linecap="round"/><path d="M14.5 4.5a2.1 2.1 0 0 1 3 3L9 16l-4 1 1-4Z" stroke-linejoin="round"/></svg>',
  play:   '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M8 5.5v13l11-6.5z"/></svg>',
  stop:   '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="7" y="7" width="10" height="10" rx="2"/></svg>',
  mic:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke-linecap="round"/></svg>',
  gear:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v2.4M12 18.8v2.4M21.2 12h-2.4M5.2 12H2.8M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7M18.5 18.5l-1.7-1.7M7.2 7.2 5.5 5.5" stroke-linecap="round"/></svg>',
  back:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  spark:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 3.5 13.9 9l5.6 1.9-5.6 1.9L12 18.4l-1.9-5.6L4.5 10.9 10.1 9Z" stroke-linejoin="round"/></svg>',
  plus:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>',
  check:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4.5 12.5 9.5 17.5 19.5 6.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};

/* ───────────────────────── state ───────────────────────── */

const DEFAULT = {
  v: 1,
  updatedAt: 0,
  profile: { goalMin: 15, voiceURI: "", rate: 1, accent: "en-US", roulette: [], minDiff: 0, startedAt: dayKey() },
  days: {},                   // key -> {min, accSum, accN, cards, lessons, words}
  lab: {},                    // lessonId -> {done, score, at}
  packProgress: {},           // packId -> index
  cards: [],                  // SRS
  errorTypes: {},             // "Préposition" -> count
  writings: [],               // {at, prompt, text, level, verdict}
  library: [],                // {id, title, segments:[], hasAudio, at}
  shortlist: [],              // videos reperees, en attente de leur vraie transcription
  aiPacks: []                 // {id, title, segments:[], at}
};

let S = clone(DEFAULT);
const LSKEY = "schwa.state.v1";

function loadLocal() {
  try {
    const raw = localStorage.getItem(LSKEY);
    if (raw) S = Object.assign(clone(DEFAULT), JSON.parse(raw));
  } catch (e) { /* storage blocked — run from memory */ }
}
function touch() { S.updatedAt = Date.now(); }
function saveLocal() {
  try { localStorage.setItem(LSKEY, JSON.stringify(S)); } catch (e) {}
}

let pushTimer = null, pushing = false, pendingPush = false;
function save(skipRemote) {
  touch(); saveLocal();
  if (skipRemote) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(pushRemote, 1500);
}

/* ───────────────────────── Claude ─────────────────────────
   Auto-hébergé : plus de pont vers l'abonnement claude.ai. Les fonctions IA
   passent par ta clé API (voir ai.js) et s'éteignent proprement sans clé. */

let capsReady = true;

async function initCaps() { render(); }

/* La synchronisation serveur n'existe plus en auto-hébergé : tout vit sur
   l'appareil. Passage d'un appareil à l'autre : export / import JSON. */
async function pullRemote() {}
async function pushRemote() {}
async function pushLibraryItem() {}

function aiAvailable() { return AIC.available(); }

async function ask(input, opts) {
  const o = opts || {};
  if (o.onText) return AIC.stream(input, o);
  return AIC.send(input, o);
}
async function askJSON(input, opts) {
  return AIC.json(input, opts);
}

function aiErrorMessage(e) {
  const c = e && e.code;
  if (c === "no_key")       return "Ajoute ta clé API dans les réglages pour activer cette fonction.";
  if (c === "bad_key")      return "Clé refusée. Vérifie-la dans les réglages.";
  if (c === "rate_limited") return "Trop de requêtes d'affilée. Attends une minute.";
  if (c === "bad_request")  return "Requête refusée par l'API" + (e.message ? " : " + e.message : ".");
  if (c === "server")       return "L'API a un souci de son côté. Réessaie dans un instant.";
  if (c === "refused")      return "Claude n'a pas voulu répondre à cette demande.";
  if (c === "invalid_json") return "Réponse illisible. Réessaie.";
  if (c === "empty")        return "Réponse vide. Réessaie.";
  if (e && e.name === "AbortError") return "Annulé.";
  return "Ça n'a pas marché. Vérifie ta connexion et réessaie.";
}

/* Le crédit dépensé est réel : on le dit franchement dans l'interface. */
function aiCostNote() {
  const m = MODELS.find(x => x.id === AIC.model());
  return m ? m.name + " · " + m.price : "";
}
/* ───────────────────────── audio ───────────────────────── */

const Speech = {
  voices: [],
  current: null,
  ready: false,
  init() {
    if (!("speechSynthesis" in window)) return;
    const load = () => {
      this.voices = speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang));
      this.ready = this.voices.length > 0;
      this.resolve();
    };
    load();
    speechSynthesis.addEventListener("voiceschanged", load);
  },
  resolve() {
    if (!this.voices.length) { this.current = null; return; }
    let v = S.profile.voiceURI && this.voices.find(x => x.voiceURI === S.profile.voiceURI);
    if (!v) v = this.voiceFor(S.profile.accent);
    if (!v) v = this.voices.find(x => /en[-_]US/i.test(x.lang)) || this.voices[0];
    this.current = v;
  },
  voiceFor(lang) {
    if (!lang) return null;
    const l = String(lang).toLowerCase();
    return this.voices.find(x => x.lang.replace("_", "-").toLowerCase() === l) || null;
  },
  /** Accent codes this device can actually speak. */
  langsAvailable() {
    const out = [];
    for (const a of ACCENTS) if (this.voiceFor(a.code)) out.push(a.code);
    return out;
  },
  available() { return "speechSynthesis" in window; },
  stop() { if ("speechSynthesis" in window) speechSynthesis.cancel(); },
  speak(text, rate, onEnd, lang) {
    if (!("speechSynthesis" in window)) { onEnd && onEnd(); return null; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    this.resolve();
    const forced = lang && this.voiceFor(lang);
    if (forced) { u.voice = forced; u.lang = forced.lang; }
    else if (this.current) { u.voice = this.current; u.lang = this.current.lang; }
    else u.lang = S.profile.accent || "en-US";
    u.rate = (rate || 1) * (S.profile.rate || 1);
    u.onend = () => onEnd && onEnd();
    u.onerror = () => onEnd && onEnd();
    setTimeout(() => speechSynthesis.speak(u), 30);
    return u;
  }
};

/* audio blobs (imported episodes) live in IndexedDB */
const Blobs = {
  db: null,
  open() {
    if (this.db) return Promise.resolve(this.db);
    return new Promise((res, rej) => {
      if (!("indexedDB" in window)) return rej(new Error("no idb"));
      const r = indexedDB.open("schwa-audio", 1);
      r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains("clips")) r.result.createObjectStore("clips"); };
      r.onsuccess = () => { this.db = r.result; res(this.db); };
      r.onerror = () => rej(r.error);
    });
  },
  async put(id, blob) {
    const db = await this.open();
    return new Promise((res, rej) => {
      const tx = db.transaction("clips", "readwrite");
      tx.objectStore("clips").put(blob, id);
      tx.oncomplete = res; tx.onerror = () => rej(tx.error);
    });
  },
  async get(id) {
    const db = await this.open();
    return new Promise((res, rej) => {
      const tx = db.transaction("clips", "readonly");
      const q = tx.objectStore("clips").get(id);
      q.onsuccess = () => res(q.result || null);
      q.onerror = () => rej(q.error);
    });
  },
  async del(id) {
    const db = await this.open();
    return new Promise(res => {
      const tx = db.transaction("clips", "readwrite");
      tx.objectStore("clips").delete(id); tx.oncomplete = res; tx.onerror = res;
    });
  }
};

/* plays either a TTS utterance or a slice of an imported audio file */
const Player = {
  el: null, url: null, loadedFor: null, stopAt: 0, timer: null, onStop: null,
  async ensureClip(libId) {
    if (this.loadedFor === libId && this.el) return true;
    const blob = await Blobs.get(libId).catch(() => null);
    if (!blob) return false;
    if (this.url) URL.revokeObjectURL(this.url);
    this.url = URL.createObjectURL(blob);
    if (!this.el) { this.el = new Audio(); this.el.preload = "auto"; }
    this.el.src = this.url;
    this.loadedFor = libId;
    return true;
  },
  stop() {
    Speech.stop();
    Tube.stop();
    clearInterval(this.timer);
    if (this.el) { try { this.el.pause(); } catch (e) {} }
    const cb = this.onStop; this.onStop = null;
    cb && cb();
  },

  /* Trois sources, par ordre de fidélité : le fichier que tu as importé,
     puis la vidéo YouTube elle-même, puis la voix de synthèse en dernier
     recours. Seule la première marche hors ligne. */
  async play(seg, rate, libId, onEnd, lang) {
    this.stop();
    this.onStop = onEnd;

    if (seg && seg.yt && seg.t != null && !libId && !Tube.blocked) {
      try {
        await Tube.playSegment(seg.yt, seg.t, seg.e, rate, () => {
          const cb = this.onStop; this.onStop = null; cb && cb();
        });
        return;
      } catch (e) { /* API YouTube indisponible : on retombe sur la synthèse */ }
    }

    const hasClip = libId && seg && seg.t != null && await this.ensureClip(libId);
    if (hasClip) {
      const a = this.el;
      a.playbackRate = clamp(rate * (S.profile.rate || 1), 0.5, 2);
      a.currentTime = Math.max(0, seg.t);
      const end = seg.e != null ? seg.e : seg.t + 6;
      try { await a.play(); } catch (e) { /* fall through to TTS */ }
      clearInterval(this.timer);
      this.timer = setInterval(() => {
        if (a.currentTime >= end || a.ended) { clearInterval(this.timer); a.pause(); const cb = this.onStop; this.onStop = null; cb && cb(); }
      }, 60);
      return;
    }
    Speech.speak(seg.full, rate, () => { const cb = this.onStop; this.onStop = null; cb && cb(); }, lang);
  }
};

/** Picks one of the accents the learner enabled for the roulette, if any. */
function pickAccent() {
  const on = (S.profile.roulette || []).filter(c => Speech.voiceFor(c));
  return on.length ? on[Math.floor(Math.random() * on.length)] : null;
}
function accentInfo(code) { return ACCENTS.find(a => a.code === code) || null; }

/* ───────────────────────── diff ───────────────────────── */

/* Reductions the learner may type instead of the written form — and that a
   subtitle file may itself contain. Both sides of the comparison go through
   the same expansion, so either spelling counts as heard correctly. */
const CONTRACTIONS = {
  gonna: "going to", wanna: "want to", gotta: "got to", hafta: "have to",
  tryna: "trying to", sposta: "supposed to", supposeda: "supposed to",
  kinda: "kind of", sorta: "sort of", outta: "out of", lotta: "lot of",
  coupla: "couple of", cuppa: "cup of", dunno: "dont know",
  lemme: "let me", gimme: "give me", cuz: "because", cos: "because",
  didja: "did you", whadidja: "what did you", doncha: "dont you",
  wouldja: "would you", couldja: "could you", cudja: "could you",
  betcha: "bet you", gotcha: "got you", meetcha: "meet you",
  letcha: "let you", needja: "need you", arencha: "arent you",
  arncha: "arent you", whatcha: "what are you", whaddaya: "what do you",
  whadaya: "what do you", ain: "am not"
};

function normWord(w) {
  return w.toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[^a-z0-9']/g, "")
    .replace(/'/g, "");
}
function rawTokens(s) {
  return String(s).replace(/[‘’]/g, "'").split(/\s+/).filter(Boolean);
}

/* -> [{show, norm}] : `show` keeps the real spelling and capitalisation for
   the read-back, `norm` is what the alignment actually compares. */
function tokens(s) {
  const out = [];
  for (const raw of rawTokens(s)) {
    const key = normWord(raw);
    if (!key) continue;
    const exp = CONTRACTIONS[key];
    if (exp) for (const p of exp.split(" ")) out.push({ show: p, norm: normWord(p) });
    else out.push({ show: raw, norm: key });
  }
  return out;
}

function align(exp, got) {
  const n = exp.length, m = got.length;
  const d = [];
  for (let i = 0; i <= n; i++) { d.push(new Int32Array(m + 1)); d[i][0] = i; }
  for (let j = 0; j <= m; j++) d[0][j] = j;
  for (let i = 1; i <= n; i++)
    for (let j = 1; j <= m; j++) {
      const c = exp[i - 1] === got[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
    }
  const ops = [];
  let i = n, j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + (exp[i - 1] === got[j - 1] ? 0 : 1)) {
      ops.push(exp[i - 1] === got[j - 1] ? { t: "hit", i: i - 1 } : { t: "sub", i: i - 1, got: got[j - 1] });
      i--; j--;
    } else if (i > 0 && d[i][j] === d[i - 1][j] + 1) { ops.push({ t: "miss", i: i - 1 }); i--; }
    else { ops.push({ t: "extra", got: got[j - 1] }); j--; }
  }
  return ops.reverse();
}

/* Compares the learner's typing with the reference sentence, word by word. */
function grade(reference, typed) {
  const ref = tokens(reference);
  const exp = ref.map(t => t.norm);
  const expShow = ref.map(t => t.show);
  const got = tokens(typed).map(t => t.norm);
  const ops = align(exp, got);
  let hits = 0;
  const missed = [];
  for (const o of ops) {
    if (o.t === "hit") hits++;
    else if (o.t === "miss" || o.t === "sub") missed.push(expShow[o.i]);
  }
  return { ops, exp, expShow, hits, total: exp.length, score: exp.length ? hits / exp.length : 0, missed };
}

function diffHTML(g) {
  return g.ops.map(o => {
    if (o.t === "hit")   return `<span class="w hit">${esc(g.expShow[o.i])}</span>`;
    if (o.t === "miss")  return `<span class="w miss">${esc(g.expShow[o.i])}</span>`;
    if (o.t === "sub")   return `<span class="w sub">${esc(g.expShow[o.i])}<span class="was">${esc(o.got)}</span></span>`;
    return `<span class="w extra">${esc(o.got)}</span>`;
  }).join("");
}

/* ───────────────────────── difficulty ─────────────────────────
   Three things make a segment hard to decode, and they are independent:
   how fast it is said, how rare its words are, and how much of it is
   made of the function words English crushes between stresses.      */

function metrics(seg) {
  const tk = tokens(seg.full);
  const n = tk.length || 1;
  const dur = (seg.e != null && seg.t != null) ? Math.max(0.5, seg.e - seg.t) : null;
  const wps = dur ? n / dur : null;
  const rare = tk.filter(t => !FREQ.has(t.norm)).length / n;
  const fn = tk.filter(t => FUNCTION_WORDS.has(t.norm)).length / n;
  return { n, dur, wps, rare, fn };
}

/** 1 (posé et simple) → 5 (rapide, dense, très réduit). */
function difficulty(seg) {
  const m = metrics(seg);
  let s = 0.6;
  if (m.wps != null) s += m.wps >= 4.4 ? 2.0 : m.wps >= 3.6 ? 1.5 : m.wps >= 2.9 ? 0.9 : 0.3;
  else s += 0.9;                                   // voix de synthèse : débit connu, moyen
  s += m.rare >= 0.28 ? 1.5 : m.rare >= 0.18 ? 1.0 : m.rare >= 0.10 ? 0.5 : 0.1;
  s += m.fn >= 0.55 ? 1.2 : m.fn >= 0.45 ? 0.8 : m.fn >= 0.35 ? 0.4 : 0.1;
  s += (seg.tags && seg.tags.length >= 3) ? 0.4 : (seg.tags && seg.tags.length >= 2) ? 0.2 : 0;
  s += m.n >= 14 ? 0.4 : m.n >= 10 ? 0.2 : 0;
  return clamp(Math.round(s), 1, 5);
}

const DIFF_LABEL = { 1: "Posé", 2: "Accessible", 3: "Normal", 4: "Rapide", 5: "Très rapide" };
function diffDots(d) {
  return `<span class="dots" aria-label="Difficulté ${d} sur 5">${
    [1, 2, 3, 4, 5].map(i => `<i class="${i <= d ? "on d" + d : ""}"></i>`).join("")}</span>`;
}
function fmtTime(sec) {
  if (sec == null) return "";
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  return (h ? h + ":" + String(m).padStart(2, "0") : String(m)) + ":" + String(r).padStart(2, "0");
}

/* ───────────────────────── SRS ───────────────────────── */

function dueCards(key) {
  const k = key || dayKey();
  return S.cards.filter(c => !c.due || c.due <= k);
}
function addCard(seg, missed) {
  const exists = S.cards.find(c => c.full === seg.full);
  if (exists) { exists.lapses = (exists.lapses || 0) + 1; exists.due = dayKey(); exists.interval = 0; return exists; }
  const c = {
    id: uid(), full: seg.full, red: seg.red || "", ipa: seg.ipa || "", fr: seg.fr || "",
    tags: seg.tags || [], missed: missed || [], t: seg.t, e: seg.e, libId: seg.libId || null,
    ease: 2.4, interval: 0, due: dayKey(), reps: 0, lapses: 0, born: dayKey()
  };
  S.cards.unshift(c);
  if (S.cards.length > 900) S.cards.length = 900;
  return c;
}
function gradeCard(c, q) {
  c.reps = (c.reps || 0) + 1;
  if (q === 0) { c.ease = Math.max(1.4, (c.ease || 2.4) - 0.22); c.interval = 0; c.lapses = (c.lapses || 0) + 1; }
  else if (q === 1) { c.ease = Math.max(1.4, (c.ease || 2.4) - 0.14); c.interval = Math.max(1, Math.round((c.interval || 1) * 1.2)); }
  else if (q === 2) { c.interval = c.interval ? Math.round(c.interval * c.ease) : 2; }
  else { c.ease = Math.min(3.1, (c.ease || 2.4) + 0.14); c.interval = c.interval ? Math.round(c.interval * c.ease * 1.35) : 4; }
  c.interval = clamp(c.interval, 0, 365);
  c.due = addDays(dayKey(), Math.max(q === 0 ? 0 : 1, c.interval));
  return c;
}

/* ───────────────────────── tracking ───────────────────────── */

function today() {
  const k = dayKey();
  if (!S.days[k]) S.days[k] = { min: 0, accSum: 0, accN: 0, cards: 0, lessons: 0, words: 0 };
  return S.days[k];
}
let minuteTimer = null, activeSince = Date.now();
function startClock() {
  clearInterval(minuteTimer);
  minuteTimer = setInterval(() => {
    if (document.hidden) return;
    const d = today();
    d.min += 1;
    save(d.min % 5 !== 0);   // sync to the cloud every 5 minutes, not every tick
    if (route.view === "today") render();
  }, 60000);
}
function logDictation(score) {
  const d = today(); d.accSum += score; d.accN += 1; save();
}
function streak() {
  let n = 0, k = dayKey();
  if (!S.days[k] || !S.days[k].min) k = addDays(k, -1);
  while (S.days[k] && S.days[k].min >= 1) { n++; k = addDays(k, -1); }
  return n;
}
function accuracyOver(nDays) {
  let sum = 0, cnt = 0, k = dayKey();
  for (let i = 0; i < nDays; i++) { const d = S.days[k]; if (d) { sum += d.accSum; cnt += d.accN; } k = addDays(k, -1); }
  return cnt ? sum / cnt : null;
}

/* ───────────────────────── sources ───────────────────────── */

function allSources() {
  const out = PACKS.map(p => ({ id: "pack:" + p.id, kind: "pack", title: p.title, sub: p.sub, level: p.level, segments: p.segments }));
  for (const l of S.library) {
    const bits = [];
    if (l.hasAudio) bits.push("Audio importé");
    else if (l.yt) bits.push("YouTube");
    else bits.push("Transcription");
    if (l.accent) { const a = accentInfo(l.accent); if (a) bits.push(a.label); }
    bits.push(l.segments.length + " segments");
    out.push({
      id: "lib:" + l.id, kind: "lib", title: l.title, sub: bits.join(" · "),
      libId: l.id, yt: l.yt || "", accent: l.accent || "",
      segments: l.segments.map(s => ({ ...s, libId: l.hasAudio ? l.id : null, yt: l.yt || "", accent: l.accent || "" }))
    });
  }
  for (const p of S.aiPacks) out.push({ id: "ai:" + p.id, kind: "ai", title: p.title, sub: "Généré par Claude · " + p.segments.length + " segments", segments: p.segments });
  return out;
}

/** Advances to the next segment at or above the difficulty floor. */
function advanceIndex(src, from) {
  const floor = S.profile.minDiff || 0;
  for (let k = 1; k <= src.segments.length; k++) {
    const j = (from + k) % src.segments.length;
    if (!floor || difficulty(src.segments[j]) >= floor) return j;
  }
  return (from + 1) % src.segments.length;
}

/* Imported subtitles arrive bare — no "sounds like", no IPA, no translation.
   Claude fills them in, eight at a time, so one tap covers the next few
   segments instead of costing a call each. */
async function enrichAhead(src, from, count) {
  const item = S.library.find(l => l.id === src.libId);
  if (!item) return false;
  const idx = [];
  for (let k = 0; k < item.segments.length && idx.length < count; k++) {
    const j = (from + k) % item.segments.length;
    if (!item.segments[j].red) idx.push(j);
  }
  if (!idx.length) return false;
  const batch = idx.map(j => item.segments[j]);
  const arr = await askJSON(AI.enrich(batch), { effort: "low", schema: SCHEMA_ENRICH });
  if (!Array.isArray(arr)) throw { code: "invalid_json" };
  idx.forEach((j, k) => {
    const got = arr[k];
    if (!got) return;
    item.segments[j].red = String(got.red || "");
    item.segments[j].ipa = String(got.ipa || "");
    item.segments[j].fr = String(got.fr || "");
    item.segments[j].tags = Array.isArray(got.tags) ? got.tags : [];
  });
  save(); pushLibraryItem(item);
  return true;
}
function sourceById(id) { return allSources().find(s => s.id === id) || allSources()[0]; }

/* ───────────────────────── shell ───────────────────────── */

let route = { view: "today", param: null, sub: null };
const VIEW_NAME = { today: "Aujourd'hui", decode: "Écouter", lab: "Le Lab", review: "Réviser", write: "Écrire", settings: "Réglages", library: "Bibliothèque", path: "Parcours" };

function go(view, param, sub) {
  Player.stop();
  // entering Réviser rebuilds the queue, so cards added since last visit show up
  if (view === "review" && route.view !== "review") REV = null;
  route = { view, param: param || null, sub: sub || null };
  window.scrollTo(0, 0);
  render();
}

function toast(msg, ms) {
  const old = $(".toast"); if (old) old.remove();
  const t = document.createElement("div");
  t.className = "toast"; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), ms || 2600);
}

function sheet(html, onMount) {
  const back = document.createElement("div");
  back.className = "sheet-backdrop";
  back.innerHTML = `<div class="sheet"><div class="sheet-grab"></div>${html}</div>`;
  back.addEventListener("click", e => { if (e.target === back) close(); });
  function close() { back.remove(); }
  document.body.appendChild(back);
  onMount && onMount($(".sheet", back), close);
  return close;
}

function shell() {
  const tabs = [
    ["today", "Aujourd'hui", ICON.today],
    ["decode", "Écouter", ICON.ear],
    ["lab", "Le Lab", ICON.lab],
    ["review", "Réviser", ICON.cards],
    ["write", "Écrire", ICON.write]
  ];
  const due = dueCards().length;
  return `
  <div class="app">
    <header class="topbar" id="topbar">
      <div class="brand">
        <span class="glyph">ə</span>
        <span class="wordmark">Schwa</span>
        <span class="view-name">${esc(VIEW_NAME[route.view] || "")}</span>
      </div>
      <span class="streak-pill${streak() > 0 ? " live" : ""}" title="Jours d'affilée">🔥 ${streak()}</span>
      <button class="btn bare" id="go-settings" aria-label="Réglages">${ICON.gear}</button>
    </header>
    <main id="view"></main>
  </div>
  <nav class="tabbar">
    ${tabs.map(([id, label, icon]) => `
      <button data-tab="${id}" ${route.view === id ? 'aria-current="page"' : ""}>
        ${icon}<span>${label}</span>${id === "review" && due ? `<span class="badge">${due > 99 ? "99+" : due}</span>` : ""}
      </button>`).join("")}
  </nav>`;
}

function render() {
  const root = $("#root");
  if (!$("#view")) root.innerHTML = shell();
  else {
    // refresh chrome (streak, badge, active tab) without rebuilding the view node
    const fresh = document.createElement("div");
    fresh.innerHTML = shell();
    $(".topbar").replaceWith($(".topbar", fresh));
    $(".tabbar").replaceWith($(".tabbar", fresh));
  }
  $("#go-settings").onclick = () => go("settings");
  $$(".tabbar button").forEach(b => b.onclick = () => go(b.dataset.tab));

  const v = $("#view");
  const fn = VIEWS[route.view] || VIEWS.today;
  fn(v);
  syncMini();
}

/* Le mini-lecteur n'apparaît que sur une source YouTube, et reste masqué
   pendant la dictée : voir l'image, c'est lire les sous-titres incrustés
   et les lèvres — autrement dit tricher. Il se dévoile à la correction. */
function syncMini() {
  const src = DEC && DEC.src;
  const useYt = route.view === "decode" && src && src.yt && !Tube.blocked;
  if (!useYt) { Tube.hide(); return; }
  Tube.show(src.title);
  const wantMask = route.sub !== "echo" && !DEC.checked;
  const key = DEC.srcId + "#" + DEC.i;
  if (Tube.keyed !== key) { Tube.keyed = key; Tube.mask(wantMask); }
  else if (!wantMask && Tube.isMasked()) Tube.mask(false);
}

/* ───────────────────────── view: today ───────────────────────── */

function ringSVG(pct, label, sub) {
  const r = 32, c = 2 * Math.PI * r;
  return `<svg class="ring" viewBox="0 0 80 80" role="img" aria-label="${esc(label)} ${esc(sub)}">
    <circle class="track" cx="40" cy="40" r="${r}"/>
    <circle class="fill" cx="40" cy="40" r="${r}" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c * (1 - clamp(pct, 0, 1))).toFixed(1)}" transform="rotate(-90 40 40)"/>
    <text class="label" x="40" y="41">${esc(label)}</text>
    <text class="sub" x="40" y="52">${esc(sub)}</text>
  </svg>`;
}

function sparkSVG(values) {
  const W = 320, H = 70, pad = 16;
  const pts = values.map((v, i) => [pad + (i * (W - pad * 2)) / Math.max(1, values.length - 1), H - 8 - (clamp(v, 0, 1) * (H - 24))]);
  const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = line + ` L${pts[pts.length - 1][0].toFixed(1)} ${H - 8} L${pts[0][0].toFixed(1)} ${H - 8} Z`;
  const last = pts[pts.length - 1];
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Précision de dictée">
    <line class="grid" x1="${pad}" y1="${H - 8 - (H - 24)}" x2="${W - pad}" y2="${H - 8 - (H - 24)}"/>
    <line class="grid" x1="${pad}" y1="${H - 8 - 0.5 * (H - 24)}" x2="${W - pad}" y2="${H - 8 - 0.5 * (H - 24)}"/>
    <path class="area" d="${area}"/>
    <path class="line" d="${line}"/>
    <circle class="endcap" cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="4"/>
    <text x="${pad}" y="${H - 8 - (H - 24) - 3}">100%</text>
    <text x="${pad}" y="${H - 8 - 0.5 * (H - 24) - 3}">50%</text>
  </svg>`;
}

function nextAction() {
  const due = dueCards().length;
  const d = today();
  if (due >= 5) return { view: "review", eyebrow: "D'abord", title: `Réviser ${due} carte${due > 1 ? "s" : ""}`, why: "Les phrases que tu as ratées reviennent au bon moment. C'est là que ça s'ancre." };
  const nextLesson = LESSONS.find(l => !(S.lab[l.id] && S.lab[l.id].done));
  if (nextLesson && d.accN === 0 && Math.random() < 0.5) return { view: "lab", param: nextLesson.id, eyebrow: "Nouveau pattern", title: nextLesson.title, why: nextLesson.sub };
  if (d.accN < 6) return { view: "decode", eyebrow: "Séance du jour", title: "Dictée", why: "6 segments. Tape ce que tu entends, mot pour mot." };
  if (due) return { view: "review", eyebrow: "Encore", title: `Réviser ${due} carte${due > 1 ? "s" : ""}`, why: "Il reste des cartes dues aujourd'hui." };
  if (nextLesson) return { view: "lab", param: nextLesson.id, eyebrow: "Nouveau pattern", title: nextLesson.title, why: nextLesson.sub };
  return { view: "write", eyebrow: "Pour finir", title: "Écrire 80 mots", why: "Claude corrige et te sort le point de grammaire à travailler." };
}

const VIEWS = {};

VIEWS.today = function (v) {
  const d = today();
  const goal = S.profile.goalMin || 15;
  const na = nextAction();
  const acc7 = accuracyOver(7);
  const days14 = [];
  for (let i = 13; i >= 0; i--) { const k = addDays(dayKey(), -i); days14.push(S.days[k] || null); }
  const maxMin = Math.max(goal, ...days14.map(x => (x && x.min) || 0));
  const accSeries = days14.map(x => (x && x.accN) ? x.accSum / x.accN : null);
  let lastKnown = accSeries.find(x => x != null) || 0;
  const filled = accSeries.map(x => { if (x != null) lastKnown = x; return lastKnown; });
  const hasAcc = accSeries.some(x => x != null);
  const totalMin = Object.values(S.days).reduce((a, b) => a + (b.min || 0), 0);
  const done = LESSONS.filter(l => S.lab[l.id] && S.lab[l.id].done).length;

  v.innerHTML = `
  <div class="stack-l">
    <section class="stack">
      <div class="hero-goal">
        ${ringSVG(d.min / goal, d.min + "′", "SUR " + goal)}
        <div class="stack-s">
          <h1 style="font-size:26px">${d.min >= goal ? "Objectif atteint." : d.min > 0 ? "Tu es lancé." : "On commence ?"}</h1>
          <p class="small muted">${d.min >= goal
            ? "Tout ce que tu fais en plus est du bonus."
            : `Encore ${goal - d.min} minute${goal - d.min > 1 ? "s" : ""} pour tenir la série.`}</p>
        </div>
      </div>

      <button class="next-up" id="next-up">
        <span class="eyebrow">${esc(na.eyebrow)}</span>
        <h3>${esc(na.title)}</h3>
        <p>${esc(na.why)}</p>
      </button>

      <div class="stat-row">
        <div class="stat"><div class="v">${streak()}</div><div class="k">jours d'affilée</div></div>
        <div class="stat"><div class="v">${acc7 == null ? "—" : Math.round(acc7 * 100) + "%"}</div><div class="k">précision 7 j</div></div>
        <div class="stat"><div class="v">${S.cards.length}</div><div class="k">phrases suivies</div></div>
      </div>
    </section>

    <section class="stack">
      <div class="section-head"><h2>Les autres ateliers</h2></div>
      <div class="stack-s">
        <button class="lesson-item" id="go-shadow">
          <span class="num">${ICON.mic}</span>
          <span class="grow"><span class="t">Shadowing</span><span class="d">Répéter par-dessus le modèle, sur une échelle de vitesse allant de 0,5× à 1,25×</span></span>
        </button>
        <button class="lesson-item" id="go-path">
          <span class="num">✦</span>
          <span class="grow"><span class="t">Le parcours</span><span class="d">Quoi écouter, dans quel ordre — sources vérifiées et critères pour juger une série</span></span>
        </button>
        <button class="lesson-item" id="go-lib">
          <span class="num">▶</span>
          <span class="grow"><span class="t">Importer une vidéo ou un épisode</span><span class="d">${S.library.length ? S.library.length + " source" + (S.library.length > 1 ? "s" : "") + " dans ta bibliothèque" : "Transcription YouTube ou sous-titres .srt — la vraie parole, pas la synthèse"}</span></span>
        </button>
      </div>
    </section>

    <section class="stack">
      <div class="section-head"><h2>Précision de dictée</h2><span class="eyebrow">14 jours</span></div>
      <div class="card">
        ${hasAcc ? sparkSVG(filled) : `<p class="small muted" style="padding:14px 2px">Fais ta première dictée : la courbe démarre là. C'est le seul chiffre qui compte vraiment — le pourcentage de mots que ton oreille attrape sans les voir.</p>`}
      </div>
    </section>

    <section class="stack">
      <div class="section-head"><h2>Minutes par jour</h2><span class="eyebrow">objectif ${goal}′</span></div>
      <div class="card">
        <div class="bars">
          ${days14.map((x, i) => {
            const m = (x && x.min) || 0;
            const h = Math.round((m / maxMin) * 100);
            return `<div class="b ${m === 0 ? "zero" : ""} ${i === 13 ? "today" : ""}" style="height:${Math.max(3, h)}%" title="${m} min"></div>`;
          }).join("")}
        </div>
        <div class="spread tiny muted" style="margin-top:8px">
          <span>il y a 14 j</span><span class="mono">${totalMin} min au total</span><span>aujourd'hui</span>
        </div>
      </div>
    </section>

    <section class="stack">
      <div class="section-head"><h2>Les 8 patterns</h2><span class="eyebrow">${done}/8</span></div>
      <div class="card flat">
        <p class="small muted">Chaque leçon du Lab explique une des huit raisons pour lesquelles l'anglais parlé ne ressemble pas à l'anglais écrit. Tant que ces huit-là ne sont pas automatiques, la dictée restera dure.</p>
        <div class="pill-row" style="margin-top:12px">
          ${LESSONS.map(l => `<span class="chip ${S.lab[l.id] && S.lab[l.id].done ? "ok" : ""}">${esc(l.title)}</span>`).join("")}
        </div>
      </div>
    </section>

    <section class="stack">
      <div class="card flat">
        <span class="eyebrow">Pourquoi « Schwa »</span>
        <p class="small muted" style="margin-top:8px">Le schwa <span class="mono" style="color:var(--accent)">/ə/</span> est la voyelle neutre sur laquelle l'anglais écrase tous ses mots non accentués. Le français ne fait pas ça. C'est, très littéralement, le son qui te sépare de la compréhension.</p>
      </div>
    </section>
  </div>`;

  $("#next-up").onclick = () => go(na.view, na.param);
  $("#go-shadow").onclick = () => go("decode", null, "echo");
  $("#go-lib").onclick = () => go("library");
  $("#go-path").onclick = () => go("path");
};

/* ───────────────────────── view: decode ───────────────────────── */

let DEC = null;   // session state

function newSession(srcId) {
  const src = sourceById(srcId);
  const start = S.packProgress[src.id] || 0;
  DEC = {
    srcId: src.id, src, i: start % src.segments.length,
    typed: "", listens: 0, rate: 1, checked: null, playing: false,
    explain: null, explaining: false, doneCount: 0,
    accent: pickAccent(), enriching: false
  };
}

VIEWS.decode = function (v) {
  if (route.sub === "echo") return VIEWS_echo(v);
  if (!DEC || (route.param && DEC.srcId !== route.param)) newSession(route.param);
  const src = DEC.src;
  if (!src || !src.segments.length) { v.innerHTML = `<div class="empty">Aucune source disponible.</div>`; return; }
  const seg = src.segments[DEC.i];
  const g = DEC.checked;

  v.innerHTML = `
  <div class="stack-l">
    <section class="stack">
      <div class="spread">
        <button class="chip pick" id="pick-src"><span class="lbl">Source</span> ${esc(src.title)} ▾</button>
        <span class="mono tiny muted">${DEC.queue
          ? "ciblé " + (DEC.qi + 1) + " / " + DEC.queue.length
          : (DEC.i + 1) + " / " + src.segments.length}</span>
      </div>
      <div class="row" style="gap:6px">
        <div class="row-tight" style="gap:4px">
          <button class="chip on" data-mode="dictee">Dictée</button>
          <button class="chip" data-mode="echo">Shadowing</button>
        </div>
        <button class="chip" id="best-moments" title="Les passages qui t'apprendront le plus">✦ Meilleurs moments</button>
        <button class="chip" id="pick-diff" title="Filtre de difficulté">${S.profile.minDiff ? diffDots(S.profile.minDiff) + " et +" : "Tous niveaux"} ▾</button>
      </div>
    </section>

    <section class="stack">
      <div class="player">
        <button class="play-btn ${DEC.playing ? "playing" : ""}" id="play" aria-label="Écouter">${DEC.playing ? ICON.stop : ICON.play}</button>
        <div class="grow">
          <div class="wave ${DEC.playing ? "active" : ""}">${Array.from({ length: 28 }, (_, i) => `<i style="height:${18 + Math.round(Math.abs(Math.sin(i * 1.7 + DEC.i)) * 16)}px;animation-delay:${(i * 0.045).toFixed(2)}s"></i>`).join("")}</div>
          <div class="spread" style="margin-top:8px">
            <span class="listen-count">${DEC.listens} ÉCOUTE${DEC.listens > 1 ? "S" : ""}</span>
            <div class="speed-group">
              ${[0.5, 0.75, 1].map(r => `<button data-rate="${r}" class="${DEC.rate === r ? "on" : ""}">${r === 1 ? "1×" : String(r).replace(".", ",") + "×"}</button>`).join("")}
            </div>
          </div>
        </div>
      </div>
      <div class="spread">
        <span class="row-tight tiny muted">${diffDots(difficulty(seg))} ${esc(DIFF_LABEL[difficulty(seg)])}${
          metrics(seg).wps ? ` · <span class="mono">${metrics(seg).wps.toFixed(1)} mots/s</span>` : ""}</span>
        ${seg.yt && seg.t != null
          ? `<a class="chip" target="_blank" rel="noopener" href="https://www.youtube.com/watch?v=${esc(seg.yt)}&t=${Math.max(0, Math.floor(seg.t))}s">▶ YouTube ${fmtTime(seg.t)}</a>`
          : ""}
      </div>
      ${!Speech.available() && !seg.libId && !seg.yt ? `<p class="tiny" style="color:var(--warn)">La synthèse vocale n'est pas disponible dans ce navigateur. Importe un audio ou une vidéo YouTube.</p>` : ""}
      ${seg.yt && !seg.libId && !Tube.unlocked && !Tube.blocked ? `
        <div class="yt-hint">
          <span class="grow">La vidéo doit être déverrouillée une fois par session — iOS exige un premier appui.</span>
          <button class="btn sm primary" id="yt-unlock">Charger</button>
        </div>` : ""}
      ${Tube.blocked ? `<p class="tiny" style="color:var(--warn)">Le lecteur YouTube n'a pas pu se charger. La voix de synthèse prend le relais.</p>` : ""}
    </section>

    ${g ? renderResult(g, seg) : `
    <section class="stack">
      <label class="eyebrow" for="typed">Tape exactement ce que tu entends</label>
      <textarea id="typed" class="type-area" placeholder="Écoute d'abord. Puis écris, même incomplet — les trous sont l'information utile." autocapitalize="off" autocorrect="off" spellcheck="false">${esc(DEC.typed)}</textarea>
      <div class="row">
        <button class="btn primary grow" id="check" ${DEC.typed.trim() ? "" : "disabled"}>Vérifier</button>
        <button class="btn ghost" id="skip">Je sèche</button>
      </div>
      <p class="tiny muted">Écris « gonna », « wanna », « didja » si c'est ce que tu entends — c'est accepté, la forme écrite complète aussi.</p>
    </section>`}
  </div>`;

  $("#pick-src").onclick = openSourcePicker;
  $$("[data-mode]").forEach(b => b.onclick = () => go("decode", DEC.srcId, b.dataset.mode === "echo" ? "echo" : null));
  $$("[data-rate]").forEach(b => b.onclick = () => { DEC.rate = parseFloat(b.dataset.rate); render(); });

  $("#pick-diff").onclick = openDifficultyPicker;
  $("#best-moments").onclick = openBestMoments;
  const unl = $("#yt-unlock");
  if (unl) unl.onclick = async () => {
    unl.disabled = true; unl.innerHTML = '<span class="spinner"></span>';
    try { await Tube.unlock(seg.yt); } catch (e) { Tube.blocked = true; }
    render();
  };

  $("#play").onclick = () => {
    if (DEC.playing) { Player.stop(); DEC.playing = false; render(); return; }
    DEC.playing = true; DEC.listens++;
    render();
    Player.play(seg, DEC.rate, seg.libId, () => { DEC.playing = false; if (route.view === "decode") render(); }, seg.accent || DEC.accent);
  };

  const ta = $("#typed");
  if (ta) {
    ta.oninput = () => {
      DEC.typed = ta.value;
      const c = $("#check"); if (c) c.disabled = !ta.value.trim();
    };
    ta.onkeydown = e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); doCheck(); } };
  }
  const chk = $("#check"); if (chk) chk.onclick = doCheck;
  const skip = $("#skip"); if (skip) skip.onclick = () => { DEC.typed = DEC.typed || " "; doCheck(); };

  wireResult(seg);

  function doCheck() {
    Player.stop(); DEC.playing = false;
    DEC.checked = grade(seg.full, DEC.typed);
    logDictation(DEC.checked.score);
    if (DEC.checked.score < 0.85) addCard({ ...seg, libId: seg.libId }, DEC.checked.missed);
    save();
    render();
  }
};

function renderResult(g, seg) {
  const pct = Math.round(g.score * 100);
  const cls = pct >= 85 ? "" : pct >= 55 ? "mid" : "low";
  const tags = (seg.tags || []).filter(t => PATTERN_LABEL[t]);
  const acc = accentInfo(seg.accent || DEC.accent);   // revealed only now: the ear had to cope blind
  return `
  <section class="stack">
    <div class="spread">
      <span class="eyebrow">Résultat</span>
      <span class="mono" style="font-size:19px;color:${pct >= 85 ? "var(--ok)" : pct >= 55 ? "var(--warn)" : "var(--bad)"}">${pct}%</span>
    </div>
    <div class="score-bar ${cls}"><i style="width:${pct}%"></i></div>
    <div class="card"><div class="diff">${diffHTML(g)}</div></div>
    <p class="tiny muted">
      <span class="w hit" style="background:var(--surface-2)">mot</span> attrapé ·
      <span class="w miss">mot</span> raté ·
      <span class="w sub">mot<span class="was">ce que tu as écrit</span></span> ·
      <span class="w extra">mot</span> en trop
    </p>
  </section>

  <section class="stack">
    <div class="spread">
      <span class="eyebrow">Ce qui a vraiment été prononcé</span>
      ${acc ? `<span class="chip" title="${esc(acc.note)}">${esc(acc.flag)} ${esc(acc.label)}</span>` : ""}
    </div>
    ${seg.red ? `
      <div class="reveal-block stack-s">
        <p class="sounds-like">${esc(seg.red)}</p>
        ${seg.ipa ? `<p class="ipa">/${esc(seg.ipa)}/</p>` : ""}
        ${seg.fr ? `<p class="small muted">${esc(seg.fr)}</p>` : ""}
      </div>` : `
      <div class="reveal-block stack-s">
        <p class="small muted">Ce segment vient d'un import : il n'a pas encore sa forme réduite ni sa traduction.</p>
        ${aiAvailable() ? `<button class="btn ghost sm" id="enrich" ${DEC.enriching ? "disabled" : ""} style="align-self:flex-start">${DEC.enriching ? '<span class="spinner"></span> Claude analyse…' : "Analyser ce passage (8 segments)"}</button>` : ""}
      </div>`}
    ${tags.length ? `<div class="pill-row">${tags.map(t => `<button class="pattern-tag" data-lesson="${t}">${esc(PATTERN_LABEL[t])} ↗</button>`).join("")}</div>` : ""}
    ${DEC.explain ? `<div class="plate small">${esc(DEC.explain)}</div>` : ""}
    ${g.missed.length && aiAvailable() && !DEC.explain ? `<button class="btn ghost sm" id="why" ${DEC.explaining ? "disabled" : ""}>${DEC.explaining ? '<span class="spinner"></span>Claude analyse…' : "Pourquoi je ne l'ai pas entendu ?"}</button>` : ""}
  </section>

  <section class="stack">
    <div class="row">
      <button class="btn ghost" id="replay">${ICON.play} Réécouter</button>
      <button class="btn ghost" id="to-echo">${ICON.mic} Répéter</button>
      ${g.score >= 0.85 ? `<button class="btn ghost sm" id="force-card">Ajouter aux révisions</button>` : `<span class="chip ok">${ICON.check} Ajoutée aux révisions</span>`}
    </div>
    <button class="btn primary big block" id="next">Segment suivant</button>
  </section>`;
}

function wireResult(seg) {
  const r = $("#replay"); if (r) r.onclick = () => { DEC.listens++; Player.play(seg, DEC.rate, seg.libId, () => {}, seg.accent || DEC.accent); };
  const n = $("#next"); if (n) n.onclick = () => {
    if (DEC.queue) {
      DEC.qi++;
      if (DEC.qi >= DEC.queue.length) {
        DEC.queue = null; DEC.qi = 0;
        toast("Séance ciblée terminée");
        DEC.i = advanceIndex(DEC.src, DEC.i);
      } else DEC.i = DEC.queue[DEC.qi];
    } else DEC.i = advanceIndex(DEC.src, DEC.i);
    S.packProgress[DEC.srcId] = DEC.i;
    DEC.typed = ""; DEC.listens = 0; DEC.checked = null; DEC.explain = null; DEC.doneCount++;
    DEC.accent = pickAccent();
    save(); render();
    window.scrollTo(0, 0);
  };
  const en = $("#enrich"); if (en) en.onclick = async () => {
    DEC.enriching = true; render();
    try {
      await enrichAhead(DEC.src, DEC.i, 8);
      DEC.src = sourceById(DEC.srcId);
      toast("Phonétique ajoutée pour les 8 prochains segments");
    } catch (e) { toast(aiErrorMessage(e)); }
    DEC.enriching = false; render();
  };
  const fc = $("#force-card"); if (fc) fc.onclick = () => { addCard(seg, []); save(); toast("Ajoutée aux révisions"); fc.outerHTML = `<span class="chip ok">Ajoutée</span>`; };
  const te = $("#to-echo"); if (te) te.onclick = () => go("decode", DEC.srcId, "echo");
  $$("[data-lesson]").forEach(b => b.onclick = () => go("lab", b.dataset.lesson));
  const why = $("#why");
  if (why) why.onclick = async () => {
    DEC.explaining = true; render();
    try {
      const res = await ask(AI.explainMiss(seg, DEC.checked.missed), { effort: "low", maxTokens: 900 });
      DEC.explain = res.text.trim();
    } catch (e) { toast(aiErrorMessage(e)); }
    DEC.explaining = false; render();
  };
}

function openSourcePicker() {
  const srcs = allSources();
  const close = sheet(`
    <h2 style="font-size:19px;margin-bottom:4px">Source</h2>
    <p class="small muted" style="margin-bottom:14px">Les packs de départ sont lus par la voix de synthèse. Un audio importé, lui, te donne de la vraie parole — c'est nettement plus dur, et nettement plus utile.</p>
    <div class="stack-s">
      ${srcs.map(s => `<button class="lesson-item" data-src="${esc(s.id)}">
        <span class="num">${s.kind === "pack" ? "▤" : s.kind === "lib" ? "♪" : "✦"}</span>
        <span class="grow"><span class="t">${esc(s.title)}</span><span class="d">${esc(s.sub || "")}</span></span>
      </button>`).join("")}
    </div>
    <hr class="rule" style="margin:16px 0">
    <div class="stack-s">
      <button class="btn ghost block" id="add-lib">${ICON.plus} Importer une transcription ou un audio</button>
      ${aiAvailable() ? `<button class="btn ghost block" id="gen-pack">${ICON.spark} Générer un pack avec Claude</button>` : ""}
    </div>
  `, (root, close) => {
    $$("[data-src]", root).forEach(b => b.onclick = () => { close(); newSession(b.dataset.src); go("decode", b.dataset.src); });
    $("#add-lib", root).onclick = () => { close(); go("library"); };
    const gp = $("#gen-pack", root); if (gp) gp.onclick = () => { close(); openGenerator(); };
  });
}

function openGenerator() {
  sheet(`
    <h2 style="font-size:19px">Générer un pack</h2>
    <p class="small muted" style="margin:6px 0 14px">Claude écrit des phrases d'anglais parlé sur le thème de ton choix, avec les réductions expliquées. Compte une vingtaine de secondes.</p>
    <div class="stack">
      <div class="field"><label for="gen-topic">Thème</label>
        <input type="text" id="gen-topic" value="a normal day at the office" placeholder="ex. arguing about football"></div>
      <div class="field"><label for="gen-n">Nombre de phrases</label>
        <select id="gen-n"><option>10</option><option selected>16</option><option>24</option></select></div>
      <div class="field"><label for="gen-lvl">Niveau</label>
        <select id="gen-lvl"><option>B1</option><option selected>B1–B2</option><option>B2</option><option>B2–C1</option></select></div>
      <button class="btn primary block" id="gen-go">${ICON.spark} Générer</button>
      <div id="gen-status"></div>
    </div>
  `, (root, close) => {
    $("#gen-go", root).onclick = async () => {
      const topic = $("#gen-topic", root).value.trim() || "everyday conversation";
      const n = parseInt($("#gen-n", root).value, 10);
      const lvl = $("#gen-lvl", root).value;
      const btn = $("#gen-go", root); btn.disabled = true;
      $("#gen-status", root).innerHTML = `<div class="row-tight small muted"><span class="spinner"></span> Claude écrit ${n} phrases…</div>`;
      try {
        const arr = await askJSON(AI.dictationPack(lvl, topic, n), { effort: "low", schema: SCHEMA_SEGMENTS });
        const segs = (Array.isArray(arr) ? arr : []).filter(x => x && x.full).map(x => ({
          full: String(x.full), red: String(x.red || ""), ipa: String(x.ipa || ""),
          fr: String(x.fr || ""), tags: Array.isArray(x.tags) ? x.tags : []
        }));
        if (!segs.length) throw { code: "invalid_json" };
        const pack = { id: uid(), title: topic.slice(0, 44), segments: segs, at: Date.now() };
        S.aiPacks.push(pack);
        if (S.aiPacks.length > 12) S.aiPacks.shift();
        save();
        close();
        newSession("ai:" + pack.id);
        go("decode", "ai:" + pack.id);
        toast(segs.length + " phrases prêtes");
      } catch (e) {
        btn.disabled = false;
        $("#gen-status", root).innerHTML = `<p class="small" style="color:var(--bad)">${esc(aiErrorMessage(e))}</p>`;
      }
    };
  });
}

/* ───────────────────────── view: echo (shadowing) ───────────────────────── */

function openDifficultyPicker() {
  const src = DEC && DEC.src;
  const counts = [0, 0, 0, 0, 0, 0];
  if (src) for (const s of src.segments) counts[difficulty(s)]++;
  sheet(`
    <h2 style="font-size:19px">Filtre de difficulté</h2>
    <p class="small muted" style="margin:6px 0 14px">La difficulté est calculée sur trois choses : le débit réel en mots par seconde, la rareté du vocabulaire, et la densité de mots-outils — ceux que l'anglais écrase entre les temps forts.</p>
    <div class="stack-s">
      <button class="lesson-item ${!S.profile.minDiff ? "done" : ""}" data-diff="0">
        <span class="num">∞</span>
        <span class="grow"><span class="t">Tous niveaux</span><span class="d">Dans l'ordre de la source</span></span>
      </button>
      ${[2, 3, 4, 5].map(d => `
        <button class="lesson-item ${S.profile.minDiff === d ? "done" : ""}" data-diff="${d}">
          <span class="num">${d}</span>
          <span class="grow"><span class="t">${esc(DIFF_LABEL[d])} et au-dessus</span><span class="d">${src ? counts.slice(d).reduce((a, b) => a + b, 0) + " segments dans cette source" : ""}</span></span>
          ${diffDots(d)}
        </button>`).join("")}
    </div>
    <p class="tiny muted" style="margin-top:14px">Vise la zone où tu attrapes 60 à 75 % des mots. Au-dessus de 90 %, tu ne progresses plus : monte d'un cran.</p>
  `, (root, close) => {
    $$("[data-diff]", root).forEach(b => b.onclick = () => {
      S.profile.minDiff = parseInt(b.dataset.diff, 10);
      save(); close(); render();
    });
  });
}

/* Shadowing: you speak WITH the model, not after it. The ladder starts slow
   enough that your mouth can actually keep up, then closes on real speed. */

const RUNGS = [
  { rate: 0.50, need: 2, label: "0,5×",  why: "Décomposer : chaque syllabe est audible." },
  { rate: 0.75, need: 3, label: "0,75×", why: "Installer le rythme sans te presser." },
  { rate: 1.00, need: 3, label: "1×",    why: "Vitesse réelle." },
  { rate: 1.25, need: 2, label: "1,25×", why: "Au-dessus du réel : la marge de sécurité." }
];

let ECHO = { rec: null, chunks: [], url: null, recording: false, heard: null,
             scoring: false, playing: false, rung: 0, reps: 0, loop: false, segKey: "" };

function resetEcho(key) {
  if (ECHO.url) { URL.revokeObjectURL(ECHO.url); }
  ECHO = { rec: null, chunks: [], url: null, recording: false, heard: null,
           scoring: false, playing: false, rung: 0, reps: 0, loop: ECHO.loop, segKey: key };
}

function VIEWS_echo(v) {
  if (!DEC) newSession(route.param);
  const src = DEC.src;
  const seg = src.segments[DEC.i];
  const key = DEC.srcId + "#" + DEC.i;
  if (ECHO.segKey !== key) resetEcho(key);
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const rung = RUNGS[ECHO.rung];
  const acc = accentInfo(seg.accent || DEC.accent);
  const laddered = ECHO.rung >= RUNGS.length - 1 && ECHO.reps >= rung.need;

  v.innerHTML = `
  <div class="stack-l">
    <section class="stack">
      <div class="spread">
        <button class="chip pick" id="pick-src"><span class="lbl">Source</span> ${esc(src.title)} ▾</button>
        <span class="mono tiny muted">${DEC.i + 1} / ${src.segments.length}</span>
      </div>
      <div class="row-tight" style="gap:4px">
        <button class="chip" data-mode="dictee">Dictée</button>
        <button class="chip on" data-mode="echo">Shadowing</button>
      </div>
    </section>

    <section class="stack">
      <div class="card stack-s">
        <div class="spread">
          <span class="row-tight tiny muted">${diffDots(difficulty(seg))} ${esc(DIFF_LABEL[difficulty(seg)])}</span>
          ${acc ? `<span class="chip">${esc(acc.flag)} ${esc(acc.label)}</span>` : ""}
        </div>
        <p style="font-size:19px;line-height:1.42">${esc(seg.full)}</p>
        ${seg.red ? `<p class="sounds-like">${esc(seg.red)}</p>` : ""}
        ${seg.ipa ? `<p class="ipa">/${esc(seg.ipa)}/</p>` : ""}
        ${seg.fr ? `<p class="small muted">${esc(seg.fr)}</p>` : ""}
        ${seg.yt && seg.t != null
          ? `<a class="chip" style="align-self:flex-start" target="_blank" rel="noopener" href="https://www.youtube.com/watch?v=${esc(seg.yt)}&t=${Math.max(0, Math.floor(seg.t))}s">▶ Voir sur YouTube ${fmtTime(seg.t)}</a>`
          : ""}
      </div>
      <p class="small muted">Parle <em>en même temps</em> que le modèle, pas après. Ne cherche pas à bien articuler : copie le rythme, les temps forts, et les mots écrasés entre eux.</p>
    </section>

    <section class="stack">
      <div class="section-head"><h2>L'échelle de vitesse</h2><span class="eyebrow">${ECHO.rung + 1}/${RUNGS.length}</span></div>
      <div class="ladder">
        ${RUNGS.map((r, i) => `
          <div class="rung ${i < ECHO.rung ? "done" : i === ECHO.rung ? "now" : ""}">
            <span class="mono">${esc(r.label)}</span>
            <span class="reps">${i < ECHO.rung ? "✓" : i === ECHO.rung ? ECHO.reps + "/" + r.need : r.need + "×"}</span>
          </div>`).join("")}
      </div>
      <p class="tiny muted">${laddered ? "Échelle terminée. Passe au segment suivant." : esc(rung.why)}</p>

      <button class="btn primary big block" id="shadow" ${ECHO.playing ? "disabled" : ""}>
        ${ECHO.playing ? `<span class="spinner"></span> En cours…` : `${ICON.play} Écouter et répéter — ${esc(rung.label)}`}
      </button>
      <div class="row">
        <button class="chip ${ECHO.loop ? "on" : ""}" id="loop">Boucle ×3</button>
        ${ECHO.rung > 0 ? `<button class="btn sm bare" id="rung-down">Redescendre d'un cran</button>` : ""}
        ${!laddered ? `<button class="btn sm bare" id="rung-up">Monter d'un cran</button>` : ""}
      </div>
    </section>

    <section class="stack">
      <span class="eyebrow">Ta voix</span>
      <div class="row">
        <button class="btn ${ECHO.recording ? "hot" : "ghost"} grow" id="rec">
          ${ECHO.recording ? `<span class="rec-dot"></span> Arrêter` : `${ICON.mic} Enregistrer`}
        </button>
        ${ECHO.url ? `<button class="btn ghost" id="playback">${ICON.play} Ma version</button>` : ""}
      </div>
      ${ECHO.url ? `<button class="btn ghost sm block" id="ab">Comparer : modèle puis moi</button>` : ""}
      ${SR ? `<button class="btn ghost block" id="score" ${ECHO.scoring ? "disabled" : ""}>${ECHO.scoring ? `<span class="spinner"></span> J'écoute…` : "Me faire noter — dis la phrase"}</button>` : ""}
      ${ECHO.heard ? renderEchoScore(ECHO.heard, seg) : ""}
      ${!SR ? `<p class="tiny muted">Ce navigateur ne transcrit pas la voix. Compare à l'oreille avec le bouton ci-dessus — Safari sur iPhone, lui, sait noter.</p>` : ""}
    </section>

    <button class="btn primary block" id="next-seg">Segment suivant</button>
  </div>`;

  $("#pick-src").onclick = openSourcePicker;
  $$("[data-mode]").forEach(b => b.onclick = () => go("decode", DEC.srcId, b.dataset.mode === "echo" ? "echo" : null));
  $("#loop").onclick = () => { ECHO.loop = !ECHO.loop; render(); };

  const up = $("#rung-up");   if (up) up.onclick = () => { ECHO.rung = Math.min(RUNGS.length - 1, ECHO.rung + 1); ECHO.reps = 0; render(); };
  const dn = $("#rung-down"); if (dn) dn.onclick = () => { ECHO.rung = Math.max(0, ECHO.rung - 1); ECHO.reps = 0; render(); };

  $("#shadow").onclick = () => runShadow(seg, ECHO.loop ? 3 : 1);

  $("#next-seg").onclick = () => {
    DEC.i = advanceIndex(src, DEC.i);
    DEC.accent = pickAccent();
    S.packProgress[DEC.srcId] = DEC.i;
    resetEcho(DEC.srcId + "#" + DEC.i);
    save(); render(); window.scrollTo(0, 0);
  };

  const pb = $("#playback"); if (pb) pb.onclick = () => { const a = new Audio(ECHO.url); a.play(); };
  const ab = $("#ab"); if (ab) ab.onclick = () => {
    Player.play(seg, rung.rate, seg.libId, () => {
      setTimeout(() => { const a = new Audio(ECHO.url); a.play(); }, 450);
    }, seg.accent || DEC.accent);
  };
  $("#rec").onclick = toggleRecord;
  const sc = $("#score"); if (sc) sc.onclick = () => scoreSpeech(seg, SR);

  function runShadow(segment, times) {
    ECHO.playing = true; render();
    let left = times;
    const once = () => {
      Player.play(segment, rung.rate, segment.libId, () => {
        left--;
        if (left > 0) { setTimeout(once, 500); return; }
        ECHO.playing = false;
        ECHO.reps = Math.min(rung.need, ECHO.reps + times);
        if (ECHO.reps >= rung.need && ECHO.rung < RUNGS.length - 1) { ECHO.rung++; ECHO.reps = 0; }
        today().min += 0;
        if (route.sub === "echo") render();
      }, segment.accent || DEC.accent);
    };
    once();
  }

  async function toggleRecord() {
    if (ECHO.recording) { try { ECHO.rec.stop(); } catch (e) {} return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const types = ["audio/webm", "audio/mp4", "audio/ogg"];
      const mt = types.find(t => window.MediaRecorder && MediaRecorder.isTypeSupported(t));
      ECHO.rec = new MediaRecorder(stream, mt ? { mimeType: mt } : undefined);
      ECHO.chunks = [];
      ECHO.rec.ondataavailable = e => { if (e.data.size) ECHO.chunks.push(e.data); };
      ECHO.rec.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        if (ECHO.url) URL.revokeObjectURL(ECHO.url);
        ECHO.url = URL.createObjectURL(new Blob(ECHO.chunks, { type: ECHO.chunks[0] ? ECHO.chunks[0].type : "audio/webm" }));
        ECHO.recording = false; render();
      };
      ECHO.rec.start();
      ECHO.recording = true; render();
    } catch (e) {
      toast("Micro refusé ou indisponible.");
    }
  }
}
function scoreSpeech(seg, SR) {
  const r = new SR();
  r.lang = S.profile.accent || "en-US";
  r.interimResults = false;
  r.maxAlternatives = 1;
  ECHO.scoring = true; ECHO.heard = null; render();
  r.onresult = e => { ECHO.heard = e.results[0][0].transcript; };
  r.onerror = () => { toast("Je n'ai rien capté. Réessaie plus près du micro."); };
  r.onend = () => { ECHO.scoring = false; render(); };
  try { r.start(); } catch (e) { ECHO.scoring = false; toast("Reconnaissance vocale indisponible."); render(); }
}

function renderEchoScore(heard, seg) {
  const g = grade(seg.full, heard);
  const pct = Math.round(g.score * 100);
  return `<div class="stack-s" style="margin-top:6px">
    <div class="spread"><span class="eyebrow">Ce que la machine a entendu</span><span class="mono" style="color:${pct >= 80 ? "var(--ok)" : pct >= 50 ? "var(--warn)" : "var(--bad)"}">${pct}%</span></div>
    <div class="card"><div class="diff">${diffHTML(g)}</div></div>
    <p class="tiny muted">${pct >= 80 ? "Assez clair pour être transcrit correctement. Passe à la vitesse supérieure." : "Les mots en rouge n'ont pas été reconnus — c'est souvent une voyelle trop « française » ou une consonne finale avalée."}</p>
  </div>`;
}

/* ───────────────────────── view: lab ───────────────────────── */

let LABD = null;

VIEWS.lab = function (v) {
  if (route.param) return labLesson(v, route.param);
  const doneN = LESSONS.filter(l => S.lab[l.id] && S.lab[l.id].done).length;
  v.innerHTML = `
  <div class="stack-l">
    <section class="stack">
      <h1 style="font-size:26px">Les huit raisons</h1>
      <p class="small muted">Huit mécanismes transforment l'anglais écrit en anglais parlé. Ils ne sont ni du relâchement ni de l'argot : ce sont des règles, et elles s'apprennent. Une fois les huit intégrés, la dictée cesse d'être une devinette.</p>
      <div class="row-tight"><div class="score-bar grow"><i style="width:${(doneN / LESSONS.length) * 100}%"></i></div><span class="mono tiny">${doneN}/8</span></div>
    </section>
    <section class="stack-s">
      ${LESSONS.map((l, i) => {
        const st = S.lab[l.id];
        return `<button class="lesson-item ${st && st.done ? "done" : ""}" data-l="${l.id}">
          <span class="num">${st && st.done ? "✓" : i + 1}</span>
          <span class="grow"><span class="t">${esc(l.title)}</span><span class="d">${esc(l.sub)}</span></span>
          ${st && st.done ? `<span class="mono tiny" style="color:var(--ok)">${Math.round(st.score * 100)}%</span>` : ""}
        </button>`;
      }).join("")}
    </section>
  </div>`;
  $$("[data-l]").forEach(b => b.onclick = () => go("lab", b.dataset.l));
};

function labLesson(v, id) {
  const l = LESSONS.find(x => x.id === id) || LESSONS[0];
  if (!LABD || LABD.id !== l.id) LABD = { id: l.id, phase: "read", i: 0, typed: "", checked: null, scores: [], playing: -1 };

  if (LABD.phase === "drill") return labDrill(v, l);

  v.innerHTML = `
  <div class="stack-l">
    <button class="btn bare" id="back" style="align-self:flex-start;margin-left:-8px">${ICON.back} Le Lab</button>
    <section class="stack">
      <span class="eyebrow">Pattern ${LESSONS.indexOf(l) + 1} sur 8</span>
      <h1 style="font-size:27px">${esc(l.title)}</h1>
      <p class="muted">${esc(l.sub)}</p>
    </section>
    <section class="card">
      ${l.why.split("\n\n").map(p => `<p style="margin-bottom:12px;font-size:15px;line-height:1.62">${esc(p).replace(/\n/g, "<br>")}</p>`).join("")}
    </section>
    <section class="stack">
      <div class="section-head"><h2>À l'oreille</h2><span class="eyebrow">${l.examples.length} exemples</span></div>
      <div class="card">
        ${l.examples.map((e, i) => `
          <div class="ex-line">
            <span class="full">${esc(e.full)}</span>
            <button class="mini-play" data-ex="${i}" aria-label="Écouter">${ICON.play}</button>
            <span class="red">${esc(e.red)}</span>
            <span class="fr">${esc(e.fr)} · <span class="ipa">/${esc(e.ipa)}/</span></span>
          </div>`).join("")}
      </div>
    </section>
    <button class="btn primary big block" id="to-drill">Passer à l'exercice — ${l.drill.length} phrases</button>
  </div>`;

  $("#back").onclick = () => go("lab");
  $$("[data-ex]").forEach(b => b.onclick = () => {
    const e = l.examples[parseInt(b.dataset.ex, 10)];
    Player.play({ full: e.full }, 0.9, null, () => {});
  });
  $("#to-drill").onclick = () => { LABD.phase = "drill"; LABD.i = 0; LABD.typed = ""; LABD.checked = null; LABD.scores = []; render(); };
}

function labDrill(v, l) {
  const item = l.drill[LABD.i];
  const g = LABD.checked;
  v.innerHTML = `
  <div class="stack-l">
    <div class="spread">
      <button class="btn bare" id="back" style="margin-left:-8px">${ICON.back} ${esc(l.title)}</button>
      <span class="mono tiny muted">${LABD.i + 1} / ${l.drill.length}</span>
    </div>
    <section class="stack">
      <div class="player">
        <button class="play-btn ${LABD.playing === LABD.i ? "playing" : ""}" id="play">${LABD.playing === LABD.i ? ICON.stop : ICON.play}</button>
        <div class="grow">
          <div class="wave ${LABD.playing === LABD.i ? "active" : ""}">${Array.from({ length: 24 }, (_, i) => `<i style="height:${16 + Math.round(Math.abs(Math.cos(i * 1.3 + LABD.i)) * 16)}px;animation-delay:${(i * 0.05).toFixed(2)}s"></i>`).join("")}</div>
          <p class="listen-count" style="margin-top:8px">${esc(PATTERN_LABEL[l.id] || l.title).toUpperCase()}</p>
        </div>
      </div>
    </section>
    ${g ? `
      <section class="stack">
        <div class="card"><div class="diff">${diffHTML(g)}</div></div>
        <div class="reveal-block stack-s">
          <p class="sounds-like">${esc(item.red)}</p>
          <p class="ipa">/${esc(item.ipa)}/</p>
          <p class="small muted">${esc(item.fr)}</p>
        </div>
        <button class="btn primary big block" id="next">${LABD.i + 1 >= l.drill.length ? "Terminer la leçon" : "Suivant"}</button>
      </section>` : `
      <section class="stack">
        <label class="eyebrow" for="typed">Tape ce que tu entends</label>
        <textarea id="typed" class="type-area" autocapitalize="off" autocorrect="off" spellcheck="false">${esc(LABD.typed)}</textarea>
        <button class="btn primary block" id="check" ${LABD.typed.trim() ? "" : "disabled"}>Vérifier</button>
      </section>`}
  </div>`;

  $("#back").onclick = () => { LABD.phase = "read"; render(); };
  $("#play").onclick = () => {
    if (LABD.playing === LABD.i) { Player.stop(); LABD.playing = -1; render(); return; }
    LABD.playing = LABD.i; render();
    Player.play({ full: item.full }, 1, null, () => { LABD.playing = -1; if (route.view === "lab") render(); });
  };
  const ta = $("#typed");
  if (ta) { ta.oninput = () => { LABD.typed = ta.value; $("#check").disabled = !ta.value.trim(); }; ta.focus(); }
  const c = $("#check");
  if (c) c.onclick = () => {
    Player.stop(); LABD.playing = -1;
    LABD.checked = grade(item.full, LABD.typed);
    LABD.scores.push(LABD.checked.score);
    logDictation(LABD.checked.score);
    if (LABD.checked.score < 0.85) addCard(item, LABD.checked.missed);
    save(); render();
  };
  const n = $("#next");
  if (n) n.onclick = () => {
    if (LABD.i + 1 >= l.drill.length) {
      const avg = LABD.scores.reduce((a, b) => a + b, 0) / LABD.scores.length;
      S.lab[l.id] = { done: true, score: avg, at: dayKey() };
      today().lessons += 1;
      save();
      toast(`Leçon terminée — ${Math.round(avg * 100)}%`);
      LABD = null;
      go("lab");
      return;
    }
    LABD.i++; LABD.typed = ""; LABD.checked = null; render();
  };
}

/* ───────────────────────── view: review ───────────────────────── */

let REV = null;

VIEWS.review = function (v) {
  const due = dueCards();
  if (!REV || !REV.queue) REV = { queue: due.map(c => c.id), i: 0, shown: false, done: 0, playing: false };
  REV.queue = REV.queue.filter(id => S.cards.some(c => c.id === id));

  if (!S.cards.length) {
    v.innerHTML = `<div class="empty stack-s">
      <div class="big-glyph">ə</div>
      <h2 style="font-size:19px">Pas encore de cartes</h2>
      <p class="small">Chaque phrase que tu rates en dictée atterrit ici automatiquement, et te revient à intervalles croissants jusqu'à ce que ton oreille la reconnaisse sans effort.</p>
      <button class="btn primary" id="go-dec" style="margin-top:6px">Faire une dictée</button>
    </div>`;
    $("#go-dec").onclick = () => go("decode");
    return;
  }
  if (!REV.queue.length || REV.i >= REV.queue.length) {
    const next = S.cards.slice().sort((a, b) => (a.due || "").localeCompare(b.due || ""))[0];
    v.innerHTML = `<div class="stack-l">
      <div class="empty stack-s">
        <div class="big-glyph">✓</div>
        <h2 style="font-size:19px">${REV.done ? "Révisions faites" : "Rien à réviser aujourd'hui"}</h2>
        <p class="small">${REV.done ? REV.done + " carte" + (REV.done > 1 ? "s" : "") + " passée" + (REV.done > 1 ? "s" : "") + "." : ""} Prochaine échéance : <span class="mono">${esc(next && next.due || "—")}</span>.</p>
      </div>
      <div class="card flat stack-s">
        <span class="eyebrow">Ta collection</span>
        <p class="small muted">${S.cards.length} phrase${S.cards.length > 1 ? "s" : ""} suivie${S.cards.length > 1 ? "s" : ""}. Les plus fragiles d'abord :</p>
        <div class="stack-s" style="margin-top:6px">
          ${S.cards.slice().sort((a, b) => (b.lapses || 0) - (a.lapses || 0)).slice(0, 6).map(c => `
            <div class="seg-item"><span class="tc">${c.lapses || 0}×</span><span class="tx">${esc(c.full)}</span></div>`).join("")}
        </div>
      </div>
      <button class="btn ghost block" id="cram">Réviser quand même (10 cartes)</button>
    </div>`;
    $("#cram").onclick = () => {
      REV = { queue: S.cards.slice().sort((a, b) => (b.lapses || 0) - (a.lapses || 0)).slice(0, 10).map(c => c.id), i: 0, shown: false, done: 0, playing: false };
      render();
    };
    return;
  }

  const card = S.cards.find(c => c.id === REV.queue[REV.i]);
  v.innerHTML = `
  <div class="stack-l">
    <div class="spread">
      <span class="eyebrow">Révision</span>
      <span class="mono tiny muted">${REV.i + 1} / ${REV.queue.length}</span>
    </div>
    <div class="score-bar"><i style="width:${(REV.i / REV.queue.length) * 100}%"></i></div>

    <div class="flashcard">
      ${REV.shown ? `
        <p class="front">${esc(card.full)}</p>
        <p class="sounds-like">${esc(card.red || "")}</p>
        <p class="ipa">/${esc(card.ipa || "")}/</p>
        <p class="back">${esc(card.fr || "")}</p>
        ${card.missed && card.missed.length ? `<p class="tiny muted">Tu avais raté : ${card.missed.map(m => `<span class="mono" style="color:var(--bad)">${esc(m)}</span>`).join(" · ")}</p>` : ""}
      ` : `
        <p class="eyebrow">Écoute, puis reconstitue la phrase de tête</p>
        <div style="display:flex;justify-content:center;margin:4px 0">
          <button class="play-btn ${REV.playing ? "playing" : ""}" id="play">${REV.playing ? ICON.stop : ICON.play}</button>
        </div>
        <p class="tiny muted">${esc(card.fr ? card.fr : "")}</p>
      `}
    </div>

    ${REV.shown ? `
      <div class="grade-row">
        <button class="btn" data-q="0">Raté<small>aujourd'hui</small></button>
        <button class="btn" data-q="1">Dur<small>${Math.max(1, Math.round((card.interval || 1) * 1.2))} j</small></button>
        <button class="btn" data-q="2">Bien<small>${card.interval ? Math.round(card.interval * card.ease) : 2} j</small></button>
        <button class="btn" data-q="3">Facile<small>${card.interval ? Math.round(card.interval * card.ease * 1.35) : 4} j</small></button>
      </div>
      <button class="btn ghost sm" id="replay" style="align-self:center">${ICON.play} Réécouter</button>
    ` : `
      <button class="btn primary big block" id="show">Voir la phrase</button>
    `}
  </div>`;

  const p = $("#play");
  if (p) p.onclick = () => {
    if (REV.playing) { Player.stop(); REV.playing = false; render(); return; }
    REV.playing = true; render();
    Player.play(card, 1, card.libId, () => { REV.playing = false; if (route.view === "review") render(); });
  };
  const rp = $("#replay"); if (rp) rp.onclick = () => Player.play(card, 1, card.libId, () => {});
  const sh = $("#show"); if (sh) sh.onclick = () => { Player.stop(); REV.shown = true; render(); };
  $$("[data-q]").forEach(b => b.onclick = () => {
    gradeCard(card, parseInt(b.dataset.q, 10));
    today().cards += 1;
    REV.done++; REV.i++; REV.shown = false; REV.playing = false;
    save(); render(); window.scrollTo(0, 0);
  });

};

/* ───────────────────────── view: write ───────────────────────── */

let WRI = { mode: "essay", text: "", result: null, busy: false, chat: [], input: "", chatBusy: false, topic: "" };

VIEWS.write = function (v) {
  if (WRI.mode === "chat") return writeChat(v);

  const dayIdx = Math.abs(daysBetween("2026-01-01", dayKey())) % WRITING_PROMPTS.length;
  const prompt = WRI.prompt || WRITING_PROMPTS[dayIdx];
  WRI.prompt = prompt;
  const words = WRI.text.trim() ? WRI.text.trim().split(/\s+/).length : 0;
  const r = WRI.result;

  v.innerHTML = `
  <div class="stack-l">
    <div class="row-tight" style="gap:4px">
      <button class="chip on" data-w="essay">Rédaction</button>
      <button class="chip" data-w="chat">Conversation</button>
    </div>

    <section class="stack">
      <div class="spread"><span class="eyebrow">Sujet du jour</span><button class="link tiny" id="reroll">Autre sujet</button></div>
      <div class="card"><p style="font-size:17px;line-height:1.45">${esc(prompt)}</p></div>
    </section>

    ${r ? renderCorrection(r) : `
    <section class="stack">
      <textarea id="w-text" rows="9" placeholder="Write in English. Don't translate from French sentence by sentence — say it the way you'd say it out loud." spellcheck="false">${esc(WRI.text)}</textarea>
      <div class="spread">
        <span class="mono tiny ${words >= 80 ? "" : "muted"}" style="${words >= 80 ? "color:var(--ok)" : ""}">${words} mot${words > 1 ? "s" : ""} · vise 80</span>
        <button class="btn primary" id="correct" ${WRI.busy || words < 15 ? "disabled" : ""}>${WRI.busy ? '<span class="spinner"></span> Claude relit…' : "Corriger"}</button>
      </div>
      ${!aiAvailable() ? `<p class="tiny" style="color:var(--warn)">Claude n'est pas accessible ici. Ouvre la page depuis claude.ai pour activer la correction.</p>` : ""}
    </section>`}

    ${S.writings.length ? `
    <section class="stack">
      <div class="section-head"><h2>Tes textes</h2><span class="eyebrow">${S.writings.length}</span></div>
      <div class="stack-s">
        ${S.writings.slice(-5).reverse().map(w => `
          <div class="seg-item"><span class="tc">${esc(w.at)}</span><span class="tx grow">${esc(w.prompt.slice(0, 52))}…</span><span class="chip ok">${esc(w.level || "")}</span></div>`).join("")}
      </div>
    </section>` : ""}

    ${Object.keys(S.errorTypes).length ? `
    <section class="stack">
      <div class="section-head"><h2>Tes erreurs récurrentes</h2></div>
      <div class="card flat"><div class="pill-row">
        ${Object.entries(S.errorTypes).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, n]) => `<span class="chip ${n >= 4 ? "bad" : n >= 2 ? "warn" : ""}">${esc(k)} <span class="mono">${n}</span></span>`).join("")}
      </div></div>
    </section>` : ""}
  </div>`;

  $$("[data-w]").forEach(b => b.onclick = () => { WRI.mode = b.dataset.w; render(); });
  $("#reroll").onclick = () => { WRI.prompt = pick(WRITING_PROMPTS.filter(p => p !== WRI.prompt)); WRI.result = null; render(); };
  const ta = $("#w-text");
  if (ta) ta.oninput = () => {
    WRI.text = ta.value;
    const n = ta.value.trim() ? ta.value.trim().split(/\s+/).length : 0;
    const c = $("#correct"); if (c) c.disabled = n < 15 || WRI.busy;
    const lbl = $(".spread .mono", v);
    if (lbl) { lbl.textContent = `${n} mot${n > 1 ? "s" : ""} · vise 80`; lbl.style.color = n >= 80 ? "var(--ok)" : ""; lbl.classList.toggle("muted", n < 80); }
  };
  const c = $("#correct");
  if (c) c.onclick = async () => {
    WRI.busy = true; render();
    try {
      const recurring = Object.entries(S.errorTypes).sort((a, b) => b[1] - a[1]).slice(0, 5).map(x => x[0]);
      const res = await askJSON(AI.correction(WRI.text, recurring), { schema: SCHEMA_CORRECTION });
      WRI.result = res;
      for (const e of (res.errors || [])) {
        const t = String(e.type || "Autre");
        S.errorTypes[t] = (S.errorTypes[t] || 0) + 1;
      }
      S.writings.push({ at: dayKey(), prompt: WRI.prompt, text: WRI.text, level: res.level || "", verdict: res.verdict || "" });
      if (S.writings.length > 60) S.writings.shift();
      today().words += WRI.text.trim().split(/\s+/).length;
      save();
    } catch (e) { toast(aiErrorMessage(e)); }
    WRI.busy = false; render();
  };

  $$("[data-newtext]").forEach(b => b.onclick = () => { WRI.text = ""; WRI.result = null; WRI.prompt = pick(WRITING_PROMPTS); render(); });
  $$("[data-cardify]").forEach(b => b.onclick = () => {
    const up = (WRI.result.upgrades || [])[parseInt(b.dataset.cardify, 10)];
    if (!up) return;
    addCard({ full: up.better, red: "", ipa: "", fr: up.note || "", tags: [] }, []);
    save(); b.outerHTML = `<span class="chip ok">Ajoutée</span>`;
  });
};

function renderCorrection(r) {
  const errs = r.errors || [];
  const ups = r.upgrades || [];
  return `
  <section class="stack">
    <div class="spread"><span class="eyebrow">Verdict</span>${r.level ? `<span class="chip">${esc(r.level)}</span>` : ""}</div>
    <div class="card"><p style="font-size:15.5px;line-height:1.6">${esc(r.verdict || "")}</p></div>
  </section>

  ${r.focus ? `
  <section class="stack">
    <span class="eyebrow">Le point à travailler</span>
    <div class="card raised stack-s" style="border-color:var(--accent)">
      <h3 style="font-size:17px">${esc(r.focus.title || "")}</h3>
      <p class="small">${esc(r.focus.explain || "")}</p>
    </div>
  </section>` : ""}

  ${errs.length ? `
  <section class="stack">
    <div class="section-head"><h2>Corrections</h2><span class="eyebrow">${errs.length}</span></div>
    <div class="card"><div class="table-wrap"><table class="corr-table">
      <thead><tr><th>Toi</th><th>Correct</th><th>Pourquoi</th></tr></thead>
      <tbody>${errs.map(e => `<tr>
        <td class="was">${esc(e.was)}</td>
        <td class="now">${esc(e.now)}</td>
        <td class="muted">${esc(e.why)}<br><span class="tiny" style="color:var(--ink-3)">${esc(e.type || "")}</span></td>
      </tr>`).join("")}</tbody>
    </table></div></div>
  </section>` : `<div class="card" style="border-color:var(--ok)"><p class="small">Aucune erreur bloquante sur ce texte.</p></div>`}

  ${ups.length ? `
  <section class="stack">
    <div class="section-head"><h2>Pour sonner natif</h2></div>
    <div class="stack-s">
      ${ups.map((u, i) => `<div class="card stack-s">
        <p class="small muted" style="text-decoration:line-through">${esc(u.plain)}</p>
        <p style="font-size:16px;color:var(--ok)">${esc(u.better)}</p>
        <div class="spread"><span class="tiny muted">${esc(u.note || "")}</span><button class="btn sm ghost" data-cardify="${i}">Réviser ça</button></div>
      </div>`).join("")}
    </div>
  </section>` : ""}

  <section class="stack">
    <span class="eyebrow">Version corrigée</span>
    <div class="card"><p class="ai-out">${esc(r.corrected || "")}</p></div>
    <button class="btn primary big block" data-newtext="1">Écrire un autre texte</button>
  </section>`;
}

function writeChat(v) {
  v.innerHTML = `
  <div class="stack-l">
    <div class="row-tight" style="gap:4px">
      <button class="chip" data-w="essay">Rédaction</button>
      <button class="chip on" data-w="chat">Conversation</button>
    </div>
    ${!WRI.chat.length ? `
      <section class="stack">
        <h1 style="font-size:24px">Parler pour de vrai</h1>
        <p class="small muted">Claude te répond en anglais naturel et te relance. Si une de tes phrases coince, il glisse la correction en français en fin de message — sans casser la conversation.</p>
        <div class="field"><label for="chat-topic">Sur quoi ?</label>
          <input type="text" id="chat-topic" placeholder="ex. why Belgian football keeps disappointing me"></div>
        <button class="btn primary block" id="chat-start" ${aiAvailable() ? "" : "disabled"}>Commencer</button>
        ${!aiAvailable() ? `<p class="tiny" style="color:var(--warn)">Claude n'est pas accessible ici.</p>` : ""}
      </section>` : `
      <section class="stack">
        ${WRI.chat.map((m, mi) => `
          <div class="card ${m.role === "user" ? "" : "flat"}" data-msg="${mi}" style="${m.role === "user" ? "background:var(--accent-soft);border-color:transparent" : ""}">
            <span class="eyebrow">${m.role === "user" ? "Toi" : "Claude"}</span>
            <p class="ai-out" style="margin-top:6px">${m.content ? esc(m.content) : '<span class="spinner"></span>'}</p>
          </div>`).join("")}
      </section>
      <section class="stack">
        <textarea id="chat-in" rows="3" placeholder="Answer in English." spellcheck="false">${esc(WRI.input)}</textarea>
        <div class="row">
          <button class="btn primary grow" id="chat-send" ${WRI.chatBusy ? "disabled" : ""}>Envoyer</button>
          <button class="btn ghost" id="chat-reset">Recommencer</button>
        </div>
      </section>`}
  </div>`;

  $$("[data-w]").forEach(b => b.onclick = () => { WRI.mode = b.dataset.w; render(); });
  const st = $("#chat-start");
  if (st) st.onclick = () => {
    WRI.topic = ($("#chat-topic").value || "").trim() || "what you did this week";
    WRI.chat = [];
    sendChat("Hi! Let's start.");
  };
  const ta = $("#chat-in");
  if (ta) { ta.oninput = () => WRI.input = ta.value; }
  const sd = $("#chat-send");
  if (sd) sd.onclick = () => { const t = WRI.input.trim(); if (t) { WRI.input = ""; sendChat(t); } };
  const rs = $("#chat-reset"); if (rs) rs.onclick = () => { WRI.chat = []; render(); };

  if (WRI.chat.length) window.scrollTo(0, document.body.scrollHeight);

  async function sendChat(text) {
    WRI.chat.push({ role: "user", content: text });
    const idx = WRI.chat.length;
    WRI.chat.push({ role: "assistant", content: "" });
    WRI.chatBusy = true;
    render();
    try {
      const turns = AI.conversation(WRI.chat.slice(0, idx), WRI.topic);
      const res = await ask(turns, {
        effort: "low",
        onText: ({ text }) => {
          WRI.chat[idx].content = text;
          // paint into the bubble directly: a full re-render would drop focus
          const node = document.querySelector('[data-msg="' + idx + '"] .ai-out');
          if (node) node.textContent = text;
        }
      });
      WRI.chat[idx].content = res.text;
      today().words += text.trim().split(/\s+/).length;
      save();
    } catch (e) {
      WRI.chat.splice(idx, 1);
      toast(aiErrorMessage(e));
    }
    WRI.chatBusy = false; render();
  }
}

/* ───────────────────────── view: library ───────────────────────── */

VIEWS.library = function (v) {
  v.innerHTML = `
  <div class="stack-l">
    <button class="btn bare" id="back" style="align-self:flex-start;margin-left:-8px">${ICON.back} Écouter</button>
    <section class="stack">
      <h1 style="font-size:25px">Ta bibliothèque</h1>
      <p class="small muted">C'est ici que ça devient sérieux. Les packs de départ sont lus par une voix de synthèse qui articule trop proprement. Ici, tu travailles sur de la vraie parole : ta série, ton podcast, au vrai débit, avec les vraies voix et les vrais accents.</p>
    </section>

    <section class="card flat stack-s">
      <span class="eyebrow">Depuis YouTube, en trois gestes</span>
      <ol class="steps">
        <li>Sous la vidéo : <strong>Plus</strong> → <strong>Afficher la transcription</strong>. Sélectionne, copie.</li>
        <li>Colle ici, avec le lien de la vidéo. Schwa reconnaît les horodatages et découpe en segments.</li>
        <li>Lance la vidéo en <strong>Picture-in-Picture</strong> (ton abonnement Premium le permet) : elle flotte au-dessus de Schwa pendant que tu tapes. Chaque segment a son bouton pour ouvrir YouTube au bon instant.</li>
      </ol>
      <p class="tiny muted">Je ne télécharge pas l'audio de YouTube et Schwa non plus : c'est hors conditions d'utilisation, même avec Premium. Le Picture-in-Picture fait le même travail sans rien enfreindre.</p>
    </section>

    <section class="stack">
      <div class="field">
        <label for="lib-title">Titre</label>
        <input type="text" id="lib-title" placeholder="ex. The Bear S01E03, ou Lex Fridman #402">
      </div>
      <div class="field">
        <label for="lib-yt">Lien YouTube (optionnel)</label>
        <input type="text" id="lib-yt" placeholder="https://www.youtube.com/watch?v=...">
        <span class="tiny muted">Donne à chaque segment un bouton qui ouvre la vidéo à la bonne seconde.</span>
      </div>
      <div class="field">
        <label for="lib-accent">Accent dominant</label>
        <select id="lib-accent">
          <option value="">Je ne sais pas / mélangé</option>
          ${ACCENTS.map(a => `<option value="${esc(a.code)}">${esc(a.flag)} ${esc(a.label)}</option>`).join("")}
        </select>
      </div>
      <div class="field">
        <label for="lib-text">Transcription — sous-titres .srt/.vtt, transcription YouTube, ou texte brut</label>
        <textarea id="lib-text" rows="7" placeholder="0:04&#10;I don't know what you want me to say&#10;0:07&#10;but I'm not gonna apologize" spellcheck="false"></textarea>
      </div>
      <div class="field">
        <label for="lib-file">…ou un fichier de sous-titres</label>
        <input type="file" id="lib-file" accept=".srt,.vtt,.txt,text/plain">
      </div>
      <div class="field">
        <label for="lib-audio">Audio correspondant (optionnel)</label>
        <input type="file" id="lib-audio" accept="audio/*,video/mp4,video/*">
        <span class="tiny muted">Un fichier que tu possèdes déjà. Il reste sur ton appareil et n'est jamais envoyé nulle part. Les horodatages découpent l'audio automatiquement.</span>
      </div>
      <div id="lib-status"></div>
      <button class="btn primary block" id="lib-save">Ajouter à la bibliothèque</button>
    </section>

    <section class="stack">
      <div class="section-head"><h2>Analyse par un autre modèle</h2></div>
      <p class="small muted">Je ne peux pas regarder une vidéo. Un modèle qui en est capable, lui, peut te sortir une transcription horodatée avec la phonétique. Copie le prompt, donne-lui ta vidéo, et colle sa réponse ici : tout arrive d'un coup, sans passer par la transcription YouTube.</p>
      <div class="field">
        <label for="cur-n">Combien de vidéos qu'il doit trouver</label>
        <select id="cur-n"><option>3</option><option selected>5</option><option>8</option></select>
      </div>
      <div class="field">
        <label for="cur-theme">Thème, si tu en veux un</label>
        <input type="text" id="cur-theme" placeholder="ex. cuisine, football, technologie, humour">
      </div>
      <div class="row">
        <button class="btn ghost grow" id="copy-curate">Qu'il choisisse les vidéos</button>
        <button class="btn ghost grow" id="copy-one">Je donne la vidéo</button>
      </div>
      <div class="field">
        <label for="lib-json">Sa réponse (JSON)</label>
        <textarea id="lib-json" rows="5" placeholder='{"title": "...", "yt": "...", "segments": [ ... ]}' spellcheck="false"></textarea>
      </div>
      <div id="json-status"></div>
      <button class="btn primary block" id="json-save">Importer l'analyse</button>
    </section>

    ${S.shortlist.length ? `
    <section class="stack">
      <div class="section-head"><h2>Vidéos à traiter</h2><span class="eyebrow">${S.shortlist.length}</span></div>
      <p class="small muted">Vérifiées sur YouTube. Il leur manque leur transcription — celle de YouTube, la vraie. Ouvre la vidéo, copie sa transcription, reviens la coller : le titre et le lien sont déjà remplis pour toi.</p>
      <div class="stack-s">
        ${S.shortlist.map((v, i) => {
          const a = accentInfo(v.accent);
          return `<div class="card stack-s">
            <div class="spread">
              <span class="row-tight tiny muted">${diffDots(v.level || 3)}${a ? " " + esc(a.flag) + " " + esc(a.label) : ""}</span>
              <button class="btn sm bare" data-sl-del="${i}" aria-label="Retirer">✕</button>
            </div>
            <p class="small" style="font-weight:500">${esc(v.title)}</p>
            ${v.channel ? `<p class="tiny muted">${esc(v.channel)}</p>` : ""}
            ${v.why ? `<p class="tiny muted">${esc(v.why)}</p>` : ""}
            <div class="row">
              <a class="chip" target="_blank" rel="noopener" href="https://www.youtube.com/watch?v=${esc(v.yt)}">Ouvrir sur YouTube ↗</a>
              <button class="btn sm primary" data-sl-use="${i}">Coller sa transcription</button>
            </div>
          </div>`;
        }).join("")}
      </div>
    </section>` : ""}

    ${S.library.length ? `
    <section class="stack">
      <div class="section-head"><h2>Importés</h2><span class="eyebrow">${S.library.length}</span></div>
      <div class="stack-s">
        ${S.library.map(l => {
          const a = accentInfo(l.accent);
          const enriched = l.segments.filter(s => s.red).length;
          return `<div class="lesson-item">
            <span class="num">${l.hasAudio ? "♪" : l.yt ? "▶" : "▤"}</span>
            <span class="grow">
              <span class="t">${esc(l.title)}</span>
              <span class="d">${l.segments.length} segments${l.hasAudio ? " · audio" : ""}${a ? " · " + esc(a.flag) + " " + esc(a.label) : ""} · analysés ${enriched}/${l.segments.length}</span>
            </span>
            <button class="btn sm ghost" data-open="${l.id}">Ouvrir</button>
            <button class="btn sm bare" data-del="${l.id}" aria-label="Supprimer">✕</button>
          </div>`;
        }).join("")}
      </div>
    </section>` : ""}

    <section class="stack">
      <div class="section-head"><h2>Où trouver de l'écoute</h2></div>
      <p class="small muted">Tout ce qui suit fournit une transcription. Rien n'est embarqué dans l'app : ce sont des liens, tu importes ce que tu veux.</p>
      <div class="stack-s">
        ${SOURCES.map(s => `
          <div class="card stack-s">
            <div class="spread">
              <h3 style="font-size:16px">${esc(s.name)}</h3>
              <span class="chip">${esc(s.tag)}</span>
            </div>
            <p class="small">${esc(s.what)}</p>
            <p class="tiny muted">${esc(s.how)}</p>
            ${s.url ? `<a class="link tiny" target="_blank" rel="noopener" href="${esc(s.url)}">${esc(s.url.replace(/^https?:\/\//, ""))} ↗</a>` : ""}
          </div>`).join("")}
      </div>
    </section>
  </div>`;

  $("#back").onclick = () => go("decode");
  $$("[data-open]").forEach(b => b.onclick = () => { newSession("lib:" + b.dataset.open); go("decode", "lib:" + b.dataset.open); });
  $$("[data-del]").forEach(b => b.onclick = () => {
    const id = b.dataset.del;
    S.library = S.library.filter(l => l.id !== id);
    Blobs.del(id);
    Tube.hide();
    save(); render();
  });

  const copyPrompt = async txt => {
    try { await navigator.clipboard.writeText(txt); toast("Prompt copié"); }
    catch (e) {
      const ta = $("#lib-json"); ta.value = txt; ta.select();
      toast("Copie automatique refusée — sélectionne et copie à la main");
    }
  };
  $$("[data-sl-del]").forEach(b => b.onclick = () => {
    S.shortlist.splice(parseInt(b.dataset.slDel, 10), 1); save(); render();
  });
  $$("[data-sl-use]").forEach(b => b.onclick = () => {
    const v = S.shortlist[parseInt(b.dataset.slUse, 10)];
    if (!v) return;
    $("#lib-title").value = v.title;
    $("#lib-yt").value = "https://www.youtube.com/watch?v=" + v.yt;
    if (v.accent) $("#lib-accent").value = v.accent;
    const ta = $("#lib-text");
    ta.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => ta.focus(), 400);
    toast("Titre et lien remplis — colle la transcription YouTube");
  });

  $("#copy-curate").onclick = () => copyPrompt(
    curationPrompt(parseInt($("#cur-n").value, 10) || 5, $("#cur-theme").value.trim()));
  $("#copy-one").onclick = () => copyPrompt(analysisPrompt());

  $("#json-save").onclick = async () => {
    const st = $("#json-status");
    const raw = $("#lib-json").value.trim();
    if (!raw) { st.innerHTML = '<p class="small" style="color:var(--bad)">Colle d\'abord la réponse.</p>'; return; }
    // Une liste de videos n'a pas de segments ; une analyse en a. On aiguille dessus.
    let probe = null;
    try {
      const m = raw.match(/[\[{][\s\S]*[\]}]/);
      probe = JSON.parse(m ? m[0] : raw);
    } catch (e) { probe = null; }
    const asList = Array.isArray(probe) ? probe : (probe ? [probe] : []);
    const isShortlist = asList.length > 0
      && asList.every(d => d && !(Array.isArray(d.segments) && d.segments.length));

    if (isShortlist) {
      let list;
      try { list = importShortlist(asList); }
      catch (err) { st.innerHTML = '<p class="small" style="color:var(--bad)">' + esc(err.message) + '</p>'; return; }
      st.innerHTML = '<div class="row-tight small muted"><span class="spinner"></span> Vérification des vidéos auprès de YouTube…</div>';
      const checkedList = await verifyAll(list);
      st.innerHTML = "";
      openShortlistReview(checkedList);
      return;
    }

    let items;
    try { items = importAnalysis(raw); }
    catch (err) { st.innerHTML = '<p class="small" style="color:var(--bad)">' + esc(err.message) + '</p>'; return; }
    st.innerHTML = '<div class="row-tight small muted"><span class="spinner"></span> Vérification des vidéos auprès de YouTube…</div>';
    const checked = await verifyAll(items);
    st.innerHTML = "";
    openImportReview(checked);
  };

  $("#lib-file").onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    $("#lib-text").value = await f.text();
    if (!$("#lib-title").value) $("#lib-title").value = f.name.replace(/\.[^.]+$/, "");
  };

  $("#lib-save").onclick = async () => {
    const title = $("#lib-title").value.trim() || "Sans titre";
    const raw = $("#lib-text").value.trim();
    const audioFile = $("#lib-audio").files[0];
    const st = $("#lib-status");
    if (!raw) { st.innerHTML = `<p class="small" style="color:var(--bad)">Colle d'abord une transcription ou des sous-titres.</p>`; return; }
    $("#lib-save").disabled = true;

    const parsed = parseTranscript(raw);
    let segments = parsed.segs;
    const timed = parsed.timed;
    if (timed) {
      st.innerHTML = `<p class="small" style="color:var(--ok)">${parsed.from === "youtube" ? "Transcription YouTube" : "Sous-titres"} reconnus — ${segments.length} segments horodatés.</p>`;
    } else {
      if (aiAvailable()) {
        st.innerHTML = `<div class="row-tight small muted"><span class="spinner"></span> Pas d'horodatage : Claude découpe le texte et note les réductions…</div>`;
        try {
          const arr = await askJSON(AI.segmentTranscript(raw.slice(0, 9000)), { effort: "low", schema: SCHEMA_SEGMENTS });
          segments = (Array.isArray(arr) ? arr : []).filter(x => x && x.full);
        } catch (e) { segments = splitPlain(raw); }
      } else segments = splitPlain(raw);
    }
    if (!segments.length) { st.innerHTML = `<p class="small" style="color:var(--bad)">Impossible de découper ce texte. Vérifie que tu as bien collé la transcription entière.</p>`; $("#lib-save").disabled = false; return; }

    const item = {
      id: uid(), title, segments: segments.slice(0, 220), hasAudio: false, at: dayKey(),
      yt: ytId($("#lib-yt").value), accent: $("#lib-accent").value || ""
    };
    if (audioFile) {
      if (!timed) {
        st.innerHTML = `<p class="small" style="color:var(--warn)">Audio ignoré : sans timecodes, impossible de savoir où couper. Utilise un vrai fichier .srt.</p>`;
      } else {
        st.innerHTML = `<div class="row-tight small muted"><span class="spinner"></span> Enregistrement de l'audio…</div>`;
        try { await Blobs.put(item.id, audioFile); item.hasAudio = true; }
        catch (e) { st.innerHTML = `<p class="small" style="color:var(--warn)">L'audio n'a pas pu être stocké, la transcription est gardée.</p>`; }
      }
    }
    S.library.push(item);
    save(); pushLibraryItem(item);
    toast(item.segments.length + " segments importés");
    newSession("lib:" + item.id);
    go("decode", "lib:" + item.id);
  };
};

function tc(s) {
  const m = s.match(/(\d{1,2}):(\d{2}):(\d{2})[.,](\d{1,3})/);
  if (!m) { const m2 = s.match(/(\d{1,2}):(\d{2})[.,](\d{1,3})/); if (!m2) return null; return (+m2[1]) * 60 + (+m2[2]) + (+m2[3]) / 1000; }
  return (+m[1]) * 3600 + (+m[2]) * 60 + (+m[3]) + (+m[4]) / 1000;
}

function parseSubtitles(raw) {
  const text = raw.replace(/\r/g, "");
  const cues = [];
  const blocks = text.split(/\n{2,}/);
  for (const b of blocks) {
    const lines = b.split("\n").filter(l => l.trim() && !/^WEBVTT/i.test(l));
    const ti = lines.findIndex(l => l.includes("-->"));
    if (ti < 0) continue;
    const [a, z] = lines[ti].split("-->");
    const start = tc(a), end = tc(z);
    if (start == null) continue;
    const body = lines.slice(ti + 1).join(" ")
      .replace(/<[^>]+>/g, "")
      .replace(/\{[^}]+\}/g, "")
      .replace(/^[-–]\s*/gm, "")
      .replace(/\s+/g, " ").trim();
    if (body) cues.push({ t: start, e: end == null ? start + 4 : end, text: body });
  }
  return mergeCues(cues);
}

/* Merges neighbouring cues into 6-16 word breath groups, cutting on
   sentence ends and on silences, never mid-phrase. */
function mergeCues(cues) {
  if (!cues.length) return [];
  const segs = [];
  let cur = null;
  for (const c of cues) {
    if (!cur) cur = { t: c.t, e: c.e, text: c.text };
    else if (cur.text.split(/\s+/).length < 6 || (!/[.!?…]"?$/.test(cur.text) && cur.text.split(/\s+/).length < 13 && c.t - cur.e < 1.6)) {
      cur.text += " " + c.text; cur.e = c.e;
    } else { segs.push(cur); cur = { t: c.t, e: c.e, text: c.text }; }
    if (cur.text.split(/\s+/).length >= 16) { segs.push(cur); cur = null; }
  }
  if (cur) segs.push(cur);
  return segs
    .filter(s => s.text.split(/\s+/).length >= 3)
    .map(s => ({ full: s.text, red: "", ipa: "", fr: "", tags: [], t: Math.max(0, s.t - 0.15), e: s.e + 0.2 }));
}

function ytTime(s) {
  const p = s.split(":").map(Number);
  return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1];
}

/* YouTube's own transcript panel, copied and pasted. It comes either as a
   timestamp line followed by its text, or as "0:04  text" on one line. */
function parseYouTubeTranscript(raw) {
  const lines = raw.replace(/\r/g, "").split("\n").map(l => l.trim()).filter(Boolean);
  const tsOnly = /^(?:\d{1,2}:)?\d{1,2}:\d{2}$/;
  const tsLead = /^((?:\d{1,2}:)?\d{1,2}:\d{2})\s+(.+)$/;
  const cues = [];
  for (const line of lines) {
    if (tsOnly.test(line)) { cues.push({ t: ytTime(line), text: "" }); continue; }
    const m = line.match(tsLead);
    if (m) { cues.push({ t: ytTime(m[1]), text: m[2].trim() }); continue; }
    if (cues.length) cues[cues.length - 1].text += (cues[cues.length - 1].text ? " " : "") + line;
  }
  const valid = cues.filter(c => c.text);
  if (valid.length < 2) return [];
  for (let i = 0; i < valid.length; i++) valid[i].e = i + 1 < valid.length ? valid[i + 1].t : valid[i].t + 5;
  return mergeCues(valid);
}

/** Works out which transcript format was pasted. */
function parseTranscript(raw) {
  let segs = parseSubtitles(raw);
  if (segs.length) return { segs, timed: true, from: "srt" };
  segs = parseYouTubeTranscript(raw);
  if (segs.length) return { segs, timed: true, from: "youtube" };
  return { segs: [], timed: false, from: "plain" };
}

/** Pulls the video id out of any shape of YouTube link. */
function ytId(url) {
  if (!url) return "";
  const m = String(url).match(/(?:v=|youtu\.be\/|\/embed\/|\/shorts\/|\/live\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : /^[A-Za-z0-9_-]{11}$/.test(url.trim()) ? url.trim() : "";
}

function splitPlain(raw) {
  const sentences = raw.replace(/\s+/g, " ").match(/[^.!?]+[.!?]+|\S+$/g) || [];
  const out = [];
  for (const s of sentences) {
    const t = s.trim();
    if (!t) continue;
    const w = t.split(/\s+/);
    if (w.length <= 16) { out.push(t); continue; }
    for (let i = 0; i < w.length; i += 13) out.push(w.slice(i, i + 13).join(" "));
  }
  return out.filter(t => t.split(/\s+/).length >= 3).map(full => ({ full, red: "", ipa: "", fr: "", tags: [] }));
}

/* ───────────────────────── meilleurs moments ─────────────────────────
   Quels passages d'une source méritent ton temps. Pas un avis : un calcul
   sur le débit réel mesuré aux horodatages, la densité de mots-outils —
   ceux que l'anglais écrase — et ta précision des deux dernières semaines.
   La zone utile est juste au-dessus de ton niveau, jamais au sommet. */

function targetDifficulty() {
  const a = accuracyOver(14);
  if (a == null) return 3;
  if (a >= 0.90) return 5;
  if (a >= 0.80) return 4.3;
  if (a >= 0.68) return 3.6;
  if (a >= 0.55) return 3;
  return 2.3;
}

function segValue(seg) {
  const m = metrics(seg);
  const fit = 1 - Math.min(1, Math.abs(difficulty(seg) - targetDifficulty()) / 2.5);
  const reduction = Math.min(1, m.fn / 0.55);
  const pace = m.wps ? Math.min(1, m.wps / 4.5) : 0.45;
  const lengthOk = (m.n >= 6 && m.n <= 16) ? 1 : 0.65;
  const timed = (seg.t != null) ? 1 : 0.85;
  return (fit * 0.45 + reduction * 0.30 + pace * 0.25) * lengthOk * timed;
}

function bestMoments(src, n) {
  return src.segments
    .map((s, i) => ({ i: i, s: s, v: segValue(s) }))
    .sort((a, b) => b.v - a.v)
    .slice(0, n || 8)
    .sort((a, b) => {
      const ta = a.s.t != null ? a.s.t : a.i;
      const tb = b.s.t != null ? b.s.t : b.i;
      return ta - tb;
    });
}

function openBestMoments() {
  const src = DEC && DEC.src;
  if (!src) return;
  const picks = bestMoments(src, 8);
  const acc = accuracyOver(14);
  sheet(`
    <h2 style="font-size:19px">Meilleurs moments</h2>
    <p class="small muted" style="margin:6px 0 14px">
      Calculés sur cette source : débit réel, densité de mots écrasés, et ta précision des 14 derniers jours
      (${acc == null ? "pas encore de données — je vise le niveau moyen" : Math.round(acc * 100) + " %, donc je vise la difficulté " + targetDifficulty().toFixed(1)}).
      Ce sont les huit passages où tu apprendras le plus, pas les plus durs.
    </p>
    <div class="stack-s">
      ${picks.map(p => `
        <button class="lesson-item" data-jump="${p.i}">
          <span class="num mono" style="font-size:10px">${p.s.t != null ? esc(fmtTime(p.s.t)) : p.i + 1}</span>
          <span class="grow">
            <span class="t" style="font-size:14px;font-weight:500">${esc(p.s.full.slice(0, 68))}${p.s.full.length > 68 ? "…" : ""}</span>
            <span class="d">${diffDots(difficulty(p.s))} ${metrics(p.s).wps ? `<span class="mono">${metrics(p.s).wps.toFixed(1)} mots/s</span>` : esc(DIFF_LABEL[difficulty(p.s)])}</span>
          </span>
        </button>`).join("")}
    </div>
    <button class="btn primary big block" id="run-best" style="margin-top:16px">Lancer la séance — ${picks.length} segments</button>
    <p class="tiny muted" style="margin-top:10px">La séance enchaîne ces huit-là dans l'ordre chronologique, puis s'arrête.</p>
  `, (root, close) => {
    $$("[data-jump]", root).forEach(b => b.onclick = () => {
      DEC.queue = null; DEC.i = parseInt(b.dataset.jump, 10);
      DEC.typed = ""; DEC.checked = null; DEC.listens = 0; DEC.explain = null;
      close(); render();
    });
    $("#run-best", root).onclick = () => {
      DEC.queue = picks.map(p => p.i);
      DEC.qi = 0;
      DEC.i = DEC.queue[0];
      DEC.typed = ""; DEC.checked = null; DEC.listens = 0; DEC.explain = null;
      close(); render();
      toast("Séance ciblée lancée");
    };
  });
}

/* ───────────────────────── view: parcours ───────────────────────── */

VIEWS.path = function (v) {
  const acc = accuracyOver(14);
  const pct = acc == null ? null : Math.round(acc * 100);
  const current = pct == null ? 1 : pct < 55 ? 1 : pct < 75 ? 2 : 3;

  v.innerHTML = `
  <div class="stack-l">
    <button class="btn bare" id="back" style="align-self:flex-start;margin-left:-8px">${ICON.back} Retour</button>
    <section class="stack">
      <h1 style="font-size:25px">Le parcours</h1>
      <p class="small muted">Des sources, pas des épisodes : un épisode précis disparaît en six mois, une source tient. Chacune a été vérifiée, et chacune fournit une transcription — sans transcription, une vidéo ne sert à rien ici.</p>
      <div class="card flat stack-s">
        <span class="eyebrow">Où tu en es</span>
        <p class="small">${pct == null
          ? "Fais quelques dictées : ta précision décidera du palier. En attendant, commence par le palier 1."
          : `<span class="mono" style="font-size:17px;color:var(--accent)">${pct} %</span> de précision sur 14 jours — tu es au <strong>palier ${current}</strong>.`}</p>
      </div>
    </section>

    ${PATHWAY.map(tier => `
      <section class="stack">
        <div class="section-head">
          <h2>${tier.tier}. ${esc(tier.name)}</h2>
          <span class="chip ${tier.tier === current ? "on" : ""}">${tier.tier === current ? "Ton palier" : esc(tier.when.split("—")[0].trim().slice(0, 26))}</span>
        </div>
        <p class="small muted">${esc(tier.goal)}</p>
        <div class="stack-s">
          ${tier.items.map(it => `
            <div class="card stack-s">
              <div class="spread">
                <h3 style="font-size:16px">${esc(it.name)}</h3>
                <span class="row-tight tiny muted">${diffDots(it.diff)}</span>
              </div>
              <p class="small">${esc(it.what)}</p>
              <p class="tiny muted">${esc(it.why)}</p>
              <div class="spread" style="margin-top:2px">
                <span class="tiny muted">${esc(it.accent)}</span>
                <a class="chip" target="_blank" rel="noopener" href="${esc(it.url)}">Ouvrir ↗</a>
              </div>
              <p class="tiny" style="color:var(--ink-3)">${esc(it.transcript)}</p>
            </div>`).join("")}
        </div>
      </section>`).join("")}

    <section class="stack">
      <div class="section-head"><h2>Et les séries ?</h2></div>
      <div class="card" style="border-color:var(--accent)">
        <p style="font-size:15.5px;line-height:1.6">${esc(SERIES_GUIDE.rule)}</p>
      </div>
      <p class="small muted">Je ne peux pas regarder de séries, donc je ne te donnerai pas de palmarès d'épisodes — j'inventerais des horodatages. Voilà plutôt les critères : avec eux tu juges n'importe quel titre en deux minutes.</p>
      <div class="card stack-s">
        <span class="eyebrow" style="color:var(--ok)">Plus facile quand…</span>
        ${SERIES_GUIDE.easier.map(x => `<div class="ex-line" style="grid-template-columns:1fr"><span class="full" style="font-size:14px">${esc(x.trait)}</span><span class="fr">${esc(x.why)}</span></div>`).join("")}
      </div>
      <div class="card stack-s">
        <span class="eyebrow" style="color:var(--bad)">Plus dur quand…</span>
        ${SERIES_GUIDE.harder.map(x => `<div class="ex-line" style="grid-template-columns:1fr"><span class="full" style="font-size:14px">${esc(x.trait)}</span><span class="fr">${esc(x.why)}</span></div>`).join("")}
      </div>
      <div class="plate small">${esc(SERIES_GUIDE.method)}</div>
    </section>

    <button class="btn primary big block" id="to-lib">Importer une source</button>
  </div>`;

  $("#back").onclick = () => go("today");
  $("#to-lib").onclick = () => go("library");
};

/* ───────────────────────── import d'une analyse ─────────────────────────
   Je ne sais pas regarder une vidéo. Un modèle qui en est capable, lui, peut
   en sortir une transcription horodatée ; cette fonction l'avale telle quelle,
   en vérifiant chaque champ plutôt qu'en faisant confiance. */

function analysisPrompt() {
  return `Tu prépares du matériel d'entraînement à la compréhension de l'anglais oral, pour un francophone de niveau B1-B2 dont le blocage est le décodage de la parole connectée (réductions en schwa, liaisons, consonnes avalées).

Vidéo à analyser : COLLE_ICI_L_URL_YOUTUBE

Choisis UN SEUL passage de 3 à 5 minutes, celui qui contient le plus de parole naturelle rapide et réduite. Transcris-le en segments de 6 à 16 mots, découpés sur les groupes de souffle, jamais au milieu d'une expression.

Réponds UNIQUEMENT avec ce JSON, sans aucun texte autour :

{
  "title": "titre court du passage",
  "yt": "identifiant de la vidéo, 11 caractères",
  "accent": "en-US",
  "segments": [
    {
      "full": "la phrase exacte, orthographe correcte et ponctuation",
      "t": 123.4,
      "e": 129.1,
      "red": "reecrit comme ca sonne vraiment, ex: whaddaya gonna do aboudit",
      "ipa": "API large avec les accents toniques",
      "fr": "traduction francaise naturelle",
      "tags": ["schwa"]
    }
  ]
}

Regles :
- "t" et "e" sont des secondes depuis le debut de la video, a la demi-seconde pres. Ils doivent etre exacts : l'application decoupe l'audio dessus.
- "accent" parmi : en-US, en-GB, en-AU, en-IE, en-IN, en-ZA, en-NZ, en-CA.
- "tags" parmi : schwa (formes faibles), gonna (contractions orales), linking (liaison), flap (T qui devient D), elision (consonne tombee), assim (did you devient didja), hdrop (H muet des pronoms), rhythm (rythme accentuel). Plusieurs possibles.
- Chaque segment doit contenir au moins une reduction reelle. Ecarte les passages sans parole.`;
}

/* Un autre modèle écrit "2:03" aussi volontiers que 123.4, et appelle les
   bornes t/e, start/end ou startTime/endTime selon son humeur. On accepte
   tout plutôt que de perdre les horodatages en silence — sans eux, la vidéo
   ne se cale nulle part. */
function toSeconds(v) {
  if (typeof v === "number") return isFinite(v) ? v : null;
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (/^\d+(\.\d+)?$/.test(s)) return parseFloat(s);
  if (/^(\d{1,2}:)?\d{1,2}:\d{2}(\.\d+)?$/.test(s)) {
    const p = s.split(":").map(parseFloat);
    return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1];
  }
  return null;
}

function firstDefined() {
  for (let i = 0; i < arguments.length; i++) if (arguments[i] != null) return arguments[i];
  return null;
}

/* Une analyse, ou tout un lot : à qui l'on demande plusieurs vidéos, un
   modèle répond naturellement par un tableau. Une entrée mal formée ne doit
   pas emporter les autres — on la met de côté et on continue. */
function importAnalysis(raw) {
  let data;
  try { data = JSON.parse(raw); } catch (e) {
    const m = raw.match(/[\[{][\s\S]*[\]}]/);
    if (!m) throw new Error("Ce n'est pas du JSON. Recopie la réponse entière, crochets ou accolades compris.");
    data = JSON.parse(m[0]);
  }
  const list = Array.isArray(data) ? data
    : (Array.isArray(data.videos) ? data.videos
    : (Array.isArray(data.items) ? data.items : [data]));
  const items = [], errs = [];
  list.forEach((d, i) => {
    try { items.push(buildItem(d)); }
    catch (e) { errs.push("entrée " + (i + 1) + " : " + e.message); }
  });
  if (!items.length) throw new Error(errs.length ? errs.join(" · ") : "Aucune analyse exploitable dans ce JSON.");
  return items;
}

function buildItem(data) {
  if (!data || !Array.isArray(data.segments) || !data.segments.length) {
    throw new Error("pas de tableau « segments »");
  }
  const segs = [];
  for (const s of data.segments) {
    if (!s || typeof s.full !== "string" || !s.full.trim()) continue;
    const seg = {
      full: String(s.full).trim(),
      red: typeof s.red === "string" ? s.red : "",
      ipa: typeof s.ipa === "string" ? s.ipa : "",
      fr: typeof s.fr === "string" ? s.fr : "",
      tags: Array.isArray(s.tags) ? s.tags.filter(t => PATTERN_LABEL[t]) : []
    };
    const t = toSeconds(firstDefined(s.t, s.start, s.startTime, s.from));
    const e = toSeconds(firstDefined(s.e, s.end, s.endTime, s.to));
    if (t != null && t >= 0) {
      seg.t = t;
      seg.e = (e != null && e > t) ? e : t + Math.max(2, seg.full.split(/\s+/).length / 3);
    }
    segs.push(seg);
  }
  if (!segs.length) throw new Error("aucun segment exploitable");

  const accents = ACCENTS.map(a => a.code);
  const item = {
    id: uid(),
    title: (typeof data.title === "string" && data.title.trim()) ? data.title.trim().slice(0, 60) : "Analyse importée",
    segments: segs.slice(0, 220),
    hasAudio: false,
    at: dayKey(),
    yt: ytId(data.yt || data.url || ""),
    accent: accents.indexOf(data.accent) >= 0 ? data.accent : ""
  };
  return item;
}

/* Un modèle qui recommande des vidéos en invente parfois. On ne croit donc
   personne sur parole : YouTube lui-même confirme que l'identifiant existe,
   et rend le vrai titre et la vraie chaîne. Un identifiant inventé echoue ici,
   avant d'entrer dans la bibliothèque. */
async function verifyVideo(id) {
  if (!id) return { state: "none" };
  try {
    const u = "https://www.youtube.com/oembed?url="
      + encodeURIComponent("https://www.youtube.com/watch?v=" + id) + "&format=json";
    const r = await fetch(u);
    if (!r.ok) return { state: "missing" };
    const j = await r.json();
    return { state: "ok", title: j.title || "", author: j.author_name || "" };
  } catch (e) {
    return { state: "unknown" };   // hors ligne, ou politique de sécurité de l'hôte
  }
}

function verifyAll(items) {
  return Promise.all(items.map(it =>
    verifyVideo(it.yt).then(check => ({ item: it, check: check }))
  ));
}

const VERIFY_LABEL = {
  ok:      { chip: "ok",   text: "Vérifiée sur YouTube" },
  missing: { chip: "bad",  text: "Identifiant introuvable" },
  none:    { chip: "warn", text: "Aucun identifiant vidéo" },
  unknown: { chip: "warn", text: "Vérification impossible ici" }
};

/* Le prompt de sélection : c'est lui qui demande à l'autre modèle de choisir
   les vidéos, pas seulement de découper celle qu'on lui donne. */
function curationPrompt(n, theme) {
  return `Tu choisis des videos YouTube pour un programme d'entrainement a la
comprehension de l'anglais oral.

L'apprenant : francophone belge, niveau B1-B2. Il lit tres bien l'anglais mais
decroche des qu'on parle vite. Son blocage n'est ni le vocabulaire ni la
grammaire : c'est le decodage de la parole connectee — voyelles reduites en
schwa, liaisons, consonnes avalees, contractions orales. Objectif : comprendre
les films, series et podcasts sans sous-titres.

Propose ${n} videos.${theme ? " Theme souhaite : " + theme + "." : ""}

Criteres, par ordre d'importance :
1. De la vraie conversation entre plusieurs personnes, pas un monologue lu.
   Les hesitations, les reprises et les chevauchements sont un atout.
2. Une forte densite de reductions reelles.
3. Varie les accents : americain, britannique, et au moins un autre
   (irlandais, australien, indien, sud-africain...).
4. Varie la difficulte, de la plus accessible a la plus rapide.
5. Des videos publiques dont les sous-titres automatiques sont disponibles.

NE TRANSCRIS RIEN. Ne produis aucun dialogue, aucun horodatage, aucune
phonetique. Les mots exacts seront pris directement sur YouTube : toute
transcription que tu ecrirais de memoire serait fausse et inutilisable.

N'invente aucun identifiant. Si tu n'es pas certain qu'une video existe,
ecarte-la : chaque identifiant sera verifie aupres de YouTube.

Reponds UNIQUEMENT avec ce tableau JSON, sans aucun texte autour :

[
  {
    "yt": "identifiant de 11 caracteres",
    "title": "titre de la video",
    "accent": "en-US",
    "level": 3,
    "why": "une phrase en francais : ce que cette video entraine precisement"
  }
]

- "accent" parmi : en-US, en-GB, en-AU, en-IE, en-IN, en-ZA, en-NZ, en-CA.
- "level" de 1 (debit modere) a 5 (tres rapide).
- Classe du plus accessible au plus difficile.`;
}

/* Une liste de videos reperees, sans transcription : c'est tout ce qu'un
   modele peut fournir honnetement s'il n'a pas ecoute. Les mots viendront
   de YouTube, qui les connait. */
function importShortlist(list) {
  const accents = ACCENTS.map(a => a.code);
  const out = [];
  for (const d of list) {
    const id = ytId(d.yt || d.id || d.url || "");
    if (!id) continue;
    out.push({
      yt: id,
      title: (typeof d.title === "string" && d.title.trim()) ? d.title.trim().slice(0, 80) : "",
      accent: accents.indexOf(d.accent) >= 0 ? d.accent : "",
      level: Math.max(1, Math.min(5, parseInt(d.level, 10) || 3)),
      why: typeof d.why === "string" ? d.why.slice(0, 220) : ""
    });
  }
  if (!out.length) throw new Error("Aucun identifiant de vidéo exploitable dans cette liste.");
  return out;
}

function openShortlistReview(checked) {
  const good = checked.filter(c => c.check.state === "ok");
  sheet(`
    <h2 style="font-size:19px">Vidéos proposées</h2>
    <p class="small muted" style="margin:6px 0 14px">Chaque identifiant a été soumis à YouTube. Le titre affiché est le vrai — compare-le à ce qui t'a été annoncé.</p>
    <div class="stack-s">
      ${checked.map(c => {
        const L = VERIFY_LABEL[c.check.state] || VERIFY_LABEL.unknown;
        const a = accentInfo(c.item.accent);
        return `<div class="card stack-s">
          <div class="spread">
            <span class="row-tight tiny muted">${diffDots(c.item.level)}${a ? " " + esc(a.flag) + " " + esc(a.label) : ""}</span>
            <span class="chip ${L.chip}">${esc(L.text)}</span>
          </div>
          ${c.check.state === "ok"
            ? `<p class="small" style="font-weight:500">${esc(c.check.title)}</p><p class="tiny muted">${esc(c.check.author)}</p>`
            : `<p class="small" style="color:var(--bad)">${esc(c.item.title || c.item.yt)} — cette vidéo n'existe pas.</p>`}
          ${c.item.why ? `<p class="tiny muted">${esc(c.item.why)}</p>` : ""}
        </div>`;
      }).join("")}
    </div>
    <div class="stack-s" style="margin-top:16px">
      ${good.length ? `<button class="btn primary big block" id="sl-add">Garder les ${good.length} vidéos réelles</button>` : ""}
      <button class="btn bare block" id="sl-cancel">Annuler</button>
    </div>
  `, (root, close) => {
    const b = $("#sl-add", root);
    if (b) b.onclick = () => {
      for (const c of good) {
        if (S.shortlist.some(x => x.yt === c.item.yt)) continue;
        S.shortlist.push(Object.assign({}, c.item, {
          title: c.check.title || c.item.title,
          channel: c.check.author || ""
        }));
      }
      save(); close(); render();
      toast(good.length + " vidéo" + (good.length > 1 ? "s" : "") + " ajoutée" + (good.length > 1 ? "s" : "") + " à traiter");
    };
    $("#sl-cancel", root).onclick = close;
  });
}

/* On ne montre jamais le titre annoncé par le modèle, mais celui que YouTube
   renvoie : c'est la seule façon de voir qu'une video a été inventée, ou
   qu'elle existe mais ne parle pas du tout de ce qui était promis. */
function openImportReview(checked) {
  const valid = checked.filter(c => c.check.state !== "missing");
  const broken = checked.length - valid.length;

  const commit = list => {
    let segs = 0;
    for (const c of list) {
      const it = c.item;
      if (c.check.state === "missing") it.yt = "";          // la vidéo n'existe pas : on garde le texte
      if (c.check.state === "ok" && c.check.title) it.source = c.check.title;
      S.library.push(it);
      pushLibraryItem(it);
      segs += it.segments.length;
    }
    save();
    toast(list.length + " source" + (list.length > 1 ? "s" : "") + " · " + segs + " segments");
    const first = list[0] && list[0].item;
    if (first) { newSession("lib:" + first.id); go("decode", "lib:" + first.id); }
    else render();
  };

  sheet(`
    <h2 style="font-size:19px">Vérification</h2>
    <p class="small muted" style="margin:6px 0 10px">Chaque identifiant a été soumis à YouTube. Le titre ci-dessous est celui que <em>YouTube</em> renvoie, pas celui annoncé.</p>
    <div class="plate small" style="margin-bottom:14px;border-left:3px solid var(--warn)">
      Ceci prouve que la vidéo <strong>existe</strong>. Pas que la transcription lui corresponde. Un modèle qui n'a pas réellement écouté peut écrire un dialogue plausible sur une vraie vidéo — lance la lecture du premier segment avant de faire confiance au reste.
    </div>
    <div class="stack-s">
      ${checked.map(c => {
        const L = VERIFY_LABEL[c.check.state] || VERIFY_LABEL.unknown;
        const a = accentInfo(c.item.accent);
        const timed = c.item.segments.filter(s => s.t != null).length;
        return `<div class="card stack-s">
          <div class="spread">
            <span style="font-weight:600;font-size:14.5px">${esc(c.item.title)}</span>
            <span class="chip ${L.chip}">${esc(L.text)}</span>
          </div>
          ${c.check.state === "ok"
            ? `<p class="small">${esc(c.check.title)}<span class="tiny muted"> — ${esc(c.check.author)}</span></p>`
            : c.check.state === "missing"
              ? `<p class="tiny" style="color:var(--bad)">Cet identifiant ne correspond à aucune vidéo. Le texte reste utilisable en synthèse vocale, mais sans la vraie voix.</p>`
              : ""}
          <span class="tiny muted">${c.item.segments.length} segment${c.item.segments.length > 1 ? "s" : ""} · ${timed} horodaté${timed > 1 ? "s" : ""}${a ? " · " + esc(a.flag) + " " + esc(a.label) : ""}</span>
        </div>`;
      }).join("")}
    </div>
    <div class="stack-s" style="margin-top:16px">
      ${valid.length ? `<button class="btn primary big block" id="imp-good">Importer ${valid.length === checked.length ? "les " + valid.length + " sources" : "les " + valid.length + " vérifiées"}</button>` : ""}
      ${broken ? `<button class="btn ghost block" id="imp-all">Tout importer, y compris les ${broken} sans vidéo</button>` : ""}
      <button class="btn bare block" id="imp-cancel">Annuler</button>
    </div>
  `, (root, close) => {
    const g = $("#imp-good", root); if (g) g.onclick = () => { close(); commit(valid); };
    const a = $("#imp-all", root);  if (a) a.onclick = () => { close(); commit(checked); };
    $("#imp-cancel", root).onclick = close;
  });
}

/* ───────────────────────── view: settings ───────────────────────── */

VIEWS.settings = function (v) {
  Speech.resolve();
  const voices = Speech.voices;
  v.innerHTML = `
  <div class="stack-l">
    <button class="btn bare" id="back" style="align-self:flex-start;margin-left:-8px">${ICON.back} Retour</button>
    <h1 style="font-size:25px">Réglages</h1>

    <section class="stack">
      <div class="field">
        <label for="s-goal">Objectif quotidien</label>
        <select id="s-goal">${[5, 10, 15, 20, 30, 45].map(n => `<option value="${n}" ${S.profile.goalMin === n ? "selected" : ""}>${n} minutes</option>`).join("")}</select>
      </div>
      <div class="field">
        <label for="s-voice">Voix de synthèse</label>
        <select id="s-voice">
          <option value="">Automatique</option>
          ${voices.map(x => `<option value="${esc(x.voiceURI)}" ${S.profile.voiceURI === x.voiceURI ? "selected" : ""}>${esc(x.name)} — ${esc(x.lang)}</option>`).join("")}
        </select>
        <span class="tiny muted">${voices.length ? "Alterne entre une voix américaine et une britannique : ton oreille doit apprendre les deux." : "Aucune voix anglaise détectée dans ce navigateur."}</span>
      </div>
      <div class="field">
        <label for="s-rate">Vitesse de base — <span class="mono" id="s-rate-v">${S.profile.rate.toFixed(2)}×</span></label>
        <input type="range" id="s-rate" min="0.7" max="1.3" step="0.05" value="${S.profile.rate}" style="width:100%">
        <span class="tiny muted">Monte-la progressivement. À 1,15× tu seras au débit d'une série.</span>
      </div>
      <button class="btn ghost" id="s-test">${ICON.play} Tester la voix</button>
    </section>

    <section class="stack">
      <div class="section-head"><h2>Roulette d'accents</h2><span class="eyebrow">${(S.profile.roulette || []).length || "off"}</span></div>
      <p class="small muted">Coche plusieurs accents : chaque segment de dictée sera tiré au hasard parmi eux, et l'accent ne t'est révélé qu'après ta réponse. C'est ce qui empêche ton oreille de se spécialiser sur une seule voix.</p>
      <div class="stack-s">
        ${ACCENTS.map(a => {
          const has = !!Speech.voiceFor(a.code);
          const on = (S.profile.roulette || []).includes(a.code);
          return `<button class="lesson-item ${on ? "done" : ""}" data-acc="${esc(a.code)}" ${has ? "" : "disabled style=\"opacity:.45\""}>
            <span class="num">${on ? "✓" : esc(a.flag)}</span>
            <span class="grow"><span class="t">${esc(a.label)}</span><span class="d">${has ? esc(a.note) : "Aucune voix installée sur cet appareil"}</span></span>
          </button>`;
        }).join("")}
      </div>
      <p class="tiny muted">Sur iPhone, tu peux ajouter des voix dans Réglages → Accessibilité → Contenu énoncé → Voix. Prends-en une américaine et une britannique au minimum.</p>
    </section>

    <section class="stack">
      <div class="section-head"><h2>Claude</h2><span class="chip ${AIC.available() ? "ok" : ""}">${AIC.available() ? "Actif" : "Inactif"}</span></div>
      <p class="small muted">Cette version est hébergée par toi, elle n'a donc plus accès à ton abonnement claude.ai. Pour la correction de tes textes, l'analyse phonétique des sous-titres importés et la conversation, il faut une clé API. Tout le reste — dictée, Lab, révisions, shadowing, YouTube — marche sans.</p>
      <div class="field">
        <label for="s-key">Clé API</label>
        <input type="password" id="s-key" value="${esc(AIC.key())}" placeholder="sk-ant-..." autocomplete="off" spellcheck="false">
        <span class="tiny muted">Elle reste sur cet appareil, dans le stockage de Safari, et ne part que vers api.anthropic.com. Crée-la sur console.anthropic.com → API keys.</span>
      </div>
      <div class="field">
        <label for="s-model">Modèle</label>
        <select id="s-model">
          ${MODELS.map(m => `<option value="${esc(m.id)}" ${AIC.model() === m.id ? "selected" : ""}>${esc(m.name)} — ${esc(m.price)}</option>`).join("")}
        </select>
        <span class="tiny muted">${esc((MODELS.find(m => m.id === AIC.model()) || {}).note || "")} Pour te donner un ordre de grandeur : analyser 8 segments de sous-titres, c'est de l'ordre du millier de tokens.</span>
      </div>
      <div class="row">
        <button class="btn sm ghost" id="s-key-test">Tester la clé</button>
        ${AIC.minimal() ? `<button class="btn sm bare" id="s-key-reset">Réactiver les options avancées</button>` : ""}
      </div>
      <div id="s-key-status"></div>
      ${AIC.minimal() ? `<p class="tiny muted">Les sorties structurées ont été refusées par l'API et sont désactivées ; l'app lit le JSON en mode tolérant. Tu peux réessayer avec le bouton ci-dessus.</p>` : ""}
    </section>

    <section class="stack">
      <div class="section-head"><h2>Données</h2></div>
      <div class="card flat stack-s">
        <p class="small muted">Tout est enregistré sur cet appareil, rien n'est envoyé nulle part. Pour passer sur un autre téléphone ou après avoir vidé le cache de Safari : exporte ici, importe là-bas. Les audios importés, eux, ne voyagent pas — ils sont trop lourds pour l'export.</p>
        <div class="row">
          <button class="btn sm ghost" id="s-export">Exporter (JSON)</button>
          <button class="btn sm ghost" id="s-import">Importer</button>
          <input type="file" id="s-import-file" accept="application/json,.json" hidden>
          <button class="btn sm bare" id="s-reset" style="color:var(--bad)">Tout effacer</button>
        </div>
      </div>
      <div class="stat-row">
        <div class="stat"><div class="v">${Object.keys(S.days).length}</div><div class="k">jours actifs</div></div>
        <div class="stat"><div class="v">${S.cards.length}</div><div class="k">cartes</div></div>
        <div class="stat"><div class="v">${S.writings.length}</div><div class="k">textes</div></div>
      </div>
    </section>

    <section class="stack">
      <div class="card flat stack-s">
        <span class="eyebrow">Installer sur l'iPhone</span>
        <p class="small muted">Safari → bouton Partager → « Sur l'écran d'accueil ». Schwa s'ouvre alors en plein écran, avec sa propre icône, comme n'importe quelle app.</p>
      </div>
    </section>
  </div>`;

  $("#back").onclick = () => go("today");

  $("#s-key").onchange = e => { AIC.setKey(e.target.value); render(); };
  $("#s-model").onchange = e => { AIC.setModel(e.target.value); render(); };
  const kr = $("#s-key-reset"); if (kr) kr.onclick = () => { AIC.setMinimal(false); render(); toast("Options avancées réactivées"); };
  $("#s-key-test").onclick = async () => {
    const st = $("#s-key-status");
    AIC.setKey($("#s-key").value);
    if (!AIC.available()) { st.innerHTML = `<p class="small" style="color:var(--bad)">Colle d'abord une clé.</p>`; return; }
    st.innerHTML = `<div class="row-tight small muted"><span class="spinner"></span> Test en cours…</div>`;
    try {
      const r = await ask("Reply with exactly: ok", { effort: "low", maxTokens: 16 });
      st.innerHTML = `<p class="small" style="color:var(--ok)">La clé fonctionne (${esc(aiCostNote())}). Réponse : ${esc(r.text.slice(0, 40))}</p>`;
    } catch (e) {
      st.innerHTML = `<p class="small" style="color:var(--bad)">${esc(aiErrorMessage(e))}</p>`;
    }
  };

  $("#s-goal").onchange = e => { S.profile.goalMin = parseInt(e.target.value, 10); save(); };
  $("#s-voice").onchange = e => { S.profile.voiceURI = e.target.value; Speech.resolve(); save(); };
  $("#s-rate").oninput = e => { S.profile.rate = parseFloat(e.target.value); $("#s-rate-v").textContent = S.profile.rate.toFixed(2) + "×"; };
  $("#s-rate").onchange = () => save();
  $("#s-test").onclick = () => Speech.speak("I was going to call you, but I ran out of time.", 1, null);
  $$("[data-acc]").forEach(b => b.onclick = () => {
    const c = b.dataset.acc;
    const cur = S.profile.roulette || (S.profile.roulette = []);
    const i = cur.indexOf(c);
    if (i >= 0) cur.splice(i, 1); else cur.push(c);
    save(); render();
  });
  $("#s-export").onclick = () => {
    const blob = new Blob([JSON.stringify(S, null, 2)], { type: "application/json" });
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = u; a.download = "schwa-" + dayKey() + ".json"; a.click();
    setTimeout(() => URL.revokeObjectURL(u), 4000);
  };
  $("#s-import").onclick = () => $("#s-import-file").click();
  $("#s-import-file").onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      if (!data || typeof data !== "object" || !data.profile) throw new Error("shape");
      S = Object.assign(clone(DEFAULT), data);
      DEC = null; REV = null; LABD = null;
      save(); render();
      toast("Progression restaurée");
    } catch (err) {
      toast("Ce fichier n'est pas un export Schwa.");
    }
  };
  $("#s-reset").onclick = () => {
    sheet(`<h2 style="font-size:18px">Tout effacer ?</h2>
      <p class="small muted" style="margin:8px 0 16px">Séries, cartes, textes, bibliothèque. C'est définitif.</p>
      <div class="row"><button class="btn ghost grow" id="no">Annuler</button><button class="btn hot grow" id="yes">Effacer</button></div>`,
      (root, close) => {
        $("#no", root).onclick = close;
        $("#yes", root).onclick = () => {
          S = clone(DEFAULT);
          DEC = null; REV = null; LABD = null;
          WRI = { mode: "essay", text: "", result: null, busy: false, chat: [], input: "", chatBusy: false, topic: "" };
          save(); close(); go("today"); toast("Remis à zéro");
        };
      });
  };
};

/* ───────────────────────── boot ───────────────────────── */

function boot() {
  loadLocal();
  Speech.init();
  today();
  startClock();
  render();
  initCaps();

  window.addEventListener("scroll", () => {
    const t = $("#topbar"); if (t) t.classList.toggle("scrolled", window.scrollY > 6);
  }, { passive: true });
  document.addEventListener("visibilitychange", () => { if (document.hidden) Player.stop(); });
  window.addEventListener("pagehide", () => { saveLocal(); Player.stop(); });

  Tube.wire(() => render());
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();

})();
