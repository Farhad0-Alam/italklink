import { google } from 'googleapis';

interface FormSubmission {
  [key: string]: string;
}

interface GoogleSheetsConfig {
  spreadsheetId: string;
  sheetName: string;
}

// Initialize Google Sheets API
function getGoogleSheetsClient() {
  if (!process.env.GOOGLE_SHEETS_CREDENTIALS) {
    throw new Error('Google Sheets credentials not configured');
  }

  const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

export async function addToGoogleSheet(
  config: GoogleSheetsConfig,
  data: FormSubmission
): Promise<void> {
  try {
    const sheets = getGoogleSheetsClient();
    const { spreadsheetId, sheetName } = config;

    // Get the current sheet data to determine if we need to add headers
    const existingData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:Z1`,
    });

    const headers = Object.keys(data);
    const values = Object.values(data);

    // If the sheet is empty, add headers first
    if (!existingData.data.values || existingData.data.values.length === 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [['Timestamp', ...headers]],
        },
      });
    }

    // Add the form submission data with timestamp
    const timestamp = new Date().toISOString();
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[timestamp, ...values]],
      },
    });

    console.log('Successfully added data to Google Sheets:', { spreadsheetId, sheetName });
  } catch (error) {
    console.error('Error adding data to Google Sheets:', error);
    throw new Error('Failed to add data to Google Sheets');
  }
}

export function isGoogleSheetsConfigured(): boolean {
  return !!process.env.GOOGLE_SHEETS_CREDENTIALS;
}