import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: "http://localhost:3000",
    trace: 'on',
    screenshot: {
      mode: 'on',
      fullPage: true,
    },
    video:  {
      mode: 'retain-on-failure',
    },
    
  },
  projects: [
    {
      name: 'e2e tests',
      testIgnore: [
        '**/e2e/home.spec.ts',
      ],
      use: { 
        ...devices['Desktop Chrome'],
       },
    },
    {
      name: 'e2e home page tests',
      testMatch: [
        '**/e2e/home.spec.ts',
      ],
      use: { 
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
