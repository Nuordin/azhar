<script lang="ts">
	import black_image from '$lib/assets/black_building.avif';
	import white_image from '$lib/assets/white_building.avif';
	import { _ } from 'svelte-i18n';
	import { Gem } from '@lucide/svelte';
	import AchievementCard from './AchievementCard.svelte';
</script>

<!--
	Two stacked units: (a) title + description on top, then (b) the achievements +
	images below. Title/description align to the start (right in RTL) on desktop
	and center when narrow. Inside unit (b) the achievements and images sit side
	by side from tablet up, and stack (achievements above images) on mobile.
-->
<div class="@container px-4 md:px-16 lg:px-32 pt-24 w-full mx-auto" id="about">
	<!-- a. Title + description -->
	<h1 class="text-4xl md:text-5xl font-bold text-secondary-600 text-center lg:text-start w-full mb-4">
		{$_('about_us.title')}
	</h1>
	<p class="text-2xl max-w-2xl mx-auto lg:mx-0 mb-12 text-center lg:text-start">
		{$_('about_us.description')}
	</p>

	<!-- b. Achievements (above on mobile) + images (side by side from tablet) -->
	<div class="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-12">
		<div class="grid grid-cols-2 grid-rows-2 aspect-square gap-6 p-4 w-full max-w-md">
			{@render achievement($_('about_us.achievements.a1') as unknown as { number: string; title: string }, 0)}
			{@render achievement($_('about_us.achievements.a2') as unknown as { number: string; title: string }, 100)}
			{@render achievement($_('about_us.achievements.a3') as unknown as { number: string; title: string }, 200)}
			{@render achievement($_('about_us.achievements.a4') as unknown as { number: string; title: string }, 300)}
		</div>
		<div class="flex justify-center items-center overflow-visible">
			<div class="grid grid-cols-2 gap-8 justify-center items-center justify-items-center">
				<img
					src={white_image}
					alt="white building"
					class="object-cover h-80 lg:h-[28rem] aspect-1/2 rounded-4xl shadow-2xl border border-secondary-700/20" />
				<div class="grid grid-rows-2 gap-4 h-80 lg:h-[28rem] aspect-1/2">
					<img
						src={black_image}
						alt="black building"
						class="w-full h-full object-cover rounded-4xl shadow-2xl border border-secondary-700/20" />
					<div
						class="py-2 px-2 bg-primary flex flex-col items-center justify-center gap-1 rounded-4xl shadow-2xl border border-secondary-700/10 text-secondary-100 overflow-hidden">
						<Gem class="w-8 h-8 md:w-10 md:h-10 lg:w-16 lg:h-16" strokeWidth={1} />
						<div class="flex flex-col items-center text-center">
							<span class="font-black text-base md:text-lg lg:text-2xl leading-tight"
								>{$_('about_us.slogan.title')}</span>
							<span class="font-black text-[11px] md:text-xs lg:text-sm leading-snug">
								{$_('about_us.slogan.description')}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
{#snippet achievement(achievement: { number: string; title: string }, delay: number)}
	<AchievementCard number={achievement.number} title={achievement.title} {delay} />
{/snippet}
