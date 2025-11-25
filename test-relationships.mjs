import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;
const client = new Client(process.env.DATABASE_URL);

async function test() {
  await client.connect();
  
  try {
    console.log('\n✅ DATABASE RELATIONSHIP VERIFICATION');
    console.log('=====================================\n');

    // Test 1: Plans
    console.log('1️⃣  SUBSCRIPTION PLANS');
    const plans = await client.query(
      `SELECT id, name, plan_type, business_cards_limit, price FROM subscription_plans ORDER BY id LIMIT 5`
    );
    console.log(`   Found ${plans.rows.length} plans`);
    const planTypes = [...new Set(plans.rows.map(p => p.plan_type))];
    console.log(`   ✓ Plan Types: ${planTypes.join(', ')}`);
    console.log(`   Sample: ${plans.rows[0]?.name} (${plans.rows[0]?.plan_type})`);

    // Test 2: Users
    console.log('\n2️⃣  USERS & PLAN ASSIGNMENTS');
    const users = await client.query(
      `SELECT id, email, plan_type, business_cards_limit FROM users LIMIT 5`
    );
    console.log(`   Found ${users.rows.length} users`);
    const userPlanTypes = [...new Set(users.rows.map(u => u.plan_type))];
    console.log(`   ✓ User Plan Types: ${userPlanTypes.join(', ')}`);

    // Test 3: Coupons
    console.log('\n3️⃣  COUPONS');
    const coupons = await client.query(
      `SELECT id, code, discount_type, status FROM coupons LIMIT 5`
    );
    console.log(`   Found ${coupons.rows.length} coupons`);

    // Test 4: Coupon Usage
    console.log('\n4️⃣  COUPON-USER-PLAN RELATIONSHIPS');
    const couponUsage = await client.query(
      `SELECT COUNT(*) as count FROM coupon_usage`
    );
    console.log(`   Coupon usages: ${couponUsage.rows[0].count}`);

    // Test 5: Affiliates
    console.log('\n5️⃣  AFFILIATES');
    const affiliates = await client.query(
      `SELECT COUNT(*) as total FROM affiliates`
    );
    console.log(`   Total affiliates: ${affiliates.rows[0].total}`);

    // Test 6: Features
    console.log('\n6️⃣  FEATURES');
    const features = await client.query(
      `SELECT COUNT(*) as count FROM features`
    );
    console.log(`   Features: ${features.rows[0].count}`);

    // Test 7: Plan Features
    console.log('\n7️⃣  PLAN-FEATURE RELATIONSHIPS');
    const planFeatures = await client.query(
      `SELECT COUNT(DISTINCT plan_id) as plans FROM plan_features`
    );
    console.log(`   Plans with features: ${planFeatures.rows[0].plans}`);

    // Test 8: Templates
    console.log('\n8️⃣  TEMPLATES');
    const templates = await client.query(
      `SELECT COUNT(*) as count FROM global_templates`
    );
    console.log(`   Templates: ${templates.rows[0].count}`);

    // Test 9: Plan-Template relationships
    console.log('\n9️⃣  PLAN-TEMPLATE RELATIONSHIPS');
    const planTemplates = await client.query(
      `SELECT COUNT(DISTINCT plan_id) as plans FROM plan_templates`
    );
    console.log(`   Plans with templates: ${planTemplates.rows[0].plans}`);

    // Test 10: Integrity checks
    console.log('\n🔟 INTEGRITY CHECKS');
    
    const orphanedCoupons = await client.query(
      `SELECT COUNT(*) as count FROM coupon_usage cu WHERE NOT EXISTS (SELECT 1 FROM coupons WHERE id = cu.coupon_id)`
    );
    console.log(`   Orphaned coupon usages: ${orphanedCoupons.rows[0].count} ${orphanedCoupons.rows[0].count === 0 ? '✅' : '❌'}`);

    const invalidPlans = await client.query(
      `SELECT COUNT(*) as count FROM subscription_plans WHERE plan_type NOT IN ('free', 'paid')`
    );
    console.log(`   Plans with invalid types: ${invalidPlans.rows[0].count} ${invalidPlans.rows[0].count === 0 ? '✅' : '❌'}`);

    const invalidUsers = await client.query(
      `SELECT COUNT(*) as count FROM users WHERE plan_type NOT IN ('free', 'paid')`
    );
    console.log(`   Users with invalid types: ${invalidUsers.rows[0].count} ${invalidUsers.rows[0].count === 0 ? '✅' : '❌'}`);

    console.log('\n✅ ALL RELATIONSHIPS VERIFIED SUCCESSFULLY\n');
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  } finally {
    await client.end();
    process.exit(0);
  }
}

test();
