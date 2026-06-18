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

function method(name, type, rank, why_selected, origin_story, pre_market, innovation, breakout, customer_impact, ecosystem_impact, pricing_model, sources) {
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
        'Study the product principle first, then the commercialization path.',
        'Separate the person from the company balance sheet and from platform economics.',
        'For platforms, price often appears as commission, ad auction, subscription, service fee, or switching cost rather than SKU price.'
      ],
      do_not_copy_blindly: [
        'Do not force a normal brand template onto a person or platform report.',
        'Do not invent founder cash, margin, loss, valuation, or fee rates when sources are weak.'
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

function report(input) {
  return {
    brand: input.brand,
    brand_slug: input.slug,
    market_focus: input.market || 'Person / platform methodology',
    report_type: 'gtm_extension',
    version: '1.0',
    generated_by: 'AI-assisted public-source research; person-platform GTM repair 2026-06-17',
    disclaimer: 'This is not a normal brand SKU report. It maps product methodology to commercialization paths. Unsupported founder cash, exact margins, live valuations, private-company losses, or platform fee rates are kept in research_gaps.',
    brand_context: {
      founder_background: input.founders.map((f) => `${f.name}: ${f.background_summary}`),
      brand_timeline: input.capital.map((e) => `${e.date}: ${e.event} ${e.amount} - ${e.description}`),
      founder_profiles: input.founders,
      capital_history: input.capital,
      research_gaps: input.research_gaps
    },
    gtm_extension: {
      summary: input.summary,
      one_sentence_gtm: input.summary.split('.')[0] + '.',
      channel_path: input.channel_path,
      channels: input.channels,
      business_model: input.business_model,
      top_products_selection_rule: 'For person/platform reports, choose no more than 3 product-methodology platforms, not ordinary SKUs.',
      top_products: input.products,
      learning_summary: input.learning_summary,
      evidence_boundary: 'Missing founder cash, exact platform take rates, CAC, refund loss, warranty reserve, private valuation, or live net worth is not filled unless a reliable source is present.',
      sources: input.sources
    }
  };
}

const dong = [
  src('Dong Mingzhu public profile', 'https://en.wikipedia.org/wiki/Dong_Mingzhu', 'media'),
  src('Gree Electric public profile', 'https://en.wikipedia.org/wiki/Gree_Electric', 'media'),
  src('Gree Comfort official site', 'https://greecomfort.com/', 'official'),
  src('Gree global official site', 'https://global.gree.com/', 'official'),
  src('Gree Electric investor relations', 'https://www.gree.com/', 'official'),
  src('Midea Group public profile', 'https://en.wikipedia.org/wiki/Midea_Group', 'media'),
  src('Haier Smart Home public profile', 'https://en.wikipedia.org/wiki/Haier', 'media'),
  src('South China Morning Post Dong Mingzhu profile', 'https://www.scmp.com/business/companies/article/2080583/chinas-home-appliance-queen-dong-mingzhu-backs-ambitious-gree', 'media')
];
const zhang = [
  src('Allen Zhang public profile', 'https://en.wikipedia.org/wiki/Allen_Zhang', 'media'),
  src('Foxmail public profile', 'https://en.wikipedia.org/wiki/Foxmail', 'media'),
  src('Tencent financial releases', 'https://www.tencent.com/en-us/investors/financial-news.html', 'official'),
  src('Tencent 2026 Q1 results page', 'https://www.tencent.com/en-us/investors/financial-news.html', 'filing'),
  src('WeChat official site', 'https://www.wechat.com/', 'official'),
  src('Weixin Pay official site', 'https://pay.weixin.qq.com/', 'official'),
  src('Tencent Cloud WeCom / WeChat ecosystem', 'https://www.tencentcloud.com/products/wecom', 'official'),
  src('WhatsApp public profile', 'https://en.wikipedia.org/wiki/WhatsApp', 'media'),
  src('Telegram public profile', 'https://en.wikipedia.org/wiki/Telegram_(software)', 'media')
];
const jobs = [
  src('Steve Jobs public profile', 'https://en.wikipedia.org/wiki/Steve_Jobs', 'media'),
  src('Apple public profile', 'https://en.wikipedia.org/wiki/Apple_Inc.', 'media'),
  src('Byte Shop public profile', 'https://en.wikipedia.org/wiki/Byte_Shop', 'media'),
  src('Apple history public profile', 'https://en.wikipedia.org/wiki/History_of_Apple_Inc.', 'media'),
  src('NeXT public profile', 'https://en.wikipedia.org/wiki/NeXT', 'media'),
  src('Pixar public profile', 'https://en.wikipedia.org/wiki/Pixar', 'media'),
  src('Apple App Store Small Business Program', 'https://developer.apple.com/app-store/small-business-program/', 'official'),
  src('Apple iPhone official page', 'https://www.apple.com/iphone/', 'official'),
  src('Wired obituary: Steve Jobs 1955-2011', 'https://www.wired.com/2011/10/steve-jobs-1955-2011', 'media')
];
const musk = [
  src('Elon Musk public profile', 'https://en.wikipedia.org/wiki/Elon_Musk', 'media'),
  src('Tesla official Elon Musk bio', 'https://www.tesla.com/elon-musk', 'official'),
  src('Tesla FSD subscription official support', 'https://www.tesla.com/support/full-self-driving-subscriptions', 'official'),
  src('Tesla Model Y official page', 'https://www.tesla.com/modely', 'official'),
  src('SpaceX public profile', 'https://en.wikipedia.org/wiki/SpaceX', 'media'),
  src('Falcon 9 public profile and pricing', 'https://en.wikipedia.org/wiki/Falcon_9', 'media'),
  src('Starlink residential official page', 'https://www.starlink.com/residential', 'official'),
  src('The Verge Starlink residential pricing coverage', 'https://www.theverge.com/column/837202/starlink-work-from-home', 'media'),
  src('X Premium official help page', 'https://help.x.com/en/using-x/x-premium', 'official'),
  src('Tesla Autopilot public profile', 'https://en.wikipedia.org/wiki/Tesla_Autopilot', 'media')
];
const xiaomiEvSources = [
  src('Xiaomi SU7 public profile', 'https://en.wikipedia.org/wiki/Xiaomi_SU7', 'media'),
  src('Xiaomi YU7 public profile', 'https://en.wikipedia.org/wiki/Xiaomi_YU7', 'media')
];

const platformChannels = {
  product_method: 'The person creates a repeatable product principle, not just a single product launch.',
  platform: 'The strongest outputs become platforms, ecosystems, or distribution standards.',
  commercialization: 'Monetization appears through hardware margin, services, commissions, ads, subscriptions, contracts, or enterprise fees.',
  community: 'Developers, merchants, fans, users, channels, or government customers become the adoption network.',
  governance: 'Platform risk comes from rules, support, safety, regulation, succession, and founder overreach.'
};

const reports = [
  report({
    brand: 'Dong Mingzhu / Gree',
    slug: 'dongmingzhu',
    summary: 'Dong Mingzhu should be read as a professional-manager GTM case, not a founder-brand case. Her product methodology is channel discipline, price authority, service credibility, and manufacturing control around air conditioners. The commercialization path was not a charismatic DTC startup story: it was distributor governance, seasonal rebate design, cash collection, national retail coverage, and later live commerce. The limit is also clear: the same strong-person sales system struggled in smartphones, EV diversification, and succession.',
    channel_path: ['Front-line debt collection and sales credibility', 'Distributor rebate / channel discipline system', 'Gree air-conditioner quality and service promise', 'Chairwoman personal IP and live commerce', 'Diversification attempts reveal the boundary of the method'],
    channels: { ...platformChannels, dealer_network: 'Gree historically depended on dealer discipline and seasonal channel financing.', live_commerce: 'Dong personal IP later became a direct-sales and public-trust channel.' },
    business_model: { revenue_streams: ['Residential air conditioners', 'Commercial HVAC', 'Small appliances and service', 'Dealer channel inventory', 'Direct retail / live commerce'], pricing_logic: 'Maintain premium service and dealer discipline instead of pure low-price competition.', channel_economics: 'The system monetizes through channel control and service trust, but risks channel rigidity and overdependence on one category.' },
    products: [
      method('Gree air-conditioner channel system', 'commercialization_method', 1, 'This is Dong Mingzhu’s real GTM product: a disciplined channel system around a high-ticket durable appliance.', 'Dong entered Gree as a salesperson, built credibility through debt collection and regional sales, then scaled sales governance.', 'The pre-market issue was not user demand for cooling; it was channel cash discipline, inventory timing, and price control.', 'Seasonal rebate logic, strict dealer rules, and service promise turned a commodity appliance into a controlled distribution system.', 'Gree became one of China’s air-conditioner leaders and Dong became the face of sales discipline.', 'Consumers see a durable appliance with installation and service confidence, not just a compressor price.', 'The method influenced how Chinese appliance makers think about dealer power and retail price stability.', price('Gree is not a single SKU: wall-mounted, cabinet, central and commercial AC prices vary by region, capacity, installation and warranty.', 'No core consumer software subscription; smart-home app features are support layer, not the main revenue model.', 'Accessory/service price: installation, copper pipe length, outdoor-unit bracket, cleaning, warranty and repair are part of total cost.', 'Competitor price comparison: Midea, Haier, Hisense and AUX compete by capacity, energy efficiency, installation package and warranty; compare category by category, not brand average.', [dong[1], dong[2], dong[5], dong[6]]), [dong[0], dong[1]]),
      method('Dong Mingzhu personal IP / live commerce', 'distribution_method', 2, 'Her public persona became a trust and traffic channel for Gree.', 'After decades as a sales leader, Dong’s identity became inseparable from Gree quality and discipline.', 'Before live commerce, Gree relied more on dealer networks; later direct sales let Dong bypass some channel friction.', 'Founder-like executive livestreaming turns authority into conversion for durable goods.', 'It can move inventory and reinforce trust, but it also makes the organization too dependent on one face.', 'Consumers may trust the person more than the product line, which helps conversion but hurts succession.', 'It shows how Chinese industrial brands can use executive IP without being founder-led startups.', price('Livestream product prices vary by event and SKU; write live offer price only when the event page is preserved.', 'No mandatory subscription; monetization is hardware sales and service attach.', 'Accessory/service price: delivery, installation and after-sales service remain the real conversion promise.', 'Competitor price comparison: Midea and Haier use broader brand/retail systems rather than one-person IP; Xiaomi/Lei Jun uses founder IP for launches, but with a younger ecosystem narrative.', [dong[0], dong[5]]), [dong[0], dong[7]]),
      method('Diversification boundary: phone / Yinlong / new energy', 'failure_boundary', 3, 'The failed extensions explain where Dong’s method stops working.', 'Gree’s air-conditioner success tempted expansion into phones and new energy vehicles.', 'The market did not need a Gree phone just because it trusted Gree air conditioners.', 'The same command-and-control confidence produced fast decisions but weak product-market fit.', 'Phone and Yinlong stories became cautionary examples in the base report.', 'Users punish irrelevant diversification because durable-appliance trust does not automatically transfer to phones or EVs.', 'The lesson is that channel power cannot replace category-native product truth.', price('Gree phone and Yinlong-related prices/valuation should not be quoted without preserved sources; report keeps them as failure-boundary cases.', 'No subscription/software fee is the core issue; the issue is category fit and capital allocation.', 'Accessory/service price: EV and phone service networks require different service economics from air conditioners.', 'Competitor price comparison: Xiaomi/Apple in phones and BYD/Tesla in EVs have platform-native advantages that Gree did not possess.', [dong[1], musk[3], jobs[7]]), [dong[0], dong[1]])
    ],
    founders: [
      founder('Dong Mingzhu', 'Chairwoman / professional manager', 'Not the founder of Gree; she is the professional-manager symbol of sales discipline and channel governance.', [dong[0]]),
      founder('Zhu Jianghong', 'Gree early leader', 'Important early Gree leader and Dong’s predecessor; needed to avoid rewriting Gree history as a one-person founding story.', [src('Zhu Jianghong public profile', 'https://en.wikipedia.org/wiki/Zhu_Jianghong', 'media')])
    ],
    capital: [
      capital('1990', 'salary', 'about RMB 200/month', 'CNY', 'Base report records Dong’s early monthly salary as a salesperson; this is personal career context, not company capital.', dong[0]),
      capital('1990', 'cash_collection', 'RMB 420K', 'CNY', 'Base report records her famous first-year debt collection case as a sales-governance signal.', dong[0]),
      capital('1992', 'regional_sales', 'RMB 16M', 'CNY', 'Base report records Anhui sales of about RMB 16M; useful as sales-ability evidence, not audited segment revenue.', dong[0]),
      capital('2023', 'company_profit', '$4.1B profit', 'USD', 'Forbes-cited public profile says Gree fiscal 2023 profit reached about $4.1B.', dong[0])
    ],
    research_gaps: ['Do not treat Dong as Gree founder.', 'Exact live-commerce GMV, dealer rebate cash flow, and phone/Yinlong losses need primary sources before writing as facts.', 'Gree SKU prices should be captured by region and installation package.'],
    sources: dong,
    learning_summary: ['The learnable part is channel governance, not personality worship.', 'A sales method can create a platform-like distribution advantage, but it may not transfer to unrelated categories.', 'Professional-manager reports must separate personal career money from company capital.']
  }),
  report({
    brand: 'Zhang Xiaolong / WeChat',
    slug: 'zhangxiaolong',
    summary: 'Zhang Xiaolong is a product-methodology and platform case, not a normal company founder case. The product method is restraint, low interruption, relationship-chain priority, and invisible commercialization. WeChat monetizes by letting payments, ads, mini programs, channels, enterprise tools and merchants sit on top of the social graph. The risk is that the same restraint can become slow iteration, weak support, closed ecosystem governance, and an AI-era product hesitation.',
    channel_path: ['Foxmail proves small-tool product taste', 'Tencent internal support gives WeChat room to attack QQ/mobile messaging', 'Social graph becomes daily identity layer', 'Payments and mini programs convert utility into commerce', 'Ads, Channels and enterprise tools monetize without charging users directly'],
    channels: { ...platformChannels, social_graph: 'The user relationship chain is the core channel.', merchants: 'Payments, mini programs and Channels turn merchants into platform participants.', ads: 'Marketing services monetize attention without making WeChat a paid consumer app.' },
    business_model: { revenue_streams: ['Payment service fees', 'Mini program commerce and services', 'Advertising / marketing services', 'Channels commerce and livestreaming', 'Enterprise WeChat / cloud ecosystem'], pricing_logic: 'Consumer app is free; monetization is hidden in merchant fees, ad auctions, cloud/enterprise services and platform commerce.', channel_economics: 'A massive social graph lowers distribution cost but creates governance and support burdens.' },
    products: [
      method('WeChat social graph / use-and-leave philosophy', 'product_methodology', 1, 'This is the core product principle that made WeChat a national default.', 'Zhang moved from Foxmail to Tencent and built WeChat as a mobile-first social utility.', 'The pre-market problem was mobile messaging and fragmented social identity.', 'Restraint, low-friction messaging, QR identity, groups and moments created a daily utility layer.', 'WeChat became infrastructure rather than just an app.', 'Consumers pay zero direct price but pay switching cost through relationships, history, payments and identity.', 'It became the distribution base for Tencent’s consumer internet ecosystem.', price('Consumer price: RMB 0 / free app; the price is switching cost and data/identity dependence rather than SKU price.', 'No mandatory consumer subscription for core chat; monetization comes indirectly through services, ads, payments and enterprise products.', 'Accessory/service price: no hardware accessory; service cost appears as customer support burden, account recovery, cloud/enterprise tools and merchant service fees.', 'Competitor price comparison: WhatsApp and Telegram are also free consumer messaging apps; WeChat differs by embedding payments, mini programs and broader China life services.', [zhang[0], zhang[4], zhang[7], zhang[8]]), [zhang[0], zhang[4]]),
      method('WeChat Pay + Mini Programs', 'platform_commercialization', 2, 'This is the commercialization layer that turned a messenger into infrastructure.', 'Tencent added payment and mini programs on top of the social graph rather than charging users for chat.', 'Merchants needed a low-friction way to transact inside the place where users already communicate.', 'QR payments, mini programs and official accounts convert traffic to transactions without app installs.', 'The platform made WeChat a commerce, services and local-life layer.', 'Consumers experience convenience; merchants pay through fees, ads, service providers and platform dependence.', 'It reshaped China’s mobile internet into app-within-app distribution.', price('Consumer price: free; merchant pricing is contract/category dependent and should be checked in Weixin Pay merchant documentation.', 'No consumer subscription; platform monetization is payment service fee, ads, service provider tools and cloud/enterprise products.', 'Accessory/service price: service provider fees, payment settlement, compliance, customer support and mini-program development are real merchant costs.', 'Competitor price comparison: Alipay monetizes payments/finance more directly; Douyin/Kuaishou monetize content-commerce traffic; Apple App Store takes app commissions in a different operating-system layer.', [zhang[2], zhang[5], jobs[6]]), [zhang[2], zhang[5]]),
      method('WeChat Channels / ads / AI boundary', 'attention_and_ai_layer', 3, 'This shows where Zhang’s restraint collides with modern content and AI commercialization.', 'WeChat historically resisted aggressive feed monetization, then added Channels and more ad inventory slowly.', 'Short video, livestreaming and AI search forced WeChat to compete with ByteDance and other content platforms.', 'Channels monetizes attention while trying not to break the social utility core.', 'Tencent financial releases link Weixin/WeChat to advertising and fintech/business services growth.', 'Users get content and creator commerce, but also more platform governance issues.', 'The platform’s next test is whether AI can be embedded without destroying the product philosophy.', price('Consumer price: free; ads are auction-priced and merchant/creator costs vary by campaign.', 'No mandatory subscription; AI, search and content features are platform services rather than paid consumer tiers in the cited sources.', 'Accessory/service price: creator tools, merchant service providers, customer support, moderation and compliance are the real platform costs.', 'Competitor price comparison: Douyin/TikTok monetizes attention more aggressively; Telegram has Premium subscription; WhatsApp focuses more on business messaging and ads are less central.', [zhang[2], zhang[3], zhang[8]]), [zhang[2], zhang[3]])
    ],
    founders: [
      founder('Zhang Xiaolong / Allen Zhang', 'WeChat product leader', 'Foxmail creator and Tencent executive who led WeChat; not the founder of Tencent.', [zhang[0], zhang[1]]),
      founder('Pony Ma / Tencent', 'Corporate sponsor context', 'Tencent and Pony Ma provided the internal platform and capital context; WeChat is an internal project, not Zhang’s independent company.', [src('Pony Ma public profile', 'https://en.wikipedia.org/wiki/Ma_Huateng', 'media'), zhang[2]])
    ],
    capital: [
      capital('2000', 'Foxmail_sale', 'RMB 12M', 'CNY', 'Chinese Foxmail public profile records Foxmail sale to Boda for RMB 12M; use as Zhang’s pre-WeChat commercialization event.', src('Foxmail Chinese public profile', 'https://zh.wikipedia.org/wiki/Foxmail', 'media')),
      capital('2005', 'Tencent_acquisition', 'Tencent acquired Foxmail', 'N/A', 'Foxmail was acquired by Tencent, bringing Zhang into Tencent context.', zhang[1]),
      capital('2026-Q1', 'platform_users', '1.40B MAU', 'users', 'Tencent reporting/coverage cites Weixin + WeChat combined MAU around 1.40B at the end of March 2025/2026 period depending on report.', zhang[2]),
      capital('2026-Q1', 'company_revenue', 'RMB 196.46B', 'CNY', 'WSJ coverage of Tencent Q1 2026 reports revenue of RMB 196.46B; use as Tencent-level context, not WeChat standalone revenue.', src('WSJ Tencent Q1 2026 coverage', 'https://www.wsj.com/business/earnings/tencent-maintains-double-digit-profit-growth-amid-intensified-ai-investment-7847e010', 'media'))
    ],
    research_gaps: ['WeChat standalone revenue, exact payment take rate and mini-program commission should not be invented.', 'Zhang personal wealth is not a product-methodology fact unless sourced.', 'AI AgentOS claims need official Tencent confirmation before writing as fact.'],
    sources: zhang,
    learning_summary: ['WeChat is a platform monetization case hidden behind a free consumer product.', 'Zhang’s method is restraint and relationship-chain priority, not growth hacking.', 'The biggest risk is that restraint becomes slow platform governance in AI and short-video eras.']
  }),
  report({
    brand: 'Steve Jobs / Apple-Pixar-NeXT',
    slug: 'stevejobs',
    summary: 'Steve Jobs should be mapped as a product-methodology case: end-to-end control, taste as strategy, category reframing, launch theater and ecosystem monetization. His commercialization path moved from Apple I hobbyist demand to Apple II scale, Macintosh design premium, NeXT technology salvage, Pixar storytelling economics, and finally iPod/iPhone/App Store platform economics. The report should not reduce Jobs to a single Apple SKU or generic founder myth.',
    channel_path: ['Hobbyist order validates Apple I', 'Apple II proves mass personal-computer business', 'Macintosh / NeXT build integrated design philosophy', 'Pixar proves creative-platform commercialization', 'iPod / iPhone / App Store turn product taste into ecosystem economics'],
    channels: { ...platformChannels, launch_theater: 'Keynotes and product reveals were distribution assets.', retail_ecosystem: 'Apple Store, iTunes and App Store converted product love into controlled commerce.', developer_platform: 'App Store turned iPhone from device into platform.' },
    business_model: { revenue_streams: ['Premium hardware margin', 'Software and OS integration', 'App Store commissions', 'Music/media sales', 'Pixar/Disney equity value'], pricing_logic: 'Use premium pricing when the product reframes the category and reduces user complexity.', channel_economics: 'Control the full stack so margins, experience and developer distribution stay inside the ecosystem.' },
    products: [
      method('Apple I -> Apple II: hobbyist demand to packaged computer', 'product_methodology', 1, 'This shows Jobs turning Wozniak’s engineering into a sellable product.', 'Wozniak built the technical core; Jobs pushed packaging, sales and company formation.', 'The Byte Shop order forced Apple to deliver assembled computers rather than loose hobby boards.', 'Apple II reframed personal computing as an appliance-like consumer/business product.', 'It created Apple’s first scale business.', 'Customers paid for a usable product, not only technical possibility.', 'This is the origin of Jobs’s pattern: simplify and package complexity.', price('Apple I listed at $666.66; Byte Shop first order was 50 units at $500 each wholesale; Apple II launched at premium microcomputer pricing.', 'No subscription/software fee; monetization was hardware sale and later software ecosystem around the platform.', 'Accessory/service price: monitor, cassette/disk drive, expansion cards, software and support were part of total ownership cost.', 'Competitor price comparison: Altair/IMSAI kits were cheaper hobbyist options; Apple’s premium came from assembly, usability and packaging.', [jobs[2], jobs[3]]), [jobs[2], jobs[3]]),
      method('iPod / iPhone / App Store platform', 'platform_commercialization', 2, 'This is Jobs’s strongest product-to-platform commercialization path.', 'After returning to Apple, Jobs simplified the product line, then expanded from Mac to music to phone.', 'Users wanted fewer devices and easier media/mobile internet experiences.', 'iPod + iTunes solved music; iPhone solved phone + internet; App Store solved developer distribution.', 'The iPhone/App Store became a recurring platform business after Jobs’s era.', 'Users paid premium hardware prices and then kept buying apps, services and accessories.', 'It became the global template for mobile ecosystem monetization.', price('Original iPhone launched at $499/$599 with carrier contract; current iPhone prices vary by model and storage on Apple official store.', 'App Store monetization historically used 30% commission, with 15% Small Business Program for eligible developers.', 'Accessory/service price: cases, chargers, AppleCare, carrier plans, storage upgrades and app purchases shape total cost.', 'Competitor price comparison: BlackBerry/Nokia/Palm sold devices; Google Android gave OS to OEMs; Apple captured integrated hardware plus platform economics.', [jobs[6], jobs[7], jobs[1]]), [jobs[0], jobs[6]]),
      method('NeXT + Pixar: failure salvage and creative platform economics', 'capital_recycling_method', 3, 'Jobs’s non-Apple years show how failure and taste became future leverage.', 'After leaving Apple, Jobs funded NeXT and bought Pixar, neither a straightforward early win.', 'NeXT hardware was expensive and niche; Pixar needed a business model beyond demos and hardware.', 'NeXTSTEP became the foundation for modern Apple OS; Pixar turned animation technology into story-driven studio economics.', 'Apple bought NeXT for $427M; Disney bought Pixar for $7.4B.', 'Customers did not buy NeXT at scale, but Apple later bought the technology; audiences bought Pixar stories.', 'The lesson is that technical failure can become platform infrastructure if the underlying system is valuable.', price('NeXT Computer launched at a very high workstation price; Apple acquired NeXT for $427M; Jobs bought Pixar from Lucasfilm for about $5M plus investment and Disney later acquired Pixar for $7.4B.', 'No consumer subscription; monetization came from workstation sales, OS value, film box office, distribution deals and equity sale.', 'Accessory/service price: NeXT required expensive workstation ecosystem; Pixar required production/distribution capital rather than consumer accessories.', 'Competitor price comparison: Sun/SGI workstations competed with NeXT; Disney/DreamWorks competed in animation; Jobs won through OS leverage and Pixar storytelling economics rather than SKU volume.', [jobs[4], jobs[5]]), [jobs[4], jobs[5]])
    ],
    founders: [
      founder('Steve Jobs', 'Co-founder / product leader', 'Apple co-founder, NeXT founder and Pixar majority owner; best studied as a product-methodology operator.', [jobs[0], jobs[8]]),
      founder('Steve Wozniak', 'Apple co-founder', 'Technical creator of Apple I/II; needed to keep Jobs product-commercial role separate from invention role.', [src('Steve Wozniak public profile', 'https://en.wikipedia.org/wiki/Steve_Wozniak', 'media')]),
      founder('Ronald Wayne', 'Apple co-founder', 'Early co-founder who exited quickly; useful for founding-history boundary.', [src('Ronald Wayne public profile', 'https://en.wikipedia.org/wiki/Ronald_Wayne', 'media')])
    ],
    capital: [
      capital('1976', 'first_order', '50 units x $500', 'USD', 'Byte Shop order created the first real Apple I commercial pull.', jobs[2]),
      capital('1977', 'angel_credit', '$92K + $250K credit line', 'USD', 'Mike Markkula invested and helped secure credit, according to public Apple history.', jobs[3]),
      capital('1985', 'NeXT_funding', '$7M', 'USD', 'Jobs founded NeXT with about $7M after leaving Apple.', jobs[0]),
      capital('1986', 'Pixar_purchase', '$5M purchase + $5M investment', 'USD', 'Jobs bought Lucasfilm’s computer graphics division and invested additional capital, later Pixar.', jobs[5]),
      capital('1996-1997', 'NeXT_acquisition', '$427M', 'USD', 'Apple acquired NeXT, bringing Jobs and NeXTSTEP back into Apple.', jobs[4]),
      capital('2006', 'Pixar_sale', '$7.4B', 'USD', 'Disney acquired Pixar, making Jobs Disney’s largest individual shareholder.', jobs[5])
    ],
    research_gaps: ['Do not write exact product margins without Apple filings.', 'Do not over-attribute Wozniak’s engineering to Jobs.', 'Jobs personal net worth should be sourced by date if used.'],
    sources: jobs,
    learning_summary: ['Jobs’s GTM is taste plus full-stack control turned into platform economics.', 'The commercial path matters more than the myth: order, packaging, launch, retail, developers, services.', 'NeXT and Pixar show that apparent failure can become infrastructure or equity leverage.']
  }),
  report({
    brand: 'Elon Musk / Tesla-SpaceX-X',
    slug: 'elonmusk',
    summary: 'Elon Musk should be mapped as a portfolio-of-platforms methodology: first-principles cost attack, vertical integration, mission narrative, founder-led demand generation, and high-risk capital recycling. The commercialization paths differ by company: Tesla monetizes vehicles, software and charging; SpaceX monetizes launch contracts and Starlink subscriptions; X monetizes ads and subscriptions; xAI monetizes AI access and compute narrative. These must not be blended into one fake Musk revenue stream or one live net-worth claim.',
    channel_path: ['Zip2 and PayPal exits create founder capital', 'SpaceX and Tesla recycle risk capital into impossible categories', 'Founder narrative creates demand and talent density', 'Vertical integration reduces cost and increases iteration speed', 'Software/subscription layers attempt to turn hardware/platforms into recurring revenue'],
    channels: { ...platformChannels, mission: 'Mars, sustainable energy and free-speech/AI narratives recruit users, talent and capital.', contracts: 'Government contracts and fixed-price launch services are core SpaceX GTM.', subscriptions: 'FSD, Starlink and X Premium are separate recurring models.' },
    business_model: { revenue_streams: ['Tesla vehicle sales', 'FSD and connectivity subscriptions', 'SpaceX launch contracts', 'Starlink hardware/service', 'X ads and Premium subscriptions', 'xAI subscriptions/API/enterprise access'], pricing_logic: 'Use high-visibility hardware/platform wedge, then add software, service or contract revenue.', channel_economics: 'Founder attention is a channel and a risk; each company has separate economics and governance.' },
    products: [
      method('Tesla EV + FSD software path', 'hardware_software_platform', 1, 'Tesla is the clearest example of Musk turning hardware into a software-upgrade narrative.', 'Musk joined Tesla as early investor/chairman and later CEO, pushing Roadster -> Model S -> Model 3/Y scale.', 'Pre-market obstacle was belief that EVs were slow, ugly and low range.', 'Battery integration, direct sales, OTA updates, Supercharger network and FSD narrative.', 'Tesla made EVs aspirational and forced the auto industry to respond.', 'Customers buy a vehicle, then face optional software subscriptions and charging ecosystem lock-in.', 'It made the car a software platform, but autonomy promises create legal and trust risk.', price('Tesla vehicle prices vary by model and region; use official Tesla order page for live Model Y/3/S/X/Cybertruck price.', 'FSD (Supervised) subscription official price: $99/month; Tesla states it requires active driver supervision and is not autonomous.', 'Accessory/service price: charging hardware, Supercharging, Premium Connectivity, tires, insurance, repairs and hardware upgrades affect total cost.', 'Competitor price comparison: BYD, Xiaomi SU7/YU7, Ford, GM, Hyundai/Kia and premium German EVs compete on price, range, software and charging network.', [musk[2], musk[3], ...xiaomiEvSources]), [musk[1], musk[2]]),
      method('SpaceX launch + Starlink subscription stack', 'infrastructure_platform', 2, 'SpaceX is the cost-attack and infrastructure-platform version of Musk GTM.', 'Musk used PayPal proceeds to found SpaceX and challenge cost-plus aerospace norms.', 'Pre-market obstacle was launch cost, reliability and government procurement credibility.', 'Reusable Falcon 9, vertical integration, NASA fixed-price milestones and Starlink internal demand for launches.', 'Falcon 9 changed commercial launch economics; Starlink turns launch capacity into consumer/enterprise connectivity.', 'Customers buy launch capacity or satellite internet rather than a consumer gadget.', 'It shows how infrastructure can become a platform when internal demand and external customers reinforce each other.', price('Falcon 9 public profile lists advertised Block 5 launch price around $74M in 2026; government missions can price higher. Starlink US residential coverage reports Standard Kit $349 and service around $120/month, with promotions in some markets.', 'Starlink is a monthly service subscription; launch customers pay mission contracts, not subscriptions.', 'Accessory/service price: Starlink hardware kit, routers, mounts, demand surcharge, installation and cancellation/change terms can add cost.', 'Competitor price comparison: ULA, Arianespace, Blue Origin and Rocket Lab compete in launch; Amazon Leo/Kuiper, OneWeb/Eutelsat and terrestrial broadband compete with Starlink.', [musk[5], musk[6], musk[7]]), [musk[4], musk[5]]),
      method('X / xAI attention and AI subscription layer', 'attention_ai_platform', 3, 'This is the highest-risk platform commercialization path in the Musk portfolio.', 'Musk bought Twitter for $44B and renamed it X; xAI later became the AI-company layer around Grok.', 'Pre-market issue was not user demand, but whether the platform could survive advertiser trust loss and governance shocks.', 'X Premium turns identity, ranking, long posts, creator monetization and Grok limits into subscription tiers.', 'The acquisition created huge attention but also advertiser, regulatory and valuation controversy.', 'Users may pay for status, reach and AI access, while advertisers price brand-safety risk.', 'It shows that founder-led distribution can also destroy platform trust if governance fails.', price('X Premium official web pricing starts at Basic $3/month or $32/year, Premium $8/month or $84/year, Premium+ $40/month or $395/year.', 'Subscription/software fee is central: X Premium tiers and Grok limits; xAI/Grok commercial terms should be checked separately.', 'Accessory/service price: creator payouts, ad spend, brand safety tools, API access and organization verification are platform service costs.', 'Competitor price comparison: Meta/Instagram monetize mostly ads, YouTube Premium combines ads/subscription, OpenAI/Claude/Gemini monetize AI subscriptions and API access.', [musk[8]]), [musk[0], musk[8]])
    ],
    founders: [
      founder('Elon Musk', 'Founder / CEO / investor across companies', 'Zip2, X.com/PayPal, SpaceX, Tesla, X, xAI, Neuralink and Boring Company must be treated as separate company lines.', [musk[0], musk[1]]),
      founder('Gwynne Shotwell / SpaceX operating context', 'President / COO context', 'Important operating counterweight for SpaceX; avoids reducing platform execution to Musk alone.', [src('Gwynne Shotwell public profile', 'https://en.wikipedia.org/wiki/Gwynne_Shotwell', 'media'), musk[4]])
    ],
    capital: [
      capital('1999', 'Zip2_exit', '$307M sale / about $22M to Musk', 'USD', 'Compaq bought Zip2; public profiles record Musk’s first major liquidity event.', musk[0]),
      capital('2002', 'PayPal_exit', '$1.5B sale / about $175M to Musk', 'USD', 'eBay bought PayPal; Musk used proceeds for SpaceX, Tesla and SolarCity-related bets.', musk[0]),
      capital('2006', 'NASA_COTS', '$278M then $396M', 'USD', 'Falcon 9 profile records NASA COTS milestone funding and later increase.', musk[5]),
      capital('2008', 'NASA_CRS', '$1.6B', 'USD', 'Base report records SpaceX survival inflection through NASA resupply contract.', musk[4]),
      capital('2022', 'Twitter_acquisition', '$44B', 'USD', 'Musk acquired Twitter for $44B; later valuation claims should be sourced separately.', musk[0]),
      capital('2026', 'FSD_subscription', '$99/month', 'USD', 'Tesla official support page lists FSD (Supervised) subscription at $99/month and states supervision is required.', musk[2])
    ],
    research_gaps: ['Do not use live net worth or private-company valuation without current reliable source.', 'Do not combine Tesla, SpaceX, X and xAI revenue into a single Musk revenue line.', 'SpaceX IPO/xAI merger claims require official filings or highly reliable sources before use.', 'FSD autonomy claims must preserve Tesla’s supervised-driver disclaimer.'],
    sources: musk,
    learning_summary: ['Musk’s learnable method is first-principles cost attack plus vertical integration, not personal chaos.', 'Each company has distinct monetization: cars/software, launches/contracts, satellite service, social/AI subscriptions.', 'Founder attention is both the GTM engine and the governance risk.']
  })
];

for (const item of reports) {
  fs.writeFileSync(path.join(outDir, item.brand_slug + '.json'), JSON.stringify(item, null, 2) + '\n', 'utf8');
  console.log('wrote data/gtm/' + item.brand_slug + '.json');
}

const comparison = `# Person / Platform GTM Comparison

Generated: 2026-06-17

These reports are intentionally not ordinary brand SKU reports. They map product methodology to commercialization paths.

| Person | Product Methodology | Commercialization Path | Price / Fee Form | Evidence Boundary |
|---|---|---|---|---|
| Dong Mingzhu | Channel discipline, price authority, service trust | Gree AC dealer system, rebates, direct retail/live commerce | AC SKU + installation/service, not a single app subscription | Do not treat Dong as Gree founder; do not invent live GMV or diversification losses |
| Zhang Xiaolong | Restraint, relationship chain, invisible commercialization | WeChat social graph -> Pay -> Mini Programs -> Ads/Channels | Free consumer app; merchant fees, ads, enterprise/cloud services | Do not invent WeChat standalone revenue or fixed payment take rate |
| Steve Jobs | End-to-end control, taste, category reframing | Apple I order -> Apple II -> Mac/NeXT -> Pixar -> iPhone/App Store | Premium hardware, App Store commission, ecosystem services | Do not conflate Wozniak engineering with Jobs commercialization |
| Elon Musk | First-principles cost attack, vertical integration, mission narrative | Tesla EV/FSD, SpaceX launch/Starlink, X/xAI subscriptions | Vehicle price, FSD $99/mo, Falcon 9 launch price, Starlink monthly, X Premium tiers | Do not blend company revenues or use unsourced live valuations |
`;

fs.writeFileSync(path.join(root, 'docs', 'person-platform-gtm-comparison.md'), comparison, 'utf8');
console.log('wrote docs/person-platform-gtm-comparison.md');
