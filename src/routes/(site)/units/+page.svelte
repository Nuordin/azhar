<script lang="ts">
	import { Select } from 'bits-ui';
	import { Search, ChevronDown, Check, X, SlidersHorizontal } from '@lucide/svelte';
	import { fly, fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import UnitCard from '$lib/components/UnitCard.svelte';
	import Seo from '$lib/components/Seo.svelte';

	let { data } = $props();

	const canonical = $derived(new URL('/units', page.url.origin).href);

	// خيارات الفلاتر — نستخدم "all" بدلاً من قيمة فارغة لأن bits-ui يعتبر السلسلة الفارغة "بدون اختيار"
	const categoryOptions = [
		{ value: 'all', label: 'كل التصنيفات' },
		{ value: 'residential', label: 'سكني' },
		{ value: 'commercial', label: 'تجاري' },
		{ value: 'mixed', label: 'سكني/تجاري' },
		{ value: 'land', label: 'أراضي' },
		{ value: 'industrial', label: 'صناعي' }
	];
	const typeOptions = [
		{ value: 'all', label: 'كل الوحدات' },
		{ value: 'apartment', label: 'شقة' },
		{ value: 'standalone_villa', label: 'فيلا مستقلة' },
		{ value: 'twin_villa', label: 'توين فيلا' },
		{ value: 'townhouse', label: 'تاون هاوس' },
		{ value: 'penthouse', label: 'بنتهاوس' },
		{ value: 'duplex', label: 'دوبلكس' },
		{ value: 'studio', label: 'استوديو' },
		{ value: 'office', label: 'مكتب' },
		{ value: 'retail', label: 'محل تجاري' },
		{ value: 'showroom', label: 'معرض' },
		{ value: 'whole_building', label: 'مبنى كامل' },
		{ value: 'residential_land', label: 'أرض سكنية' },
		{ value: 'commercial_land', label: 'أرض تجارية' },
		{ value: 'residential_commercial_land', label: 'أرض سكنية وتجارية' },
		{ value: 'industrial_land', label: 'أرض صناعية' },
		{ value: 'agricultural_land', label: 'أرض زراعية' },
		{ value: 'chalet', label: 'شاليه' },
		{ value: 'istiraha', label: 'استراحة' },
		{ value: 'hotel_apartment', label: 'شقة فندقية' },
		{ value: 'warehouse', label: 'مستودع' },
		{ value: 'labour_camp', label: 'سكن عمال' }
	];
	const offerOptions = [
		{ value: 'all', label: 'بيع وإيجار' },
		{ value: 'sale', label: 'للبيع' },
		{ value: 'rent', label: 'للإيجار' }
	];
	const statusOptions = [
		{ value: 'all', label: 'كل الحالات' },
		{ value: 'off_plan', label: 'على المخطط' },
		{ value: 'under_construction', label: 'قيد الإنشاء' },
		{ value: 'ready', label: 'جاهز' }
	];
	const priceOptions = [
		{ value: 'all', label: 'كل الأسعار' },
		{ value: '0-40000', label: 'أقل من 40 ألف' },
		{ value: '40000-80000', label: '40 - 80 ألف' },
		{ value: '80000-120000', label: '80 - 120 ألف' },
		{ value: '120000-', label: 'أكثر من 120 ألف' }
	];
	const sortOptions = [
		{ value: 'all', label: 'الأحدث' },
		{ value: 'price_asc', label: 'السعر: الأقل أولاً' },
		{ value: 'price_desc', label: 'السعر: الأعلى أولاً' },
		{ value: 'delivery', label: 'أقرب تسليم' }
	];

	// حالة عرض لوحة الفلاتر
	let showFilters = $state(false);

	// القيم الحالية مأخوذة من التصفية المُعادة من الخادم
	let f = $derived(data.filters);
	let activeCount = $derived([f.category, f.type, f.status, f.offer, f.price].filter((v) => v && v !== 'all').length);

	// تحديث معامل في عنوان URL وإعادة التحميل من الخادم
	function setParam(key: string, value: string) {
		const params = new SvelteURLSearchParams(page.url.searchParams);
		if (!value || value === 'all') params.delete(key);
		else params.set(key, value);
		params.delete('page'); // العودة للصفحة الأولى عند تغيير الفلاتر
		goto(`?${params.toString()}`, { keepFocus: true, noScroll: true });
	}

	function resetFilters() {
		goto('?', { keepFocus: true, noScroll: true });
	}
</script>

<Seo
	title="الوحدات العقارية للبيع والإيجار في سلطنة عمان"
	description="تصفح الشقق والفلل والأراضي والوحدات التجارية المتاحة للبيع أو الإيجار في سلطنة عمان، مع التصفية حسب النوع والسعر."
	{canonical} />

<div dir="rtl" class="font-aljazeera min-h-screen px-4 md:px-16 lg:px-32 pt-10 pb-28">
	<!-- الترويسة -->
	<header class="max-w-3xl mx-auto text-center mb-10">
		<h1 class="text-4xl md:text-5xl font-black text-secondary-600 mb-3">الوحدات العقارية</h1>
		<p class="text-lg text-secondary-500">
			استكشف الوحدات السكنية والتجارية المتاحة للبيع والإيجار في مختلف مدن السلطنة، وصفِّها حسب احتياجك.
		</p>
	</header>

	<!-- زر الفلاتر العائم أسفل الشاشة -->
	<button
		onclick={() => (showFilters = true)}
		class="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 inline-flex items-center gap-2 h-12 px-6 rounded-full bg-primary text-white font-black shadow-lg shadow-primary/30 hover:bg-primary-400 hover:shadow-xl transition-all">
		<SlidersHorizontal class="w-5 h-5" />
		تصفية الوحدات
		{#if activeCount > 0}
			<span
				class="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-white text-primary text-[11px]">
				{activeCount}
			</span>
		{/if}
	</button>

	<!-- لوحة الفلاتر الجانبية -->
	{#if showFilters}
		<button
			transition:fade={{ duration: 200 }}
			onclick={() => (showFilters = false)}
			class="fixed inset-0 z-40 bg-secondary-700/40 backdrop-blur-sm"
			aria-label="إغلاق الفلاتر"></button>

		<aside
			transition:fly={{ x: 420, duration: 300 }}
			dir="rtl"
			class="fixed inset-y-0 inset-s-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-2xl font-aljazeera">
			<div class="flex items-center justify-between p-4 border-b border-secondary-600/10">
				<h2 class="text-lg font-black text-secondary-700 inline-flex items-center gap-2">
					<SlidersHorizontal class="w-5 h-5 text-primary" /> تصفية الوحدات
				</h2>
				<button
					onclick={() => (showFilters = false)}
					class="p-2 rounded-lg text-secondary-500 hover:bg-secondary-100 transition-colors"
					aria-label="إغلاق">
					<X class="w-5 h-5" />
				</button>
			</div>

			<div class="flex-1 overflow-y-auto p-4 space-y-4">
				{@render field('التصنيف', categoryOptions, f.category, (v) => setParam('category', v))}
				{@render field('نوع الوحدة', typeOptions, f.type, (v) => setParam('type', v))}
				{@render field('نوع العرض', offerOptions, f.offer, (v) => setParam('offer', v))}
				{@render field('حالة البناء', statusOptions, f.status, (v) => setParam('status', v))}
				{@render field('السعر', priceOptions, f.price, (v) => setParam('price', v))}
				{@render field('الترتيب', sortOptions, f.sort, (v) => setParam('sort', v))}
			</div>

			<div class="p-4 border-t border-secondary-600/10 flex items-center gap-3">
				<button
					onclick={resetFilters}
					class="flex-1 h-11 rounded-xl border border-secondary-600/20 font-bold text-secondary-600 hover:bg-secondary-100 transition-colors">
					مسح الكل
				</button>
				<button
					onclick={() => (showFilters = false)}
					class="flex-[2] h-11 rounded-xl bg-primary text-white font-black hover:bg-primary-400 transition-colors">
					عرض {data.pagination.totalCount} نتيجة
				</button>
			</div>
		</aside>
	{/if}

	<!-- شبكة الوحدات -->
	{#if data.units.length > 0}
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
			{#each data.units as unit (unit.id)}
				<UnitCard {unit} />
			{/each}
		</div>
	{:else}
		<div class="max-w-md mx-auto text-center py-20">
			<div class="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary-200/60 flex items-center justify-center">
				<Search class="w-7 h-7 text-secondary-500" />
			</div>
			<h3 class="text-xl font-bold text-secondary-600 mb-2">لا توجد وحدات مطابقة</h3>
			<p class="text-secondary-500 mb-4">جرّب تعديل الفلاتر أو مسحها لعرض جميع الوحدات.</p>
			<button
				onclick={resetFilters}
				class="inline-flex items-center gap-1 px-5 py-2 rounded-xl bg-primary text-secondary-100 font-bold hover:bg-primary-400 transition-colors">
				عرض كل الوحدات
			</button>
		</div>
	{/if}
</div>

<!-- حقل فلتر مع عنوان داخل اللوحة الجانبية -->
{#snippet field(
	label: string,
	options: { value: string; label: string }[],
	value: string,
	onSelect: (v: string) => void
)}
	<div class="space-y-1.5">
		<span class="block text-sm font-bold text-secondary-600">{label}</span>
		{@render filterSelect(options, value, onSelect)}
	</div>
{/snippet}

<!-- فلتر منسدل باستخدام bits-ui -->
{#snippet filterSelect(options: { value: string; label: string }[], value: string, onSelect: (v: string) => void)}
	{@const current = options.find((o) => o.value === value) ?? options[0]}
	<Select.Root type="single" {value} allowDeselect={false} onValueChange={(v) => onSelect(v || 'all')}>
		<Select.Trigger
			class="flex h-11 w-full items-center justify-between rounded-xl border border-secondary-600/20 bg-secondary-100/60 px-4 text-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary/40 data-[state=open]:ring-2 data-[state=open]:ring-primary/40">
			<span class="truncate {value !== 'all' ? 'font-bold text-secondary-700' : 'text-secondary-400'}"
				>{current.label}</span>
			<ChevronDown class="w-4 h-4 text-secondary-400 shrink-0" />
		</Select.Trigger>
		<Select.Portal>
			<Select.Content
				sideOffset={6}
				class="z-[60] max-h-64 w-[var(--bits-select-anchor-width)] overflow-y-auto rounded-xl border border-secondary-600/15 bg-white p-1 shadow-xl">
				<Select.Viewport>
					{#each options as option (option.value)}
						<Select.Item
							value={option.value}
							label={option.label}
							class="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm text-secondary-700 outline-none data-[highlighted]:bg-secondary-100 data-[selected]:bg-secondary-100/70 data-[selected]:font-bold">
							{#snippet children({ selected })}
								<span>{option.label}</span>
								{#if selected}
									<Check class="w-4 h-4 text-primary" />
								{/if}
							{/snippet}
						</Select.Item>
					{/each}
				</Select.Viewport>
			</Select.Content>
		</Select.Portal>
	</Select.Root>
{/snippet}
