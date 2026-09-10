(function () {
  "use strict";

  var modal = document.getElementById("contact-modal");
  var modalPanel = modal.querySelector(".modal-panel");
  var toast = document.getElementById("toast");
  var form = document.getElementById("contact-form");
  var firstInput = document.getElementById("field-first-name");
  var toastTimer = null;

  function openModal() {
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
    window.setTimeout(function () {
      firstInput.focus();
    }, 120);
  }

  function closeModal() {
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  document.querySelectorAll("[data-open-modal]").forEach(function (el) {
    el.addEventListener("click", openModal);
  });

  document.querySelectorAll("[data-close-modal]").forEach(function (el) {
    el.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });

  modalPanel.addEventListener("click", function (e) {
    e.stopPropagation();
  });

  var interestChips = document.querySelectorAll(".interest-chip");
  var interestField = document.getElementById("field-interest");

  interestChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      interestChips.forEach(function (c) {
        c.classList.remove("is-active");
      });
      chip.classList.add("is-active");
      interestField.value = chip.dataset.enquiryType || "general";
    });
  });

  function showToast() {
    toast.classList.add("is-visible");
    if (toastTimer) {
      window.clearTimeout(toastTimer);
    }
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 4000);
  }

  var statusEl = document.getElementById("form-status");
  var submitBtn = form.querySelector(".submit-btn");
  var submitBtnLabel = submitBtn.querySelector(".submit-btn__label");

  function setStatus(message, tone) {
    statusEl.textContent = message || "";
    statusEl.classList.toggle("is-error", tone === "error");
  }

  function resetInterestChips() {
    interestChips.forEach(function (c) {
      c.classList.remove("is-active");
    });
    interestField.value = "general";
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var company = document.getElementById("field-company").value.trim();
    var message = document.getElementById("field-message").value.trim();

    var fields = {
      firstName: document.getElementById("field-first-name").value.trim(),
      lastName: document.getElementById("field-last-name").value.trim(),
      email: document.getElementById("field-email").value.trim(),
      phone: document.getElementById("field-phone").value.trim(),
      message: company ? "Company / Venture: " + company + "\n\n" + message : message,
      enquiryType: interestField.value || "general"
    };

    window.LeadSubmit.submitLead(fields, {
      onValidationError: function (missingFieldNames) {
        setStatus("Please fill in: " + missingFieldNames.join(", ") + ".", "error");
      },
      onMissingVerification: function () {
        setStatus("Please complete the verification challenge.", "error");
      },
      onSending: function () {
        setStatus("Sending…");
        submitBtn.disabled = true;
        submitBtnLabel.textContent = "Sending…";
      },
      onSuccess: function () {
        setStatus("");
        closeModal();
        showToast();
        form.reset();
        resetInterestChips();
      },
      onError: function (message) {
        setStatus(message || "Something went wrong. Please try again.", "error");
      },
      onSettled: function () {
        submitBtn.disabled = false;
        submitBtnLabel.textContent = "Send request";
      }
    });
  });
})();
