<script lang="ts">
	import CountUp from './CountUp.svelte';
</script>

<div id="hero-bg" class="w-full h-64 md:h-80 mt-16 bg-no-repeat bg-center bg-primary">
	<div class="w-full h-full bg-gray-700/90">
		<div class="flex justify-around items-center w-full max-w-5xl mx-auto h-full px-4">
			{@render item('273', 'شققة للإيجار', 0)}
			<span class="bg-secondary-100/50 w-px h-8 md:h-12"></span>
			{@render item('103', 'مساحة تجاربية', 100)}
			<span class="bg-secondary-100/50 w-px h-8 md:h-12"></span>
			{@render item('46', 'فلل سكنية', 200)}
			<span class="bg-secondary-100/50 w-px h-8 md:h-12"></span>
			{@render item('103', 'عقار للبيع', 300)}
		</div>
	</div>
</div>
{#snippet item(number: string, title: string, delay: number)}
	<div
		style="transition-delay: {delay}ms"
		class="flex flex-col items-center justify-center gap-2 text-center transition-transform duration-300 ease-out hover:-translate-y-1.5">
		<CountUp
			value={number}
			class="text-secondary-100 text-3xl md:text-4xl lg:text-5xl font-inter" />
		<span class="text-secondary-100/80 font-bold text-sm md:text-base">{title}</span>
	</div>
{/snippet}

<style>
	#hero-bg {
		/* Note: Double-check if the file name should be 'sponsors.jpg' */
		background-image: url('$lib/assets/sponsers.jpg');

		/* Apply the parallax effect by default for Windows, Android, Mac, etc. */
		background-attachment: fixed;
	}

	/* THE IOS FIX:
	  -webkit-touch-callout is uniquely supported by iOS.
	  This media query tells iOS devices to override the fixed background
	  and scroll it normally, preventing the zoomed-in/broken bug.
	*/
	@supports (-webkit-touch-callout: none) {
		#hero-bg {
			background-attachment: scroll;
		}
	}
</style>
