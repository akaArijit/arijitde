import { test, expect } from '@playwright/test';

test.describe('Dashboard Client Page', () => {
  test('should redirect to onboarding when not authenticated', async ({ page }) => {
    await page.goto('/dashboard/client');
    // Should redirect to onboarding for unauthenticated users
    await expect(page).toHaveURL(/.*onboarding/);
  });

  test('should load onboarding page correctly', async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page).toHaveURL(/.*onboarding/);
    await expect(page.locator('h1')).toContainText('Book a Call');
  });
});

test.describe('Onboarding Flow', () => {
  test('should show login/signup options', async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page.locator('text=Login, text=Sign Up, text=Get Started')).toBeVisible();
  });

  test('should show Google sign-in button', async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page.locator('button:has-text("Google"), [id*="google"]')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Admin Dashboard', () => {
  test('should redirect to onboarding for admin dashboard when not authenticated', async ({ page }) => {
    await page.goto('/dashboard/admin');
    await expect(page).toHaveURL(/.*onboarding/);
  });
});