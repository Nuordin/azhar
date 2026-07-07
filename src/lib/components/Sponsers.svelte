<script lang="ts">
</script>

<div id="hero-bg" class="w-full h-64 mt-16 bg-no-repeat bg-center bg-primary">
	<div class="w-full h-full bg-gray-700/90">
		<div class="flex justify-around items-center w-full h-full">
			{@render item('273', 'شققة للإيجار')}
			<span class="bg-secondary-100/50 w-px h-8"></span>
			{@render item('103', 'مساحة تجاربية')}
			<span class="bg-secondary-100/50 w-px h-8"></span>
			{@render item('46', 'فلل سكنية')}
			<span class="bg-secondary-100/50 w-px h-8"></span>
			{@render item('103', 'عقار للبيع')}
		</div>
	</div>
</div>
{#snippet item(number: string, title: string)}
	<div class="flex flex-col items-center justify-center gap-2">
		<span class="text-secondary-100 text-3xl font-inter">{number}</span>
		<span class="text-secondary-100/80 font-bold text-sm">{title}</span>
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
