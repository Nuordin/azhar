import { db } from '$lib/server/db';
import { units, unitTranslations, media } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function GET({ params }) {
	const unitId = Number(params.id);

	if (!unitId) {
		return Response.json({ error: 'Invalid ID' }, { status: 400 });
	}

	try {
		const result = await db
			.select()
			.from(units)
			.leftJoin(unitTranslations, eq(units.id, unitTranslations.unitId))
			.where(eq(units.id, unitId))
			.limit(1);

		if (!result || result.length === 0) {
			return Response.json({ error: 'Unit not found' }, { status: 404 });
		}

		const unitMedia = await db.select().from(media).where(eq(media.unitId, unitId));

		return Response.json({
			unit: result[0].units,
			translations: result[0].unit_translations,
			media: unitMedia
		});
	} catch (error) {
		console.error('Error fetching unit:', error);
		return Response.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
