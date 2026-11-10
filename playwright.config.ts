import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    // Use the pre-installed Chromium in the cloud; on Windows use the default
    executablePath: process.env.CHROMIUM_PATH ?? undefined,
    headless: true,
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  // Expect the app to already be running (npm run dev)
  webServer: undefined,
});
