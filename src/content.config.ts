import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { blogSchema } from 'starlight-blog/schema';

// 博客文章是 `docs` 集合的子目录 src/content/docs/blog/,经 blogSchema 扩展 docsSchema
// (非独立集合)。blogSchema 加的字段(date/authors/excerpt/tags/cover/featured/metrics)
// 经 .partial() 全部可选;按约定我们写作时仍给 title + date。
export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({ extend: (context) => blogSchema(context) }),
	}),
};
