import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const projectId = params.id;
	const projectTitle = params.title;

	console.log(projectId, projectTitle);
};
