# Brand Research Reports

这是一个品牌研究报告项目。当前目标是把历史手写 HTML 报告逐步迁移成结构化数据驱动的报告系统。

项目现在有两条可执行流水线：

- 基础报告：`data/reports/<slug>.json` -> `scripts/report-check.js` -> `templates/report.html` -> `examples/<slug>-report.html`
- GTM 扩展：`data/gtm/<slug>.json` -> `scripts/gtm-check.js` -> `scripts/gtm-append.js` -> `examples/<slug>-report-gtm.html`

> 重要说明：脚本不会自动联网调研，也不会自动判断事实真伪。研究事实必须由人或当前使用的 AI 工具补齐，并保留来源链接。

## 当前能做什么

### 1. 查看已有报告

已有报告位于 `examples/`。历史报告仍然保留为可读 HTML；新报告应优先从 `data/reports/*.json` 生成。

GTM 追加版通常命名为：

```bash
examples/<slug>-report-gtm.html
```

### 2. 生成基础报告研究 prompt

```bash
node scripts/report-workflow.js "Anker"
```

输出：

```bash
tmp/anker-report-research-prompt.txt
```

把 prompt 交给当前使用的 AI 工具或人工研究流程，产出：

```bash
data/reports/anker.json
```

### 3. 检查并渲染基础报告

```bash
node scripts/report-workflow.js "Anker" --check
node scripts/report-workflow.js "Anker" --render --force
```

一步执行：

```bash
node scripts/report-workflow.js "Anker" --publish --force
```

### 4. 生成 GTM 研究 prompt

```bash
node scripts/gtm-workflow.js "Anker"
```

输出：

```bash
tmp/anker-gtm-research-prompt.txt
```

把该 prompt 交给当前使用的 AI 工具，产出：

```bash
data/gtm/anker.json
```

### 5. 检查并追加 GTM

```bash
node scripts/gtm-check.js data/gtm/anker.json
node scripts/gtm-workflow.js "Anker" --append --force
```

基础报告和 GTM 可以合并执行：

```bash
node scripts/report-workflow.js "Anker" --publish --with-gtm --force
```

### 6. 审核所有报告缺口

```bash
node scripts/report-audit.js
```

输出：

```bash
docs/report-gap-audit.md
```

这份审计是启发式检查，用来定位明显缺口；它不能替代事实核验。

### 7. 盘点所有生成文件

```bash
node scripts/generated-inventory.js
```

输出：

```bash
docs/generated-files.md
```

## 项目结构

| 路径 | 用途 |
|------|------|
| `data/reports/` | 新基础报告结构化 JSON、schema 和模板 |
| `data/gtm/` | GTM / 产品学习结构化 JSON |
| `templates/report.html` | 基础报告 HTML 壳模板 |
| `theme/` | 新基础报告统一视觉主题 |
| `examples/` | 静态 HTML 报告输出和历史报告集合 |
| `prompts/brand-report.md` | 基础报告研究 prompt 模板 |
| `prompts/brand-gtm-extension.md` | GTM 研究 prompt 模板 |
| `scripts/report-workflow.js` | 基础报告 prompt / check / render 总入口 |
| `scripts/report-check.js` | 检查基础报告 JSON 内容质量 |
| `scripts/report-render.js` | 基础报告 JSON 渲染为 HTML |
| `scripts/report-audit.js` | 扫描基础报告与 GTM JSON 的缺漏 |
| `scripts/gtm-workflow.js` | GTM prompt 生成与追加总入口 |
| `scripts/gtm-check.js` | 检查 GTM JSON 内容质量 |
| `scripts/gtm-render.js` | GTM JSON 渲染为 HTML |
| `scripts/gtm-append.js` | 把 GTM HTML 插入既有报告 |
| `scripts/generated-inventory.js` | 盘点正式报告、结构化数据和临时生成文件 |
| `docs/report-data-requirements.md` | 报告必须包含的数据要求 |
| `docs/report-gap-audit.md` | 自动生成的报告缺口审计 |
| `docs/generated-files.md` | 自动生成的文件台账 |
| `SKILL.md` | 旧 Claude Code skill 遗留说明，不再作为当前执行规范 |

## 数据要求

新增或修复报告时，至少要补齐这些内容：

- 产品价格：主机、核心 SKU、常见套装
- 配件价格：配件、耗材、保修、服务、安装、配送等
- 软件费用：订阅、会员、SaaS、RaaS、App Pro、云服务；如果没有，要写有来源的边界说明
- 竞品价格：同类产品和替代方案的价格区间
- 创始人履历：创始人姓名、过往经历、可信网页链接
- 资金路径：自筹、第一笔钱、收入、开支、融资轮次、亏损、裁员、并购等关键金额
- 来源链接：价格、融资、收入、用户评价、创始人履历都要有可追溯来源

详细规则见：

```bash
docs/report-data-requirements.md
docs/gtm-quality-rules.md
```

## 迁移状态

- 新报告已经有统一 schema、检查器、渲染器和模板。
- 历史 `examples/*-report.html` 还没有全部迁移为 `data/reports/*.json`。
- `examples/` 在迁移期同时保存历史产物和新渲染产物。
- `scripts/report-check.js` 与 `scripts/gtm-check.js` 只检查结构和证据信号，不做事实核验。
- `scripts/report-audit.js` 是总缺口队列，修复后需要重新生成。

## License

MIT
