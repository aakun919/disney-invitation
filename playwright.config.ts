import { defineConfig } from "@playwright/test";

/**
 * Playwright E2E 設定（Mac 正本化に伴い復旧, 2026-11-23）
 *
 * - テストは BASE_URL 環境変数、未指定時は http://127.0.0.1:4173 を見る
 *   （tests/e2e/*.spec.ts の既定値と一致）。
 * - webServer: preview サーバーが未起動なら自動で起動する。
 *   preview は dist を配信するため、事前に `npm run build` が必要。
 *   既に起動済みのサーバーがあれば再利用する（HANDOVER の手動手順と両立）。
 */
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: process.env.BASE_URL ?? "http://127.0.0.1:4173",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run preview -- --port 4173 --host 127.0.0.1",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
