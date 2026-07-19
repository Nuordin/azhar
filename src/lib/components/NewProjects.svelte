<script lang="ts">
	import { _ } from 'svelte-i18n';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import i1 from '$lib/assets/tmp/1.avif';
	import i2 from '$lib/assets/tmp/2.avif';
	import i3 from '$lib/assets/tmp/3.avif';

	const projects = [
		{
			id: 1,
			title: 'شقق المارينا',
			city: 'مسقط، السيب',
			type: 'residential',
			unitType: 'apartment',
			constructionStatus: 'under_construction' as const,
			startingPrice: 65000,
			bedrooms: 4,
			deliveryYear: 2026,
			image: i1
		},
		{
			id: 2,
			title: 'شقق المنامة',
			city: 'مسقط، الخوض',
			type: 'commercial',
			unitType: 'apartment',
			constructionStatus: 'off_plan' as const,
			startingPrice: 45000,
			bedrooms: 3,
			deliveryYear: 2027,
			image: i2
		},
		{
			id: 3,
			title: 'مبنى التجار',
			city: 'مدينة السلطان هيثم',
			type: 'mixed',
			unitType: 'shop',
			constructionStatus: 'ready' as const,
			startingPrice: 66000,
			bedrooms: 3,
			deliveryYear: 2025,
			image: i3
		}
	];
</script>

<div class="px-4 md:px-10 lg:px-16 mt-16" dir="rtl">
	<h1 class="text-4xl md:text-5xl font-bold text-secondary-600 text-center lg:text-start w-full mb-4">
		{$_('new_projects.title')}
	</h1>
	<p class="text-2xl max-w-2xl mx-auto lg:mx-0 mb-8 text-center lg:text-start">{$_('new_projects.description')}</p>
	<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#each projects as project (project.id)}
			<ProjectCard {project} />
		{/each}
	</div>
</div>
