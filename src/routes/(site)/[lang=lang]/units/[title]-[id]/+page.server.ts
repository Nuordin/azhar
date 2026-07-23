import { db } from '$lib/server/db';
import { units, unitTranslations, locationTranslations, media } from '$lib/server/db/schema';
import { and, asc, eq } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';
import { parseDetailParams, slugify } from '$lib/utils';
import { localizedPath } from '$lib/i18n/config';
import { getAvailableLocales } from '$lib/i18n/locales.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const LOCALE = params.lang;
	const { id, slug } = parseDetailParams(params.title, params.id);
	if (!id || isNaN(id)) throw error(404, 'الوحدة غير موجودة');

	const [row] = await db
		.select({
			unit: units,
			translation: unitTranslations,
			locationName: locationTranslations.name
		})
		.from(units)
		.leftJoin(unitTranslations, and(eq(units.id, unitTranslations.unitId), eq(unitTranslations.locale, LOCALE)))
		.leftJoin(
			locationTranslations,
			and(eq(units.locationId, locationTranslations.locationId), eq(locationTranslations.locale, LOCALE))
		)
		.where(eq(units.id, id))
		.limit(1);

	if (!row || !row.unit.isPublished) throw error(404, 'الوحدة غير موجودة');
	// لا توجد ترجمة بهذه اللغة ⇒ 404
	if (!row.translation) throw error(404, 'الوحدة غير موجودة');

	// إعادة توجيه دائمة إلى الرابط القانوني عند اختلاف المقطع النصي
	const canonicalSlug = slugify(row.translation.title);
	if (canonicalSlug && slug !== canonicalSlug) {
		throw redirect(301, localizedPath(LOCALE, 'units', canonicalSlug, id));
	}

	// اللغات التي تتوفر لها ترجمة (لبناء روابط hreflang البديلة)
	const availableCodes = new Set(getAvailableLocales().map((l) => l.code));
	const allTranslations = await db
		.select({ locale: unitTranslations.locale, title: unitTranslations.title })
		.from(unitTranslations)
		.where(eq(unitTranslations.unitId, id));
	const altLocales = allTranslations
		.filter((t) => availableCodes.has(t.locale))
		.map((t) => ({ code: t.locale, slug: slugify(t.title) }));

	const unitMedia = await db.select().from(media).where(eq(media.unitId, id)).orderBy(asc(media.sortOrder));

	// اجعل الصورة الرئيسية أولاً
	const sortedMedia = [...unitMedia].sort((a, b) => Number(b.isMain) - Number(a.isMain));

	return {
		unit: row.unit,
		translation: row.translation,
		locationName: row.locationName,
		media: sortedMedia,
		altLocales
	};
};
