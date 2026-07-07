<script>
	//TODO: Tanslations
	import { _ } from 'svelte-i18n';
	import logo from '$lib/assets/OneWayLogo.svg';
</script>

<footer class="mt-8 px-8 pt-10 pb-32 border-t border-gray-500/50">
	<div class="grid-flow-col gap-8 justify-between items-center">
		<ul class="flex gap-4 justify-center items-center">
			<li>{$_('header.about')}</li>
			<li>{$_('header.projects')}</li>
			<li>{$_('header.contact')}</li>
		</ul>
		<div class="flex flex-col items-center gap-2 text-center">
			<img src={logo} alt="Logo" class="w-14" />
			<span>وجهتك الأولى للعقارات الفاخرة</span>
		</div>
	</div>
	<dir></dir>
</footer>
