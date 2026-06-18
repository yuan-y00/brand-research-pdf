/**
 * report-render.js
 *
 * Renders structured base report JSON into a static HTML report using
 * templates/report.html and theme/brand-research-theme.css.
 *
 * Usage:
 *   node scripts/report-render.js data/reports/anker.json
 *   node scripts/report-render.js data/reports/anker.json --out examples/anker-report.html
 *   node scripts/report-render.js data/reports/anker.json --out examples/anker-report.html --force
 *   node scripts/report-render.js data/reports/anker.json --check
 *   node scripts/report-render.js --help
 */

const fs = require('fs');
const path = require('path');
const { checkReport } = require('./report-check');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DEFAULT_TEMPLATE = 'templates/report.html';

function parseArgs(argv) {
  const args = {
    jsonPath: null,
    outPath: null,
    templatePath: DEFAULT_TEMPLATE,
    force: false,
    check: false,
    strict: false,
    dryRun: false,
    help: false,
    errors: [],
  };

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') args.help = true;
    else if (a === '--out') {
      if (i + 1 >= argv.length) args.errors.push('[report-render] Missing path after --out.');
      else args.outPath = argv[++i];
    } else if (a === '--template') {
      if (i + 1 >= argv.length) args.errors.push('[report-render] Missing path after --template.');
      else args.templatePath = argv[++i];
    } else if (a === '--force') args.force = true;
    else if (a === '--check') args.check = true;
    else if (a === '--strict') args.strict = true;
    else if (a === '--dry-run') args.dryRun = true;
    else if (a.startsWith('-')) args.errors.push('[report-render] Unknown option: ' + a);
    else if (!args.jsonPath) args.jsonPath = a;
    else args.errors.push('[report-render] Unexpected argument: ' + a);
  }

  return args;
}

function showHelp() {
  console.log([
    'report-render.js — Render structured base report JSON into HTML.',
    '',
    'Usage:',
    '  node scripts/report-render.js <json-file> [--out <file>] [--force] [--check] [--strict]',
    '  node scripts/report-render.js --help',
    '',
    'Options:',
    '  --out <file>       Output HTML path. Default: examples/<slug>-report.html',
    '  --template <file>  HTML shell template. Default: templates/report.html',
    '  --force            Overwrite output file if it exists.',
    '  --check            Run report-check before rendering.',
    '  --strict           Used with --check; warnings fail the render.',
    '  --dry-run          Print resolved paths without writing.',
    '  --help             Show this help text.',
  ].join('\n'));
}

function resolveProject(p) {
  return path.isAbsolute(p) ? p : path.join(PROJECT_ROOT, p);
}

function htmlEscape(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function attr(value) {
  return htmlEscape(value).replace(/`/g, '&#96;');
}

function isNonEmpty(val) {
  if (val == null) return false;
  if (typeof val === 'string') return val.trim().length > 0;
  if (Array.isArray(val)) return val.length > 0 && val.some(isNonEmpty);
  if (typeof val === 'object') return Object.keys(val).length > 0 && Object.values(val).some(isNonEmpty);
  return true;
}

function asArray(val) {
  return Array.isArray(val) ? val : [];
}

function link(label, url) {
  if (!url) return htmlEscape(label || '');
  return `<a href="${attr(url)}" target="_blank" rel="noopener">${htmlEscape(label || url)}</a>`;
}

function money(item) {
  if (!item) return '';
  const period = item.period ? '/' + item.period : '';
  return [item.currency, item.amount].filter(Boolean).join(' ') + period;
}

function confidenceBadge(level) {
  const value = String(level || 'medium').toLowerCase();
  const cls = value === 'high' ? 'high' : value === 'low' ? 'low' : 'medium';
  return `<span class="br-confidence br-confidence-${cls}">${htmlEscape(value)}</span>`;
}

function renderCover(data) {
  const bc = data.brand_context || {};
  const cover = data.cover || {};
  const stats = asArray(cover.stats).slice(0, 4);
  return [
    '<div class="br-cover">',
    '  <div>',
    `    <div class="br-cover-label">${htmlEscape(cover.label || 'Brand Research')}</div>`,
    `    <div class="br-cover-title">${htmlEscape(cover.title || bc.brand_name || 'Brand Report')}</div>`,
    '    <div class="br-cover-line"></div>',
    `    <div class="br-cover-subtitle">${htmlEscape(cover.subtitle || bc.one_line || '')}</div>`,
    '  </div>',
    '  <div class="br-stat-row">',
    stats.map((s) => [
      '    <div class="br-stat-card">',
      `      <div class="br-stat-number">${htmlEscape(s.value || '')}</div>`,
      `      <div class="br-stat-label">${htmlEscape(s.label || '')}</div>`,
      '    </div>',
    ].join('\n')).join('\n'),
    '  </div>',
    '</div>',
  ].join('\n');
}

function renderFounderSection(data) {
  const bc = data.brand_context || {};
  const rows = asArray(bc.founder_profiles).map((f) => {
    const links = asArray(f.links).map((l) => link(l.label, l.url)).join(' / ');
    return `<tr><td><strong>${htmlEscape(f.name)}</strong><br>${htmlEscape(f.role || '')}</td><td>${htmlEscape(f.summary || '')}</td><td>${links}</td><td>${confidenceBadge(f.confidence)}</td></tr>`;
  });

  const capitalRows = asArray(bc.capital_history).map((e) => {
    const sources = asArray(e.sources).map((s) => link(s.label, s.url)).join(' / ');
    return `<tr><td>${htmlEscape(e.date || '')}</td><td>${htmlEscape(e.event_type || '')}</td><td>${htmlEscape(money(e) || '')}</td><td>${htmlEscape(e.description || '')}</td><td>${sources}</td><td>${confidenceBadge(e.confidence)}</td></tr>`;
  });

  return [
    '<section class="br-section">',
    '<div class="br-section-label">Founder & Capital</div>',
    '<h1>一、创始人履历与资金路径</h1>',
    `<p>${htmlEscape(bc.one_line || '')}</p>`,
    '<h2>创始人履历</h2>',
    '<table class="br-table"><thead><tr><th>人物</th><th>履历摘要</th><th>来源</th><th>可信度</th></tr></thead><tbody>',
    rows.join('\n'),
    '</tbody></table>',
    '<h2>资本轨迹</h2>',
    '<table class="br-table"><thead><tr><th>时间</th><th>类型</th><th>金额</th><th>事件</th><th>来源</th><th>可信度</th></tr></thead><tbody>',
    capitalRows.join('\n'),
    '</tbody></table>',
    '</section>',
  ].join('\n');
}

function renderPricingSection(data) {
  const products = asArray(data.pricing && data.pricing.products);
  const boundary = (data.pricing && data.pricing.boundary_notes) || {};

  const productBlocks = products.map((p, idx) => {
    const rows = [];
    if (p.product_price) rows.push(['产品本体', p.product_price]);
    if (p.bundle_price) rows.push(['套装/Bundle', p.bundle_price]);
    asArray(p.accessories).forEach((x) => rows.push(['配件/耗材', x]));
    asArray(p.services).forEach((x) => rows.push(['服务/安装/保修', x]));
    asArray(p.subscriptions).forEach((x) => rows.push(['订阅/软件', x]));

    const priceRows = rows.map(([type, item]) => `<tr><td>${htmlEscape(type)}</td><td>${htmlEscape(item.label || '')}</td><td>${htmlEscape(money(item))}</td><td>${htmlEscape(item.notes || '')}</td><td>${link(item.source && item.source.label, item.source && item.source.url)}</td></tr>`);

    const competitorRows = asArray(p.competitors).map((c) => `<tr><td>${htmlEscape(c.brand || '')}</td><td>${htmlEscape(c.product || '')}</td><td>${htmlEscape(money(c.price))}</td><td>${htmlEscape(c.notes || '')}</td><td>${link(c.price && c.price.source && c.price.source.label, c.price && c.price.source && c.price.source.url)}</td></tr>`);

    return [
      `<div class="br-product-card"><div class="br-product-rank">${idx + 1}</div>`,
      `<h3>${htmlEscape(p.name || '')}</h3>`,
      p.category ? `<p>${htmlEscape(p.category)}</p>` : '',
      '<h4>价格栈</h4>',
      '<table class="br-table"><thead><tr><th>类型</th><th>项目</th><th>价格</th><th>说明</th><th>来源</th></tr></thead><tbody>',
      priceRows.join('\n'),
      '</tbody></table>',
      '<h4>竞品价格</h4>',
      '<table class="br-table"><thead><tr><th>竞品</th><th>产品</th><th>价格</th><th>说明</th><th>来源</th></tr></thead><tbody>',
      competitorRows.join('\n'),
      '</tbody></table>',
      '</div>',
    ].filter(Boolean).join('\n');
  });

  const boundaryNotes = [];
  if (boundary.accessory_service) boundaryNotes.push(`<li><strong>${htmlEscape(boundary.accessory_service.label)}:</strong> ${htmlEscape(boundary.accessory_service.value)} ${link(boundary.accessory_service.source && boundary.accessory_service.source.label, boundary.accessory_service.source && boundary.accessory_service.source.url)}</li>`);
  if (boundary.subscription_software) boundaryNotes.push(`<li><strong>${htmlEscape(boundary.subscription_software.label)}:</strong> ${htmlEscape(boundary.subscription_software.value)} ${link(boundary.subscription_software.source && boundary.subscription_software.source.label, boundary.subscription_software.source && boundary.subscription_software.source.url)}</li>`);

  return [
    '<section class="br-section">',
    '<div class="br-section-label">Pricing</div>',
    '<h1>二、产品、配件、订阅与竞品价格</h1>',
    boundaryNotes.length ? `<div class="br-callout"><ul>${boundaryNotes.join('\n')}</ul></div>` : '',
    productBlocks.join('\n'),
    '</section>',
  ].join('\n');
}

function renderTableBlock(block) {
  const headers = asArray(block.headers);
  const rows = asArray(block.rows);
  return [
    '<table class="br-table"><thead><tr>',
    headers.map((h) => `<th>${htmlEscape(h)}</th>`).join(''),
    '</tr></thead><tbody>',
    rows.map((row) => '<tr>' + asArray(row).map((cell) => `<td>${htmlEscape(cell)}</td>`).join('') + '</tr>').join('\n'),
    '</tbody></table>',
  ].join('');
}

function renderBlock(block) {
  const type = block.type;
  if (type === 'paragraph') {
    return `<p>${htmlEscape(block.text || '')}</p>`;
  }
  if (type === 'callout') {
    const title = block.title ? `<strong>${htmlEscape(block.title)}:</strong> ` : '';
    return `<div class="br-callout">${title}${htmlEscape(block.text || '')}</div>`;
  }
  if (type === 'table') {
    return renderTableBlock(block);
  }
  if (type === 'stat_grid') {
    return '<div class="br-stat-row">' + asArray(block.items).map((s) => `<div class="br-stat-card"><div class="br-stat-number">${htmlEscape(s.value || '')}</div><div class="br-stat-label">${htmlEscape(s.label || '')}</div></div>`).join('') + '</div>';
  }
  if (type === 'insight_grid') {
    return '<div class="br-grid-2">' + asArray(block.items).map((item, idx) => `<div class="br-insight-card ${item.kind === 'wrong' ? 'wrong' : 'right'}"><div class="br-insight-num">${htmlEscape(item.num || idx + 1)}</div><h4>${htmlEscape(item.title || '')}</h4><p>${htmlEscape(item.text || '')}</p></div>`).join('') + '</div>';
  }
  if (type === 'key_events') {
    return '<div class="br-key-events">' + asArray(block.events).map((e) => `<div class="br-key-event"><div class="br-key-date">${htmlEscape(e.date || '')}</div><div><strong>${htmlEscape(e.title || '')}</strong><p>${htmlEscape(e.text || '')}</p></div></div>`).join('') + '</div>';
  }
  if (type === 'source_list') {
    return '<ol class="br-source-list">' + asArray(block.items).map((s) => `<li>${link(s.label, s.url)}${s.note ? ' — ' + htmlEscape(s.note) : ''}</li>`).join('') + '</ol>';
  }
  if (type === 'lessons') {
    return '<div class="br-lessons">' + asArray(block.items).map((item) => `<div class="br-learn-card"><h4>${htmlEscape(item.label || '')}</h4><p>${htmlEscape(item.text || '')}</p></div>`).join('') + '</div>';
  }
  return `<div class="br-callout">Unsupported block type: ${htmlEscape(type || '')}</div>`;
}

function renderCustomSections(data) {
  return asArray(data.sections).map((section, idx) => [
    '<section class="br-section">',
    section.kicker ? `<div class="br-section-label">${htmlEscape(section.kicker)}</div>` : '',
    `<h1>${htmlEscape(section.title || 'Section ' + (idx + 1))}</h1>`,
    section.summary ? `<p>${htmlEscape(section.summary)}</p>` : '',
    asArray(section.blocks).map(renderBlock).join('\n'),
    '</section>',
  ].filter(Boolean).join('\n')).join('\n');
}

function renderSources(data) {
  const sources = asArray(data.sources);
  return [
    '<section class="br-section">',
    '<div class="br-section-label">Sources</div>',
    '<h1>来源清单</h1>',
    '<ol class="br-source-list">',
    sources.map((s) => `<li>${link(s.label, s.url)}${s.publisher ? ' · ' + htmlEscape(s.publisher) : ''}${s.used_for ? ' · ' + htmlEscape(s.used_for) : ''}</li>`).join('\n'),
    '</ol>',
    '</section>',
  ].join('\n');
}

function renderBody(data) {
  return [
    renderCover(data),
    '<main class="br-page">',
    renderFounderSection(data),
    renderPricingSection(data),
    renderCustomSections(data),
    renderSources(data),
    '<footer class="br-footer">Generated from structured report JSON. Missing facts should stay in audit docs, not be invented in the report.</footer>',
    '</main>',
  ].join('\n');
}

function deriveOutPath(data, jsonPath) {
  const slug = data && data.brand_context && data.brand_context.slug;
  if (slug) return path.join('examples', slug + '-report.html');
  const name = path.basename(jsonPath, '.json').replace(/^_+/, '');
  return path.join('examples', name + '-report.html');
}

function themeHrefForOutput(outPath) {
  const outDir = path.dirname(resolveProject(outPath));
  const themeAbs = path.join(PROJECT_ROOT, 'theme', 'brand-research-theme.css');
  let rel = path.relative(outDir, themeAbs).replace(/\\/g, '/');
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel;
}

function renderHtml(data, template, outPath) {
  const bc = data.brand_context || {};
  const cover = data.cover || {};
  const title = cover.title || (bc.brand_name ? bc.brand_name + ' 深度调研报告' : 'Brand Research Report');
  return template
    .replace('{{title}}', htmlEscape(title))
    .replace('{{theme_href}}', attr(themeHrefForOutput(outPath)))
    .replace('{{body}}', renderBody(data));
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
  if (!args.jsonPath) {
    console.error('[report-render] Missing JSON file path.');
    return 2;
  }

  const jsonAbs = resolveProject(args.jsonPath);
  const templateAbs = resolveProject(args.templatePath);
  if (!fs.existsSync(jsonAbs)) {
    console.error('[report-render] JSON file not found: ' + args.jsonPath);
    return 1;
  }
  if (!fs.existsSync(templateAbs)) {
    console.error('[report-render] Template file not found: ' + args.templatePath);
    return 1;
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(jsonAbs, 'utf8'));
  } catch (err) {
    console.error('[report-render] Invalid JSON: ' + err.message);
    return 1;
  }

  if (args.check) {
    const results = checkReport(data, { strict: args.strict, allowTemplate: path.basename(jsonAbs).startsWith('_') });
    const critical = results.filter((r) => !r.pass && r.level === 'critical');
    const warnings = results.filter((r) => !r.pass && r.level === 'warning');
    if (critical.length || (args.strict && warnings.length)) {
      critical.forEach((r) => console.error('[report-render] FAIL: ' + r.msg));
      warnings.forEach((r) => console.error('[report-render] WARNING: ' + r.msg));
      return 1;
    }
    warnings.forEach((r) => console.warn('[report-render] WARNING: ' + r.msg));
  }

  const outPath = args.outPath || deriveOutPath(data, args.jsonPath);
  const outAbs = resolveProject(outPath);
  if (fs.existsSync(outAbs) && !args.force) {
    console.error('[report-render] Output already exists: ' + outPath + '. Use --force to overwrite.');
    return 1;
  }

  if (args.dryRun) {
    console.log('[report-render] JSON: ' + args.jsonPath);
    console.log('[report-render] Template: ' + args.templatePath);
    console.log('[report-render] Output: ' + outPath);
    console.log('[report-render] Theme href: ' + themeHrefForOutput(outPath));
    return 0;
  }

  const template = fs.readFileSync(templateAbs, 'utf8');
  const html = renderHtml(data, template, outPath);
  fs.mkdirSync(path.dirname(outAbs), { recursive: true });
  fs.writeFileSync(outAbs, html, 'utf8');
  console.error('[report-render] Wrote: ' + outPath);
  return 0;
}

if (require.main === module) {
  process.exit(main());
}
