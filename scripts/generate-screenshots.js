const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const path = require('path');

const SCREENS = [
  { name: 'Home', path: '/' },
  { name: 'Scanner', path: '/scan' },
  { name: 'Statistics', path: '/stats' },
  { name: 'Export', path: '/export' },
];

const DEVICES = {
  ios: [
    { name: 'iPhone 13 Pro Max', width: 2778, height: 1284 },
    { name: 'iPhone 8 Plus', width: 2208, height: 1242 },
    { name: 'iPad Pro', width: 2732, height: 2048 }
  ],
  android: [
    { name: 'Pixel 6', width: 2400, height: 1080 },
    { name: 'Samsung S21', width: 2400, height: 1080 },
    { name: 'Nexus 10', width: 2732, height: 2048 }
  ]
};

async function captureScreenshots() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  for (const platform of ['ios', 'android']) {
    for (const device of DEVICES[platform]) {
      await page.setViewport({
        width: device.width,
        height: device.height,
        deviceScaleFactor: 1,
      });

      for (const screen of SCREENS) {
        const screenshotPath = path.join(
          __dirname,
          '..',
          'store-assets',
          platform,
          `${device.name.toLowerCase().replace(/\s+/g, '-')}-${screen.name.toLowerCase()}.png`
        );

        await page.goto(`http://localhost:3000${screen.path}`);
        await page.waitForSelector('[data-testid="app-loaded"]');
        await page.screenshot({
          path: screenshotPath,
          fullPage: false
        });
      }
    }
  }

  await browser.close();
}

captureScreenshots().catch(console.error);
