export const DEFAULT_EMAIL_TEMPLATES = {
  booking_confirmed: {
    subject: '✓ Appointment Confirmed - {eventTypeName} with {hostName}',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Appointment Confirmed</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: #22c55e; color: white; text-align: center; padding: 40px 20px; }
    .content { padding: 40px 30px; }
    .appointment-card { background: #f1f5f9; border-radius: 12px; padding: 24px; margin: 24px 0; }
    .appointment-details { display: table; width: 100%; }
    .detail-row { display: table-row; }
    .detail-label { display: table-cell; font-weight: 600; color: #475569; padding: 8px 16px 8px 0; width: 120px; }
    .detail-value { display: table-cell; color: #1e293b; padding: 8px 0; }
    .action-buttons { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; padding: 12px 24px; margin: 8px; text-decoration: none; border-radius: 8px; font-weight: 600; }
    .btn-primary { background: #22c55e; color: white; }
    .btn-secondary { background: #e2e8f0; color: #475569; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Appointment Confirmed</h1>
      <p>Your appointment has been successfully scheduled</p>
    </div>
    
    <div class="content">
      <p>Hi {attendeeName},</p>
      <p>Great news! Your appointment with <strong>{hostName}</strong> has been confirmed.</p>
      
      <div class="appointment-card">
        <h3>{eventTypeName}</h3>
        <div class="appointment-details">
          <div class="detail-row">
            <div class="detail-label">Date:</div>
            <div class="detail-value">{appointmentDate}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Time:</div>
            <div class="detail-value">{appointmentTime} ({timezone})</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Duration:</div>
            <div class="detail-value">{appointmentDuration}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Location:</div>
            <div class="detail-value">{location}</div>
          </div>
        </div>
      </div>
      
      <div class="action-buttons">
        <a href="{meetingLink}" class="btn btn-primary">Join Meeting</a>
        <a href="{rescheduleLink}" class="btn btn-secondary">Reschedule</a>
        <a href="{cancelLink}" class="btn btn-secondary">Cancel</a>
      </div>
      
      <p>We'll send you a reminder before your appointment. If you need to make any changes, please use the links above.</p>
      
      <p>Looking forward to meeting with you!</p>
      
      <p>Best regards,<br><strong>{hostName}</strong></p>
    </div>
    
    <div class="footer">
      <p>{companyName} • This email was sent regarding your appointment.</p>
      <p><a href="#">Unsubscribe</a> from appointment notifications</p>
    </div>
  </div>
</body>
</html>
    `
  },

  reminder_24h: {
    subject: '⏰ Reminder: {eventTypeName} appointment tomorrow with {hostName}',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Appointment Reminder - 24 Hours</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; text-align: center; padding: 40px 20px; }
    .content { padding: 40px 30px; }
    .reminder-card { background: #eff6ff; border: 2px solid #3b82f6; border-radius: 12px; padding: 24px; margin: 24px 0; }
    .appointment-details { display: table; width: 100%; }
    .detail-row { display: table-row; }
    .detail-label { display: table-cell; font-weight: 600; color: #475569; padding: 8px 16px 8px 0; width: 120px; }
    .detail-value { display: table-cell; color: #1e293b; padding: 8px 0; }
    .action-buttons { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; padding: 12px 24px; margin: 8px; text-decoration: none; border-radius: 8px; font-weight: 600; }
    .btn-primary { background: #3b82f6; color: white; }
    .btn-secondary { background: #e2e8f0; color: #475569; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Appointment Reminder</h1>
      <p>Your appointment is in 24 hours</p>
    </div>
    
    <div class="content">
      <p>Hi {attendeeName},</p>
      <p>This is a friendly reminder that you have an appointment scheduled with <strong>{hostName}</strong> tomorrow.</p>
      
      <div class="reminder-card">
        <h3>📅 {eventTypeName}</h3>
        <div class="appointment-details">
          <div class="detail-row">
            <div class="detail-label">Date:</div>
            <div class="detail-value">{appointmentDate}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Time:</div>
            <div class="detail-value">{appointmentTime} ({timezone})</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Duration:</div>
            <div class="detail-value">{appointmentDuration}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Location:</div>
            <div class="detail-value">{location}</div>
          </div>
        </div>
      </div>
      
      <div class="action-buttons">
        <a href="{meetingLink}" class="btn btn-primary">Join Meeting</a>
        <a href="{rescheduleLink}" class="btn btn-secondary">Reschedule</a>
        <a href="{cancelLink}" class="btn btn-secondary">Cancel</a>
      </div>
      
      <p>Please make sure you're prepared for the meeting. We'll send you another reminder 1 hour before your appointment.</p>
      
      <p>See you tomorrow!</p>
      
      <p>Best regards,<br><strong>{hostName}</strong></p>
    </div>
    
    <div class="footer">
      <p>{companyName} • This email was sent regarding your upcoming appointment.</p>
      <p><a href="#">Unsubscribe</a> from appointment notifications</p>
    </div>
  </div>
</body>
</html>
    `
  },

  reminder_1h: {
    subject: '🚨 Starting Soon: {eventTypeName} in 1 hour with {hostName}',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Appointment Starting Soon</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; text-align: center; padding: 40px 20px; }
    .content { padding: 40px 30px; }
    .urgent-card { background: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; padding: 24px; margin: 24px 0; }
    .appointment-details { display: table; width: 100%; }
    .detail-row { display: table-row; }
    .detail-label { display: table-cell; font-weight: 600; color: #475569; padding: 8px 16px 8px 0; width: 120px; }
    .detail-value { display: table-cell; color: #1e293b; padding: 8px 0; }
    .action-buttons { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; padding: 12px 24px; margin: 8px; text-decoration: none; border-radius: 8px; font-weight: 600; }
    .btn-primary { background: #f59e0b; color: white; }
    .btn-secondary { background: #e2e8f0; color: #475569; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚨 Starting Soon!</h1>
      <p>Your appointment begins in 1 hour</p>
    </div>
    
    <div class="content">
      <p>Hi {attendeeName},</p>
      <p>Just a quick reminder that your appointment with <strong>{hostName}</strong> starts in <strong>1 hour</strong>.</p>
      
      <div class="urgent-card">
        <h3>🕐 {eventTypeName}</h3>
        <div class="appointment-details">
          <div class="detail-row">
            <div class="detail-label">Time:</div>
            <div class="detail-value"><strong>{appointmentTime} ({timezone})</strong></div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Duration:</div>
            <div class="detail-value">{appointmentDuration}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Location:</div>
            <div class="detail-value">{location}</div>
          </div>
        </div>
      </div>
      
      <div class="action-buttons">
        <a href="{meetingLink}" class="btn btn-primary">Join Meeting Now</a>
      </div>
      
      <p>Please join the meeting on time. If you need to cancel or reschedule, please do so as soon as possible.</p>
      
      <p>See you soon!</p>
      
      <p>Best regards,<br><strong>{hostName}</strong></p>
    </div>
    
    
    <div class="footer">
      <p>{companyName} • This email was sent regarding your appointment starting soon.</p>
    </div>
  </div>
</body>
</html>
    `
  },

  appointment_cancelled: {
    subject: '❌ Appointment Cancelled: {eventTypeName} with {hostName}',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Appointment Cancelled</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; text-align: center; padding: 40px 20px; }
    .content { padding: 40px 30px; }
    .cancellation-card { background: #fef2f2; border: 2px solid #ef4444; border-radius: 12px; padding: 24px; margin: 24px 0; }
    .appointment-details { display: table; width: 100%; }
    .detail-row { display: table-row; }
    .detail-label { display: table-cell; font-weight: 600; color: #475569; padding: 8px 16px 8px 0; width: 120px; }
    .detail-value { display: table-cell; color: #1e293b; padding: 8px 0; text-decoration: line-through; }
    .action-buttons { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; padding: 12px 24px; margin: 8px; text-decoration: none; border-radius: 8px; font-weight: 600; }
    .btn-primary { background: #22c55e; color: white; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>❌ Appointment Cancelled</h1>
      <p>Your appointment has been cancelled</p>
    </div>
    
    <div class="content">
      <p>Hi {attendeeName},</p>
      <p>We wanted to let you know that your appointment with <strong>{hostName}</strong> has been cancelled.</p>
      
      <div class="cancellation-card">
        <h3>Cancelled: {eventTypeName}</h3>
        <div class="appointment-details">
          <div class="detail-row">
            <div class="detail-label">Date:</div>
            <div class="detail-value">{appointmentDate}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Time:</div>
            <div class="detail-value">{appointmentTime} ({timezone})</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Duration:</div>
            <div class="detail-value">{appointmentDuration}</div>
          </div>
        </div>
      </div>
      
      <p>If you'd like to schedule a new appointment, please feel free to book another time that works for you.</p>
      
      <div class="action-buttons">
        <a href="{rescheduleLink}" class="btn btn-primary">Schedule New Appointment</a>
      </div>
      
      <p>We apologize for any inconvenience this may have caused.</p>
      
      <p>Best regards,<br><strong>{hostName}</strong></p>
    </div>
    
    <div class="footer">
      <p>{companyName} • This email was sent regarding your cancelled appointment.</p>
    </div>
  </div>
</body>
</html>
    `
  },

  appointment_rescheduled: {
    subject: '📅 Appointment Rescheduled: {eventTypeName} with {hostName}',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Appointment Rescheduled</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; text-align: center; padding: 40px 20px; }
    .content { padding: 40px 30px; }
    .reschedule-card { background: #f3e8ff; border: 2px solid #8b5cf6; border-radius: 12px; padding: 24px; margin: 24px 0; }
    .appointment-details { display: table; width: 100%; }
    .detail-row { display: table-row; }
    .detail-label { display: table-cell; font-weight: 600; color: #475569; padding: 8px 16px 8px 0; width: 120px; }
    .detail-value { display: table-cell; color: #1e293b; padding: 8px 0; }
    .new-time { color: #8b5cf6; font-weight: 700; }
    .action-buttons { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; padding: 12px 24px; margin: 8px; text-decoration: none; border-radius: 8px; font-weight: 600; }
    .btn-primary { background: #8b5cf6; color: white; }
    .btn-secondary { background: #e2e8f0; color: #475569; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📅 Appointment Rescheduled</h1>
      <p>Your appointment time has been updated</p>
    </div>
    
    <div class="content">
      <p>Hi {attendeeName},</p>
      <p>Your appointment with <strong>{hostName}</strong> has been rescheduled to a new time.</p>
      
      <div class="reschedule-card">
        <h3>Updated: {eventTypeName}</h3>
        <div class="appointment-details">
          <div class="detail-row">
            <div class="detail-label">New Date:</div>
            <div class="detail-value new-time">{appointmentDate}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">New Time:</div>
            <div class="detail-value new-time">{appointmentTime} ({timezone})</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Duration:</div>
            <div class="detail-value">{appointmentDuration}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Location:</div>
            <div class="detail-value">{location}</div>
          </div>
        </div>
      </div>
      
      <div class="action-buttons">
        <a href="{meetingLink}" class="btn btn-primary">Join Meeting</a>
        <a href="{rescheduleLink}" class="btn btn-secondary">Reschedule Again</a>
        <a href="{cancelLink}" class="btn btn-secondary">Cancel</a>
      </div>
      
      <p>Please make note of your updated appointment time. We'll send you reminders before your new appointment.</p>
      
      <p>Looking forward to meeting with you!</p>
      
      <p>Best regards,<br><strong>{hostName}</strong></p>
    </div>
    
    <div class="footer">
      <p>{companyName} • This email was sent regarding your rescheduled appointment.</p>
      <p><a href="#">Unsubscribe</a> from appointment notifications</p>
    </div>
  </div>
</body>
</html>
    `
  },

  follow_up: {
    subject: '💭 Thank you for meeting with {hostName} - Follow up',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Follow Up - Thank You</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #06b6d4, #0891b2); color: white; text-align: center; padding: 40px 20px; }
    .content { padding: 40px 30px; }
    .followup-card { background: #e0f7fa; border-radius: 12px; padding: 24px; margin: 24px 0; }
    .action-buttons { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; padding: 12px 24px; margin: 8px; text-decoration: none; border-radius: 8px; font-weight: 600; }
    .btn-primary { background: #06b6d4; color: white; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💭 Thank You!</h1>
      <p>We appreciate your time today</p>
    </div>
    
    <div class="content">
      <p>Hi {attendeeName},</p>
      <p>Thank you for taking the time to meet with <strong>{hostName}</strong> today. We hope you found our conversation valuable.</p>
      
      <div class="followup-card">
        <h3>📋 Meeting Summary: {eventTypeName}</h3>
        <p><strong>Date:</strong> {appointmentDate}</p>
        <p><strong>Duration:</strong> {appointmentDuration}</p>
        <p>If you have any questions or need to follow up on anything we discussed, please don't hesitate to reach out.</p>
      </div>
      
      <div class="action-buttons">
        <a href="{rescheduleLink}" class="btn btn-primary">Schedule Another Meeting</a>
      </div>
      
      <p>We look forward to continuing our conversation and working with you.</p>
      
      <p>Best regards,<br><strong>{hostName}</strong></p>
    </div>
    
    <div class="footer">
      <p>{companyName} • This follow-up email was sent after your completed appointment.</p>
      <p><a href="#">Unsubscribe</a> from appointment notifications</p>
    </div>
  </div>
</body>
</html>
    `
  }
};

export const EMAIL_TEMPLATE_TYPES = [
  'booking_confirmed',
  'reminder_24h', 
  'reminder_1h',
  'appointment_start',
  'appointment_cancelled',
  'appointment_rescheduled',
  'follow_up'
] as const;

export type EmailTemplateType = typeof EMAIL_TEMPLATE_TYPES[number];
