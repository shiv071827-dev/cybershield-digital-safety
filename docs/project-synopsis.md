# CyberShield — VTU Societal/Community Project Synopsis

> **Academic draft:** The institution, department, semester, guide, student names/USNs, and project dates were not supplied. Replace the bracketed fields only with verified information. No VTU syllabus or sample synopsis was available during preparation; the syllabus mapping is therefore provisional and must not be presented as an official course-outcome mapping.

## 1. Title

**CyberShield: Cyber Safety and Digital Fraud Awareness App**

## 2. Introduction

CyberShield is a bilingual educational website designed to help people recognize common online fraud signals and practise safer decisions. It presents concise learning modules, fictional interactive situations, a practical response protocol, and links to Indian cybercrime reporting resources.

## 3. Background

Digital communication and payments are part of everyday life. Fraud attempts may exploit urgency, impersonation, unfamiliar links, payment requests, or requests for private codes. Clear, accessible awareness material can help users pause and verify an unexpected request before acting.

## 4. Problem statement

Students, senior citizens, and other internet users may encounter suspicious messages or requests without having an accessible place to learn warning signs and rehearse a safe response. The project addresses this awareness need through plain-language, bilingual material and fictional practice scenarios.

## 5. Need for the project

The project offers a reusable learning aid for individual study, classroom discussion, and community awareness activities. It emphasizes practical verification and reporting rather than collecting personal information or simulating real financial transactions.

## 6. Objectives

- Explain common digital scam patterns in accessible language.
- Teach users to verify requests through a separately trusted channel.
- Reinforce that OTPs, passwords, and UPI PINs must not be disclosed.
- Provide fictional decision-based practice and explanatory feedback.
- Make the principal interface and learning content available in English and Kannada.
- Direct users to official Indian reporting resources without claiming to file reports.

## 7. Proposed solution

The website combines eight topic lessons, a scroll-responsive topic gallery, an eight-scenario Scam Lab, a four-step safety guide, and reporting links. The simulations use fictional demonstration text and run entirely in the browser.

## 8. Scope

The current scope is a static educational frontend. It does not include accounts, backend storage, complaint submission, payment integration, live scam-message intake, certified training, or law-enforcement contact.

## 9. Target users

Students, senior citizens, families, educators, and general internet or smartphone users. The project is intended to support a range of digital-literacy levels through plain language and keyboard-operable controls.

## 10. Existing system and limitations

Users may find cyber-safety information across official websites and other online resources, but may need to search several sources and interpret unfamiliar terminology. This synopsis does not claim that all existing systems share the same limitations; it identifies the learning need addressed by this project.

## 11. Proposed system

CyberShield presents a structured, bilingual, no-account learning experience. Users can review lessons, answer scenario questions, read immediate feedback, review a safety checklist, replay an individual scenario, or consult reporting resources.

## 12. System architecture

The browser loads `index.html`, Vite-served CSS, and JavaScript ES modules. `src/main.js` applies the chosen language and initializes navigation, lesson cards, and the gallery. `src/scam-lab.js` renders the fictional quiz from `src/translations.js`. `src/scene.js` is dynamically imported for the Three.js shield; a CSS shield remains available when WebGL is unavailable. No server API is used.

## 13. Modules

1. **Learning modules:** eight scam topics with signs, fictional examples, responses, checklists, and after-action guidance.
2. **Scam Lab:** eight fictional scenarios, two choices per scenario, feedback, consequences, prevention checklists, replay, and scoring.
3. **Language:** English/Kannada interface and learning data.
4. **Safety guide and reporting:** stop, verify, secure/document, report; official portal and helpline links.
5. **Visual interaction:** responsive navigation, scroll-driven gallery, and optional Three.js shield.
6. **Community-use guidance:** suggested learning-session discussion points; no attendance or impact data is collected by the page.

## 14. Technologies used

HTML, CSS, vanilla JavaScript ES modules, Vite, Three.js, browser APIs (IntersectionObserver, requestAnimationFrame, Web Audio API when explicitly enabled), and local JPG assets.

## 15. Methodology

The work is based on inspection of the existing project, incremental improvements that preserve its stack, bilingual content updates, fictional scenario design, and manual/browser plus production-build verification. Official reporting information should be checked against current government sources before each academic/public release.

## 16. Expected outcomes

Users should be able to identify common warning signs, choose an independent verification method, avoid sharing private codes, and locate official reporting channels. These are intended learning outcomes, not measured results; no user study or outcome measurement is claimed here.

## 17. Social impact

The project is intended to support digital literacy and community discussion, with Kannada content and practical examples for people with different levels of online experience. Any reported community impact must be based on genuine, consented activities and measured outcomes.

## 18. Testing approach

Build verification, scenario-data completeness checks, browser interaction checks, responsive viewport checks, language switching, keyboard/reduced-motion checks, and WebGL fallback checks. Refer to [testing report](testing-report.md); pending tests must remain marked pending.

## 19. Limitations

- No backend, account, persistent quiz progress, or report-submission workflow.
- Reporting guidance and helpline availability can change; users must consult official sources.
- Kannada text has not been independently professionally reviewed.
- No formal user study, accessibility certification, or deployment security-header audit is claimed.
- The production Three.js chunk currently triggers Vite’s size advisory.

## 20. Future scope

Possible future work includes educator-reviewed content, professional Kannada review, broader usability testing with consent, syllabus-specific mapping after the official syllabus is supplied, additional accessible learning materials, improved asset/bundle performance, and deployment with appropriate HTTPS/security headers.

## 21. References

1. Government of India, National Cyber Crime Reporting Portal, <https://cybercrime.gov.in/> (accessed during project audit; confirm current instructions before publication).
2. Indian Cybercrime Coordination Centre (I4C), Ministry of Home Affairs, FAQ, <https://i4c.mha.gov.in/FAQ.aspx> (accessed 7 November 2026; describes calling 1930 for financial cyber fraud and completing the complaint on the portal).
3. Vite documentation, <https://vite.dev/guide/>.
4. Three.js documentation, <https://threejs.org/docs/>.
5. Unsplash License, <https://unsplash.com/license> (the project README records the local editorial image sources and stated license basis).

## Academic information to complete

- Institution: **[Institution name — not provided]**
- Department/program: **[Department/program — not provided]**
- VTU course code/semester: **[Not provided]**
- Guide/supervisor: **[Name and designation — not provided]**
- Team members and USNs: **[Not provided]**
- Project period/submission date: **[Not provided]**
