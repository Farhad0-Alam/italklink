import express from 'express';
import { z } from 'zod';
import { db } from './db';
import { voiceAgents, voiceCalls, businessCards } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import {
  initializeCall,
  getVoiceAgent,
  getVoiceAgentByCardId,
  generateAIResponse,
  generateTwiMLResponse,
  updateCallStatus,
  analyzeCallForQualification,
  syncCallToCRM,
  transcribeAudio,
  makeOutboundCall,
  type ConversationMessage
} from './voice-agent';
import { requireAuth } from './auth';
import { insertVoiceAgentSchema } from '@shared/schema';

const router = express.Router();

// In-memory conversation storage (in production, use Redis or database)
const conversations = new Map<string, ConversationMessage[]>();

// ===== TWILIO WEBHOOKS =====

// Handle incoming calls
router.post('/webhook/inbound', async (req, res) => {
  try {
    const { CallSid, From, To, Called } = req.body;
    
    console.log('Incoming call:', { CallSid, From, To });

    // Find voice agent by phone number
    const [agent] = await db
      .select()
      .from(voiceAgents)
      .where(and(
        eq(voiceAgents.phoneNumber, Called || To),
        eq(voiceAgents.isActive, true)
      ));

    if (!agent) {
      const VoiceResponse = require('twilio').twiml.VoiceResponse;
      const response = new VoiceResponse();
      response.say('This number is not configured. Please contact support.');
      response.hangup();
      return res.type('text/xml').send(response.toString());
    }

    // Initialize call
    await initializeCall({
      callSid: CallSid,
      from: From,
      to: To,
      voiceAgentId: agent.id,
      cardId: agent.cardId,
      userId: agent.userId,
    }, 'inbound');

    // Initialize conversation
    conversations.set(CallSid, []);

    // Generate greeting
    const greeting = agent.greeting || `Hello! You've reached ${agent.agentName}. How can I help you today?`;
    
    const twiml = generateTwiMLResponse(greeting, true);
    res.type('text/xml').send(twiml);
  } catch (error) {
    console.error('Error handling inbound call:', error);
    const VoiceResponse = require('twilio').twiml.VoiceResponse;
    const response = new VoiceResponse();
    response.say('We apologize, but we are experiencing technical difficulties.');
    response.hangup();
    res.type('text/xml').send(response.toString());
  }
});

// Process speech input
router.post('/webhook/process-speech', async (req, res) => {
  try {
    const { CallSid, SpeechResult, RecordingUrl } = req.body;
    
    console.log('Processing speech:', { CallSid, SpeechResult });

    if (!SpeechResult && !RecordingUrl) {
      const twiml = generateTwiMLResponse('I didn\'t catch that. Could you please repeat?', true);
      return res.type('text/xml').send(twiml);
    }

    // Get call details
    const [call] = await db
      .select()
      .from(voiceCalls)
      .where(eq(voiceCalls.callSid, CallSid));

    if (!call) {
      throw new Error('Call not found');
    }

    // Get voice agent
    const agent = await getVoiceAgent(call.voiceAgentId);
    if (!agent) {
      throw new Error('Voice agent not found');
    }

    // Update call status to in_progress
    await updateCallStatus(CallSid, { status: 'in_progress' });

    // Get conversation history
    const history = conversations.get(CallSid) || [];
    
    // Add user message to history
    const userMessage = SpeechResult || 'Voice input received';
    history.push({ role: 'user', content: userMessage });

    // Generate AI response
    const aiResponse = await generateAIResponse(userMessage, agent, history);
    
    // Add assistant message to history
    history.push({ role: 'assistant', content: aiResponse });
    conversations.set(CallSid, history);

    // Check if this is a booking or qualification request
    let shouldEndCall = false;
    if (agent.enableAppointmentBooking && aiResponse.toLowerCase().includes('appointment')) {
      // Handle appointment booking
      aiResponse += ' Let me help you schedule that.';
    }

    // Generate TwiML response
    const twiml = generateTwiMLResponse(aiResponse, !shouldEndCall);
    res.type('text/xml').send(twiml);
  } catch (error) {
    console.error('Error processing speech:', error);
    const twiml = generateTwiMLResponse('I apologize, I encountered an error. Let me transfer you.', false);
    res.type('text/xml').send(twiml);
  }
});

// Handle call status updates
router.post('/webhook/status', async (req, res) => {
  try {
    const { CallSid, CallStatus, CallDuration, RecordingUrl } = req.body;
    
    console.log('Call status update:', { CallSid, CallStatus, CallDuration });

    const updates: any = {
      status: CallStatus === 'completed' ? 'completed' : CallStatus,
    };

    if (CallStatus === 'completed') {
      updates.endedAt = new Date();
      updates.duration = parseInt(CallDuration) || 0;
      updates.recordingUrl = RecordingUrl;

      // Get conversation transcript
      const history = conversations.get(CallSid) || [];
      const transcript = history
        .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
        .join('\n\n');
      
      updates.transcript = transcript;

      // Clean up conversation from memory
      conversations.delete(CallSid);

      // Get call details for analysis
      const [call] = await db
        .select()
        .from(voiceCalls)
        .where(eq(voiceCalls.callSid, CallSid));

      if (call) {
        const agent = await getVoiceAgent(call.voiceAgentId);
        
        if (agent && transcript) {
          // Analyze call for qualification
          if (agent.enableLeadQualification) {
            const qualification = await analyzeCallForQualification(transcript, agent);
            updates.leadScore = qualification.score;
            updates.qualificationData = qualification.data;
            updates.outcome = qualification.outcome;
          }

          // Sync to CRM
          if (agent.enableCrmSync) {
            const crmContactId = await syncCallToCRM(
              { ...call, ...updates },
              updates.qualificationData
            );
            if (crmContactId) {
              updates.crmContactId = crmContactId;
            }
          }
        }
      }
    }

    await updateCallStatus(CallSid, updates);
    
    res.sendStatus(200);
  } catch (error) {
    console.error('Error updating call status:', error);
    res.sendStatus(500);
  }
});

// Handle outbound call
router.post('/webhook/outbound-handler', async (req, res) => {
  try {
    const { CallSid } = req.body;
    
    const [call] = await db
      .select()
      .from(voiceCalls)
      .where(eq(voiceCalls.callSid, CallSid));

    if (!call) {
      throw new Error('Call not found');
    }

    const agent = await getVoiceAgent(call.voiceAgentId);
    if (!agent) {
      throw new Error('Voice agent not found');
    }

    const greeting = agent.greeting || `Hello, this is ${agent.agentName} calling.`;
    const twiml = generateTwiMLResponse(greeting, true);
    
    res.type('text/xml').send(twiml);
  } catch (error) {
    console.error('Error handling outbound call:', error);
    res.sendStatus(500);
  }
});

// ===== API ENDPOINTS (Authenticated) =====

// Get voice agent for card
router.get('/agent/card/:cardId', requireAuth, async (req, res) => {
  try {
    const { cardId } = req.params;
    const userId = (req.user as any).id;

    // Verify card ownership
    const [card] = await db
      .select()
      .from(businessCards)
      .where(and(
        eq(businessCards.id, cardId),
        eq(businessCards.userId, userId)
      ));

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const agent = await getVoiceAgentByCardId(cardId);
    res.json({ success: true, data: agent });
  } catch (error) {
    console.error('Error getting voice agent:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create or update voice agent
router.post('/agent', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const data = insertVoiceAgentSchema.parse(req.body);

    // Verify card ownership
    const [card] = await db
      .select()
      .from(businessCards)
      .where(and(
        eq(businessCards.id, data.cardId),
        eq(businessCards.userId, userId)
      ));

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Check if agent already exists for this card
    const existing = await getVoiceAgentByCardId(data.cardId);

    if (existing) {
      // Update existing agent
      const [updated] = await db
        .update(voiceAgents)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(voiceAgents.id, existing.id))
        .returning();

      res.json({ success: true, data: updated });
    } else {
      // Create new agent
      const [agent] = await db
        .insert(voiceAgents)
        .values({
          ...data,
          userId,
        })
        .returning();

      res.json({ success: true, data: agent });
    }
  } catch (error) {
    console.error('Error creating/updating voice agent:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get call history
router.get('/calls/card/:cardId', requireAuth, async (req, res) => {
  try {
    const { cardId } = req.params;
    const userId = (req.user as any).id;
    const limit = parseInt(req.query.limit as string) || 50;

    const agent = await getVoiceAgentByCardId(cardId);
    if (!agent || agent.userId !== userId) {
      return res.status(404).json({ error: 'Voice agent not found' });
    }

    const calls = await db
      .select()
      .from(voiceCalls)
      .where(eq(voiceCalls.voiceAgentId, agent.id))
      .orderBy(desc(voiceCalls.createdAt))
      .limit(limit);

    res.json({ success: true, data: calls });
  } catch (error) {
    console.error('Error getting calls:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Make outbound call
router.post('/call/outbound', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { voiceAgentId, toNumber, message } = req.body;

    const agent = await getVoiceAgent(voiceAgentId);
    if (!agent || agent.userId !== userId) {
      return res.status(404).json({ error: 'Voice agent not found' });
    }

    const call = await makeOutboundCall(voiceAgentId, toNumber, message);
    
    res.json({ success: true, data: { callSid: call.sid } });
  } catch (error) {
    console.error('Error making outbound call:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
