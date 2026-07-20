<script lang="ts">
	import './admin.css';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	let { children } = $props();
</script>

<svelte:head>
	<title>لوحة التحكم</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="dark bg-background text-foreground min-h-screen" dir="rtl">
	<Sidebar.Provider>
		<AppSidebar />
		<Sidebar.Inset>
			{@render children()}
		</Sidebar.Inset>
	</Sidebar.Provider>
</div>
