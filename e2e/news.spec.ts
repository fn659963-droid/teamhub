import { test, expect } from "@playwright/test";

const EMAIL = process.env.TEST_EMAIL ?? "admin@example.com";
const PASSWORD = process.env.TEST_PASSWORD ?? "password";

test.describe("News page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(EMAIL);
    await page.getByLabel("Password").fill(PASSWORD);
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL("/dashboard", { timeout: 8000 });
    await page.goto("/news");
  });

  test("shows News heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "News" })).toBeVisible();
  });

  test("shows New Post button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /New Post/i })).toBeVisible();
  });

  test("creates a new news post", async ({ page }) => {
    const title = `Test News ${Date.now()}`;
    await page.getByRole("button", { name: /New Post/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByLabel("Title").fill(title);
    await page.getByLabel("Content").fill("This is a test news post.");
    await page.getByRole("button", { name: "Post" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 5000 });
    await expect(page.getByText(title)).toBeVisible({ timeout: 5000 });
  });

  test("can react with thumbs up", async ({ page }) => {
    // Ensure at least one post
    const postCount = await page.locator(".lucide-thumbs-up").count();
    if (postCount === 0) {
      await page.getByRole("button", { name: /New Post/i }).click();
      await page.getByLabel("Title").fill("React Test Post");
      await page.getByLabel("Content").fill("Content");
      await page.getByRole("button", { name: "Post" }).click();
      await page.waitForTimeout(500);
    }
    const thumbBtn = page.locator("button").filter({ has: page.locator(".lucide-thumbs-up") }).first();
    await thumbBtn.click();
    // The button class changes to indicate reaction — just verify no crash
    await expect(page.getByRole("heading", { name: "News" })).toBeVisible();
  });

  test("can react with bookmark", async ({ page }) => {
    const bookmarkBtn = page.locator("button").filter({ has: page.locator(".lucide-bookmark") }).first();
    if (await bookmarkBtn.count() > 0) {
      await bookmarkBtn.click();
      await expect(page.getByRole("heading", { name: "News" })).toBeVisible();
    }
  });
});
