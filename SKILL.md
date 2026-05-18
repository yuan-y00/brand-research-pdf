---
name: brand-research
description: 输入任意品牌/公司名称，自动完成深度调研并生成精美的连续网页报告。覆盖创始团队与资金来源、品牌大事年表、收入增长、竞对对比、成功因素、失败教训、用户画像（含百分比）、客户评价（含百分比）、Reddit/YouTube 口碑、核心数据与结论。基于 Hyrox/Tonal/Peloton/Speediance/AEKE/Growl/FightCamp/蓝思科技 8 份报告的经验总结。
---

# Brand Research — 品牌深度调研报告自动生成

输入品牌名，自动 Web 调研 → 内容组织 → 生成精美连续网页。用户可直接在浏览器中查看，或导出 PDF。

## 触发方式

- "帮我调研 [品牌名]"
- "生成 [品牌名] 的调研报告"

## 工作流程

### Phase 1: Web 调研

按以下维度并行搜索，每项 ≥2 个独立来源：

1. **创始人与资金来源** — "品牌名 founder background story initial funding source"
2. **品牌大事年表** — "品牌名 history founding timeline milestones 2017-2026"
3. **收入/规模/估值** — "品牌名 revenue growth financial performance valuation 2022-2026"
4. **竞对对比** — "品牌名 vs competitor comparison market share 2024 2025"
5. **成功因素** — "品牌名 success factors business model right decisions strategy"
6. **问题/争议/失败** — "品牌名 controversy mistakes criticism problems risks 2024 2025"
7. **客户评价** — "品牌名 customer reviews Trustpilot Reddit complaints ratings"
8. **竞对同期动态** — "competitor1 competitor2 revenue decline what happened 2022-2025"

### Phase 2: 内容组织

| 章节 | 内容要求 |
|------|---------|
| 封面 | 品牌名 + 4 个核心 KPI 卡片（如：营收/估值/融资/用户数） |
| 一 | 创始团队与品牌大事年表。**必须含创始人背景表格**（姓名/职位/履历/初始资金来源具体金额） |
| 二 | 财务表现与竞争格局。营收趋势表 + vs 竞对对比表 + KPI stat-row |
| 三 | 护城河与商业模式分析（4 张 insight 卡片） |
| 四 | 做对了什么（6 张卡片，含 KPI 行 + 正文 + vs 竞对 + 来源，分两页各 4+2） |
| 五 | 做错了什么/面临什么风险（6 张卡片，同上分页规则） |
| 六 | 用户画像（含百分比） + 客户真实评价（Trustpilot 星级图 + 投诉主题占比表 + Reddit/YouTube 口碑） |
| 七 | 核心数据汇总 + 4 条关键结论 |

### Phase 3: 生成 HTML

使用以下完整 CSS 骨架，**直接复制，不要修改核心变量**：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>[品牌名] 深度调研报告</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Noto+Sans+SC:wght@300;400;500;600;700&family=Noto+Serif+SC:wght@600;700;900&display=swap');

/* ============ DESIGN TOKENS ============ */
:root {
    --bg-page: #F9F7F2;        /* 暖白底色 */
    --bg-card: #FFFFFF;        /* 卡片白 */
    --bg-stripe: #F5F2EC;      /* 表格斑马纹 */
    --ink: #1C1C1C;            /* 正文黑 */
    --ink-light: #555555;      /* 次级文字 */
    --ink-muted: #999999;      /* 三级文字 */
    --accent: #C2513B;         /* 陶土红 — 强调色 */
    --positive: #5B8C6F;       /* 鼠尾草绿 — 正面/增长 */
    --negative: #C2513B;       /* 陶土红 — 负面/下降 */
    --neutral: #4A6FA5;        /* 蓝灰 — 中性 */
    --border: #E8E4DA;         /* 卡片边框 */
    --border-light: #F0EDE5;   /* 浅分割线 */
    --shadow: 0 1px 3px rgba(0,0,0,0.04);
    --shadow-hover: 0 4px 16px rgba(0,0,0,0.06);
    --radius: 12px;
    --radius-sm: 8px;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
    font-family: 'DM Sans', 'Noto Sans SC', sans-serif;
    font-size: 15px; line-height: 1.7; color: var(--ink);
    background: #E8E5DE; -webkit-font-smoothing: antialiased;
}

/* ============ SECTION ============ */
.section {
    width: 100%; max-width: 1040px; margin: 0 auto;
    background: var(--bg-page); padding: 56px 72px;
    border-bottom: 1px solid var(--border-light);
}
.section:last-child { border-bottom: none; }
.section.cover {
    display: flex; flex-direction: row; align-items: center;
    justify-content: center; gap: 80px; min-height: 55vh;
    background: linear-gradient(160deg, #F9F7F2 0%, #F4EFE6 50%, #EDE4D4 100%);
    padding: 64px 80px;
}

/* ============ COVER ============ */
.cover-label {
    font-size: 11px; letter-spacing: 4px; text-transform: uppercase;
    color: var(--accent); margin-bottom: 28px; font-weight: 600;
}
.cover-title {
    font-family: 'Playfair Display', 'Noto Serif SC', serif;
    font-size: 56px; font-weight: 900; color: var(--ink);
    line-height: 1.1; margin-bottom: 16px; letter-spacing: -0.5px;
}
.cover-subtitle {
    font-family: 'Crimson Pro', 'Noto Serif SC', serif;
    font-size: 19px; color: var(--neutral); line-height: 1.6;
}
.cover-line { width: 60px; height: 2px; background: var(--accent); margin: 28px 0; }
.cover-footer { font-size: 11px; color: var(--ink-muted); letter-spacing: 2px; }
.cover-stat-block { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.cover-stat {
    background: rgba(255,255,255,0.6); border-radius: var(--radius);
    padding: 22px 28px; text-align: center; backdrop-filter: blur(8px);
    border: 1px solid rgba(0,0,0,0.04);
}
.cover-stat .cs-num {
    font-family: 'Playfair Display', 'Noto Serif SC', serif;
    font-size: 36px; font-weight: 900; color: var(--accent); line-height: 1.1;
}
.cover-stat .cs-label {
    font-size: 10px; color: var(--ink-muted); letter-spacing: 1px; margin-top: 4px;
}

/* ============ TYPOGRAPHY ============ */
.section-label {
    font-size: 10px; letter-spacing: 4px; text-transform: uppercase;
    color: var(--accent); margin-bottom: 8px; font-weight: 600;
}
h1 {
    font-family: 'Playfair Display', 'Noto Serif SC', serif;
    font-size: 32px; font-weight: 900; color: var(--ink);
    margin-bottom: 20px; letter-spacing: -0.3px;
}
h2 {
    font-family: 'Playfair Display', 'Noto Serif SC', serif;
    font-size: 21px; font-weight: 700; color: var(--neutral);
    margin: 28px 0 14px 0;
}
h3 { font-size: 15px; font-weight: 600; color: var(--ink); margin-bottom: 6px; }
p { margin-bottom: 10px; color: var(--ink-light); }

/* ============ CALLOUT ============ */
.callout {
    background: #FDF6F2; border-left: 3px solid var(--accent);
    padding: 14px 20px; margin: 20px 0; border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
    font-size: 14px; color: #5D3A2E;
}
.callout strong { color: var(--accent); }

/* ============ DIVIDER ============ */
.divider {
    border: none; height: 1px;
    background: linear-gradient(to right, var(--accent) 0%, var(--accent) 60px, var(--border) 60px, transparent 100%);
    margin: 32px 0;
}

/* ============ TABLE ============ */
.info-table {
    width: 100%; border-collapse: collapse; font-size: 13.5px; margin: 16px 0;
}
.info-table thead th {
    background: var(--ink); color: white;
    font-size: 10.5px; font-weight: 500; letter-spacing: 1.5px;
    text-transform: uppercase; padding: 12px 16px; text-align: left;
}
.info-table tbody td {
    padding: 11px 16px; border-bottom: 1px solid var(--border);
    vertical-align: middle; line-height: 1.5;
}
.info-table tbody tr:nth-child(even) { background: var(--bg-stripe); }
.td-center { text-align: center !important; }
.td-num { text-align: left; font-variant-numeric: tabular-nums; }
.td-impact { text-align: center; font-weight: 600; }
.impact-up { color: var(--positive); }
.impact-down { color: var(--negative); }
.impact-neutral { color: var(--neutral); }

/* ============ STAT ROW ============ */
.stat-row {
    display: flex; gap: 14px; margin: 20px 0; flex-wrap: wrap;
}
.stat-card {
    flex: 1; min-width: 130px; background: var(--bg-card);
    border-radius: var(--radius-sm); padding: 18px 16px;
    text-align: center; box-shadow: var(--shadow); border: 1px solid var(--border-light);
}
.stat-number {
    font-family: 'Playfair Display', 'Noto Serif SC', serif;
    font-size: 28px; font-weight: 900; color: var(--accent); line-height: 1.1;
}
.stat-label { font-size: 10px; color: var(--ink-muted); letter-spacing: 1px; margin-top: 4px; }

/* ============ KPI GRID ============ */
.kpi-grid {
    display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin: 20px 0;
}
.kpi-card {
    background: var(--bg-card); border-radius: var(--radius-sm);
    padding: 14px 12px; text-align: center; box-shadow: var(--shadow);
    border: 1px solid var(--border-light);
}
.kpi-value {
    font-family: 'Playfair Display', 'Noto Serif SC', serif;
    font-size: 22px; font-weight: 900; color: var(--accent);
}
.kpi-label { font-size: 10px; color: var(--ink-muted); }
.kpi-compare { font-size: 9.5px; margin-top: 3px; }
.kpi-up { color: var(--positive); }
.kpi-down { color: var(--negative); }

/* ============ INSIGHT CARD GRID (最常用组件) ============ */
.insight-grid {
    display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; margin: 20px 0;
}
.insight-card {
    background: var(--bg-card); border-radius: var(--radius);
    padding: 24px 28px; position: relative; overflow: hidden;
    box-shadow: var(--shadow); border: 1px solid var(--border-light);
}
.insight-card.right { border-top: 3px solid var(--positive); }
.insight-card.wrong { border-top: 3px solid var(--negative); }
.insight-num {
    font-family: 'Playfair Display', 'Noto Serif SC', serif;
    font-size: 44px; font-weight: 900; opacity: 0.08;
    position: absolute; top: 10px; right: 18px;
}
.insight-card.right .insight-num { color: var(--positive); }
.insight-card.wrong .insight-num { color: var(--negative); }
.insight-card h4 {
    font-family: 'Playfair Display', 'Noto Serif SC', serif;
    font-size: 19px; font-weight: 700; color: var(--ink);
    margin-bottom: 8px; padding-right: 44px; line-height: 1.3;
}
.insight-kpi {
    font-size: 13px; font-weight: 600; margin-bottom: 10px; line-height: 1.4;
}
.insight-card.right .insight-kpi { color: var(--positive); }
.insight-card.wrong .insight-kpi { color: var(--negative); }
.insight-card p {
    font-size: 13.5px; color: var(--ink-light); line-height: 1.65; margin-bottom: 12px;
}
.insight-vs {
    font-size: 11.5px; color: var(--ink-muted); padding-top: 10px;
    border-top: 1px solid var(--border-light); line-height: 1.5;
}
.insight-vs span { font-weight: 600; color: var(--neutral); }

/* ============ 2-COLUMN LAYOUT ============ */
.col-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin: 20px 0; }

/* ============ QUOTE CARD ============ */
.quote-card {
    background: var(--bg-card); border-left: 3px solid var(--positive);
    padding: 14px 18px; margin: 10px 0; border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
    font-family: 'Crimson Pro', 'Noto Serif SC', serif;
    font-size: 15px; font-style: italic; color: var(--ink-light);
    box-shadow: var(--shadow);
}
.quote-card.critical { border-left-color: var(--negative); }
.quote-source {
    display: block; margin-top: 6px; font-size: 11px;
    font-style: normal; color: var(--ink-muted);
}

/* ============ REVIEW BAR CHART ============ */
.review-stat-box {
    display: flex; align-items: center; gap: 28px;
    background: var(--bg-card); border-radius: var(--radius);
    padding: 20px 24px; box-shadow: var(--shadow); margin-bottom: 16px;
    border: 1px solid var(--border-light);
}
.review-big-score {
    font-family: 'Playfair Display', 'Noto Serif SC', serif;
    font-size: 48px; font-weight: 900; color: var(--neutral);
}
.review-big-label { font-size: 11px; color: var(--ink-muted); }
.review-bar-row { display: flex; align-items: center; gap: 8px; margin-bottom: 5px; font-size: 11px; }
.stars-label { width: 50px; text-align: right; font-weight: 600; color: var(--ink); }
.bar-track { flex: 1; height: 14px; background: #EDE8DE; border-radius: 7px; overflow: hidden; }
.bar-fill { height: 100%; border-radius: 7px; }
.bar-5 { background: var(--positive); } .bar-4 { background: #84A88D; }
.bar-3 { background: #C4B08A; } .bar-2 { background: #D4957A; }
.bar-1 { background: var(--negative); }
.pct-label { width: 36px; text-align: right; font-weight: 600; color: var(--ink); }

/* ============ CONCLUSION GRID ============ */
.conclusion-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0;
}
.conclusion-card {
    background: var(--bg-card); border-radius: var(--radius);
    padding: 20px 24px; box-shadow: var(--shadow); border: 1px solid var(--border-light);
}
.conclusion-card .cc-num {
    font-family: 'Playfair Display', 'Noto Serif SC', serif;
    font-size: 28px; font-weight: 900; color: var(--accent); opacity: 0.7;
}
.conclusion-card h3 { margin-top: 4px; font-size: 16px; color: var(--neutral); }
.conclusion-card p { font-size: 13px; color: var(--ink-light); margin-top: 6px; line-height: 1.6; }

/* ============ RESPONSIVE ============ */
@media (max-width: 900px) {
    .section { padding: 32px 24px; }
    .section.cover { flex-direction: column; text-align: center; }
    .insight-grid, .col-2, .conclusion-grid, .kpi-grid { grid-template-columns: 1fr; }
    .cover-stat-block { grid-template-columns: 1fr 1fr; }
}

/* ============ PRINT ============ */
@media print {
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { background: white; }
    .section { border-bottom: none; page-break-after: always; }
    .section:last-child { page-break-after: auto; }
    h1, h2, h3 { page-break-after: avoid; }
}
</style>
</head>
<body>
<!-- 按内容规划填充 .section -->
</body>
</html>
```

## 设计系统速查

| Token | 值 | 用途 |
|-------|-----|------|
| `--bg-page` | `#F9F7F2` | 页面底色（暖白） |
| `--bg-card` | `#FFFFFF` | 卡片背景 |
| `--accent` | `#C2513B` | 陶土红 — 封面标签、KPI 数字、强调 |
| `--positive` | `#5B8C6F` | 鼠尾草绿 — 正面信息、增长、做对了 |
| `--negative` | `#C2513B` | 陶土红 — 负面信息、风险、做错了 |
| `--neutral` | `#4A6FA5` | 蓝灰 — h2 标题、中性评价 |
| `--ink` | `#1C1C1C` | 正文黑色 |
| Font 标题 | `Playfair Display + Noto Serif SC` | h1/h2/h4 |
| Font 正文 | `DM Sans + Noto Sans SC` | 正文/表格 |
| Font 装饰 | `Crimson Pro` | 引用/封面副标题 |

## 必须遵守的规则（按出错频率排序）

### 🔴 绝对不允许

1. **使用 `td-right` 类名** — 已废弃。所有数据单元格用 `td-num`（左对齐+等宽数字）
2. **CSS 不放在 `<style>` 标签内** — 导致整个样式失效
3. **忘记导入中文字体** — `Noto Sans SC` + `Noto Serif SC` 必须在 @import 中
4. **使用 Inter / Roboto / Arial / Space Grotesk** — 用 Playfair+DM Sans+Crimson Pro

### 🟠 必须包含

5. **创始团队背景表格** — 第二章必须有：创始人姓名、职位、具体履历、初始资金来源（具体金额）
6. **用户画像含百分比** — 第六章必须有年龄/性别/收入/动机的量化画像
7. **客户评价含百分比** — Trustpilot 星级分布图 + 投诉主题占比表
8. **Reddit/YouTube 口碑分析** — 讨论热度、社群形成情况、对购买决策的影响
9. **竞对视角贯穿始终** — 每张 insight 卡片必须有 vs 竞对对比
10. **所有数字标注来源**

### 🟢 排版规范

11. **连续网页，不分页** — 用 `.section` 替代 `.page`，底部用细线分隔
12. **表格列宽必须设置** — 给 `<th>` 加 `style="width:XXpx"` 防止文字竖排
13. **insight 卡片 4+2 拆分** — 6 张卡片分两页（第一页 4 张，第二页 2 张），避免内容溢出
14. **字体大小从 13.5px 起步** — 比之前的 12px 更易读

### Phase 4: 输出

1. 文件保存到 `~/Downloads/[品牌名]-report.html`
2. 复制到项目 `examples/` 目录
3. 更新 `index.html` 添加新卡片
4. 自动 git commit + push
