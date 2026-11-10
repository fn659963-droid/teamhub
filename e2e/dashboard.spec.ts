import { test, expect } from "@playwright/test";

/**
 * Dashboard E2E tests.
 * Requires a logged-in session — set TEST_EMAIL / TEST_PASSWORD env vars,
 * or update the credentials below.
 */

const EMAIL = process.env.TEST_EMAIL ?? "admin@example.com";
const PASSWORD = process.env.TEST_PASSWORD ?? "password";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Log in before each test
    await page.goto("/login");
    await page.getByLabel("Email").fill(EMAIL);
    await page.getByLabel("Password").fill(PASSWORD);
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL("/dashboard", { timeout: 8000 });
  });

  test("shows Welcome greeting", async ({ page }) => {
    await expect(page.getByText(/Welcome back/i)).toBeVisible();
  });

  test("shows four stat cards", async ({ page }) => {
    await expect(page.getByText("Today's Work Log")).toBeVisible();
    await expect(page.getByText("Notifications")).toBeVisible();
    await expect(page.getByText("News Posts")).toBeVisible();
    await expect(page.getByText("Forum Topics")).toBeVisible();
  });

  test("shows Recent News section", async ({ page }) => {
    await expect(page.getByText("Recent News")).toBeVisible();
  });

  test("shows Recent Forum Topics section", async ({ page }) => {
    await expect(page.getByText("Recent Forum Topics")).toBeVisible();
  });

  test("sidebar is visible with nav links", async ({ page }) => {
    await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Work Log" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Members" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Forum" })).toBeVisible();
    await expect(page.getByRole("link", { name: "News" })).toBeVisible();
  });

  test("'Go to Work Log' link works", async ({ page }) => {
    await page.getByRole("link", { name: /Go to Work Log/i }).click();
    await expect(page).toHaveURL("/worklog");
  });

  test("'View all' news link navigates to /news", async ({ page }) => {
    await page.getByRole("link", { name: /View all/i }).first().click();
    await expect(page).toHaveURL("/news");
  });
});
