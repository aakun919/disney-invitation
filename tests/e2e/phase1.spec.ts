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
  const realErrors = JS_ERRORS.filter((m) => !m.includes("Warning:"));
  expect(realErrors).toEqual([]);
  JS_ERRORS.length = 0;
});

/** オープニングをスキップしてプレビュー画面に到達する */
async function reachPreview(page, { width, height }) {
  await page.setViewportSize({ width, height });
  await page.goto(BASE);
  await page.evaluate(() => {
    try {
      window.sessionStorage.clear();
    } catch {
      /* noop */
    }
  });
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

/** Date だけを固定する（タイマーは実時間のまま）init script を登録する */
async function installFixedDate(page, isoWithOffset: string) {
  const fixed = Date.parse(isoWithOffset);
  await page.addInitScript((fixedMs: number) => {
    const RealDate = window.Date;
    class FakeDate extends RealDate {
      constructor(...args: unknown[]) {
        // @ts-expect-error 引数なしのときだけ固定時刻にする
        super(...(args.length === 0 ? [fixedMs] : args));
      }
      static now() {
        return fixedMs;
      }
    }
    window.Date = FakeDate as DateConstructor;
  }, fixed);
}

test("D1: 持ち物リストをチェックすると進捗が増える（390px）", async ({ page }) => {
  await reachPreview(page, { width: 390, height: 844 });

  const packing = page.locator("#packing");
  await expect(packing.getByRole("heading", { name: "旅の持ち物" })).toBeVisible();

  const ring = packing.getByRole("progressbar");
  await expect(ring).toHaveAttribute("aria-valuenow", "0");
  await expect(packing.locator(".packing__progress-text")).toContainText("0 / 13");

  const ticket = packing.locator("button.check-item", { hasText: "パークチケット" }).first();
  await ticket.scrollIntoViewIfNeeded();
  await ticket.click();
  await expect(ticket).toHaveAttribute("aria-pressed", "true");
  await expect(ring).toHaveAttribute("aria-valuenow", "1");
  await expect(packing.locator(".packing__progress-text")).toContainText("1 / 13");
});

test("D2: お気に入りだけ表示で絞り込める（390px）", async ({ page }) => {
  await reachPreview(page, { width: 390, height: 844 });

  // 1件お気に入りにする
  const fav = page.locator("button.favorite-button", { hasText: "出発・集合" }).first();
  await fav.scrollIntoViewIfNeeded();
  await fav.click();
  await expect(fav).toHaveAttribute("aria-pressed", "true");

  // 件数表示が 1 件になる
  await expect(page.locator(".filter-bar__count")).toContainText("1");

  // 「お気に入りだけ」を ON にすると、対象以外が消える
  const toggle = page.getByRole("button", { name: "お気に入りだけを表示" });
  await toggle.scrollIntoViewIfNeeded();
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");

  await expect(page.getByRole("heading", { name: "出発・集合" }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "昼食" })).toHaveCount(0);
  await expect(page.getByText("この日のお気に入りは、まだありません。")).toHaveCount(2);

  // OFF に戻すと全件表示に戻る
  await toggle.click();
  await expect(page.getByRole("heading", { name: "昼食" }).first()).toBeVisible();
});

test("D3: 夜（23時台）は data-daypart が night になり夜の挨拶が出る", async ({ page }) => {
  await installFixedDate(page, "2026-11-25T23:30:00+09:00");
  await reachPreview(page, { width: 390, height: 844 });

  await expect(page.locator(".preview-page")).toHaveAttribute("data-daypart", "night");
  await expect(page.getByText("夜の帳が下りました")).toBeVisible();
});

test("D3: 朝（7時台）は data-daypart が morning になり朝の挨拶が出る", async ({ page }) => {
  await installFixedDate(page, "2026-11-26T07:30:00+09:00");
  await reachPreview(page, { width: 390, height: 844 });

  await expect(page.locator(".preview-page")).toHaveAttribute("data-daypart", "morning");
  await expect(page.getByText("おはようございます")).toBeVisible();
});

test("D5: manifest がリンクされ、内容と sw.js が取得できる", async ({ page }) => {
  await page.goto(BASE);

  const href = await page.locator('link[rel="manifest"]').getAttribute("href");
  expect(href).toBe("/manifest.webmanifest");

  const manifestRes = await page.request.get(`${BASE}${href}`);
  expect(manifestRes.ok()).toBeTruthy();
  const manifest = await manifestRes.json();
  expect(manifest.name).toContain("ふたりのしおり");
  expect(manifest.icons.length).toBeGreaterThanOrEqual(3);
  expect(manifest.display).toBe("standalone");

  const swRes = await page.request.get(`${BASE}/sw.js`);
  expect(swRes.ok()).toBeTruthy();
  expect(await swRes.text()).toContain("disney-invitation-v1");
});

test("D6: 印刷時のみ出典（URL）が現れ、操作UIが隠れる", async ({ page }) => {
  await reachPreview(page, { width: 390, height: 844 });

  const source = page.locator(".print-source");
  await expect(source).toBeHidden();

  await page.emulateMedia({ media: "print" });
  await expect(source).toBeVisible();
  await expect(source.locator(".print-source__url")).toContainText("127.0.0.1:4173");
  await expect(page.locator(".filter-bar")).toBeHidden();
  await expect(page.locator(".timeline__more").first()).toBeHidden();

  await page.emulateMedia({ media: "screen" });
  await expect(source).toBeHidden();
});

test("E1: 空撮セクションがあり、動画が遅延読み込みされる（390px）", async ({ page }) => {
  await reachPreview(page, { width: 390, height: 844 });

  const aerial = page.locator("#aerial");
  await expect(aerial.getByRole("heading", { name: "空から眺める、舞浜" })).toBeVisible();
  await expect(aerial.locator(".aerial__credit")).toContainText("OpenStreetMap");

  const video = aerial.locator("video");
  await expect(video).toHaveCount(1);
  await expect(video).toHaveAttribute("poster", "/media/maihama-aerial-poster.jpg");
  await expect
    .poll(() => video.evaluate((v) => (v as HTMLVideoElement).muted))
    .toBe(true);
  await expect
    .poll(() => video.evaluate((v) => (v as HTMLVideoElement).playsInline))
    .toBe(true);
  await expect
    .poll(() => video.evaluate((v) => (v as HTMLVideoElement).loop))
    .toBe(true);

  // 画面に近づくまで source は差し込まれない（遅延読み込み）。スクロールで差し込まれる
  await aerial.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      video.evaluate(
        (v) => v.querySelector("source")?.getAttribute("src") ?? ""
      )
    )
    .toBe("/media/maihama-aerial.mp4");
});

test("E1: reduced-motion では動画ではなくポスター画像になる", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await reachPreview(page, { width: 390, height: 844 });

  const aerial = page.locator("#aerial");
  await expect(aerial.locator("video")).toHaveCount(0);
  await expect(aerial.locator("img.aerial__media")).toHaveCount(1);
  await expect(aerial.locator("img.aerial__media")).toHaveAttribute(
    "src",
    "/media/maihama-aerial-poster.jpg"
  );
});

test("E2: アーチの映像セクションがあり、動画が遅延読み込みされる（390px）", async ({ page }) => {
  await reachPreview(page, { width: 390, height: 844 });

  const entrance = page.locator("#entrance");
  await expect(entrance.getByRole("heading", { name: "夕暮れのアーチをくぐって" })).toBeVisible();

  const video = entrance.locator("video");
  await expect(video).toHaveCount(1);
  await expect(video).toHaveAttribute("poster", "/media/entrance-teaser-poster.jpg");
  await expect
    .poll(() => video.evaluate((v) => (v as HTMLVideoElement).muted))
    .toBe(true);
  await expect
    .poll(() => video.evaluate((v) => (v as HTMLVideoElement).playsInline))
    .toBe(true);
  await expect
    .poll(() => video.evaluate((v) => (v as HTMLVideoElement).loop))
    .toBe(true);

  // 画面に近づくまで source は差し込まれない（遅延読み込み）。スクロールで差し込まれる
  await entrance.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      video.evaluate(
        (v) => v.querySelector("source")?.getAttribute("src") ?? ""
      )
    )
    .toBe("/media/entrance-teaser.mp4");
});

test("E2: reduced-motion では動画ではなくポスター画像になる", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await reachPreview(page, { width: 390, height: 844 });

  const entrance = page.locator("#entrance");
  await expect(entrance.locator("video")).toHaveCount(0);
  await expect(entrance.locator("img.entrance__media")).toHaveCount(1);
  await expect(entrance.locator("img.entrance__media")).toHaveAttribute(
    "src",
    "/media/entrance-teaser-poster.jpg"
  );
});
