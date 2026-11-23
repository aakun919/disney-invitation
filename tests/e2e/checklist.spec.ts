import { test, expect } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:4173";
const JS_ERRORS: string[] = [];

/** オープニングをスキップしてプレビュー画面に到達する */
async function reachPreview(page, { width, height }) {
  await page.setViewportSize({ width, height });
  await page.goto(BASE);

  // short mode（再訪・reduced-motion）にならないよう、セッションをクリアする
  await page.evaluate(() => {
    try {
      window.sessionStorage.clear();
    } catch {
      /* noop */
    }
  });

  const skip = page.getByRole("button", { name: "演出をスキップ" });
  // 通常モードではスキップボタンが現れるまで待機してクリック。
  // short mode（再訪・reduced-motion）ではボタンが出現しないため、
  // クリックのタイムアウトをキャッチしてそのまま見出しを待つ
  // （短縮モードでは自動的に本編へ遷移するため）。
  try {
    await skip.click({ timeout: 8000 });
  } catch {
    /* short mode: skip button does not appear */
  }

  await expect(page.getByRole("heading", { name: "1日目" }).first()).toBeVisible({
    timeout: 10000,
  });
}

/** page.reload() 後のプレビュー画面への再到達。
 *  localStorage などの保存データは消さず、同一コンテキストで維持する。 */
async function reachPreviewAfterReload(page, { width, height }) {
  await page.setViewportSize({ width, height });

  const skip = page.getByRole("button", { name: "演出をスキップ" });
  try {
    await skip.click({ timeout: 8000 });
  } catch {
    /* short mode: skip button does not appear */
  }

  await expect(page.getByRole("heading", { name: "1日目" }).first()).toBeVisible({
    timeout: 10000,
  });
}

test.beforeEach(async ({ page }) => {
  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") {
      JS_ERRORS.push(`[${msg.type()}] ${msg.text()}`);
    }
  });
  page.on("pageerror", (e) => JS_ERRORS.push(e.message));
});

test.afterEach(() => {
  const realErrors = JS_ERRORS.filter((m) => !m.includes("Warning:"));
  expect(realErrors).toEqual([]);
  JS_ERRORS.length = 0;
});

test("タイムラインがサンプルデータを表示する（390px）", async ({ page }) => {
  await reachPreview(page, { width: 390, height: 844 });

  await expect(page.getByRole("heading", { name: "出発・集合" }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "入園・パーク内を楽しむ" }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "昼食" }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "思い出を残す" }).first()).toBeVisible();
  await expect(page.getByText("アトラクション").first()).toBeVisible();
  await expect(page.getByText("食事").first()).toBeVisible();
});

test("タイムラインがサンプルデータを表示する（1440px）", async ({ page }) => {
  await reachPreview(page, { width: 1440, height: 900 });

  await expect(page.getByRole("heading", { name: "出発・集合" }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "思い出を残す" }).first()).toBeVisible();
});

test("チェック項目を操作すると状態が変わる（390px）", async ({ page }) => {
  await reachPreview(page, { width: 390, height: 844 });

  const firstItem = page.locator("button.check-item", { hasText: "出発・集合" }).first();
  await expect(firstItem).toBeVisible();
  await expect(firstItem).toHaveAttribute("aria-pressed", "false");

  await firstItem.click();
  await expect(firstItem).toHaveAttribute("aria-pressed", "true");
});

test("お気に入りを操作すると状態が変わる（390px）", async ({ page }) => {
  await reachPreview(page, { width: 390, height: 844 });

  const firstFavorite = page.locator("button.favorite-button", { hasText: "出発・集合" }).first();
  await expect(firstFavorite).toBeVisible();
  await expect(firstFavorite).toHaveAttribute("aria-pressed", "false");

  await firstFavorite.click();
  await expect(firstFavorite).toHaveAttribute("aria-pressed", "true");
});

test("チェック状態がリロード後も維持される（390px）", async ({ page }) => {
  await reachPreview(page, { width: 390, height: 844 });

  const target = page.locator("button.check-item", { hasText: "昼食" }).first();
  await expect(target).toHaveAttribute("aria-pressed", "false");
  await target.click();
  await expect(target).toHaveAttribute("aria-pressed", "true");

  // リロード後も状態が維持される（localStorage は保持される）
  await page.reload();
  await reachPreviewAfterReload(page, { width: 390, height: 844 });

  const reloaded = page.locator("button.check-item", { hasText: "昼食" }).first();
  await expect(reloaded).toHaveAttribute("aria-pressed", "true");
});

test("保存データが不正でもクラッシュしない（390px）", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  // addInitScript は最初の page.goto() より前に登録する
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem("disney-invitation:v1:check:day1-arrival", "{not valid json");
    } catch {
      /* noop */
    }
  });

  await page.goto(BASE);

  // オープニングをスキップしてプレビューへ（不正データは読み込み時にフォールバックされる）
  const skip = page.getByRole("button", { name: "演出をスキップ" });
  try {
    await skip.click({ timeout: 8000 });
  } catch {
    /* short mode: skip button does not appear */
  }
  await expect(page.getByRole("heading", { name: "1日目" }).first()).toBeVisible({
    timeout: 10000,
  });

  const target = page.locator("button.check-item", { hasText: "出発・集合" }).first();
  await expect(target).toBeVisible();
  await target.click();
  await expect(target).toHaveAttribute("aria-pressed", "true");
});

test("localStorage 書き込み失敗時でもクラッシュしない（390px）", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  // addInitScript は最初の page.goto() より前に登録する
  await page.addInitScript(() => {
    window.localStorage.setItem = function () {
      throw new Error("QuotaExceededError");
    };
  });

  await page.goto(BASE);

  // localStorage の setItem が実際に失敗することを確認する
  const writeCheck = await page.evaluate(() => {
    try {
      window.localStorage.setItem("disney-invitation:v1:e2e-write-check", "{}");
      return "success";
    } catch (e) {
      return (e as Error).message;
    }
  });
  expect(writeCheck).not.toBe("success");

  // オープニングをスキップしてプレビューへ
  const skip = page.getByRole("button", { name: "演出をスキップ" });
  try {
    await skip.click({ timeout: 8000 });
  } catch {
    /* short mode: skip button does not appear */
  }
  await expect(page.getByRole("heading", { name: "1日目" }).first()).toBeVisible({
    timeout: 10000,
  });

  const target = page.locator("button.check-item", { hasText: "出発・集合" }).first();
  await expect(target).toBeVisible();
  await target.click();
  // 書き込みに失敗しても React の状態は更新され、チェック状態は変化する
  await expect(target).toHaveAttribute("aria-pressed", "true");
});

test("キーボード操作でチェック・お気に入りにフォーカスできる（390px）", async ({ page }) => {
  await reachPreview(page, { width: 390, height: 844 });

  await page.keyboard.press("Tab");
  const focused = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    return el ? el.getAttribute("aria-label") : null;
  });
  expect(focused).toBeTruthy();
});

test.describe("スクリーンショット", () => {
  test("mobile checklist", async ({ page }) => {
    await reachPreview(page, { width: 390, height: 844 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: "screenshots/e2e-mobile-checklist.png" });
  });

  test("desktop checklist", async ({ page }) => {
    await reachPreview(page, { width: 1440, height: 900 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: "screenshots/e2e-desktop-checklist.png" });
  });
});

test("お気に入り状態がリロード後も維持される（390px）", async ({ page }) => {
  await reachPreview(page, { width: 390, height: 844 });

  const target = page.locator("button.favorite-button", { hasText: "出発・集合" }).first();
  await expect(target).toHaveAttribute("aria-pressed", "false");
  await target.click();
  await expect(target).toHaveAttribute("aria-pressed", "true");

  // リロード後も状態が維持される（localStorage は保持される）
  await page.reload();
  await reachPreviewAfterReload(page, { width: 390, height: 844 });

  const reloaded = page.locator("button.favorite-button", { hasText: "出発・集合" }).first();
  await expect(reloaded).toHaveAttribute("aria-pressed", "true");
});
