# GTM Extension Implementation Plan

> Legacy note: this was the original GTM implementation plan. It is kept for history only. Current project logic lives in `README.md` and `docs/project-logic.md`.

## 1. Project Snapshot

**Date:** 2026-05-21

### Key Files at Project Root
- `README.md` — project documentation
- `SKILL.md` — legacy Claude Code skill notice, not the current project core
- `index.html` — report gallery page (lists all generated reports as cards)
- `dongmingzhu-report.html` — one legacy report at root level

### examples/ Directory
- **Exists:** Yes
- **Contains 21 HTML reports + 1 PDF**
- **Naming convention:** `{brand-name}-report.html` (e.g., `anker-report.html`, `dji-report.html`, `hyrox-report.html`)
- One exception: `dongmingzhu-report.html` is at project root (also copied into examples/)

### package.json
- **Does NOT exist.** This is NOT an npm project.

### src/ scripts/ templates/ data/ prompts/ styles/ docs/
- **None of these existed before Round 1.**
- `docs/`, `prompts/`, `data/gtm/` were created in Round 1.

### Node.js / npm
- **Node.js:** v24.15.0 — available
- **npm:** 11.12.1 — available
- Both are usable. No need to install anything.

### Git
- **Status:** clean, on branch `master`, up to date with `origin/master`

### HTML Report Internal Structure
- Reports use `<div class="section">` directly inside `<body>` — **no `<main>` tag**
- Last `.section` is followed directly by `</body></html>`
- Each section has a `<div class="section-label">Section 0X</div>` header
- CSS is fully inline in `<style>` within `<head>`

### Recommended Implementation Approach
- **Option B: Append GTM section to existing HTML** (insert before `</body>`)
- Reason: No `<main>` tag exists, no template engine, simplest and safest approach
- Original reports are NEVER overwritten — output goes to `{brand}-report-gtm.html`

## 2. Goal

Append a "GTM & Product Learning" module to existing brand research HTML reports.

- User inputs only a **brand name**
- **Current AI tool or human researcher** does the research and generates JSON
- Users paste the `prompts/brand-gtm-extension.md` prompt into their AI tool
- AI outputs a JSON file saved to `data/gtm/{brand-slug}.json`
- This project **only** reads JSON, renders it to an HTML section, and appends it to the existing report
- Output is a **new** file: `examples/{brand}-report-gtm.html` — original is never touched

## 3. Non-Goals

- No web scraping
- No database
- No backend service
- No automated fact-checking
- No social media login / scraping
- No complex dependencies
- No overwriting existing reports
- No refactoring the entire project
- No third-party API integration
- No package.json required (use native Node.js)

## 4. Data Flow

```
Brand Name (user input)
       ↓
Current AI tool or human researcher uses prompts/brand-gtm-extension.md to research
       ↓
Generates data/gtm/{brand-slug}.json
       ↓
Node.js script reads JSON
       ↓
Generates GTM HTML section (using project's existing CSS design tokens)
       ↓
Inserts before </body> in examples/{brand}-report.html
       ↓
Outputs examples/{brand}-report-gtm.html (original untouched)
```

## 5. Recommended Implementation

Given the project structure:

- **No package.json** → use native Node.js (v24.15.0 available, supports ESM natively)
- **No `<main>` tag** → insert before `</body>` instead
- **CSS is inline** → reuse existing `:root` design tokens (--accent: #C2513B, --positive: #5B8C6F, --neutral: #4A6FA5, etc.)
- **Report naming:** `{brand}-report.html` → derives brand slug easily

### Minimal file structure to add:

```
data/gtm/_template.brand-gtm-extension.json   ← JSON template (created Round 1)
data/gtm/{brand-slug}.json                    ← AI-generated per brand
prompts/brand-gtm-extension.md                ← Research prompt for the current AI tool or researcher
docs/gtm-extension-implementation-plan.md     ← This file (created Round 1)
scripts/gtm-render.js                         ← JSON → HTML section renderer (Round 2)
scripts/gtm-append.js                         ← Append HTML section to report (Round 3)
```

All scripts use native Node.js with zero dependencies.

## 6. Six-Round Plan

| Round | What | Deliverable |
|-------|------|-------------|
| **Round 1** | Project audit + prompt + template + plan | `docs/gtm-extension-implementation-plan.md`, `prompts/brand-gtm-extension.md`, `data/gtm/_template.brand-gtm-extension.json` |
| **Round 2** | Implement JSON → HTML section renderer | `scripts/gtm-render.js` — reads JSON, outputs HTML section string |
| **Round 3** | Implement append to existing report | `scripts/gtm-append.js` — reads existing HTML, inserts GTM section before `</body>`, writes new file |
| **Round 4** | Brand name workflow | CLI that takes a brand name → finds report → appends GTM section (or a simple mapping) |
| **Round 5** | End-to-end test with a real brand | Generate a real `data/gtm/anker.json`, run through pipeline, verify output |
| **Round 6** | README update, error handling, final checks | Polish, edge cases, documentation |

## 7. Risks

| Risk | Mitigation |
|------|-----------|
| JSON format invalid | Validate JSON before rendering; show clear error message with line/column |
| AI-generated content too long | Truncate gracefully; use CSS `max-height` + scroll for overflow sections |
| `</body>` tag not found | Fallback: append at end of file; log warning |
| Report HTML structure varies | Use regex `</body>` which is the most stable anchor across all reports |
| Brand name doesn't match report filename | Use brand_slug in JSON to derive filename; maintain a mapping if needed |
| No Node.js environment | Already confirmed v24.15.0 exists |
| Content accuracy unverified | Disclaimer in JSON + in rendered HTML; this is a learning tool, not an audit |
| Original report overwritten | **Hard rule:** output ALWAYS goes to `{brand}-report-gtm.html`, never to `{brand}-report.html` |

## 8. Next Step (Round 2)

Implement a lightweight renderer: `scripts/gtm-render.js`

This script should:
1. Read a JSON file from `data/gtm/{brand-slug}.json`
2. Convert it into an HTML `<div class="section">` block
3. Use the project's existing CSS design tokens (`:root` variables)
4. Output the HTML section to stdout or a temp file

Key design decisions for Round 2:
- Reuse `--accent`, `--positive`, `--neutral`, `--ink`, `--bg-card` etc. from existing reports
- Match the `.section`, `.section-label`, `.insight-card` patterns
- Add a new section label: "GTM & Product Learning"
- Keep it visually consistent with the rest of the report
