interface FormData {
  name: string;
  organizationName: string;
  organizationSize: string;
  email: string;
}

export async function submitToGoogleSheets(data: FormData, accessToken: string) {
  const SHEET_ID = process.env.VITE_GOOGLE_SHEET_ID;
  const SHEET_NAME = 'Leads';
  
  const values = [
    [
      new Date().toISOString(),
      data.name,
      data.organizationName,
      data.organizationSize,
      data.email
    ]
  ];

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to submit to Google Sheets');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting to Google Sheets:', error);
    throw error;
  }
} 