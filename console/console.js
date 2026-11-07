/* Agent console: finds ADK playgrounds on 127.0.0.1 and chats with them over the ADK API.
   Discovery: GET /list-apps?detailed=true on each port, then /apps/{app}/app-info for tools.
   Chat: POST /apps/{app}/users/{user}/sessions, then POST /run_sse with streaming on.
   agents-cli playground starts the server with --allow_origins "*", so the browser can call it directly. */
(function () {
  "use strict";

  var HOST = "http://127.0.0.1";
  var DEFAULT_PORTS = [8080, 8501, 8502, 8503, 8504, 8505];
  var USER = "console-user";
  var SCAN_MS = 8000;

  /* Friendly names, icons and starter questions for the example agents, keyed by root agent name.
     Any other ADK agent still works: it gets a generic icon and its own name. */
  var CATALOG = {
    ask_your_data: { name: "Ask your data", icon: "query_stats", c: "#0B57D0", folder: "ask-your-data", port: 8080,
      blurb: "Answers questions about a sales CSV by running pandas code.",
      ask: ["What is the total revenue for the year?", "What's the median revenue per row, and which row is the biggest outlier above the mean?", "Which region sold more, and by how much?"] },
    root_cause_agent: { name: "Root cause agent", icon: "troubleshoot", c: "#B3261E", folder: "root-cause-agent", port: 8501,
      blurb: "Reads a log and explains what broke, with the lines that prove it.",
      ask: ["What went wrong in order-api.log?", "Is anything broken in order-api-healthy.log?"] },
    code_reviewer: { name: "Code reviewer", icon: "rate_review", c: "#146C2E", folder: "code-reviewer", port: 8502,
      blurb: "Reviews a branch for bugs, security problems and missing tests.",
      ask: ["Review this branch against main."] },
    design_reviewer: { name: "Design reviewer", icon: "palette", c: "#9B4DCA", folder: "design-reviewer", port: 8503,
      blurb: "Reviews a phone screenshot for contrast and tap targets.",
      ask: [{ text: "Review this screen. The subtitle is #B0B0B0 on #FFFFFF. The button is white text on #FFC107, and it is 120 x 36 dp.", image: "../samples/login.png" }] },
    release_notes_writer: { name: "Release notes writer", icon: "campaign", c: "#B06000", folder: "release-notes-writer", port: 8504,
      blurb: "Turns the commits since a tag into release notes for app users.",
      ask: ["Write release notes since v1.4.0."] },
    sales_brief: { name: "Sales brief team", icon: "groups", c: "#7B5EA7", folder: "sales-brief", port: 8505, workflow: true,
      blurb: "Four agents in one Workflow turn the sales CSV into a checked brief.",
      ask: ["Make this week's sales brief."] }
  };

  var $ = function (id) { return document.getElementById(id); };
  var el = function (tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  var esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); };

  var state = {
    ports: loadPorts(),
    agents: {},        // key "port/app" -> agent
    target: null,      // agent key
    sessions: {},      // agent key -> session id
    attach: null,      // {mime, data, url}
    busy: null,        // AbortController while streaming
    scanning: false
  };

  function loadPorts() {
    try { var p = JSON.parse(localStorage.getItem("agentConsole.ports")); if (Array.isArray(p) && p.length) return p; } catch (e) {}
    return DEFAULT_PORTS.slice();
  }

  /* ---------------- discovery ---------------- */
  function fetchJSON(url, ms) {
    var ctl = new AbortController();
    var t = setTimeout(function () { ctl.abort(); }, ms || 1500);
    return fetch(url, { signal: ctl.signal }).then(function (r) {
      clearTimeout(t);
      if (!r.ok) throw new Error(r.status + " " + r.statusText);
      return r.json();
    }, function (e) { clearTimeout(t); throw e; });
  }

  function scan() {
    if (state.scanning) return Promise.resolve();
    state.scanning = true;
    $("rescan").classList.add("spin");
    var seen = {};
    return Promise.all(state.ports.map(function (port) {
      return fetchJSON(HOST + ":" + port + "/list-apps?detailed=true").then(function (res) {
        var apps = (res && res.apps) || [];
        return Promise.all(apps.map(function (a) {
          var key = port + "/" + a.name;
          seen[key] = true;
          var old = state.agents[key];
          var ag = old || { key: key, port: port, app: a.name };
          ag.root = a.rootAgentName || a.name;
          ag.description = a.description || "";
          ag.online = true;
          var cat = CATALOG[ag.root] || {};
          ag.name = cat.name || pretty(ag.root);
          ag.icon = cat.icon || "smart_toy";
          ag.c = cat.c || "#5F6368";
          ag.blurb = cat.blurb || ag.description || "ADK agent on port " + port + ".";
          ag.ask = cat.ask || [];
          state.agents[key] = ag;
          if (ag.tools) return null;
          if (cat.workflow) { ag.tools = []; return null; }  // app-info only describes LlmAgent roots
          return fetchJSON(HOST + ":" + port + "/apps/" + encodeURIComponent(a.name) + "/app-info", 2500).then(function (info) {
            var me = info.agents && info.agents[info.rootAgentName];
            ag.tools = toolNames(me && me.tools);
            ag.subAgents = me && me.sub_agents ? me.sub_agents.map(function (s) { return s.name || s; }) : [];
          }, function () { ag.tools = []; });  // Workflow apps have no app-info; that's fine.
        }));
      }, function () { return null; });
    })).then(function () {
      Object.keys(state.agents).forEach(function (k) { if (!seen[k]) state.agents[k].online = false; });
      state.scanning = false;
      $("rescan").classList.remove("spin");
      if (!state.target || !state.agents[state.target] || !state.agents[state.target].online) {
        var first = onlineAgents()[0];
        if (first && !state.target) setTarget(first.key, true);
      }
      renderAll();
    });
  }

  function toolNames(tools) {
    var out = [];
    (tools || []).forEach(function (t) {
      if (typeof t === "string") out.push(t);
      else if (t && t.functionDeclarations) t.functionDeclarations.forEach(function (f) { out.push(f.name); });
      else if (t && t.name) out.push(t.name);
    });
    return out;
  }

  function pretty(s) { s = String(s).replace(/[_-]+/g, " "); return s.charAt(0).toUpperCase() + s.slice(1); }
  function onlineAgents() { return sortAgents(Object.keys(state.agents).map(function (k) { return state.agents[k]; }).filter(function (a) { return a.online; })); }
  function sortAgents(list) { return list.sort(function (a, b) { return state.ports.indexOf(a.port) - state.ports.indexOf(b.port) || a.app.localeCompare(b.app); }); }

  /* Catalog agents whose port has nothing on it, so people see what they can start. */
  function missingAgents() {
    var online = {};
    onlineAgents().forEach(function (a) { online[a.root] = true; online["p" + a.port] = true; });
    return Object.keys(CATALOG).filter(function (r) {
      var c = CATALOG[r];
      return !online[r] && !online["p" + c.port] && state.ports.indexOf(c.port) >= 0;
    }).map(function (r) { return CATALOG[r]; });
  }

  /* ---------------- rendering: rail, header, suggestions ---------------- */
  function avatar(a, size) {
    var s = el("span", "av" + (size ? " " + size : ""));
    if (!a) { s.classList.add("none"); s.innerHTML = '<span class="ms">alternate_email</span>'; return s; }
    s.style.setProperty("--c", a.c);
    s.innerHTML = '<span class="ms">' + a.icon + "</span>";
    return s;
  }

  function renderAll() { renderRail(); renderTop(); renderTarget(); renderHello(); }

  function renderRail() {
    var ul = $("agents");
    ul.innerHTML = "";
    onlineAgents().forEach(function (a) {
      var li = el("li");
      var b = el("button", "agent-item" + (a.key === state.target ? " on" : ""));
      b.type = "button";
      b.appendChild(avatar(a));
      var txt = el("div", "", '<div class="nm">' + esc(a.name) + '</div><span class="sub">:' + a.port + " &middot; " + esc(a.blurb) + "</span>");
      txt.style.minWidth = "0";
      b.appendChild(txt);
      b.appendChild(el("span", "dot"));
      b.title = a.name + " on 127.0.0.1:" + a.port;
      b.onclick = function () { setTarget(a.key); closeDrawer(); $("input").focus(); };
      li.appendChild(b);
      ul.appendChild(li);
    });
    missingAgents().forEach(function (c) {
      var li = el("li");
      var b = el("button", "agent-item off");
      b.type = "button";
      b.appendChild(avatar(c));
      var cmd = "cd examples/agents/" + c.folder + " && agents-cli playground --port " + c.port;
      var txt = el("div", "", '<div class="nm">' + esc(c.name) + '</div><span class="sub">not running on :' + c.port + "</span>");
      txt.style.minWidth = "0";
      b.appendChild(txt);
      b.appendChild(el("span", "dot"));
      b.title = "Not running. Start it with:\n" + cmd + "\n(click to copy)";
      b.onclick = function () { copy(cmd); toast("Copied: " + cmd); };
      li.appendChild(b);
      ul.appendChild(li);
    });
    var n = onlineAgents().length;
    $("scanState").textContent = n ? n + " running" : "none running";
    $("topNote").innerHTML = n ? '<span class="ms">lan</span>' + n + " agent" + (n > 1 ? "s" : "") + " found on 127.0.0.1" : "";
  }

  function renderTop() {
    var a = state.agents[state.target];
    var t = $("topAgent");
    t.innerHTML = "";
    if (!a) { t.innerHTML = "<b>Agent console</b>"; return; }
    t.appendChild(avatar(a));
    var tools = a.tools && a.tools.length ? " &middot; tools: " + a.tools.map(esc).join(", ") : (a.root === "sales_brief" ? " &middot; Workflow: analyst, two writers, fact checker" : "");
    t.appendChild(el("div", "", "<b>" + esc(a.name) + '</b><span class="meta">127.0.0.1:' + a.port + (a.online ? "" : " &middot; offline") + tools + "</span>"));
  }

  function renderTarget() {
    var a = state.agents[state.target];
    var av = $("targetAv");
    av.replaceWith(avatar(a, "sm"));
    $("targetBtn").querySelector(".av").id = "targetAv";
    $("targetName").textContent = a ? a.name : "Pick an agent";
    updateSend();
  }

  function renderHello() {
    var hello = $("hello");
    if (!hello) return;
    var list = onlineAgents();
    $("helloSub").textContent = list.length
      ? "Found " + list.length + " agent" + (list.length > 1 ? "s" : "") + " on this laptop. Pick a question, or type @ to choose who answers."
      : "Looking for agents on 127.0.0.1, ports " + state.ports.join(", ") + ".";
    $("startHint").hidden = list.length > 0;
    var box = $("sugg");
    box.innerHTML = "";
    var i = 0;
    list.forEach(function (a) {
      a.ask.slice(0, a.root === "ask_your_data" ? 2 : 1).forEach(function (q) {
        var text = typeof q === "string" ? q : q.text;
        var b = el("button", "sg");
        b.type = "button";
        b.style.animationDelay = (i++ * 50) + "ms";
        b.innerHTML = "<q>" + esc(text.length > 110 ? text.slice(0, 107) + "..." : text) + '</q><span class="who"></span>';
        var who = b.querySelector(".who");
        who.appendChild(avatar(a, "sm"));
        who.appendChild(document.createTextNode(a.name + (typeof q === "object" && q.image ? " · with a screenshot" : "")));
        b.onclick = function () { ask(a.key, q); };
        box.appendChild(b);
      });
    });
  }

  function setTarget(key, quiet) {
    state.target = key;
    if (!quiet) renderAll(); else { renderTop(); renderTarget(); }
  }

  /* ---------------- composer: @ menu, attachments ---------------- */
  var menu = { open: false, items: [], hi: 0, viaAt: false };

  function openMenu(filter, viaAt) {
    var q = (filter || "").toLowerCase();
    var list = onlineAgents().filter(function (a) {
      return !q || a.name.toLowerCase().indexOf(q) >= 0 || a.root.toLowerCase().indexOf(q) >= 0;
    });
    var pop = $("menuPop");
    pop.innerHTML = "";
    menu.items = list; menu.viaAt = viaAt; menu.hi = 0;
    if (!list.length) {
      pop.innerHTML = '<button type="button" disabled><span></span><span>' + (onlineAgents().length ? "No agent matches" : "No agents running yet") + "</span><span></span></button>";
    }
    list.forEach(function (a, i) {
      var b = el("button", i === 0 ? "hi" : "");
      b.type = "button";
      b.setAttribute("role", "option");
      b.appendChild(avatar(a, "sm"));
      b.appendChild(el("span", "", esc(a.name) + "<small>@" + esc(a.root) + "</small>"));
      b.appendChild(el("span", "port", ":" + a.port));
      b.onmousedown = function (e) { e.preventDefault(); pick(i); };
      pop.appendChild(b);
    });
    pop.hidden = false;
    menu.open = true;
    $("targetBtn").setAttribute("aria-expanded", "true");
  }
  function closeMenu() { $("menuPop").hidden = true; menu.open = false; $("targetBtn").setAttribute("aria-expanded", "false"); }
  function pick(i) {
    var a = menu.items[i];
    if (!a) return;
    if (menu.viaAt) {
      var inp = $("input");
      inp.value = inp.value.replace(/(^|\s)@[\w-]*$/, "$1").replace(/^\s+/, "");
    }
    setTarget(a.key);
    closeMenu();
    $("input").focus();
  }
  function moveHi(d) {
    if (!menu.items.length) return;
    menu.hi = (menu.hi + d + menu.items.length) % menu.items.length;
    [].forEach.call($("menuPop").children, function (b, i) { b.classList.toggle("hi", i === menu.hi); });
  }

  function onInput() {
    var inp = $("input");
    inp.style.height = "auto";
    inp.style.height = Math.min(inp.scrollHeight, 220) + "px";
    var m = inp.value.slice(0, inp.selectionStart).match(/(^|\s)@([\w-]*)$/);
    if (m) openMenu(m[2], true); else if (menu.open && menu.viaAt) closeMenu();
    updateSend();
  }

  function updateSend() {
    var s = $("send");
    if (state.busy) { s.disabled = false; s.classList.add("stop"); s.innerHTML = '<span class="ms">stop</span>'; s.setAttribute("aria-label", "Stop"); return; }
    s.classList.remove("stop");
    s.innerHTML = '<span class="ms">arrow_upward</span>';
    s.setAttribute("aria-label", "Send");
    var a = state.agents[state.target];
    s.disabled = !(a && a.online) || (!$("input").value.trim() && !state.attach);
  }

  function setAttachment(file) {
    if (!file || !/^image\//.test(file.type)) return;
    var r = new FileReader();
    r.onload = function () {
      var url = String(r.result);
      state.attach = { mime: file.type, data: url.split(",")[1], url: url };
      var row = $("attachRow");
      row.innerHTML = "";
      var chip = el("div", "chip-img");
      chip.innerHTML = '<img alt="Attached image"><button type="button" aria-label="Remove image"><span class="ms">close</span></button>';
      chip.querySelector("img").src = url;
      chip.querySelector("button").onclick = function () { state.attach = null; row.hidden = true; row.innerHTML = ""; updateSend(); };
      row.appendChild(chip);
      row.hidden = false;
      updateSend();
    };
    r.readAsDataURL(file);
  }

  function attachFromUrl(url) {
    return fetch(url).then(function (r) { if (!r.ok) throw new Error("Couldn't load " + url); return r.blob(); })
      .then(function (b) { return new Promise(function (res) { var f = new File([b], url.split("/").pop(), { type: b.type || "image/png" }); setAttachment(f); setTimeout(res, 80); }); });
  }

  /* ---------------- sending and streaming ---------------- */
  function ask(key, q) {
    setTarget(key);
    var text = typeof q === "string" ? q : q.text;
    var go = function () { $("input").value = text; onInput(); send(); };
    if (typeof q === "object" && q.image) attachFromUrl(q.image).then(go, function (e) { toast(e.message); go(); });
    else go();
  }

  function session(a) {
    if (state.sessions[a.key]) return Promise.resolve(state.sessions[a.key]);
    return fetch(HOST + ":" + a.port + "/apps/" + encodeURIComponent(a.app) + "/users/" + USER + "/sessions", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: "{}"
    }).then(function (r) { if (!r.ok) throw new Error("Couldn't start a session (" + r.status + ")"); return r.json(); })
      .then(function (s) { state.sessions[a.key] = s.id; return s.id; });
  }

  function send() {
    if (state.busy) { state.busy.abort(); return; }
    var inp = $("input");
    var text = inp.value.trim();
    // "@root_cause what broke?" picks the agent inline.
    var m = text.match(/^@([\w-]+)\s+([\s\S]*)$/);
    if (m) {
      var hit = onlineAgents().filter(function (a) { return a.root === m[1] || a.name.toLowerCase().replace(/\s+/g, "_") === m[1].toLowerCase(); })[0];
      if (hit) { setTarget(hit.key); text = m[2].trim(); }
    }
    var a = state.agents[state.target];
    if (!a || !a.online) { toast("Pick a running agent first."); return; }
    if (!text && !state.attach) return;

    var hello = $("hello"); if (hello) hello.remove();
    var img = state.attach;
    addUser(a, text, img);
    inp.value = ""; onInput();
    state.attach = null; $("attachRow").hidden = true; $("attachRow").innerHTML = "";

    var parts = [];
    if (text) parts.push({ text: text });
    if (img) parts.push({ inlineData: { mimeType: img.mime, data: img.data } });

    var view = addAgentTurn(a);
    var ctl = new AbortController();
    state.busy = ctl; updateSend();

    session(a).then(function (sid) {
      return fetch(HOST + ":" + a.port + "/run_sse", {
        method: "POST", signal: ctl.signal,
        headers: { "Content-Type": "application/json", "Accept": "text/event-stream" },
        body: JSON.stringify({ appName: a.app, userId: USER, sessionId: sid, newMessage: { role: "user", parts: parts }, streaming: true })
      });
    }).then(function (r) {
      if (!r.ok) return r.text().then(function (t) { throw new Error("The agent returned " + r.status + ". " + t.slice(0, 300)); });
      return readSSE(r.body, function (ev) { view.event(ev); });
    }).then(function () { state.busy = null; updateSend(); view.finish(); }, function (e) {
      state.busy = null; updateSend();
      if (e.name === "AbortError") view.finish("Stopped.");
      else { view.error(e.message === "Failed to fetch" ? "Couldn't reach " + a.name + " on port " + a.port + ". Is it still running?" : e.message); scan(); }
    });
  }

  function readSSE(body, onEvent) {
    var reader = body.getReader(), dec = new TextDecoder(), buf = "";
    function pump() {
      return reader.read().then(function (r) {
        if (r.done) { flush(true); return; }
        buf += dec.decode(r.value, { stream: true });
        flush(false);
        return pump();
      });
    }
    function flush(end) {
      var blocks = buf.split(/\r?\n\r?\n/);
      buf = end ? "" : blocks.pop();
      blocks.forEach(function (b) {
        var data = b.split(/\r?\n/).filter(function (l) { return l.indexOf("data:") === 0; }).map(function (l) { return l.slice(5).replace(/^ /, ""); }).join("\n");
        if (!data) return;
        try { onEvent(JSON.parse(data)); } catch (e) { /* ignore keep-alive lines */ }
      });
    }
    return pump();
  }

  /* ---------------- thread views ---------------- */
  function thread() { return $("thread"); }
  function scrollDown() { var t = thread(); if (t.scrollHeight - t.scrollTop - t.clientHeight < 260) t.scrollTop = t.scrollHeight; }

  function addUser(a, text, img) {
    var m = el("div", "msg user");
    var to = el("div", "to");
    to.appendChild(document.createTextNode("to "));
    to.appendChild(avatar(a, "sm"));
    to.appendChild(document.createTextNode(a.name));
    m.appendChild(to);
    if (img) { var i = el("img"); i.src = img.url; i.alt = "Attached image"; m.appendChild(i); }
    if (text) m.appendChild(el("div", "bubble")).textContent = text;
    thread().appendChild(m);
    thread().scrollTop = thread().scrollHeight;
  }

  function addAgentTurn(a) {
    var m = el("div", "msg agent");
    m.appendChild(avatar(a));
    var col = el("div", "body");
    col.appendChild(el("div", "who", esc(a.name) + " <small>127.0.0.1:" + a.port + "</small>"));
    var body = el("div", "");
    col.appendChild(body);
    var wait = el("div", "thinking", "<i></i>Working on it");
    body.appendChild(wait);
    m.appendChild(col);
    thread().appendChild(m);
    scrollDown();

    var multi = a.root === "sales_brief" || (a.subAgents && a.subAgents.length > 0);
    var segs = [];          // {kind, author, node, ...}
    var tools = {};         // call id -> {chip, detail}
    var codes = {};         // code text -> segment
    var lastAuthor = null;
    var t0 = Date.now();

    function lastSeg(author) { for (var i = segs.length - 1; i >= 0; i--) if (segs[i].author === author) return segs[i]; return null; }
    function place(author, node) {
      if (wait.parentNode) wait.remove();
      if (multi && author !== lastAuthor) {
        var lab = el("div", "author", '<span class="ms">smart_toy</span>' + esc(author));
        body.appendChild(lab);
      }
      lastAuthor = author;
      body.appendChild(node);
    }
    function textSeg(author) {
      var s = lastSeg(author);
      if (s && s.kind === "text" && !s.closed) return s;
      s = { kind: "text", author: author, raw: "", node: el("div", "md cursor") };
      segs.push(s);
      place(author, s.node);
      return s;
    }
    function closeText(author) { var s = lastSeg(author); if (s && s.kind === "text") { s.closed = true; s.node.classList.remove("cursor"); } }
    function stepsRow(author) {
      var s = lastSeg(author);
      if (s && s.kind === "steps") return s;
      s = { kind: "steps", author: author, node: el("div", "steps") };
      segs.push(s);
      place(author, s.node);
      return s;
    }

    function onCall(author, fc) {
      var id = fc.id || fc.name + JSON.stringify(fc.args || {});
      if (tools[id]) return;
      closeText(author);
      var row = stepsRow(author);
      var chip = el("button", "tool run");
      chip.type = "button";
      var arg = summarizeArgs(fc.args);
      chip.innerHTML = '<span class="ms">progress_activity</span><b>' + esc(fc.name) + "</b>" + (arg ? '<span class="arg">' + esc(arg) + "</span>" : "");
      var detail = el("div", "tool-detail");
      detail.hidden = true;
      detail.textContent = "Arguments\n" + JSON.stringify(fc.args || {}, null, 2);
      chip.onclick = function () { detail.hidden = !detail.hidden; };
      row.node.appendChild(chip);
      row.node.after(detail);
      tools[id] = { chip: chip, detail: detail };
      scrollDown();
    }
    function onResult(author, fr) {
      var id = fr.id || fr.name;
      var t = tools[id];
      if (!t) { onCall(author, { id: id, name: fr.name, args: {} }); t = tools[id]; }
      if (t.done) return;
      t.done = true;
      var resp = fr.response || {};
      var bad = resp.status === "error" || resp.error || resp.error_message;
      t.chip.className = "tool " + (bad ? "bad" : "ok");
      t.chip.querySelector(".ms").textContent = bad ? "error" : "check_circle";
      var s = JSON.stringify(resp, null, 2);
      t.detail.textContent += "\n\nResult\n" + (s.length > 2400 ? s.slice(0, 2400) + "\n..." : s);
    }
    function onCode(author, code) {
      var key = (code.code || "").trim();
      if (!key || codes[key]) return;
      closeText(author);
      var box = el("div", "codebox clip");
      box.innerHTML = '<div class="cb-h"><span class="ms">terminal</span>Ran ' + esc((code.language || "python").toLowerCase().replace("language_unspecified", "python")) + ' code<button type="button">Show code</button></div><pre></pre>';
      box.querySelector("pre").textContent = key;
      box.querySelector("button").onclick = function () { var c = box.classList.toggle("clip"); this.textContent = c ? "Show code" : "Hide code"; };
      var s = { kind: "code", author: author, node: box };
      segs.push(s); codes[key] = s;
      place(author, box);
      scrollDown();
    }
    function onCodeResult(author, res) {
      var s = lastSeg(author);
      for (var i = segs.length - 1; i >= 0; i--) if (segs[i].kind === "code" && segs[i].author === author) { s = segs[i]; break; }
      if (!s || s.kind !== "code" || s.out) return;
      var ok = !res.outcome || res.outcome === "OUTCOME_OK";
      s.out = el("div", "out" + (ok ? "" : " bad"));
      s.out.textContent = (res.output || "").trim() || (ok ? "(no output)" : res.outcome);
      s.node.appendChild(s.out);
      scrollDown();
    }

    return {
      event: function (ev) {
        if (ev.errorMessage || ev.errorCode) { this.error((ev.errorCode ? ev.errorCode + ": " : "") + (ev.errorMessage || "")); return; }
        var author = ev.author || a.root;
        if (author === "user") return;
        var parts = (ev.content && ev.content.parts) || [];
        var finalTexts = [];
        parts.forEach(function (p) {
          if (p.thought) return;
          if (p.functionCall) onCall(author, p.functionCall);
          else if (p.functionResponse) onResult(author, p.functionResponse);
          else if (p.executableCode) onCode(author, p.executableCode);
          else if (p.codeExecutionResult) onCodeResult(author, p.codeExecutionResult);
          else if (typeof p.text === "string") {
            if (ev.partial) { if (p.text) { var s = textSeg(author); s.raw += p.text; s.node.innerHTML = md(s.raw); scrollDown(); } }
            else finalTexts.push(p.text);
          }
        });
        if (!ev.partial && finalTexts.join("").trim()) {
          // The final event repeats the whole answer: use it as the source of truth.
          var s2 = lastSeg(author);
          if (!(s2 && s2.kind === "text")) s2 = textSeg(author);
          s2.raw = finalTexts.join("");
          s2.node.innerHTML = md(s2.raw);
          scrollDown();
        }
      },
      finish: function (note) {
        if (wait.parentNode) wait.remove();
        segs.forEach(function (s) { if (s.node.classList) s.node.classList.remove("cursor"); });
        Object.keys(tools).forEach(function (k) { var t = tools[k]; if (!t.done) { t.chip.className = "tool"; t.chip.querySelector(".ms").textContent = "build"; } });
        if (!segs.length && !note) body.appendChild(el("div", "md", "<p>(No answer.)</p>"));
        var secs = ((Date.now() - t0) / 1000).toFixed(1);
        col.appendChild(el("div", "done-note", (note ? esc(note) + " " : "") + secs + " s" + (Object.keys(tools).length ? " &middot; " + Object.keys(tools).length + " tool call" + (Object.keys(tools).length > 1 ? "s" : "") : "") + (Object.keys(codes).length ? " &middot; ran code" : "")));
        scrollDown();
      },
      error: function (msg) {
        if (wait.parentNode) wait.remove();
        body.appendChild(el("div", "err", '<span class="ms">error</span><div>' + esc(msg) + "</div>"));
        scrollDown();
      }
    };
  }

  function summarizeArgs(args) {
    if (!args) return "";
    var k = Object.keys(args);
    if (!k.length) return "";
    return k.map(function (x) { var v = args[x]; return typeof v === "string" ? v : JSON.stringify(v); }).join(", ").slice(0, 60);
  }

  /* ---------------- small markdown renderer (escapes everything first) ---------------- */
  function inline(s) {
    return s.replace(/`([^`]+)`/g, function (_, c) { return "<code>" + c + "</code>"; })
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");
  }
  function md(src) {
    var lines = esc(src).split("\n"), out = [], i = 0;
    while (i < lines.length) {
      var l = lines[i];
      var fence = l.match(/^\s*```(\w*)/);
      if (fence) {
        var code = []; i++;
        while (i < lines.length && !/^\s*```/.test(lines[i])) code.push(lines[i++]);
        i++;
        var long = code.length > 12;
        out.push('<div class="codebox' + (long ? " clip" : "") + '"><div class="cb-h"><span class="ms">code</span>' + (fence[1] || "code") + (long ? " &middot; " + code.length + ' lines<button type="button" onclick="var b=this.closest(\'.codebox\');this.textContent=b.classList.toggle(\'clip\')?\'Show all\':\'Collapse\'">Show all</button>' : "") + "</div><pre>" + code.join("\n") + "</pre></div>");
        continue;
      }
      if (/^\s*$/.test(l)) { i++; continue; }
      var h = l.match(/^(#{1,6})\s+(.*)$/);
      if (h) { out.push("<h4>" + inline(h[2]) + "</h4>"); i++; continue; }
      if (/^\s*(-{3,}|\*{3,})\s*$/.test(l)) { out.push("<hr>"); i++; continue; }
      if (/^\s*\|.*\|\s*$/.test(l) && i + 1 < lines.length && /^\s*\|?[\s:-]+\|/.test(lines[i + 1])) {
        var rows = [];
        while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) rows.push(lines[i++]);
        var cells = function (r) { return r.trim().replace(/^\||\|$/g, "").split("|").map(function (c) { return inline(c.trim()); }); };
        var head = cells(rows[0]);
        out.push("<table><thead><tr>" + head.map(function (c) { return "<th>" + c + "</th>"; }).join("") + "</tr></thead><tbody>" +
          rows.slice(2).map(function (r) { return "<tr>" + cells(r).map(function (c) { return "<td>" + c + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table>");
        continue;
      }
      if (/^\s*([-*+]|\d+[.)])\s+/.test(l)) {
        var ordered = /^\s*\d+[.)]/.test(l), items = [];
        while (i < lines.length && /^\s*([-*+]|\d+[.)])\s+/.test(lines[i])) {
          var item = lines[i].replace(/^\s*([-*+]|\d+[.)])\s+/, "");
          i++;
          while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !/^\s*([-*+]|\d+[.)])\s+/.test(lines[i]) && !/^\s*```/.test(lines[i])) item += " " + lines[i++].trim();
          items.push("<li>" + inline(item) + "</li>");
        }
        out.push((ordered ? "<ol>" : "<ul>") + items.join("") + (ordered ? "</ol>" : "</ul>"));
        continue;
      }
      var para = [l]; i++;
      while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^\s*(```|#{1,6}\s|[-*+]\s|\d+[.)]\s|\|)/.test(lines[i])) para.push(lines[i++]);
      out.push("<p>" + inline(para.join("<br>")) + "</p>");
    }
    return out.join("");
  }

  /* ---------------- misc ---------------- */
  function copy(t) { if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(t).catch(function () {}); }
  var toastTimer;
  function toast(msg) {
    var t = $("toast") || document.body.appendChild(el("div", ""));
    t.id = "toast";
    t.setAttribute("role", "status");
    t.style.cssText = "position:fixed;left:50%;bottom:6.5rem;transform:translateX(-50%);background:#313033;color:#F4EFF4;padding:.8rem 1.1rem;border-radius:8px;font-size:.88rem;z-index:30;box-shadow:0 2px 6px rgba(0,0,0,.3);max-width:90vw";
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 3200);
  }
  function closeDrawer() { $("app").classList.remove("drawer"); }

  function newChat() {
    if (state.busy) state.busy.abort();
    state.sessions = {};
    var t = thread();
    t.innerHTML = "";
    var hello = el("section", "hello");
    hello.id = "hello";
    hello.innerHTML = '<h1><span class="grad">Hello, DevFest Baguio</span><br>Which agent should help?</h1><p class="hello-sub" id="helloSub"></p><div class="sugg" id="sugg"></div><div class="start-hint" id="startHint" hidden><span class="ms">terminal</span><div><b>No agents found yet.</b> Start all six from the repo root, then they show up here on their own: <code>examples/agents/run_all.sh</code></div></div>';
    t.appendChild(hello);
    renderHello();
    $("input").focus();
  }

  /* ---------------- wire up ---------------- */
  $("composer").addEventListener("submit", function (e) { e.preventDefault(); send(); });
  $("input").addEventListener("input", onInput);
  $("input").addEventListener("keydown", function (e) {
    if (menu.open && menu.items.length) {
      if (e.key === "ArrowDown") { e.preventDefault(); moveHi(1); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); moveHi(-1); return; }
      if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); pick(menu.hi); return; }
    }
    if (e.key === "Escape" && menu.open) { closeMenu(); return; }
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); send(); }
  });
  $("input").addEventListener("blur", function () { setTimeout(function () { if (menu.viaAt) closeMenu(); }, 150); });
  $("targetBtn").addEventListener("click", function () { if (menu.open) closeMenu(); else openMenu("", false); });
  document.addEventListener("click", function (e) { if (menu.open && !e.target.closest("#menuPop,#targetBtn,#input")) closeMenu(); });
  $("file").addEventListener("change", function () { setAttachment(this.files[0]); this.value = ""; });
  $("input").addEventListener("paste", function (e) {
    var f = [].slice.call((e.clipboardData && e.clipboardData.files) || []).filter(function (x) { return /^image\//.test(x.type); })[0];
    if (f) { e.preventDefault(); setAttachment(f); }
  });
  $("newChat").addEventListener("click", function () { newChat(); closeDrawer(); });
  $("rescan").addEventListener("click", function () { scan(); });
  $("menuBtn").addEventListener("click", function () { $("app").classList.toggle("drawer"); });
  $("thread").addEventListener("click", closeDrawer);
  $("portsBtn").addEventListener("click", function () { $("portsInput").value = state.ports.join(", "); $("portsDlg").showModal(); });
  $("portsDlg").addEventListener("close", function () {
    var v = this.returnValue;
    if (v === "reset") { state.ports = DEFAULT_PORTS.slice(); localStorage.removeItem("agentConsole.ports"); }
    else if (v === "save") {
      var p = $("portsInput").value.split(/[\s,]+/).map(Number).filter(function (n) { return n > 0 && n < 65536; });
      if (p.length) { state.ports = p; localStorage.setItem("agentConsole.ports", JSON.stringify(p)); }
    } else return;
    Object.keys(state.agents).forEach(function (k) { if (state.ports.indexOf(state.agents[k].port) < 0) delete state.agents[k]; });
    scan();
  });

  renderAll();
  scan();
  setInterval(function () { if (!document.hidden && !state.busy) scan(); }, SCAN_MS);
})();
