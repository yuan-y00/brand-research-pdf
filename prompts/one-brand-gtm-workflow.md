# 一段式品牌 GTM 研究工作流

下面是你的完整任务。你作为品牌增长研究专家，请按步骤执行。

---

## 输入

品牌名：{{BRAND_NAME}}

---

## 第 1 步：读取研究 prompt

请先读取文件：

prompts/brand-gtm-extension.md

把里面所有 `{{BRAND_NAME}}` 替换成我指定的品牌名：**{{BRAND_NAME}}**。

---

## 第 2 步：研究品牌 GTM 和代表产品（English-first）

按照上面的 prompt 要求，搜索公开资料，生成品牌 GTM 扩展 JSON。

**资料语言策略（重要）：**

- 对美国市场、全球品牌、上市公司、技术公司，优先使用英文资料搜索。
- 最终报告用中文表达，但 sources 保留英文原始链接。
- 中文资料只作为补充，不要只依赖中文资料。
- 如果品牌是美国/全球公司，必须优先搜索英文关键词。

要求：

- 输出合法 JSON
- brand_slug 字段使用品牌名转小写 slug（空格、下划线转 `-`）
- 不要在 JSON 外写 Markdown 或解释
- top_products 最多 3 个（至少 1 个）
- 不确定的内容写 unknown / not_found / low_confidence
- 每个重要结论尽量标注来源

---

## 第 3 步：保存 JSON

把 AI 输出的 JSON 保存为：

data/gtm/{brand-slug}.json

其中 `{brand-slug}` 是品牌名转小写 slug。

示例：

| 品牌名 | brand_slug | JSON 路径 |
|--------|-----------|-----------|
| Anker | anker | data/gtm/anker.json |
| DJI | dji | data/gtm/dji.json |
| Bambu Lab | bambu-lab | data/gtm/bambu-lab.json |
| NVIDIA | nvidia | data/gtm/nvidia.json |

---

## 第 4 步：找到对应旧报告

旧报告在 `examples/` 目录下，命名规律是 `{brand-slug}-report.html`。

如果默认文件名不存在，运行：

```
node scripts/gtm-workflow.js "{{BRAND_NAME}}" --find-report
```

查看匹配到的候选报告。

如果自动匹配成功（只有一个候选），直接使用。
如果有多个候选，告诉我，让我选择。

---

## 第 5 步：质量自检

保存 JSON 后，请自检以下内容（不依赖脚本，自己检查）：

- [ ] JSON 是否合法（没有 trailing comma、所有 key 用双引号）？
- [ ] summary 是否足够长（不要一两句话结束）？
- [ ] channel_path 是否至少有 4 步？
- [ ] channels 是否至少填写了 5 个有效字段？
- [ ] business_model 是否至少填写了 3 个有效字段？
- [ ] top_products 是否 1-3 个（不是 0，不是 4+）？
- [ ] 每个 top_product 是否包含 why_selected、origin_story、pre_market、innovation、breakout、customer_impact、ecosystem_impact、lessons、sources？
- [ ] 每个 product 的 lessons.what_to_learn 是否至少 3 条？
- [ ] 每个 product 的 lessons.do_not_copy_blindly 是否至少 2 条？
- [ ] 全局 sources 是否至少 5 条（建议 8+）？
- [ ] 每个 product sources 是否至少 2 条？
- [ ] 是否优先使用了英文资料（而不是只看中文）？
- [ ] founder_background 和 brand_timeline 是否在 summary 或 brand_context 中保留？
- [ ] JSON 外是否没有任何 Markdown 代码块标记？
- [ ] 不确定的数字是否标注了 low_confidence 或 not_found？

如果发现问题，请修正 JSON 后再继续。

---

## 第 6 步：追加 GTM section 到报告

运行：

```
node scripts/gtm-workflow.js "{{BRAND_NAME}}" --append
```

如果报告文件名和 brand_slug 不一致，需要手动指定：

```
node scripts/gtm-workflow.js "{{BRAND_NAME}}" --append --report examples/实际文件名.html
```

如果输出文件已存在且要覆盖：

```
node scripts/gtm-workflow.js "{{BRAND_NAME}}" --append --force
```

---

## 第 7 步：确认输出

追加成功后，新报告在：

examples/{brand-slug}-report-gtm.html

原始报告不会被修改。

建议运行质量检查：

```
node scripts/gtm-check.js data/gtm/{brand-slug}.json
```

---

## 注意事项

- 不要做爬虫
- 不要做数据库
- 不要做事实审计
- 不确定的内容标注 confidence
- JSON 必须合法
- 不要在 JSON 外输出解释
- 不确定的数字不要编造
- 研究美国/全球品牌时优先英文资料
- 不要让报告越来越短——每个品牌都要认真研究
