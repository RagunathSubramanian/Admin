export interface DashboardDataRecord {
  Timestamp: string;
  NAME: string;
  FIN: string;
  DATE: string;
  'Total Drops': number;
  'Multi Drops': number;
  'Heavy Drops': number;
  'Upload Way Sheet Photo': string;
  Shift: string;
  'Walkup Drop Count': number;
  'Double Drop Count': number;
  'Email Address': string;
  DropCount: number;
  Amount: number;
  Month: string;
}

export type DashboardDataModel = DashboardDataRecord[];

