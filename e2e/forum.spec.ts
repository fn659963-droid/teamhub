import { test, expect } from "@playwright/test";

const EMAIL = process.env.TEST_EMAIL ?? "admin@example.com";
const PASSWORD = process.env.TEST_PASSWORD ?? "password";

test.describe("Forum page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(EMAIL);
    await page.getByLabel("Password").fill(PASSWORD);
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL("/dashboard", { timeout: 8000 });
    await page.goto("/forum");
  });

  test("shows Forum heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Forum" })).toBeVisible();
  });

  test("shows New Topic button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /New Topic/i })).toBeVisible();
  });

  test("creates a new topic", async ({ page }) => {
    const title = `Test Topic ${Date.now()}`;
    await page.getByRole("button", { name: /New Topic/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByLabel("Title").fill(title);
    await page.getByLabel("Content").fill("This is a test forum topic.");
    await page.getByRole("button", { name: "Post Topic" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 5000 });
    await expect(page.getByText(title)).toBeVisible({ timeout: 5000 });
  });

  test("clicking a topic opens the thread", async ({ page }) => {
    // Create a topic first if none exist
    const topicLinks = page.locator("a[href^='/forum/']");
    const count = await topicLinks.count();
    if (count === 0) {
      await page.getByRole("button", { name: /New Topic/i }).click();
      await page.getByLabel("Title").fill("Seed Topic");
      await page.getByLabel("Content").fill("Seed content");
      await page.getByRole("button", { name: "Post Topic" }).click();
      await page.waitForTimeout(500);
    }
    await page.locator("a[href^='/forum/']").first().click();
    await expect(page).toHaveURL(/\/forum\/.+/);
  });
});

test.describe("Forum thread page", () => {
  let topicUrl: string;

  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(EMAIL);
    await page.getByLabel("Password").fill(PASSWORD);
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL("/dashboard", { timeout: 8000 });

    // Ensure a topic exists
    await page.goto("/forum");
    const topicLinks = page.locator("a[href^='/forum/']");
    if (await topicLinks.count() === 0) {
      await page.getByRole("button", { name: /New Topic/i }).click();
      await page.getByLabel("Title").fill("Thread Test Topic");
      await page.getByLabel("Content").fill("Content here");
      await page.getByRole("button", { name: "Post Topic" }).click();
      await page.waitForTimeout(500);
    }
    await topicLinks.first().click();
    await page.waitForURL(/\/forum\/.+/);
    topicUrl = page.url();
  });

  test("shows back to forum link", async ({ page }) => {
    await expect(page.getByRole("link", { name: /Back to Forum/i })).toBeVisible();
  });

  test("shows topic title", async ({ page }) => {
    await expect(page.locator("h1")).toBeVisible();
  });

  test("shows Replies section", async ({ page }) => {
    await expect(page.getByText(/Repl/i)).toBeVisible();
  });

  test("can post a reply", async ({ page }) => {
    await page.getByPlaceholder(/Share your thoughts/i).fill("This is my reply.");
    await page.getByRole("button", { name: "Post Reply" }).click();
    await expect(page.getByText("This is my reply.")).toBeVisible({ timeout: 5000 });
  });

  test("back link returns to /forum", async ({ page }) => {
    await page.getByRole("link", { name: /Back to Forum/i }).click();
    await expect(page).toHaveURL("/forum");
  });
});
