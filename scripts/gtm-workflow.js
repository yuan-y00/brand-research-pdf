/**
 * gtm-workflow.js
 *
 * Lightweight workflow wrapper: brand name → research prompt → JSON → append → index → publish.
 * Does NOT do research, scraping, or fact-checking.
 *
 * Usage:
 *   node scripts/gtm-workflow.js "<Brand Name>"                  → prepare prompt
 *   node scripts/gtm-workflow.js "<Brand Name>" --prepare        → same as above
 *   node scripts/gtm-workflow.js "<Brand Name>" --append         → append GTM section
 *   node scripts/gtm-workflow.js "<Brand Name>" --update-index   → insert card into index.html
 *   node scripts/gtm-workflow.js "<Brand Name>" --publish        → append + update-index
 *   node scripts/gtm-workflow.js "<Brand Name>" --publish --push → publish + git push
 *   node scripts/gtm-workflow.js "<Brand Name>" --find-report    → find matching report
 *   node scripts/gtm-workflow.js "<Brand Name>" --dry-run        → preview paths
 *   node scripts/gtm-workflow.js --help                          → show help
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
const APPEND_SCRIPT = path.join('scripts', 'gtm-append.js');
const PROMPT_SOURCE = path.join('prompts', 'brand-gtm-extension.md');
const EXAMPLES_DIR = path.join('examples');

// ============================================================================
// CLI ARGUMENT PARSING
// ============================================================================

function parseArgs(argv) {
  const args = {
    brandName: null,
    prepare: false,
    append: false,
    updateIndex: false,
    publish: false,
    push: false,
    commitMessage: null,
    indexPath: null,
    jsonPath: null,
    reportPath: null,
    outPath: null,
    force: false,
    forcePrompt: false,
    noStyle: false,
    dryRun: false,
    findReport: false,
    help: false,
    errors: [],
  };

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') {
      args.help = true;
    } else if (a === '--prepare') {
      args.prepare = true;
    } else if (a === '--append') {
      args.append = true;
    } else if (a === '--update-index') {
      args.updateIndex = true;
    } else if (a === '--publish') {
      args.publish = true;
    } else if (a === '--push') {
      args.push = true;
    } else if (a === '--commit-message') {
      if (i + 1 >= argv.length) {
        args.errors.push('[gtm-workflow] Missing message after --commit-message.');
      } else {
        args.commitMessage = argv[++i];
      }
    } else if (a === '--index') {
      if (i + 1 >= argv.length) {
        args.errors.push('[gtm-workflow] Missing path after --index.');
      } else {
        args.indexPath = argv[++i];
      }
    } else if (a === '--json') {
      if (i + 1 >= argv.length) {
        args.errors.push('[gtm-workflow] Missing path after --json.');
      } else {
        args.jsonPath = argv[++i];
      }
    } else if (a === '--report') {
      if (i + 1 >= argv.length) {
        args.errors.push('[gtm-workflow] Missing path after --report.');
      } else {
        args.reportPath = argv[++i];
      }
    } else if (a === '--out') {
      if (i + 1 >= argv.length) {
        args.errors.push('[gtm-workflow] Missing path after --out.');
      } else {
        args.outPath = argv[++i];
      }
    } else if (a === '--force') {
      args.force = true;
    } else if (a === '--force-prompt') {
      args.forcePrompt = true;
    } else if (a === '--no-style') {
      args.noStyle = true;
    } else if (a === '--dry-run') {
      args.dryRun = true;
    } else if (a === '--find-report') {
      args.findReport = true;
    } else if (a.startsWith('-')) {
      args.errors.push('[gtm-workflow] Unknown option: ' + a);
    } else if (!args.brandName) {
      args.brandName = a;
    } else {
      args.errors.push('[gtm-workflow] Unexpected argument: ' + a);
    }
  }

  return args;
}

// ============================================================================
// HELP
// ============================================================================

function showHelp() {
  console.log([
    'gtm-workflow.js — Brand name → GTM research prompt → append to report → update index → publish.',
    '',
    'Standard workflow:',
    '  1. node scripts/gtm-workflow.js "Anker"              → generate research prompt',
    '  2. Copy tmp/anker-gtm-research-prompt.txt to VSCode AI',
    '  3. Save AI output as data/gtm/anker.json',
    '  4. node scripts/gtm-workflow.js "Anker" --append     → append GTM section',
    '  5. node scripts/gtm-workflow.js "Anker" --update-index → insert card into index.html',
    '',
    'Quick publish (steps 4+5 combined):',
    '  node scripts/gtm-workflow.js "Anker" --publish',
    '',
    'Publish to GitHub Pages (generate + update index + git push):',
    '  node scripts/gtm-workflow.js "Anker" --publish --push --commit-message "Publish Anker GTM report"',
    '',
    'Usage:',
    '  node scripts/gtm-workflow.js "<Brand Name>" [options]',
    '  node scripts/gtm-workflow.js --help',
    '',
    'Options:',
    '  <Brand Name>        Brand name (e.g. "Anker", "Bambu Lab", "DJI").',
    '  --prepare            Generate research prompt file (default mode when no other action).',
    '  --append             Append GTM section to existing report.',
    '  --update-index       Insert or update the report card in index.html.',
    '  --publish            Shortcut: --append + --update-index.',
    '                        Generates the GTM report and adds it to the index.',
    '                        NOTE: --publish does NOT git push. Use --push for that.',
    '  --push               Git add + commit + push the generated files.',
    '                        Only valid with --publish or --update-index.',
    '                        DEFAULT: no push. You must explicitly opt in.',
    '  --json <path>        Override JSON file path.',
    '  --report <path>      Override source report path.',
    '  --out <path>         Override output file path.',
    '  --index <path>       Override index.html path (default: index.html).',
    '  --commit-message <msg>  Commit message for --push (default: "Publish <Brand> GTM report").',
    '  --force              Pass --force to gtm-append.js (overwrite output).',
    '  --force-prompt       Overwrite research prompt file if it already exists.',
    '  --no-style           Pass --no-style to gtm-append.js.',
    '  --dry-run            Print resolved paths and commands without writing files.',
    '  --find-report        Scan examples/ for matching report files.',
    '  --help               Show this help text.',
    '',
    'Examples:',
    '  node scripts/gtm-workflow.js "Anker"',
    '  node scripts/gtm-workflow.js "Anker" --prepare --force-prompt',
    '  node scripts/gtm-workflow.js "Anker" --append',
    '  node scripts/gtm-workflow.js "Anker" --append --force',
    '  node scripts/gtm-workflow.js "Anker" --update-index',
    '  node scripts/gtm-workflow.js "Anker" --update-index --index tmp/index-clean.html',
    '  node scripts/gtm-workflow.js "Anker" --publish',
    '  node scripts/gtm-workflow.js "Anker" --publish --dry-run',
    '  node scripts/gtm-workflow.js "Anker" --publish --push --commit-message "Publish Anker GTM report"',
    '  node scripts/gtm-workflow.js "Bambu Lab" --find-report',
    '  node scripts/gtm-workflow.js "Bambu Lab" --append --report examples/bambulab-report.html',
    '  node scripts/gtm-workflow.js "Anker" --dry-run',
  ].join('\n'));
}

// ============================================================================
// BRAND SLUG
// ============================================================================

function slugifyBrandName(name) {
  if (typeof name !== 'string') return 'brand';
  let s = name.trim().toLowerCase();
  s = s.replace(/&/g, ' and ');
  s = s.replace(/[\s_/]+/g, '-');
  // Remove characters that are not: letters, digits, CJK, hyphens
  s = s.replace(/[^a-z0-9一-鿿-]/g, '');
  s = s.replace(/&/g, 'and');
  s = s.replace(/-+/g, '-');
  s = s.replace(/^-+|-+$/g, '');
  return s || 'brand';
}

// ============================================================================
// PATH DERIVATION
// ============================================================================

function derivePaths(brandName, jsonPath, reportPath, outPath) {
  const slug = slugifyBrandName(brandName);
  return {
    slug,
    jsonPath: jsonPath || 'data/gtm/' + slug + '.json',
    reportPath: reportPath || 'examples/' + slug + '-report.html',
    outPath: outPath || 'examples/' + slug + '-report-gtm.html',
    promptPath: 'tmp/' + slug + '-gtm-research-prompt.txt',
  };
}

function resolveProject(relativePath) {
  if (!relativePath) return '';
  return path.resolve(PROJECT_ROOT, relativePath);
}

// ============================================================================
// REPORT FINDER
// ============================================================================

function findReportCandidates(brandName, brandSlug) {
  const examplesDir = resolveProject(EXAMPLES_DIR);
  let files;
  try {
    files = fs.readdirSync(examplesDir);
  } catch {
    return [];
  }

  // Filter: only .html, ends with -report.html, excludes -gtm
  const reportFiles = files.filter((f) => {
    if (!f.endsWith('.html')) return false;
    if (!f.endsWith('-report.html') && !f.endsWith('-report-gtm.html')) return false;
    if (f.includes('-gtm')) return false; // exclude gtm outputs
    if (f.includes('-workflow-')) return false; // exclude tmp test files
    return true;
  });

  const compactSlug = brandSlug.replace(/-/g, '');
  const nameTokens = brandName.toLowerCase().split(/[\s]+/).filter(Boolean);

  // Scoring system
  const scored = reportFiles.map((f) => {
    const base = f.replace(/\.html$/, '');
    let score = 0;

    // Exact match: {slug}-report.html
    if (base === brandSlug + '-report') {
      score = 100;
    }
    // Compact match: remove hyphens from both
    else if (base.replace(/-/g, '') === compactSlug + 'report') {
      score = 90;
    }
    // File name includes compact slug
    else if (f.replace(/-/g, '').includes(compactSlug)) {
      score = 70;
    }
    // Token match: all name tokens appear in file name
    else if (nameTokens.length > 0 && nameTokens.every((t) => f.toLowerCase().includes(t))) {
      score = 50;
    }

    return { file: f, path: 'examples/' + f, score };
  });

  // Sort by score descending, filter score > 0
  const candidates = scored
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((c) => ({ file: c.file, path: c.path, score: c.score }));

  return candidates;
}

function resolveReportPath(defaultPath, candidates) {
  // Check if default path exists
  const defaultAbs = resolveProject(defaultPath);
  if (fs.existsSync(defaultAbs)) {
    return { path: defaultPath, matched: true, method: 'exact' };
  }

  // Check candidates
  if (candidates.length === 1) {
    const candAbs = resolveProject(candidates[0].path);
    if (fs.existsSync(candAbs)) {
      return { path: candidates[0].path, matched: true, method: 'auto-matched: ' + candidates[0].file };
    }
  }

  return { path: defaultPath, matched: false, candidates };
}

// ============================================================================
// PREPARE: GENERATE RESEARCH PROMPT
// ============================================================================

function generateResearchPrompt(brandName, brandSlug, promptPath, reportPath, forcePrompt) {
  const promptAbs = resolveProject(promptPath);

  // Check if prompt already exists
  if (!forcePrompt && fs.existsSync(promptAbs)) {
    return { error: '[gtm-workflow] Research prompt already exists: ' + promptPath + '. Use --force-prompt to overwrite.' };
  }

  // Read source prompt
  const sourceAbs = resolveProject(PROMPT_SOURCE);
  let template;
  try {
    template = fs.readFileSync(sourceAbs, 'utf-8');
  } catch (err) {
    return { error: '[gtm-workflow] Cannot read prompt template: ' + PROMPT_SOURCE + ' — ' + err.message };
  }

  // Replace {{BRAND_NAME}} with real brand name
  const filled = template.replace(/\{\{BRAND_NAME\}\}/g, brandName);

  // Build the final prompt with instructions header
  const header = [
    '============================================================',
    '以下是指定品牌的研究 prompt，请复制全部内容发给 VSCode AI',
    '============================================================',
    '',
    '保存要求：',
    '  1. 请把 AI 最终输出的 JSON 保存为：',
    '     data/gtm/' + brandSlug + '.json',
    '  2. 请确保：',
    '     - JSON 合法',
    '     - brand_slug 字段为：' + brandSlug,
    '     - 不要输出 Markdown',
    '     - 不要在 JSON 外写解释',
    '     - top_products 不超过 3 个',
    '     - 不确定的内容写 unknown / not_found / low_confidence',
    '  3. 旧报告路径（参考，用于后续 append）：',
    '     ' + reportPath,
    '',
    '============================================================',
    '以下复制给 VSCode AI',
    '============================================================',
    '',
  ].join('\n');

  const content = header + filled;

  // Write prompt file
  const promptDir = path.dirname(promptAbs);
  if (!fs.existsSync(promptDir)) {
    fs.mkdirSync(promptDir, { recursive: true });
  }

  try {
    fs.writeFileSync(promptAbs, content, 'utf-8');
  } catch (err) {
    return { error: '[gtm-workflow] Cannot write prompt: ' + promptPath + ' — ' + err.message };
  }

  return { success: true, promptPath };
}

// ============================================================================
// APPEND: CALL gtm-append.js
// ============================================================================

function doAppend(jsonPath, reportPath, outPath, force, noStyle) {
  const appendArgs = [
    APPEND_SCRIPT,
    '--json', jsonPath,
    '--report', reportPath,
    '--out', outPath,
  ];
  if (force) appendArgs.push('--force');
  if (noStyle) appendArgs.push('--no-style');

  const result = spawnSync(process.execPath, appendArgs, {
    cwd: PROJECT_ROOT,
    encoding: 'utf-8',
    stdio: 'inherit',
  });

  return result.status === 0;
}

// ============================================================================
// UPDATE INDEX: CALL gtm-index.js
// ============================================================================

function runUpdateIndex(brandName, brandSlug, outPath, indexPath) {
  console.error('[gtm-workflow] Updating index: ' + indexPath);

  // Verify the report file exists
  const outAbs = resolveProject(outPath);
  if (!fs.existsSync(outAbs)) {
    console.error('[gtm-workflow] Report file not found: ' + outPath);
    console.error('Run --append or --publish first to generate the report.');
    process.exit(1);
  }

  const indexArgs = [
    path.join('scripts', 'gtm-index.js'),
    '--brand', brandName,
    '--slug', brandSlug,
    '--report', outPath,
    '--index', indexPath,
    '--write',
    '--allow-existing',
  ];

  // Show what command is being run
  console.error('[gtm-workflow] Running: node ' + indexArgs.join(' '));

  const result = spawnSync(process.execPath, indexArgs, {
    cwd: PROJECT_ROOT,
    encoding: 'utf-8',
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    console.error('[gtm-workflow] Index update failed. See errors above.');
    process.exit(1);
  }

  console.error('[gtm-workflow] Index updated or already up to date: ' + indexPath);
}

// ============================================================================
// GIT PUSH
// ============================================================================

function runGitPush(jsonPath, outPath, indexPath, commitMessage) {
  console.error('[gtm-workflow] Preparing git push...');

  // Step 1: git add
  const addArgs = ['add', '--', jsonPath, outPath, indexPath];
  console.error('[gtm-workflow] Running: git ' + addArgs.join(' '));

  const addResult = spawnSync('git', addArgs, {
    cwd: PROJECT_ROOT,
    encoding: 'utf-8',
    stdio: 'inherit',
  });

  if (addResult.status !== 0) {
    console.error('[gtm-workflow] git add failed.');
    process.exit(1);
  }

  // Step 2: git commit
  console.error('[gtm-workflow] Running: git commit -m "' + commitMessage + '"');

  const commitResult = spawnSync('git', ['commit', '-m', commitMessage], {
    cwd: PROJECT_ROOT,
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (commitResult.status !== 0) {
    const stderr = (commitResult.stderr || '').trim();
    if (stderr) console.error(stderr);

    if (stderr.includes('nothing to commit') || stderr.includes('nothing added to commit')) {
      console.error('[gtm-workflow] Nothing to commit. Skipping git push.');
      process.exit(0);
    }

    console.error('[gtm-workflow] git commit failed.');
    process.exit(1);
  }

  // Print commit success output
  if (commitResult.stdout && commitResult.stdout.trim()) {
    console.error(commitResult.stdout.trim());
  }

  // Step 3: git push
  console.error('[gtm-workflow] Running: git push');

  const pushResult = spawnSync('git', ['push'], {
    cwd: PROJECT_ROOT,
    encoding: 'utf-8',
    stdio: 'inherit',
  });

  if (pushResult.status !== 0) {
    console.error('[gtm-workflow] git push failed.');
    process.exit(1);
  }

  console.error('[gtm-workflow] Published to GitHub Pages.');
}

function printCandidates(brandSlug, candidates) {
  if (candidates.length === 0) {
    console.log('No matching report found for slug "' + brandSlug + '".');
    console.log('Expected: examples/' + brandSlug + '-report.html');
    console.log('Tip: use --report to specify the source report path manually.');
    return;
  }

  console.log('Report candidates for "' + brandSlug + '":');
  for (const c of candidates) {
    console.log('  ' + c.path + '  (score: ' + c.score + ')');
  }
  if (candidates.length > 1) {
    console.log('Multiple candidates found. Use --report to pick one.');
  }
}

// ============================================================================
// DRY RUN
// ============================================================================

function printDryRun(brandName, paths, candidates, opts) {
  const indexPath = opts.indexPath || 'index.html';
  const commitMessage = opts.commitMessage || ('Publish ' + brandName + ' GTM report');

  console.log('[gtm-workflow] Dry run');
  console.log('brandName:    ' + brandName);
  console.log('brandSlug:    ' + paths.slug);
  console.log('mode:         ' + (opts.publish ? 'publish' : opts.append ? 'append' : opts.updateIndex ? 'update-index' : 'prepare'));
  console.log('jsonPath:     ' + paths.jsonPath);
  console.log('reportPath:   ' + paths.reportPath);
  console.log('outPath:      ' + paths.outPath);
  console.log('promptPath:   ' + paths.promptPath);
  console.log('indexPath:    ' + indexPath);
  console.log('append:       ' + (opts.append || opts.publish));
  console.log('updateIndex:  ' + (opts.updateIndex || opts.publish));
  console.log('publish:      ' + opts.publish);
  console.log('push:         ' + opts.push);
  if (opts.push) {
    console.log('commitMsg:    ' + commitMessage);
  }
  console.log('force:        ' + opts.force);
  console.log('forcePrompt:  ' + opts.forcePrompt);
  console.log('noStyle:      ' + opts.noStyle);
  console.log('dryRun:       true');
  if (candidates.length > 0) {
    console.log('reportCandidates:');
    for (const c of candidates) {
      console.log('  - ' + c.path + '  (score: ' + c.score + ')');
    }
  } else {
    console.log('reportCandidates: (none)');
  }

  // Show the commands that would be executed
  if (opts.append || opts.publish) {
    const appendArgs = [
      'node', path.join('scripts', 'gtm-append.js'),
      '--json', paths.jsonPath,
      '--report', paths.reportPath,
      '--out', paths.outPath,
    ];
    if (opts.force) appendArgs.push('--force');
    if (opts.noStyle) appendArgs.push('--no-style');
    console.log('');
    console.log('[gtm-workflow] Would run:');
    console.log('  ' + appendArgs.join(' '));
  }

  if (opts.updateIndex || opts.publish) {
    const indexArgs = [
      'node', path.join('scripts', 'gtm-index.js'),
      '--brand', brandName,
      '--slug', paths.slug,
      '--report', paths.outPath,
      '--index', indexPath,
      '--write',
      '--allow-existing',
    ];
    console.log('  ' + indexArgs.join(' '));
  }

  if (opts.push) {
    const jsonPath = paths.jsonPath;
    const outPath = paths.outPath;
    console.log('');
    console.log('[gtm-workflow] Would run git commands:');
    console.log('  git add -- ' + jsonPath + ' ' + outPath + ' ' + indexPath);
    console.log('  git commit -m "' + commitMessage + '"');
    console.log('  git push');
    console.log('');
    console.log('[gtm-workflow] NOTE: --push is disabled in dry-run. No git commands executed.');
  }
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

  // --push requires --publish or --update-index
  if (args.push && !args.publish && !args.updateIndex) {
    console.error('[gtm-workflow] --push must be combined with --publish or --update-index.');
    console.error('Run with --help for usage.');
    process.exit(1);
  }

  if (!args.brandName) {
    console.error('[gtm-workflow] Missing brand name.');
    console.error('Run with --help for usage.');
    process.exit(1);
  }

  const brandName = args.brandName;
  const paths = derivePaths(brandName, args.jsonPath, args.reportPath, args.outPath);

  // --publish implies --append + --update-index
  if (args.publish) {
    args.append = true;
    args.updateIndex = true;
  }

  // Resolve index path
  const indexPath = args.indexPath || 'index.html';

  // Default commit message
  const commitMessage = args.commitMessage || ('Publish ' + brandName + ' GTM report');

  // --find-report: standalone
  if (args.findReport) {
    const candidates = findReportCandidates(brandName, paths.slug);
    printCandidates(paths.slug, candidates);
    process.exit(candidates.length > 0 ? 0 : 1);
  }

  // Resolve report candidates
  const candidates = findReportCandidates(brandName, paths.slug);

  // --dry-run
  if (args.dryRun) {
    printDryRun(brandName, paths, candidates, args);
    process.exit(0);
  }

  // =========================================================================
  // --update-index (standalone, without append)
  // =========================================================================
  if (args.updateIndex && !args.append) {
    // Verify the report file exists
    const outAbs = resolveProject(paths.outPath);
    if (!fs.existsSync(outAbs)) {
      console.error('[gtm-workflow] Report file not found: ' + paths.outPath);
      console.error('Run --append or --publish first to generate the report.');
      process.exit(1);
    }

    runUpdateIndex(brandName, paths.slug, paths.outPath, indexPath);

    if (args.push) {
      runGitPush(paths.jsonPath, paths.outPath, indexPath, commitMessage);
    }
    process.exit(0);
  }

  // =========================================================================
  // --append mode (or --publish which implies append)
  // =========================================================================
  if (args.append) {
    // Check JSON exists
    const jsonAbs = resolveProject(paths.jsonPath);
    if (!fs.existsSync(jsonAbs)) {
      console.error('[gtm-workflow] JSON file not found: ' + paths.jsonPath);
      console.error('Run prepare first, then save AI output as: ' + paths.jsonPath);
      console.error('  node scripts/gtm-workflow.js "' + brandName + '" --prepare');
      process.exit(1);
    }

    // Resolve report path
    let finalReportPath = paths.reportPath;
    const resolved = resolveReportPath(paths.reportPath, candidates);
    if (!resolved.matched) {
      if (resolved.candidates && resolved.candidates.length > 1) {
        console.error('[gtm-workflow] Multiple report candidates found. Use --report to pick one:');
        printCandidates(paths.slug, resolved.candidates);
      } else {
        console.error('[gtm-workflow] Source report not found: ' + paths.reportPath);
        console.error('Tip: use --find-report to search, or --report to specify manually.');
      }
      process.exit(1);
    }
    finalReportPath = resolved.path;
    if (resolved.method !== 'exact') {
      console.error('[gtm-workflow] Auto-matched report: ' + finalReportPath);
    }

    // Check report exists
    const reportAbs = resolveProject(finalReportPath);
    if (!fs.existsSync(reportAbs)) {
      console.error('[gtm-workflow] Source report not found: ' + finalReportPath);
      process.exit(1);
    }

    // Check output != source
    const outAbs = resolveProject(paths.outPath);
    if (outAbs === reportAbs) {
      console.error('[gtm-workflow] Output path must not equal source report path.');
      process.exit(1);
    }

    console.error('[gtm-workflow] Appending GTM section...');
    const ok = doAppend(paths.jsonPath, finalReportPath, paths.outPath, args.force, args.noStyle);
    if (ok) {
      console.error('');
      console.error('GTM report generated:');
      console.error('  ' + paths.outPath);
    } else {
      console.error('[gtm-workflow] Append failed. See errors above.');
      process.exit(1);
    }

    // Update index if requested
    if (args.updateIndex) {
      runUpdateIndex(brandName, paths.slug, paths.outPath, indexPath);
    }

    // Git push if requested
    if (args.push) {
      runGitPush(paths.jsonPath, paths.outPath, indexPath, commitMessage);
    }

    process.exit(0);
  }

  // =========================================================================
  // Default: prepare mode (or explicit --prepare)
  // =========================================================================

  // Check if prompt already exists, unless --force-prompt
  const promptAbs = resolveProject(paths.promptPath);
  if (!args.forcePrompt && fs.existsSync(promptAbs)) {
    console.error('[gtm-workflow] Research prompt already exists: ' + paths.promptPath);
    console.error('Use --force-prompt to overwrite, or --append if JSON is ready.');
    console.error('  node scripts/gtm-workflow.js "' + brandName + '" --force-prompt');
    process.exit(1);
  }

  // Check if JSON already exists (informational)
  const jsonAbs2 = resolveProject(paths.jsonPath);
  if (fs.existsSync(jsonAbs2)) {
    console.error('[gtm-workflow] Note: JSON already exists at ' + paths.jsonPath);
    console.error('To append, run:');
    console.error('  node scripts/gtm-workflow.js "' + brandName + '" --append');
    console.error('');
  }

  // Generate prompt
  const result = generateResearchPrompt(brandName, paths.slug, paths.promptPath, paths.reportPath, args.forcePrompt);
  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }

  // Show next steps
  console.error('============================================================');
  console.error('Research prompt generated:');
  console.error('  ' + result.promptPath);
  console.error('');
  console.error('Next steps:');
  console.error('  1. Copy the prompt file to VSCode AI');
  console.error('  2. AI will research and output JSON');
  console.error('  3. Save the JSON as:');
  console.error('     ' + paths.jsonPath);
  console.error('  4. Then run:');
  console.error('     node scripts/gtm-workflow.js "' + brandName + '" --append');
  console.error('  5. Update index:');
  console.error('     node scripts/gtm-workflow.js "' + brandName + '" --update-index');
  console.error('  Or publish in one step:');
  console.error('     node scripts/gtm-workflow.js "' + brandName + '" --publish');
  console.error('============================================================');
}

main(process.argv);
