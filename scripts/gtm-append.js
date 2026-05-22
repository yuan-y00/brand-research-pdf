/**
 * gtm-append.js
 *
 * Takes a brand slug (or explicit paths), calls gtm-render.js to generate
 * a GTM HTML section, and inserts it into an existing brand research report
 * before </body>. Output is always a NEW file — source report is never touched.
 *
 * Usage:
 *   node scripts/gtm-append.js <brand-slug>                    → default paths
 *   node scripts/gtm-append.js --json <j> --report <r> --out <o>  → explicit paths
 *   node scripts/gtm-append.js <brand-slug> --dry-run          → preview paths
 *   node scripts/gtm-append.js --help                          → show help
 *
 * Zero dependencies. Node.js native modules only.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// ============================================================================
// CONSTANTS
// ============================================================================

const PROJECT_ROOT = path.resolve(__dirname, '..');
const RENDER_SCRIPT = path.join('scripts', 'gtm-render.js');
const GTM_START_MARKER = '<!-- GTM_EXTENSION_START -->';
const GTM_END_MARKER = '<!-- GTM_EXTENSION_END -->';

// ============================================================================
// CLI ARGUMENT PARSING
// ============================================================================

function parseArgs(argv) {
  const args = {
    brandSlug: null,
    jsonPath: null,
    reportPath: null,
    outPath: null,
    force: false,
    noStyle: false,
    dryRun: false,
    help: false,
    errors: [],
  };

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') {
      args.help = true;
    } else if (a === '--json') {
      if (i + 1 >= argv.length) {
        args.errors.push('[gtm-append] Missing path after --json.');
      } else {
        args.jsonPath = argv[++i];
      }
    } else if (a === '--report') {
      if (i + 1 >= argv.length) {
        args.errors.push('[gtm-append] Missing path after --report.');
      } else {
        args.reportPath = argv[++i];
      }
    } else if (a === '--out') {
      if (i + 1 >= argv.length) {
        args.errors.push('[gtm-append] Missing path after --out.');
      } else {
        args.outPath = argv[++i];
      }
    } else if (a === '--force') {
      args.force = true;
    } else if (a === '--no-style') {
      args.noStyle = true;
    } else if (a === '--dry-run') {
      args.dryRun = true;
    } else if (a.startsWith('-')) {
      args.errors.push('[gtm-append] Unknown option: ' + a);
    } else if (!args.brandSlug) {
      args.brandSlug = a;
    } else {
      args.errors.push('[gtm-append] Unexpected argument: ' + a);
    }
  }

  return args;
}

// ============================================================================
// HELP
// ============================================================================

function showHelp() {
  console.log([
    'gtm-append.js — Insert a GTM extension HTML section into a brand research report.',
    '',
    'Usage:',
    '  node scripts/gtm-append.js <brand-slug> [options]',
    '  node scripts/gtm-append.js --json <j> --report <r> --out <o> [options]',
    '  node scripts/gtm-append.js --help',
    '',
    'Options:',
    '  <brand-slug>     Brand identifier. Derived paths:',
    '                     JSON:  data/gtm/<brand-slug>.json',
    '                     Report: examples/<brand-slug>-report.html',
    '                     Output: examples/<brand-slug>-report-gtm.html',
    '  --json <path>    Override JSON file path.',
    '  --report <path>  Override source report path.',
    '  --out <path>     Override output file path.',
    '  --force          Overwrite output file if it already exists (never overwrites source).',
    '  --no-style       Pass --no-style to gtm-render.js (omit scoped CSS block).',
    '  --dry-run        Print resolved paths and exit without writing any files.',
    '  --help           Show this help text.',
    '',
    'Examples:',
    '  node scripts/gtm-append.js anker',
    '  node scripts/gtm-append.js dji --force',
    '  node scripts/gtm-append.js anker --dry-run',
    '  node scripts/gtm-append.js --json data/gtm/_template.brand-gtm-extension.json --report examples/anker-report.html --out tmp/anker-report-gtm-test.html',
    '  node scripts/gtm-append.js anker --out examples/anker-report-with-gtm.html',
  ].join('\n'));
}

// ============================================================================
// PATH HELPERS
// ============================================================================

function normalizeSlug(slug) {
  if (typeof slug !== 'string') return '';
  return slug
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function resolveProject(relativePath) {
  if (!relativePath) return '';
  return path.resolve(PROJECT_ROOT, relativePath);
}

function resolveOutPath(outPath, reportPath) {
  const out = resolveProject(outPath);
  const report = resolveProject(reportPath);
  if (out && report && out === report) {
    return { error: '[gtm-append] Output path must not equal source report path.' };
  }
  return { outPath: out };
}

// ============================================================================
// DERIVE DEFAULT PATHS FROM BRAND SLUG
// ============================================================================

function derivePaths(brandSlug, jsonPath, reportPath, outPath) {
  const slug = normalizeSlug(brandSlug);
  return {
    jsonPath: jsonPath || 'data/gtm/' + slug + '.json',
    reportPath: reportPath || 'examples/' + slug + '-report.html',
    outPath: outPath || 'examples/' + slug + '-report-gtm.html',
    slug: slug,
  };
}

// ============================================================================
// VALIDATION
// ============================================================================

function validateInput(args) {
  const errors = [];

  const hasSlug = !!args.brandSlug;
  const hasJsonAndReport = !!args.jsonPath && !!args.reportPath;

  if (!hasSlug && !hasJsonAndReport) {
    errors.push(
      '[gtm-append] Missing required input. Provide a brand slug, or provide --json, --report and --out.'
    );
    return { errors };
  }

  // Derive final paths
  const paths = derivePaths(args.brandSlug, args.jsonPath, args.reportPath, args.outPath);

  // If no slug and explicit paths but no --out
  if (!hasSlug && !args.outPath) {
    errors.push('[gtm-append] Missing --out. Required when not using a brand slug.');
  }

  return { paths, errors };
}

function checkFiles(jsonPath, reportPath, outPath, force, dryRun) {
  const errors = [];
  const jsonAbs = resolveProject(jsonPath);
  const reportAbs = resolveProject(reportPath);
  const outAbs = resolveProject(outPath);

  // Check output != source
  if (outAbs && reportAbs && outAbs === reportAbs) {
    errors.push('[gtm-append] Output path must not equal source report path.');
    return { errors, jsonAbs, reportAbs, outAbs };
  }

  // In dry run, skip existence checks for json/report
  if (dryRun) {
    return { errors, jsonAbs, reportAbs, outAbs };
  }

  // Check JSON exists
  if (!fs.existsSync(jsonAbs)) {
    errors.push('[gtm-append] JSON file not found: ' + jsonPath);
  }

  // Check report exists
  if (!fs.existsSync(reportAbs)) {
    errors.push('[gtm-append] Source report not found: ' + reportPath);
  }

  // Check output doesn't already exist (unless --force)
  if (!force && fs.existsSync(outAbs)) {
    errors.push(
      '[gtm-append] Output already exists: ' + outPath + '. Use --force to overwrite.'
    );
  }

  return { errors, jsonAbs, reportAbs, outAbs };
}

// ============================================================================
// CALL GTM-RENDER
// ============================================================================

function callGtmRender(jsonAbs, noStyle) {
  const renderArgs = [RENDER_SCRIPT, jsonAbs];
  if (noStyle) {
    renderArgs.push('--no-style');
  }

  const result = spawnSync(process.execPath, renderArgs, {
    cwd: PROJECT_ROOT,
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (result.status !== 0) {
    const stderr = (result.stderr || '').trim();
    return { error: '[gtm-append] gtm-render failed.\n' + (stderr || 'Unknown error (exit code ' + result.status + ')') };
  }

  const html = (result.stdout || '').trim();
  if (!html) {
    return { error: '[gtm-append] gtm-render produced empty output.' };
  }

  return { html };
}

// ============================================================================
// INSERT GTM SECTION INTO REPORT
// ============================================================================

function hasExistingGtmExtension(html) {
  return (
    html.includes('GTM_EXTENSION_START') ||
    html.includes('class="section gtm-extension"') ||
    html.includes("class='section gtm-extension'")
  );
}

function insertGtmSection(reportHtml, gtmHtml) {
  // Priority 1: last </body> (case insensitive)
  const bodyMatch = reportHtml.match(/<\/body>/i);
  if (bodyMatch) {
    const insertAt = bodyMatch.index;
    const inserted =
      reportHtml.slice(0, insertAt) +
      '\n' + GTM_START_MARKER + '\n' +
      gtmHtml +
      '\n' + GTM_END_MARKER + '\n' +
      reportHtml.slice(insertAt);
    return { html: inserted, method: 'before </body>' };
  }

  // Priority 2: last </html> (case insensitive)
  const htmlMatch = reportHtml.match(/<\/html>/i);
  if (htmlMatch) {
    const insertAt = htmlMatch.index;
    const inserted =
      reportHtml.slice(0, insertAt) +
      '\n' + GTM_START_MARKER + '\n' +
      gtmHtml +
      '\n' + GTM_END_MARKER + '\n' +
      reportHtml.slice(insertAt);
    return { html: inserted, method: 'before </html>' };
  }

  // Priority 3: append to end
  const inserted =
    reportHtml +
    '\n' + GTM_START_MARKER + '\n' +
    gtmHtml +
    '\n' + GTM_END_MARKER + '\n';
  return { html: inserted, method: 'end of file (warning: no </body> or </html> found)' };
}

// ============================================================================
// DRY RUN OUTPUT
// ============================================================================

function printDryRun(brandSlug, jsonPath, reportPath, outPath, force, noStyle, jsonAbs, reportAbs, outAbs) {
  const slug = normalizeSlug(brandSlug || '');
  console.log('brandSlug:  ' + (slug || '(not set)'));
  console.log('jsonPath:   ' + jsonPath + '  → ' + jsonAbs);
  console.log('reportPath: ' + reportPath + '  → ' + reportAbs);
  console.log('outPath:    ' + outPath + '  → ' + outAbs);
  console.log('force:      ' + force);
  console.log('noStyle:    ' + noStyle);
  console.log('dryRun:     true');
}

// ============================================================================
// MAIN
// ============================================================================

function main(argv) {
  const args = parseArgs(argv);

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  if (args.errors.length > 0) {
    for (const e of args.errors) console.error(e);
    console.error('Run with --help for usage.');
    process.exit(1);
  }

  // Validate input
  const validated = validateInput(args);
  if (validated.errors && validated.errors.length > 0) {
    for (const e of validated.errors) console.error(e);
    console.error('Run with --help for usage.');
    process.exit(1);
  }

  const paths = validated.paths;
  const jsonPath = paths.jsonPath;
  const reportPath = paths.reportPath;
  const outPath = paths.outPath;

  // Check files
  const check = checkFiles(jsonPath, reportPath, outPath, args.force, args.dryRun);
  if (check.errors.length > 0) {
    for (const e of check.errors) console.error(e);
    process.exit(1);
  }

  const { jsonAbs, reportAbs, outAbs } = check;

  // Dry run
  if (args.dryRun) {
    printDryRun(args.brandSlug, jsonPath, reportPath, outPath, args.force, args.noStyle, jsonAbs, reportAbs, outAbs);
    process.exit(0);
  }

  // Step 1: Call gtm-render
  console.error('[gtm-append] Rendering GTM section from: ' + jsonPath);
  const renderResult = callGtmRender(jsonAbs, args.noStyle);
  if (renderResult.error) {
    console.error(renderResult.error);
    process.exit(1);
  }
  const gtmHtml = renderResult.html;

  // Step 2: Read source report
  console.error('[gtm-append] Reading source report: ' + reportPath);
  let reportHtml;
  try {
    reportHtml = fs.readFileSync(reportAbs, 'utf-8');
  } catch (err) {
    console.error('[gtm-append] Cannot read source report: ' + reportPath + ' — ' + err.message);
    process.exit(1);
  }

  // Step 3: Check for existing GTM extension
  if (hasExistingGtmExtension(reportHtml)) {
    console.error('[gtm-append] Source report already contains a GTM extension. Use a clean source report, or choose another report.');
    process.exit(1);
  }

  // Step 4: Insert GTM section
  const insertResult = insertGtmSection(reportHtml, gtmHtml);
  console.error('[gtm-append] Inserted GTM section ' + insertResult.method);

  // Step 5: Write output
  const outDir = path.dirname(outAbs);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  try {
    fs.writeFileSync(outAbs, insertResult.html, 'utf-8');
  } catch (err) {
    console.error('[gtm-append] Cannot write output: ' + outPath + ' — ' + err.message);
    process.exit(1);
  }

  console.error('[gtm-append] Wrote: ' + outPath);
}

main(process.argv);
