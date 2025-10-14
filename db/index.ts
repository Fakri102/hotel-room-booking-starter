import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as authSchema from './schema/auth';
import * as roomsSchema from './schema/rooms';

export const db = drizzle(process.env.DATABASE_URL!, {
    schema: { ...authSchema, ...roomsSchema },
});

// Export schemas for easy access
export { authSchema, roomsSchema };
export * from './schema/auth';
export * from './schema/rooms';