(() => {
  const body = document.body;
  const intro = document.getElementById("intro");
  const header = document.getElementById("header");
  const menuToggle = document.getElementById("menuToggle");
  const nav = document.getElementById("nav");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Duplicate ticker content for a seamless loop
  const tickerTrack = document.querySelector(".ticker-track");
  if (tickerTrack) tickerTrack.innerHTML += tickerTrack.innerHTML;

  const enterSite = () => {
    body.classList.remove("is-locked", "locked");
    body.classList.add("ready");
    header?.classList.add("visible");
  };

  if (intro && !reduceMotion) {
    requestAnimationFrame(() => requestAnimationFrame(() => intro.classList.add("play")));
    window.setTimeout(() => {
      intro.classList.add("is-out", "lift");
      enterSite();
      window.setTimeout(() => intro.remove(), 1300);
    }, 2200);
  } else {
    intro?.remove();
    enterSite();
  }

  const progress = document.getElementById("scrollProgress");
  const updateHeader = () => {
    header?.classList.toggle("scrolled", window.scrollY > 30);
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    }
  };
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  // Safety net: never leave content hidden if the observer is throttled
  const revealInView = () => {
    document.querySelectorAll(".reveal:not(.in-view)").forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.95 && r.bottom > 0) el.classList.add("in-view", "in");
    });
  };
  window.addEventListener("scroll", revealInView, { passive: true });
  window.addEventListener("load", () => setTimeout(revealInView, 60));

  const revealTargets = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view", "in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });
    revealTargets.forEach(el => observer.observe(el));

    const diagramObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("drawn");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    document.querySelectorAll(".diagram-wrap").forEach(el => diagramObserver.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add("in-view", "in"));
  }

  const closeMenu = () => {
    nav?.classList.remove("is-open", "open");
    menuToggle?.setAttribute("aria-expanded", "false");
    if (menuToggle) menuToggle.innerHTML = 'Menu <span>＋</span>';
    body.style.overflow = "";
  };

  menuToggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.innerHTML = open ? 'Close <span>×</span>' : 'Menu <span>＋</span>';
    body.style.overflow = open ? "hidden" : "";
  });
  nav?.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMenu();
  });

  // Lightbox (traffic screenshots)
  const modal = document.getElementById("lightbox");
  const closeBtn = document.getElementById("lightbox-close");
  if (modal && closeBtn) {
    const closeModal = () => {
      modal.classList.remove("open");
      body.style.overflow = "";
    };
    document.querySelectorAll(".cs-screenshot, .lightbox-trigger").forEach(el => {
      el.addEventListener("click", () => {
        const inner = modal.querySelector(".lightbox-inner");
        if (!inner) return;
        let content = "";
        if (el.dataset.imgSrc) content += `<img class="lightbox-img" src="${el.dataset.imgSrc}" alt="${el.dataset.label || ""}" />`;
        if (el.dataset.iframeSrc) content += `<iframe class="lightbox-iframe" src="${el.dataset.iframeSrc}" title="${el.dataset.label || ""}"></iframe>`;
        inner.innerHTML = content;
        modal.classList.add("open");
        body.style.overflow = "hidden";
      });
    });
    closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
  }

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
