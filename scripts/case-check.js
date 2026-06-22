#!/usr/bin/env node
/*
 * case-check.js
 *
 * Checks entrepreneur case JSON files under data/cases.
 * This checker is designed for founder learning cases, not ordinary brand
 * reports. It verifies product reason, difficulty, cost/return evidence, ROI
 * boundaries, recruitment signals, official-site signals, and source links.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CASES_DIR = path.join(ROOT, 'data', 'cases');

function parseArgs(argv) {
  const args = { jsonPath: null, all: false, strict: false, help: false, errors: [] };
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--all') args.all = true;
    else if (a === '--strict') args.strict = true;
    else if (a === '--help' || a === '-h') args.help = true;
    else if (a.startsWith('-')) args.errors.push('[case-check] Unknown option: ' + a);
    else if (!args.jsonPath) args.jsonPath = a;
    else args.errors.push('[case-check] Unexpected argument: ' + a);
  }
  return args;
}

function showHelp() {
  console.log([
    'case-check.js - Check entrepreneur case JSON.',
    '',
    'Usage:',
    '  node scripts/case-check.js data/cases/mammotion.json',
    '  node scripts/case-check.js --all',
    '  node scripts/case-check.js <json> --strict',
  ].join('\n'));
}

function resolveProject(filePath) {
  return path.isAbsolute(filePath) ? filePath : path.join(ROOT, filePath);
}

function deepText(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(deepText).join(' ');
  if (typeof value === 'object') return Object.values(value).map(deepText).join(' ');
  return String(value);
}

function isNonEmpty(value) {
  if (value == null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0 && value.some(isNonEmpty);
  if (typeof value === 'object') return Object.keys(value).length > 0 && Object.values(value).some(isNonEmpty);
  return true;
}

function hasHttpUrl(value) {
  return /https?:\/\//i.test(deepText(value));
}

function hasPlaceholder(value) {
  return /not_found|not found|unknown|not_public|not public|google\.com\/search|placeholder|TODO/i.test(deepText(value));
}

function sourceOk(source) {
  return source && typeof source.url === 'string' && /^https?:\/\//i.test(source.url);
}

function evidenceOk(note) {
  return note && isNonEmpty(note.label) && isNonEmpty(note.value) && sourceOk(note.source);
}

function push(results, pass, msg, level = 'critical') {
  results.push({ pass, msg, level });
}

function checkCase(data, options = {}) {
  const strict = !!options.strict;
  const allowTemplate = !!options.allowTemplate;
  const results = [];

  if (!data || typeof data !== 'object') {
    push(results, false, 'JSON root is not an object.');
    return results;
  }

  if (data.schema_version !== '1.0') {
    push(results, false, 'schema_version must be "1.0".');
  }

  if (!allowTemplate && hasPlaceholder(data)) {
    push(results, false, 'Data contains placeholder / unknown / TODO text.');
  }

  const ctx = data.case_context || {};
  ['case_name', 'slug', 'case_type', 'learning_objective', 'first_principle'].forEach((key) => {
    if (!isNonEmpty(ctx[key])) push(results, false, `case_context.${key} is missing.`);
  });

  if (!/founder|entrepreneur|创业|learn|学习|ROI|product|产品/i.test(ctx.learning_objective || '')) {
    push(results, false, 'learning_objective does not clearly describe founder learning value.', strict ? 'critical' : 'warning');
  }

  const fcc = data.founder_company_context || {};
  const founders = Array.isArray(fcc.founder_profiles) ? fcc.founder_profiles : [];
  if (!founders.length) {
    push(results, false, 'founder_company_context.founder_profiles is empty.');
  } else {
    founders.forEach((f, i) => {
      if (!isNonEmpty(f.name) || !isNonEmpty(f.summary)) push(results, false, `founder_profiles[${i}] missing name or summary.`);
      if (!hasHttpUrl(f.links)) push(results, false, `founder_profiles[${i}] has no source URL.`);
    });
  }

  const capital = Array.isArray(fcc.capital_history) ? fcc.capital_history : [];
  if (!capital.length) {
    push(results, false, 'founder_company_context.capital_history is empty.');
  } else {
    const hasMoney = capital.some((e) => isNonEmpty(e.amount) && isNonEmpty(e.currency));
    if (!hasMoney) push(results, false, 'capital_history has no amount/currency event.');
    capital.forEach((e, i) => {
      if (!isNonEmpty(e.date) || !isNonEmpty(e.description)) push(results, false, `capital_history[${i}] missing date or description.`);
      if (!hasHttpUrl(e.sources)) push(results, false, `capital_history[${i}] has no source URL.`);
    });
  }

  const cases = Array.isArray(data.core_product_cases) ? data.core_product_cases : [];
  if (!cases.length) {
    push(results, false, 'core_product_cases is empty.');
  }
  if (cases.length > 5) {
    push(results, false, 'core_product_cases has more than 5 items.', strict ? 'critical' : 'warning');
  }

  let hasCoreAnchor = false;
  cases.forEach((item, i) => {
    if (item.status === 'verified_core' || item.status === 'core_hypothesis') hasCoreAnchor = true;
    ['name', 'case_role', 'status', 'why_developed', 'original_pain'].forEach((key) => {
      if (!isNonEmpty(item[key])) push(results, false, `core_product_cases[${i}].${key} is missing.`);
    });
    if (!Array.isArray(item.development_difficulties) || !item.development_difficulties.some(evidenceOk)) {
      push(results, false, `core_product_cases[${i}] has no sourced development difficulty.`);
    }
    if (!Array.isArray(item.development_costs) || !item.development_costs.some(evidenceOk)) {
      push(results, false, `core_product_cases[${i}] has no sourced development cost signal or explicit not-calculable note.`);
    }
    if (!Array.isArray(item.commercialization_path) || item.commercialization_path.filter(evidenceOk).length < 2) {
      push(results, false, `core_product_cases[${i}] has fewer than 2 commercialization path evidence items.`);
    }
    const pricing = item.pricing_stack || {};
    ['product_price', 'accessory_service', 'subscription_software'].forEach((key) => {
      if (!evidenceOk(pricing[key])) push(results, false, `core_product_cases[${i}].pricing_stack.${key} is incomplete.`);
    });
    const competitors = Array.isArray(pricing.competitor_prices) ? pricing.competitor_prices : [];
    if (competitors.filter(evidenceOk).length < 2) {
      push(results, false, `core_product_cases[${i}] has fewer than 2 competitor price signals.`, strict ? 'critical' : 'warning');
    }
    if (!Array.isArray(item.return_evidence) || !item.return_evidence.some(evidenceOk)) {
      push(results, false, `core_product_cases[${i}] has no sourced return evidence.`);
    }
    const roi = item.roi_assessment || {};
    if (typeof roi.calculable !== 'boolean') push(results, false, `core_product_cases[${i}].roi_assessment.calculable must be boolean.`);
    if (!Array.isArray(roi.known_inputs) || !roi.known_inputs.some(evidenceOk)) {
      push(results, false, `core_product_cases[${i}].roi_assessment has no sourced known input.`);
    }
    if (!Array.isArray(roi.missing_inputs) || roi.missing_inputs.length < 2) {
      push(results, false, `core_product_cases[${i}].roi_assessment missing_inputs is too thin.`);
    }
    if (!isNonEmpty(roi.conclusion)) push(results, false, `core_product_cases[${i}].roi_assessment.conclusion is missing.`);
  });

  if (!hasCoreAnchor) {
    push(results, false, 'No core_product_case has status "verified_core" or "core_hypothesis".');
  }

  const recruitment = Array.isArray(data.recruitment_signals) ? data.recruitment_signals : [];
  if (!recruitment.length) {
    push(results, false, 'recruitment_signals is empty.');
  } else {
    recruitment.forEach((r, i) => {
      if (!isNonEmpty(r.signal) || !sourceOk(r.source) || !isNonEmpty(r.inferred_direction)) {
        push(results, false, `recruitment_signals[${i}] is incomplete.`);
      }
      if (!isNonEmpty(r.validation_needed)) {
        push(results, false, `recruitment_signals[${i}].validation_needed is missing.`);
      }
    });
  }

  const official = Array.isArray(data.official_site_signals) ? data.official_site_signals : [];
  if (official.length < 3) {
    push(results, false, 'official_site_signals has fewer than 3 items.', strict ? 'critical' : 'warning');
  }
  official.forEach((s, i) => {
    if (!isNonEmpty(s.signal) || !sourceOk(s.source) || !isNonEmpty(s.insight)) {
      push(results, false, `official_site_signals[${i}] is incomplete.`);
    }
  });

  const bets = Array.isArray(data.future_bets) ? data.future_bets : [];
  if (!bets.length) {
    push(results, false, 'future_bets is empty.');
  } else {
    bets.forEach((b, i) => {
      if (!isNonEmpty(b.bet) || !isNonEmpty(b.why_it_matters) || !isNonEmpty(b.watch_next)) {
        push(results, false, `future_bets[${i}] is incomplete.`);
      }
      if (!Array.isArray(b.supporting_signals) || b.supporting_signals.length < 2) {
        push(results, false, `future_bets[${i}] has fewer than 2 supporting signals.`, strict ? 'critical' : 'warning');
      }
    });
  }

  const sources = Array.isArray(data.sources) ? data.sources : [];
  if (sources.length < 8) {
    push(results, false, 'sources has fewer than 8 entries.', strict ? 'critical' : 'warning');
  }
  sources.forEach((s, i) => {
    if (!sourceOk(s)) push(results, false, `sources[${i}] is missing valid URL.`);
  });

  if (!results.some((r) => !r.pass)) {
    push(results, true, 'All entrepreneur case signals are present.', 'info');
  }

  return results;
}

function readCase(filePath) {
  const abs = resolveProject(filePath);
  return { abs, data: JSON.parse(fs.readFileSync(abs, 'utf8')) };
}

function checkFile(filePath, strict) {
  try {
    const { abs, data } = readCase(filePath);
    const allowTemplate = path.basename(abs).startsWith('_');
    return { file: abs, results: checkCase(data, { strict, allowTemplate }) };
  } catch (err) {
    return { file: filePath, results: [{ pass: false, level: 'critical', msg: 'Cannot read or parse JSON: ' + err.message }] };
  }
}

function format(file, results) {
  const critical = results.filter((r) => !r.pass && r.level === 'critical');
  const warnings = results.filter((r) => !r.pass && r.level === 'warning');
  const lines = [];
  lines.push('# Entrepreneur Case Check');
  lines.push('');
  lines.push('File: ' + file);
  lines.push('');
  lines.push('## Critical');
  lines.push(critical.length ? critical.map((r) => 'FAIL - ' + r.msg).join('\n') : 'PASS');
  lines.push('');
  lines.push('## Warnings');
  lines.push(warnings.length ? warnings.map((r) => 'WARNING - ' + r.msg).join('\n') : 'PASS');
  lines.push('');
  lines.push('## Result');
  if (critical.length) lines.push('FAIL');
  else if (warnings.length) lines.push('PASS with warnings');
  else lines.push('PASS');
  return lines.join('\n');
}

function listCaseFiles() {
  if (!fs.existsSync(CASES_DIR)) return [];
  return fs.readdirSync(CASES_DIR)
    .filter((name) => name.endsWith('.json') && !name.startsWith('_'))
    .map((name) => path.join(CASES_DIR, name));
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
  const files = args.all ? listCaseFiles() : (args.jsonPath ? [args.jsonPath] : []);
  if (!files.length) {
    console.error('[case-check] Provide a JSON file or --all.');
    return 2;
  }
  let failed = false;
  files.forEach((filePath, idx) => {
    const result = checkFile(filePath, args.strict);
    if (idx > 0) console.log('');
    console.log(format(result.file, result.results));
    const critical = result.results.some((r) => !r.pass && r.level === 'critical');
    const warnings = result.results.some((r) => !r.pass && r.level === 'warning');
    if (critical || (args.strict && warnings)) failed = true;
  });
  return failed ? 1 : 0;
}

if (require.main === module) {
  process.exit(main());
}

module.exports = { checkCase };
