import { db } from './db';
import { 
  users, businessCards, teams, teamMembers, bulkGenerationJobs, subscriptionPlans, globalTemplates,
  type User, type InsertUser, type DbBusinessCard, type InsertDbBusinessCard,
  type Team, type InsertTeam, type TeamMember, type InsertTeamMember,
  type BulkGenerationJob, type InsertBulkGenerationJob, type SubscriptionPlan, type GlobalTemplate
} from '@shared/schema';
import { eq, and, desc, count, inArray } from 'drizzle-orm';

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
  
  // Team operations
  getUserTeams(userId: string): Promise<Team[]>;
  getTeam(id: string): Promise<Team | undefined>;
  createTeam(teamData: InsertTeam): Promise<Team>;
  updateTeam(id: string, teamData: Partial<InsertTeam>): Promise<Team>;
  deleteTeam(id: string): Promise<void>;
  
  // Team member operations
  getTeamMembers(teamId: string): Promise<TeamMember[]>;
  getTeamMember(id: string): Promise<TeamMember | undefined>;
  createTeamMember(memberData: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(id: string, memberData: Partial<InsertTeamMember>): Promise<TeamMember>;
  deleteTeamMember(id: string): Promise<void>;
  getUserTeamMembership(userId: string): Promise<TeamMember[]>;
  
  // Bulk generation operations
  createBulkGenerationJob(jobData: InsertBulkGenerationJob): Promise<BulkGenerationJob>;
  getBulkGenerationJob(id: string): Promise<BulkGenerationJob | undefined>;
  getTeamBulkJobs(teamId: string): Promise<BulkGenerationJob[]>;
  updateBulkGenerationJob(id: string, jobData: Partial<InsertBulkGenerationJob>): Promise<BulkGenerationJob>;
  
  // User stats
  getUserStats(userId: string): Promise<{
    totalBusinessCards: number;
    totalViews: number;
    planType: string;
    businessCardsLimit: number;
    totalTeams: number;
    totalTeamMembers: number;
  }>;
  
  getTeamStats(teamId: string): Promise<{
    memberCount: number;
    activeMembers: number;
    totalCards: number;
    recentJobs: number;
  }>;
  
  // Plans operations
  getPlans(): Promise<SubscriptionPlan[]>;
  
  // Global templates operations
  getGlobalTemplates(filters?: { isActive?: boolean }): Promise<GlobalTemplate[]>;
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

  // Team operations
  async getUserTeams(userId: string): Promise<Team[]> {
    // Get teams owned by user
    const ownedTeams = await db.select().from(teams).where(eq(teams.ownerId, userId));
    
    // Get teams where user is a member
    const memberTeams = await db
      .select({
        id: teams.id,
        name: teams.name,
        description: teams.description,
        ownerId: teams.ownerId,
        maxMembers: teams.maxMembers,
        allowBulkGeneration: teams.allowBulkGeneration,
        defaultBrandColor: teams.defaultBrandColor,
        defaultAccentColor: teams.defaultAccentColor,
        defaultFont: teams.defaultFont,
        defaultTemplate: teams.defaultTemplate,
        teamLogo: teams.teamLogo,
        companyName: teams.companyName,
        companyWebsite: teams.companyWebsite,
        companyAddress: teams.companyAddress,
        createdAt: teams.createdAt,
        updatedAt: teams.updatedAt,
      })
      .from(teams)
      .innerJoin(teamMembers, eq(teamMembers.teamId, teams.id))
      .where(and(
        eq(teamMembers.userId, userId),
        eq(teamMembers.status, 'active')
      ));
    
    // Combine and deduplicate
    const allTeams = [...ownedTeams, ...memberTeams];
    const uniqueTeams = allTeams.filter((team, index, self) => 
      index === self.findIndex(t => t.id === team.id)
    );
    
    return uniqueTeams;
  }

  async getTeam(id: string): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team;
  }

  async createTeam(teamData: InsertTeam): Promise<Team> {
    const [team] = await db.insert(teams).values(teamData).returning();
    return team;
  }

  async updateTeam(id: string, teamData: Partial<InsertTeam>): Promise<Team> {
    const [team] = await db
      .update(teams)
      .set({ ...teamData, updatedAt: new Date() })
      .where(eq(teams.id, id))
      .returning();
    return team;
  }

  async deleteTeam(id: string): Promise<void> {
    await db.delete(teams).where(eq(teams.id, id));
  }

  // Team member operations
  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    return await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.teamId, teamId))
      .orderBy(desc(teamMembers.createdAt));
  }

  async getTeamMember(id: string): Promise<TeamMember | undefined> {
    const [member] = await db.select().from(teamMembers).where(eq(teamMembers.id, id));
    return member;
  }

  async createTeamMember(memberData: InsertTeamMember): Promise<TeamMember> {
    const [member] = await db.insert(teamMembers).values(memberData).returning();
    return member;
  }

  async updateTeamMember(id: string, memberData: Partial<InsertTeamMember>): Promise<TeamMember> {
    const [member] = await db
      .update(teamMembers)
      .set({ ...memberData, updatedAt: new Date() })
      .where(eq(teamMembers.id, id))
      .returning();
    return member;
  }

  async deleteTeamMember(id: string): Promise<void> {
    await db.delete(teamMembers).where(eq(teamMembers.id, id));
  }

  async getUserTeamMembership(userId: string): Promise<TeamMember[]> {
    return await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.userId, userId))
      .orderBy(desc(teamMembers.createdAt));
  }

  // Bulk generation operations
  async createBulkGenerationJob(jobData: InsertBulkGenerationJob): Promise<BulkGenerationJob> {
    const [job] = await db.insert(bulkGenerationJobs).values(jobData).returning();
    return job;
  }

  async getBulkGenerationJob(id: string): Promise<BulkGenerationJob | undefined> {
    const [job] = await db.select().from(bulkGenerationJobs).where(eq(bulkGenerationJobs.id, id));
    return job;
  }

  async getTeamBulkJobs(teamId: string): Promise<BulkGenerationJob[]> {
    return await db
      .select()
      .from(bulkGenerationJobs)
      .where(eq(bulkGenerationJobs.teamId, teamId))
      .orderBy(desc(bulkGenerationJobs.createdAt));
  }

  async updateBulkGenerationJob(id: string, jobData: Partial<InsertBulkGenerationJob>): Promise<BulkGenerationJob> {
    const [job] = await db
      .update(bulkGenerationJobs)
      .set(jobData)
      .where(eq(bulkGenerationJobs.id, id))
      .returning();
    return job;
  }

  // User stats
  async getUserStats(userId: string): Promise<{
    totalBusinessCards: number;
    totalViews: number;
    planType: string;
    businessCardsLimit: number;
    totalTeams: number;
    totalTeamMembers: number;
  }> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const userCards = await this.getUserBusinessCards(userId);
    const totalViews = userCards.reduce((sum, card) => sum + (card.viewCount || 0), 0);
    
    const userTeams = await this.getUserTeams(userId);
    const userMemberships = await this.getUserTeamMembership(userId);

    return {
      totalBusinessCards: userCards.length,
      totalViews,
      planType: user.planType || 'free',
      businessCardsLimit: user.businessCardsLimit || 1,
      totalTeams: userTeams.length,
      totalTeamMembers: userMemberships.length,
    };
  }
  
  async getTeamStats(teamId: string): Promise<{
    memberCount: number;
    activeMembers: number;
    totalCards: number;
    recentJobs: number;
  }> {
    const members = await this.getTeamMembers(teamId);
    const activeMembers = members.filter(m => m.status === 'active');
    
    // Get cards generated by team members
    const memberIds = members.map(m => m.businessCardId).filter(Boolean) as string[];
    const cards = memberIds.length > 0 
      ? await db.select().from(businessCards).where(inArray(businessCards.id, memberIds))
      : [];
    
    // Get recent bulk jobs (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentJobs = await db
      .select({ count: count() })
      .from(bulkGenerationJobs)
      .where(and(
        eq(bulkGenerationJobs.teamId, teamId),
        // Add date filter when we have proper timestamp comparison
      ));

    return {
      memberCount: members.length,
      activeMembers: activeMembers.length,
      totalCards: cards.length,
      recentJobs: recentJobs[0]?.count || 0,
    };
  }
  
  // Plans operations
  async getPlans(): Promise<SubscriptionPlan[]> {
    return await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.isActive, true))
      .orderBy(subscriptionPlans.price);
  }

  // Global templates operations
  async getGlobalTemplates(filters?: { isActive?: boolean }): Promise<GlobalTemplate[]> {
    let query = db.select().from(globalTemplates);
    
    if (filters?.isActive !== undefined) {
      query = query.where(eq(globalTemplates.isActive, filters.isActive));
    }
    
    return await query.orderBy(desc(globalTemplates.createdAt));
  }
}

export const storage = new DatabaseStorage();
