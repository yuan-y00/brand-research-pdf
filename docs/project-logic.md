# Project Logic

本文说明项目当前真实结构、执行逻辑和迁移方向。它的目的不是包装能力，而是让后续报告可以维护、可以检查、可以重新生成。

## 1. 当前项目是什么

当前项目是一个静态品牌研究报告库，正在迁移为结构化数据驱动的报告系统。

它包含四类东西：

| 类别 | 位置 | 当前状态 |
|------|------|----------|
| 基础报告数据 | `data/reports/*.json` | 新增的结构化输入；历史报告尚未全部迁移 |
| 基础报告输出 | `examples/*-report.html` | 当前可读报告产物，包含历史手写 HTML |
| GTM 扩展数据 | `data/gtm/*.json` | 结构化 JSON，可被脚本渲染 |
| 自动化脚本 | `scripts/` | 覆盖基础报告检查/渲染、GTM 检查/渲染、审计和文件台账 |

项目不会自动联网调研，也不会自动事实核验。事实采集仍由人或当前使用的 AI 工具完成。

## 2. 当前真实流水线

### 基础报告线

```text
node scripts/report-workflow.js "<Brand>"
  -> tmp/<slug>-report-research-prompt.txt
  -> AI / 人工研究并输出 data/reports/<slug>.json
  -> node scripts/report-check.js data/reports/<slug>.json
  -> node scripts/report-render.js data/reports/<slug>.json --out examples/<slug>-report.html
```

这条线已经具备：

- `data/reports/_schema.json`
- `data/reports/_template.brand-report.json`
- `prompts/brand-report.md`
- `templates/report.html`
- `theme/brand-research-theme.css`
- `scripts/report-check.js`
- `scripts/report-render.js`
- `scripts/report-workflow.js`

### GTM 扩展线

```text
node scripts/gtm-workflow.js "<Brand>"
  -> tmp/<slug>-gtm-research-prompt.txt
  -> AI / 人工研究并输出 data/gtm/<slug>.json
  -> node scripts/gtm-check.js data/gtm/<slug>.json
  -> node scripts/gtm-workflow.js "<Brand>" --append
  -> examples/<slug>-report-gtm.html
```

### 合并线

```text
node scripts/report-workflow.js "<Brand>" --publish --with-gtm --force
```

这会检查并渲染基础报告；如果 `data/gtm/<slug>.json` 存在，再生成 GTM 追加版。

### 审计线

```text
node scripts/report-audit.js
  -> docs/report-gap-audit.md
```

审计脚本扫描：

- `examples/*-report.html`
- `data/gtm/*.json`

它检查明显缺口，但不能替代事实核验。

### 生成文件台账线

```text
node scripts/generated-inventory.js
  -> docs/generated-files.md
```

台账用于区分：

- 基础报告 JSON
- 基础报告 HTML
- GTM JSON
- GTM 追加版 HTML
- `tmp/` 临时产物
- 错放在根目录的报告文件

## 3. 文件职责

| 文件 / 目录 | 职责 |
|-------------|------|
| `README.md` | 当前项目入口，只描述现有能力和真实限制 |
| `SKILL.md` | 旧 Claude Code skill 兼容提示，不再作为执行规范 |
| `data/reports/` | 新基础报告结构化 JSON、schema 和模板 |
| `data/gtm/` | GTM 扩展结构化数据 |
| `templates/report.html` | 基础报告统一 HTML 壳 |
| `theme/` | 基础报告统一视觉主题 |
| `examples/` | 当前报告产物，也是历史样例集合 |
| `prompts/brand-report.md` | 基础报告研究 prompt 模板 |
| `prompts/brand-gtm-extension.md` | GTM JSON 研究任务模板 |
| `docs/report-data-requirements.md` | 报告必须补齐的数据要求 |
| `docs/gtm-quality-rules.md` | GTM JSON 质量规则 |
| `docs/report-gap-audit.md` | 自动生成的缺口审计报告 |
| `docs/generated-files.md` | 自动生成的文件台账 |
| `scripts/report-workflow.js` | 基础报告工作流入口 |
| `scripts/report-check.js` | 基础报告 JSON 检查器 |
| `scripts/report-render.js` | 基础报告 HTML 渲染器 |
| `scripts/report-audit.js` | 扫描所有报告缺口 |
| `scripts/generated-inventory.js` | 盘点所有已生成文件 |
| `scripts/gtm-workflow.js` | GTM 工作流入口 |
| `scripts/gtm-check.js` | GTM JSON 检查器 |
| `scripts/gtm-render.js` | GTM HTML 渲染器 |
| `scripts/gtm-append.js` | 把 GTM section 插入基础报告 |

## 4. 必须避免的旧逻辑

以下说法不能作为现行能力：

- 输入品牌名即可自动完成完整 Web 调研
- 自动判断事实真伪
- 自动打开浏览器并导出 PDF
- Claude Code 是当前唯一或默认执行环境
- `SKILL.md` 是当前主工作流
- 只要有漂亮 HTML，就算报告完整

真正应该坚持的是：

- 有金额就要有上下文
- 有价格就要有产品、配件、订阅、竞品对比
- 有创始人就要有履历链接
- 有融资和收入就要讲清时间线
- 找不到的事实不要硬写
- 有报告就要能被审计脚本发现缺口

## 5. 报告内容主线

每份报告至少应该围绕以下问题组织：

1. 这个产品卖什么，多少钱，靠什么收费
2. 它的竞品是谁，竞品多少钱，差异在哪里
3. 创始人是谁，为什么是他们能做这家公司
4. 第一笔钱从哪里来，之后赚了多少钱、花了多少钱、融了多少钱
5. 哪些增长动作真正有效，哪些造成损失或风险
6. 用户为什么买，为什么抱怨，为什么流失
7. 所有关键事实是否能追到公开来源

如果这些问题没有回答完整，报告就只是“品牌介绍”，不是可用于商业学习的研究报告。

## 6. 迁移方向

新报告必须走：

```text
data/reports/<slug>.json
  -> scripts/report-check.js
  -> templates/report.html
  -> examples/<slug>-report.html
```

已有历史报告不立即删除，但后续深修时应逐步迁移回 `data/reports/<slug>.json`。迁移完成后，`examples/*-report.html` 应只作为渲染产物，而不是事实源。
