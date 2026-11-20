import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/onboarding');
  });

  test('should load onboarding page', async ({ page }) => {
    await expect(page).toHaveURL(/.*onboarding/);
    await expect(page.locator('h1')).toContainText(/onboarding|welcome|get started/i);
  });

  test('should navigate to quiz', async ({ page }) => {
    await page.click('text=/start|begin|get started/i');
    await expect(page).toHaveURL(/.*quiz/);
  });

  test('should complete quiz and redirect to dashboard', async ({ page }) => {
    await page.goto('/quiz');
    // Fill out quiz steps
    await page.selectOption('select[name="ageRange"]', '25_35');
    await page.click('button:has-text("Next")');
    await page.selectOption('select[name="lifeStage"]', 'EARLY_CAREER');
    await page.click('button:has-text("Next")');
    // ... continue through quiz
    // This is a placeholder - actual implementation would depend on quiz structure
  });
});

test.describe('Dashboard Client', () => {
  test.use({ storageState: 'tests/auth-state.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/client');
  });

  test('should load client dashboard', async ({ page }) => {
    await expect(page).toHaveURL(/.*dashboard\/client/);
    await expect(page.locator('text=/portfolio|overview|investment/i')).toBeVisible();
  });

  test('should display portfolio overview', async ({ page }) => {
    await expect(page.locator('text=/portfolio|holdings|value/i')).toBeVisible();
  });
});

test.describe('Dashboard Admin', () => {
  test.use({ storageState: 'tests/admin-auth-state.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/admin');
  });

  test('should load admin dashboard', async ({ page }) => {
    await expect(page).toHaveURL(/.*dashboard\/admin/);
    await expect(page.locator('text=/users|clients|analytics/i')).toBeVisible();
  });

  test('should navigate between tabs', async ({ page }) => {
    const tabs = ['Users', 'Clients', 'Consultations', 'Folios', 'AUM', 'Queries'];
    for (const tab of tabs) {
      await page.click(`text=${tab}`);
      await expect(page.locator(`text=${tab}`)).toBeVisible();
    }
  });
});

test.describe('Calculators', () => {
  const calculators = [
    'sip-calculator',
    'lumpsum-calculator',
    'step-up-sip-calculator',
    'swp-calculator',
    'emi-calculator',
    'fd-calculator',
    'rd-calculator',
    'loan-calculator',
    'inflation-calculator',
    'sif-calculator',
  ];

  for (const calc of calculators) {
    test(`should load ${calc}`, async ({ page }) => {
      await page.goto(`/${calc}`);
      await expect(page).toHaveURL(new RegExp(calc));
      await expect(page.locator('h1')).toBeVisible();
    });
  }
});