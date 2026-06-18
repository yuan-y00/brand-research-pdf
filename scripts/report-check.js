/**
 * report-check.js
 *
 * Checks structured base report JSON before rendering.
 * It is intentionally heuristic: it verifies evidence shape and missing signals,
 * but it does not perform web research or factual verification.
 *
 * Usage:
 *   node scripts/report-check.js data/reports/anker.json
 *   node scripts/report-check.js data/reports/anker.json --strict
 *   node scripts/report-check.js --all
 *   node scripts/report-check.js --help
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const REPORTS_DIR = path.join(PROJECT_ROOT, 'data', 'reports');

function parseArgs(argv) {
  const args = { jsonPath: null, all: false, strict: false, help: false, errors: [] };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') args.help = true;
    else if (a === '--all') args.all = true;
    else if (a === '--strict') args.strict = true;
    else if (a.startsWith('-')) args.errors.push('[report-check] Unknown option: ' + a);
    else if (!args.jsonPath) args.jsonPath = a;
    else args.errors.push('[report-check] Unexpected argument: ' + a);
  }
  return args;
}

function showHelp() {
  console.log([
    'report-check.js — Check structured base report JSON.',
    '',
    'Usage:',
    '  node scripts/report-check.js <json-file> [--strict]',
    '  node scripts/report-check.js --all [--strict]',
    '  node scripts/report-check.js --help',
    '',
    'Checks:',
    '  - founder profiles have clickable links',
    '  - capital history has dated money events and sources',
    '  - product price, competitor price, accessory/service, and subscription/software boundaries exist',
    '  - sources are present',
    '  - placeholder tokens are not written into report data',
  ].join('\n'));
}

function resolveProject(p) {
  return path.isAbsolute(p) ? p : path.join(PROJECT_ROOT, p);
}

function readJson(filePath) {
  const abs = resolveProject(filePath);
  const raw = fs.readFileSync(abs, 'utf8');
  return { abs, data: JSON.parse(raw) };
}

function deepText(val) {
  if (val == null) return '';
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) return val.map(deepText).join(' ');
  if (typeof val === 'object') return Object.values(val).map(deepText).join(' ');
  return String(val);
}

function isNonEmpty(val) {
  if (val == null) return false;
  if (typeof val === 'string') return val.trim().length > 0;
  if (Array.isArray(val)) return val.length > 0 && val.some(isNonEmpty);
  if (typeof val === 'object') return Object.keys(val).length > 0 && Object.values(val).some(isNonEmpty);
  return true;
}

function hasHttpUrl(val) {
  return /https?:\/\//i.test(deepText(val));
}

function hasPlaceholder(val) {
  return /not_found|not found|not_disclosed|not disclosed|not_public|not public|unknown|google\.com\/search|placeholder|待补|TODO/i.test(deepText(val));
}

function push(results, pass, msg, level) {
  results.push({ pass, msg, level });
}

function sourceOk(val) {
  return val && typeof val === 'object' && typeof val.url === 'string' && /^https?:\/\//i.test(val.url);
}

function priceOk(item) {
  return item && isNonEmpty(item.amount) && isNonEmpty(item.currency) && sourceOk(item.source);
}

function noteOk(item) {
  return item && isNonEmpty(item.value) && sourceOk(item.source);
}

function checkReport(data, options = {}) {
  const results = [];
  const strict = !!options.strict;
  const allowTemplate = !!options.allowTemplate;

  if (!data || typeof data !== 'object') {
    push(results, false, 'JSON root is not an object.', 'critical');
    return results;
  }

  if (data.schema_version !== '1.0') {
    push(results, false, 'schema_version must be "1.0".', 'critical');
  }

  if (!allowTemplate && hasPlaceholder(data)) {
    push(results, false, 'Data contains placeholder text such as unknown/not_found/TODO/search URL.', 'critical');
  }

  const bc = data.brand_context || {};
  if (!isNonEmpty(bc.brand_name) || !isNonEmpty(bc.slug) || !isNonEmpty(bc.one_line)) {
    push(results, false, 'brand_context must include brand_name, slug, and one_line.', 'critical');
  }

  const founders = Array.isArray(bc.founder_profiles) ? bc.founder_profiles : [];
  if (!founders.length) {
    push(results, false, 'brand_context.founder_profiles is empty.', 'critical');
  } else {
    founders.forEach((f, i) => {
      if (!isNonEmpty(f.name) || !isNonEmpty(f.summary)) {
        push(results, false, `founder_profiles[${i}] is missing name or summary.`, 'critical');
      }
      if (!hasHttpUrl(f.links)) {
        push(results, false, `founder_profiles[${i}] has no clickable source link.`, 'critical');
      }
    });
  }

  const capital = Array.isArray(bc.capital_history) ? bc.capital_history : [];
  if (!capital.length) {
    push(results, false, 'brand_context.capital_history is empty.', 'critical');
  } else {
    const moneyEvents = capital.filter((e) => isNonEmpty(e.amount) && isNonEmpty(e.currency));
    if (!moneyEvents.length) {
      push(results, false, 'capital_history has no event with amount and currency.', 'critical');
    }
    const firstMoney = capital.some((e) => /founder|first|seed|angel|order|revenue|自筹|第一笔|首单|种子|天使/i.test(deepText(e)));
    if (!firstMoney) {
      push(results, false, 'capital_history has no first-money / first-order / seed signal.', strict ? 'critical' : 'warning');
    }
    capital.forEach((e, i) => {
      if (!isNonEmpty(e.date) || !isNonEmpty(e.description)) {
        push(results, false, `capital_history[${i}] is missing date or description.`, 'critical');
      }
      if (!hasHttpUrl(e.sources)) {
        push(results, false, `capital_history[${i}] has no source link.`, 'critical');
      }
    });
  }

  const pricing = data.pricing || {};
  const products = Array.isArray(pricing.products) ? pricing.products : [];
  if (!products.length) {
    push(results, false, 'pricing.products is empty.', 'critical');
  }

  const hasBoundaryAccessory = noteOk(pricing.boundary_notes && pricing.boundary_notes.accessory_service);
  const hasBoundarySubscription = noteOk(pricing.boundary_notes && pricing.boundary_notes.subscription_software);

  let hasAccessoryOrService = hasBoundaryAccessory;
  let hasSubscriptionOrBoundary = hasBoundarySubscription;

  products.forEach((p, i) => {
    if (!isNonEmpty(p.name)) {
      push(results, false, `pricing.products[${i}] is missing name.`, 'critical');
    }
    if (!priceOk(p.product_price)) {
      push(results, false, `pricing.products[${i}].product_price must include amount, currency, and source.url.`, 'critical');
    }

    const competitors = Array.isArray(p.competitors) ? p.competitors : [];
    if (competitors.length < 2) {
      push(results, false, `pricing.products[${i}] has fewer than 2 competitor prices.`, strict ? 'critical' : 'warning');
    }
    competitors.forEach((c, j) => {
      if (!isNonEmpty(c.brand) || !priceOk(c.price)) {
        push(results, false, `pricing.products[${i}].competitors[${j}] is missing brand or sourced price.`, 'critical');
      }
    });

    const accessories = Array.isArray(p.accessories) ? p.accessories : [];
    const services = Array.isArray(p.services) ? p.services : [];
    if (accessories.some(priceOk) || services.some(priceOk)) hasAccessoryOrService = true;

    const subscriptions = Array.isArray(p.subscriptions) ? p.subscriptions : [];
    if (subscriptions.some(priceOk)) hasSubscriptionOrBoundary = true;
  });

  if (!hasAccessoryOrService) {
    push(results, false, 'No accessory/service price and no sourced accessory_service boundary note.', strict ? 'critical' : 'warning');
  }

  if (!hasSubscriptionOrBoundary) {
    push(results, false, 'No subscription/software price and no sourced subscription_software boundary note.', strict ? 'critical' : 'warning');
  }

  const sections = Array.isArray(data.sections) ? data.sections : [];
  if (!sections.length) {
    push(results, false, 'sections is empty.', 'critical');
  } else {
    sections.forEach((s, i) => {
      if (!isNonEmpty(s.title) || !Array.isArray(s.blocks) || !s.blocks.length) {
        push(results, false, `sections[${i}] must include title and blocks.`, 'critical');
      }
    });
  }

  const sources = Array.isArray(data.sources) ? data.sources : [];
  if (sources.length < 5) {
    push(results, false, 'sources has fewer than 5 entries.', strict ? 'critical' : 'warning');
  }
  sources.forEach((s, i) => {
    if (!sourceOk(s)) {
      push(results, false, `sources[${i}] is missing a valid http(s) url.`, 'critical');
    }
  });

  if (!results.some((r) => !r.pass)) {
    push(results, true, 'All required report signals are present.', 'info');
  }

  return results;
}

function reportForFile(filePath, strict) {
  let data;
  let abs;
  try {
    ({ abs, data } = readJson(filePath));
  } catch (err) {
    return {
      file: filePath,
      results: [{ pass: false, msg: 'Cannot read or parse JSON: ' + err.message, level: 'critical' }],
    };
  }
  const allowTemplate = path.basename(abs).startsWith('_');
  return { file: abs, results: checkReport(data, { strict, allowTemplate }) };
}

function formatReport(file, results, strict) {
  const critical = results.filter((r) => !r.pass && r.level === 'critical');
  const warnings = results.filter((r) => !r.pass && r.level === 'warning');
  const info = results.filter((r) => r.pass || r.level === 'info');
  const lines = [];
  lines.push('# Base Report JSON Check');
  lines.push('');
  lines.push('File: ' + file);
  lines.push('Mode: ' + (strict ? 'strict' : 'standard'));
  lines.push('');
  lines.push('## Critical');
  lines.push(critical.length ? critical.map((r) => 'FAIL — ' + r.msg).join('\n') : 'PASS');
  lines.push('');
  lines.push('## Warnings');
  lines.push(warnings.length ? warnings.map((r) => 'WARNING — ' + r.msg).join('\n') : 'PASS');
  lines.push('');
  lines.push('## Result');
  if (critical.length) lines.push('FAIL');
  else if (warnings.length) lines.push('PASS with warnings');
  else lines.push('PASS');
  if (info.length && !critical.length && !warnings.length) lines.push(info.map((r) => r.msg).join('\n'));
  return lines.join('\n');
}

function listReportFiles() {
  if (!fs.existsSync(REPORTS_DIR)) return [];
  return fs
    .readdirSync(REPORTS_DIR)
    .filter((name) => name.endsWith('.json') && !name.startsWith('_'))
    .map((name) => path.join(REPORTS_DIR, name));
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

  const files = args.all ? listReportFiles() : args.jsonPath ? [args.jsonPath] : [];
  if (!files.length) {
    if (args.all) {
      console.log('[report-check] No base report JSON files found in data/reports/.');
      return 0;
    }
    console.error('[report-check] Missing JSON file path. Use --all or pass a file.');
    return 2;
  }

  let failed = false;
  files.forEach((file, idx) => {
    const result = reportForFile(file, args.strict);
    if (idx > 0) console.log('\n---\n');
    console.log(formatReport(result.file, result.results, args.strict));
    const critical = result.results.some((r) => !r.pass && r.level === 'critical');
    const warningInStrict = args.strict && result.results.some((r) => !r.pass && r.level === 'warning');
    if (critical || warningInStrict) failed = true;
  });

  return failed ? 1 : 0;
}

if (require.main === module) {
  process.exit(main());
}

module.exports = { checkReport };
