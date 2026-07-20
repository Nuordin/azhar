import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

/**
 * يحول Markdown إلى HTML مُعقَّم وآمن للعرض عبر {@html}.
 * التعقيم إلزامي: المحتوى يُخزَّن في قاعدة البيانات ويُعرض للزوار.
 */
export function renderMarkdown(md: string): string {
	const html = marked.parse(md, { async: false });

	return sanitizeHtml(html, {
		allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img', 'h1', 'h2'],
		allowedAttributes: {
			a: ['href', 'name', 'target', 'rel'],
			img: ['src', 'alt']
		},
		allowedSchemes: ['http', 'https', 'mailto', 'tel']
	});
}
