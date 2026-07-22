<script lang="ts">
	import { page } from '$app/state';
	import { _ } from 'svelte-i18n';
	import Icons from '$lib/components/Icons.svelte';
	import ContactUs from '$lib/components/ContactUs.svelte';
	import BookViewing from '$lib/components/BookViewing.svelte';
	import CompletionProgress from '$lib/components/CompletionProgress.svelte';
	import Galary from '$lib/components/Galary.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { SITE_NAME, DEFAULT_DESCRIPTION } from '$lib/config';
	import { cn, formatCurrency, slugify, truncateForMeta } from '$lib/utils';
	import { DEFAULT_LOCALE, localizedPath, sectionListPath, localeHome } from '$lib/i18n/config';
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

	const unit = $derived(data.unit);
	const t = $derived(data.translation);

	type Amenity = { title: string; icon: string };
	type Detail = { title: string; description: string };

	// وسائط الصور فقط للمعرض
	const images = $derived(data.media.filter((m) => m.type === 'image').map((m) => m.url));

	// بيانات محركات البحث
	const lang = $derived(page.params.lang ?? DEFAULT_LOCALE);
	const seoTitle = $derived(
		t?.title ? `${t.title} — ${t.locationName ?? ''}`.trim().replace(/—$/, '').trim() : SITE_NAME
	);
	const seoDescription = $derived(t?.description ? truncateForMeta(t.description) : DEFAULT_DESCRIPTION);
	const canonical = $derived(
		new URL(localizedPath(lang, 'units', slugify(t?.title ?? ''), unit.id), page.url.origin).href
	);
	const ogImage = $derived(images.length > 0 ? new URL(images[0], page.url.origin).href : undefined);
	const alternates = $derived([
		...data.altLocales.map((a) => ({
			hreflang: a.code,
			href: new URL(localizedPath(a.code, 'units', a.slug, unit.id), page.url.origin).href
		})),
		{
			hreflang: 'x-default',
			href: new URL(
				localizedPath(
					DEFAULT_LOCALE,
					'units',
					data.altLocales.find((a) => a.code === DEFAULT_LOCALE)?.slug ?? slugify(t?.title ?? ''),
					unit.id
				),
				page.url.origin
			).href
		}
	]);
	const jsonLd = $derived([
		{
			'@context': 'https://schema.org',
			'@type': 'RealEstateListing',
			name: t?.title ?? SITE_NAME,
			...(t?.description ? { description: truncateForMeta(t.description) } : {}),
			url: canonical,
			...(images.length > 0 ? { image: images.slice(0, 5).map((url) => new URL(url, page.url.origin).href) } : {}),
			...(unit.price
				? {
						offers: {
							'@type': 'Offer',
							price: unit.price,
							priceCurrency: 'OMR',
							availability: unit.status === 'available' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut'
						}
					}
				: {})
		},
		{
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: [
				{
					'@type': 'ListItem',
					position: 1,
					name: $_('common.breadcrumb_home'),
					item: new URL(localeHome(lang), page.url.origin).href
				},
				{
					'@type': 'ListItem',
					position: 2,
					name: $_('unit_detail.breadcrumb'),
					item: new URL(sectionListPath(lang, 'units'), page.url.origin).href
				},
				{ '@type': 'ListItem', position: 3, name: t?.title ?? '', item: canonical }
			]
		}
	]);
	const amenities = $derived((t?.amenities as Amenity[] | null) ?? []);
	const paymentPlans = $derived((t?.paymentPlans as Detail[] | null) ?? []);
	const extraDetails = $derived((t?.details as Detail[] | null) ?? []);

	const deliveryDate = $derived(unit.deliveryDate ? new Date(unit.deliveryDate).toLocaleDateString(lang) : '—');
	const completion = $derived(unit.completionPercentage != null ? Number(unit.completionPercentage) : 0);

	let showContact = $state(false);
	let showBooking = $state(false);
	let showGalary = $state(false);
	let selected = $state('');
	const openGalary = (image: string) => {
		selected = image;
		showGalary = true;
	};
</script>

<Seo
	title={seoTitle}
	description={seoDescription}
	{canonical}
	{ogImage}
	{jsonLd}
	{alternates}
	ogLocale={`${lang}_OM`} />

<div class="w-full px-4 py-8 md:px-16 lg:px-32">
	<div class="flex justify-between items-center gap-4">
		<div>
			<h1 class="text-2xl font-bold text-secondary-600">{t?.title ?? $_('unit_detail.fallback_title')}</h1>
			{#if unit.ownershipType}
				<h1 class="text-xs font-bold text-black bg-primary/60 inline px-2 pt-px rounded-full">
					{$_(`enums.ownership.${unit.ownershipType}`)}
				</h1>
			{/if}
		</div>
		<div class="text-start">
			{#if unit.offerType}
				<span class="block text-xs text-secondary-500">{$_(`enums.offer.${unit.offerType}`)}</span>
			{/if}
			<h1 class="text-secondary-600 text-2xl font-bold">{formatCurrency(unit.price, lang)}</h1>
		</div>
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
						<img
							src={images[1]}
							alt={t?.title ?? ''}
							loading="lazy"
							decoding="async"
							class="w-full h-full object-cover" />
						{#if images.length > 2}
							<div class="absolute inset-0 flex items-center justify-center bg-black/60 text-secondary-100">
								<Images size={48} />
							</div>
						{/if}
					</button>
				{/if}
				{#if images[2]}
					<button onclick={() => openGalary(images[2])} class="flex-1 min-h-0 rounded-xl shadow-lg overflow-hidden">
						<img
							src={images[2]}
							alt={t?.title ?? ''}
							loading="lazy"
							decoding="async"
							class="w-full h-full object-cover" />
					</button>
				{/if}
			</div>
		</div>
	{:else}
		<div
			class="mt-4 w-full h-64 rounded-xl bg-secondary-200/40 flex flex-col items-center justify-center gap-2 text-secondary-400">
			<ImageOff class="w-10 h-10" />
			<span class="text-sm font-bold">{$_('common.no_images')}</span>
		</div>
	{/if}

	<!-- شريط المواصفات -->
	<div class="p-4 mt-8 border border-gray-400/20 shadow w-full h-fit rounded-xl justify-around items-center">
		<ul class="flex w-full h-full justify-between">
			<li class="flex flex-col justify-center items-center text-secondary-700">
				<Building2 class="text-secondary-500" />
				<span class="text-xs">{$_('unit_detail.unit_type')}</span>
				<span class="text-xs">{unit.type ? $_(`enums.unit_type.${unit.type}`) : '—'}</span>
			</li>
			<span class="border border-gray-500/15 h-8 m-auto"></span>
			<li class="flex flex-col justify-center items-center">
				<KeyRound class="text-secondary-500" />
				<span class="text-xs">{$_('unit_detail.delivery_date')}</span><span class="text-xs">{deliveryDate}</span>
			</li>
			<span class="border border-gray-500/15 h-8 m-auto"></span>
			<li class="flex flex-col justify-center items-center">
				<Grid2x2 class="text-secondary-500" />
				<span class="text-xs">{$_('unit_detail.area')}</span><span class="text-xs"
					>{unit.area ?? '—'} {$_('common.area_unit')}</span>
			</li>
			<span class="border border-gray-500/15 h-8 m-auto"></span>
			<li class="flex flex-col justify-center items-center">
				<Construction class="text-secondary-500" />
				<span class="text-xs">{$_('unit_detail.construction_status')}</span>
				<span class="text-xs"
					>{unit.constructionStatus ? $_(`enums.construction.${unit.constructionStatus}`) : '—'}</span>
			</li>
		</ul>
	</div>

	<!-- غرف / حمامات / موقع -->
	<div class="mt-4 flex flex-wrap gap-3 text-sm font-bold text-secondary-600">
		{#if (unit.bedrooms ?? 0) > 0}
			<span class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary-100">
				<BedDouble size={16} />{$_('common.bedrooms', { values: { count: unit.bedrooms } })}
			</span>
		{/if}
		{#if (unit.bathrooms ?? 0) > 0}
			<span class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary-100">
				<Bath size={16} />{$_('common.bathrooms', { values: { count: unit.bathrooms } })}
			</span>
		{/if}
		{#if t?.locationName}
			<span class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary-100">
				<MapPin size={16} />{t.locationName}
			</span>
		{/if}
	</div>

	<!-- نسبة الإنجاز -->
	{#if unit.constructionStatus !== 'ready'}
		<div class="mt-8">
			<h1 class="mb-4 text-lg text-secondary-600">{$_('unit_detail.completion_title')}</h1>
			<CompletionProgress value={completion} />
		</div>
	{/if}

	<!-- الوصف -->
	{#if t?.description}
		<div class="mt-8">
			<h1 class="mb-4 text-2xl font-bold text-secondary-600">{$_('unit_detail.about')}</h1>
			<p class="leading-8">{t.description}</p>
		</div>
	{/if}

	<!-- الخدمات والمميزات -->
	{#if amenities.length > 0}
		<div class="mt-8 w-full">
			<h1 class="text-2xl font-bold text-secondary-600 mb-8">{$_('common.amenities')}</h1>
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

	<!-- تفاصيل الوحدة -->
	<div class="mt-8 w-full">
		<h1 class="mb-4 text-2xl font-bold text-secondary-600">{$_('unit_detail.details')}</h1>
		<div class="grid grid-cols-1 gap-2 w-full">
			{#if t?.developer}
				{@render detailRow($_('unit_detail.developer'), t.developer)}
			{/if}
			{@render detailRow(
				$_('unit_detail.construction_status'),
				unit.constructionStatus ? $_(`enums.construction.${unit.constructionStatus}`) : '—'
			)}
			{@render detailRow($_('unit_detail.delivery_date'), deliveryDate)}
			{@render detailRow(
				$_('unit_detail.ownership_type'),
				unit.ownershipType ? $_(`enums.ownership.${unit.ownershipType}`) : '—'
			)}
			{@render detailRow($_('unit_detail.unit_status'), unit.status ? $_(`enums.unit_status.${unit.status}`) : '—')}
			{#each extraDetails as d (d.title)}
				{@render detailRow(d.title, d.description)}
			{/each}
		</div>
	</div>

	<!-- خطط الدفع -->
	{#if paymentPlans.length > 0}
		<div class="mt-8 w-full">
			<h1 class="mb-4 text-2xl font-bold text-secondary-600">{$_('common.payment_plans')}</h1>
			<div class="grid grid-cols-1 gap-2 w-full">
				{#each paymentPlans as plan (plan.title)}
					{@render detailRow(plan.title, plan.description)}
				{/each}
			</div>
		</div>
	{/if}

	<!-- شريط التواصل السفلي -->
	<div
		class="fixed bottom-0 right-0 left-0 p-4 md:px-16 lg:px-32 flex gap-4 items-center justify-center bg-secondary-100 z-10">
		<button
			class="py-2 text-primary border border-primary font-bold rounded-xl grow"
			onclick={() => (showContact = true)}>
			{$_('common.contact_us')}
		</button>
		<button class="py-2 bg-primary text-secondary-100 font-bold rounded-xl grow" onclick={() => (showBooking = true)}>
			{$_('unit_detail.book_viewing')}
		</button>
	</div>

	<ContactUs bind:open={showContact} title={t?.title} />
	<BookViewing bind:open={showBooking} title={t?.title} />
</div>

<Galary {images} bind:open={showGalary} bind:selected />

{#snippet detailRow(title: string, description: string)}
	<div class="flex items-center justify-between grow border-secondary-700/10 odd:bg-secondary-200/20 rounded-2xl px-4">
		<span class="py-4 px-2">{title}</span>
		<span class="py-4 ps-4 px-2 font-bold">{description}</span>
	</div>
{/snippet}
