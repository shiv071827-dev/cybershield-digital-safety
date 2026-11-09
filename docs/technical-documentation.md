# CyberShield Technical Documentation

## Overview

CyberShield is a static, single-page Vite application using HTML, CSS, vanilla JavaScript ES modules, and Three.js. It has no application server, API, database, authentication, payment provider, or route framework.

## Source structure and responsibilities

| Path | Responsibility |
|---|---|
| `index.html` | Semantic page sections, links, fallback lesson content, quiz mount point, and report resources |
| `src/main.js` | Language application, lesson rendering, gallery morph, navigation/dropdown behavior, reveal effects, optional sound, storage preference, and dynamic scene loading |
| `src/translations.js` | English and Kannada UI strings, lesson content/checklists, fictional scenarios, feedback, and report guidance |
| `src/scam-lab.js` | Two-stage scenario quiz, feedback/outcomes, prevention checklist, replay, progress, score, and final result |
| `src/scene.js` | Three.js shield geometry, lighting, particles, animation, visibility/reduced-motion handling, WebGL fallback and resource cleanup |
| `src/styles.css` | Base visual components, responsive rules, and shield fallback styles |
| `src/editorial.css` | Editorial theme and later overrides for the hero, navigation, gallery, lesson and report content |
| `public/images/` | Locally served editorial images |

`dist/` is generated output; `node_modules/` is installed dependency content. `prg1.java` is an empty, unrelated file in the project root and is not imported by the application.

## Data flow

1. The browser loads the document and its stylesheets, then imports `src/main.js`.
2. The language preference is read from local storage; unsupported or unavailable storage falls back to English and logs a warning.
3. `applyLanguage()` updates marked HTML text/ARIA labels, renders the lesson grid and gallery labels, and creates the quiz using the chosen dictionary.
4. `createQuiz()` reads only the static `translations.js` dataset. It does not accept or transmit user text.
5. The shield module is dynamically imported when the browser is idle (or shortly after load). If WebGL or the module fails, the CSS illustration remains.
6. Language selection is stored under `cybershield-language`. Quiz progress and personal data are not stored.

## Language implementation

The `translations` export has `en` and `kn` dictionaries. UI content is keyed for lookup in markup; lessons and scenarios are data arrays used by the renderer. `document.documentElement.lang` is updated so assistive technology receives the active language. The application defaults to English if local storage is unavailable or contains an unsupported language. Kannada copy has not received a professional-review claim.

## Scam Lab implementation

Each fictional scenario has a message, a signal-identification decision, a safe-response decision, explanations, risk/safe outcomes, and a three-item prevention checklist. The score is a maximum of two points per scenario. Replaying a scenario subtracts that scenario’s previous points before it is attempted again, preventing score farming. The user can retry an individual scenario or restart the complete simulation. No free-text financial inputs or live links are presented.

All scenario content is authored in the static translation module and inserted into HTML templates. This is currently trusted local content, not user-supplied data. Do not feed untrusted or remote strings to these `innerHTML` templates; use safe DOM/text APIs or a rigorously reviewed sanitizer if the data source ever changes.

## Gallery, navigation, and motion

The gallery uses native browser scrolling, IntersectionObserver visibility, requestAnimationFrame, and CSS transforms. It does not intercept wheel or touch input. Small screens and reduced-motion preferences use a static card layout. The navigation uses ordinary fragment links and a native `<details>` reporting dropdown; Escape and outside pointer handling are implemented in `main.js`.

The active-navigation scan includes the nested `#report` article and prefers the deepest matching section around the viewport midpoint.

## Three.js, assets, and fallback

The scene is code-generated from Three.js geometries and materials; no external model is required. Renderer pixel ratio is capped, animation stops when the scene is offscreen or the page is hidden, reduced motion renders a static scene, and geometry/materials are disposed on `pagehide`. If WebGL renderer creation fails, the CSS shield stays visible. Editorial JPGs are served locally and marked lazy with async decoding.

## Configuration and dependencies

`package.json` defines `dev`, `build`, and `preview` scripts. Runtime dependency: Three.js 0.180.0. Build dependency: Vite 7.3.7 in the lockfile. `package-lock.json` uses lockfile version 3. No test runner, linter, environment file, or custom Vite configuration is present.

Use `npm ci` to install exactly from the lockfile. Vite writes the production site to `dist/` via `npm run build`.

## Security, privacy, and deployment considerations

- The application has no backend and cannot securely submit complaints or contact a government agency.
- Only the language preference is persisted. Storage access can be disabled by browser policy; the UI still works for the current visit.
- Scam Lab data is fictional; never add real personal, financial, OTP, PIN, or password inputs.
- External reporting links use HTTPS and `rel="noopener noreferrer"` when opened in a new tab.
- Google Fonts are third-party network requests; consider self-hosting only if the project’s licensing and maintenance needs justify it.
- A static client bundle cannot set HTTP response headers. Configure HTTPS and suitable security headers at the selected hosting platform.
- Confirm reporting steps and helpline availability against official sources before release.

The I4C Ministry of Home Affairs FAQ (<https://i4c.mha.gov.in/FAQ.aspx>, accessed 7 November 2026) states that financial cyber-fraud complaints can be reported by calling 1930 and must later be completed on the National Cyber Crime Reporting Portal with additional information. This guidance is reflected in the Safety Guide; recheck it before future releases.

## Build and verification

Run `npm ci`, `npm run build`, and `npm run preview`. There is no automated test command configured. Actual manual verification and remaining limitations are recorded in [testing-report.md](testing-report.md).
