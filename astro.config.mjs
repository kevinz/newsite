// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightBlog from 'starlight-blog';
import keystatic from '@keystatic/astro';

// Keystatic 只在本地开发时挂载。静态生产构建若加载它，会注入需要
// server adapter 的管理路由，导致 Cloudflare Pages 构建失败。
const skipKeystatic =
	process.env.NODE_ENV === 'production' || process.env.SKIP_KEYSTATIC === 'true';
const integrations = skipKeystatic ? [] : [keystatic()];

export default defineConfig({
	site: 'https://devops.gold',
	output: 'static',
	trailingSlash: 'always',
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
