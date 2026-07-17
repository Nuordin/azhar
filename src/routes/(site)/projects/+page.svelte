<script lang="ts">
	import { Select } from 'bits-ui';
	import { Search, ChevronDown, Check, X } from '@lucide/svelte';
	import ProjectCard from '$lib/components/ProjectCard.svelte';

	let { data } = $props();

	// خيارات الفلاتر
	const cityOptions = [
		{ value: '', label: 'كل المدن' },
		{ value: 'مسقط', label: 'مسقط' },
		{ value: 'صلالة', label: 'صلالة' },
		{ value: 'صحار', label: 'صحار' },
		{ value: 'نزوى', label: 'نزوى' },
		{ value: 'صور', label: 'صور' },
		{ value: 'قريات', label: 'قريات' },
		{ value: 'البريمي', label: 'البريمي' }
	];
	const typeOptions = [
		{ value: '', label: 'كل الأنواع' },
		{ value: 'residential', label: 'سكني' },
		{ value: 'commercial', label: 'تجاري' },
		{ value: 'mixed', label: 'مختلط' },
		{ value: 'land', label: 'أرض' }
	];
	const unitTypeOptions = [
		{ value: '', label: 'كل الوحدات' },
		{ value: 'villa', label: 'فيلا' },
		{ value: 'apartment', label: 'شقة' },
		{ value: 'townhouse', label: 'تاون هاوس' },
		{ value: 'shop', label: 'محل تجاري' },
		{ value: 'land', label: 'أرض' }
	];
	const statusOptions = [
		{ value: '', label: 'كل الحالات' },
		{ value: 'off_plan', label: 'على المخطط' },
		{ value: 'under_construction', label: 'قيد الإنشاء' },
		{ value: 'ready', label: 'جاهز' }
	];
	const priceOptions = [
		{ value: '', label: 'كل الأسعار' },
		{ value: '0-40000', label: 'أقل من 40 ألف' },
		{ value: '40000-80000', label: '40 - 80 ألف' },
		{ value: '80000-120000', label: '80 - 120 ألف' },
		{ value: '120000-', label: 'أكثر من 120 ألف' }
	];
	const sortOptions = [
		{ value: '', label: 'الأحدث' },
		{ value: 'price_asc', label: 'السعر: الأقل أولاً' },
		{ value: 'price_desc', label: 'السعر: الأعلى أولاً' },
		{ value: 'delivery', label: 'أقرب تسليم' }
	];

	// حالة الفلاتر
	let search = $state('');
	let city = $state('');
	let type = $state('');
	let unitType = $state('');
	let status = $state('');
	let priceRange = $state('');
	let sort = $state('');

	let activeCount = $derived(
		[city, type, unitType, status, priceRange].filter(Boolean).length + (search.trim() ? 1 : 0)
	);

	function resetFilters() {
		search = '';
		city = '';
		type = '';
		unitType = '';
		status = '';
		priceRange = '';
		sort = '';
	}

	let filtered = $derived.by(() => {
		let list = data.projects.filter((p) => {
			const q = search.trim();
			if (q && !`${p.title} ${p.developer} ${p.city}`.includes(q)) return false;
			if (city && p.city !== city) return false;
			if (type && p.type !== type) return false;
			if (unitType && p.unitType !== unitType) return false;
			if (status && p.constructionStatus !== status) return false;
			if (priceRange) {
				const [min, max] = priceRange.split('-').map(Number);
				if (p.startingPrice < min) return false;
				if (max && p.startingPrice > max) return false;
			}
			return true;
		});
		if (sort === 'price_asc') list = [...list].sort((a, b) => a.startingPrice - b.startingPrice);
		else if (sort === 'price_desc') list = [...list].sort((a, b) => b.startingPrice - a.startingPrice);
		else if (sort === 'delivery') list = [...list].sort((a, b) => a.deliveryYear - b.deliveryYear);
		return list;
	});
</script>

<div dir="rtl" class="font-aljazeera min-h-screen px-4 md:px-10 lg:px-16 py-10">
	<!-- الترويسة -->
	<header class="max-w-3xl mx-auto text-center mb-10">
		<h1 class="text-4xl md:text-5xl font-black text-secondary-600 mb-3">مشاريعنا العقارية</h1>
		<p class="text-lg text-secondary-500">
			استكشف مجموعتنا من المشاريع السكنية والتجارية في مختلف مدن السلطنة، وصفِّها حسب احتياجك.
		</p>
	</header>

	<!-- شريط الفلاتر -->
	<div class="sticky top-4 z-20 bg-white/80 backdrop-blur border border-secondary-600/15 shadow-md rounded-2xl p-4 md:p-5 mb-8">
		<div class="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
			<!-- البحث -->
			<div class="relative lg:col-span-2">
				<Search class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
				<input
					type="text"
					bind:value={search}
					placeholder="ابحث باسم المشروع أو المطوّر أو المدينة..."
					class="w-full h-11 rounded-xl border border-secondary-600/20 bg-secondary-100/60 pr-10 pl-4 text-secondary-700 placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary/40" />
			</div>

			{@render filterSelect(cityOptions, city, (v) => (city = v))}
			{@render filterSelect(typeOptions, type, (v) => (type = v))}
			{@render filterSelect(unitTypeOptions, unitType, (v) => (unitType = v))}
			{@render filterSelect(statusOptions, status, (v) => (status = v))}
			{@render filterSelect(priceOptions, priceRange, (v) => (priceRange = v))}
			{@render filterSelect(sortOptions, sort, (v) => (sort = v))}
		</div>

		<div class="flex items-center justify-between mt-4 pt-3 border-t border-secondary-600/10">
			<p class="text-sm text-secondary-500">
				عدد النتائج: <span class="font-bold text-secondary-700">{filtered.length}</span>
			</p>
			{#if activeCount > 0}
				<button
					onclick={resetFilters}
					class="inline-flex items-center gap-1 text-sm font-bold text-primary hover:text-primary-400 transition-colors">
					<X class="w-4 h-4" /> مسح الفلاتر ({activeCount})
				</button>
			{/if}
		</div>
	</div>

	<!-- شبكة المشاريع -->
	{#if filtered.length > 0}
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
			{#each filtered as project (project.id)}
				<ProjectCard {project} />
			{/each}
		</div>
	{:else}
		<div class="max-w-md mx-auto text-center py-20">
			<div class="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary-200/60 flex items-center justify-center">
				<Search class="w-7 h-7 text-secondary-500" />
			</div>
			<h3 class="text-xl font-bold text-secondary-600 mb-2">لا توجد مشاريع مطابقة</h3>
			<p class="text-secondary-500 mb-4">جرّب تعديل الفلاتر أو مسحها لعرض جميع المشاريع.</p>
			<button
				onclick={resetFilters}
				class="inline-flex items-center gap-1 px-5 py-2 rounded-xl bg-primary text-secondary-100 font-bold hover:bg-primary-400 transition-colors">
				عرض كل المشاريع
			</button>
		</div>
	{/if}
</div>

<!-- فلتر منسدل باستخدام bits-ui -->
{#snippet filterSelect(options: { value: string; label: string }[], value: string, onSelect: (v: string) => void)}
	{@const current = options.find((o) => o.value === value) ?? options[0]}
	<Select.Root type="single" {value} onValueChange={(v) => onSelect(v ?? '')}>
		<Select.Trigger
			class="flex h-11 w-full items-center justify-between rounded-xl border border-secondary-600/20 bg-secondary-100/60 px-4 text-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary/40 data-[state=open]:ring-2 data-[state=open]:ring-primary/40">
			<span class="truncate {value ? 'font-bold text-secondary-700' : 'text-secondary-400'}">{current.label}</span>
			<ChevronDown class="w-4 h-4 text-secondary-400 shrink-0" />
		</Select.Trigger>
		<Select.Portal>
			<Select.Content
				sideOffset={6}
				class="z-50 max-h-64 w-[var(--bits-select-anchor-width)] overflow-y-auto rounded-xl border border-secondary-600/15 bg-white p-1 shadow-xl">
				<Select.Viewport>
					{#each options as option (option.value)}
						<Select.Item
							value={option.value}
							label={option.label}
							class="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm text-secondary-700 outline-none data-highlighted:bg-secondary-100 data-[state=checked]:font-bold">
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
