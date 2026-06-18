# BR-Theme — 品牌调研报告视觉主题

从 [brand-research-pdf](https://github.com/yuan-y00/brand-research-pdf) 项目中抽取的可复用视觉风格包。

## 设计来源

主题样式提取自以下项目组件：

| 来源 | 提取的元素 |
|------|-----------|
| `index.html` | Hero、Card Grid、卡片左侧 accent 色条、Tag 药品标签 |
| `examples/*-report.html` | Section 白色内容卡片、h1/h2/h3 排版、基础配色 |
| `examples/figure-ai-report.html` | CSS 变量体系、Cover 封面、Stat Card 统计卡、Insight Card 分析卡、Divider 渐变分割线、Info Table 深色表头表格、Callout 强调框、Grid 响应式双栏 |
| `scripts/gtm-render.js` (GTM 扩展样式) | Product Card 产品分析卡、Path 水平步骤条、Key Events 事件线、Source List 来源列表、Confidence Badge 可信度标签、Learning Card 经验总结卡、Lessons Box 经验框 |

## 文件说明

```
theme/
├── brand-research-theme.css   # 主题 CSS（唯一必需文件）
├── brand-research-demo.html   # 组件演示页面（17 个组件全部展示）
└── README.md                  # 使用说明
```

## 快速开始

### 1. 复制文件

将 `brand-research-theme.css` 复制到你的项目中：

```
your-project/
└── theme/
    └── brand-research-theme.css
```

### 2. 在 HTML 中引入

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- 推荐字体（可选，不导入则使用系统字体） -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Playfair+Display:wght@700;900&family=Noto+Sans+SC:wght@300;400;500;700&family=Noto+Serif+SC:wght@600;700;900&display=swap" rel="stylesheet">

  <!-- 主题 CSS -->
  <link rel="stylesheet" href="./theme/brand-research-theme.css">
</head>
<body class="br-theme">
  <!-- 你的内容 -->
</body>
</html>
```

### 3. 核心规则

- **`<body class="br-theme">`** — 所有主题样式只在这个 class 下生效
- **所有 CSS class 以 `br-` 开头** — 不会污染你的项目样式
- **CSS 变量可覆盖** — 你可以在 `.br-theme` 上覆盖配色

## 组件清单

| # | 组件 | class | 说明 |
|---|------|-------|------|
| 1 | Page Shell | `.br-page` | 居中最大宽度容器（860px） |
| 2 | Hero | `.br-hero` | 页面顶部居中的 heading + subtitle |
| 3 | Cover | `.br-cover` | 全宽渐变封面 + 统计卡片 |
| 4 | Section | `.br-section` | 白色圆角内容卡片 |
| 5 | Card | `.br-card` | 首页风格卡片（左侧 accent 色条 + hover 浮起） |
| 6 | Card Grid | `.br-card-grid` | 2 列卡片网格 |
| 7 | Tag | `.br-tag` | 药丸标签 |
| 8 | Table | `.br-table` | 深色表头 + 斑马纹内容表 |
| 9 | Callout | `.br-callout` | 强调信息框（默认/accent、info、positive 三种变体） |
| 10 | Stat Card | `.br-stat-card` | 统计数字卡片 |
| 11 | Insight Card | `.br-insight-card` | 正确/错误分析卡片（带水印数字） |
| 12 | Divider | `.br-divider` | accent 色渐变分割线 |
| 13 | Source List | `.br-source-list` | 编号来源引用列表 |
| 14 | Path | `.br-path` | 水平步骤条（带箭头） |
| 15 | Key Events | `.br-key-events` | dotted 分隔事件时间线 |
| 16 | Product Card | `.br-product-card` | 产品分析卡片（带 rank 编号） |
| 17 | Confidence Badge | `.br-confidence` | 可信度等级标签（high/medium/low） |
| 18 | Learning Card | `.br-learn-card` | 经验总结卡片（can/cannot/best/open 四种颜色） |
| 19 | Lessons Box | `.br-lessons` | 浅色背景经验框 |
| 20 | Grid 2 | `.br-grid-2` | 响应式双栏布局 |
| 21 | Footer | `.br-footer` | 居中页脚 + muted 链接 |

完整 HTML 示例见 `brand-research-demo.html`。

## 覆盖配色

在 `<style>` 标签中重新定义 CSS 变量即可：

```html
<style>
.br-theme {
  --br-accent: #2563EB;        /* 主色调改为蓝色 */
  --br-accent-light: #3B82F6;
  --br-bg-page: #F8FAFC;      /* 页面背景改为冷灰 */
  --br-neutral: #7C3AED;      /* 二级色改为紫色 */
}
</style>
```

### 可覆盖的 CSS 变量

```css
--br-bg-page          /* 页面背景色    默认 #F5F0E8 */
--br-bg-card          /* 卡片背景色    默认 #FFFFFF */
--br-bg-stripe        /* 表格斑马纹    默认 #F5F2EC */
--br-bg-lessons       /* 经验框背景    默认 #FAFAF7 */
--br-ink              /* 主文字色      默认 #1C1C1C */
--br-ink-light        /* 正文文字色    默认 #555555 */
--br-ink-muted        /* 弱化文字色    默认 #8B8B8B */
--br-accent           /* 主强调色      默认 #C2513B */
--br-accent-light     /* 浅强调色      默认 #E07A5F */
--br-positive         /* 正面/成功色   默认 #5B8C6F */
--br-neutral          /* 中性/信息色   默认 #4A6FA5 */
--br-border           /* 边框色        默认 #E8E4DA */
--br-border-light     /* 浅边框色      默认 #F0EDE5 */
--br-shadow           /* 卡片阴影      默认 0 1px 4px rgba(0,0,0,0.05) */
--br-shadow-hover     /* 悬停阴影      默认 0 4px 16px rgba(0,0,0,0.1) */
--br-radius           /* 大圆角        默认 12px */
--br-radius-sm        /* 小圆角        默认 8px */
```

## 在 React / Next.js 中使用

### 导入方式

```tsx
// pages/_app.tsx (Next.js) 或 App.tsx (React)
import '@/theme/brand-research-theme.css';

// 在根 layout 或 body 上加 class
export default function App({ Component, pageProps }) {
  return (
    <div className="br-theme">
      <Component {...pageProps} />
    </div>
  );
}
```

### 组件示例

```tsx
export function BrandSection({ title, children }) {
  return (
    <div className="br-section">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

export function StatRow({ stats }) {
  return (
    <div className="br-stat-row">
      {stats.map((s) => (
        <div key={s.label} className="br-stat-card">
          <div className="br-stat-number">{s.value}</div>
          <div className="br-stat-label">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

export function Callout({ type = 'default', children }) {
  const cls = type === 'info' ? 'br-callout br-callout-info'
    : type === 'positive' ? 'br-callout br-callout-positive'
    : 'br-callout';
  return <div className={cls}>{children}</div>;
}
```

## 字体说明

主题使用以下字体栈，按优先级降序：

- **Serif 标题**：`'Playfair Display', 'Noto Serif SC', serif`
- **Sans 正文**：`'DM Sans', 'Noto Sans SC', sans-serif`

如果不导入 Google Fonts，浏览器会自动回退到：
- Serif → Georgia, Times New Roman（英文）/ 系统衬线字体（中文）
- Sans → -apple-system, Segoe UI, Roboto（英文）/ 系统黑体（中文）

**推荐导入 Google Fonts 以获得最佳效果**，但不导入也能正常渲染。主题 CSS 不包含任何字体文件。

## 不包含的内容

- 图片 / icon
- 字体文件
- JavaScript
- 任何第三方依赖
- 打印样式（已内置 `@media print`）
- 响应式适配（已内置 `@media (max-width: 700px)`）

## License

与 brand-research-pdf 项目相同。可自由复制到其他项目使用。
