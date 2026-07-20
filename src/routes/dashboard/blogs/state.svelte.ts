export class BlogFormState {
	isOpen = $state(false);
	currentStep = $state(1);
	mode = $state<'edit' | 'view'>('edit');

	blogId = $state<number | null>(null);

	title = $state('');
	excerpt = $state('');
	content = $state('');
	category = $state('real_estate_tips');
	isPublished = $state(false);

	// صورة الغلاف: واحدة فقط لكل مقال
	mediaFiles = $state<File[]>([]);
	existingMedia = $state<{ id: number; url: string; type: string; isMain: boolean }[]>([]);
	deletedMediaIds = $state<number[]>([]);

	openDialog() {
		this.mode = 'edit';
		this.isOpen = true;
		this.currentStep = 1;
	}

	openView(data: unknown) {
		this.populate(data);
		this.mode = 'view';
		this.isOpen = true;
		this.currentStep = 1;
	}

	closeDialog() {
		this.isOpen = false;
	}

	nextStep() {
		if (this.currentStep < 2) this.currentStep += 1;
	}

	prevStep() {
		if (this.currentStep > 1) this.currentStep -= 1;
	}

	// دالة تعبئة البيانات عند التعديل
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	populate(data: any) {
		this.blogId = data.blog.id;
		this.category = data.blog.category;
		this.isPublished = data.blog.isPublished;

		this.title = data.translations?.title || '';
		this.excerpt = data.translations?.excerpt || '';
		this.content = data.translations?.content || '';

		this.existingMedia = data.media || [];
		this.deletedMediaIds = [];
		this.mediaFiles = [];
	}

	resetForm() {
		this.blogId = null;
		this.mode = 'edit';
		this.currentStep = 1;
		this.title = '';
		this.excerpt = '';
		this.content = '';
		this.category = 'real_estate_tips';
		this.isPublished = false;
		this.mediaFiles = [];
		this.existingMedia = [];
		this.deletedMediaIds = [];
	}
}

export const blogForm = new BlogFormState();
