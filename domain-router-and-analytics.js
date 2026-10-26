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
