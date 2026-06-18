#!/usr/bin/env node
/*
 * generated-inventory.js
 *
 * Builds a simple inventory of generated project artifacts:
 * - examples/*.html and examples/*.pdf
 * - data/gtm/*.json
 * - data/reports/*.json
 * - tmp/* ignored scratch files
 *
 * Usage:
 *   node scripts/generated-inventory.js
 *   node scripts/generated-inventory.js --out docs/generated-files.md
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const EXAMPLES_DIR = path.join(ROOT, 'examples');
const GTM_DIR = path.join(ROOT, 'data', 'gtm');
const REPORTS_DIR = path.join(ROOT, 'data', 'reports');
const CASES_DIR = path.join(ROOT, 'data', 'cases');
const TMP_DIR = path.join(ROOT, 'tmp');
const DEFAULT_OUT = path.join(ROOT, 'docs', 'generated-files.md');

function rel(file) {
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function exists(dir) {
  return fs.existsSync(dir);
}

function listFiles(dir, predicate) {
  if (!exists(dir)) return [];
  return fs.readdirSync(dir)
    .filter((name) => {
      const full = path.join(dir, name);
      return fs.statSync(full).isFile() && (!predicate || predicate(name, full));
    })
    .sort((a, b) => a.localeCompare(b))
    .map((name) => {
      const full = path.join(dir, name);
      const stat = fs.statSync(full);
      return {
        name,
        path: full,
        relPath: rel(full),
        size: stat.size,
        modified: stat.mtime,
      };
    });
}

function classifyExample(file) {
  if (/\.pdf$/i.test(file.name)) return 'example-pdf';
  if (/-case\.html$/i.test(file.name)) return 'entrepreneur-case-html';
  if (/-report-gtm\.html$/i.test(file.name)) return 'gtm-report-html';
  if (/-report\.html$/i.test(file.name)) return 'base-report-html';
  return 'other-example-file';
}

function slugFromExample(name) {
  return name
    .replace(/-case\.html$/i, '')
    .replace(/-report-gtm\.html$/i, '')
    .replace(/-report\.html$/i, '')
    .replace(/\.pdf$/i, '');
}

function slugFromGtmJson(name) {
  return name.replace(/\.json$/i, '');
}

function slugFromReportJson(name) {
  return name.replace(/\.json$/i, '');
}

function slugFromCaseJson(name) {
  return name.replace(/\.json$/i, '');
}

function formatBytes(n) {
  if (n >= 1024 * 1024) return (n / (1024 * 1024)).toFixed(1) + ' MB';
  if (n >= 1024) return Math.round(n / 1024) + ' KB';
  return String(n) + ' B';
}

function formatDate(d) {
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0') + ' ' +
    String(d.getHours()).padStart(2, '0') + ':' +
    String(d.getMinutes()).padStart(2, '0');
}

function table(files, columns) {
  if (!files.length) return '_None._\n';

  const header = '| ' + columns.map((c) => c.label).join(' | ') + ' |';
  const divider = '| ' + columns.map(() => '---').join(' | ') + ' |';
  const rows = files.map((file) => '| ' + columns.map((c) => c.value(file)).join(' | ') + ' |');
  return [header, divider].concat(rows).join('\n') + '\n';
}

function buildInventory() {
  const examples = listFiles(EXAMPLES_DIR, (name) => /\.(html|pdf)$/i.test(name))
    .map((file) => Object.assign({}, file, {
      kind: classifyExample(file),
      slug: slugFromExample(file.name),
    }));

  const gtmJson = listFiles(GTM_DIR, (name) => /\.json$/i.test(name) && !name.startsWith('_template'))
    .map((file) => Object.assign({}, file, {
      kind: 'gtm-json',
      slug: slugFromGtmJson(file.name),
    }));

  const reportJson = listFiles(REPORTS_DIR, (name) => /\.json$/i.test(name) && !name.startsWith('_'))
    .map((file) => Object.assign({}, file, {
      kind: 'base-report-json',
      slug: slugFromReportJson(file.name),
    }));

  const caseJson = listFiles(CASES_DIR, (name) => /\.json$/i.test(name) && !name.startsWith('_'))
    .map((file) => Object.assign({}, file, {
      kind: 'entrepreneur-case-json',
      slug: slugFromCaseJson(file.name),
    }));

  const tmp = listFiles(TMP_DIR)
    .map((file) => Object.assign({}, file, {
      kind: 'tmp-scratch',
      slug: file.name.replace(/\.(html|txt|json)$/i, ''),
    }));

  const misplacedRootReports = listFiles(ROOT, (name) => /-report(-gtm)?\.html$/i.test(name))
    .map((file) => Object.assign({}, file, {
      kind: 'misplaced-root-report',
      slug: slugFromExample(file.name),
    }));

  const baseSlugs = new Set(examples.filter((f) => f.kind === 'base-report-html').map((f) => f.slug));
  const gtmReportSlugs = new Set(examples.filter((f) => f.kind === 'gtm-report-html').map((f) => f.slug));
  const gtmJsonSlugs = new Set(gtmJson.map((f) => f.slug));
  const reportJsonSlugs = new Set(reportJson.map((f) => f.slug));
  const caseHtmlSlugs = new Set(examples.filter((f) => f.kind === 'entrepreneur-case-html').map((f) => f.slug));
  const caseJsonSlugs = new Set(caseJson.map((f) => f.slug));

  const generatedGtmWithoutBase = Array.from(gtmReportSlugs)
    .filter((slug) => !baseSlugs.has(slug))
    .sort();

  const jsonWithoutGtmReport = Array.from(gtmJsonSlugs)
    .filter((slug) => !gtmReportSlugs.has(slug))
    .sort();

  const gtmReportWithoutJson = Array.from(gtmReportSlugs)
    .filter((slug) => !gtmJsonSlugs.has(slug))
    .sort();

  const reportJsonWithoutBase = Array.from(reportJsonSlugs)
    .filter((slug) => !baseSlugs.has(slug))
    .sort();

  const baseWithoutReportJson = Array.from(baseSlugs)
    .filter((slug) => !reportJsonSlugs.has(slug))
    .sort();

  const caseJsonWithoutHtml = Array.from(caseJsonSlugs)
    .filter((slug) => !caseHtmlSlugs.has(slug))
    .sort();

  const caseHtmlWithoutJson = Array.from(caseHtmlSlugs)
    .filter((slug) => !caseJsonSlugs.has(slug))
    .sort();

  return {
    examples,
    reportJson,
    caseJson,
    gtmJson,
    tmp,
    baseReports: examples.filter((f) => f.kind === 'base-report-html'),
    gtmReports: examples.filter((f) => f.kind === 'gtm-report-html'),
    pdfs: examples.filter((f) => f.kind === 'example-pdf'),
    caseReports: examples.filter((f) => f.kind === 'entrepreneur-case-html'),
    misplacedRootReports,
    generatedGtmWithoutBase,
    reportJsonWithoutBase,
    baseWithoutReportJson,
    caseJsonWithoutHtml,
    caseHtmlWithoutJson,
    jsonWithoutGtmReport,
    gtmReportWithoutJson,
  };
}

function renderMarkdown(inv) {
  const lines = [];

  lines.push('# Generated Files Inventory');
  lines.push('');
  lines.push('Generated at: ' + formatDate(new Date()));
  lines.push('');
  lines.push('This file is generated by `node scripts/generated-inventory.js`. It classifies existing artifacts so old test files do not get confused with official report outputs.');
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push('- Base HTML reports: ' + inv.baseReports.length);
  lines.push('- Base report JSON files: ' + inv.reportJson.length);
  lines.push('- Entrepreneur case HTML reports: ' + inv.caseReports.length);
  lines.push('- Entrepreneur case JSON files: ' + inv.caseJson.length);
  lines.push('- GTM HTML reports: ' + inv.gtmReports.length);
  lines.push('- Example PDFs: ' + inv.pdfs.length);
  lines.push('- GTM JSON files: ' + inv.gtmJson.length);
  lines.push('- Ignored tmp scratch files: ' + inv.tmp.length);
  lines.push('- Misplaced root report files: ' + inv.misplacedRootReports.length);
  lines.push('');

  lines.push('## Official Report Outputs');
  lines.push('');
  lines.push(table(inv.examples, [
    { label: 'File', value: (f) => '`' + f.relPath + '`' },
    { label: 'Kind', value: (f) => f.kind },
    { label: 'Size', value: (f) => formatBytes(f.size) },
    { label: 'Modified', value: (f) => formatDate(f.modified) },
  ]));

  lines.push('## GTM JSON Inputs');
  lines.push('');
  lines.push(table(inv.gtmJson, [
    { label: 'File', value: (f) => '`' + f.relPath + '`' },
    { label: 'Slug', value: (f) => f.slug },
    { label: 'Size', value: (f) => formatBytes(f.size) },
    { label: 'Modified', value: (f) => formatDate(f.modified) },
  ]));

  lines.push('## Entrepreneur Case JSON Inputs');
  lines.push('');
  lines.push(table(inv.caseJson, [
    { label: 'File', value: (f) => '`' + f.relPath + '`' },
    { label: 'Slug', value: (f) => f.slug },
    { label: 'Size', value: (f) => formatBytes(f.size) },
    { label: 'Modified', value: (f) => formatDate(f.modified) },
  ]));

  lines.push('## Base Report JSON Inputs');
  lines.push('');
  lines.push(table(inv.reportJson, [
    { label: 'File', value: (f) => '`' + f.relPath + '`' },
    { label: 'Slug', value: (f) => f.slug },
    { label: 'Size', value: (f) => formatBytes(f.size) },
    { label: 'Modified', value: (f) => formatDate(f.modified) },
  ]));

  lines.push('## Mismatch Checks');
  lines.push('');
  lines.push('- GTM HTML without matching base report slug: ' + (inv.generatedGtmWithoutBase.length ? inv.generatedGtmWithoutBase.map((s) => '`' + s + '`').join(', ') : 'none'));
  lines.push('- Base report JSON without rendered base HTML: ' + (inv.reportJsonWithoutBase.length ? inv.reportJsonWithoutBase.map((s) => '`' + s + '`').join(', ') : 'none'));
  lines.push('- Historical base HTML without structured JSON: ' + (inv.baseWithoutReportJson.length ? inv.baseWithoutReportJson.map((s) => '`' + s + '`').join(', ') : 'none'));
  lines.push('- Entrepreneur case JSON without rendered case HTML: ' + (inv.caseJsonWithoutHtml.length ? inv.caseJsonWithoutHtml.map((s) => '`' + s + '`').join(', ') : 'none'));
  lines.push('- Entrepreneur case HTML without matching case JSON: ' + (inv.caseHtmlWithoutJson.length ? inv.caseHtmlWithoutJson.map((s) => '`' + s + '`').join(', ') : 'none'));
  lines.push('- GTM JSON without generated GTM HTML: ' + (inv.jsonWithoutGtmReport.length ? inv.jsonWithoutGtmReport.map((s) => '`' + s + '`').join(', ') : 'none'));
  lines.push('- GTM HTML without matching GTM JSON: ' + (inv.gtmReportWithoutJson.length ? inv.gtmReportWithoutJson.map((s) => '`' + s + '`').join(', ') : 'none'));
  lines.push('');
  lines.push('Note: a mismatch can be intentional when legacy file names differ, such as `bambulab-report.html` and `bambu-lab-report-gtm.html`.');
  lines.push('');

  lines.push('## Misplaced Root Reports');
  lines.push('');
  lines.push('Report outputs should live under `examples/`. Root-level `*-report.html` files are usually accidental duplicates or misplaced generated files.');
  lines.push('');
  lines.push(table(inv.misplacedRootReports, [
    { label: 'File', value: (f) => '`' + f.relPath + '`' },
    { label: 'Size', value: (f) => formatBytes(f.size) },
    { label: 'Modified', value: (f) => formatDate(f.modified) },
  ]));

  lines.push('## Tmp Scratch Files');
  lines.push('');
  lines.push('Files under `tmp/` are ignored by git and should be treated as disposable generated artifacts.');
  lines.push('');
  lines.push(table(inv.tmp, [
    { label: 'File', value: (f) => '`' + f.relPath + '`' },
    { label: 'Size', value: (f) => formatBytes(f.size) },
    { label: 'Modified', value: (f) => formatDate(f.modified) },
  ]));

  lines.push('## Handling Rules');
  lines.push('');
  lines.push('1. New base reports should start from `data/reports/<slug>.json`, pass `scripts/report-check.js`, then render through `scripts/report-render.js`.');
  lines.push('2. Keep historical `examples/*-report.html` as official visible outputs until replaced by regenerated reports.');
  lines.push('3. Keep `examples/*-report-gtm.html` only when the matching `data/gtm/*.json` passes `gtm-check.js` without critical omissions.');
  lines.push('4. Treat `tmp/*` as disposable scratch output. Regenerate prompts or render tests when needed.');
  lines.push('5. Use `docs/report-gap-audit.md` as the content repair queue.');
  lines.push('6. Do not add new generated outputs without rerunning this inventory and the report audit.');
  lines.push('7. Entrepreneur learning cases should start from `data/cases/<slug>.json`, pass `scripts/case-check.js`, then render through `scripts/case-render.js`.');
  lines.push('');

  return lines.join('\n');
}

function parseArgs(argv) {
  const args = { out: DEFAULT_OUT };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--out') {
      args.out = path.resolve(ROOT, argv[i + 1]);
      i += 1;
    } else if (argv[i] === '--help' || argv[i] === '-h') {
      console.log('Usage: node scripts/generated-inventory.js [--out docs/generated-files.md]');
      process.exit(0);
    } else {
      console.error('[generated-inventory] Unknown argument: ' + argv[i]);
      process.exit(1);
    }
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const inventory = buildInventory();
  const markdown = renderMarkdown(inventory);

  fs.mkdirSync(path.dirname(args.out), { recursive: true });
  fs.writeFileSync(args.out, markdown, 'utf8');

  console.log('[generated-inventory] Wrote ' + rel(args.out));
  console.log('[generated-inventory] Base reports: ' + inventory.baseReports.length + ', Base JSON: ' + inventory.reportJson.length + ', Case reports: ' + inventory.caseReports.length + ', Case JSON: ' + inventory.caseJson.length + ', GTM reports: ' + inventory.gtmReports.length + ', GTM JSON: ' + inventory.gtmJson.length + ', tmp: ' + inventory.tmp.length + ', misplaced root reports: ' + inventory.misplacedRootReports.length);
}

main();
