const EN = {
  interactPrompt: "Press E to talk to the shopkeeper",
  shopkeeperGreeting: "Hello! Scan this QR to receive your refund.",
  refundExplanation:
    "A real refund never asks you to send money first. Your UPI PIN authorises money leaving your account — never to receive money.",
  examineRefund: "Examine the refund notice",
  decisionSafe: "I won't send money to receive a refund",
  decisionUnsafe: "I'll scan and approve the payment",
  safeFeedback:
    "Correct. A refund does not require you to pay anything. Report suspicious refund offers.",
  unsafeFeedback:
    "Stop. Never approve a payment to receive money. That is how scams work.",
  missionComplete: "Mission complete — First Signal badge earned!",
  xpAwarded: "XP awarded",
};

const KN = {
  interactPrompt: "ಮಾತನಾಡಲು E ಒತ್ತಿರಿ",
  shopkeeperGreeting: "ನಮಸ್ಕಾರ! ನಿಮ್ಮ ಹಣ ಮರುಪಾವತಿ ಪಡೆಯಲು ಈ QR ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ.",
  refundExplanation:
    "ನಿಜವಾದ ಹಣ ಮರುಪಾವತಿ ಪಡೆಯಲು ನೀವು ಮೊದಲು ಹಣ ಕಳುಹಿಸುವ ಅಗತ್ಯವಿಲ್ಲ. ನಿಮ್ಮ UPI PIN ನಿಮ್ಮ ಖಾತೆಯಿಂದ ಹಣ ಕಳುಹಿಸಲು ಅನುಮತಿ ನೀಡುತ್ತದೆ; ಹಣ ಸ್ವೀಕರಿಸಲು ಅಲ್ಲ.",
  examineRefund: "ಮರುಪಾವತಿ ಸೂಚನೆಯನ್ನು ಪರಿಶೀಲಿಸಿ",
  decisionSafe: "ಹಣ ಮರುಪಾವತಿ ಪಡೆಯಲು ನಾನು ಹಣ ಕಳುಹಿಸುವುದಿಲ್ಲ.",
  decisionUnsafe: "ನಾನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಪಾವತಿಯನ್ನು ಅನುಮೋದಿಸುತ್ತೇನೆ.",
  safeFeedback:
    "ಸರಿಯಾದ ನಿರ್ಧಾರ. ಹಣ ಮರುಪಾವತಿ ಪಡೆಯಲು ನೀವು ಯಾವುದೇ ಹಣ ಪಾವತಿಸಬೇಕಾಗಿಲ್ಲ. ಅನುಮಾನಾಸ್ಪದ ಮರುಪಾವತಿ ಆಫರ್‌ಗಳನ್ನು ವರದಿ ಮಾಡಿ.",
  unsafeFeedback:
    "ಇದು ಸುರಕ್ಷಿತವಲ್ಲ. ನಿಮ್ಮ UPI PIN ನಮೂದಿಸಿದರೆ ನಿಮ್ಮ ಖಾತೆಯಿಂದ ಹಣ ಕಡಿತವಾಗಬಹುದು. ಹಣ ಸ್ವೀಕರಿಸಲು PIN ನಮೂದಿಸಬೇಡಿ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
  missionComplete: "ಮಿಷನ್ ಪೂರ್ಣಗೊಂಡಿದೆ — First Signal ಬ್ಯಾಡ್ಜ್ ಗಳಿಸಿದ್ದೀರಿ!",
  xpAwarded: "XP ನೀಡಲಾಗಿದೆ",
};

export class Dialogue {
  constructor(container) {
    this.container = container;
    this.lang = this._readLang();
    this.visible = false;
    this.el = null;
    this.onDecision = null;
  }

  _readLang() {
    const sel = document.querySelector("#language-select");
    return sel && sel.value === "kn" ? "kn" : "en";
  }

  show(textKey, onDecision) {
    this.lang = this._readLang();
    const dict = this.lang === "kn" ? KN : EN;
    const text = dict[textKey] || EN[textKey] || textKey;

    this.el = document.createElement("div");
    this.el.className = "phase1-dialogue";
    this.el.innerHTML = `
      <div class="phase1-dialogue-backdrop"></div>
      <div class="phase1-dialogue-panel">
        <p class="phase1-dialogue-text">${text}</p>
        <div class="phase1-dialogue-actions"></div>
      </div>
    `;
    this.container.appendChild(this.el);
    this.visible = true;
    this.onDecision = onDecision;

    const actions = this.el.querySelector(".phase1-dialogue-actions");

    if (textKey === "shopkeeperGreeting") {
      const btn = document.createElement("button");
      btn.className = "phase1-btn phase1-btn-interact";
      btn.textContent = dict.examineRefund || "Examine the refund notice";
      btn.addEventListener("click", () => {
        this.hide();
        if (onDecision) onDecision("examine");
      });
      actions.appendChild(btn);
    } else if (textKey === "refundExplanation") {
      const safe = document.createElement("button");
      safe.className = "phase1-btn phase1-btn-decision-safe";
      safe.textContent = dict.decisionSafe;
      safe.addEventListener("click", () => {
        this.hide();
        if (onDecision) onDecision("safe");
      });
      actions.appendChild(safe);

      const unsafe = document.createElement("button");
      unsafe.className = "phase1-btn phase1-btn-decision-unsafe";
      unsafe.textContent = dict.decisionUnsafe;
      unsafe.addEventListener("click", () => {
        this.hide();
        if (onDecision) onDecision("unsafe");
      });
      actions.appendChild(unsafe);
    } else if (textKey === "safeFeedback" || textKey === "unsafeFeedback") {
      const btn = document.createElement("button");
      btn.className = "phase1-btn phase1-btn-continue";
      btn.textContent = dict.missionComplete || "Continue";
      btn.addEventListener("click", () => {
        this.hide();
        if (onDecision) onDecision("continue");
      });
      actions.appendChild(btn);
    }
  }

  showInteractPrompt() {
    this.lang = this._readLang();
    const dict = this.lang === "kn" ? KN : EN;
    this.el = document.createElement("div");
    this.el.className = "phase1-interact-prompt";
    this.el.textContent = dict.interactPrompt;
    this.container.appendChild(this.el);
    this.visible = true;
  }

  hide() {
    if (this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
    this.el = null;
    this.visible = false;
    this.onDecision = null;
  }

  destroy() {
    this.hide();
  }
}
