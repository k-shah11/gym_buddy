import { test, expect } from '@playwright/test';

test.describe('Buddy Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/');
    await page.getByTestId('button-get-started').click();
    await page.getByTestId('input-email').fill('testuser@example.com');
    await page.getByTestId('input-password').fill('password123');
    await page.getByTestId('button-submit').click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should show add buddy button on dashboard', async ({ page }) => {
    await expect(page.getByTestId('button-add-buddy')).toBeVisible();
  });

  test('should open add buddy modal when button is clicked', async ({ page }) => {
    await page.getByTestId('button-add-buddy').click();
    await expect(page.getByTestId('input-buddy-email')).toBeVisible();
    await expect(page.getByTestId('button-confirm-add-buddy')).toBeVisible();
  });

  test('should validate buddy email format', async ({ page }) => {
    await page.getByTestId('button-add-buddy').click();
    
    // Try invalid email
    await page.getByTestId('input-buddy-email').fill('invalid-email');
    await page.getByTestId('button-confirm-add-buddy').click();
    
    // Should show error
    await expect(page.locator('text=Invalid email')).toBeVisible();
  });

  test('should add buddy and show in pairs list', async ({ page }) => {
    // Use a different email for the buddy
    await page.getByTestId('button-add-buddy').click();
    await page.getByTestId('input-buddy-email').fill('buddy@example.com');
    await page.getByTestId('button-confirm-add-buddy').click();
    
    // Wait for success message or new pair to appear
    await expect(page.locator('text=Buddy added|successfully')).toBeVisible({ timeout: 5000 });
    
    // Close modal if it closes automatically
    await page.waitForTimeout(500);
    
    // Verify pair appears in list
    const pairElement = page.locator('[data-testid*="card-pair-"]').first();
    await expect(pairElement).toBeVisible({ timeout: 5000 });
  });

  test('should display pair details with buddy name and pot', async ({ page }) => {
    // Add buddy first
    await page.getByTestId('button-add-buddy').click();
    await page.getByTestId('input-buddy-email').fill('buddy2@example.com');
    await page.getByTestId('button-confirm-add-buddy').click();
    
    await page.waitForTimeout(1000);
    
    // Check pair card contains buddy info and pot
    const pairCard = page.locator('[data-testid*="card-pair-"]').first();
    await expect(pairCard).toBeVisible();
    
    // Should show pot amount
    await expect(pairCard.locator('[data-testid*="text-pot-"]')).toBeVisible();
    
    // Should show buddy email or name
    await expect(pairCard.locator('text=buddy2@example.com|Buddy')).toBeVisible();
  });

  test('should navigate to pair details page when pair is clicked', async ({ page }) => {
    // Add buddy first
    await page.getByTestId('button-add-buddy').click();
    await page.getByTestId('input-buddy-email').fill('buddy3@example.com');
    await page.getByTestId('button-confirm-add-buddy').click();
    
    await page.waitForTimeout(1000);
    
    // Click on pair card
    const pairCard = page.locator('[data-testid*="card-pair-"]').first();
    await pairCard.click();
    
    // Should navigate to pair details
    await expect(page).toHaveURL(/\/pair\//);
  });
});
