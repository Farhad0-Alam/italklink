import type { Express } from "express";
import { z } from "zod";
import { requireAuth, requireTeamRole, requireMemberAccess } from './auth';
import { storage } from './storage';
import { 
  insertTeamAssignmentSchema, 
  insertRoundRobinStateSchema,
  insertLeadRoutingRuleSchema,
  insertTeamMemberSkillSchema,
  insertTeamMemberCapacitySchema,
  insertTeamAvailabilityPatternSchema,
  insertAssignmentAnalyticsSchema,
  insertRoutingAnalyticsSchema
} from '@shared/schema';

// Update schemas for CRUD operations
const updateTeamAssignmentSchema = insertTeamAssignmentSchema.omit({ 
  id: true, createdAt: true, updatedAt: true 
}).partial();

const updateLeadRoutingRuleSchema = insertLeadRoutingRuleSchema.omit({ 
  id: true, createdAt: true, updatedAt: true 
}).partial();

const updateTeamMemberSkillSchema = insertTeamMemberSkillSchema.omit({ 
  id: true, createdAt: true, updatedAt: true 
}).partial();

const updateTeamMemberCapacitySchema = insertTeamMemberCapacitySchema.omit({ 
  id: true, createdAt: true, updatedAt: true 
}).partial();

// Request validation schemas
const assignmentFiltersSchema = z.object({
  status: z.string().optional(),
  assignmentType: z.string().optional(),
  limit: z.number().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional()
});

const routingContextSchema = z.object({
  eventTypeId: z.string(),
  clientInfo: z.any().optional(),
  appointmentValue: z.number().optional(),
  requiredSkills: z.array(z.string()).optional(),
  preferredMembers: z.array(z.string()).optional(),
  timeSlot: z.string().optional()
});

const optimalAssignmentSchema = z.object({
  eventTypeId: z.string(),
  duration: z.number(),
  scheduledTime: z.string(),
  clientInfo: z.any().optional(),
  requiredSkills: z.array(z.string()).optional(),
  preferredMembers: z.array(z.string()).optional()
});

export function setupTeamSchedulingRoutes(app: Express): void {
  // ===== TEAM ASSIGNMENT ROUTES =====
  
  // Create team assignment
  app.post('/api/teams/:teamId/assignments', requireAuth, requireTeamRole('owner', 'admin'), async (req, res) => {
    try {
      const { teamId } = req.params;
      const assignmentData = insertTeamAssignmentSchema.parse({
        ...req.body,
        teamId
      });
      
      const assignment = await storage.createTeamAssignment(assignmentData);
      res.json(assignment);
    } catch (error) {
      console.error('Error creating team assignment:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
    }
  });

  // Get team assignments with filters
  app.get('/api/teams/:teamId/assignments', requireAuth, requireTeamRole('owner', 'admin', 'member'), async (req, res) => {
    try {
      const { teamId } = req.params;
      const filters = assignmentFiltersSchema.parse(req.query);
      
      // Convert string dates to Date objects
      const processedFilters = {
        ...filters,
        dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
        dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined
      };
      
      const assignments = await storage.getTeamAssignments(teamId, processedFilters);
      res.json(assignments);
    } catch (error) {
      console.error('Error fetching team assignments:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
    }
  });

  // Get assignment by ID
  app.get('/api/assignments/:id', requireAuth, async (req, res) => {
    try {
      const assignment = await storage.getTeamAssignment(req.params.id);
      if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' });
      }
      
      // Verify user has access to the team that owns this assignment
      const userId = (req.user as any).id;
      const teamMembership = await storage.getTeamMemberByUserAndTeam(userId, assignment.teamId);
      if (!teamMembership) {
        return res.status(403).json({ error: 'Access denied: Not a team member' });
      }
      
      res.json(assignment);
    } catch (error) {
      console.error('Error fetching assignment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update team assignment
  app.put('/api/assignments/:id', requireAuth, async (req, res) => {
    try {
      // First get the assignment to check team ownership
      const assignment = await storage.getTeamAssignment(req.params.id);
      if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' });
      }
      
      // Verify user has admin/owner access to the team
      const userId = (req.user as any).id;
      const teamMembership = await storage.getTeamMemberByUserAndTeam(userId, assignment.teamId);
      if (!teamMembership || !['owner', 'admin'].includes(teamMembership.role)) {
        return res.status(403).json({ error: 'Access denied: Insufficient team permissions' });
      }
      
      const updateData = updateTeamAssignmentSchema.parse(req.body);
      const updatedAssignment = await storage.updateTeamAssignment(req.params.id, updateData);
      res.json(updatedAssignment);
    } catch (error) {
      console.error('Error updating assignment:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
    }
  });

  // Delete team assignment
  app.delete('/api/assignments/:id', requireAuth, async (req, res) => {
    try {
      // First get the assignment to check team ownership
      const assignment = await storage.getTeamAssignment(req.params.id);
      if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' });
      }
      
      // Verify user has admin/owner access to the team
      const userId = (req.user as any).id;
      const teamMembership = await storage.getTeamMemberByUserAndTeam(userId, assignment.teamId);
      if (!teamMembership || !['owner', 'admin'].includes(teamMembership.role)) {
        return res.status(403).json({ error: 'Access denied: Insufficient team permissions' });
      }
      
      await storage.deleteTeamAssignment(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting assignment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get member assignments
  app.get('/api/members/:memberId/assignments', requireAuth, requireMemberAccess, async (req, res) => {
    try {
      const { memberId } = req.params;
      const filters = assignmentFiltersSchema.parse(req.query);
      
      const processedFilters = {
        ...filters,
        dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
        dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined
      };
      
      const assignments = await storage.getMemberAssignments(memberId, processedFilters);
      res.json(assignments);
    } catch (error) {
      console.error('Error fetching member assignments:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
    }
  });

  // ===== ROUND-ROBIN SCHEDULING ROUTES =====

  // Get next round-robin assignment
  app.post('/api/teams/:teamId/round-robin/next', requireAuth, requireTeamRole('owner', 'admin'), async (req, res) => {
    try {
      const { teamId } = req.params;
      const { eventTypeId, requiredSkills, excludeMembers } = req.body;
      
      const nextMember = await storage.getNextRoundRobinAssignment(teamId, eventTypeId, {
        requiredSkills,
        excludeMembers
      });
      
      if (!nextMember) {
        return res.status(404).json({ error: 'No available members for assignment' });
      }
      
      res.json({ memberId: nextMember });
    } catch (error) {
      console.error('Error getting next round-robin assignment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get round-robin state
  app.get('/api/teams/:teamId/round-robin/state', requireAuth, requireTeamRole('owner', 'admin', 'member'), async (req, res) => {
    try {
      const { teamId } = req.params;
      const { eventTypeId } = req.query;
      
      const state = await storage.getRoundRobinState(teamId, eventTypeId as string);
      if (!state) {
        return res.status(404).json({ error: 'Round-robin state not found' });
      }
      
      res.json(state);
    } catch (error) {
      console.error('Error fetching round-robin state:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Create or update round-robin state
  app.post('/api/teams/:teamId/round-robin/state', requireAuth, requireTeamRole('owner', 'admin'), async (req, res) => {
    try {
      const { teamId } = req.params;
      const stateData = insertRoundRobinStateSchema.parse({
        ...req.body,
        teamId
      });
      
      const state = await storage.createRoundRobinState(stateData);
      res.json(state);
    } catch (error) {
      console.error('Error creating round-robin state:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
    }
  });

  // Rebalance round-robin assignments
  app.post('/api/teams/:teamId/round-robin/rebalance', requireAuth, requireTeamRole('owner', 'admin'), async (req, res) => {
    try {
      const { teamId } = req.params;
      const { eventTypeId } = req.body;
      
      const state = await storage.rebalanceRoundRobin(teamId, eventTypeId);
      res.json(state);
    } catch (error) {
      console.error('Error rebalancing round-robin:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Reset round-robin assignments
  app.post('/api/teams/:teamId/round-robin/reset', requireAuth, requireTeamRole('owner', 'admin'), async (req, res) => {
    try {
      const { teamId } = req.params;
      const { eventTypeId } = req.body;
      
      const state = await storage.resetRoundRobin(teamId, eventTypeId);
      res.json(state);
    } catch (error) {
      console.error('Error resetting round-robin:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ===== LEAD ROUTING RULES ROUTES =====

  // Create routing rule
  app.post('/api/teams/:teamId/routing/rules', requireAuth, requireTeamRole('owner', 'admin'), async (req, res) => {
    try {
      const { teamId } = req.params;
      const ruleData = insertLeadRoutingRuleSchema.parse({
        ...req.body,
        teamId
      });
      
      const rule = await storage.createLeadRoutingRule(ruleData);
      res.json(rule);
    } catch (error) {
      console.error('Error creating routing rule:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
    }
  });

  // Get team routing rules
  app.get('/api/teams/:teamId/routing/rules', requireAuth, requireTeamRole('owner', 'admin', 'member'), async (req, res) => {
    try {
      const { teamId } = req.params;
      const { isActive, strategy } = req.query;
      
      const filters = {
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        strategy: strategy as string
      };
      
      const rules = await storage.getTeamRoutingRules(teamId, filters);
      res.json(rules);
    } catch (error) {
      console.error('Error fetching routing rules:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get routing rule by ID
  app.get('/api/routing/rules/:id', requireAuth, async (req, res) => {
    try {
      const rule = await storage.getLeadRoutingRule(req.params.id);
      if (!rule) {
        return res.status(404).json({ error: 'Routing rule not found' });
      }
      res.json(rule);
    } catch (error) {
      console.error('Error fetching routing rule:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update routing rule
  app.put('/api/routing/rules/:id', requireAuth, async (req, res) => {
    try {
      const updateData = updateLeadRoutingRuleSchema.parse(req.body);
      const rule = await storage.updateLeadRoutingRule(req.params.id, updateData);
      res.json(rule);
    } catch (error) {
      console.error('Error updating routing rule:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
    }
  });

  // Delete routing rule
  app.delete('/api/routing/rules/:id', requireAuth, async (req, res) => {
    try {
      await storage.deleteLeadRoutingRule(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting routing rule:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Evaluate routing rules for assignment
  app.post('/api/teams/:teamId/routing/evaluate', requireAuth, requireTeamRole('owner', 'admin'), async (req, res) => {
    try {
      const { teamId } = req.params;
      const context = routingContextSchema.parse(req.body);
      
      const result = await storage.evaluateRoutingRules(teamId, context);
      
      if (!result) {
        return res.status(404).json({ error: 'No suitable member found for assignment' });
      }
      
      res.json(result);
    } catch (error) {
      console.error('Error evaluating routing rules:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
    }
  });

  // ===== TEAM MEMBER SKILLS ROUTES =====

  // Create team member skill
  app.post('/api/members/:memberId/skills', requireAuth, requireMemberAccess, async (req, res) => {
    try {
      const { memberId } = req.params;
      const skillData = insertTeamMemberSkillSchema.parse({
        ...req.body,
        teamMemberId: memberId
      });
      
      const skill = await storage.createTeamMemberSkill(skillData);
      res.json(skill);
    } catch (error) {
      console.error('Error creating member skill:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
    }
  });

  // Get member skills
  app.get('/api/members/:memberId/skills', requireAuth, requireMemberAccess, async (req, res) => {
    try {
      const { memberId } = req.params;
      const { category, verified } = req.query;
      
      const filters = {
        category: category as string,
        verified: verified !== undefined ? verified === 'true' : undefined
      };
      
      const skills = await storage.getMemberSkills(memberId, filters);
      res.json(skills);
    } catch (error) {
      console.error('Error fetching member skills:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get team members by skill
  app.get('/api/teams/:teamId/skills/:skillName/members', requireAuth, requireTeamRole('owner', 'admin', 'member'), async (req, res) => {
    try {
      const { teamId, skillName } = req.params;
      const { minLevel } = req.query;
      
      const members = await storage.getTeamMembersBySkill(
        teamId, 
        skillName, 
        minLevel ? parseInt(minLevel as string) : undefined
      );
      
      res.json(members);
    } catch (error) {
      console.error('Error fetching members by skill:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update team member skill
  app.put('/api/skills/:id', requireAuth, async (req, res) => {
    try {
      const updateData = updateTeamMemberSkillSchema.parse(req.body);
      const skill = await storage.updateTeamMemberSkill(req.params.id, updateData);
      res.json(skill);
    } catch (error) {
      console.error('Error updating member skill:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
    }
  });

  // Verify member skill
  app.post('/api/skills/:id/verify', requireAuth, async (req, res) => {
    try {
      const { verifiedBy } = req.body;
      const skill = await storage.verifyMemberSkill(req.params.id, verifiedBy);
      res.json(skill);
    } catch (error) {
      console.error('Error verifying member skill:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
    }
  });

  // Delete team member skill
  app.delete('/api/skills/:id', requireAuth, async (req, res) => {
    try {
      await storage.deleteTeamMemberSkill(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting member skill:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ===== TEAM MEMBER CAPACITY ROUTES =====

  // Create or update team member capacity
  app.post('/api/members/:memberId/capacity', requireAuth, requireMemberAccess, async (req, res) => {
    try {
      const { memberId } = req.params;
      const capacityData = insertTeamMemberCapacitySchema.parse({
        ...req.body,
        teamMemberId: memberId
      });
      
      // Check if capacity already exists
      const existingCapacity = await storage.getTeamMemberCapacity(memberId);
      
      let capacity;
      if (existingCapacity) {
        capacity = await storage.updateTeamMemberCapacity(existingCapacity.id, capacityData);
      } else {
        capacity = await storage.createTeamMemberCapacity(capacityData);
      }
      
      res.json(capacity);
    } catch (error) {
      console.error('Error creating/updating member capacity:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
    }
  });

  // Get team member capacity
  app.get('/api/members/:memberId/capacity', requireAuth, requireMemberAccess, async (req, res) => {
    try {
      const capacity = await storage.getTeamMemberCapacity(req.params.memberId);
      if (!capacity) {
        return res.status(404).json({ error: 'Capacity not found' });
      }
      res.json(capacity);
    } catch (error) {
      console.error('Error fetching member capacity:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Check member capacity for appointment
  app.post('/api/members/:memberId/capacity/check', requireAuth, requireMemberAccess, async (req, res) => {
    try {
      const { memberId } = req.params;
      const { appointmentDuration, appointmentDate } = req.body;
      
      if (!appointmentDuration || !appointmentDate) {
        return res.status(400).json({ error: 'Duration and date are required' });
      }
      
      const result = await storage.checkMemberCapacity(
        memberId, 
        parseInt(appointmentDuration), 
        new Date(appointmentDate)
      );
      
      res.json(result);
    } catch (error) {
      console.error('Error checking member capacity:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update member workload
  app.post('/api/members/:memberId/capacity/workload', requireAuth, requireMemberAccess, async (req, res) => {
    try {
      const { memberId } = req.params;
      const { increment } = req.body;
      
      if (increment === undefined) {
        return res.status(400).json({ error: 'Increment value is required' });
      }
      
      const capacity = await storage.updateMemberWorkload(memberId, increment);
      res.json(capacity);
    } catch (error) {
      console.error('Error updating member workload:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
    }
  });

  // ===== TEAM AVAILABILITY PATTERNS ROUTES =====

  // Create team availability pattern
  app.post('/api/teams/:teamId/availability/patterns', requireAuth, requireTeamRole('owner', 'admin'), async (req, res) => {
    try {
      const { teamId } = req.params;
      const patternData = insertTeamAvailabilityPatternSchema.parse({
        ...req.body,
        teamId
      });
      
      const pattern = await storage.createTeamAvailabilityPattern(patternData);
      res.json(pattern);
    } catch (error) {
      console.error('Error creating availability pattern:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
    }
  });

  // Get team availability patterns
  app.get('/api/teams/:teamId/availability/patterns', requireAuth, requireTeamRole('owner', 'admin', 'member'), async (req, res) => {
    try {
      const { teamId } = req.params;
      const { isActive, patternType } = req.query;
      
      const filters = {
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        patternType: patternType as string
      };
      
      const patterns = await storage.getTeamAvailabilityPatterns(teamId, filters);
      res.json(patterns);
    } catch (error) {
      console.error('Error fetching availability patterns:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get collective availability
  app.post('/api/teams/:teamId/availability/collective', requireAuth, requireTeamRole('owner', 'admin', 'member'), async (req, res) => {
    try {
      const { teamId } = req.params;
      const { date, duration } = req.body;
      
      if (!date || !duration) {
        return res.status(400).json({ error: 'Date and duration are required' });
      }
      
      const availability = await storage.getCollectiveAvailability(
        teamId, 
        new Date(date), 
        parseInt(duration)
      );
      
      res.json(availability);
    } catch (error) {
      console.error('Error getting collective availability:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
    }
  });

  // Update team availability pattern
  app.put('/api/availability/patterns/:id', requireAuth, async (req, res) => {
    try {
      const updateData = req.body;
      const pattern = await storage.updateTeamAvailabilityPattern(req.params.id, updateData);
      res.json(pattern);
    } catch (error) {
      console.error('Error updating availability pattern:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
    }
  });

  // Delete team availability pattern
  app.delete('/api/availability/patterns/:id', requireAuth, async (req, res) => {
    try {
      await storage.deleteTeamAvailabilityPattern(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting availability pattern:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ===== ANALYTICS ROUTES =====

  // Create assignment analytics
  app.post('/api/teams/:teamId/analytics/assignments', requireAuth, requireTeamRole('owner', 'admin'), async (req, res) => {
    try {
      const { teamId } = req.params;
      const analyticsData = insertAssignmentAnalyticsSchema.parse({
        ...req.body,
        teamId
      });
      
      const analytics = await storage.createAssignmentAnalytics(analyticsData);
      res.json(analytics);
    } catch (error) {
      console.error('Error creating assignment analytics:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
    }
  });

  // Get assignment analytics
  app.get('/api/teams/:teamId/analytics/assignments', requireAuth, requireTeamRole('owner', 'admin', 'member'), async (req, res) => {
    try {
      const { teamId } = req.params;
      const { memberId, periodType, periodStart } = req.query;
      
      const analytics = await storage.getAssignmentAnalytics(
        teamId,
        memberId as string,
        periodType as string,
        periodStart ? new Date(periodStart as string) : undefined
      );
      
      res.json(analytics);
    } catch (error) {
      console.error('Error fetching assignment analytics:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Generate member analytics
  app.post('/api/members/:memberId/analytics/generate', requireAuth, async (req, res) => {
    try {
      const { memberId } = req.params;
      const { periodType } = req.body;
      
      if (!periodType) {
        return res.status(400).json({ error: 'Period type is required' });
      }
      
      const analytics = await storage.generateMemberAnalytics(memberId, periodType);
      res.json(analytics);
    } catch (error) {
      console.error('Error generating member analytics:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
    }
  });

  // Get team performance metrics
  app.get('/api/teams/:teamId/analytics/performance', requireAuth, requireTeamRole('owner', 'admin', 'member'), async (req, res) => {
    try {
      const { teamId } = req.params;
      const { fromDate, toDate } = req.query;
      
      const dateRange = fromDate && toDate ? {
        from: new Date(fromDate as string),
        to: new Date(toDate as string)
      } : undefined;
      
      const metrics = await storage.getTeamPerformanceMetrics(teamId, dateRange);
      res.json(metrics);
    } catch (error) {
      console.error('Error fetching team performance metrics:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get routing analytics
  app.get('/api/teams/:teamId/analytics/routing', requireAuth, requireTeamRole('owner', 'admin', 'member'), async (req, res) => {
    try {
      const { teamId } = req.params;
      const { ruleId, dateFrom, dateTo } = req.query;
      
      const filters = {
        ruleId: ruleId as string,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined
      };
      
      const analytics = await storage.getRoutingAnalytics(teamId, filters);
      res.json(analytics);
    } catch (error) {
      console.error('Error fetching routing analytics:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get rule performance
  app.get('/api/routing/rules/:ruleId/performance', requireAuth, async (req, res) => {
    try {
      const { ruleId } = req.params;
      const { fromDate, toDate } = req.query;
      
      const dateRange = fromDate && toDate ? {
        from: new Date(fromDate as string),
        to: new Date(toDate as string)
      } : undefined;
      
      const performance = await storage.getRulePerformance(ruleId, dateRange);
      res.json(performance);
    } catch (error) {
      console.error('Error fetching rule performance:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ===== ADVANCED SCHEDULING ROUTES =====

  // Find optimal assignment
  app.post('/api/teams/:teamId/assignment/optimal', requireAuth, requireTeamRole('owner', 'admin'), async (req, res) => {
    try {
      const { teamId } = req.params;
      const appointmentContext = optimalAssignmentSchema.parse(req.body);
      
      // Convert scheduledTime string to Date
      const contextWithDate = {
        ...appointmentContext,
        scheduledTime: new Date(appointmentContext.scheduledTime)
      };
      
      const result = await storage.findOptimalAssignment(teamId, contextWithDate);
      
      if (!result) {
        return res.status(404).json({ error: 'No optimal assignment found' });
      }
      
      res.json(result);
    } catch (error) {
      console.error('Error finding optimal assignment:', error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
    }
  });

  // Get team scheduling stats
  app.get('/api/teams/:teamId/stats/scheduling', requireAuth, requireTeamRole('owner', 'admin', 'member'), async (req, res) => {
    try {
      const { teamId } = req.params;
      
      const stats = await storage.getTeamSchedulingStats(teamId);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching team scheduling stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Health check endpoint
  app.get('/api/teams/scheduling/health', requireAuth, async (req, res) => {
    try {
      res.json({
        status: 'healthy',
        features: {
          roundRobin: true,
          intelligentRouting: true,
          collectiveAvailability: true,
          performanceAnalytics: true,
          capacityManagement: true
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error checking team scheduling health:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}