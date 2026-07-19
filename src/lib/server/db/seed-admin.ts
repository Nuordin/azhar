// src/lib/server/db/seed-admin.ts
// إنشاء حساب المدير الأول عبر better-auth.
// ملاحظة: يعتمد على وقت تشغيل SvelteKit (يستورد `$app/server` عبر auth.ts)،
// لذا يُنفَّذ ضمن بيئة التطبيق وليس كسكربت tsx مستقل.
import { auth } from '../auth';

async function seedFirstAdmin() {
	console.log('Seeding initial admin account... 🛠️');

	try {
		await auth.api.createUser({
			body: {
				name: 'Azhar',
				email: 'admin@onewayestate.com',
				password: 'securePassword123!',
				role: 'admin'
			}
		});

		console.log('Admin account successfully created!');
	} catch (error) {
		console.error('Failed to create admin:', error);
	}

	process.exit(0);
}

seedFirstAdmin();
