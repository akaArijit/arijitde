import { test, expect } from '@playwright/test';

const calculators = [
  { path: '/sip-calculator', title: 'SIP Calculator' },
  { path: '/emi-calculator', title: 'EMI Calculator' },
  { path: '/lumpsum-calculator', title: 'Lumpsum Calculator' },
  { path: '/step-up-sip-calculator', title: 'Step-up SIP Calculator' },
  { path: '/fd-calculator', title: 'FD Calculator' },
  { path: '/rd-calculator', title: 'RD Calculator' },
  { path: '/loan-calculator', title: 'Loan Calculator' },
  { path: '/inflation-calculator', title: 'Inflation Calculator' },
  { path: '/swp-calculator', title: 'SWP Calculator' },
  { path: '/sif-calculator', title: 'SIF Calculator' },
];

test.describe('Calculator Pages', () => {
  for (const calc of calculators) {
    test(`should load ${calc.title} page`, async ({ page }) => {
      await page.goto(calc.path);
      await expect(page).toHaveURL(new RegExp(calc.path));
      // Check page loads without error
      await expect(page.locator('h1, h2')).toBeVisible();
    });
  }
});

test.describe('Calculator Functionality', () => {
  test('SIP Calculator - should calculate returns', async ({ page }) => {
    await page.goto('/sip-calculator');
    await expect(page.locator('h1')).toContainText('SIP Calculator');
    
    // Fill in SIP calculator fields
    await page.fill('input[name="monthlyInvestment"]', '5000');
    await page.fill('input[name="expectedReturn"]', '12');
    await page.fill('input[name="timePeriod"]', '10');
    
    // Wait for result to appear
    await page.waitForTimeout(500);
    const result = await page.locator('[data-testid="result"], .result, .output').first();
    await expect(result).toBeVisible();
  });
});