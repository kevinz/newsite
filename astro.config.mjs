// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightBlog from 'starlight-blog';
import starlightGiscus from 'starlight-giscus';
import keystatic from '@keystatic/astro';

// Keystatic 仅在 dev 挂载:生产 build 必须跳过,否则 @keystatic/astro 注入的
// server-rendered API/admin 路由会在无 adapter 的 output:'static' 下报
// [NoAdapterInstalled] 而 build 失败(已实测复现),自然也使 Cloudflare Pages 部署失败。
// 双保险判定:生产环境(NODE_ENV=production)或显式 SKIP_KEYSTATIC=true 时跳过;
// 本地 dev 两条件都不满足 → 挂载,得 localhost:4321/keystatic 可视化编辑器。
const skipKeystatic =
	process.env.NODE_ENV === 'production' || process.env.SKIP_KEYSTATIC === 'true';
const integrations = skipKeystatic ? [] : [keystatic()];

// https://astro.build/config
export default defineConfig({
	site: 'https://newsite.pages.dev', // 完整 origin;驱动 RSS/结构化数据/canonical。CF 项目名若非 newsite 改此行。
	output: 'static', // 纯静态产物给 Cloudflare Pages,无 adapter。
	trailingSlash: 'always', // 与 Giscus pathname 映射一致,避免 /blog/foo 与 /blog/foo/ 两套讨论。
	integrations: [
		...integrations,
		starlight({
			title: 'Platform Engineering Lab', // 暂定,可改
			// root locale:从 / 直接服务中文,URL 不带 locale 前缀(契合单语、避免 Giscus i18n pathname 坑)。
			locales: {
				root: { label: '中文', lang: 'zh-CN' },
			},
			defaultLocale: 'root',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/kevinz' },
				{ icon: 'twitter', label: 'X', href: 'https://x.com' },
			],
			head: [
				// 站点默认 OG 卡片(每篇可由 frontmatter head 覆盖 og:image)。第一期静态默认图。
				{ tag: 'meta', attrs: { property: 'og:type', content: 'website' } },
				{ tag: 'meta', attrs: { property: 'og:image', content: 'https://newsite.pages.dev/og-default.png' } },
				{ tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
				{ tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
				{ tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
				{ tag: 'meta', attrs: { name: 'twitter:image', content: 'https://newsite.pages.dev/og-default.png' } },
				// Cloudflare Web Analytics:token 占位。补真 token 后取消注释并用 is:inline beacon,
				// 或在此以 Astro 的 <script is:inline> 组件注入(避免空 token 脚本无谓请求)。
				// { tag: 'script', attrs: { defer: true, 'data-cf-beacon': '{"token":"YOUR_TOKEN"}', src: 'https://static.cloudflareinsights.com/beacon.min.js' } },
			],
			sidebar: [], // 纯博客站:文档侧栏留空,导航主轴走 blog 插件的 header 链接。
			plugins: [
				starlightBlog({
					authors: {
						// 单作者默认全局作者;博客文章可不填 authors 即回退到此。
						benz: { name: 'Benz', url: 'https://github.com/kevinz' },
					},
					metrics: { readingTime: true }, // 中文阅读时长(Pagefind+blog 自动估算)
					navigation: 'header-end', // header 右侧挂「博客」链接
					prefix: 'blog', // /blog/ 路由
				}),
				// Giscus 通过覆盖 Pagination 组件挂评论,只作用在有分页的文章页(不会冒到首页/docs)。
				// 真实 API 无 strict/lang/loading 参数:strict 已在插件源码硬编码 data-strict="1";
				// lang 取 Astro.locals.starlightRoute.lang(随我们 root=zh-CN 即中文)。
				starlightGiscus({
					repo: 'kevinz/newsite',
					repoId: 'R_kgDOUEdN6g', // 取自 gh api graphql .node_id
					category: 'Announcements', // 该讨论分类 slug(开 Discussions 时 GitHub 自动建)
					categoryId: 'DIC_kwDOUEdN6s4DENvZ', // 同上,GraphQL discussionCategories
					mapping: 'pathname',
					reactions: true,
					inputPosition: 'top',
					lazy: true,
					theme: 'preferred_color_scheme',
				}),
			],
		}),
	],
});
