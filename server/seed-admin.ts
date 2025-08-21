import { db } from './db';
import { users } from '@shared/schema';
import bcryptjs from 'bcryptjs';
import { eq } from 'drizzle-orm';

async function seedSuperAdmin() {
  try {
    // Check if super admin already exists
    const existingAdmin = await db.select()
      .from(users)
      .where(eq(users.email, 'admin@2talklink.com'))
      .limit(1);

    if (existingAdmin.length > 0) {
      console.log('Super admin already exists');
      return;
    }

    // Create super admin user
    const hashedPassword = await bcryptjs.hash('admin123', 12);
    
    const [superAdmin] = await db.insert(users).values({
      email: 'admin@2talklink.com',
      firstName: 'Super',
      lastName: 'Admin',
      password: hashedPassword,
      role: 'super_admin',
      planType: 'enterprise',
      businessCardsLimit: 999999,
      businessCardsCount: 0,
    }).returning();

    console.log('Super admin created successfully:', superAdmin.email);
    console.log('Email: admin@2talklink.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Failed to seed super admin:', error);
  } finally {
    process.exit();
  }
}

// Run if called directly
seedSuperAdmin();

export { seedSuperAdmin };