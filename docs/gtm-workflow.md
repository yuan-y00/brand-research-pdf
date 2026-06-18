# GTM Workflow

本文只说明 GTM / 产品学习扩展工作流，不负责生成完整基础报告。

## 1. 最简单使用方式

输入品牌名后，脚本会准备 GTM 研究 prompt。研究、事实核验和 JSON 内容补齐仍需要由当前使用的 AI 工具或人工完成。

### Step 1 — 生成研究 prompt

```
node scripts/gtm-workflow.js "Anker"
```

这会生成 `tmp/anker-gtm-research-prompt.txt`，并告诉你下一步做什么。

### Step 2 — 复制 prompt 给当前 AI 工具

打开 `tmp/anker-gtm-research-prompt.txt`，把全部内容复制给当前使用的 AI 工具。
AI 或人工研究公开资料后，输出一份 GTM 扩展 JSON。

### Step 3 — 保存 AI 输出的 JSON

把 AI 输出的 JSON 保存为：

```
data/gtm/anker.json
```

### Step 4 — 质量检查（新增）

在追加前先检查 JSON 质量：

```
node scripts/gtm-check.js data/gtm/anker.json
```

如果 warning 明显（sources 太少、产品分析太短），让 AI 补充 JSON 后再继续。
质量规则详见 [docs/gtm-quality-rules.md](docs/gtm-quality-rules.md)。

### Step 5 — 追加到旧报告

```
node scripts/gtm-workflow.js "Anker" --append
```

新报告会自动生成：

```
examples/anker-report-gtm.html
```

原始报告 `examples/anker-report.html` 不会被修改。

---

## 2. 如果报告文件名匹配失败

有时品牌 slug 和报告文件名不完全一致。
例如 "Bambu Lab" 的 slug 是 `bambu-lab`，但旧报告文件名是 `bambulab-report.html`（无连字符）。

### 先找报告候选

```
node scripts/gtm-workflow.js "Bambu Lab" --find-report
```

如果只有一个候选，`--append` 会自动使用它。
如果有多个候选，手动指定：

```
node scripts/gtm-workflow.js "Bambu Lab" --append --report examples/bambulab-report.html
```

---

## 3. 如果输出文件已存在

默认情况下，如果输出文件已存在，脚本会拒绝覆盖。

### 强制覆盖

```
node scripts/gtm-workflow.js "Anker" --append --force
```

### 自定义输出路径

```
node scripts/gtm-workflow.js "Anker" --append --out examples/anker-report-v2-gtm.html
```

---

## 4. 如果研究 prompt 已存在

默认不覆盖已存在的 prompt 文件。

### 强制重新生成

```
node scripts/gtm-workflow.js "Anker" --prepare --force-prompt
```

---

## 5. English-first research 提醒

对于美国市场、全球品牌、上市公司，请提醒 AI 优先使用英文资料搜索。详见 [docs/gtm-quality-rules.md](docs/gtm-quality-rules.md) 第 2 节。

---

## 6. 预览路径（不写任何文件）

```
node scripts/gtm-workflow.js "Anker" --dry-run
```

显示所有推导路径和报告候选。

---

## 7. 不做什么

- 不做爬虫
- 不做数据库
- 不做后台服务
- 不做事实审计
- 不覆盖旧报告
- 不自动生成真实研究内容（需要当前 AI 工具或人工研究完成）
- 不接第三方 API
- 不登录社交媒体

---

## 8. 自动加入首页

生成 GTM 报告后，需要把新的报告链接加入首页 `index.html`。

### 单独更新首页

```
node scripts/gtm-workflow.js "Anker" --update-index
```

这会调用 `scripts/gtm-index.js`，在 `index.html` 的 `<div class="reports">` 中插入一张 GTM 报告卡片。

如果 `index.html` 已经包含该链接（幂等运行），脚本会检测到已有链接并成功退出，不会重复插入。

### 一步完成：生成报告并加入首页

```
node scripts/gtm-workflow.js "Anker" --publish
```

等价于：

```
node scripts/gtm-workflow.js "Anker" --append
node scripts/gtm-workflow.js "Anker" --update-index
```

### 指定首页路径

```
node scripts/gtm-workflow.js "Anker" --update-index --index tmp/index-clean.html
```

用于测试或自定义首页位置。

### 工作原理

- `--publish` 先调用 `gtm-append.js` 生成 `examples/{brand}-report-gtm.html`
- 再调用 `gtm-index.js` 把报告卡片插入 `index.html`
- `gtm-index.js` 传入 `--allow-existing`，如果首页已有链接则 no-op 成功退出
- GTM 卡片带蓝色左边框 (`border-left-color: #4A6FA5`)，与原报告卡片区分

---

## 9. 发布到线上 GitHub Pages

GitHub Pages 是静态站点，本地生成 `examples/{brand}-report-gtm.html` 并更新 `index.html` 后，需要通过 git 推送才会出现在线上。

### 可选命令

```
node scripts/gtm-workflow.js "Anker" --publish --push --commit-message "Publish Anker GTM report"
```

这会执行：

1. `gtm-append.js` — 生成 GTM 报告
2. `gtm-index.js` — 更新 `index.html`
3. `git add` — 添加 JSON、报告、首页三个文件
4. `git commit` — 提交
5. `git push` — 推送到 GitHub

### 重要提醒

- **默认不会 push** — 只有显式传 `--push` 才会执行 git 操作
- `--publish` 只生成报告并更新 `index.html`，不包含 git push
- **`--publish` ≠ git push**
- 不要在 JSON 未通过 `gtm-check` 时 push
- 推送前建议打开本地 HTML 检查页面效果
- `--push` 只会 add 三个文件（JSON、报告、首页），不会 `git add .`

### 自定义 commit message

```
node scripts/gtm-workflow.js "Anker" --publish --push --commit-message "Add Anker GTM extension report"
```

默认 commit message 为 `Publish Anker GTM report`。

### 预览发布命令（不实际执行）

```
node scripts/gtm-workflow.js "Anker" --publish --push --dry-run
```

### Git 不可用或 nothing to commit

- 如果 git 未安装或不在 PATH 中，`--push` 会报错
- 如果 `git commit` 返回 "nothing to commit"，脚本会提示 `Nothing to commit. Skipping git push.` 并成功退出

---

## 10. 常见错误

| 错误 | 原因 | 解决 |
|------|------|------|
| JSON file not found | `data/gtm/{brand}.json` 不存在 | 先运行 prepare，再用 AI 生成 JSON |
| Source report not found | `examples/{brand}-report.html` 不存在 | 运行 `--find-report` 查找，或用 `--report` 手动指定 |
| Output already exists | 输出文件已存在 | 使用 `--force` 或 `--out` |
| AI JSON 不合法 | AI 输出包含 Markdown 或非 JSON 内容 | 检查 JSON 格式，移除 JSON 外的文字 |
| 品牌 slug 和报告文件名不一致 | slug 推导与文件名不匹配 | 使用 `--find-report` + `--report` |

---

## 11. 当前计划进度

| 轮次 | 内容 | 状态 |
|------|------|------|
| 第 1 轮 | 项目体检 + prompt/template/plan | 已完成 |
| 第 2 轮 | GTM JSON → HTML section 渲染器 | 已完成 |
| 第 3 轮 | 追加 GTM section 到旧报告 | 已完成 |
| 第 4 轮 | 品牌名工作流 | 已完成 |
| 第 5 轮 | 真实品牌样例（Anker） | 已完成 |
| 第 6 轮 | 质量检查 + README + 最终收尾 | 已完成 |

---

## 12. 所有脚本一览

| 脚本 | 用途 |
|------|------|
| `scripts/gtm-render.js` | JSON → HTML section 渲染 |
| `scripts/gtm-append.js` | HTML section 插入报告 |
| `scripts/gtm-workflow.js` | 品牌名工作流（prepare + append + update-index + publish） |
| `scripts/gtm-index.js` | 首页自动更新（insert / update GTM 报告卡片到 index.html） |
| `scripts/gtm-check.js` | 质量检查（结构 + 最低内容 + English sources） |

| 文件 | 用途 |
|------|------|
| `prompts/brand-gtm-extension.md` | GTM 研究 prompt 模板 |
| `prompts/one-brand-gtm-workflow.md` | 一段式工作流 prompt（可直接给 AI） |
| `data/gtm/_template.brand-gtm-extension.json` | JSON 模板 |
| `docs/gtm-quality-rules.md` | 质量规则文档 |
| `docs/gtm-extension-implementation-plan.md` | 实施计划文档 |
