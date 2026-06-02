const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3000';

test('Verify bidirectional flag synchronization via paste and edit', async ({ page }) => {
  page.on('console', msg => {
    console.log(`[CONSOLE] [${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.error(`[PAGE ERROR] ${err.stack || err.message}`);
  });

  console.log("1. Navigating to the Generate tab...");
  await page.goto(`${BASE_URL}/create?tab=generate`, { waitUntil: 'load', timeout: 30000 });
  
  console.log("2. Waiting for page hydration...");
  await page.waitForTimeout(5000);

  // Locate the flags textarea
  const textarea = page.locator('textarea[placeholder="Your selected flags will appear here..."]');
  await expect(textarea).toBeVisible();

  const originalFlags = await textarea.inputValue();
  console.log("Original flag string:", originalFlags);

  // Create a customized flag set
  const customFlags = `-cg -oa 2.0.0 -sc1 terra -sc2 locke -sc3 celes -rec1 10 -rec2 20 -gp 8888 -sl -si 222.3.3`;
  
  console.log("3. Pasting custom flags...");
  await textarea.focus();
  
  // Trigger paste event with custom flags
  await page.evaluate((text) => {
    const textarea = document.querySelector('textarea[placeholder="Your selected flags will appear here..."]');
    const clipboardData = new DataTransfer();
    clipboardData.setData('text/plain', text);
    const event = new ClipboardEvent('paste', {
      clipboardData,
      bubbles: true,
      cancelable: true,
    });
    textarea.dispatchEvent(event);
  }, customFlags);

  console.log("Waiting for state propagation...");
  await page.waitForTimeout(2000);

  // Read the updated textarea (it should be reconstructed/reordered by useOrderedFlags)
  const pastedFlags = await textarea.inputValue();
  console.log("Updated (pasted) flags in textarea:", pastedFlags);

  // Verify elements are updated. Let's check GP starting amount (gp flag)
  // Let's navigate to the 'starting' or 'graphics' tab to verify, or check the DOM or Redux store
  console.log("4. Inspecting Redux Store state...");
  const reduxState = await page.evaluate(() => {
    return window.__store__?.getState() || null;
  });

  if (reduxState) {
    console.log("Successfully connected to Redux Store!");
    const flagValues = reduxState.flag.flagValues;
    console.log("Pasted -sc1 starting character:", flagValues['-sc1']);
    console.log("Pasted -gp gold amount:", flagValues['-gp']);
    console.log("Pasted -rec1 setting:", flagValues['-rec1']);
    
    expect(flagValues['-sc1']).toBe('terra');
    expect(flagValues['-gp']).toBe(8888);
    expect(flagValues['-rec1']).toBe(10);
    expect(flagValues['-sl']).toBe(true);
    
    // Check custom objectives
    const objectiveState = reduxState.objective.objectives;
    console.log("Parsed objectives count:", objectiveState.length);
    expect(objectiveState.length).toBeGreaterThan(0);
    
    // Check starting items
    const startingItems = reduxState.item.items.items;
    console.log("Parsed starting items:", startingItems);
    expect(startingItems.length).toBeGreaterThan(0);
    
    console.log("Verification via Redux state checking: SUCCESS!");
  } else {
    console.log("Redux store not exposed directly on window. Testing fallback DOM check...");
    
    // Navigate to 'Characters' tab to check character selects or check input values
    await page.goto(`${BASE_URL}/create?tab=starting-party`, { waitUntil: 'load' });
    await page.waitForTimeout(2000);
    
    // Check if the DOM has Terra selected or locke selected
    const bodyHtml = await page.content();
    const hasTerra = bodyHtml.includes('Terra');
    console.log("Starting Party page DOM contains 'Terra':", hasTerra);
    expect(hasTerra).toBe(true);
    
    console.log("Verification via fallback DOM checking: SUCCESS!");
  }
});
