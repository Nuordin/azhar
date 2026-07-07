import { db } from '$lib/server/db';
import { projects, projectTranslations, media } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function GET({ params }) {
	const projectId = Number(params.id);

	if (!projectId) {
		return Response.json({ error: 'Invalid ID' }, { status: 400 });
	}

	try {
		const result = await db
			.select()
			.from(projects)
			.leftJoin(projectTranslations, eq(projects.id, projectTranslations.projectId))
			.where(eq(projects.id, projectId))
			.limit(1);

		if (!result || result.length === 0) {
			return Response.json({ error: 'Project not found' }, { status: 404 });
		}

		const projectMedia = await db.select().from(media).where(eq(media.projectId, projectId));

		return Response.json({
			project: result[0].projects,
			translations: result[0].project_translations,
			media: projectMedia
		});
	} catch (error) {
		console.error('Error fetching project:', error);
		return Response.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
