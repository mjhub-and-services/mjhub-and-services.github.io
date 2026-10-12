(function () {
  "use strict";

  var root = document.documentElement;

  // Scroll progress bar — runs regardless of motion preference since it's
  // feedback, not decoration.
  function updateProgress() {
    var max = root.scrollHeight - window.innerHeight;
    root.style.setProperty("--scroll-progress", max > 0 ? Math.min(window.scrollY / max, 1) : 0);
  }

  // Cursor spotlight on founder cards.
  document.querySelectorAll(".founder-card").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", e.clientX - rect.left + "px");
      card.style.setProperty("--my", e.clientY - rect.top + "px");
    });
  });

  // Button fill: grow the circle from where the mouse enters and shrink it
  // toward where it leaves. Sized to twice the diagonal so it covers the
  // button from any point.
  document.querySelectorAll(".btn-fx").forEach(function (btn) {
    function placeFill(e) {
      var rect = btn.getBoundingClientRect();
      btn.style.setProperty("--fx", e.clientX - rect.left + "px");
      btn.style.setProperty("--fy", e.clientY - rect.top + "px");
      btn.style.setProperty("--fs", Math.hypot(rect.width, rect.height) * 2 + "px");
    }
    btn.addEventListener("pointerenter", function (e) {
      if (e.pointerType !== "mouse" || btn.disabled) {
        return;
      }
      placeFill(e);
      btn.classList.add("is-filled");
    });
    btn.addEventListener("pointerleave", function (e) {
      if (e.pointerType !== "mouse") {
        return;
      }
      placeFill(e);
      btn.classList.remove("is-filled");
    });
  });

  var motion = root.classList.contains("js-reveal");
  var parallaxEls = motion ? Array.prototype.slice.call(document.querySelectorAll("[data-parallax]")) : [];
  var hero = document.querySelector(".hero");

  // Parallax: shift each oversized image against the scroll, clamped to the
  // 15% overhang set in CSS so an edge never shows.
  function updateParallax() {
    var vh = window.innerHeight;
    parallaxEls.forEach(function (img) {
      var section = img.parentElement.getBoundingClientRect();
      if (section.bottom < 0 || section.top > vh) {
        return;
      }
      var limit = section.height * 0.15;
      var offset = (vh / 2 - (section.top + section.height / 2)) * 0.15;
      img.style.setProperty("--parallax", Math.max(-limit, Math.min(limit, offset)).toFixed(1) + "px");
    });
    if (motion && hero) {
      var progress = Math.max(0, Math.min(1, -hero.getBoundingClientRect().top / hero.offsetHeight));
      hero.style.setProperty("--hero-progress", progress.toFixed(3));
    }
  }

  // Top bar: gains a backdrop once the page moves, slides away while
  // scrolling down and comes back on any scroll up. Small jitters are
  // ignored so it doesn't flicker on trackpads.
  var topbar = document.querySelector(".topbar");
  var lastY = Math.max(window.scrollY, 0);
  var scrollingUp = false;

  function updateTopbar() {
    var y = Math.max(window.scrollY, 0);
    var delta = y - lastY;
    if (Math.abs(delta) < 6) {
      return;
    }
    scrollingUp = delta < 0;
    lastY = y;
    topbar.classList.toggle("is-scrolled", y > 24);
    var keepVisible = scrollingUp || y < topbar.offsetHeight * 2 || topbar.contains(document.activeElement);
    topbar.classList.toggle("is-hidden", !keepVisible);
  }

  topbar.addEventListener("focusin", function () {
    topbar.classList.remove("is-hidden");
  });

  var ticking = false;
  function onScroll() {
    if (ticking) {
      return;
    }
    ticking = true;
    window.requestAnimationFrame(function () {
      ticking = false;
      updateProgress();
      updateParallax();
      updateTopbar();
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  updateProgress();
  updateParallax();
  topbar.classList.toggle("is-scrolled", lastY > 24);

  if (!motion) {
    return;
  }

  // Reveal on scroll, in both directions. Elements that enter together are
  // staggered in the order the eye meets them: top-down when scrolling down,
  // bottom-up when scrolling back up. Once an element is fully off screen it
  // resets so it replays next time; text that left through the top re-enters
  // sliding down rather than up.
  //
  // Clipped images are watched through their section — IntersectionObserver
  // honours the image's own clip-path, so a fully wiped-out image would never
  // register — and wait until a fifth of it is visible so the wipe plays
  // where it can be seen.
  var revealTargets = new Map();

  function revealBatch(entries) {
    var entering = entries.filter(function (entry) {
      return entry.isIntersecting;
    });
    if (scrollingUp) {
      entering.reverse();
    }
    entering.forEach(function (entry, i) {
      var el = revealTargets.get(entry.target);
      el.style.setProperty("--reveal-delay", Math.min(i * 80, 640) + "ms");
      el.classList.add("is-revealed");
    });
  }

  function resetOffscreen(entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        return;
      }
      var el = revealTargets.get(entry.target);
      el.classList.remove("is-revealed");
      el.style.removeProperty("--reveal-delay");
      if (el.getAttribute("data-reveal") === "") {
        el.setAttribute("data-from", entry.boundingClientRect.bottom <= 0 ? "above" : "below");
      }
    });
  }

  var textObserver = new IntersectionObserver(revealBatch, { rootMargin: "0px 0px -24px 0px" });
  var mediaObserver = new IntersectionObserver(revealBatch, { threshold: 0.2 });
  var exitObserver = new IntersectionObserver(resetOffscreen);

  document.querySelectorAll("[data-reveal]").forEach(function (el) {
    var type = el.getAttribute("data-reveal");
    var isMedia = type === "zoom" || type.indexOf("wipe") === 0;
    var watched = isMedia ? el.parentElement : el;
    revealTargets.set(watched, el);
    (isMedia ? mediaObserver : textObserver).observe(watched);
    exitObserver.observe(watched);
  });
})();

(function () {
  "use strict";

  var modal = document.getElementById("contact-modal");
  var modalPanel = modal.querySelector(".modal-panel");
  var toast = document.getElementById("toast");
  var form = document.getElementById("contact-form");
  var firstInput = document.getElementById("field-first-name");
  var toastTimer = null;
  var lastOpener = null;

  // The closed modal is only faded out, so it's kept inert to stay out of
  // the tab order and the accessibility tree. Focus returns to whichever
  // button opened it.
  function openModal(e) {
    lastOpener = e && e.currentTarget;
    setStatus("");
    modal.inert = false;
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
    window.setTimeout(function () {
      firstInput.focus();
    }, 120);
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.inert = true;
    document.body.style.overflow = "";
    if (lastOpener && typeof lastOpener.focus === "function") {
      lastOpener.focus();
    }
    lastOpener = null;
  }

  document.querySelectorAll("[data-open-modal]").forEach(function (el) {
    el.addEventListener("click", openModal);
  });

  document.querySelectorAll("[data-close-modal]").forEach(function (el) {
    el.addEventListener("click", closeModal);
  });

  // Escape closes; Tab wraps within the panel so focus can't fall behind
  // the modal into the page.
  document.addEventListener("keydown", function (e) {
    if (!modal.classList.contains("is-open")) {
      return;
    }
    if (e.key === "Escape") {
      closeModal();
      return;
    }
    if (e.key !== "Tab") {
      return;
    }
    var focusable = modalPanel.querySelectorAll("button:not([disabled]), input:not([type=hidden]), textarea, iframe");
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
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
        c.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      interestField.value = chip.dataset.enquiryType || "General enquiry";
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
  var submitBtnLabel = submitBtn.querySelector(".submit-btn__label .btn-roll__text");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // The rolling label shows its text twice (the second copy comes from
  // data-text), so both have to change together.
  function setSubmitLabel(text) {
    submitBtnLabel.textContent = text;
    submitBtnLabel.setAttribute("data-text", text);
  }

  function resetSubmitBtn() {
    submitBtn.disabled = false;
    submitBtn.classList.remove("is-sending", "is-success");
    setSubmitLabel("Send request");
  }

  function setStatus(message, tone) {
    statusEl.textContent = message || "";
    statusEl.classList.toggle("is-error", tone === "error");
  }

  function resetInterestChips() {
    interestChips.forEach(function (c) {
      c.classList.remove("is-active");
      c.setAttribute("aria-pressed", "false");
    });
    interestField.value = "General enquiry";
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (submitBtn.disabled) {
      return;
    }

    var emailInput = document.getElementById("field-email");
    if (emailInput.value.trim() && !emailInput.checkValidity()) {
      setStatus("Please enter a valid email address.", "error");
      emailInput.focus();
      return;
    }

    var company = document.getElementById("field-company").value.trim();
    var message = document.getElementById("field-message").value.trim();

    var fields = {
      firstName: document.getElementById("field-first-name").value.trim(),
      lastName: document.getElementById("field-last-name").value.trim(),
      email: document.getElementById("field-email").value.trim(),
      phone: document.getElementById("field-phone").value.trim(),
      message: company ? "Company / Venture: " + company + "\n\n" + message : message,
      enquiryType: interestField.value || "General enquiry"
    };

    var succeeded = false;

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
        submitBtn.classList.add("is-sending");
        setSubmitLabel("Sending…");
      },
      onSuccess: function () {
        // Hold the drawn tick for a beat before closing, then reset the
        // button once the modal has faded so it doesn't visibly snap back.
        succeeded = true;
        setStatus("");
        submitBtn.classList.remove("is-sending");
        submitBtn.classList.add("is-success");
        setSubmitLabel("Sent");
        window.setTimeout(function () {
          closeModal();
          showToast();
          form.reset();
          resetInterestChips();
          window.setTimeout(resetSubmitBtn, 450);
        }, reduceMotion ? 400 : 1100);
      },
      onError: function (message) {
        setStatus(message || "Something went wrong. Please try again.", "error");
      },
      onSettled: function () {
        if (!succeeded) {
          resetSubmitBtn();
        }
      }
    });
  });
})();
