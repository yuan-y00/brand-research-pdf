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

function product(name, type, rank, why_selected, origin_story, pre_market, innovation, breakout, customer_impact, ecosystem_impact, pricing_model, sources) {
  return {
    name,
    type,
    rank,
    confidence: 'medium',
    why_selected,
    origin_story,
    pre_market,
    innovation,
    breakout,
    customer_impact,
    ecosystem_impact,
    pricing_model,
    lessons: {
      what_to_learn: [
        '把产品本体价格、配件服务费、软件订阅费和竞品总成本放在同一张账上。',
        'GTM 的重点是让用户相信长期价值，而不是只看首发声量。',
        '创始人履历和公司资本链条要分开写，避免把人物叙事当成财务事实。'
      ],
      do_not_copy_blindly: [
        '不要把找不到来源的自筹金额、毛利、亏损或补贴硬写进报告。',
        '不要复制表面的发布会打法，先确认供应链、售后和复购逻辑。'
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
    market_focus: input.market || 'Global / China where relevant',
    report_type: 'gtm_extension',
    version: '1.0',
    generated_by: 'AI-assisted public-source research; consumer GTM repair 2026-06-17',
    disclaimer: 'Only sourced money events are written as facts. Unsupported founder cash, margin, burn, loss, CAC, refund or subsidy amounts remain in research_gaps.',
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
      top_products_selection_rule: '最多选 3 个产品或产品线；按公开证据、价格结构、GTM 学习价值和用户购买决策选择。',
      top_products: input.products,
      learning_summary: input.learning_summary,
      evidence_boundary: '找不到的内容不补写；缺失的创始人现金、单台毛利、广告投放、退货损失、售后成本留在 research_gaps。',
      sources: input.sources
    }
  };
}

const apple = [
  src('Apple iPhone official page', 'https://www.apple.com/iphone/', 'official'),
  src('Apple One official pricing', 'https://www.apple.com/apple-one/', 'official'),
  src('AppleCare official pricing', 'https://www.apple.com/applecare/', 'official'),
  src('Apple SEC filings', 'https://investor.apple.com/sec-filings/default.aspx', 'filing'),
  src('Apple public profile', 'https://en.wikipedia.org/wiki/Apple_Inc.', 'media'),
  src('Steve Jobs profile', 'https://en.wikipedia.org/wiki/Steve_Jobs', 'media'),
  src('Steve Wozniak profile', 'https://en.wikipedia.org/wiki/Steve_Wozniak', 'media'),
  src('Byte Shop first Apple I order', 'https://en.wikipedia.org/wiki/Byte_Shop', 'media'),
  src('Investopedia Apple revenue by segment FY2025', 'https://www.investopedia.com/how-apple-makes-money-4798689', 'media')
];
const lei = [
  src('Lei Jun public profile', 'https://en.wikipedia.org/wiki/Lei_Jun', 'media'),
  src('Xiaomi public profile', 'https://en.wikipedia.org/wiki/Xiaomi', 'media'),
  src('Xiaomi SU7 public profile', 'https://en.wikipedia.org/wiki/Xiaomi_SU7', 'media'),
  src('Xiaomi YU7 public profile', 'https://en.wikipedia.org/wiki/Xiaomi_YU7', 'media'),
  src('Business Insider Xiaomi EV profitability report', 'https://www.businessinsider.com/xiaomi-ev-profitable-china-tesla-byd-2025-11', 'media'),
  src('WSJ Xiaomi 2025 earnings coverage', 'https://www.wsj.com/business/earnings/xiaomi-quarterly-profit-falls-amid-rising-memory-costs-fd3a7c3a', 'media'),
  src('The Verge Xiaomi 15 / 15 Ultra Europe price', 'https://www.theverge.com/news/622406/xiaomi-15-ultra-pad-7-launch-europe-price-mwc', 'media'),
  src('Business Insider YU7 orders and price', 'https://www.businessinsider.com/xiaomi-sold-over-200000-units-of-new-car-tesla-rival-2025-6', 'media'),
  src('Time profile: Lei Jun', 'https://time.com/3741842/meet-lei-jun-chinas-phone-king/', 'media')
];
const shokz = [
  src('Shokz official site', 'https://shokz.com/', 'official'),
  src('Shokz products page', 'https://shokz.com/collections/all', 'official'),
  src('Shokz warranty', 'https://shokz.com/pages/warranty', 'official'),
  src('T3 Shokz founder / open-ear history', 'https://www.t3.com/tech/headphones/how-shokz-built-its-open-ear-empire-from-the-struggles-to-success', 'media'),
  src('TechRadar Shokz OpenDots 2 review', 'https://www.techradar.com/health-fitness/fitness-headphones/shoks-opendots-2-review-comfortable-stable-long-lasting-open-ear-buds-that-arent-just-for-fitness', 'review'),
  src('Tom’s Guide Shokz OpenFit Pro review', 'https://www.tomsguide.com/audio/earbuds/shokz-openfit-pro-review', 'review'),
  src('The Guardian Shokz OpenRun Pro 2 review', 'https://www.theguardian.com/technology/article/2024/aug/28/shokz-openrun-pro-2-review-bringing-bass-to-bone-conduction-headphones', 'review'),
  src('The Verge Shokz OpenDots One report', 'https://www.theverge.com/news/659701/shokz-opendots-one-bluetooth-wireless-headphones-open', 'media')
];
const mammotion = [
  src('Mammotion official site', 'https://www.mammotion.com/', 'official'),
  src('Mammotion robot lawn mowers', 'https://www.mammotion.com/collections/robot-lawn-mowers', 'official'),
  src('Mammotion support', 'https://www.mammotion.com/pages/support', 'official'),
  src('The Verge Mammotion LUBA 3 AWD CES 2026', 'https://www.theverge.com/news/850763/mammotion-luba-3-awd-robot-lawnmower-lidar-ces-2026', 'media'),
  src('TechRadar Mammotion Yuka Mini review', 'https://www.techradar.com/home/small-appliances/mammotion-yuka-mini-lawnbot-review', 'review'),
  src('T3 Mammotion Luba Mini AWD review', 'https://www.t3.com/home-living/garden/mammotion-luba-mini-awd', 'review'),
  src('Mammotion Kickstarter profile', 'https://www.kickstarter.com/profile/mammotion/created', 'marketplace'),
  src('Mammotion Trustpilot', 'https://www.trustpilot.com/review/mammotion.com', 'review')
];

const sharedChannels = {
  dtc: 'Official site/store is the clearest conversion path and pricing source.',
  ecommerce: 'Marketplaces, retailers, and regional stores broaden reach beyond owned traffic.',
  pr_media: 'Reviews, launch events, and credible media explain why the product deserves attention.',
  community: 'User reviews, forums, creator content, or owner communities decide whether early demand becomes trust.',
  service: 'Warranty, repair, delivery, setup, installation, and support determine long-term brand quality.'
};

const reports = [
  brand({
    brand: 'Apple',
    slug: 'apple',
    summary: 'Apple 的 GTM 是“高端硬件入口 + 操作系统锁定 + 服务订阅 + 官方零售体验”的复合模型。它不是单卖 iPhone，而是用 iPhone、Mac、Watch、AirPods 和 Vision 把用户带进 Apple ID，再通过 iCloud、Apple One、AppleCare、App Store 和配件持续变现。学习重点是生态系统如何把一次性硬件购买变成多年复购和订阅，但监管、AI 落后、Vision Pro 定价和中国竞争会持续削弱这套围墙。',
    channel_path: ['Apple I first order and early hobbyist trust', 'Apple Store / carrier / online store control purchase experience', 'iPhone as primary device entry', 'Apple ID and ecosystem features raise switching cost', 'Services, AppleCare, accessories and trade-in extend lifetime value'],
    channels: { ...sharedChannels, retail: 'Apple Store and carriers turn high-price devices into assisted purchases.', services: 'Apple One, iCloud, AppleCare and App Store monetize installed base.' },
    business_model: { revenue_streams: ['iPhone, Mac, iPad, Wearables hardware', 'Services and Apple One', 'AppleCare', 'Accessories', 'App Store commissions'], pricing_logic: 'Premium hardware anchors brand margin; service bundles and care plans monetize active devices.', channel_economics: 'Owned retail and OS integration reduce channel leakage and raise lifetime value.' },
    products: [
      product('iPhone 17 / Air / Pro line', 'hardware_line', 1, 'iPhone is Apple’s core revenue engine and the gateway to the services stack.', 'Apple’s first product-market wedge was integrated personal computing; iPhone became the modern ecosystem anchor.', 'Consumers compare iPhone against Samsung, Google Pixel, Huawei and Xiaomi on camera, AI, trade-in, carrier subsidy and ecosystem lock-in.', 'A19/A19 Pro, Apple Intelligence integration, camera upgrades, iOS continuity and trade-in support.', 'iPhone keeps Apple in the global premium smartphone profit pool.', 'Users buy not just a phone, but iMessage, AirDrop, iCloud, Watch, AirPods and resale value.', 'It sets the pricing umbrella for premium smartphones and forces competitors to bundle AI and ecosystem features.', price('Current Apple lineup includes iPhone 17 family; media/retail signals put iPhone 17 from about $799, iPhone Air around $999, Pro models above that depending on storage.', 'Apple Intelligence is included with compatible devices; software monetization comes through iCloud+, Apple One, App Store and other services rather than a mandatory iPhone OS subscription.', 'Accessory/service price: cases, MagSafe accessories, adapters, AppleCare+ or AppleCare One; AppleCare One starts at $19.99/mo for three Apple devices.', 'Competitor price comparison: Samsung Galaxy S/Ultra, Google Pixel Pro, Huawei Mate/Pura and Xiaomi 15/15 Ultra compete across $799-$1,499+ premium bands; Xiaomi 15 Ultra Europe launch started at €1,499 / £1,299.', [apple[0], apple[2], lei[6]]), [apple[0], apple[8]]),
      product('Apple One / Services', 'subscription_bundle', 2, 'Services convert installed base into recurring high-margin revenue.', 'After iPhone scale matured, Apple used Apple ID and device integration to bundle media, storage, games, fitness and news.', 'Users first subscribe because iCloud storage, music, TV, games and family sharing solve daily friction.', 'Apple One bundles multiple services and makes cancellation psychologically harder than single subscriptions.', 'FY2025 services revenue and margin show the second growth curve.', 'Families can share bundles across devices, increasing stickiness.', 'Apple’s service bundle is the template for device-first recurring revenue.', price('Apple One official US pricing: Individual $19.95/mo, Family $25.95/mo, Premier $37.95/mo.', 'Subscription/software fee is the product: Apple One is monthly with no long-term commitment; individual subscriptions can remain separate.', 'Accessory/service price: iCloud storage upgrades, AppleCare, App Store purchases and paid apps add to total Apple ID spend.', 'Competitor subscription comparison: Google One / YouTube Premium / Play Pass, Amazon Prime, Samsung/Galaxy services and Microsoft 365 compete for household software spend, but none are as tightly tied to a premium hardware installed base.', [apple[1], apple[8]]), [apple[1], apple[3]]),
      product('Apple Vision Pro / spatial computing', 'new_category_hardware', 3, 'Vision Pro is the clearest example of Apple’s premium GTM risk.', 'Apple tried to define spatial computing as a post-iPhone category through high-end hardware and developer ecosystem.', 'Pre-market excitement came from Apple brand trust, not proven daily usage.', 'High-resolution displays, eye/hand interface, spatial media and Apple ecosystem integration.', 'It created attention but not mass adoption because price, comfort and app depth were weak.', 'Early users paid for a developer/prosumer experiment rather than a mainstream device.', 'It shows that Apple’s premium formula does not work if the job-to-be-done is unclear.', price('Vision Pro launched at $3,499 in the US; current product pricing varies by storage and region.', 'No mandatory standalone software subscription; value depends on apps, media subscriptions, Apple TV+, iCloud and developer ecosystem.', 'Accessory/service price: inserts, cases, batteries, straps and AppleCare; AppleCare page lists AppleCare One from $19.99/mo and Vision Pro AppleCare section as separate coverage source.', 'Competitor price comparison: Meta Quest line is far cheaper; Ray-Ban Meta and other AI glasses attack a lighter, cheaper use case instead of full spatial computing.', [apple[2], apple[4]]), [apple[2], apple[4]])
    ],
    founders: [
      founder('Steve Jobs', 'Co-founder', 'Co-founded Apple in 1976 and drove product, brand and integrated hardware/software philosophy.', [apple[5], apple[4]]),
      founder('Steve Wozniak', 'Co-founder', 'Designed Apple I hardware and early Apple technical foundation.', [apple[6], apple[4]]),
      founder('Ronald Wayne', 'Co-founder', 'Drafted early partnership documents and exited shortly after founding; useful as a risk-boundary lesson.', [src('Ronald Wayne profile', 'https://en.wikipedia.org/wiki/Ronald_Wayne', 'media')]),
      founder('Tim Cook', 'CEO', 'Not a founder; represents Apple’s supply-chain, services and operating-system era.', [src('Tim Cook profile', 'https://en.wikipedia.org/wiki/Tim_Cook', 'media'), apple[3]])
    ],
    capital: [
      capital('1976', 'founder_cash', 'Volkswagen van + HP calculator', 'assets', 'Jobs and Wozniak sold personal items to fund early Apple I work; do not overstate as audited startup capital.', apple[6]),
      capital('1976', 'first_order', '50 units x $500', 'USD', 'Byte Shop ordered 50 assembled Apple I units at $500 each, creating the first real commercial pull.', apple[7]),
      capital('1977', 'angel_credit', '$92K + $250K line of credit', 'USD', 'Mike Markkula invested personal capital and helped secure credit, according to public Apple history.', src('History of Apple Inc.', 'https://en.wikipedia.org/wiki/History_of_Apple_Inc.', 'media')),
      capital('2025', 'revenue', '$416.16B revenue / $112.01B net income', 'USD', 'FY2025 revenue and net income from public financial summaries; exact audited values should be checked in SEC filing.', apple[8])
    ],
    research_gaps: ['Live Apple Store prices vary by storage, carrier and region; use official product pages for final quote.', 'Do not infer product-level margins beyond Apple segment disclosures.', 'Vision Pro return rate and unit loss are not written without primary/credible source.'],
    sources: apple,
    learning_summary: ['Apple 的第一性原理是把硬件入口变成长期生态税。', '服务业务是第二增长曲线，但它依赖硬件安装基数和监管边界。', '高端定价只有在明确日常使用场景成立时才成立。']
  }),
  brand({
    brand: 'Lei Jun / Xiaomi',
    slug: 'leijun',
    summary: '雷军报告的 GTM 应该写成“创始人 IP + 极致性价比 + 生态链 + 发布会转化 + 小米汽车放大器”，而不是把雷军个人经历当成单一品牌财务表。雷军的核心作用是把小米的产品故事人格化：手机时代靠 MIUI 社群和性价比，IoT 时代靠生态链，汽车时代靠 SU7/YU7 发布会、工厂叙事和极强社交传播完成高客单价迁移。',
    channel_path: ['Kingsoft/Joyo/angel investing creates founder credibility', 'MIUI community validates software-first phone demand', 'Xiaomi phone + online flash sale builds price-performance identity', 'IoT ecosystem expands household touchpoints', 'SU7/YU7 uses Lei Jun personal IP to sell high-ticket EVs'],
    channels: { ...sharedChannels, founder_ip: 'Lei Jun’s launch events, social media and personal credibility are a core channel.', ecosystem: 'Xiaomi Home, HyperOS and IoT devices cross-sell from phone to car to appliances.' },
    business_model: { revenue_streams: ['Smartphones', 'IoT/lifestyle products', 'EVs', 'Internet services', 'Accessories and ecosystem devices'], pricing_logic: 'High spec at aggressive price, then monetize scale through services, accessories, ecosystem and premium upgrades.', channel_economics: 'Online launch and founder-led content lower trust friction but create delivery and quality pressure.' },
    products: [
      product('Xiaomi SU7 / YU7 Auto', 'ev_line', 1, 'Xiaomi Auto is the biggest test of Lei Jun’s founder-led GTM.', 'Lei Jun announced Xiaomi’s EV entry in 2021 and personally led the project narrative.', 'Before launch, users compared Xiaomi to Tesla, BYD, Nio and Porsche/Taycan-like design cues.', 'Consumer electronics speed, HyperOS cockpit, aggressive pricing and direct-to-consumer launch events.', 'SU7/YU7 generated huge orders and moved Xiaomi from phone brand into mobility brand.', 'Users buy a car partly because they trust Xiaomi’s device ecosystem and Lei Jun’s promise of value.', 'It shows how founder IP can move from low/medium-ticket electronics into high-ticket cars.', price('SU7 original prices: RMB 215,900 / 245,900 / 299,900; SU7 Ultra launched at RMB 529,900; YU7 reported starting price RMB 253,500 with Pro/Max at RMB 279,900 / 329,900.', 'Software boundary: HyperOS/cockpit and updates are part of vehicle experience; no reliable mandatory consumer software subscription is written here.', 'Accessory/service price: insurance, charging, autonomous-driving options, maintenance, tires, accessories and extended warranty need buyer-level quote; do not invent fixed service fee.', 'Competitor price comparison: Tesla Model 3/Y, BYD Han/Seal, Nio ET/ES and Xpeng compete; YU7 was reported as slightly below Tesla Model Y in China.', [lei[2], lei[3], lei[7]]), [lei[2], lei[7]]),
      product('Xiaomi 15 / 15 Ultra + HyperOS', 'smartphone_line', 2, 'Smartphones remain the ecosystem entry and Apple/Huawei comparison point.', 'Xiaomi began with MIUI before hardware; phone GTM is software/community-first.', 'Users compare Xiaomi to Apple, Samsung, Huawei, OPPO and vivo on camera, chip, price and ecosystem.', 'Flagship camera partnerships, HyperOS device continuity and aggressive specs.', 'Xiaomi uses flagship phones to pull brand upward while Redmi covers mass price bands.', 'Consumers get near-premium hardware at lower or more flexible price bands than Apple/Samsung Ultra.', 'It keeps Xiaomi’s installed base large enough to feed IoT and EV awareness.', price('European launch coverage: Xiaomi 15 from €999 / £899; Xiaomi 15 Ultra from €1,499 / £1,299; China prices vary by SKU and promotion.', 'Software/subscription boundary: HyperOS is included; Xiaomi Cloud, app store, content and internet services monetize users separately.', 'Accessory/service price: photography kit for Xiaomi 15 Ultra reported at £179; cases, chargers, warranties and cloud storage add cost.', 'Competitor price comparison: iPhone 17 family, Galaxy S Ultra and Huawei Pura/Mate occupy similar high-end bands; Apple iPhone 17 starts around $799 and Pro models price higher by storage.', [lei[6], apple[0]]), [lei[6], lei[1]]),
      product('Xiaomi AIoT / Home ecosystem', 'ecosystem_line', 3, '生态链是雷军方法论从手机扩张到家庭和汽车的中间层。', 'Xiaomi used investee/ecosystem companies and Xiaomi Home to broaden device categories.', 'Users first enter through low-friction smart bands, cameras, TVs, appliances or scooters.', 'HyperOS connects phone, watch, TV, appliance and car interfaces.', 'IoT/lifestyle revenue became a major segment and store-traffic engine.', 'Users get one account and one app logic across many devices.', 'It gives Xiaomi a distribution advantage that pure phone or pure EV companies do not have.', price('Product prices vary widely from smart bands to TVs, appliances and scooters; use official Xiaomi regional stores for live SKU prices.', 'Subscription/software boundary: many devices work without subscription, but cloud storage, content services and app services may be paid.', 'Accessory/service price: installation, filters, consumables, batteries, spare parts and warranties are meaningful total-cost items.', 'Competitor price comparison: Apple Home, Samsung SmartThings, Huawei HarmonyOS, Anker/Eufy, DJI ecosystem and Roborock/Dreame compete by category.', [lei[1], lei[5], apple[1]]), [lei[1], lei[5]])
    ],
    founders: [
      founder('雷军 Lei Jun', 'Founder / Chairman / CEO of Xiaomi', 'Wuhan University CS graduate; Kingsoft executive, Joyo.com founder/seller, angel investor and Xiaomi founder; his public persona is a distribution asset.', [lei[0], lei[8]]),
      founder('Lin Bin and Xiaomi co-founders', 'Co-founders', 'Xiaomi was co-founded by Lei Jun with Lin Bin and other technology/product leaders; do not reduce the company to one person operationally.', [lei[1], src('Lin Bin profile', 'https://en.wikipedia.org/wiki/Lin_Bin', 'media')])
    ],
    capital: [
      capital('2004', 'exit', '$75M', 'USD', 'Joyo.com was sold to Amazon, giving Lei Jun a proven pre-Xiaomi entrepreneurial track record.', lei[0]),
      capital('2010', 'series_a', '$41M', 'USD', 'Xiaomi raised Series A funding in 2010 after founding.', lei[1]),
      capital('2011', 'series_b', '$90M', 'USD', 'Xiaomi raised Series B funding in December 2011.', lei[1]),
      capital('2012', 'series_c', '$216M', 'USD', 'Xiaomi raised Series C at about $4B valuation.', lei[1]),
      capital('2018', 'ipo', 'up to $6.1B target', 'USD', 'Xiaomi’s Hong Kong IPO roadshow targeted a large raise; use filings for exact final proceeds.', lei[0]),
      capital('2021', 'ev_commitment', 'RMB 10B initial / USD 10B over decade', 'CNY/USD', 'Lei Jun announced Xiaomi’s smart EV entry and long-term investment plan.', lei[2]),
      capital('2024-Q2', 'ev_loss', '$252M loss', 'USD', 'Media reported EV branch loss before scale, illustrating the cash pressure of entering cars.', lei[4]),
      capital('2025', 'revenue', 'RMB 457.29B revenue', 'CNY', 'Media coverage of Xiaomi 2025 earnings reports record revenue and strong EV growth.', lei[5])
    ],
    research_gaps: ['Lei Jun personal cash put into Xiaomi is not written without a reliable source.', 'Exact Xiaomi Auto per-car margin, warranty reserve and customer acquisition cost need official filings.', 'Use Xiaomi annual/interim reports for investor-grade financial numbers.'],
    sources: lei,
    learning_summary: ['雷军 GTM 的关键不是“模仿乔布斯”，而是把创始人信任变成产品转化。', '小米汽车证明人物 IP 可以迁移到高客单价，但交付和安全风险同步放大。', '人物报告必须把个人履历、公司融资和产品价格分层写。']
  }),
  brand({
    brand: 'Shokz',
    slug: 'shokz',
    summary: 'Shokz 的 GTM 是“开放式听音安全场景 + 跑步骑行人群 + 线下试戴教育 + 运动口碑”的细分品类打法。它没有靠 VC 烧钱讲大故事，而是长期教育用户为什么“不入耳”在运动时更安全、更舒适。现在的问题是开放式耳机从小众变成红海，Bose、Sony、华为、Anker/Soundcore 都在用不同形态和价格夹击。',
    channel_path: ['Two-way radio / factory capability builds audio hardware base', 'AfterShokz CES education introduces bone conduction', 'Running stores and grassroots trials solve user education', 'OpenRun/OpenFit expands from runners to mainstream open-ear users', 'Future AI glasses/hearing solutions test broader wearable platform'],
    channels: { ...sharedChannels, sports_retail: 'Running/cycling stores and race visibility explain why open-ear matters.', trials: 'Try-before-believe is critical because bone/open-ear audio feels unfamiliar.' },
    business_model: { revenue_streams: ['OpenRun/OpenRun Pro headphones', 'OpenFit/OpenDots open earbuds', 'Accessories and replacements', 'Future AI/hearing wearables'], pricing_logic: 'Mid-to-premium open-ear pricing, with safety/comfort as the reason to pay more than commodity earbuds.', channel_economics: 'Category education is expensive but creates strong word-of-mouth among runners.' },
    products: [
      product('OpenRun Pro 2', 'bone_conduction_headphones', 1, 'Flagship sports identity product and the clearest Shokz wedge.', 'Shokz built credibility by making bone conduction practical for runners and cyclists.', 'Users need to believe open-ear awareness is worth trading off ANC/isolation.', 'DualPitch / bone + air conduction, 12-hour battery and USB-C charging in reviews.', 'It keeps Shokz as the default running headphone brand.', 'Runners get music without fully blocking traffic and race surroundings.', 'It created a durable sports-open-ear category before big brands entered.', price('Review sources list OpenRun Pro 2 at about $179.95 / £169 / €199 depending on region and promotion.', 'No mandatory software subscription; app EQ/customization is product support rather than revenue pillar.', 'Accessory/service price: carrying case, charging cable, warranty replacement and non-replaceable battery are total-cost considerations.', 'Competitor price comparison: Bose Ultra Open Earbuds launch $299; Suunto Wing about £145; Creative Outlier Free Pro+ about £80; AirPods and Sony compete for general audio but not the same safety job.', [shokz[6], shokz[2], shokz[7]]), [shokz[6], shokz[2]]),
      product('OpenFit Pro / OpenFit 2 line', 'open_ear_earhook', 2, 'This line moves Shokz from runner-only into everyday open-ear audio.', 'After bone conduction proved the safety job, Shokz expanded into air-conduction open earbuds.', 'Users compare comfort, bass, stability and price against Bose/Sony/Huawei/Anker.', 'OpenFit Pro review highlights premium open-ear design, IP55 and app audio features.', 'It broadens TAM beyond road runners to office, commuting and gym users.', 'Users get all-day comfort and awareness, but still lack true ANC isolation.', 'It turns open-ear from niche sport gear into mainstream lifestyle audio.', price('OpenFit Pro launched at $249 / £219; OpenFit 2 and 2+ reported around $179.95-$199.95.', 'No mandatory subscription; companion app and firmware are included.', 'Accessory/service price: eartips are not the model, but charging case, warranty and battery longevity matter; Shokz warranty page is service boundary.', 'Competitor price comparison: Bose Ultra Open $299, Sony LinkBuds Open about $199, Huawei FreeClip / FreeClip 2 and Soundcore AeroClip around $129 compete by style and price.', [shokz[5], shokz[2], shokz[4]]), [shokz[5], shokz[4]]),
      product('OpenDots 2 / clip-on open earbuds', 'clip_on_open_earbuds', 3, 'Clip-on buds show Shokz following the market from sports neckband to fashion/open-ear daily wear.', 'OpenDots follows the broader clip-on boom created by Bose/Huawei and social visibility.', 'Users want comfort, glasses compatibility, low leakage and secure fit.', 'TechRadar/Tom’s Guide report $199-$199.95 price, IP rating and long battery life.', 'It gives Shokz a product in the fastest-growing open-ear form factor.', 'Users get jewelry-like open-ear earbuds, but must accept always-transparent listening.', 'It tests whether Shokz brand can win outside its original neckband sports silhouette.', price('OpenDots 2 reported at $199-$199.95 in the US, £179-£179.99 in the UK, AU$339 in Australia; OpenDots Air reported at $129/£129.', 'No mandatory subscription; app EQ/control settings are included.', 'Accessory/service price: case, battery degradation, warranty and replacement policy affect total cost.', 'Competitor price comparison: Bose Ultra Open $299, Soundcore AeroClip $129, AirPods 4 with ANC $179, Huawei FreeClip/FreeClip 2 around the same open-ear segment.', [shokz[4], shokz[7]]), [shokz[4], shokz[7]])
    ],
    founders: [
      founder('Ken Chen / 陈皞', 'Co-founder / CEO', 'T3 interview identifies Ken Chen as a Shokz co-founder and explains the factory-to-open-ear brand evolution.', [shokz[3], shokz[0]]),
      founder('陈迁 / 齐心', 'Co-founders', 'Local base report records the three-founder story and 250K RMB startup narrative; keep it as public narrative unless audited.', [shokz[0], shokz[3]])
    ],
    capital: [
      capital('early_start', 'founder_cash', 'RMB 250K public narrative', 'CNY', 'Local base report records a 250K RMB startup narrative; not treated as audited finance.', shokz[0]),
      capital('2011', 'brand_launch', 'CES small booth / AfterShokz', 'USD', 'Founder interview describes early CES education and poor initial sales before product-market fit.', shokz[3]),
      capital('2012-2015', 'distribution_learning', '18 units in 1,000 stores', 'units', 'Founder interview says an early retail report showed only 18 sales from 1,000 stores, a useful GTM failure signal.', shokz[3])
    ],
    research_gaps: ['No audited revenue, profit, founder cash split or financing table is public in the sources used.', 'Accessory replacement prices vary by region and should be captured from official store at purchase time.', 'Do not write zero VC as audited unless confirmed by primary company disclosure.'],
    sources: shokz,
    learning_summary: ['Shokz 的第一性原理是安全和舒适，不是音质参数。', '新品类需要教育成本，线下试戴和运动口碑比广告更关键。', '开放式耳机变红海后，Shokz 必须证明品牌心智不只是骨传导专利。']
  }),
  brand({
    brand: 'Mammotion',
    slug: 'mammotion',
    summary: 'Mammotion 的 GTM 是“大疆系机器人技术 + Kickstarter 验证 + Amazon/DTC 爆发 + 线下零售扩张”的庭院机器人出海样本。它用 RTK、视觉和激光雷达把传统埋线割草机升级为无边界机器人，再用 LUBA/YUKA/SPINO 把单品扩成庭院智能生态。风险是高客单产品的售后、安装、地图稳定性和季节性需求，一旦支持跟不上，技术领先会被差评抵消。',
    channel_path: ['AgileX / DJI RoboMaster background builds robotics credibility', 'Kickstarter validates LUBA demand and collects first global users', 'DTC and Amazon convert early adopters', 'Retailers such as Lowe’s/Costco/Walmart broaden mainstream yard-care reach', 'SPINO and accessories extend from mowing to yard ecosystem'],
    channels: { ...sharedChannels, crowdfunding: 'Kickstarter reduced category-launch risk and created proof for retailers.', retailers: 'Big-box retail matters because lawn care buyers want return/support confidence.' },
    business_model: { revenue_streams: ['LUBA robotic mowers', 'YUKA robotic mowers', 'SPINO pool robots', 'Accessories, blades, garage/RTK/service parts'], pricing_logic: 'Premium robotic mower pricing justified by wire-free setup and navigation stack.', channel_economics: 'High hardware gross ticket must fund support, seasonal inventory and regional service coverage.' },
    products: [
      product('LUBA 2 / LUBA 3 AWD', 'robot_lawn_mower', 1, 'LUBA is the flagship proof of Mammotion’s boundary-free mower thesis.', 'Team translated robotics/AGV navigation into consumer lawn care.', 'Pre-market users wanted no perimeter wire, reliable mapping and slope handling.', 'Tri-Fusion navigation, AWD, RTK / NetRTK, AI vision and in LUBA 3 lidar mapping.', 'The Verge reports LUBA 3 AWD starts at $2,399 and extends Mammotion’s premium range.', 'Users buy back mowing time but expect appliance-level reliability.', 'It pushes traditional mower brands toward wire-free navigation.', price('The Verge reports LUBA 3 AWD starting at $2,399 / £2,099 / €2,299; local report gives LUBA 2 premium range roughly $2,599-$4,999.', 'Software boundary: mapping/app/OTA are part of core product; no reliable mandatory subscription is written. NetRTK/4G availability and fees must be checked by region.', 'Accessory/service price: RTK station, garage, replacement blades, wheel/charging parts, 4G connectivity and warranty/service are real total-cost items.', 'Competitor price comparison: Husqvarna EPOS models can reach $5,899; Segway Navimow and Worx Landroid compete across lower and mid tiers; Dreame/Eufy challenge with camera-based approaches.', [mammotion[3], mammotion[1], mammotion[2]]), [mammotion[3], mammotion[1]]),
      product('YUKA / YUKA Mini', 'robot_lawn_mower', 2, 'YUKA brings Mammotion into smaller lawns and more affordable segments.', 'After LUBA proved premium demand, Mammotion needed a lower-entry model and auto-empty/lawn-sweeping story.', 'Users compare setup complexity, lawn size, RTK placement and app quality.', 'YUKA Mini review reports compact wire-free mowing with AI camera and RTK station.', 'It gives Mammotion more price coverage against Segway/Dreame/Eufy.', 'Small-yard users can enter below LUBA pricing while accepting setup learning curve.', 'It broadens Mammotion from high-end yards to mainstream suburban lawns.', price('TechRadar reports Yuka Mini S in US at $1,099; 600H $1,099 and 800H $1,299; UK/AU model prices vary.', 'Software/subscription boundary: app, mapping and core mowing are included; no mandatory software subscription is written.', 'Accessory/service price: charging station, RTK receiver, blades, garage and replacement consumables; setup support has hidden time cost.', 'Competitor price comparison: Dreame E15, Eufy robot mower and Segway Navimow compete in lower-to-mid price tiers; LUBA Mini AWD 800 review lists $1,599 as a mid-high option.', [mammotion[4], mammotion[5], mammotion[2]]), [mammotion[4], mammotion[5]]),
      product('SPINO / yard ecosystem accessories', 'yard_robot_ecosystem', 3, 'SPINO shows Mammotion wants to own the yard, not only grass.', 'Pool cleaning shares outdoor robotics, navigation and affluent-home customer overlap with mowing.', 'Users need proof the brand can support multiple expensive outdoor robots.', 'Extends robotics stack into pool cleaning and yard maintenance accessories.', 'It raises ceiling from mower company to outdoor home robotics platform.', 'Customers can buy a broader yard-care system but face more support dependency.', 'It follows DJI-style adjacent-category expansion: same capability, adjacent use case.', price('SPINO live price varies by SKU/region; use Mammotion official store for current quote.', 'No mandatory subscription is written; app/software service boundary should be checked per SKU.', 'Accessory/service price: brushes, filters, blades, docks/garages, RTK parts and replacement consumables affect total cost.', 'Competitor price comparison: Aiper, Beatbot, Dolphin/Maytronics and Wybot compete in pool robots; Husqvarna/Segway compete in mowers, so Mammotion’s ecosystem must justify cross-category trust.', [mammotion[0], mammotion[1], mammotion[2]]), [mammotion[0], mammotion[2]])
    ],
    founders: [
      founder('魏基栋 Jayden Wei', 'Founder / CEO', 'Local report identifies Wei as founder/CEO with DJI RoboMaster and robotics background; do not expand beyond public/company sources.', [mammotion[0], mammotion[6]]),
      founder('Mammotion / AgileX robotics team', 'Founding team', 'Base report connects Mammotion to AgileX and robotics navigation experience; team-level capability is part of the GTM story.', [mammotion[0], mammotion[6]])
    ],
    capital: [
      capital('2022', 'crowdfunding', '$3.37M', 'USD', 'Local report records LUBA Kickstarter at about $3.37M, a category-launch proof point.', mammotion[6]),
      capital('2022-2024', 'crowdfunding_total', '$5.57M', 'USD', 'Base report records two Kickstarter campaigns totaling about $5.57M; verify final campaign pages before investor-grade use.', mammotion[6]),
      capital('2024', 'revenue', 'RMB 522M', 'CNY', 'Local base report records mower revenue around RMB 522M and about 30K units in 2024.', mammotion[0]),
      capital('2025', 'supply_commitment', '1.2M lidar units', 'units', 'Local base report records a 1.2M-unit lidar supply agreement as a scale signal, not cash revenue.', mammotion[0])
    ],
    research_gaps: ['Exact VC round amounts from Sequoia/FiveY/Vertex are described as large local-report signals but need primary funding source before writing exact CNY amount.', 'No reliable public data for refund loss, warranty reserve, CAC or gross margin by SKU.', 'Live accessory prices should be pulled from official store by region before quoting to buyers.'],
    sources: mammotion,
    learning_summary: ['Mammotion 的第一性原理是用更高级机器人能力解决传统庭院维护痛点。', '众筹到 Amazon 到线下零售是一条清晰放大路径，但售后必须跟上高客单价。', '从 LUBA 到 SPINO 的生态扩张只有在服务体系成熟时才成立。']
  })
];

for (const report of reports) {
  fs.writeFileSync(path.join(outDir, report.brand_slug + '.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
  console.log('wrote data/gtm/' + report.brand_slug + '.json');
}

const comparison = `# Consumer / Founder-Led GTM Batch

Generated: 2026-06-17

| Brand | GTM Core | Price / Subscription | Money Events | Evidence Boundary |
|---|---|---|---|---|
| Apple | Premium hardware entry + OS lock-in + services | iPhone premium band; Apple One $19.95/$25.95/$37.95; AppleCare One from $19.99/mo | Byte Shop 50 x $500; Markkula $92K + $250K credit; FY2025 public financials | Product-level margin and live SKU prices need official store/filing |
| Lei Jun / Xiaomi | Founder IP + price-performance + ecosystem + EV launch theater | SU7 RMB 215,900-299,900; YU7 RMB 253,500-329,900; Xiaomi 15 Ultra Europe from €1,499 | Xiaomi Series A $41M; Series B $90M; Series C $216M; EV investment plan; 2025 revenue reports | Lei Jun personal cash and Xiaomi Auto per-car margin not written |
| Shokz | Open-ear safety/comfort category education | OpenRun Pro 2 about $179.95; OpenFit Pro $249; OpenDots 2 about $199.95; no mandatory subscription | 250K RMB public startup narrative; early CES/retail failure signals | No audited revenue/funding table from public sources |
| Mammotion | Robotics tech + Kickstarter + DTC/Amazon + retail | LUBA 3 starts $2,399; Yuka Mini US from $1,099; no mandatory subscription written | LUBA Kickstarter about $3.37M; total campaign signal about $5.57M; 2024 local revenue RMB 522M | Exact VC amounts, warranty cost and live accessory price need primary source |

Rule: missing founder cash, burn, CAC, refund loss, warranty reserve or exact margin stays out of the fact table unless sourced.
`;

fs.writeFileSync(path.join(root, 'docs', 'consumer-gtm-comparison.md'), comparison, 'utf8');
console.log('wrote docs/consumer-gtm-comparison.md');
