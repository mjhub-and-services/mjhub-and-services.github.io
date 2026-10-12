(function () {
  "use strict";

  var GENERIC_ERROR = "We couldn't send your request right now. Please try again in a moment.";
  var widgetId = null;

  // Render the Turnstile widget explicitly so the sitekey comes from
  // config.js (test key locally, real key elsewhere). api.js loads async with
  // ?render=explicit, so it may have run before or after this script.
  function renderTurnstile() {
    var container = document.querySelector(".cf-turnstile");
    if (!container || widgetId !== null) {
      return;
    }
    try {
      widgetId = window.turnstile.render(container, {
        sitekey: window.SITE_CONFIG.TURNSTILE_SITEKEY,
        theme: container.getAttribute("data-theme") || "auto",
        size: container.getAttribute("data-size") || "normal"
      });
    } catch (error) {
      console.warn("Unable to render Turnstile widget.", error);
    }
  }

  if (window.turnstile) {
    renderTurnstile();
  } else {
    var apiScript = document.querySelector('script[src*="challenges.cloudflare.com/turnstile/"]');
    if (apiScript) {
      apiScript.addEventListener("load", renderTurnstile, { once: true });
    }
  }

  function getTurnstileToken() {
    if (!window.turnstile || widgetId === null) {
      return "";
    }
    return window.turnstile.getResponse(widgetId) || "";
  }

  function resetTurnstile() {
    if (window.turnstile && widgetId !== null) {
      window.turnstile.reset(widgetId);
    }
  }

  function submitLead(fields, handlers) {
    var missingFields = [
      ["First name", fields.firstName],
      ["Last name", fields.lastName],
      ["Email", fields.email],
      ["Message", fields.message]
    ].filter(function (pair) { return !pair[1] || !pair[1].trim(); });

    if (missingFields.length > 0) {
      handlers.onValidationError(missingFields.map(function (pair) { return pair[0]; }));
      return Promise.resolve();
    }

    var turnstileToken = getTurnstileToken();

    if (!turnstileToken) {
      handlers.onMissingVerification();
      return Promise.resolve();
    }

    handlers.onSending();

    var payload = {
      first_name: fields.firstName,
      last_name: fields.lastName,
      organisation_id: window.SITE_CONFIG.ORGANISATION_ID,
      email: fields.email,
      enquiry_type: fields.enquiryType || "General enquiry",
      message: fields.message,
      // The Worker verifies Turnstile from this exact field name.
      cf_turnstile_response: turnstileToken
    };

    if (fields.phone && fields.phone.trim()) {
      payload.phone = fields.phone;
    }

    return fetch(window.SITE_CONFIG.CONTACT_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
      .then(function (response) {
        return response.json().catch(function () { return {}; }).then(function (body) {
          return { response: response, body: body };
        });
      })
      .then(function (result) {
        var response = result.response;
        var body = result.body || {};

        if (!response.ok || !body.ok) {
          console.error("Contact request failed", response.status, body);
          handlers.onError(body.message || GENERIC_ERROR);
          return;
        }

        handlers.onSuccess(body.message || "Submitted successfully.");
      })
      .catch(function (error) {
        // Network failures (including CORS rejections) land here with a
        // browser message like "Failed to fetch" — not useful to a visitor.
        console.error("Contact request failed", error);
        handlers.onError(GENERIC_ERROR);
      })
      .finally(function () {
        handlers.onSettled();
        // Tokens are single-use, so always fetch a fresh one.
        resetTurnstile();
      });
  }

  window.LeadSubmit = { submitLead: submitLead };
})();
