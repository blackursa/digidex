import { generateQRCode, parseQRCode } from '../../services/qrcode';
import { TestScenarios } from '../helpers/testScenarios';

describe('QR Code Performance', () => {
  const PERFORMANCE_THRESHOLD = {
    generation: 50, // ms
    parsing: 20, // ms
    batchProcessing: 200, // ms for 100 operations
  };

  const measureTime = async (operation: () => void | Promise<void>): Promise<number> => {
    const start = performance.now();
    await operation();
    return performance.now() - start;
  };

  it('generates QR codes within performance threshold', async () => {
    const { data } = TestScenarios.QRCodes.generateValid();
    
    const time = await measureTime(() => {
      generateQRCode(data);
    });

    expect(time).toBeLessThan(PERFORMANCE_THRESHOLD.generation);
  });

  it('parses QR codes within performance threshold', async () => {
    const { code } = TestScenarios.QRCodes.generateValid();
    
    const time = await measureTime(() => {
      parseQRCode(code);
    });

    expect(time).toBeLessThan(PERFORMANCE_THRESHOLD.parsing);
  });

  it('handles batch operations efficiently', async () => {
    const batchSize = 100;
    const operations = Array(batchSize).fill(null).map(() => 
      TestScenarios.QRCodes.generateValid()
    );

    const time = await measureTime(async () => {
      const generatePromises = operations.map(({ data }) => generateQRCode(data));
      await Promise.all(generatePromises);

      const parsePromises = operations.map(({ code }) => parseQRCode(code));
      await Promise.all(parsePromises);
    });

    expect(time).toBeLessThan(PERFORMANCE_THRESHOLD.batchProcessing);
  });

  it('maintains consistent performance under load', async () => {
    const iterations = 5;
    const timings: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const { data, code } = TestScenarios.QRCodes.generateValid();

      const generateTime = await measureTime(() => {
        generateQRCode(data);
      });

      const parseTime = await measureTime(() => {
        parseQRCode(code);
      });

      timings.push(generateTime, parseTime);

      // Add some load between iterations
      const loadData = Array(1000).fill('test').join('');
      JSON.parse(JSON.stringify(loadData));
    }

    const averageTime = timings.reduce((a, b) => a + b) / timings.length;
    const maxDeviation = Math.max(...timings) - Math.min(...timings);

    expect(averageTime).toBeLessThan(PERFORMANCE_THRESHOLD.generation);
    expect(maxDeviation).toBeLessThan(PERFORMANCE_THRESHOLD.generation / 2);
  });

  it('handles memory efficiently', () => {
    const initialMemory = process.memoryUsage().heapUsed;
    const iterations = 1000;

    for (let i = 0; i < iterations; i++) {
      const { data, code } = TestScenarios.QRCodes.generateValid();
      generateQRCode(data);
      parseQRCode(code);
    }

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory increase should be relatively small (less than 10MB)
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
  });
});
