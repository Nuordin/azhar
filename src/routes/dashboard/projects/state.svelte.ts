export class ProjectFormState {
	isOpen = $state(false);
	currentStep = $state(1);

	parentId = $state<string>('none');
	title = $state('');
	developerName = $state('');
	locationName = $state('');
	description = $state('');

	ownershipType = $state('');
	constructionStatus = $state('');
	completionPercentage = $state('');
	startingPrice = $state<number | undefined>(undefined);
	deliveryDate = $state('');
	isPublished = $state(false);

	amenities = $state<{ title: string; icon: string }[]>([]);
	paymentPlans = $state<{ title: string; description: string }[]>([]);
	details = $state<{ title: string; description: string }[]>([]);

	mediaFiles = $state<File[]>([]);
	thumbnailIndex = $state(0);

	openDialog() {
		this.isOpen = true;
		this.currentStep = 1;
	}

	closeDialog() {
		this.isOpen = false;
	}

	nextStep() {
		if (this.currentStep < 4) {
			this.currentStep += 1;
		}
	}

	prevStep() {
		if (this.currentStep > 1) {
			this.currentStep -= 1;
		}
	}

	resetForm() {
		this.currentStep = 1;
		this.parentId = 'none';
		this.title = '';
		this.developerName = '';
		this.locationName = '';
		this.description = '';
		this.ownershipType = '';
		this.constructionStatus = '';
		this.completionPercentage = '0';
		this.startingPrice = undefined;
		this.deliveryDate = '';
		this.isPublished = false;
		this.amenities = [];
		this.paymentPlans = [];
		this.details = [];
		this.mediaFiles = [];
		this.thumbnailIndex = 0;
	}
}

export const projectForm = new ProjectFormState();
