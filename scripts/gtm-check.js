/**
 * gtm-check.js
 *
 * Lightweight quality check for GTM extension JSON files.
 * Checks structure completeness, minimum content, English-source signals,
 * pricing depth, founder profile links, and capital-history signals.
 * Does NOT perform fact-checking, scraping, or audit.
 *
 * Usage:
 *   node scripts/gtm-check.js <json-file>                  → standard check
 *   node scripts/gtm-check.js <json-file> --strict         → warnings become errors
 *   node scripts/gtm-check.js <json-file> --require-brand-context  → check brand_context
 *   node scripts/gtm-check.js --help                       → show help
 *
 * Zero dependencies. Node.js native modules only.
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// HELPERS
// ============================================================================

function isNonEmpty(val) {
  if (val == null) return false;
  if (typeof val === 'string') return val.trim().length > 0;
  if (Array.isArray(val)) return val.length > 0 && val.some(isNonEmpty);
  if (typeof val === 'object') return Object.keys(val).length > 0 && Object.values(val).some(isNonEmpty);
  return true;
}

function countNonEmpty(obj) {
  if (!obj || typeof obj !== 'object') return 0;
  return Object.values(obj).filter(isNonEmpty).length;
}

function countEnglishChars(str) {
  if (typeof str !== 'string') return 0;
  return (str.match(/[a-zA-Z]/g) || []).length;
}

function countChineseChars(str) {
  if (typeof str !== 'string') return 0;
  return (str.match(/[一-鿿]/g) || []).length;
}

function deepText(val) {
  if (val == null) return '';
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) return val.map(deepText).join(' ');
  if (typeof val === 'object') return Object.values(val).map(deepText).join(' ');
  return String(val);
}

function hasHttpUrl(val) {
  return /https?:\/\//i.test(deepText(val));
}

function hasPlaceholder(val) {
  return /not_found|not found|not_disclosed|not disclosed|not_public|not public|unknown|google\.com\/search|placeholder/i.test(deepText(val));
}

function getBrandContext(data) {
  return (data && data.brand_context) || (data && data.gtm_extension && data.gtm_extension.brand_context) || null;
}

// ============================================================================
// CHECK FUNCTIONS — each returns { pass, msg, level }
// level: 'critical' | 'warning' | 'suggestion'
// ============================================================================

function checkStructure(data) {
  const results = [];

  if (!data || typeof data !== 'object') {
    results.push({ pass: false, msg: 'JSON root is not an object.', level: 'critical' });
    return results;
  }

  const checks = [
    ['brand', data.brand],
    ['brand_slug', data.brand_slug],
    ['gtm_extension', data.gtm_extension],
  ];

  for (const [name, val] of checks) {
    if (!isNonEmpty(val)) {
      results.push({ pass: false, msg: 'Missing required field: ' + name, level: 'critical' });
    }
  }

  if (!data.gtm_extension || typeof data.gtm_extension !== 'object') {
    results.push({ pass: false, msg: 'gtm_extension is not an object.', level: 'critical' });
    return results;
  }

  const gtm = data.gtm_extension;

  const gtmChecks = [
    ['gtm_extension.summary', gtm.summary],
    ['gtm_extension.channel_path', gtm.channel_path],
    ['gtm_extension.channels', gtm.channels],
    ['gtm_extension.business_model', gtm.business_model],
    ['gtm_extension.top_products', gtm.top_products],
    ['gtm_extension.learning_summary', gtm.learning_summary],
    ['gtm_extension.sources', gtm.sources],
  ];

  for (const [name, val] of gtmChecks) {
    if (!isNonEmpty(val)) {
      results.push({ pass: false, msg: 'Missing required field: ' + name, level: 'critical' });
    }
  }

  if (!Array.isArray(gtm.channel_path)) {
    results.push({ pass: false, msg: 'gtm_extension.channel_path is not an array.', level: 'critical' });
  }
  if (!Array.isArray(gtm.top_products)) {
    results.push({ pass: false, msg: 'gtm_extension.top_products is not an array.', level: 'critical' });
  }
  if (!Array.isArray(gtm.sources)) {
    results.push({ pass: false, msg: 'gtm_extension.sources is not an array.', level: 'critical' });
  }

  return results;
}

function checkTopProducts(gtm) {
  const results = [];
  const products = gtm.top_products;
  if (!Array.isArray(products)) return results;

  if (products.length === 0) {
    results.push({ pass: false, msg: 'top_products is empty — must have 1-3 products.', level: 'critical' });
    return results;
  }

  if (products.length > 3) {
    results.push({ pass: false, msg: 'top_products has ' + products.length + ' products — maximum is 3.', level: 'critical' });
  }

  const requiredSections = [
    'why_selected',
    'origin_story',
    'pre_market',
    'innovation',
    'breakout',
    'customer_impact',
    'ecosystem_impact',
    'lessons',
    'sources',
  ];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    if (!p || typeof p !== 'object') {
      results.push({ pass: false, msg: 'top_products[' + i + '] is not an object.', level: 'critical' });
      continue;
    }

    // Name
    if (!isNonEmpty(p.name)) {
      results.push({ pass: false, msg: 'top_products[' + i + '].name is empty.', level: 'critical' });
    }

    // Required sections
    for (const sec of requiredSections) {
      if (!p[sec] || (typeof p[sec] === 'string' && !isNonEmpty(p[sec]))) {
        results.push({ pass: false, msg: 'top_products[' + i + '] missing section: ' + sec, level: 'warning' });
      }
    }

    // Lessons
    const lessons = p.lessons;
    if (lessons && typeof lessons === 'object') {
      const wtl = lessons.what_to_learn;
      if (!Array.isArray(wtl) || wtl.filter(isNonEmpty).length < 3) {
        results.push({ pass: false, msg: 'top_products[' + i + '].lessons.what_to_learn has fewer than 3 items.', level: 'warning' });
      }
      const dcb = lessons.do_not_copy_blindly;
      if (!Array.isArray(dcb) || dcb.filter(isNonEmpty).length < 2) {
        results.push({ pass: false, msg: 'top_products[' + i + '].lessons.do_not_copy_blindly has fewer than 2 items.', level: 'warning' });
      }
    }

    // Product sources
    const ps = p.sources;
    if (Array.isArray(ps)) {
      if (ps.length < 2) {
        results.push({ pass: false, msg: 'top_products[' + i + '].sources has fewer than 2 items.', level: 'warning' });
      }
    }

    // Confidence
    if (isNonEmpty(p.confidence)) {
      const conf = p.confidence.toLowerCase();
      if (!['high', 'medium', 'low'].includes(conf)) {
        results.push({ pass: false, msg: 'top_products[' + i + '].confidence is not high/medium/low: ' + p.confidence, level: 'warning' });
      }
    }
  }

  return results;
}

function checkQuality(gtm) {
  const results = [];

  // Summary length (Chinese chars)
  const summary = gtm.summary || '';
  const cnCount = countChineseChars(summary);
  if (cnCount < 80 && summary.length < 200) {
    results.push({ pass: false, msg: 'summary may be too short (' + cnCount + ' Chinese chars, ' + summary.length + ' total chars). Min 80 Chinese chars recommended.', level: 'warning' });
  }

  // Channel path
  const cp = gtm.channel_path;
  if (Array.isArray(cp) && cp.filter(isNonEmpty).length < 4) {
    results.push({ pass: false, msg: 'channel_path has fewer than 4 steps.', level: 'warning' });
  }

  // Channels
  const chCount = gtm.channels && typeof gtm.channels === 'object' ? countNonEmpty(gtm.channels) : 0;
  if (chCount < 5) {
    results.push({ pass: false, msg: 'channels has only ' + chCount + ' non-empty fields (min 5).', level: 'warning' });
  }

  // Business model
  const bmCount = gtm.business_model && typeof gtm.business_model === 'object' ? countNonEmpty(gtm.business_model) : 0;
  if (bmCount < 3) {
    results.push({ pass: false, msg: 'business_model has only ' + bmCount + ' non-empty fields (min 3).', level: 'warning' });
  }

  // Global sources
  const gs = gtm.sources;
  if (Array.isArray(gs)) {
    if (gs.length < 5) {
      results.push({ pass: false, msg: 'global sources has fewer than 5 items (' + gs.length + ').', level: 'warning' });
    } else if (gs.length < 8) {
      results.push({ pass: false, msg: 'global sources has ' + gs.length + ' items — consider adding more (recommended 8+).', level: 'suggestion' });
    }
  }

  return results;
}

function checkEnglishSources(gtm) {
  const results = [];
  const sources = (gtm && gtm.sources) || [];
  if (!Array.isArray(sources)) return results;

  let engSignal = 0;

  for (const s of sources) {
    if (!s || typeof s !== 'object') continue;
    const title = (s.title || '').toLowerCase();
    const url = (s.url || '').toLowerCase();
    const sourceType = (s.source_type || '').toLowerCase();

    // URL starts with http
    if (url.startsWith('http')) engSignal++;

    // Title contains significant English
    if (countEnglishChars(s.title || '') > 20) engSignal++;
  }

  // Also check product sources
  const products = (gtm && gtm.top_products) || [];
  for (const p of products) {
    if (!p || !Array.isArray(p.sources)) continue;
    for (const s of p.sources) {
      if (!s || typeof s !== 'object') continue;
      const url = (s.url || '').toLowerCase();
      if (url.startsWith('http')) engSignal++;
    }
  }

  if (engSignal < 3) {
    results.push({
      pass: false,
      msg: 'English-first source signal is weak (' + engSignal + ' signals). For US/global brands, consider adding official English sources.',
      level: 'warning',
    });
  }

  return results;
}

function checkBrandContext(data, requireBrandContext) {
  const results = [];
  if (!requireBrandContext) return results;

  const bc = getBrandContext(data);
  if (!bc || typeof bc !== 'object') {
    results.push({ pass: false, msg: 'brand_context not found. Use --require-brand-context to enforce.', level: 'warning' });
    return results;
  }

  if (!isNonEmpty(bc.founder_background)) {
    results.push({ pass: false, msg: 'brand_context.founder_background is empty.', level: 'warning' });
  }
  if (!isNonEmpty(bc.brand_timeline)) {
    results.push({ pass: false, msg: 'brand_context.brand_timeline is empty.', level: 'warning' });
  }

  return results;
}

function checkResearchEvidenceDepth(data) {
  const results = [];
  const gtm = (data && data.gtm_extension) || {};
  const bc = getBrandContext(data);
  const products = Array.isArray(gtm.top_products) ? gtm.top_products : [];

  if (!bc || typeof bc !== 'object') {
    results.push({
      pass: false,
      msg: 'brand_context is missing. Add founder profiles, verified links, and capital_history so the base report can cite founder background and money events.',
      level: 'warning',
    });
  } else {
    const founderProfiles = bc.founder_profiles || bc.founders || bc.founder_background;
    if (!hasHttpUrl(founderProfiles)) {
      results.push({
        pass: false,
        msg: 'brand_context founder info has no explicit URL. Add founder profile links such as LinkedIn, official bio, company page, Wikipedia, SEC filing, podcast/interview, or credible media profile.',
        level: 'warning',
      });
    }

    const capitalHistory = bc.capital_history || bc.funding_history || bc.funding_or_capital_background;
    if (!isNonEmpty(capitalHistory)) {
      results.push({
        pass: false,
        msg: 'brand_context.capital_history is missing. Add chronological money events: founder cash, first revenue, spend/burn, funding rounds, losses, recalls, write-downs, exits, or IPO proceeds.',
        level: 'warning',
      });
    } else {
      const capitalText = deepText(capitalHistory).toLowerCase();
      const hasMoneySignal = /[$¥€£]|usd|rmb|cny|million|billion|万|亿|融资|营收|亏损|损失|烧钱|召回|ipo|valuation|revenue|loss|profit|burn|raise|raised|funding/.test(capitalText);
      if (!hasMoneySignal) {
        results.push({
          pass: false,
          msg: 'brand_context.capital_history exists but has weak money-event detail. Include concrete sourced amounts, or omit the event and leave it for the audit queue.',
          level: 'warning',
        });
      }
    }
  }

  for (let i = 0; i < products.length; i++) {
    const p = products[i] || {};
    const pricing = p.pricing_model || p.price_stack || p.pricing;
    if (!pricing || typeof pricing !== 'object') {
      results.push({
        pass: false,
        msg: 'top_products[' + i + '] missing pricing_model. Include sourced product price, accessory/consumables price, software/subscription fee, service fee, and competitor price comparison when available.',
        level: 'warning',
      });
      continue;
    }

    const pricingText = deepText(pricing).toLowerCase();
    const pricingKeys = Object.keys(pricing).join(' ').toLowerCase();
    const combined = pricingText + ' ' + pricingKeys;
    if (!/(competitor|vs|对比|竞品)/i.test(combined)) {
      results.push({
        pass: false,
        msg: 'top_products[' + i + '].pricing_model has no competitor price comparison signal.',
        level: 'warning',
      });
    }
    if (!/(subscription|software|saas|app|会员|订阅|软件|raas)/i.test(combined)) {
      results.push({
        pass: false,
        msg: 'top_products[' + i + '].pricing_model has no sourced software/subscription/RaaS fee signal.',
        level: 'warning',
      });
    }
    if (!/(accessory|consumable|parts|配件|耗材|安装|service|warranty|repair|维护|保修)/i.test(combined)) {
      results.push({
        pass: false,
        msg: 'top_products[' + i + '].pricing_model has no sourced accessory/consumables/service fee signal.',
        level: 'warning',
      });
    }
    if (!hasHttpUrl(pricing.sources || pricing)) {
      results.push({
        pass: false,
        msg: 'top_products[' + i + '].pricing_model has no pricing source URL. Add official store, marketplace, filing, pricing page, review, or credible media source.',
        level: 'warning',
      });
    }
    if (hasPlaceholder(pricing)) {
      results.push({
        pass: false,
        msg: 'top_products[' + i + '].pricing_model contains placeholder text. Remove not_found/unknown/search placeholders from report data; missing facts belong in the audit queue.',
        level: 'warning',
      });
    }
  }

  return results;
}

// ============================================================================
// OUTPUT
// ============================================================================

function printReport(filePath, data, allResults, strict) {
  const gtm = (data && data.gtm_extension) || {};
  const products = gtm.top_products || [];
  const globalSources = gtm.sources || [];

  console.log('# GTM JSON Check');
  console.log('');
  console.log('File: ' + filePath);
  console.log('Brand: ' + (data.brand || 'N/A'));
  console.log('Slug: ' + (data.brand_slug || 'N/A'));
  console.log('Products: ' + products.length);
  console.log('Global sources: ' + globalSources.length);
  console.log('');

  const criticals = allResults.filter((r) => r.level === 'critical');
  const warnings = allResults.filter((r) => r.level === 'warning');
  const suggestions = allResults.filter((r) => r.level === 'suggestion');

  // Critical
  console.log('## Critical');
  if (criticals.length === 0) {
    console.log('PASS');
  } else {
    for (const r of criticals) {
      console.log('FAIL — ' + r.msg);
    }
  }
  console.log('');

  // Warnings
  console.log('## Warnings');
  if (warnings.length === 0) {
    console.log('PASS');
  } else {
    for (const r of warnings) {
      console.log('WARNING — ' + r.msg);
    }
  }
  console.log('');

  // Suggestions
  if (suggestions.length > 0) {
    console.log('## Suggestions');
    for (const r of suggestions) {
      console.log('SUGGEST — ' + r.msg);
    }
    console.log('');
  }

  // Result
  console.log('## Result');
  const hasCritical = criticals.filter((r) => !r.pass).length > 0;
  const hasWarning = warnings.filter((r) => !r.pass).length > 0;

  if (hasCritical) {
    console.log('FAIL');
    return 1;
  } else if (strict && hasWarning) {
    console.log('FAIL (strict mode — warnings treated as errors)');
    return 1;
  } else if (hasWarning) {
    console.log('PASS with warnings');
    return 0;
  } else {
    console.log('PASS');
    return 0;
  }
}

// ============================================================================
// CLI & MAIN
// ============================================================================

function showHelp() {
  console.log([
    'gtm-check.js — Lightweight quality check for GTM extension JSON files.',
    '',
    'Checks structure completeness, minimum content, English-source signals, pricing depth, founder links, and capital-history signals.',
    'Does NOT perform fact-checking, scraping, or audit.',
    '',
    'Usage:',
    '  node scripts/gtm-check.js <json-file>                  → standard check',
    '  node scripts/gtm-check.js <json-file> --strict         → warnings become errors',
    '  node scripts/gtm-check.js <json-file> --require-brand-context  → check brand_context',
    '  node scripts/gtm-check.js --help                       → show help',
    '',
    'Exit codes:',
    '  0 — PASS or PASS with warnings (non-strict mode)',
    '  1 — FAIL (critical errors, or warnings in strict mode)',
    '',
    'Examples:',
    '  node scripts/gtm-check.js data/gtm/anker.json',
    '  node scripts/gtm-check.js data/gtm/anker.json --strict',
  ].join('\n'));
}

function main(argv) {
  let jsonPath = null;
  let strict = false;
  let requireBrandContext = false;

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') {
      showHelp();
      process.exit(0);
    } else if (a === '--strict') {
      strict = true;
    } else if (a === '--require-brand-context') {
      requireBrandContext = true;
    } else if (a.startsWith('-')) {
      console.error('[gtm-check] Unknown option: ' + a);
      process.exit(1);
    } else if (!jsonPath) {
      jsonPath = a;
    }
  }

  if (!jsonPath) {
    console.error('[gtm-check] Missing JSON file path.');
    console.error('Run with --help for usage.');
    process.exit(1);
  }

  // Read file
  let raw;
  try {
    raw = fs.readFileSync(jsonPath, 'utf-8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error('[gtm-check] File not found: ' + jsonPath);
    } else {
      console.error('[gtm-check] Cannot read file: ' + jsonPath);
    }
    process.exit(1);
  }

  // Parse JSON
  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    console.error('[gtm-check] Invalid JSON: ' + err.message);
    process.exit(1);
  }

  // Run all checks
  const allResults = [
    ...checkStructure(data),
    ...checkTopProducts(data.gtm_extension || {}),
    ...checkQuality(data.gtm_extension || {}),
    ...checkEnglishSources(data.gtm_extension || {}),
    ...checkBrandContext(data, requireBrandContext),
    ...checkResearchEvidenceDepth(data),
  ];

  const exitCode = printReport(jsonPath, data, allResults, strict);
  process.exit(exitCode);
}

main(process.argv);
