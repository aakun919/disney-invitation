import { test, expect } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:4173";
const JS_ERRORS: string[] = [];

test.beforeEach(async ({ page }) => {
  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") {
      JS_ERRORS.push(`[${msg.type()}] ${msg.text()}`);
    }
  });
  page.on("pageerror", (e) => JS_ERRORS.push(e.message));
});

test.afterEach(() => {
  // React の StrictMode 関連の二重描画警告などはテスト対象外とするため、
  // 実エラー（pageerror）のみを厳密にチェックする
  const realErrors = JS_ERRORS.filter((m) => !m.includes("Warning:"));
  expect(realErrors).toEqual([]);
  JS_ERRORS.length = 0;
});

test("初回表示: オープニングが表示され、「招待状をひらく」で本編へ遷移", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE);

  // オープニング要素の存在
  await expect(page.locator(".opening")).toBeVisible();
  await expect(page.locator("h1.opening__title")).toHaveText("星の夜へのご招待");
  await expect(page.getByRole("button", { name: "招待状をひらく" })).toBeVisible();

  // ボタン操作で本編へ
  await page.getByRole("button", { name: "招待状をひらく" }).click();
  await expect(page.locator(".opening")).not.toBeVisible();
  await expect(page.getByRole("heading", { name: "1日目" }).first()).toBeVisible({
    timeout: 10000,
  });
});

test("Skip 操作で演出を待たずに本編へ移行", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE);

  // Skip ボタンはアニメ完了後に表示されるので待つ
  await expect(page.getByRole("button", { name: "演出をスキップ" })).toBeVisible({ timeout: 5000 });
  await page.getByRole("button", { name: "演出をスキップ" }).click();
  await expect(page.locator(".opening")).not.toBeVisible();
  await expect(page.getByRole("heading", { name: "1日目" }).first()).toBeVisible({
    timeout: 10000,
  });
});

test("同一タブ内の再訪で短縮表示になる（sessionStorage）", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE);
  await page.evaluate(() => window.sessionStorage.clear());
  await page.reload();

  // 1回目: 通常表示してボタンクリック（sessionStorage に done を書き込む）
  await page.getByRole("button", { name: "招待状をひらく" }).click();
  await expect(page.locator(".opening")).not.toBeVisible();
  await expect(page.getByRole("heading", { name: "1日目" }).first()).toBeVisible();

  // 2回目: 同一タブで再訪 → 短縮モード（すぐ本編へ）
  await page.goto(BASE);
  await expect(page.getByRole("heading", { name: "1日目" }).first()).toBeVisible({ timeout: 3000 });
  await expect(page.locator(".opening")).not.toBeVisible();
});

test("prefers-reduced-motion: reduce で長い演出が省略される", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(BASE);

  // 長いアニメーションが省略され、メッセージと「招待状をひらく」ボタンが表示される
  await expect(page.getByRole("button", { name: "招待状をひらく" })).toBeVisible({
    timeout: 5000,
  });

  // ボタンをクリックするとPreviewへ遷移する
  await page.getByRole("button", { name: "招待状をひらく" }).click();
  await expect(page.getByRole("heading", { name: "1日目" }).first()).toBeVisible({
    timeout: 10000,
  });
});

test("キーボード操作でボタンにフォーカスできる", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE);

  // ボタンが表示されるまで待つ
  const button = page.getByRole("button", { name: "招待状をひらく" });
  await expect(button).toBeVisible({ timeout: 5000 });

  // Tab でフォーカス移動し、ボタンが active element になることを確認
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  const focused = await page.evaluate(() => (document.activeElement as HTMLElement)?.textContent);
  expect(focused).toContain("招待状をひらく");
});

test("PC(1440px) でもレイアウトが崩れない", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE);

  await expect(page.locator("h1.opening__title")).toBeVisible();
  await page.getByRole("button", { name: "招待状をひらく" }).click();
  await expect(page.getByRole("heading", { name: "1日目" }).first()).toBeVisible();
});

test.describe("スクリーンショット", () => {
  test("mobile opening", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: "screenshots/e2e-mobile-opening.png" });
  });

  test("mobile after open", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE);
    await page.getByRole("button", { name: "招待状をひらく" }).click();
    await page.screenshot({ path: "screenshots/e2e-mobile-after-open.png" });
  });

  test("desktop opening", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: "screenshots/e2e-desktop-opening.png" });
  });

  test("desktop after open", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE);
    await page.getByRole("button", { name: "招待状をひらく" }).click();
    await page.screenshot({ path: "screenshots/e2e-desktop-after-open.png" });
  });
});
