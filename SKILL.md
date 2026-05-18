---
name: brand-research
description: 输入任意品牌/公司名称，自动完成深度调研并生成横版 A4 精美 PDF 报告。覆盖品牌大事年表、收入增长、竞对对比、成功因素、失败教训、客户评价（含百分比）、核心数据与结论。基于 Hyrox 调研方法论的通用化版本。
---

# Brand Research PDF — 品牌调研报告自动生成

输入品牌名，自动完成 Web 调研 → 内容组织 → 排版分页 → 生成可导出 PDF 的 HTML 文件。

## 触发方式

用户说以下任意一句即可：

- "帮我调研 [品牌名]"
- "生成 [品牌名] 的调研报告 PDF"
- "/brand-research [品牌名]"

## 工作流程

### Phase 1: Web 调研（自动搜索以下维度）

按以下 7 个维度并行搜索，每项搜索至少获取 2 个独立来源：

1. **品牌大事年表** — 搜索 "品牌名 history founding timeline milestones 2017-2026"
2. **收入/规模数据** — 搜索 "品牌名 revenue growth financial performance 2022 2023 2024 2025"
3. **竞对对比** — 搜索 "品牌名 vs competitor1 vs competitor2 comparison 2024"
4. **成功因素** — 搜索 "品牌名 success factors business model strategy right decisions"
5. **问题/争议** — 搜索 "品牌名 controversy mistakes criticism problems 2024 2025"
6. **客户评价** — 搜索 "品牌名 customer reviews reddit Trustpilot complaints ratings"
7. **竞对同期动态** — 搜索 "competitor1 competitor2 revenue decline bankruptcy what happened 2022-2025"

搜索结果中的**每一个数字、百分比、金额、日期都必须注明来源**。

### Phase 2: 内容组织

将调研结果组织为以下 7 章结构：

| 章节 | 内容要求 |
|------|---------|
| 一、品牌大事年表 | 10 行表格：时间 / 事件 / 关键细节 / 影响（颜色编码） |
| 二、收入与规模增长 | KPI stat-row（6 卡片）+ 营收结构表 + 利润率表 |
| 三、竞争对手同期对比 | 5-6 行 × 5 列表格 + KPI 对比网格 + 文字总结 |
| 四、做对了什么 | 6 张详细卡片（2 列 × 3 行），每张含 KPI 行 + 正文 + vs 竞对 |
| 五、做错了什么 | 6 张详细卡片（2 列 × 3 行），每张含 KPI 行 + 正文 + 竞对教训 |
| 六、客户真实评价 | Trustpilot 评分 + 星级分布柱状图 + 正负面引用 + 投诉主题占比表 |
| 七、核心数据 & 结论 | 15 行数据汇总表 + 4 张结论卡片 |

**内容质量标准：**
- 每个数字必须有来源
- 每条分析必须有竞对对比视角
- 客户评价必须有百分比
- 结论必须包含风险判断

### Phase 3: 分页规划（必须输出）

```
Page 01（封面）：横版，左右结构 + 4 个 KPI 卡片

Page 02（大事年表）：
  - h1 + section-label: 50px
  - info-table (表头 + 10行): 40 + 420 = 460px
  总计: ~510px ✓

Page 03（收入规模）：
  - h1 + section-label: 50px
  - callout: 45px
  - stat-row (6卡片): 85px
  - divider: 30px
  - col-2 (营收表 + 利润率表): ~280px
  总计: ~490px ✓

Page 04（竞对对比）：
  - h1 + section-label: 50px
  - info-table (表头 + 7行): 40 + 294 = 334px
  - divider: 30px
  - kpi-grid (5卡片): 85px
  总计: ~499px ✓

Page 05（做对了什么）：
  - h1 + section-label: 50px
  - 6 张 insight-card (2列×3行): 3 × ~220 = 660px
  总计: ~710px ✓

Page 06（做错了什么）：
  - h1 + section-label: 50px
  - 6 张 insight-card (2列×3行): 3 × ~220 = 660px
  总计: ~710px ✓

Page 07（客户评价）：
  - h1 + section-label: 50px
  - col-2: 左侧 review-stat-box + 柱状图 + 投诉表 ≈ 500px
  总计: ~550px ✓

Page 08（核心数据 + 结论）：
  - h1 + section-label: 50px
  - col-2: 左侧数据总表 + 右侧 4 张结论卡 ≈ 600px
  总计: ~650px ✓
```

横版 A4 可用高度：**~734px**（210mm - 上下 60px padding）

### Phase 4: 生成 HTML

使用以下 HTML 骨架（已修复所有已知坑）：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>[品牌名] 深度调研报告</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=DM+Sans:wght@400;500;700&family=Playfair+Display:wght@700;900&family=Noto+Sans+SC:wght@300;400;500;700&family=Noto+Serif+SC:wght@600;700;900&display=swap');

:root {
    --warm-cream: #FFF8F0;
    --terracotta: #E07A5F;
    --sage: #81B29A;
    --navy: #3D5A80;
    --charcoal: #2B2D42;
    --soft-peach: #F4ACB7;
    --mid-gray: #8B8B8B;
    --border-light: #E6DFD3;
    --bg-stripe: #FCFAF7;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
    font-family: 'DM Sans', 'Noto Sans SC', sans-serif;
    font-size: 13.5px; line-height: 1.55;
    color: var(--charcoal); background: #D5CFC6;
    -webkit-font-smoothing: antialiased;
}

.page {
    width: 297mm; min-height: 210mm;
    margin: 16px auto; background: var(--warm-cream);
    position: relative; page-break-after: always;
    padding: 28px 52px;
    box-shadow: 0 2px 16px rgba(0,0,0,0.07);
}

/* ============ COVER ============ */
.page.cover {
    display: flex; flex-direction: row; align-items: center;
    justify-content: center; text-align: left; gap: 70px;
    background: linear-gradient(135deg, #FFF8F0 0%, #FFF1E6 50%, #FDE8D8 100%);
    padding: 45px 65px;
}
.cover-label { font-size: 11px; letter-spacing: 5px; text-transform: uppercase; color: var(--terracotta); margin-bottom: 28px; }
.cover-title { font-family: 'Playfair Display', 'Noto Serif SC', serif; font-size: 54px; font-weight: 900; color: var(--charcoal); line-height: 1.1; margin-bottom: 16px; }
.cover-subtitle { font-family: 'Crimson Pro', 'Noto Serif SC', serif; font-size: 18px; color: var(--navy); line-height: 1.5; }
.cover-line { width: 60px; height: 3px; background: var(--terracotta); margin: 26px 0; }
.cover-footer { font-size: 11px; color: var(--mid-gray); letter-spacing: 2px; }
.cover-stat-block { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.cover-stat { background: rgba(255,255,255,0.7); border-radius: 10px; padding: 20px 26px; text-align: center; }
.cover-stat .cs-num { font-family: 'Playfair Display', 'Noto Serif SC', serif; font-size: 36px; font-weight: 900; color: var(--terracotta); }
.cover-stat .cs-label { font-size: 10px; color: var(--mid-gray); letter-spacing: 1px; margin-top: 4px; }

/* ============ PAGE ELEMENTS ============ */
.page-number { position: absolute; top: 24px; right: 52px; font-family: 'Crimson Pro', serif; font-size: 11px; color: var(--mid-gray); }
.section-label { font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: var(--terracotta); margin-bottom: 4px; }
h1 { font-family: 'Playfair Display', 'Noto Serif SC', serif; font-size: 30px; font-weight: 900; color: var(--charcoal); margin-bottom: 14px; }
h2 { font-family: 'Playfair Display', 'Noto Serif SC', serif; font-size: 19px; font-weight: 700; color: var(--navy); margin: 14px 0 8px 0; }
h3 { font-size: 14px; font-weight: 700; }
p { margin-bottom: 7px; color: #3D3D3D; }

/* ============ COMPONENTS ============ */
.divider { border: none; height: 1px; background: linear-gradient(to right, var(--terracotta), transparent); margin: 16px 0; }
.callout { background: #FDF2EC; border-left: 3px solid var(--terracotta); padding: 10px 16px; margin: 10px 0; border-radius: 0 6px 6px 0; font-size: 12.5px; color: #5D4037; page-break-inside: avoid; }

/* TABLE */
.info-table { width: 100%; border-collapse: collapse; font-size: 12.5px; page-break-inside: avoid; }
.info-table thead th { background: var(--charcoal); color: white; font-size: 10.5px; letter-spacing: 1.5px; text-transform: uppercase; padding: 10px 14px; text-align: left; }
.info-table tbody td { padding: 9px 14px; border-bottom: 1px solid var(--border-light); vertical-align: middle; }
.info-table tbody tr:nth-child(even) { background: var(--bg-stripe); }
.td-center { text-align: center !important; }
.td-right { text-align: right !important; }
.td-impact { text-align: center; font-weight: 700; }
.impact-up { color: var(--sage); }
.impact-down { color: var(--terracotta); }
.impact-neutral { color: var(--navy); }

/* STAT ROW */
.stat-row { display: flex; gap: 12px; page-break-inside: avoid; }
.stat-card { flex: 1; background: white; border-radius: 8px; padding: 14px 12px; text-align: center; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
.stat-number { font-family: 'Playfair Display', 'Noto Serif SC', serif; font-size: 28px; font-weight: 900; color: var(--terracotta); }
.stat-label { font-size: 9.5px; color: var(--mid-gray); letter-spacing: 1px; }

/* KPI GRID */
.kpi-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; page-break-inside: avoid; }
.kpi-card { background: white; border-radius: 8px; padding: 12px 10px; text-align: center; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
.kpi-value { font-family: 'Playfair Display', 'Noto Serif SC', serif; font-size: 22px; font-weight: 900; color: var(--terracotta); }
.kpi-label { font-size: 9.5px; color: var(--mid-gray); }
.kpi-compare { font-size: 9px; margin-top: 2px; }
.kpi-up { color: var(--sage); }
.kpi-down { color: var(--terracotta); }

/* INSIGHT CARD GRID */
.insight-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; page-break-inside: avoid; }
.insight-card { background: white; border-radius: 10px; padding: 18px 20px 16px; position: relative; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04); page-break-inside: avoid; }
.insight-card.right { border-top: 3px solid var(--sage); }
.insight-card.wrong { border-top: 3px solid var(--terracotta); }
.insight-num { font-family: 'Playfair Display', 'Noto Serif SC', serif; font-size: 38px; font-weight: 900; opacity: 0.12; position: absolute; top: 8px; right: 14px; }
.insight-card.right .insight-num { color: var(--sage); }
.insight-card.wrong .insight-num { color: var(--terracotta); }
.insight-card h4 { font-family: 'Playfair Display', 'Noto Serif SC', serif; font-size: 17px; font-weight: 700; color: var(--charcoal); margin-bottom: 6px; padding-right: 40px; }
.insight-kpi { font-size: 12px; font-weight: 700; margin-bottom: 8px; }
.insight-card.right .insight-kpi { color: var(--sage); }
.insight-card.wrong .insight-kpi { color: var(--terracotta); }
.insight-card p { font-size: 12px; color: #4A4A4A; line-height: 1.5; margin-bottom: 10px; }
.insight-vs { font-size: 10.5px; color: var(--mid-gray); padding-top: 8px; border-top: 1px solid var(--border-light); }
.insight-vs span { font-weight: 600; color: var(--navy); }

/* 2-COL */
.col-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; page-break-inside: avoid; }

/* QUOTE */
.quote-card { background: white; border-left: 3px solid var(--sage); padding: 10px 14px; margin: 6px 0; border-radius: 0 6px 6px 0; font-family: 'Crimson Pro', 'Noto Serif SC', serif; font-size: 14px; font-style: italic; color: #3D3D3D; page-break-inside: avoid; }
.quote-source { display: block; margin-top: 4px; font-size: 10.5px; font-style: normal; color: var(--mid-gray); }

/* REVIEW BAR */
.review-stat-box { display: flex; align-items: center; gap: 24px; background: white; border-radius: 10px; padding: 16px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); margin-bottom: 12px; }
.review-big-score { font-family: 'Playfair Display', 'Noto Serif SC', serif; font-size: 48px; font-weight: 900; color: var(--terracotta); }
.review-big-label { font-size: 11px; color: var(--mid-gray); }
.review-bar-row { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; font-size: 11px; }
.stars-label { width: 50px; text-align: right; font-weight: 600; }
.bar-track { flex: 1; height: 14px; background: #EBE5DA; border-radius: 7px; overflow: hidden; }
.bar-fill { height: 100%; border-radius: 7px; }
.bar-1 { background: var(--terracotta); }
.bar-2 { background: #E8927A; }
.bar-3 { background: #C9A96E; }
.bar-4 { background: #A3C4B3; }
.bar-5 { background: var(--sage); }
.pct-label { width: 40px; text-align: right; font-weight: 500; }

/* CONCLUSION */
.conclusion-grid { display: grid; grid-template-columns: 1fr; gap: 12px; page-break-inside: avoid; }
.conclusion-card { background: white; border-radius: 8px; padding: 14px 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); page-break-inside: avoid; }
.conclusion-card .cc-num { font-family: 'Playfair Display', 'Noto Serif SC', serif; font-size: 24px; font-weight: 900; color: var(--terracotta); opacity: 0.7; }
.conclusion-card h3 { margin-top: 3px; font-size: 14px; color: var(--navy); }
.conclusion-card p { font-size: 12px; color: #3D3D3D; margin-top: 4px; line-height: 1.5; }

/* ============ PRINT ============ */
@media print {
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
    body { background: white; }
    .page { margin: 0; page-break-after: always; box-shadow: none; }
    h1, h2, h3 { page-break-after: avoid; }
    .callout, .info-table, .stat-row, .quote-card, .insight-card, .insight-grid,
    .conclusion-card, .col-2, .conclusion-grid, .review-stat-box, .kpi-grid, .kpi-card { page-break-inside: avoid; }
}
@page { size: A4 landscape; margin: 0; }
</style>
</head>
<body>
<!-- 按分页规划填充 8 页内容 -->
</body>
</html>
```

**关键规则：**
- `<style>` 标签绝对不能漏！CSS 必须在 `<style>...</style>` 内
- 字体 @import 必须包含 `Noto Sans SC` + `Noto Serif SC`
- 表格每列必须设置 `style="width:XXpx"`
- 所有表格、卡片网格、col-2 都要加 `page-break-inside: avoid`

### Phase 5: 输出

1. 文件保存到 `~/Downloads/[品牌名]-report.html`
2. 用浏览器打开文件
3. 告诉用户：`Ctrl + P` → 勾选 Background graphics → 保存为 PDF

## 内容质量标准

### 做对了什么（6 张卡片，每张必须包含）

- KPI 数据行（具体数字）
- 5-8 句正文：解释做了什么、为什么有效、数据支撑
- vs 竞对对比（至少 1 个竞对的具体做法和数据）
- 来源标注

### 做错了什么（6 张卡片，每张必须包含）

- KPI 数据行
- 5-8 句正文：具体事件、数据、后果
- vs 竞对对比或竞对类似教训
- 来源标注

### 客户评价（必须包含）

- Trustpilot 评分（如适用）+ 星级分布柱状图
- 投诉主题百分比表（≥5 个主题，每个有占比）
- 至少 3 条正面引用 + 来源
- 间接满意度指标表（增长数据、复购行为、画像数据）
- 选择偏差提示

### 结论（4 张卡片，每张必须包含）

- 至少 1 个竞对数据对比
- 风险判断
- 具体数据支撑

## 避免踩坑

1. **CSS 必须在 `<style>` 标签内** — 最常见错误
2. **中文字体必须导入** — `Noto Sans SC` + `Noto Serif SC`
3. **表格列宽必须设置** — 否则文字可能竖排
4. **分页先算高度** — 不要猜
5. **内容不能太简化** — 每张卡片至少 5 句正文 + 数据
6. **所有数字必须标注来源**
7. **竞对视角必须贯穿始终** — 这是报告的核心价值

## 与 nice-pdf skill 的关系

本 skill 是 `nice-pdf` 的上层封装：
- `nice-pdf` 负责"如何把内容做成漂亮的 PDF"（纯设计/排版能力）
- `brand-research` 负责"品牌调研 + 内容组织 + 调用 nice-pdf 的设计系统生成报告"

如果你已经安装了 `nice-pdf` skill，本 skill 会自动复用其中的设计组件和 CSS 规范。
