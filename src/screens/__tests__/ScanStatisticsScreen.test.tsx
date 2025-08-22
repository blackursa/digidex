import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { ScanStatisticsScreen } from '../ScanStatisticsScreen';
import { useScanHistory } from '../../hooks/useScanHistory';
import { exportScanHistoryToCSV } from '../../utils/exportUtils';

interface HourData {
  hour: number;
  count: number;
}

const mockLoadHistory = jest.fn();
const mockExportScanHistory = jest.fn().mockResolvedValue('test/path/export.csv');

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

jest.mock('../../hooks/useScanHistory');
jest.mock('../../utils/exportUtils');
jest.mock('victory-native', () => ({
  VictoryChart: 'VictoryChart',
  VictoryAxis: 'VictoryAxis',
  VictoryBar: 'VictoryBar',
  VictoryPie: 'VictoryPie'
}));

describe('ScanStatisticsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useScanHistory as jest.Mock).mockReturnValue({
      loadHistory: mockLoadHistory,
      history: [],
      isLoading: false
    });
    (exportScanHistoryToCSV as jest.Mock).mockImplementation(mockExportScanHistory);
  });

  describe('date range picker', () => {
    it('handles date range changes correctly', async () => {
      const mockHistory = [
        {
          id: '1',
          timestamp: new Date('2025-08-20').getTime(),
          data: { id: 'profile1', type: 'profile' },
          metadata: { timestamp: new Date('2025-08-20').getTime() }
        },
        {
          id: '2',
          timestamp: new Date('2025-08-21').getTime(),
          data: { id: 'profile2', type: 'profile' },
          metadata: { timestamp: new Date('2025-08-21').getTime() }
        },
        {
          id: '3',
          timestamp: new Date('2025-08-22').getTime(),
          data: { id: 'profile3', type: 'profile' },
          metadata: { timestamp: new Date('2025-08-22').getTime() }
        }
      ];

      (useScanHistory as jest.Mock).mockReturnValue({
        loadHistory: mockLoadHistory,
        history: mockHistory,
        isLoading: false
      });

      const { getByTestId } = render(<ScanStatisticsScreen />);

      await waitFor(() => {
        const totalScans = getByTestId('total-scans');
        expect(totalScans.props.children).toBe(3);
      });

      const startDate = new Date('2025-08-20');
      const endDate = new Date('2025-08-21');

      fireEvent(getByTestId('start-date-picker'), 'onDateChange', startDate);
      fireEvent(getByTestId('end-date-picker'), 'onDateChange', endDate);

      await waitFor(() => {
        const totalScans = getByTestId('total-scans');
        expect(totalScans.props.children).toBe(2);

        const hourData = JSON.parse(getByTestId('hour-data').props.data);
        expect(hourData.reduce((sum: number, h: HourData) => sum + h.count, 0)).toBe(2);
      });
    });
  });

  describe('export functionality', () => {
    it('exports scan history as CSV', async () => {
      const mockHistory = [
        {
          id: '1',
          timestamp: new Date('2025-08-20').getTime(),
          data: { id: 'profile1', type: 'profile' },
          metadata: { timestamp: new Date('2025-08-20').getTime() }
        }
      ];

      (useScanHistory as jest.Mock).mockReturnValue({
        loadHistory: mockLoadHistory,
        history: mockHistory,
        isLoading: false
      });

      const { getByTestId } = render(<ScanStatisticsScreen />);

      fireEvent.press(getByTestId('export-button'));

      await waitFor(() => {
        expect(mockExportScanHistory).toHaveBeenCalledWith(
          mockHistory,
          expect.any(Date),
          expect.any(Date)
        );
      });
    });
  });
});
