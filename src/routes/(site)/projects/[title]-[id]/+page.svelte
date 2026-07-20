<script lang="ts">
	import { page } from '$app/state';
	import Icons from '$lib/components/Icons.svelte';
	import Sheet from '$lib/components/Sheet.svelte';
	import ContactUs from '$lib/components/ContactUs.svelte';
	import CompletionProgress from '$lib/components/CompletionProgress.svelte';
	import Galary from '$lib/components/Galary.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { SITE_NAME, DEFAULT_DESCRIPTION } from '$lib/config';
	import { cn, formatCurrency, constructionMap, ownershipTypeMap, offerMap, slugify, truncateForMeta } from '$lib/utils';
	import {
		Bath,
		BedDouble,
		Building2,
		ChevronLeft,
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

	// بيانات محركات البحث
	const seoTitle = $derived(t?.title ? `${t.title} — ${t.locationName ?? ''}`.trim().replace(/—$/, '').trim() : SITE_NAME);
	const seoDescription = $derived(t?.description ? truncateForMeta(t.description) : DEFAULT_DESCRIPTION);
	const canonical = $derived(
		new URL(`/projects/${encodeURIComponent(slugify(t?.title ?? ''))}-${project.id}`, page.url.origin).href
	);
	const ogImage = $derived(images.length > 0 ? new URL(images[0], page.url.origin).href : undefined);
	const jsonLd = $derived([
		{
			'@context': 'https://schema.org',
			'@type': 'RealEstateListing',
			name: t?.title ?? SITE_NAME,
			...(t?.description ? { description: truncateForMeta(t.description) } : {}),
			url: canonical,
			...(images.length > 0
				? { image: images.slice(0, 5).map((url) => new URL(url, page.url.origin).href) }
				: {}),
			...(project.startingPrice
				? { offers: { '@type': 'Offer', price: project.startingPrice, priceCurrency: 'OMR' } }
				: {})
		},
		{
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: [
				{ '@type': 'ListItem', position: 1, name: 'الرئيسية', item: new URL('/', page.url.origin).href },
				{ '@type': 'ListItem', position: 2, name: 'المشاريع', item: new URL('/projects', page.url.origin).href },
				{ '@type': 'ListItem', position: 3, name: t?.title ?? '', item: canonical }
			]
		}
	]);
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

<Seo title={seoTitle} description={seoDescription} {canonical} {ogImage} {jsonLd} />

<div class="w-full px-4 py-8 md:px-16 lg:px-32" dir="rtl">
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
				class={cn(' row-span-2 col-span-2 rounded-xl shadow-lg overflow-hidden', 'lg:col-span-2 lg:row-span-1')}>
				<img src={images[0]} alt={t?.title ?? ''} class="w-full h-full object-cover" />
			</button>
			<div class={cn('flex gap-4 col-span-2', 'lg:col-span-1 lg:flex lg:flex-col')}>
				{#if images[1]}
					<button
						onclick={() => openGalary(images[1])}
						class="flex-1 min-h-0 rounded-xl shadow-lg overflow-hidden relative">
						<img src={images[1]} alt={t?.title ?? ''} loading="lazy" decoding="async" class="w-full h-full object-cover" />
						{#if images.length > 2}
							<div class="absolute inset-0 flex items-center justify-center bg-black/60 text-secondary-100">
								<Images size={48} />
							</div>
						{/if}
					</button>
				{/if}
				{#if images[2]}
					<button onclick={() => openGalary(images[2])} class="flex-1 min-h-0 rounded-xl shadow-lg overflow-hidden">
						<img src={images[2]} alt={t?.title ?? ''} loading="lazy" decoding="async" class="w-full h-full object-cover" />
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
			<CompletionProgress value={completion} />
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

	<div
		class="fixed bottom-0 right-0 left-0 p-4 md:px-16 lg:px-32 flex gap-4 items-center justify-center bg-secondary-100 z-10">
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
		<div class="flex items-center gap-2 px-6 py-4 border-b border-secondary-600/10 md:px-8">
			<h2 class="text-lg font-bold text-secondary-600">وحدات المشروع</h2>
			<span class="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-black text-primary">{data.units.length}</span>
		</div>
		<div class="select-none overflow-y-auto h-[calc(60vh-4rem)] flex flex-col gap-3 px-4 py-4 md:px-6">
			{#each data.units as unit (unit.id)}
				<a href="/units/{slugify(unit.title ?? '')}-{unit.id}" class="block">
					{@render unitItem(unit)}
				</a>
			{/each}
		</div>
	</Sheet>

	<ContactUs bind:open={showContact} title={t?.title} />
</div>

<Galary {images} bind:open={showGalary} bind:selected />

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
	offerType?: 'rent' | 'sale' | null;
})}
	<div
		class="group relative flex gap-3 rounded-2xl bg-white p-2.5 ring-1 ring-secondary-700/10 shadow-sm
		transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:ring-secondary-700/20">
		<!-- الصورة -->
		<div class="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-secondary-200/40 sm:w-32">
			{#if unit.image}
				<img
					src={unit.image}
					alt={unit.title ?? ''}
					loading="lazy"
					class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
			{:else}
				<div class="flex h-full w-full items-center justify-center">
					<ImageOff class="h-6 w-6 text-secondary-400" />
				</div>
			{/if}
			{#if unit.offerType && offerMap[unit.offerType]}
				<span
					class="absolute top-1.5 start-1.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-black text-white shadow">
					{offerMap[unit.offerType]}
				</span>
			{/if}
		</div>

		<!-- المحتوى -->
		<div class="flex min-w-0 flex-1 flex-col">
			<h3 class="line-clamp-1 text-sm font-black text-secondary-700">{unit.title}</h3>
			{#if unit.description}
				<p class="mt-0.5 line-clamp-2 text-xs leading-5 text-secondary-500">{unit.description}</p>
			{/if}

			<!-- الشارات -->
			<div class="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
				{#if (unit.bedrooms ?? 0) > 0}
					<span
						class="inline-flex items-center gap-1 rounded-lg bg-secondary-100 px-2 py-1 text-[11px] font-bold text-secondary-600 ring-1 ring-secondary-600/10">
						<BedDouble class="h-3.5 w-3.5 text-secondary-400" />{unit.bedrooms}
					</span>
				{/if}
				{#if (unit.bathrooms ?? 0) > 0}
					<span
						class="inline-flex items-center gap-1 rounded-lg bg-secondary-100 px-2 py-1 text-[11px] font-bold text-secondary-600 ring-1 ring-secondary-600/10">
						<Bath class="h-3.5 w-3.5 text-secondary-400" />{unit.bathrooms}
					</span>
				{/if}
				{#if unit.area}
					<span
						class="inline-flex items-center gap-1 rounded-lg bg-secondary-100 px-2 py-1 text-[11px] font-bold text-secondary-600 ring-1 ring-secondary-600/10">
						<Grid2x2 class="h-3.5 w-3.5 text-secondary-400" />{unit.area}<span class="font-inter">م²</span>
					</span>
				{/if}
			</div>
		</div>

		<!-- السعر -->
		<div class="flex shrink-0 flex-col items-end justify-between border-s border-dashed border-secondary-600/15 ps-3">
			{#if unit.price != null}
				<div class="text-end leading-tight">
					<span class="block text-[10px] font-bold text-secondary-400">
						{unit.offerType === 'rent' ? 'الإيجار' : 'يبدأ من'}
					</span>
					<span class="text-sm font-black text-secondary-700">{formatCurrency(unit.price)}</span>
				</div>
			{:else}
				<span class="text-[11px] font-bold text-secondary-400">للسعر تواصل</span>
			{/if}
			<span
				class="inline-flex items-center gap-0.5 text-[11px] font-black text-primary
				transition-all duration-300 group-hover:gap-1.5">
				التفاصيل <ChevronLeft class="h-3.5 w-3.5" />
			</span>
		</div>
	</div>
{/snippet}
