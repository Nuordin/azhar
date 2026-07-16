<script lang="ts">
	import Icons from '$lib/components/Icons.svelte';
	import Sheet from '$lib/components/Sheet.svelte';
	import { cn, formatCurrency } from '$lib/utils';
	import { Bath, BedDouble, Building2, Construction, Grid2x2, Images, KeyRound } from '@lucide/svelte';
	import { Tabs } from 'bits-ui';
	import i1 from '$lib/assets/tmp/1.avif';
	import i2 from '$lib/assets/tmp/2.avif';
	import i3 from '$lib/assets/tmp/3.avif';
	import Galary from '$lib/components/Galary.svelte';

	let showSheet = $state(false);
	let showGalary = $state(false);
	let selected = $state('');
	const openGalary = (image: string) => {
		selected = image;
		showGalary = true;
	};
</script>

<div class="w-full p-8 lg:p-16">
	<div class="flex justify-between items-center gap-4">
		<div>
			<h1 class="text-2xl font-bold text-secondary-600">مدينة عايدة</h1>
			<h1 class="text-xs font-bold text-black bg-primary/60 inline px-2 pt-px rounded-full">للمواطن العماني</h1>
		</div>
		<h1 class="text-secondary-600 text-2xl font-bold">تبداء من {formatCurrency(200000)}</h1>
	</div>
	<div class={cn('mt-4 grid grid-rows-2 grid-cols-2 w-full gap-4 overflow-hidden', 'lg:grid-cols-3 lg:grid-rows-1')}>
		<button
			onclick={() => openGalary(i1)}
			class={cn(' row-span-2 col-span-2 rounded-xl shadow-lg overflow-hidden', 'lg:col-span-2')}>
			<img src={i1} alt="" class="w-full h-full object-cover" />
		</button>
		<div class={cn('flex gap-4 justify- col-span-2', 'lg:col-span-1 lg:flex lg:flex-col')}>
			<button onclick={() => openGalary(i2)} class="rounded-xl shadow-lg overflow-hidden relative">
				<img src={i2} alt="" class="w-full h-full object-cover" />
				<div class="absolute inset-0 flex items-center justify-center bg-black/60 text-secondary-100">
					<Images size={48} />
				</div>
			</button>
			<button onclick={() => openGalary(i3)} class="rounded-xl shadow-lg overflow-hidden">
				<img src={i3} alt="" class="w-full h-full object-cover" />
			</button>
		</div>
	</div>
	<div class="p-4 mt-8 border border-gray-400/20 shadow w-full h-fit rounded-xl justify-around items-center">
		<ul class="flex w-full h-full justify-between">
			<li class="flex flex-col justify-center items-center text-secondary-700">
				<Building2 class="text-secondary-500" />
				<span class="text-xs">نوع العقار</span><span class="text-xs">فلا مزدوجة</span>
			</li>
			<span class="border border-gray-500/15 h-8 m-auto"></span>
			<li class="flex flex-col justify-center items-center">
				<KeyRound class="text-secondary-500" />
				<span class="text-xs">تاريخ التسليم</span><span class="text-xs">2027 الربع الاول</span>
			</li>
			<span class="border border-gray-500/15 h-8 m-auto"></span>
			<li class="flex flex-col justify-center items-center">
				<Grid2x2 class="text-secondary-500" />
				<span class="text-xs">المساحة</span><span class="text-xs">44 م</span>
			</li>
			<span class="border border-gray-500/15 h-8 m-auto"></span>
			<li class="flex flex-col justify-center items-center">
				<Construction class="text-secondary-500" />
				<span class="text-xs">حالة المشروع</span><span class="text-xs">تحت الإنشاء</span>
			</li>
		</ul>
	</div>
	<div class="mt-8">
		<h1 class="mb-4 text-lg text-secondary-600">نسبة إنجاز المشروع</h1>
		<div class="flex items-center gap-0 font-inter text-xs">
			{#each [0, 1, 2, 3, 4] as i (i)}
				{@render progress(25, i * 25)}
			{/each}
		</div>
	</div>
	<div class="mt-8">
		<h1 class="mb-4 text-2xl font-bold text-secondary-600">عن المشروع</h1>
		<p>
			مجتمع سكني فاخر مسوّر ووجهة مميّزة لعشّاق الجولف يتربّع مشروع عايدة فوق القمم المطلة على شواطئ مسقط وعلى ارتفاع
			130 متراً فوق سطح البحر ليقدّم تجربة معيشية استثنائية تجمع بين الحياة الساحلية النابضة وهدوء الطبيعة الساحر،
			ويتميّز المشروع بتضاريسه الفريدة التي تتنوّع بين الوديان المتعرّجة والمنحدرات الصخرية الحادة والسواحل الممتدة دون
			نهاية، لتخلق مجتمعاً متكاملاً يعانق الجمال الطبيعي بكل تفاصيله.
		</p>
	</div>
	<div class="mt-8 w-full">
		<h1 class="text-2xl font-bold text-secondary-600 mb-8">الخدمات والمميزات</h1>
		<div class="flex flex-wrap gap-4 justify-start items-center">
			<div class="flex items-center gap-4 p-2 shadow rounded-lg">
				<Icons iconName="ShieldCheck" />
				<span>امن وحراسة</span>
			</div>
			<div class="flex items-center gap-4 p-2 shadow rounded-lg">
				<Icons iconName="Dumbbell" />
				<span>نادي رياضي مجهز</span>
			</div>
			<div class="flex items-center gap-4 p-2 shadow rounded-lg">
				<Icons iconName="WavesHorizontal" />
				<span>مسبح اتفينيتي</span>
			</div>
			<div class="flex items-center gap-4 p-2 shadow rounded-lg">
				<Icons iconName="CircleParking" />
				<span>موقف خاص</span>
			</div>
			<div class="flex items-center gap-4 p-2 shadow rounded-lg">
				<Icons iconName="TreePine" />
				<span>حدائق ومساحات خضراء</span>
			</div>
			<div class="flex items-center gap-4 p-2 shadow rounded-lg">
				<Icons iconName="Baby" />
				<span>منطقة لعب اطفال</span>
			</div>
		</div>
	</div>

	<div class="mt-8 w-full">
		<h1 class="mb-4 text-2xl font-bold text-secondary-600">تفاصيل المشروع</h1>
		<div class="grid grid-cols-1 gap-2 w-full">
			{@render details('مطور المشروع', 'دار جلوبل')}
			{@render details('حالة المشروع', 'قيد الإنشاء')}
			{@render details('تاريخ التسليم', '2029-3-29')}
			{@render details('نوع التملك', 'لمواطني دول الخليج')}
			{@render details('حالة البناء', 'جاهز')}
		</div>
	</div>
	<div class="fixed bottom-0 right-0 left-0 p-4 flex gap-4 items-center justify-center bg-secondary-100">
		<button class="py-2 bg-primary text-secondary-100 font-bold rounded-xl grow" onclick={() => (showSheet = true)}
			>عرض المشاريع</button>
		<button class="py-2 text-primary border border-primary font-bold rounded-xl grow" onclick={() => (showSheet = true)}
			>تواصل معنا</button>
	</div>

	<Sheet bind:isOpen={showSheet} class="pt-4">
		<Tabs.Root value="outbound" class="h-[50vh]">
			<Tabs.List class="px-8 mb-2">
				<div class="grid w-full grid-cols-2 gap-1 p-1 text-sm shadow-sm rounded-lg">
					<Tabs.Trigger
						value="outbound"
						class="bg-transparent h-8 flex items-center justify-center rounded-lg font-bold data-[state=active]:ring-2 data-[state=active]:ring-primary-100 data-[state=active]:bg-primary-300 data-[state=active]:text-primary-100">
						المشاريع
					</Tabs.Trigger>
					<Tabs.Trigger
						value="inbound"
						class="bg-transparent h-8 flex items-center justify-center rounded-lg font-bold data-[state=active]:ring-2 data-[state=active]:ring-primary-100 data-[state=active]:bg-primary-300 data-[state=active]:text-primary-100">
						الوحدات
					</Tabs.Trigger>
				</div>
			</Tabs.List>
			<Tabs.Content value="outbound" class="select-none overflow-y-scroll h-[50vh] flex flex-col gap-4 px-8 pt-4">
				{#each [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as i (i)}
					<div>
						{@render item(
							`image ${i}`,
							'شقة مكونة من غرفتين للإيجار في الوادي الكبير، مسقط',
							'اكتشف هذه الشقة المكونة من غرفتين المتاحة للإيجار في منطقة الوادي الكبير الحيوية في مسقط. بسعر جذاب يبلغ 240 ريال عماني شهريًا، تقدم هذه الملكية مزيجًا مثاليًا من الراحة والملاءمة لأولئك الذين يسعون لأسلوب حياة حضري حديث.'
						)}
					</div>
				{/each}
			</Tabs.Content>
			<Tabs.Content value="inbound" class="select-none overflow-y-scroll h-[50vh] flex flex-col"></Tabs.Content>
		</Tabs.Root>
	</Sheet>
</div>
<Galary images={[i1, i2, i3]} bind:open={showGalary} bind:selected />
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

{#snippet details(title: string, description: string)}
	<div class="flex items-center justify-between grow border-secondary-700/10 odd:bg-secondary-200/20 rounded-2xl px-4">
		<span class="py-4 px-2">{title}</span>
		<span class="py-4 ps-4 px-2 font-bold">{description}</span>
	</div>
{/snippet}

{#snippet item(image: string, title: string, description: string)}
	<div class="w-full h-32 rounded-2xl overflow-hidden shadow-sm border-secondary-700/10 border flex items-center">
		<div class="h-full w-48 border-secondary-700/10 border-e flex items-center justify-center">
			{image}
		</div>
		<div class="h-full w-full flex flex-col p-2 items-start justify-end">
			<span class="text-sm font-bold">{title}</span>
			<span class="line-clamp-2 text-xs">
				{description}
			</span>
			<div class="flex gap-2 mt-2 font-inter font-light">
				<span
					class="flex gap-1 text-xs items-center-safe justify-center bg-secondary-700/80 text-secondary-100 px-2 py-1 rounded-md">
					<BedDouble strokeWidth={1.5} size={12} />
					4
				</span>
				<span
					class="flex gap-1 text-xs items-center-safe justify-center bg-secondary-700/80 text-secondary-100 px-2 rounded-md">
					<Bath strokeWidth={1.5} size={12} />
					3
				</span>
				<span
					class="flex gap-1 text-xs items-center-safe justify-center bg-secondary-700/80 text-secondary-100 px-2 rounded-md">
					<!-- <Scan strokeWidth={1.5} size={12} /> -->
					<span>M<sup class="inset-e-0">2</sup></span> 77
				</span>
			</div>
		</div>
	</div>
{/snippet}
