# Report Gap Audit

Generated: 2026-06-18

This audit is heuristic. It checks whether reports contain the required evidence signals; it does not verify factual correctness.

## Summary

- Base HTML reports scanned: 23
- Base report JSON files scanned: 0
- GTM JSON files scanned: 22
- Base reports needing urgent content repair: P0=0, P1=0
- Base report JSON needing urgent content repair: P0=0, P1=0
- GTM JSON needing urgent content repair: P0=0, P1=0

Severity rule: P0 = 6+ missing signals, P1 = 4-5, P2 = 2-3, P3 = 0-1.

## Missing Signal Frequency

| Missing Signal | Files |
| --- | --- |
| `founderProfiles` | 6 |
| `accessoryServicePrice` | 2 |

## Base HTML Reports

| Severity | Report | Tables | Links | Missing Signals |
| --- | --- | --- | --- | --- |
| P3 | `aeke-report.html` | 9 | 0 | founderProfiles |
| P3 | `agility-robotics-report.html` | 4 | 15 | OK |
| P3 | `anker-report.html` | 8 | 3 | OK |
| P3 | `apple-report.html` | 4 | 6 | OK |
| P3 | `bambulab-report.html` | 7 | 0 | founderProfiles |
| P3 | `dji-report.html` | 7 | 0 | founderProfiles |
| P3 | `dongmingzhu-report.html` | 4 | 4 | OK |
| P3 | `elonmusk-report.html` | 2 | 5 | OK |
| P3 | `fightcamp-report.html` | 9 | 2 | OK |
| P3 | `figure-ai-report.html` | 3 | 10 | OK |
| P3 | `growl-report.html` | 9 | 2 | OK |
| P3 | `hyrox-report.html` | 10 | 3 | OK |
| P3 | `leijun-report.html` | 8 | 2 | OK |
| P3 | `lens-report.html` | 10 | 5 | OK |
| P3 | `mammotion-report.html` | 7 | 2 | OK |
| P3 | `nvidia-report.html` | 2 | 0 | founderProfiles |
| P3 | `peloton-report.html` | 10 | 3 | OK |
| P3 | `shokz-report.html` | 8 | 3 | OK |
| P3 | `spacex-report.html` | 3 | 10 | accessoryServicePrice |
| P3 | `speediance-report.html` | 10 | 0 | founderProfiles |
| P3 | `stevejobs-report.html` | 2 | 0 | founderProfiles |
| P3 | `tonal-report.html` | 12 | 2 | OK |
| P3 | `zhangxiaolong-report.html` | 8 | 2 | OK |

## GTM JSON Files

| Severity | JSON | Products | Sources | Missing Signals |
| --- | --- | --- | --- | --- |
| P3 | `aeke.json` | 3 | 8 | OK |
| P3 | `agility-robotics.json` | 3 | 16 | OK |
| P3 | `anker.json` | 3 | 10 | OK |
| P3 | `apple.json` | 3 | 9 | OK |
| P3 | `bambu-lab.json` | 3 | 15 | OK |
| P3 | `dji.json` | 3 | 14 | OK |
| P3 | `dongmingzhu.json` | 3 | 8 | OK |
| P3 | `elonmusk.json` | 3 | 10 | OK |
| P3 | `fightcamp.json` | 3 | 8 | OK |
| P3 | `figure-ai.json` | 3 | 12 | accessoryServicePrice |
| P3 | `growl.json` | 3 | 8 | OK |
| P3 | `hyrox.json` | 3 | 8 | OK |
| P3 | `leijun.json` | 3 | 9 | OK |
| P3 | `mammotion.json` | 3 | 8 | OK |
| P3 | `nvidia.json` | 3 | 13 | OK |
| P3 | `peloton.json` | 3 | 8 | OK |
| P3 | `shokz.json` | 3 | 8 | OK |
| P3 | `spacex.json` | 3 | 15 | OK |
| P3 | `speediance.json` | 3 | 8 | OK |
| P3 | `stevejobs.json` | 3 | 9 | OK |
| P3 | `tonal.json` | 3 | 8 | OK |
| P3 | `zhangxiaolong.json` | 3 | 9 | OK |

## Base Report JSON Files

_None._

## Repair Principle

1. Only add facts that have reliable sources. Do not write placeholders such as `not_found`, `unknown`, or search-result URLs into reports.
2. Missing signals stay in this audit until they are researched and sourced.
3. When a GTM JSON changes, regenerate the matching `examples/*-report-gtm.html` from the clean base report.
4. If a base HTML report lacks founder links, prices, or capital trail, deeply revise the relevant body section instead of appending a generic patch block.
5. New base reports should be created as `data/reports/<slug>.json`, checked with `node scripts/report-check.js`, and rendered with `node scripts/report-render.js`.
6. Re-run `node scripts/report-audit.js`, `node scripts/gtm-check.js <json>`, `node scripts/report-check.js <json>`, and `node scripts/generated-inventory.js` after every repair pass.
