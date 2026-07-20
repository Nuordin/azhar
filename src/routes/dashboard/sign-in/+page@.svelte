<script lang="ts">
	import '../admin.css';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { FieldGroup, Field, FieldLabel } from '$lib/components/ui/field/index.js';
	import { authClient } from '$lib/client/auth';

	let email: string = $state('');
	let password: string = $state('');
	let loading = $state(false);

	async function handleLogin(e: Event) {
		e.preventDefault();

		await authClient.signIn.email({
			email,
			password,
			fetchOptions: {
				onRequest: () => {
					loading = true;
				},
				onSuccess: () => {
					// Redirect to your admin dashboard
					window.location.href = '/dashboard/projects';
				},
				onError: (ctx) => {
					console.error(ctx);
					alert(ctx.error.statusText);
					loading = false;
				}
			}
		});
	}
</script>

<svelte:head>
	<title>تسجيل الدخول</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="flex h-screen w-full items-center justify-center px-4 dark bg-black">
	<Card.Root class="mx-auto w-full max-w-sm">
		<Card.Header>
			<Card.Title class="text-2xl">تسجيل الدخول</Card.Title>
			<Card.Description>ادخل بياناتك لتسجيل الدخول</Card.Description>
		</Card.Header>
		<Card.Content>
			<form>
				<FieldGroup>
					<Field>
						<FieldLabel for="email">الايميل</FieldLabel>
						<Input
							id="email"
							type="email"
							placeholder="email@example.com"
							required
							disabled={loading}
							bind:value={email} />
					</Field>
					<Field>
						<div class="flex items-center">
							<FieldLabel for="password">كلمة المرور</FieldLabel>
						</div>
						<Input id="password" type="password" required bind:value={password} disabled={loading} />
					</Field>
					<Field>
						<Button type="submit" class="w-full" disabled={loading} onclick={handleLogin}>
							{loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
						</Button>
					</Field>
				</FieldGroup>
			</form>
		</Card.Content>
	</Card.Root>
</div>
