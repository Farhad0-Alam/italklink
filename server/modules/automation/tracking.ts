import { Request } from 'express';
import { db } from '../../db';
import { 
  buttonInteractions, 
  leadProfiles, 
  automationConfigs,
  businessCards,
  crmContacts,
  crmActivities,
  InsertButtonInteraction,
  InsertLeadProfile,
  InsertCrmContact,
  InsertCrmActivity
} from '../../../shared/schema';
import { eq, and, desc, or } from 'drizzle-orm';

// Visitor fingerprinting for anonymous tracking
export function generateVisitorFingerprint(req: Request): string {
  const userAgent = req.headers['user-agent'] || '';
  const ip = req.ip || req.connection.remoteAddress || '';
  const acceptLanguage = req.headers['accept-language'] || '';
  const acceptEncoding = req.headers['accept-encoding'] || '';
  
  // Create a stable fingerprint from headers (not for security, just tracking)
  const fingerprint = Buffer.from(
    `${userAgent}:${ip}:${acceptLanguage}:${acceptEncoding}`
  ).toString('base64').substring(0, 32);
  
  return fingerprint;
}

// Extract device type from user agent
export function getDeviceType(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return 'mobile';
  }
  if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'tablet';
  }
  return 'desktop';
}

// Extract basic location info (if available)
export function getVisitorLocation(req: Request) {
  // In production, you'd use a GeoIP service
  // For now, return basic info from headers
  const country = req.headers['cf-ipcountry'] as string; // Cloudflare header
  const timezone = req.headers['cf-timezone'] as string; // Cloudflare header
  
  return {
    country: country || 'Unknown',
    timezone: timezone || 'UTC',
    ip: req.ip || 'unknown'
  };
}

// Calculate lead score based on interaction type
export function calculateLeadScore(
  interactionType: string, 
  buttonAction: string, 
  isRepeatVisitor: boolean = false
): number {
  let baseScore = 5;
  
  // Score based on interaction type
  switch (interactionType) {
    case 'click': baseScore = 15; break;
    case 'view': baseScore = 5; break;
    case 'download': baseScore = 25; break;
    default: baseScore = 5;
  }
  
  // Bonus for button action type
  switch (buttonAction) {
    case 'call': baseScore += 20; break;
    case 'email': baseScore += 15; break;
    case 'download': baseScore += 10; break;
    case 'link': baseScore += 5; break;
    default: baseScore += 0;
  }
  
  // Bonus for repeat visitors
  if (isRepeatVisitor) {
    baseScore = Math.floor(baseScore * 1.5);
  }
  
  return Math.min(baseScore, 100); // Cap at 100
}

// Determine lead priority based on behavior
export function calculateLeadPriority(
  totalScore: number, 
  totalInteractions: number, 
  sessionDuration: number = 0
): 'low' | 'medium' | 'high' | 'hot' {
  if (totalScore >= 80 && totalInteractions >= 3) return 'hot';
  if (totalScore >= 60 && totalInteractions >= 2) return 'high';
  if (totalScore >= 30 || totalInteractions >= 2) return 'medium';
  return 'low';
}

// Track button interaction
export async function trackButtonInteraction(data: {
  cardId: string;
  userId: string;
  elementId: string;
  interactionType: string;
  buttonLabel: string;
  buttonAction: string;
  targetValue?: string;
  req: Request;
}) {
  try {
    const visitorFingerprint = generateVisitorFingerprint(data.req);
    const userAgent = data.req.headers['user-agent'] || '';
    const device = getDeviceType(userAgent);
    const location = getVisitorLocation(data.req);
    const sessionId = data.req.sessionID || `session_${Date.now()}`;
    
    // Check if this is a repeat visitor
    const existingProfile = await db
      .select({
        id: leadProfiles.id,
        cardId: leadProfiles.cardId,
        cardOwnerId: leadProfiles.cardOwnerId,
        visitorFingerprint: leadProfiles.visitorFingerprint,
        email: leadProfiles.email,
        leadScore: leadProfiles.leadScore,
        totalInteractions: leadProfiles.totalInteractions
      })
      .from(leadProfiles)
      .where(
        and(
          eq(leadProfiles.visitorFingerprint, visitorFingerprint),
          eq(leadProfiles.cardId, data.cardId)
        )
      )
      .limit(1);
    
    const isRepeatVisitor = existingProfile.length > 0;
    const leadScore = calculateLeadScore(
      data.interactionType, 
      data.buttonAction, 
      isRepeatVisitor
    );
    
    // Create interaction record
    const interactionData: InsertButtonInteraction = {
      cardId: data.cardId,
      userId: data.userId,
      elementId: data.elementId,
      interactionType: data.interactionType,
      buttonLabel: data.buttonLabel,
      buttonAction: data.buttonAction,
      targetValue: data.targetValue,
      visitorIp: data.req.ip || 'unknown',
      visitorUserAgent: userAgent,
      visitorLocation: location,
      visitorDevice: device,
      referrer: data.req.headers.referer,
      sessionId,
      leadScore,
      leadPriority: 'medium', // Will be updated after profile calculation
      automationsTriggered: [],
      crmSynced: false
    };
    
    const [interaction] = await db
      .insert(buttonInteractions)
      .values(interactionData)
      .returning();
    
    // Update or create lead profile
    await updateLeadProfile({
      visitorFingerprint,
      cardId: data.cardId,
      cardOwnerId: data.userId,
      location,
      device,
      newInteractionScore: leadScore
    });
    
    return {
      success: true,
      interaction,
      isRepeatVisitor,
      leadScore
    };
    
  } catch (error: any) {
    console.error('Button interaction tracking error:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  }
}

// Update lead profile with new interaction data
async function updateLeadProfile(data: {
  visitorFingerprint: string;
  cardId: string;
  cardOwnerId: string;
  location: any;
  device: string;
  newInteractionScore: number;
}) {
  try {
    const existing = await db
      .select()
      .from(leadProfiles)
      .where(
        and(
          eq(leadProfiles.visitorFingerprint, data.visitorFingerprint),
          eq(leadProfiles.cardId, data.cardId)
        )
      )
      .limit(1);
    
    if (existing.length > 0) {
      // Update existing profile
      const profile = existing[0];
      const newTotalInteractions = (profile.totalInteractions || 0) + 1;
      const newLeadScore = Math.min((profile.leadScore || 0) + data.newInteractionScore, 1000);
      const newPriority = calculateLeadPriority(
        newLeadScore, 
        newTotalInteractions, 
        profile.lastSessionDuration || 0
      );
      
      await db
        .update(leadProfiles)
        .set({
          totalInteractions: newTotalInteractions,
          leadScore: newLeadScore,
          leadPriority: newPriority,
          location: data.location,
          devicePreference: data.device,
          lastSeenAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(leadProfiles.id, profile.id));
        
    } else {
      // Create new profile
      const priority = calculateLeadPriority(data.newInteractionScore, 1, 0);
      
      const profileData: InsertLeadProfile = {
        visitorFingerprint: data.visitorFingerprint,
        cardId: data.cardId,
        cardOwnerId: data.cardOwnerId,
        totalInteractions: 1,
        totalSessions: 1,
        leadScore: data.newInteractionScore,
        leadPriority: priority,
        engagementLevel: 'cold',
        location: data.location,
        devicePreference: data.device,
        behaviorTags: ['new_visitor']
      };
      
      await db.insert(leadProfiles).values(profileData);
    }
    
  } catch (error) {
    console.error('Lead profile update error:', error);
  }
}

// Get automation config for user
export async function getUserAutomationConfig(userId: string) {
  try {
    const configs = await db
      .select()
      .from(automationConfigs)
      .where(eq(automationConfigs.userId, userId))
      .limit(1);
    
    return configs[0] || null;
  } catch (error) {
    console.error('Get automation config error:', error);
    return null;
  }
}

// Get recent interactions for a card
export async function getCardInteractions(cardId: string, limit: number = 50) {
  try {
    const interactions = await db
      .select()
      .from(buttonInteractions)
      .where(eq(buttonInteractions.cardId, cardId))
      .orderBy(desc(buttonInteractions.createdAt))
      .limit(limit);
    
    return interactions;
  } catch (error) {
    console.error('Get card interactions error:', error);
    return [];
  }
}

// Extract contact information from business card interaction
export async function extractContactFromInteraction(data: {
  cardId: string;
  buttonAction: string;
  targetValue?: string;
  visitorFingerprint: string;
  location: any;
  device: string;
  leadScore: number;
}) {
  try {
    // Get business card information for context
    const card = await db
      .select()
      .from(businessCards)
      .where(eq(businessCards.id, data.cardId))
      .limit(1);
    
    if (card.length === 0) {
      return null;
    }
    
    const businessCard = card[0];
    
    // Extract contact data based on button action
    const contactData: Partial<InsertCrmContact> = {
      ownerUserId: businessCard.userId!,
      source: 'business_card',
      leadScore: data.leadScore,
      leadPriority: calculateLeadPriority(data.leadScore, 1, 0) as 'low' | 'medium' | 'high' | 'hot',
      lifecycleStage: 'visitor',
      tags: [
        `card:${businessCard.fullName}`,
        `device:${data.device}`,
        `action:${data.buttonAction}`
      ],
      location: data.location,
      notes: `Device: ${data.device}, Interaction: ${data.buttonAction}, UserAgent will be updated later`
    };
    
    // Extract specific contact info based on button action
    switch (data.buttonAction) {
      case 'email':
        if (data.targetValue && data.targetValue.includes('@')) {
          contactData.email = data.targetValue;
          // Higher lead score for email interactions
          contactData.leadScore = Math.min((contactData.leadScore || 0) + 10, 100);
          contactData.lifecycleStage = 'lead'; // Email interaction suggests more interest
        }
        break;
        
      case 'call':
        if (data.targetValue) {
          contactData.phone = data.targetValue;
          // Very high lead score for call attempts
          contactData.leadScore = Math.min((contactData.leadScore || 0) + 20, 100);
          contactData.lifecycleStage = 'lead';
        }
        break;
        
      case 'link':
        if (data.targetValue) {
          contactData.website = data.targetValue;
          contactData.notes = `Visited website: ${data.targetValue}`;
        }
        break;
        
      case 'whatsapp':
        if (data.targetValue) {
          contactData.phone = data.targetValue;
          contactData.leadScore = Math.min((contactData.leadScore || 0) + 15, 100);
          contactData.lifecycleStage = 'lead';
        }
        break;
    }
    
    // Add business card owner's company context
    if (businessCard.company) {
      contactData.company = `Interested in ${businessCard.company}`;
    }
    
    // Generate a lead name based on available data or use placeholder
    if (!contactData.firstName && !contactData.lastName) {
      contactData.firstName = 'Lead';
      contactData.lastName = `from ${businessCard.fullName}`;
    }
    
    return {
      contactData,
      businessCard
    };
    
  } catch (error) {
    console.error('Extract contact from interaction error:', error);
    return null;
  }
}

// Find existing CRM contact by various identifiers
export async function findExistingCrmContact(
  ownerUserId: string,
  identifiers: {
    email?: string;
    phone?: string;
    visitorFingerprint?: string;
  }
) {
  try {
    // Search by email first (highest priority)
    if (identifiers.email) {
      const existingContact = await db
        .select()
        .from(crmContacts)
        .where(
          and(
            eq(crmContacts.ownerUserId, ownerUserId),
            eq(crmContacts.email, identifiers.email)
          )
        )
        .limit(1);
      
      if (existingContact.length > 0) {
        return existingContact[0];
      }
    }
    
    // Search by phone if no email match found
    if (identifiers.phone) {
      const existingContact = await db
        .select()
        .from(crmContacts)
        .where(
          and(
            eq(crmContacts.ownerUserId, ownerUserId),
            eq(crmContacts.phone, identifiers.phone)
          )
        )
        .limit(1);
        
      if (existingContact.length > 0) {
        return existingContact[0];
      }
    }
    
    return null;
    
  } catch (error) {
    console.error('Find existing CRM contact error:', error);
    return null;
  }
}

// Create or update CRM contact from business card interaction
export async function createOrUpdateCrmContact(data: {
  cardId: string;
  userId: string;
  buttonAction: string;
  targetValue?: string;
  visitorFingerprint: string;
  location: any;
  device: string;
  leadScore: number;
  userAgent: string;
}) {
  try {
    // Extract contact information
    const extracted = await extractContactFromInteraction({
      cardId: data.cardId,
      buttonAction: data.buttonAction,
      targetValue: data.targetValue,
      visitorFingerprint: data.visitorFingerprint,
      location: data.location,
      device: data.device,
      leadScore: data.leadScore
    });
    
    if (!extracted) {
      return { success: false, error: 'Could not extract contact data' };
    }
    
    const { contactData, businessCard } = extracted;
    
    // Add user agent to notes
    if (contactData.notes) {
      contactData.notes = contactData.notes.replace('UserAgent will be updated later', `UserAgent: ${data.userAgent}`);
    }
    
    // Try to find existing contact
    const existingContact = await findExistingCrmContact(
      data.userId,
      {
        email: contactData.email || undefined,
        phone: contactData.phone || undefined,
        visitorFingerprint: data.visitorFingerprint
      }
    );
    
    let contactId: string;
    let isNewContact = false;
    
    if (existingContact) {
      // Update existing contact
      const updatedLeadScore = Math.min(
        (existingContact.leadScore || 0) + (contactData.leadScore || 0),
        1000
      );
      
      const updatedPriority = calculateLeadPriority(
        updatedLeadScore,
        1, // No totalInteractions field, use 1
        0
      ) as 'low' | 'medium' | 'high' | 'hot';
      
      // Update notes with new interaction info
      const interactionInfo = `\n${new Date().toISOString()}: ${data.buttonAction} interaction (score: ${data.leadScore})`;
      const updatedNotes = (existingContact.notes || '') + interactionInfo;
      
      // Merge tags
      const existingTags = (existingContact.tags as string[]) || [];
      const contactTags = Array.isArray(contactData.tags) ? contactData.tags : [];
      const newTags = Array.from(new Set([...existingTags, ...contactTags]));
      
      await db
        .update(crmContacts)
        .set({
          leadScore: updatedLeadScore,
          leadPriority: updatedPriority,
          tags: newTags,
          notes: updatedNotes,
          // Update lifecycle stage if it's progressing
          lifecycleStage: contactData.lifecycleStage === 'lead' && 
                         existingContact.lifecycleStage === 'visitor' 
                         ? 'lead' : existingContact.lifecycleStage,
          updatedAt: new Date()
        })
        .where(eq(crmContacts.id, existingContact.id));
      
      contactId = existingContact.id;
      
    } else {
      // Create new contact
      isNewContact = true;
      // No need to track in custom fields - use existing schema fields
      
      const [newContact] = await db
        .insert(crmContacts)
        .values(contactData as InsertCrmContact)
        .returning();
      
      contactId = newContact.id;
    }
    
    // Create activity record for this interaction
    const activityData: InsertCrmActivity = {
      contactId,
      type: data.buttonAction === 'call' ? 'call' :
            data.buttonAction === 'email' ? 'email' :
            data.buttonAction === 'link' ? 'page_view' :
            'button_click',
      title: `${data.buttonAction.charAt(0).toUpperCase() + data.buttonAction.slice(1)} interaction`,
      description: `Visitor clicked ${data.buttonAction} button on ${businessCard.fullName}'s business card`,
      payload: {
        cardId: data.cardId,
        buttonAction: data.buttonAction,
        targetValue: data.targetValue,
        device: data.device,
        location: data.location,
        leadScore: data.leadScore
      }
    };
    
    await db.insert(crmActivities).values(activityData);
    
    return {
      success: true,
      contactId,
      isNewContact,
      leadScore: contactData.leadScore
    };
    
  } catch (error: any) {
    console.error('Create/update CRM contact error:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  }
}

// Get lead profiles for a card owner
export async function getCardLeadProfiles(cardOwnerId: string, limit: number = 100) {
  try {
    const profiles = await db
      .select({
        id: leadProfiles.id,
        visitorFingerprint: leadProfiles.visitorFingerprint,
        cardId: leadProfiles.cardId,
        totalInteractions: leadProfiles.totalInteractions,
        leadScore: leadProfiles.leadScore,
        leadPriority: leadProfiles.leadPriority,
        engagementLevel: leadProfiles.engagementLevel,
        location: leadProfiles.location,
        devicePreference: leadProfiles.devicePreference,
        behaviorTags: leadProfiles.behaviorTags,
        lastSeenAt: leadProfiles.lastSeenAt
      })
      .from(leadProfiles)
      .where(eq(leadProfiles.cardOwnerId, cardOwnerId))
      .orderBy(desc(leadProfiles.leadScore))
      .limit(limit);
    
    return profiles;
  } catch (error) {
    console.error('Get lead profiles error:', error);
    return [];
  }
}