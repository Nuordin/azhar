<script>
	import { fly } from 'svelte/transition';
	import { linear } from 'svelte/easing';

	const slides = [
		{ id: 1, title: 'First Slide' },
		{ id: 2, title: 'Second Slide' },
		{ id: 3, title: 'Third Slide' },
		{ id: 4, title: 'Fourth Slide' },
		{ id: 5, title: 'Fifth Slide' }
	];

	let currentSlideIndex = $state(0);
	let currentSlide = $derived(slides[currentSlideIndex]);

	function nextSlide() {
		if (currentSlideIndex >= slides.length - 1) {
			currentSlideIndex = 0;
		} else {
			currentSlideIndex = currentSlideIndex + 1;
		}
	}
</script>

<div class="w-full h-98 md:h-[32rem] lg:h-[38rem] relative overflow-hidden">
	{#key currentSlide.id}
		<button
			class="w-full flex items-center justify-center inset-0 absolute bg-secondary-100 text-secondary-600"
			in:fly={{ duration: 1000, easing: linear, x: '-100%', opacity: 1 }}
			out:fly={{ duration: 1000, easing: linear, x: '100%', opacity: 1 }}>
			<h1 class="text-4xl md:text-5xl lg:text-6xl">{currentSlide.title}</h1>
		</button>
	{/key}
	<button
		class="w-full h-full relative bg-linear-to-t from-secondary-600/80 to-80% flex flex-col items-center justify-around"
		onclick={nextSlide}>
		<ul class="absolute bottom-10 flex gap-2">
			{#each slides as slide, idx (slide.id)}
				{@const isActive = currentSlideIndex === idx}
				<li class="w-6 h-1 {isActive ? 'bg-primary-500' : 'bg-secondary-500'} rounded-full"></li>
			{/each}
		</ul>
	</button>
</div>
