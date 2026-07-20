<script lang="ts">
	import { MapPin, BedDouble, CalendarDays, Star, ChevronLeft, Building2, ImageOff } from '@lucide/svelte';
	import { slugify } from '$lib/utils';

	type CardProject = {
		id: number;
		title: string | null;
		description?: string | null;
		image?: string | null;
		developer?: string | null;
		city?: string | null;
		type?: string | null;
		unitType?: string | null;
		constructionStatus?: 'off_plan' | 'under_construction' | 'ready' | null;
		completion?: number | null;
		startingPrice?: number | null;
		bedrooms?: number | null;
		deliveryYear?: number | null;
		featured?: boolean;
	};

	let { project }: { project: CardProject } = $props();

	const typeMap: Record<string, string> = {
		residential: 'سكني',
		commercial: 'تجاري',
		mixed: 'مختلط',
		land: 'أرض'
	};
	const unitTypeMap: Record<string, string> = {
		villa: 'فيلا',
		apartment: 'شقة',
		townhouse: 'تاون هاوس',
		land: 'أرض',
		shop: 'محل تجاري'
	};
	const statusMap: Record<string, { label: string; dot: string; classes: string }> = {
		off_plan: { label: 'على المخطط', dot: 'bg-secondary-400', classes: 'bg-white/90 text-secondary-600' },
		under_construction: { label: 'قيد الإنشاء', dot: 'bg-primary', classes: 'bg-white/90 text-primary-500' },
		ready: { label: 'جاهز للتسليم', dot: 'bg-green-500', classes: 'bg-white/90 text-green-700' }
	};

	const formatPrice = (amount: number) =>
		new Intl.NumberFormat('ar-OM', { maximumFractionDigits: 0 }).format(amount);

	let status = $derived(project.constructionStatus ? statusMap[project.constructionStatus] : null);
</script>

<a
	href="/projects/{slugify(project.title ?? '')}-{project.id}"
	class="group flex flex-col rounded-3xl bg-white ring-1 ring-secondary-700/10 shadow-sm
	hover:shadow-2xl hover:shadow-secondary-700/20 hover:ring-secondary-700/15 hover:-translate-y-1.5
	transition-all duration-300 overflow-hidden">
	<!-- الصورة بإطار داخلي -->
	<div class="relative m-2.5 mb-0 rounded-2xl overflow-hidden aspect-4/3 bg-secondary-200/40">
		{#if project.image}
			<img
				src={project.image}
				alt={project.title ?? ''}
				loading="lazy"
				class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
		{:else}
			<div class="w-full h-full flex flex-col items-center justify-center gap-2 text-secondary-400">
				<ImageOff class="w-8 h-8" />
				<span class="text-xs font-bold">لا توجد صورة</span>
			</div>
		{/if}
		<div class="absolute inset-0 bg-linear-to-t from-secondary-700/80 via-secondary-700/10 to-transparent"></div>

		<!-- شارات أعلى الصورة -->
		<div class="absolute top-3 inset-x-3 flex items-start justify-between gap-2">
			{#if status}
				<span
					class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black backdrop-blur-sm shadow-sm {status.classes}">
					<span class="relative flex w-2 h-2">
						{#if project.constructionStatus === 'under_construction'}
							<span class="absolute inline-flex h-full w-full rounded-full {status.dot} opacity-60 animate-ping"></span>
						{/if}
						<span class="relative inline-flex w-2 h-2 rounded-full {status.dot}"></span>
					</span>
					{status.label}
				</span>
			{:else}
				<span></span>
			{/if}
			{#if project.featured}
				<span
					class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-black bg-primary text-white shadow-sm">
					<Star class="w-3 h-3 fill-current" /> مميّز
				</span>
			{/if}
		</div>

		<!-- العنوان والموقع فوق الصورة -->
		<div class="absolute bottom-0 inset-x-0 p-4 text-white">
			<h3 class="text-xl font-black leading-snug drop-shadow-md line-clamp-1">{project.title}</h3>
			<div class="flex items-center gap-3 mt-1 text-[13px] font-bold text-white/85">
				{#if project.city}
					<span class="inline-flex items-center gap-1"><MapPin class="w-3.5 h-3.5" />{project.city}</span>
				{/if}
				{#if project.developer}
					<span class="inline-flex items-center gap-1 line-clamp-1"><Building2 class="w-3.5 h-3.5 shrink-0" />{project.developer}</span>
				{/if}
			</div>
		</div>
	</div>

	<!-- جسم البطاقة -->
	<div class="flex flex-col flex-1 gap-3.5 p-4 pt-3.5">
		{#if project.description}
			<p class="text-[13px] leading-6 text-secondary-500 line-clamp-2">{project.description}</p>
		{/if}

		{#if project.type || project.unitType || (project.bedrooms ?? 0) > 0 || project.deliveryYear}
			<div class="flex flex-wrap gap-1.5 text-[11px] font-bold text-secondary-600">
				{#if project.type && typeMap[project.type]}
					<span class="px-2.5 py-1 rounded-full bg-secondary-100 ring-1 ring-secondary-600/10">{typeMap[project.type]}</span>
				{/if}
				{#if project.unitType && unitTypeMap[project.unitType]}
					<span class="px-2.5 py-1 rounded-full bg-secondary-100 ring-1 ring-secondary-600/10">{unitTypeMap[project.unitType]}</span>
				{/if}
				{#if (project.bedrooms ?? 0) > 0}
					<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-100 ring-1 ring-secondary-600/10">
						<BedDouble class="w-3.5 h-3.5" />{project.bedrooms} غرف
					</span>
				{/if}
				{#if project.deliveryYear}
					<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-100 ring-1 ring-secondary-600/10">
						<CalendarDays class="w-3.5 h-3.5" />تسليم {project.deliveryYear}
					</span>
				{/if}
			</div>
		{/if}

		{#if project.completion != null && project.constructionStatus !== 'ready'}
			<div>
				<div class="flex items-center justify-between text-[11px] font-bold text-secondary-500 mb-1.5">
					<span>نسبة الإنجاز</span>
					<span class="text-secondary-700">{project.completion}%</span>
				</div>
				<div class="h-1.5 w-full rounded-full bg-secondary-200/70 overflow-hidden">
					<div
						class="h-full rounded-full bg-linear-to-l from-primary to-primary-200 transition-all duration-500"
						style="width: {project.completion}%">
					</div>
				</div>
			</div>
		{/if}

		<!-- التذييل: السعر + زر التفاصيل -->
		<div class="flex items-center justify-between mt-auto pt-3 border-t border-dashed border-secondary-600/15">
			{#if project.startingPrice != null}
				<div class="leading-none">
					<span class="block text-[10px] font-bold text-secondary-400 mb-1">يبدأ من</span>
					<span class="text-xl font-black text-secondary-700">
						{formatPrice(project.startingPrice)}
						<span class="text-[11px] font-bold text-primary">ر.ع</span>
					</span>
				</div>
			{:else}
				<span class="text-[13px] font-bold text-secondary-400">تواصل معنا للسعر</span>
			{/if}
			<span
				class="inline-flex items-center gap-1 text-[13px] font-black text-primary
				group-hover:gap-2.5 transition-all duration-300">
				عرض التفاصيل <ChevronLeft class="w-4 h-4" />
			</span>
		</div>
	</div>
</a>
