import { db } from './db';
import { 
  users, businessCards, teams, teamMembers, bulkGenerationJobs, subscriptionPlans, globalTemplates, walletPasses,
  crmContacts, crmActivities, crmTasks, crmPipelines, crmStages, crmDeals, crmSequences, emailTemplates,
  automations, automationRuns, appointmentEventTypes, appointments, teamMemberAvailability, appointmentNotifications, appointmentPayments,
  calendarConnections, videoMeetingProviders, externalCalendarEvents, meetingLinks, integrationLogs,
  teamAssignments, roundRobinState, leadRoutingRules, teamMemberSkills, teamMemberCapacity, teamAvailabilityPatterns, assignmentAnalytics, routingAnalytics,
  publicUploads, qrLinks, qrEvents, cardSubscriptions, coupons, userSubscriptions,
  bios, connections, subscriptions, analytics, affiliates, conversions, headerTemplates, icons, pageElementTypes,
  nfcTags, nfcTapEvents, nfcAnalytics,
  digitalProducts, shopOrders, shopDownloads,
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
  type RoutingAnalytics, type InsertRoutingAnalytics,
  type PublicUpload, type InsertPublicUpload,
  type QrLink, type InsertQrLink, type QrEvent, type InsertQrEvent,
  type Bio, type InsertBio, type Connection, type InsertConnection,
  type Subscription, type InsertSubscription, type Analytics, type InsertAnalytics,
  type NfcTag, type InsertNfcTag, type NfcTapEvent, type InsertNfcTapEvent, type NfcAnalytics, type InsertNfcAnalytics,
  type DigitalProduct, type InsertDigitalProduct, type ShopOrder, type InsertShopOrder, type ShopDownload, type InsertShopDownload
} from '@shared/schema';
import { eq, and, desc, count, inArray, like, or, sql, gte, lte } from 'drizzle-orm';

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(userData: InsertUser): Promise<User>;
  updateUser(id: string, userData: Partial<InsertUser>): Promise<User>;
  updateUserLimits(id: string, businessCardsCount: number, businessCardsLimit?: number): Promise<User>;
  deleteUser(id: string): Promise<void>;
  
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
  createPlan(planData: any): Promise<SubscriptionPlan>;
  updatePlan(id: number, planData: any): Promise<SubscriptionPlan>;
  deletePlan(id: number): Promise<void>;
  
  // Coupon operations
  getCoupons(filters?: { isActive?: boolean }): Promise<any[]>;
  getCouponByCode(code: string): Promise<any | undefined>;
  getCouponById(id: string): Promise<any | undefined>;
  createCoupon(couponData: any): Promise<any>;
  updateCoupon(id: string, couponData: any): Promise<any>;
  deleteCoupon(id: string): Promise<void>;
  validateCoupon(code: string, planId: number, userCount: number): Promise<{ valid: boolean; discount?: number; message?: string }>;
  
  // User Subscription operations
  getUserSubscription(userId: string): Promise<any | undefined>;
  createUserSubscription(subscriptionData: any): Promise<any>;
  updateUserSubscription(id: string, subscriptionData: any): Promise<any>;
  cancelUserSubscription(id: string): Promise<any>;
  
  // Global templates operations
  getGlobalTemplates(filters?: { isActive?: boolean }): Promise<GlobalTemplate[]>;
  createGlobalTemplate(templateData: any): Promise<GlobalTemplate>;
  updateGlobalTemplate(id: string, templateData: any): Promise<GlobalTemplate>;
  deleteGlobalTemplate(id: string): Promise<void>;
  
  // Header templates operations
  getHeaderTemplates(filters?: { isActive?: boolean }): Promise<any[]>;
  createHeaderTemplate(templateData: any): Promise<any>;
  updateHeaderTemplate(id: string, templateData: any): Promise<any>;
  deleteHeaderTemplate(id: string): Promise<void>;
  
  // Icons operations
  getIcons(filters?: { isActive?: boolean; category?: string }): Promise<any[]>;
  createIcon(iconData: any): Promise<any>;
  updateIcon(id: number, iconData: any): Promise<any>;
  deleteIcon(id: number): Promise<void>;
  
  // Page Element Types operations
  getPageElementTypes(filters?: { isActive?: boolean }): Promise<any[]>;
  createPageElementType(elementTypeData: any): Promise<any>;
  updatePageElementType(id: number, elementTypeData: any): Promise<any>;
  deletePageElementType(id: number): Promise<void>;
  
  // Affiliates operations
  getAffiliates(filters?: { status?: string }): Promise<any[]>;
  getAffiliate(id: string): Promise<any | undefined>;
  createAffiliate(affiliateData: any): Promise<any>;
  updateAffiliate(id: string, affiliateData: any): Promise<any>;
  deleteAffiliate(id: string): Promise<void>;
  
  // Conversions operations
  getConversions(filters?: { affiliateId?: string; dateFrom?: Date; dateTo?: Date }): Promise<any[]>;
  getConversion(id: string): Promise<any | undefined>;
  createConversion(conversionData: any): Promise<any>;
  updateConversion(id: string, conversionData: any): Promise<any>;
  deleteConversion(id: string): Promise<void>;
  
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

  // Public Upload operations
  createPublicUpload(uploadData: InsertPublicUpload & { fileContent?: Buffer }): Promise<PublicUpload>;
  getPublicUploadById(id: string): Promise<PublicUpload | undefined>;
  getPublicUploadBySlug(slug: string): Promise<PublicUpload | undefined>;
  getUserPublicUploads(userId: string, limit?: number, offset?: number): Promise<PublicUpload[]>;
  countUserPublicUploads(userId: string): Promise<number>;
  updatePublicUpload(id: string, uploadData: Partial<InsertPublicUpload> & { fileContent?: Buffer }): Promise<PublicUpload>;
  deletePublicUpload(id: string): Promise<void>;
  incrementUploadViews(id: string): Promise<void>;
  
  // ===== QR CODE OPERATIONS =====
  
  // QR Link operations
  createQrLink(linkData: InsertQrLink): Promise<QrLink>;
  getQrLink(id: string): Promise<QrLink | undefined>;
  getQrLinkByShortId(shortId: string): Promise<QrLink | undefined>;
  getUserQrLinks(userId: string, limit?: number, offset?: number): Promise<QrLink[]>;
  countUserQrLinks(userId: string): Promise<number>;
  updateQrLink(id: string, linkData: Partial<InsertQrLink>): Promise<QrLink>;
  deleteQrLink(id: string): Promise<void>;
  
  // QR Event operations
  createQrEvent(eventData: InsertQrEvent): Promise<QrEvent>;
  getQrEventsByQrId(qrId: string, limit?: number, offset?: number): Promise<QrEvent[]>;
  countQrEvents(qrId: string): Promise<number>;
  getQrAnalytics(qrId: string, startDate?: Date, endDate?: Date): Promise<{
    totalScans: number;
    uniqueScans: number;
    deviceBreakdown: { device: string; count: number }[];
    countryBreakdown: { country: string; count: number }[];
    dailyScans: { date: string; scans: number }[];
  }>;

  // ===== CARD SUBSCRIPTION OPERATIONS =====
  
  // Card Subscription operations
  createCardSubscription(subscriptionData: {
    cardId: string;
    email: string;
    name?: string;
    pushSubscription?: any;
    unsubscribeToken: string;
  }): Promise<any>;
  getCardSubscription(id: string): Promise<any | undefined>;
  getCardSubscriptionByToken(token: string): Promise<any | undefined>;
  getCardSubscriptions(cardId: string, activeOnly?: boolean): Promise<any[]>;
  getCardSubscriptionByCardAndEmail(cardId: string, email: string): Promise<any | undefined>;
  updateCardSubscription(id: string, subscriptionData: Partial<{
    name: string;
    pushSubscription: any;
    isActive: boolean;
    unsubscribedAt: Date;
  }>): Promise<any>;
  deleteCardSubscription(id: string): Promise<void>;
  countCardSubscribers(cardId: string, activeOnly?: boolean): Promise<number>;
  
  // Bio operations
  getBio(userId: string): Promise<Bio | undefined>;
  createBio(bioData: InsertBio): Promise<Bio>;
  updateBio(userId: string, bioData: Partial<InsertBio>): Promise<Bio>;
  deleteBio(userId: string): Promise<void>;
  
  // Connection operations
  createConnection(connectionData: InsertConnection): Promise<Connection>;
  getConnection(id: string): Promise<Connection | undefined>;
  getUserConnections(userId: string, filters?: { platform?: string; eventType?: string }): Promise<Connection[]>;
  getCardConnections(cardId: string, filters?: { eventType?: string }): Promise<Connection[]>;
  deleteConnection(id: string): Promise<void>;
  
  // Subscription operations
  getSubscription(id: string): Promise<Subscription | undefined>;
  getUserSubscription(userId: string): Promise<Subscription | undefined>;
  getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | undefined>;
  createSubscription(subscriptionData: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: string, subscriptionData: Partial<InsertSubscription>): Promise<Subscription>;
  cancelSubscription(id: string): Promise<Subscription>;
  deleteSubscription(id: string): Promise<void>;
  
  // Analytics operations
  getAnalytics(id: string): Promise<Analytics | undefined>;
  getCardAnalytics(cardId: string, periodType?: string): Promise<Analytics[]>;
  getUserAnalytics(userId: string, periodType?: string): Promise<Analytics[]>;
  createAnalytics(analyticsData: InsertAnalytics): Promise<Analytics>;
  updateAnalytics(id: string, analyticsData: Partial<InsertAnalytics>): Promise<Analytics>;
  incrementCardViews(cardId: string, userId: string): Promise<void>;
  incrementLinkClicks(cardId: string, userId: string): Promise<void>;
  incrementQrScans(cardId: string, userId: string): Promise<void>;
  incrementVcardDownloads(cardId: string, userId: string): Promise<void>;
  deleteAnalytics(id: string): Promise<void>;

  // Availability operations
  getUserAvailability(userId: string): Promise<{
    businessHours: Array<{ weekday: string; startTime: string; endTime: string; enabled: boolean; timezone: string }>;
    bufferTimes: Array<{ eventTypeId: string; bufferTimeBefore: number; bufferTimeAfter: number }>;
    blackoutDates: Array<{ id: string; startDate: string; endDate: string; title: string; description?: string; isAllDay: boolean; isRecurring: boolean; type: string }>;
    recurringSchedules: Array<{ id: string; name: string; pattern: string; startDate: string; endDate?: string }>;
  }>;
  createUserAvailability(data: any): Promise<any>;
  updateUserAvailability(userId: string, data: any): Promise<any>;

  // Dashboard metrics
  getDashboardMetrics(): Promise<{
    weeklyClicks: number;
    weeklyVisitor: number;
    monthlyVisitor: number;
  }>;
  getAdminLinks(): Promise<{
    id: string;
    title: string;
    url: string;
    ownerName: string;
    visitorCount: number;
    clicksCount: number;
    initials: string;
  }[]>;
  
  // ===== NFC OPERATIONS =====
  createNfcTag(data: InsertNfcTag): Promise<NfcTag>;
  getNfcTag(id: string): Promise<NfcTag | undefined>;
  getNfcTagsByCard(cardId: string): Promise<NfcTag[]>;
  getNfcTagsByUser(userId: string): Promise<NfcTag[]>;
  updateNfcTag(id: string, data: Partial<InsertNfcTag>): Promise<NfcTag>;
  deleteNfcTag(id: string): Promise<void>;
  
  recordNfcTapEvent(data: InsertNfcTapEvent): Promise<NfcTapEvent>;
  getNfcTapEvents(tagId: string, limit?: number): Promise<NfcTapEvent[]>;
  
  getNfcAnalyticsForCard(cardId: string): Promise<NfcAnalytics[]>;
  getNfcAnalyticsForUser(userId: string): Promise<NfcAnalytics[]>;
  updateNfcAnalytics(cardId: string, tagId: string): Promise<NfcAnalytics>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserById(id: string): Promise<User | undefined> {
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

  async getAllUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
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
    // First try to find by customUrl (case-insensitive), then by shareSlug (case-insensitive)
    // Use SQL LOWER() function for case-insensitive comparison
    let [card] = await db.select().from(businessCards).where(
      sql`LOWER(${businessCards.customUrl}) = LOWER(${shareSlug})`
    );
    if (!card) {
      [card] = await db.select().from(businessCards).where(
        sql`LOWER(${businessCards.shareSlug}) = LOWER(${shareSlug})`
      );
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

  async createPlan(planData: any): Promise<SubscriptionPlan> {
    // Map frontend field names to database column names
    const { frequency, ...rest } = planData;
    const dbData = {
      ...rest,
      interval: frequency,
    };
    const [plan] = await db.insert(subscriptionPlans).values(dbData).returning();
    return plan;
  }

  async updatePlan(id: number, planData: any): Promise<SubscriptionPlan> {
    // Map frontend field names to database column names
    const { frequency, ...rest } = planData;
    const dbData: any = { ...rest };
    if (frequency !== undefined) dbData.interval = frequency;
    
    const [plan] = await db
      .update(subscriptionPlans)
      .set(dbData)
      .where(eq(subscriptionPlans.id, id))
      .returning();
    return plan;
  }

  async deletePlan(id: number): Promise<void> {
    await db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, id));
  }

  // Coupon operations
  async getCoupons(filters?: { isActive?: boolean }): Promise<any[]> {
    const conditions = [];
    if (filters?.isActive !== undefined) {
      conditions.push(eq(coupons.isActive, filters.isActive));
    }
    
    return await db
      .select()
      .from(coupons)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(coupons.createdAt));
  }

  async getCouponByCode(code: string): Promise<any | undefined> {
    const [coupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, code.toUpperCase()));
    return coupon;
  }

  async getCouponById(id: string): Promise<any | undefined> {
    const [coupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.id, id));
    return coupon;
  }

  async createCoupon(couponData: any): Promise<any> {
    const [coupon] = await db.insert(coupons).values({
      ...couponData,
      code: couponData.code.toUpperCase()
    }).returning();
    return coupon;
  }

  async updateCoupon(id: string, couponData: any): Promise<any> {
    const updates: any = { ...couponData };
    if (updates.code) {
      updates.code = updates.code.toUpperCase();
    }
    
    const [coupon] = await db
      .update(coupons)
      .set(updates)
      .where(eq(coupons.id, id))
      .returning();
    return coupon;
  }

  async deleteCoupon(id: string): Promise<void> {
    await db.delete(coupons).where(eq(coupons.id, id));
  }

  async validateCoupon(code: string, planId: number, userCount: number): Promise<{ valid: boolean; discount?: number; message?: string }> {
    const coupon = await this.getCouponByCode(code);
    
    if (!coupon) {
      return { valid: false, message: 'Invalid coupon code' };
    }

    if (!coupon.isActive || coupon.status === 'inactive') {
      return { valid: false, message: 'This coupon is no longer active' };
    }

    const now = new Date();
    if (coupon.startsAt && new Date(coupon.startsAt) > now) {
      return { valid: false, message: 'This coupon is not yet valid' };
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < now) {
      return { valid: false, message: 'This coupon has expired' };
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, message: 'This coupon has reached its usage limit' };
    }

    const applicablePlans = Array.isArray(coupon.applicablePlans) ? coupon.applicablePlans : [];
    if (applicablePlans.length > 0 && !applicablePlans.includes(planId)) {
      return { valid: false, message: 'This coupon is not valid for the selected plan' };
    }

    return {
      valid: true,
      discount: coupon.discountType === 'percentage' ? coupon.discountValue : coupon.discountValue
    };
  }

  // User Subscription operations
  async getUserSubscription(userId: string): Promise<any | undefined> {
    const [subscription] = await db
      .select()
      .from(userSubscriptions)
      .where(and(
        eq(userSubscriptions.userId, userId),
        eq(userSubscriptions.isActive, true)
      ))
      .orderBy(desc(userSubscriptions.createdAt))
      .limit(1);
    return subscription;
  }

  async createUserSubscription(subscriptionData: any): Promise<any> {
    const [subscription] = await db.insert(userSubscriptions).values(subscriptionData).returning();
    return subscription;
  }

  async updateUserSubscription(id: string, subscriptionData: any): Promise<any> {
    const [subscription] = await db
      .update(userSubscriptions)
      .set({ ...subscriptionData, updatedAt: new Date() })
      .where(eq(userSubscriptions.id, id))
      .returning();
    return subscription;
  }

  async cancelUserSubscription(id: string): Promise<any> {
    const [subscription] = await db
      .update(userSubscriptions)
      .set({
        isActive: false,
        status: 'canceled',
        canceledAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(userSubscriptions.id, id))
      .returning();
    return subscription;
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

  async createGlobalTemplate(templateData: any): Promise<GlobalTemplate> {
    const [template] = await db.insert(globalTemplates).values(templateData).returning();
    return template;
  }

  async updateGlobalTemplate(id: string, templateData: any): Promise<GlobalTemplate> {
    const [template] = await db
      .update(globalTemplates)
      .set({ ...templateData, updatedAt: new Date() })
      .where(eq(globalTemplates.id, id))
      .returning();
    return template;
  }

  async deleteGlobalTemplate(id: string): Promise<void> {
    await db.delete(globalTemplates).where(eq(globalTemplates.id, id));
  }

  // Header templates operations
  async getHeaderTemplates(filters?: { isActive?: boolean }): Promise<any[]> {
    const baseQuery = db.select().from(headerTemplates);
    
    if (filters?.isActive !== undefined) {
      return await baseQuery
        .where(eq(headerTemplates.isActive, filters.isActive))
        .orderBy(desc(headerTemplates.createdAt));
    }
    
    return await baseQuery.orderBy(desc(headerTemplates.createdAt));
  }

  async createHeaderTemplate(templateData: any): Promise<any> {
    const [template] = await db.insert(headerTemplates).values(templateData).returning();
    return template;
  }

  async updateHeaderTemplate(id: string, templateData: any): Promise<any> {
    const [template] = await db
      .update(headerTemplates)
      .set({ ...templateData, updatedAt: new Date() })
      .where(eq(headerTemplates.id, id))
      .returning();
    return template;
  }

  async deleteHeaderTemplate(id: string): Promise<void> {
    await db.delete(headerTemplates).where(eq(headerTemplates.id, id));
  }

  // Icons operations
  async getIcons(filters?: { isActive?: boolean; category?: string }): Promise<any[]> {
    let conditions: any[] = [];
    
    if (filters?.isActive !== undefined) {
      conditions.push(eq(icons.isActive, filters.isActive));
    }
    if (filters?.category) {
      conditions.push(eq(icons.category, filters.category));
    }
    
    if (conditions.length > 0) {
      return await db.select().from(icons)
        .where(and(...conditions))
        .orderBy(icons.sort);
    }
    
    return await db.select().from(icons).orderBy(icons.sort);
  }

  async createIcon(iconData: any): Promise<any> {
    const [icon] = await db.insert(icons).values(iconData).returning();
    return icon;
  }

  async updateIcon(id: number, iconData: any): Promise<any> {
    const [icon] = await db
      .update(icons)
      .set(iconData)
      .where(eq(icons.id, id))
      .returning();
    return icon;
  }

  async deleteIcon(id: number): Promise<void> {
    await db.delete(icons).where(eq(icons.id, id));
  }

  // Page Element Types operations
  async getPageElementTypes(filters?: { isActive?: boolean }): Promise<any[]> {
    if (filters?.isActive !== undefined) {
      return await db.select().from(pageElementTypes)
        .where(eq(pageElementTypes.isActive, filters.isActive))
        .orderBy(pageElementTypes.sort);
    }
    
    return await db.select().from(pageElementTypes).orderBy(pageElementTypes.sort);
  }

  async createPageElementType(elementTypeData: any): Promise<any> {
    const [elementType] = await db.insert(pageElementTypes).values(elementTypeData).returning();
    return elementType;
  }

  async updatePageElementType(id: number, elementTypeData: any): Promise<any> {
    const [elementType] = await db
      .update(pageElementTypes)
      .set(elementTypeData)
      .where(eq(pageElementTypes.id, id))
      .returning();
    return elementType;
  }

  async deletePageElementType(id: number): Promise<void> {
    await db.delete(pageElementTypes).where(eq(pageElementTypes.id, id));
  }

  // Affiliates operations
  async getAffiliates(filters?: { status?: string }): Promise<any[]> {
    const baseQuery = db.select().from(affiliates);
    
    if (filters?.status) {
      return await baseQuery
        .where(eq(affiliates.status, filters.status))
        .orderBy(desc(affiliates.createdAt));
    }
    
    return await baseQuery.orderBy(desc(affiliates.createdAt));
  }

  async getAffiliate(id: string): Promise<any | undefined> {
    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.id, id));
    return affiliate;
  }

  async createAffiliate(affiliateData: any): Promise<any> {
    const [affiliate] = await db.insert(affiliates).values(affiliateData).returning();
    return affiliate;
  }

  async updateAffiliate(id: string, affiliateData: any): Promise<any> {
    const [affiliate] = await db
      .update(affiliates)
      .set({ ...affiliateData, updatedAt: new Date() })
      .where(eq(affiliates.id, id))
      .returning();
    return affiliate;
  }

  async deleteAffiliate(id: string): Promise<void> {
    await db.delete(affiliates).where(eq(affiliates.id, id));
  }

  // Conversions operations
  async getConversions(filters?: { affiliateId?: string; dateFrom?: Date; dateTo?: Date }): Promise<any[]> {
    let baseQuery = db.select().from(conversions);
    const conditions: any[] = [];
    
    if (filters?.affiliateId) {
      conditions.push(eq(conversions.affiliateId, filters.affiliateId));
    }
    if (filters?.dateFrom) {
      conditions.push(gte(conversions.createdAt, filters.dateFrom));
    }
    if (filters?.dateTo) {
      conditions.push(lte(conversions.createdAt, filters.dateTo));
    }
    
    if (conditions.length > 0) {
      return await db
        .select()
        .from(conversions)
        .where(and(...conditions))
        .orderBy(desc(conversions.createdAt));
    }
    
    return await baseQuery.orderBy(desc(conversions.createdAt));
  }

  async getConversion(id: string): Promise<any | undefined> {
    const [conversion] = await db.select().from(conversions).where(eq(conversions.id, id));
    return conversion;
  }

  async createConversion(conversionData: any): Promise<any> {
    const [conversion] = await db.insert(conversions).values(conversionData).returning();
    return conversion;
  }

  async updateConversion(id: string, conversionData: any): Promise<any> {
    const [conversion] = await db
      .update(conversions)
      .set({ ...conversionData, updatedAt: new Date() })
      .where(eq(conversions.id, id))
      .returning();
    return conversion;
  }

  async deleteConversion(id: string): Promise<void> {
    await db.delete(conversions).where(eq(conversions.id, id));
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
    const [appointment] = await db.select({
      id: appointments.id,
      eventTypeId: appointments.eventTypeId,
      hostUserId: appointments.hostUserId,
      assignedUserId: appointments.assignedUserId,
      startTime: appointments.startTime,
      endTime: appointments.endTime,
      timezone: appointments.timezone,
      duration: appointments.duration,
      attendeeName: appointments.attendeeName,
      attendeeEmail: appointments.attendeeEmail,
      attendeePhone: appointments.attendeePhone,
      attendeeCompany: appointments.attendeeCompany,
      title: appointments.title,
      description: appointments.description,
      location: appointments.location,
      status: appointments.status,
      createdAt: appointments.createdAt,
      updatedAt: appointments.updatedAt,
    }).from(appointments).where(eq(appointments.id, id));
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
    
    const query = db.select({
      id: appointments.id,
      eventTypeId: appointments.eventTypeId,
      hostUserId: appointments.hostUserId,
      assignedUserId: appointments.assignedUserId,
      startTime: appointments.startTime,
      endTime: appointments.endTime,
      timezone: appointments.timezone,
      duration: appointments.duration,
      attendeeName: appointments.attendeeName,
      attendeeEmail: appointments.attendeeEmail,
      attendeePhone: appointments.attendeePhone,
      attendeeCompany: appointments.attendeeCompany,
      title: appointments.title,
      description: appointments.description,
      location: appointments.location,
      status: appointments.status,
      createdAt: appointments.createdAt,
      updatedAt: appointments.updatedAt,
    }).from(appointments).where(and(...conditions));
    
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

  // Get appointment statistics for dashboard
  async getAppointmentStats(userId: string): Promise<{
    totalAppointments: number;
    confirmedAppointments: number;
    pendingAppointments: number;
    cancelledAppointments: number;
    upcomingAppointments: number;
    completedAppointments: number;
    totalRevenue: number;
    averageBookingValue: number;
    mostPopularEventType: string;
    busyDay: string;
  }> {
    const now = new Date();
    
    // Total appointments by status
    const [totalStats] = await db.select({
      total: count(),
      confirmed: count(sql`CASE WHEN ${appointments.status} = 'confirmed' THEN 1 END`),
      pending: count(sql`CASE WHEN ${appointments.status} = 'pending' THEN 1 END`),
      cancelled: count(sql`CASE WHEN ${appointments.status} = 'cancelled' THEN 1 END`),
    }).from(appointments).where(eq(appointments.hostUserId, userId));

    // Upcoming appointments
    const upcomingResult = await db.select({ count: count() })
      .from(appointments)
      .where(and(
        eq(appointments.hostUserId, userId),
        gte(appointments.startTime, now),
        eq(appointments.status, 'confirmed')
      ));

    // Completed appointments
    const completedResult = await db.select({ count: count() })
      .from(appointments)
      .where(and(
        eq(appointments.hostUserId, userId),
        lt(appointments.endTime, now),
        eq(appointments.status, 'confirmed')
      ));

    // Revenue from paid appointments
    const revenueResult = await db.select({
      totalRevenue: sql<number>`COALESCE(SUM(${appointmentEventTypes.price}), 0)::float`
    })
      .from(appointments)
      .leftJoin(appointmentEventTypes, eq(appointments.eventTypeId, appointmentEventTypes.id))
      .where(and(
        eq(appointments.hostUserId, userId),
        eq(appointments.status, 'confirmed')
      ));

    // Most popular event type
    const popularEventResult = await db.select({
      name: appointmentEventTypes.name,
      count: count(),
    })
      .from(appointments)
      .leftJoin(appointmentEventTypes, eq(appointments.eventTypeId, appointmentEventTypes.id))
      .where(and(
        eq(appointments.hostUserId, userId),
        eq(appointments.status, 'confirmed')
      ))
      .groupBy(appointmentEventTypes.id, appointmentEventTypes.name)
      .orderBy(desc(count()))
      .limit(1);

    // Busiest day
    const busyDayResult = await db.select({
      day: sql<string>`DATE(${appointments.startTime})`,
      count: count(),
    })
      .from(appointments)
      .where(and(
        eq(appointments.hostUserId, userId),
        eq(appointments.status, 'confirmed')
      ))
      .groupBy(sql`DATE(${appointments.startTime})`)
      .orderBy(desc(count()))
      .limit(1);

    const totalRevenue = parseFloat(revenueResult?.[0]?.totalRevenue?.toString() || '0');
    const totalCount = totalStats?.total || 0;
    const averageBookingValue = totalCount > 0 ? totalRevenue / totalCount : 0;

    return {
      totalAppointments: totalStats?.total || 0,
      confirmedAppointments: totalStats?.confirmed || 0,
      pendingAppointments: totalStats?.pending || 0,
      cancelledAppointments: totalStats?.cancelled || 0,
      upcomingAppointments: upcomingResult[0]?.count || 0,
      completedAppointments: completedResult[0]?.count || 0,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageBookingValue: Math.round(averageBookingValue * 100) / 100,
      mostPopularEventType: popularEventResult[0]?.name || 'N/A',
      busyDay: busyDayResult[0]?.day ? new Date(busyDayResult[0].day).toLocaleDateString() : 'N/A',
    };
  }

  // Availability operations
  async getUserAvailability(userId: string): Promise<{
    businessHours: Array<{ weekday: string; startTime: string; endTime: string; enabled: boolean; timezone: string }>;
    bufferTimes: Array<{ eventTypeId: string; bufferTimeBefore: number; bufferTimeAfter: number }>;
    blackoutDates: Array<{ id: string; startDate: string; endDate: string; title: string; description?: string; isAllDay: boolean; isRecurring: boolean; type: string }>;
    recurringSchedules: Array<{ id: string; name: string; pattern: string; startDate: string; endDate?: string }>;
  }> {
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    // Get business hours from teamMemberAvailability
    const availability = await db.select().from(teamMemberAvailability).where(
      eq(teamMemberAvailability.teamMemberId, userId)
    );

    const businessHours = availability.map(av => ({
      weekday: weekdays[av.dayOfWeek] || 'monday',
      startTime: av.startTime,
      endTime: av.endTime,
      enabled: av.isAvailable,
      timezone: av.timezone || 'UTC'
    }));

    // Get blackout dates
    const blackouts = await db.select().from(blackoutDates).where(
      eq(blackoutDates.userId, userId)
    );

    const blackoutDatesFormatted = blackouts.map(bd => ({
      id: bd.id,
      startDate: bd.startDate.toISOString(),
      endDate: bd.endDate.toISOString(),
      title: bd.title,
      description: bd.description,
      isAllDay: bd.isAllDay,
      isRecurring: bd.isRecurring,
      type: bd.type || 'time_off'
    }));

    // Get event types for buffer times
    const eventTypes = await db.select().from(appointmentEventTypes).where(
      eq(appointmentEventTypes.userId, userId)
    );

    const bufferTimes = eventTypes.map(et => ({
      eventTypeId: et.id,
      bufferTimeBefore: et.bufferTimeBefore || 0,
      bufferTimeAfter: et.bufferTimeAfter || 0
    }));

    return {
      businessHours: businessHours.length > 0 ? businessHours : this.getDefaultBusinessHours(),
      bufferTimes,
      blackoutDates: blackoutDatesFormatted,
      recurringSchedules: []
    };
  }

  async createUserAvailability(data: any): Promise<any> {
    const { userId, businessHours = [] } = data;
    
    // Clear existing availability for this user
    await db.delete(teamMemberAvailability).where(eq(teamMemberAvailability.teamMemberId, userId));
    
    // Create new availability records
    const weekdayMap: Record<string, number> = {
      'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
      'thursday': 4, 'friday': 5, 'saturday': 6
    };

    for (const bh of businessHours) {
      await db.insert(teamMemberAvailability).values({
        id: `avail_${userId}_${bh.weekday}_${Date.now()}`,
        teamMemberId: userId,
        dayOfWeek: weekdayMap[bh.weekday] || 1,
        startTime: bh.startTime,
        endTime: bh.endTime,
        isAvailable: bh.enabled !== false,
        timezone: bh.timezone || 'UTC'
      });
    }

    return this.getUserAvailability(userId);
  }

  async updateUserAvailability(userId: string, data: any): Promise<any> {
    const { businessHours = [], blackoutDates = [] } = data;

    // Update business hours
    if (businessHours.length > 0) {
      await db.delete(teamMemberAvailability).where(eq(teamMemberAvailability.teamMemberId, userId));
      
      const weekdayMap: Record<string, number> = {
        'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
        'thursday': 4, 'friday': 5, 'saturday': 6
      };

      for (const bh of businessHours) {
        await db.insert(teamMemberAvailability).values({
          id: `avail_${userId}_${bh.weekday}_${Date.now()}`,
          teamMemberId: userId,
          dayOfWeek: weekdayMap[bh.weekday] || 1,
          startTime: bh.startTime,
          endTime: bh.endTime,
          isAvailable: bh.enabled !== false,
          timezone: bh.timezone || 'UTC'
        });
      }
    }

    // Update blackout dates if provided
    if (blackoutDates.length > 0) {
      await db.delete(blackoutDates).where(eq(blackoutDates.userId, userId));
      
      for (const bd of blackoutDates) {
        if (!bd.id || !bd.id.startsWith('temp')) {
          await db.insert(blackoutDates).values({
            id: bd.id || `blackout_${userId}_${Date.now()}`,
            userId,
            startDate: new Date(bd.startDate),
            endDate: new Date(bd.endDate),
            title: bd.title,
            description: bd.description,
            isAllDay: bd.isAllDay,
            type: bd.type || 'time_off',
            isRecurring: bd.isRecurring,
            recurringPattern: 'none'
          });
        }
      }
    }

    return this.getUserAvailability(userId);
  }

  private getDefaultBusinessHours() {
    return [
      { weekday: 'monday', startTime: '09:00', endTime: '17:00', enabled: true, timezone: 'UTC' },
      { weekday: 'tuesday', startTime: '09:00', endTime: '17:00', enabled: true, timezone: 'UTC' },
      { weekday: 'wednesday', startTime: '09:00', endTime: '17:00', enabled: true, timezone: 'UTC' },
      { weekday: 'thursday', startTime: '09:00', endTime: '17:00', enabled: true, timezone: 'UTC' },
      { weekday: 'friday', startTime: '09:00', endTime: '17:00', enabled: true, timezone: 'UTC' },
      { weekday: 'saturday', startTime: '10:00', endTime: '14:00', enabled: false, timezone: 'UTC' },
      { weekday: 'sunday', startTime: '10:00', endTime: '14:00', enabled: false, timezone: 'UTC' }
    ];
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

  // Public Upload operations
  async createPublicUpload(uploadData: InsertPublicUpload & { fileContent?: Buffer }): Promise<PublicUpload> {
    const [upload] = await db.insert(publicUploads).values({
      userId: uploadData.userId,
      slug: uploadData.slug,
      originalFileName: uploadData.originalFileName,
      storagePath: uploadData.storagePath,
      title: uploadData.title,
      mimeType: uploadData.mimeType,
      fileExtension: uploadData.fileExtension,
      fileSize: uploadData.fileSize,
      isPublic: uploadData.isPublic ?? true,
    }).returning();
    
    // Note: In a real implementation, you would store the fileContent to a file system or cloud storage
    // For now, we're just storing the metadata in the database
    return upload;
  }

  async getPublicUploadById(id: string): Promise<PublicUpload | undefined> {
    const [upload] = await db.select().from(publicUploads).where(eq(publicUploads.id, id));
    return upload;
  }

  async getPublicUploadBySlug(slug: string): Promise<PublicUpload | undefined> {
    const [upload] = await db.select().from(publicUploads).where(
      and(eq(publicUploads.slug, slug), eq(publicUploads.isPublic, true))
    );
    return upload;
  }

  async getUserPublicUploads(userId: string, limit: number = 20, offset: number = 0): Promise<PublicUpload[]> {
    return await db.select()
      .from(publicUploads)
      .where(eq(publicUploads.userId, userId))
      .orderBy(desc(publicUploads.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async countUserPublicUploads(userId: string): Promise<number> {
    const [result] = await db.select({ count: count() })
      .from(publicUploads)
      .where(eq(publicUploads.userId, userId));
    return result.count;
  }

  async updatePublicUpload(id: string, uploadData: Partial<InsertPublicUpload> & { fileContent?: Buffer }): Promise<PublicUpload> {
    const [upload] = await db
      .update(publicUploads)
      .set({ 
        ...uploadData, 
        updatedAt: new Date() 
      })
      .where(eq(publicUploads.id, id))
      .returning();
    
    // Note: In a real implementation, you would also update the stored file if fileContent is provided
    return upload;
  }

  async deletePublicUpload(id: string): Promise<void> {
    await db.delete(publicUploads).where(eq(publicUploads.id, id));
    // Note: In a real implementation, you would also delete the stored file from storage
  }

  async incrementUploadViews(id: string): Promise<void> {
    await db
      .update(publicUploads)
      .set({ viewCount: sql`${publicUploads.viewCount} + 1` })
      .where(eq(publicUploads.id, id));
  }
  
  // ===== QR CODE OPERATIONS =====
  
  // QR Link operations
  async createQrLink(linkData: InsertQrLink): Promise<QrLink> {
    const [qrLink] = await db.insert(qrLinks).values(linkData).returning();
    return qrLink;
  }
  
  async getQrLink(id: string): Promise<QrLink | undefined> {
    const [qrLink] = await db.select().from(qrLinks).where(eq(qrLinks.id, id));
    return qrLink;
  }
  
  async getQrLinkByShortId(shortId: string): Promise<QrLink | undefined> {
    const [qrLink] = await db.select().from(qrLinks)
      .where(and(eq(qrLinks.shortId, shortId), eq(qrLinks.enabled, true)));
    return qrLink;
  }
  
  async getUserQrLinks(userId: string, limit: number = 20, offset: number = 0): Promise<QrLink[]> {
    return await db.select()
      .from(qrLinks)
      .where(eq(qrLinks.userId, userId))
      .orderBy(desc(qrLinks.createdAt))
      .limit(limit)
      .offset(offset);
  }
  
  async countUserQrLinks(userId: string): Promise<number> {
    const [result] = await db.select({ count: count() })
      .from(qrLinks)
      .where(eq(qrLinks.userId, userId));
    return result.count;
  }
  
  async updateQrLink(id: string, linkData: Partial<InsertQrLink>): Promise<QrLink> {
    const [qrLink] = await db
      .update(qrLinks)
      .set({ ...linkData, updatedAt: new Date() })
      .where(eq(qrLinks.id, id))
      .returning();
    return qrLink;
  }
  
  async deleteQrLink(id: string): Promise<void> {
    await db.delete(qrLinks).where(eq(qrLinks.id, id));
  }
  
  // QR Event operations
  async createQrEvent(eventData: InsertQrEvent): Promise<QrEvent> {
    const [qrEvent] = await db.insert(qrEvents).values(eventData).returning();
    return qrEvent;
  }
  
  async getQrEventsByQrId(qrId: string, limit: number = 100, offset: number = 0): Promise<QrEvent[]> {
    return await db.select()
      .from(qrEvents)
      .where(eq(qrEvents.qrId, qrId))
      .orderBy(desc(qrEvents.ts))
      .limit(limit)
      .offset(offset);
  }
  
  async countQrEvents(qrId: string): Promise<number> {
    const [result] = await db.select({ count: count() })
      .from(qrEvents)
      .where(eq(qrEvents.qrId, qrId));
    return result.count;
  }
  
  async getQrAnalytics(qrId: string, startDate?: Date, endDate?: Date): Promise<{
    totalScans: number;
    uniqueScans: number;
    deviceBreakdown: { device: string; count: number }[];
    countryBreakdown: { country: string; count: number }[];
    dailyScans: { date: string; scans: number }[];
  }> {
    let whereCondition = eq(qrEvents.qrId, qrId);
    
    if (startDate && endDate) {
      whereCondition = and(
        eq(qrEvents.qrId, qrId),
        gte(qrEvents.ts, startDate),
        lte(qrEvents.ts, endDate)
      ) as any;
    }
    
    // Get total scans
    const [totalScansResult] = await db.select({ count: count() })
      .from(qrEvents)
      .where(whereCondition);
    
    // Get unique scans (by IP hash)
    const [uniqueScansResult] = await db.select({ count: count(sql`DISTINCT ${qrEvents.ipHash}`) })
      .from(qrEvents)
      .where(whereCondition);
    
    // Get device breakdown
    const deviceBreakdown = await db
      .select({
        device: qrEvents.device,
        count: count()
      })
      .from(qrEvents)
      .where(whereCondition)
      .groupBy(qrEvents.device);
    
    // Get country breakdown
    const countryBreakdown = await db
      .select({
        country: qrEvents.country,
        count: count()
      })
      .from(qrEvents)
      .where(whereCondition)
      .groupBy(qrEvents.country);
    
    // Get daily scans
    const dailyScans = await db
      .select({
        date: sql<string>`DATE(${qrEvents.ts})`,
        scans: count()
      })
      .from(qrEvents)
      .where(whereCondition)
      .groupBy(sql`DATE(${qrEvents.ts})`)
      .orderBy(sql`DATE(${qrEvents.ts})`);
    
    return {
      totalScans: totalScansResult.count,
      uniqueScans: uniqueScansResult.count,
      deviceBreakdown: deviceBreakdown.map(d => ({ device: d.device || 'Unknown', count: d.count })),
      countryBreakdown: countryBreakdown.map(c => ({ country: c.country || 'Unknown', count: c.count })),
      dailyScans: dailyScans.map(d => ({ date: d.date, scans: d.scans }))
    };
  }

  // ===== CARD SUBSCRIPTION OPERATIONS =====

  async createCardSubscription(subscriptionData: {
    cardId: string;
    email: string;
    name?: string;
    pushSubscription?: any;
    unsubscribeToken: string;
  }): Promise<any> {
    const [subscription] = await db.insert(cardSubscriptions).values({
      ...subscriptionData,
      isActive: true,
    }).returning();
    return subscription;
  }

  async getCardSubscription(id: string): Promise<any | undefined> {
    const [subscription] = await db
      .select()
      .from(cardSubscriptions)
      .where(eq(cardSubscriptions.id, id));
    return subscription;
  }

  async getCardSubscriptionByToken(token: string): Promise<any | undefined> {
    const [subscription] = await db
      .select()
      .from(cardSubscriptions)
      .where(eq(cardSubscriptions.unsubscribeToken, token));
    return subscription;
  }

  async getCardSubscriptions(cardId: string, activeOnly: boolean = false): Promise<any[]> {
    if (activeOnly) {
      return await db
        .select()
        .from(cardSubscriptions)
        .where(
          and(
            eq(cardSubscriptions.cardId, cardId),
            eq(cardSubscriptions.isActive, true)
          )
        );
    }
    return await db
      .select()
      .from(cardSubscriptions)
      .where(eq(cardSubscriptions.cardId, cardId));
  }

  async getCardSubscriptionByCardAndEmail(cardId: string, email: string): Promise<any | undefined> {
    const [subscription] = await db
      .select()
      .from(cardSubscriptions)
      .where(
        and(
          eq(cardSubscriptions.cardId, cardId),
          eq(cardSubscriptions.email, email)
        )
      );
    return subscription;
  }

  async updateCardSubscription(id: string, subscriptionData: Partial<{
    name: string;
    pushSubscription: any;
    isActive: boolean;
    unsubscribedAt: Date;
  }>): Promise<any> {
    const [subscription] = await db
      .update(cardSubscriptions)
      .set({ ...subscriptionData, updatedAt: new Date() })
      .where(eq(cardSubscriptions.id, id))
      .returning();
    return subscription;
  }

  async deleteCardSubscription(id: string): Promise<void> {
    await db.delete(cardSubscriptions).where(eq(cardSubscriptions.id, id));
  }

  async countCardSubscribers(cardId: string, activeOnly: boolean = false): Promise<number> {
    const whereCondition = activeOnly
      ? and(
          eq(cardSubscriptions.cardId, cardId),
          eq(cardSubscriptions.isActive, true)
        )
      : eq(cardSubscriptions.cardId, cardId);

    const [result] = await db
      .select({ count: count() })
      .from(cardSubscriptions)
      .where(whereCondition);
    return result.count;
  }
  
  async getBio(userId: string): Promise<Bio | undefined> {
    const [bio] = await db.select().from(bios).where(eq(bios.userId, userId));
    return bio;
  }

  async createBio(bioData: InsertBio): Promise<Bio> {
    const [bio] = await db.insert(bios).values(bioData).returning();
    return bio;
  }

  async updateBio(userId: string, bioData: Partial<InsertBio>): Promise<Bio> {
    const [bio] = await db
      .update(bios)
      .set({ ...bioData, updatedAt: new Date() })
      .where(eq(bios.userId, userId))
      .returning();
    return bio;
  }

  async deleteBio(userId: string): Promise<void> {
    await db.delete(bios).where(eq(bios.userId, userId));
  }

  async createConnection(connectionData: InsertConnection): Promise<Connection> {
    const [connection] = await db.insert(connections).values(connectionData).returning();
    return connection;
  }

  async getConnection(id: string): Promise<Connection | undefined> {
    const [connection] = await db.select().from(connections).where(eq(connections.id, id));
    return connection;
  }

  async getUserConnections(userId: string, filters?: { platform?: string; eventType?: string }): Promise<Connection[]> {
    let whereCondition = eq(connections.userId, userId);
    
    if (filters?.platform && filters?.eventType) {
      whereCondition = and(
        eq(connections.userId, userId),
        eq(connections.platform, filters.platform),
        eq(connections.eventType, filters.eventType)
      ) as any;
    } else if (filters?.platform) {
      whereCondition = and(
        eq(connections.userId, userId),
        eq(connections.platform, filters.platform)
      ) as any;
    } else if (filters?.eventType) {
      whereCondition = and(
        eq(connections.userId, userId),
        eq(connections.eventType, filters.eventType)
      ) as any;
    }
    
    return await db.select().from(connections).where(whereCondition).orderBy(desc(connections.clickedAt));
  }

  async getCardConnections(cardId: string, filters?: { eventType?: string }): Promise<Connection[]> {
    let whereCondition = eq(connections.cardId, cardId);
    
    if (filters?.eventType) {
      whereCondition = and(
        eq(connections.cardId, cardId),
        eq(connections.eventType, filters.eventType)
      ) as any;
    }
    
    return await db.select().from(connections).where(whereCondition).orderBy(desc(connections.clickedAt));
  }

  async deleteConnection(id: string): Promise<void> {
    await db.delete(connections).where(eq(connections.id, id));
  }

  async getSubscription(id: string): Promise<Subscription | undefined> {
    const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.id, id));
    return subscription;
  }

  async getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId));
    return subscription;
  }

  async createSubscription(subscriptionData: InsertSubscription): Promise<Subscription> {
    const [subscription] = await db.insert(subscriptions).values(subscriptionData).returning();
    return subscription;
  }

  async updateSubscription(id: string, subscriptionData: Partial<InsertSubscription>): Promise<Subscription> {
    const [subscription] = await db
      .update(subscriptions)
      .set({ ...subscriptionData, updatedAt: new Date() })
      .where(eq(subscriptions.id, id))
      .returning();
    return subscription;
  }

  async cancelSubscription(id: string): Promise<Subscription> {
    const [subscription] = await db
      .update(subscriptions)
      .set({ 
        status: 'canceled',
        canceledAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(subscriptions.id, id))
      .returning();
    return subscription;
  }

  async deleteSubscription(id: string): Promise<void> {
    await db.delete(subscriptions).where(eq(subscriptions.id, id));
  }

  async getAnalytics(id: string): Promise<Analytics | undefined> {
    const [analyticsRecord] = await db.select().from(analytics).where(eq(analytics.id, id));
    return analyticsRecord;
  }

  async getCardAnalytics(cardId: string, periodType?: string): Promise<Analytics[]> {
    let whereCondition = eq(analytics.cardId, cardId);
    
    if (periodType) {
      whereCondition = and(
        eq(analytics.cardId, cardId),
        eq(analytics.periodType, periodType)
      ) as any;
    }
    
    return await db.select().from(analytics).where(whereCondition);
  }

  async getUserAnalytics(userId: string, periodType?: string): Promise<Analytics[]> {
    let whereCondition = eq(analytics.userId, userId);
    
    if (periodType) {
      whereCondition = and(
        eq(analytics.userId, userId),
        eq(analytics.periodType, periodType)
      ) as any;
    }
    
    return await db.select().from(analytics).where(whereCondition);
  }

  async createAnalytics(analyticsData: InsertAnalytics): Promise<Analytics> {
    const [analyticsRecord] = await db.insert(analytics).values(analyticsData).returning();
    return analyticsRecord;
  }

  async updateAnalytics(id: string, analyticsData: Partial<InsertAnalytics>): Promise<Analytics> {
    const [analyticsRecord] = await db
      .update(analytics)
      .set({ ...analyticsData, updatedAt: new Date() })
      .where(eq(analytics.id, id))
      .returning();
    return analyticsRecord;
  }

  async incrementCardViews(cardId: string, userId: string): Promise<void> {
    const existing = await db
      .select()
      .from(analytics)
      .where(and(
        eq(analytics.cardId, cardId),
        eq(analytics.userId, userId),
        eq(analytics.periodType, 'all_time')
      ));

    if (existing.length > 0) {
      await db
        .update(analytics)
        .set({
          pageViews: sql`${analytics.pageViews} + 1`,
          lastVisitedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(analytics.id, existing[0].id));
    } else {
      await db.insert(analytics).values({
        cardId,
        userId,
        pageViews: 1,
        periodType: 'all_time',
        lastVisitedAt: new Date()
      });
    }
  }

  async incrementLinkClicks(cardId: string, userId: string): Promise<void> {
    const existing = await db
      .select()
      .from(analytics)
      .where(and(
        eq(analytics.cardId, cardId),
        eq(analytics.userId, userId),
        eq(analytics.periodType, 'all_time')
      ));

    if (existing.length > 0) {
      await db
        .update(analytics)
        .set({
          linkClicks: sql`${analytics.linkClicks} + 1`,
          updatedAt: new Date()
        })
        .where(eq(analytics.id, existing[0].id));
    } else {
      await db.insert(analytics).values({
        cardId,
        userId,
        linkClicks: 1,
        periodType: 'all_time'
      });
    }
  }

  async incrementQrScans(cardId: string, userId: string): Promise<void> {
    const existing = await db
      .select()
      .from(analytics)
      .where(and(
        eq(analytics.cardId, cardId),
        eq(analytics.userId, userId),
        eq(analytics.periodType, 'all_time')
      ));

    if (existing.length > 0) {
      await db
        .update(analytics)
        .set({
          qrScans: sql`${analytics.qrScans} + 1`,
          updatedAt: new Date()
        })
        .where(eq(analytics.id, existing[0].id));
    } else {
      await db.insert(analytics).values({
        cardId,
        userId,
        qrScans: 1,
        periodType: 'all_time'
      });
    }
  }

  async incrementVcardDownloads(cardId: string, userId: string): Promise<void> {
    const existing = await db
      .select()
      .from(analytics)
      .where(and(
        eq(analytics.cardId, cardId),
        eq(analytics.userId, userId),
        eq(analytics.periodType, 'all_time')
      ));

    if (existing.length > 0) {
      await db
        .update(analytics)
        .set({
          vcardDownloads: sql`${analytics.vcardDownloads} + 1`,
          updatedAt: new Date()
        })
        .where(eq(analytics.id, existing[0].id));
    } else {
      await db.insert(analytics).values({
        cardId,
        userId,
        vcardDownloads: 1,
        periodType: 'all_time'
      });
    }
  }

  async deleteAnalytics(id: string): Promise<void> {
    await db.delete(analytics).where(eq(analytics.id, id));
  }

  // Dashboard metrics implementation
  async getDashboardMetrics(): Promise<{
    weeklyClicks: number;
    weeklyVisitor: number;
    monthlyVisitor: number;
  }> {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get weekly clicks - sum of all link clicks in last 7 days
    const weeklyClicksResult = await db
      .select({
        totalClicks: sql<number>`COALESCE(SUM(${analytics.clickCount}), 0)::integer`
      })
      .from(analytics)
      .where(and(
        gte(analytics.createdAt, sevenDaysAgo),
        eq(analytics.periodType, 'all_time')
      ));

    // Get weekly visitors - sum of unique visitors in last 7 days
    const weeklyVisitorResult = await db
      .select({
        totalVisitors: sql<number>`COALESCE(SUM(${analytics.viewCount}), 0)::integer`
      })
      .from(analytics)
      .where(and(
        gte(analytics.createdAt, sevenDaysAgo),
        eq(analytics.periodType, 'all_time')
      ));

    // Get monthly visitors - sum of unique visitors in last 30 days
    const monthlyVisitorResult = await db
      .select({
        totalVisitors: sql<number>`COALESCE(SUM(${analytics.viewCount}), 0)::integer`
      })
      .from(analytics)
      .where(and(
        gte(analytics.createdAt, thirtyDaysAgo),
        eq(analytics.periodType, 'all_time')
      ));

    return {
      weeklyClicks: weeklyClicksResult[0]?.totalClicks || 0,
      weeklyVisitor: weeklyVisitorResult[0]?.totalVisitors || 0,
      monthlyVisitor: monthlyVisitorResult[0]?.totalVisitors || 0
    };
  }

  // CRM STATS - DASHBOARD OVERVIEW
  async getCRMStats(userId: string): Promise<any> {
    const [contacts, deals, tasks, activities] = await Promise.all([
      db.select({ count: sql<number>`COUNT(*)::integer` })
        .from(crmContacts)
        .where(eq(crmContacts.ownerUserId, userId)),
      db.select({
        total: sql<number>`COUNT(*)::integer`,
        totalValue: sql<number>`COALESCE(SUM(${crmDeals.value}), 0)::integer`,
        won: sql<number>`SUM(CASE WHEN ${crmDeals.status} = 'won' THEN 1 ELSE 0 END)::integer`,
        wonValue: sql<number>`COALESCE(SUM(CASE WHEN ${crmDeals.status} = 'won' THEN ${crmDeals.value} ELSE 0 END), 0)::integer`,
        lost: sql<number>`SUM(CASE WHEN ${crmDeals.status} = 'lost' THEN 1 ELSE 0 END)::integer`
      })
        .from(crmDeals)
        .where(eq(crmDeals.ownerUserId, userId)),
      db.select({
        total: sql<number>`COUNT(*)::integer`,
        completed: sql<number>`SUM(CASE WHEN ${crmTasks.status} = 'done' THEN 1 ELSE 0 END)::integer`,
        overdue: sql<number>`SUM(CASE WHEN ${crmTasks.dueAt} < NOW() AND ${crmTasks.status} != 'done' THEN 1 ELSE 0 END)::integer`
      })
        .from(crmTasks)
        .where(eq(crmTasks.assignedTo, userId)),
      db.select({ count: sql<number>`COUNT(*)::integer` })
        .from(crmActivities)
        .where(eq(crmActivities.userId, userId))
    ]);

    const totalDeals = deals[0]?.total || 0;
    const wonDeals = deals[0]?.won || 0;

    return {
      totalContacts: contacts[0]?.count || 0,
      totalDeals: totalDeals,
      totalDealValue: deals[0]?.totalValue || 0,
      wonDeals: wonDeals,
      wonDealValue: deals[0]?.wonValue || 0,
      lostDeals: deals[0]?.lost || 0,
      averageDealSize: totalDeals > 0 ? Math.round((deals[0]?.totalValue || 0) / totalDeals) : 0,
      conversionRate: totalDeals > 0 ? Number(((wonDeals / totalDeals) * 100).toFixed(2)) : 0,
      activeTasks: (tasks[0]?.total || 0) - (tasks[0]?.completed || 0),
      overdueTasks: tasks[0]?.overdue || 0,
      recentActivities: activities[0]?.count || 0
    };
  }

  // FUNNEL ANALYTICS - COMPLETE CONVERSION TRACKING
  async getBookingTrends(userId: string, period: string = '30d', granularity: string = 'day'): Promise<any[]> {
    const startDate = this.getPeriodStartDate(period);
    const appointments = await db
      .select({
        date: sql<string>`DATE(${appointments.createdAt})`,
        bookings: sql<number>`COUNT(*)::integer`,
        confirmed: sql<number>`SUM(CASE WHEN ${appointments.status} = 'confirmed' THEN 1 ELSE 0 END)::integer`,
        completed: sql<number>`SUM(CASE WHEN ${appointments.status} = 'completed' THEN 1 ELSE 0 END)::integer`,
        noShow: sql<number>`SUM(CASE WHEN ${appointments.status} = 'no_show' THEN 1 ELSE 0 END)::integer`
      })
      .from(appointments)
      .where(and(
        eq(appointments.userId, userId),
        gte(appointments.createdAt, startDate)
      ))
      .groupBy(sql`DATE(${appointments.createdAt})`)
      .orderBy(sql`DATE(${appointments.createdAt})`);

    return appointments.map(a => ({
      date: a.date,
      bookings: a.bookings || 0,
      confirmed: a.confirmed || 0,
      completed: a.completed || 0,
      noShow: a.noShow || 0
    }));
  }

  async getPopularTimes(userId: string, period: string = '30d'): Promise<any[]> {
    const startDate = this.getPeriodStartDate(period);
    const times = await db
      .select({
        hour: sql<number>`EXTRACT(HOUR FROM ${appointments.startTime})::integer`,
        dayOfWeek: sql<number>`EXTRACT(DOW FROM ${appointments.startTime})::integer`,
        count: sql<number>`COUNT(*)::integer`,
        confirmed: sql<number>`SUM(CASE WHEN ${appointments.status} = 'confirmed' THEN 1 ELSE 0 END)::integer`
      })
      .from(appointments)
      .where(and(
        eq(appointments.userId, userId),
        gte(appointments.startTime, startDate)
      ))
      .groupBy(sql`EXTRACT(HOUR FROM ${appointments.startTime})`, sql`EXTRACT(DOW FROM ${appointments.startTime})`)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(10);

    return times.map(t => ({
      time: `${t.hour}:00`,
      count: t.count || 0,
      confirmed: t.confirmed || 0
    }));
  }

  async getConversionRates(userId: string, period: string = '30d'): Promise<any> {
    const startDate = this.getPeriodStartDate(period);
    
    // Get card views (funnel top)
    const cardViews = await db
      .select({ count: sql<number>`COUNT(*)::integer` })
      .from(analytics)
      .where(and(
        eq(analytics.userId, userId),
        gte(analytics.createdAt, startDate),
        eq(analytics.periodType, 'daily')
      ));

    // Get total appointments created (funnel middle)
    const totalBookings = await db
      .select({ count: sql<number>`COUNT(*)::integer` })
      .from(appointments)
      .where(and(
        eq(appointments.userId, userId),
        gte(appointments.createdAt, startDate)
      ));

    // Get completed appointments (funnel bottom)
    const completedBookings = await db
      .select({ count: sql<number>`COUNT(*)::integer` })
      .from(appointments)
      .where(and(
        eq(appointments.userId, userId),
        eq(appointments.status, 'completed'),
        gte(appointments.completedAt, startDate)
      ));

    const views = cardViews[0]?.count || 1;
    const bookings = totalBookings[0]?.count || 0;
    const completed = completedBookings[0]?.count || 0;

    return {
      conversionRate: views > 0 ? Number(((bookings / views) * 100).toFixed(2)) : 0,
      completionRate: bookings > 0 ? Number(((completed / bookings) * 100).toFixed(2)) : 0,
      totalVisits: views,
      totalBookings: bookings,
      completedBookings: completed,
      funnel: {
        visits: views,
        bookings: bookings,
        completed: completed,
        visitToBooking: views > 0 ? Number(((bookings / views) * 100).toFixed(2)) : 0,
        bookingToCompletion: bookings > 0 ? Number(((completed / bookings) * 100).toFixed(2)) : 0
      }
    };
  }

  async getNoShowAnalytics(userId: string, period: string = '30d'): Promise<any> {
    const startDate = this.getPeriodStartDate(period);
    
    const stats = await db
      .select({
        total: sql<number>`COUNT(*)::integer`,
        noShows: sql<number>`SUM(CASE WHEN ${appointments.status} = 'no_show' THEN 1 ELSE 0 END)::integer`,
        completed: sql<number>`SUM(CASE WHEN ${appointments.status} = 'completed' THEN 1 ELSE 0 END)::integer`,
        confirmed: sql<number>`SUM(CASE WHEN ${appointments.status} = 'confirmed' THEN 1 ELSE 0 END)::integer`
      })
      .from(appointments)
      .where(and(
        eq(appointments.userId, userId),
        gte(appointments.createdAt, startDate)
      ));

    const total = stats[0]?.total || 0;
    const noShows = stats[0]?.noShows || 0;
    const completed = stats[0]?.completed || 0;
    const confirmed = stats[0]?.confirmed || 0;

    return {
      noShowRate: total > 0 ? Number(((noShows / total) * 100).toFixed(2)) : 0,
      totalNoShows: noShows,
      totalAppointments: total,
      completedAppointments: completed,
      confirmedAppointments: confirmed,
      cancellationImpact: `${noShows} no-shows out of ${total} total appointments`
    };
  }

  async getCustomerAnalytics(userId: string, period: string = '30d'): Promise<any> {
    const startDate = this.getPeriodStartDate(period);
    
    // Total unique customers
    const uniqueCustomers = await db
      .selectDistinct({ email: appointments.customerEmail })
      .from(appointments)
      .where(and(
        eq(appointments.userId, userId),
        gte(appointments.createdAt, startDate)
      ));

    // Repeat customers
    const repeatCustomers = await db
      .select({
        email: appointments.customerEmail,
        bookingCount: sql<number>`COUNT(*)::integer`
      })
      .from(appointments)
      .where(and(
        eq(appointments.userId, userId),
        gte(appointments.createdAt, startDate)
      ))
      .groupBy(appointments.customerEmail)
      .having(sql`COUNT(*) > 1`);

    const total = uniqueCustomers.length;
    const repeat = repeatCustomers.length;
    const newCustomers = total - repeat;

    return {
      totalCustomers: total,
      newCustomers: newCustomers,
      repeatCustomers: repeat,
      repeatRate: total > 0 ? Number(((repeat / total) * 100).toFixed(2)) : 0,
      customerLifetimeValue: 'Tracked per customer'
    };
  }

  private getPeriodStartDate(period: string): Date {
    const now = new Date();
    switch (period) {
      case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d': return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '1y': return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      case '6m': return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      default: return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  // ECARD TO CRM LEAD CAPTURE
  async captureLeadFromCard(cardId: string, leadData: {
    firstName?: string;
    lastName?: string;
    email: string;
    phone?: string;
    company?: string;
    jobTitle?: string;
    message?: string;
  }): Promise<{
    contact: any;
    subscription: any;
    leadCaptured: boolean;
  }> {
    // Get card and owner
    const card = await db.query.businessCards.findFirst({
      where: eq(businessCards.id, cardId)
    });

    if (!card) throw new Error('Card not found');

    // Check if contact already exists with this email
    let contact = await db.query.crmContacts.findFirst({
      where: and(
        eq(crmContacts.ownerUserId, card.userId),
        eq(crmContacts.email, leadData.email)
      )
    });

    // Create new contact if doesn't exist
    if (!contact) {
      const [newContact] = await db.insert(crmContacts).values({
        ownerUserId: card.userId,
        firstName: leadData.firstName || 'Unknown',
        lastName: leadData.lastName || '',
        email: leadData.email,
        phone: leadData.phone,
        company: leadData.company,
        jobTitle: leadData.jobTitle,
        source: 'ecard',
        lifecycleStage: 'lead' as any,
        leadScore: 25,
        leadPriority: 'medium' as any,
        notes: leadData.message ? `Message from eCard: ${leadData.message}` : undefined,
        tags: ['ecard_capture', `card_${cardId}`],
        createdAt: new Date()
      }).returning();

      contact = newContact;
    }

    // Create card subscription for email capture
    const crypto = await import('crypto');
    const unsubscribeToken = crypto.randomBytes(32).toString('hex');
    
    const [subscription] = await db.insert(cardSubscriptions).values({
      cardId,
      email: leadData.email.toLowerCase().trim(),
      name: leadData.firstName && leadData.lastName 
        ? `${leadData.firstName} ${leadData.lastName}`
        : leadData.firstName || leadData.email,
      unsubscribeToken,
      isActive: true,
      createdAt: new Date()
    }).returning();

    // Log activity in CRM
    await db.insert(crmActivities).values({
      contactId: contact.id,
      userId: card.userId,
      type: 'lead_capture',
      description: `Lead captured from eCard: ${card.name || card.cardName}`,
      metadata: {
        cardId,
        cardName: card.cardName,
        source: 'ecard',
        timestamp: new Date().toISOString()
      },
      createdAt: new Date()
    });

    return {
      contact,
      subscription,
      leadCaptured: true
    };
  }

  async getAdminLinks(): Promise<{
    id: string;
    title: string;
    url: string;
    ownerName: string;
    visitorCount: number;
    clicksCount: number;
    initials: string;
  }[]> {
    // Get all business cards with their analytics
    const cardsWithAnalytics = await db
      .select({
        id: businessCards.id,
        name: businessCards.name,
        cardName: businessCards.cardName,
        userId: businessCards.userId,
        viewCount: sql<number>`COALESCE(SUM(${analytics.viewCount}), 0)::integer`,
        clickCount: sql<number>`COALESCE(SUM(${analytics.clickCount}), 0)::integer`
      })
      .from(businessCards)
      .leftJoin(
        analytics,
        and(
          eq(businessCards.id, analytics.cardId),
          eq(analytics.periodType, 'all_time')
        )
      )
      .where(eq(businessCards.visibility, 'public'))
      .groupBy(businessCards.id, businessCards.name, businessCards.cardName, businessCards.userId)
      .orderBy(desc(sql`COALESCE(SUM(${analytics.viewCount}), 0)`))
      .limit(100);

    // Get user information for each card
    const userIds = [...new Set(cardsWithAnalytics.map(card => card.userId))];
    const usersData = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email
      })
      .from(users)
      .where(sql`${users.id} IN (${sql.raw(userIds.map(id => `'${id}'`).join(',') || "''")})`);

    const userMap = new Map(usersData.map(u => [u.id, u]));

    // Format the response
    return cardsWithAnalytics.map(card => {
      const owner = userMap.get(card.userId);
      const ownerName = owner?.name || owner?.email || 'Unknown User';
      const cardTitle = card.name || card.cardName || 'Untitled Card';
      
      // Generate initials from owner name or card title
      const nameForInitials = ownerName !== 'Unknown User' ? ownerName : cardTitle;
      const initials = nameForInitials
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'UC';

      return {
        id: card.id,
        title: cardTitle,
        url: `${process.env.VITE_APP_URL || 'https://talkl.ink'}/${card.cardName}`,
        ownerName,
        visitorCount: card.viewCount || 0,
        clicksCount: card.clickCount || 0,
        initials
      };
    });
  }

  // ===== NFC OPERATIONS =====
  
  async createNfcTag(data: InsertNfcTag): Promise<NfcTag> {
    const [tag] = await db.insert(nfcTags).values(data).returning();
    return tag;
  }

  async getNfcTag(id: string): Promise<NfcTag | undefined> {
    const [tag] = await db.select().from(nfcTags).where(eq(nfcTags.id, id));
    return tag;
  }

  async getNfcTagsByCard(cardId: string): Promise<NfcTag[]> {
    return await db.select().from(nfcTags).where(eq(nfcTags.cardId, cardId));
  }

  async getNfcTagsByUser(userId: string): Promise<NfcTag[]> {
    return await db.select().from(nfcTags).where(eq(nfcTags.userId, userId));
  }

  async updateNfcTag(id: string, data: Partial<InsertNfcTag>): Promise<NfcTag> {
    const [tag] = await db.update(nfcTags).set({ ...data, updatedAt: new Date() }).where(eq(nfcTags.id, id)).returning();
    return tag;
  }

  async deleteNfcTag(id: string): Promise<void> {
    await db.delete(nfcTags).where(eq(nfcTags.id, id));
  }

  async recordNfcTapEvent(data: InsertNfcTapEvent): Promise<NfcTapEvent> {
    const [event] = await db.insert(nfcTapEvents).values(data).returning();
    return event;
  }

  async getNfcTapEvents(tagId: string, limit: number = 100): Promise<NfcTapEvent[]> {
    return await db.select().from(nfcTapEvents).where(eq(nfcTapEvents.nfcTagId, tagId)).limit(limit).orderBy(desc(nfcTapEvents.tappedAt));
  }

  async getNfcAnalyticsForCard(cardId: string): Promise<NfcAnalytics[]> {
    return await db.select().from(nfcAnalytics).where(eq(nfcAnalytics.cardId, cardId));
  }

  async getNfcAnalyticsForUser(userId: string): Promise<NfcAnalytics[]> {
    return await db.select().from(nfcAnalytics).where(eq(nfcAnalytics.userId, userId));
  }

  async updateNfcAnalytics(cardId: string, tagId: string): Promise<NfcAnalytics> {
    let [analytic] = await db.select().from(nfcAnalytics).where(and(eq(nfcAnalytics.cardId, cardId), eq(nfcAnalytics.nfcTagId, tagId)));
    
    if (!analytic) {
      const tag = await this.getNfcTag(tagId);
      if (!tag) throw new Error('NFC tag not found');
      
      const [newAnalytic] = await db.insert(nfcAnalytics).values({
        nfcTagId: tagId,
        cardId,
        userId: tag.userId,
        totalTaps: 1,
        viewCount: 1,
      } as any).returning();
      return newAnalytic;
    }

    const [updated] = await db.update(nfcAnalytics).set({
      totalTaps: (analytic.totalTaps || 0) + 1,
      viewCount: (analytic.viewCount || 0) + 1,
      updatedAt: new Date(),
    }).where(and(eq(nfcAnalytics.cardId, cardId), eq(nfcAnalytics.nfcTagId, tagId))).returning();
    
    return updated;
  }

  // ===== DIGITAL SHOP OPERATIONS =====
  
  async createDigitalProduct(productData: InsertDigitalProduct): Promise<DigitalProduct> {
    const [product] = await db.insert(digitalProducts).values(productData).returning();
    return product;
  }

  async getDigitalProduct(id: string): Promise<DigitalProduct | undefined> {
    const [product] = await db.select().from(digitalProducts).where(eq(digitalProducts.id, id));
    return product;
  }

  async getSellerProducts(sellerId: string, status?: string): Promise<DigitalProduct[]> {
    let query = db.select().from(digitalProducts).where(eq(digitalProducts.sellerId, sellerId));
    if (status) {
      query = query.where(eq(digitalProducts.status, status as any));
    }
    return query;
  }

  async updateDigitalProduct(id: string, productData: Partial<InsertDigitalProduct>): Promise<DigitalProduct> {
    const [product] = await db.update(digitalProducts).set(productData).where(eq(digitalProducts.id, id)).returning();
    return product;
  }

  async deleteDigitalProduct(id: string): Promise<void> {
    await db.delete(digitalProducts).where(eq(digitalProducts.id, id));
  }

  async browseProducts(filters?: { category?: string; limit?: number; offset?: number }): Promise<DigitalProduct[]> {
    let query = db.select().from(digitalProducts).where(eq(digitalProducts.status, 'active'));
    if (filters?.category) {
      query = query.where(eq(digitalProducts.category, filters.category));
    }
    query = query.orderBy(desc(digitalProducts.createdAt));
    if (filters?.limit) query = query.limit(filters.limit);
    if (filters?.offset) query = query.offset(filters.offset);
    return query;
  }

  async createShopOrder(orderData: InsertShopOrder): Promise<ShopOrder> {
    const [order] = await db.insert(shopOrders).values(orderData).returning();
    return order;
  }

  async getShopOrder(id: string): Promise<ShopOrder | undefined> {
    const [order] = await db.select().from(shopOrders).where(eq(shopOrders.id, id));
    return order;
  }

  async getOrderByToken(token: string): Promise<ShopOrder | undefined> {
    const [order] = await db.select().from(shopOrders).where(eq(shopOrders.downloadToken, token));
    return order;
  }

  async getSellerOrders(sellerId: string, status?: string): Promise<ShopOrder[]> {
    let query = db.select().from(shopOrders).where(eq(shopOrders.sellerId, sellerId));
    if (status) {
      query = query.where(eq(shopOrders.paymentStatus, status as any));
    }
    return query.orderBy(desc(shopOrders.createdAt));
  }

  async getBuyerOrders(buyerId: string): Promise<ShopOrder[]> {
    return db.select().from(shopOrders).where(eq(shopOrders.buyerId, buyerId)).orderBy(desc(shopOrders.createdAt));
  }

  async getBuyerDownloads(buyerId: string): Promise<ShopDownload[]> {
    return db.select().from(shopDownloads).where(eq(shopDownloads.buyerId, buyerId)).orderBy(desc(shopDownloads.createdAt));
  }

  async updateShopOrder(id: string, orderData: Partial<InsertShopOrder>): Promise<ShopOrder> {
    const [order] = await db.update(shopOrders).set(orderData).where(eq(shopOrders.id, id)).returning();
    return order;
  }

  async createShopDownload(downloadData: InsertShopDownload): Promise<ShopDownload> {
    const [download] = await db.insert(shopDownloads).values(downloadData).returning();
    return download;
  }

  async getShopDownload(id: string): Promise<ShopDownload | undefined> {
    const [download] = await db.select().from(shopDownloads).where(eq(shopDownloads.id, id));
    return download;
  }

  async updateShopDownload(id: string, downloadData: Partial<InsertShopDownload>): Promise<ShopDownload> {
    const [download] = await db.update(shopDownloads).set(downloadData).where(eq(shopDownloads.id, id)).returning();
    return download;
  }

  async getProductBySlug(slug: string): Promise<DigitalProduct | undefined> {
    const [product] = await db.select().from(digitalProducts).where(eq(digitalProducts.slug, slug));
    return product;
  }

  async getSellerAnalytics(sellerId: string): Promise<any> {
    const products = await db.select().from(digitalProducts).where(eq(digitalProducts.sellerId, sellerId));
    const orders = await db.select().from(shopOrders).where(eq(shopOrders.sellerId, sellerId));
    
    const totalRevenue = orders.reduce((sum, order) => sum + (order.sellerAmount || 0), 0);
    const totalSales = orders.filter(o => o.paymentStatus === 'completed').length;
    const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalProducts = products.length;

    return {
      totalRevenue,
      totalSales,
      totalViews,
      totalProducts,
      products,
      orders,
    };
  }

  // Shop categories
  async getShopCategories(): Promise<any[]> {
    const result = await db.execute(sql`SELECT * FROM shop_categories WHERE is_active = true ORDER BY sort_order`);
    return result as any;
  }

  // Enhanced browse with search
  async browseProducts(filters?: { category?: string; search?: string; limit?: number; offset?: number }): Promise<DigitalProduct[]> {
    let query: any = db.select().from(digitalProducts).where(eq(digitalProducts.status, 'active'));
    
    if (filters?.category) {
      query = query.where(eq(digitalProducts.category, filters.category));
    }
    
    if (filters?.search) {
      query = query.where(or(
        like(digitalProducts.title, `%${filters.search}%`),
        like(digitalProducts.description, `%${filters.search}%`)
      ));
    }
    
    query = query.orderBy(desc(digitalProducts.createdAt));
    if (filters?.limit) query = query.limit(filters.limit);
    if (filters?.offset) query = query.offset(filters.offset);
    
    return query;
  }

  async getAllProducts(): Promise<DigitalProduct[]> {
    return db.select().from(digitalProducts).orderBy(desc(digitalProducts.createdAt));
  }

  async updateProductStatus(id: string, status: string): Promise<DigitalProduct> {
    const [product] = await db.update(digitalProducts).set({ status: status as any }).where(eq(digitalProducts.id, id)).returning();
    return product;
  }

  async getAllOrders(): Promise<ShopOrder[]> {
    return db.select().from(shopOrders).orderBy(desc(shopOrders.createdAt));
  }

  async getDownloadByToken(token: string): Promise<ShopDownload | undefined> {
    const [download] = await db.select().from(shopDownloads).where(sql`download_token = ${token}`);
    return download;
  }

  async incrementDownloadCount(id: string): Promise<void> {
    await db.update(shopDownloads).set({ downloadCount: sql`download_count + 1`, updatedAt: new Date() }).where(eq(shopDownloads.id, id));
  }

  async getShopAnalytics(): Promise<any> {
    const products = await db.select().from(digitalProducts);
    const orders = await db.select().from(shopOrders);
    
    const totalRevenue = orders.reduce((sum, order) => sum + (order.amount || 0), 0);
    const totalSales = orders.length;
    const totalProducts = products.filter(p => p.status === 'active').length;
    const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);

    return { totalRevenue, totalSales, totalProducts, totalViews, products, orders };
  }

  async getPlatformSettings(): Promise<any> {
    const settings = await db.execute(sql`SELECT setting_key, setting_value FROM platform_settings`);
    const result: Record<string, any> = {
      ownerCommission: 50,
      sellerCommission: 30,
      platformCommission: 20,
    };
    
    for (const row of settings as any[]) {
      if (row.setting_key === 'default_owner_commission') result.ownerCommission = parseInt(row.setting_value);
      if (row.setting_key === 'default_seller_commission') result.sellerCommission = parseInt(row.setting_value);
      if (row.setting_key === 'default_platform_commission') result.platformCommission = parseInt(row.setting_value);
    }
    
    return result;
  }

  async updatePlatformSettings(settings: { defaultOwnerCommission: number; defaultSellerCommission: number; defaultPlatformCommission: number }): Promise<any> {
    await db.execute(sql`
      INSERT INTO platform_settings (id, setting_key, setting_value, setting_type, updated_at)
      VALUES 
        (gen_random_uuid()::text, 'default_owner_commission', ${settings.defaultOwnerCommission.toString()}, 'number', NOW()),
        (gen_random_uuid()::text, 'default_seller_commission', ${settings.defaultSellerCommission.toString()}, 'number', NOW()),
        (gen_random_uuid()::text, 'default_platform_commission', ${settings.defaultPlatformCommission.toString()}, 'number', NOW())
      ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = NOW()
    `);
    
    return this.getPlatformSettings();
  }

  async createShopEarning(affiliateId: string, amount: number, type: string, orderId: string): Promise<void> {
    await db.execute(sql`
      INSERT INTO conversions (id, affiliate_id, amount, type, status, created_at, order_id, metadata)
      VALUES (gen_random_uuid()::text, ${affiliateId}, ${amount}, ${type}, 'approved', NOW(), ${orderId}, '{}')
    `);
  }
}

export const storage = new DatabaseStorage();
