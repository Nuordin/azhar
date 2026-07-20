import { db } from '$lib/server/db';
import {
	blogs,
	blogTranslations,
	projects,
	projectTranslations,
	units,
	unitTranslations
} from '$lib/server/db/schema';
import { and, eq } from 'drizzle-orm';
import { slugify } from '$lib/utils';

const LOCALE = 'ar';

function xmlEscape(value: string): string {
	return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

type Entry = { loc: string; lastmod?: Date | null };

function urlTag({ loc, lastmod }: Entry): string {
	const lastmodTag = lastmod ? `<lastmod>${new Date(lastmod).toISOString()}</lastmod>` : '';
	return `<url><loc>${xmlEscape(loc)}</loc>${lastmodTag}</url>`;
}

export async function GET({ url }) {
	const origin = url.origin;
	const abs = (path: string) => new URL(path, origin).href;
	const detailPath = (section: string, title: string | null, id: number) =>
		`/${section}/${encodeURIComponent(slugify(title ?? ''))}-${id}`;

	const publishedProjects = await db
		.select({ id: projects.id, updatedAt: projects.updatedAt, title: projectTranslations.title })
		.from(projects)
		.leftJoin(
			projectTranslations,
			and(eq(projects.id, projectTranslations.projectId), eq(projectTranslations.locale, LOCALE))
		)
		.where(eq(projects.isPublished, true));

	const publishedUnits = await db
		.select({ id: units.id, updatedAt: units.updatedAt, title: unitTranslations.title })
		.from(units)
		.leftJoin(unitTranslations, and(eq(units.id, unitTranslations.unitId), eq(unitTranslations.locale, LOCALE)))
		.where(eq(units.isPublished, true));

	const publishedBlogs = await db
		.select({ id: blogs.id, updatedAt: blogs.updatedAt, title: blogTranslations.title })
		.from(blogs)
		.leftJoin(blogTranslations, and(eq(blogs.id, blogTranslations.blogId), eq(blogTranslations.locale, LOCALE)))
		.where(eq(blogs.isPublished, true));

	const entries: Entry[] = [
		{ loc: abs('/') },
		{ loc: abs('/projects') },
		{ loc: abs('/units') },
		{ loc: abs('/blogs') },
		...publishedProjects.map((p) => ({ loc: abs(detailPath('projects', p.title, p.id)), lastmod: p.updatedAt })),
		...publishedUnits.map((u) => ({ loc: abs(detailPath('units', u.title, u.id)), lastmod: u.updatedAt })),
		...publishedBlogs.map((b) => ({ loc: abs(detailPath('blogs', b.title, b.id)), lastmod: b.updatedAt }))
	];

	const xml =
		'<?xml version="1.0" encoding="UTF-8"?>' +
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
		entries.map(urlTag).join('') +
		'</urlset>';

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
}
