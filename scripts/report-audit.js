/**
 * report-audit.js
 *
 * Scans existing HTML reports and GTM JSON files for missing research evidence:
 * pricing stacks, competitor pricing, founder profile links, capital history,
 * sources, and key report components.
 *
 * Usage:
 *   node scripts/report-audit.js
 *   node scripts/report-audit.js --out docs/report-gap-audit.md
 */

const fs = require('fs');
const path = require('path');
const { checkReport } = require('./report-check');

const ROOT = path.resolve(__dirname, '..');
const EXAMPLES_DIR = path.join(ROOT, 'examples');
const GTM_DIR = path.join(ROOT, 'data', 'gtm');
const REPORTS_DIR = path.join(ROOT, 'data', 'reports');
const DEFAULT_OUT = path.join(ROOT, 'docs', 'report-gap-audit.md');

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function bodyOf(html) {
  const m = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return m ? m[1] : html;
}

function stripTags(html) {
  return html.replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function countMatches(text, re) {
  const m = text.match(re);
  return m ? m.length : 0;
}

function slugFromReport(fileName) {
  return fileName.replace(/-report\.html$/i, '');
}

function deepText(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(deepText).join(' ');
  if (typeof value === 'object') return Object.values(value).map(deepText).join(' ');
  return String(value);
}

function hasHttpUrl(value) {
  return /https?:\/\//i.test(deepText(value));
}

function hasPlaceholder(value) {
  return /not_found|not found|not_disclosed|not disclosed|not_public|not public|unknown|google\.com\/search|placeholder/i.test(deepText(value));
}

function checkPass(ok) {
  return ok ? 'OK' : 'MISSING';
}

function severity(missingCount) {
  if (missingCount >= 6) return 'P0';
  if (missingCount >= 4) return 'P1';
  if (missingCount >= 2) return 'P2';
  return 'P3';
}

function auditHtmlReport(filePath) {
  const fileName = path.basename(filePath);
  const html = readText(filePath);
  const body = bodyOf(html);
  const text = stripTags(body);
  const lower = text.toLowerCase();

  const linkCount = countMatches(body, /<a\s+/gi);
  const tableCount = countMatches(body, /<table\b/gi);
  const sectionCount = countMatches(body, /class="[^"]*section/gi);

  const hasCover = /class="[^"]*section cover/.test(body);
  const hasSources = linkCount >= 5 || /sources|来源|参考资料/i.test(text);
  const hasFounder = /创始|founder|联合创始|CEO|首席/i.test(text);
  const hasFounderLink = hasFounder && /创始|founder|linkedin|official bio|team page|wikipedia|profile|履历|背景/i.test(text) && linkCount > 0;
  const hasCapital = /融资|估值|营收|收入|利润|亏损|损失|召回|IPO|funding|raised|valuation|revenue|profit|loss|burn/i.test(text);
  const hasCapitalTrail = hasCapital && /种子|天使|Series|轮|IPO|上市|收购|并购|召回|亏损|损失|烧钱|工厂|capex|first revenue|first order|founder cash|自筹|工作积蓄/i.test(text);
  const hasProduct = /产品|product|SKU|系统|平台|代表产品|核心产品/i.test(text);
  const hasPrice = /价格|售价|定价|MSRP|price|\$[\d]|¥|元\/|元|\/月|\/年|per month|per year|\/hr|hour/i.test(text);
  const hasAccessory = /配件|耗材|替换|电池|滤芯|墨盒|安装|维修|保修|服务费|accessory|consumable|parts|warranty|repair|installation|service fee/i.test(lower);
  const hasSubscription = /订阅|会员|月费|年费|SaaS|软件|云平台|RaaS|subscription|membership|software|cloud|per month|per year|\/月|\/年/i.test(text);
  const hasCompetitorPrice = /(竞品|竞争|竞对|vs|对比|competitor|compared)/i.test(text) && /(价格|售价|定价|MSRP|price|\$[\d]|¥|元)/i.test(text);
  const hasUnitEconomics = /毛利|毛利率|单位经济|成本|制造成本|部署成本|CAC|payback|回本|亏损|损失|gross margin|unit economics|cost/i.test(text);

  const checks = {
    noPlaceholderNoise: !hasPlaceholder(body),
    cover: hasCover,
    sources: hasSources,
    founderProfiles: hasFounderLink,
    capitalTrail: hasCapitalTrail,
    productCoverage: hasProduct,
    productPrice: hasPrice,
    accessoryServicePrice: hasAccessory,
    subscriptionSoftwareFee: hasSubscription,
    competitorPricing: hasCompetitorPrice,
    unitEconomics: hasUnitEconomics,
  };

  const missing = Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name);
  return {
    file: fileName,
    slug: slugFromReport(fileName),
    bytes: fs.statSync(filePath).size,
    tableCount,
    sectionCount,
    linkCount,
    checks,
    missing,
    severity: severity(missing.length),
  };
}

function auditGtmJson(filePath) {
  const fileName = path.basename(filePath);
  const raw = readText(filePath);
  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    return {
      file: fileName,
      slug: fileName.replace(/\.json$/i, ''),
      parseError: err.message,
      checks: {},
      missing: ['validJson'],
      severity: 'P0',
      productCount: 0,
      sourceCount: 0,
    };
  }

  const gtm = data.gtm_extension || {};
  const products = Array.isArray(gtm.top_products) ? gtm.top_products : [];
  const bc = data.brand_context || gtm.brand_context || {};
  const founderProfiles = bc.founder_profiles || bc.founders || bc.founder_background;
  const capitalHistory = bc.capital_history || bc.funding_history || bc.funding_or_capital_background;
  const sourceCount = Array.isArray(gtm.sources) ? gtm.sources.length : 0;

  const productPricingMissing = products.filter((p) => {
    const pricing = p && (p.pricing_model || p.price_stack || p.pricing);
    return !pricing || typeof pricing !== 'object';
  }).length;

  const pricingText = products.map((p) => deepText(p && (p.pricing_model || p.price_stack || p.pricing))).join(' ');
  const pricingKeys = products.map((p) => Object.keys((p && (p.pricing_model || p.price_stack || p.pricing)) || {}).join(' ')).join(' ');
  const combinedPricing = pricingText + ' ' + pricingKeys;

  const checks = {
    validJson: true,
    noPlaceholderNoise: !hasPlaceholder(data),
    brandContext: !!bc && Object.keys(bc).length > 0,
    founderProfilesWithLinks: hasHttpUrl(founderProfiles),
    capitalHistory: !!capitalHistory && /[$¥€£]|usd|rmb|cny|million|billion|万|亿|融资|营收|亏损|损失|烧钱|召回|ipo|valuation|revenue|loss|profit|burn|raise|raised|funding/i.test(deepText(capitalHistory)),
    topProducts: products.length > 0 && products.length <= 3,
    pricingModelAllProducts: products.length > 0 && productPricingMissing === 0,
    pricingSources: hasHttpUrl(combinedPricing),
    competitorPricing: /(competitor|vs|对比|竞品|竞对)/i.test(combinedPricing),
    subscriptionSoftwareFee: /(subscription|software|saas|app|会员|订阅|软件|raas|cloud)/i.test(combinedPricing),
    accessoryServicePrice: /(accessory|consumable|parts|配件|耗材|安装|service|warranty|repair|维护|保修)/i.test(combinedPricing),
    globalSources: sourceCount >= 8,
  };

  const missing = Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name);
  return {
    file: fileName,
    slug: fileName.replace(/\.json$/i, ''),
    productCount: products.length,
    productPricingMissing,
    sourceCount,
    checks,
    missing,
    severity: severity(missing.length),
  };
}

function auditBaseReportJson(filePath) {
  const fileName = path.basename(filePath);
  let data;
  try {
    data = JSON.parse(readText(filePath));
  } catch (err) {
    return {
      file: fileName,
      slug: fileName.replace(/\.json$/i, ''),
      checks: {},
      missing: ['validJson'],
      severity: 'P0',
      criticalCount: 1,
      warningCount: 0,
      sourceCount: 0,
    };
  }

  const results = checkReport(data, { strict: false });
  const critical = results.filter((r) => !r.pass && r.level === 'critical');
  const warnings = results.filter((r) => !r.pass && r.level === 'warning');
  const missing = critical.concat(warnings).map((r) => r.msg.replace(/\|/g, '/'));
  const sources = Array.isArray(data.sources) ? data.sources : [];

  return {
    file: fileName,
    slug: fileName.replace(/\.json$/i, ''),
    checks: {},
    missing,
    severity: critical.length ? 'P0' : severity(warnings.length),
    criticalCount: critical.length,
    warningCount: warnings.length,
    sourceCount: sources.length,
  };
}

function markdownTable(rows, headers) {
  if (!rows.length) return '_None._';
  const line = '| ' + headers.join(' | ') + ' |';
  const sep = '| ' + headers.map(() => '---').join(' | ') + ' |';
  const body = rows.map((row) => '| ' + row.join(' | ') + ' |').join('\n');
  return [line, sep, body].join('\n');
}

function renderReport(htmlAudits, jsonAudits, reportJsonAudits) {
  const now = new Date().toISOString().slice(0, 10);
  const p0Html = htmlAudits.filter((a) => a.severity === 'P0').length;
  const p1Html = htmlAudits.filter((a) => a.severity === 'P1').length;
  const p0Json = jsonAudits.filter((a) => a.severity === 'P0').length;
  const p1Json = jsonAudits.filter((a) => a.severity === 'P1').length;
  const p0ReportJson = reportJsonAudits.filter((a) => a.severity === 'P0').length;
  const p1ReportJson = reportJsonAudits.filter((a) => a.severity === 'P1').length;

  const htmlRows = htmlAudits.map((a) => [
    a.severity,
    '`' + a.file + '`',
    String(a.tableCount),
    String(a.linkCount),
    a.missing.length ? a.missing.join(', ') : 'OK',
  ]);

  const jsonRows = jsonAudits.map((a) => [
    a.severity,
    '`' + a.file + '`',
    String(a.productCount),
    String(a.sourceCount),
    a.missing.length ? a.missing.join(', ') : 'OK',
  ]);

  const reportJsonRows = reportJsonAudits.map((a) => [
    a.severity,
    '`' + a.file + '`',
    String(a.sourceCount),
    String(a.criticalCount),
    String(a.warningCount),
    a.missing.length ? a.missing.join('<br>') : 'OK',
  ]);

  const missingFrequency = {};
  for (const a of [...htmlAudits, ...jsonAudits, ...reportJsonAudits]) {
    for (const m of a.missing) missingFrequency[m] = (missingFrequency[m] || 0) + 1;
  }
  const freqRows = Object.entries(missingFrequency)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ['`' + name + '`', String(count)]);

  return [
    '# Report Gap Audit',
    '',
    'Generated: ' + now,
    '',
    'This audit is heuristic. It checks whether reports contain the required evidence signals; it does not verify factual correctness.',
    '',
    '## Summary',
    '',
    '- Base HTML reports scanned: ' + htmlAudits.length,
    '- Base report JSON files scanned: ' + reportJsonAudits.length,
    '- GTM JSON files scanned: ' + jsonAudits.length,
    '- Base reports needing urgent content repair: P0=' + p0Html + ', P1=' + p1Html,
    '- Base report JSON needing urgent content repair: P0=' + p0ReportJson + ', P1=' + p1ReportJson,
    '- GTM JSON needing urgent content repair: P0=' + p0Json + ', P1=' + p1Json,
    '',
    'Severity rule: P0 = 6+ missing signals, P1 = 4-5, P2 = 2-3, P3 = 0-1.',
    '',
    '## Missing Signal Frequency',
    '',
    markdownTable(freqRows, ['Missing Signal', 'Files']),
    '',
    '## Base HTML Reports',
    '',
    markdownTable(htmlRows, ['Severity', 'Report', 'Tables', 'Links', 'Missing Signals']),
    '',
    '## GTM JSON Files',
    '',
    markdownTable(jsonRows, ['Severity', 'JSON', 'Products', 'Sources', 'Missing Signals']),
    '',
    '## Base Report JSON Files',
    '',
    markdownTable(reportJsonRows, ['Severity', 'JSON', 'Sources', 'Critical', 'Warnings', 'Missing Signals']),
    '',
    '## Repair Principle',
    '',
    '1. Only add facts that have reliable sources. Do not write placeholders such as `not_found`, `unknown`, or search-result URLs into reports.',
    '2. Missing signals stay in this audit until they are researched and sourced.',
    '3. When a GTM JSON changes, regenerate the matching `examples/*-report-gtm.html` from the clean base report.',
    '4. If a base HTML report lacks founder links, prices, or capital trail, deeply revise the relevant body section instead of appending a generic patch block.',
    '5. New base reports should be created as `data/reports/<slug>.json`, checked with `node scripts/report-check.js`, and rendered with `node scripts/report-render.js`.',
    '6. Re-run `node scripts/report-audit.js`, `node scripts/gtm-check.js <json>`, `node scripts/report-check.js <json>`, and `node scripts/generated-inventory.js` after every repair pass.',
    '',
  ].join('\n');
}

function parseArgs(argv) {
  let out = DEFAULT_OUT;
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--out' && argv[i + 1]) {
      out = path.resolve(ROOT, argv[++i]);
    } else if (argv[i] === '--help' || argv[i] === '-h') {
      console.log('Usage: node scripts/report-audit.js [--out docs/report-gap-audit.md]');
      process.exit(0);
    }
  }
  return { out };
}

function main() {
  const { out } = parseArgs(process.argv);

  const htmlFiles = fs.readdirSync(EXAMPLES_DIR)
    .filter((f) => f.endsWith('-report.html'))
    .filter((f) => !f.includes('-gtm'))
    .sort()
    .map((f) => path.join(EXAMPLES_DIR, f));

  const jsonFiles = fs.readdirSync(GTM_DIR)
    .filter((f) => f.endsWith('.json'))
    .filter((f) => !f.startsWith('_template'))
    .sort()
    .map((f) => path.join(GTM_DIR, f));

  const reportJsonFiles = fs.existsSync(REPORTS_DIR)
    ? fs.readdirSync(REPORTS_DIR)
      .filter((f) => f.endsWith('.json'))
      .filter((f) => !f.startsWith('_'))
      .sort()
      .map((f) => path.join(REPORTS_DIR, f))
    : [];

  const htmlAudits = htmlFiles.map(auditHtmlReport).sort((a, b) => {
    const sev = { P0: 0, P1: 1, P2: 2, P3: 3 };
    return sev[a.severity] - sev[b.severity] || a.file.localeCompare(b.file);
  });
  const jsonAudits = jsonFiles.map(auditGtmJson).sort((a, b) => {
    const sev = { P0: 0, P1: 1, P2: 2, P3: 3 };
    return sev[a.severity] - sev[b.severity] || a.file.localeCompare(b.file);
  });
  const reportJsonAudits = reportJsonFiles.map(auditBaseReportJson).sort((a, b) => {
    const sev = { P0: 0, P1: 1, P2: 2, P3: 3 };
    return sev[a.severity] - sev[b.severity] || a.file.localeCompare(b.file);
  });

  const md = renderReport(htmlAudits, jsonAudits, reportJsonAudits);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, md, 'utf8');

  console.log('[report-audit] Wrote ' + path.relative(ROOT, out));
  console.log('[report-audit] HTML reports: ' + htmlAudits.length + ', Base JSON: ' + reportJsonAudits.length + ', GTM JSON: ' + jsonAudits.length);
}

main();
