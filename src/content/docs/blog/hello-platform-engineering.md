---
title: 写在开站:为什么做这个平台工程博客
description: 关于本站的定位 —— 用博客持续记录平台工程与云原生业界动态,作为开源项目的佐证与自我驱动力。
date: 2026-08-26
authors:
  - benz
tags:
  - 杂谈
  - 平台工程
draft: false
---

## 站点定位

这是一个**单一开源项目/框架的展示站**,首页推介项目本身;而 `/blog/` 持续更新平台工程、云原生与开发者体验相关的业界动态。

博客在这套架构里承担两个角色:

1. **佐证** —— 用持续的行业观察,支撑项目所主张的技术立场与方法论。
2. **内驱力** —— 公开承诺更新,倒逼自己保持对新工具、新范式的跟踪与思考。

## 技术栈一句话

Astro + Starlight 的 `starlight-blog` 插件 → Cloudflare Pages 零月费静态部署;评论走 `starlight-giscus` 绑 GitHub Discussions;搜索用 Starlight 内置 Pagefind(中文分词开箱即用)。

> 这是一篇示例文章。你可以在本地可视化编辑器里粘贴更多内容,或直接在 `src/content/docs/blog/` 裸写 Markdown。
