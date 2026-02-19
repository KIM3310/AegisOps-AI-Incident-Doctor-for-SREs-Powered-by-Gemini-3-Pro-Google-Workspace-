
import type { SavedIncident, DashboardStats, GoogleSheetInfo } from '../types';
import { googleApiFetch, googleApiJson } from './googleApiClient';

export async function createIncidentDataset(accessToken: string, name: string): Promise<GoogleSheetInfo> {
  const data = await googleApiJson<any>({
    accessToken,
    label: 'Google Sheets create spreadsheet',
    url: 'https://sheets.googleapis.com/v4/spreadsheets',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      properties: { title: name },
      sheets: [{ properties: { title: 'Incidents' } }, { properties: { title: 'Stats' } }],
    }),
  });
  const id = String(data.spreadsheetId || '').trim();
  const title = String(data.properties?.title || name).trim();
  const url = String(data.spreadsheetUrl || '').trim();
  if (!id || !url) {
    throw new Error('Google Sheets API returned incomplete spreadsheet metadata.');
  }
  return { id, name: title, url };
}

async function clearSheetRanges(accessToken: string, spreadsheetId: string, ranges: string[]): Promise<void> {
  // Clear multiple ranges to ensure no ghost data remains
  await googleApiFetch({
    accessToken,
    label: 'Google Sheets batchClear',
    url: `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchClear`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ranges }),
  });
}

export async function exportIncidentsToSheet(accessToken: string, spreadsheetId: string, incidents: SavedIncident[], stats: DashboardStats): Promise<void> {
  // 1. Clear existing data to avoid mixing old and new rows if the dataset shrunk
  try {
    await clearSheetRanges(accessToken, spreadsheetId, ['Incidents!A:Z', 'Stats!A:Z']);
  } catch (e) {
    console.warn("Failed to clear sheet ranges, proceeding with overwrite:", e);
  }

  // 2. Prepare Data
  const rows = [
    ['ID', 'Date', 'Severity', 'Title', 'Summary', 'Root Causes', 'Tags', 'Duration'],
    ...incidents.map((i) => [
      i.id || '',
      i.createdAt ? new Date(i.createdAt).toLocaleString() : '',
      i.report?.severity || 'UNKNOWN',
      i.report?.title || '',
      i.report?.summary || '',
      (i.report?.rootCauses || []).join('; '),
      (i.report?.tags || []).join(', '),
      i.report?.impact?.duration || 'N/A',
    ]),
  ];

  const statsRows = [
    ['Metric', 'Value'],
    ['Total Incidents', stats.totalIncidents || 0],
    ['SEV1', stats.severityDistribution?.SEV1 || 0],
    ['SEV2', stats.severityDistribution?.SEV2 || 0],
    ['SEV3', stats.severityDistribution?.SEV3 || 0],
  ];

  // 3. Write Data
  await googleApiFetch({
    accessToken,
    label: 'Google Sheets batchUpdate',
    url: `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data: [
        { range: 'Incidents!A1', values: rows },
        { range: 'Stats!A1', values: statsRows },
      ],
    }),
  });
}

export async function findExistingDatasets(accessToken: string): Promise<GoogleSheetInfo[]> {
  try {
    const data = await googleApiJson<any>({
      accessToken,
      label: 'Google Drive list spreadsheet files',
      url: `https://www.googleapis.com/drive/v3/files?q=name contains 'AegisOps' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false&fields=files(id,name,webViewLink)`,
    });
    return (data.files || [])
      .map((f: any) => ({
        id: String(f.id || '').trim(),
        name: String(f.name || '').trim(),
        url: String(f.webViewLink || '').trim(),
      }))
      .filter((f: GoogleSheetInfo) => Boolean(f.id && f.name && f.url));
  } catch (e) {
    console.warn("Failed to find existing datasets", e);
    return [];
  }
}

export const SheetsService = { createIncidentDataset, exportIncidentsToSheet, findExistingDatasets };
export default SheetsService;
