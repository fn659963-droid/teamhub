import { test, expect } from "@playwright/test";

const EMAIL = process.env.TEST_EMAIL ?? "admin@example.com";
const PASSWORD = process.env.TEST_PASSWORD ?? "password";

test.describe("Work Log page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(EMAIL);
    await page.getByLabel("Password").fill(PASSWORD);
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL("/dashboard", { timeout: 8000 });
    await page.goto("/worklog");
  });

  test("shows Work Log heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Work Log" })).toBeVisible();
  });

  test("shows date navigation buttons", async ({ page }) => {
    await expect(page.getByRole("button").filter({ has: page.locator("svg") }).first()).toBeVisible();
  });

  test("shows today's date in the header", async ({ page }) => {
    const today = new Date();
    const month = today.toLocaleString("en-US", { month: "short" });
    await expect(page.getByText(new RegExp(month))).toBeVisible();
  });

  test("shows table with Member and Status columns", async ({ page }) => {
    await expect(page.getByText("Member")).toBeVisible();
    await expect(page.getByText("Status")).toBeVisible();
    await expect(page.getByText("Morning Plan")).toBeVisible();
    await expect(page.getByText("What I Did")).toBeVisible();
  });

  test("shows Add or Edit button for today (own row)", async ({ page }) => {
    const addOrEdit = page.getByRole("button", { name: /Add|Edit/ });
    await expect(addOrEdit).toBeVisible();
  });

  test("clicking Add opens the work log dialog", async ({ page }) => {
    const addBtn = page.getByRole("button", { name: /Add|Edit/ });
    await addBtn.click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 3000 });
    await expect(page.getByText("Morning Plan")).toBeVisible();
    await expect(page.getByText("What I Did")).toBeVisible();
    await expect(page.getByText("Tomorrow's Plan")).toBeVisible();
  });

  test("can save a draft work log", async ({ page }) => {
    const addBtn = page.getByRole("button", { name: /Add|Edit/ });
    await addBtn.click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 3000 });
    // Fill morning plan textarea
    const textareas = page.getByRole("textbox");
    await textareas.first().fill("Today I will work on tests");
    await page.getByRole("button", { name: "Save Draft" }).click();
    // Dialog should close
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 5000 });
  });

  test("navigating to previous day works", async ({ page }) => {
    // Click the left chevron
    const prevBtn = page.locator("button").filter({ has: page.locator(".lucide-chevron-left") });
    await prevBtn.click();
    // Should now show yesterday's date — just check the page didn't crash
    await expect(page.getByRole("heading", { name: "Work Log" })).toBeVisible();
  });

  test("'Today' button appears after navigating back", async ({ page }) => {
    const prevBtn = page.locator("button").filter({ has: page.locator(".lucide-chevron-left") });
    await prevBtn.click();
    await expect(page.getByRole("button", { name: "Today" })).toBeVisible({ timeout: 3000 });
  });
});
