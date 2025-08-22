import * as FileSystem from 'expo-file-system';
import type { ScanHistoryItem } from '../types/qrcode';

export async function exportScanHistoryToCSV(
  history: ScanHistoryItem[],
  startDate: Date,
  endDate: Date
): Promise<string> {
  const headers = ['Date', 'Time', 'Profile ID', 'Batch ID'];
  const rows = history
    .filter(scan => {
      const scanDate = new Date(scan.metadata.timestamp);
      return scanDate >= startDate && scanDate <= endDate;
    })
    .map(scan => {
      const date = new Date(scan.metadata.timestamp);
      return [
        date.toLocaleDateString(),
        date.toLocaleTimeString(),
        scan.data.id,
        scan.metadata.batchId || '',
      ].join(',');
    });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const fileName = `scan_history_${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}.csv`;
  const filePath = `${FileSystem.documentDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(filePath, csvContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  return filePath;
}
