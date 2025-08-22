process.stdout.write('Test starting...\n');

describe('Minimal Test Suite', () => {
  beforeAll(() => {
    process.stdout.write('beforeAll running\n');
  });

  it('should output to console', () => {
    process.stdout.write('test running\n');
    expect(true).toBe(true);
    process.stdout.write('test completed\n');
  });

  afterAll(() => {
    process.stdout.write('afterAll running\n');
  });
});
