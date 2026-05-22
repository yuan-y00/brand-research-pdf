/**
 * gtm-render.js
 *
 * Reads a GTM extension JSON file and renders it as an HTML section
 * designed to be inserted into existing brand research reports.
 *
 * Usage:
 *   node scripts/gtm-render.js <json-file>              → stdout
 *   node scripts/gtm-render.js <json-file> --out <file> → write to file
 *   node scripts/gtm-render.js <json-file> --no-style   → skip <style> block
 *   node scripts/gtm-render.js --help                   → show help
 *
 * Zero dependencies. Node.js native modules only.
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// CLI ARGUMENT PARSING
// ============================================================================

function parseArgs(argv) {
  const args = { jsonPath: null, outPath: null, noStyle: false, help: false, errors: [] };

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') {
      args.help = true;
    } else if (a === '--out') {
      if (i + 1 >= argv.length) {
        args.errors.push('[gtm-render] Missing output path after --out.');
      } else {
        args.outPath = argv[++i];
      }
    } else if (a === '--no-style') {
      args.noStyle = true;
    } else if (a.startsWith('-')) {
      args.errors.push('[gtm-render] Unknown option: ' + a);
    } else if (!args.jsonPath) {
      args.jsonPath = a;
    } else {
      args.errors.push('[gtm-render] Unexpected argument: ' + a);
    }
  }

  return args;
}

function showHelp() {
  console.log([
    'gtm-render.js — Render GTM extension JSON to an HTML section.',
    '',
    'Usage:',
    '  node scripts/gtm-render.js <json-file> [--out <file>] [--no-style]',
    '  node scripts/gtm-render.js --help',
    '',
    'Options:',
    '  --out <file>   Write HTML output to <file> instead of stdout.',
    '  --no-style     Omit the scoped <style> block; output only the section div.',
    '  --help         Show this help text.',
    '',
    'Examples:',
    '  node scripts/gtm-render.js data/gtm/anker.json',
    '  node scripts/gtm-render.js data/gtm/anker.json --out tmp/gtm-section.html',
    '  node scripts/gtm-render.js data/gtm/anker.json --no-style',
  ].join('\n'));
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const ENTITY_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function escapeHtml(value) {
  if (typeof value !== 'string') return escapeHtml(String(value));
  return value.replace(/[&<>"']/g, (ch) => ENTITY_MAP[ch]);
}

function escapeAttr(value) {
  if (typeof value !== 'string') return escapeAttr(String(value));
  return value.replace(/[&<>"']/g, (ch) => ENTITY_MAP[ch]);
}

function isNonEmpty(value) {
  if (value == null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0 && value.some(isNonEmpty);
  if (typeof value === 'object') return Object.keys(value).length > 0 && Object.values(value).some(isNonEmpty);
  return true;
}

function toArray(value) {
  if (value == null) return [];
  if (Array.isArray(value)) return value.filter((v) => v != null && String(v).trim() !== '');
  if (typeof value === 'string' && value.trim() !== '') return [value.trim()];
  if (typeof value === 'object') {
    const arr = [];
    for (const v of Object.values(value)) {
      if (v != null && String(v).trim() !== '') arr.push(String(v).trim());
    }
    return arr;
  }
  return [];
}

function safeText(value, fallback) {
  if (fallback === undefined) fallback = '';
  if (value == null) return fallback;
  if (typeof value === 'string') return value.trim() === '' ? fallback : value.trim();
  return String(value).trim() === '' ? fallback : String(value).trim();
}

function slugify(value) {
  const s = safeText(value);
  if (!s) return 'brand';
  return s
    .toLowerCase()
    .replace(/[^a-z0-9一-鿿]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'brand';
}

function isSafeUrl(url) {
  if (typeof url !== 'string') return false;
  const u = url.trim();
  return u.startsWith('http://') || u.startsWith('https://');
}

function renderLink(url, text) {
  if (isSafeUrl(url)) {
    return '<a href="' + escapeAttr(url) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(text || url) + '</a>';
  }
  return escapeHtml(text || url);
}

function confidenceBadge(level) {
  const s = safeText(level, 'medium').toLowerCase();
  let cls = 'gtm-confidence';
  if (s === 'high') cls += ' gtm-conf-high';
  else if (s === 'low') cls += ' gtm-conf-low';
  else cls += ' gtm-conf-med';
  return '<span class="' + cls + '">' + escapeHtml(s) + '</span>';
}

// ============================================================================
// COMPONENT RENDERERS
// ============================================================================

function renderTags(items, cls) {
  const arr = toArray(items);
  if (arr.length === 0) return '';
  cls = cls || 'gtm-tag';
  return '<span class="gtm-tag-list">' + arr.map((t) => '<span class="' + cls + '">' + escapeHtml(t) + '</span>').join('') + '</span>';
}

function renderList(items) {
  const arr = toArray(items);
  if (arr.length === 0) return '';
  return '<ul>' + arr.map((t) => '<li>' + escapeHtml(t) + '</li>').join('') + '</ul>';
}

function renderTable(title, rows, options) {
  options = options || {};
  const labelMap = options.labelMap || {};
  if (!rows || Object.keys(rows).length === 0) return '';

  const entries = [];
  for (const [key, val] of Object.entries(rows)) {
    if (isNonEmpty(val)) {
      entries.push({ label: labelMap[key] || key, value: safeText(val) });
    }
  }
  if (entries.length === 0) return '';

  let html = '';
  if (title) {
    html += '<h3 class="gtm-subsection-title">' + escapeHtml(title) + '</h3>\n';
  }
  html += '<table class="gtm-table">\n';
  html += '<thead><tr><th style="width:160px">' + escapeHtml(options.keyHeader || '类别') + '</th><th>' + escapeHtml(options.valHeader || '说明') + '</th></tr></thead>\n';
  html += '<tbody>\n';
  for (const e of entries) {
    html += '<tr><td class="gtm-td-label">' + escapeHtml(e.label) + '</td><td>' + escapeHtml(e.value) + '</td></tr>\n';
  }
  html += '</tbody></table>\n';
  return html;
}

function renderSources(sources, limit) {
  const arr = toArray(sources);
  if (arr.length === 0) return '';

  limit = limit || 10;
  const shown = arr.slice(0, limit);

  let html = '<div class="gtm-source-list"><h3 class="gtm-subsection-title">来源</h3>\n';
  html += '<ol>\n';
  for (const s of shown) {
    if (typeof s === 'object' && s !== null) {
      const title = safeText(s.title || s.name || '', '未命名来源');
      const url = safeText(s.url || s.link || '', '');
      const stype = safeText(s.source_type || s.type || '', '');
      const note = safeText(s.note || '', '');
      const conf = safeText(s.confidence || s.conf || '', '');

      html += '<li>';
      if (url) {
        html += renderLink(url, title);
      } else {
        html += escapeHtml(title);
      }
      if (stype) html += ' <span class="gtm-muted">[' + escapeHtml(stype) + ']</span>';
      if (conf) html += ' ' + confidenceBadge(conf);
      if (note) html += ' <span class="gtm-muted">— ' + escapeHtml(note) + '</span>';
      html += '</li>\n';
    } else if (typeof s === 'string') {
      html += '<li>' + escapeHtml(s) + '</li>\n';
    }
  }
  if (arr.length > limit) {
    html += '<li class="gtm-muted">... 还有 ' + (arr.length - limit) + ' 条来源未显示</li>\n';
  }
  html += '</ol></div>\n';
  return html;
}

// ============================================================================
// SECTION RENDERERS
// ============================================================================

function renderMeta(data) {
  const brand = safeText(data.brand, 'Unknown Brand');
  const marketFocus = safeText(data.market_focus || (data.gtm_extension && data.gtm_extension.market_focus), '');
  const version = safeText(data.version, '');
  const disclaimer = safeText(data.disclaimer, '');
  const generatedBy = safeText(data.generated_by, '');

  if (!marketFocus && !version && !disclaimer) return '';

  let html = '<div class="gtm-meta">\n';
  html += '<div class="gtm-meta-row"><span class="gtm-meta-label">品牌：</span><span class="gtm-meta-value">' + escapeHtml(brand) + '</span></div>\n';
  if (marketFocus) html += '<div class="gtm-meta-row"><span class="gtm-meta-label">市场重点：</span><span class="gtm-meta-value">' + escapeHtml(marketFocus) + '</span></div>\n';
  if (version) html += '<div class="gtm-meta-row"><span class="gtm-meta-label">版本：</span><span class="gtm-meta-value">' + escapeHtml(version) + '</span></div>\n';
  if (generatedBy) html += '<div class="gtm-meta-row"><span class="gtm-meta-label">生成方式：</span><span class="gtm-meta-value">' + escapeHtml(generatedBy) + '</span></div>\n';
  if (disclaimer) html += '<p class="gtm-disclaimer">' + escapeHtml(disclaimer) + '</p>\n';
  html += '</div>\n';
  return html;
}

function renderSummary(gtm) {
  const oneLine = safeText(gtm.one_sentence_gtm, '');
  const summary = safeText(gtm.summary, '');

  if (!oneLine && !summary) return '';

  let html = '';
  html += '<h2>GTM 总览</h2>\n';
  if (oneLine) {
    html += '<div class="gtm-callout"><strong>一句话 GTM：</strong>' + escapeHtml(oneLine) + '</div>\n';
  }
  if (summary) {
    html += '<div class="gtm-card"><p>' + escapeHtml(summary) + '</p></div>\n';
  }
  return html;
}

function renderChannelPath(gtm) {
  const steps = toArray(gtm.channel_path);
  if (steps.length === 0) return '';

  let html = '<h2>渠道路径</h2>\n';
  html += '<div class="gtm-path">\n';
  for (let i = 0; i < steps.length; i++) {
    html += '<span class="gtm-path-step">' + escapeHtml(steps[i]) + '</span>';
    if (i < steps.length - 1) {
      html += '<span class="gtm-path-arrow">&rarr;</span>';
    }
  }
  html += '</div>\n';
  return html;
}

function renderChannelsTable(gtm) {
  const ch = gtm.channels;
  if (!ch || typeof ch !== 'object') return '';

  const labelMap = {
    crowdfunding: '众筹',
    dtc: '独立站 / DTC',
    amazon: 'Amazon',
    ecommerce: '电商',
    social_media: '社媒',
    retail: '商超 / 零售',
    dealer: '代理 / 经销商',
    authorized_store: '授权店',
    offline: '线下',
    service_network: '服务网络',
  };

  return renderTable('渠道分析', ch, { labelMap: labelMap, keyHeader: '渠道', valHeader: '说明' });
}

function renderBusinessModelTable(gtm) {
  const bm = gtm.business_model;
  if (!bm || typeof bm !== 'object') return '';

  const labelMap = {
    hardware: '硬件',
    subscription: '订阅',
    consumables: '耗材',
    accessories: '配件',
    service: '服务',
    repair: '维修',
    training: '培训',
    dealer_margin_or_channel: '代理 / 渠道利润',
    other: '其他',
  };

  return renderTable('商业模式', bm, { labelMap: labelMap, keyHeader: '商业模式', valHeader: '说明' });
}

function renderMarketEntry(gtm) {
  const me = gtm.market_entry;
  if (!me || typeof me !== 'object') return '';

  const labelMap = {
    us_market: '美国市场',
    china_market: '中国市场',
    global_market: '全球市场',
    notes: '备注',
  };

  return renderTable('市场进入', me, { labelMap: labelMap, keyHeader: '市场', valHeader: '说明' });
}

function renderOfflineDealer(gtm) {
  const odm = gtm.offline_and_dealer_model;
  if (!odm || typeof odm !== 'object') return '';

  const hasContent = Object.values(odm).some(isNonEmpty);
  if (!hasContent) return '';

  let html = '<h2>线下与代理模式</h2>\n';
  html += '<div class="gtm-card">\n';

  const hasOffline = safeText(odm.has_offline_model, '');
  if (hasOffline) html += '<p><strong>有无线下模式：</strong>' + escapeHtml(hasOffline) + '</p>\n';

  const dealer = safeText(odm.dealer_or_distributor, '');
  if (dealer) html += '<p><strong>代理 / 经销商：</strong>' + escapeHtml(dealer) + '</p>\n';

  const authStore = safeText(odm.authorized_store, '');
  if (authStore) html += '<p><strong>授权店：</strong>' + escapeHtml(authStore) + '</p>\n';

  const service = safeText(odm.service_and_repair, '');
  if (service) html += '<p><strong>服务与维修：</strong>' + escapeHtml(service) + '</p>\n';

  const training = safeText(odm.training_or_demo, '');
  if (training) html += '<p><strong>培训 / 演示：</strong>' + escapeHtml(training) + '</p>\n';

  const retailPartners = toArray(odm.retail_partners);
  if (retailPartners.length > 0) {
    html += '<p><strong>零售合作伙伴：</strong></p>\n';
    html += renderTags(retailPartners, 'gtm-tag');
  }

  const notes = safeText(odm.notes, '');
  if (notes) html += '<p class="gtm-muted">' + escapeHtml(notes) + '</p>\n';

  html += '</div>\n';
  return html;
}

// ============================================================================
// PRODUCT CARD RENDERER
// ============================================================================

function renderProduct(product, index) {
  if (!product || typeof product !== 'object') return '';

  const name = safeText(product.name, 'Product ' + (index + 1));
  const type = safeText(product.type, 'product');
  const rank = product.rank != null ? product.rank : index + 1;
  const whySelected = safeText(product.why_selected, '');
  const successTypes = toArray(product.success_type);
  const confidence = safeText(product.confidence, 'medium');

  let html = '<div class="gtm-product-card">\n';

  // Header
  html += '<div class="gtm-product-header">\n';
  html += '<span class="gtm-product-rank">#' + escapeHtml(String(rank)) + '</span>\n';
  html += '<div>\n';
  html += '<h3 class="gtm-product-name">' + escapeHtml(name) + '</h3>\n';
  html += '<div class="gtm-product-subtitle">';
  html += '<span class="gtm-product-type">' + escapeHtml(type) + '</span>';
  html += ' ' + confidenceBadge(confidence);
  html += '</div>\n';
  html += '</div></div>\n';

  // Why selected
  if (whySelected) {
    html += '<div class="gtm-subsection"><p><strong>为什么选择这个产品：</strong>' + escapeHtml(whySelected) + '</p></div>\n';
  }

  // Success type tags
  if (successTypes.length > 0) {
    html += '<div class="gtm-subsection">' + renderTags(successTypes) + '</div>\n';
  }

  // Origin story
  const origin = product.origin_story;
  if (origin && typeof origin === 'object') {
    let hasOrigin = false;
    let originHtml = '<div class="gtm-subsection"><h4>产品诞生故事</h4>\n';

    const initialProblem = safeText(origin.initial_problem, '');
    if (initialProblem) { originHtml += '<p><strong>最初问题：</strong>' + escapeHtml(initialProblem) + '</p>\n'; hasOrigin = true; }

    const insight = safeText(origin.founder_or_team_insight, '');
    if (insight) { originHtml += '<p><strong>创始人/团队洞察：</strong>' + escapeHtml(insight) + '</p>\n'; hasOrigin = true; }

    const earlyUsers = toArray(origin.early_users);
    if (earlyUsers.length > 0) {
      originHtml += '<p><strong>早期用户：</strong></p>' + renderTags(earlyUsers) + '\n';
      hasOrigin = true;
    }

    const earlyForm = safeText(origin.early_product_form, '');
    if (earlyForm) { originHtml += '<p><strong>早期产品形态：</strong>' + escapeHtml(earlyForm) + '</p>\n'; hasOrigin = true; }

    const whyMattered = safeText(origin.why_it_mattered, '');
    if (whyMattered) { originHtml += '<p><strong>为什么重要：</strong>' + escapeHtml(whyMattered) + '</p>\n'; hasOrigin = true; }

    originHtml += '</div>\n';
    if (hasOrigin) html += originHtml;
  }

  // Pre-market
  const preMarket = product.pre_market;
  if (preMarket && typeof preMarket === 'object') {
    let hasPre = false;
    let preHtml = '<div class="gtm-subsection"><h4>出现前市场痛点</h4>\n';

    const oldSolutions = toArray(preMarket.old_solution);
    if (oldSolutions.length > 0) { preHtml += '<p><strong>旧有解决方案：</strong></p>' + renderList(oldSolutions) + '\n'; hasPre = true; }

    const painPoints = toArray(preMarket.pain_points);
    if (painPoints.length > 0) { preHtml += '<p><strong>痛点：</strong></p>' + renderList(painPoints) + '\n'; hasPre = true; }

    const barrier = safeText(preMarket.market_barrier, '');
    if (barrier) { preHtml += '<p><strong>市场壁垒：</strong>' + escapeHtml(barrier) + '</p>\n'; hasPre = true; }

    const whyNotEnough = safeText(preMarket.why_existing_solutions_were_not_enough, '');
    if (whyNotEnough) { preHtml += '<p><strong>为什么旧方案不够：</strong>' + escapeHtml(whyNotEnough) + '</p>\n'; hasPre = true; }

    preHtml += '</div>\n';
    if (hasPre) html += preHtml;
  }

  // Innovation
  const innov = product.innovation;
  if (innov && typeof innov === 'object') {
    let hasInnov = false;
    let innovHtml = '<div class="gtm-subsection"><h4>当时创新点</h4>\n';

    const tech = toArray(innov.technology);
    if (tech.length > 0) { innovHtml += '<p><strong>技术创新：</strong></p>' + renderTags(tech) + '\n'; hasInnov = true; }

    const ux = toArray(innov.user_experience);
    if (ux.length > 0) { innovHtml += '<p><strong>用户体验创新：</strong></p>' + renderTags(ux) + '\n'; hasInnov = true; }

    const pricing = safeText(innov.pricing, '');
    if (pricing) { innovHtml += '<p><strong>定价创新：</strong>' + escapeHtml(pricing) + '</p>\n'; hasInnov = true; }

    const channel = toArray(innov.channel);
    if (channel.length > 0) { innovHtml += '<p><strong>渠道创新：</strong></p>' + renderTags(channel) + '\n'; hasInnov = true; }

    const bm = toArray(innov.business_model);
    if (bm.length > 0) { innovHtml += '<p><strong>商业模式创新：</strong></p>' + renderTags(bm) + '\n'; hasInnov = true; }

    const eco = toArray(innov.ecosystem);
    if (eco.length > 0) { innovHtml += '<p><strong>生态创新：</strong></p>' + renderTags(eco) + '\n'; hasInnov = true; }

    const whatNew = safeText(innov.what_was_new_at_that_time, '');
    if (whatNew) { innovHtml += '<p><strong>当时为什么新：</strong>' + escapeHtml(whatNew) + '</p>\n'; hasInnov = true; }

    innovHtml += '</div>\n';
    if (hasInnov) html += innovHtml;
  }

  // Breakout
  const breakout = product.breakout;
  if (breakout && typeof breakout === 'object') {
    let hasBO = false;
    let boHtml = '<div class="gtm-subsection"><h4>爆发路径</h4>\n';

    const mainReasons = toArray(breakout.main_reasons);
    if (mainReasons.length > 0) { boHtml += '<p><strong>主要原因：</strong></p>' + renderList(mainReasons) + '\n'; hasBO = true; }

    const keyEvents = toArray(breakout.key_events);
    if (keyEvents.length > 0) {
      boHtml += '<p><strong>关键事件：</strong></p>\n';
      boHtml += '<div class="gtm-key-events">\n';
      const limit = 6;
      const shown = keyEvents.slice(0, limit);
      for (const evt of shown) {
        if (typeof evt === 'object' && evt !== null) {
          const date = safeText(evt.date, '');
          const event = safeText(evt.event || evt.description || '', '');
          const etype = safeText(evt.type, '');
          const channel = safeText(evt.channel, '');
          const impact = safeText(evt.impact, '');
          const conf = safeText(evt.confidence || evt.conf, '');

          boHtml += '<div class="gtm-event-item">';
          if (date) boHtml += '<span class="gtm-event-date">' + escapeHtml(date) + '</span>';
          if (event) boHtml += ' <span class="gtm-event-text">' + escapeHtml(event) + '</span>';
          if (etype) boHtml += ' <span class="gtm-tag gtm-tag-sm">' + escapeHtml(etype) + '</span>';
          if (channel) boHtml += ' <span class="gtm-muted">(' + escapeHtml(channel) + ')</span>';
          if (conf) boHtml += ' ' + confidenceBadge(conf);
          if (impact) boHtml += '<br><span class="gtm-muted">影响：' + escapeHtml(impact) + '</span>';
          boHtml += '</div>\n';
          hasBO = true;
        }
      }
      if (keyEvents.length > limit) {
        boHtml += '<div class="gtm-muted">... 还有 ' + (keyEvents.length - limit) + ' 条事件未显示</div>\n';
      }
      boHtml += '</div>\n';
    }

    const gtmPath = toArray(breakout.gtm_path);
    if (gtmPath.length > 0) {
      boHtml += '<p><strong>GTM 路径：</strong></p>\n';
      boHtml += '<div class="gtm-path">\n';
      for (let i = 0; i < gtmPath.length; i++) {
        boHtml += '<span class="gtm-path-step">' + escapeHtml(gtmPath[i]) + '</span>';
        if (i < gtmPath.length - 1) boHtml += '<span class="gtm-path-arrow">&rarr;</span>';
      }
      boHtml += '</div>\n';
      hasBO = true;
    }

    boHtml += '</div>\n';
    if (hasBO) html += boHtml;
  }

  // Customer impact
  const ci = product.customer_impact;
  if (ci && typeof ci === 'object') {
    let hasCI = false;
    let ciHtml = '<div class="gtm-subsection"><h4>对客户的影响</h4>\n';

    const newCap = safeText(ci.new_capability, '');
    if (newCap) { ciHtml += '<p><strong>新能力：</strong>' + escapeHtml(newCap) + '</p>\n'; hasCI = true; }

    const timeSaved = safeText(ci.time_saved, '');
    if (timeSaved) { ciHtml += '<p><strong>节省时间：</strong>' + escapeHtml(timeSaved) + '</p>\n'; hasCI = true; }

    const costReduction = safeText(ci.cost_reduction, '');
    if (costReduction) { ciHtml += '<p><strong>降低成本：</strong>' + escapeHtml(costReduction) + '</p>\n'; hasCI = true; }

    const incomeOpp = safeText(ci.income_opportunity, '');
    if (incomeOpp) { ciHtml += '<p><strong>收入机会：</strong>' + escapeHtml(incomeOpp) + '</p>\n'; hasCI = true; }

    const expChange = safeText(ci.experience_change, '');
    if (expChange) { ciHtml += '<p><strong>体验变化：</strong>' + escapeHtml(expChange) + '</p>\n'; hasCI = true; }

    const whoBenefited = toArray(ci.who_benefited_most);
    if (whoBenefited.length > 0) { ciHtml += '<p><strong>谁受益最大：</strong></p>' + renderTags(whoBenefited) + '\n'; hasCI = true; }

    ciHtml += '</div>\n';
    if (hasCI) html += ciHtml;
  }

  // Ecosystem impact
  const ei = product.ecosystem_impact;
  if (ei && typeof ei === 'object') {
    let hasEI = false;
    let eiHtml = '<div class="gtm-subsection"><h4>对生态 / 职业 / 收入机会的影响</h4>\n';

    const newRoles = toArray(ei.new_roles);
    if (newRoles.length > 0) { eiHtml += '<p><strong>新角色/岗位：</strong></p>' + renderTags(newRoles) + '\n'; hasEI = true; }

    const affectedRoles = toArray(ei.affected_roles);
    if (affectedRoles.length > 0) { eiHtml += '<p><strong>受影响的角色：</strong></p>' + renderTags(affectedRoles) + '\n'; hasEI = true; }

    const newServices = toArray(ei.new_services);
    if (newServices.length > 0) { eiHtml += '<p><strong>新服务：</strong></p>' + renderTags(newServices) + '\n'; hasEI = true; }

    const newChannels = toArray(ei.new_channels);
    if (newChannels.length > 0) { eiHtml += '<p><strong>新渠道：</strong></p>' + renderTags(newChannels) + '\n'; hasEI = true; }

    const content = toArray(ei.content_or_community);
    if (content.length > 0) { eiHtml += '<p><strong>内容/社区：</strong></p>' + renderTags(content) + '\n'; hasEI = true; }

    const supply = toArray(ei.supply_chain_or_accessory);
    if (supply.length > 0) { eiHtml += '<p><strong>供应链/配件：</strong></p>' + renderTags(supply) + '\n'; hasEI = true; }

    const laborSignal = safeText(ei.labor_income_signal, '');
    if (laborSignal) { eiHtml += '<p><strong>职业与收入机会信号：</strong>' + escapeHtml(laborSignal) + '</p>\n'; hasEI = true; }

    eiHtml += '</div>\n';
    if (hasEI) html += eiHtml;
  }

  // Lessons
  const lessons = product.lessons;
  if (lessons && typeof lessons === 'object') {
    let hasLessons = false;
    let lessonsHtml = '<div class="gtm-subsection gtm-lessons"><h4>学习与启示</h4>\n';

    const whatToLearn = toArray(lessons.what_to_learn);
    if (whatToLearn.length > 0) { lessonsHtml += '<p><strong>可学习点：</strong></p>' + renderList(whatToLearn) + '\n'; hasLessons = true; }

    const doNotCopy = toArray(lessons.do_not_copy_blindly);
    if (doNotCopy.length > 0) { lessonsHtml += '<p><strong>不能照抄的地方：</strong></p>' + renderList(doNotCopy) + '\n'; hasLessons = true; }

    const bestFor = toArray(lessons.best_for_companies_like);
    if (bestFor.length > 0) { lessonsHtml += '<p><strong>适合什么类型的公司学习：</strong></p>' + renderTags(bestFor) + '\n'; hasLessons = true; }

    const notSuitable = toArray(lessons.not_suitable_for);
    if (notSuitable.length > 0) { lessonsHtml += '<p><strong>不适合什么类型的公司：</strong></p>' + renderTags(notSuitable) + '\n'; hasLessons = true; }

    lessonsHtml += '</div>\n';
    if (hasLessons) html += lessonsHtml;
  }

  // Product sources
  const prodSources = product.sources;
  if (prodSources) {
    html += renderSources(prodSources, 5);
  }

  html += '</div>\n'; // close gtm-product-card
  return html;
}

function renderTopProducts(gtm) {
  const products = gtm.top_products;
  if (!Array.isArray(products) || products.length === 0) return '';

  const selectionRule = safeText(gtm.top_products_selection_rule, '');
  const shown = products.slice(0, 3);

  let html = '<h2>最成功产品 / 产品线</h2>\n';
  if (selectionRule) {
    html += '<p class="gtm-muted">' + escapeHtml(selectionRule) + '</p>\n';
  }
  html += '<div class="gtm-products-grid">\n';
  for (let i = 0; i < shown.length; i++) {
    html += renderProduct(shown[i], i);
  }
  html += '</div>\n';
  return html;
}

function renderLearningSummary(gtm) {
  const ls = gtm.learning_summary;
  if (!ls || typeof ls !== 'object') return '';

  const canCopy = toArray(ls.can_copy);
  const cannotCopy = toArray(ls.cannot_copy);
  const bestLessons = toArray(ls.best_lessons);
  const openQuestions = toArray(ls.open_questions);

  if (!canCopy.length && !cannotCopy.length && !bestLessons.length && !openQuestions.length) return '';

  let html = '<h2>综合学习总结</h2>\n';
  html += '<div class="gtm-grid gtm-grid-2">\n';

  if (canCopy.length > 0) {
    html += '<div class="gtm-card gtm-learn-card gtm-learn-can"><h4>可以学习</h4>' + renderList(canCopy) + '</div>\n';
  }
  if (cannotCopy.length > 0) {
    html += '<div class="gtm-card gtm-learn-card gtm-learn-cannot"><h4>不能照抄</h4>' + renderList(cannotCopy) + '</div>\n';
  }
  if (bestLessons.length > 0) {
    html += '<div class="gtm-card gtm-learn-card gtm-learn-best"><h4>最重要启发</h4>' + renderList(bestLessons) + '</div>\n';
  }
  if (openQuestions.length > 0) {
    html += '<div class="gtm-card gtm-learn-card gtm-learn-open"><h4>仍需确认的问题</h4>' + renderList(openQuestions) + '</div>\n';
  }

  html += '</div>\n';
  return html;
}

// ============================================================================
// MAIN RENDER FUNCTION
// ============================================================================

function renderGtmSection(data, options) {
  options = options || {};

  const gtm = data.gtm_extension;
  if (!gtm || typeof gtm !== 'object') {
    throw new Error('[gtm-render] Missing required field: gtm_extension');
  }

  const brandSlug = slugify(data.brand_slug || data.brand || 'brand');
  const sectionId = 'gtm-extension-' + brandSlug;

  let html = '';

  // Scoped style
  if (!options.noStyle) {
    html += '<style id="gtm-extension-style">\n';
    html += getScopedCSS();
    html += '</style>\n';
  }

  // Section wrapper
  html += '<div class="section gtm-extension" id="' + escapeAttr(sectionId) + '">\n';
  html += '<div class="section-label">GTM & Product Learning</div>\n';
  html += '<h1>增长路径与代表产品学习</h1>\n';

  // 1. Meta
  html += renderMeta(data);

  // 2. GTM summary
  html += renderSummary(gtm);

  // Divider
  html += '<hr class="divider">\n';

  // 3. Channel path
  html += renderChannelPath(gtm);

  // 4. Market entry
  html += renderMarketEntry(gtm);

  // 5. Channels table
  html += renderChannelsTable(gtm);

  // 6. Business model table
  html += renderBusinessModelTable(gtm);

  // 7. Offline and dealer
  html += renderOfflineDealer(gtm);

  // Divider
  html += '<hr class="divider">\n';

  // 8. Top products
  html += renderTopProducts(gtm);

  // 9. Learning summary
  html += renderLearningSummary(gtm);

  // 10. Global sources
  if (gtm.sources) {
    html += '<hr class="divider">\n';
    html += renderSources(gtm.sources, 10);
  }

  html += '</div>\n'; // close .section.gtm-extension

  return html;
}

// ============================================================================
// SCOPED CSS
// ============================================================================

function getScopedCSS() {
  return [
    '/* GTM Extension — scoped styles (prefixed with .gtm-extension) */',
    '',
    '.gtm-extension {',
    '  --gtm-accent: var(--accent, #C2513B);',
    '  --gtm-positive: var(--positive, #5B8C6F);',
    '  --gtm-neutral: var(--neutral, #4A6FA5);',
    '  --gtm-ink: var(--ink, #1C1C1C);',
    '  --gtm-ink-light: var(--ink-light, #555555);',
    '  --gtm-ink-muted: var(--ink-muted, #999999);',
    '  --gtm-bg-card: var(--bg-card, #FFFFFF);',
    '  --gtm-bg-stripe: var(--bg-stripe, #F5F2EC);',
    '  --gtm-border: var(--border, #E8E4DA);',
    '  --gtm-border-light: var(--border-light, #F0EDE5);',
    '  --gtm-shadow: var(--shadow, 0 1px 3px rgba(0,0,0,0.04));',
    '  --gtm-radius: var(--radius, 12px);',
    '  --gtm-radius-sm: var(--radius-sm, 8px);',
    '}',
    '',
    '.gtm-extension h2 {',
    '  font-family: \'Playfair Display\', \'Noto Serif SC\', serif;',
    '  font-size: 21px; font-weight: 700; color: var(--gtm-neutral);',
    '  margin: 28px 0 14px 0;',
    '}',
    '',
    '.gtm-extension h3.gtm-subsection-title {',
    '  font-family: \'Playfair Display\', \'Noto Serif SC\', serif;',
    '  font-size: 17px; font-weight: 700; color: var(--gtm-ink);',
    '  margin: 16px 0 10px 0;',
    '}',
    '',
    '.gtm-extension .gtm-subsection h4 {',
    '  font-family: \'Playfair Display\', \'Noto Serif SC\', serif;',
    '  font-size: 15px; font-weight: 600; color: var(--gtm-ink);',
    '  margin: 14px 0 8px 0;',
    '}',
    '',
    '/* Meta area */',
    '.gtm-extension .gtm-meta {',
    '  margin-bottom: 20px;',
    '}',
    '.gtm-extension .gtm-meta-row {',
    '  font-size: 13.5px; margin-bottom: 4px;',
    '}',
    '.gtm-extension .gtm-meta-label {',
    '  font-weight: 600; color: var(--gtm-ink);',
    '}',
    '.gtm-extension .gtm-meta-value {',
    '  color: var(--gtm-ink-light);',
    '}',
    '.gtm-extension .gtm-disclaimer {',
    '  font-size: 12px; color: var(--gtm-ink-muted);',
    '  font-style: italic; margin-top: 8px;',
    '}',
    '',
    '/* Card */',
    '.gtm-extension .gtm-card {',
    '  background: var(--gtm-bg-card);',
    '  border-radius: var(--gtm-radius);',
    '  padding: 20px 24px;',
    '  box-shadow: var(--gtm-shadow);',
    '  border: 1px solid var(--gtm-border-light);',
    '  margin-bottom: 16px;',
    '}',
    '.gtm-extension .gtm-card p {',
    '  font-size: 13.5px; color: var(--gtm-ink-light);',
    '  line-height: 1.65; margin-bottom: 8px;',
    '}',
    '',
    '/* Callout */',
    '.gtm-extension .gtm-callout {',
    '  background: #FDF6F2;',
    '  border-left: 3px solid var(--gtm-accent);',
    '  padding: 14px 20px;',
    '  margin: 16px 0;',
    '  border-radius: 0 var(--gtm-radius-sm) var(--gtm-radius-sm) 0;',
    '  font-size: 14px;',
    '  color: #5D3A2E;',
    '}',
    '.gtm-extension .gtm-callout strong {',
    '  color: var(--gtm-accent);',
    '}',
    '',
    '/* Grid */',
    '.gtm-extension .gtm-grid {',
    '  display: grid; gap: 16px; margin: 16px 0;',
    '}',
    '.gtm-extension .gtm-grid-2 {',
    '  grid-template-columns: 1fr 1fr;',
    '}',
    '',
    '/* Path */',
    '.gtm-extension .gtm-path {',
    '  display: flex; flex-wrap: wrap; align-items: center;',
    '  gap: 8px; margin: 16px 0;',
    '}',
    '.gtm-extension .gtm-path-step {',
    '  background: var(--gtm-bg-card);',
    '  border: 1px solid var(--gtm-border);',
    '  border-radius: var(--gtm-radius-sm);',
    '  padding: 8px 16px;',
    '  font-size: 13.5px;',
    '  font-weight: 500;',
    '  color: var(--gtm-ink);',
    '  white-space: nowrap;',
    '}',
    '.gtm-extension .gtm-path-arrow {',
    '  color: var(--gtm-accent);',
    '  font-size: 18px;',
    '  font-weight: 700;',
    '  flex-shrink: 0;',
    '}',
    '',
    '/* Tables */',
    '.gtm-extension .gtm-table {',
    '  width: 100%; border-collapse: collapse;',
    '  font-size: 13.5px; margin: 12px 0 20px 0;',
    '}',
    '.gtm-extension .gtm-table thead th {',
    '  background: var(--gtm-ink); color: #fff;',
    '  font-size: 10.5px; font-weight: 500;',
    '  letter-spacing: 1.5px; text-transform: uppercase;',
    '  padding: 10px 16px; text-align: left;',
    '}',
    '.gtm-extension .gtm-table tbody td {',
    '  padding: 10px 16px;',
    '  border-bottom: 1px solid var(--gtm-border);',
    '  vertical-align: middle; line-height: 1.5;',
    '}',
    '.gtm-extension .gtm-table tbody tr:nth-child(even) {',
    '  background: var(--gtm-bg-stripe);',
    '}',
    '.gtm-extension .gtm-td-label {',
    '  font-weight: 600; color: var(--gtm-ink);',
    '  white-space: nowrap;',
    '}',
    '',
    '/* Tags */',
    '.gtm-extension .gtm-tag-list {',
    '  display: flex; flex-wrap: wrap; gap: 6px;',
    '}',
    '.gtm-extension .gtm-tag {',
    '  display: inline-block;',
    '  font-size: 11.5px; padding: 3px 10px;',
    '  border-radius: 20px;',
    '  background: #FDF2EC;',
    '  color: var(--gtm-accent);',
    '  font-weight: 500;',
    '  border: 1px solid rgba(194,81,59,0.15);',
    '}',
    '.gtm-extension .gtm-tag-sm {',
    '  font-size: 10.5px; padding: 2px 7px;',
    '}',
    '',
    '/* Confidence badge */',
    '.gtm-extension .gtm-confidence {',
    '  display: inline-block;',
    '  font-size: 10px; padding: 2px 8px;',
    '  border-radius: 10px;',
    '  font-weight: 500;',
    '  text-transform: uppercase;',
    '  letter-spacing: 0.5px;',
    '}',
    '.gtm-extension .gtm-conf-high {',
    '  background: #E8F0E8; color: #3A6B47;',
    '}',
    '.gtm-extension .gtm-conf-med {',
    '  background: #F5F0E0; color: #8B6914;',
    '}',
    '.gtm-extension .gtm-conf-low {',
    '  background: #FDEEDD; color: #A04030;',
    '}',
    '',
    '/* Product card */',
    '.gtm-extension .gtm-products-grid {',
    '  display: flex; flex-direction: column; gap: 24px; margin: 16px 0;',
    '}',
    '.gtm-extension .gtm-product-card {',
    '  background: var(--gtm-bg-card);',
    '  border-radius: var(--gtm-radius);',
    '  padding: 28px 32px;',
    '  box-shadow: var(--gtm-shadow);',
    '  border: 1px solid var(--gtm-border-light);',
    '  border-top: 3px solid var(--gtm-neutral);',
    '}',
    '.gtm-extension .gtm-product-header {',
    '  display: flex; align-items: flex-start; gap: 16px;',
    '  margin-bottom: 16px; padding-bottom: 16px;',
    '  border-bottom: 1px solid var(--gtm-border-light);',
    '}',
    '.gtm-extension .gtm-product-rank {',
    '  font-family: \'Playfair Display\', \'Noto Serif SC\', serif;',
    '  font-size: 36px; font-weight: 900;',
    '  color: var(--gtm-accent);',
    '  opacity: 0.3;',
    '  line-height: 1;',
    '  flex-shrink: 0;',
    '}',
    '.gtm-extension .gtm-product-name {',
    '  font-family: \'Playfair Display\', \'Noto Serif SC\', serif;',
    '  font-size: 21px; font-weight: 700;',
    '  color: var(--gtm-ink);',
    '  margin: 0;',
    '}',
    '.gtm-extension .gtm-product-subtitle {',
    '  display: flex; align-items: center; gap: 10px;',
    '  margin-top: 4px;',
    '}',
    '.gtm-extension .gtm-product-type {',
    '  font-size: 12px; color: var(--gtm-ink-muted);',
    '  text-transform: uppercase;',
    '  letter-spacing: 1px;',
    '}',
    '',
    '/* Product subsections */',
    '.gtm-extension .gtm-subsection {',
    '  margin-bottom: 16px;',
    '}',
    '.gtm-extension .gtm-subsection p {',
    '  font-size: 13.5px; color: var(--gtm-ink-light);',
    '  line-height: 1.65; margin-bottom: 6px;',
    '}',
    '.gtm-extension .gtm-subsection ul {',
    '  margin: 6px 0 6px 18px;',
    '  font-size: 13.5px; color: var(--gtm-ink-light);',
    '  line-height: 1.65;',
    '}',
    '.gtm-extension .gtm-subsection ul li {',
    '  margin-bottom: 3px;',
    '}',
    '',
    '/* Key events */',
    '.gtm-extension .gtm-key-events {',
    '  margin: 8px 0;',
    '}',
    '.gtm-extension .gtm-event-item {',
    '  padding: 8px 0;',
    '  border-bottom: 1px dotted var(--gtm-border-light);',
    '  font-size: 13.5px;',
    '}',
    '.gtm-extension .gtm-event-date {',
    '  font-weight: 600; color: var(--gtm-neutral);',
    '  margin-right: 8px;',
    '}',
    '.gtm-extension .gtm-event-text {',
    '  color: var(--gtm-ink-light);',
    '}',
    '',
    '/* Learning summary cards */',
    '.gtm-extension .gtm-learn-card {',
    '  padding: 20px 24px;',
    '}',
    '.gtm-extension .gtm-learn-card h4 {',
    '  font-family: \'Playfair Display\', \'Noto Serif SC\', serif;',
    '  font-size: 16px; font-weight: 700;',
    '  margin: 0 0 10px 0;',
    '}',
    '.gtm-extension .gtm-learn-can h4 { color: var(--gtm-positive); }',
    '.gtm-extension .gtm-learn-cannot h4 { color: var(--gtm-accent); }',
    '.gtm-extension .gtm-learn-best h4 { color: var(--gtm-neutral); }',
    '.gtm-extension .gtm-learn-open h4 { color: #B8860B; }',
    '',
    '/* Lessons section */',
    '.gtm-extension .gtm-lessons {',
    '  background: #FAFAF7;',
    '  border-radius: var(--gtm-radius-sm);',
    '  padding: 16px 20px;',
    '  border: 1px solid var(--gtm-border-light);',
    '}',
    '',
    '/* Source list */',
    '.gtm-extension .gtm-source-list {',
    '  margin-top: 8px;',
    '}',
    '.gtm-extension .gtm-source-list ol {',
    '  margin: 8px 0 8px 20px;',
    '  font-size: 12.5px; color: var(--gtm-ink-light);',
    '  line-height: 1.7;',
    '}',
    '.gtm-extension .gtm-source-list ol li {',
    '  margin-bottom: 3px;',
    '}',
    '.gtm-extension .gtm-source-list a {',
    '  color: var(--gtm-neutral);',
    '  text-decoration: none;',
    '}',
    '.gtm-extension .gtm-source-list a:hover {',
    '  text-decoration: underline;',
    '}',
    '',
    '/* Muted text */',
    '.gtm-extension .gtm-muted {',
    '  color: var(--gtm-ink-muted);',
    '  font-size: 12px;',
    '}',
    '',
    '/* Responsive */',
    '@media (max-width: 768px) {',
    '  .gtm-extension .gtm-grid-2 {',
    '    grid-template-columns: 1fr;',
    '  }',
    '  .gtm-extension .gtm-product-card {',
    '    padding: 20px;',
    '  }',
    '  .gtm-extension .gtm-product-rank {',
    '    font-size: 28px;',
    '  }',
    '}',
    '',
  ].join('\n');
}

// ============================================================================
// ENTRY POINT
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

  if (!args.jsonPath) {
    console.error('[gtm-render] Missing JSON file path.');
    console.error('Run with --help for usage.');
    process.exit(1);
  }

  // Read JSON file
  let raw;
  try {
    raw = fs.readFileSync(args.jsonPath, 'utf-8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error('[gtm-render] File not found: ' + args.jsonPath);
    } else {
      console.error('[gtm-render] Cannot read file: ' + args.jsonPath + ' — ' + err.message);
    }
    process.exit(1);
  }

  // Parse JSON
  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    console.error('[gtm-render] Invalid JSON: ' + err.message);
    process.exit(1);
  }

  if (!data || typeof data !== 'object') {
    console.error('[gtm-render] JSON root is not an object.');
    process.exit(1);
  }

  if (!data.gtm_extension || typeof data.gtm_extension !== 'object') {
    console.error('[gtm-render] Missing required field: gtm_extension.');
    process.exit(1);
  }

  // Render
  const html = renderGtmSection(data, { noStyle: args.noStyle });

  // Output
  if (args.outPath) {
    const outDir = path.dirname(args.outPath);
    if (outDir && outDir !== '.' && !fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    fs.writeFileSync(args.outPath, html, 'utf-8');
    console.error('[gtm-render] Wrote: ' + args.outPath);
  } else {
    process.stdout.write(html);
  }
}

main(process.argv);
