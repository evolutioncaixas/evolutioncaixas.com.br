(function () {
  "use strict";

  /* ------------------------------------------------------------------ */
  /* Header scroll state + mobile nav                                    */
  /* ------------------------------------------------------------------ */
  var header = document.querySelector(".site-header");
  var navToggle = document.querySelector(".nav-toggle");
  var mainNav = document.getElementById("main-nav");

  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = mainNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      document.body.style.overflow = isOpen ? "hidden" : "";
    });
    mainNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mainNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mainNav.classList.contains("is-open")) {
        mainNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
        navToggle.focus();
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Reveal on scroll                                                    */
  /* ------------------------------------------------------------------ */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length && "IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ------------------------------------------------------------------ */
  /* Testimonials carousel                                               */
  /* ------------------------------------------------------------------ */
  var testimonialTrack = document.querySelector(".testimonial-track");
  if (testimonialTrack) {
    var slides = testimonialTrack.querySelectorAll(".testimonial-slide");
    var avatarBtns = testimonialTrack.querySelectorAll(".avatar-btn");
    var current = 0;
    var timer = null;

    var showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      avatarBtns.forEach(function (btn, i) {
        btn.setAttribute("aria-pressed", String(i === current));
      });
    };

    var startAutoplay = function () {
      stopAutoplay();
      timer = window.setInterval(function () { showSlide(current + 1); }, 6000);
    };
    var stopAutoplay = function () {
      if (timer) { window.clearInterval(timer); timer = null; }
    };

    avatarBtns.forEach(function (btn, i) {
      btn.addEventListener("click", function () {
        showSlide(i);
        startAutoplay();
      });
    });

    testimonialTrack.addEventListener("mouseenter", stopAutoplay);
    testimonialTrack.addEventListener("mouseleave", startAutoplay);
    testimonialTrack.addEventListener("focusin", stopAutoplay);
    testimonialTrack.addEventListener("focusout", startAutoplay);

    showSlide(0);
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      startAutoplay();
    }
  }

  /* ------------------------------------------------------------------ */
  /* Model tabs                                                          */
  /* ------------------------------------------------------------------ */
  var tabButtons = document.querySelectorAll(".models-tabs button");
  var panels = document.querySelectorAll(".model-panel");
  if (tabButtons.length && panels.length) {
    tabButtons.forEach(function (btn, i) {
      btn.addEventListener("click", function () { activateTab(i); });
      btn.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowRight") next = (i + 1) % tabButtons.length;
        if (e.key === "ArrowLeft") next = (i - 1 + tabButtons.length) % tabButtons.length;
        if (next !== null) {
          e.preventDefault();
          tabButtons[next].focus();
          activateTab(next);
        }
      });
    });

    function activateTab(index) {
      tabButtons.forEach(function (btn, i) {
        btn.setAttribute("aria-selected", String(i === index));
        btn.tabIndex = i === index ? 0 : -1;
      });
      panels.forEach(function (panel, i) {
        panel.classList.toggle("is-active", i === index);
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /* Cookie consent (LGPD)                                               */
  /* ------------------------------------------------------------------ */
  var CONSENT_KEY = "evolutioncaixas_cookie_consent";
  var banner = document.getElementById("cookie-banner");
  var modal = document.getElementById("cookie-modal");
  var analyticsSwitch = document.getElementById("cookie-analytics");
  var marketingSwitch = document.getElementById("cookie-marketing");

  function readConsent() {
    try {
      var raw = localStorage.getItem(CONSENT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveConsent(consent) {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    } catch (e) { /* storage unavailable, degrade silently */ }
    applyConsent(consent);
  }

  function applyConsent(consent) {
    document.dispatchEvent(new CustomEvent("cookieconsentchange", { detail: consent }));
    // Third-party analytics/marketing scripts should be loaded here,
    // gated on consent.analytics / consent.marketing — none are wired
    // up by default in this template.
  }

  function hideBanner() {
    if (banner) banner.classList.remove("is-visible");
  }
  function showBanner() {
    if (banner) banner.classList.add("is-visible");
  }
  function openModal() {
    if (!modal) return;
    var existing = readConsent();
    if (analyticsSwitch) analyticsSwitch.checked = existing ? !!existing.analytics : false;
    if (marketingSwitch) marketingSwitch.checked = existing ? !!existing.marketing : false;
    modal.classList.add("is-visible");
    modal.querySelector(".cookie-modal-box").focus();
  }
  function closeModal() {
    if (modal) modal.classList.remove("is-visible");
  }

  var existingConsent = readConsent();
  if (existingConsent) {
    applyConsent(existingConsent);
  } else if (banner) {
    window.setTimeout(showBanner, 600);
  }

  document.querySelectorAll("[data-cookie-accept]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      saveConsent({ necessary: true, analytics: true, marketing: true, date: new Date().toISOString() });
      hideBanner();
      closeModal();
    });
  });
  document.querySelectorAll("[data-cookie-reject]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      saveConsent({ necessary: true, analytics: false, marketing: false, date: new Date().toISOString() });
      hideBanner();
      closeModal();
    });
  });
  document.querySelectorAll("[data-cookie-customize]").forEach(function (btn) {
    btn.addEventListener("click", openModal);
  });
  document.querySelectorAll("[data-cookie-save]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      saveConsent({
        necessary: true,
        analytics: analyticsSwitch ? analyticsSwitch.checked : false,
        marketing: marketingSwitch ? marketingSwitch.checked : false,
        date: new Date().toISOString()
      });
      hideBanner();
      closeModal();
    });
  });
  document.querySelectorAll("[data-cookie-close]").forEach(function (btn) {
    btn.addEventListener("click", closeModal);
  });
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("is-visible")) closeModal();
    });
  }

  /* ------------------------------------------------------------------ */
  /* Footer year                                                         */
  /* ------------------------------------------------------------------ */
  var yearEl = document.getElementById("current-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
