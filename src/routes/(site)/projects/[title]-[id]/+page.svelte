<script lang="ts">
	import Icons from '$lib/components/Icons.svelte';
	import Sheet from '$lib/components/Sheet.svelte';
	import ContactUs from '$lib/components/ContactUs.svelte';
	import Galary from '$lib/components/Galary.svelte';
	import { cn, formatCurrency, constructionMap, ownershipTypeMap } from '$lib/utils';
	import {
		Bath,
		BedDouble,
		Building2,
		Construction,
		Grid2x2,
		Images,
		KeyRound,
		MapPin,
		ImageOff
	} from '@lucide/svelte';

	let { data } = $props();

	const project = $derived(data.project);
	const t = $derived(data.translation);

	type Amenity = { title: string; icon: string };
	type Detail = { title: string; description: string };

	const images = $derived(data.media.filter((m) => m.type === 'image').map((m) => m.url));
	const amenities = $derived((t?.amenities as Amenity[] | null) ?? []);
	const paymentPlans = $derived((t?.paymentPlans as Detail[] | null) ?? []);
	const extraDetails = $derived((t?.details as Detail[] | null) ?? []);

	const deliveryDate = $derived(
		project.deliveryDate ? new Date(project.deliveryDate).toLocaleDateString('ar-OM') : '—'
	);
	const completion = $derived(project.completionPercentage != null ? Number(project.completionPercentage) : 0);

	let showSheet = $state(false);
	let showContact = $state(false);
	let showGalary = $state(false);
	let selected = $state('');
	const openGalary = (image: string) => {
		selected = image;
		showGalary = true;
	};
</script>

<div class="w-full p-8 lg:p-16" dir="rtl">
	<div class="flex justify-between items-center gap-4">
		<div>
			<h1 class="text-2xl font-bold text-secondary-600">{t?.title ?? 'مشروع'}</h1>
			{#if project.ownershipType && ownershipTypeMap[project.ownershipType]}
				<h1 class="text-xs font-bold text-black bg-primary/60 inline px-2 pt-px rounded-full">
					{ownershipTypeMap[project.ownershipType]}
				</h1>
			{/if}
		</div>
		{#if project.startingPrice != null}
			<h1 class="text-secondary-600 text-2xl font-bold">تبدأ من {formatCurrency(project.startingPrice)}</h1>
		{/if}
	</div>

	<!-- معرض الصور -->
	{#if images.length > 0}
		<div class={cn('mt-4 grid grid-rows-2 grid-cols-2 w-full gap-4 overflow-hidden', 'lg:grid-cols-3 lg:grid-rows-1')}>
			<button
				onclick={() => openGalary(images[0])}
				class={cn(' row-span-2 col-span-2 rounded-xl shadow-lg overflow-hidden', 'lg:col-span-2')}>
				<img src={images[0]} alt={t?.title ?? ''} class="w-full h-full object-cover" />
			</button>
			<div class={cn('flex gap-4 col-span-2', 'lg:col-span-1 lg:flex lg:flex-col')}>
				{#if images[1]}
					<button onclick={() => openGalary(images[1])} class="rounded-xl shadow-lg overflow-hidden relative">
						<img src={images[1]} alt="" class="w-full h-full object-cover" />
						{#if images.length > 2}
							<div class="absolute inset-0 flex items-center justify-center bg-black/60 text-secondary-100">
								<Images size={48} />
							</div>
						{/if}
					</button>
				{/if}
				{#if images[2]}
					<button onclick={() => openGalary(images[2])} class="rounded-xl shadow-lg overflow-hidden">
						<img src={images[2]} alt="" class="w-full h-full object-cover" />
					</button>
				{/if}
			</div>
		</div>
	{:else}
		<div
			class="mt-4 w-full h-64 rounded-xl bg-secondary-200/40 flex flex-col items-center justify-center gap-2 text-secondary-400">
			<ImageOff class="w-10 h-10" />
			<span class="text-sm font-bold">لا توجد صور</span>
		</div>
	{/if}

	<!-- شريط المواصفات -->
	<div class="p-4 mt-8 border border-gray-400/20 shadow w-full h-fit rounded-xl justify-around items-center">
		<ul class="flex w-full h-full justify-between">
			<li class="flex flex-col justify-center items-center text-secondary-700">
				<Building2 class="text-secondary-500" />
				<span class="text-xs">نوع التملك</span>
				<span class="text-xs">{project.ownershipType ? ownershipTypeMap[project.ownershipType] : '—'}</span>
			</li>
			<span class="border border-gray-500/15 h-8 m-auto"></span>
			<li class="flex flex-col justify-center items-center">
				<KeyRound class="text-secondary-500" />
				<span class="text-xs">تاريخ التسليم</span><span class="text-xs">{deliveryDate}</span>
			</li>
			<span class="border border-gray-500/15 h-8 m-auto"></span>
			<li class="flex flex-col justify-center items-center">
				<Grid2x2 class="text-secondary-500" />
				<span class="text-xs">المساحة الكلية</span><span class="text-xs">{project.totalArea ?? '—'} م²</span>
			</li>
			<span class="border border-gray-500/15 h-8 m-auto"></span>
			<li class="flex flex-col justify-center items-center">
				<Construction class="text-secondary-500" />
				<span class="text-xs">حالة المشروع</span>
				<span class="text-xs">{project.constructionStatus ? constructionMap[project.constructionStatus] : '—'}</span>
			</li>
		</ul>
	</div>

	{#if t?.locationName}
		<div class="mt-4">
			<span
				class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary-100 text-sm font-bold text-secondary-600">
				<MapPin size={16} />{t.locationName}
			</span>
		</div>
	{/if}

	<!-- نسبة الإنجاز -->
	{#if project.constructionStatus !== 'ready'}
		<div class="mt-8">
			<h1 class="mb-4 text-lg text-secondary-600">نسبة إنجاز المشروع</h1>
			<div class="flex items-center gap-0 font-inter text-xs">
				{#each [0, 25, 50, 75, 100] as current (current)}
					{@render progress(completion, current)}
				{/each}
			</div>
		</div>
	{/if}

	<!-- عن المشروع -->
	{#if t?.description}
		<div class="mt-8">
			<h1 class="mb-4 text-2xl font-bold text-secondary-600">عن المشروع</h1>
			<p class="leading-8">{t.description}</p>
		</div>
	{/if}

	<!-- الخدمات والمميزات -->
	{#if amenities.length > 0}
		<div class="mt-8 w-full">
			<h1 class="text-2xl font-bold text-secondary-600 mb-8">الخدمات والمميزات</h1>
			<div class="flex flex-wrap gap-4 justify-start items-center">
				{#each amenities as amenity (amenity.title)}
					<div class="flex items-center gap-4 p-2 shadow rounded-lg">
						<Icons iconName={amenity.icon} />
						<span>{amenity.title}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- تفاصيل المشروع -->
	<div class="mt-8 w-full">
		<h1 class="mb-4 text-2xl font-bold text-secondary-600">تفاصيل المشروع</h1>
		<div class="grid grid-cols-1 gap-2 w-full">
			{#if t?.developerName}
				{@render detailRow('مطور المشروع', t.developerName)}
			{/if}
			{@render detailRow(
				'حالة المشروع',
				project.constructionStatus ? constructionMap[project.constructionStatus] : '—'
			)}
			{@render detailRow('تاريخ التسليم', deliveryDate)}
			{@render detailRow('نوع التملك', project.ownershipType ? ownershipTypeMap[project.ownershipType] : '—')}
			{#each extraDetails as d (d.title)}
				{@render detailRow(d.title, d.description)}
			{/each}
		</div>
	</div>

	<!-- خطط الدفع -->
	{#if paymentPlans.length > 0}
		<div class="mt-8 w-full">
			<h1 class="mb-4 text-2xl font-bold text-secondary-600">خطط الدفع</h1>
			<div class="grid grid-cols-1 gap-2 w-full">
				{#each paymentPlans as plan (plan.title)}
					{@render detailRow(plan.title, plan.description)}
				{/each}
			</div>
		</div>
	{/if}

	<div class="fixed bottom-0 right-0 left-0 p-4 flex gap-4 items-center justify-center bg-secondary-100 z-10">
		{#if data.units.length > 0}
			<button class="py-2 bg-primary text-secondary-100 font-bold rounded-xl grow" onclick={() => (showSheet = true)}>
				عرض الوحدات ({data.units.length})
			</button>
		{/if}
		<button
			class="py-2 text-primary border border-primary font-bold rounded-xl grow"
			onclick={() => (showContact = true)}>
			تواصل معنا
		</button>
	</div>

	<Sheet bind:isOpen={showSheet} class="pt-4">
		<div class="px-8 py-4 border-b border-secondary-600/10">
			<h2 class="text-lg font-bold text-secondary-600">وحدات المشروع</h2>
		</div>
		<div class="select-none overflow-y-scroll h-[calc(60vh-4rem)] flex flex-col gap-4 px-8 py-4">
			{#each data.units as unit (unit.id)}
				<a href="/units/{unit.title}-{unit.id}" class="block">
					{@render unitItem(unit)}
				</a>
			{/each}
		</div>
	</Sheet>

	<ContactUs bind:open={showContact} title={t?.title} />
</div>

<Galary {images} bind:open={showGalary} bind:selected />

{#snippet progress(percent: number, current: number)}
	{#if percent >= current}
		<div class="size-10 rounded-full flex items-center justify-center bg-secondary-700 text-secondary-100">
			{current}
		</div>
	{:else}
		<div class="size-10 rounded-full flex items-center justify-center bg-secondary-700/20">
			{current}
		</div>
	{/if}
	{#if current !== 100}
		{#if percent > current}
			<div class="h-2 grow bg-secondary-700"></div>
		{:else}
			<div class="h-2 grow bg-secondary-700/20"></div>
		{/if}
	{/if}
{/snippet}

{#snippet detailRow(title: string, description: string)}
	<div class="flex items-center justify-between grow border-secondary-700/10 odd:bg-secondary-200/20 rounded-2xl px-4">
		<span class="py-4 px-2">{title}</span>
		<span class="py-4 ps-4 px-2 font-bold">{description}</span>
	</div>
{/snippet}

{#snippet unitItem(unit: {
	title: string | null;
	description: string | null;
	image: string | null;
	bedrooms: number | null;
	bathrooms: number | null;
	area: number | null;
	price: number | null;
})}
	<div class="w-full h-32 rounded-2xl overflow-hidden shadow-sm border-secondary-700/10 border flex items-center">
		<div
			class="h-full w-48 shrink-0 border-secondary-700/10 border-e flex items-center justify-center bg-secondary-200/40">
			{#if unit.image}
				<img src={unit.image} alt={unit.title ?? ''} class="w-full h-full object-cover" />
			{:else}
				<ImageOff class="w-6 h-6 text-secondary-400" />
			{/if}
		</div>
		<div class="h-full w-full flex flex-col p-2 items-start justify-between">
			<span class="text-sm font-bold line-clamp-1">{unit.title}</span>
			<span class="line-clamp-2 text-xs text-secondary-500">{unit.description}</span>
			<div class="flex items-center justify-between w-full mt-1">
				<div class="flex gap-2 font-inter font-light">
					{#if (unit.bedrooms ?? 0) > 0}
						<span
							class="flex gap-1 text-xs items-center justify-center bg-secondary-700/80 text-secondary-100 px-2 py-1 rounded-md">
							<BedDouble strokeWidth={1.5} size={12} />{unit.bedrooms}
						</span>
					{/if}
					{#if (unit.bathrooms ?? 0) > 0}
						<span
							class="flex gap-1 text-xs items-center justify-center bg-secondary-700/80 text-secondary-100 px-2 py-1 rounded-md">
							<Bath strokeWidth={1.5} size={12} />{unit.bathrooms}
						</span>
					{/if}
					{#if unit.area}
						<span
							class="flex gap-1 text-xs items-center justify-center bg-secondary-700/80 text-secondary-100 px-2 py-1 rounded-md">
							{unit.area} م²
						</span>
					{/if}
				</div>
				{#if unit.price != null}
					<span class="text-xs font-bold text-primary">{formatCurrency(unit.price)}</span>
				{/if}
			</div>
		</div>
	</div>
{/snippet}
