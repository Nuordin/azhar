<script lang="ts">
	import black_image from '$lib/assets/black_building.avif';
	import white_image from '$lib/assets/white_building.avif';
	import { _ } from 'svelte-i18n';
	import { Gem } from '@lucide/svelte';
</script>

<!--
	The parent lays the achievements block and the images block side by side
	(horizontal) only when the container is wide enough for the number cards to
	stay a 2-cols × 2-rows grid next to the images. Below that it stays stacked
	(vertical), exactly like mobile. The switch is driven by available width via
	a container query, not the raw viewport.
-->
<div class="@container px-8 md:px-10 lg:px-16 pt-24 max-w-7xl mx-auto" id="about">
	<div class="flex flex-col @4xl:flex-row @4xl:items-center gap-8 @4xl:gap-16">
		<div class="flex flex-col justify-between items-start @4xl:flex-1">
			<h1 class="text-4xl md:text-5xl font-bold text-secondary-600 text-center @4xl:text-right w-full mb-4">
				{$_('about_us.title')}
			</h1>
			<p class="text-2xl max-w-2xl mb-8 text-center @4xl:text-right @4xl:mx-0 mx-auto">
				{$_('about_us.description')}
			</p>
			<div
				class="grid grid-cols-2 grid-rows-2 aspect-square gap-8 w-full max-w-md mx-auto @4xl:mx-0">
				{@render achievement(
					$_('about_us.achievements.a1') as unknown as { number: string; title: string }
				)}
				{@render achievement(
					$_('about_us.achievements.a2') as unknown as { number: string; title: string }
				)}
				{@render achievement(
					$_('about_us.achievements.a3') as unknown as { number: string; title: string }
				)}
				{@render achievement(
					$_('about_us.achievements.a4') as unknown as { number: string; title: string }
				)}
			</div>
		</div>
		<div class="flex justify-center items-center overflow-visible @4xl:flex-1">
			<div class="grid grid-cols-2 gap-8 justify-center items-center justify-items-center">
				<img
					src={white_image}
					alt="white building"
					class="object-cover h-86 @4xl:h-[26rem] aspect-1/2 rounded-4xl shadow-2xl border border-secondary-700/20" />
				<div class="grid grid-rows-2 gap-4 h-86 @4xl:h-[26rem] aspect-1/2">
				<img
					src={black_image}
					alt="black building"
					class="w-full h-full object-cover rounded-4xl shadow-2xl border border-secondary-700/20" />
				<div
					class="py-2 px-2 bg-primary flex flex-col items-center justify-center rounded-4xl shadow-2xl border border-secondary-700/10 text-secondary-100">
					<span class="mb-2"><Gem size={64} strokeWidth={1} /></span>
					<div class="flex flex-col items-center text-center">
						<span class="font-black text-2xl">{$_('about_us.slogan.title')}</span>
						<span class="font-black text-sm">{$_('about_us.slogan.description')}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
</div>
{#snippet achievement(achievement: { number: string; title: string })}
	<div
		class="flex flex-col items-center justify-center gap-4 p-4 shadow-md rounded-2xl border-gray-400/20 border text-center">
		<span class="text-4xl font-inter">{achievement.number}</span>
		<span class="font-black">{achievement.title}</span>
	</div>
{/snippet}
