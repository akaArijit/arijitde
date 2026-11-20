import { test, expect } from '@playwright/test';

test.describe('Contact Form', () => {
  test('should load contact section on home page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#contact, [id*="contact"], section:has-text("Contact")')).toBeVisible();
  });

  test('should submit contact form successfully', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to contact form
    await page.locator('#contact, [id*="contact"], section:has-text("Contact")').first().scrollIntoViewIfNeeded();
    
    // Fill contact form
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('textarea[name="message"]', 'This is a test message from E2E test');
    
    // Submit form
    await page.click('button[type="submit"]:has-text("Send"), button:has-text("Submit"), button:has-text("Send")');
    
    // Wait for success message
    await expect(page.locator('text=success, text=submitted, text=thank you')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Navigation', () => {
  test('should navigate to all main pages from navbar', async ({ page }) => {
    await page.goto('/');
    
    // Check navbar is visible
    await expect(page.locator('nav, header')).toBeVisible();
    
    // Check for key navigation links
    const links = [
      { text: 'Onboarding', path: '/onboarding' },
      { text: 'SIP Calculator', path: '/sip-calculator' },
      { text: 'Contact', path: '/#contact' },
    ];
    
    for (const link of links) {
      const navLink = page.locator(`a:has-text("${link.text}"), button:has-text("${link.text}")`).first();
      if (await navLink.isVisible()) {
        await navLink.click();
        await expect(page).toHaveURL(new RegExp(link.path));
        await page.goto('/'); // Go back to home
      }
    }
  });
});