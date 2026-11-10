import { test, expect } from "@playwright/test";

const EMAIL = process.env.TEST_EMAIL ?? "admin@example.com";
const PASSWORD = process.env.TEST_PASSWORD ?? "password";

test.describe("Shared Accounts page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(EMAIL);
    await page.getByLabel("Password").fill(PASSWORD);
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL("/dashboard", { timeout: 8000 });
    await page.goto("/shared-accounts");
  });

  test("shows Shared Accounts heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Shared Accounts" })).toBeVisible();
  });

  test("shows Add Account button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Add Account/i })).toBeVisible();
  });

  test("shows table column headers including Previous User", async ({ page }) => {
    await expect(page.getByText("Account Email")).toBeVisible();
    await expect(page.getByText("Owner")).toBeVisible();
    await expect(page.getByText("Current User")).toBeVisible();
    await expect(page.getByText("Previous User")).toBeVisible();
  });

  test("Add Account dialog opens", async ({ page }) => {
    await page.getByRole("button", { name: /Add Account/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 3000 });
  });

  test("Add Account dialog has required fields", async ({ page }) => {
    await page.getByRole("button", { name: /Add Account/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByLabel(/Account Email|Email/i).first()).toBeVisible();
  });

  test("clicking an email in the table opens contact dialog", async ({ page }) => {
    const emailBtns = page.locator("tbody button");
    const count = await emailBtns.count();
    if (count > 0) {
      await emailBtns.first().click();
      await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5000 });
      await expect(page.getByText("Email")).toBeVisible();
    }
  });

  test("shows Transfer Requests section", async ({ page }) => {
    await expect(page.getByText(/Transfer Requests/i)).toBeVisible();
  });
});
