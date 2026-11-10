import { test, expect } from "@playwright/test";

const EMAIL = process.env.TEST_EMAIL ?? "admin@example.com";
const PASSWORD = process.env.TEST_PASSWORD ?? "password";

test.describe("Profile page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(EMAIL);
    await page.getByLabel("Password").fill(PASSWORD);
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL("/dashboard", { timeout: 8000 });
    await page.goto("/profile");
  });

  test("shows My Profile heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "My Profile" })).toBeVisible();
  });

  test("shows Personal Information section", async ({ page }) => {
    await expect(page.getByText("Personal Information")).toBeVisible();
  });

  test("shows Change Password section", async ({ page }) => {
    await expect(page.getByText("Change Password")).toBeVisible();
  });

  test("Real Name field is pre-filled", async ({ page }) => {
    const realNameInput = page.getByLabel("Real Name");
    await expect(realNameInput).not.toHaveValue("");
  });

  test("shows Save Changes button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Save Changes/i })).toBeVisible();
  });

  test("shows password mismatch error", async ({ page }) => {
    await page.getByLabel("New Password").fill("newpassword1");
    await page.getByLabel("Confirm Password").fill("differentpass");
    await page.getByRole("button", { name: /Save Changes/i }).click();
    await expect(page.getByText(/do not match/i)).toBeVisible({ timeout: 3000 });
  });

  test("saving profile redirects to /members", async ({ page }) => {
    // Just click save without changing password
    await page.getByRole("button", { name: /Save Changes/i }).click();
    await expect(page).toHaveURL("/members", { timeout: 5000 });
  });

  test("sidebar link to profile is accessible", async ({ page }) => {
    // User avatar at bottom of sidebar links to /profile
    await page.goto("/dashboard");
    await page.getByRole("link", { name: /Signed in as/i }).click();
    await expect(page).toHaveURL("/profile");
  });
});
