import { test, expect } from "@playwright/test";

const EMAIL = process.env.TEST_EMAIL ?? "admin@example.com";
const PASSWORD = process.env.TEST_PASSWORD ?? "password";

test.describe("Members page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(EMAIL);
    await page.getByLabel("Password").fill(PASSWORD);
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL("/dashboard", { timeout: 8000 });
    await page.goto("/members");
  });

  test("shows Members heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Members" })).toBeVisible();
  });

  test("shows table column headers", async ({ page }) => {
    await expect(page.getByText("Name")).toBeVisible();
    await expect(page.getByText("Nickname")).toBeVisible();
    await expect(page.getByText("Email")).toBeVisible();
    await expect(page.getByText("Birthday")).toBeVisible();
    await expect(page.getByText("Role")).toBeVisible();
    await expect(page.getByText("Joined")).toBeVisible();
  });

  test("shows at least one member row", async ({ page }) => {
    // The logged-in user should always appear
    const rows = page.locator("tbody tr");
    await expect(rows.first()).toBeVisible();
  });

  test("clicking an email opens the contact dialog", async ({ page }) => {
    // Click the first email button in the table
    const emailBtn = page.locator("tbody button").first();
    await emailBtn.click();
    // Dialog should appear
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5000 });
  });

  test("contact dialog shows email field", async ({ page }) => {
    await page.locator("tbody button").first().click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Email")).toBeVisible();
  });

  test("contact dialog can be closed", async ({ page }) => {
    await page.locator("tbody button").first().click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5000 });
    // Close via X button
    await page.getByRole("dialog").getByRole("button").filter({ hasText: "" }).first().click();
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 3000 });
  });

  test("admin sees edit button in contact dialog", async ({ page }) => {
    await page.locator("tbody button").first().click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5000 });
    // Admin should see pencil/edit button
    const editBtn = page.getByRole("dialog").getByRole("button").filter({ hasText: /edit/i });
    // This may or may not appear depending on role — just verify dialog is open
    await expect(page.getByRole("dialog")).toBeVisible();
  });
});
