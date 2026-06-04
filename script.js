document.body.classList.add("is-entering");

const finishEntering = () => {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      document.body.classList.remove("is-entering");
    });
  });
};

if ("fonts" in document) {
  Promise.race([
    document.fonts.ready,
    new Promise((resolve) => window.setTimeout(resolve, 700)),
  ]).then(finishEntering);
} else {
  finishEntering();
}

const internalLinks = document.querySelectorAll('a[href]');

internalLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    const target = link.getAttribute("target");
    const isModifiedClick =
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

    if (!href || href.startsWith("#") || href.startsWith("mailto:")) {
      return;
    }

    if (target && target !== "_self") {
      return;
    }

    if (isModifiedClick || event.button !== 0) {
      return;
    }

    const url = new URL(href, window.location.href);

    if (url.origin !== window.location.origin) {
      return;
    }

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      window.location.href = url.href;
      return;
    }

    event.preventDefault();
    document.body.classList.add("is-leaving");

    window.setTimeout(() => {
      window.location.href = url.href;
    }, 180);
  });
});

// Mobile burger menu
(function () {
  const topbar = document.querySelector(".topbar");
  const topbarInner = document.querySelector(".topbar-inner");
  if (!topbar || !topbarInner) return;

  const burger = document.createElement("button");
  burger.className = "nav-burger";
  burger.setAttribute("aria-label", "Open menu");
  burger.setAttribute("aria-expanded", "false");
  burger.innerHTML = "<span></span><span></span><span></span>";
  topbarInner.appendChild(burger);

  const panel = document.createElement("nav");
  panel.className = "mobile-menu";
  panel.setAttribute("role", "navigation");
  panel.setAttribute("aria-label", "Mobile menu");

  const navLinks = [
    ["about.html", "About"],
    ["coaching.html", "Coaching"],
    ["consulting.html", "Consulting"],
    ["speaking.html", "Speaking"],
    ["training.html", "Training"],
    ["programmes.html", "Programmes"],
    ["research.html", "Research"],
    ["articles.html", "Articles"],
    ["mailto:hi@amyadvocates.com", "Contact"],
  ];

  navLinks.forEach(([href, text]) => {
    const a = document.createElement("a");
    a.href = href;
    a.textContent = text;
    if (!href.startsWith("mailto:")) {
      const url = new URL(href, window.location.href);
      if (url.pathname === window.location.pathname) {
        a.classList.add("is-current");
      }
    }
    panel.appendChild(a);
  });

  topbar.appendChild(panel);

  const panelLinks = panel.querySelectorAll("a");

  const closeMenu = (returnFocus) => {
    panel.classList.remove("is-open");
    burger.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Open menu");
    if (returnFocus) burger.focus();
  };

  const openMenu = () => {
    panel.classList.add("is-open");
    burger.classList.add("is-open");
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Close menu");
    if (panelLinks.length) panelLinks[0].focus();
  };

  burger.addEventListener("click", (e) => {
    e.stopPropagation();
    if (panel.classList.contains("is-open")) {
      closeMenu(false);
    } else {
      openMenu();
    }
  });

  document.addEventListener("click", (e) => {
    if (!topbar.contains(e.target)) closeMenu(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.classList.contains("is-open")) {
      closeMenu(true);
    }
  });

  panel.addEventListener("keydown", (e) => {
    if (e.key !== "Tab" || !panelLinks.length) return;
    const first = panelLinks[0];
    const last = panelLinks[panelLinks.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      burger.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      burger.focus();
    }
  });

  burger.addEventListener("keydown", (e) => {
    if (e.key === "Tab" && !e.shiftKey && panel.classList.contains("is-open") && panelLinks.length) {
      e.preventDefault();
      panelLinks[0].focus();
    }
  });
})();

const dropdowns = document.querySelectorAll(".nav-dropdown");

dropdowns.forEach((dropdown) => {
  let closeTimer = null;
  const trigger = dropdown.querySelector("[aria-haspopup]");
  const menu = dropdown.querySelector(".dropdown-menu");
  const items = menu ? Array.from(menu.querySelectorAll("[role='menuitem']")) : [];

  const syncAria = () => {
    if (trigger) {
      trigger.setAttribute("aria-expanded", String(dropdown.classList.contains("is-open")));
    }
  };

  const openMenu = () => {
    if (closeTimer) {
      window.clearTimeout(closeTimer);
      closeTimer = null;
    }
    dropdown.classList.add("is-open");
    syncAria();
  };

  const closeMenu = (returnFocus) => {
    closeTimer = window.setTimeout(() => {
      dropdown.classList.remove("is-open");
      syncAria();
      if (returnFocus && trigger) trigger.focus();
      closeTimer = null;
    }, 180);
  };

  const closeMenuNow = (returnFocus) => {
    if (closeTimer) {
      window.clearTimeout(closeTimer);
      closeTimer = null;
    }
    dropdown.classList.remove("is-open");
    syncAria();
    if (returnFocus && trigger) trigger.focus();
  };

  dropdown.addEventListener("mouseenter", openMenu);
  dropdown.addEventListener("mouseleave", () => closeMenu(false));
  dropdown.addEventListener("focusin", openMenu);

  dropdown.addEventListener("focusout", (event) => {
    if (dropdown.contains(event.relatedTarget)) {
      return;
    }
    closeMenu(false);
  });

  if (trigger) {
    trigger.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (dropdown.classList.contains("is-open")) {
          closeMenuNow(false);
        } else {
          openMenu();
          if (items.length) items[0].focus();
        }
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        openMenu();
        if (items.length) items[0].focus();
      }
      if (e.key === "Escape") {
        closeMenuNow(false);
      }
    });
  }

  if (menu) {
    menu.addEventListener("keydown", (e) => {
      const currentIndex = items.indexOf(document.activeElement);

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        items[next].focus();
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        items[prev].focus();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        closeMenuNow(true);
      }
    });
  }
});
