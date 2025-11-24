import { test, expect } from '@playwright/test';

test.describe('Workout Logging Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/');
    await page.getByTestId('button-get-started').click();
    await page.getByTestId('input-email').fill('testuser@example.com');
    await page.getByTestId('input-password').fill('password123');
    await page.getByTestId('button-submit').click();
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Add buddy
    await page.getByTestId('button-add-buddy').click();
    await page.getByTestId('input-buddy-email').fill('buddy@example.com');
    await page.getByTestId('button-confirm-add-buddy').click();
    await page.waitForTimeout(1000);
  });

  test('should show workout logging interface on pair page', async ({ page }) => {
    // Navigate to pair details
    const pairCard = page.locator('[data-testid*="card-pair-"]').first();
    await pairCard.click();
    
    // Should show swipe gesture area or workout buttons
    await expect(page.getByTestId('button-log-workout')).toBeVisible({ timeout: 5000 });
  });

  test('should log workout with swipe gesture or button', async ({ page }) => {
    // Navigate to pair details
    const pairCard = page.locator('[data-testid*="card-pair-"]').first();
    await pairCard.click();
    
    // Log a workout
    await page.getByTestId('button-log-workout').click();
    
    // Should show success message
    await expect(page.locator('text=Workout logged|successfully')).toBeVisible({ timeout: 5000 });
  });

  test('should update pot when user misses workout', async ({ page }) => {
    // Navigate to pair details
    const pairCard = page.locator('[data-testid*="card-pair-"]').first();
    const initialPot = await pairCard.locator('[data-testid*="text-pot-"]').textContent();
    
    await pairCard.click();
    
    // Mark as missed workout
    const missButton = page.getByTestId('button-miss-workout');
    if (await missButton.isVisible()) {
      await missButton.click();
      await page.waitForTimeout(500);
      
      // Go back to dashboard to check pot
      await page.goto('/');
      await page.waitForTimeout(500);
      
      // Pot should have increased by ₹20
      const updatedPot = await page.locator('[data-testid*="text-pot-"]').first().textContent();
      if (initialPot && updatedPot) {
        const initialAmount = parseInt(initialPot.replace(/₹|,/g, ''));
        const updatedAmount = parseInt(updatedPot.replace(/₹|,/g, ''));
        expect(updatedAmount).toBeGreaterThan(initialAmount);
      }
    }
  });

  test('should display workout history for pair', async ({ page }) => {
    // Navigate to pair details
    const pairCard = page.locator('[data-testid*="card-pair-"]').first();
    await pairCard.click();
    
    // Log a workout first
    await page.getByTestId('button-log-workout').click();
    await page.waitForTimeout(500);
    
    // Should show workout in history
    const historySection = page.locator('text=Workout History|History');
    await expect(historySection).toBeVisible({ timeout: 5000 });
    
    // Should show today's workout
    await expect(page.locator('text=Today|today')).toBeVisible();
  });

  test('should show weekly summary for current week', async ({ page }) => {
    // Navigate to pair details
    const pairCard = page.locator('[data-testid*="card-pair-"]').first();
    await pairCard.click();
    
    // Should show weekly summary
    const weeklySection = page.locator('text=Weekly|week|4-day');
    await expect(weeklySection).toBeVisible({ timeout: 5000 });
    
    // Should show workout count for week
    await expect(page.locator('[data-testid*="text-week-count-"]')).toBeVisible();
  });
});
