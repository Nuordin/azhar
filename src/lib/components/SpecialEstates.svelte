<script>
	import { _ } from 'svelte-i18n';
	let project = {
		title: 'مشروع عايدة',
		description:
			'يتربّع مشروع عايدة فوق القمم المطلة على شواطئ مسقط وعلى ارتفاع 130 متراً فوق سطح البحر ليقدّم تجربة معيشية استثنائية تجمع بين الحياة الساحلية النابضة وهدوء الطبيعة الساحر، ويتميّز المشروع بتضاريسه الفريدة التي تتنوّع بين الوديان المتعرّجة والمنحدرات الصخرية الحادة والسواحل الممتدة دون نهاية، لتخلق مجتمعاً متكاملاً يعانق الجمال الطبيعي بكل تفاصيله.'
	};
</script>

<div class="px-8 mt-16">
	<h1 class="text-4xl md:text-5xl font-bold text-secondary-600 text-center w-full mb-4">
		{$_('specialEstates.title')}
	</h1>
	<p class="text-2xl max-w-2xl mb-8 text-center">{$_('specialEstates.description')}</p>
	<div class="flex flex-col gap-4">
		<div
			class="relative bg-secondary-100 w-full aspect-3/2 border border-gray-700/20 shadow-md rounded-2xl overflow-hidden">
			<h1 class="text-4xl flex justify-center items-center h-full w-full">Project 1</h1>
			<div
				class="absolute inset-0 px-4 py-4 flex flex-col justify-end items-start bg-linear-to-t from-secondary-700/80 to-100%">
				<h1 class="text-2xl font-bold text-secondary-100">{project.title}</h1>
				<p class="line-clamp-2 font-bold text-sm text-secondary-100">{project.description}</p>
			</div>
		</div>
		<div class="flex flex-col gap-4">
			<div
				class="relative bg-secondary-100 w-full aspect-3/2 border border-gray-700/20 shadow-md rounded-2xl overflow-hidden">
				<h1 class="text-4xl flex justify-center items-center h-full w-full">Project 1</h1>
				<div
					class="absolute inset-0 px-4 py-4 flex flex-col justify-end items-start bg-linear-to-t from-secondary-700/80 to-100%">
					<h1 class="text-2xl font-bold text-secondary-100">{project.title}</h1>
					<p class="line-clamp-2 font-bold text-sm text-secondary-100">{project.description}</p>
				</div>
			</div>
			<div class="flex flex-col gap-4">
				<div
					class="relative bg-secondary-100 w-full aspect-3/2 border border-gray-700/20 shadow-md rounded-2xl overflow-hidden">
					<h1 class="text-4xl flex justify-center items-center h-full w-full">Project 1</h1>
					<div
						class="absolute inset-0 px-4 py-4 flex flex-col justify-end items-start bg-linear-to-t from-secondary-700/80 to-100%">
						<h1 class="text-2xl font-bold text-secondary-100">{project.title}</h1>
						<p class="line-clamp-2 font-bold text-sm text-secondary-100">{project.description}</p>
					</div>
				</div>

				<div
					class="relative bg-secondary-100 w-full aspect-3/2 border border-gray-700/20 shadow-md rounded-2xl overflow-hidden">
					<h1 class="text-4xl flex justify-center items-center h-full w-full">Project 1</h1>
					<div
						class="absolute inset-0 px-4 py-4 flex flex-col justify-end items-start bg-linear-to-t from-secondary-700/80 to-100%">
						<h1 class="text-2xl font-bold text-secondary-100">{project.title}</h1>
						<p class="line-clamp-2 font-bold text-sm text-secondary-100">{project.description}</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
