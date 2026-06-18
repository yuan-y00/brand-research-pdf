# Brand GTM Extension Research Prompt

你是一个品牌增长、智能硬件、消费电子、DTC、众筹、线下零售、授权代理和产品创新研究专家。

我要给你一个品牌名。请你根据公开资料，帮我生成一个 GTM 扩展 JSON，用于追加到我的品牌研究报告后面。

## 输入

品牌名：{{BRAND_NAME}}

## 研究目标

请围绕这个品牌输出：

1. 品牌 GTM 总览
2. 美国市场或全球市场的主要增长路径
3. 众筹、独立站、Amazon、电商、社媒、线下、商超、代理、授权店模式
4. 商业模式
5. 自动选择这个品牌最成功或最有学习价值的产品 / 产品线，最多 3 个
6. 对每个产品做产品视角分析：
   - 为什么选择它
   - 产品最初诞生故事
   - 出现前市场痛点
   - 当时创新点
   - 爆发路径
   - 对客户的影响
   - 对生态、职业、收入机会的影响
   - 可学习点
   - 不能照抄的地方

## 重要边界

- 不要输出长篇散文。
- 必须输出合法 JSON。
- 不要在 JSON 外面写解释。
- 不要使用 Markdown。
- 不要为了完整而编造精确数字。
- 不确定且没有可靠来源的内容不要写进正文或 JSON。
- 如果某个品牌没有众筹、代理、商超、线下门店等公开证据，不要硬编，直接省略对应字段。
- 每个品牌最多选择 3 个代表产品或产品线。
- 如果成功的是产品线，可以用 product_line，不必强行选择单个 SKU。
- 对就业率、薪资增长、行业失业率等内容要谨慎。没有明确资料时，不要写成确定结论，只写"职业与收入机会信号"。
- 本报告主要用于学习商业模式和产品规律，不是审计报告。
- 可以记录低可信度推测，但必须标注 confidence。

## 资料语言策略（English-first research）

- 对美国市场、全球市场、上市公司、智能硬件、消费电子、DTC、Amazon、Best Buy、Target、Walmart、Costco、Apple、Kickstarter、Indiegogo、SEC filings、investor relations、company newsroom、official blog、developer docs、TechCrunch、The Verge、Wired、CNBC、Bloomberg、Reuters、HBS 相关品牌，优先使用英文资料搜索。
- 最终报告用中文表达，但 sources 保留英文原始链接和标题。
- 中文资料只作为补充，不要只依赖中文资料。
- 不要因为中文资料少就判断资料少。
- 如果品牌是美国公司、全球公司、上市公司、技术平台公司，必须优先搜索英文关键词。
- 如果主要依据英文公开资料整理，请在 sources 的 note 中说明。
- 示例：研究 NVIDIA / 英伟达时，不要只搜索中文关键词。优先使用：NVIDIA founder story, NVIDIA early history, NVIDIA GPU product history, NVIDIA CUDA ecosystem, NVIDIA GTC keynote, NVIDIA investor presentation, NVIDIA annual report, NVIDIA newsroom, NVIDIA data center business model, NVIDIA AI ecosystem impact, NVIDIA CUDA moat.

## 最低内容质量要求

生成 JSON 前，请在内部检查。不要输出过短报告。

最低要求：

- gtm_extension.summary 不要少于 80 个中文字或等量英文信息量。
- channel_path 至少 4 步。
- channels 至少填写 5 个有来源或有明确公开证据的有效字段。
- business_model 至少填写 3 个有效字段。
- top_products 必须是 1 到 3 个，不能为 0，不能超过 3。
- 每个 top_product 必须包含 why_selected、origin_story、pre_market、innovation、breakout、customer_impact、ecosystem_impact、lessons、sources。
- 每个 top_product 的 lessons.what_to_learn 至少 3 条。
- 每个 top_product 的 lessons.do_not_copy_blindly 至少 2 条。
- 全局 sources 建议至少 8 条；如果确实资料少，至少 5 条，并在 JSON 的 disclaimer 或 notes 中说明原因。
- 每个 top_product 的 sources 至少 2 条。
- 没有明确来源的数字不要写成核心结论。
- 不确定且没有可靠来源的内容不要写进报告数据；让审计清单暴露缺口。
- 不要为了完整而编造精确数字。

## 创始人背景与品牌大事年表保护规则

GTM 扩展不能替代品牌基础研究。如果原报告或用户要求中包含品牌基础信息，请不要省略：

- 创始人 / 核心团队背景
- 品牌起源故事
- 融资或资金来源，如公开资料可得
- 品牌重大事件年表
- 产品发布关键节点
- 渠道扩张关键节点
- 争议 / 召回 / 失败案例，如公开资料可得

如果 GTM JSON 当前结构没有专门字段容纳这些内容，请至少在 gtm_extension.summary、gtm_extension.learning_summary.open_questions 或 sources.note 中保留相关提醒。

如果需要补充一个可选字段来容纳这些背景信息，可以使用 brand_context（放在 root 或 gtm_extension 下均可）：

"brand_context": {
  "founder_background": "创始人和核心团队背景摘要",
  "brand_timeline": "品牌大事年表关键节点",
  "notes": "其他重要背景说明"
}

不要因为写入 brand_context 导致 JSON 不合法。

## 选择代表产品的规则

请按优先级选择：

1. 销量、收入、市场份额明显高的产品
2. 众筹金额、预售金额、用户数特别突出的产品
3. 帮品牌打开某个市场的产品
4. 形成行业影响或生态影响的产品
5. 被媒体、用户、渠道长期认为是代表作的产品
6. 更能帮助我学习产品创新、GTM 路径、渠道模式的产品

如果资料不足，请选公开资料中最常被提到、最有代表性的产品线，并把 confidence 写成 medium 或 low。

## 输出 JSON 结构

请严格输出下面结构。可以补充字段，但不要删除核心字段。

{
  "brand": "{{BRAND_NAME}}",
  "brand_slug": "",
  "market_focus": "US / Global",
  "report_type": "gtm_extension",
  "version": "1.0",
  "generated_by": "AI-assisted public-source research",
  "disclaimer": "This report is for learning and pattern recognition. It does not perform strict fact auditing.",
  "gtm_extension": {
    "summary": "",
    "one_sentence_gtm": "",
    "channel_path": [],
    "channels": {
      "crowdfunding": "",
      "dtc": "",
      "amazon": "",
      "ecommerce": "",
      "social_media": "",
      "retail": "",
      "dealer": "",
      "authorized_store": "",
      "offline": "",
      "service_network": ""
    },
    "market_entry": {
      "us_market": "",
      "china_market": "",
      "global_market": "",
      "notes": ""
    },
    "business_model": {
      "hardware": "",
      "subscription": "",
      "consumables": "",
      "accessories": "",
      "service": "",
      "repair": "",
      "training": "",
      "dealer_margin_or_channel": "",
      "other": ""
    },
    "offline_and_dealer_model": {
      "has_offline_model": "",
      "retail_partners": [],
      "dealer_or_distributor": "",
      "authorized_store": "",
      "service_and_repair": "",
      "training_or_demo": "",
      "notes": ""
    },
    "top_products_selection_rule": "Choose no more than 3 products or product lines based on public evidence of success, market impact, GTM learning value, and product innovation.",
    "top_products": [
      {
        "name": "",
        "type": "product_or_product_line",
        "rank": 1,
        "why_selected": "",
        "success_type": [],
        "confidence": "medium",
        "origin_story": {
          "initial_problem": "",
          "founder_or_team_insight": "",
          "early_users": [],
          "early_product_form": "",
          "why_it_mattered": "",
          "confidence": "medium"
        },
        "pre_market": {
          "old_solution": [],
          "pain_points": [],
          "market_barrier": "",
          "why_existing_solutions_were_not_enough": ""
        },
        "innovation": {
          "technology": [],
          "user_experience": [],
          "pricing": "",
          "channel": [],
          "business_model": [],
          "ecosystem": [],
          "what_was_new_at_that_time": ""
        },
        "breakout": {
          "main_reasons": [],
          "key_events": [
            {
              "date": "",
              "event": "",
              "type": "",
              "channel": "",
              "impact": "",
              "confidence": "medium"
            }
          ],
          "gtm_path": []
        },
        "customer_impact": {
          "new_capability": "",
          "time_saved": "",
          "cost_reduction": "",
          "income_opportunity": "",
          "experience_change": "",
          "who_benefited_most": []
        },
        "ecosystem_impact": {
          "new_roles": [],
          "affected_roles": [],
          "new_services": [],
          "new_channels": [],
          "content_or_community": [],
          "supply_chain_or_accessory": [],
          "labor_income_signal": ""
        },
        "lessons": {
          "what_to_learn": [],
          "do_not_copy_blindly": [],
          "best_for_companies_like": [],
          "not_suitable_for": []
        },
        "sources": [
          {
            "title": "",
            "url": "",
            "source_type": "official / media / marketplace / crowdfunding / review / other",
            "note": "",
            "confidence": "medium"
          }
        ]
      }
    ],
    "learning_summary": {
      "can_copy": [],
      "cannot_copy": [],
      "best_lessons": [],
      "open_questions": []
    },
    "sources": [
      {
        "title": "",
        "url": "",
        "source_type": "official / media / marketplace / crowdfunding / review / other",
        "note": "",
        "confidence": "medium"
      }
    ]
  }
}

## 内容质量要求

请尽量做到：

1. GTM 总览要短，但要能看出这个品牌怎么增长。
2. 渠道路径要像路径图，例如：
   Amazon 起量 → DTC 沉淀用户 → Best Buy / Target 放量 → 配件和新品扩张
3. 产品分析不要只写参数，要写：
   - 这个产品解决了什么旧问题
   - 当时为什么新
   - 为什么客户愿意买
   - 后来改变了什么
4. 客户影响要写具体：
   - 节省时间
   - 降低成本
   - 获得新能力
   - 创造收入机会
   - 改变使用习惯
5. 生态影响要写具体：
   - 新服务商
   - 新岗位
   - 维修/培训/安装
   - 配件/耗材
   - 内容创作者
   - 代理商/门店
6. 对失业率、薪资增长等宏观结论要谨慎，没有明确数据就写：
   "未找到明确薪资或失业率数据，更适合记录为职业与收入机会信号。"
7. 每个重要结论尽量给来源。
8. 没有来源的精确数字不要放入核心结论。
9. 如果来源互相冲突，用 about / approximately / 数据冲突，暂不作为核心结论。
10. 最后只输出 JSON，不要写解释。

## 新增强制研究维度：价格、创始人链接、资金流水

生成 JSON 时必须补充以下结构化信息。找不到时不要编造，也不要写 `not_found` / `unknown` / 搜索占位链接；直接省略该字段，让审计脚本暴露缺口。

### 1. 产品价格栈与竞品价格

每个 `gtm_extension.top_products[]` 必须新增 `pricing_model`：

```json
"pricing_model": {
  "product_price": "产品本体 MSRP / 官方价格 / 首发价 / 当前街价",
  "launch_price": "首发价格；有可靠来源才写",
  "current_price": "当前官方店、Amazon、Best Buy、官网、经销商或公开报价",
  "bundle_price": "套装价；有可靠来源才写",
  "accessory_price": "配件、耗材、替换件、安装包价格；有可靠来源才写",
  "software_subscription": "App、SaaS、会员、云平台、RaaS 或软件订阅费；有可靠来源才写",
  "service_fee": "安装、保修、维修、培训、部署、服务费；有可靠来源才写",
  "enterprise_or_raas_price": "企业报价、租赁、RaaS、按小时/按月/按年价格；有可靠来源才写",
  "competitor_price": "至少 2 个主要竞品的产品本体价格对比；有可靠来源才写",
  "competitor_accessory_price": "主要竞品配件/耗材/服务价格对比；有可靠来源才写",
  "competitor_subscription": "主要竞品软件/会员/云服务价格对比；有可靠来源才写",
  "gross_margin_or_unit_economics": "毛利率、单位经济、硬件成本、部署成本、召回损失等公开信号；有可靠来源才写",
  "notes": "价格口径、地区、日期、是否估算",
  "sources": []
}
```

优先查找：official store、pricing page、Amazon、Best Buy、Walmart、Costco、Apple Store、Kickstarter/Indiegogo、SEC filings、annual report、investor presentation、credible review、media teardown、dealer quote、RaaS press release。

### 2. 创始人履历链接

Root 或 `gtm_extension` 下必须新增 `brand_context.founder_profiles`。每位创始人/关键 CEO 至少给 1 个可点击履历来源：

```json
"brand_context": {
  "founder_profiles": [
    {
      "name": "",
      "role": "",
      "background_summary": "",
      "profile_links": [
        {
          "title": "",
          "url": "",
          "source_type": "official / linkedin / filing / media / interview / podcast / wikipedia / other",
          "note": "",
          "confidence": "medium"
        }
      ]
    }
  ]
}
```

优先使用：公司官网 team/about、LinkedIn、SEC S-1/10-K/DEF14A、Crunchbase/YC profile、Wikipedia、大学/实验室页面、可信媒体专访、播客文字稿。

### 3. 资金流水 / 资本事件时间线

`brand_context.capital_history` 必须按时间顺序记录钱从哪里来、赚了多少、花了多少、亏了多少、融了多少、估值多少。不要只写“融资背景”，要写成事件流水：

```json
"capital_history": [
  {
    "date": "",
    "event": "founder_cash / first_revenue / spend / burn / profit / loss / funding / valuation / recall_loss / acquisition / ipo / other",
    "amount": "",
    "currency": "",
    "description": "",
    "source": {
      "title": "",
      "url": "",
      "source_type": "official / filing / media / marketplace / other",
      "confidence": "medium"
    },
    "confidence": "medium"
  }
]
```

最低要求：
- 创始人第一笔钱：自筹、家人朋友、贷款、奖学金、卖掉公司、工作积蓄、天使轮等；找不到可靠来源就省略。
- 第一笔收入/众筹/预售/订单：金额、时间、平台或客户；找不到可靠来源就省略。
- 每轮融资：时间、金额、领投方、估值（如公开）。
- 重大亏损/花费：召回损失、库存减值、工厂 capex、营销烧钱、裁员重组、诉讼赔偿；找不到可靠来源就省略。
- 上市或并购：募资金额、退出金额、市值变化（如适用）。
