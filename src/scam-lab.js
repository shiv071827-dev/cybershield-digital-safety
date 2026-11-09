import { translations } from "./translations.js";

export function createQuiz(container, language) {
  const content = translations[language];
  let questionIndex = 0;
  let score = 0;
  let phase = "identify";
  let answered = false;
  const scenarioScores = Array(content.scenarios.length).fill(0);
  const maximumScore = content.scenarios.length * 2;

  function renderQuestion() {
    const scenario = content.scenarios[questionIndex];
    const identifyingSignal = phase === "identify";
    const choices = identifyingSignal ? scenario.signal.options : scenario.options;
    const prompt = identifyingSignal ? scenario.signal.question : scenario.question;
    const stepNumber = questionIndex * 2 + (identifyingSignal ? 0 : 1);
    container.innerHTML = `
      <div class="quiz-topline">
        <div class="quiz-mode"><span class="live-indicator" aria-hidden="true"></span><span class="quiz-label">${content.ui.quizLabel}</span></div>
        <span class="quiz-score"><span>${content.ui.scoreLabel}</span><strong>${score}<i> / ${maximumScore}</i></strong></span>
      </div>
      <div class="progress-track" role="progressbar" aria-label="${content.ui.progressLabel}" aria-valuemin="0" aria-valuemax="${maximumScore}" aria-valuenow="${stepNumber}">
        <span style="width:${(stepNumber / maximumScore) * 100}%"></span>
      </div>
      <div class="scenario-heading"><span>${content.ui.scenario} ${String(questionIndex + 1).padStart(2, "0")} <i>${content.ui.of} ${String(content.scenarios.length).padStart(2, "0")}</i></span><span>${scenario.channel}</span></div>
      <div class="scenario-message"><span class="scenario-tag"><span class="message-dot"></span>${content.ui.fictional}</span><p>${scenario.message}</p><span class="message-timestamp">${content.ui.simulationOnly}</span></div>
      <details class="message-inspection">
        <summary>${content.ui.inspectClue}</summary>
        <p>${scenario.signal.explanation}</p>
      </details>
      <div class="quiz-stage"><span>${identifyingSignal ? content.ui.stageIdentify : content.ui.stageRespond}</span><span>${identifyingSignal ? "01" : "02"} / 02</span></div>
      <h3 class="quiz-question">${prompt}</h3>
      <div class="answer-list" role="group" aria-label="${content.ui.answerLabel}">
        ${choices.map((option, index) => `<button class="answer-option" type="button" data-answer="${index}"><span class="answer-letter">${String.fromCharCode(65 + index)}</span><span>${option}</span><span class="answer-arrow" aria-hidden="true">↗</span></button>`).join("")}
      </div>
      <div class="quiz-feedback" aria-live="polite" aria-atomic="true"></div>
    `;
    container.querySelectorAll(".answer-option").forEach((button) => {
      button.addEventListener("click", () => chooseAnswer(Number(button.dataset.answer)));
    });
  }

  function chooseAnswer(selectedIndex) {
    if (answered) return;
    answered = true;
    const scenario = content.scenarios[questionIndex];
    const identifyingSignal = phase === "identify";
    const correctIndex = identifyingSignal ? scenario.signal.correct : scenario.correct;
    const isCorrect = selectedIndex === correctIndex;
    if (isCorrect) {
      score += 1;
      scenarioScores[questionIndex] += 1;
    }
    window.dispatchEvent(new CustomEvent("cybershield:sfx", {
      detail: { kind: isCorrect ? "positive" : "caution" },
    }));
    container.querySelectorAll(".answer-option").forEach((button) => {
      const answerIndex = Number(button.dataset.answer);
      button.disabled = true;
      if (answerIndex === correctIndex) button.classList.add("is-correct");
      else if (answerIndex === selectedIndex) button.classList.add("is-incorrect");
    });
    const feedback = container.querySelector(".quiz-feedback");
    const heading = identifyingSignal
      ? isCorrect ? content.ui.signalGood : content.ui.signalMiss
      : isCorrect ? content.ui.actionGood : content.ui.actionMiss;
    const explanation = identifyingSignal ? scenario.signal.explanation : scenario.explanation;
    const outcomeLabel = isCorrect ? content.ui.scenarioSafeLabel : content.ui.scenarioRiskLabel;
    const outcome = isCorrect ? scenario.safeOutcome : scenario.risk;
    const completedSteps = questionIndex * 2 + (identifyingSignal ? 1 : 2);
    const nextLabel = identifyingSignal
      ? content.ui.nextStage
      : content.ui.scenarioChecklistAction;
    feedback.innerHTML = `
      <p class="feedback-heading ${isCorrect ? "feedback-good" : "feedback-caution"}">${heading}</p>
      <p>${explanation}</p>
      <p class="scenario-outcome"><strong>${content.ui.scenarioOutcomeLabel} — ${outcomeLabel}</strong> ${outcome}</p>
      <button class="button button-primary quiz-next" type="button"><span>${nextLabel}</span><span aria-hidden="true">→</span></button>
    `;
    container.querySelector(".quiz-score strong").innerHTML = `${score}<i> / ${maximumScore}</i>`;
    container.querySelector(".progress-track").setAttribute("aria-valuenow", String(completedSteps));
    container.querySelector(".progress-track span").style.width = `${(completedSteps / maximumScore) * 100}%`;
    feedback.querySelector(".quiz-next").addEventListener("click", () => {
      if (identifyingSignal) {
        phase = "respond";
        answered = false;
        renderQuestion();
        container.querySelector(".answer-option").focus();
      } else {
        renderScenarioChecklist();
      }
    });
  }

  function renderScenarioChecklist() {
    const scenario = content.scenarios[questionIndex];
    const completedSteps = (questionIndex + 1) * 2;
    const isLastScenario = questionIndex === content.scenarios.length - 1;
    container.innerHTML = `
      <div class="quiz-topline">
        <div class="quiz-mode"><span class="live-indicator" aria-hidden="true"></span><span class="quiz-label">${content.ui.scenarioChecklistTitle}</span></div>
        <span class="quiz-score"><span>${content.ui.scoreLabel}</span><strong>${score}<i> / ${maximumScore}</i></strong></span>
      </div>
      <div class="progress-track" role="progressbar" aria-label="${content.ui.progressLabel}" aria-valuemin="0" aria-valuemax="${maximumScore}" aria-valuenow="${completedSteps}">
        <span style="width:${(completedSteps / maximumScore) * 100}%"></span>
      </div>
      <div class="scenario-heading"><span>${content.ui.scenario} ${String(questionIndex + 1).padStart(2, "0")} <i>${content.ui.of} ${String(content.scenarios.length).padStart(2, "0")}</i></span><span>${scenario.channel}</span></div>
      <div class="scenario-debrief" aria-live="polite">
        <h3>${content.ui.scenarioChecklistTitle}</h3>
        <ul>${scenario.checklist.map((item) => `<li>${item}</li>`).join("")}</ul>
        <p><strong>${content.ui.scenarioSafeLabel}</strong> ${scenario.safeOutcome}</p>
      </div>
      <div class="scenario-actions">
        <button class="button button-secondary scenario-replay" type="button">${content.ui.scenarioChecklistAction}</button>
        <button class="button button-primary scenario-continue" type="button">${isLastScenario ? content.ui.seeResults : content.ui.scenarioChecklistContinue}</button>
      </div>
    `;
    container.querySelector(".scenario-replay").addEventListener("click", () => {
      score -= scenarioScores[questionIndex];
      scenarioScores[questionIndex] = 0;
      phase = "identify";
      answered = false;
      renderQuestion();
      container.querySelector(".answer-option").focus();
    });
    container.querySelector(".scenario-continue").addEventListener("click", () => {
      if (isLastScenario) {
        renderResults();
        return;
      }
      questionIndex += 1;
      phase = "identify";
      answered = false;
      renderQuestion();
      container.querySelector(".answer-option").focus();
    });
  }

  function renderResults() {
    const percentage = Math.round((score / maximumScore) * 100);
    window.dispatchEvent(new CustomEvent("cybershield:sfx", { detail: { kind: "positive" } }));
    container.innerHTML = `
      <div class="results-view" role="status" aria-live="polite">
        <span class="results-icon" aria-hidden="true"><span></span></span>
        <p class="quiz-label">${content.ui.labComplete}</p>
        <p class="score-value">${score}<span> / ${maximumScore}</span></p>
        <h3>${content.ui.resultTitle}</h3>
        <p>${content.ui.resultMessage(percentage)}</p>
        <div class="result-meter" aria-hidden="true"><span style="--score:${percentage}%"></span></div>
        <button class="button button-primary quiz-restart" type="button"><span>${content.ui.tryAgainButton}</span><span aria-hidden="true">↻</span></button>
        <p class="result-reminder">${content.ui.resultReminder}</p>
      </div>
    `;
    container.querySelector(".quiz-restart").addEventListener("click", () => {
      questionIndex = 0;
      score = 0;
      scenarioScores.fill(0);
      phase = "identify";
      answered = false;
      renderQuestion();
      container.querySelector(".answer-option").focus();
    });
    container.querySelector(".quiz-restart").focus();
  }

  renderQuestion();
}
