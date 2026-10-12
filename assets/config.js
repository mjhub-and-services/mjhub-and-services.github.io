// Local dev (served from localhost / 127.0.0.1) talks to `wrangler dev` and
// uses Cloudflare's always-pass Turnstile test sitekey; everywhere else uses
// the deployed Worker and the real sitekey. The local Worker must be given
// the matching test secret in .dev.vars — see the mjhub-backend README.
(function () {
  var isLocalDev = ["localhost", "127.0.0.1", "[::1]"].indexOf(window.location.hostname) !== -1;

  window.SITE_CONFIG = {
    CONTACT_ENDPOINT: isLocalDev
      ? "http://localhost:8787/contact"
      : "https://mjhub-cloudflare-proxy.mjhubandservices.workers.dev/contact",
    TURNSTILE_SITEKEY: isLocalDev ? "1x00000000000000000000AA" : "0x4AAAAAAEOzS56m0M5xjAFe",
    ORGANISATION_ID: "2c4d46bb-611b-463a-9cd4-1486a755850a"
  };
})();
