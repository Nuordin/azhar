import { db } from '$lib/server/db';
import { media, projects, projectTranslations } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const topProjects = await db
		.select({
			id: projects.id,
			title: projectTranslations.title,
			description: projectTranslations.description,
			image: media.url
		})
		.from(projects)
		.leftJoin(projectTranslations, eq(projects.id, projectTranslations.projectId))
		.leftJoin(media, eq(projects.id, media.projectId));

	console.log(topProjects);
	return { topProjects };
};
