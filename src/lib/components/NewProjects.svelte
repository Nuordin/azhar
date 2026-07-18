<script lang="ts">
	import { Bath, BedDouble, ChevronLeft, MapPin, RulerDimensionLine } from '@lucide/svelte';
	import { _ } from 'svelte-i18n';
	let projects: Project[] = [
		{
			id: '01',
			name: 'شقق المارينا',
			location: 'مسقط, السيب',
			realestateType: 'سكني',
			unitType: 'شقة',
			price: 65000,
			bedrooms: 4,
			bathrooms: 3,
			area: 74,
			image: 'none'
		},
		{
			id: '02',
			name: 'شقق المنامة',
			location: 'مسقط, الخوض',
			realestateType: 'تجاري',
			unitType: 'شقة',
			price: 45000,
			bedrooms: 3,
			bathrooms: 2,
			area: 30,
			image: 'none'
		},
		{
			id: '03',
			name: 'مبنى التجار',
			location: 'مدينة السلطان هيثم',
			realestateType: 'تجاري | سكني',
			unitType: 'مكتب',
			price: 66000,
			bedrooms: 3,
			bathrooms: 2,
			area: 44,
			image: 'none'
		}
	];
	type Project = {
		id: string;
		name: string;
		realestateType: string;
		unitType: string;
		price: number;
		location: string;
		bedrooms: number;
		bathrooms: number;
		area: number;
		image: string;
	};
</script>

<div class="px-8 mt-16">
	<h1 class="text-4xl font-bold text-secondary-600 text-center w-full mb-4">
		{$_('new_projects.title')}
	</h1>
	<p class="text-2xl max-w-2xl mb-8 text-center">{$_('new_projects.description')}</p>
	<div class="grid grid-cols-1 gap-8 justify-items-center">
		{#each projects as item (item.id)}
			{@render project(item)}
		{/each}
	</div>
</div>

{#snippet project(project: Project)}
	<div class="w-sm border border-gray-700/20 shadow-md p-4 rounded-3xl">
		<div
			class="relative w-full aspect-3/2 rounded-3xl border-stone-600/30 border flex items-center justify-center text-xl">
			<span>Project {project.id}</span>
			<span class="absolute top-2 right-2 text-sm bg-secondary-200/70 px-2 py-px rounded-full"
				>{project.realestateType}</span>
		</div>
		<div class="mt-4">
			<h1 class="text-2xl font-bold">{project.name}</h1>
			<h1 class="flex gap-2"><MapPin strokeWidth={2} size={20} />{project.location}</h1>
		</div>
		<div class="flex gap-4 mt-4 font-inter font-medium text-sm text-secondary-700/80">
			<span class="flex gap-2">{project.bedrooms}<BedDouble strokeWidth={2} size={20} /></span>
			<span class="flex gap-2">{project.bathrooms}<Bath strokeWidth={2} size={20} /></span>
			<!-- <span class="flex gap-2" -->
			<!-- ><RulerDimensionLine strokeWidth={1.5} size={20} />{project.area}</span> -->
			<span><span>M<sup class="inset-e-0 m-0">2</sup></span> {project.area} </span>
		</div>
		<div class="flex gap-2 font-bold mt-12 justify-between items-center">
			<span class="text-secondary-500 text-2xl font-bold font-inter"
				>{project.price} <span class="font-aljazeera-thik font-bold">ريال</span></span>
			<span class="bg-secondary-500 text-secondary-100 rounded-full p-2"
				><ChevronLeft strokeWidth={2} /></span>
		</div>
	</div>
{/snippet}
