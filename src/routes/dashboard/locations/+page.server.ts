import { eq, and, asc, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { locations, locationTranslations } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

const LOCATION_TYPES = ['governorate', 'wilayat', 'city', 'district'] as const;
type LocationType = (typeof LOCATION_TYPES)[number];

export const load: PageServerLoad = async ({ url }) => {
	const limit = 20;
	const page = Number(url.searchParams.get('page')) || 1;
	const offset = (page - 1) * limit;

	try {
		const totalCountResult = await db.select({ count: sql<number>`count(*)` }).from(locations);
		const totalCount = totalCountResult[0].count;
		const totalPages = Math.ceil(totalCount / limit);

		// جدول المواقع مع الاسم العربي (بترجمة ar)
		const locationList = await db
			.select({
				id: locations.id,
				parentId: locations.parentId,
				type: locations.type,
				hasDedicatedPage: locations.hasDedicatedPage,
				isPublished: locations.isPublished,
				name: locationTranslations.name
			})
			.from(locations)
			.leftJoin(
				locationTranslations,
				and(eq(locations.id, locationTranslations.locationId), eq(locationTranslations.locale, 'ar'))
			)
			.orderBy(asc(locations.type), asc(locationTranslations.name))
			.limit(limit)
			.offset(offset);

		// كل المواقع لاختيار الموقع الأب (بدون ترقيم صفحات)
		const allLocations = await db
			.select({ id: locations.id, name: locationTranslations.name, type: locations.type })
			.from(locations)
			.leftJoin(
				locationTranslations,
				and(eq(locations.id, locationTranslations.locationId), eq(locationTranslations.locale, 'ar'))
			)
			.orderBy(asc(locationTranslations.name));

		return {
			locations: locationList,
			allLocations,
			pagination: { totalCount, totalPages, currentPage: page, limit }
		};
	} catch (error) {
		console.error(error);
		return {
			locations: [],
			allLocations: [],
			pagination: { totalCount: 0, totalPages: 0, currentPage: page, limit },
			error: 'Failed to load locations'
		};
	}
};

function parseForm(formData: FormData) {
	const type = formData.get('type') as LocationType;
	const parentIdRaw = formData.get('parentId') as string;
	const parentId = parentIdRaw && parentIdRaw !== 'none' ? Number(parentIdRaw) : null;
	const hasDedicatedPage = formData.get('hasDedicatedPage') === 'true';
	const isPublished = formData.get('isPublished') !== 'false';
	const name = (formData.get('name') as string)?.trim();
	return { type, parentId, hasDedicatedPage, isPublished, name };
}

export const actions: Actions = {
	createLocation: async ({ request }) => {
		const formData = await request.formData();
		const { type, parentId, hasDedicatedPage, isPublished, name } = parseForm(formData);

		if (!type || !LOCATION_TYPES.includes(type)) return fail(422, { message: 'يجب اختيار نوع الموقع' });
		if (!name) return fail(422, { message: 'يجب الا يكون حقل الاسم فارغا' });

		try {
			const [newLocation] = await db
				.insert(locations)
				.values({ parentId, type, hasDedicatedPage, isPublished })
				.returning({ id: locations.id });

			await db.insert(locationTranslations).values({
				locationId: newLocation.id,
				locale: 'ar', // إضافة الإنجليزية لاحقاً
				name
			});

			return { success: true, message: 'تمت إضافة الموقع بنجاح' };
		} catch (error) {
			console.error('Error creating location:', error);
			return fail(500, { message: 'حدث خطأ أثناء إضافة الموقع' });
		}
	},

	updateLocation: async ({ request }) => {
		const formData = await request.formData();
		const locationId = Number(formData.get('locationId'));
		if (!locationId) return fail(400, { message: 'المعرف غير صالح' });

		const { type, parentId, hasDedicatedPage, isPublished, name } = parseForm(formData);
		if (!type || !LOCATION_TYPES.includes(type)) return fail(422, { message: 'يجب اختيار نوع الموقع' });
		if (!name) return fail(422, { message: 'يجب الا يكون حقل الاسم فارغا' });
		// منع جعل الموقع أباً لنفسه
		if (parentId === locationId) return fail(422, { message: 'لا يمكن أن يكون الموقع تابعاً لنفسه' });

		try {
			await db
				.update(locations)
				.set({ parentId, type, hasDedicatedPage, isPublished, updatedAt: new Date() })
				.where(eq(locations.id, locationId));

			await db
				.update(locationTranslations)
				.set({ name })
				.where(and(eq(locationTranslations.locationId, locationId), eq(locationTranslations.locale, 'ar')));

			return { type: 'success', message: 'تم تحديث الموقع بنجاح' };
		} catch (error) {
			console.error('Error updating location:', error);
			return fail(500, { message: 'حدث خطأ داخلي أثناء تحديث الموقع' });
		}
	},

	deleteLocation: async ({ request }) => {
		const formData = await request.formData();
		const locationId = Number(formData.get('id'));
		if (!locationId) return fail(400, { message: 'معرف الموقع غير صالح' });

		try {
			// ترجمات الموقع تُحذف تلقائياً (cascade)؛ ومراجع المشاريع/الوحدات تُضبط على null
			await db.delete(locations).where(eq(locations.id, locationId));
			return { type: 'success', message: 'تم حذف الموقع بنجاح' };
		} catch (error) {
			console.error('Error deleting location:', error);
			return fail(500, { message: 'حدث خطأ داخلي أثناء حذف الموقع' });
		}
	},

	togglePublish: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const isPublished = formData.get('isPublished') === 'true';
		if (!id || isNaN(id)) return fail(400, { message: 'معرف الموقع غير صحيح' });

		try {
			await db.update(locations).set({ isPublished }).where(eq(locations.id, id));
			return { success: true };
		} catch (error) {
			console.error('خطأ أثناء تحديث حالة النشر:', error);
			return fail(500, { message: 'فشل تحديث حالة النشر في قاعدة البيانات' });
		}
	}
};
