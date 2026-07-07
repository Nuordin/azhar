<script lang="ts" module>
	import Settings2Icon from '@lucide/svelte/icons/settings-2';
	import SquareTerminalIcon from '@lucide/svelte/icons/square-terminal';

	const data = {
		user: {
			name: 'Azhar',
			email: 'azhar@onewayestate.com',
			avatar: logo
		},
		navMain: [
			{
				title: 'عرض المشاريع',
				url: '#123',
				icon: SquareTerminalIcon,
				isActive: true
			},
			{
				title: 'Settings',
				url: '#',
				icon: Settings2Icon
			}
		]
	};
</script>

<script lang="ts">
	import NavMain from './nav-main.svelte';
	import NavUser from './nav-user.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { ComponentProps } from 'svelte';
	import logo from '$lib/assets/OneWayLogo.svg';

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root bind:ref variant="inset" {...restProps}>
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
