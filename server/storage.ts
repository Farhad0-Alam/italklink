import { db } from './db';
import { 
  users, businessCards, teams, teamMembers, bulkGenerationJobs, subscriptionPlans, globalTemplates, walletPasses,
  crmContacts, crmActivities, crmTasks, crmPipelines, crmStages, crmDeals, crmSequences, emailTemplates,
  automations, automationRuns,
  type User, type InsertUser, type DbBusinessCard, type InsertDbBusinessCard,
  type Team, type InsertTeam, type TeamMember, type InsertTeamMember,
  type BulkGenerationJob, type InsertBulkGenerationJob, type SubscriptionPlan, type GlobalTemplate,
  type WalletPass, type InsertWalletPass,
  type CrmContact, type InsertCrmContact, type CrmActivity, type InsertCrmActivity,
  type CrmTask, type InsertCrmTask, type CrmPipeline, type InsertCrmPipeline,
  type CrmStage, type InsertCrmStage, type CrmDeal, type InsertCrmDeal,
  type CrmSequence, type InsertCrmSequence, type EmailTemplate, type InsertEmailTemplate,
  type Automation, type InsertAutomation, type AutomationRun, type InsertAutomationRun
} from '@shared/schema';
import { eq, and, desc, count, inArray, like, or, sql, gte, lte } from 'drizzle-orm';

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
  
  // Wallet pass operations
  getWalletPass(ecardId: string): Promise<WalletPass | undefined>;
  createWalletPass(passData: InsertWalletPass): Promise<WalletPass>;
  updateWalletPass(ecardId: string, passData: Partial<InsertWalletPass>): Promise<WalletPass>;

  // CRM Contact operations
  createContact(contactData: InsertCrmContact): Promise<CrmContact>;
  getContact(id: string): Promise<CrmContact | undefined>;
  getContactByEmail(email: string, ownerId: string): Promise<CrmContact | undefined>;
  getContactsByUser(userId: string, filters?: { search?: string; tags?: string[]; lifecycleStage?: string }): Promise<CrmContact[]>;
  updateContact(id: string, contactData: Partial<InsertCrmContact>): Promise<CrmContact>;
  deleteContact(id: string): Promise<void>;
  mergeContacts(primaryId: string, duplicateIds: string[]): Promise<CrmContact>;

  // CRM Activity operations
  createActivity(activityData: InsertCrmActivity): Promise<CrmActivity>;
  getActivity(id: string): Promise<CrmActivity | undefined>;
  getContactActivities(contactId: string, filters?: { type?: string; limit?: number }): Promise<CrmActivity[]>;
  getUserActivities(userId: string, filters?: { contactId?: string; type?: string; limit?: number }): Promise<CrmActivity[]>;
  updateActivity(id: string, activityData: Partial<InsertCrmActivity>): Promise<CrmActivity>;
  deleteActivity(id: string): Promise<void>;

  // CRM Task operations
  createTask(taskData: InsertCrmTask): Promise<CrmTask>;
  getTask(id: string): Promise<CrmTask | undefined>;
  getContactTasks(contactId: string, filters?: { status?: string; assignedTo?: string }): Promise<CrmTask[]>;
  getUserTasks(userId: string, filters?: { status?: string; type?: string; assignedTo?: string }): Promise<CrmTask[]>;
  updateTask(id: string, taskData: Partial<InsertCrmTask>): Promise<CrmTask>;
  deleteTask(id: string): Promise<void>;
  markTaskComplete(id: string): Promise<CrmTask>;

  // CRM Pipeline operations
  createPipeline(pipelineData: InsertCrmPipeline): Promise<CrmPipeline>;
  getPipeline(id: string): Promise<CrmPipeline | undefined>;
  getUserPipelines(userId: string): Promise<CrmPipeline[]>;
  updatePipeline(id: string, pipelineData: Partial<InsertCrmPipeline>): Promise<CrmPipeline>;
  deletePipeline(id: string): Promise<void>;
  setDefaultPipeline(userId: string, pipelineId: string): Promise<void>;

  // CRM Stage operations
  createStage(stageData: InsertCrmStage): Promise<CrmStage>;
  getStage(id: string): Promise<CrmStage | undefined>;
  getPipelineStages(pipelineId: string): Promise<CrmStage[]>;
  updateStage(id: string, stageData: Partial<InsertCrmStage>): Promise<CrmStage>;
  deleteStage(id: string): Promise<void>;
  reorderStages(pipelineId: string, stageOrders: { id: string; order: number }[]): Promise<void>;

  // CRM Deal operations
  createDeal(dealData: InsertCrmDeal): Promise<CrmDeal>;
  getDeal(id: string): Promise<CrmDeal | undefined>;
  getDealsByPipeline(pipelineId: string, filters?: { stageId?: string; status?: string }): Promise<CrmDeal[]>;
  getDealsByContact(contactId: string): Promise<CrmDeal[]>;
  getUserDeals(userId: string, filters?: { status?: string; pipelineId?: string }): Promise<CrmDeal[]>;
  updateDeal(id: string, dealData: Partial<InsertCrmDeal>): Promise<CrmDeal>;
  deleteDeal(id: string): Promise<void>;
  moveDealToStage(dealId: string, stageId: string): Promise<CrmDeal>;
  closeDeal(dealId: string, status: 'won' | 'lost', actualCloseDate?: Date): Promise<CrmDeal>;

  // CRM Sequence operations
  createSequence(sequenceData: InsertCrmSequence): Promise<CrmSequence>;
  getSequence(id: string): Promise<CrmSequence | undefined>;
  getUserSequences(userId: string, filters?: { isActive?: boolean }): Promise<CrmSequence[]>;
  updateSequence(id: string, sequenceData: Partial<InsertCrmSequence>): Promise<CrmSequence>;
  deleteSequence(id: string): Promise<void>;
  toggleSequenceStatus(id: string): Promise<CrmSequence>;

  // Email Template operations
  createEmailTemplate(templateData: InsertEmailTemplate): Promise<EmailTemplate>;
  getEmailTemplate(id: string): Promise<EmailTemplate | undefined>;
  getUserEmailTemplates(userId: string, filters?: { category?: string }): Promise<EmailTemplate[]>;
  updateEmailTemplate(id: string, templateData: Partial<InsertEmailTemplate>): Promise<EmailTemplate>;
  deleteEmailTemplate(id: string): Promise<void>;

  // CRM Stats and Analytics
  getContactStats(userId: string): Promise<{
    totalContacts: number;
    newContactsThisMonth: number;
    leadScore: { average: number; distribution: Record<string, number> };
    topSources: Array<{ source: string; count: number }>;
    lifecycleDistribution: Record<string, number>;
  }>;
  
  getDealStats(userId: string): Promise<{
    totalDeals: number;
    totalValue: number;
    wonDeals: number;
    wonValue: number;
    pipelineValue: number;
    averageDealSize: number;
    conversionRate: number;
  }>;

  getActivityStats(userId: string): Promise<{
    totalActivities: number;
    activitiesThisWeek: number;
    activityByType: Record<string, number>;
    upcomingTasks: number;
    overdueTasks: number;
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
    // First try to find by customUrl, then by shareSlug
    let [card] = await db.select().from(businessCards).where(eq(businessCards.customUrl, shareSlug));
    if (!card) {
      [card] = await db.select().from(businessCards).where(eq(businessCards.shareSlug, shareSlug));
    }
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
    // Remove problematic fields that shouldn't be updated
    const { id: cardId, createdAt, updatedAt, ...cleanCardData } = cardData;
    
    const [card] = await db
      .update(businessCards)
      .set({ ...cleanCardData, updatedAt: new Date() })
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
    const baseQuery = db.select().from(globalTemplates);
    
    if (filters?.isActive !== undefined) {
      return await baseQuery
        .where(eq(globalTemplates.isActive, filters.isActive))
        .orderBy(desc(globalTemplates.createdAt));
    }
    
    return await baseQuery.orderBy(desc(globalTemplates.createdAt));
  }

  // Wallet pass operations
  async getWalletPass(ecardId: string): Promise<WalletPass | undefined> {
    const [pass] = await db.select().from(walletPasses).where(eq(walletPasses.ecardId, ecardId));
    return pass;
  }

  async createWalletPass(passData: InsertWalletPass): Promise<WalletPass> {
    const [pass] = await db.insert(walletPasses).values(passData).returning();
    return pass;
  }

  async updateWalletPass(ecardId: string, passData: Partial<InsertWalletPass>): Promise<WalletPass> {
    const [pass] = await db
      .update(walletPasses)
      .set({ ...passData, updatedAt: new Date() })
      .where(eq(walletPasses.ecardId, ecardId))
      .returning();
    return pass;
  }

  // ===== CRM CONTACT OPERATIONS =====
  async createContact(contactData: InsertCrmContact): Promise<CrmContact> {
    const [contact] = await db.insert(crmContacts).values(contactData).returning();
    return contact;
  }

  async getContact(id: string): Promise<CrmContact | undefined> {
    const [contact] = await db
      .select({
        id: crmContacts.id,
        ownerUserId: crmContacts.ownerUserId,
        email: crmContacts.email,
        phone: crmContacts.phone,
        firstName: crmContacts.firstName,
        lastName: crmContacts.lastName,
        company: crmContacts.company,
        jobTitle: crmContacts.jobTitle,
        website: crmContacts.website,
        source: crmContacts.source,
        tags: crmContacts.tags,
        notes: crmContacts.notes,
        leadScore: crmContacts.leadScore,
        leadPriority: crmContacts.leadPriority,
        lifecycleStage: crmContacts.lifecycleStage,
        consentEmail: crmContacts.consentEmail,
        consentSms: crmContacts.consentSms,
        mergedFrom: crmContacts.mergedFrom,
        location: crmContacts.location,
        timezone: crmContacts.timezone,
        linkedin: crmContacts.linkedin,
        twitter: crmContacts.twitter,
        createdAt: crmContacts.createdAt,
        updatedAt: crmContacts.updatedAt
      })
      .from(crmContacts)
      .where(eq(crmContacts.id, id));
    return contact;
  }

  async getContactByEmail(email: string, ownerId: string): Promise<CrmContact | undefined> {
    const [contact] = await db
      .select()
      .from(crmContacts)
      .where(and(
        eq(crmContacts.email, email),
        eq(crmContacts.ownerUserId, ownerId)
      ));
    return contact;
  }

  async getContactsByUser(userId: string, filters?: { search?: string; tags?: string[]; lifecycleStage?: string }): Promise<CrmContact[]> {
    const conditions = [eq(crmContacts.ownerUserId, userId)];
    
    if (filters?.search) {
      conditions.push(
        or(
          like(crmContacts.firstName, `%${filters.search}%`),
          like(crmContacts.lastName, `%${filters.search}%`),
          like(crmContacts.email, `%${filters.search}%`),
          like(crmContacts.company, `%${filters.search}%`)
        )!
      );
    }
    
    if (filters?.lifecycleStage) {
      conditions.push(eq(crmContacts.lifecycleStage, filters.lifecycleStage as any));
    }
    
    return await db
      .select({
        id: crmContacts.id,
        ownerUserId: crmContacts.ownerUserId,
        email: crmContacts.email,
        phone: crmContacts.phone,
        firstName: crmContacts.firstName,
        lastName: crmContacts.lastName,
        company: crmContacts.company,
        jobTitle: crmContacts.jobTitle,
        website: crmContacts.website,
        source: crmContacts.source,
        tags: crmContacts.tags,
        notes: crmContacts.notes,
        leadScore: crmContacts.leadScore,
        leadPriority: crmContacts.leadPriority,
        lifecycleStage: crmContacts.lifecycleStage,
        consentEmail: crmContacts.consentEmail,
        consentSms: crmContacts.consentSms,
        mergedFrom: crmContacts.mergedFrom,
        location: crmContacts.location,
        timezone: crmContacts.timezone,
        linkedin: crmContacts.linkedin,
        twitter: crmContacts.twitter,
        createdAt: crmContacts.createdAt,
        updatedAt: crmContacts.updatedAt
      })
      .from(crmContacts)
      .where(and(...conditions))
      .orderBy(desc(crmContacts.createdAt));
  }

  async updateContact(id: string, contactData: Partial<InsertCrmContact>): Promise<CrmContact> {
    const [contact] = await db
      .update(crmContacts)
      .set({ ...contactData, updatedAt: new Date() })
      .where(eq(crmContacts.id, id))
      .returning();
    return contact;
  }

  async deleteContact(id: string): Promise<void> {
    await db.delete(crmContacts).where(eq(crmContacts.id, id));
  }

  async mergeContacts(primaryId: string, duplicateIds: string[]): Promise<CrmContact> {
    // Get the primary contact
    const primary = await this.getContact(primaryId);
    if (!primary) {
      throw new Error('Primary contact not found');
    }

    // Get duplicate contacts
    const duplicates = await db
      .select()
      .from(crmContacts)
      .where(inArray(crmContacts.id, duplicateIds));

    // Update primary contact to include merged IDs
    const mergedFromIds = Array.isArray(primary.mergedFrom) ? [...primary.mergedFrom, ...duplicateIds] : duplicateIds;
    
    // Merge data from duplicates (keeping non-empty values)
    const mergedData: Partial<InsertCrmContact> = {
      mergedFrom: mergedFromIds,
    };

    // Update activities and tasks to point to primary contact
    await db
      .update(crmActivities)
      .set({ contactId: primaryId })
      .where(inArray(crmActivities.contactId, duplicateIds));
      
    await db
      .update(crmTasks)
      .set({ contactId: primaryId })
      .where(inArray(crmTasks.contactId, duplicateIds));

    // Delete duplicate contacts
    await db.delete(crmContacts).where(inArray(crmContacts.id, duplicateIds));

    // Update and return primary contact
    return await this.updateContact(primaryId, mergedData);
  }

  // ===== CRM ACTIVITY OPERATIONS =====
  async createActivity(activityData: InsertCrmActivity): Promise<CrmActivity> {
    const [activity] = await db.insert(crmActivities).values(activityData).returning();
    return activity;
  }

  async getActivity(id: string): Promise<CrmActivity | undefined> {
    const [activity] = await db.select().from(crmActivities).where(eq(crmActivities.id, id));
    return activity;
  }

  async getContactActivities(contactId: string, filters?: { type?: string; limit?: number }): Promise<CrmActivity[]> {
    const conditions = [eq(crmActivities.contactId, contactId)];
    
    if (filters?.type) {
      conditions.push(eq(crmActivities.type, filters.type as any));
    }
    
    const baseQuery = db
      .select()
      .from(crmActivities)
      .where(and(...conditions))
      .orderBy(desc(crmActivities.createdAt));
    
    if (filters?.limit) {
      return await baseQuery.limit(filters.limit);
    }
    
    return await baseQuery;
  }

  async getUserActivities(userId: string, filters?: { contactId?: string; type?: string; limit?: number }): Promise<CrmActivity[]> {
    const conditions = [eq(crmActivities.createdBy, userId)];
    
    if (filters?.contactId) {
      conditions.push(eq(crmActivities.contactId, filters.contactId));
    }
    
    if (filters?.type) {
      conditions.push(eq(crmActivities.type, filters.type as any));
    }
    
    const baseQuery = db
      .select()
      .from(crmActivities)
      .where(and(...conditions))
      .orderBy(desc(crmActivities.createdAt));
    
    if (filters?.limit) {
      return await baseQuery.limit(filters.limit);
    }
    
    return await baseQuery;
  }

  async updateActivity(id: string, activityData: Partial<InsertCrmActivity>): Promise<CrmActivity> {
    const [activity] = await db
      .update(crmActivities)
      .set(activityData)
      .where(eq(crmActivities.id, id))
      .returning();
    return activity;
  }

  async deleteActivity(id: string): Promise<void> {
    await db.delete(crmActivities).where(eq(crmActivities.id, id));
  }

  // ===== CRM TASK OPERATIONS =====
  async createTask(taskData: InsertCrmTask): Promise<CrmTask> {
    const [task] = await db.insert(crmTasks).values(taskData).returning();
    return task;
  }

  async getTask(id: string): Promise<CrmTask | undefined> {
    const [task] = await db.select().from(crmTasks).where(eq(crmTasks.id, id));
    return task;
  }

  async getContactTasks(contactId: string, filters?: { status?: string; assignedTo?: string }): Promise<CrmTask[]> {
    const conditions = [eq(crmTasks.contactId, contactId)];
    
    if (filters?.status) {
      conditions.push(eq(crmTasks.status, filters.status as any));
    }
    
    if (filters?.assignedTo) {
      conditions.push(eq(crmTasks.assignedTo, filters.assignedTo));
    }
    
    return await db
      .select()
      .from(crmTasks)
      .where(and(...conditions))
      .orderBy(desc(crmTasks.createdAt));
  }

  async getUserTasks(userId: string, filters?: { status?: string; type?: string; assignedTo?: string }): Promise<CrmTask[]> {
    const conditions = [
      eq(crmTasks.assignedTo, userId)
    ];
    
    if (filters?.status) {
      conditions.push(eq(crmTasks.status, filters.status as any));
    }
    
    if (filters?.type) {
      conditions.push(eq(crmTasks.type, filters.type as any));
    }
    
    if (filters?.assignedTo) {
      conditions.push(eq(crmTasks.assignedTo, filters.assignedTo));
    }
    
    return await db
      .select()
      .from(crmTasks)
      .where(and(...conditions))
      .orderBy(desc(crmTasks.createdAt));
  }

  async updateTask(id: string, taskData: Partial<InsertCrmTask>): Promise<CrmTask> {
    const [task] = await db
      .update(crmTasks)
      .set({ ...taskData, updatedAt: new Date() })
      .where(eq(crmTasks.id, id))
      .returning();
    return task;
  }

  async deleteTask(id: string): Promise<void> {
    await db.delete(crmTasks).where(eq(crmTasks.id, id));
  }

  async markTaskComplete(id: string): Promise<CrmTask> {
    return await this.updateTask(id, { 
      status: 'done', 
      completedAt: new Date() 
    });
  }

  // ===== CRM PIPELINE OPERATIONS =====
  async createPipeline(pipelineData: InsertCrmPipeline): Promise<CrmPipeline> {
    const [pipeline] = await db.insert(crmPipelines).values(pipelineData).returning();
    return pipeline;
  }

  async getPipeline(id: string): Promise<CrmPipeline | undefined> {
    const [pipeline] = await db.select().from(crmPipelines).where(eq(crmPipelines.id, id));
    return pipeline;
  }

  async getUserPipelines(userId: string): Promise<CrmPipeline[]> {
    return await db
      .select({
        id: crmPipelines.id,
        ownerUserId: crmPipelines.ownerUserId,
        name: crmPipelines.name,
        description: crmPipelines.description,
        isDefault: crmPipelines.isDefault,
        isActive: crmPipelines.isActive,
        createdAt: crmPipelines.createdAt,
        updatedAt: crmPipelines.updatedAt
      })
      .from(crmPipelines)
      .where(eq(crmPipelines.ownerUserId, userId))
      .orderBy(desc(crmPipelines.isDefault), desc(crmPipelines.createdAt));
  }

  async updatePipeline(id: string, pipelineData: Partial<InsertCrmPipeline>): Promise<CrmPipeline> {
    const [pipeline] = await db
      .update(crmPipelines)
      .set({ ...pipelineData, updatedAt: new Date() })
      .where(eq(crmPipelines.id, id))
      .returning();
    return pipeline;
  }

  async deletePipeline(id: string): Promise<void> {
    await db.delete(crmPipelines).where(eq(crmPipelines.id, id));
  }

  async setDefaultPipeline(userId: string, pipelineId: string): Promise<void> {
    // Remove default flag from all pipelines
    await db
      .update(crmPipelines)
      .set({ isDefault: false })
      .where(eq(crmPipelines.ownerUserId, userId));
    
    // Set new default
    await db
      .update(crmPipelines)
      .set({ isDefault: true })
      .where(eq(crmPipelines.id, pipelineId));
  }

  // ===== CRM STAGE OPERATIONS =====
  async createStage(stageData: InsertCrmStage): Promise<CrmStage> {
    const [stage] = await db.insert(crmStages).values(stageData).returning();
    return stage;
  }

  async getStage(id: string): Promise<CrmStage | undefined> {
    const [stage] = await db.select().from(crmStages).where(eq(crmStages.id, id));
    return stage;
  }

  async getPipelineStages(pipelineId: string): Promise<CrmStage[]> {
    return await db
      .select()
      .from(crmStages)
      .where(eq(crmStages.pipelineId, pipelineId))
      .orderBy(crmStages.order);
  }

  async updateStage(id: string, stageData: Partial<InsertCrmStage>): Promise<CrmStage> {
    const [stage] = await db
      .update(crmStages)
      .set(stageData)
      .where(eq(crmStages.id, id))
      .returning();
    return stage;
  }

  async deleteStage(id: string): Promise<void> {
    await db.delete(crmStages).where(eq(crmStages.id, id));
  }

  async reorderStages(pipelineId: string, stageOrders: { id: string; order: number }[]): Promise<void> {
    // Update each stage's order
    for (const { id, order } of stageOrders) {
      await db
        .update(crmStages)
        .set({ order })
        .where(and(
          eq(crmStages.id, id),
          eq(crmStages.pipelineId, pipelineId)
        ));
    }
  }

  // ===== CRM DEAL OPERATIONS =====
  async createDeal(dealData: InsertCrmDeal): Promise<CrmDeal> {
    const [deal] = await db.insert(crmDeals).values(dealData).returning();
    return deal;
  }

  async getDeal(id: string): Promise<CrmDeal | undefined> {
    const [deal] = await db.select().from(crmDeals).where(eq(crmDeals.id, id));
    return deal;
  }

  async getDealsByPipeline(pipelineId: string, filters?: { stageId?: string; status?: string }): Promise<CrmDeal[]> {
    const conditions = [eq(crmDeals.pipelineId, pipelineId)];
    
    if (filters?.stageId) {
      conditions.push(eq(crmDeals.stageId, filters.stageId));
    }
    
    if (filters?.status) {
      conditions.push(eq(crmDeals.status, filters.status as any));
    }
    
    return await db
      .select()
      .from(crmDeals)
      .where(and(...conditions))
      .orderBy(desc(crmDeals.createdAt));
  }

  async getDealsByContact(contactId: string): Promise<CrmDeal[]> {
    return await db
      .select()
      .from(crmDeals)
      .where(eq(crmDeals.primaryContactId, contactId))
      .orderBy(desc(crmDeals.createdAt));
  }

  async getUserDeals(userId: string, filters?: { status?: string; pipelineId?: string }): Promise<CrmDeal[]> {
    const conditions = [eq(crmDeals.ownerUserId, userId)];
    
    if (filters?.status) {
      conditions.push(eq(crmDeals.status, filters.status as any));
    }
    
    if (filters?.pipelineId) {
      conditions.push(eq(crmDeals.pipelineId, filters.pipelineId));
    }
    
    return await db
      .select()
      .from(crmDeals)
      .where(and(...conditions))
      .orderBy(desc(crmDeals.createdAt));
  }

  async updateDeal(id: string, dealData: Partial<InsertCrmDeal>): Promise<CrmDeal> {
    const [deal] = await db
      .update(crmDeals)
      .set({ ...dealData, updatedAt: new Date() })
      .where(eq(crmDeals.id, id))
      .returning();
    return deal;
  }

  async deleteDeal(id: string): Promise<void> {
    await db.delete(crmDeals).where(eq(crmDeals.id, id));
  }

  async moveDealToStage(dealId: string, stageId: string): Promise<CrmDeal> {
    return await this.updateDeal(dealId, { stageId });
  }

  async closeDeal(dealId: string, status: 'won' | 'lost', actualCloseDate?: Date): Promise<CrmDeal> {
    return await this.updateDeal(dealId, {
      status,
      actualCloseDate: actualCloseDate || new Date()
    });
  }

  // ===== CRM SEQUENCE OPERATIONS =====
  async createSequence(sequenceData: InsertCrmSequence): Promise<CrmSequence> {
    const [sequence] = await db.insert(crmSequences).values(sequenceData).returning();
    return sequence;
  }

  async getSequence(id: string): Promise<CrmSequence | undefined> {
    const [sequence] = await db.select().from(crmSequences).where(eq(crmSequences.id, id));
    return sequence;
  }

  async getUserSequences(userId: string, filters?: { isActive?: boolean }): Promise<CrmSequence[]> {
    const conditions = [eq(crmSequences.ownerUserId, userId)];
    
    if (filters?.isActive !== undefined) {
      conditions.push(eq(crmSequences.isActive, filters.isActive));
    }
    
    return await db
      .select()
      .from(crmSequences)
      .where(and(...conditions))
      .orderBy(desc(crmSequences.createdAt));
  }

  async updateSequence(id: string, sequenceData: Partial<InsertCrmSequence>): Promise<CrmSequence> {
    const [sequence] = await db
      .update(crmSequences)
      .set({ ...sequenceData, updatedAt: new Date() })
      .where(eq(crmSequences.id, id))
      .returning();
    return sequence;
  }

  async deleteSequence(id: string): Promise<void> {
    await db.delete(crmSequences).where(eq(crmSequences.id, id));
  }

  async toggleSequenceStatus(id: string): Promise<CrmSequence> {
    const sequence = await this.getSequence(id);
    if (!sequence) {
      throw new Error('Sequence not found');
    }
    
    return await this.updateSequence(id, { isActive: !sequence.isActive });
  }

  // ===== AUTOMATION OPERATIONS =====
  async createAutomation(automationData: InsertAutomation): Promise<Automation> {
    const [automation] = await db.insert(automations).values(automationData).returning();
    return automation;
  }

  async getAutomation(id: string): Promise<Automation | undefined> {
    const [automation] = await db.select().from(automations).where(eq(automations.id, id));
    return automation;
  }

  async getUserAutomations(userId: string): Promise<Automation[]> {
    return await db
      .select()
      .from(automations)
      .where(eq(automations.ownerUserId, userId))
      .orderBy(desc(automations.createdAt));
  }

  async updateAutomation(id: string, automationData: Partial<InsertAutomation>): Promise<Automation> {
    const [automation] = await db
      .update(automations)
      .set({ ...automationData, updatedAt: new Date() })
      .where(eq(automations.id, id))
      .returning();
    return automation;
  }

  async deleteAutomation(id: string): Promise<void> {
    await db.delete(automations).where(eq(automations.id, id));
  }

  async getEnabledAutomations(userId: string): Promise<Automation[]> {
    return await db
      .select()
      .from(automations)
      .where(and(
        eq(automations.ownerUserId, userId),
        eq(automations.enabled, true)
      ))
      .orderBy(desc(automations.createdAt));
  }

  async incrementAutomationRuns(automationId: string, successful: boolean): Promise<void> {
    const automation = await this.getAutomation(automationId);
    if (!automation) return;

    await db
      .update(automations)
      .set({
        totalRuns: automation.totalRuns + 1,
        successfulRuns: successful ? automation.successfulRuns + 1 : automation.successfulRuns,
        lastTriggered: new Date(),
        updatedAt: new Date()
      })
      .where(eq(automations.id, automationId));
  }

  // ===== AUTOMATION RUN OPERATIONS =====
  async createAutomationRun(runData: InsertAutomationRun): Promise<AutomationRun> {
    const [run] = await db.insert(automationRuns).values(runData).returning();
    return run;
  }

  async getAutomationRun(id: string): Promise<AutomationRun | undefined> {
    const [run] = await db.select().from(automationRuns).where(eq(automationRuns.id, id));
    return run;
  }

  async getAutomationRuns(automationId: string, limit = 50): Promise<AutomationRun[]> {
    return await db
      .select()
      .from(automationRuns)
      .where(eq(automationRuns.automationId, automationId))
      .orderBy(desc(automationRuns.createdAt))
      .limit(limit);
  }

  async getUserAutomationRuns(userId: string, limit = 100): Promise<AutomationRun[]> {
    return await db
      .select({
        id: automationRuns.id,
        automationId: automationRuns.automationId,
        triggerEvent: automationRuns.triggerEvent,
        triggerPayload: automationRuns.triggerPayload,
        status: automationRuns.status,
        startedAt: automationRuns.startedAt,
        completedAt: automationRuns.completedAt,
        executionLog: automationRuns.executionLog,
        errorMessage: automationRuns.errorMessage,
        actionsExecuted: automationRuns.actionsExecuted,
        actionsFailed: automationRuns.actionsFailed,
        createdAt: automationRuns.createdAt,
        automationName: automations.name
      })
      .from(automationRuns)
      .innerJoin(automations, eq(automationRuns.automationId, automations.id))
      .where(eq(automations.ownerUserId, userId))
      .orderBy(desc(automationRuns.createdAt))
      .limit(limit);
  }

  async updateAutomationRun(id: string, runData: Partial<InsertAutomationRun>): Promise<AutomationRun> {
    const [run] = await db
      .update(automationRuns)
      .set(runData)
      .where(eq(automationRuns.id, id))
      .returning();
    return run;
  }

  async completeAutomationRun(id: string, status: string, executionLog: any[], errorMessage?: string): Promise<void> {
    await db
      .update(automationRuns)
      .set({
        status,
        completedAt: new Date(),
        executionLog,
        errorMessage,
        actionsExecuted: executionLog.filter(log => log.status === 'success').length,
        actionsFailed: executionLog.filter(log => log.status === 'failed').length
      })
      .where(eq(automationRuns.id, id));
  }

  // ===== EMAIL TEMPLATE OPERATIONS =====
  async createEmailTemplate(templateData: InsertEmailTemplate): Promise<EmailTemplate> {
    const [template] = await db.insert(emailTemplates).values(templateData).returning();
    return template;
  }

  async getEmailTemplate(id: string): Promise<EmailTemplate | undefined> {
    const [template] = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id));
    return template;
  }

  async getUserEmailTemplates(userId: string, filters?: { category?: string }): Promise<EmailTemplate[]> {
    const conditions = [eq(emailTemplates.ownerUserId, userId)];
    
    if (filters?.category) {
      conditions.push(eq(emailTemplates.category, filters.category));
    }
    
    return await db
      .select()
      .from(emailTemplates)
      .where(and(...conditions))
      .orderBy(desc(emailTemplates.createdAt));
  }

  async updateEmailTemplate(id: string, templateData: Partial<InsertEmailTemplate>): Promise<EmailTemplate> {
    const [template] = await db
      .update(emailTemplates)
      .set({ ...templateData, updatedAt: new Date() })
      .where(eq(emailTemplates.id, id))
      .returning();
    return template;
  }

  async deleteEmailTemplate(id: string): Promise<void> {
    await db.delete(emailTemplates).where(eq(emailTemplates.id, id));
  }

  // ===== CRM STATS AND ANALYTICS =====
  async getContactStats(userId: string): Promise<{
    totalContacts: number;
    newContactsThisMonth: number;
    leadScore: { average: number; distribution: Record<string, number> };
    topSources: Array<{ source: string; count: number }>;
    lifecycleDistribution: Record<string, number>;
  }> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [totalContactsResult] = await db
      .select({ count: count() })
      .from(crmContacts)
      .where(eq(crmContacts.ownerUserId, userId));

    const [newContactsResult] = await db
      .select({ count: count() })
      .from(crmContacts)
      .where(and(
        eq(crmContacts.ownerUserId, userId),
        gte(crmContacts.createdAt, startOfMonth)
      ));

    const contacts = await db
      .select({
        leadScore: crmContacts.leadScore,
        source: crmContacts.source,
        lifecycleStage: crmContacts.lifecycleStage
      })
      .from(crmContacts)
      .where(eq(crmContacts.ownerUserId, userId));

    const totalContacts = totalContactsResult.count || 0;
    const newContactsThisMonth = newContactsResult.count || 0;
    
    // Calculate lead score stats
    const leadScores = contacts.map(c => c.leadScore || 0).filter(score => score > 0);
    const averageLeadScore = leadScores.length > 0 ? leadScores.reduce((a, b) => a + b, 0) / leadScores.length : 0;
    
    // Lead score distribution
    const leadScoreDistribution = leadScores.reduce((acc: Record<string, number>, score) => {
      const range = score < 25 ? '0-25' : score < 50 ? '25-50' : score < 75 ? '50-75' : '75-100';
      acc[range] = (acc[range] || 0) + 1;
      return acc;
    }, {});

    // Top sources
    const sourceCount = contacts.reduce((acc: Record<string, number>, contact) => {
      const source = contact.source || 'unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});
    
    const topSources = Object.entries(sourceCount)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Lifecycle distribution
    const lifecycleDistribution = contacts.reduce((acc: Record<string, number>, contact) => {
      const stage = contact.lifecycleStage || 'visitor';
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    }, {});

    return {
      totalContacts,
      newContactsThisMonth,
      leadScore: {
        average: Math.round(averageLeadScore * 100) / 100,
        distribution: leadScoreDistribution
      },
      topSources,
      lifecycleDistribution
    };
  }

  async getDealStats(userId: string): Promise<{
    totalDeals: number;
    totalValue: number;
    wonDeals: number;
    wonValue: number;
    pipelineValue: number;
    averageDealSize: number;
    conversionRate: number;
  }> {
    const deals = await db
      .select({
        status: crmDeals.status,
        value: crmDeals.value
      })
      .from(crmDeals)
      .where(eq(crmDeals.ownerUserId, userId));

    const totalDeals = deals.length;
    const totalValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
    const wonDeals = deals.filter(deal => deal.status === 'won');
    const wonValue = wonDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
    const pipelineValue = deals
      .filter(deal => deal.status === 'open')
      .reduce((sum, deal) => sum + (deal.value || 0), 0);
    
    const averageDealSize = totalDeals > 0 ? totalValue / totalDeals : 0;
    const conversionRate = totalDeals > 0 ? (wonDeals.length / totalDeals) * 100 : 0;

    return {
      totalDeals,
      totalValue,
      wonDeals: wonDeals.length,
      wonValue,
      pipelineValue,
      averageDealSize: Math.round(averageDealSize * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100
    };
  }

  async getActivityStats(userId: string): Promise<{
    totalActivities: number;
    activitiesThisWeek: number;
    activityByType: Record<string, number>;
    upcomingTasks: number;
    overdueTasks: number;
  }> {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const [totalActivitiesResult] = await db
      .select({ count: count() })
      .from(crmActivities)
      .where(eq(crmActivities.createdBy, userId));

    const [activitiesThisWeekResult] = await db
      .select({ count: count() })
      .from(crmActivities)
      .where(and(
        eq(crmActivities.createdBy, userId),
        gte(crmActivities.createdAt, startOfWeek)
      ));

    const activities = await db
      .select({ type: crmActivities.type })
      .from(crmActivities)
      .where(eq(crmActivities.createdBy, userId));

    const activityByType = activities.reduce((acc: Record<string, number>, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {});

    const now = new Date();
    const [upcomingTasksResult] = await db
      .select({ count: count() })
      .from(crmTasks)
      .where(and(
        eq(crmTasks.assignedTo, userId),
        eq(crmTasks.status, 'open'),
        gte(crmTasks.dueAt, now)
      ));

    const [overdueTasksResult] = await db
      .select({ count: count() })
      .from(crmTasks)
      .where(and(
        eq(crmTasks.assignedTo, userId),
        eq(crmTasks.status, 'open'),
        lte(crmTasks.dueAt, now)
      ));

    return {
      totalActivities: totalActivitiesResult.count || 0,
      activitiesThisWeek: activitiesThisWeekResult.count || 0,
      activityByType,
      upcomingTasks: upcomingTasksResult.count || 0,
      overdueTasks: overdueTasksResult.count || 0
    };
  }
}

export const storage = new DatabaseStorage();
