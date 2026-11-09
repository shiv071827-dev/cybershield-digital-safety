import { createQuiz } from "./scam-lab.js";
import { translations } from "./translations.js";

const languageSelect = document.querySelector("#language-select");
const lessonGrid = document.querySelector("#lesson-grid");
const trendGrid = document.querySelector("#trend-grid");
const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-nav");
const soundToggle = document.querySelector(".sound-toggle");
const soundStatus = document.querySelector("#sound-status");
const shieldInteractionButton = document.querySelector(".shield-interaction");
const shieldInteractionStatus = document.querySelector("#shield-interaction-status");
let shieldPulseTimeout;
const reportDropdown = navigation.querySelector(".nav-dropdown");
const morphSection = document.querySelector("#explore");
const morphStage = document.querySelector("#morph-stage");
const morphStatus = document.querySelector("#morph-status");
const lessonVisuals = [
  "/assets/cybershield/network-security-circuit.jpg",
  "/assets/cybershield/qr-payment-concept.jpg",
  "/assets/cybershield/mobile-shield-interface.jpg",
  "/images/digital-workspace.jpg",
  "/assets/cybershield/secure-vault.jpg",
  "/assets/cybershield/biometric-protection.jpg",
  "/assets/cybershield/fiber-optic-threat-network.jpg",
  "/assets/cybershield/synthetic-fingerprint.jpg",
];

function getSavedLanguage() {
  try {
    const savedLanguage = window.localStorage.getItem("cybershield-language");
    return ["en", "kn"].includes(savedLanguage) ? savedLanguage : "en";
  } catch (error) {
    console.warn("The saved language preference could not be read; using English for this visit.", error);
    return "en";
  }
}

function saveLanguage(language) {
  try {
    window.localStorage.setItem("cybershield-language", language);
  } catch (error) {
    console.warn("The language preference could not be saved; the current page language remains available.", error);
  }
}

let currentLanguage = getSavedLanguage();
let soundEnabled = false;
let audioContext;
let morphStatusKey = "galleryScatter";
let reportPointerInside = false;
let reportHoverDismissed = false;

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.documentElement.classList.add("motion-ready");
}

function renderLessons(language) {
  const content = translations[language];
  lessonGrid.innerHTML = content.lessons
    .map(
      (lesson, index) => `
        <article class="lesson-card lesson-card--${index + 1} reveal" id="lesson-${index + 1}">
          <div class="lesson-card-top"><span class="lesson-number">0${index + 1} / ${content.lessonSignalTag}</span><span class="lesson-coordinate">${String(index + 1).padStart(2, "0")}.0${content.lessons.length}</span></div>
          <div class="lesson-art">
            <img class="lesson-art-image" src="${lessonVisuals[index]}" alt="${content.lessonVisualAlts[index]}" loading="lazy" decoding="async" />
            <span class="lesson-art-illustration" aria-hidden="true">${lessonArtwork[lesson.icon]}</span>
          </div>
          <div class="lesson-copy">
            <p class="lesson-kicker">${lesson.kicker || content.ui.lessonKicker}</p>
            <h3>${lesson.headline || lesson.title}</h3>
            <p class="lesson-category">${lesson.title}</p>
            <p>${lesson.description}</p>
            <div class="red-flag"><span class="signal-marker" aria-hidden="true"></span><span><strong>${content.ui.redFlag}</strong> ${lesson.flag}</span></div>
            <blockquote class="lesson-example"><span>${content.ui.fictionalLabel}</span>${lesson.example}</blockquote>
            <details class="lesson-response"><summary>${content.ui.lessonAction}</summary><p>${lesson.response}</p></details>
            <details class="lesson-checklist">
              <summary>${content.ui.lessonChecklistLabel}</summary>
              <ul>${content.lessonGuidance[index].checks.map((item) => `<li>${item}</li>`).join("")}</ul>
              <p><strong>${content.ui.lessonAfterActionLabel}</strong> ${content.lessonGuidance[index].afterAction}</p>
            </details>
          </div>
        </article>`,
    )
    .join("");
  lessonGrid.querySelectorAll("img").forEach(registerImageFailure);
}

function renderTrendTopics(language) {
  const content = translations[language];
  trendGrid.innerHTML = content.trends
    .map(
      (trend, index) => `
        <article class="trend-card reveal">
          <div class="trend-card-visual">
            <img class="trend-card-image" src="${trend.image}" alt="${trend.alt}" loading="lazy" decoding="async" />
            <span class="trend-card-art" aria-hidden="true">${lessonArtwork[trend.icon]}</span>
            <span class="trend-card-number">${String(index + 1).padStart(2, "0")}</span>
          </div>
          <h4>${trend.title}</h4>
          <p>${trend.description}</p>
          <p class="trend-action"><strong>${content.ui.trendActionLabel}</strong>${trend.action}</p>
        </article>`,
    )
    .join("");
  trendGrid.querySelectorAll("img").forEach(registerImageFailure);
}

function renderMorphGallery(language) {
  const content = translations[language];
  morphStage.querySelectorAll("[data-morph-card]").forEach((card, index) => {
    const lesson = content.lessons[index];
    card.href = `#lesson-${index + 1}`;
    card.querySelector(".morph-card-art").innerHTML = `<img src="${lessonVisuals[index]}" alt="" loading="lazy" decoding="async" />${lessonArtwork[lesson.icon]}`;
    card.querySelector(".morph-card-number").textContent = String(index + 1).padStart(2, "0");
    card.querySelector(".morph-card-title").textContent = lesson.title;
    card.querySelector(".morph-card-hint").textContent = content.ui.galleryCardHint;
    card.setAttribute("aria-label", `${lesson.title}. ${content.ui.galleryCardHint}`);
  });
  morphStage.querySelectorAll(".morph-card-art img").forEach(registerImageFailure);
  morphStatus.textContent = content.ui[morphStatusKey];
}

const lessonArtwork = {
  link: `<svg viewBox="0 0 220 118"><path class="art-wire" d="M0 92h28l13-22 20 36 20-57 18 34h25l17-29 18 38 16-23h45"/><rect class="art-chip" x="70" y="16" width="112" height="32" rx="2"/><path class="art-bright" d="M84 32h52m9 0h20"/><circle class="art-alert" cx="172" cy="32" r="4"/><path class="art-dash" d="M22 23h30M31 32h20"/></svg>`,
  upi: `<svg viewBox="0 0 220 118"><path class="art-wire" d="M0 92h52l13-18 14 18h31"/><path class="art-shell" d="M111 7h62a8 8 0 0 1 8 8v93h-78V15a8 8 0 0 1 8-8Z"/><path class="art-bright" d="M137 20h11m-25 15h35v34h-35z"/><path class="art-dash" d="M130 42h7m6 0h7m-20 7h5m7 0h9m-21 7h8m7 0h6"/><circle class="art-alert" cx="148" cy="85" r="5"/><path class="art-wire" d="M181 88h23l9-13"/></svg>`,
  support: `<svg viewBox="0 0 220 118"><path class="art-wire" d="M0 88h43l17-26 14 35 16-20h31"/><circle class="art-shell" cx="152" cy="57" r="39"/><path class="art-bright" d="M132 53a20 20 0 0 1 40 0v13h-9V53a11 11 0 0 0-22 0v13h-9z"/><path class="art-dash" d="M129 61h10v17h-7a3 3 0 0 1-3-3zm36 0h10v14a3 3 0 0 1-3 3h-7z"/><circle class="art-alert" cx="183" cy="25" r="5"/></svg>`,
  briefcase: `<svg viewBox="0 0 220 118"><path class="art-shell" d="M53 37h111a8 8 0 0 1 8 8v51H45V45a8 8 0 0 1 8-8Z"/><path class="art-bright" d="M84 37V25h49v12m-88 25h135m-83 0v12h30V62"/><path class="art-dash" d="M56 81h20m16 0h51m14 0h13"/><path class="art-wire" d="M0 95h42m138 0h20l12-18h8"/><circle class="art-alert" cx="162" cy="24" r="4"/></svg>`,
  key: `<svg viewBox="0 0 220 118"><circle class="art-shell" cx="98" cy="59" r="30"/><circle class="art-bright" cx="98" cy="59" r="10"/><path class="art-bright" d="m121 80 46-46 13 13-9 9 8 8-10 10-8-8-14 14"/><path class="art-dash" d="M13 28h33m-21 9h21M20 91h28"/><circle class="art-alert" cx="176" cy="33" r="5"/></svg>`,
  identity: `<svg viewBox="0 0 220 118"><rect class="art-shell" x="67" y="16" width="88" height="88" rx="2"/><circle class="art-bright" cx="110" cy="47" r="13"/><path class="art-bright" d="M85 84c3-16 13-23 25-23s22 7 25 23"/><path class="art-dash" d="M20 28h35M13 37h42M165 28h30"/><path class="art-wire" d="M0 94h39l10-20 11 20h17"/><circle class="art-alert" cx="157" cy="18" r="5"/></svg>`,
  chart: `<svg viewBox="0 0 220 118"><path class="art-wire" d="M39 98h143M50 88V28"/><path class="art-gridline" d="M51 76h128M51 57h128M51 38h128"/><path class="art-bright" d="m61 80 24-18 22 7 27-28 19 7 20-23"/><path class="art-dash" d="m157 25 16-3-4 15"/><circle class="art-alert" cx="154" cy="48" r="4"/></svg>`,
  wave: `<svg viewBox="0 0 220 118"><path class="art-gridline" d="M20 30h180M20 59h180M20 88h180"/><path class="art-wire" d="M0 60h26l10-7 10 13 12-37 12 60 13-39 12 15 12-6 11 5 11-17 11 20 12-9 12 4 12-9 12 7h19"/><circle class="art-alert" cx="125" cy="52" r="4"/></svg>`,
};

function applyLanguage(language) {
  const content = translations[language];
  document.documentElement.lang = language;
  languageSelect.value = language;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const translated = content.ui[element.dataset.i18n];
    if (translated) element.textContent = translated;
  });
  document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
    const translated = content.ui[element.dataset.i18nAlt];
    if (translated) element.alt = translated;
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
    const translated = content.ui[element.dataset.i18nAria];
    if (translated) element.setAttribute("aria-label", translated);
  });
  menuToggle.setAttribute("aria-label", menuToggle.getAttribute("aria-expanded") === "true" ? content.ui.menuClose : content.ui.menuOpen);
  navigation.setAttribute("aria-label", content.ui.navigationLabel);
  languageSelect.setAttribute("aria-label", content.ui.languageLabel);
  document.querySelector("[data-brand-home]").setAttribute("aria-label", content.ui.brandHome);
  document.querySelector(".trust-strip").setAttribute("aria-label", content.ui.principlesLabel);
  document.title = content.ui.documentTitle;
  updateSoundControl();
  renderTrendTopics(language);
  renderLessons(language);
  renderMorphGallery(language);
  createQuiz(document.querySelector("#quiz-card"), language);
  observeReveals();
  saveLanguage(language);
}

function updateSoundControl() {
  if (!soundToggle) return;
  const content = translations[document.documentElement.lang].ui;
  soundToggle.textContent = soundEnabled ? content.soundOn : content.soundOff;
  soundToggle.setAttribute("aria-label", soundEnabled ? content.soundDisable : content.soundEnable);
  soundToggle.setAttribute("aria-pressed", String(soundEnabled));
}

function playInterfaceSound(kind) {
  if (
    !soundEnabled ||
    !audioContext ||
    document.hidden ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) return;

  if (audioContext.state === "suspended") {
    audioContext.resume().catch((error) => console.error("Could not resume the optional sound context.", error));
  }
  if (audioContext.state !== "running") return;

  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(kind === "positive" ? 660 : 390, now);
  oscillator.frequency.exponentialRampToValueAtTime(kind === "positive" ? 880 : 330, now + 0.11);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.018, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.15);
  oscillator.addEventListener("ended", () => {
    oscillator.disconnect();
    gain.disconnect();
  }, { once: true });
}

let revealObserver;

function observeReveals() {
  revealObserver?.disconnect();
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion || !("IntersectionObserver" in window)) {
    document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
    return;
  }
  revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -35px 0px" },
  );
  document.querySelectorAll(".reveal:not(.is-visible)").forEach((element) => revealObserver.observe(element));
}

function updateActiveNavigation(activeSection) {
  const mappedSection = activeSection === "explore" ? "learn" : activeSection;
  document.querySelectorAll(".primary-nav a, .primary-nav summary").forEach((item) => {
    const target = item.hash || item.dataset.navTarget;
    if (target === `#${mappedSection}`) item.setAttribute("aria-current", "location");
    else item.removeAttribute("aria-current");
  });
}

const activeNavigationSections = [...document.querySelectorAll("main > section[id], #report")];
let activeNavigationFrame = 0;

function updateActiveNavigationFromViewport() {
  activeNavigationFrame = 0;
  const activationLine = window.innerHeight / 2;
  let activeSection = null;
  let precedingSection = null;

  for (const section of activeNavigationSections) {
    const bounds = section.getBoundingClientRect();
    if (bounds.top > activationLine) break;
    precedingSection = section;
    if (bounds.bottom >= activationLine) activeSection = section;
  }

  activeSection ||= precedingSection || activeNavigationSections[0];
  if (activeSection) updateActiveNavigation(activeSection.id);
}

function scheduleActiveNavigationUpdate() {
  if (activeNavigationFrame) return;
  activeNavigationFrame = window.requestAnimationFrame(updateActiveNavigationFromViewport);
}

window.addEventListener("scroll", scheduleActiveNavigationUpdate, { passive: true });
window.addEventListener("resize", scheduleActiveNavigationUpdate);
scheduleActiveNavigationUpdate();

function setupMorphGallery() {
  const cards = [...morphStage.querySelectorAll("[data-morph-card]")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let visible = false;
  let frame = 0;
  let galleryObserver;
  let lastStatusKey = "";

  function setStaticLayout() {
    morphStage.classList.remove("is-enhanced");
    morphStage.classList.add("is-static");
    cards.forEach((card) => card.style.removeProperty("transform"));
    visible = false;
    morphStatusKey = "galleryScatter";
    lastStatusKey = "galleryScatter";
    morphStatus.textContent = translations[document.documentElement.lang].ui[morphStatusKey];
  }

  function setMorphStatus(key) {
    if (key === lastStatusKey) return;
    lastStatusKey = key;
    morphStatusKey = key;
    morphStatus.textContent = translations[document.documentElement.lang].ui[key];
  }

  function updatePositions() {
    frame = 0;
    if (!visible || morphStage.classList.contains("is-static")) return;
    const stageBounds = morphStage.getBoundingClientRect();
    const travel = window.innerHeight + stageBounds.height;
    const progress = Math.max(0, Math.min(1, (window.innerHeight - stageBounds.top) / travel));
    const arrangeProgress = Math.max(0, Math.min(1, progress / 0.26));
    const arcProgress = Math.max(0, Math.min(1, (progress - 0.26) / 0.74));
    const ease = (value) => value * value * (3 - 2 * value);
    const circleBlend = ease(arrangeProgress);
    const arcBlend = ease(arcProgress);
    const halfWidth = Math.max(0, stageBounds.width / 2 - 84);
    const radiusX = Math.min(stageBounds.width * 0.34, 370);
    const radiusY = Math.min(stageBounds.height * 0.31, 155);

    cards.forEach((card, index) => {
      const angle = -Math.PI / 2 + (index * Math.PI * 2) / cards.length;
      const scatterX = Math.sin(index * 12.98) * halfWidth * 0.9;
      const scatterY = Math.cos(index * 32.71) * Math.min(stageBounds.height * 0.32, 132);
      const circleX = Math.cos(angle) * radiusX;
      const circleY = Math.sin(angle) * radiusY;
      const arcAngle = (Math.PI * index) / (cards.length - 1);
      const arcX = (index - (cards.length - 1) / 2) * Math.min(122, stageBounds.width / 7);
      const arcY = 108 - Math.sin(arcAngle) * Math.min(stageBounds.height * 0.29, 128);
      const arrangedX = scatterX + (circleX - scatterX) * circleBlend;
      const arrangedY = scatterY + (circleY - scatterY) * circleBlend;
      const x = arrangedX + (arcX - arrangedX) * arcBlend;
      const y = arrangedY + (arcY - arrangedY) * arcBlend;
      const rotation = Math.sin(index * 32.71) * 11 * (1 - circleBlend) + (index - 3.5) * 1.15 * arcBlend;
      card.style.transform = `translate3d(-50%, -50%, 0) translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg)`;
    });

    setMorphStatus(progress < 0.26 ? "galleryScatter" : progress < 0.58 ? "galleryCircle" : "galleryArc");
  }

  function scheduleUpdate() {
    if (!morphStage.classList.contains("is-static") && !frame) frame = requestAnimationFrame(updatePositions);
  }

  function handleVisibility(entries) {
    visible = entries.some((entry) => entry.isIntersecting);
    if (visible && !morphStage.classList.contains("is-static")) {
      updatePositions();
      morphStage.classList.add("is-enhanced");
    }
  }

  function updateMotionMode() {
    if (reducedMotion.matches || window.innerWidth <= 850 || !("IntersectionObserver" in window)) {
      setStaticLayout();
      return;
    }
    morphStage.classList.remove("is-static");
    const bounds = morphSection.getBoundingClientRect();
    visible = bounds.bottom > 0 && bounds.top < window.innerHeight;
    if (visible) {
      updatePositions();
      morphStage.classList.add("is-enhanced");
    }
    scheduleUpdate();
  }

  updateMotionMode();
  if ("IntersectionObserver" in window) {
    galleryObserver = new IntersectionObserver(handleVisibility, { threshold: 0.08 });
    galleryObserver.observe(morphSection);
  }
  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", updateMotionMode, { passive: true });
  reducedMotion.addEventListener("change", updateMotionMode);
}

function registerImageFailure(image) {
  const markImageFailed = () => {
    image.closest("figure, .lesson-art, .trend-card-visual, .morph-card-art, .hero-visual")?.classList.add("image-failed");
    console.warn(`An editorial image could not load: ${image.currentSrc || image.src}`);
  };
  image.addEventListener("error", markImageFailed, { once: true });
  if (image.complete && image.naturalWidth === 0) markImageFailed();
}

document.querySelectorAll("img").forEach(registerImageFailure);

languageSelect.addEventListener("change", (event) => applyLanguage(event.target.value));

soundToggle.addEventListener("click", async () => {
  if (!soundEnabled) {
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextConstructor) {
      soundStatus.textContent = translations[document.documentElement.lang].ui.soundUnavailable;
      return;
    }

    try {
      audioContext ||= new AudioContextConstructor();
      await audioContext.resume();
      soundEnabled = true;
      soundStatus.textContent = translations[document.documentElement.lang].ui.soundOn;
    } catch (error) {
      soundEnabled = false;
      soundStatus.textContent = translations[document.documentElement.lang].ui.soundUnavailable;
      console.error("Optional sound could not be enabled.", error);
    }
  } else {
    soundEnabled = false;
    soundStatus.textContent = translations[document.documentElement.lang].ui.soundOff;
  }
  updateSoundControl();
});

shieldInteractionButton.addEventListener("click", () => {
  const { ui } = translations[document.documentElement.lang];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  shieldInteractionStatus.textContent = reducedMotion ? ui.shieldMotionReducedFeedback : ui.shieldPulseFeedback;
  shieldInteractionButton.classList.remove("is-pulsing");
  window.clearTimeout(shieldPulseTimeout);
  if (!reducedMotion) {
    window.requestAnimationFrame(() => shieldInteractionButton.classList.add("is-pulsing"));
    shieldPulseTimeout = window.setTimeout(() => shieldInteractionButton.classList.remove("is-pulsing"), 750);
  }
});

document.addEventListener("cybershield:sfx", (event) => playInterfaceSound(event.detail?.kind));
document.addEventListener("visibilitychange", () => {
  if (document.hidden && audioContext?.state === "running") {
    audioContext.suspend().catch((error) => console.error("Could not suspend the optional sound context.", error));
  }
});

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  menuToggle.setAttribute("aria-label", isExpanded ? translations[document.documentElement.lang].ui.menuOpen : translations[document.documentElement.lang].ui.menuClose);
  navigation.classList.toggle("is-open", !isExpanded);
});

navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    navigation.querySelectorAll(".nav-dropdown[open]").forEach((dropdown) => dropdown.removeAttribute("open"));
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", translations[document.documentElement.lang].ui.menuOpen);
    navigation.classList.remove("is-open");
  }
});

reportDropdown.addEventListener("pointerenter", (event) => {
  if (event.pointerType !== "touch") {
    reportPointerInside = true;
    if (!reportHoverDismissed) reportDropdown.open = true;
  }
});

reportDropdown.addEventListener("pointerleave", (event) => {
  if (event.pointerType !== "touch") {
    reportPointerInside = false;
    reportHoverDismissed = false;
    if (!reportDropdown.contains(document.activeElement)) reportDropdown.removeAttribute("open");
  }
});

document.addEventListener("pointerdown", (event) => {
  if (!navigation.contains(event.target)) {
    navigation.querySelectorAll(".nav-dropdown[open]").forEach((dropdown) => dropdown.removeAttribute("open"));
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    const openDropdown = navigation.querySelector(".nav-dropdown[open]");
    if (openDropdown) {
      reportHoverDismissed = reportPointerInside;
      openDropdown.removeAttribute("open");
      openDropdown.querySelector("summary").focus();
    }
    if (menuToggle.getAttribute("aria-expanded") !== "true") return;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", translations[document.documentElement.lang].ui.menuOpen);
    navigation.classList.remove("is-open");
    menuToggle.focus();
  }
});

applyLanguage(currentLanguage);
setupMorphGallery();
document.documentElement.classList.add("js-ready");

const loadShieldScene = () => {
  import("./scene.js")
    .then(({ initShieldScene }) =>
      initShieldScene(document.querySelector("#shield-scene"), () => {
        document.querySelector(".hero-visual").classList.add("has-3d");
      }),
    )
    .catch((error) => console.error("The 3D shield could not load; the CSS illustration remains available.", error));
};

if ("requestIdleCallback" in window) window.requestIdleCallback(loadShieldScene, { timeout: 1200 });
else window.setTimeout(loadShieldScene, 0);
