// src/lib/client/auth.ts
import { createAuthClient } from 'better-auth/client';
import { adminClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
	// Add the admin plugin here too so the client knows about admin features
	plugins: [adminClient()]
});
