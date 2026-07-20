import { db } from '$lib/server/db';
import { blogs, blogTranslations, media } from '$lib/server/db/schema';
import { and, desc, eq, sql, type SQL } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

const LOCALE = 'ar';
const BLOG_CATEGORIES = ['real_estate_tips', 'market_news', 'development', 'investment', 'company_news'];

export const load: PageServerLoad = async ({ url }) => {
	const limit = 9;
	const page = Number(url.searchParams.get('page')) || 1;
	const offset = (page - 1) * limit;

	// تجاهل قيم التصنيف غير الصالحة بدلاً من الفشل
	const categoryParam = url.searchParams.get('category');
	const category = categoryParam && BLOG_CATEGORIES.includes(categoryParam) ? categoryParam : null;

	const conditions: SQL[] = [eq(blogs.isPublished, true)];
	if (category) {
		conditions.push(eq(blogs.category, category as (typeof blogs.category.enumValues)[number]));
	}

	try {
		const totalCountResult = await db
			.select({ count: sql<number>`count(*)` })
			.from(blogs)
			.where(and(...conditions));
		const totalCount = totalCountResult[0].count;
		const totalPages = Math.ceil(totalCount / limit);

		const blogsList = await db
			.select({
				id: blogs.id,
				category: blogs.category,
				publishedAt: blogs.publishedAt,
				title: blogTranslations.title,
				excerpt: blogTranslations.excerpt,
				image: media.url
			})
			.from(blogs)
			.leftJoin(blogTranslations, and(eq(blogs.id, blogTranslations.blogId), eq(blogTranslations.locale, LOCALE)))
			.leftJoin(media, and(eq(blogs.id, media.blogId), eq(media.isMain, true)))
			.where(and(...conditions))
			.orderBy(desc(blogs.publishedAt), desc(blogs.createdAt))
			.limit(limit)
			.offset(offset);

		return {
			blogs: blogsList,
			category,
			categories: BLOG_CATEGORIES,
			pagination: {
				totalCount,
				totalPages,
				currentPage: page,
				limit
			}
		};
	} catch (error) {
		console.error(error);
		return {
			blogs: [],
			category: null,
			categories: BLOG_CATEGORIES,
			pagination: { totalCount: 0, totalPages: 0, currentPage: page, limit }
		};
	}
};
