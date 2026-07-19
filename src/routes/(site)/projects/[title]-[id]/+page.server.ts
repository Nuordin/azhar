import { db } from '$lib/server/db';
import { projects, projectTranslations, units, unitTranslations, media } from '$lib/server/db/schema';
import { and, asc, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const LOCALE = 'ar';

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	if (!id || isNaN(id)) throw error(404, 'المشروع غير موجود');

	const [row] = await db
		.select({ project: projects, translation: projectTranslations })
		.from(projects)
		.leftJoin(
			projectTranslations,
			and(eq(projects.id, projectTranslations.projectId), eq(projectTranslations.locale, LOCALE))
		)
		.where(eq(projects.id, id))
		.limit(1);

	if (!row || !row.project.isPublished) throw error(404, 'المشروع غير موجود');

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
		media: sortedMedia,
		units: unitRows
	};
};
