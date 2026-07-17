<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { ChevronLeft } from '@lucide/svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';

	type projectListType = {
		id: number;
		title: string | null;
		description: string | null;
		image: string | null;
	}[];

	let { projectList }: { projectList: projectListType } = $props();
</script>

<div class="px-4 md:px-10 lg:px-16 mt-16" dir="rtl">
	<h1 class="text-4xl font-bold text-secondary-600 text-center w-full mb-4">
		{$_('specialEstates.title')}
	</h1>
	<p class="text-2xl max-w-2xl mx-auto mb-8 text-center">{$_('specialEstates.description')}</p>

	<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
		{#each projectList.slice(0, 6) as project (project.id)}
			<ProjectCard {project} />
		{/each}
	</div>

	<div class="flex justify-center mt-10">
		<a
			href="/projects"
			class="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-primary text-white font-black text-lg
			shadow-md shadow-primary/25 hover:bg-primary-400 hover:gap-3.5 transition-all duration-300">
			تصفح جميع المشاريع <ChevronLeft class="w-5 h-5" />
		</a>
	</div>
</div>
