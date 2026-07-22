import { db } from '$lib/server/db';
import { blogs, blogTranslations, media } from '$lib/server/db/schema';
import { and, asc, desc, eq, ne } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';
import { renderMarkdown } from '$lib/server/markdown';
import { parseDetailParams, slugify } from '$lib/utils';
import { localizedPath } from '$lib/i18n/config';
import { getAvailableLocales } from '$lib/i18n/locales.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const LOCALE = params.lang;
	const { id, slug } = parseDetailParams(params.title, params.id);
	if (!id || isNaN(id)) throw error(404, 'المقال غير موجود');

	const [row] = await db
		.select({ blog: blogs, translation: blogTranslations })
		.from(blogs)
		.leftJoin(blogTranslations, and(eq(blogs.id, blogTranslations.blogId), eq(blogTranslations.locale, LOCALE)))
		.where(eq(blogs.id, id))
		.limit(1);

	if (!row || !row.blog.isPublished) throw error(404, 'المقال غير موجود');
	// لا توجد ترجمة بهذه اللغة ⇒ 404
	if (!row.translation) throw error(404, 'المقال غير موجود');

	// إعادة توجيه دائمة إلى الرابط القانوني عند اختلاف المقطع النصي
	const canonicalSlug = slugify(row.translation.title);
	if (canonicalSlug && slug !== canonicalSlug) {
		throw redirect(301, localizedPath(LOCALE, 'blogs', canonicalSlug, id));
	}

	const contentHtml = renderMarkdown(row.translation.content);

	// اللغات التي تتوفر لها ترجمة (لبناء روابط hreflang البديلة)
	const availableCodes = new Set(getAvailableLocales().map((l) => l.code));
	const allTranslations = await db
		.select({ locale: blogTranslations.locale, title: blogTranslations.title })
		.from(blogTranslations)
		.where(eq(blogTranslations.blogId, id));
	const altLocales = allTranslations
		.filter((t) => availableCodes.has(t.locale))
		.map((t) => ({ code: t.locale, slug: slugify(t.title) }));

	const blogMedia = await db.select().from(media).where(eq(media.blogId, id)).orderBy(asc(media.sortOrder));
	const sortedMedia = [...blogMedia].sort((a, b) => Number(b.isMain) - Number(a.isMain));

	// أحدث المقالات المنشورة الأخرى (مقالات ذات صلة)
	const related = await db
		.select({
			id: blogs.id,
			category: blogs.category,
			publishedAt: blogs.publishedAt,
			title: blogTranslations.title,
			excerpt: blogTranslations.excerpt,
			image: media.url
		})
		.from(blogs)
		.innerJoin(blogTranslations, and(eq(blogs.id, blogTranslations.blogId), eq(blogTranslations.locale, LOCALE)))
		.leftJoin(media, and(eq(blogs.id, media.blogId), eq(media.isMain, true)))
		.where(and(eq(blogs.isPublished, true), ne(blogs.id, id)))
		.orderBy(desc(blogs.publishedAt), desc(blogs.createdAt))
		.limit(3);

	return {
		blog: row.blog,
		translation: row.translation,
		contentHtml,
		media: sortedMedia,
		related,
		altLocales
	};
};
