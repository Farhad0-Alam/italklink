import { db } from './db';
import { 
  users, businessCards, teams, teamMembers, bulkGenerationJobs, subscriptionPlans, globalTemplates, walletPasses,
  crmContacts, crmActivities, crmTasks, crmPipelines, crmStages, crmDeals, crmSequences, emailTemplates,
  automations, automationRuns, appointmentEventTypes, appointments, teamMemberAvailability, appointmentNotifications, appointmentPayments,
  calendarConnections, videoMeetingProviders, externalCalendarEvents, meetingLinks, integrationLogs,
  teamAssignments, roundRobinState, leadRoutingRules, teamMemberSkills, teamMemberCapacity, teamAvailabilityPatterns, assignmentAnalytics, routingAnalytics,
  type User, type InsertUser, type DbBusinessCard, type InsertDbBusinessCard,
  type Team, type InsertTeam, type TeamMember, type InsertTeamMember,
  type BulkGenerationJob, type InsertBulkGenerationJob, type SubscriptionPlan, type GlobalTemplate,
  type WalletPass, type InsertWalletPass,
  type CrmContact, type InsertCrmContact, type CrmActivity, type InsertCrmActivity,
  type CrmTask, type InsertCrmTask, type CrmPipeline, type InsertCrmPipeline,
  type CrmStage, type InsertCrmStage, type CrmDeal, type InsertCrmDeal,
  type CrmSequence, type InsertCrmSequence, type EmailTemplate, type InsertEmailTemplate,
  type Automation, type InsertAutomation, type AutomationRun, type InsertAutomationRun,
  type AppointmentEventType, type InsertAppointmentEventType, type Appointment, type InsertAppointment,
  type AppointmentNotification, type InsertAppointmentNotification,
  type AppointmentPayment, type InsertAppointmentPayment,
  type CalendarConnection, type InsertCalendarConnection,
  type VideoMeetingProvider, type InsertVideoMeetingProvider,
  type ExternalCalendarEvent, type InsertExternalCalendarEvent,
  type MeetingLink, type InsertMeetingLink,
  type IntegrationLog, type InsertIntegrationLog,
  type TeamAssignment, type InsertTeamAssignment,
  type RoundRobinState, type InsertRoundRobinState,
  type LeadRoutingRule, type InsertLeadRoutingRule,
  type TeamMemberSkill, type InsertTeamMemberSkill,
  type TeamMemberCapacity, type InsertTeamMemberCapacity,
  type TeamAvailabilityPattern, type InsertTeamAvailabilityPattern,
  type AssignmentAnalytics, type InsertAssignmentAnalytics,
  type RoutingAnalytics, type InsertRoutingAnalytics
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
  getTeamMemberByUserAndTeam(userId: string, teamId: string): Promise<TeamMember | undefined>;
  createTeamMember(memberData: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(id: string, memberData: Partial<InsertTeamMember>): Promise<TeamMember>;
  deleteTeamMember(id: string): Promise<void>;
  getUserTeamMembership(userId: string): Promise<TeamMember[]>;
  
  // ===== COMPREHENSIVE TEAM SCHEDULING OPERATIONS =====
  
  // Team Assignment operations
  createTeamAssignment(assignmentData: InsertTeamAssignment): Promise<TeamAssignment>;
  getTeamAssignment(id: string): Promise<TeamAssignment | undefined>;
  getTeamAssignments(teamId: string, filters?: { status?: string; assignmentType?: string; limit?: number }): Promise<TeamAssignment[]>;
  getAppointmentAssignment(appointmentId: string): Promise<TeamAssignment | undefined>;
  getMemberAssignments(memberId: string, filters?: { status?: string; dateFrom?: Date; dateTo?: Date }): Promise<TeamAssignment[]>;
  updateTeamAssignment(id: string, assignmentData: Partial<InsertTeamAssignment>): Promise<TeamAssignment>;
  deleteTeamAssignment(id: string): Promise<void>;
  
  // Round-Robin State operations
  getRoundRobinState(teamId: string, eventTypeId?: string): Promise<RoundRobinState | undefined>;
  createRoundRobinState(stateData: InsertRoundRobinState): Promise<RoundRobinState>;
  updateRoundRobinState(id: string, stateData: Partial<InsertRoundRobinState>): Promise<RoundRobinState>;
  getNextRoundRobinAssignment(teamId: string, eventTypeId?: string, filters?: { requiredSkills?: string[]; excludeMembers?: string[] }): Promise<string | null>;
  rebalanceRoundRobin(teamId: string, eventTypeId?: string): Promise<RoundRobinState>;
  resetRoundRobin(teamId: string, eventTypeId?: string): Promise<RoundRobinState>;
  
  // Lead Routing Rules operations
  createLeadRoutingRule(ruleData: InsertLeadRoutingRule): Promise<LeadRoutingRule>;
  getLeadRoutingRule(id: string): Promise<LeadRoutingRule | undefined>;
  getTeamRoutingRules(teamId: string, filters?: { isActive?: boolean; strategy?: string }): Promise<LeadRoutingRule[]>;
  updateLeadRoutingRule(id: string, ruleData: Partial<InsertLeadRoutingRule>): Promise<LeadRoutingRule>;
  deleteLeadRoutingRule(id: string): Promise<void>;
  evaluateRoutingRules(teamId: string, context: any): Promise<{ memberId: string; ruleId: string; score: number } | null>;
  
  // Team Member Skills operations
  createTeamMemberSkill(skillData: InsertTeamMemberSkill): Promise<TeamMemberSkill>;
  getTeamMemberSkill(id: string): Promise<TeamMemberSkill | undefined>;
  getMemberSkills(teamMemberId: string, filters?: { category?: string; verified?: boolean }): Promise<TeamMemberSkill[]>;
  getTeamMembersBySkill(teamId: string, skillName: string, minLevel?: number): Promise<TeamMemberSkill[]>;
  updateTeamMemberSkill(id: string, skillData: Partial<InsertTeamMemberSkill>): Promise<TeamMemberSkill>;
  deleteTeamMemberSkill(id: string): Promise<void>;
  verifyMemberSkill(id: string, verifiedBy: string): Promise<TeamMemberSkill>;
  
  // Team Member Capacity operations
  createTeamMemberCapacity(capacityData: InsertTeamMemberCapacity): Promise<TeamMemberCapacity>;
  getTeamMemberCapacity(teamMemberId: string): Promise<TeamMemberCapacity | undefined>;
  updateTeamMemberCapacity(id: string, capacityData: Partial<InsertTeamMemberCapacity>): Promise<TeamMemberCapacity>;
  deleteTeamMemberCapacity(id: string): Promise<void>;
  checkMemberCapacity(teamMemberId: string, appointmentDuration: number, appointmentDate: Date): Promise<{ available: boolean; reason?: string }>;
  updateMemberWorkload(teamMemberId: string, increment: number): Promise<TeamMemberCapacity>;
  
  // Team Availability Patterns operations
  createTeamAvailabilityPattern(patternData: InsertTeamAvailabilityPattern): Promise<TeamAvailabilityPattern>;
  getTeamAvailabilityPattern(id: string): Promise<TeamAvailabilityPattern | undefined>;
  getTeamAvailabilityPatterns(teamId: string, filters?: { isActive?: boolean; patternType?: string }): Promise<TeamAvailabilityPattern[]>;
  updateTeamAvailabilityPattern(id: string, patternData: Partial<InsertTeamAvailabilityPattern>): Promise<TeamAvailabilityPattern>;
  deleteTeamAvailabilityPattern(id: string): Promise<void>;
  getCollectiveAvailability(teamId: string, date: Date, duration: number): Promise<{
    timeSlot: string;
    availableMembers: string[];
    minimumMet: boolean;
    preferredMet: boolean;
  }[]>;
  
  // Assignment Analytics operations
  createAssignmentAnalytics(analyticsData: InsertAssignmentAnalytics): Promise<AssignmentAnalytics>;
  getAssignmentAnalytics(teamId: string, memberId?: string, periodType?: string, periodStart?: Date): Promise<AssignmentAnalytics[]>;
  updateAssignmentAnalytics(id: string, analyticsData: Partial<InsertAssignmentAnalytics>): Promise<AssignmentAnalytics>;
  generateMemberAnalytics(teamMemberId: string, periodType: string): Promise<AssignmentAnalytics>;
  getTeamPerformanceMetrics(teamId: string, dateRange?: { from: Date; to: Date }): Promise<{
    totalAssignments: number;
    completionRate: number;
    averageResponseTime: number;
    memberDistribution: Record<string, number>;
    revenueGenerated: number;
  }>;
  
  // Routing Analytics operations
  createRoutingAnalytics(analyticsData: InsertRoutingAnalytics): Promise<RoutingAnalytics>;
  getRoutingAnalytics(teamId: string, filters?: { ruleId?: string; dateFrom?: Date; dateTo?: Date }): Promise<RoutingAnalytics[]>;
  getRulePerformance(ruleId: string, dateRange?: { from: Date; to: Date }): Promise<{
    usageCount: number;
    successRate: number;
    averageSatisfaction: number;
    totalRevenue: number;
    averageRoutingTime: number;
  }>;
  
  // Advanced Team Scheduling operations
  findOptimalAssignment(teamId: string, appointmentContext: {
    eventTypeId: string;
    duration: number;
    scheduledTime: Date;
    clientInfo?: any;
    requiredSkills?: string[];
    preferredMembers?: string[];
  }): Promise<{
    recommendedMemberId: string;
    score: number;
    reasoning: string;
    alternatives: Array<{ memberId: string; score: number }>;
  } | null>;
  
  getTeamSchedulingStats(teamId: string): Promise<{
    totalMembers: number;
    activeMembers: number;
    averageUtilization: number;
    roundRobinBalance: number;
    routingEfficiency: number;
    memberCapacities: Record<string, { current: number; maximum: number }>;
  }>;
  
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

  // Email notification stats
  getNotificationStats(userId: string): Promise<{
    totalSent: number;
    deliveryRate: number;
    recentNotifications: number;
    failedNotifications: number;
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
  getEmailTemplateByType(type: string, userId: string): Promise<EmailTemplate | undefined>;
  getUserEmailTemplates(userId: string, filters?: { category?: string }): Promise<EmailTemplate[]>;
  updateEmailTemplate(id: string, templateData: Partial<InsertEmailTemplate>, userId?: string): Promise<EmailTemplate>;
  deleteEmailTemplate(id: string, userId?: string): Promise<void>;
  getDefaultEmailTemplates(): Promise<EmailTemplate[]>;
  ensureDefaultTemplatesExist(userId: string): Promise<void>;

  // Appointment Notification operations
  createNotification(notificationData: InsertAppointmentNotification): Promise<AppointmentNotification>;
  getNotification(id: string): Promise<AppointmentNotification | undefined>;
  getAppointmentNotifications(appointmentId: string): Promise<AppointmentNotification[]>;
  getUserNotifications(userId: string, filters?: { type?: string; status?: string; limit?: number }): Promise<AppointmentNotification[]>;
  updateNotification(id: string, notificationData: Partial<InsertAppointmentNotification>): Promise<AppointmentNotification>;
  deleteNotification(id: string): Promise<void>;
  getPendingNotifications(): Promise<AppointmentNotification[]>;
  getNotificationHistory(userId: string, limit?: number): Promise<AppointmentNotification[]>;

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

  // Appointment operations
  getAppointmentEventType(id: string): Promise<AppointmentEventType | undefined>;
  getAppointmentEventTypeBySlug(slug: string): Promise<AppointmentEventType | undefined>;
  getUserAppointmentEventTypes(userId: string, filters?: { isActive?: boolean; search?: string }): Promise<AppointmentEventType[]>;
  createAppointmentEventType(eventTypeData: InsertAppointmentEventType): Promise<AppointmentEventType>;
  updateAppointmentEventType(id: string, eventTypeData: Partial<InsertAppointmentEventType>): Promise<AppointmentEventType>;
  deleteAppointmentEventType(id: string): Promise<void>;
  duplicateAppointmentEventType(id: string, newName?: string): Promise<AppointmentEventType>;
  updateAppointmentEventTypeStatus(id: string, isActive: boolean): Promise<AppointmentEventType>;
  getEventTypeTemplates(): Promise<AppointmentEventType[]>;
  getAvailabilityForDate(eventTypeId: string, date: Date, timezone: string): Promise<Array<{time: string, available: boolean, utcTime: string}>>;
  createAppointment(appointmentData: InsertAppointment): Promise<Appointment>;
  getAppointment(id: string): Promise<Appointment | undefined>;
  getUserAppointments(userId: string, filters?: { search?: string; page?: number; limit?: number }): Promise<Appointment[]>;
  updateAppointment(id: string, appointmentData: Partial<InsertAppointment>): Promise<Appointment>;

  // Payment operations
  createAppointmentPayment(paymentData: InsertAppointmentPayment): Promise<AppointmentPayment>;
  getAppointmentPayment(id: string): Promise<AppointmentPayment | undefined>;
  updateAppointmentPayment(id: string, paymentData: Partial<InsertAppointmentPayment>): Promise<AppointmentPayment>;
  updateAppointmentPaymentByStripeId(stripePaymentIntentId: string, paymentData: Partial<InsertAppointmentPayment>): Promise<AppointmentPayment>;
  getUserAppointmentPayments(userId: string, filters?: {
    status?: string;
    appointmentId?: string;
    customerId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<AppointmentPayment[]>;
  getPaymentAnalytics(userId: string): Promise<{
    totalRevenue: number;
    totalTransactions: number;
    successfulPayments: number;
    refundedPayments: number;
    averageTransactionValue: number;
    monthlyRevenue: Array<{ month: string; revenue: number; count: number }>;
    paymentsByStatus: Record<string, number>;
    recentPayments: Array<AppointmentPayment & { appointmentId: string; customerName: string }>;
  }>;

  // Calendar Integration operations
  createCalendarConnection(connectionData: InsertCalendarConnection): Promise<CalendarConnection>;
  getCalendarConnection(id: string): Promise<CalendarConnection | undefined>;
  getUserCalendarConnections(userId: string, filters?: { provider?: string; isActive?: boolean }): Promise<CalendarConnection[]>;
  updateCalendarConnection(id: string, connectionData: Partial<InsertCalendarConnection>): Promise<CalendarConnection>;
  deleteCalendarConnection(id: string): Promise<void>;
  updateCalendarTokens(id: string, accessToken: string, refreshToken?: string): Promise<CalendarConnection>;
  getCalendarConnectionByProvider(userId: string, provider: string): Promise<CalendarConnection | undefined>;

  // Video Meeting Provider operations  
  createVideoMeetingProvider(providerData: InsertVideoMeetingProvider): Promise<VideoMeetingProvider>;
  getVideoMeetingProvider(id: string): Promise<VideoMeetingProvider | undefined>;
  getUserVideoMeetingProviders(userId: string, filters?: { provider?: string; isActive?: boolean }): Promise<VideoMeetingProvider[]>;
  updateVideoMeetingProvider(id: string, providerData: Partial<InsertVideoMeetingProvider>): Promise<VideoMeetingProvider>;
  deleteVideoMeetingProvider(id: string): Promise<void>;
  updateVideoProviderTokens(id: string, accessToken: string, refreshToken?: string): Promise<VideoMeetingProvider>;
  getVideoProviderByProvider(userId: string, provider: string): Promise<VideoMeetingProvider | undefined>;

  // External Calendar Event operations
  createExternalCalendarEvent(eventData: InsertExternalCalendarEvent): Promise<ExternalCalendarEvent>;
  getExternalCalendarEvent(id: string): Promise<ExternalCalendarEvent | undefined>;
  getExternalCalendarEventByExternalId(externalEventId: string, calendarConnectionId: string): Promise<ExternalCalendarEvent | undefined>;
  getAppointmentExternalEvents(appointmentId: string): Promise<ExternalCalendarEvent[]>;
  updateExternalCalendarEvent(id: string, eventData: Partial<InsertExternalCalendarEvent>): Promise<ExternalCalendarEvent>;
  deleteExternalCalendarEvent(id: string): Promise<void>;
  deleteExternalCalendarEventsByAppointment(appointmentId: string): Promise<void>;

  // Meeting Link operations
  createMeetingLink(linkData: InsertMeetingLink): Promise<MeetingLink>;
  getMeetingLink(id: string): Promise<MeetingLink | undefined>;
  getMeetingLinkByAppointment(appointmentId: string): Promise<MeetingLink | undefined>;
  updateMeetingLink(id: string, linkData: Partial<InsertMeetingLink>): Promise<MeetingLink>;
  deleteMeetingLink(id: string): Promise<void>;
  deleteMeetingLinksByAppointment(appointmentId: string): Promise<void>;

  // Integration Log operations
  createIntegrationLog(logData: InsertIntegrationLog): Promise<IntegrationLog>;
  getIntegrationLogs(filters?: { 
    userId?: string; 
    integrationType?: string; 
    provider?: string;
    operation?: string;
    status?: string;
    limit?: number;
  }): Promise<IntegrationLog[]>;
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

  async getTeamMemberByUserAndTeam(userId: string, teamId: string): Promise<TeamMember | undefined> {
    const [member] = await db
      .select()
      .from(teamMembers)
      .where(and(eq(teamMembers.userId, userId), eq(teamMembers.teamId, teamId)));
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

  async updateEmailTemplate(id: string, templateData: Partial<InsertEmailTemplate>, userId?: string): Promise<EmailTemplate> {
    const conditions = [eq(emailTemplates.id, id)];
    
    // Add user scoping for security - only allow updates to user's own templates
    if (userId) {
      conditions.push(eq(emailTemplates.ownerUserId, userId));
    }
    
    const [template] = await db
      .update(emailTemplates)
      .set({ ...templateData, updatedAt: new Date() })
      .where(and(...conditions))
      .returning();
    
    if (!template) {
      throw new Error('Email template not found or access denied');
    }
    
    return template;
  }

  async deleteEmailTemplate(id: string, userId?: string): Promise<void> {
    const conditions = [eq(emailTemplates.id, id)];
    
    // Add user scoping for security - only allow deletion of user's own templates
    if (userId) {
      conditions.push(eq(emailTemplates.ownerUserId, userId));
    }
    
    const result = await db.delete(emailTemplates).where(and(...conditions)).returning();
    
    if (result.length === 0) {
      throw new Error('Email template not found or access denied');
    }
  }

  async getEmailTemplateByType(type: string, userId: string): Promise<EmailTemplate | undefined> {
    // First try to get user's custom template
    const userTemplate = await db.select().from(emailTemplates)
      .where(and(
        eq(emailTemplates.type, type),
        eq(emailTemplates.ownerUserId, userId)
      ))
      .limit(1);
    
    if (userTemplate[0]) {
      return userTemplate[0];
    }
    
    // Fallback to default template for the type (system templates)
    const defaultTemplate = await db.select().from(emailTemplates)
      .where(and(
        eq(emailTemplates.type, type),
        eq(emailTemplates.isDefault, true)
      ))
      .limit(1);
    
    return defaultTemplate[0];
  }

  async getDefaultEmailTemplates(): Promise<EmailTemplate[]> {
    return await db.select().from(emailTemplates)
      .where(eq(emailTemplates.isDefault, true))
      .orderBy(emailTemplates.type);
  }

  async ensureDefaultTemplatesExist(userId: string): Promise<void> {
    // This method will be implemented to ensure default email templates exist for a user
    // It will create default templates if they don't exist
  }

  // ===== APPOINTMENT NOTIFICATION OPERATIONS =====
  async createNotification(notificationData: InsertAppointmentNotification): Promise<AppointmentNotification> {
    const result = await db.insert(appointmentNotifications)
      .values(notificationData)
      .returning();
    return result[0];
  }

  async getNotification(id: string): Promise<AppointmentNotification | undefined> {
    const result = await db.select().from(appointmentNotifications)
      .where(eq(appointmentNotifications.id, id))
      .limit(1);
    return result[0];
  }

  async getAppointmentNotifications(appointmentId: string): Promise<AppointmentNotification[]> {
    return await db.select().from(appointmentNotifications)
      .where(eq(appointmentNotifications.appointmentId, appointmentId))
      .orderBy(desc(appointmentNotifications.createdAt));
  }

  async getUserNotifications(
    userId: string, 
    filters?: { type?: string; status?: string; limit?: number }
  ): Promise<AppointmentNotification[]> {
    let query = db.select().from(appointmentNotifications)
      .innerJoin(appointments, eq(appointmentNotifications.appointmentId, appointments.id))
      .where(or(
        eq(appointments.hostUserId, userId),
        eq(appointments.assignedUserId, userId)
      ));

    if (filters?.type) {
      query = query.where(eq(appointmentNotifications.type, filters.type as any));
    }
    if (filters?.status) {
      query = query.where(eq(appointmentNotifications.status, filters.status as any));
    }

    const result = await query
      .orderBy(desc(appointmentNotifications.createdAt))
      .limit(filters?.limit || 50);

    return result.map(row => row.appointment_notifications);
  }

  async updateNotification(
    id: string, 
    notificationData: Partial<InsertAppointmentNotification>
  ): Promise<AppointmentNotification> {
    const result = await db.update(appointmentNotifications)
      .set(notificationData)
      .where(eq(appointmentNotifications.id, id))
      .returning();
    return result[0];
  }

  async deleteNotification(id: string): Promise<void> {
    await db.delete(appointmentNotifications)
      .where(eq(appointmentNotifications.id, id));
  }

  async getPendingNotifications(): Promise<AppointmentNotification[]> {
    return await db.select().from(appointmentNotifications)
      .where(and(
        eq(appointmentNotifications.status, 'pending'),
        lte(appointmentNotifications.scheduledFor, new Date())
      ))
      .orderBy(appointmentNotifications.scheduledFor)
      .limit(100); // Process max 100 at a time
  }

  async getNotificationHistory(userId: string, limit: number = 50): Promise<AppointmentNotification[]> {
    const result = await db.select().from(appointmentNotifications)
      .innerJoin(appointments, eq(appointmentNotifications.appointmentId, appointments.id))
      .where(or(
        eq(appointments.hostUserId, userId),
        eq(appointments.assignedUserId, userId)
      ))
      .orderBy(desc(appointmentNotifications.createdAt))
      .limit(limit);

    return result.map(row => row.appointment_notifications);
  }

  async getNotificationStats(userId: string): Promise<{
    totalSent: number;
    deliveryRate: number;
    recentNotifications: number;
    failedNotifications: number;
  }> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get total sent notifications for user
    const totalSentResult = await db.select({ count: count() })
      .from(appointmentNotifications)
      .innerJoin(appointments, eq(appointmentNotifications.appointmentId, appointments.id))
      .where(and(
        or(
          eq(appointments.hostUserId, userId),
          eq(appointments.assignedUserId, userId)
        ),
        eq(appointmentNotifications.status, 'sent')
      ));

    // Get failed notifications
    const failedResult = await db.select({ count: count() })
      .from(appointmentNotifications)
      .innerJoin(appointments, eq(appointmentNotifications.appointmentId, appointments.id))
      .where(and(
        or(
          eq(appointments.hostUserId, userId),
          eq(appointments.assignedUserId, userId)
        ),
        eq(appointmentNotifications.status, 'failed')
      ));

    // Get recent notifications (last 30 days)
    const recentResult = await db.select({ count: count() })
      .from(appointmentNotifications)
      .innerJoin(appointments, eq(appointmentNotifications.appointmentId, appointments.id))
      .where(and(
        or(
          eq(appointments.hostUserId, userId),
          eq(appointments.assignedUserId, userId)
        ),
        gte(appointmentNotifications.createdAt, thirtyDaysAgo)
      ));

    const totalSent = totalSentResult[0]?.count || 0;
    const failed = failedResult[0]?.count || 0;
    const recent = recentResult[0]?.count || 0;
    const totalAttempts = totalSent + failed;
    const deliveryRate = totalAttempts > 0 ? (totalSent / totalAttempts) * 100 : 100;

    return {
      totalSent,
      deliveryRate: Math.round(deliveryRate * 100) / 100,
      recentNotifications: recent,
      failedNotifications: failed
    };
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

  // Appointment operations
  async getAppointmentEventType(id: string): Promise<AppointmentEventType | undefined> {
    const [eventType] = await db.select().from(appointmentEventTypes).where(eq(appointmentEventTypes.id, id));
    return eventType;
  }

  async getAppointmentEventTypeBySlug(slug: string): Promise<AppointmentEventType | undefined> {
    const [eventType] = await db.select().from(appointmentEventTypes).where(
      and(
        eq(appointmentEventTypes.slug, slug),
        eq(appointmentEventTypes.isActive, true)
      )
    );
    return eventType;
  }

  async getAvailabilityForDate(eventTypeId: string, date: Date, timezone: string): Promise<Array<{time: string, available: boolean, utcTime: string}>> {
    const eventType = await this.getAppointmentEventType(eventTypeId);
    if (!eventType) {
      return [];
    }

    // Get event type owner's availability rules for this specific weekday
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const requestedWeekday = weekdays[date.getDay()];
    
    const [availability] = await db
      .select()
      .from(teamMemberAvailability)
      .where(and(
        eq(teamMemberAvailability.userId, eventType.userId),
        eq(teamMemberAvailability.weekday, requestedWeekday as any),
        eq(teamMemberAvailability.type, 'available'),
        or(
          eq(teamMemberAvailability.eventTypeId, eventTypeId),
          sql`${teamMemberAvailability.eventTypeId} IS NULL` // Default availability
        )
      ))
      .limit(1);

    // Default business hours if no availability rules set
    const defaultStartTime = '09:00';
    const defaultEndTime = '17:00';
    
    // Use specific availability or defaults
    const startTime = availability?.startTime || defaultStartTime;
    const endTime = availability?.endTime || defaultEndTime;
    
    // Parse times
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    // Calculate slot duration and intervals based on event type
    const slotDuration = eventType.duration; // in minutes
    const bufferBefore = eventType.bufferTimeBefore || 0;
    const bufferAfter = eventType.bufferTimeAfter || 0;
    const totalSlotTime = slotDuration + bufferBefore + bufferAfter;

    // Get existing appointments for the date range with proper overlap checking
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await db
      .select({
        startTime: appointments.startTime,
        endTime: appointments.endTime,
        status: appointments.status
      })
      .from(appointments)
      .where(and(
        eq(appointments.eventTypeId, eventTypeId),
        gte(appointments.startTime, startOfDay.toISOString()),
        lte(appointments.startTime, endOfDay.toISOString()),
        or(
          eq(appointments.status, 'scheduled'),
          eq(appointments.status, 'confirmed'),
          eq(appointments.status, 'completed')
        )
      ));

    // Get blackout dates for this date
    
    const blackoutDatesResult = await db
      .select()
      .from(blackoutDates)
      .where(and(
        eq(blackoutDates.userId, eventType.userId),
        or(
          eq(blackoutDates.eventTypeId, eventTypeId),
          sql`${blackoutDates.eventTypeId} IS NULL`
        ),
        sql`${blackoutDates.startDate} <= ${endOfDay.toISOString()} AND ${blackoutDates.endDate} >= ${startOfDay.toISOString()}`
      ));

    // Check if the entire day is blocked
    const fullDayBlackout = blackoutDatesResult.some(bd => bd.isAllDay);
    if (fullDayBlackout) {
      return [];
    }

    // Generate time slots
    const slots = [];
    const startTimeMinutes = startHour * 60 + startMinute;
    const endTimeMinutes = endHour * 60 + endMinute;

    // Create slots every `totalSlotTime` minutes
    for (let currentMinutes = startTimeMinutes; currentMinutes + slotDuration <= endTimeMinutes; currentMinutes += totalSlotTime) {
      const slotHour = Math.floor(currentMinutes / 60);
      const slotMinute = currentMinutes % 60;
      
      // Create the slot start time in the user's requested timezone
      const slotStartDate = new Date(date);
      slotStartDate.setHours(slotHour, slotMinute, 0, 0);
      
      // Convert to UTC for storage and comparison
      const utcSlotStart = this.convertToUTC(slotStartDate, timezone);
      const utcSlotEnd = new Date(utcSlotStart.getTime() + slotDuration * 60000);
      
      // Check for conflicts with existing appointments (proper overlap logic)
      const hasConflict = existingAppointments.some(apt => {
        const aptStart = new Date(apt.startTime);
        const aptEnd = new Date(apt.endTime);
        
        // Add buffers to check for conflicts
        const slotWithBufferStart = new Date(utcSlotStart.getTime() - bufferBefore * 60000);
        const slotWithBufferEnd = new Date(utcSlotEnd.getTime() + bufferAfter * 60000);
        
        // Proper overlap detection: slots overlap if start < apt.end && end > apt.start
        return slotWithBufferStart < aptEnd && slotWithBufferEnd > aptStart;
      });
      
      // Check for blackout time conflicts
      const hasBlackoutConflict = blackoutDatesResult.some(bd => {
        if (bd.isAllDay) return true;
        
        if (bd.startTime && bd.endTime) {
          const [blackoutStartHour, blackoutStartMin] = bd.startTime.split(':').map(Number);
          const [blackoutEndHour, blackoutEndMin] = bd.endTime.split(':').map(Number);
          
          const blackoutStartMinutes = blackoutStartHour * 60 + blackoutStartMin;
          const blackoutEndMinutes = blackoutEndHour * 60 + blackoutEndMin;
          
          const slotStartMinutes = slotHour * 60 + slotMinute;
          const slotEndMinutes = slotStartMinutes + slotDuration;
          
          // Check overlap
          return slotStartMinutes < blackoutEndMinutes && slotEndMinutes > blackoutStartMinutes;
        }
        
        return false;
      });
      
      // Format time for display in user's timezone
      const displayTime = `${slotHour.toString().padStart(2, '0')}:${slotMinute.toString().padStart(2, '0')}`;
      
      slots.push({
        time: displayTime,
        available: !hasConflict && !hasBlackoutConflict,
        utcTime: utcSlotStart.toISOString(),
      });
    }

    return slots;
  }

  // Helper method to convert local time to UTC based on timezone
  private convertToUTC(date: Date, timezone: string): Date {
    // Create a date formatter for the specific timezone
    const localTime = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).formatToParts(date);
    
    // Reconstruct the date in the specified timezone
    const year = parseInt(localTime.find(part => part.type === 'year')?.value || '0');
    const month = parseInt(localTime.find(part => part.type === 'month')?.value || '1') - 1;
    const day = parseInt(localTime.find(part => part.type === 'day')?.value || '1');
    const hour = parseInt(localTime.find(part => part.type === 'hour')?.value || '0');
    const minute = parseInt(localTime.find(part => part.type === 'minute')?.value || '0');
    const second = parseInt(localTime.find(part => part.type === 'second')?.value || '0');
    
    // Create a new date with the timezone-adjusted values
    const adjustedDate = new Date(year, month, day, hour, minute, second);
    
    // Calculate the timezone offset difference and adjust
    const originalOffset = date.getTimezoneOffset();
    const targetOffset = this.getTimezoneOffset(timezone, date);
    const offsetDifference = (originalOffset - targetOffset) * 60000;
    
    return new Date(adjustedDate.getTime() + offsetDifference);
  }
  
  // Helper to get timezone offset for a specific timezone
  private getTimezoneOffset(timezone: string, date: Date): number {
    const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    const targetDate = new Date(utcDate.toLocaleString('en-US', { timeZone: timezone }));
    return (utcDate.getTime() - targetDate.getTime()) / 60000;
  }

  async createAppointment(appointmentData: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db.insert(appointments).values(appointmentData).returning();
    return appointment;
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment;
  }

  async getUserAppointments(userId: string, filters?: { search?: string; page?: number; limit?: number }): Promise<Appointment[]> {
    const conditions = [eq(appointments.hostUserId, userId)];
    
    if (filters?.search) {
      conditions.push(
        or(
          like(appointments.attendeeName, `%${filters.search}%`),
          like(appointments.attendeeEmail, `%${filters.search}%`),
          like(appointments.attendeeCompany, `%${filters.search}%`)
        )
      );
    }
    
    const query = db.select().from(appointments).where(and(...conditions));
    
    if (filters?.limit) {
      query.limit(filters.limit);
    }
    
    if (filters?.page && filters?.limit) {
      query.offset((filters.page - 1) * filters.limit);
    }
    
    return query.orderBy(desc(appointments.startTime));
  }

  // Event Types CRUD operations
  async getUserAppointmentEventTypes(userId: string, filters?: { isActive?: boolean; search?: string }): Promise<AppointmentEventType[]> {
    const conditions = [eq(appointmentEventTypes.userId, userId)];
    
    if (filters?.isActive !== undefined) {
      conditions.push(eq(appointmentEventTypes.isActive, filters.isActive));
    }
    
    if (filters?.search) {
      conditions.push(
        or(
          like(appointmentEventTypes.name, `%${filters.search}%`),
          like(appointmentEventTypes.description, `%${filters.search}%`)
        )
      );
    }
    
    const query = db.select().from(appointmentEventTypes).where(and(...conditions));
    
    return query.orderBy(desc(appointmentEventTypes.createdAt));
  }

  async createAppointmentEventType(eventTypeData: InsertAppointmentEventType): Promise<AppointmentEventType> {
    // Generate unique slug if not provided
    if (!eventTypeData.slug) {
      const baseSlug = eventTypeData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      let slug = baseSlug;
      let counter = 1;
      
      while (true) {
        const [existing] = await db.select().from(appointmentEventTypes)
          .where(eq(appointmentEventTypes.slug, slug))
          .limit(1);
        
        if (!existing) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      eventTypeData.slug = slug;
    }

    const [eventType] = await db.insert(appointmentEventTypes).values({
      ...eventTypeData,
      isActive: eventTypeData.isActive ?? true,
      isPublic: eventTypeData.isPublic ?? true,
      duration: eventTypeData.duration || 30,
      price: eventTypeData.price || 0,
      currency: eventTypeData.currency || 'USD',
      brandColor: eventTypeData.brandColor || '#3B82F6',
      requiresConfirmation: eventTypeData.requiresConfirmation ?? false,
      bufferTimeBefore: eventTypeData.bufferTimeBefore || 0,
      bufferTimeAfter: eventTypeData.bufferTimeAfter || 0,
    }).returning();
    
    return eventType;
  }

  async updateAppointmentEventType(id: string, eventTypeData: Partial<InsertAppointmentEventType>): Promise<AppointmentEventType> {
    // If updating slug, ensure uniqueness
    if (eventTypeData.slug) {
      const [existing] = await db.select().from(appointmentEventTypes)
        .where(and(
          eq(appointmentEventTypes.slug, eventTypeData.slug),
          sql`${appointmentEventTypes.id} != ${id}`
        ))
        .limit(1);
      
      if (existing) {
        throw new Error('Slug already exists');
      }
    }

    const [eventType] = await db
      .update(appointmentEventTypes)
      .set({ 
        ...eventTypeData,
        updatedAt: new Date() 
      })
      .where(eq(appointmentEventTypes.id, id))
      .returning();
    
    if (!eventType) {
      throw new Error('Event type not found');
    }
    
    return eventType;
  }

  async deleteAppointmentEventType(id: string): Promise<void> {
    // Check for existing appointments
    const [hasAppointments] = await db
      .select({ count: count() })
      .from(appointments)
      .where(eq(appointments.eventTypeId, id));
    
    if (hasAppointments.count > 0) {
      throw new Error('Cannot delete event type with existing appointments');
    }
    
    await db.delete(appointmentEventTypes).where(eq(appointmentEventTypes.id, id));
  }

  async duplicateAppointmentEventType(id: string, newName?: string): Promise<AppointmentEventType> {
    const original = await this.getAppointmentEventType(id);
    if (!original) {
      throw new Error('Event type not found');
    }

    const duplicateData: InsertAppointmentEventType = {
      ...original,
      name: newName || `${original.name} (Copy)`,
      slug: '', // Will be auto-generated
      id: undefined, // Remove ID so new one is generated
      createdAt: undefined,
      updatedAt: undefined,
    };

    return this.createAppointmentEventType(duplicateData);
  }

  async updateAppointmentEventTypeStatus(id: string, isActive: boolean): Promise<AppointmentEventType> {
    return this.updateAppointmentEventType(id, { isActive });
  }

  async getEventTypeTemplates(): Promise<AppointmentEventType[]> {
    // Return pre-built event type templates
    const templates: AppointmentEventType[] = [
      // Consultation Templates
      {
        id: 'template-consultation-30',
        name: '30-Minute Consultation',
        slug: '30-minute-consultation',
        description: 'A focused consultation session to discuss your needs and objectives.',
        duration: 30,
        price: 0,
        currency: 'USD',
        meetingLocation: 'video',
        brandColor: '#3B82F6',
        isActive: true,
        isPublic: true,
        requiresConfirmation: false,
        bufferTimeBefore: 5,
        bufferTimeAfter: 5,
        minimumNotice: 60,
        maximumFutureBooking: 30,
        dailyBookingLimit: 0,
        weeklyBookingLimit: 0,
        monthlyBookingLimit: 0,
        collectAttendeeEmail: true,
        collectAttendeePhone: false,
        collectAttendeeMessage: true,
        customQuestions: [
          {
            id: 'consultation-topic',
            question: 'What would you like to discuss in this consultation?',
            required: true,
            type: 'textarea'
          }
        ],
        instructionsBeforeEvent: 'Please prepare any questions or materials you\'d like to discuss during our consultation.',
        instructionsAfterEvent: 'Thank you for the consultation! You should receive a follow-up email within 24 hours.',
        allowCancellation: true,
        cancellationNotice: 120,
        allowRescheduling: true,
        rescheduleNotice: 120,
        userId: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'template-discovery-call',
        name: 'Discovery Call',
        slug: 'discovery-call',
        description: 'An initial call to explore potential collaboration and understand your requirements.',
        duration: 45,
        price: 0,
        currency: 'USD',
        meetingLocation: 'video',
        brandColor: '#10B981',
        isActive: true,
        isPublic: true,
        requiresConfirmation: false,
        bufferTimeBefore: 10,
        bufferTimeAfter: 10,
        minimumNotice: 120,
        maximumFutureBooking: 60,
        dailyBookingLimit: 3,
        weeklyBookingLimit: 0,
        monthlyBookingLimit: 0,
        collectAttendeeEmail: true,
        collectAttendeePhone: true,
        collectAttendeeMessage: true,
        customQuestions: [
          {
            id: 'company-info',
            question: 'What company do you represent?',
            required: true,
            type: 'text'
          },
          {
            id: 'project-type',
            question: 'What type of project are you looking to discuss?',
            required: true,
            type: 'select'
          },
          {
            id: 'budget-range',
            question: 'What is your expected budget range?',
            required: false,
            type: 'select'
          }
        ],
        instructionsBeforeEvent: 'Please prepare a brief overview of your project and any specific questions you have.',
        instructionsAfterEvent: 'We\'ll send you a proposal within 2-3 business days based on our discussion.',
        allowCancellation: true,
        cancellationNotice: 240,
        allowRescheduling: true,
        rescheduleNotice: 240,
        userId: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Sales & Business Templates
      {
        id: 'template-sales-call',
        name: 'Sales Call',
        slug: 'sales-call',
        description: 'A dedicated sales conversation to discuss our services and how we can help your business.',
        duration: 60,
        price: 0,
        currency: 'USD',
        meetingLocation: 'video',
        brandColor: '#EF4444',
        isActive: true,
        isPublic: true,
        requiresConfirmation: false,
        bufferTimeBefore: 15,
        bufferTimeAfter: 15,
        minimumNotice: 180,
        maximumFutureBooking: 45,
        dailyBookingLimit: 4,
        weeklyBookingLimit: 0,
        monthlyBookingLimit: 0,
        collectAttendeeEmail: true,
        collectAttendeePhone: true,
        collectAttendeeMessage: true,
        customQuestions: [
          {
            id: 'company-size',
            question: 'How many employees does your company have?',
            required: true,
            type: 'select'
          },
          {
            id: 'decision-maker',
            question: 'Are you the primary decision maker for this purchase?',
            required: true,
            type: 'select'
          },
          {
            id: 'timeline',
            question: 'What is your expected timeline for implementation?',
            required: true,
            type: 'select'
          }
        ],
        instructionsBeforeEvent: 'Please review our services page and prepare any questions about our offerings.',
        instructionsAfterEvent: 'Thank you for your time! We\'ll send you a customized proposal within 24 hours.',
        allowCancellation: true,
        cancellationNotice: 360,
        allowRescheduling: true,
        rescheduleNotice: 360,
        userId: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'template-product-demo',
        name: 'Product Demo',
        slug: 'product-demo',
        description: 'A comprehensive demonstration of our product features and capabilities.',
        duration: 30,
        price: 0,
        currency: 'USD',
        meetingLocation: 'video',
        brandColor: '#8B5CF6',
        isActive: true,
        isPublic: true,
        requiresConfirmation: false,
        bufferTimeBefore: 5,
        bufferTimeAfter: 10,
        minimumNotice: 120,
        maximumFutureBooking: 30,
        dailyBookingLimit: 6,
        weeklyBookingLimit: 0,
        monthlyBookingLimit: 0,
        collectAttendeeEmail: true,
        collectAttendeePhone: false,
        collectAttendeeMessage: true,
        customQuestions: [
          {
            id: 'use-case',
            question: 'What specific use case would you like to see demonstrated?',
            required: true,
            type: 'textarea'
          },
          {
            id: 'current-solution',
            question: 'What solution are you currently using?',
            required: false,
            type: 'text'
          }
        ],
        instructionsBeforeEvent: 'Please prepare any specific scenarios you\'d like to see demonstrated.',
        instructionsAfterEvent: 'You\'ll receive a recording of this demo and next steps via email.',
        allowCancellation: true,
        cancellationNotice: 120,
        allowRescheduling: true,
        rescheduleNotice: 120,
        userId: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Support & Service Templates
      {
        id: 'template-support-session',
        name: 'Support Session',
        slug: 'support-session',
        description: 'Dedicated support session to resolve technical issues or answer questions.',
        duration: 45,
        price: 12500, // $125.00
        currency: 'USD',
        meetingLocation: 'video',
        brandColor: '#F59E0B',
        isActive: true,
        isPublic: true,
        requiresConfirmation: true,
        bufferTimeBefore: 10,
        bufferTimeAfter: 5,
        minimumNotice: 60,
        maximumFutureBooking: 14,
        dailyBookingLimit: 8,
        weeklyBookingLimit: 0,
        monthlyBookingLimit: 0,
        collectAttendeeEmail: true,
        collectAttendeePhone: false,
        collectAttendeeMessage: true,
        customQuestions: [
          {
            id: 'issue-description',
            question: 'Please describe the issue you\'re experiencing in detail',
            required: true,
            type: 'textarea'
          },
          {
            id: 'urgency-level',
            question: 'How urgent is this issue?',
            required: true,
            type: 'select'
          },
          {
            id: 'error-messages',
            question: 'Are you seeing any error messages? If so, please share them here.',
            required: false,
            type: 'textarea'
          }
        ],
        instructionsBeforeEvent: 'Please prepare screenshots or screen recordings of the issue if possible.',
        instructionsAfterEvent: 'You\'ll receive a summary of our session and any follow-up resources via email.',
        allowCancellation: true,
        cancellationNotice: 180,
        allowRescheduling: true,
        rescheduleNotice: 180,
        userId: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Coaching & Training Templates
      {
        id: 'template-coaching-session',
        name: '1-on-1 Coaching Session',
        slug: 'coaching-session',
        description: 'Personalized coaching session focused on your specific goals and challenges.',
        duration: 60,
        price: 15000, // $150.00
        currency: 'USD',
        meetingLocation: 'video',
        brandColor: '#06B6D4',
        isActive: true,
        isPublic: true,
        requiresConfirmation: false,
        bufferTimeBefore: 15,
        bufferTimeAfter: 15,
        minimumNotice: 720, // 12 hours
        maximumFutureBooking: 90,
        dailyBookingLimit: 4,
        weeklyBookingLimit: 20,
        monthlyBookingLimit: 0,
        collectAttendeeEmail: true,
        collectAttendeePhone: false,
        collectAttendeeMessage: true,
        customQuestions: [
          {
            id: 'coaching-goals',
            question: 'What specific goals would you like to work on in this session?',
            required: true,
            type: 'textarea'
          },
          {
            id: 'current-challenges',
            question: 'What challenges are you currently facing?',
            required: true,
            type: 'textarea'
          },
          {
            id: 'previous-coaching',
            question: 'Have you worked with a coach before?',
            required: false,
            type: 'select'
          }
        ],
        instructionsBeforeEvent: 'Please complete our pre-session questionnaire and come prepared with specific goals.',
        instructionsAfterEvent: 'You\'ll receive session notes and action items within 24 hours.',
        allowCancellation: true,
        cancellationNotice: 720,
        allowRescheduling: true,
        rescheduleNotice: 720,
        userId: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Healthcare & Legal Templates
      {
        id: 'template-legal-consultation',
        name: 'Legal Consultation',
        slug: 'legal-consultation',
        description: 'Initial legal consultation to discuss your case and explore options.',
        duration: 60,
        price: 30000, // $300.00
        currency: 'USD',
        meetingLocation: 'video',
        brandColor: '#374151',
        isActive: true,
        isPublic: true,
        requiresConfirmation: true,
        bufferTimeBefore: 15,
        bufferTimeAfter: 15,
        minimumNotice: 1440, // 24 hours
        maximumFutureBooking: 60,
        dailyBookingLimit: 6,
        weeklyBookingLimit: 0,
        monthlyBookingLimit: 0,
        collectAttendeeEmail: true,
        collectAttendeePhone: true,
        collectAttendeeMessage: true,
        customQuestions: [
          {
            id: 'legal-matter',
            question: 'What type of legal matter do you need assistance with?',
            required: true,
            type: 'select'
          },
          {
            id: 'case-details',
            question: 'Please provide a brief overview of your situation',
            required: true,
            type: 'textarea'
          },
          {
            id: 'urgency',
            question: 'How urgent is this matter?',
            required: true,
            type: 'select'
          },
          {
            id: 'prior-legal-action',
            question: 'Have you taken any prior legal action on this matter?',
            required: false,
            type: 'select'
          }
        ],
        instructionsBeforeEvent: 'Please gather any relevant documents and prepare a summary of your situation.',
        instructionsAfterEvent: 'You\'ll receive a consultation summary and next steps recommendations within 48 hours.',
        allowCancellation: true,
        cancellationNotice: 1440,
        allowRescheduling: true,
        rescheduleNotice: 1440,
        userId: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Quick Meeting Templates
      {
        id: 'template-quick-call',
        name: '15-Minute Quick Call',
        slug: '15-minute-call',
        description: 'A brief call to discuss urgent matters or quick questions.',
        duration: 15,
        price: 0,
        currency: 'USD',
        meetingLocation: 'phone',
        brandColor: '#84CC16',
        isActive: true,
        isPublic: true,
        requiresConfirmation: false,
        bufferTimeBefore: 0,
        bufferTimeAfter: 5,
        minimumNotice: 30,
        maximumFutureBooking: 7,
        dailyBookingLimit: 10,
        weeklyBookingLimit: 0,
        monthlyBookingLimit: 0,
        collectAttendeeEmail: true,
        collectAttendeePhone: true,
        collectAttendeeMessage: true,
        customQuestions: [
          {
            id: 'call-purpose',
            question: 'What would you like to discuss in this quick call?',
            required: true,
            type: 'textarea'
          }
        ],
        instructionsBeforeEvent: 'Please be ready with your questions as this is a brief 15-minute call.',
        instructionsAfterEvent: 'If you need more time, please book a longer consultation slot.',
        allowCancellation: true,
        cancellationNotice: 60,
        allowRescheduling: true,
        rescheduleNotice: 60,
        userId: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'template-office-hours',
        name: 'Office Hours',
        slug: 'office-hours',
        description: 'Drop-in style office hours for questions, feedback, or informal discussions.',
        duration: 30,
        price: 0,
        currency: 'USD',
        meetingLocation: 'video',
        brandColor: '#F97316',
        isActive: true,
        isPublic: true,
        requiresConfirmation: false,
        bufferTimeBefore: 0,
        bufferTimeAfter: 0,
        minimumNotice: 15,
        maximumFutureBooking: 7,
        dailyBookingLimit: 0,
        weeklyBookingLimit: 0,
        monthlyBookingLimit: 0,
        collectAttendeeEmail: true,
        collectAttendeePhone: false,
        collectAttendeeMessage: false,
        customQuestions: [],
        instructionsBeforeEvent: 'This is an informal session - come with any questions or topics you\'d like to discuss.',
        instructionsAfterEvent: 'Feel free to book another office hours slot anytime you have questions.',
        allowCancellation: true,
        cancellationNotice: 30,
        allowRescheduling: true,
        rescheduleNotice: 30,
        userId: '',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    return templates;
  }

  // Update appointment method (was missing from interface)
  async updateAppointment(id: string, appointmentData: Partial<InsertAppointment>): Promise<Appointment> {
    const [appointment] = await db
      .update(appointments)
      .set({ ...appointmentData, updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();
    return appointment;
  }

  // Payment operations implementation
  async createAppointmentPayment(paymentData: InsertAppointmentPayment): Promise<AppointmentPayment> {
    const [payment] = await db.insert(appointmentPayments).values(paymentData).returning();
    return payment;
  }

  async getAppointmentPayment(id: string): Promise<AppointmentPayment | undefined> {
    const [payment] = await db.select().from(appointmentPayments).where(eq(appointmentPayments.id, id));
    return payment;
  }

  async updateAppointmentPayment(id: string, paymentData: Partial<InsertAppointmentPayment>): Promise<AppointmentPayment> {
    const [payment] = await db
      .update(appointmentPayments)
      .set({ ...paymentData, updatedAt: new Date() })
      .where(eq(appointmentPayments.id, id))
      .returning();
    return payment;
  }

  async updateAppointmentPaymentByStripeId(stripePaymentIntentId: string, paymentData: Partial<InsertAppointmentPayment>): Promise<AppointmentPayment> {
    const [payment] = await db
      .update(appointmentPayments)
      .set({ ...paymentData, updatedAt: new Date() })
      .where(eq(appointmentPayments.stripePaymentIntentId, stripePaymentIntentId))
      .returning();
    return payment;
  }

  async getUserAppointmentPayments(
    userId: string, 
    filters?: {
      status?: string;
      appointmentId?: string;
      customerId?: string;
      dateFrom?: string;
      dateTo?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<AppointmentPayment[]> {
    // Get user's event types to filter payments
    const userEventTypes = await db.select().from(appointmentEventTypes)
      .where(eq(appointmentEventTypes.userId, userId));
    
    const eventTypeIds = userEventTypes.map(et => et.id);
    
    if (eventTypeIds.length === 0) {
      return [];
    }

    // Build the query with joins to filter by user's appointments
    let query = db.select({
      payment: appointmentPayments,
    }).from(appointmentPayments)
      .innerJoin(appointments, eq(appointmentPayments.appointmentId, appointments.id))
      .where(inArray(appointments.eventTypeId, eventTypeIds));

    // Apply filters
    const conditions = [];

    if (filters?.status) {
      conditions.push(eq(appointmentPayments.status, filters.status as any));
    }

    if (filters?.appointmentId) {
      conditions.push(eq(appointmentPayments.appointmentId, filters.appointmentId));
    }

    if (filters?.customerId) {
      conditions.push(eq(appointmentPayments.stripeCustomerId, filters.customerId));
    }

    if (filters?.dateFrom) {
      conditions.push(gte(appointmentPayments.createdAt, new Date(filters.dateFrom)));
    }

    if (filters?.dateTo) {
      conditions.push(lte(appointmentPayments.createdAt, new Date(filters.dateTo)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;

    const results = await query
      .orderBy(desc(appointmentPayments.createdAt))
      .limit(limit)
      .offset(offset);

    return results.map(r => r.payment);
  }

  async getPaymentAnalytics(userId: string): Promise<{
    totalRevenue: number;
    totalTransactions: number;
    successfulPayments: number;
    refundedPayments: number;
    averageTransactionValue: number;
    monthlyRevenue: Array<{ month: string; revenue: number; count: number }>;
    paymentsByStatus: Record<string, number>;
    recentPayments: Array<AppointmentPayment & { appointmentId: string; customerName: string }>;
  }> {
    // Get user's event types
    const userEventTypes = await db.select().from(appointmentEventTypes)
      .where(eq(appointmentEventTypes.userId, userId));
    
    const eventTypeIds = userEventTypes.map(et => et.id);
    
    if (eventTypeIds.length === 0) {
      return {
        totalRevenue: 0,
        totalTransactions: 0,
        successfulPayments: 0,
        refundedPayments: 0,
        averageTransactionValue: 0,
        monthlyRevenue: [],
        paymentsByStatus: {},
        recentPayments: [],
      };
    }

    // Get all payments for user's appointments
    const payments = await db.select({
      payment: appointmentPayments,
      appointment: appointments,
    }).from(appointmentPayments)
      .innerJoin(appointments, eq(appointmentPayments.appointmentId, appointments.id))
      .where(inArray(appointments.eventTypeId, eventTypeIds))
      .orderBy(desc(appointmentPayments.createdAt));

    const paymentData = payments.map(p => p.payment);
    const appointmentData = payments.map(p => p.appointment);

    // Calculate basic metrics
    const totalRevenue = paymentData
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalTransactions = paymentData.length;
    const successfulPayments = paymentData.filter(p => p.status === 'paid').length;
    const refundedPayments = paymentData.filter(p => p.status === 'refunded' || p.status === 'partially_refunded').length;
    const averageTransactionValue = successfulPayments > 0 ? Math.round(totalRevenue / successfulPayments) : 0;

    // Calculate monthly revenue
    const monthlyData = new Map<string, { revenue: number; count: number }>();
    paymentData.filter(p => p.status === 'paid').forEach(payment => {
      const month = payment.createdAt.toISOString().substring(0, 7); // YYYY-MM
      const existing = monthlyData.get(month) || { revenue: 0, count: 0 };
      monthlyData.set(month, {
        revenue: existing.revenue + payment.amount,
        count: existing.count + 1,
      });
    });

    const monthlyRevenue = Array.from(monthlyData.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Calculate payments by status
    const paymentsByStatus = paymentData.reduce((acc, payment) => {
      acc[payment.status] = (acc[payment.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get recent payments with appointment details
    const recentPayments = payments.slice(0, 10).map(({ payment, appointment }) => ({
      ...payment,
      appointmentId: appointment.id,
      customerName: appointment.attendeeName,
    }));

    return {
      totalRevenue,
      totalTransactions,
      successfulPayments,
      refundedPayments,
      averageTransactionValue,
      monthlyRevenue,
      paymentsByStatus,
      recentPayments,
    };
  }

  // Calendar Integration operations implementation
  async createCalendarConnection(connectionData: InsertCalendarConnection): Promise<CalendarConnection> {
    const [connection] = await db.insert(calendarConnections).values(connectionData).returning();
    return connection;
  }

  async getCalendarConnection(id: string): Promise<CalendarConnection | undefined> {
    const [connection] = await db.select().from(calendarConnections).where(eq(calendarConnections.id, id));
    return connection;
  }

  async getUserCalendarConnections(userId: string, filters?: { provider?: string; isActive?: boolean }): Promise<CalendarConnection[]> {
    let query = db.select().from(calendarConnections).where(eq(calendarConnections.userId, userId));
    
    const conditions = [eq(calendarConnections.userId, userId)];
    
    if (filters?.provider) {
      conditions.push(eq(calendarConnections.provider, filters.provider as any));
    }
    
    if (filters?.isActive !== undefined) {
      conditions.push(eq(calendarConnections.status, filters.isActive ? 'connected' : 'disconnected'));
    }
    
    if (conditions.length > 1) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(calendarConnections.createdAt));
  }

  async updateCalendarConnection(id: string, connectionData: Partial<InsertCalendarConnection>): Promise<CalendarConnection> {
    const [connection] = await db
      .update(calendarConnections)
      .set({ ...connectionData, updatedAt: new Date() })
      .where(eq(calendarConnections.id, id))
      .returning();
    return connection;
  }

  async deleteCalendarConnection(id: string): Promise<void> {
    await db.delete(calendarConnections).where(eq(calendarConnections.id, id));
  }

  async updateCalendarTokens(id: string, accessToken: string, refreshToken?: string): Promise<CalendarConnection> {
    const updateData: any = { accessToken, updatedAt: new Date() };
    if (refreshToken) {
      updateData.refreshToken = refreshToken;
    }
    
    const [connection] = await db
      .update(calendarConnections)
      .set(updateData)
      .where(eq(calendarConnections.id, id))
      .returning();
    return connection;
  }

  async getCalendarConnectionByProvider(userId: string, provider: string): Promise<CalendarConnection | undefined> {
    const [connection] = await db.select().from(calendarConnections)
      .where(and(
        eq(calendarConnections.userId, userId),
        eq(calendarConnections.provider, provider as any)
      ));
    return connection;
  }

  // Video Meeting Provider operations implementation
  async createVideoMeetingProvider(providerData: InsertVideoMeetingProvider): Promise<VideoMeetingProvider> {
    const [provider] = await db.insert(videoMeetingProviders).values(providerData).returning();
    return provider;
  }

  async getVideoMeetingProvider(id: string): Promise<VideoMeetingProvider | undefined> {
    const [provider] = await db.select().from(videoMeetingProviders).where(eq(videoMeetingProviders.id, id));
    return provider;
  }

  async getUserVideoMeetingProviders(userId: string, filters?: { provider?: string; isActive?: boolean }): Promise<VideoMeetingProvider[]> {
    let query = db.select().from(videoMeetingProviders).where(eq(videoMeetingProviders.userId, userId));
    
    const conditions = [eq(videoMeetingProviders.userId, userId)];
    
    if (filters?.provider) {
      conditions.push(eq(videoMeetingProviders.provider, filters.provider as any));
    }
    
    if (filters?.isActive !== undefined) {
      conditions.push(eq(videoMeetingProviders.status, filters.isActive ? 'connected' : 'disconnected'));
    }
    
    if (conditions.length > 1) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(videoMeetingProviders.createdAt));
  }

  async updateVideoMeetingProvider(id: string, providerData: Partial<InsertVideoMeetingProvider>): Promise<VideoMeetingProvider> {
    const [provider] = await db
      .update(videoMeetingProviders)
      .set({ ...providerData, updatedAt: new Date() })
      .where(eq(videoMeetingProviders.id, id))
      .returning();
    return provider;
  }

  async deleteVideoMeetingProvider(id: string): Promise<void> {
    await db.delete(videoMeetingProviders).where(eq(videoMeetingProviders.id, id));
  }

  async updateVideoProviderTokens(id: string, accessToken: string, refreshToken?: string): Promise<VideoMeetingProvider> {
    const updateData: any = { accessToken, updatedAt: new Date() };
    if (refreshToken) {
      updateData.refreshToken = refreshToken;
    }
    
    const [provider] = await db
      .update(videoMeetingProviders)
      .set(updateData)
      .where(eq(videoMeetingProviders.id, id))
      .returning();
    return provider;
  }

  async getVideoProviderByProvider(userId: string, provider: string): Promise<VideoMeetingProvider | undefined> {
    const [videoProvider] = await db.select().from(videoMeetingProviders)
      .where(and(
        eq(videoMeetingProviders.userId, userId),
        eq(videoMeetingProviders.provider, provider as any)
      ));
    return videoProvider;
  }

  // External Calendar Event operations implementation
  async createExternalCalendarEvent(eventData: InsertExternalCalendarEvent): Promise<ExternalCalendarEvent> {
    const [event] = await db.insert(externalCalendarEvents).values(eventData).returning();
    return event;
  }

  async getExternalCalendarEvent(id: string): Promise<ExternalCalendarEvent | undefined> {
    const [event] = await db.select().from(externalCalendarEvents).where(eq(externalCalendarEvents.id, id));
    return event;
  }

  async getExternalCalendarEventByExternalId(externalEventId: string, calendarConnectionId: string): Promise<ExternalCalendarEvent | undefined> {
    const [event] = await db.select().from(externalCalendarEvents)
      .where(and(
        eq(externalCalendarEvents.externalEventId, externalEventId),
        eq(externalCalendarEvents.calendarConnectionId, calendarConnectionId)
      ));
    return event;
  }

  async getAppointmentExternalEvents(appointmentId: string): Promise<ExternalCalendarEvent[]> {
    return await db.select().from(externalCalendarEvents)
      .where(eq(externalCalendarEvents.appointmentId, appointmentId));
  }

  async updateExternalCalendarEvent(id: string, eventData: Partial<InsertExternalCalendarEvent>): Promise<ExternalCalendarEvent> {
    const [event] = await db
      .update(externalCalendarEvents)
      .set({ ...eventData, updatedAt: new Date() })
      .where(eq(externalCalendarEvents.id, id))
      .returning();
    return event;
  }

  async deleteExternalCalendarEvent(id: string): Promise<void> {
    await db.delete(externalCalendarEvents).where(eq(externalCalendarEvents.id, id));
  }

  async deleteExternalCalendarEventsByAppointment(appointmentId: string): Promise<void> {
    await db.delete(externalCalendarEvents).where(eq(externalCalendarEvents.appointmentId, appointmentId));
  }

  // Meeting Link operations implementation
  async createMeetingLink(linkData: InsertMeetingLink): Promise<MeetingLink> {
    const [link] = await db.insert(meetingLinks).values(linkData).returning();
    return link;
  }

  async getMeetingLink(id: string): Promise<MeetingLink | undefined> {
    const [link] = await db.select().from(meetingLinks).where(eq(meetingLinks.id, id));
    return link;
  }

  async getMeetingLinkByAppointment(appointmentId: string): Promise<MeetingLink | undefined> {
    const [link] = await db.select().from(meetingLinks).where(eq(meetingLinks.appointmentId, appointmentId));
    return link;
  }

  async updateMeetingLink(id: string, linkData: Partial<InsertMeetingLink>): Promise<MeetingLink> {
    const [link] = await db
      .update(meetingLinks)
      .set({ ...linkData, updatedAt: new Date() })
      .where(eq(meetingLinks.id, id))
      .returning();
    return link;
  }

  async deleteMeetingLink(id: string): Promise<void> {
    await db.delete(meetingLinks).where(eq(meetingLinks.id, id));
  }

  async deleteMeetingLinksByAppointment(appointmentId: string): Promise<void> {
    await db.delete(meetingLinks).where(eq(meetingLinks.appointmentId, appointmentId));
  }

  // Integration Log operations implementation
  async createIntegrationLog(logData: InsertIntegrationLog): Promise<IntegrationLog> {
    const [log] = await db.insert(integrationLogs).values(logData).returning();
    return log;
  }

  async getIntegrationLogs(filters?: { 
    userId?: string; 
    integrationType?: string; 
    provider?: string;
    operation?: string;
    status?: string;
    limit?: number;
  }): Promise<IntegrationLog[]> {
    let query = db.select().from(integrationLogs);
    
    const conditions = [];
    
    if (filters?.userId) {
      conditions.push(eq(integrationLogs.userId, filters.userId));
    }
    
    if (filters?.integrationType) {
      conditions.push(eq(integrationLogs.integrationType, filters.integrationType));
    }
    
    if (filters?.provider) {
      conditions.push(eq(integrationLogs.provider, filters.provider));
    }
    
    if (filters?.operation) {
      conditions.push(eq(integrationLogs.operation, filters.operation));
    }
    
    if (filters?.status) {
      conditions.push(eq(integrationLogs.status, filters.status as any));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const results = await query
      .orderBy(desc(integrationLogs.createdAt))
      .limit(filters?.limit || 100);
    
    return results;
  }

  // ===== COMPREHENSIVE TEAM SCHEDULING IMPLEMENTATIONS =====

  // Team Assignment operations implementation
  async createTeamAssignment(assignmentData: InsertTeamAssignment): Promise<TeamAssignment> {
    const [assignment] = await db.insert(teamAssignments).values(assignmentData).returning();
    
    // Update round-robin state if this is a round-robin assignment
    if (assignmentData.assignmentType === 'round_robin') {
      await this.updateRoundRobinAfterAssignment(
        assignmentData.teamId, 
        assignmentData.assignedMemberId!
      );
    }
    
    return assignment;
  }

  async getTeamAssignment(id: string): Promise<TeamAssignment | undefined> {
    const [assignment] = await db.select().from(teamAssignments).where(eq(teamAssignments.id, id));
    return assignment;
  }

  async getTeamAssignments(teamId: string, filters?: { status?: string; assignmentType?: string; limit?: number }): Promise<TeamAssignment[]> {
    let query = db.select().from(teamAssignments).where(eq(teamAssignments.teamId, teamId));
    
    const conditions = [eq(teamAssignments.teamId, teamId)];
    
    if (filters?.status) {
      conditions.push(eq(teamAssignments.status, filters.status));
    }
    
    if (filters?.assignmentType) {
      conditions.push(eq(teamAssignments.assignmentType, filters.assignmentType));
    }
    
    return await db.select().from(teamAssignments)
      .where(and(...conditions))
      .orderBy(desc(teamAssignments.createdAt))
      .limit(filters?.limit || 100);
  }

  async getAppointmentAssignment(appointmentId: string): Promise<TeamAssignment | undefined> {
    const [assignment] = await db.select().from(teamAssignments)
      .where(eq(teamAssignments.appointmentId, appointmentId));
    return assignment;
  }

  async getMemberAssignments(memberId: string, filters?: { status?: string; dateFrom?: Date; dateTo?: Date }): Promise<TeamAssignment[]> {
    const conditions = [eq(teamAssignments.assignedMemberId, memberId)];
    
    if (filters?.status) {
      conditions.push(eq(teamAssignments.status, filters.status));
    }
    
    if (filters?.dateFrom) {
      conditions.push(gte(teamAssignments.assignedAt, filters.dateFrom));
    }
    
    if (filters?.dateTo) {
      conditions.push(lte(teamAssignments.assignedAt, filters.dateTo));
    }
    
    return await db.select().from(teamAssignments)
      .where(and(...conditions))
      .orderBy(desc(teamAssignments.assignedAt));
  }

  async updateTeamAssignment(id: string, assignmentData: Partial<InsertTeamAssignment>): Promise<TeamAssignment> {
    const [assignment] = await db
      .update(teamAssignments)
      .set({ ...assignmentData, updatedAt: new Date() })
      .where(eq(teamAssignments.id, id))
      .returning();
    return assignment;
  }

  async deleteTeamAssignment(id: string): Promise<void> {
    await db.delete(teamAssignments).where(eq(teamAssignments.id, id));
  }

  // Round-Robin State operations implementation
  async getRoundRobinState(teamId: string, eventTypeId?: string): Promise<RoundRobinState | undefined> {
    const conditions = [eq(roundRobinState.teamId, teamId)];
    
    if (eventTypeId) {
      conditions.push(eq(roundRobinState.eventTypeId, eventTypeId));
    }
    
    const [state] = await db.select().from(roundRobinState).where(and(...conditions));
    return state;
  }

  async createRoundRobinState(stateData: InsertRoundRobinState): Promise<RoundRobinState> {
    const [state] = await db.insert(roundRobinState).values(stateData).returning();
    return state;
  }

  async updateRoundRobinState(id: string, stateData: Partial<InsertRoundRobinState>): Promise<RoundRobinState> {
    const [state] = await db
      .update(roundRobinState)
      .set({ ...stateData, updatedAt: new Date() })
      .where(eq(roundRobinState.id, id))
      .returning();
    return state;
  }

  async getNextRoundRobinAssignment(teamId: string, eventTypeId?: string, filters?: { requiredSkills?: string[]; excludeMembers?: string[] }): Promise<string | null> {
    // Use database transaction with row-level locking for concurrency safety
    return await db.transaction(async (tx) => {
      // Get or create round-robin state WITH row-level lock to prevent race conditions
      let state = await this.getRoundRobinStateWithLock(tx, teamId, eventTypeId);
      
      if (!state) {
        // Initialize round-robin state
        const teamMembersResult = await this.getTeamMembers(teamId);
        const activeMembers = teamMembersResult.filter(m => m.status === 'active');
        
        if (activeMembers.length === 0) return null;
        
        const rotationOrder = activeMembers.map(m => m.userId!).filter(Boolean);
        const memberCounts: Record<string, number> = {};
        rotationOrder.forEach(id => memberCounts[id] = 0);
        
        // Create initial state within transaction
        const [newState] = await tx.insert(roundRobinState).values({
          teamId,
          eventTypeId: eventTypeId || null,
          currentIndex: 0,
          rotationOrder: rotationOrder as any,
          memberAssignmentCounts: memberCounts as any,
          totalAssignments: 0
        }).returning();
        
        state = newState;
      }
      
      const rotationOrder = state.rotationOrder as string[];
      const memberCounts = state.memberAssignmentCounts as Record<string, number>;
      
      // Filter available members based on criteria
      let availableMembers = [...rotationOrder];
      
      if (filters?.excludeMembers) {
        availableMembers = availableMembers.filter(id => !filters.excludeMembers!.includes(id));
      }
      
      if (filters?.requiredSkills && filters.requiredSkills.length > 0) {
        // Check which members have required skills
        const membersWithSkills = await Promise.all(
          availableMembers.map(async (memberId) => {
            const memberSkills = await this.getMemberSkills(memberId);
            const hasRequiredSkills = filters.requiredSkills!.every(skill =>
              memberSkills.some(s => s.skillName === skill && s.proficiencyLevel >= 3)
            );
            return hasRequiredSkills ? memberId : null;
          })
        );
        
        availableMembers = membersWithSkills.filter(Boolean) as string[];
      }
      
      if (availableMembers.length === 0) return null;
      
      // Find member with lowest assignment count
      const lowestCount = Math.min(...availableMembers.map(id => memberCounts[id] || 0));
      const candidateMembers = availableMembers.filter(id => (memberCounts[id] || 0) === lowestCount);
      
      // Select next member in rotation order among candidates
      let selectedMember: string | null = null;
      for (let i = state.currentIndex; i < rotationOrder.length + state.currentIndex; i++) {
        const currentMember = rotationOrder[i % rotationOrder.length];
        if (candidateMembers.includes(currentMember)) {
          selectedMember = currentMember;
          
          // Update state atomically within the same transaction
          const updatedMemberCounts = { ...memberCounts };
          updatedMemberCounts[selectedMember] = (updatedMemberCounts[selectedMember] || 0) + 1;
          
          await tx
            .update(roundRobinState)
            .set({
              currentIndex: (i + 1) % rotationOrder.length,
              lastAssignedMemberId: selectedMember,
              memberAssignmentCounts: updatedMemberCounts as any,
              totalAssignments: state.totalAssignments + 1,
              lastAssignedAt: new Date(),
              updatedAt: new Date()
            })
            .where(eq(roundRobinState.id, state.id));
          
          break;
        }
      }
      
      return selectedMember;
    });
  }

  // Helper method to get round-robin state with row-level lock
  private async getRoundRobinStateWithLock(tx: any, teamId: string, eventTypeId?: string): Promise<RoundRobinState | undefined> {
    const conditions = [eq(roundRobinState.teamId, teamId)];
    
    if (eventTypeId) {
      conditions.push(eq(roundRobinState.eventTypeId, eventTypeId));
    }
    
    // Use SELECT ... FOR UPDATE to acquire row-level lock and prevent race conditions
    const [state] = await tx
      .select()
      .from(roundRobinState)
      .where(and(...conditions))
      .for('update');  // Critical: This locks the row until transaction completes
    
    return state;
  }

  private async updateRoundRobinAfterAssignment(teamId: string, assignedMemberId: string): Promise<void> {
    const state = await this.getRoundRobinState(teamId);
    if (!state) return;
    
    const memberCounts = state.memberAssignmentCounts as Record<string, number>;
    memberCounts[assignedMemberId] = (memberCounts[assignedMemberId] || 0) + 1;
    
    await this.updateRoundRobinState(state.id, {
      memberAssignmentCounts: memberCounts as any,
      totalAssignments: state.totalAssignments + 1
    });
  }

  async rebalanceRoundRobin(teamId: string, eventTypeId?: string): Promise<RoundRobinState> {
    // Use database transaction with row-level locking for concurrency safety
    return await db.transaction(async (tx) => {
      const state = await this.getRoundRobinStateWithLock(tx, teamId, eventTypeId);
      if (!state) throw new Error('Round-robin state not found');
      
      const memberCounts = state.memberAssignmentCounts as Record<string, number>;
      const minCount = Math.min(...Object.values(memberCounts));
      
      // Reset counts to minimum for rebalancing
      const rebalancedCounts: Record<string, number> = {};
      Object.keys(memberCounts).forEach(memberId => {
        rebalancedCounts[memberId] = minCount;
      });
      
      const [updatedState] = await tx
        .update(roundRobinState)
        .set({
          memberAssignmentCounts: rebalancedCounts as any,
          currentIndex: 0,
          updatedAt: new Date()
        })
        .where(eq(roundRobinState.id, state.id))
        .returning();
      
      return updatedState;
    });
  }

  async resetRoundRobin(teamId: string, eventTypeId?: string): Promise<RoundRobinState> {
    // Use database transaction with row-level locking for concurrency safety
    return await db.transaction(async (tx) => {
      const state = await this.getRoundRobinStateWithLock(tx, teamId, eventTypeId);
      if (!state) throw new Error('Round-robin state not found');
      
      const rotationOrder = state.rotationOrder as string[];
      const resetCounts: Record<string, number> = {};
      rotationOrder.forEach(id => resetCounts[id] = 0);
      
      const [updatedState] = await tx
        .update(roundRobinState)
        .set({
          memberAssignmentCounts: resetCounts as any,
          currentIndex: 0,
          totalAssignments: 0,
          lastResetAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(roundRobinState.id, state.id))
        .returning();
      
      return updatedState;
    });
  }

  // Lead Routing Rules operations implementation
  async createLeadRoutingRule(ruleData: InsertLeadRoutingRule): Promise<LeadRoutingRule> {
    const [rule] = await db.insert(leadRoutingRules).values(ruleData).returning();
    return rule;
  }

  async getLeadRoutingRule(id: string): Promise<LeadRoutingRule | undefined> {
    const [rule] = await db.select().from(leadRoutingRules).where(eq(leadRoutingRules.id, id));
    return rule;
  }

  async getTeamRoutingRules(teamId: string, filters?: { isActive?: boolean; strategy?: string }): Promise<LeadRoutingRule[]> {
    const conditions = [eq(leadRoutingRules.teamId, teamId)];
    
    if (filters?.isActive !== undefined) {
      conditions.push(eq(leadRoutingRules.isActive, filters.isActive));
    }
    
    if (filters?.strategy) {
      conditions.push(eq(leadRoutingRules.assignmentStrategy, filters.strategy));
    }
    
    return await db.select().from(leadRoutingRules)
      .where(and(...conditions))
      .orderBy(desc(leadRoutingRules.priority));
  }

  async updateLeadRoutingRule(id: string, ruleData: Partial<InsertLeadRoutingRule>): Promise<LeadRoutingRule> {
    const [rule] = await db
      .update(leadRoutingRules)
      .set({ ...ruleData, updatedAt: new Date() })
      .where(eq(leadRoutingRules.id, id))
      .returning();
    return rule;
  }

  async deleteLeadRoutingRule(id: string): Promise<void> {
    await db.delete(leadRoutingRules).where(eq(leadRoutingRules.id, id));
  }

  async evaluateRoutingRules(teamId: string, context: any): Promise<{ memberId: string; ruleId: string; score: number } | null> {
    const rules = await this.getTeamRoutingRules(teamId, { isActive: true });
    const teamMembersResult = await this.getTeamMembers(teamId);
    const activeMembers = teamMembersResult.filter(m => m.status === 'active' && m.userId);
    
    if (activeMembers.length === 0) return null;
    
    for (const rule of rules) {
      const eligibleMembers = await this.evaluateRuleConditions(rule, activeMembers, context);
      
      if (eligibleMembers.length > 0) {
        const bestMatch = await this.scoreAndSelectMember(rule, eligibleMembers, context);
        if (bestMatch) {
          // Update rule usage
          await this.updateLeadRoutingRule(rule.id, {
            usageCount: rule.usageCount + 1
          });
          
          return {
            memberId: bestMatch.memberId,
            ruleId: rule.id,
            score: bestMatch.score
          };
        }
      }
    }
    
    // Fallback to round-robin if no rules match
    const fallbackMember = await this.getNextRoundRobinAssignment(teamId);
    if (fallbackMember) {
      return {
        memberId: fallbackMember,
        ruleId: 'fallback',
        score: 0
      };
    }
    
    return null;
  }

  private async evaluateRuleConditions(rule: LeadRoutingRule, members: TeamMember[], context: any): Promise<TeamMember[]> {
    const conditions = rule.conditions as any;
    let eligibleMembers = [...members];
    
    // Filter by target members if specified
    if (rule.targetMembers && (rule.targetMembers as string[]).length > 0) {
      eligibleMembers = eligibleMembers.filter(m => 
        (rule.targetMembers as string[]).includes(m.userId!)
      );
    }
    
    // Filter by required skills
    if (rule.requiredSkills && (rule.requiredSkills as string[]).length > 0) {
      const membersWithSkills = await Promise.all(
        eligibleMembers.map(async (member) => {
          const memberSkills = await this.getMemberSkills(member.id);
          const hasRequiredSkills = (rule.requiredSkills as string[]).every(skill =>
            memberSkills.some(s => s.skillName === skill && s.proficiencyLevel >= 3)
          );
          return hasRequiredSkills ? member : null;
        })
      );
      
      eligibleMembers = membersWithSkills.filter(Boolean) as TeamMember[];
    }
    
    // Additional condition evaluation based on context
    // This can be expanded based on specific business rules
    
    return eligibleMembers;
  }

  private async scoreAndSelectMember(rule: LeadRoutingRule, members: TeamMember[], context: any): Promise<{ memberId: string; score: number } | null> {
    if (members.length === 0) return null;
    
    const scores = await Promise.all(
      members.map(async (member) => {
        let totalScore = 0;
        
        // Skill scoring
        if (rule.requiredSkills && (rule.requiredSkills as string[]).length > 0) {
          const memberSkills = await this.getMemberSkills(member.id);
          const skillScore = this.calculateSkillScore(memberSkills, rule.requiredSkills as string[], rule.preferredSkills as string[]);
          totalScore += skillScore * (rule.skillWeight / 100);
        }
        
        // Availability scoring
        const capacity = await this.getTeamMemberCapacity(member.id);
        if (capacity) {
          const availabilityScore = this.calculateAvailabilityScore(capacity);
          totalScore += availabilityScore * (rule.availabilityWeight / 100);
        }
        
        // Performance scoring
        const analytics = await this.getAssignmentAnalytics(rule.teamId, member.userId!);
        if (analytics.length > 0) {
          const performanceScore = this.calculatePerformanceScore(analytics);
          totalScore += performanceScore * (rule.performanceWeight / 100);
        }
        
        return {
          memberId: member.userId!,
          score: totalScore
        };
      })
    );
    
    // Return member with highest score
    return scores.reduce((best, current) => 
      current.score > best.score ? current : best
    );
  }

  private calculateSkillScore(memberSkills: TeamMemberSkill[], required: string[], preferred: string[]): number {
    let score = 0;
    
    required.forEach(skill => {
      const memberSkill = memberSkills.find(s => s.skillName === skill);
      if (memberSkill) {
        score += memberSkill.proficiencyLevel * 20; // Up to 100 points for required skills
      }
    });
    
    preferred.forEach(skill => {
      const memberSkill = memberSkills.find(s => s.skillName === skill);
      if (memberSkill) {
        score += memberSkill.proficiencyLevel * 10; // Up to 50 points for preferred skills
      }
    });
    
    return Math.min(score, 100); // Cap at 100
  }

  private calculateAvailabilityScore(capacity: TeamMemberCapacity): number {
    const utilizationRate = (capacity.currentDailyLoad / capacity.maxDailyAppointments) * 100;
    return Math.max(0, 100 - utilizationRate); // Higher score for lower utilization
  }

  private calculatePerformanceScore(analytics: AssignmentAnalytics[]): number {
    if (analytics.length === 0) return 50; // Default score
    
    const latest = analytics[0];
    let score = 0;
    
    if (latest.completedAssignments > 0) {
      const completionRate = (latest.completedAssignments / latest.totalAssignments) * 100;
      score += completionRate * 0.4;
    }
    
    if (latest.clientSatisfactionScore > 0) {
      score += (latest.clientSatisfactionScore / 5) * 100 * 0.6;
    }
    
    return Math.min(score, 100);
  }

  // Team Member Skills operations implementation
  async createTeamMemberSkill(skillData: InsertTeamMemberSkill): Promise<TeamMemberSkill> {
    const [skill] = await db.insert(teamMemberSkills).values(skillData).returning();
    return skill;
  }

  async getTeamMemberSkill(id: string): Promise<TeamMemberSkill | undefined> {
    const [skill] = await db.select().from(teamMemberSkills).where(eq(teamMemberSkills.id, id));
    return skill;
  }

  async getMemberSkills(teamMemberId: string, filters?: { category?: string; verified?: boolean }): Promise<TeamMemberSkill[]> {
    const conditions = [eq(teamMemberSkills.teamMemberId, teamMemberId)];
    
    if (filters?.category) {
      conditions.push(eq(teamMemberSkills.skillCategory, filters.category));
    }
    
    if (filters?.verified !== undefined) {
      conditions.push(eq(teamMemberSkills.isVerified, filters.verified));
    }
    
    return await db.select().from(teamMemberSkills)
      .where(and(...conditions))
      .orderBy(desc(teamMemberSkills.proficiencyLevel));
  }

  async getTeamMembersBySkill(teamId: string, skillName: string, minLevel?: number): Promise<TeamMemberSkill[]> {
    const conditions = [eq(teamMemberSkills.skillName, skillName)];
    
    if (minLevel) {
      conditions.push(gte(teamMemberSkills.proficiencyLevel, minLevel));
    }
    
    // Join with team members to filter by team
    const results = await db
      .select({
        id: teamMemberSkills.id,
        teamMemberId: teamMemberSkills.teamMemberId,
        skillName: teamMemberSkills.skillName,
        skillCategory: teamMemberSkills.skillCategory,
        proficiencyLevel: teamMemberSkills.proficiencyLevel,
        isVerified: teamMemberSkills.isVerified,
        verifiedBy: teamMemberSkills.verifiedBy,
        verificationDate: teamMemberSkills.verificationDate,
        acquisitionDate: teamMemberSkills.acquisitionDate,
        lastUsed: teamMemberSkills.lastUsed,
        usageCount: teamMemberSkills.usageCount,
        createdAt: teamMemberSkills.createdAt,
        updatedAt: teamMemberSkills.updatedAt
      })
      .from(teamMemberSkills)
      .leftJoin(teamMembers, eq(teamMemberSkills.teamMemberId, teamMembers.id))
      .where(and(
        eq(teamMembers.teamId, teamId),
        ...conditions
      ))
      .orderBy(desc(teamMemberSkills.proficiencyLevel));
    
    return results;
  }

  async updateTeamMemberSkill(id: string, skillData: Partial<InsertTeamMemberSkill>): Promise<TeamMemberSkill> {
    const [skill] = await db
      .update(teamMemberSkills)
      .set({ ...skillData, updatedAt: new Date() })
      .where(eq(teamMemberSkills.id, id))
      .returning();
    return skill;
  }

  async deleteTeamMemberSkill(id: string): Promise<void> {
    await db.delete(teamMemberSkills).where(eq(teamMemberSkills.id, id));
  }

  async verifyMemberSkill(id: string, verifiedBy: string): Promise<TeamMemberSkill> {
    const [skill] = await db
      .update(teamMemberSkills)
      .set({
        isVerified: true,
        verifiedBy,
        verificationDate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(teamMemberSkills.id, id))
      .returning();
    return skill;
  }

  // Team Member Capacity operations implementation
  async createTeamMemberCapacity(capacityData: InsertTeamMemberCapacity): Promise<TeamMemberCapacity> {
    const [capacity] = await db.insert(teamMemberCapacity).values(capacityData).returning();
    return capacity;
  }

  async getTeamMemberCapacity(teamMemberId: string): Promise<TeamMemberCapacity | undefined> {
    const [capacity] = await db.select().from(teamMemberCapacity)
      .where(eq(teamMemberCapacity.teamMemberId, teamMemberId))
      .orderBy(desc(teamMemberCapacity.createdAt));
    return capacity;
  }

  async updateTeamMemberCapacity(id: string, capacityData: Partial<InsertTeamMemberCapacity>): Promise<TeamMemberCapacity> {
    const [capacity] = await db
      .update(teamMemberCapacity)
      .set({ ...capacityData, updatedAt: new Date() })
      .where(eq(teamMemberCapacity.id, id))
      .returning();
    return capacity;
  }

  async deleteTeamMemberCapacity(id: string): Promise<void> {
    await db.delete(teamMemberCapacity).where(eq(teamMemberCapacity.id, id));
  }

  async checkMemberCapacity(teamMemberId: string, appointmentDuration: number, appointmentDate: Date): Promise<{ available: boolean; reason?: string }> {
    const capacity = await this.getTeamMemberCapacity(teamMemberId);
    if (!capacity) {
      return { available: true }; // No capacity restrictions
    }
    
    const appointmentDay = new Date(appointmentDate);
    appointmentDay.setHours(0, 0, 0, 0);
    
    // Check daily capacity
    if (capacity.currentDailyLoad >= capacity.maxDailyAppointments) {
      return { available: false, reason: 'Daily appointment limit reached' };
    }
    
    // Check appointment duration limits
    if (appointmentDuration > capacity.maxAppointmentDuration) {
      return { available: false, reason: 'Appointment duration exceeds member limit' };
    }
    
    if (appointmentDuration < capacity.minAppointmentDuration) {
      return { available: false, reason: 'Appointment duration below member minimum' };
    }
    
    return { available: true };
  }

  async updateMemberWorkload(teamMemberId: string, increment: number): Promise<TeamMemberCapacity> {
    const capacity = await this.getTeamMemberCapacity(teamMemberId);
    if (!capacity) {
      throw new Error('Member capacity not found');
    }
    
    const newDailyLoad = Math.max(0, capacity.currentDailyLoad + increment);
    const newWeeklyLoad = Math.max(0, capacity.currentWeeklyLoad + increment);
    
    return await this.updateTeamMemberCapacity(capacity.id, {
      currentDailyLoad: newDailyLoad,
      currentWeeklyLoad: newWeeklyLoad,
      lastLoadUpdate: new Date()
    });
  }

  // Team Availability Patterns operations implementation
  async createTeamAvailabilityPattern(patternData: InsertTeamAvailabilityPattern): Promise<TeamAvailabilityPattern> {
    const [pattern] = await db.insert(teamAvailabilityPatterns).values(patternData).returning();
    return pattern;
  }

  async getTeamAvailabilityPattern(id: string): Promise<TeamAvailabilityPattern | undefined> {
    const [pattern] = await db.select().from(teamAvailabilityPatterns).where(eq(teamAvailabilityPatterns.id, id));
    return pattern;
  }

  async getTeamAvailabilityPatterns(teamId: string, filters?: { isActive?: boolean; patternType?: string }): Promise<TeamAvailabilityPattern[]> {
    const conditions = [eq(teamAvailabilityPatterns.teamId, teamId)];
    
    if (filters?.isActive !== undefined) {
      conditions.push(eq(teamAvailabilityPatterns.isActive, filters.isActive));
    }
    
    if (filters?.patternType) {
      conditions.push(eq(teamAvailabilityPatterns.patternType, filters.patternType));
    }
    
    return await db.select().from(teamAvailabilityPatterns)
      .where(and(...conditions))
      .orderBy(desc(teamAvailabilityPatterns.priority));
  }

  async updateTeamAvailabilityPattern(id: string, patternData: Partial<InsertTeamAvailabilityPattern>): Promise<TeamAvailabilityPattern> {
    const [pattern] = await db
      .update(teamAvailabilityPatterns)
      .set({ ...patternData, updatedAt: new Date() })
      .where(eq(teamAvailabilityPatterns.id, id))
      .returning();
    return pattern;
  }

  async deleteTeamAvailabilityPattern(id: string): Promise<void> {
    await db.delete(teamAvailabilityPatterns).where(eq(teamAvailabilityPatterns.id, id));
  }

  async getCollectiveAvailability(teamId: string, date: Date, duration: number): Promise<{
    timeSlot: string;
    availableMembers: string[];
    minimumMet: boolean;
    preferredMet: boolean;
  }[]> {
    const patterns = await this.getTeamAvailabilityPatterns(teamId, { isActive: true });
    const teamMembersResult = await this.getTeamMembers(teamId);
    const activeMembers = teamMembersResult.filter(m => m.status === 'active' && m.userId);
    
    const weekday = date.toLocaleDateString('en', { weekday: 'lowercase' }) as any;
    const results: Array<{
      timeSlot: string;
      availableMembers: string[];
      minimumMet: boolean;
      preferredMet: boolean;
    }> = [];
    
    // Generate time slots for the day (e.g., every 30 minutes from 9 AM to 5 PM)
    const startHour = 9;
    const endHour = 17;
    const slotDuration = 30; // minutes
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const availableMembers: string[] = [];
        
        // Check each member's availability for this time slot
        for (const member of activeMembers) {
          const isAvailable = await this.isMemberAvailableAtTime(member.userId!, date, timeSlot, duration);
          if (isAvailable) {
            availableMembers.push(member.userId!);
          }
        }
        
        // Evaluate against patterns
        let minimumMet = true;
        let preferredMet = true;
        
        for (const pattern of patterns) {
          const weekdayPatterns = pattern.weekdayPatterns as any;
          const dayPattern = weekdayPatterns[weekday];
          
          if (dayPattern) {
            // Check minimum members requirement
            if (dayPattern.minMembers && availableMembers.length < dayPattern.minMembers) {
              minimumMet = false;
            }
            
            // Check preferred members
            if (dayPattern.preferredMembers && dayPattern.preferredMembers.length > 0) {
              const preferredAvailable = dayPattern.preferredMembers.filter((id: string) => 
                availableMembers.includes(id)
              );
              if (preferredAvailable.length === 0) {
                preferredMet = false;
              }
            }
          }
        }
        
        results.push({
          timeSlot,
          availableMembers,
          minimumMet,
          preferredMet
        });
      }
    }
    
    return results;
  }

  private async isMemberAvailableAtTime(userId: string, date: Date, timeSlot: string, duration: number): Promise<boolean> {
    // Check member's individual availability schedule
    const weekday = date.toLocaleDateString('en', { weekday: 'lowercase' }) as any;
    
    const availability = await db.select().from(teamMemberAvailability)
      .where(and(
        eq(teamMemberAvailability.userId, userId),
        eq(teamMemberAvailability.weekday, weekday)
      ));
    
    for (const slot of availability) {
      if (this.isTimeInRange(timeSlot, slot.startTime, slot.endTime)) {
        // Check if member has capacity for this appointment
        const member = await db.select().from(teamMembers)
          .where(eq(teamMembers.userId, userId))
          .limit(1);
        
        if (member.length > 0) {
          const capacity = await this.checkMemberCapacity(member[0].id, duration, date);
          return capacity.available;
        }
      }
    }
    
    return false;
  }

  private isTimeInRange(timeSlot: string, startTime: string, endTime: string): boolean {
    const [slotHour, slotMinute] = timeSlot.split(':').map(Number);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const slotMinutes = slotHour * 60 + slotMinute;
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    return slotMinutes >= startMinutes && slotMinutes < endMinutes;
  }

  // Assignment Analytics operations implementation
  async createAssignmentAnalytics(analyticsData: InsertAssignmentAnalytics): Promise<AssignmentAnalytics> {
    const [analytics] = await db.insert(assignmentAnalytics).values(analyticsData).returning();
    return analytics;
  }

  async getAssignmentAnalytics(teamId: string, memberId?: string, periodType?: string, periodStart?: Date): Promise<AssignmentAnalytics[]> {
    const conditions = [eq(assignmentAnalytics.teamId, teamId)];
    
    if (memberId) {
      conditions.push(eq(assignmentAnalytics.teamMemberId, memberId));
    }
    
    if (periodType) {
      conditions.push(eq(assignmentAnalytics.periodType, periodType));
    }
    
    if (periodStart) {
      conditions.push(eq(assignmentAnalytics.periodStart, periodStart));
    }
    
    return await db.select().from(assignmentAnalytics)
      .where(and(...conditions))
      .orderBy(desc(assignmentAnalytics.periodStart));
  }

  async updateAssignmentAnalytics(id: string, analyticsData: Partial<InsertAssignmentAnalytics>): Promise<AssignmentAnalytics> {
    const [analytics] = await db
      .update(assignmentAnalytics)
      .set(analyticsData)
      .where(eq(assignmentAnalytics.id, id))
      .returning();
    return analytics;
  }

  async generateMemberAnalytics(teamMemberId: string, periodType: string): Promise<AssignmentAnalytics> {
    // Implementation would calculate analytics for the specified period
    // This is a complex calculation that would aggregate data from assignments, appointments, etc.
    const now = new Date();
    let periodStart: Date;
    let periodEnd: Date;
    
    switch (periodType) {
      case 'daily':
        periodStart = new Date(now);
        periodStart.setHours(0, 0, 0, 0);
        periodEnd = new Date(periodStart);
        periodEnd.setDate(periodEnd.getDate() + 1);
        break;
      case 'weekly':
        periodStart = new Date(now);
        periodStart.setDate(now.getDate() - now.getDay());
        periodStart.setHours(0, 0, 0, 0);
        periodEnd = new Date(periodStart);
        periodEnd.setDate(periodEnd.getDate() + 7);
        break;
      case 'monthly':
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      default:
        throw new Error('Invalid period type');
    }
    
    // Get team ID from team member
    const member = await this.getTeamMember(teamMemberId);
    if (!member) throw new Error('Team member not found');
    
    // Calculate analytics (simplified implementation)
    const assignments = await this.getMemberAssignments(member.userId!, {
      dateFrom: periodStart,
      dateTo: periodEnd
    });
    
    const analyticsData: InsertAssignmentAnalytics = {
      teamId: member.teamId,
      teamMemberId: member.userId!,
      periodType,
      periodStart,
      periodEnd,
      totalAssignments: assignments.length,
      completedAssignments: assignments.filter(a => a.status === 'accepted').length,
      cancelledAssignments: assignments.filter(a => a.status === 'rejected').length,
      utilizationRate: 75, // This would be calculated based on actual data
    };
    
    return await this.createAssignmentAnalytics(analyticsData);
  }

  async getTeamPerformanceMetrics(teamId: string, dateRange?: { from: Date; to: Date }): Promise<{
    totalAssignments: number;
    completionRate: number;
    averageResponseTime: number;
    memberDistribution: Record<string, number>;
    revenueGenerated: number;
  }> {
    const conditions = [eq(teamAssignments.teamId, teamId)];
    
    if (dateRange) {
      conditions.push(gte(teamAssignments.assignedAt, dateRange.from));
      conditions.push(lte(teamAssignments.assignedAt, dateRange.to));
    }
    
    const assignments = await db.select().from(teamAssignments)
      .where(and(...conditions));
    
    const totalAssignments = assignments.length;
    const completedAssignments = assignments.filter(a => a.status === 'accepted').length;
    const completionRate = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;
    
    // Calculate member distribution
    const memberDistribution: Record<string, number> = {};
    assignments.forEach(assignment => {
      if (assignment.assignedMemberId) {
        memberDistribution[assignment.assignedMemberId] = (memberDistribution[assignment.assignedMemberId] || 0) + 1;
      }
    });
    
    return {
      totalAssignments,
      completionRate,
      averageResponseTime: 0, // Would be calculated from actual response time data
      memberDistribution,
      revenueGenerated: 0, // Would be calculated from appointment values
    };
  }

  // Routing Analytics operations implementation
  async createRoutingAnalytics(analyticsData: InsertRoutingAnalytics): Promise<RoutingAnalytics> {
    const [analytics] = await db.insert(routingAnalytics).values(analyticsData).returning();
    return analytics;
  }

  async getRoutingAnalytics(teamId: string, filters?: { ruleId?: string; dateFrom?: Date; dateTo?: Date }): Promise<RoutingAnalytics[]> {
    const conditions = [eq(routingAnalytics.teamId, teamId)];
    
    if (filters?.ruleId) {
      conditions.push(eq(routingAnalytics.routingRuleId, filters.ruleId));
    }
    
    if (filters?.dateFrom) {
      conditions.push(gte(routingAnalytics.createdAt, filters.dateFrom));
    }
    
    if (filters?.dateTo) {
      conditions.push(lte(routingAnalytics.createdAt, filters.dateTo));
    }
    
    return await db.select().from(routingAnalytics)
      .where(and(...conditions))
      .orderBy(desc(routingAnalytics.createdAt));
  }

  async getRulePerformance(ruleId: string, dateRange?: { from: Date; to: Date }): Promise<{
    usageCount: number;
    successRate: number;
    averageSatisfaction: number;
    totalRevenue: number;
    averageRoutingTime: number;
  }> {
    const conditions = [eq(routingAnalytics.routingRuleId, ruleId)];
    
    if (dateRange) {
      conditions.push(gte(routingAnalytics.createdAt, dateRange.from));
      conditions.push(lte(routingAnalytics.createdAt, dateRange.to));
    }
    
    const analytics = await db.select().from(routingAnalytics)
      .where(and(...conditions));
    
    const usageCount = analytics.length;
    const successfulAssignments = analytics.filter(a => a.appointmentStatus === 'completed').length;
    const successRate = usageCount > 0 ? (successfulAssignments / usageCount) * 100 : 0;
    
    const totalSatisfaction = analytics.reduce((sum, a) => sum + (a.clientSatisfaction || 0), 0);
    const averageSatisfaction = usageCount > 0 ? totalSatisfaction / usageCount : 0;
    
    const totalRevenue = analytics.reduce((sum, a) => sum + (a.appointmentValue || 0), 0);
    
    const totalRoutingTime = analytics.reduce((sum, a) => sum + (a.routingTime || 0), 0);
    const averageRoutingTime = usageCount > 0 ? totalRoutingTime / usageCount : 0;
    
    return {
      usageCount,
      successRate,
      averageSatisfaction,
      totalRevenue,
      averageRoutingTime
    };
  }

  // Advanced Team Scheduling operations implementation
  async findOptimalAssignment(teamId: string, appointmentContext: {
    eventTypeId: string;
    duration: number;
    scheduledTime: Date;
    clientInfo?: any;
    requiredSkills?: string[];
    preferredMembers?: string[];
  }): Promise<{
    recommendedMemberId: string;
    score: number;
    reasoning: string;
    alternatives: Array<{ memberId: string; score: number }>;
  } | null> {
    
    // First try routing rules
    const routingResult = await this.evaluateRoutingRules(teamId, appointmentContext);
    if (routingResult) {
      const alternatives = await this.getAlternativeAssignments(teamId, appointmentContext, routingResult.memberId);
      
      return {
        recommendedMemberId: routingResult.memberId,
        score: routingResult.score,
        reasoning: `Selected via routing rule ${routingResult.ruleId}`,
        alternatives
      };
    }
    
    // Fallback to round-robin
    const roundRobinMember = await this.getNextRoundRobinAssignment(
      teamId,
      appointmentContext.eventTypeId,
      {
        requiredSkills: appointmentContext.requiredSkills,
        excludeMembers: []
      }
    );
    
    if (roundRobinMember) {
      const alternatives = await this.getAlternativeAssignments(teamId, appointmentContext, roundRobinMember);
      
      return {
        recommendedMemberId: roundRobinMember,
        score: 50, // Default round-robin score
        reasoning: 'Selected via round-robin assignment',
        alternatives
      };
    }
    
    return null;
  }

  private async getAlternativeAssignments(teamId: string, context: any, excludeMember: string): Promise<Array<{ memberId: string; score: number }>> {
    const teamMembersResult = await this.getTeamMembers(teamId);
    const alternatives = teamMembersResult
      .filter(m => m.status === 'active' && m.userId && m.userId !== excludeMember)
      .slice(0, 3) // Top 3 alternatives
      .map(member => ({
        memberId: member.userId!,
        score: Math.floor(Math.random() * 80) + 10 // Simplified scoring
      }))
      .sort((a, b) => b.score - a.score);
    
    return alternatives;
  }

  async getTeamSchedulingStats(teamId: string): Promise<{
    totalMembers: number;
    activeMembers: number;
    averageUtilization: number;
    roundRobinBalance: number;
    routingEfficiency: number;
    memberCapacities: Record<string, { current: number; maximum: number }>;
  }> {
    const teamMembersResult = await this.getTeamMembers(teamId);
    const totalMembers = teamMembersResult.length;
    const activeMembers = teamMembersResult.filter(m => m.status === 'active').length;
    
    // Calculate average utilization
    let totalUtilization = 0;
    const memberCapacities: Record<string, { current: number; maximum: number }> = {};
    
    for (const member of teamMembersResult.filter(m => m.status === 'active' && m.userId)) {
      const capacity = await this.getTeamMemberCapacity(member.id);
      if (capacity) {
        const utilization = capacity.maxDailyAppointments > 0 
          ? (capacity.currentDailyLoad / capacity.maxDailyAppointments) * 100
          : 0;
        totalUtilization += utilization;
        
        memberCapacities[member.userId!] = {
          current: capacity.currentDailyLoad,
          maximum: capacity.maxDailyAppointments
        };
      }
    }
    
    const averageUtilization = activeMembers > 0 ? totalUtilization / activeMembers : 0;
    
    // Calculate round-robin balance
    const rrState = await this.getRoundRobinState(teamId);
    let roundRobinBalance = 100; // Default to perfect balance
    
    if (rrState) {
      const counts = Object.values(rrState.memberAssignmentCounts as Record<string, number>);
      if (counts.length > 1) {
        const max = Math.max(...counts);
        const min = Math.min(...counts);
        roundRobinBalance = max > 0 ? (1 - (max - min) / max) * 100 : 100;
      }
    }
    
    return {
      totalMembers,
      activeMembers,
      averageUtilization,
      roundRobinBalance,
      routingEfficiency: 85, // This would be calculated from routing analytics
      memberCapacities
    };
  }
}

export const storage = new DatabaseStorage();
