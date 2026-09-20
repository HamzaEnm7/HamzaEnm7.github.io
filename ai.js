/* Schwa — client Claude.
   La version Artifact appelait Claude via l'abonnement claude.ai. En auto-hébergé
   ce pont n'existe plus : on parle directement à l'API depuis le navigateur, avec
   une clé que tu fournis. L'API l'autorise explicitement (en-tête
   anthropic-dangerous-direct-browser-access, origine *). La clé ne quitte jamais
   cet appareil : elle va dans localStorage et, de là, seulement vers api.anthropic.com. */

const MODELS = [
  { id: "claude-opus-5",            name: "Opus 5",    note: "Le plus capable. Corrections les plus fines.", price: "5 $ / 25 $ par million de tokens" },
  { id: "claude-sonnet-5",          name: "Sonnet 5",  note: "Très bon, nettement moins cher.",              price: "2 $ / 10 $ par million de tokens" },
  { id: "claude-haiku-4-5",         name: "Haiku 4.5", note: "Rapide et économique. Suffit pour l'analyse des sous-titres.", price: "1 $ / 5 $ par million de tokens" }
];

const AIC = {
  KEY: "schwa.apiKey",
  MODEL: "schwa.model",
  MINIMAL: "schwa.minimalBody",

  key()      { try { return localStorage.getItem(this.KEY) || ""; } catch (e) { return ""; } },
  setKey(k)  { try { k ? localStorage.setItem(this.KEY, k.trim()) : localStorage.removeItem(this.KEY); } catch (e) {} },
  model()    { try { return localStorage.getItem(this.MODEL) || "claude-opus-5"; } catch (e) { return "claude-opus-5"; } },
  setModel(m){ try { localStorage.setItem(this.MODEL, m); } catch (e) {} },
  minimal()  { try { return localStorage.getItem(this.MINIMAL) === "1"; } catch (e) { return false; } },
  setMinimal(v) { try { v ? localStorage.setItem(this.MINIMAL, "1") : localStorage.removeItem(this.MINIMAL); } catch (e) {} },
  available(){ return !!this.key(); },

  headers() {
    const h = {
      "content-type": "application/json",
      "x-api-key": this.key(),
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    };
    if (!this.minimal() && this.model() === "claude-opus-5") {
      h["anthropic-beta"] = "server-side-fallback-2026-06-01";
    }
    return h;
  },

  /* input: une chaîne, ou des tours [{role, content}] finissant sur "user". */
  body(input, opts) {
    const o = opts || {};
    const messages = typeof input === "string"
      ? [{ role: "user", content: input }]
      : input.map(m => ({ role: m.role, content: m.content }));

    const b = { model: this.model(), max_tokens: o.maxTokens || 16000, messages };
    if (o.stream) b.stream = true;

    if (!this.minimal()) {
      if (o.effort) b.output_config = Object.assign(b.output_config || {}, { effort: o.effort });
      if (o.schema) b.output_config = Object.assign(b.output_config || {}, { format: { type: "json_schema", schema: o.schema } });
      if (this.model() === "claude-opus-5") b.fallbacks = [{ model: "claude-opus-4-8" }];
    }
    return b;
  },

  err(code, message, text) { return { code, message, text }; },

  async httpError(res) {
    let detail = "";
    try { const j = await res.json(); detail = (j.error && j.error.message) || ""; } catch (e) {}
    if (res.status === 401 || res.status === 403) return this.err("bad_key", detail || "Clé refusée");
    if (res.status === 429) return this.err("rate_limited", detail || "Trop de requêtes");
    if (res.status === 400) return this.err("bad_request", detail || "Requête refusée");
    if (res.status >= 500) return this.err("server", detail || "Erreur côté serveur");
    return this.err("http_" + res.status, detail || ("HTTP " + res.status));
  },

  textOf(msg) {
    // Le thinking est actif par défaut sur Opus 5 : on ne garde que les blocs texte.
    if (!msg || !Array.isArray(msg.content)) return "";
    return msg.content.filter(b => b && b.type === "text").map(b => b.text).join("").trim();
  },

  /* Un appel, avec repli automatique si le serveur refuse les paramètres avancés. */
  async send(input, opts) {
    if (!this.available()) throw this.err("no_key", "Aucune clé API enregistrée");
    const o = opts || {};
    const run = async () => {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify(this.body(input, o)),
        signal: o.signal
      });
      if (!res.ok) throw await this.httpError(res);
      return res.json();
    };

    let msg;
    try {
      msg = await run();
    } catch (e) {
      // output_config / fallbacks non acceptés sur ce compte ou ce modèle : on réessaie nu, une fois.
      if (e && e.code === "bad_request" && !this.minimal()) {
        this.setMinimal(true);
        msg = await run();
      } else throw e;
    }

    if (msg.stop_reason === "refusal") throw this.err("refused", "Claude a décliné cette demande");
    const text = this.textOf(msg);
    if (!text) throw this.err("empty", "Réponse vide");
    return { text, raw: msg };
  },

  /* Streaming SSE, pour la conversation. */
  async stream(input, opts) {
    if (!this.available()) throw this.err("no_key", "Aucune clé API enregistrée");
    const o = Object.assign({}, opts, { stream: true });
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(this.body(input, o)),
      signal: o.signal
    });
    if (!res.ok) throw await this.httpError(res);
    if (!res.body) { const j = await res.json(); return { text: this.textOf(j) }; }

    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "", text = "", stop = null, inText = false;

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop();
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        let ev;
        try { ev = JSON.parse(line.slice(5).trim()); } catch (e) { continue; }
        if (ev.type === "content_block_start") inText = ev.content_block && ev.content_block.type === "text";
        else if (ev.type === "content_block_stop") inText = false;
        else if (ev.type === "content_block_delta" && inText && ev.delta && ev.delta.type === "text_delta") {
          text += ev.delta.text;
          o.onText && o.onText({ text, delta: ev.delta.text });
        } else if (ev.type === "message_delta" && ev.delta) {
          stop = ev.delta.stop_reason || stop;
        }
      }
    }
    if (stop === "refusal") throw this.err("refused", "Claude a décliné cette demande", text);
    if (!text.trim()) throw this.err("empty", "Réponse vide");
    return { text };
  },

  /* Lecture tolérante : réponse entière, sinon bloc de code, sinon première
     structure JSON rencontrée. Utile même avec un schéma, en repli. */
  parseJSON(text) {
    const tries = [];
    tries.push(text);
    const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fence) tries.push(fence[1]);
    const first = text.search(/[[{]/);
    const lastA = text.lastIndexOf("]"), lastO = text.lastIndexOf("}");
    const last = Math.max(lastA, lastO);
    if (first >= 0 && last > first) tries.push(text.slice(first, last + 1));
    for (const t of tries) {
      try { return JSON.parse(t.trim()); } catch (e) {}
    }
    throw this.err("invalid_json", "Réponse illisible", text);
  },

  async json(input, opts) {
    const r = await this.send(input, opts);
    return this.parseJSON(r.text);
  }
};

/* Schémas — plus fiables que « réponds en JSON » en prose, surtout quand la
   réponse contient des apostrophes françaises. */
const SCHEMA_SEGMENTS = {
  type: "array",
  items: {
    type: "object",
    properties: {
      full: { type: "string" },
      red:  { type: "string" },
      ipa:  { type: "string" },
      fr:   { type: "string" },
      tags: { type: "array", items: { type: "string" } }
    },
    required: ["full", "red", "ipa", "fr", "tags"],
    additionalProperties: false
  }
};

const SCHEMA_ENRICH = {
  type: "array",
  items: {
    type: "object",
    properties: {
      red:  { type: "string" },
      ipa:  { type: "string" },
      fr:   { type: "string" },
      tags: { type: "array", items: { type: "string" } }
    },
    required: ["red", "ipa", "fr", "tags"],
    additionalProperties: false
  }
};

const SCHEMA_CORRECTION = {
  type: "object",
  properties: {
    corrected: { type: "string" },
    errors: {
      type: "array",
      items: {
        type: "object",
        properties: {
          was: { type: "string" }, now: { type: "string" },
          why: { type: "string" }, type: { type: "string" }
        },
        required: ["was", "now", "why", "type"],
        additionalProperties: false
      }
    },
    focus: {
      type: "object",
      properties: { title: { type: "string" }, explain: { type: "string" } },
      required: ["title", "explain"],
      additionalProperties: false
    },
    upgrades: {
      type: "array",
      items: {
        type: "object",
        properties: { plain: { type: "string" }, better: { type: "string" }, note: { type: "string" } },
        required: ["plain", "better", "note"],
        additionalProperties: false
      }
    },
    level: { type: "string" },
    verdict: { type: "string" }
  },
  required: ["corrected", "errors", "focus", "upgrades", "level", "verdict"],
  additionalProperties: false
};
