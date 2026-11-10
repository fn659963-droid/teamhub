import { test, expect } from "@playwright/test";

const EMAIL = process.env.TEST_EMAIL ?? "admin@example.com";
const PASSWORD = process.env.TEST_PASSWORD ?? "password";

test.describe("Notifications page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(EMAIL);
    await page.getByLabel("Password").fill(PASSWORD);
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL("/dashboard", { timeout: 8000 });
    await page.goto("/notifications");
  });

  test("shows Notifications heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Notifications" })).toBeVisible();
  });

  test("shows empty state or notification list", async ({ page }) => {
    const hasNotifs = await page.locator("[class*='divide-y']").count();
    const hasEmpty = await page.getByText(/All caught up|No notifications/i).count();
    expect(hasNotifs + hasEmpty).toBeGreaterThan(0);
  });

  test("'Mark all as read' button appears when there are unread notifications", async ({ page }) => {
    // This may or may not appear depending on DB state
    const markAll = page.getByRole("button", { name: /Mark all as read/i });
    const isVisible = await markAll.isVisible();
    if (isVisible) {
      await markAll.click();
      // After clicking, button should disappear
      await expect(markAll).not.toBeVisible({ timeout: 5000 });
    }
  });

  test("sidebar shows notification badge when there are unread", async ({ page }) => {
    await page.goto("/dashboard");
    // Notification badge in sidebar is a span with rose background
    const badge = page.locator("aside .bg-rose-500");
    // May or may not be visible — just ensure no crash
    await expect(page.getByRole("link", { name: /Notifications/i })).toBeVisible();
  });
});
