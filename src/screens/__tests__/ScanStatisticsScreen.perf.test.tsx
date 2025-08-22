import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { ScanStatisticsScreen } from '../ScanStatisticsScreen';
import { useScanHistory } from '../../hooks/useScanHistory';
import { generateTestScanHistory, generatePerformanceTestCases } from '../../utils/testDataGenerator';

jest.mock('../../hooks/useScanHistory');
jest.mock('victory-native', () => ({
  VictoryChart: 'VictoryChart',
  VictoryAxis: 'VictoryAxis',
  VictoryBar: 'VictoryBar',
  VictoryPie: 'VictoryPie'
}));

describe('ScanStatisticsScreen Performance', () => {
  const mockLoadHistory = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const measureRenderTime = async (testCase: {
    name: string;
    count: number;
    options?: Parameters<typeof generateTestScanHistory>[1];
  }) => {
    const mockHistory = generateTestScanHistory(testCase.count, testCase.options);
    (useScanHistory as jest.Mock).mockReturnValue({
      loadHistory: mockLoadHistory,
      history: mockHistory,
      isLoading: false
    });

    const startTime = performance.now();
    const { getByTestId } = render(<ScanStatisticsScreen />);

    await waitFor(() => {
      expect(getByTestId('total-scans')).toBeTruthy();
      expect(getByTestId('hour-data')).toBeTruthy();
      expect(getByTestId('day-data')).toBeTruthy();
    });

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Log performance metrics
    console.log(`${testCase.name}:
      - Dataset size: ${testCase.count} items
      - Render time: ${renderTime.toFixed(2)}ms
      - Memory snapshot available in Jest output
    `);

    // Verify data integrity
    const totalScans = getByTestId('total-scans');
    expect(totalScans.props.children).toBe(testCase.count);

    const hourData = JSON.parse(getByTestId('hour-data').props.data);
    expect(hourData).toHaveLength(24);

    return renderTime;
  };

  generatePerformanceTestCases().forEach((testCase) => {
    it(`renders efficiently with ${testCase.name}`, async () => {
      const renderTime = await measureRenderTime(testCase);
      
      // Performance thresholds (adjust based on device capabilities)
      const thresholds = {
        small: 100, // 100ms for small datasets
        medium: 250, // 250ms for medium datasets
        large: 500 // 500ms for large datasets
      };

      const threshold = testCase.count <= 100 ? thresholds.small :
                       testCase.count <= 1000 ? thresholds.medium :
                       thresholds.large;

      expect(renderTime).toBeLessThan(threshold);
    });
  });

  it('handles memory efficiently with large datasets', async () => {
    const initialMemory = process.memoryUsage().heapUsed;
    await measureRenderTime({ name: 'Memory Test', count: 5000 });
    const finalMemory = process.memoryUsage().heapUsed;
    
    // Memory increase should be reasonable (adjust threshold based on profiling)
    const memoryIncreaseMB = (finalMemory - initialMemory) / 1024 / 1024;
    expect(memoryIncreaseMB).toBeLessThan(50); // Should use less than 50MB additional memory
  });
});
