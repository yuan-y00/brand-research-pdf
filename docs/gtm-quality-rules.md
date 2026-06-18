# GTM Quality Rules

## 1. 为什么需要质量规则

AI 连续生成多个品牌 GTM JSON 时，可能产生以下退化：

- 报告越来越短，产品分析从详细缩水到几句概括
- 越来越模板化，不同品牌的 one_sentence_gtm 和 channel_path 趋同
- 漏掉 founder_background（创始人背景）和 brand_timeline（品牌大事年表）
- 只看中文资料，忽略英文官方来源
- sources 数量减少，甚至出现"无来源"的结论
- 为了追求"干净"而把不确定的内容删除，而不是标注 low_confidence

这些规则用于在生成 JSON 后做轻量自检，防止退化。

---

## 2. English-first research

**对以下类型的品牌，必须优先使用英文资料：**

- 美国公司、全球上市公司
- 智能硬件、消费电子、DTC 品牌
- 在 Amazon / Best Buy / Walmart / Costco / Target / Apple Store 销售的品牌
- 有 Kickstarter / Indiegogo 众筹历史的品牌
- 有 SEC filings / investor relations 公开资料的公司
- 有 developer docs / official blog / newsroom 的技术平台公司

**具体做法：**

- 搜索时优先用英文关键词
- 最终报告用中文表达
- sources 保留英文原始链接和英文标题
- 中文资料只作为补充
- 不要因为中文资料少就判断资料少

**示例：研究 NVIDIA 时应搜索：**
"NVIDIA founder story", "NVIDIA early history", "NVIDIA CUDA ecosystem", "NVIDIA annual report", "NVIDIA data center business model"

而不是只搜索："英伟达 创始人"

---

## 3. 最低内容标准

| 检查项 | 最低要求 | 建议 |
|--------|---------|------|
| summary 长度 | 不少于 80 中文字 | 100-250 字 |
| channel_path 步数 | 至少 4 步 | 4-7 步 |
| channels 有效字段 | 至少 5 个 | 7-10 个 |
| business_model 有效字段 | 至少 3 个 | 5-9 个 |
| top_products 数量 | 1-3 个 | 2-3 个 |
| 每个产品 why_selected | 必须非空 | 50-150 字 |
| 每个产品 lessons.what_to_learn | 至少 3 条 | 3-6 条 |
| 每个产品 lessons.do_not_copy_blindly | 至少 2 条 | 2-5 条 |
| 每个产品 sources | 至少 2 条 | 3-6 条 |
| 全局 sources | 至少 5 条 | 8-12 条 |
| 每个产品必填 section | origin_story, pre_market, innovation, breakout, customer_impact, ecosystem_impact, lessons, sources | 全部非空 |

**每个 top_product 必须包含的全部 section：**
- why_selected
- origin_story (initial_problem, founder_or_team_insight, early_users, early_product_form, why_it_mattered)
- pre_market (old_solution, pain_points, market_barrier, why_existing_solutions_were_not_enough)
- innovation (technology, user_experience, pricing, channel, business_model, ecosystem, what_was_new_at_that_time)
- breakout (main_reasons, key_events, gtm_path)
- customer_impact (new_capability, time_saved, cost_reduction, income_opportunity, experience_change, who_benefited_most)
- ecosystem_impact (new_roles, affected_roles, new_services, new_channels, content_or_community, supply_chain_or_accessory, labor_income_signal)
- lessons (what_to_learn, do_not_copy_blindly, best_for_companies_like, not_suitable_for)
- sources

---

## 4. 创始人背景和品牌大事年表

GTM 扩展不能替代品牌基础研究。每次研究品牌时，应保留：

- 创始人 / 核心团队背景
- 品牌起源故事
- 融资或资金来源（如公开资料可得）
- 品牌重大事件年表
- 产品发布关键节点
- 渠道扩张关键节点
- 争议 / 召回 / 失败案例（如公开资料可得）

这些内容可以放在：
- gtm_extension.summary 中
- gtm_extension.learning_summary.open_questions 中
- sources.note 中
- 或新增可选的 brand_context 字段（放在 root 或 gtm_extension 下均可）

`brand_context` 示例：

```json
"brand_context": {
  "founder_background": "创始人和核心团队背景摘要",
  "brand_timeline": ["2011 创立", "2012 自研转型", "2018 GaN 首发", "2020 IPO", "2025 召回危机"],
  "notes": ""
}
```

---

## 5. 不做什么

- 不做事实审计（gtm-check.js 不验证数字真假）
- 不做爬虫
- 不做数据库
- 不做自动事实校验
- 不强求每个字段完美；找不到可靠来源时省略字段，让审计报告暴露缺口
- 不为了完整而编造数据

---

## 6. 检查命令

普通检查（有 warning 不阻止继续）：

```
node scripts/gtm-check.js data/gtm/anker.json
```

严格检查（有 warning 也 exit 1）：

```
node scripts/gtm-check.js data/gtm/anker.json --strict
```

要求检查 brand_context：

```
node scripts/gtm-check.js data/gtm/anker.json --require-brand-context
```

---

## 7. 新增必查项：价格、创始人链接、资金流水

每个 GTM JSON 现在建议包含三类更硬的数据。`gtm-check.js` 会对缺项给 warning：

### 产品价格栈

每个 `gtm_extension.top_products[]` 应包含 `pricing_model`：
- 产品本体价格：MSRP、首发价、当前官网/电商价。
- 配件/耗材/服务价格：替换件、安装、保修、维修、培训等。
- 软件/订阅费：App、会员、SaaS、云平台、RaaS、按小时/按月/按年价格。
- 竞品价格：至少 2 个可比竞品的产品价格，以及能找到的配件/订阅/服务价格。
- 单位经济信号：毛利率、硬件成本、部署成本、召回损失、payback 等。
- 价格来源 URL：官方、marketplace、filing、review、dealer quote 或可信媒体。

### 创始人履历链接

`brand_context.founder_profiles` 应包含创始人或关键 CEO 的履历摘要和来源链接。优先级：
1. 公司官网 / team page
2. LinkedIn
3. SEC filing / S-1 / DEF14A / annual report
4. 大学、实验室、专利或基金会页面
5. 可信媒体专访、播客、Wikipedia

### 资金事件流水

`brand_context.capital_history` 应按时间记录：
- 创始人第一笔钱从哪里来，金额多少。
- 第一笔收入、预售、众筹、订单或客户付款。
- 每轮融资金额、领投方、估值。
- 重大花费、亏损、召回损失、库存减值、诉讼赔偿、裁员重组。
- IPO、并购、退出、市值变化。

找不到公开数据时不要编造，也不要把 `not_found` / `unknown` / 搜索占位链接写进正文或 JSON。省略该字段，让审计报告记录缺口。
