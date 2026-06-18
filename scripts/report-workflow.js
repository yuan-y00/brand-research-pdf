/**
 * report-workflow.js
 *
 * Unified base report workflow:
 * brand name -> research prompt -> data/reports JSON -> check -> render -> optional GTM append.
 *
 * Usage:
 *   node scripts/report-workflow.js "Anker"                    -> prepare prompt
 *   node scripts/report-workflow.js "Anker" --check            -> check data/reports/anker.json
 *   node scripts/report-workflow.js "Anker" --render           -> render examples/anker-report.html
 *   node scripts/report-workflow.js "Anker" --publish          -> check + render
 *   node scripts/report-workflow.js "Anker" --publish --with-gtm -> check + render + append GTM if data/gtm/anker.json exists
 *   node scripts/report-workflow.js "Anker" --dry-run
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PROMPT_SOURCE = path.join('prompts', 'brand-report.md');
const TEMPLATE_JSON = path.join('data', 'reports', '_template.brand-report.json');

function parseArgs(argv) {
  const args = {
    brandName: null,
    prepare: false,
    check: false,
    render: false,
    publish: false,
    withGtm: false,
    jsonPath: null,
    outPath: null,
    force: false,
    forcePrompt: false,
    strict: false,
    dryRun: false,
    help: false,
    errors: [],
  };

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') args.help = true;
    else if (a === '--prepare') args.prepare = true;
    else if (a === '--check') args.check = true;
    else if (a === '--render') args.render = true;
    else if (a === '--publish') args.publish = true;
    else if (a === '--with-gtm') args.withGtm = true;
    else if (a === '--json') {
      if (i + 1 >= argv.length) args.errors.push('[report-workflow] Missing path after --json.');
      else args.jsonPath = argv[++i];
    } else if (a === '--out') {
      if (i + 1 >= argv.length) args.errors.push('[report-workflow] Missing path after --out.');
      else args.outPath = argv[++i];
    } else if (a === '--force') args.force = true;
    else if (a === '--force-prompt') args.forcePrompt = true;
    else if (a === '--strict') args.strict = true;
    else if (a === '--dry-run') args.dryRun = true;
    else if (a.startsWith('-')) args.errors.push('[report-workflow] Unknown option: ' + a);
    else if (!args.brandName) args.brandName = a;
    else args.errors.push('[report-workflow] Unexpected argument: ' + a);
  }

  return args;
}

function showHelp() {
  console.log([
    'report-workflow.js — Unified base report workflow.',
    '',
    'Standard workflow:',
    '  1. node scripts/report-workflow.js "Anker"             -> generate research prompt',
    '  2. Save researched JSON as data/reports/anker.json',
    '  3. node scripts/report-workflow.js "Anker" --check     -> validate JSON',
    '  4. node scripts/report-workflow.js "Anker" --render    -> render base HTML',
    '  5. node scripts/report-workflow.js "Anker" --publish --with-gtm -> render base + GTM HTML',
    '',
    'Usage:',
    '  node scripts/report-workflow.js "<Brand Name>" [options]',
    '  node scripts/report-workflow.js --help',
    '',
    'Options:',
    '  --prepare        Generate tmp/<slug>-report-research-prompt.txt (default action).',
    '  --check          Run scripts/report-check.js on data/reports/<slug>.json.',
    '  --render         Run scripts/report-render.js to create examples/<slug>-report.html.',
    '  --publish        Shortcut: --check + --render.',
    '  --with-gtm       After render, append data/gtm/<slug>.json into examples/<slug>-report-gtm.html if present.',
    '  --json <path>    Override base report JSON path.',
    '  --out <path>     Override base report HTML output path.',
    '  --force          Overwrite rendered HTML / GTM HTML if output exists.',
    '  --force-prompt   Overwrite prompt file if it exists.',
    '  --strict         Treat report-check warnings as failures.',
    '  --dry-run        Print paths and commands without writing.',
    '  --help           Show this help text.',
  ].join('\n'));
}

function slugifyBrandName(name) {
  if (typeof name !== 'string') return 'brand';
  let s = name.trim().toLowerCase();
  s = s.replace(/&/g, ' and ');
  s = s.replace(/[\s_/]+/g, '-');
  s = s.replace(/[^a-z0-9一-鿿-]/g, '');
  s = s.replace(/-+/g, '-');
  s = s.replace(/^-+|-+$/g, '');
  return s || 'brand';
}

function resolveProject(p) {
  return path.isAbsolute(p) ? p : path.join(PROJECT_ROOT, p);
}

function derivePaths(brandName, jsonPath, outPath) {
  const slug = slugifyBrandName(brandName);
  return {
    slug,
    jsonPath: jsonPath || path.join('data', 'reports', slug + '.json'),
    outPath: outPath || path.join('examples', slug + '-report.html'),
    promptPath: path.join('tmp', slug + '-report-research-prompt.txt'),
    gtmJsonPath: path.join('data', 'gtm', slug + '.json'),
    gtmOutPath: path.join('examples', slug + '-report-gtm.html'),
  };
}

function runNode(script, args, dryRun) {
  const command = ['node', script].concat(args);
  if (dryRun) {
    console.log('[report-workflow] ' + command.join(' '));
    return { status: 0 };
  }
  return spawnSync('node', [script].concat(args), {
    cwd: PROJECT_ROOT,
    stdio: 'inherit',
    shell: false,
  });
}

function preparePrompt(brandName, paths, forcePrompt, dryRun) {
  const promptAbs = resolveProject(paths.promptPath);
  if (dryRun) {
    console.log('[report-workflow] Prompt: ' + paths.promptPath);
    return 0;
  }

  if (fs.existsSync(promptAbs) && !forcePrompt) {
    console.error('[report-workflow] Prompt already exists: ' + paths.promptPath + '. Use --force-prompt to overwrite.');
    return 1;
  }

  const source = fs.readFileSync(resolveProject(PROMPT_SOURCE), 'utf8');
  const templateJson = fs.readFileSync(resolveProject(TEMPLATE_JSON), 'utf8').trim();
  const prompt = source
    .replace(/{{brand_name}}/g, brandName)
    .replace(/{{slug}}/g, paths.slug)
    .replace('{{template_json}}', templateJson);

  fs.mkdirSync(path.dirname(promptAbs), { recursive: true });
  fs.writeFileSync(promptAbs, prompt, 'utf8');
  console.error('[report-workflow] Wrote prompt: ' + paths.promptPath);
  return 0;
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    showHelp();
    return 0;
  }
  if (args.errors.length) {
    console.error(args.errors.join('\n'));
    return 2;
  }
  if (!args.brandName) {
    console.error('[report-workflow] Missing brand name.');
    return 2;
  }

  const paths = derivePaths(args.brandName, args.jsonPath, args.outPath);
  const noAction = !args.prepare && !args.check && !args.render && !args.publish;
  const doPrepare = args.prepare || noAction;
  const doCheck = args.check || args.publish;
  const doRender = args.render || args.publish;

  if (args.dryRun) {
    console.log('[report-workflow] Brand: ' + args.brandName);
    console.log('[report-workflow] Slug: ' + paths.slug);
    console.log('[report-workflow] JSON: ' + paths.jsonPath);
    console.log('[report-workflow] HTML: ' + paths.outPath);
    console.log('[report-workflow] Prompt: ' + paths.promptPath);
    console.log('[report-workflow] GTM JSON: ' + paths.gtmJsonPath);
    console.log('[report-workflow] GTM HTML: ' + paths.gtmOutPath);
  }

  if (doPrepare) {
    const code = preparePrompt(args.brandName, paths, args.forcePrompt, args.dryRun);
    if (code !== 0) return code;
  }

  if (doCheck) {
    const checkArgs = [paths.jsonPath];
    if (args.strict) checkArgs.push('--strict');
    const result = runNode(path.join('scripts', 'report-check.js'), checkArgs, args.dryRun);
    if (result.status !== 0) return result.status || 1;
  }

  if (doRender) {
    const renderArgs = [paths.jsonPath, '--out', paths.outPath, '--check'];
    if (args.strict) renderArgs.push('--strict');
    if (args.force) renderArgs.push('--force');
    const result = runNode(path.join('scripts', 'report-render.js'), renderArgs, args.dryRun);
    if (result.status !== 0) return result.status || 1;
  }

  if (args.withGtm) {
    if (!fs.existsSync(resolveProject(paths.gtmJsonPath))) {
      console.error('[report-workflow] GTM JSON not found, skipping GTM append: ' + paths.gtmJsonPath);
      return 0;
    }
    const appendArgs = [
      '--json', paths.gtmJsonPath,
      '--report', paths.outPath,
      '--out', paths.gtmOutPath,
    ];
    if (args.force) appendArgs.push('--force');
    const result = runNode(path.join('scripts', 'gtm-append.js'), appendArgs, args.dryRun);
    if (result.status !== 0) return result.status || 1;
  }

  return 0;
}

if (require.main === module) {
  process.exit(main());
}
