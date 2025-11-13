import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h2')).toContainText('Sign in to your account');
  });

  test('should navigate to dashboard after login', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in login form
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForURL('/dashboard');
    
    // Verify dashboard is displayed
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should display users page', async ({ page }) => {
    // TODO: Add authentication setup
    await page.goto('/users');
    
    // Verify users page is displayed
    await expect(page.locator('h1')).toContainText('Users');
  });
});

