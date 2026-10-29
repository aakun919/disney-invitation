/**
 * デザイン確認用スクリーンショット取得スクリプト（ステップ2検証用）
 * 使い方:
 *   1) npm run preview -- --port 4173 （別ターミナル）
 *   2) node scripts/shot.mjs
 * 出力: screenshots/{mobile,desktop}-{top,bottom,reduced-motion}.png
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const base = process.env.BASE_URL ?? "http://localhost:4173/";
mkdirSync("screenshots", { recursive: true });

const viewports = [
  { name: "mobile", viewport: { width: 390, height: 844 } },
  { name: "desktop", viewport: { width: 1440, height: 900 } },
];

const browser = await chromium.launch();
for (const { name, viewport } of viewports) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 2 });
  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `screenshots/${name}-top.png` });
  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight),
  );
  await page.waitForTimeout(800);
  await page.screenshot({ path: `screenshots/${name}-bottom.png` });
  await page.close();

  /* prefers-reduced-motion: reduce の描画確認 */
  const rmPage = await browser.newPage({
    viewport,
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
  });
  await rmPage.goto(base, { waitUntil: "networkidle" });
  await rmPage.waitForTimeout(500);
  await rmPage.screenshot({ path: `screenshots/${name}-reduced-motion.png` });
  await rmPage.close();
}
await browser.close();
console.log("screenshots saved to ./screenshots");
