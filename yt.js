/* Schwa — lecteur YouTube encastré.
   Le vrai lecteur YouTube, piloté par l'app : la vidéo est lue chez YouTube,
   les vues comptent, l'auteur est payé. On ne télécharge rien.
   Il flotte au-dessus de l'interface, et reste masqué pendant la dictée —
   sinon les sous-titres incrustés et les lèvres donnent la réponse. */

const Tube = {
  apiP: null, player: null, ready: false, videoId: "", poll: null, onEnd: null,
  rates: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
  unlocked: false,
  blocked: false,

  el() { return document.getElementById("mini"); },

  loadAPI() {
    if (this.apiP) return this.apiP;
    this.apiP = new Promise((resolve, reject) => {
      if (window.YT && window.YT.Player) return resolve(window.YT);
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = function () { if (prev) prev(); resolve(window.YT); };
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      s.async = true;
      s.onerror = () => { this.blocked = true; reject(new Error("API YouTube inaccessible")); };
      document.head.appendChild(s);
      setTimeout(() => { if (!window.YT || !window.YT.Player) { this.blocked = true; reject(new Error("API YouTube : délai dépassé")); } }, 15000);
    });
    return this.apiP;
  },

  async mount(videoId) {
    if (this.player && this.videoId === videoId && this.ready) return this.player;
    const YT = await this.loadAPI();
    if (this.player) { try { this.player.destroy(); } catch (e) {} this.player = null; this.ready = false; }
    const slot = document.getElementById("yt-slot");
    slot.innerHTML = '<div id="yt-frame"></div>';
    this.videoId = videoId;
    return new Promise(resolve => {
      this.player = new YT.Player("yt-frame", {
        videoId,
        host: "https://www.youtube-nocookie.com",
        playerVars: {
          playsinline: 1, controls: 1, rel: 0, modestbranding: 1,
          cc_load_policy: 0, iv_load_policy: 3, disablekb: 1, fs: 0,
          origin: location.origin
        },
        events: {
          onReady: () => {
            this.ready = true;
            try { const r = this.player.getAvailablePlaybackRates(); if (r && r.length) this.rates = r; } catch (e) {}
            resolve(this.player);
          }
        }
      });
    });
  },

  /* YouTube n'accepte que ses propres vitesses : on prend la plus proche. */
  snapRate(r) {
    let best = this.rates[0], d = Infinity;
    for (const x of this.rates) { const dd = Math.abs(x - r); if (dd < d) { d = dd; best = x; } }
    return best;
  },

  /* iOS n'autorise la lecture programmée qu'après un premier geste de l'utilisateur.
     À appeler depuis un vrai clic. */
  async unlock(videoId) {
    await this.mount(videoId);
    try { this.player.playVideo(); this.player.pauseVideo(); this.unlocked = true; } catch (e) {}
    return this.unlocked;
  },

  async playSegment(videoId, t, e, rate, onEnd) {
    this.stop();
    await this.mount(videoId);
    const p = this.player;
    try { p.setPlaybackRate(this.snapRate(rate || 1)); } catch (err) {}
    const start = Math.max(0, t || 0);
    const end = e != null ? e : start + 6;
    try { p.seekTo(start, true); p.playVideo(); } catch (err) { onEnd && onEnd(); return; }
    this.onEnd = onEnd;
    clearInterval(this.poll);
    let waited = 0;
    this.poll = setInterval(() => {
      let cur = 0;
      try { cur = p.getCurrentTime(); } catch (err) { return; }
      waited += 100;
      // garde-fou : si la lecture ne démarre jamais (onglet bloqué), on rend la main
      if (waited > (end - start) * 1000 + 12000) return this.finish();
      if (cur >= end) this.finish();
    }, 100);
  },

  finish() {
    clearInterval(this.poll); this.poll = null;
    try { this.player && this.player.pauseVideo(); } catch (e) {}
    const cb = this.onEnd; this.onEnd = null;
    cb && cb();
  },

  stop() {
    clearInterval(this.poll); this.poll = null;
    this.onEnd = null;
    try { this.player && this.player.pauseVideo(); } catch (e) {}
  },

  /* ── mini-lecteur ─────────────────────────────────────────────── */

  show(title) {
    const m = this.el(); if (!m) return;
    m.hidden = false;
    const t = m.querySelector(".mini-title");
    if (t) t.textContent = title || "";
  },
  hide() { const m = this.el(); if (m) m.hidden = true; this.stop(); },
  isShown() { const m = this.el(); return m && !m.hidden; },

  mask(on) {
    const m = this.el(); if (!m) return;
    m.classList.toggle("masked", !!on);
    const b = m.querySelector('[data-mini="mask"]');
    if (b) b.textContent = on ? "Montrer" : "Masquer";
  },
  isMasked() { const m = this.el(); return m && m.classList.contains("masked"); },

  dock(pos) {
    const m = this.el(); if (!m) return;
    m.classList.toggle("top", pos === "top");
    try { localStorage.setItem("schwa.miniDock", pos); } catch (e) {}
  },

  wire(onClose) {
    const m = this.el(); if (!m || m.dataset.wired) return;
    m.dataset.wired = "1";
    m.addEventListener("click", ev => {
      const b = ev.target.closest("[data-mini]");
      if (!b) return;
      const a = b.dataset.mini;
      if (a === "mask")   this.mask(!this.isMasked());
      if (a === "reveal") this.mask(false);
      if (a === "dock")   this.dock(m.classList.contains("top") ? "bottom" : "top");
      if (a === "close")  { this.hide(); onClose && onClose(); }
    });
    let saved = "bottom";
    try { saved = localStorage.getItem("schwa.miniDock") || "bottom"; } catch (e) {}
    this.dock(saved);
  }
};
