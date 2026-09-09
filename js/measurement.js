(function () {
  "use strict";

  var config = window.INNATAIRE_MEASUREMENT || {};
  // Exact origin gate excludes localhost, file://, test ports and Netlify previews.
  if (config.environment !== "production" ||
      window.location.origin !== "https://www.innataire.com") return;

  function loadScript(id, src) {
    var script = document.createElement("script");
    script.id = id;
    script.async = true;
    script.src = src;
    document.head.appendChild(script);
  }

  var ga4Id = typeof config.ga4MeasurementId === "string" ? config.ga4MeasurementId.trim() : "";
  if (/^G-[A-Z0-9]+$/.test(ga4Id) && !window.gtag &&
      !document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    // This is a static multi-document site: config sends one page_view per load.
    // Do not add a manual initial page_view or a client-router listener.
    window.gtag("config", ga4Id);
    loadScript("innataire-ga4", "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(ga4Id));
  }

  var clarityId = typeof config.clarityProjectId === "string" ? config.clarityProjectId.trim() : "";
  if (/^[a-z0-9]+$/.test(clarityId) && !window.clarity &&
      !document.querySelector('script[src*="clarity.ms/tag/"]')) {
    window.clarity = function () {
      (window.clarity.q = window.clarity.q || []).push(arguments);
    };
    loadScript("innataire-clarity", "https://www.clarity.ms/tag/" + encodeURIComponent(clarityId));
  }
}());
