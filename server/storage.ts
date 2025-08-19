import { db } from './db';
import { users, businessCards, type User, type InsertUser, type DbBusinessCard, type InsertDbBusinessCard } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(userData: InsertUser): Promise<User>;
  updateUser(id: string, userData: Partial<InsertUser>): Promise<User>;
  updateUserLimits(id: string, businessCardsCount: number, businessCardsLimit?: number): Promise<User>;
  
  // Business card operations
  getUserBusinessCards(userId: string): Promise<DbBusinessCard[]>;
  getBusinessCard(id: string): Promise<DbBusinessCard | undefined>;
  getBusinessCardBySlug(shareSlug: string): Promise<DbBusinessCard | undefined>;
  createBusinessCard(cardData: InsertDbBusinessCard): Promise<DbBusinessCard>;
  updateBusinessCard(id: string, cardData: Partial<InsertDbBusinessCard>): Promise<DbBusinessCard>;
  deleteBusinessCard(id: string): Promise<void>;
  incrementBusinessCardViews(id: string): Promise<void>;
  
  // User stats
  getUserStats(userId: string): Promise<{
    totalBusinessCards: number;
    totalViews: number;
    planType: string;
    businessCardsLimit: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...userData,
      planType: userData.planType || 'free',
      businessCardsLimit: userData.businessCardsLimit || 1,
      businessCardsCount: 0,
    }).returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserLimits(id: string, businessCardsCount: number, businessCardsLimit?: number): Promise<User> {
    const updateData: any = { businessCardsCount, updatedAt: new Date() };
    if (businessCardsLimit !== undefined) {
      updateData.businessCardsLimit = businessCardsLimit;
    }
    
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Business card operations
  async getUserBusinessCards(userId: string): Promise<DbBusinessCard[]> {
    return await db
      .select()
      .from(businessCards)
      .where(eq(businessCards.userId, userId))
      .orderBy(desc(businessCards.createdAt));
  }

  async getBusinessCard(id: string): Promise<DbBusinessCard | undefined> {
    const [card] = await db.select().from(businessCards).where(eq(businessCards.id, id));
    return card;
  }

  async getBusinessCardBySlug(shareSlug: string): Promise<DbBusinessCard | undefined> {
    const [card] = await db.select().from(businessCards).where(eq(businessCards.shareSlug, shareSlug));
    return card;
  }

  async createBusinessCard(cardData: InsertDbBusinessCard): Promise<DbBusinessCard> {
    const [card] = await db.insert(businessCards).values(cardData).returning();
    
    // Update user's business cards count
    if (cardData.userId) {
      const userCards = await this.getUserBusinessCards(cardData.userId);
      await this.updateUserLimits(cardData.userId, userCards.length);
    }
    
    return card;
  }

  async updateBusinessCard(id: string, cardData: Partial<InsertDbBusinessCard>): Promise<DbBusinessCard> {
    const [card] = await db
      .update(businessCards)
      .set({ ...cardData, updatedAt: new Date() })
      .where(eq(businessCards.id, id))
      .returning();
    return card;
  }

  async deleteBusinessCard(id: string): Promise<void> {
    const card = await this.getBusinessCard(id);
    
    await db.delete(businessCards).where(eq(businessCards.id, id));
    
    // Update user's business cards count
    if (card?.userId) {
      const userCards = await this.getUserBusinessCards(card.userId);
      await this.updateUserLimits(card.userId, userCards.length);
    }
  }

  async incrementBusinessCardViews(id: string): Promise<void> {
    // Get current view count and increment
    const [currentCard] = await db.select({ viewCount: businessCards.viewCount }).from(businessCards).where(eq(businessCards.id, id));
    const newViewCount = (currentCard?.viewCount || 0) + 1;
    
    await db
      .update(businessCards)
      .set({
        viewCount: newViewCount,
        updatedAt: new Date()
      })
      .where(eq(businessCards.id, id));
  }

  // User stats
  async getUserStats(userId: string): Promise<{
    totalBusinessCards: number;
    totalViews: number;
    planType: string;
    businessCardsLimit: number;
  }> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const userCards = await this.getUserBusinessCards(userId);
    const totalViews = userCards.reduce((sum, card) => sum + (card.viewCount || 0), 0);

    return {
      totalBusinessCards: userCards.length,
      totalViews,
      planType: user.planType || 'free',
      businessCardsLimit: user.businessCardsLimit || 1,
    };
  }
}

export const storage = new DatabaseStorage();
