<script lang="ts" module>
	// import { authClient } from '$lib/client/auth.js';
	import logo from '$lib/assets/OneWayLogo.svg';

	// const session = authClient.useSession();
	// const email = authClient. || 'azhar@onewayestate.com';
	const data = {
		user: {
			name: 'Azhar',
			email: 'azhar@onewayestate.com',
			avatar: logo
		},
		navMain: [
			{
				title: 'إدارة المشاريع',
				url: 'projects',
				isActive: true,
				icon: null
			},
			{
				title: 'إدارة الوحدات',
				url: 'properties',
				icon: null
			}
		]
	};
</script>

<script lang="ts">
	import NavMain from './nav-main.svelte';
	import NavUser from './nav-user.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { ComponentProps } from 'svelte';

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root bind:ref variant="inset" {...restProps} class="dark">
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg">
					{#snippet child({ props })}
						<a href="##" {...props} class="flex items-end justify-center gap-2">
							<div
								class="text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
								<img src={logo} alt="One Way Logo" class="size-32" />
							</div>
							<div class="grid flex-1 text-start text-sm leading-tight">
								<span class="truncate font-medium relative top-1">ONE WAY</span>
								<span class="truncate text-xs relative top-1">المسار الموحد</span>
							</div>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<NavMain items={data.navMain} />
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser user={data.user} />
	</Sidebar.Footer>
</Sidebar.Root>
