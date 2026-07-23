import { db } from '$lib/server/db';
import {
	projects,
	projectTranslations,
	units,
	unitTranslations,
	locationTranslations,
	media
} from '$lib/server/db/schema';
import { and, asc, eq } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';
import { parseDetailParams, slugify } from '$lib/utils';
import { localizedPath } from '$lib/i18n/config';
import { getAvailableLocales } from '$lib/i18n/locales.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const LOCALE = params.lang;
	const { id, slug } = parseDetailParams(params.title, params.id);
	if (!id || isNaN(id)) throw error(404, 'المشروع غير موجود');

	const [row] = await db
		.select({ project: projects, translation: projectTranslations, locationName: locationTranslations.name })
		.from(projects)
		.leftJoin(
			projectTranslations,
			and(eq(projects.id, projectTranslations.projectId), eq(projectTranslations.locale, LOCALE))
		)
		.leftJoin(
			locationTranslations,
			and(eq(projects.locationId, locationTranslations.locationId), eq(locationTranslations.locale, LOCALE))
		)
		.where(eq(projects.id, id))
		.limit(1);

	if (!row || !row.project.isPublished) throw error(404, 'المشروع غير موجود');
	// لا توجد ترجمة بهذه اللغة ⇒ 404 (مثلاً /en قبل إضافة الترجمة الإنجليزية)
	if (!row.translation) throw error(404, 'المشروع غير موجود');

	// إعادة توجيه دائمة إلى الرابط القانوني عند اختلاف المقطع النصي
	const canonicalSlug = slugify(row.translation.title);
	if (canonicalSlug && slug !== canonicalSlug) {
		throw redirect(301, localizedPath(LOCALE, 'projects', canonicalSlug, id));
	}

	// اللغات التي تتوفر لها ترجمة (لبناء روابط hreflang البديلة)
	const availableCodes = new Set(getAvailableLocales().map((l) => l.code));
	const allTranslations = await db
		.select({ locale: projectTranslations.locale, title: projectTranslations.title })
		.from(projectTranslations)
		.where(eq(projectTranslations.projectId, id));
	const altLocales = allTranslations
		.filter((t) => availableCodes.has(t.locale))
		.map((t) => ({ code: t.locale, slug: slugify(t.title) }));

	const projectMedia = await db.select().from(media).where(eq(media.projectId, id)).orderBy(asc(media.sortOrder));
	const sortedMedia = [...projectMedia].sort((a, b) => Number(b.isMain) - Number(a.isMain));

	// وحدات هذا المشروع (المنشورة) لعرضها في القائمة السفلية
	const unitRows = await db
		.select({
			id: units.id,
			title: unitTranslations.title,
			bedrooms: units.bedrooms,
			bathrooms: units.bathrooms,
			area: units.area,
			price: units.price,
			offerType: units.offerType,
			description: unitTranslations.description,
			image: media.url
		})
		.from(units)
		.leftJoin(unitTranslations, and(eq(units.id, unitTranslations.unitId), eq(unitTranslations.locale, LOCALE)))
		.leftJoin(media, and(eq(units.id, media.unitId), eq(media.isMain, true)))
		.where(and(eq(units.projectId, id), eq(units.isPublished, true)))
		.orderBy(asc(units.price));

	return {
		project: row.project,
		translation: row.translation,
		locationName: row.locationName,
		media: sortedMedia,
		units: unitRows,
		altLocales
	};
};
