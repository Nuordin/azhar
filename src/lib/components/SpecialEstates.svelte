<script lang="ts">
	import { _ } from 'svelte-i18n';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import i1 from '$lib/assets/tmp/1.avif';
	import i2 from '$lib/assets/tmp/2.avif';
	import i3 from '$lib/assets/tmp/3.avif';

	type projectListType = {
		id: number;
		title: string | null;
		description: string | null;
		image: string | null;
	}[];

	let { projectList }: { projectList: projectListType } = $props();

	// صور مؤقتة تتكرر عند غياب صورة المشروع
	const gallery = [i1, i2, i3];
	let items = $derived((projectList ?? []).map((p, i) => ({ ...p, image: p.image ?? gallery[i % gallery.length] })));
</script>

<div class="px-4 md:px-10 lg:px-16 mt-16" dir="rtl">
	<h1 class="text-4xl md:text-5xl font-bold text-secondary-600 text-center lg:text-start w-full mb-4">
		{$_('specialEstates.title')}
	</h1>
	<p class="text-2xl max-w-2xl mx-auto lg:mx-0 mb-8 text-center lg:text-start">{$_('specialEstates.description')}</p>

	<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#each items.slice(0, 6) as project, idx (idx)}
			<ProjectCard {project} />
		{/each}
	</div>
</div>
