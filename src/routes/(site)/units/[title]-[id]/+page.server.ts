import { db } from '$lib/server/db';
import { units, unitTranslations, media } from '$lib/server/db/schema';
import { and, asc, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const LOCALE = 'ar';

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	if (!id || isNaN(id)) throw error(404, 'الوحدة غير موجودة');

	const [row] = await db
		.select({
			unit: units,
			translation: unitTranslations
		})
		.from(units)
		.leftJoin(unitTranslations, and(eq(units.id, unitTranslations.unitId), eq(unitTranslations.locale, LOCALE)))
		.where(eq(units.id, id))
		.limit(1);

	if (!row || !row.unit.isPublished) throw error(404, 'الوحدة غير موجودة');

	const unitMedia = await db
		.select()
		.from(media)
		.where(eq(media.unitId, id))
		.orderBy(asc(media.sortOrder));

	// اجعل الصورة الرئيسية أولاً
	const sortedMedia = [...unitMedia].sort((a, b) => Number(b.isMain) - Number(a.isMain));

	return {
		unit: row.unit,
		translation: row.translation,
		media: sortedMedia
	};
};
