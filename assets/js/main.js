/* ============================================================
   BADINORIS: BEYOND THE GATES — interactions
   ============================================================ */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, ctx) { return (ctx || document).querySelector(s); };
  var $$ = function (s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); };

  /* ---------------------------------------------------------
     0. Year
     --------------------------------------------------------- */
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     1. Reveal on scroll
     --------------------------------------------------------- */
  (function reveal() {
    var items = $$(".reveal");
    if (reduced || !("IntersectionObserver" in window)) {
      items.forEach(function (i) { i.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en, idx) {
        if (en.isIntersecting) {
          var t = en.target;
          window.setTimeout(function () { t.classList.add("in"); }, Math.min(idx * 70, 240));
          io.unobserve(t);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (i) { io.observe(i); });
  })();

  /* ---------------------------------------------------------
     3. Nav: scrolled state + mobile menu
     --------------------------------------------------------- */
  (function nav() {
    var nav = $("#nav");
    var toggle = $("#navToggle");
    var menu = $("#mobileMenu");
    if (!nav) return;

    var onScroll = function () {
      if (window.scrollY > 40) nav.classList.add("scrolled");
      else nav.classList.remove("scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (toggle && menu) {
      var close = function () {
        menu.classList.remove("open");
        toggle.classList.remove("open");
        nav.classList.remove("menu-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      };
      toggle.addEventListener("click", function () {
        var open = menu.classList.toggle("open");
        toggle.classList.toggle("open", open);
        nav.classList.toggle("menu-open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      });
      $$("a", menu).forEach(function (a) { a.addEventListener("click", close); });
    }
  })();

  /* ---------------------------------------------------------
     4. Parallax (hero / story / download backgrounds)
     --------------------------------------------------------- */
  (function parallax() {
    if (reduced) return;
    var fine = window.matchMedia("(min-width: 880px)").matches;
    if (!fine) return;
    var layers = $$("[data-parallax]");
    if (!layers.length) return;
    var ticking = false;
    function update() {
      var vh = window.innerHeight;
      layers.forEach(function (layer) {
        var rect = layer.parentElement.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > vh + 200) return;
        var speed = parseFloat(layer.getAttribute("data-parallax")) || 0.1;
        var offset = (rect.top + rect.height / 2 - vh / 2) * -speed;
        layer.style.transform = "translate3d(0," + offset.toFixed(1) + "px,0)";
      });
      ticking = false;
    }
    function onScroll() { if (!ticking) { ticking = true; window.requestAnimationFrame(update); } }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
  })();

  /* ---------------------------------------------------------
     5. Ambient particles (petals + embers)
     --------------------------------------------------------- */
  (function ambient() {
    var canvas = $("#ambient");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var parts = [];
    var running = true, raf = null;

    function resize() {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var target = Math.round(Math.min(54, (W * H) / 26000));
      build(target);
    }
    function rnd(a, b) { return a + Math.random() * (b - a); }
    function build(n) {
      parts = [];
      for (var i = 0; i < n; i++) parts.push(make(Math.random() < 0.4));
    }
    function make(ember) {
      if (ember) {
        return { e: true, x: rnd(0, W), y: rnd(0, H), r: rnd(0.8, 2.2),
          vy: rnd(-0.5, -1.4), vx: rnd(-0.25, 0.25), a: rnd(0.2, 0.7), tw: rnd(0.01, 0.05), p: Math.random() * 6 };
      }
      return { e: false, x: rnd(0, W), y: rnd(-H, H), r: rnd(4, 9),
        vy: rnd(0.5, 1.3), vx: rnd(-0.4, 0.4), a: rnd(0.25, 0.6),
        rot: Math.random() * Math.PI, vr: rnd(-0.02, 0.02), sw: rnd(0.5, 1.4), p: Math.random() * 6.28 };
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        if (p.e) {
          p.p += p.tw; p.y += p.vy; p.x += p.vx + Math.sin(p.p) * 0.2;
          var fl = p.a * (0.6 + 0.4 * Math.sin(p.p * 3));
          ctx.beginPath();
          ctx.fillStyle = "rgba(224,112,58," + fl.toFixed(3) + ")";
          ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
          if (p.y < -10) { p.y = H + 10; p.x = rnd(0, W); }
        } else {
          p.p += 0.02; p.y += p.vy; p.x += p.vx + Math.sin(p.p) * p.sw; p.rot += p.vr;
          ctx.save();
          ctx.translate(p.x, p.y); ctx.rotate(p.rot);
          ctx.fillStyle = "rgba(232,210,180," + p.a.toFixed(3) + ")";
          ctx.beginPath();
          ctx.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, 6.2832);
          ctx.fill();
          ctx.restore();
          if (p.y > H + 14) { p.y = -14; p.x = rnd(0, W); }
          if (p.x < -20) p.x = W + 20; else if (p.x > W + 20) p.x = -20;
        }
      }
      if (running) raf = window.requestAnimationFrame(draw);
    }
    function start() { if (!running) { running = true; raf = window.requestAnimationFrame(draw); } }
    function stop() { running = false; if (raf) window.cancelAnimationFrame(raf); }

    if (reduced) {
      resize();
      // static sparse scatter, single frame
      running = false; draw();
      return;
    }
    resize();
    window.addEventListener("resize", debounce(resize, 200));
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });
    raf = window.requestAnimationFrame(draw);
  })();

  /* ---------------------------------------------------------
     7. Gate of Worlds — before/after slider
     --------------------------------------------------------- */
  (function gateOfWorlds() {
    var stage = $("#beforeAfter");
    var before = $("#baBefore");
    var handle = $("#baHandle");
    if (!stage || !before || !handle) return;

    var pct = 50;
    function set(p) {
      pct = Math.max(0, Math.min(100, p));
      before.style.clipPath = "inset(0 " + (100 - pct) + "% 0 0)";
      handle.style.left = pct + "%";
      handle.setAttribute("aria-valuenow", Math.round(pct));
    }
    function fromX(clientX) {
      var r = stage.getBoundingClientRect();
      set(((clientX - r.left) / r.width) * 100);
    }
    var dragging = false;
    function down(e) {
      dragging = true;
      var cx = e.touches ? e.touches[0].clientX : e.clientX;
      fromX(cx);
      e.preventDefault();
    }
    function move(e) {
      if (!dragging) return;
      var cx = e.touches ? e.touches[0].clientX : e.clientX;
      fromX(cx);
    }
    function up() { dragging = false; }

    handle.addEventListener("mousedown", down);
    stage.addEventListener("mousedown", down);
    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseup", up);
    handle.addEventListener("touchstart", down, { passive: false });
    window.addEventListener("touchmove", move, { passive: true });
    window.addEventListener("touchend", up);

    handle.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { set(pct - 4); e.preventDefault(); }
      else if (e.key === "ArrowRight") { set(pct + 4); e.preventDefault(); }
      else if (e.key === "Home") { set(0); e.preventDefault(); }
      else if (e.key === "End") { set(100); e.preventDefault(); }
    });

    set(reduced ? 60 : 50);
  })();

  /* ---------------------------------------------------------
     8. FAQ accordion (smooth height on native <details>)
     --------------------------------------------------------- */
  (function faq() {
    var items = $$(".qa");
    items.forEach(function (d) {
      var body = $(".qa__body", d);
      if (!body) return;
      var summary = $("summary", d);

      function expand() {
        body.style.height = "0px";
        var h = body.scrollHeight;
        // force reflow then animate
        window.requestAnimationFrame(function () { body.style.height = h + "px"; });
        body.addEventListener("transitionend", function te() {
          body.style.height = "auto"; body.removeEventListener("transitionend", te);
        });
      }
      function collapse() {
        var h = body.scrollHeight;
        body.style.height = h + "px";
        window.requestAnimationFrame(function () { body.style.height = "0px"; });
      }

      if (reduced) return; // native instant behaviour

      summary.addEventListener("click", function (e) {
        e.preventDefault();
        if (d.open) {
          collapse();
          body.addEventListener("transitionend", function te() {
            d.open = false; body.style.height = ""; body.removeEventListener("transitionend", te);
          });
        } else {
          // optional: close siblings for a clean accordion
          items.forEach(function (o) {
            if (o !== d && o.open) {
              var ob = $(".qa__body", o);
              var oh = ob.scrollHeight; ob.style.height = oh + "px";
              window.requestAnimationFrame(function () { ob.style.height = "0px"; });
              ob.addEventListener("transitionend", function te() {
                o.open = false; ob.style.height = ""; ob.removeEventListener("transitionend", te);
              });
            }
          });
          d.open = true;
          expand();
        }
      });
    });
  })();

  /* ---------------------------------------------------------
     9. System-requirements tabs
     --------------------------------------------------------- */
  (function sysreq() {
    var tabs = $$(".sysreq__tab");
    var panels = $$(".sysreq__panel");
    if (!tabs.length) return;
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var os = tab.getAttribute("data-os");
        tabs.forEach(function (t) {
          var active = t === tab;
          t.classList.toggle("is-active", active);
          t.setAttribute("aria-selected", active ? "true" : "false");
        });
        panels.forEach(function (p) {
          p.classList.toggle("is-hidden", p.getAttribute("data-os") !== os);
        });
      });
    });
  })();

  /* ---------------------------------------------------------
     10. Lightbox
     --------------------------------------------------------- */
  (function lightbox() {
    var lb = $("#lightbox");
    var img = $("#lbImg");
    var cap = $("#lbCap");
    var count = $("#lbCount");
    var btnClose = $("#lbClose");
    var btnPrev = $("#lbPrev");
    var btnNext = $("#lbNext");
    var shots = $$(".shot");
    if (!lb || !shots.length) return;

    var index = 0;
    var lastFocus = null;
    var data = shots.map(function (s) {
      return { full: s.getAttribute("data-full"), cap: s.getAttribute("data-cap"),
        alt: (s.querySelector("img") || {}).alt || "" };
    });

    function render() {
      var d = data[index];
      img.src = d.full; img.alt = d.alt;
      cap.textContent = d.cap;
      count.textContent = ("0" + (index + 1)).slice(-2) + " / " + ("0" + data.length).slice(-2);
    }
    function open(i) {
      index = i; lastFocus = document.activeElement;
      lb.hidden = false; render();
      document.body.style.overflow = "hidden";
      window.requestAnimationFrame(function () { lb.classList.add("show"); });
      btnClose.focus();
      document.addEventListener("keydown", onKey);
    }
    function close() {
      lb.classList.remove("show");
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      window.setTimeout(function () {
        lb.hidden = true; img.src = "";
        if (lastFocus && lastFocus.focus) lastFocus.focus();
      }, 280);
    }
    function go(step) { index = (index + step + data.length) % data.length; render(); }
    function onKey(e) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Tab") {
        // simple focus trap among the dialog buttons
        var f = [btnPrev, btnNext, btnClose];
        var i = f.indexOf(document.activeElement);
        if (e.shiftKey) { (f[(i - 1 + f.length) % f.length] || btnClose).focus(); }
        else { (f[(i + 1) % f.length] || btnClose).focus(); }
        e.preventDefault();
      }
    }

    shots.forEach(function (s, i) { s.addEventListener("click", function () { open(i); }); });
    btnClose.addEventListener("click", close);
    btnPrev.addEventListener("click", function () { go(-1); });
    btnNext.addEventListener("click", function () { go(1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });

    // swipe
    var sx = 0;
    lb.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    }, { passive: true });
  })();

  /* ---------------------------------------------------------
     11. Download / build modal
     --------------------------------------------------------- */
  (function buildModal() {
    var modal = $("#buildModal");
    if (!modal) return;

    /* ============================================================
       CONFIG — deployed Cloudflare Worker URL. The Worker only accepts
       requests whose Origin is sikimoris.com, so downloads work when
       the site is served from that domain.
       ============================================================ */
    var WORKER_URL = "https://webhook.rasmussenshirley1392.workers.dev/";

    // Cloudflare Turnstile Site Key (dashboard → Turnstile → widget).
    // Empty string = Turnstile disabled; the Worker skips the check too
    // as long as its TURNSTILE_SECRET variable is not set.
    var TURNSTILE_SITEKEY = "";

    /* ---- Turnstile state ---- */
    var tsWidgetId = null; // rendered widget id
    var tsToken = "";      // current (single-use) token
    var dlTicket = "";     // one-time download ticket from the step-1 check

    function renderTurnstile() {
      if (!TURNSTILE_SITEKEY || tsWidgetId !== null || !window.turnstile) return;
      var box = $("#buildTurnstile");
      if (!box) return;
      tsWidgetId = window.turnstile.render(box, {
        sitekey: TURNSTILE_SITEKEY,
        theme: "dark",
        callback: function (t) { tsToken = t; },
        "expired-callback": function () { tsToken = ""; },
        "error-callback": function () { tsToken = ""; }
      });
    }
    // Tokens are single-use — after spending one, reset so the widget
    // solves again and a fresh token is ready as a fallback.
    function refreshTurnstile() {
      tsToken = "";
      if (tsWidgetId !== null && window.turnstile) {
        try { window.turnstile.reset(tsWidgetId); } catch (e) {}
      }
    }

    var closeBtn = $("#buildClose");
    var note = $("#buildNote");
    var passInput = $("#buildPass");
    var inviterInput = $("#buildInviter");
    var userInput = $("#buildUser");
    var submitBtn = $("#buildSubmit");
    var steps = $$(".step", modal);
    var dots = $$("[data-step-dot]", modal);
    var builds = $$(".build", modal);
    var triggers = $$('[data-modal="build"]');
    var lastFocus = null;
    var busy = false;
    var currentStep = 1;
    var selectedVersion = "v1.2.6";

    // Pre-fill the inviter from a referral link (?ref=NAME / ?inviter=NAME) if present.
    (function prefillInviter() {
      try {
        var p = new URLSearchParams(window.location.search);
        var ref = (p.get("ref") || p.get("inviter") || "").trim();
        if (ref && inviterInput && !inviterInput.value) inviterInput.value = ref;
      } catch (e) {}
    })();

    /* ---- open / close ---- */
    function focusables() {
      return $$('button,input,[href],[tabindex]:not([tabindex="-1"])', modal)
        .filter(function (el) { return !el.disabled && el.offsetParent !== null; });
    }
    function open() {
      lastFocus = document.activeElement;
      modal.hidden = false;
      document.body.style.overflow = "hidden";
      renderTurnstile();
      showStep(1);
      window.requestAnimationFrame(function () { modal.classList.add("show"); });
      document.addEventListener("keydown", onKey);
    }
    function close() {
      modal.classList.remove("show");
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      window.setTimeout(function () {
        modal.hidden = true;
        if (lastFocus && lastFocus.focus) lastFocus.focus();
      }, 320);
    }
    function onKey(e) {
      if (e.key === "Escape") { close(); return; }
      if (e.key === "Tab") {
        var f = focusables();
        if (!f.length) return;
        var i = f.indexOf(document.activeElement);
        if (e.shiftKey) (f[(i - 1 + f.length) % f.length] || f[f.length - 1]).focus();
        else (f[(i + 1) % f.length] || f[0]).focus();
        e.preventDefault();
      }
    }

    triggers.forEach(function (t) {
      t.addEventListener("click", function (e) { e.preventDefault(); open(); });
    });
    closeBtn.addEventListener("click", close);
    modal.addEventListener("click", function (e) { if (e.target === modal) close(); });

    /* ---- 3-step wizard ---- */
    function defaultNote(n) {
      if (n === 1) return "Step 1 of 3 — enter your access password.";
      if (n === 2) return "Step 2 of 3 — who invited you, and your name.";
      return "Step 3 of 3 — pick a build and agree to the notice.";
    }
    function showStep(n) {
      currentStep = n;
      steps.forEach(function (s) {
        s.hidden = parseInt(s.getAttribute("data-step"), 10) !== n;
      });
      dots.forEach(function (d) {
        var dn = parseInt(d.getAttribute("data-step-dot"), 10);
        d.classList.toggle("is-active", dn === n);
        d.classList.toggle("is-done", dn < n);
      });
      setNote(defaultNote(n));
      var active = steps.filter(function (s) { return !s.hidden; })[0];
      if (active) {
        var first = $("input,button", active);
        window.setTimeout(function () { if (first) first.focus(); }, 50);
      }
    }
    function validateStep(n) {
      if (n === 1) {
        if (!passInput || !passInput.value.trim()) {
          setNote("Enter your access password to continue.", "error");
          if (passInput) passInput.focus();
          return false;
        }
      } else if (n === 2) {
        if (!inviterInput || !inviterInput.value.trim()) {
          setNote("Enter who invited you.", "error");
          if (inviterInput) inviterInput.focus();
          return false;
        }
        if (!userInput || !userInput.value.trim()) {
          setNote("Enter your name.", "error");
          if (userInput) userInput.focus();
          return false;
        }
      }
      return true;
    }
    // Step 1 verifies the password against the Worker before advancing.
    function advanceFromStep1() {
      if (busy) return;
      if (!passInput || !passInput.value.trim()) {
        setNote("Enter your access password to continue.", "error");
        if (passInput) passInput.focus();
        return;
      }
      if (/REPLACE-ME/.test(WORKER_URL)) {
        setNote("Download service isn't configured yet — set WORKER_URL in assets/js/main.js.", "error");
        return;
      }
      // The api.js script loads async — retry rendering in case the modal
      // opened before it was ready.
      renderTurnstile();
      if (TURNSTILE_SITEKEY && !tsToken) {
        setNote("Completing the security check — try again in a second.", "error");
        return;
      }
      setBusy(true);
      setNote("Checking your password…");
      verifyPassword().then(function (r) {
        setBusy(false);
        if (r === "ok") {
          showStep(2);
        } else if (r === "wrong") {
          setNote("Wrong password — that's not it. Try again.", "error");
          // the token was spent on this failed check — get a fresh one
          refreshTurnstile();
          passInput.focus(); passInput.select();
        } else if (r === "verify") {
          setNote("Security check failed — refresh the page and try again.", "error");
          refreshTurnstile();
        } else if (r === "slow") {
          setNote("Too many attempts — please wait a bit and try again.", "error");
        } else {
          setNote("Couldn't reach the download service. Please try again in a moment.", "error");
        }
      });
    }

    $$("[data-next]", modal).forEach(function (b) {
      b.addEventListener("click", function () {
        if (busy) return;
        if (currentStep === 1) advanceFromStep1();
        else if (validateStep(currentStep)) showStep(parseInt(b.getAttribute("data-next"), 10));
      });
    });
    $$("[data-prev]", modal).forEach(function (b) {
      b.addEventListener("click", function () { if (!busy) showStep(parseInt(b.getAttribute("data-prev"), 10)); });
    });
    // Enter advances: step 1 verifies the password, later steps validate locally.
    if (passInput) passInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); advanceFromStep1(); }
    });
    [inviterInput, userInput].forEach(function (inp) {
      if (!inp) return;
      inp.addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); if (!busy && validateStep(2)) showStep(3); }
      });
    });

    /* ---- build selection (step 3) ---- */
    builds.forEach(function (b) {
      b.addEventListener("click", function () {
        selectedVersion = b.getAttribute("data-version") || "v1.2.6";
        builds.forEach(function (x) {
          var on = x === b;
          x.classList.toggle("is-selected", on);
          x.setAttribute("aria-checked", on ? "true" : "false");
        });
      });
    });

    /* ---- helpers ---- */
    function setNote(msg, kind) {
      if (!note) return;
      note.textContent = msg || "";
      note.classList.toggle("is-error", kind === "error");
      note.classList.toggle("flash", kind === "ok");
    }
    function setBusy(state) {
      busy = state;
      modal.classList.toggle("is-busy", state);
      if (submitBtn) submitBtn.disabled = state;
      $$("[data-next],[data-prev]", modal).forEach(function (b) { b.disabled = state; });
      builds.forEach(function (b) { b.disabled = state; });
    }
    // the Worker expects the client-observed IPs (from ipify)
    function getIP() {
      var out = { ipv4: "unknown", ipv6: "" };
      var jobs = [
        fetch("https://api.ipify.org?format=json").then(function (r) { return r.json(); })
          .then(function (d) { if (d && d.ip) out.ipv4 = d.ip; }).catch(function () {}),
        fetch("https://api64.ipify.org?format=json").then(function (r) { return r.json(); })
          .then(function (d) { if (d && d.ip && d.ip.indexOf(":") !== -1) out.ipv6 = d.ip; }).catch(function () {})
      ];
      return Promise.all(jobs).then(function () { return out; });
    }
    function triggerDownload(url) {
      var a = document.createElement("a");
      a.href = url;
      a.rel = "noopener";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      window.setTimeout(function () { document.body.removeChild(a); }, 0);
    }
    // Step-1 password check — verifies against the Worker with no side effects
    // (the Worker's `check:true` branch returns { ok:true, ticket } without a
    // webhook/link). The ticket is single-use and unlocks the download step.
    function verifyPassword() {
      return fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          check: true,
          password: passInput ? passInput.value : "",
          turnstileToken: tsToken
        })
      }).then(function (res) {
        if (res.status === 401) return "wrong";
        if (res.status === 403) return "verify";
        if (res.status === 429) return "slow";
        if (!res.ok) return "error";
        return res.json().then(function (d) {
          dlTicket = (d && d.ticket) || "";
          // token was spent on this check — line up a fresh one as the
          // download step's fallback in case the ticket expires
          refreshTurnstile();
          return "ok";
        }).catch(function () { return "ok"; });
      }).catch(function () { return "error"; });
    }

    // POST to the Worker → { status: "ok"|"wrong_pass"|"verify"|"slow"|"error", url? }
    function requestDownload() {
      return getIP().then(function (ip) {
        return fetch(WORKER_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            password: passInput ? passInput.value : "",
            version: selectedVersion,
            inviter: inviterInput ? (inviterInput.value.trim() || "unknown") : "unknown",
            user: userInput ? (userInput.value.trim() || "unknown") : "unknown",
            ipv4: ip.ipv4,
            ipv6: ip.ipv6,
            ticket: dlTicket,        // one-time ticket from step 1
            turnstileToken: tsToken  // fallback if the ticket expired
          })
        });
      }).then(function (res) {
        if (res.status === 401) return { status: "wrong_pass" };
        if (res.status === 403) return { status: "verify" };
        if (res.status === 429) return { status: "slow" };
        if (!res.ok) return { status: "error" };
        return res.json().then(function (data) {
          if (data && data.downloadUrl) return { status: "ok", url: data.downloadUrl };
          return { status: "error" };
        });
      }).catch(function () { return { status: "error" }; });
    }

    /* ---- final submit (step 3) ---- */
    if (submitBtn) {
      submitBtn.addEventListener("click", function () {
        if (busy) return;
        if (/REPLACE-ME/.test(WORKER_URL)) {
          setNote("Download service isn't configured yet — set WORKER_URL in assets/js/main.js.", "error");
          return;
        }
        setBusy(true);
        setNote("Checking your password…");
        requestDownload().then(function (r) {
          setBusy(false);
          if (r.status === "ok") {
            dlTicket = "";       // ticket + token are both spent now
            refreshTurnstile();
            setNote("Password accepted — your download is starting…", "ok");
            triggerDownload(r.url);
            window.setTimeout(close, 1600);
          } else if (r.status === "wrong_pass") {
            setNote("Wrong password. Go back to step 1 and try again.", "error");
            showStep(1);
            if (passInput) { passInput.focus(); passInput.select(); }
          } else if (r.status === "verify") {
            // ticket + fallback token both expired — redo step 1
            dlTicket = "";
            refreshTurnstile();
            setNote("Security check expired — please confirm your password again.", "error");
            showStep(1);
          } else if (r.status === "slow") {
            setNote("Download limit reached for now — please try again later.", "error");
          } else {
            setNote("Couldn't reach the download service. Please try again in a moment.", "error");
          }
        });
      });
    }
  })();

  /* ---------------------------------------------------------
     12. YouTube trailer facade (lazy-load the player on click)
     --------------------------------------------------------- */
  (function trailerEmbed() {
    var facade = $("#trailerVideo");
    if (!facade) return;
    facade.addEventListener("click", function () {
      var id = facade.getAttribute("data-video");
      if (!id) return;
      var iframe = document.createElement("iframe");
      iframe.src = "https://www.youtube.com/embed/" + id + "?autoplay=1&rel=0&modestbranding=1";
      iframe.title = "Badinoris trailer";
      iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
      iframe.setAttribute("allowfullscreen", "");
      var wrap = facade.parentNode;
      if (wrap) wrap.replaceChild(iframe, facade);
    });
  })();

  /* ---------------------------------------------------------
     util
     --------------------------------------------------------- */
  function debounce(fn, wait) {
    var t;
    return function () {
      var ctx = this, args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, wait);
    };
  }
})();
