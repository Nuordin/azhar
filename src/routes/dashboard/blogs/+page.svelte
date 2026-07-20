<script lang="ts">
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';

	import * as Table from '$lib/components/ui/table/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	import { Plus, SquarePen, Trash2, Upload, Eye } from '@lucide/svelte';
	import { blogForm } from './state.svelte.js';
	let { data } = $props();

	const categoryOptions = [
		{ value: 'real_estate_tips', label: 'نصائح عقارية' },
		{ value: 'market_news', label: 'أخبار السوق' },
		{ value: 'development', label: 'تطوير عقاري' },
		{ value: 'investment', label: 'استثمار' },
		{ value: 'company_news', label: 'أخبار الشركة' }
	];

	type Blog = {
		id: number;
		title: string | null;
		category: string | null;
		publishedAt: Date | null;
		isPublished: boolean;
	};

	const formatDate = (date: Date | null) => {
		if (!date) return '-';
		return new Intl.DateTimeFormat('ar', { dateStyle: 'medium' }).format(new Date(date));
	};

	let currentCategoryLabel = $derived(
		categoryOptions.find((c) => c.value === blogForm.category)?.label || 'اختر التصنيف'
	);

	const contentPlaceholder = '## عنوان فرعي\n\nنص الفقرة هنا...\n\n- نقطة أولى\n- نقطة ثانية';

	let isSubmitting = $state(false);
	let err_msg: string | null = $state(null);

	// المقال له صورة غلاف واحدة فقط: اختيار صورة جديدة يستبدل الحالية
	function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		blogForm.mediaFiles = [file];
		for (const m of blogForm.existingMedia) {
			blogForm.deletedMediaIds.push(m.id);
		}
		blogForm.existingMedia = [];
	}

	function removeNewCover() {
		blogForm.mediaFiles = [];
	}

	async function submitForm() {
		isSubmitting = true;
		err_msg = '';

		const formData = new FormData();
		if (blogForm.blogId) {
			formData.append('blogId', String(blogForm.blogId));
			formData.append('deletedMediaIds', JSON.stringify(blogForm.deletedMediaIds));
		}
		formData.append('title', blogForm.title);
		formData.append('excerpt', blogForm.excerpt);
		formData.append('content', blogForm.content);
		formData.append('category', blogForm.category);
		formData.append('isPublished', String(blogForm.isPublished));

		// صورة الغلاف (واحدة فقط)
		if (blogForm.mediaFiles[0]) {
			formData.append('mediaFiles', blogForm.mediaFiles[0]);
		}

		try {
			const actionUrl = blogForm.blogId ? '?/updateBlog' : '?/createBlog';
			// إرسال البيانات إلى +page.server.ts
			const response = await fetch(actionUrl, {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (result.type === 'success') {
				// إغلاق النافذة وتحديث الجدول تلقائياً
				blogForm.resetForm();
				blogForm.closeDialog();
				await invalidateAll();
			} else {
				err_msg = JSON.parse(result.data)[1];
				console.error('فشل الإرسال:', result);
			}
		} catch (error) {
			console.error('حدث خطأ أثناء الإرسال:', error);
		} finally {
			isSubmitting = false;
		}
	}
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
					<Breadcrumb.Page>إدارة المدونة</Breadcrumb.Page>
				</Breadcrumb.Item>
			</Breadcrumb.List>
		</Breadcrumb.Root>
		<Button
			variant="outline"
			onclick={() => {
				blogForm.resetForm();
				blogForm.openDialog();
			}}>إضافة مقال جديد<Plus /></Button>
	</div>
</header>

<div class="flex flex-1 flex-col gap-4 p-4 md:px-16" dir="rtl">
	<div class="rounded-2xl border bg-background">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="text-right">عنوان المقال</Table.Head>
					<Table.Head class="text-right">التصنيف</Table.Head>
					<Table.Head class="text-right">تاريخ النشر</Table.Head>
					<Table.Head class="text-center">الحالة</Table.Head>
					<Table.Head class="text-left">الإجراءات</Table.Head>
				</Table.Row>
			</Table.Header>

			<Table.Body>
				{#each data.blogs as blog (blog.id)}
					{@render row(blog)}
				{:else}
					<Table.Row>
						<Table.Cell colspan={5} class="text-center py-10 text-muted-foreground">
							<div class="flex flex-col items-center gap-4">
								<span class="mb-0"> لا توجد مقالات مضافة حتى الآن.</span>
								<Button variant="outline" onclick={() => blogForm.openDialog()}>إضافة مقال جديد<Plus /></Button>
							</div>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>

		{#if data.pagination.totalPages > 1}
			<div class="flex items-center justify-between px-4 py-4 border-t">
				<div class="text-sm text-muted-foreground">
					صفحة {data.pagination.currentPage} من {data.pagination.totalPages}
					(إجمالي {data.pagination.totalCount} مقال)
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

{@render dialog()}

{#snippet row(blog: Blog)}
	<Table.Row>
		<Table.Cell class="font-medium">
			{blog.title}
		</Table.Cell>

		<Table.Cell>
			<Badge variant="secondary">
				{categoryOptions.find((c) => c.value === blog.category)?.label || 'غير محدد'}
			</Badge>
		</Table.Cell>

		<Table.Cell>
			{formatDate(blog.publishedAt)}
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
				id="publish-form-{blog.id}">
				<input type="hidden" name="id" value={blog.id} />
				<input type="hidden" name="isPublished" value={!blog.isPublished} />

				<Switch
					checked={blog.isPublished}
					onclick={() => {
						const form = document.getElementById(`publish-form-${blog.id}`) as HTMLFormElement;
						if (form) {
							form.requestSubmit();
						}
					}} />
			</form>
		</Table.Cell>

		<Table.Cell class="text-left">
			<div class="flex justify-end gap-2">
				<Button
					variant="ghost"
					size="icon"
					title="عرض"
					onclick={async (e) => {
						const btn = e.currentTarget as HTMLButtonElement;
						btn.disabled = true;
						try {
							const res = await fetch(`/api/blogs/${blog.id}`);
							if (res.ok) {
								blogForm.openView(await res.json());
							} else {
								alert('حدث خطأ أثناء جلب البيانات');
							}
						} catch (err) {
							console.error(err);
						} finally {
							btn.disabled = false;
						}
					}}>
					<Eye class="h-4 w-4 text-muted-foreground" />
				</Button>

				<Button
					variant="ghost"
					size="icon"
					title="تعديل"
					onclick={async (e) => {
						const btn = e.currentTarget as HTMLButtonElement;
						btn.disabled = true; // لمنع الضغط المتكرر
						try {
							const res = await fetch(`/api/blogs/${blog.id}`);
							if (res.ok) {
								const fullData = await res.json();
								blogForm.populate(fullData);
								blogForm.openDialog();
							} else {
								alert('حدث خطأ أثناء جلب بيانات المقال');
							}
						} catch (err) {
							console.error(err);
						} finally {
							btn.disabled = false;
						}
					}}>
					<SquarePen class="h-4 w-4 text-muted-foreground" />
				</Button>

				<form
					method="POST"
					action="?/deleteBlog"
					use:enhance={() => {
						return async ({ update }) => {
							update(); // تحديث واجهة المستخدم
						};
					}}>
					<input type="hidden" name="id" value={blog.id} />

					<Button
						type="submit"
						variant="ghost"
						size="icon"
						title="حذف"
						class="hover:text-destructive hover:bg-destructive/10"
						onclick={(e) => {
							if (
								!confirm(
									'هل أنت متأكد من حذف هذا المقال نهائياً؟ سيتم حذف جميع الصور والبيانات المرتبطة به ولن تتمكن من التراجع.'
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
{/snippet}

{#snippet dialog()}
	<Dialog.Root bind:open={blogForm.isOpen}>
		<Dialog.Content class="sm:max-w-150 dark" interactOutsideBehavior="close">
			<Dialog.Header>
				<Dialog.Title class="text-right">
					{blogForm.mode === 'view' ? 'تفاصيل المقال' : blogForm.blogId ? 'تعديل المقال' : 'إضافة مقال جديد'}
				</Dialog.Title>
				{#if blogForm.mode !== 'view'}
					<Dialog.Description class="text-right">الخطوة {blogForm.currentStep} من 2</Dialog.Description>
				{/if}
			</Dialog.Header>

			{#if blogForm.mode === 'view'}
				<div class="py-4 space-y-4" dir="rtl">
					{@render viewBody()}
				</div>
				<Dialog.Footer class="flex justify-end items-center w-full gap-2 mt-4" dir="rtl">
					<Button type="button" variant="ghost" onclick={() => blogForm.closeDialog()}>إغلاق</Button>
				</Dialog.Footer>
			{:else}
				<div class="py-4 space-y-4" dir="rtl">
					{#if blogForm.currentStep === 1}
						{@render infoForm()}
					{:else if blogForm.currentStep === 2}
						{@render mediaUploadForm()}
					{/if}
				</div>

				<Dialog.Footer class="flex justify-between items-center w-full gap-2 mt-4" dir="rtl">
					<div class="flex grow gap-2">
						<div class="text-red-400 text-xs">{err_msg}</div>
					</div>
					<div class="flex gap-2">
						{#if blogForm.currentStep > 1}
							<Button type="button" variant="outline" onclick={() => blogForm.prevStep()}>السابق</Button>
						{/if}

						<Button
							type="button"
							onsubmit={(e) => e.preventDefault()}
							onclick={() => (blogForm.currentStep === 2 ? submitForm() : blogForm.nextStep())}
							disabled={isSubmitting}>
							{isSubmitting ? 'جاري الحفظ...' : blogForm.currentStep === 2 ? 'حفظ البيانات' : 'التالي'}
						</Button>
						<Button type="button" variant="ghost" onclick={() => blogForm.closeDialog()}>إلغاء</Button>
					</div>
				</Dialog.Footer>
			{/if}
		</Dialog.Content>
	</Dialog.Root>
{/snippet}

{#snippet infoForm()}
	<div class="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
		<div class="grid gap-2">
			<Label for="title" class="text-right">عنوان المقال</Label>
			<Input
				id="title"
				bind:value={blogForm.title}
				placeholder="مثال: كيف تختار منزلك الأول في عمان؟"
				class="text-right" />
		</div>

		<div class="grid gap-2">
			<Label class="text-right">التصنيف</Label>
			<Select.Root type="single" bind:value={blogForm.category}>
				<Select.Trigger class="text-right w-full">
					{currentCategoryLabel}
				</Select.Trigger>
				<Select.Content class="dark">
					{#each categoryOptions as option (option.value)}
						<Select.Item value={option.value} class="text-right">{option.label}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>

		<div class="grid gap-2">
			<Label for="excerpt" class="text-right">المقتطف</Label>
			<Textarea
				id="excerpt"
				bind:value={blogForm.excerpt}
				placeholder="جملة أو جملتان تلخصان المقال (تظهر في بطاقة المقال ونتائج البحث)"
				class="text-right min-h-15 max-h-25" />
		</div>

		<div class="grid gap-2">
			<Label for="content" class="text-right">محتوى المقال (Markdown)</Label>
			<Textarea
				id="content"
				bind:value={blogForm.content}
				placeholder={contentPlaceholder}
				class="text-right min-h-50 max-h-100 font-mono text-sm" />
			<p class="text-xs text-muted-foreground text-right">
				يدعم صيغة Markdown: العناوين (##)، القوائم (-)، الروابط، والنص الغامق (**نص**).
			</p>
		</div>

		<div class="flex items-center gap-2 pt-2">
			<input
				type="checkbox"
				id="publish"
				bind:checked={blogForm.isPublished}
				class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
			<Label for="publish" class="text-right cursor-pointer">نشر المقال مباشرة في الموقع العام</Label>
		</div>
	</div>
{/snippet}

{#snippet mediaUploadForm()}
	<div class="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
		{#if blogForm.mediaFiles[0]}
			{@render cover(URL.createObjectURL(blogForm.mediaFiles[0]), removeNewCover)}
		{:else if blogForm.existingMedia[0]}
			{@render cover(blogForm.existingMedia[0].url)}
		{/if}

		<div
			class="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/30 rounded-lg p-10 gap-4 bg-muted/10 transition-colors hover:bg-muted/30">
			<div class="flex items-center justify-center w-14 h-14 rounded-full bg-background border shadow-sm">
				<Upload class="w-6 h-6 text-muted-foreground" />
			</div>
			<div class="text-center space-y-1">
				<h3 class="font-medium text-lg">
					{blogForm.mediaFiles[0] || blogForm.existingMedia[0] ? 'استبدل صورة الغلاف' : 'ارفع صورة غلاف المقال'}
				</h3>
				<p class="text-sm text-muted-foreground">صورة واحدة فقط، صيغ PNG, JPG (الحد الأقصى 10MB)</p>
			</div>

			<Button variant="outline" class="relative overflow-hidden mt-2">
				تصفح الملفات
				<input
					type="file"
					accept="image/*"
					class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
					onchange={handleFileSelect} />
			</Button>
		</div>
	</div>
{/snippet}

{#snippet cover(src: string, onRemove: (() => void) | null = null)}
	<div class="space-y-2">
		<Label class="text-right font-bold">صورة الغلاف</Label>
		<div class="relative rounded-md border p-2 w-fit">
			<img {src} alt="صورة الغلاف" class="h-40 object-cover rounded-sm border" />
			{#if onRemove}
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class="absolute top-3 left-3 h-7 w-7 bg-background/80 text-destructive hover:bg-destructive/10"
					onclick={onRemove}>
					<Trash2 class="w-4 h-4" />
				</Button>
			{/if}
		</div>
	</div>
{/snippet}

{#snippet viewBody()}
	<div class="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar" dir="rtl">
		<div class="grid grid-cols-2 gap-4">
			<div class="grid gap-1">
				<Label class="text-right text-muted-foreground text-xs">عنوان المقال</Label>
				<p class="text-right text-sm">{blogForm.title || '-'}</p>
			</div>
			<div class="grid gap-1">
				<Label class="text-right text-muted-foreground text-xs">التصنيف</Label>
				<p class="text-right text-sm">{currentCategoryLabel}</p>
			</div>
			<div class="grid gap-1 col-span-2">
				<Label class="text-right text-muted-foreground text-xs">المقتطف</Label>
				<p class="text-right text-sm whitespace-pre-wrap">{blogForm.excerpt || '-'}</p>
			</div>
			<div class="grid gap-1">
				<Label class="text-right text-muted-foreground text-xs">حالة النشر</Label>
				<Badge variant={blogForm.isPublished ? 'default' : 'outline'} class="w-fit">
					{blogForm.isPublished ? 'منشور' : 'غير منشور'}
				</Badge>
			</div>
		</div>

		<Separator />
		<div class="grid gap-1">
			<Label class="text-right text-muted-foreground text-xs">محتوى المقال (Markdown)</Label>
			<p class="text-right text-sm whitespace-pre-wrap font-mono">{blogForm.content || '-'}</p>
		</div>

		{#if blogForm.existingMedia[0]}
			<Separator />
			{@render cover(blogForm.existingMedia[0].url)}
		{/if}
	</div>
{/snippet}
