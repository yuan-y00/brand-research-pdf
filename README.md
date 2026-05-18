# Brand Research PDF

输入品牌名，自动生成深度调研报告。基于 [nice-pdf](https://github.com/yuan-y00/nice-pdf) 高级设计系统。

## 效果

对任意品牌/公司，自动完成 Web 调研并生成精美连续网页报告：

| 章节 | 内容 |
|------|------|
| 封面 | 品牌名 + 4 个核心 KPI 卡片 |
| 一 | 创始团队（含初始资金来源具体金额） + 品牌大事年表 |
| 二 | 财务表现与竞争格局 |
| 三 | 护城河与商业模式 |
| 四 | 做对了什么（6 张详细分析卡片，含竞对对比） |
| 五 | 做错了什么/风险（6 张卡片） |
| 六 | 用户画像（含百分比） + 客户评价（Trustpilot/投诉分布/Reddit/YouTube） |
| 七 | 核心数据汇总 + 4 条关键结论 |

## 已生成报告

| 品牌 | 品类 | 亮点 |
|------|------|------|
| [Hyrox](examples/hyrox-report.html) | 健身赛事 | $1.4亿营收 · 650K参赛者 · $0付费广告 |
| [Tonal](examples/tonal-report.html) | 智能家庭力量训练 | $1.6B峰值→$550M · >$100M ARR |
| [Peloton](examples/peloton-report.html) | 互联健身 | $50B→$1.2B · 2.88M订阅用户 |
| [Speediance](examples/speediance-report.html) | 中国智能健身出海 | $49M营收 · $13.6M融资 · 零订阅 |
| [AEKE](examples/aeke-report.html) | AI镜面力量训练 | $1.5M众筹 · HK$2万创始人自筹 |
| [Growl](examples/growl-report.html) | AI投影拳击沙袋 | $4.75M种子 · 2026发货 |
| [FightCamp](examples/fightcamp-report.html) | 居家拳击健身 | $94M融资 · $699起 · 5年量产 |
| [周群飞 & 蓝思科技](examples/lens-report.html) | 手机玻璃女王 | HK$2万→¥700亿 · 全球50%+份额 |

## 设计特点

- **连续流畅网页**：自然滚动，底部细线分隔，响应式适配
- **高级配色**：暖白底(#F9F7F2) + 陶土红强调(#C2513B) + 鼠尾草绿正面(#5B8C6F)
- **字体**：Playfair Display + DM Sans + Crimson Pro + Noto Sans/Serif SC
- **9 种组件**：封面、callout、表格、KPI、insight卡片、引用卡、星级柱状图、结论卡、stat-row

## 安装

```bash
claude skill install github:yuan-y00/brand-research-pdf
```

也可以同时安装底层设计 skill（可选，提供更多设计自定义能力）：

```bash
claude skill install github:linyao-create/nice-pdf-skill
```

## 使用

在 Claude Code 中说：

```
帮我调研 Lululemon
```

```
/brand-research Nike
```

```
生成特斯拉的调研报告 PDF
```

Claude 会自动：
1. 搜索品牌历史、收入、竞对、用户评价等信息
2. 按结构化框架组织内容
3. 生成横版 A4 HTML 文件
4. 在浏览器中打开，你 `Ctrl + P` 导出 PDF

## 设计特点

- **横版 A4**（297mm × 210mm），适合数据密集的调研报告
- **暖色系配色**：奶油底 + 陶土红强调 + 鼠尾草绿（正面）+ 海军蓝
- **字体**：Playfair Display + DM Sans + Crimson Pro + Noto Sans/Serif SC
- **组件**：KPI 卡片、对比表格、insight 卡片网格、星级分布柱状图、结论卡

## 依赖

- [Claude Code](https://claude.ai/code)（已包含 WebSearch 能力）
- 浏览器（Chrome 推荐，用于导出 PDF）

## License

MIT
