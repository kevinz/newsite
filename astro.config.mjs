// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightBlog from 'starlight-blog';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';

// Keystatic 只在本地开发时挂载。静态生产构建若加载它，会注入需要
// server adapter 的管理路由，导致 Cloudflare Pages 构建失败。
const skipKeystatic =
	process.env.NODE_ENV === 'production' || process.env.SKIP_KEYSTATIC === 'true';
// @astrojs/react 供 /keystatic 管理界面的 client:only React 组件使用；
// 与 Keystatic 一样仅 dev 挂载，生产构建不引入。
const integrations = skipKeystatic ? [] : [react(), keystatic()];

export default defineConfig({
	site: 'https://devops.gold',
	output: 'static',
	// dev 用 'ignore'：Keystatic 编辑器的内部链接(/keystatic/collection/blog/create 等)
	// 不带尾斜杠，'always' 会逐条弹错误页。生产构建保持 'always'(URL 规范/SEO 不变)。
	trailingSlash: process.env.NODE_ENV === 'production' ? 'always' : 'ignore',
	// 监听所有网卡：远程设备可经由 Tailscale 访问本地可视化编辑器(/keystatic)。
	// 注意显式设置 host 后，Keystatic 集成不再把 dev server 钉回 127.0.0.1。
	// allowedHosts 放行 tailnet 域名：Tailscale Serve 的 HTTPS 反代保留原始
	// Host 头（*.ts.net），Vite 默认只放行 localhost 和 IP，会拦截该域名。
	// Keystatic 的 UI 依赖 crypto.subtle，必须经 HTTPS（安全上下文）访问。
	server: {
		host: true,
		allowedHosts: ['.ts.net'],
	},
	integrations: [
		...integrations,
		starlight({
			title: 'DevOps Gold',
			locales: {
				root: { label: '中文', lang: 'zh-CN' },
			},
			defaultLocale: 'root',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/kevinz' },
				{
					icon: 'linkedin',
					label: 'LinkedIn',
					href: 'https://www.linkedin.com/in/kevinzz/',
				},
			],
			head: [
				{ tag: 'meta', attrs: { name: 'author', content: 'Kevin Zeng（Benz）' } },
				{ tag: 'meta', attrs: { property: 'og:type', content: 'website' } },
				{ tag: 'meta', attrs: { property: 'og:site_name', content: 'DevOps Gold' } },
				{
					tag: 'meta',
					attrs: { property: 'og:image', content: 'https://devops.gold/og-default.png' },
				},
				{ tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
				{ tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
				{ tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
				{
					tag: 'meta',
					attrs: { name: 'twitter:image', content: 'https://devops.gold/og-default.png' },
				},
			],
			components: {
				DraftContentNotice: './src/components/DraftContentNotice.astro',
				Pagination: './src/components/BlogPagination.astro',
			},
			sidebar: [],
			plugins: [
				starlightBlog({
					authors: {
						benz: {
							name: 'Kevin Zeng（Benz）',
							url: 'https://devops.gold/about/',
						},
					},
					metrics: { readingTime: true },
					navigation: 'header-end',
					prefix: 'blog',
				}),
			],
		}),
	],
});
