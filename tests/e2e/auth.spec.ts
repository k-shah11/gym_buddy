import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should show landing page with Get Started button', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Gym Buddy/);
    await expect(page.getByTestId('button-get-started')).toBeVisible();
  });

  test('should show signup form when Get Started is clicked', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('button-get-started').click();
    await expect(page.getByTestId('input-email')).toBeVisible();
    await expect(page.getByTestId('input-password')).toBeVisible();
    await expect(page.getByTestId('button-submit')).toBeVisible();
  });

  test('should validate email format on signup', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('button-get-started').click();
    
    // Try invalid email
    await page.getByTestId('input-email').fill('invalid-email');
    await page.getByTestId('input-password').fill('password123');
    await page.getByTestId('button-submit').click();
    
    // Should show error
    await expect(page.locator('text=Invalid email')).toBeVisible();
  });

  test('should navigate to dashboard after successful login', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('button-get-started').click();
    
    // Use fallback auth credentials
    await page.getByTestId('input-email').fill('testuser@example.com');
    await page.getByTestId('input-password').fill('password123');
    await page.getByTestId('button-submit').click();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByTestId('text-welcome')).toBeVisible();
  });

  test('should show logout button and allow logout', async ({ page }) => {
    // First login
    await page.goto('/');
    await page.getByTestId('button-get-started').click();
    await page.getByTestId('input-email').fill('testuser@example.com');
    await page.getByTestId('input-password').fill('password123');
    await page.getByTestId('button-submit').click();
    
    // Wait for dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Click logout
    await page.getByTestId('button-logout').click();
    
    // Should redirect to landing page
    await expect(page).toHaveURL('/');
    await expect(page.getByTestId('button-get-started')).toBeVisible();
  });
});
