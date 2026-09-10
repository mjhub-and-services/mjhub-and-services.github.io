(function () {
  "use strict";

  var modal = document.getElementById("contact-modal");
  var modalPanel = modal.querySelector(".modal-panel");
  var toast = document.getElementById("toast");
  var form = document.getElementById("contact-form");
  var firstInput = document.getElementById("field-name");
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
      interestField.value = chip.textContent.trim();
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

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    closeModal();
    showToast();
    form.reset();
    interestChips.forEach(function (c) {
      c.classList.remove("is-active");
    });
    interestField.value = "";
  });
})();
