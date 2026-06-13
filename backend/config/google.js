const { google } = require('googleapis');
const path = require('path');

/**
 * Creates a Google OAuth2 client for user-facing OAuth flows
 * (e.g., adding events to a student's personal Google Calendar)
 */
const createOAuth2Client = (accessToken = null, refreshToken = null) => {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  if (accessToken || refreshToken) {
    client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  return client;
};

/**
 * Creates a Google Auth client using Service Account credentials.
 * Used for creating Google Calendar events & Google Meet links on behalf
 * of the platform (instructor calendars, Meet link generation).
 */
const createServiceAccountClient = () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'service-account-key.json'),
    scopes: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],
  });

  return auth;
};

/**
 * Generates the Google OAuth2 authorization URL for a student.
 * The student clicks this URL to grant calendar access.
 */
const getAuthUrl = (state = '') => {
  const client = createOAuth2Client();
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
    prompt: 'consent',
    state,
  });
};

/**
 * Exchanges an authorization code for access & refresh tokens.
 */
const getTokensFromCode = async (code) => {
  const client = createOAuth2Client();
  const { tokens } = await client.getToken(code);
  return tokens;
};

module.exports = {
  createOAuth2Client,
  createServiceAccountClient,
  getAuthUrl,
  getTokensFromCode,
};
