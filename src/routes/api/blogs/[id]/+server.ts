import { db } from '$lib/server/db';
import { blogs, blogTranslations, media } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// يُستخدم من لوحة التحكم فقط (يعيد المسودات غير المنشورة)، لذا يتطلب صلاحية مدير
export async function GET({ params, locals }) {
	if (!locals.user || locals.user.role !== 'admin') {
		return Response.json({ error: 'Unauthorized' }, { status: 403 });
	}

	const blogId = Number(params.id);

	if (!blogId) {
		return Response.json({ error: 'Invalid ID' }, { status: 400 });
	}

	try {
		const result = await db
			.select()
			.from(blogs)
			.leftJoin(blogTranslations, eq(blogs.id, blogTranslations.blogId))
			.where(eq(blogs.id, blogId))
			.limit(1);

		if (!result || result.length === 0) {
			return Response.json({ error: 'Blog not found' }, { status: 404 });
		}

		const blogMedia = await db.select().from(media).where(eq(media.blogId, blogId));

		return Response.json({
			blog: result[0].blogs,
			translations: result[0].blog_translations,
			media: blogMedia
		});
	} catch (error) {
		console.error('Error fetching blog:', error);
		return Response.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
