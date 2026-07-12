import { db } from '$lib/server/db';
import { units, unitTranslations, projects, projectTranslations, media } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs/promises';

import type { PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import path from 'path';

export const load: PageServerLoad = async ({ url }) => {
	const page = url.searchParams.get('page') ?? '1';
	const limit = 10;
	const offset = (parseInt(page) - 1) * limit;

	try {
		const totalCount = await db.$count(units);
		const totalPages = Math.ceil(totalCount / limit);

		const unitList = await db
			.select({
				id: units.id,
				title: unitTranslations.title,
				developer: unitTranslations.developer,
				price: units.price,
				completionPercentage: units.completionPercentage,
				constructionStatus: units.constructionStatus,
				isPublished: units.isPublished
			})
			.from(units)
			.leftJoin(unitTranslations, eq(units.id, unitTranslations.unitId))
			.where(eq(unitTranslations.locale, 'ar'))
			.limit(limit)
			.offset(offset)
			.orderBy(units.updatedAt);

		const projectList = await db
			.select({ id: projects.id, title: projectTranslations.title })
			.from(projects)
			.leftJoin(projectTranslations, eq(projects.id, projectTranslations.projectId));
		return {
			unitList,
			projectList,
			pagination: {
				totalCount,
				totalPages,
				currentPage: Number(page),
				limit
			}
		};
	} catch (error) {
		console.error(error);
		return { error: 'Failed to load properties' };
	}
};

export const actions = {
	createUnit: async ({ request }) => {
		const formData = await request.formData();
		const unit_id: number | null = Number(formData.get('unit_id')) || null;
		let parent_id: number | null = Number(formData.get('parent_id')) || null;
		const title = formData.get('name') || null;
		const developer = formData.get('developer') || null;
		const unit_type = formData.get('unit_type') || null;
		const unit_state = formData.get('unit_status') || null;
		const category_type = formData.get('category_type') || null;
		const offer_type = formData.get('offer_type') || null;
		const description = formData.get('description') || null;
		const location = formData.get('location') || null;
		const price = formData.get('price') || null;
		const ownership_type = formData.get('ownership_type') || null;
		const delivery_date = formData.get('delivery_date') || null;
		const completion_progress = formData.get('completion_progress') || null;
		const construction_status = formData.get('construction_status') || null;
		const bedroom_count = formData.get('bedroom_count') || null;
		const bathroom_count = formData.get('bathroom_count') || null;
		const area = formData.get('area') || null;
		const amenities = JSON.parse(formData.get('amenities') as string);
		const payment_plans = JSON.parse(formData.get('payment_plans') as string);
		const details = JSON.parse(formData.get('details') as string);
		const files = formData.getAll('media') as File[];
		const thumbnail = (formData.get('thumbnail') as unknown as number) || null;
		const is_published = formData.get('is_published') || null;

		if (parent_id === 0) parent_id = null;
		if (!title) return fail(423, { message: 'يجب الا يكون حقل الاسم فارغا' });
		if (!developer) return fail(422, { message: 'يجب الا يكون حقل المطور فارغا' });
		if (!unit_type) return fail(422, { message: 'يجب الا يكون حقل نوع الوحدة فارغا' });
		if (!construction_status) return fail(422, { message: 'يجب الا يكون حقل حالة البناء فارغا' });
		if (!category_type) return fail(422, { message: 'يجب الا يكون حقل تصنيف اوحدة فارغا' });
		if (!offer_type) return fail(422, { message: 'يجب الا يكون حقل نوع العرض فارغا' });
		if (!description) return fail(422, { message: 'يجب الا يكون الوصف فارغا' });
		if (!location) return fail(422, { message: 'يجب الا يكون حقل الموقع فارغا' });
		if (!price) return fail(422, { message: 'يجب الا يكون حقل السعر فارغا' });
		if (!ownership_type) return fail(422, { message: 'يجب الا يكون حقل نوع التملك فارغا' });
		if (!unit_state) return fail(422, { message: 'يجب الا يكون حقل حالة الوحدة فارغا' });
		if (!completion_progress) return fail(422, { message: 'يجب الا يكون حقل نسبة الإنجاز فارغا' });
		if (!delivery_date) return fail(422, { message: 'يجب الا يكون حقل تاريخ التسليم فارغا' });
		if (!bedroom_count) return fail(422, { message: 'يجب الا يكون حقل عدد غرف النوم فارغا' });
		if (!bathroom_count) return fail(422, { message: 'يجب الا يكون حقل عدد الحمامات فارغا' });
		if (!area) return fail(422, { message: 'يجب الا يكون حقل المساحة فارغا' });
		if (!amenities || (amenities as []).length === 0) return fail(422, { message: 'يجب الا يكون حقل المرافق فارغا' });
		if (!payment_plans || (payment_plans as []).length === 0)
			return fail(422, { message: 'يجب الا يكون حقل خطط الدفع فارغا' });
		if (!details) return fail(422, { message: 'يجب الا يكون حقل التفاصيل فارغا' });
		if (!thumbnail) return fail(422, { message: 'يجب الا يكون حقل الصور/الفديو فارغا' });
		if (!media || files.length < 3) return fail(422, { message: 'يجب أن يحتوي حقل الوسائط على 3 عناصر على الأقل' });

		if (isNaN(Number(area))) return fail(422, { message: 'يجب أن يكون حقل المساحة رقماً' });
		if (isNaN(Number(price))) return fail(422, { message: 'يجب أن يكون حقل السعر رقماً' });
		if (isNaN(Number(bedroom_count))) return fail(422, { message: 'يجب أن يكون حقل عدد غرف النوم رقماً' });
		if (isNaN(Number(bathroom_count))) return fail(422, { message: 'يجب أن يكون حقل عدد الحمامات رقماً' });

		try {
			// 1. Insert the main unit and return its generated ID
			const [newUnit] = await db
				.insert(units)
				.values({
					parentId: parent_id,
					type: unit_type as any,
					status: unit_state as any,
					category: category_type as any,
					completionPercentage: completion_progress as any,
					constructionStatus: construction_status as any,
					ownershipType: ownership_type as any,
					offerType: offer_type as any,
					price: Number(price),
					area: Number(area),
					bedrooms: Number(bedroom_count),
					bathrooms: Number(bathroom_count),
					isPublished: is_published ? true : false
				})
				.returning({ id: units.id });

			// 2. Insert the translation data using the new unit's ID
			await db.insert(unitTranslations).values({
				unitId: newUnit.id,
				locale: 'ar', // Change this dynamically if your form supports multiple languages
				title: title as string,
				developer: developer as string,
				description: description as string,
				locationName: location as string,
				amenities: amenities, // Drizzle handles the JSON stringification based on your schema
				details: details
			});

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

				const isMain = i === thumbnail;
				const fileType = file.type.startsWith('image/') ? 'image' : 'video';

				await db.insert(media).values({
					unitId: newUnit.id,
					url: `/uploads/${fileName}`,
					type: fileType,
					isMain: isMain,
					sortOrder: i
				});
			}
			return { success: true, message: 'تم إضافة الوحدة بنجاح' };
			// Note: You will follow a similar pattern here to loop through and insert the `media` files.
		} catch (error) {
			console.error(error);
			return fail(500, { message: 'حدث خطأ أثناء إضافة الوحدة' });
		}
	},
	deleteUnit: async ({ request }) => {
		try {
			const formData = await request.formData();
			const unitId = Number(formData.get('id'));

			if (!unitId) {
				return fail(400, { message: 'معرف الوحدة غير صالح' });
			}

			const projectMedia = await db.select({ url: media.url }).from(media).where(eq(media.unitId, unitId));

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

			await db.delete(media).where(eq(media.unitId, unitId));
			await db.delete(unitTranslations).where(eq(unitTranslations.unitId, unitId));
			await db.delete(units).where(eq(units.id, unitId));

			return { type: 'success', message: 'تم حذف المشروع بنجاح' };
		} catch (error) {
			console.error('حدث خطأ أثناء الحذف:', error);
			return fail(500, { message: 'حدث خطأ داخلي أثناء حذف المشروع' });
		}
	},
	togglePublish: async ({ request }) => {
		console.log('togglePublish request', request);
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const isPublished = formData.get('isPublished') === 'true';

		console.log('togglePublish formData', formData);
		if (!id || isNaN(id)) {
			return fail(400, { message: 'معرف المشروع غير صحيح' });
		}

		try {
			await db.update(units).set({ isPublished: isPublished }).where(eq(units.id, id));

			return { success: true };
		} catch (error) {
			console.error('خطأ أثناء تحديث حالة النشر:', error);
			return fail(500, { message: 'فشل تحديث حالة النشر في قاعدة البيانات' });
		}
	}
};
