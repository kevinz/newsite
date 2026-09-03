import { config, fields, collection } from '@keystatic/core';

// Keystatic 仅作本地可视化编辑器(storage: kind:'local')。
// - 集成 @keystatic/astro 仅在 dev 挂载(见 astro.config.mjs SKIP_KEYSTATIC),
//   生产 build 跳过,故 Cloudflare Pages 部署零后端足迹。
// - 写入路径对准 Starlight 博客文章目录 src/content/docs/blog/*(单文件 .mdx),
//   与 starlight-blog 插件的内容集合一致,可直接被 /blog/ 索引。
// - contentField 用 fields.mdx,产出 .mdx(Starlight docsLoader 支持)。
export default config({
	storage: { kind: 'local' },
	collections: {
		blog: collection({
			label: '博客文章',
			path: 'src/content/docs/blog/*',
			slugField: 'title',
			format: { contentField: 'content' },
			entryLayout: 'content',
			schema: {
				title: fields.slug({
					name: { label: '标题', validation: { length: { min: 1 } } },
					slug: { label: 'URL slug' },
				}),
				description: fields.text({ label: '描述(150–160 字,SEO 用)' }),
				// starlight-blog 约定 frontmatter:生产 build 跳过 draft:true
				date: fields.date({ label: '发布日期', validation: { isRequired: true } }),
				draft: fields.checkbox({ label: '草稿(生产构建时不发布)', defaultValue: false }),
				// 默认回退到 astro.config 的全局 authors.benz;可写 'benz' 或留空
				authors: fields.array(fields.text({ label: '作者 key' }), {
					label: '作者',
					// itemLabel 回调的入参是整个数组字段的值({fields: string[]}),
					// 元素值在 props.fields[props.localIndex]
					itemLabel: (props) => props.fields[props.localIndex] ?? '',
				}),
				// 每篇文章必须且只能使用一个稿件类型标签：原创、行业译介、评论、授权翻译。
				// 建议将稿件类型放在第一项，其余项用于内容支柱与主题。
				tags: fields.array(fields.text({ label: '标签值' }), {
					label: '标签（第一项为稿件类型）',
					itemLabel: (props) => props.fields[props.localIndex] ?? '',
				}),
				content: fields.mdx({
					label: '正文',
					options: {},
				}),
			},
		}),
	},
});
