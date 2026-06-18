const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'data', 'gtm');

function src(title, url, source_type = 'media') {
  return { title, url, source_type, confidence: 'medium' };
}

function price(product_price, subscription_fee, accessory_service_fee, competitor_price, sources) {
  return { product_price, subscription_fee, accessory_service_fee, competitor_price, sources };
}

function product(name, type, rank, why_selected, innovation, pricing_model, sources) {
  return {
    name,
    type,
    rank,
    confidence: 'medium',
    why_selected,
    origin_story: '该产品线是品牌 GTM 的主要承载物，负责把定位、价格、渠道和交付能力变成用户可购买的方案。',
    pre_market: '上市或预售前的关键动作是明确用户要替代什么：私教、健身房、精品团课、拳击馆、赛事报名，还是一台传统器械。',
    innovation,
    breakout: '突破点不只在产品参数，而在价格结构、渠道叙事和真实用户可验证的交付结果。',
    customer_impact: '用户购买时会同时计算硬件价、配件价、服务费、软件/订阅边界、竞品总成本和售后风险。',
    ecosystem_impact: '它改变了同类品牌解释价值的方式：要么证明自己更专业，要么证明自己总拥有成本更低。',
    pricing_model,
    lessons: {
      what_to_learn: [
        '先把用户的替代对象讲清楚，再决定硬件复杂度和渠道顺序。',
        '价格表必须包含产品本体、配件/服务、软件/订阅和竞品总成本。',
        'GTM 的重点不是曝光，而是让用户相信交付、售后和长期内容能兑现。'
      ],
      do_not_copy_blindly: [
        '不要把众筹、疫情红利或媒体报道当成长期留存。',
        '不要在没有可靠来源时补写创始人自筹金额、单台毛利或亏损数字。'
      ]
    },
    sources
  };
}

function founder(name, role, background_summary, profile_links) {
  return { name, role, background_summary, profile_links };
}

function capital(date, event, amount, currency, description, source) {
  return { date, event, amount, currency, description, source, confidence: 'medium' };
}

function brand(input) {
  return {
    brand: input.brand,
    brand_slug: input.slug,
    market_focus: input.market || 'US / Global',
    report_type: 'gtm_extension',
    version: '1.0',
    generated_by: 'AI-assisted public-source research; fitness GTM repair 2026-06-17',
    disclaimer: 'This GTM extension uses public sources and local base-report facts. Private-company revenue, founder self-funding, unit economics and losses are included only when a source gives a concrete amount; unsupported amounts are deliberately omitted.',
    brand_context: {
      founder_background: input.founders.map((f) => `${f.name}: ${f.background_summary}`),
      brand_timeline: input.capital.map((e) => `${e.date}: ${e.event} ${e.amount} - ${e.description}`),
      founder_profiles: input.founders,
      capital_history: input.capital,
      research_gaps: input.research_gaps
    },
    gtm_extension: {
      summary: input.summary,
      one_sentence_gtm: input.summary.split('。')[0] + '。',
      channel_path: input.channel_path,
      channels: input.channels,
      business_model: input.business_model,
      top_products_selection_rule: '最多选 3 个产品线；按用户购买决策、价格结构、GTM 学习价值和公开证据选择。',
      top_products: input.products,
      learning_summary: input.learning_summary,
      evidence_boundary: '没有可靠金额来源的创始人自筹、单台毛利、广告花费、退货损失不写入事实表，只在研究缺口中说明。',
      sources: input.sources
    }
  };
}

const tonal = [
  src('Tonal 2 official product page', 'https://tonal.com/products/tonal-2', 'official'),
  src('Tonal membership official page', 'https://tonal.com/pages/membership', 'official'),
  src('WIRED Tonal 2 review', 'https://www.wired.com/review/tonal-2-home-gym/', 'review'),
  src('Tonal company site', 'https://www.tonal.com/', 'official'),
  src('Tonal Crunchbase profile', 'https://www.crunchbase.com/organization/tonal', 'database'),
  src('Aly Orady LinkedIn', 'https://www.linkedin.com/in/alyorady/', 'linkedin'),
  src('Tonal Trustpilot', 'https://www.trustpilot.com/review/tonal.com', 'review'),
  src('L Catterton', 'https://www.lcatterton.com/', 'official')
];
const speed = [
  src('Speediance official home', 'https://www.speediance.com/', 'official'),
  src('Speediance Gym Monster 2 official page', 'https://www.speediance.com/pages/gym-monster-2', 'official'),
  src('Speediance Wellness+ official page', 'https://www.speediance.com/pages/wellness-ai-personal-trainer', 'official'),
  src('WIRED Speediance Gym Monster 2 review', 'https://www.wired.com/review/speediance-gym-monster-2/', 'review'),
  src('Tom’s Guide Speediance review', 'https://www.tomsguide.com/wellness/fitness/i-tried-the-speediance-gym-monster-2-heres-what-i-love-and-dont', 'review'),
  src('Speediance public profile', 'https://en.wikipedia.org/wiki/Speediance_Life_Technology_Inc.', 'media'),
  src('Speediance Crunchbase profile', 'https://www.crunchbase.com/organization/speediance', 'database'),
  src('Speediance Trustpilot', 'https://www.trustpilot.com/review/speediance.com', 'review')
];
const aeke = [
  src('AEKE official home', 'https://aeke.com/', 'official'),
  src('AEKE K1 official product page', 'https://aeke.com/products/buy-aeke-k1', 'official'),
  src('AEKE About Us', 'https://aeke.com/pages/about-us', 'official'),
  src('AEKE Fitness Bench B1 official page', 'https://aeke.com/products/buy-aeke-b1', 'official'),
  src('AEKE Smart Accessories official page', 'https://aeke.com/collections/accessories', 'official'),
  src('T3 AEKE Smart Home Gym review', 'https://www.t3.com/active/aeke-smart-home-gym-review-i-tried', 'review'),
  src('AEKE Kickstarter campaign link from official nav', 'https://www.kickstarter.com/projects/aeke/aeke-s1-pro-full-body-ai-home-gym', 'marketplace'),
  src('AEKE Trustpilot', 'https://www.trustpilot.com/review/aeke.com', 'review')
];
const peloton = [
  src('Peloton official site', 'https://www.onepeloton.com/', 'official'),
  src('Peloton app membership', 'https://www.onepeloton.com/app-membership', 'official'),
  src('Peloton SEC filings', 'https://investor.onepeloton.com/financial-information/sec-filings', 'filing'),
  src('Peloton Interactive public profile', 'https://en.wikipedia.org/wiki/Peloton_Interactive', 'media'),
  src('John Foley profile', 'https://en.wikipedia.org/wiki/John_Foley_(executive)', 'media'),
  src('Business Insider Peloton history', 'https://www.businessinsider.com/peloton-company-history-rise-fall-2022-2', 'media'),
  src('Investopedia Peloton revenue model', 'https://www.investopedia.com/insights/how-peloton-makes-money/', 'media'),
  src('Peloton Trustpilot', 'https://www.trustpilot.com/review/onepeloton.com', 'review')
];
const fight = [
  src('FightCamp official site', 'https://joinfightcamp.com/', 'official'),
  src('FightCamp YC company page', 'https://www.ycombinator.com/companies/fightcamp', 'database'),
  src('TechCrunch FightCamp $90M round', 'https://techcrunch.com/2021/06/30/fightcamp-punches-its-way-to-a-90m-round/', 'media'),
  src('WIRED FightCamp review', 'https://www.wired.com/review/fightcamp-home-boxing-workouts/', 'review'),
  src('FightCamp Help Center', 'https://fightcamp.zendesk.com/', 'official'),
  src('FightCamp App Store', 'https://apps.apple.com/us/app/fightcamp-home-boxing-workouts/id1329666333', 'marketplace'),
  src('FightCamp Crunchbase profile', 'https://www.crunchbase.com/organization/hykso', 'database'),
  src('FightCamp Trustpilot', 'https://www.trustpilot.com/review/joinfightcamp.com', 'review')
];
const growl = [
  src('GROWL official site', 'https://www.joingrowl.com/', 'official'),
  src('The Verge GROWL pricing and product report', 'https://www.theverge.com/2024/12/4/24305788/growl-boxing-punching-bag-interactive-trainer-fitness', 'media'),
  src('TechCrunch GROWL seed funding report', 'https://techcrunch.com/2024/12/04/growl-is-building-the-peloton-of-boxing/', 'media'),
  src('Athletech News GROWL funding coverage', 'https://athletechnews.com/growl-raises-4-75m-for-boxing-bag-that-puts-a-coach-in-your-living-room/', 'media'),
  src('VentureBeat GROWL AI boxing coverage', 'https://venturebeat.com/ai/growl-is-an-ai-interactive-boxing-coach-to-punch-up-your-family-workouts/', 'media'),
  src('Fast Company GROWL product coverage', 'https://www.fastcompany.com/91242504/this-ai-powered-punching-bag-looks-like-the-future-of-fitness', 'media'),
  src('GROWL Kickstarter', 'https://www.kickstarter.com/projects/joingrowl/growl-the-ai-powered-boxing-and-fitness-coach', 'marketplace'),
  src('GROWL Linktree / signup', 'https://linktr.ee/joingrowl', 'official')
];
const hyrox = [
  src('HYROX official global site', 'https://hyrox.com/', 'official'),
  src('HYROX US official site', 'https://hyroxus.com/', 'official'),
  src('HYROX find my race', 'https://hyrox.com/find-my-race/', 'official'),
  src('HYROX365 affiliation', 'https://www.hyrox365.com/', 'official'),
  src('The Times HYROX business profile', 'https://www.thetimes.com/business/companies-markets/article/inside-hyrox-the-high-intensity-fitness-craze-gripping-the-city-f8dxnt5br', 'media'),
  src('HYROX public profile', 'https://en.wikipedia.org/wiki/Hyrox', 'media'),
  src('Moritz Fuerste public profile', 'https://en.wikipedia.org/wiki/Moritz_F%C3%BCrste', 'media'),
  src('HYROX official shop', 'https://us.hyrox-shop.com/', 'marketplace')
];

const sharedChannels = {
  dtc: '官方独立站或官方票务页承接高意向购买。',
  pr_media: '评测、报道、创始人资料和公开数据库提供基础信任。',
  community: '用户评价、成绩榜、课程社区或赛事照片决定口碑扩散。',
  partners: '经销商、合作健身房、顾问、赞助商或明星投资人提供第二层信任。',
  service: '售后、安装、退换、维修和交付节奏决定高客单价是否可持续。'
};

const reports = [
  brand({
    brand: 'AEKE',
    slug: 'aeke',
    summary: 'AEKE 的 GTM 核心是用“AI 私教镜 + 买断制 + 众筹验证”切入高端家庭力量训练。它不是先靠 VC 烧钱铺渠道，而是用 Kickstarter、设计奖、媒体评测和官方独立站把早期需求压缩成预售订单；优势是零强制订阅和客厅友好形态，风险是线缆结构、软件成熟度、真实社区声量和售后交付都还在早期。',
    channel_path: ['中国供应链和创始团队自有资源立项', 'Kickstarter/TCF 做海外预热和早鸟转化', '独立站承接高客单价购买', '媒体评测与体育明星背书建立信任', '售后、软件 OTA 和用户社区决定复购与口碑'],
    channels: { ...sharedChannels, crowdfunding: 'Kickstarter 提供早期 PMF 验证和第一批现金流。' },
    business_model: { revenue_streams: ['K1 硬件买断', 'Bench 与智能配件', '未来软件/课程可选增值'], pricing_logic: '用 $3,298-$3,498 锚定低于 Tonal 总成本、接近 Speediance 的高端带。', channel_economics: '众筹降低冷启动库存风险，但后续获客成本和售后成本会变成核心考验。' },
    products: [
      product('AEKE Smart Home Gym K1', 'smart_home_gym', 1, '核心收入与品牌识别产品。', '43 英寸 4K 镜面、AI 实时指导、220lb 数字阻力、无强制订阅。', price('$3,298 K1 Complete Set；$3,398-$3,498 含不同 Bench 组合；官方页显示原价 $4,798 与限时折扣。', 'No mandatory subscription / 无强制订阅；官方产品页写明 No Subscription Required 与 Lifetime Free 内容。', 'Bench B1/B3、Smart Grips、Barbell、Heart Rate Armband、Scale、backup cords 等配件随套装或单卖；例如 Extender Belt $99、Barbell Squat Pad $69。', 'Competitor price comparison: Speediance Gym Monster 2 $3,390-$4,799；Tonal 2 $4,295 + $495 accessories + $59.95/mo membership；FightCamp packages start $299；Growl $4,500 + $60/mo.', [aeke[1], aeke[3], tonal[0], speed[1], fight[0], growl[1]]), [aeke[1], aeke[5]]),
      product('AEKE Bench / Smart Accessories', 'accessory_stack', 2, '高客单价硬件必须靠配件完成动作覆盖。', '蓝牙配件和身体评估补齐 AI 私教叙事。', price('Bench 套装官方价 $3,398-$3,498；配件单品页面显示 B1/Smart Accessories。', 'No mandatory subscription；课程和动作库作为买断设备体验的一部分。', 'Accessory/service price: Extender Belt $99、Barbell Squat Pad $69、Workout Towel $69；售后备用绳和配件需要明确。', 'Competitor accessory price comparison: Tonal Essential Accessories Bundle $495；Speediance Works/Family Plus 价差覆盖 bench/rower/barbell；FightCamp Elite 包含 bag/gloves/HR monitor。', [aeke[3], aeke[4], tonal[0], speed[1], fight[0]]), [aeke[3], aeke[4]]),
      product('AEKE Kickstarter campaign', 'crowdfunding_offer', 3, '众筹是 AEKE 的冷启动渠道，不只是销售渠道。', '把无 VC 叙事转化为“由用户验证”的品牌资产。', price('Base report records about $1.52M from 635+ backers; pledge tiers varied by package.','No mandatory subscription signal remains a core campaign selling point.','Accessory/service price: pledge bundles included K1 sets, bench and smart accessories; shipping/tax vary by region.','Competitor crowdfunding comparison: Speediance 2021 Kickstarter about $560K; Growl Kickstarter early-bird hardware around $2,449 versus MSRP about $4,500; Tonal/Peloton did not rely on Kickstarter for the current flagship model.', [aeke[6], speed[5], growl[6], aeke[1]]), [aeke[6], aeke[5]])
    ],
    founders: [
      founder('钟质峰 Peter', 'Co-founder / CEO', '本地报告显示其来自 OPPO 渠道与教育科技创业积累；未把个人自筹金额写成事实。', [aeke[2]]),
      founder('龙春泠 Loong', 'Co-founder / COO', '本地报告记录其有在线教育创业背景并参与 2022 年 AEKE 项目启动；未找到可靠个人金额披露。', [aeke[2]]),
      founder('范炜 Richard', 'Co-founder / CTO', '负责 AI 视觉、骨骼追踪和数字阻力相关技术；个人履历金额不写入事实表。', [aeke[0]])
    ],
    capital: [
      capital('2025-01', 'crowdfunding', '$1.52M', 'USD', 'Kickstarter 众筹约 $1.52M，635+ 支持者，是公开可见的主要外部资金信号。', aeke[6]),
      capital('2026', 'product_price', '$3,298-$3,498', 'USD', 'AEKE K1 官方独立站显示 K1 Complete Set 与 Bench 组合价格。', aeke[1])
    ],
    research_gaps: ['没有找到可靠来源披露三位创始人各自出资金额。', '没有找到经审计营收、毛利、退货损失或售后成本。'],
    sources: aeke,
    learning_summary: ['AEKE 的第一性原理是让用户相信一台高客单 AI 硬件能替代部分私教。', '无强制订阅是清晰优势，但也意味着硬件毛利必须覆盖内容和软件维护。', '找不到的资金细节不能补想象，应该留在研究缺口。']
  }),
  brand({
    brand: 'Speediance',
    slug: 'speediance',
    summary: 'Speediance 的 GTM 是“深圳硬件效率 + 无强制订阅 + DTC/众筹验证”对 Tonal 强订阅模式的正面攻击。它用较少融资做出可比高端设备，靠 Gym Monster 2、可折叠免安装、全球评测和社区口碑建立信任；风险集中在专利诉讼、区域售后差异、软件体验和长期内容投入。',
    channel_path: ['Kickstarter 验证第一批硬核健身用户', '独立站/Amazon/区域经销商多渠道出货', '评测媒体和社群建立“更自由的 Tonal 替代品”心智', '无强制订阅降低购买阻力', 'Wellness+ 做可选增值而非锁死'],
    channels: { ...sharedChannels, ecommerce: 'Amazon/区域站与经销商扩展覆盖。' },
    business_model: { revenue_streams: ['Gym Monster / Gym Monster 2 硬件', '配件与套装升级', 'Wellness+ 可选订阅', '经销商/零售合作'], pricing_logic: '用 $2,499-$4,799 覆盖从入门到 2S 高配，并用无强制订阅对比 Tonal。', channel_economics: '硬件毛利和深圳供应链效率承担大部分商业模型压力。' },
    products: [
      product('Gym Monster 2 / 2S', 'smart_strength_machine', 1, '旗舰产品，直接对比 Tonal 2 和 AEKE K1。', '220lb 数字阻力、免钻墙、可折叠、多滑轮高度、丰富配件。', price('Official page shows Gym Monster 2 configurations around $3,390-$4,799 and legacy Gym Monster around $2,499-$3,249 during sale windows.', 'Core workouts and tracking are usable without mandatory subscription; Wellness+ is optional.', 'Accessory/service price: Works/Works Plus/Family Plus price differences include bench, rower, barbell, straps and rings; Smart Scale $108, Bluetooth Ring pack $99, PowerGrip $179 from official store.', 'Competitor price comparison: Tonal 2 $4,295 + $495 accessories + $59.95/mo; AEKE K1 $3,298-$3,498 no mandatory subscription; Growl $4,500 + $60/mo; FightCamp packages start $299.', [speed[1], speed[0], tonal[0], aeke[1], growl[1], fight[0]]), [speed[1], speed[3]]),
      product('Wellness+', 'optional_subscription', 2, '证明 Speediance 不是没有软件商业化，而是不把软件变成购买门槛。', '把可选订阅做成增强项。', price('Wellness+ pricing in local base report: $19.99/month or $119.88/year; official page is the current plan source.', 'Optional subscription/software fee; no mandatory subscription for core device use.', 'Accessory/service price: app/service bundled with hardware; no installation drilling fee like Tonal.', 'Competitor subscription comparison: Tonal $59.95/mo 12-month commitment; Peloton All-Access $49.99/mo; FightCamp legacy $39/mo; Growl planned $60/mo.', [speed[2], tonal[1], peloton[0], fight[2], growl[1]]), [speed[2], speed[0]]),
      product('VeloNix / ecosystem expansion', 'cardio_line', 3, 'Speediance 从力量设备向完整家庭健身生态扩展的信号。', '将力量、骑行、AI 训练和配件归入一个账号生态。', price('VeloNix official product page is current source; exact sale price changes by campaign.', 'Subscription/software boundary: Wellness+ optional, not a mandatory Peloton-style lock.', 'Accessory/service price: bike accessories and maintenance differ from GM2; shipping/return/warranty need逐项核算。', 'Competitor price comparison: Peloton Bike official homepage financing footnote uses $1,695 for Cross Training Bike and $2,695 for Bike+; Speediance must win on bundle value, not just lower price.', [speed[0], peloton[0]]), [speed[0], peloton[0]])
    ],
    founders: [founder('刘韬 Liu Tao', 'Founder / CEO', '公开资料列为 Speediance 创始人；本地报告记录其来自 FITURE/极米产品背景，具备众筹和硬件产品经验。', [speed[5], src('Speediance About Us', 'https://www.speediance.com/pages/about-us', 'official')]), founder('俞健 Yu Jian', 'COO', '本地报告记录其有华为/阿里/百度背景，并与刘韬有日本众筹项目合作经历。', [src('Speediance About Us', 'https://www.speediance.com/pages/about-us', 'official')])],
    capital: [capital('2021', 'crowdfunding', '$560K', 'USD', 'Gym Monster 早期 Kickstarter 约 $560K，是第一批海外需求验证。', speed[5]), capital('2022-2023', 'funding', '$13.6M', 'USD', '本地报告和数据库资料记录 Speediance 累计融资约 $13.6M。', speed[6]), capital('2024', 'revenue', '$49M', 'USD', '本地报告记录 2024 年营收约 $49M；私营公司数字需按中等置信度使用。', speed[5])],
    research_gaps: ['创始人个人自筹金额未见可靠公开金额。', '单台毛利、CAC、退货损失和专利诉讼费用没有可靠公开金额。'],
    sources: speed,
    learning_summary: ['Speediance 的关键学习是用商业模式攻击竞品痛点。', '无强制订阅只有在硬件体验扎实时才成立。', '售后和软件会决定它是挑战者还是领导者。']
  }),
  brand({
    brand: 'Tonal',
    slug: 'tonal',
    summary: 'Tonal 的 GTM 是“高技术壁垒硬件 + 强制会员 + 专业安装”的典型硅谷 connected fitness 模型。它用电磁阻力、AI 自动调重和明星投资人建立高端心智，但过度融资、疫情后需求回落、售后差评和订阅锁死让估值从峰值大幅回撤。真正要学的是硬件护城河如何与订阅压力互相放大。',
    channel_path: ['创始人个人问题驱动原型', 'VC 融资推动硬件与内容团队扩张', '明星股东和高端家庭定位建立品牌', '专业安装和会员锁定形成高 ARPU', 'PE 接管后转向效率和盈利'],
    channels: { ...sharedChannels, showroom: '体验和专业安装前置降低高价疑虑。', content: '会员是核心功能入口。' },
    business_model: { revenue_streams: ['Tonal 2 硬件', 'Essential Accessories Bundle', '$59.95/mo membership', '租赁方案', '安装/保修服务'], pricing_logic: '先用 $4,295 硬件锁定高端，再用强制会员回收长期软件价值。', channel_economics: '高订阅留存换来高 ARR，但硬件故障和安装成本拖累口碑。' },
    products: [
      product('Tonal 2', 'smart_strength_machine', 1, '核心旗舰和收入锚点。', '250lb 数字阻力、摄像头反馈、动态重量模式。', price('$4,295 official regular price.', '$59.95/mo membership required for 12 months; active membership needed for most features.', 'Essential Accessories Bundle $495 value; white-glove installation starts at $295; extended warranty optional.', 'Competitor price comparison: Speediance GM2 $3,390-$4,799 with optional Wellness+; AEKE K1 $3,298-$3,498 no mandatory subscription; Peloton Bike+ $2,695 plus All-Access; Growl $4,500 plus $60/mo.', [tonal[0], tonal[1], speed[1], aeke[1], peloton[0], growl[1]]), [tonal[0], tonal[1]]),
      product('Tonal Membership', 'subscription', 2, '会员决定设备智能体验和 ARR。', '自动进度追踪、个性化训练、动态重量模式和课程库。', price('Membership purchased separately from hardware.', '$59.95/month plus tax with 12-month initial commitment.', 'Service/accessory price: installation starts at $295; accessories $495; repair/warranty costs需按订单政策核算。', 'Competitor subscription comparison: Peloton All-Access $49.99/mo; Speediance Wellness+ optional $19.99/mo; FightCamp legacy $39/mo; Growl planned $60/mo.', [tonal[1], peloton[0], speed[2], fight[2], growl[1]]), [tonal[1], tonal[2]]),
      product('Tonal 1 Certified Refurbished / accessories', 'refurbished_and_accessory', 3, '在高价旗舰之外提供较低入门和配件货架。', '翻新机保留核心数字阻力但规格低于 Tonal 2。', price('Tonal official comparison shows Certified Refurbished Tonal 1 at $2,495.', 'Membership remains required for personalized experience.', 'Accessory/service price: Essential Accessories Bundle $495 value; installation still professional.', 'Competitor price comparison: used Peloton requires possible activation fee; Speediance older Gym Monster sale prices around $2,499-$3,249; AEKE has no refurb channel visible.', [tonal[0], peloton[0], speed[1], aeke[1]]), [tonal[0], tonal[1]])
    ],
    founders: [founder('Aly Orady', 'Founder / former CEO / CTO', 'Computer engineer with HP/Sun/Samsung background; founded Tonal after personal health transformation and strength-training prototype work.', [tonal[5], tonal[3]])],
    capital: [capital('2016', 'seed', '$1.5M', 'USD', 'Seed round recorded in local report; used as first outside-money signal.', tonal[4]), capital('2021-03', 'funding', '$250M', 'USD', 'Series E at about $1.6B valuation marked peak connected-fitness funding environment.', tonal[4]), capital('2023-04', 'funding', '$130M', 'USD', 'Series F led by L Catterton with valuation reset around $550M-$600M in local report.', tonal[7]), capital('2023', 'vendor_claim', '$500K', 'USD', 'Local report records Foxconn claim around $500K unpaid amount; use only as legal-risk signal before primary filing review.', src('CourtListener Tonal Foxconn search', 'https://www.courtlistener.com/?q=Tonal%20Foxconn', 'filing'))],
    research_gaps: ['Founder self-funded amount before seed round is not reliably sourced.', 'Profitability and hardware failure cost are not reliably disclosed.'],
    sources: tonal,
    learning_summary: ['Tonal 的产品护城河真实，但高价格和锁死订阅削弱口碑。', '融资多不是优势，融资超过估值会变成压力。', '强订阅会给无强制订阅竞品创造切入口。']
  }),
  brand({
    brand: 'Peloton',
    slug: 'peloton',
    summary: 'Peloton 的 GTM 是“内容工作室 + 互联硬件 + 社区排行榜”的经典案例：它把精品团课搬进家里，用 Bike/Tread/Row 承接高频内容消费，再用 All-Access 会员变成经常性收入。它的问题不是用户不爱产品，而是疫情期间把短期需求当成永久趋势，导致库存、裁员、召回、债务和估值回撤。',
    channel_path: ['Kickstarter 和天使投资验证第一辆车', '纽约工作室和明星教练制造内容心智', 'DTC + 门店体验推动高客单硬件', 'All-Access 会员形成家庭账号与社区网络效应', '疫情后从硬件增长转向订阅、AI 和企业/酒店场景'],
    channels: { ...sharedChannels, retail: '历史上门店/showroom 承担体验转化。', filings: '上市公司财报提供真实财务审计。' },
    business_model: { revenue_streams: ['Bike/Bike+', 'Tread/Tread+', 'Row+', 'All-Access membership', 'App membership', '配件/服饰/安装/保修'], pricing_logic: '硬件降门槛，会员提高 LTV；2025/2026 Cross Training 系列重新上调价格。', channel_economics: '订阅毛利支撑公司，硬件毛利和库存风险曾拖累现金流。' },
    products: [
      product('Cross Training Bike / Bike+', 'connected_bike', 1, '品牌心智和用户规模最大的硬件入口。', '硬件 + 屏幕 + 实时课 + 排行榜组合。', price('Peloton homepage financing footnote lists Cross Training Bike at $1,695 and Bike+ at $2,695; refurbished Bike/Bike+ as low as $1,145/$1,395.', 'Peloton All-Access Membership required for all content/features on hardware; public profile and current site indicate $49.99/mo in the US.', 'Accessory/service price: accessories, taxes, delivery/installation and possible return fees are separate; used equipment may face activation/onboarding fees per local report.', 'Competitor price comparison: Tonal 2 $4,295 + $59.95/mo; Speediance GM2 $3,390-$4,799 no mandatory subscription; FightCamp starts $299; Growl $4,500 + $60/mo.', [peloton[0], peloton[1], tonal[0], speed[1], fight[0], growl[1]]), [peloton[0], peloton[3]]),
      product('Tread / Tread+', 'connected_tread', 2, '高客单扩品类代表，也暴露安全和召回风险。', '大屏、课程、训练计划和 Peloton IQ。', price('Peloton homepage footnote lists Tread at $3,295 and Tread+ at $6,695.', 'All-Access Membership required on hardware; current signal $49.99/mo US.', 'Accessory/service price: delivery, haulaway, accessories, warranty and return fee may apply.', 'Competitor price comparison: Growl four-year plan $7,200 is close to premium treadmill total cost; Tonal and Speediance compete for strength budget rather than running budget.', [peloton[0], peloton[1], growl[1], tonal[0], speed[1]]), [peloton[0], peloton[2]]),
      product('All-Access / App Membership', 'subscription', 3, 'Peloton 真正的长期资产是内容订阅和社区。', '多学科内容、AI 计划、家庭账号。', price('App membership pricing is on official app-membership page; All-Access public profile gives $49.99/mo US.', 'Subscription/software fee: All-Access for hardware; App-only lower tiers for non-equipment users.', 'Accessory/service price: no required hardware accessory for App; hardware users still pay equipment and service fees.', 'Competitor subscription comparison: Tonal $59.95/mo required; Speediance Wellness+ optional $19.99/mo; FightCamp $39/mo legacy; Growl planned $60/mo.', [peloton[1], tonal[1], speed[2], fight[2], growl[1]]), [peloton[1], peloton[6]])
    ],
    founders: [founder('John Foley', 'Co-founder / former CEO', 'Former Barnes & Noble executive; co-founded Peloton in 2012 with Tom Cortese, Yony Feng, Hisao Kushi and Graham Stanton.', [peloton[4], peloton[3]]), founder('Tom Cortese, Yony Feng, Hisao Kushi, Graham Stanton', 'Co-founders', 'Peloton co-founding group; several came from media/internet operating backgrounds.', [peloton[3], peloton[5]])],
    capital: [capital('2012-02', 'seed', '$400K', 'USD', 'Early seed funding before the first connected bike campaign.', peloton[3]), capital('2012-12', 'funding', '$3.5M', 'USD', 'Additional early financing recorded in public company history.', peloton[3]), capital('2013', 'crowdfunding', '$1,500 early-bird bike price', 'USD', 'Kickstarter early-bird price anchored first product demand.', peloton[3]), capital('2019-09', 'ipo', '$1.16B', 'USD', 'IPO raised about $1.16B at about $8.1B valuation.', peloton[3]), capital('2025', 'loss', '$119M', 'USD', 'FY2025 net loss in public financial profile; annual report should be used for exact filing values.', peloton[2])],
    research_gaps: ['Exact customer acquisition cost by period and product line requires filings/paid datasets.', 'Founder personal cash contribution before seed is not reliable enough to write.'],
    sources: peloton,
    learning_summary: ['Peloton 证明内容和社区能卖硬件。', '疫情红利不能当长期增长率。', '上市公司报告比二手文章更值得作为财务底座。']
  }),
  brand({
    brand: 'FightCamp',
    slug: 'fightcamp',
    summary: 'FightCamp 的 GTM 是“真实拳击器材 + 传感器追踪 + 订阅课程”的垂直化 Peloton。它不像 Growl 那样押注昂贵投影硬件，也不像 Peloton 那样覆盖全运动，而是把用户的拳击动机、可量化击打数据和名人/拳手背书组合成家庭拳击训练系统。重点是垂直场景如何用更低硬件门槛换取持续训练数据。',
    channel_path: ['Hykso 传感器硬件起步', 'YC 背书和早期硬件用户验证', '转向 FightCamp 订阅内容和完整套装', '名人拳手和 $90M 融资扩大声量', '当前用更低入门包和 App/AI Motion 延续转化'],
    channels: { ...sharedChannels, yc: 'YC 页面提供创始人和早期公司信任。', celebrity: '拳王和 UFC 投资人带来品类权威。' },
    business_model: { revenue_streams: ['Connect/Core/Elite packages', 'App membership', '配件/服饰', 'B2B gym offering'], pricing_logic: '用 $299+ 入门降低尝试门槛，过去完整套装可达 $1,219-$1,349。', channel_economics: '硬件比 Growl/Tonal 轻，内容和会员承担长期价值。' },
    products: [
      product('FightCamp Connect / Core / Elite', 'boxing_package', 1, '当前官网主转化产品线。', 'Console + trackers + wraps + optional bag/gloves/HR monitor。', price('Current official site says packages starting at $299; TechCrunch/WIRED historical kit prices ranged $439-$1,349 and Personal package around $1,219.', 'Legacy membership in TechCrunch/WIRED: $39/month for streaming workouts; current official account pages should confirm active plans.', 'Accessory/service price: Elite includes free-standing bag, bag ring, boxing gloves, heart-rate monitor; Connect excludes bag for users with existing gear.', 'Competitor price comparison: Growl $4,500 + $60/mo or $150-$190/mo financing; Peloton Bike $1,695 + $49.99/mo; Tonal 2 $4,295 + $59.95/mo; Speediance GM2 $3,390-$4,799 no mandatory subscription.', [fight[0], fight[2], fight[3], growl[1], peloton[0], tonal[0], speed[1]]), [fight[0], fight[2]]),
      product('FightCamp App / tracking content', 'subscription_content', 2, '数据化拳击课程是复购核心。', '传感器把拳击变成可量化游戏。', price('App access bundled or sold with membership depending on plan.', 'Subscription/software fee: historical $39/mo membership for workouts and tutorials.', 'Accessory/service price: trackers, wraps, gloves and bag are required for full metric experience.', 'Competitor subscription comparison: Peloton $49.99/mo All-Access; Tonal $59.95/mo; Speediance optional $19.99/mo; Growl planned $60/mo.', [fight[2], fight[3], peloton[1], tonal[1], speed[2], growl[1]]), [fight[1], fight[3]]),
      product('FightCamp at the Gym / B2B extension', 'b2b_extension', 3, '说明 FightCamp 不只卖家庭套装，也可进入健身房。', '把 trackers 和课程系统变成场馆工具。', price('B2B price is quote-based on official channel, so report avoids fixed amount.', 'Subscription/software boundary: gym deployment likely service/account based; exact fee should be quoted by FightCamp.', 'Accessory/service price: studios need bags, trackers, wraps, consoles and replacement parts.', 'Competitor price comparison: HYROX gym affiliation about £100/month in media report; Peloton commercial/hotel placements use enterprise terms; Tonal for Business quote-based.', [fight[0], hyrox[4], peloton[0], tonal[0]]), [fight[0], fight[1]])
    ],
    founders: [founder('Khalil Zahar', 'Founder / CEO', 'YC page lists Khalil Zahar as Founder/CEO of FightCamp/Hykso.', [fight[1]]), founder('Patrick Chandler', 'Founder / CMO', 'YC page lists Patrick Chandler as Founder/CMO with paid social, content and attribution background.', [fight[1]]), founder('Alexandre Marcotte', 'Founder / CTO', 'YC page lists Alexandre Marcotte as Founder/CTO.', [fight[1]])],
    capital: [capital('2016', 'accelerator', 'YC W2016', 'USD', 'FightCamp/Hykso participated in Y Combinator Winter 2016; batch signal only, no invented founder cash amount.', fight[1]), capital('2021-06', 'funding', '$90M', 'USD', 'TechCrunch reports a $90M round led by NEA/Connect Ventures with famous fighters investing.', fight[2]), capital('2021-06', 'total_funding', '$98M', 'USD', 'TechCrunch reports $8M raised before the $90M round, bringing total to $98M.', fight[2])],
    research_gaps: ['Current membership price needs checkout/account confirmation before treating as live price.', 'Revenue and profitability are not reliably public.'],
    sources: fight,
    learning_summary: ['FightCamp shows a focused vertical can compete against broad fitness ecosystems.', 'Hardware price is much lower than Growl/Tonal, but content freshness matters.', '名人投资要转化为真实训练信任，而不只是曝光。']
  }),
  brand({
    brand: 'Growl',
    slug: 'growl',
    summary: 'Growl 的 GTM 是“AI 投影拳击教练 + 高端家庭硬件 + 预购/众筹”的早期赌注。它试图做拳击版 Peloton/Tonal，但当前仍是未大规模交付阶段：价格、融资、顾问和媒体报道可核验，真实留存、故障率、内容质量和售后成本还不能硬写。它现在更像待验证的高端承诺，而不是成熟规模化案例。',
    channel_path: ['种子轮和顾问阵容建立可信度', 'The Verge/TechCrunch 等媒体同步曝光', '预购和 Kickstarter 收集早期需求', 'Austin showroom/体验降低高价疑虑', '2026 首批交付后才进入真实口碑阶段'],
    channels: { ...sharedChannels, crowdfunding: 'Kickstarter 用低目标验证早期需求。', showroom: 'Austin showroom 解决“原型机是否真实”疑虑。' },
    business_model: { revenue_streams: ['$4,500 upfront hardware', 'planned $60/mo content subscription', 'financing bundles $150-$190/mo', 'future content/games/services'], pricing_logic: '定价接近 Tonal 而非 FightCamp，用“实体可打 AI 教练”解释溢价。', channel_economics: '种子轮 $4.75M 对复杂硬件非常紧，预购现金和交付节奏关键。' },
    products: [
      product('GROWL Wall-mounted AI boxing trainer', 'ai_boxing_hardware', 1, '品牌全部叙事集中在这个硬件上。', '4K projector、hit sensors、3D motion tracking、可击打表面。', price('The Verge reports upfront hardware about $4,500.', 'If purchased upfront, The Verge reports planned subscription about $60/month.', 'Accessory/service price: wall installation, punching surface wear, sensors, projector and support are critical future service costs; exact replacement fees not yet evidenced.', 'Competitor price comparison: FightCamp packages start $299 and historical full package $1,219 with $39/mo; Tonal 2 $4,295 + $59.95/mo; Speediance GM2 $3,390-$4,799; Peloton Bike $1,695 + $49.99/mo.', [growl[1], growl[2], fight[0], fight[2], tonal[0], speed[1], peloton[0]]), [growl[0], growl[1]]),
      product('GROWL financing family access plan', 'financing_plan', 2, '高价硬件需要月付包装才可能进入家庭预算。', '用 $150-$190/mo 降低一次性支付心理阻力。', price('The Verge reports anticipated $150/mo for 48 months or $190/mo for 36 months, totaling about $7,200 or $6,840.', 'Plan includes unlimited family access per The Verge; subscription boundary differs from upfront $60/mo plan.', 'Accessory/service price: plan may include hardware and content; damage, installation and replacement terms need contract confirmation.', 'Competitor price comparison: Peloton Tread+ four-year total in The Verge comparison about $7,407; Tonal rental official page $219/mo first 3 months then $279/mo; FightCamp is far cheaper upfront.', [growl[1], tonal[0], fight[0], peloton[0]]), [growl[1], tonal[0]]),
      product('GROWL content, games and AI coach', 'content_software', 3, '如果硬件交付，内容和 AI 才是长期留存。', '投影把教练变成人形实体，传感器反馈动作。', price('Content sold through subscription or financing bundle, not as standalone verified price.', 'Subscription/software fee: planned $60/mo if upfront hardware purchased; financing bundle includes family access.', 'Accessory/service price: camera/projector calibration and bag surface replacement may become service costs; no fixed public price written.', 'Competitor subscription comparison: FightCamp $39/mo historical, Peloton $49.99/mo, Tonal $59.95/mo, Speediance optional $19.99/mo.', [growl[1], growl[2], fight[2], peloton[1], tonal[1], speed[2]]), [growl[0], growl[2]])
    ],
    founders: [founder('Léo Desrumaux', 'Co-founder / CEO', 'TechCrunch identifies Desrumaux as co-founder/CEO; French/Austin-Paris context and boxing motivation appear in interviews.', [growl[2], growl[0]]), founder('Sam Bowen', 'Advisor', 'TechCrunch reports former hardware engineering VP experience at Amazon, Peloton and Tonal as adviser.', [growl[2]])],
    capital: [capital('2024-12', 'funding', '$4.75M', 'USD', 'Seed funding from Skip Capital, Kima Ventures, Teampact Ventures and angels including Ciryl Gane.', growl[2]), capital('2025', 'crowdfunding', '$144K+', 'USD', 'Local base report records Kickstarter at $144K+ and 658+ backers during campaign; verify final amount before using in investor-grade deck.', growl[6]), capital('2026-02', 'planned_delivery', '$4,500 MSRP', 'USD', 'The Verge reports planned upfront price and first delivery timeline is tied to preorder schedule.', growl[1])],
    research_gaps: ['No real post-delivery churn, NPS, defect rate or revenue yet.', 'Founder personal cash input and burn rate are not reliably public.'],
    sources: growl,
    learning_summary: ['Growl 目前是承诺型 GTM，不是已验证规模化 GTM。', '它必须用交付质量证明 $4,500 + 订阅合理。', '与 FightCamp 对比时，最重要的是真实训练效果和售后交付。']
  }),
  brand({
    brand: 'HYROX',
    slug: 'hyrox',
    summary: 'HYROX 的 GTM 不是卖家用硬件，而是把“标准化健身比赛”做成可全球复制的运动品牌。它用固定赛制、城市赛事、合作健身房、成绩榜、照片分享和赞助商形成增长飞轮；成本不是订阅费，而是报名、训练、装备、旅行、照片和合作健身房费用。',
    channel_path: ['创始人用赛事运营和奥运运动员 IP 定义标准赛制', '先在欧洲城市验证参赛需求', 'Infront 投资/控股后扩大赛事网络', '合作健身房承担训练和获客', '官方成绩、照片和社交传播推动下一轮参赛'],
    channels: { ...sharedChannels, events: '门票/报名费是核心收入来源。', gyms: 'HYROX365 和 training clubs 是训练网络。', sponsors: 'Puma、Myprotein、Concept2、Centr 等赞助/装备伙伴。' },
    business_model: { revenue_streams: ['race entry fees', 'sponsorships', 'affiliate gym fees', 'merchandise', 'food/drink/event services'], pricing_logic: '不卖强制软件订阅；用户总成本来自参赛链路。', channel_economics: '标准化室内赛事让城市复制和赞助销售更容易。' },
    products: [
      product('HYROX Race Entry', 'event_ticket', 1, 'HYROX 的核心产品就是参赛资格。', '8 x 1km run + 8 workout stations 的全球统一格式。', price('Race entry price varies by city, division and batch; official Find My Race/ticket pages are the source for live price, so no single fixed global ticket price is written.', 'No mandatory subscription/software fee; rankings/results are event ecosystem features.', 'Accessory/service price: real athlete cost includes training plan, gym access, shoes, travel, lodging, photos/merch and race-day services.', 'Competitor price comparison: Spartan/Tough Mudder sell event entries; CrossFit boxes charge gym memberships; Peloton/Tonal/Speediance sell hardware plus memberships or optional software.', [hyrox[0], hyrox[1], hyrox[2], peloton[0], tonal[1], speed[2]]), [hyrox[0], hyrox[2]]),
      product('HYROX365 / Training Clubs', 'affiliate_training_network', 2, '合作健身房是 HYROX 的低资产获客网络。', '官方 affiliate/training club 提供品牌、训练和票务连接。', price('The Times reports about £100/month for gyms to become HYROX affiliated.', 'Subscription/software boundary: this is gym affiliation/training access, not consumer hardware subscription.', 'Accessory/service price: gyms need SkiErg, sleds, rowers, kettlebells, wall balls and coaching education.', 'Competitor price comparison: CrossFit affiliation commonly higher than HYROX affiliate fee in local report; Peloton/Tonal enterprise terms are quote-based; FightCamp gym extension is quote-based.', [hyrox[4], hyrox[3], fight[0], peloton[0], tonal[0]]), [hyrox[3], hyrox[4]]),
      product('HYROX World Championships / Sponsors / Shop', 'event_media_commerce', 3, '赛事品牌的上限来自冠军、赞助和商品，而不只是报名费。', '官方成绩榜、品牌装备和赛事内容连接赞助销售。', price('Shop prices vary by item on official HYROX shop.', 'No mandatory software subscription; commerce is merchandise/sponsor driven.', 'Accessory/service price: apparel, shoes, grips, nutrition, travel and event photos are real add-on costs.', 'Competitor price comparison: Peloton apparel and accessories are secondary; FightCamp/Growl sell training hardware; HYROX sells participation and identity.', [hyrox[0], hyrox[7], peloton[0], fight[0], growl[0]]), [hyrox[0], hyrox[7]])
    ],
    founders: [founder('Christian Toetzke', 'Co-founder', 'Mass-participation event operator; co-created HYROX and emphasized standardized accessible fitness racing.', [hyrox[4], hyrox[5]]), founder('Moritz Fürste', 'Co-founder', 'Two-time Olympic field hockey gold medalist; provides athlete credibility and sport-building perspective.', [hyrox[6], hyrox[5]])],
    capital: [capital('2017-2018', 'founding_event', '650 participants', 'participants', 'First HYROX event history in public profile; participant count rather than cash is the reliable early traction metric.', hyrox[5]), capital('2019', 'investment', 'minority investment', 'EUR', 'The Times reports Infront invested two years after founding; amount not made into a numeric claim.', hyrox[4]), capital('2022', 'acquisition_control', 'majority control', 'EUR', 'The Times reports Infront became sole investor / controlling investor in 2022.', hyrox[4]), capital('2025', 'estimated_revenue', '£84M', 'GBP', 'The Times reports estimated turnover of £84M last year and entry fees around 90% of turnover; company does not publish audited detail.', hyrox[4])],
    research_gaps: ['Official per-race ticket prices vary and should be captured event-by-event.', 'Exact Infront investment amount and founder personal cash input are not reliable public numbers.'],
    sources: hyrox,
    learning_summary: ['HYROX 的产品是规则和参赛身份。', '运动品牌可以靠合作健身房扩张，而不是自建门店。', '价格分析要算参赛总成本，不要只找订阅费。']
  })
];

for (const report of reports) {
  fs.writeFileSync(path.join(outDir, report.brand_slug + '.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
  console.log('wrote data/gtm/' + report.brand_slug + '.json');
}

const comparison = `# Fitness / Sports GTM Comparison

Generated: 2026-06-17

| Brand | Core GTM | Product Price | Subscription / Software | Accessory / Service Cost | Capital / Money Events | Evidence Boundary |
|---|---|---:|---|---|---|---|
| AEKE | AI private-coach mirror, Kickstarter + DTC | K1 about $3,298-$3,498 | No mandatory subscription | Bench/accessories, e.g. Extender Belt $99 | Kickstarter about $1.52M | Founder self-funding amount and audited revenue not written |
| Speediance | Shenzhen hardware efficiency, no mandatory subscription | GM2 about $3,390-$4,799 | Wellness+ optional, local report $19.99/mo | Bundle/accessory differences; no wall install | Kickstarter about $560K; funding about $13.6M; local report 2024 revenue $49M | Founder personal cash, CAC, patent legal cost not written |
| Tonal | Premium wall-mounted digital strength + required membership | Tonal 2 $4,295 | $59.95/mo, 12-month initial commitment | Accessories $495; installation starts $295 | Seed $1.5M; Series E $250M; Series F $130M; valuation reset in local report | Profitability and hardware failure cost not reliable |
| Peloton | Content studio + connected hardware + community | Bike $1,695; Bike+ $2,695; Tread+ $6,695 | All-Access public signal $49.99/mo; app tiers separate | Delivery, accessories, activation/return terms | Seed $400K; IPO about $1.16B; public filings for losses/revenue | Founder personal cash and CAC by product not reliable |
| FightCamp | Vertical boxing hardware + trackers + classes | Packages start $299; historical kits $439-$1,349 | Historical membership $39/mo | Bag, gloves, trackers, wraps, HR monitor | YC W2016; $90M round; total $98M after round | Current membership needs checkout confirmation; revenue not public |
| Growl | AI projected boxing coach, preorder/crowdfunding | The Verge reports about $4,500 | Planned $60/mo or bundle in financing | Installation, bag surface, projector/sensor support not priced | Seed $4.75M; Kickstarter local report $144K+ | No post-delivery churn, defect, revenue or burn data yet |
| HYROX | Standardized fitness race + gym affiliate network | Entry varies by city/division/batch | No mandatory consumer software subscription | Training, gear, travel, photos, affiliate gym costs | Infront minority investment 2019; controlling investor 2022; Times estimate £84M turnover | Exact event prices and Infront amount need event/company-level source |

## Speediance / Tonal / FightCamp / Growl: GTM 对照

| Dimension | Speediance | Tonal | FightCamp | Growl |
|---|---|---|---|---|
| Category | Smart strength machine | Premium wall-mounted smart strength | Connected boxing kit | AI projection boxing trainer |
| Price Posture | High ticket, lower friction because no mandatory subscription | Highest lock-in: hardware + accessories + install + required membership | Lower hardware entry, vertical use case | High-ticket promise, delivery still unproven |
| Subscription Logic | Optional Wellness+ | Required membership | Historical $39/mo content membership | Planned $60/mo or financing bundle |
| GTM Wedge | “Tonal without the wall drill and subscription lock” | “The smartest strength trainer at home” | “Real boxing at home, measured” | “A coach projected onto a bag in your living room” |
| Key Risk | Patent litigation, global support, software maturity | Price, support, lock-in resentment, PE pressure | Content freshness and boxing-only TAM | Manufacturing, delivery, real reviews, service cost |

Missing-data rule: if founder cash, exact burn, exact losses, CAC, unit margin, refund cost or live ticket price cannot be tied to a reliable source, it stays out of the fact table.
`;

fs.writeFileSync(path.join(root, 'docs', 'fitness-gtm-comparison.md'), comparison, 'utf8');
console.log('wrote docs/fitness-gtm-comparison.md');
