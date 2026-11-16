const KN = {
  paused: "ವಿರಾಮ",
  resume: "ಮುಂದುವರಿಸಿ",
  exit: "ನಿರ್ಗಮನ",
  graphics: "ಗ್ರಾಫಿಕ್ಸ್",
  low: "ಕಡಿಮೆ",
  medium: "ಮಧ್ಯಮ",
  portrait: "ಆಡಲು ದಯವಿಟ್ಟು ಸ್ಕ್ರೀನ್ ಅನ್ನು ಲ್ಯಾಂಡ್‌ಸ್ಕೇಪ್‌ನಲ್ಲಿ ತಿರುಗಿಸಿ",
};

const EN = {
  paused: "Paused",
  resume: "Resume",
  exit: "Exit",
  graphics: "Graphics",
  low: "Low",
  medium: "Medium",
  portrait: "Rotate to landscape to play",
};

export class UI {
  constructor(onResume, onExit, onGraphicsChange, onTogglePause) {
    this.onResume = onResume;
    this.onExit = onExit;
    this.onGraphicsChange = onGraphicsChange;
    this.onTogglePause = onTogglePause;
    this.paused = false;
    this.portraitActive = false;
    this.lang = this._readLang();

    this.el = document.createElement("div");
    this.el.className = "phase1-ui";
    this.el.innerHTML = this._template();
    document.body.appendChild(this.el);

    this.pauseEl = this.el.querySelector(".phase1-pause");
    this.portraitEl = this.el.querySelector(".phase1-portrait");
    this.graphicsSelect = this.el.querySelector("#phase1-graphics");
    this.resumeBtn = this.el.querySelector(".phase1-btn-resume");
    this.exitBtn = this.el.querySelector(".phase1-btn-exit");

    this.resumeBtn.addEventListener("click", () => this.onResume());
    this.exitBtn.addEventListener("click", () => this.onExit());
    this.graphicsSelect.addEventListener("change", (event) => {
      this.onGraphicsChange(event.target.value);
    });

    const langSelect = document.querySelector("#language-select");
    if (langSelect) {
      langSelect.addEventListener("change", () => {
        this.lang = this._readLang();
        this._applyLang();
      });
    }

    this._applyLang();
    this.hidePause();
    this.hidePortrait();
  }

  _readLang() {
    const sel = document.querySelector("#language-select");
    return sel && sel.value === "kn" ? "kn" : "en";
  }

  _template() {
    return `
      <div class="phase1-backdrop"></div>
      <div class="phase1-pause">
        <h2 class="phase1-title" data-lang="en">${EN.paused}</h2>
        <h2 class="phase1-title" data-lang="kn">${KN.paused}</h2>
        <div class="phase1-row phase1-row-resume">
          <button class="phase1-btn phase1-btn-resume" data-lang="en">${EN.resume}</button>
          <button class="phase1-btn phase1-btn-resume" data-lang="kn">${KN.resume}</button>
        </div>
        <div class="phase1-row phase1-row-graphics">
          <label class="phase1-label" data-lang="en">${EN.graphics}</label>
          <label class="phase1-label" data-lang="kn">${KN.graphics}</label>
          <select class="phase1-select" id="phase1-graphics">
            <option value="low" data-lang="en">${EN.low}</option>
            <option value="low" data-lang="kn">${KN.low}</option>
            <option value="medium" data-lang="en">${EN.medium}</option>
            <option value="medium" data-lang="kn">${KN.medium}</option>
          </select>
        </div>
        <div class="phase1-row phase1-row-exit">
          <button class="phase1-btn phase1-btn-exit" data-lang="en">${EN.exit}</button>
          <button class="phase1-btn phase1-btn-exit" data-lang="kn">${KN.exit}</button>
        </div>
      </div>
      <div class="phase1-portrait">
        <div class="phase1-portrait-inner">
          <p class="phase1-portrait-msg" data-lang="en">${EN.portrait}</p>
          <p class="phase1-portrait-msg" data-lang="kn">${KN.portrait}</p>
        </div>
      </div>
    `;
  }

  _applyLang() {
    const dict = this.lang === "kn" ? KN : EN;
    this.el.querySelectorAll("[data-lang]").forEach((el) => {
      const key = el.dataset.lang;
      if (dict[key] !== undefined) {
        el.textContent = dict[key];
      }
    });
    this.el.querySelectorAll(".phase1-title, .phase1-portrait-msg, .phase1-btn, .phase1-label").forEach((el) => {
      el.style.display = el.dataset.lang === this.lang ? "" : "none";
    });
    this.graphicsSelect.querySelectorAll("option").forEach((opt) => {
      opt.style.display = opt.dataset.lang === this.lang ? "" : "none";
    });
  }

  showPause() {
    this.paused = true;
    this.pauseEl.style.display = "flex";
    this.el.style.display = "flex";
  }

  hidePause() {
    this.paused = false;
    this.pauseEl.style.display = "none";
    if (!this.portraitActive) this.el.style.display = "none";
  }

  showPortrait() {
    this.portraitActive = true;
    this.portraitEl.style.display = "flex";
    this.pauseEl.style.display = "none";
    this.el.style.display = "flex";
  }

  hidePortrait() {
    this.portraitActive = false;
    this.portraitEl.style.display = "none";
    if (!this.paused) this.el.style.display = "none";
  }

  destroy() {
    if (this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
  }
}
