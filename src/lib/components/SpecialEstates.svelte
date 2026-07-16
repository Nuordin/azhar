<script lang="ts">
	import { _ } from 'svelte-i18n';
	type projectListType = {
		id: number;
		title: string | null;
		description: string | null;
		image: string | null;
	}[];

	let { projectList } = $props();
</script>

<div class="px-8 mt-16">
	<h1 class="text-4xl font-bold text-secondary-600 text-center w-full mb-4">
		{$_('specialEstates.title')}
	</h1>
	<p class="text-2xl max-w-2xl mb-8 text-center">{$_('specialEstates.description')}</p>
	<div class="flex flex-col gap-4">
		{#each projectList as project, idx (idx)}
			<a
				href="/projects/{project.title}-{project.id}"
				class="relative bg-secondary-100 w-full aspect-3/2 border border-gray-700/20 shadow-md rounded-2xl overflow-hidden">
				<img src={project.image} alt="" class="w-full h-full object-cover" />
				<div
					class="absolute inset-0 px-4 py-4 flex flex-col justify-end items-start bg-linear-to-t from-secondary-700/80 to-100%">
					<h1 class="text-2xl font-bold text-secondary-100">{project.title}</h1>
					<p class="line-clamp-2 font-bold text-sm text-secondary-100">{project.description}</p>
				</div>
			</a>
		{/each}
	</div>
</div>
