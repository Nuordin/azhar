<script lang="ts">
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';

	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { enhance } from '$app/forms';

	import { Plus, SquarePen, Trash2 } from '@lucide/svelte';
	import { projectForm } from './state.svelte.js';
	import ProjectDialog from './ProjectDialog.svelte';
	let { data } = $props();

	const formatCurrency = (amount: number | null) => {
		if (!amount) return '-';
		return new Intl.NumberFormat('ar-OM', { style: 'currency', currency: 'OMR' }).format(amount);
	};

	const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
		ready: { label: 'جاهز', variant: 'default' },
		under_construction: { label: 'قيد الإنشاء', variant: 'secondary' },
		off_plan: { label: 'مخطط', variant: 'outline' }
	};
</script>

<header class="flex h-16 shrink-0 items-center gap-2">
	<div class="flex items-center gap-2 px-16 w-full">
		<Sidebar.Trigger class="-ms-1" />
		<Separator orientation="vertical" class="me-2 data-[orientation=vertical]:h-4" />
		<Breadcrumb.Root>
			<Breadcrumb.List>
				<Breadcrumb.Item class="hidden md:block">
					<Breadcrumb.Link href="">إدارة الموقع</Breadcrumb.Link>
				</Breadcrumb.Item>
				<Breadcrumb.Separator class="hidden md:block rotate-180" />
				<Breadcrumb.Item>
					<Breadcrumb.Page>إدارة المشاريع</Breadcrumb.Page>
				</Breadcrumb.Item>
			</Breadcrumb.List>
		</Breadcrumb.Root>
		<!-- <Separator orientation="vertical" class="me-2 data-[orientation=vertical]:h-4" /> -->
		<Button variant="outline" onclick={() => projectForm.openDialog()}>إضافة مشروع جديد<Plus /></Button>
	</div>
</header>
<ProjectDialog parentProjects={data.parentProjects} />
<div class="flex flex-1 flex-col gap-4 p-4 md:px-16" dir="rtl">
	<div class="rounded-2xl border bg-background">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="text-right">اسم المشروع</Table.Head>
					<Table.Head class="text-right">اسم المطور</Table.Head>
					<Table.Head class="text-right">حالة البناء</Table.Head>
					<Table.Head class="text-right">نسبة الإنجاز</Table.Head>
					<Table.Head class="text-right">السعر المبدئي</Table.Head>
					<Table.Head class="text-center">الحالة</Table.Head>
					<Table.Head class="text-left">الإجراءات</Table.Head>
				</Table.Row>
			</Table.Header>

			<Table.Body>
				{#each data.projects as project (project.id)}
					<Table.Row>
						<Table.Cell class="font-medium">
							{project.title}
						</Table.Cell>

						<Table.Cell>
							{project.developerName}
						</Table.Cell>

						<Table.Cell>
							{#if project.constructionStatus && statusMap[project.constructionStatus]}
								<Badge variant={statusMap[project.constructionStatus].variant}>
									{statusMap[project.constructionStatus].label}
								</Badge>
							{:else}
								<Badge variant="outline">غير محدد</Badge>
							{/if}
						</Table.Cell>

						<Table.Cell class="w-50">
							<div class="flex items-center gap-3">
								<Progress value={Number(project.completionPercentage || 0)} class="h-2 w-full" />
								<span class="text-xs text-muted-foreground w-[3ch] text-left">
									{project.completionPercentage || 0}%
								</span>
							</div>
						</Table.Cell>

						<Table.Cell>
							{formatCurrency(project.startingPrice)}
						</Table.Cell>

						<Table.Cell class="text-center">
							<form
								action="?/togglePublish"
								method="POST"
								use:enhance={() => {
									return async ({ update }) => {
										await update({ invalidateAll: true });
									};
								}}
								id="publish-form-{project.id}">
								<input type="hidden" name="id" value={project.id} />
								<input type="hidden" name="isPublished" value={!project.isPublished} />

								<Switch
									checked={project.isPublished}
									onclick={() => {
										const form = document.getElementById(`publish-form-${project.id}`) as HTMLFormElement;
										if (form) {
											form.requestSubmit();
										}
									}} />
							</form>
						</Table.Cell>

						<Table.Cell class="text-left">
							<div class="flex justify-end gap-2">
								<!-- <Button
									variant="ghost"
									size="icon"
									title="تعديل"
									onclick={async (e) => {
										const btn = e.currentTarget as HTMLButtonElement;
										btn.disabled = true; // لمنع الضغط المتكرر
										try {
											const res = await fetch(`/api/projects/${project.id}`);
											if (res.ok) {
												const fullData = await res.json();
												projectForm.populate(fullData);
												projectForm.openDialog();
											} else {
												alert('حدث خطأ أثناء جلب بيانات المشروع');
											}
										} catch (err) {
											console.error(err);
										} finally {
											btn.disabled = false;
										}
									}}>
									<SquarePen class="h-4 w-4 text-muted-foreground" />
								</Button> -->

								<form
									method="POST"
									action="?/deleteProject"
									use:enhance={() => {
										return async ({ update }) => {
											update(); // تحديث واجهة المستخدم
										};
									}}>
									<input type="hidden" name="id" value={project.id} />

									<Button
										type="submit"
										variant="ghost"
										size="icon"
										title="حذف"
										class="hover:text-destructive hover:bg-destructive/10"
										onclick={(e) => {
											if (
												!confirm(
													'هل أنت متأكد من حذف هذا المشروع نهائياً؟ سيتم حذف جميع الصور والبيانات المرتبطة به ولن تتمكن من التراجع.'
												)
											) {
												e.preventDefault(); // إلغاء الإرسال إذا ضغط المستخدم "إلغاء"
											}
										}}>
										<Trash2 class="h-4 w-4" />
									</Button>
								</form>
							</div>
						</Table.Cell>
					</Table.Row>
				{/each}

				{#if data.projects.length === 0}
					<Table.Row>
						<Table.Cell colspan={7} class="text-center py-10 text-muted-foreground">
							<div class="flex flex-col items-center gap-4">
								<span class="mb-0"> لا توجد مشاريع مضافة حتى الآن.</span>
								<Button variant="outline" onclick={() => projectForm.openDialog()}>إضافة مشروع جديد<Plus /></Button>
							</div>
						</Table.Cell>
					</Table.Row>
				{/if}
			</Table.Body>
		</Table.Root>

		{#if data.pagination.totalPages > 1}
			<div class="flex items-center justify-between px-4 py-4 border-t">
				<div class="text-sm text-muted-foreground">
					صفحة {data.pagination.currentPage} من {data.pagination.totalPages}
					(إجمالي {data.pagination.totalCount} مشروع)
				</div>
				<div class="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						href="?page={data.pagination.currentPage - 1}"
						disabled={data.pagination.currentPage <= 1}>
						السابق
					</Button>
					<Button
						variant="outline"
						size="sm"
						href="?page={data.pagination.currentPage + 1}"
						disabled={data.pagination.currentPage >= data.pagination.totalPages}>
						التالي
					</Button>
				</div>
			</div>
		{/if}
	</div>
</div>
