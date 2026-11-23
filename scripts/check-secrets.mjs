/**
 * 秘密情報・サプライズ混入チェック（Mac 正本化に伴い復旧, 2026-11-23）
 *
 * 使い方:
 *   node scripts/check-secrets.mjs
 *
 * 検査対象:
 *   - src/ 配下（.ts/.tsx/.css/.html/.json）
 *   - index.html, public/
 *   - dist/ の配信物（.js/.css/.html）— ビルド成果物への混入も検出する。
 *     dist が無い場合はその旨を表示してスキップする。
 *
 * 検出したら「ファイル名とキーワード種別」だけを表示し、終了コード 1。
 * （該当箇所の本文は表示しない：チェック結果自体から漏らさないため）
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

/** サプライズ推測につながる固有名詞・語句 */
const SECRET_KEYWORDS = [
  "ミラコスタ",
  "グランドシャトー",
  "ファンタジースプリングス",
  "プロポーズ",
  "婚約",
  "指輪",
  "花束",
];

/** 資格情報らしい文字列のパターン（値は表示しない） */
const CREDENTIAL_PATTERNS = [
  { name: "credential-assignment", re: /(api[_-]?key|passwd|password|secret|access[_-]?token)\s*[:=]\s*["'][^"']{8,}["']/i },
  { name: "openai-style-key", re: /sk-[A-Za-z0-9_-]{20,}/ },
  { name: "aws-access-key", re: /AKIA[0-9A-Z]{16}/ },
  { name: "bearer-token", re: /Bearer\s+[A-Za-z0-9._-]{20,}/ },
];

const TARGETS = [
  { dir: "src", exts: new Set([".ts", ".tsx", ".css", ".html", ".json"]) },
  { dir: "public", exts: null },
  { dir: "dist", exts: new Set([".js", ".css", ".html"]) },
];
const ROOT_FILES = ["index.html"];

function* walk(dir, exts) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      yield* walk(full, exts);
    } else if (!exts || exts.has(extname(entry))) {
      yield full;
    }
  }
}

const findings = [];
let scanned = 0;

function scanFile(file) {
  let content;
  try {
    content = readFileSync(file, "utf8");
  } catch {
    return; // バイナリ等は対象外
  }
  // ソース側はコメントを除いて検査する（「サプライズ情報を含めない」等の
  // 注意書きコメント自体を混入と誤検出しないため）。dist はそのまま検査。
  if (!file.includes(`${"/"}dist${"/"}`) && [".ts", ".tsx", ".css"].includes(extname(file))) {
    content = content
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/(^|[^:"'])\/\/.*$/gm, "$1");
  }
  scanned++;
  const rel = relative(root, file);
  for (const kw of SECRET_KEYWORDS) {
    if (content.includes(kw)) {
      findings.push(`${rel}: 秘密キーワード "${kw}"`);
    }
  }
  for (const { name, re } of CREDENTIAL_PATTERNS) {
    if (re.test(content)) {
      findings.push(`${rel}: 資格情報パターン "${name}"`);
    }
  }
}

for (const file of ROOT_FILES) {
  const full = join(root, file);
  if (existsSync(full)) scanFile(full);
}
for (const { dir, exts } of TARGETS) {
  const full = join(root, dir);
  if (!existsSync(full)) {
    if (dir === "dist") console.log("check-secrets: dist が無いため配信物の検査をスキップしました");
    continue;
  }
  for (const file of walk(full, exts)) scanFile(file);
}

if (findings.length > 0) {
  console.error("check-secrets: 混入の可能性があります:");
  for (const f of findings) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`check-secrets: 問題なし（${scanned} ファイルを検査）`);
