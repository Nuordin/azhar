<script lang="ts">
	import { SITE_NAME } from '$lib/config';

	interface Props {
		title: string;
		description: string;
		canonical: string;
		ogImage?: string;
		ogType?: string;
		jsonLd?: object | object[];
		noindex?: boolean;
	}

	let { title, description, canonical, ogImage, ogType = 'website', jsonLd, noindex = false }: Props = $props();

	const fullTitle = $derived(title === SITE_NAME ? title : `${title} | ${SITE_NAME}`);
	// منع كسر وسم السكربت أو حقن HTML من نصوص قادمة من قاعدة البيانات
	const jsonLdScript = $derived(
		jsonLd
			? '<script type="application/ld+json">' +
					JSON.stringify(jsonLd).replace(/</g, '\\u003c') +
					'</' +
					'script>'
			: null
	);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />
	{#if noindex}
		<meta name="robots" content="noindex, nofollow" />
	{/if}
	<meta property="og:type" content={ogType} />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:locale" content="ar_OM" />
	{#if ogImage}
		<meta property="og:image" content={ogImage} />
	{/if}
	<meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'} />
	<meta name="twitter:title" content={fullTitle} />
	<meta name="twitter:description" content={description} />
	{#if ogImage}
		<meta name="twitter:image" content={ogImage} />
	{/if}
	{#if jsonLdScript}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html jsonLdScript}
	{/if}
</svelte:head>
