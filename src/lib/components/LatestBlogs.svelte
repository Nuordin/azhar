<script lang="ts">
	import { CalendarDays, ChevronLeft } from '@lucide/svelte';
	import { _ } from 'svelte-i18n';
	let projects: Project[] = [
		{
			id: '01',
			title: '؟كيف تختار منزلك الأول في عمان',
			date: '2024-5-15',
			catagory: 'نصائح عقارية',
			discription:
				'دليل شامل يساعدك على فهم الخطوات القانونية والمالية الأساسية لشراء أول عقار لك في السلطنة',
			image: 'none'
		},
		{
			id: '02',
			title: 'أفضل المناطق للاستثمار في مسقط 2024',
			date: '2024-7-39',
			catagory: 'أخبار السوق',
			discription:
				'تحليل مفصل للمناطق الواعدة التي تحقق أعلى عوائد استثمارية في العاصمة العمانية بناءً على',
			image: 'none'
		},
		{
			id: '03',
			title: 'مبنى التجار',
			date: '2022-6-28',
			catagory: 'تطوير عقاري',
			discription:
				'كيف تؤثر تصاميم المنازل الحديثة والمستدامة على جودة الحياة وقيمة العقار في السوق المحلي.',
			image: 'none'
		}
	];
	type Project = {
		id: string;
		title: string;
		date: string;
		catagory: string;
		discription: string;
		image: string;
	};
</script>

<div class="px-8 md:px-10 lg:px-16 mt-16 max-w-7xl mx-auto">
	<h1 class="text-4xl md:text-5xl font-bold text-secondary-600 text-center w-full mb-4">
		{$_('new_blogs.title')}
	</h1>
	<p class="text-2xl max-w-2xl mx-auto mb-8 text-center">{$_('new_blogs.description')}</p>
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
		{#each projects as item (item.id)}
			{@render project(item)}
		{/each}
	</div>
</div>

{#snippet project(project: Project)}
	<div class="w-full max-w-sm border border-gray-700/20 shadow-md p-4 rounded-3xl">
		<div
			class="relative w-full aspect-3/2 rounded-3xl border-stone-600/30 border flex items-center justify-center text-xl">
			<span>Project {project.id}</span>
			<span class="absolute top-2 right-2 text-sm bg-secondary-200/70 px-2 py-px rounded-full"
				>{project.catagory}</span>
		</div>
		<div class="mt-4 text-secondary-700/70">
			<h1 class="text-2xl font-bold">{project.title}</h1>
			<h1 class="flex gap-2 text-sm"><CalendarDays strokeWidth={1.5} size={16} />{project.date}</h1>
		</div>
		<p class="pt-2 text-sm text-secondary-700/70">{project.discription}</p>
		<div class="flex gap-2 font-bold mt-12 justify-end items-center">
			<div class="flex flex-row gap-2 items-center justify-end text-secondary-500">
				<span class="text-xl font-bold">اقرأ المزيد</span>
				<ChevronLeft strokeWidth={2} />
			</div>
		</div>
	</div>
{/snippet}
