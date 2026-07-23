import { eq, sql, inArray, desc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { blogs, blogTranslations, media } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import type { PageServerLoad } from './$types';

const BLOG_CATEGORIES = ['real_estate_tips', 'market_news', 'development', 'investment', 'company_news'] as const;
type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export const load: PageServerLoad = async ({ url }) => {
	const limit = 10; // عدد المقالات في كل صفحة
	const page = Number(url.searchParams.get('page')) || 1;
	const offset = (page - 1) * limit;

	try {
		const totalCountResult = await db.select({ count: sql<number>`count(*)` }).from(blogs);

		const totalCount = totalCountResult[0].count;
		const totalPages = Math.ceil(totalCount / limit);

		const blogsList = await db
			.select({
				id: blogs.id,
				title: blogTranslations.title,
				category: blogs.category,
				publishedAt: blogs.publishedAt,
				isPublished: blogs.isPublished
			})
			.from(blogs)
			.leftJoin(blogTranslations, eq(blogs.id, blogTranslations.blogId))
			.where(eq(blogTranslations.locale, 'ar'))
			.orderBy(desc(blogs.createdAt))
			.limit(limit)
			.offset(offset);

		return {
			blogs: blogsList,
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
			pagination: {
				totalCount: 0,
				totalPages: 0,
				currentPage: page,
				limit
			},
			error: 'Failed to load blogs'
		};
	}
};

export const actions = {
	createBlog: async ({ request }) => {
		const formData = await request.formData();

		const title = formData.get('title') as string;
		const excerpt = formData.get('excerpt') as string;
		const content = formData.get('content') as string;
		const category = formData.get('category') as BlogCategory;
		const isPublished = formData.get('isPublished') === 'true';

		// المقال له صورة غلاف واحدة فقط
		const cover = (formData.getAll('mediaFiles') as File[]).find((file) => file.size > 0);

		// التحقق من صحة البيانات
		if (!title) return fail(422, { message: 'يجب الا يكون حقل عنوان المقال فارغا' });
		if (!excerpt) return fail(422, { message: 'يجب الا يكون حقل المقتطف فارغا' });
		if (!content) return fail(422, { message: 'يجب الا يكون حقل محتوى المقال فارغا' });
		if (!category || !BLOG_CATEGORIES.includes(category)) return fail(422, { message: 'يجب اختيار تصنيف صالح للمقال' });
		if (!cover) return fail(422, { message: 'يجب رفع صورة غلاف للمقال' });
		if (!cover.type.startsWith('image/')) return fail(422, { message: 'يجب أن تكون صورة الغلاف من نوع صورة' });

		try {
			const [newBlog] = await db
				.insert(blogs)
				.values({
					category: category,
					isPublished: isPublished,
					// يُحدد تاريخ النشر عند أول نشر فقط
					publishedAt: isPublished ? new Date() : null
				})
				.returning({ id: blogs.id });

			const blogId = newBlog.id;

			await db.insert(blogTranslations).values({
				blogId: blogId,
				locale: 'ar',
				title,
				excerpt,
				content
			});

			const uploadDir = path.join(process.cwd(), '..', 'ASSETS', 'uploads');

			await fs.mkdir(uploadDir, { recursive: true });

			const fileExt = cover.name.split('.').pop();
			const fileName = `${crypto.randomUUID()}.${fileExt}`;
			await fs.writeFile(path.join(uploadDir, fileName), Buffer.from(await cover.arrayBuffer()));

			await db.insert(media).values({
				blogId: blogId,
				url: `/uploads/${fileName}`,
				type: 'image',
				isMain: true,
				sortOrder: 0
			});

			return { success: true, message: 'Blog saved successfully' };
		} catch (error) {
			console.error('Error saving blog:', error);
			return fail(500, { message: 'Failed to save blog' });
		}
	},
	updateBlog: async ({ request }) => {
		const formData = await request.formData();
		const blogId = Number(formData.get('blogId'));

		if (!blogId) return fail(400, { message: 'المعرف غير صالح' });

		const title = formData.get('title') as string;
		const excerpt = formData.get('excerpt') as string;
		const content = formData.get('content') as string;
		const category = formData.get('category') as BlogCategory;
		const isPublished = formData.get('isPublished') === 'true';

		// المقال له صورة غلاف واحدة فقط: رفع صورة جديدة يستبدل الحالية
		const cover = (formData.getAll('mediaFiles') as File[]).find((file) => file.size > 0);

		// التحقق من صحة البيانات
		if (!title) return fail(422, { message: 'يجب الا يكون حقل عنوان المقال فارغا' });
		if (!excerpt) return fail(422, { message: 'يجب الا يكون حقل المقتطف فارغا' });
		if (!content) return fail(422, { message: 'يجب الا يكون حقل محتوى المقال فارغا' });
		if (!category || !BLOG_CATEGORIES.includes(category)) return fail(422, { message: 'يجب اختيار تصنيف صالح للمقال' });
		if (cover && !cover.type.startsWith('image/')) return fail(422, { message: 'يجب أن تكون صورة الغلاف من نوع صورة' });

		try {
			const [currentBlog] = await db
				.select({ publishedAt: blogs.publishedAt })
				.from(blogs)
				.where(eq(blogs.id, blogId))
				.limit(1);

			if (!currentBlog) return fail(404, { message: 'المقال غير موجود' });

			// لا يجوز أن يبقى المقال بلا صورة غلاف
			const existingMedia = await db
				.select({ id: media.id, url: media.url })
				.from(media)
				.where(eq(media.blogId, blogId));
			const deletedMediaIds: number[] = JSON.parse((formData.get('deletedMediaIds') as string) || '[]');
			const remaining = existingMedia.filter((m) => !deletedMediaIds.includes(m.id));
			if (!cover && remaining.length === 0) {
				return fail(422, { message: 'يجب رفع صورة غلاف للمقال' });
			}

			await db
				.update(blogs)
				.set({
					category: category,
					isPublished: isPublished,
					// تاريخ النشر يُحدد عند أول نشر فقط ولا يتغير بعدها
					publishedAt: currentBlog.publishedAt ?? (isPublished ? new Date() : null),
					updatedAt: new Date()
				})
				.where(eq(blogs.id, blogId));

			await db
				.update(blogTranslations)
				.set({
					title,
					excerpt,
					content
				})
				.where(eq(blogTranslations.blogId, blogId)); // افتراض التعديل على اللغة العربية فقط حالياً

			const uploadDir = path.join(process.cwd(), '..', 'ASSETS', 'uploads');

			// عند رفع غلاف جديد تُستبدل كل الوسائط الحالية، وإلا تُحذف المحددة للحذف فقط
			const mediaToDelete = cover ? existingMedia : existingMedia.filter((m) => deletedMediaIds.includes(m.id));
			for (const file of mediaToDelete) {
				try {
					await fs.unlink(path.join(uploadDir, file.url.replace('/uploads/', '')));
				} catch (e) {
					console.error(`لم يتم العثور على الملف لحذفه: ${file.url}`, e);
				}
			}
			if (mediaToDelete.length > 0) {
				await db.delete(media).where(
					inArray(
						media.id,
						mediaToDelete.map((m) => m.id)
					)
				);
			}

			if (cover) {
				await fs.mkdir(uploadDir, { recursive: true });
				const fileExt = cover.name.split('.').pop();
				const fileName = `${crypto.randomUUID()}.${fileExt}`;
				await fs.writeFile(path.join(uploadDir, fileName), Buffer.from(await cover.arrayBuffer()));

				await db.insert(media).values({
					blogId: blogId,
					url: `/uploads/${fileName}`,
					type: 'image',
					isMain: true,
					sortOrder: 0
				});
			}

			return { type: 'success', message: 'تم تحديث المقال بنجاح' };
		} catch (error) {
			console.error('Error updating blog:', error);
			return fail(500, { message: 'حدث خطأ داخلي أثناء تحديث المقال' });
		}
	},
	deleteBlog: async ({ request }) => {
		try {
			const formData = await request.formData();
			const blogId = Number(formData.get('id'));

			if (!blogId) {
				return fail(400, { message: 'معرف المقال غير صالح' });
			}

			const blogMedia = await db.select({ url: media.url }).from(media).where(eq(media.blogId, blogId));

			const uploadDir = path.join(process.cwd(), '..', 'ASSETS', 'uploads');

			for (const file of blogMedia) {
				try {
					const fileName = file.url.replace('/uploads/', '');
					const filePath = path.join(uploadDir, fileName);

					await fs.unlink(filePath);
				} catch (err) {
					console.error(`لم يتم العثور على الملف أو تعذر حذفه: ${file.url}`, err);
				}
			}

			await db.delete(media).where(eq(media.blogId, blogId));
			await db.delete(blogTranslations).where(eq(blogTranslations.blogId, blogId));
			await db.delete(blogs).where(eq(blogs.id, blogId));

			return { type: 'success', message: 'تم حذف المقال بنجاح' };
		} catch (error) {
			console.error('حدث خطأ أثناء الحذف:', error);
			return fail(500, { message: 'حدث خطأ داخلي أثناء حذف المقال' });
		}
	},
	togglePublish: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const isPublished = formData.get('isPublished') === 'true';

		if (!id || isNaN(id)) {
			return fail(400, { message: 'معرف المقال غير صحيح' });
		}

		try {
			const [currentBlog] = await db
				.select({ publishedAt: blogs.publishedAt })
				.from(blogs)
				.where(eq(blogs.id, id))
				.limit(1);

			if (!currentBlog) return fail(404, { message: 'المقال غير موجود' });

			await db
				.update(blogs)
				.set({
					isPublished: isPublished,
					publishedAt: currentBlog.publishedAt ?? (isPublished ? new Date() : null)
				})
				.where(eq(blogs.id, id));

			return { success: true };
		} catch (error) {
			console.error('خطأ أثناء تحديث حالة النشر:', error);
			return fail(500, { message: 'فشل تحديث حالة النشر في قاعدة البيانات' });
		}
	}
};
