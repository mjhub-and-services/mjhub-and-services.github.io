# MJ Hub Contact Form — Implementation Guide

Source of truth: `developer-profile` repo (this site), specifically:
- `assets/js/config.js`
- `assets/js/lead-submit.js`
- `assets/js/contact.js`
- `assets/css/contact.css`
- `contact/index.html`

This site's contact form already posts to an MJ Hub-owned Cloudflare Worker
(`mjhub-cloudflare-proxy.mjhubandservices.workers.dev`), so MJ Hub's own
contact form should reuse the **same endpoint and organisation ID** — leads
land in the same place either way. Nothing needs to be duplicated
server-side; only the client-side form needs porting.

## 1. Prerequisites — do these first, or submissions will fail silently/CORS-error

1. **Worker CORS allowlist**: the Cloudflare Worker at
   `mjhub-cloudflare-proxy.mjhubandservices.workers.dev` must allow the
   `www.mjhub.co.uk` (and `mjhub.co.uk`) origin. If the worker currently only
   allows the developer-profile domain, add MJ Hub's domain(s) to its CORS
   config before wiring up the frontend.
2. **Turnstile sitekey domain allowlist**: the sitekey used below
   (`0x4AAAAAAEOzS56m0M5xjAFe`) is scoped to specific hostnames in the
   Cloudflare Turnstile dashboard. Add `mjhub.co.uk` / `www.mjhub.co.uk` there,
   or the widget won't render / will fail validation on that domain. (Using a
   separate sitekey for MJ Hub is also fine — swap the `data-sitekey` value —
   but reusing the same one keeps one fewer thing to manage.)

## 2. Config values (identical across both sites)

```js
window.SITE_CONFIG = {
  CONTACT_ENDPOINT: 'https://mjhub-cloudflare-proxy.mjhubandservices.workers.dev/contact',
  ORGANISATION_ID: '2c4d46bb-611b-463a-9cd4-1486a755850a'
};
```

Turnstile sitekey (used in markup, not config.js): `0x4AAAAAAEOzS56m0M5xjAFe`

## 3. API contract

`POST {CONTACT_ENDPOINT}` with JSON body:

```json
{
  "first_name": "string, required",
  "last_name": "string, required",
  "organisation_id": "2c4d46bb-611b-463a-9cd4-1486a755850a",
  "email": "string, required",
  "enquiry_type": "string, defaults to 'general'",
  "message": "string, required",
  "turnstile_token": "string, required — from window.turnstile.getResponse()",
  "phone": "string, optional — omit key entirely if blank"
}
```

Expected response: JSON body with `{ ok: true, message: "..." }` on success.
Any non-2xx status, or a 2xx with `ok` falsy, is treated as an error; the
worker's `message` (or `body.message`) is surfaced to the user, falling back
to `Request failed with status {status}`.

## 4. Core submission logic (framework-agnostic, copy as-is)

This is the part that must stay **identical** — validation rules, payload
shape, Turnstile handling, and the fetch/error handling. Port it verbatim
into MJ Hub regardless of what stack MJ Hub's frontend uses (plain JS, React,
etc.) — if MJ Hub is React/Next, this becomes a `submitLead` utility function
called from a form component instead of a global `window.LeadSubmit`.

```js
function submitLead(fields, handlers) {
  var missingFields = [
    ['First name', fields.firstName],
    ['Last name', fields.lastName],
    ['Email', fields.email],
    ['Message', fields.message]
  ].filter(function (pair) { return !pair[1] || !pair[1].trim(); });

  if (missingFields.length > 0) {
    handlers.onValidationError(missingFields.map(function (pair) { return pair[0]; }));
    return Promise.resolve();
  }

  var turnstileToken = window.turnstile && typeof window.turnstile.getResponse === 'function'
    ? window.turnstile.getResponse()
    : '';

  if (!turnstileToken) {
    handlers.onMissingVerification();
    return Promise.resolve();
  }

  handlers.onSending();

  var payload = {
    first_name: fields.firstName,
    last_name: fields.lastName,
    organisation_id: ORGANISATION_ID,
    email: fields.email,
    enquiry_type: fields.enquiryType || 'general',
    message: fields.message,
    turnstile_token: turnstileToken
  };

  if (fields.phone && fields.phone.trim()) {
    payload.phone = fields.phone;
  }

  return fetch(CONTACT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
        var errorMessage = body.message || ('Request failed with status ' + response.status);
        handlers.onError(errorMessage);
        return;
      }

      handlers.onSuccess(body.message || 'Submitted successfully.');
    })
    .catch(function (error) {
      var errorMessage = (error && error.message) || 'Unexpected network error';
      handlers.onError(errorMessage);
    })
    .finally(function () {
      handlers.onSettled();
      if (window.turnstile && typeof window.turnstile.reset === 'function') {
        window.turnstile.reset();
      }
    });
}
```

`handlers` is a small callback object the caller supplies so the UI can
render feedback however it likes:

```js
submitLead(fields, {
  onValidationError: function (missingFieldNames) { /* show which fields are empty */ },
  onMissingVerification: function () { /* Turnstile not completed yet */ },
  onSending: function () { /* disable submit button, show spinner */ },
  onSuccess: function (message) { /* show success message, reset form */ },
  onError: function (message) { /* show error message */ },
  onSettled: function () { /* re-enable submit button (runs after success or error) */ }
});
```

`fields` shape: `{ firstName, lastName, email, phone, message, enquiryType }`
(`phone` and `enquiryType` optional).

## 5. Markup requirements

1. Load the Turnstile script in `<head>`:
   ```html
   <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
   ```
2. Render the widget somewhere in the form:
   ```html
   <div class="cf-turnstile" data-sitekey="0x4AAAAAAEOzS56m0M5xjAFe" data-theme="dark" data-size="flexible"></div>
   ```
   (Drop `data-theme="dark"` or change it to match MJ Hub's palette — the
   value is purely cosmetic.)
3. A standard form with fields for first name, last name, email, phone
   (optional), message — inputs can be named/IDed however suits MJ Hub's
   markup; `submitLead` doesn't care about DOM structure, only the `fields`
   object built from it.

## 6. UI: reuse as-is vs. reskin

Two UI variants exist in developer-profile, both driving the same
`submitLead`:

- **Terminal-style form** (`contact.js`, `contact.css`) — a command-driven
  terminal (`/name`, `/email`, `/message`, `/send`, etc.) with a Matrix
  easter egg. This is a strong stylistic choice tied to this portfolio site's
  "developer terminal" theme — **probably not** a fit for MJ Hub's more
  corporate "business consulting studio" branding (see the MJ Hub homepage
  screenshot: clean, dark hero, minimal).
- **Simple form** (`[data-simple-mode]` block in `contact/index.html`) — a
  plain first name / last name / email / phone / message form with a status
  line and submit button. This is the better starting point for MJ Hub: strip
  out the terminal/mode-toggle scaffolding and keep just this form, styled to
  match MJ Hub's existing design system (the "Start a project" CTA / neon
  button style already on their homepage).

Recommendation: **reuse the submission logic verbatim** (Section 4), but
build MJ Hub's own form markup/CSS to match its brand rather than importing
`contact.css` wholesale — that stylesheet is written for developer-profile's
dark/purple terminal theme.

## 7. Testing checklist

- [ ] Submit with fields empty → validation error listing missing fields, no
      network request fires.
- [ ] Submit with fields filled but Turnstile not completed → "please
      complete the verification challenge" error, no network request.
- [ ] Submit with everything valid → success message shown, form resets,
      Turnstile widget resets (`window.turnstile.reset()`).
- [ ] Check the lead actually lands wherever MJ Hub leads are reviewed
      (confirms `organisation_id` routing is correct — it should be, since
      it's the same ID already in production use on this site).
- [ ] Test from the real `mjhub.co.uk` / `www.mjhub.co.uk` origin (not just
      localhost) to confirm the CORS and Turnstile domain allowlists from
      Section 1 are actually set up — this is the step most likely to be
      missed.
