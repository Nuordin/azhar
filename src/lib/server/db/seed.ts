// src/db/seed.ts
import { auth } from '../auth';

async function seedFirstAdmin() {
	console.log('Seeding initial admin account... 🛠️');

	try {
		// We use the admin plugin's internal API directly
		await auth.api.createUser({
			body: {
				name: 'Azhar', // Better Auth defaults to 'name'
				email: 'admin@onewayestate.com',
				password: 'securePassword123!',
				role: 'admin' // This is the crucial flag
			}
		});

		console.log('Admin account successfully created!');
	} catch (error) {
		console.error('Failed to create admin:', error);
	}

	process.exit(0);
}

seedFirstAdmin();
