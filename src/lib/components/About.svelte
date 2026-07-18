<script lang="ts">
	import black_image from '$lib/assets/black_building.avif';
	import white_image from '$lib/assets/white_building.avif';
	import { _ } from 'svelte-i18n';
	import { Gem } from '@lucide/svelte';
</script>

<div class="px-8 pt-24 flex flex-col gap-8" id="about">
	<div class="flex flex-col justify-between items-start">
		<h1 class="text-4xl font-bold text-secondary-600 text-center w-full mb-4">
			{$_('about_us.title')}
		</h1>
		<p class="text-2xl max-w-2xl mb-8 text-center">{$_('about_us.description')}</p>
		<div class="grid grid-cols-2 gap-8 w-fit mx-auto">
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
	<div class="flex justify-center items-center overflow-visible">
		<div class="grid grid-cols-2 gap-8 justify-center items-center justify-items-center">
			<img
				src={white_image}
				alt="white building"
				class="object-cover h-86 aspect-1/2 rounded-4xl shadow-2xl border border-secondary-700/20" />
			<div class="grid grid-rows-2 gap-4 h-86 aspect-1/2">
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

{#snippet achievement(achievement: { number: string; title: string })}
	<div
		class="flex flex-col items-center justify-center gap-4 p-4 shadow-md rounded-2xl border-gray-400/20 border text-center">
		<span class="text-4xl font-inter">{achievement.number}</span>
		<span class="font-black">{achievement.title}</span>
	</div>
{/snippet}
