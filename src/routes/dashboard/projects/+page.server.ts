/* eslint-disable @typescript-eslint/no-explicit-any */
import { eq, sql, inArray } from 'drizzle-orm';
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
		.orderBy(projects.updatedAt);

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

			const ownershipType = formData.get('ownershipType') as 'omani_only' | 'gcc_only' | 'all_nationalities';
			const constructionStatus = formData.get('constructionStatus') as 'off_plan' | 'under_construction' | 'ready';
			const completionPercentage = (formData.get('completionPercentage') as '25' | '50' | '75' | '100') || '0';
			const startingPrice = formData.get('startingPrice') ? Number(formData.get('startingPrice')) : null;

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
			const title = formData.get('title') as string;
			const developerName = formData.get('developerName') as string;
			const locationName = formData.get('locationName') as string;
			const description = formData.get('description') as string;

			const amenities = JSON.parse((formData.get('amenities') as string) || '[]');
			const paymentPlans = JSON.parse((formData.get('paymentPlans') as string) || '[]');
			const details = JSON.parse((formData.get('details') as string) || '[]');

			await db.insert(projectTranslations).values({
				projectId: projectId,
				locale: 'ar',
				title,
				developerName,
				locationName,
				description,
				amenities,
				paymentPlans,
				details
			});

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

			return { success: true, message: 'Project saved successfully' };
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

			const projectMedia = await db.select({ url: media.url }).from(media).where(eq(media.projectId, projectId));

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
	},
	updateProject: async ({ request }) => {
		try {
			const formData = await request.formData();
			const projectId = Number(formData.get('projectId'));

			if (!projectId) return fail(400, { message: 'المعرف غير صالح' });

			const parentIdRaw = formData.get('parentId') as string;
			const parentId = parentIdRaw && parentIdRaw !== 'none' ? Number(parentIdRaw) : null;
			const ownershipType = formData.get('ownershipType') as any;
			const constructionStatus = formData.get('constructionStatus') as any;
			const completionPercentage = (formData.get('completionPercentage') as any) || '0';
			const startingPrice = formData.get('startingPrice') ? Number(formData.get('startingPrice')) : null;
			const deliveryDateStr = formData.get('deliveryDate') as string;
			const deliveryDate = deliveryDateStr ? new Date(deliveryDateStr) : null;
			const isPublished = formData.get('isPublished') === 'true';

			await db
				.update(projects)
				.set({
					parentId: parentId,
					ownershipType: ownershipType,
					constructionStatus: constructionStatus,
					completionPercentage: completionPercentage,
					startingPrice: startingPrice,
					deliveryDate: deliveryDate,
					isPublished: isPublished,
					updatedAt: new Date()
				})
				.where(eq(projects.id, projectId));

			const title = formData.get('title') as string;
			const developerName = formData.get('developerName') as string;
			const locationName = formData.get('locationName') as string;
			const description = formData.get('description') as string;
			const amenities = JSON.parse((formData.get('amenities') as string) || '[]');
			const paymentPlans = JSON.parse((formData.get('paymentPlans') as string) || '[]');
			const details = JSON.parse((formData.get('details') as string) || '[]');

			await db
				.update(projectTranslations)
				.set({
					title,
					developerName,
					locationName,
					description,
					amenities,
					paymentPlans,
					details
				})
				.where(eq(projectTranslations.projectId, projectId)); // افتراض التعديل على اللغة العربية فقط حالياً

			const deletedMediaIds = JSON.parse((formData.get('deletedMediaIds') as string) || '[]');
			if (deletedMediaIds.length > 0) {
				const mediaToDelete = await db.select({ url: media.url }).from(media).where(inArray(media.id, deletedMediaIds));
				const uploadDir = path.join(process.cwd(), '..', 'ASSETS', 'uploads');

				for (const file of mediaToDelete) {
					try {
						const fileName = file.url.replace('/uploads/', '');
						await fs.unlink(path.join(uploadDir, fileName));
					} catch (e) {
						console.log(e);
						console.error(`لم يتم العثور على الملف لحذفه: ${file.url}`);
					}
				}
				await db.delete(media).where(inArray(media.id, deletedMediaIds));
			}

			await db.update(media).set({ isMain: false }).where(eq(media.projectId, projectId));

			const mainExistingMediaId = formData.get('mainExistingMediaId');
			if (mainExistingMediaId && mainExistingMediaId !== 'null') {
				await db
					.update(media)
					.set({ isMain: true })
					.where(eq(media.id, Number(mainExistingMediaId)));
			}

			const files = formData.getAll('mediaFiles') as File[];
			const thumbnailIndex = Number(formData.get('thumbnailIndex'));
			const uploadDir = path.join(process.cwd(), '..', 'ASSETS', 'uploads');
			await fs.mkdir(uploadDir, { recursive: true });

			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				if (file.size === 0) continue;

				const fileExt = file.name.split('.').pop();
				const fileName = `${crypto.randomUUID()}.${fileExt}`;
				const filePath = path.join(uploadDir, fileName);

				const arrayBuffer = await file.arrayBuffer();
				await fs.writeFile(filePath, Buffer.from(arrayBuffer));

				const fileType = file.type.startsWith('image/') ? 'image' : 'video';
				const isMain = i === thumbnailIndex && (!mainExistingMediaId || mainExistingMediaId === 'null');

				const maxOrderResult = await db
					.select({ maxOrder: sql<number>`MAX(${media.sortOrder})` })
					.from(media)
					.where(eq(media.projectId, projectId));
				const nextOrder = (maxOrderResult[0]?.maxOrder || 0) + i + 1;

				await db.insert(media).values({
					projectId: projectId,
					url: `/uploads/${fileName}`,
					type: fileType,
					isMain: isMain,
					sortOrder: nextOrder
				});
			}

			return { type: 'success', message: 'تم تحديث المشروع بنجاح' };
		} catch (error) {
			console.error('Error updating project:', error);
			return fail(500, { message: 'حدث خطأ داخلي أثناء تحديث المشروع' });
		}
	},
	togglePublish: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const isPublished = formData.get('isPublished') === 'true';

		if (!id || isNaN(id)) {
			return fail(400, { message: 'معرف المشروع غير صحيح' });
		}

		try {
			await db.update(projects).set({ isPublished: isPublished }).where(eq(projects.id, id));

			return { success: true };
		} catch (error) {
			console.error('خطأ أثناء تحديث حالة النشر:', error);
			return fail(500, { message: 'فشل تحديث حالة النشر في قاعدة البيانات' });
		}
	}
};
