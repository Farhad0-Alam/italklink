import { db } from './db';
import { digitalProducts, users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function seedShopProducts() {
  try {
    const userList = await db.select().from(users).where(eq(users.email, 'design123abq@gmail.com'));
    const user = userList[0];
    
    if (!user) {
      console.log('[Shop Seed] User not found');
      return;
    }

    const existingProducts = await db.select().from(digitalProducts).where(eq(digitalProducts.sellerId, user.id));
    
    if (existingProducts.length > 0) {
      console.log(`[Shop Seed] Products already exist for user (${existingProducts.length} products)`);
      return;
    }

    console.log('[Shop Seed] ✅ Seeding shop products for user:', user.email);
  } catch (error) {
    console.error('[Shop Seed] Error:', error);
  }
}
