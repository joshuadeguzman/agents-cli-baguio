/* Live demo slides: terminal tabs on the left, Gemini-style chat on the right.
   Each slide with class "lv-slide" is driven by the deck's step markers (<i data-step="1..n">), so the clicker works.
   Its config comes from window.LIVE_DEMOS[slide.id]. Terminal output comes from the config's scenes, or from
   window.DEMO (real recordings, plus tagged sample/simulated lines). */
(function () {
  "use strict";
  if (!window.Term) return;
  var T = window.Term;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Root cause agent: tool call counts come from sample_logs; answers are samples. */
  window.LIVE_DEMOS = window.LIVE_DEMOS || {};
  window.LIVE_DEMOS.liveDemo = window.LIVE_DEMOS.liveDemo || {
    name: "Root cause agent",
    hello: "Root cause agent, on your laptop.<span>Same agent, nothing deployed. Pick a question below.</span>",
    port: 8080,
    note: "Sample answer. Live answers vary.",
    actions: [
      { tab: "setup", scenes: ["install"] },
      { tab: "coding agent", scenes: ["prompt"] },
      { tab: "playground", scene: "playground", first: true, then: "local" },
      { chat: 0 },
      { tab: "eval", scenes: ["eval"] },
      { tab: "deploy", scenes: ["deploy"], then: "live" },
      { chat: 2 }
    ],
    chats: [
      { q: "What went wrong in order-api.log?",
        tools: ["find_errors · 15 lines", "read_log · order-api.log"],
        a: ["<b>Payments time out after the v2.4.1 deploy.</b> <code>PAYMENT_TIMEOUT_MS</code> is set to 30 ms (line 4), but the payment gateway takes about 400 ms to answer (line 29).",
            "Every charge fails after 30 ms, both retries fail, and <code>/pay</code> returns 502 (lines 14 to 19 and 23 to 28).",
            "<b>Fix:</b> set <code>PAYMENT_TIMEOUT_MS=3000</code>, the value v2.4.0 used, and redeploy."] },
      { q: "Is anything broken in order-api-healthy.log?",
        tools: ["find_errors · 1 line"],
        a: ["No. Every payment succeeds (<code>charge ok</code>, about 430 ms).",
            "The only warning is a cache miss on line 9, which is normal on a cold cache."] },
      { q: "Which lines prove the timeout?",
        tools: ["read_log · order-api.log"],
        a: ["Line 4: <code>config PAYMENT_TIMEOUT_MS=30</code>",
            "Line 14: <code>TimeoutError(\"payment gateway did not respond within 30ms\")</code>",
            "Line 29: <code>pay.example.com status check ok p50=412ms</code>"] },
      { q: "What should I check before I redeploy?",
        tools: [],
        a: ["Compare the config block with yesterday's log: only <code>PAYMENT_TIMEOUT_MS</code> changed, from 3000 to 30.",
            "After the fix, watch the payment success rate alert on line 32 go back above 95%."] }
    ]
  };

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  function init(slide, cfg) {
    var q = function (k) { return slide.querySelector('[data-lv="' + k + '"]'); };
    var tabsEl = q("tabs"), idle = q("idle"), titleEl = q("title"), chat = q("chat");
    var msgs = q("msgs"), chipsEl = q("chips"), statusEl = q("status"), brandEl = q("brand"), crumbEl = q("crumb");
    if (!tabsEl || !idle || !msgs) return;
    var termBox = idle.parentNode;
    var EMPTY = msgs.innerHTML;

    function scene(id) {
      if (cfg.scenes) { for (var i = 0; i < cfg.scenes.length; i++) if (cfg.scenes[i].id === id) return cfg.scenes[i]; }
      return T.scene(id);
    }
    function stepsFor(a) {
      if (a.scene) { var s = scene(a.scene); return s ? (a.first ? [s.steps[0]] : s.steps) : []; }
      var out = [];
      (a.scenes || []).forEach(function (id) { var s = scene(id); if (s) out = out.concat(s.steps); });
      return out;
    }

    var tabs = [], done = 0, busy = Promise.resolve(), gen = 0, live = false, sending = false, hurry = false;

    function showTab(i) {
      tabs.forEach(function (t, j) { t.btn.classList.toggle("on", j === i); t.body.hidden = j !== i; });
      idle.hidden = tabs.length > 0;
      if (tabs[i]) titleEl.textContent = tabs[i].name + " • zsh";
    }

    function openTab(a) {
      var btn = el("button", "lv-tab", "<i>" + (tabs.length + 1) + "</i>" + a.tab);
      btn.type = "button";
      var body = el("div", "lv-body");
      var player = new T.Player(body, { typeMs: 16 });
      var t = { name: a.tab, btn: btn, body: body, player: player };
      var i = tabs.length;
      btn.onclick = function (e) { e.stopPropagation(); showTab(i); };
      body.onclick = function () { player.skip(); };
      tabs.push(t);
      tabsEl.appendChild(btn);
      termBox.appendChild(body);
      showTab(i);
      return t;
    }

    function setMode(mode) {
      chat.classList.toggle("local", mode === "local");
      chat.classList.toggle("live", mode === "live");
      live = mode !== "none";
      if (mode === "local") { brandEl.textContent = "ADK playground"; crumbEl.textContent = "127.0.0.1:" + cfg.port + " / app"; statusEl.textContent = "Running locally"; }
      else if (mode === "live") { brandEl.textContent = "Gemini Enterprise"; crumbEl.textContent = "/ Agents / " + cfg.name; statusEl.textContent = "Deployed · Agent Runtime"; }
      else { brandEl.textContent = "Chat"; crumbEl.textContent = cfg.name; statusEl.textContent = "Not built"; }
    }

    function chips() {
      chipsEl.innerHTML = "";
      cfg.chats.forEach(function (c, i) {
        var b = el("button", "lv-chip");
        b.type = "button";
        b.textContent = c.q;
        b.style.animationDelay = (i * 80) + "ms";
        b.onclick = function (e) { e.stopPropagation(); if (!sending) send(i, false); };
        chipsEl.appendChild(b);
      });
    }

    var THEN = {
      local: function () {
        setMode("local");
        msgs.innerHTML = "";
        msgs.appendChild(el("div", "lv-hello", cfg.hello));
        chips();
      },
      live: function () {
        setMode("live");
        msgs.appendChild(el("div", "lv-sep", "Now deployed and published to Gemini Enterprise"));
        msgs.scrollTop = msgs.scrollHeight;
        chips();
      }
    };

    function wait(ms, instant) { return new Promise(function (r) { setTimeout(r, instant || hurry || reduce ? 0 : ms); }); }

    function slideSpark() {
      var svg = slide.querySelector(".lv-top svg");
      if (!svg) return "";
      var html = svg.outerHTML.replace(/style="[^"]*"/, "");
      var id = (html.match(/id="([^"]+)"/) || [])[1];
      return id ? html.split(id).join(id + Math.random().toString(36).slice(2, 7)) : html;
    }

    async function send(i, instant) {
      var c = cfg.chats[i], my = gen;
      sending = true;
      [].forEach.call(chipsEl.children, function (b, j) { b.disabled = true; if (j === i) b.classList.add("used"); });
      var hello = msgs.querySelector(".lv-hello"); if (hello) hello.remove();
      msgs.appendChild(el("div", "lv-user")).textContent = c.q;
      msgs.scrollTop = msgs.scrollHeight;
      await wait(450, instant); if (my !== gen) return;
      var bot = el("div", "lv-bot");
      bot.innerHTML = slideSpark();
      var col = el("div", "");
      bot.appendChild(col);
      msgs.appendChild(bot);
      if (c.tools.length) {
        var tl = el("div", "lv-tools"); col.appendChild(tl);
        for (var k = 0; k < c.tools.length; k++) {
          tl.appendChild(el("span", "lv-tool")).textContent = c.tools[k];
          msgs.scrollTop = msgs.scrollHeight;
          await wait(550, instant); if (my !== gen) return;
        }
      }
      var ans = el("div", "lv-ans"); col.appendChild(ans);
      for (var p = 0; p < c.a.length; p++) {
        var para = el("p", ""); ans.appendChild(para);
        var words = c.a[p].split(" ");
        for (var w = 0; w < words.length; w++) {
          para.innerHTML = words.slice(0, w + 1).join(" ");
          msgs.scrollTop = msgs.scrollHeight;
          if (!instant && !hurry && !reduce) { await wait(28, false); if (my !== gen) return; }
        }
      }
      col.appendChild(el("div", "lv-note", cfg.note));
      msgs.scrollTop = msgs.scrollHeight;
      [].forEach.call(chipsEl.children, function (b) { b.disabled = false; });
      sending = false;
    }

    async function act(n, instant) {
      var a = cfg.actions[n - 1];
      if (!a) return;
      if (a.chat != null) { if (live) await send(a.chat, instant); return; }
      var t = openTab(a);
      await t.player.play(stepsFor(a), instant);
      if (a.then) THEN[a.then]();
    }

    function reset() {
      gen++;
      tabs.forEach(function (t) { t.player.clear(); t.btn.remove(); t.body.remove(); });
      tabs = []; done = 0; live = false; sending = false;
      setMode("none");
      msgs.innerHTML = EMPTY; chipsEl.innerHTML = "";
      idle.hidden = false; titleEl.textContent = "zsh";
    }

    /* Bring the slide to n completed presses. One step forward animates; anything else jumps. */
    function sync(n) {
      busy = busy.then(async function () {
        if (n === done) return;
        if (n === done + 1) { hurry = false; done = n; await act(n, false); return; }
        reset();
        for (var i = 1; i <= n; i++) { done = i; await act(i, true); }
      });
    }

    var markers = [].slice.call(slide.querySelectorAll("i[data-step]"));
    function count() { return markers.filter(function (m) { return m.classList.contains("is-on"); }).length; }
    var pending = false;
    new MutationObserver(function () {
      if (pending) return; pending = true;
      Promise.resolve().then(function () {
        pending = false;
        var n = count();
        if (n !== done) { hurry = true; tabs.forEach(function (t) { t.player.skip(); }); }
        sync(n);
      });
    }).observe(slide, { attributes: true, subtree: true, attributeFilter: ["class"] });
    sync(count());
  }

  [].forEach.call(document.querySelectorAll(".lv-slide"), function (slide) {
    var cfg = window.LIVE_DEMOS[slide.id];
    if (cfg) init(slide, cfg);
  });
})();
