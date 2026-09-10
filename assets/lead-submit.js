(function () {
  "use strict";

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

    var turnstileToken = window.turnstile && typeof window.turnstile.getResponse === "function"
      ? window.turnstile.getResponse()
      : "";

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
      enquiry_type: fields.enquiryType || "general",
      message: fields.message,
      turnstile_token: turnstileToken
    };

    if (fields.phone && fields.phone.trim()) {
      payload.phone = fields.phone;
    }

    return fetch(window.SITE_CONFIG.CONTACT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
          var errorMessage = body.message || ("Request failed with status " + response.status);
          handlers.onError(errorMessage);
          return;
        }

        handlers.onSuccess(body.message || "Submitted successfully.");
      })
      .catch(function (error) {
        var errorMessage = (error && error.message) || "Unexpected network error";
        handlers.onError(errorMessage);
      })
      .finally(function () {
        handlers.onSettled();
        if (window.turnstile && typeof window.turnstile.reset === "function") {
          window.turnstile.reset();
        }
      });
  }

  window.LeadSubmit = { submitLead: submitLead };
})();
