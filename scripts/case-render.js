#!/usr/bin/env node
/*
 * case-render.js
 *
 * Renders data/cases/*.json into a founder-learning HTML report.
 */

const fs = require('fs');
const path = require('path');
const { checkCase } = require('./case-check');

const ROOT = path.resolve(__dirname, '..');

function parseArgs(argv) {
  const args = { jsonPath: null, outPath: null, force: false, check: false, strict: false, dryRun: false, help: false, errors: [] };
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--out') args.outPath = argv[++i];
    else if (a === '--force') args.force = true;
    else if (a === '--check') args.check = true;
    else if (a === '--strict') args.strict = true;
    else if (a === '--dry-run') args.dryRun = true;
    else if (a === '--help' || a === '-h') args.help = true;
    else if (a.startsWith('-')) args.errors.push('[case-render] Unknown option: ' + a);
    else if (!args.jsonPath) args.jsonPath = a;
    else args.errors.push('[case-render] Unexpected argument: ' + a);
  }
  return args;
}

function showHelp() {
  console.log([
    'case-render.js - Render entrepreneur case JSON.',
    '',
    'Usage:',
    '  node scripts/case-render.js data/cases/mammotion.json --check --force',
    '  node scripts/case-render.js data/cases/mammotion.json --out examples/mammotion-case.html --force',
  ].join('\n'));
}

function resolveProject(filePath) {
  return path.isAbsolute(filePath) ? filePath : path.join(ROOT, filePath);
}

function html(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function attr(value) {
  return html(value).replace(/`/g, '&#96;');
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function link(label, url) {
  if (!url) return html(label || '');
  return `<a href="${attr(url)}" target="_blank" rel="noopener">${html(label || url)}</a>`;
}

function confidence(level) {
  const value = String(level || 'medium').toLowerCase();
  const labels = {
    high: '高可信',
    medium: '中可信',
    low: '低可信',
  };
  return `<span class="badge ${attr(value)}">${html(labels[value] || value)}</span>`;
}

function statusLabel(status) {
  const labels = {
    verified_core: '已验证核心产品',
    market_expansion: '市场扩展产品线',
    strategic_experiment: '战略实验',
    observed_job_post: '已捕捉岗位',
    job_board_index: '招聘索引页',
    watchlist_not_yet_captured: '观察清单，尚未捕捉到稳定 JD',
  };
  return labels[status] || status || '';
}

function caseTypeLabel(type) {
  const labels = {
    product_company_case: '产品公司创业案例',
    platform_company_case: '平台公司创业案例',
    person_method_case: '人物 / 产品方法论案例',
    gtm_comparison_case: '品类 GTM 对照案例',
  };
  return labels[type] || type || '创业案例';
}

function sourceLine(source) {
  return source ? link(source.label || source.url, source.url) : '';
}

function evidenceList(items) {
  return '<ul>' + asArray(items).map((item) => (
    `<li><strong>${html(item.label || '')}:</strong> ${html(item.value || '')} ${sourceLine(item.source)} ${confidence(item.confidence)}</li>`
  )).join('') + '</ul>';
}

function table(headers, rows) {
  return [
    '<table>',
    '<thead><tr>' + headers.map((h) => `<th>${html(h)}</th>`).join('') + '</tr></thead>',
    '<tbody>',
    rows.map((row) => '<tr>' + row.map((cell) => `<td>${cell}</td>`).join('') + '</tr>').join(''),
    '</tbody></table>',
  ].join('');
}

function renderProductCase(item, idx) {
  const pricing = item.pricing_stack || {};
  const roi = item.roi_assessment || {};
  const priceRows = [
    ['产品价格', pricing.product_price],
    ['配件 / 服务', pricing.accessory_service],
    ['软件 / 订阅', pricing.subscription_software],
  ].filter(([, v]) => v).map(([label, note]) => [
    html(label),
    `<strong>${html(note.label || '')}</strong><br>${html(note.value || '')}`,
    `${sourceLine(note.source)} ${confidence(note.confidence)}`,
  ]);

  asArray(pricing.competitor_prices).forEach((note) => {
    priceRows.push([
      '竞品',
      `<strong>${html(note.label || '')}</strong><br>${html(note.value || '')}`,
      `${sourceLine(note.source)} ${confidence(note.confidence)}`,
    ]);
  });

  return [
    '<section class="section product-case">',
    `<div class="eyebrow">核心产品案例 ${idx + 1} · ${html(statusLabel(item.status))}</div>`,
    `<h2>${html(item.name || '')}</h2>`,
    `<p class="role">${html(item.case_role || '')}</p>`,
    '<div class="grid two">',
    `<div><h3>为什么开发它</h3><p>${html(item.why_developed || '')}</p><h3>原始用户痛点</h3><p>${html(item.original_pain || '')}</p><h3>为什么老玩家留下空间</h3><p>${html(item.why_incumbents_failed || '')}</p></div>`,
    `<div><h3>开发难点</h3>${evidenceList(item.development_difficulties)}<h3>开发成本信号</h3>${evidenceList(item.development_costs)}</div>`,
    '</div>',
    '<h3>商业化路径</h3>',
    evidenceList(item.commercialization_path),
    '<h3>产品、配件、软件和竞品价格</h3>',
    table(['类型', '证据', '来源'], priceRows),
    '<h3>回报证据</h3>',
    evidenceList(item.return_evidence),
    '<h3>ROI 判断</h3>',
    `<div class="callout ${roi.calculable ? 'ok' : 'warn'}"><strong>是否可计算：</strong>${roi.calculable ? '可以' : '不可以'}<br><strong>公式：</strong>${html(roi.formula || '未说明')}<br>${html(roi.conclusion || '')}</div>`,
    '<div class="grid two">',
    `<div><h4>已知输入</h4>${evidenceList(roi.known_inputs)}</div>`,
    `<div><h4>缺失输入</h4><ul>${asArray(roi.missing_inputs).map((x) => `<li>${html(x)}</li>`).join('')}</ul></div>`,
    '</div>',
    asArray(item.entrepreneur_lessons).length ? `<h3>创业者应该学什么</h3><ul>${asArray(item.entrepreneur_lessons).map((x) => `<li>${html(x)}</li>`).join('')}</ul>` : '',
    '</section>',
  ].join('');
}

function renderRecruitment(data) {
  const rows = asArray(data.recruitment_signals).map((r) => [
    `<strong>${html(r.signal)}</strong><br><span class="muted">${html(statusLabel(r.evidence_status))}</span>`,
    html(r.capability_gap || ''),
    html(r.inferred_direction || ''),
    `${confidence(r.confidence)}<br>${sourceLine(r.source)}`,
    html(r.validation_needed || ''),
  ]);
  return [
    '<section class="section">',
    '<div class="eyebrow">招聘信号</div>',
    '<h2>从招聘信息反推未来业务线</h2>',
    '<p>招聘信息只能作为方向推断。没有可持久打开的 JD，不写成事实；必须记录抓取来源、岗位关键词、能力缺口和验证方式。</p>',
    table(['招聘信号', '能力缺口', '推断方向', '来源', '还需要验证什么'], rows),
    '</section>',
  ].join('');
}

function renderOfficialSignals(data) {
  const rows = asArray(data.official_site_signals).map((s) => [
    `<strong>${html(s.signal)}</strong>`,
    html(s.insight || ''),
    `${sourceLine(s.source)} ${confidence(s.confidence)}`,
  ]);
  return [
    '<section class="section">',
    '<div class="eyebrow">官网信号</div>',
    '<h2>官网和新品页暴露了什么</h2>',
    table(['信号', '洞察', '来源'], rows),
    '</section>',
  ].join('');
}

function renderFutureBets(data) {
  const rows = asArray(data.future_bets).map((b) => [
    `<strong>${html(b.bet)}</strong><br>${confidence(b.confidence)}`,
    html(b.why_it_matters || ''),
    '<ul>' + asArray(b.supporting_signals).map((x) => `<li>${html(x)}</li>`).join('') + '</ul>',
    html(b.watch_next || ''),
  ]);
  return [
    '<section class="section">',
    '<div class="eyebrow">未来押注</div>',
    '<h2>下一步押注和验证方式</h2>',
    table(['押注', '为什么重要', '支持信号', '下一步观察'], rows),
    '</section>',
  ].join('');
}

function renderContext(data) {
  const ctx = data.case_context || {};
  const fcc = data.founder_company_context || {};
  const founderRows = asArray(fcc.founder_profiles).map((f) => [
    `<strong>${html(f.name || '')}</strong><br>${html(f.role || '')}`,
    html(f.summary || ''),
    `${asArray(f.links).map((l) => link(l.label, l.url)).join(' / ')} ${confidence(f.confidence)}`,
  ]);
  const capitalRows = asArray(fcc.capital_history).map((e) => [
    html(e.date || ''),
    html(e.event_type || ''),
    html([e.currency, e.amount].filter(Boolean).join(' ')),
    html(e.description || ''),
    `${asArray(e.sources).map((s) => link(s.label, s.url)).join(' / ')} ${confidence(e.confidence)}`,
  ]);
  return [
    '<section class="section">',
    '<div class="eyebrow">案例背景</div>',
    '<h2>学习目标和证据边界</h2>',
    `<div class="callout"><strong>第一性原理：</strong>${html(ctx.first_principle || '')}<br><strong>学习目标：</strong>${html(ctx.learning_objective || '')}<br><strong>证据边界：</strong>${html(ctx.evidence_boundary || '')}</div>`,
    '<h3>创始人 / 公司背景</h3>',
    table(['人物', '摘要', '来源'], founderRows),
    '<h3>资金 / 收入线索</h3>',
    table(['时间', '类型', '金额', '说明', '来源'], capitalRows),
    '</section>',
  ].join('');
}

function renderSources(data) {
  return [
    '<section class="section">',
    '<div class="eyebrow">来源</div>',
    '<h2>来源</h2>',
    '<ol>' + asArray(data.sources).map((s) => `<li>${link(s.label, s.url)}${s.publisher ? ' · ' + html(s.publisher) : ''}${s.used_for ? ' · ' + html(s.used_for) : ''}</li>`).join('') + '</ol>',
    '</section>',
  ].join('');
}

function renderHtml(data) {
  const ctx = data.case_context || {};
  const title = `${ctx.case_name || '创业案例'} - 创业案例`;
  const productCases = asArray(data.core_product_cases).map(renderProductCase).join('');
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${html(title)}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Noto+Sans+SC:wght@300;400;500;700&display=swap');
*{box-sizing:border-box}body{margin:0;background:#f7f3ec;color:#222;font-family:'DM Sans','Noto Sans SC',sans-serif;line-height:1.65}.cover{padding:56px 28px 36px;max-width:1120px;margin:0 auto}.label,.eyebrow{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#b84a3a;font-weight:700}.cover h1{font-size:48px;line-height:1.1;margin:12px 0}.cover p{max-width:820px;color:#555;font-size:18px}.page{max-width:1120px;margin:0 auto;padding:0 28px 60px}.section{background:#fff;border:1px solid #ece5da;border-radius:10px;padding:26px;margin:18px 0;box-shadow:0 1px 4px rgba(0,0,0,.04)}h2{font-size:28px;margin:6px 0 14px}h3{font-size:18px;margin:22px 0 8px}h4{font-size:15px;margin:14px 0 6px}.role{font-weight:700;color:#4a6fa5}.grid{display:grid;gap:18px}.grid.two{grid-template-columns:repeat(2,minmax(0,1fr))}.callout{background:#fbf5ee;border-left:4px solid #d45b42;padding:14px 16px;border-radius:6px}.callout.warn{border-left-color:#c2513b}.callout.ok{border-left-color:#5b8c6f}table{width:100%;border-collapse:collapse;margin:12px 0}th,td{border-bottom:1px solid #eee;padding:10px;vertical-align:top;text-align:left}th{font-size:12px;text-transform:uppercase;color:#777;background:#faf8f4}.badge{display:inline-block;border-radius:999px;padding:2px 8px;font-size:11px;background:#eee;color:#555}.badge.high{background:#e7f3eb;color:#2e6b45}.badge.medium{background:#eef2f8;color:#315b8a}.badge.low{background:#fbebeb;color:#9b2d27}.muted{color:#888;font-size:12px}a{color:#c2513b;text-decoration:none}a:hover{text-decoration:underline}li{margin:4px 0}.footer{color:#888;font-size:12px;text-align:center;margin-top:30px}@media(max-width:760px){.cover h1{font-size:34px}.grid.two{grid-template-columns:1fr}.section{padding:18px}.page,.cover{padding-left:16px;padding-right:16px}}
</style>
</head>
<body>
<div class="cover">
  <div class="label">${html(caseTypeLabel(ctx.case_type))}</div>
  <h1>${html(ctx.case_name || '')}</h1>
  <p>${html(ctx.learning_objective || '')}</p>
</div>
<main class="page">
${renderContext(data)}
${productCases}
${renderRecruitment(data)}
${renderOfficialSignals(data)}
${renderFutureBets(data)}
${renderSources(data)}
<div class="footer">由 data/cases 结构化创业案例 JSON 生成。找不到的事实保持缺失，不编造 ROI。</div>
</main>
</body>
</html>`;
}

function deriveOut(data, jsonPath) {
  const slug = data && data.case_context && data.case_context.slug;
  return path.join('examples', (slug || path.basename(jsonPath, '.json')) + '-case.html');
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
    console.error('[case-render] Missing JSON path.');
    return 2;
  }
  const jsonAbs = resolveProject(args.jsonPath);
  if (!fs.existsSync(jsonAbs)) {
    console.error('[case-render] JSON file not found: ' + args.jsonPath);
    return 1;
  }
  const data = JSON.parse(fs.readFileSync(jsonAbs, 'utf8'));
  if (args.check) {
    const results = checkCase(data, { strict: args.strict, allowTemplate: path.basename(jsonAbs).startsWith('_') });
    const critical = results.filter((r) => !r.pass && r.level === 'critical');
    const warnings = results.filter((r) => !r.pass && r.level === 'warning');
    if (critical.length || (args.strict && warnings.length)) {
      console.error('[case-render] Check failed:');
      critical.concat(args.strict ? warnings : []).forEach((r) => console.error('- ' + r.msg));
      return 1;
    }
  }
  const outRel = args.outPath || deriveOut(data, args.jsonPath);
  const outAbs = resolveProject(outRel);
  if (args.dryRun) {
    console.log('[case-render] JSON: ' + jsonAbs);
    console.log('[case-render] OUT:  ' + outAbs);
    return 0;
  }
  if (fs.existsSync(outAbs) && !args.force) {
    console.error('[case-render] Output exists. Use --force: ' + outRel);
    return 1;
  }
  fs.mkdirSync(path.dirname(outAbs), { recursive: true });
  fs.writeFileSync(outAbs, renderHtml(data), 'utf8');
  console.log('[case-render] Wrote ' + path.relative(ROOT, outAbs));
  return 0;
}

if (require.main === module) {
  process.exit(main());
}

module.exports = { renderHtml };
