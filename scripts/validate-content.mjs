import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const blogDirectory = fileURLToPath(new URL('../src/content/docs/blog/', import.meta.url));
const editorialTypes = new Set(['原创', '行业译介', '评论', '授权翻译']);
const errors = [];

async function findArticles(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	const articles = [];

	for (const entry of entries) {
		const entryPath = path.join(directory, entry.name);
		if (entry.isDirectory()) {
			articles.push(...(await findArticles(entryPath)));
		} else if (/\.mdx?$/.test(entry.name)) {
			articles.push(entryPath);
		}
	}

	return articles;
}

const articlePaths = await findArticles(blogDirectory);

for (const articlePath of articlePaths) {
	const fileName = path.relative(blogDirectory, articlePath);
	const source = await readFile(articlePath, 'utf8');
	const frontmatter = source.match(/^---\n([\s\S]*?)\n---/)?.[1];

	if (!frontmatter) {
		errors.push(`${fileName}: 缺少 YAML frontmatter`);
		continue;
	}

	const tagBlock = frontmatter.match(/^tags:\s*\n((?:[ \t]+- .+(?:\n|$))+)/m)?.[1] ?? '';
	const tags = [...tagBlock.matchAll(/^[ \t]+- (.+)$/gm)].map((match) => match[1].trim());
	const types = tags.filter((tag) => editorialTypes.has(tag));

	if (types.length !== 1) {
		errors.push(`${fileName}: 需要且只能有一个稿件类型，当前为 ${types.join('、') || '无'}`);
		continue;
	}

	if (tags[0] !== types[0]) {
		errors.push(`${fileName}: 稿件类型必须是 tags 第一项`);
	}
}

if (errors.length > 0) {
	console.error(['内容校验失败：', ...errors.map((error) => `- ${error}`)].join('\n'));
	process.exit(1);
}

console.log(`内容校验通过：${path.relative(process.cwd(), blogDirectory)} 中 ${articlePaths.length} 篇文章均有唯一稿件类型。`);
