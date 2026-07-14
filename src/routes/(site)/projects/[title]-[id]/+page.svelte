<script lang="ts">
	import Icons from '$lib/components/Icons.svelte';
	import Sheet from '$lib/components/Sheet.svelte';
	import {
		Bath,
		BedDouble,
		Building2,
		Construction,
		Grid2x2,
		Images,
		KeyRound
	} from '@lucide/svelte';

	let showSheet = $state(!true);
</script>

<div class="w-full p-8">
	<div class="flex justify-between items-center gap-4">
		<div>
			<h1 class="text-2xl font-bold text-secondary-600">مدينة عايدة</h1>
			<h1 class="text-xs font-bold text-black bg-primary/60 inline px-2 pt-px rounded-full">
				للمواطن العماني
			</h1>
		</div>
		<h1 class="text-secondary-600 text-2xl font-bold">25000 ريال</h1>
	</div>
	<div class="mt-4 grid grid-rows-3 grid-cols-2 w-full aspect-square gap-4">
		<div class=" row-span-2 col-span-2 rounded-xl shadow-lg overflow-hidden"></div>
		<div class="rounded-xl shadow-lg overflow-hidden"></div>
		<div class="rounded-xl shadow-lg overflow-hidden">
			<div class="w-full h-full flex items-center justify-center bg-black/60 text-secondary-100">
				<Images size={48} />
			</div>
		</div>
	</div>
	<div
		class="p-4 mt-8 border border-gray-400/20 shadow w-full h-fit rounded-xl justify-around items-center">
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
		<h1 class="mb-4 text-lg text-secondary-600">نسبة إنجاز المشروع %</h1>
		<div class="flex items-center gap-0 font-inter text-xs">
			{#each [0, 1, 2, 3, 4] as i (i)}
				{@render progress(25, i * 25)}
			{/each}
		</div>
	</div>
	<div class="mt-8">
		<h1 class="mb-4 text-2xl font-bold text-secondary-600">عن المشروع</h1>
		<p>
			مجتمع سكني فاخر مسوّر ووجهة مميّزة لعشّاق الجولف يتربّع مشروع عايدة فوق القمم المطلة على شواطئ
			مسقط وعلى ارتفاع 130 متراً فوق سطح البحر ليقدّم تجربة معيشية استثنائية تجمع بين الحياة
			الساحلية النابضة وهدوء الطبيعة الساحر، ويتميّز المشروع بتضاريسه الفريدة التي تتنوّع بين
			الوديان المتعرّجة والمنحدرات الصخرية الحادة والسواحل الممتدة دون نهاية، لتخلق مجتمعاً متكاملاً
			يعانق الجمال الطبيعي بكل تفاصيله.
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
			{@render details('المطور', ' بيوت - ID130636319')}
			{@render details('حالة البناء', 'شراكة دار')}
			{@render details('نوع العقار', 'مدينة ذكية')}
			{@render details('حالة البناء', 'جاهز')}
		</div>
	</div>
	<div
		class="fixed bottom-0 right-0 left-0 p-4 flex gap-4 items-center justify-center bg-secondary-100">
		<button
			class="py-2 bg-primary text-secondary-100 font-bold rounded-xl grow"
			onclick={() => (showSheet = true)}>عرض المشاريع</button>
		<button
			class="py-2 text-primary border border-primary font-bold rounded-xl grow"
			onclick={() => (showSheet = true)}>تواصل معنا</button>
	</div>
	<Sheet bind:isOpen={showSheet}>
		<div class="w-full h-full p-8">
			<div>
				{@render item(
					'image',
					'شقة مكونة من غرفتين للإيجار في الوادي الكبير، مسقط',
					'اكتشف هذه الشقة المكونة من غرفتين المتاحة للإيجار في منطقة الوادي الكبير الحيوية في مسقط. بسعر جذاب يبلغ 240 ريال عماني شهريًا، تقدم هذه الملكية مزيجًا مثاليًا من الراحة والملاءمة لأولئك الذين يسعون لأسلوب حياة حضري حديث.'
				)}
			</div>
		</div>
	</Sheet>
</div>

{#snippet progress(percent: number, current: number)}
	{#if percent >= current}
		<div
			class="size-10 rounded-full flex items-center justify-center bg-secondary-700 text-secondary-100">
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
	<div class="flex items-center justify-between grow border-b border-secondary-700/10">
		<span class="py-4 px-2">{title}</span>
		<!-- <span class="h-6 w-px bg-secondary-700/20"></span> -->
		<span class="py-4 ps-4 px-2 grow font-bold">{description}</span>
	</div>
{/snippet}

{#snippet item(image: string, title: string, description: string)}
	<div class="w-full h-32 rounded-2xl overflow-hidden shadow flex items-center">
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
