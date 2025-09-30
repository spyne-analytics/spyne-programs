import Papa from 'papaparse';

// Google Sheets configuration
const SHEET_ID = '1u5QU1aI2pDJgc5koh8cLoHpYPDwLSuwe0uun9uhPcRM';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=1272770503`; // Programs tab gid

export interface ProgramData {
  id: string;
  goals: string;
  tasks: string;
  team: string;
  priority: string;
  owner: string;
  status: string;
  eta: string;
  completionDate: string;
  links: string;
  notes: string;
}

export class GoogleSheetsService {
  async getProgramsData(): Promise<ProgramData[]> {
    try {
      // Fetch CSV data from Google Sheets
      const response = await fetch(CSV_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
      }
      
      const csvText = await response.text();
      
      // Parse CSV data using PapaParse
      const parseResult = Papa.parse(csvText, {
        skipEmptyLines: true,
      });
      
      const rows = parseResult.data as string[][];
      
      if (!rows || rows.length === 0) {
        console.log('No data found in the sheet');
        return [];
      }

      // Skip the header row (first row) and process data rows
      const dataRows = rows.slice(1);
      
      const programs: ProgramData[] = dataRows
        .filter(row => row.length > 0 && row[0] && row[0].trim() !== '') // Filter out empty rows
        .map((row, index) => {
          // Ensure we have at least the basic required columns
          const goals = row[0] || '';
          const tasks = row[1] || '';
          const team = row[2] || '';
          const priority = row[3] || '';
          const owner = row[4] || '';
          const status = row[5] || '';
          const eta = row[6] || '';
          const completionDate = row[7] || '';
          const links = row[8] || '';
          const notes = row[9] || '';

          return {
            id: `program-${index + 1}`,
            goals,
            tasks,
            team,
            priority,
            owner,
            status,
            eta,
            completionDate,
            links,
            notes,
          };
        });

      return programs;
    } catch (error) {
      console.error('Error fetching data from Google Sheets:', error);
      throw new Error('Failed to fetch programs data from Google Sheets');
    }
  }


  // Get unique values for filters
  async getFilterOptions(): Promise<{
    teams: string[];
    priorities: string[];
    owners: string[];
    statuses: string[];
  }> {
    try {
      const programs = await this.getProgramsData();
      
      const teams = [...new Set(programs.map(p => p.team).filter(Boolean))].sort();
      const priorities = [...new Set(programs.map(p => p.priority).filter(Boolean))].sort();
      const owners = [...new Set(programs.map(p => p.owner).filter(Boolean))].sort();
      const statuses = [...new Set(programs.map(p => p.status).filter(Boolean))].sort();

      return {
        teams,
        priorities,
        owners,
        statuses,
      };
    } catch (error) {
      console.error('Error getting filter options:', error);
      return {
        teams: [],
        priorities: [],
        owners: [],
        statuses: [],
      };
    }
  }
}

// Export a singleton instance
export const googleSheetsService = new GoogleSheetsService();
