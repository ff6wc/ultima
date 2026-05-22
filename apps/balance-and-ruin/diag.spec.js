const { test } = require('@playwright/test');

test('diagnose dev page errors on home', async ({ page }) => {
  page.on('console', msg => {
    console.log(`[HOME CONSOLE] [${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.error(`[HOME ERROR] ${err.stack || err.message}`);
  });

  page.on('requestfailed', request => {
    console.warn(`[HOME REQUEST FAILED] ${request.url()}: ${request.failure()?.errorText || 'unknown error'}`);
  });

  console.log("Navigating to home preview site...");
  await page.goto('https://dev-difficulty-updates.ultima-3cm.pages.dev/', { waitUntil: 'load', timeout: 30000 });
  
  console.log("Waiting 10 seconds for hydration...");
  await page.waitForTimeout(10000);

  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log("\n--- HOME PAGE TEXT CONTENT ---");
  console.log(bodyText);
  console.log("-------------------------\n");
});

test('diagnose dev page errors on create', async ({ page }) => {
  page.on('console', msg => {
    console.log(`[CREATE CONSOLE] [${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.error(`[CREATE ERROR] ${err.stack || err.message}`);
  });

  page.on('requestfailed', request => {
    console.warn(`[CREATE REQUEST FAILED] ${request.url()}: ${request.failure()?.errorText || 'unknown error'}`);
  });

  console.log("Navigating to create preview site...");
  await page.goto('https://dev-difficulty-updates.ultima-3cm.pages.dev/create', { waitUntil: 'load', timeout: 30000 });
  
  console.log("Waiting 10 seconds for hydration...");
  await page.waitForTimeout(10000);

  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log("\n--- CREATE PAGE TEXT CONTENT ---");
  console.log(bodyText);
  console.log("-------------------------\n");
});


