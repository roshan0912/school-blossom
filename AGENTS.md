# Architecture rules
- Keep reference-led visual refreshes in shared theme tokens and presentation classes; do not change data access or workflow logic, so all ERP behavior remains unchanged.
- Keep bulk report export in a shared client-side service and reuse the existing report-card PDF renderer with an optional Blob output, so batch and individual downloads retain identical print layouts.
- Use a shared download control on the overview, reports page and saved report cards, so loading and error handling remain consistent.
- Mount the recent-updates dialog once at app level and track dismissal per browser-tab session, so opening notices do not repeat during navigation and can be reopened from the header.