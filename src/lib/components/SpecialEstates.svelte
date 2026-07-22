<script lang="ts">
	import { _ } from 'svelte-i18n';
	import ProjectCard from '$lib/components/ProjectCard.svelte';

	type CardProject = {
		id: number;
		title: string | null;
		description?: string | null;
		image?: string | null;
		developer?: string | null;
		city?: string | null;
		constructionStatus?: 'off_plan' | 'under_construction' | 'ready' | null;
		completion?: number | null;
		startingPrice?: number | null;
		deliveryYear?: number | null;
		featured?: boolean;
	};

	let { projectList = [] }: { projectList?: CardProject[] } = $props();
</script>

{#if projectList.length > 0}
	<div class="px-4 md:px-16 lg:px-32 mt-16">
		<h1 class="text-4xl md:text-5xl font-bold text-secondary-600 text-center lg:text-start w-full mb-4">
			{$_('specialEstates.title')}
		</h1>
		<p class="text-2xl max-w-2xl mx-auto lg:mx-0 mb-8 text-center lg:text-start">
			{$_('specialEstates.description')}
		</p>

		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each projectList.slice(0, 6) as project (project.id)}
				<ProjectCard {project} />
			{/each}
		</div>
	</div>
{/if}
