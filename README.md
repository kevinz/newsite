# DevOps Gold

DevOps Gold 是 Kevin Zeng（Benz）的中文个人技术品牌，聚焦 AI 原生 DevOps 与平台工程实践，尤其关注 IaaS/ECS 与大量自建系统并存的真实环境。

站点基于 Astro、Starlight 和 `starlight-blog`，以纯静态文件部署到 Cloudflare Pages。评论使用 GitHub Discussions/Giscus；Markdown/MDX 是内容真源，本地可选用 Keystatic 编辑。

## 本地开发

要求使用与 `package-lock.json` 兼容的 Node.js/npm 环境。

```bash
npm ci
npm run dev
```

按照仓库的 agent 约定，需要长期运行开发服务器时使用后台模式：

```bash
npm run astro -- dev --background
npm run astro -- dev status
npm run astro -- dev logs
npm run astro -- dev stop
```

本地 Keystatic 编辑器位于 `http://localhost:4321/keystatic`。

## 内容结构

```text
src/content/docs/index.mdx        首页
src/content/docs/about.md         作者介绍与编辑规则
src/content/docs/blog/            博客文章
docs/content-backlog.md           已确认的后续选题
CONTEXT.md                         项目领域词汇
docs/plans/                        已确认的计划
```

博客文章必须使用一个稿件类型标签：`原创`、`行业译介`、`评论` 或 `授权翻译`。主题和版权规则见 About 页面与 `docs/content-backlog.md`。

## 生产构建

```bash
npm run build
npm run preview
```

生产输出位于 `dist/`。生产模式会跳过 Keystatic 的管理路由，保持 Cloudflare Pages 所需的纯静态输出。

发布前至少确认：

- 草稿未进入博客列表、RSS、sitemap 或搜索索引；
- Pagefind、RSS、sitemap 与 Giscus 正常；
- `public/_redirects` 中的旧 URL 返回预期的 301；
- canonical 与 Open Graph URL 指向 `https://devops.gold`。

## Cloudflare Pages

建议配置：

- Git 仓库：`kevinz/newsite`
- 生产分支：`main`
- 构建命令：`npm run build`
- 输出目录：`dist`
- 部署模式：分支/PR 预览，`main` 自动发布

生产域名切换是单独的高风险操作。必须先完成 Pages 预览验收、记录现有 DNS 与回滚值，并取得明确确认，才能将 `devops.gold` 指向新站。本仓库中的代码或计划文档本身不授权执行域名切换。

## 项目文档

- [领域词汇](./CONTEXT.md)
- [两周发布计划](./docs/plans/2026-09-devops-gold-launch.md)
- [内容 Backlog](./docs/content-backlog.md)
