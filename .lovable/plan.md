# Complete customizable report-card booklet

## User-facing result
- Keep Playgroup and Nursery reports grade-only; default other classes to marks plus grades.
- Let staff add/remove assessment columns, choose marks, grades, or both, and pick a print style.
- Generate a two-page A4 landscape half-fold PDF: school-branded cover on the outside and student results inside, with the selected report period.
- Preserve saved student marks, report variants, and bulk downloads.

## Implementation
- Extend the shared report-card settings model to retain custom column labels and per-column display choices, with class-aware defaults and backwards-compatible loading.
- Update the generator controls and subject entry rows for added/removed columns; save the same settings with marks.
- Refactor the shared PDF renderer to produce two landscape A4 pages with half-panel cover/interior layout and selected style; keep Blob output for batch exports.
- Add focused tests for class defaults, editable columns, and mode constraints; run them and verify the generated PDF page count/layout and current build.
