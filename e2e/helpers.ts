import { Page } from "@playwright/test";

export const TEST_ADMIN = { email: "admin@test.com", password: "password123", name: "Test Admin" };
export const TEST_MEMBER = { email: "member@test.com", password: "password123", name: "Test Member" };

export async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL("/dashboard");
}

export async function logout(page: Page) {
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.waitForURL("/login");
}
