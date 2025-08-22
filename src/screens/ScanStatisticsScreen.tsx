import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { DateRangePicker } from '../components/DateRangePicker';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { useNavigation } from '@react-navigation/native';
// @ts-ignore - Victory Native types will be added when the package is installed
import { VictoryPie, VictoryBar, VictoryChart, VictoryAxis } from 'victory-native';
import type { ScanHistoryItem } from '../types/qrcode';
import { useScanHistory } from '../hooks/useScanHistory';
import type { QRCodeData } from '../types/qrcode';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { exportScanHistoryToCSV } from '../utils/exportUtils';

interface ScanStats {
  totalScans: number;
  uniqueProfiles: number;
  batchScans: number;
  scansByDay: { [key: string]: number };
  scansByHour: { [key: string]: number };
}

export function ScanStatisticsScreen() {
  const navigation = useNavigation();
  const { loadHistory, history } = useScanHistory();
  const [stats, setStats] = useState<ScanStats>({
    totalScans: 0,
    uniqueProfiles: 0,
    batchScans: 0,
    scansByDay: {},
    scansByHour: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)); // 30 days ago
  const [endDate, setEndDate] = useState(new Date());
  const [isExporting, setIsExporting] = useState(false);

  const calculateStats = useCallback(async () => {
    const startTime = performance.now();
    setIsLoading(true);
    try {
      await loadHistory();
      if (!history) return;
      
      console.log(`[Performance] History load took ${performance.now() - startTime}ms`);
      
      const calcStart = performance.now();
      const uniqueIds = new Set<string>();
      const dayStats: { [key: string]: number } = {};
      const hourStats: { [key: string]: number } = {};
      let batchCount = 0;

      history.forEach((scan: ScanHistoryItem) => {
        const scanDate = new Date(scan.metadata.timestamp);
        if (scanDate < startDate || scanDate > endDate) return;
        if (scan.data.type === 'profile') {
          uniqueIds.add(scan.id);
        }

        // scanDate already defined above
        const day = scanDate.toLocaleDateString();
        const hour = scanDate.getHours().toString();

        dayStats[day] = (dayStats[day] || 0) + 1;
        hourStats[hour] = (hourStats[hour] || 0) + 1;

        if (scan.metadata.batchId) {
          batchCount++;
        }
      });

      const stats = {
        totalScans: history.length,
        uniqueProfiles: uniqueIds.size,
        batchScans: batchCount,
        scansByDay: dayStats,
        scansByHour: hourStats,
      };
      
      console.log(`[Performance] Stats calculation took ${performance.now() - calcStart}ms`);
      console.log(`[Performance] Total operation took ${performance.now() - startTime}ms`);
      console.log(`[Performance] Processing ${history.length} records`);
      
      setStats(stats);
    } catch (error) {
      console.error('Error calculating stats:', error);
      setStats({
        totalScans: 0,
        uniqueProfiles: 0,
        batchScans: 0,
        scansByDay: {},
        scansByHour: {},
      });
    } finally {
      setIsLoading(false);
    }
  }, [loadHistory, history, startDate, endDate]);

  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  const handleExport = useCallback(async () => {
    try {
      setIsExporting(true);
      const filePath = await exportScanHistoryToCSV(history || [], startDate, endDate);
      await Share.share({
        url: filePath,
        title: 'Scan History Export',
        message: `Scan history from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      });
    } catch (error) {
      console.error('Failed to export scan history:', error);
    } finally {
      setIsExporting(false);
    }
  }, [history, startDate, endDate]);

  if (isLoading || isExporting) {
    return <LoadingOverlay message={isExporting ? 'Exporting scan history...' : 'Loading scan statistics...'} />;
  }

  const hourData = useMemo(() => {
    const start = performance.now();
    const data = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: stats.scansByHour[i.toString()] || 0,
    }));
    console.log(`[Performance] Hour data calculation took ${performance.now() - start}ms`);
    return data;
  }, [stats.scansByHour]);

  const dayData = useMemo(() => {
    const start = performance.now();
    const data = Object.entries(stats.scansByDay).map(([date, count]) => ({
      date,
      count,
    }));
    console.log(`[Performance] Day data calculation took ${performance.now() - start}ms`);
    return data;
  }, [stats.scansByDay]);

  const StatisticsContent = () => (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />
        <TouchableOpacity
          style={styles.exportButton}
          onPress={handleExport}
          testID="export-button"
        >
          <Text style={styles.exportButtonText}>Export CSV</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.summaryContainer}>
        <View style={styles.statCard}>
          <Text testID="total-scans" style={styles.statValue}>{stats.totalScans}</Text>
          <Text style={styles.statLabel}>Total Scans</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.uniqueProfiles}</Text>
          <Text style={styles.statLabel}>Unique Profiles</Text>
        </View>
        <View style={styles.statCard}>
          <Text testID="batch-scans" style={styles.statValue}>{stats.batchScans}</Text>
          <Text style={styles.statLabel}>Batch Scans</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Scans by Hour</Text>
        <VictoryChart height={250} padding={{ top: 20, bottom: 40, left: 50, right: 20 }}>
          <VictoryAxis
            tickValues={[0, 6, 12, 18, 23]}
            tickFormat={(t: number) => `${t}:00`}
          />
          <VictoryAxis dependentAxis />
          <VictoryBar
          data={hourData}
          x="hour"
          y="count"
            style={{
              data: { fill: '#4CAF50' },
            }}
            testID="hour-data"
          />
        </VictoryChart>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Scan Distribution</Text>
        <VictoryPie
          data={[
            { x: 'Regular', y: stats.totalScans - stats.batchScans },
            { x: 'Batch', y: stats.batchScans },
          ]}
          colorScale={['#4CAF50', '#2196F3']}
          height={250}
          padding={50}
          labels={({ datum }: { datum: { x: string; y: number } }) => `${datum.x}: ${datum.y}`}
          testID="day-data"
        />
      </View>
    </ScrollView>
  );

  return (
    <ErrorBoundary>
      <StatisticsContent />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  exportButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  chartContainer: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
});
