# Brand Research PDF

输入品牌名，自动生成深度调研报告 PDF。基于 [nice-pdf](https://github.com/linyao-create/nice-pdf-skill) 设计系统。

## 效果

对任意品牌/公司，自动完成 Web 调研并生成 8 页横版 A4 报告：

| 页码 | 内容 |
|------|------|
| 封面 | 品牌名 + 4 个核心 KPI 卡片 |
| 01 | 品牌大事年表（10 行时间线表格） |
| 02 | 收入与规模增长（KPI 面板 + 营收结构 + 利润率） |
| 03 | 竞争对手同期对比（5 列横排对比表 + 数据网格） |
| 04 | 做对了什么（6 张详细分析卡片，含竞对对比） |
| 05 | 做错了什么（6 张详细分析卡片，含竞对教训） |
| 06 | 客户真实评价（Trustpilot 评分 + 百分比柱状图 + 投诉主题分布） |
| 07 | 核心数据汇总 + 4 条关键结论 |

示例报告效果见 [Hyrox 深度调研报告](examples/hyrox-report.pdf)

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
