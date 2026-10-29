/**
 * First-Party Expired Domain Attribution & Contextual Banner Router
 * Captures referring expired domain, historical URL path, HTTP referrer, and UTM params,
 * renders a contextual "Project Wound Down -> Value Your Archives" banner,
 * and injects attribution metadata into both Dak's 70/30 licensing form (data-desk@mail.grokbot.com)
 * and Chuck's 5-field Off-Market B2B Exit qualification form.
 */
(function () {
  var params = new URLSearchParams(window.location.search);
  var host = (params.get("utm_source") || window.location.hostname || "").replace(/^www\./, "").toLowerCase();
  var origPath = params.get("orig_path") || window.location.pathname || "/";
  var referrer = document.referrer || "direct";

  var DOMAIN_MAP = {
    "cncframework.com": {
      name: "CNC Framework (Open-Source IaC & Dev Sandbox)",
      vertical: "rl",
      badge: "Reached via cncframework.com (GitHub / Hacker News)",
      message: "Looking for CNC Framework? Prioritize monetizing your containerized dev environments, Terraform/Docker pipelines, and executable Python/RL repos with AI labs (70/30 split)."
    },
    "fabfabbers.com": {
      name: "FabFabbers (Browser OpenSCAD & Parametric 3D CAD)",
      vertical: "cad",
      badge: "Reached via fabfabbers.com" + (origPath.indexOf("OpenSCAD") !== -1 ? "/OpenSCAD" : ""),
      message: "Looking for FabFabbers / Browser OpenSCAD? Calculate what your native STEP, SolidWorks, AutoCAD, Revit, and OpenSCAD engineering libraries are worth to AI training labs (70/30 split)."
    },
    "dreamforge.me": {
      name: "Dreamforge (YC S12 3D Modeling & CAD Software)",
      vertical: "cad",
      badge: "Reached via dreamforge.me (Y Combinator S12 Directory)",
      message: "Dreamforge (YC S12) has wound down — calculate the AI licensing value of your 3D/CAD engineering files or explore an off-market B2B software exit."
    },
    "fabius.io": {
      name: "Fabius (YC W23 B2B AI Sales Call Intelligence)",
      vertical: "saas",
      badge: "Reached via fabius.io (Y Combinator W23 Directory)",
      message: "Fabius (YC W23) has wound down — value your startup's historical repos, Slack/Linear threads, and CRM/call workflows via our 70/30 AI Data Licensing Desk or explore an off-market B2B exit."
    },
    "pythonsandbox.dev": {
      name: "PythonSandbox.dev (Cloud Python / PyTorch Execution Sandbox)",
      vertical: "rl",
      badge: "Reached via pythonsandbox.dev (Show HN)",
      message: "Have executable Python sandboxes, RL environments, or unit-tested codebases? Estimate your 70/30 non-exclusive AI lab licensing payout below."
    }
  };

  var matched = DOMAIN_MAP[host];
  window.__ARCHIVE_ATTRIBUTION__ = {
    source_domain: host || "direct",
    original_path: origPath,
    http_referrer: referrer,
    timestamp_utc: new Date().toISOString(),
    matched_vertical: matched ? matched.vertical : "general"
  };

  document.addEventListener("DOMContentLoaded", function () {
    if (matched) {
      var banner = document.createElement("div");
      banner.style.cssText = "background:#0f172a;border-bottom:2px solid #38bdf8;color:#f8fafc;padding:12px 20px;font-family:system-ui,sans-serif;font-size:14px;text-align:center;";
      banner.innerHTML = "<strong style='color:#38bdf8;margin-right:8px;'>[" + matched.badge + "]</strong> " + matched.message;
      document.body.insertBefore(banner, document.body.firstChild);
    }
  });
})();

/**
 * Above-the-fold CTA scroll + GoatCounter custom event tracking.
 * GoatCounter (archivevalue) pageviews come from the count.js tag in each page <head>;
 * count.js sends location.search with every hit, so utm_source / ref are kept as the referrer.
 * Events below are queued and retried until window.goatcounter.count is available.
 */
(function () {
  var params = new URLSearchParams(window.location.search);
  var SOURCE = ((params.get("utm_source") || params.get("ref") || "").replace(/^www\./, "").toLowerCase()) || "direct";
  var PAGE = (window.location.pathname.split("/").pop() || "index.html").replace(/\.html?$/i, "") || "index";

  function gcEvent(name, extra) {
    var title = name + " | " + SOURCE + " | " + PAGE + (extra ? " | " + extra : "");
    var tries = 0;
    (function attempt() {
      var gc = window.goatcounter;
      if (gc && typeof gc.count === "function") {
        try { gc.count({ path: name, title: title, event: true }); } catch (e) { /* never break the page */ }
      } else if (tries++ < 40) {
        setTimeout(attempt, 250); // retry for up to ~10s while count.js loads
      }
    })();
  }
  window.trackArchiveEvent = gcEvent;

  function scrollToForm() {
    var target = document.getElementById("get-valuation");
    if (!target) return;
    var header = document.querySelector("header");
    var offset = (header ? header.getBoundingClientRect().height : 0) + 16;
    var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
    try { window.scrollTo({ top: top, behavior: "smooth" }); } catch (e) { window.scrollTo(0, top); }
    var input = document.getElementById("leadName");
    if (input) {
      setTimeout(function () {
        try { input.focus({ preventScroll: true }); } catch (e) { input.focus(); }
      }, 600);
    }
  }

  var calcFired = false;
  function calcInteraction(el) {
    if (calcFired || !el) return;
    var isCalc = el.matches && (el.matches('input[type="range"], input.mod-chk, select') || el.closest(".mode-btn"));
    if (!isCalc) return;
    calcFired = true;
    gcEvent("calculator-interaction", el.id || el.className || el.tagName.toLowerCase());
  }

  document.addEventListener("click", function (ev) {
    var t = ev.target;
    if (!t || !t.closest) return;
    var cta = t.closest(".js-cta");
    if (cta) {
      ev.preventDefault();
      gcEvent(cta.getAttribute("data-cta-event") || "cta-click");
      scrollToForm();
      return;
    }
    var modeBtn = t.closest(".mode-btn");
    if (modeBtn) {
      var mode = (modeBtn.id || "").replace(/^btn-/, "") || "unknown";
      gcEvent("vertical-switch-" + mode);
      calcInteraction(modeBtn);
      return;
    }
    if (t.closest("#mailtoLink")) { gcEvent("email-link-click"); return; }
    var btn = t.closest("button.btn");
    if (btn && /submitLead/.test(btn.getAttribute("onclick") || "")) { gcEvent("lead-form-submit"); }
  }, true);

  document.addEventListener("input", function (ev) { calcInteraction(ev.target); }, true);
  document.addEventListener("change", function (ev) { calcInteraction(ev.target); }, true);
})();
