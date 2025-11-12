import { storage } from '../storage';
import type { VideoMeetingProvider, MeetingLink, Appointment } from '@shared/schema';

export interface ZoomMeetingSettings {
  host_video?: boolean;
  participant_video?: boolean;
  join_before_host?: boolean;
  mute_upon_entry?: boolean;
  watermark?: boolean;
  use_pmi?: boolean;
  approval_type?: 0 | 1 | 2; // 0: Automatically approve, 1: Manually approve, 2: No registration
  audio?: 'both' | 'telephony' | 'voip';
  auto_recording?: 'local' | 'cloud' | 'none';
  enforce_login?: boolean;
  enforce_login_domains?: string;
  alternative_hosts?: string;
  waiting_room?: boolean;
  registrants_email_notification?: boolean;
  meeting_authentication?: boolean;
  encryption_type?: 'enhanced_encryption' | 'e2ee';
  approved_or_denied_countries_or_regions?: {
    enable?: boolean;
    method?: 'approve' | 'deny';
    countries_or_regions?: string[];
  };
  breakout_room?: {
    enable?: boolean;
    rooms?: Array<{
      name: string;
      participants: string[];
    }>;
  };
}

export interface ZoomMeetingData {
  topic: string;
  type: 1 | 2 | 3 | 8; // 1: Instant, 2: Scheduled, 3: Recurring with no fixed time, 8: Recurring with fixed time
  start_time?: string; // For scheduled meetings
  duration?: number; // In minutes
  timezone?: string;
  password?: string;
  agenda?: string;
  settings?: ZoomMeetingSettings;
  recurrence?: {
    type: 1 | 2 | 3; // 1: Daily, 2: Weekly, 3: Monthly
    repeat_interval: number;
    weekly_days?: string; // 1-7 (Sunday = 1)
    monthly_day?: number; // 1-31
    monthly_week?: number; // -1, 1, 2, 3, 4
    monthly_week_day?: number; // 1-7
    end_times?: number;
    end_date_time?: string;
  };
}

export interface ZoomWebhookEvent {
  event: string;
  payload: {
    account_id: string;
    operator: string;
    operator_id: string;
    object: {
      uuid: string;
      id: string;
      host_id: string;
      topic: string;
      type: number;
      start_time: string;
      duration: number;
      timezone: string;
      join_url: string;
      password?: string;
    };
  };
}

export interface ZoomRecording {
  uuid: string;
  id: string;
  account_id: string;
  host_id: string;
  topic: string;
  start_time: string;
  timezone: string;
  duration: number;
  total_size: number;
  recording_count: number;
  share_url: string;
  recording_files: Array<{
    id: string;
    meeting_id: string;
    recording_start: string;
    recording_end: string;
    file_type: string;
    file_size: number;
    play_url: string;
    download_url: string;
    status: string;
    recording_type: string;
  }>;
}

export class ZoomService {
  private async makeZoomAPIRequest(
    provider: VideoMeetingProvider,
    endpoint: string,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
    body?: any
  ): Promise<any> {
    const url = `https://api.zoom.us/v2${endpoint}`;
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${provider.accessToken}`,
      'Content-Type': 'application/json',
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        // Handle token refresh if needed
        if (response.status === 401) {
          await this.refreshAccessToken(provider);
          // Retry with new token
          headers['Authorization'] = `Bearer ${provider.accessToken}`;
          const retryResponse = await fetch(url, { ...options, headers });
          
          if (!retryResponse.ok) {
            throw new Error(`Zoom API error: ${retryResponse.status} ${retryResponse.statusText}`);
          }
          
          return await retryResponse.json();
        }
        
        const errorData = await response.text();
        throw new Error(`Zoom API error: ${response.status} ${response.statusText} - ${errorData}`);
      }

      return await response.json();
    } catch (error) {
      await this.logError(provider, 'api_request', error);
      throw error;
    }
  }

  private async refreshAccessToken(provider: VideoMeetingProvider): Promise<void> {
    if (!provider.refreshToken) {
      throw new Error('No refresh token available for Zoom provider');
    }

    try {
      const response = await fetch('https://zoom.us/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: provider.refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Update provider with new tokens
      await storage.updateVideoProviderTokens(
        provider.id,
        data.access_token,
        data.refresh_token || provider.refreshToken
      );

      // Update local provider object
      provider.accessToken = data.access_token;
      if (data.refresh_token) {
        provider.refreshToken = data.refresh_token;
      }
    } catch (error) {
      await this.logError(provider, 'token_refresh', error);
      throw error;
    }
  }

  /**
   * Get user information from Zoom
   */
  async getUserInfo(provider: VideoMeetingProvider): Promise<any> {
    try {
      const response = await this.makeZoomAPIRequest(provider, '/users/me');
      return response;
    } catch (error) {
      await this.logError(provider, 'get_user_info', error);
      throw new Error(`Failed to get user info: ${error}`);
    }
  }

  /**
   * Create a Zoom meeting
   */
  async createMeeting(
    provider: VideoMeetingProvider,
    meetingData: ZoomMeetingData
  ): Promise<{
    meetingId: string;
    joinUrl: string;
    startUrl: string;
    password?: string;
    meetingData: any;
  }> {
    try {
      // Set default settings if not provided
      const defaultSettings: ZoomMeetingSettings = {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: true,
        watermark: false,
        use_pmi: false,
        approval_type: 0,
        audio: 'both',
        auto_recording: 'none',
        enforce_login: false,
        registrants_email_notification: true,
        waiting_room: true,
        meeting_authentication: false,
        ...meetingData.settings
      };

      const requestData = {
        ...meetingData,
        settings: defaultSettings
      };

      const response = await this.makeZoomAPIRequest(
        provider,
        '/users/me/meetings',
        'POST',
        requestData
      );

      await this.logSuccess(provider, 'create_meeting', {
        meetingId: response.id,
        topic: response.topic
      });

      return {
        meetingId: response.id.toString(),
        joinUrl: response.join_url,
        startUrl: response.start_url,
        password: response.password,
        meetingData: response
      };
    } catch (error) {
      await this.logError(provider, 'create_meeting', error);
      throw new Error(`Failed to create Zoom meeting: ${error}`);
    }
  }

  /**
   * Update a Zoom meeting
   */
  async updateMeeting(
    provider: VideoMeetingProvider,
    meetingId: string,
    updateData: Partial<ZoomMeetingData>
  ): Promise<any> {
    try {
      const response = await this.makeZoomAPIRequest(
        provider,
        `/meetings/${meetingId}`,
        'PATCH',
        updateData
      );

      await this.logSuccess(provider, 'update_meeting', {
        meetingId,
        updates: Object.keys(updateData)
      });

      return response;
    } catch (error) {
      await this.logError(provider, 'update_meeting', error);
      throw new Error(`Failed to update Zoom meeting: ${error}`);
    }
  }

  /**
   * Delete a Zoom meeting
   */
  async deleteMeeting(
    provider: VideoMeetingProvider,
    meetingId: string
  ): Promise<void> {
    try {
      await this.makeZoomAPIRequest(
        provider,
        `/meetings/${meetingId}`,
        'DELETE'
      );

      await this.logSuccess(provider, 'delete_meeting', {
        meetingId
      });
    } catch (error) {
      await this.logError(provider, 'delete_meeting', error);
      throw new Error(`Failed to delete Zoom meeting: ${error}`);
    }
  }

  /**
   * Get meeting details
   */
  async getMeeting(
    provider: VideoMeetingProvider,
    meetingId: string
  ): Promise<any> {
    try {
      const response = await this.makeZoomAPIRequest(
        provider,
        `/meetings/${meetingId}`
      );

      return response;
    } catch (error) {
      await this.logError(provider, 'get_meeting', error);
      throw new Error(`Failed to get Zoom meeting: ${error}`);
    }
  }

  /**
   * Start a meeting recording
   */
  async startRecording(
    provider: VideoMeetingProvider,
    meetingId: string
  ): Promise<void> {
    try {
      await this.makeZoomAPIRequest(
        provider,
        `/meetings/${meetingId}/recordings`,
        'PATCH',
        { action: 'start' }
      );

      await this.logSuccess(provider, 'start_recording', {
        meetingId
      });
    } catch (error) {
      await this.logError(provider, 'start_recording', error);
      throw new Error(`Failed to start recording: ${error}`);
    }
  }

  /**
   * Stop a meeting recording
   */
  async stopRecording(
    provider: VideoMeetingProvider,
    meetingId: string
  ): Promise<void> {
    try {
      await this.makeZoomAPIRequest(
        provider,
        `/meetings/${meetingId}/recordings`,
        'PATCH',
        { action: 'stop' }
      );

      await this.logSuccess(provider, 'stop_recording', {
        meetingId
      });
    } catch (error) {
      await this.logError(provider, 'stop_recording', error);
      throw new Error(`Failed to stop recording: ${error}`);
    }
  }

  /**
   * Get meeting recordings
   */
  async getMeetingRecordings(
    provider: VideoMeetingProvider,
    meetingId: string
  ): Promise<ZoomRecording> {
    try {
      const response = await this.makeZoomAPIRequest(
        provider,
        `/meetings/${meetingId}/recordings`
      );

      return response;
    } catch (error) {
      await this.logError(provider, 'get_recordings', error);
      throw new Error(`Failed to get meeting recordings: ${error}`);
    }
  }

  /**
   * Get list of recordings for a date range
   */
  async getRecordingsList(
    provider: VideoMeetingProvider,
    from: string,
    to: string,
    pageSize: number = 30
  ): Promise<{ meetings: ZoomRecording[]; next_page_token?: string }> {
    try {
      const response = await this.makeZoomAPIRequest(
        provider,
        `/users/me/recordings?from=${from}&to=${to}&page_size=${pageSize}`
      );

      return response;
    } catch (error) {
      await this.logError(provider, 'get_recordings_list', error);
      throw new Error(`Failed to get recordings list: ${error}`);
    }
  }

  /**
   * Create meeting for appointment
   */
  async createMeetingForAppointment(
    provider: VideoMeetingProvider,
    appointment: Appointment,
    settings?: Partial<ZoomMeetingSettings>
  ): Promise<MeetingLink> {
    try {
      const meetingData: ZoomMeetingData = {
        topic: appointment.title || `Meeting with ${appointment.attendeeName}`,
        type: 2, // Scheduled meeting
        start_time: appointment.scheduledAt.toISOString(),
        duration: appointment.duration,
        timezone: 'UTC',
        agenda: appointment.notes || `Meeting scheduled via TalkLink`,
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          waiting_room: true,
          registrants_email_notification: true,
          ...settings
        }
      };

      const result = await this.createMeeting(provider, meetingData);

      // Store meeting link in database
      const meetingLink = await storage.createMeetingLink({
        appointmentId: appointment.id,
        videoMeetingProviderId: provider.id,
        externalMeetingId: result.meetingId,
        joinUrl: result.joinUrl,
        hostUrl: result.startUrl,
        meetingPassword: result.password,
        meetingId: result.meetingId,
        hostEmail: provider.providerEmail,
        settings: meetingData.settings || {},
        meetingStatus: 'created'
      });

      await this.logSuccess(provider, 'create_appointment_meeting', {
        appointmentId: appointment.id,
        meetingId: result.meetingId
      });

      return meetingLink;
    } catch (error) {
      await this.logError(provider, 'create_appointment_meeting', error);
      throw new Error(`Failed to create meeting for appointment: ${error}`);
    }
  }

  /**
   * Update meeting for appointment
   */
  async updateMeetingForAppointment(
    provider: VideoMeetingProvider,
    meetingLink: MeetingLink,
    appointment: Appointment,
    settings?: Partial<ZoomMeetingSettings>
  ): Promise<MeetingLink> {
    try {
      const updateData: Partial<ZoomMeetingData> = {
        topic: appointment.title || `Meeting with ${appointment.attendeeName}`,
        start_time: appointment.scheduledAt.toISOString(),
        duration: appointment.duration,
        agenda: appointment.notes || `Meeting scheduled via TalkLink`,
      };

      if (settings) {
        updateData.settings = { ...meetingLink.settings, ...settings };
      }

      await this.updateMeeting(provider, meetingLink.externalMeetingId, updateData);

      const updatedMeetingLink = await storage.updateMeetingLink(meetingLink.id, {
        settings: updateData.settings || meetingLink.settings,
        updatedAt: new Date()
      });

      await this.logSuccess(provider, 'update_appointment_meeting', {
        appointmentId: appointment.id,
        meetingId: meetingLink.externalMeetingId
      });

      return updatedMeetingLink;
    } catch (error) {
      await this.logError(provider, 'update_appointment_meeting', error);
      throw new Error(`Failed to update meeting for appointment: ${error}`);
    }
  }

  /**
   * Cancel meeting for appointment
   */
  async cancelMeetingForAppointment(
    provider: VideoMeetingProvider,
    meetingLink: MeetingLink
  ): Promise<void> {
    try {
      await this.deleteMeeting(provider, meetingLink.externalMeetingId);
      await storage.deleteMeetingLink(meetingLink.id);

      await this.logSuccess(provider, 'cancel_appointment_meeting', {
        meetingId: meetingLink.externalMeetingId
      });
    } catch (error) {
      await this.logError(provider, 'cancel_appointment_meeting', error);
      throw new Error(`Failed to cancel meeting for appointment: ${error}`);
    }
  }

  /**
   * Process Zoom webhook events
   */
  async processWebhookEvent(webhookEvent: ZoomWebhookEvent): Promise<void> {
    try {
      const { event, payload } = webhookEvent;
      const meetingId = payload.object.id.toString();

      // Find corresponding meeting link in our database
      const meetingLink = await storage.getMeetingLink(meetingId);
      if (!meetingLink) {
        console.log(`No meeting link found for Zoom meeting ${meetingId}`);
        return;
      }

      switch (event) {
        case 'meeting.started':
          await storage.updateMeetingLink(meetingLink.id, {
            meetingStatus: 'started',
            actualStartTime: new Date(payload.object.start_time)
          });
          break;

        case 'meeting.ended':
          await storage.updateMeetingLink(meetingLink.id, {
            meetingStatus: 'ended',
            actualEndTime: new Date()
          });
          break;

        case 'recording.completed':
          // Recording is ready, update meeting link with recording info
          const provider = await storage.getVideoMeetingProvider(meetingLink.videoMeetingProviderId);
          if (provider) {
            try {
              const recordings = await this.getMeetingRecordings(provider, meetingId);
              await storage.updateMeetingLink(meetingLink.id, {
                settings: {
                  ...meetingLink.settings,
                  recordingUrl: recordings.share_url,
                  recordingFiles: recordings.recording_files
                }
              });
            } catch (error) {
              console.error('Failed to get recording details:', error);
            }
          }
          break;

        default:
          console.log(`Unhandled Zoom webhook event: ${event}`);
      }

      console.log(`Processed Zoom webhook event: ${event} for meeting ${meetingId}`);
    } catch (error) {
      console.error('Error processing Zoom webhook:', error);
      throw error;
    }
  }

  /**
   * Validate Zoom provider connection
   */
  async validateConnection(provider: VideoMeetingProvider): Promise<boolean> {
    try {
      await this.getUserInfo(provider);
      
      // Update provider status to connected
      await storage.updateVideoMeetingProvider(provider.id, {
        status: 'connected',
        lastSyncAt: new Date()
      });

      return true;
    } catch (error) {
      // Update provider status to error
      await storage.updateVideoMeetingProvider(provider.id, {
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });

      await this.logError(provider, 'validate_connection', error);
      return false;
    }
  }

  /**
   * Get meeting participants
   */
  async getMeetingParticipants(
    provider: VideoMeetingProvider,
    meetingUuid: string
  ): Promise<any[]> {
    try {
      const response = await this.makeZoomAPIRequest(
        provider,
        `/report/meetings/${meetingUuid}/participants`
      );

      return response.participants || [];
    } catch (error) {
      await this.logError(provider, 'get_participants', error);
      throw new Error(`Failed to get meeting participants: ${error}`);
    }
  }

  /**
   * Get meeting poll results
   */
  async getMeetingPolls(
    provider: VideoMeetingProvider,
    meetingId: string
  ): Promise<any[]> {
    try {
      const response = await this.makeZoomAPIRequest(
        provider,
        `/meetings/${meetingId}/polls`
      );

      return response.polls || [];
    } catch (error) {
      await this.logError(provider, 'get_polls', error);
      throw new Error(`Failed to get meeting polls: ${error}`);
    }
  }

  /**
   * Log successful operation
   */
  private async logSuccess(
    provider: VideoMeetingProvider,
    operation: string,
    details: any
  ): Promise<void> {
    try {
      await storage.createIntegrationLog({
        userId: provider.userId,
        integrationType: 'video_meeting',
        provider: 'zoom',
        operation,
        status: 'success',
        connectionId: provider.id,
        details
      });
    } catch (error) {
      console.error('Failed to log success:', error);
    }
  }

  /**
   * Log error operation
   */
  private async logError(
    provider: VideoMeetingProvider,
    operation: string,
    error: any
  ): Promise<void> {
    try {
      await storage.createIntegrationLog({
        userId: provider.userId,
        integrationType: 'video_meeting',
        provider: 'zoom',
        operation,
        status: 'error',
        connectionId: provider.id,
        details: {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        }
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }
}

// Export singleton instance
export const zoomService = new ZoomService();