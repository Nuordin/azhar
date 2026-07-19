<script>
	import SliderHero from '$lib/components/SliderHero.svelte';
	import HomeNewSearch from '$lib/components/HomeNewSearch.svelte';
	import About from '$lib/components/About.svelte';
	import OurServices from '$lib/components/OurServices.svelte';
	import SpecialEstates from '$lib/components/SpecialEstates.svelte';
	import NewProjects from '$lib/components/NewProjects.svelte';
	import Sponsers from '$lib/components/Sponsers.svelte';
	import LatestBlogs from '$lib/components/LatestBlogs.svelte';

	let { data } = $props();
	let { topProjects } = $derived(data);
</script>

<SliderHero />
<HomeNewSearch />
<About />
<OurServices />
<SpecialEstates projectList={topProjects} />
<NewProjects />
<Sponsers />
<LatestBlogs />
