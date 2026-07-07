import { eq, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { projects, projectTranslations, media } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const limit = 10; // عدد المشاريع في كل صفحة
	const page = Number(url.searchParams.get('page')) || 1; // قراءة رقم الصفحة من الرابط، والافتراضي 1
	const offset = (page - 1) * limit; // حساب نقطة البداية لجلب البيانات

	const totalCountResult = await db.select({ count: sql<number>`count(*)` }).from(projects);

	const totalCount = totalCountResult[0].count;
	const totalPages = Math.ceil(totalCount / limit);

	const parentProjectsList = await db
		.select({
			id: projects.id,
			title: projectTranslations.title
		})
		.from(projects)
		.leftJoin(projectTranslations, eq(projects.id, projectTranslations.projectId))
		.where(eq(projectTranslations.locale, 'ar'));

	const projectsList = await db
		.select({
			id: projects.id,
			title: projectTranslations.title,
			developerName: projectTranslations.developerName,
			constructionStatus: projects.constructionStatus,
			completionPercentage: projects.completionPercentage,
			startingPrice: projects.startingPrice,
			isPublished: projects.isPublished
		})
		.from(projects)
		.leftJoin(projectTranslations, eq(projects.id, projectTranslations.projectId))
		.where(eq(projectTranslations.locale, 'ar'))
		.limit(limit)
		.offset(offset)
		.orderBy(projects.createdAt); // يمكنك إضافة ترتيب هنا إذا رغبت

	// 4. إرسال البيانات إلى واجهة المستخدم (+page.svelte)
	return {
		projects: projectsList,
		parentProjects: parentProjectsList,
		pagination: {
			totalCount,
			totalPages,
			currentPage: page,
			limit
		}
	};
};

export const actions = {
	createProject: async ({ request }) => {
		try {
			const formData = await request.formData();
			const parentIdRaw = formData.get('parentId') as string;
			const parentId = parentIdRaw && parentIdRaw !== 'none' ? Number(parentIdRaw) : null;

			const ownershipType = formData.get('ownershipType') as
				'omani_only' | 'gcc_only' | 'all_nationalities';
			const constructionStatus = formData.get('constructionStatus') as
				'off_plan' | 'under_construction' | 'ready';
			const completionPercentage =
				(formData.get('completionPercentage') as '25' | '50' | '75' | '100') || '0';
			const startingPrice = formData.get('startingPrice')
				? Number(formData.get('startingPrice'))
				: null;

			const deliveryDateStr = formData.get('deliveryDate') as string;
			const deliveryDate = deliveryDateStr ? new Date(deliveryDateStr) : null;

			const isPublished = formData.get('isPublished') === 'true';

			const [newProject] = await db
				.insert(projects)
				.values({
					parentId: parentId,
					ownershipType: ownershipType || 'all_nationalities',
					constructionStatus: constructionStatus || 'off_plan',
					completionPercentage: completionPercentage, // Drizzle enum matching
					startingPrice: startingPrice,
					deliveryDate: deliveryDate,
					isPublished: isPublished,
					isFeatured: false,
					featuredOrder: 0
				})
				.returning({ id: projects.id });

			const projectId = newProject.id;

			// 2. إدخال الترجمة وربطها بـ projectId
			const title = formData.get('title') as string;
			const developerName = formData.get('developerName') as string;
			const locationName = formData.get('locationName') as string;
			const description = formData.get('description') as string;

			const amenities = JSON.parse((formData.get('amenities') as string) || '[]');
			const paymentPlans = JSON.parse((formData.get('paymentPlans') as string) || '[]');
			const details = JSON.parse((formData.get('details') as string) || '[]');

			await db.insert(projectTranslations).values({
				projectId: projectId, // ربط صحيح
				locale: 'ar',
				title,
				developerName,
				locationName,
				description,
				amenities,
				paymentPlans,
				details
			});

			// 3. معالجة وحفظ الملفات
			const files = formData.getAll('mediaFiles') as File[];
			const thumbnailIndex = Number(formData.get('thumbnailIndex') || 0);
			const uploadDir = path.join(process.cwd(), '..', 'ASSETS', 'uploads');

			await fs.mkdir(uploadDir, { recursive: true });

			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				if (file.size === 0) continue;

				const fileExt = file.name.split('.').pop();
				const fileName = `${crypto.randomUUID()}.${fileExt}`;
				const filePath = path.join(uploadDir, fileName);

				const arrayBuffer = await file.arrayBuffer();
				const buffer = Buffer.from(arrayBuffer);
				await fs.writeFile(filePath, buffer);

				const isMain = i === thumbnailIndex;
				const fileType = file.type.startsWith('image/') ? 'image' : 'video';

				await db.insert(media).values({
					projectId: projectId, // ربط صحيح
					url: `/uploads/${fileName}`,
					type: fileType,
					isMain: isMain,
					sortOrder: i
				});
			}

			return { success: true };
		} catch (error) {
			console.error('Error saving project:', error);
			return fail(500, { message: 'Failed to save project' });
		}
	},
	deleteProject: async ({ request }) => {
		try {
			const formData = await request.formData();
			const projectId = Number(formData.get('id'));

			if (!projectId) {
				return fail(400, { message: 'معرف المشروع غير صالح' });
			}

			const projectMedia = await db
				.select({ url: media.url })
				.from(media)
				.where(eq(media.projectId, projectId));

			const uploadDir = path.join(process.cwd(), '..', 'ASSETS', 'uploads');

			for (const file of projectMedia) {
				try {
					const fileName = file.url.replace('/uploads/', '');
					const filePath = path.join(uploadDir, fileName);

					await fs.unlink(filePath);
				} catch (err) {
					console.error(`لم يتم العثور على الملف أو تعذر حذفه: ${file.url}`, err);
				}
			}

			await db.delete(media).where(eq(media.projectId, projectId));
			await db.delete(projectTranslations).where(eq(projectTranslations.projectId, projectId));
			await db.delete(projects).where(eq(projects.id, projectId));

			return { type: 'success', message: 'تم حذف المشروع بنجاح' };
		} catch (error) {
			console.error('حدث خطأ أثناء الحذف:', error);
			return fail(500, { message: 'حدث خطأ داخلي أثناء حذف المشروع' });
		}
	}
};
