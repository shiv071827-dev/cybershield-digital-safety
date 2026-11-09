# CyberShield Testing Report

## Environment and commands

| Item | Result |
|---|---|
| Project stack | Vite 7.3.7, vanilla JavaScript, Three.js 0.180.0 |
| Production build | `npm run build` passed after the evolving-threats section, responsive hero, lesson-card, and gallery updates |
| Build advisory | Vite reports the existing Three.js scene chunk at 528.06 kB minified, above its 500 kB advisory threshold (135.63 kB gzip) |
| Automated tests/lint | No test or lint scripts/framework are configured |
| Browser checks | Local Vite application tested in the available browser; no physical-device or screen-reader testing |

## Test cases

| ID | Feature | Steps | Actual result | Status | Remarks |
|---|---|---|---|---|---|
| BUILD-01 | Production build | Run `npm run build` | Build completed successfully after the warm editorial theme, typography, and footer updates; the 528.06 kB Three.js chunk advisory remains | Passed | Build does not validate interaction behavior |
| VISUAL-01 | Updated desktop/mobile design and assets | Inspect the hero at 1440 px and 390 px, verify the light hero/Scam Lab surfaces, load each editorial image, and check anchor targets | Warm light hero and Scam Lab rendered; Three.js canvas appeared; 8 lesson cards and 8 gallery cards rendered; all 3 local images loaded; no broken anchor targets or page errors | Passed | Browser emulation; not a formal accessibility audit |
| VISUAL-02 | Evolving-threats section and responsive redesign | Inspect hero and trend cards at 1440, 1280, 768, 390, and 360 px; check translated content and rendered card counts | Six trend cards and eight lessons rendered; English and Kannada headings/cards updated; the hero stayed within its container; no horizontal page overflow at tested widths; lesson copy returned to normal document flow; all three local images and in-page anchors loaded | Passed | Desktop/tablet/mobile browser emulation; screenshots captured in the task conversation |
| DATA-01 | Bilingual content structure | Validate lesson, guidance, and scenario records in both languages | English and Kannada each contain 8 lessons, 8 guidance records with checks and after-action advice, and 8 scenarios with signal choices, risk/safe outcomes, and checklists | Passed | Structural validation; not an independent translation review |
| LAB-01 | Scam Lab flow, scoring, replay | Complete the English simulation, replay a scenario, then restart | Full English run reached 16/16; replay removed that scenario's prior points; restart reset to 0/16 | Passed | Scenario messages are marked as fictional educational examples |
| I18N-01 | English/Kannada switching | Switch languages and inspect lessons, the last scenario, and footer disclaimer | Language switching worked; 8 Kannada lessons rendered and the footer disclaimer translated | Passed | The entire quiz was not separately completed in Kannada |
| I18N-02 | Bilingual trends content | Switch to Kannada and inspect the trends heading, first trend card, feature heading, and lesson count | Kannada text rendered for the trends and feature; six trend cards and eight lessons remained available | Passed | Structural/browser check, not an independent translation review |
| NAV-01 | Navigation and keyboard interaction | Open mobile navigation/dropdown, press Escape, and center Report in the viewport | Escape closed the dropdown; Report became active when its nested section was centered | Passed | Mobile menu control measured 44 px |
| RESP-01 | Responsive layout and gallery reachability | Check 1024, 768, 390, and 320 px widths; follow the final gallery card | No horizontal overflow was reported at tested widths; the final card linked to `#lesson-8` | Passed | Browser emulation only; physical devices and zoom remain untested |
| STORAGE-01 | Blocked local storage | Deny storage access and load the application | Page remained usable, fell back to English, rendered 8 lessons, and reported no page errors | Passed | Preference cannot persist when browser storage is denied |
| MOTION-01 | Reduced motion | Emulate `prefers-reduced-motion: reduce` at 390 px | Gallery used its static layout; the Three.js canvas was present, the hero sweep was reduced to 0.00001 s, and marquee animation was disabled | Passed | Browser emulation; no prolonged frame-by-frame motion recording |
| MOTION-02 | Reduced-motion gallery after restyling | Emulate `prefers-reduced-motion: reduce` and inspect the gallery state | Gallery used its static layout and did not add enhanced motion | Passed | Browser emulation |
| FALLBACK-01 | No-JavaScript fallback | Block the application module and load without it | `js-ready` was absent; all 8 static lesson cards, quiz fallback, CSS shield, and English footer disclaimer remained available | Passed | Static content fallback only; language switching requires JavaScript |
| WEBGL-01 | WebGL failure fallback | Disable WebGL and load the page | Earlier browser check confirmed the CSS shield illustration remains visible when the Three.js canvas cannot initialize | Passed | Renderer fallback path; browser-specific WebGL failure modes may vary |
| REPORT-01 | Official reporting guidance | Check official portal and I4C FAQ | Canonical `https://cybercrime.gov.in/` loaded a page titled “Cybercrime Portal”; the I4C FAQ states financial cyber fraud can be reported via 1930 and must then be completed on the portal | Passed | Government procedures may change; verify before relying on them |
| A11Y-01 | Accessibility audit | Screen reader, full keyboard-only flow, contrast, zoom, and WCAG review | No formal audit or assistive-technology test was performed | Not run | Do not claim WCAG conformance |

## Remaining verification

- Have a fluent Kannada reviewer check wording and terminology.
- Perform a formal keyboard, screen-reader, contrast, zoom, and WCAG accessibility review.
- Recheck official reporting procedures before each release.
- Measure image transfer and Web Vitals before making performance claims.
- Consider code-splitting or otherwise reducing the Three.js chunk if performance budgets require it.
