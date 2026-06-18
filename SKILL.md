---
name: brand-research
description: Legacy Claude Code skill notice. This repository is now maintained as a Codex/Node static report and GTM workflow.
---

# Legacy Notice

这个文件只保留为历史兼容入口，不再作为当前项目的执行规范。

过去这个仓库被描述成 Claude Code skill，并承诺“输入品牌名后自动完成 Web 调研、生成完整 HTML/PDF 报告”。当前仓库没有完整实现这条自动化链路，因此这些旧说明已经被移除，避免继续误导维护和使用。

当前真实工作流请看：

- `README.md`
- `docs/project-logic.md`
- `docs/report-data-requirements.md`
- `docs/gtm-quality-rules.md`

当前可执行能力主要是：

- 维护 `examples/` 中的静态 HTML 报告
- 使用 `data/gtm/*.json` 描述 GTM / 产品学习扩展
- 使用 `scripts/gtm-*` 渲染、检查、追加 GTM section
- 使用 `scripts/report-audit.js` 审核现有报告缺口

不要再把本文件当作“一键生成完整品牌报告”的说明使用。
