import passport from 'passport';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import { google } from 'googleapis';
import { storage } from './storage';
import type { Request } from 'express';

// Google Calendar OAuth Strategy
export function setupGoogleCalendarStrategy() {
  const googleCalendarStrategy = new OAuth2Strategy({
    authorizationURL: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenURL: 'https://oauth2.googleapis.com/token',
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: '/api/calendar/google/callback',
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ],
    passReqToCallback: true
  }, async (req: Request, accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return done(new Error('User not authenticated'));
      }

      // Get user's Google profile info
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: accessToken });
      
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const { data: userInfo } = await oauth2.userinfo.get();

      // Create calendar connection
      const calendarConnection = await storage.createCalendarConnection({
        userId,
        provider: 'google',
        providerAccountId: userInfo.id || '',
        providerEmail: userInfo.email || '',
        accessToken,
        refreshToken,
        calendarId: 'primary', // Default to primary calendar
        isDefault: true,
        scopes: [
          'https://www.googleapis.com/auth/calendar',
          'https://www.googleapis.com/auth/calendar.events'
        ],
        settings: {
          autoCreateEvents: true,
          syncDirection: 'two_way',
          conflictResolution: 'manual'
        },
        status: 'connected'
      });

      return done(null, calendarConnection);
    } catch (error) {
      console.error('Google Calendar OAuth error:', error);
      return done(error);
    }
  });

  passport.use('google-calendar', googleCalendarStrategy);
}

// Zoom OAuth Strategy
export function setupZoomStrategy() {
  const zoomStrategy = new OAuth2Strategy({
    authorizationURL: 'https://zoom.us/oauth/authorize',
    tokenURL: 'https://zoom.us/oauth/token',
    clientID: process.env.ZOOM_CLIENT_ID!,
    clientSecret: process.env.ZOOM_CLIENT_SECRET!,
    callbackURL: '/api/video/zoom/callback',
    scope: [
      'meeting:write:admin',
      'meeting:read:admin',
      'user:read:admin',
      'recording:read:admin'
    ],
    passReqToCallback: true
  }, async (req: Request, accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return done(new Error('User not authenticated'));
      }

      // Get Zoom user info
      const response = await fetch('https://api.zoom.us/v2/users/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Zoom user info');
      }

      const zoomUser = await response.json();

      // Create video meeting provider connection
      const videoProvider = await storage.createVideoMeetingProvider({
        userId,
        provider: 'zoom',
        providerAccountId: zoomUser.id,
        providerEmail: zoomUser.email,
        accessToken,
        refreshToken,
        isDefault: true,
        scopes: [
          'meeting:write:admin',
          'meeting:read:admin',
          'user:read:admin',
          'recording:read:admin'
        ],
        settings: {
          autoCreateMeetings: true,
          defaultDuration: 60,
          waitingRoom: true,
          requirePassword: true,
          allowRecording: true
        },
        status: 'connected'
      });

      return done(null, videoProvider);
    } catch (error) {
      console.error('Zoom OAuth error:', error);
      return done(error);
    }
  });

  passport.use('zoom', zoomStrategy);
}

// Microsoft OAuth Strategy for Teams/Outlook
export function setupMicrosoftStrategy() {
  const microsoftStrategy = new OAuth2Strategy({
    authorizationURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    clientID: process.env.MICROSOFT_CLIENT_ID!,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
    callbackURL: '/api/calendar/microsoft/callback',
    scope: [
      'https://graph.microsoft.com/calendars.readwrite',
      'https://graph.microsoft.com/onlineMeetings.readwrite',
      'https://graph.microsoft.com/user.read'
    ],
    passReqToCallback: true
  }, async (req: Request, accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return done(new Error('User not authenticated'));
      }

      // Get Microsoft user info
      const response = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Microsoft user info');
      }

      const msUser = await response.json();

      // Create calendar connection for Outlook
      const calendarConnection = await storage.createCalendarConnection({
        userId,
        provider: 'outlook',
        providerAccountId: msUser.id,
        providerEmail: msUser.mail || msUser.userPrincipalName,
        accessToken,
        refreshToken,
        calendarId: 'primary',
        isDefault: false,
        scopes: [
          'https://graph.microsoft.com/calendars.readwrite',
          'https://graph.microsoft.com/user.read'
        ],
        settings: {
          autoCreateEvents: true,
          syncDirection: 'two_way',
          conflictResolution: 'manual'
        },
        status: 'connected'
      });

      // Also create video meeting provider for Teams
      const videoProvider = await storage.createVideoMeetingProvider({
        userId,
        provider: 'microsoft_teams',
        providerAccountId: msUser.id,
        providerEmail: msUser.mail || msUser.userPrincipalName,
        accessToken,
        refreshToken,
        isDefault: false,
        scopes: [
          'https://graph.microsoft.com/onlineMeetings.readwrite'
        ],
        settings: {
          autoCreateMeetings: true,
          defaultDuration: 60,
          allowRecording: true,
          lobbyBypassSettings: 'organization'
        },
        status: 'connected'
      });

      return done(null, { calendarConnection, videoProvider });
    } catch (error) {
      console.error('Microsoft OAuth error:', error);
      return done(error);
    }
  });

  passport.use('microsoft', microsoftStrategy);
}

// Initialize all OAuth strategies
export function setupOAuthStrategies() {
  // Google Calendar OAuth setup (required for basic calendar integration)
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    try {
      setupGoogleCalendarStrategy();
      console.log('✅ Google Calendar OAuth strategy registered');
    } catch (error) {
      console.error('❌ Failed to setup Google Calendar OAuth strategy:', error);
    }
  } else {
    console.warn('⚠️  Google Calendar OAuth not configured - set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET');
  }
  
  // Zoom OAuth setup (optional)
  if (process.env.ZOOM_CLIENT_ID && process.env.ZOOM_CLIENT_SECRET) {
    try {
      setupZoomStrategy();
      console.log('✅ Zoom OAuth strategy registered');
    } catch (error) {
      console.error('❌ Failed to setup Zoom OAuth strategy:', error);
    }
  } else {
    console.log('ℹ️  Zoom integration not configured (optional)');
  }
  
  // Microsoft OAuth setup (optional)
  if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
    try {
      setupMicrosoftStrategy();
      console.log('✅ Microsoft OAuth strategy registered');
    } catch (error) {
      console.error('❌ Failed to setup Microsoft OAuth strategy:', error);
    }
  } else {
    console.log('ℹ️  Microsoft integration not configured (optional)');
  }
}