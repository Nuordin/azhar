<script lang="ts">
	import { MapPin, BedDouble, Bath, Grid2x2, CalendarDays, ChevronLeft, Building2, ImageOff } from '@lucide/svelte';
	import { _ } from 'svelte-i18n';
	import { page } from '$app/state';
	import { formatCurrency, slugify } from '$lib/utils';
	import { localizedPath, DEFAULT_LOCALE } from '$lib/i18n/config';

	type CardUnit = {
		id: number;
		title: string | null;
		description?: string | null;
		image?: string | null;
		developer?: string | null;
		city?: string | null;
		category?: string | null;
		type?: string | null;
		offerType?: 'rent' | 'sale' | null;
		constructionStatus?: 'off_plan' | 'under_construction' | 'ready' | null;
		completionPercentage?: string | number | null;
		price?: number | null;
		bedrooms?: number | null;
		bathrooms?: number | null;
		area?: number | null;
		deliveryDate?: number | Date | null;
	};

	let { unit }: { unit: CardUnit } = $props();

	// أنماط شارة حالة البناء (النص يأتي من ملف الترجمة enums.construction)
	const statusStyle: Record<string, { dot: string; classes: string }> = {
		off_plan: { dot: 'bg-secondary-400', classes: 'bg-white/90 text-secondary-600' },
		under_construction: { dot: 'bg-primary', classes: 'bg-white/90 text-primary-500' },
		ready: { dot: 'bg-green-500', classes: 'bg-white/90 text-green-700' }
	};

	const lang = $derived(page.params.lang ?? DEFAULT_LOCALE);
	let status = $derived(unit.constructionStatus ? statusStyle[unit.constructionStatus] : null);
	let completion = $derived(unit.completionPercentage != null ? Number(unit.completionPercentage) : null);
	let deliveryYear = $derived(unit.deliveryDate ? new Date(unit.deliveryDate).getFullYear() : null);
</script>

<a
	href={localizedPath(lang, 'units', slugify(unit.title ?? ''), unit.id)}
	class="group flex flex-col rounded-3xl bg-white ring-1 ring-secondary-700/10 shadow-sm
	hover:shadow-2xl hover:shadow-secondary-700/20 hover:ring-secondary-700/15 hover:-translate-y-1.5
	transition-all duration-300 overflow-hidden">
	<!-- الصورة بإطار داخلي -->
	<div class="relative m-2.5 mb-0 rounded-2xl overflow-hidden aspect-4/3 bg-secondary-200/40">
		{#if unit.image}
			<img
				src={unit.image}
				alt={unit.title ?? ''}
				loading="lazy"
				class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
		{:else}
			<div class="w-full h-full flex flex-col items-center justify-center gap-2 text-secondary-400">
				<ImageOff class="w-8 h-8" />
				<span class="text-xs font-bold">{$_('common.no_image')}</span>
			</div>
		{/if}
		<div class="absolute inset-0 bg-linear-to-t from-secondary-700/80 via-secondary-700/10 to-transparent"></div>

		<!-- شارات أعلى الصورة -->
		<div class="absolute top-3 inset-x-3 flex items-start justify-between gap-2">
			{#if status}
				<span
					class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black backdrop-blur-sm shadow-sm {status.classes}">
					<span class="relative flex w-2 h-2">
						{#if unit.constructionStatus === 'under_construction'}
							<span class="absolute inline-flex h-full w-full rounded-full {status.dot} opacity-60 animate-ping"></span>
						{/if}
						<span class="relative inline-flex w-2 h-2 rounded-full {status.dot}"></span>
					</span>
					{$_(`enums.construction.${unit.constructionStatus}`)}
				</span>
			{:else}
				<span></span>
			{/if}
			{#if unit.offerType}
				<span
					class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-black bg-primary text-white shadow-sm">
					{$_(`enums.offer.${unit.offerType}`)}
				</span>
			{/if}
		</div>

		<!-- العنوان والموقع فوق الصورة -->
		<div class="absolute bottom-0 inset-x-0 p-4 text-white">
			<h3 class="text-xl font-black leading-snug drop-shadow-md line-clamp-1">{unit.title}</h3>
			<div class="flex items-center gap-3 mt-1 text-[13px] font-bold text-white/85">
				{#if unit.city}
					<span class="inline-flex items-center gap-1"><MapPin class="w-3.5 h-3.5" />{unit.city}</span>
				{/if}
				{#if unit.developer}
					<span class="inline-flex items-center gap-1 line-clamp-1"
						><Building2 class="w-3.5 h-3.5 shrink-0" />{unit.developer}</span>
				{/if}
			</div>
		</div>
	</div>

	<!-- جسم البطاقة -->
	<div class="flex flex-col flex-1 gap-3.5 p-4 pt-3.5">
		{#if unit.description}
			<p class="text-[13px] leading-6 text-secondary-500 line-clamp-2">{unit.description}</p>
		{/if}

		<div class="flex flex-wrap gap-1.5 text-[11px] font-bold text-secondary-600">
			{#if unit.category}
				<span class="px-2.5 py-1 rounded-full bg-secondary-100 ring-1 ring-secondary-600/10"
					>{$_(`enums.category.${unit.category}`)}</span>
			{/if}
			{#if unit.type}
				<span class="px-2.5 py-1 rounded-full bg-secondary-100 ring-1 ring-secondary-600/10"
					>{$_(`enums.unit_type.${unit.type}`)}</span>
			{/if}
			{#if (unit.bedrooms ?? 0) > 0}
				<span
					class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-100 ring-1 ring-secondary-600/10">
					<BedDouble class="w-3.5 h-3.5" />{$_('common.bedrooms', { values: { count: unit.bedrooms } })}
				</span>
			{/if}
			{#if (unit.bathrooms ?? 0) > 0}
				<span
					class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-100 ring-1 ring-secondary-600/10">
					<Bath class="w-3.5 h-3.5" />{$_('common.bathrooms', { values: { count: unit.bathrooms } })}
				</span>
			{/if}
			{#if unit.area}
				<span
					class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-100 ring-1 ring-secondary-600/10">
					<Grid2x2 class="w-3.5 h-3.5" />{$_('common.area', { values: { area: unit.area } })}
				</span>
			{/if}
			{#if deliveryYear}
				<span
					class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-100 ring-1 ring-secondary-600/10">
					<CalendarDays class="w-3.5 h-3.5" />{$_('common.delivery', { values: { year: deliveryYear } })}
				</span>
			{/if}
		</div>

		{#if completion != null && unit.constructionStatus !== 'ready'}
			<div>
				<div class="flex items-center justify-between text-[11px] font-bold text-secondary-500 mb-1.5">
					<span>{$_('common.progress')}</span>
					<span class="text-secondary-700">{completion}%</span>
				</div>
				<div class="h-1.5 w-full rounded-full bg-secondary-200/70 overflow-hidden">
					<div
						class="h-full rounded-full bg-linear-to-l from-primary to-primary-200 transition-all duration-500"
						style="width: {completion}%">
					</div>
				</div>
			</div>
		{/if}

		<!-- التذييل: السعر + زر التفاصيل -->
		<div class="flex items-center justify-between mt-auto pt-3 border-t border-dashed border-secondary-600/15">
			{#if unit.price != null}
				<div class="leading-none">
					<span class="block text-[10px] font-bold text-secondary-400 mb-1">
						{unit.offerType === 'rent' ? $_('common.rent_label') : $_('common.starts_from')}
					</span>
					<span class="text-xl font-black text-secondary-700">{formatCurrency(unit.price, lang)}</span>
				</div>
			{:else}
				<span class="text-[13px] font-bold text-secondary-400">{$_('common.contact_for_price')}</span>
			{/if}
			<span
				class="inline-flex items-center gap-1 text-[13px] font-black text-primary
				group-hover:gap-2.5 transition-all duration-300">
				{$_('common.view_details')} <ChevronLeft class="w-4 h-4" />
			</span>
		</div>
	</div>
</a>
