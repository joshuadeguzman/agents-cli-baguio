/* Terminal replay for the DevFest Baguio pages.
   Plays recorded commands and output from window.DEMO (assets/demo-data.js).
   Used by demo/, the slides (through an iframe) and the codelab. */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  /* A Player renders steps into a <div class="term-body"> and can be skipped. */
  function Player(body, opts) {
    this.body = body;
    this.opts = opts || {};
    this.token = 0;
    this.playing = false;
  }
  Player.prototype.clear = function () { this.token++; this.playing = false; this.body.textContent = ""; };
  Player.prototype.skip = function () { this.fast = true; };
  Player.prototype.scroll = function () { this.body.scrollTop = this.body.scrollHeight; };

  Player.prototype.wait = function (ms, tok) {
    var self = this;
    return new Promise(function (res) {
      if (self.fast || reduce || ms <= 0) return res(tok === self.token);
      setTimeout(function () { res(tok === self.token); }, ms);
    });
  };

  Player.prototype.prompt = function (cwd) {
    var line = el("div", "t-line t-cmd");
    line.appendChild(el("span", "t-cwd", cwd || "~"));
    line.appendChild(el("span", "t-dollar", " $ "));
    var txt = el("span", "t-typed");
    line.appendChild(txt);
    var caret = el("span", "t-caret");
    line.appendChild(caret);
    this.body.appendChild(line);
    return { txt: txt, caret: caret };
  };

  Player.prototype.typeCmd = async function (step, tok) {
    var p = this.prompt(step.cwd);
    var s = step.cmd, speed = this.opts.typeMs != null ? this.opts.typeMs : 22;
    for (var i = 0; i < s.length; i++) {
      if (this.fast || reduce) { p.txt.textContent = s; break; }
      p.txt.textContent = s.slice(0, i + 1);
      this.scroll();
      if (!(await this.wait(speed, tok))) return false;
    }
    p.caret.remove();
    return this.wait(260, tok);
  };

  Player.prototype.lines = async function (lines, tok) {
    var n = lines.length, per = n > 60 ? 8 : n > 20 ? 22 : 55;
    for (var i = 0; i < n; i++) {
      var l = lines[i], s = typeof l === "string" ? l : l.s, k = typeof l === "string" || !s ? "" : l.k;
      var d = el("div", "t-line" + (k ? " t-" + k : "") + (/RESULT: PASS|✅|✓/.test(s) ? " t-ok" : /⚠️|Warning/.test(s) ? " t-warn" : /❌|Error|FAILED/.test(s) ? " t-err" : ""));
      d.textContent = s || "\u00a0";
      var prev = this.body.lastElementChild;
      var tagged = k === "sample" || k === "sim";
      if (tagged && !(prev && new RegExp("\\bt-" + k + "\\b").test(prev.className))) { d.className += " t-tag"; d.setAttribute("data-tag", k === "sim" ? "simulated" : "sample"); }
      if (k === "sample") d.title = "Sample. Needs a real API key, so this line was not recorded.";
      if (k === "sim") d.title = "Simulated. This step needs a billed Google Cloud project and was not run.";
      this.body.appendChild(d);
      this.scroll();
      if (!(await this.wait(per, tok))) return false;
    }
    return true;
  };

  Player.prototype.edit = async function (step, tok) {
    var box = el("div", "t-edit");
    box.appendChild(el("div", "t-edit-h", "edit " + step.edit));
    this.body.appendChild(box);
    for (var i = 0; i < step.diff.length; i++) {
      var d = step.diff[i];
      var row = el("div", "t-line t-diff t-diff-" + (d[0] === "+" ? "add" : d[0] === "-" ? "del" : "ctx"));
      row.textContent = (d[0] === " " ? "  " : d[0] + " ") + (d[1] || "");
      box.appendChild(row);
      this.scroll();
      if (!(await this.wait(120, tok))) return false;
    }
    return this.wait(300, tok);
  };

  /* Play a list of steps. Resolves true if it finished, false if cancelled. */
  Player.prototype.play = async function (steps, instant) {
    var tok = ++this.token;
    this.fast = !!instant;
    this.playing = true;
    for (var i = 0; i < steps.length; i++) {
      var st = steps[i], ok = true;
      if (st.cmd) ok = await this.typeCmd(st, tok);
      if (ok && st.edit) ok = await this.edit(st, tok);
      if (ok && st.out && st.out.length) ok = await this.lines(st.out, tok);
      if (!ok || tok !== this.token) return false;
      if (i < steps.length - 1 && !(await this.wait(350, tok))) return false;
    }
    if (tok === this.token) { this.playing = false; this.fast = false; }
    return true;
  };

  function scene(id) {
    var s = (window.DEMO && window.DEMO.scenes) || [];
    for (var i = 0; i < s.length; i++) if (s[i].id === id) return s[i];
    return null;
  }

  /* Codelab helper: <pre data-demo="scene:stepIndex"> gets a "Show output" button. */
  function attachPreviews(root) {
    [].slice.call((root || document).querySelectorAll("pre[data-demo]")).forEach(function (pre) {
      var ref = pre.getAttribute("data-demo").split(":"), sc = scene(ref[0]);
      if (!sc) return;
      var idx = ref[1] === "all" ? null : ref[1].split(",").map(Number);
      var steps = idx ? idx.map(function (i) { return sc.steps[i]; }) : sc.steps;
      var holder = pre.closest(".code") || pre;
      var btn = el("button", "run-btn", "▶ Show output");
      btn.type = "button";
      var term = el("div", "term term-mini");
      term.hidden = true;
      var bar = el("div", "term-bar");
      bar.appendChild(el("span", "term-dots"));
      bar.appendChild(el("span", "term-title", "Recorded output"));
      var replay = el("button", "term-replay", "Replay");
      replay.type = "button";
      bar.appendChild(replay);
      term.appendChild(bar);
      var body = el("div", "term-body");
      term.appendChild(body);
      holder.parentNode.insertBefore(term, holder.nextSibling);
      var tools = holder.querySelector(".code-tools") || holder;
      tools.appendChild(btn);
      var player = new Player(body, { typeMs: 12 });
      function go() { player.clear(); player.play(steps); }
      btn.onclick = function () {
        if (term.hidden) { term.hidden = false; btn.textContent = "Hide output"; go(); }
        else { term.hidden = true; player.clear(); btn.textContent = "▶ Show output"; }
      };
      replay.onclick = go;
      body.onclick = function () { player.skip(); };
    });
  }

  window.Term = { Player: Player, scene: scene, attachPreviews: attachPreviews, el: el };
})();
