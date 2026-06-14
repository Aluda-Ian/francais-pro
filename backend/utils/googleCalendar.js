const { google } = require('googleapis');
const { createServiceAccountClient, createOAuth2Client } = require('../config/google');

/**
 * Creates a Google Calendar event with a Google Meet conference link.
 * Uses the Service Account to act on behalf of the platform/instructor.
 *
 * @param {Object} params
 * @param {string} params.title - Event title
 * @param {string} params.description - Event description
 * @param {Date}   params.startTime - Start time (UTC Date object)
 * @param {Date}   params.endTime - End time (UTC Date object)
 * @param {string[]} params.attendeeEmails - List of attendee email addresses
 * @param {string} [params.calendarId='primary'] - Google Calendar ID
 * @returns {Promise<{ eventId: string, meetLink: string, htmlLink: string }>}
 */
const createMeetSession = async ({
  title,
  description,
  startTime,
  endTime,
  attendeeEmails = [],
  calendarId = 'primary',
}) => {
  try {
    const auth = createServiceAccountClient();
    const calendar = google.calendar({ version: 'v3', auth });

    const event = {
      summary: `🇫🇷 Français Pro | ${title}`,
      description: `${description}\n\nThis is a live French class on Français Pro. Please join using the Google Meet link at the scheduled time.`,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'UTC',
      },
      attendees: attendeeEmails.map((email) => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: `francais-pro-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 30 },
          { method: 'popup', minutes: 30 },
        ],
      },
      colorId: '11', // Tomato red (French flag accent)
    };

    const response = await calendar.events.insert({
      calendarId,
      conferenceDataVersion: 1,
      sendUpdates: 'all',
      resource: event,
    });

    const createdEvent = response.data;
    const meetLink = createdEvent.conferenceData?.entryPoints?.find(
      (ep) => ep.entryPointType === 'video'
    )?.uri || '';

    return {
      eventId: createdEvent.id,
      meetLink,
      htmlLink: createdEvent.htmlLink,
    };
  } catch (error) {
    console.error('[GoogleCalendar] createMeetSession error:', error.message);
    throw new Error(`Failed to create Google Meet session: ${error.message}`);
  }
};

/**
 * Adds a calendar event to a student's personal Google Calendar.
 * Uses the student's OAuth access token.
 *
 * @param {Object} params
 * @param {string} params.studentAccessToken - Student's Google OAuth access token
 * @param {string} params.studentRefreshToken - Student's refresh token
 * @param {string} params.title - Event title
 * @param {string} params.description - Event description
 * @param {Date}   params.startTime - Start time
 * @param {Date}   params.endTime - End time
 * @param {string} params.meetLink - Google Meet link
 * @returns {Promise<string>} Student's calendar event ID
 */
const addToStudentCalendar = async ({
  studentAccessToken,
  studentRefreshToken,
  title,
  description,
  startTime,
  endTime,
  meetLink,
}) => {
  try {
    const auth = createOAuth2Client(studentAccessToken, studentRefreshToken);
    const calendar = google.calendar({ version: 'v3', auth });

    const event = {
      summary: `🇫🇷 ${title}`,
      description: `${description}\n\n📹 Join Google Meet: ${meetLink}`,
      start: { dateTime: startTime.toISOString(), timeZone: 'UTC' },
      end: { dateTime: endTime.toISOString(), timeZone: 'UTC' },
      location: meetLink,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 30 },
          { method: 'popup', minutes: 30 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });

    return response.data.id;
  } catch (error) {
    console.error('[GoogleCalendar] addToStudentCalendar error:', error.message);
    // Non-critical: don't fail the booking if student calendar fails
    return null;
  }
};

/**
 * Fetches available time slots from an instructor's Google Calendar.
 * Returns busy periods so the frontend can show free slots.
 *
 * @param {Object} params
 * @param {string} params.instructorCalendarId - Instructor's Google Calendar ID (email)
 * @param {Date}   params.timeMin - Start of range to check
 * @param {Date}   params.timeMax - End of range to check
 * @returns {Promise<Array>} Array of busy periods { start, end }
 */
const getInstructorBusySlots = async ({ instructorCalendarId, timeMin, timeMax }) => {
  try {
    const auth = createServiceAccountClient();
    const calendar = google.calendar({ version: 'v3', auth });

    const response = await calendar.freebusy.query({
      resource: {
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        items: [{ id: instructorCalendarId }],
      },
    });

    return response.data.calendars[instructorCalendarId]?.busy || [];
  } catch (error) {
    console.error('[GoogleCalendar] getInstructorBusySlots error:', error.message);
    return [];
  }
};

/**
 * Cancels a Google Calendar event.
 * @param {string} eventId - Google Calendar event ID
 * @param {string} [calendarId='primary']
 */
const cancelCalendarEvent = async (eventId, calendarId = 'primary', accessToken = null, refreshToken = null) => {
  try {
    const auth = accessToken || refreshToken ? createOAuth2Client(accessToken, refreshToken) : createServiceAccountClient();
    const calendar = google.calendar({ version: 'v3', auth });

    await calendar.events.delete({ calendarId, eventId, sendUpdates: 'all' });
    return true;
  } catch (error) {
    console.error('[GoogleCalendar] cancelCalendarEvent error:', error.message);
    return false;
  }
};

/**
 * Updates an existing calendar event (e.g., rescheduling).
 */
const updateCalendarEvent = async ({ eventId, calendarId = 'primary', updates }) => {
  try {
    const auth = createServiceAccountClient();
    const calendar = google.calendar({ version: 'v3', auth });

    const response = await calendar.events.patch({
      calendarId,
      eventId,
      sendUpdates: 'all',
      resource: updates,
    });

    return response.data;
  } catch (error) {
    console.error('[GoogleCalendar] updateCalendarEvent error:', error.message);
    throw new Error(`Failed to update calendar event: ${error.message}`);
  }
};

module.exports = {
  createMeetSession,
  addToStudentCalendar,
  getInstructorBusySlots,
  cancelCalendarEvent,
  updateCalendarEvent,
};
