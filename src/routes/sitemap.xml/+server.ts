import { db } from '$lib/server/db';
import { blogs, blogTranslations, projects, projectTranslations, units, unitTranslations } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { slugify } from '$lib/utils';
import { DEFAULT_LOCALE, localizedPath, sectionListPath, localeHome, type Section } from '$lib/i18n/config';
import { getAvailableLocales } from '$lib/i18n/locales.server';
import type { RequestHandler } from './$types';

function xmlEscape(value: string): string {
	return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

export const GET: RequestHandler = async ({ url }) => {
	const origin = url.origin;
	const abs = (path: string) => new URL(path, origin).href;

	const availableCodes = new Set(getAvailableLocales().map((l) => l.code));

	// ترجمات جميع الكيانات المنشورة (كل اللغات) — نستخدمها لبناء روابط hreflang البديلة
	const projectRows = await db
		.select({
			id: projects.id,
			updatedAt: projects.updatedAt,
			locale: projectTranslations.locale,
			title: projectTranslations.title
		})
		.from(projects)
		.innerJoin(projectTranslations, eq(projects.id, projectTranslations.projectId))
		.where(eq(projects.isPublished, true));

	const unitRows = await db
		.select({
			id: units.id,
			updatedAt: units.updatedAt,
			locale: unitTranslations.locale,
			title: unitTranslations.title
		})
		.from(units)
		.innerJoin(unitTranslations, eq(units.id, unitTranslations.unitId))
		.where(eq(units.isPublished, true));

	const blogRows = await db
		.select({
			id: blogs.id,
			updatedAt: blogs.updatedAt,
			locale: blogTranslations.locale,
			title: blogTranslations.title
		})
		.from(blogs)
		.innerJoin(blogTranslations, eq(blogs.id, blogTranslations.blogId))
		.where(eq(blogs.isPublished, true));

	type Row = { id: number; updatedAt: Date | number | null; locale: string; title: string | null };
	type Entity = { id: number; updatedAt: Date | number | null; byLocale: Record<string, string> };

	// يجمع صفوف الترجمة حسب معرّف الكيان: { locale: slug } للّغات المتاحة فقط
	function group(rows: Row[]): Entity[] {
		const map = new Map<number, Entity>();
		for (const r of rows) {
			if (!availableCodes.has(r.locale)) continue;
			let e = map.get(r.id);
			if (!e) {
				e = { id: r.id, updatedAt: r.updatedAt, byLocale: {} };
				map.set(r.id, e);
			}
			e.byLocale[r.locale] = slugify(r.title ?? '');
		}
		return [...map.values()];
	}

	// روابط hreflang البديلة (تُدرج في كل <url>): كل لغة + x-default
	function altLinks(hrefFor: (code: string) => string, locales: string[]): string {
		const links = locales.map(
			(code) => `<xhtml:link rel="alternate" hreflang="${code}" href="${xmlEscape(abs(hrefFor(code)))}"/>`
		);
		const xdefault = locales.includes(DEFAULT_LOCALE) ? DEFAULT_LOCALE : locales[0];
		if (xdefault) {
			links.push(`<xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(abs(hrefFor(xdefault)))}"/>`);
		}
		return links.join('');
	}

	function urlBlock(loc: string, alternates: string, lastmod?: Date | number | null): string {
		const lastmodTag = lastmod ? `<lastmod>${new Date(lastmod).toISOString()}</lastmod>` : '';
		return `<url><loc>${xmlEscape(abs(loc))}</loc>${lastmodTag}${alternates}</url>`;
	}

	// صفحات ثابتة (الرئيسية + قوائم الأقسام) لكل لغة
	const staticBlocks: string[] = [];
	const allLocales = [...availableCodes];
	const homeAlts = altLinks((code) => localeHome(code), allLocales);
	for (const code of allLocales) staticBlocks.push(urlBlock(localeHome(code), homeAlts));
	for (const section of ['projects', 'units', 'blogs'] as Section[]) {
		const alts = altLinks((code) => sectionListPath(code, section), allLocales);
		for (const code of allLocales) staticBlocks.push(urlBlock(sectionListPath(code, section), alts));
	}

	// صفحات التفاصيل: <url> لكل (كيان، لغة متاحة له ترجمة) مع روابط بديلة
	function entityBlocks(section: Section, entities: Entity[]): string[] {
		const blocks: string[] = [];
		for (const e of entities) {
			const locales = Object.keys(e.byLocale);
			const alts = altLinks((code) => localizedPath(code, section, e.byLocale[code], e.id), locales);
			for (const code of locales) {
				blocks.push(urlBlock(localizedPath(code, section, e.byLocale[code], e.id), alts, e.updatedAt));
			}
		}
		return blocks;
	}

	const detailBlocks = [
		...entityBlocks('projects', group(projectRows)),
		...entityBlocks('units', group(unitRows)),
		...entityBlocks('blogs', group(blogRows))
	];

	const xml =
		'<?xml version="1.0" encoding="UTF-8"?>' +
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' +
		staticBlocks.join('') +
		detailBlocks.join('') +
		'</urlset>';

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};
