# Disney Invitation（ディズニー旅行招待状・しおり）引き継ぎ書

本ドキュメントは、本プロジェクトを別のAI・エージェント・開発者が引き継いで作業を継続できるように、プロジェクトの背景、これまでの実装・改善経緯、ファイル構造と保存場所、環境設定、開発・検証コマンド、および今後の方針をまとめたものです。

---

## 1. プロジェクト概要

- **目的**: パートナーへの誕生日プレゼントとして渡す、デジタル旅行招待状＆旅のしおり（Webアプリケーション）。
- **世界観・デザインテーマ**: 「深いネイビー（`#070d1f`〜`#0a1128`）× 控えめなシャンパンゴールド（`#c9a96a`）」を基調とした、上質な夜空と星屑のラグジュアリーデザイン。
- **技術スタック**:
  - **フロントエンド**: React 18, TypeScript, Vite
  - **スタイリング**: Vanilla CSS（デザイントークン設計、CSS変数）
  - **品質管理 / テスト**: ESLint, TypeScript (`tsc --noEmit`), Playwright E2E（Chromium）
  - **実行環境**: Windows (Node.js v24.13.1)

---

## 2. 現在のステータスと達成状況

Phase 1〜Phase 2.6 を通じて、UI/UXの大幅刷新、不要ファイル隔離、重複UI解消、デザイン調整、印刷用スタイルまで完了し、すべての検証がパスしています。

| 検証項目 | コマンド | 最新結果 |
| :--- | :--- | :--- |
| **ESLint** | `npm run lint` | **PASS**（エラー 0件、警告 0件） |
| **Type Check & Build** | `npm run build` | **PASS**（エラーなし、本番ビルド完了） |
| **Content Check** | `npm run check:content` | **PASS**（整合性パス） |
| **E2E Tests** | `npx playwright test` | **PASS**（全21件パス、回帰ゼロ） |

---

## 3. これまでの実装・改善履歴

### Phase 2: UI/UX フルリニューアル
- **オープニング演出**: 封筒型アニメーション、Wax Seal（封蝋）クリック時の開封モーション、Skipボタン、再訪時短縮（`sessionStorage`）。
- **ヒーロー・タイムライン**: 各日程（DAY ONE / DAY TWO）のヘッダーライン、時間軸の縦ラインと金色のノード（丸印）、ホバー効果。
- **SectionNight**: 宿泊ホテル（グランドシャトー）の特別セクション（Duplicate Canvasの解消と洗練）。
- **フッター**: 温かみのあるメッセージとサインオフの追加。

### Phase 2.1 〜 2.2: macOS/Windows 環境統合と AppleDouble 隔離
- OneDrive同期に起因して混入した74件の `._*` ファイル（AppleDouble）を検出し、ハッシュ付きマニフェストを作成してプロジェクト外へ完全退避。
- 差分退避ファイル `pre-phase2-1.diff`（105,177 bytes）を安全にバックアップ。

### Phase 2.3 〜 2.4: CheckItem 重複解消（P0）
- Timelineカードのタイトルがカード見出しとチェックボタン内部で二重表示されていた問題を最小修正。
- ボタン内のラベルを直感的な「未完了 / 完了」に変更しつつ、`aria-label` およびスクリーンリーダー用テキスト（`.sr-only`）でアクセシビリティと既存E2Eテスト互換性を100%維持。

### Phase 2.5: カテゴリーチップの視認性向上（P1）
- 各予定のカテゴリー（アトラクション、食事、ショー、買い物、休憩、ひととき）に、世界観を崩さない上品な透過アクセントカラー（サファイアブルー、アンバー、ローズ等）を適用。

### Phase 2.6: 不要未追跡ファイルの隔離 & 印刷用スタイル（P2）
- 不要な0バイトファイル（`S`, `{`）および重複 `src/vite.config.ts` を隔離フォルダへ退避。
- `@media print` スタイルを追加。白地背景への自動反転、不要な操作ボタン・星屑背景の非表示、改ページ制御（`break-inside: avoid`）を実装し、紙のしおり・PDF出力に完全対応。

---

## 4. プロジェクトのディレクトリ構造と重要ファイル

```text
disney-invitation/
├── index.html                   # エントリーHTML
├── package.json                 # 依存関係・npmスクリプト
├── vite.config.ts               # Vite設定（ルート配置が正規）
├── playwright.config.ts         # Playwright設定
├── HANDOVER.md                  # 本引き継ぎ書
├── src/
│   ├── main.tsx                 # アプリ起動エントリー
│   ├── App.tsx                  # ルートコンポーネント
│   ├── types.ts                 # 共通TypeScript型定義（※変更禁止）
│   ├── components/
│   │   ├── Opening.tsx          # 封筒型オープニング画面
│   │   ├── Preview.tsx          # 本編ブックレット全体
│   │   ├── SectionHero.tsx      # 日程ヒーロー（DAY ONE等）
│   │   ├── Timeline.tsx         # タイムライン（カード一覧・時間軸）
│   │   ├── CheckItem.tsx        # 完了チェックボタン（P0修正済み）
│   │   ├── FavoriteButton.tsx   # お気に入り登録ボタン
│   │   ├── SectionNight.tsx     # 夜の特別セクション（グランドシャトー）
│   │   └── StarField.tsx        # 星屑背景キャンバス
│   ├── data/
│   │   ├── categories.ts        # カテゴリーマスタ
│   │   ├── day1.ts              # 1日目の予定データ（※秘密情報保持）
│   │   ├── night.ts             # 宿泊・夜のデータ
│   │   └── day2.ts              # 2日目の予定データ
│   ├── hooks/
│   │   └── useLocalStorageState.ts # localStorage同期カスタムフック
│   └── styles/
│       ├── tokens.css           # デザイントークン（色・文字・余白）
│       ├── base.css             # リセット・共通クラス（.reveal, .container）
│       ├── components.css       # タイムライン・ボタン・チップ・カードスタイル
│       ├── pages.css            # ページ構成・@media print 印刷用スタイル
│       └── opening.css          # 封筒・シーリングワックスアニメーション
├── scripts/
│   ├── check-content.mjs        # コンテンツ整合性検証
│   └── verify-samples.mjs       # サンプルデータ検証用スクリプト
├── tests/
│   └── e2e/
│       ├── checklist.spec.ts    # タイムライン・操作・永続化E2Eテスト
│       └── opening.spec.ts      # オープニング・遷移E2Eテスト
└── screenshots/
    ├── phase2-3/                # Phase 2.3 評価時スクリーンショット（15枚）
    ├── phase2-4/                # Phase 2.4 CheckItem修正後スクリーンショット（9枚）
    └── phase2-5/                # チップ改善・印刷プレビュー スクリーンショット（4枚）
```

---

## 5. 保存場所とバックアップ資産

1. **プロジェクト作業ディレクトリ**:
   `C:\Users\USER\OneDrive - nagoya-c.ed.jp\デスクトップ\.cline\data\workspaces\chat\disney-invitation`
2. **Phase 2.1 以前の差分退避ファイル（pre-phase2-1.diff）**:
   `C:\Users\USER\.gemini\antigravity\brain\2fde901f-14d8-4130-8d4c-44bc3be016fc\scratch\pre-phase2-1.diff`
   （※変更・削除厳禁）
3. **隔離ファイル領域（Quarantine）**:
   - AppleDouble（74件）: `%USERPROFILE%\Desktop\disney-invitation-quarantine\appledouble\`
   - 未追跡ゴミファイル（3件）: `%USERPROFILE%\Desktop\disney-invitation-quarantine\untracked\`
     （各フォルダ内にハッシュ付き `manifest.json` あり）

---

## 6. 開発環境・実行手順（Windows環境特記事項）

### 注意点（Node.js と Git）
- **Node.js**: `C:\Users\USER\node\PFiles64\nodejs` に配置されています。新しいシェルセッションでは自動認識されない場合があるため、コマンド実行時は以下のように環境変数を先頭に付与してください。
  ```powershell
  $env:PATH = "C:\Users\USER\node\PFiles64\nodejs;$env:PATH"
  ```
- **npm / npx**: PowerShellの実行ポリシーにより `npm.ps1` がブロックされるため、必ず `npm.cmd` または `npx.cmd` を使用してください。
- **Git**: 現在ホスト環境のPATHに認識されていません。破壊的コマンド（`git reset` / `git checkout` / `git clean` 等）は**厳禁**です。

### 開発・検証コマンド一覧
```powershell
# 1. 依存ライブラリの型・構文チェック
$env:PATH = "C:\Users\USER\node\PFiles64\nodejs;$env:PATH"; npm.cmd run lint

# 2. 本番ビルド検証（TypeScript型チェック含む）
$env:PATH = "C:\Users\USER\node\PFiles64\nodejs;$env:PATH"; npm.cmd run build

# 3. コンテンツ整合性チェック
$env:PATH = "C:\Users\USER\node\PFiles64\nodejs;$env:PATH"; npm.cmd run check:content

# 4. プレビューサーバー起動（テスト実行時に必要）
$env:PATH = "C:\Users\USER\node\PFiles64\nodejs;$env:PATH"; npm.cmd run preview -- --port 4173 --host 127.0.0.1

# 5. Playwright E2Eテスト実行（全21件）
$env:PATH = "C:\Users\USER\node\PFiles64\nodejs;$env:PATH"; npx.cmd playwright test
```

---

## 7. 最重要制約・引き継ぎルール

後続のエージェントや開発者は以下のルールを厳守してください。

1. **破壊的コマンドの禁止**:
   `git reset`、`git checkout`、`git restore`、`git clean` は使用禁止。
2. **既存テスト・コア設定の保護**:
   `tests/`、`package.json`、`package-lock.json`、`src/types.ts`、`src/data/`、`.clinerules` は勝手に変更・弱体化しないこと。
3. **退避ファイルの保護**:
   `pre-phase2-1.diff` および隔離フォルダ内のファイルを削除・変更しないこと。
4. **秘密情報・サプライズの保護**:
   フロントエンドに不要なサプライズ情報や資格情報を直書きしないこと。
5. **デザイン思想の維持**:
   派手な装飾を追加せず、余白・細線・タイポグラフィによる「大人のための上質なブックレット」の世界観を保つこと。

---

## 8. 今後の方針・改善候補（Next Steps）

プロジェクトはプレゼント用として十分に高い完成度にありますが、さらなるブラッシュアップを行う場合の推奨項目です。

1. **実データ（旅行日程）の最終確認と微調整**:
   - 実際のプレゼント相手・日程に合わせた `src/data/day1.ts`, `night.ts`, `day2.ts` の内容確定。
2. **印刷実物の確認（PDFエクスポート検証）**:
   - ブラウザの「印刷」ダイアログ（A4・背景のグラフィックを有効化）でPDF保存し、紙面の見栄えを実寸で確認。
3. **ホスティング環境へのデプロイ（必要な場合）**:
   - Vercel、Cloudflare Pages、GitHub Pages 等へプライベートまたはパスワード保護付きでデプロイ。

---

## 9. 2026-11-23 Mac 正本化（Muse による引き継ぎ作業）

開発の正本を Windows から Mac に一本化した（ユーザー決定・承認済み）。

- **正本の場所**: `/Users/ochiaiatsunori/.cline/data/workspaces/chat/disney-invitation`（この Mac コピー）。Windows 側は今後編集しない。
- **作業前スナップショット**: `~/muse-bridge/snapshots/disney-invitation-pre-mac-canonical-20261123.tar.gz`（node_modules・.git・dist を除く全体）
- **ベースラインコミット**: `0e43529`「chore: Macを正本として現状を保全（ベースライン）」— 未追跡だった中核ファイル（src/data/*、Timeline 等）を含む現状一式を保全。push はしていない（リモートなし）。
- **隔離（削除ではなく移動）**: 0バイトの `src/components/S`、`src/components/{`、重複 `src/vite.config.ts` を `~/muse-bridge/quarantine/disney-invitation-20261123/` へ移動（`{` はシェル都合で `brace` に改名して保管。README.txt に対照表あり）。
- **復旧した不足ファイル**: `playwright.config.ts`（preview 4173 前提、webServer 自動起動・既存サーバー再利用）と `scripts/check-secrets.mjs`（src と dist を秘密キーワード＋資格情報パターンで走査。ソース側はコメントを除いて検査）を新規作成。
- **node_modules**: Windows 由来のコピーを破棄し、Mac で `npm ci` し直した（180 packages、esbuild は darwin-arm64）。
- **Mac での検証結果（2026-11-23）**: build（tsc 込み）PASS / lint PASS / check:content PASS / check:secrets PASS。dist は単一 JS（238KB）・単一 CSS（582KB）に正常化（旧来の重複バンドルは解消）。ただし dist 総量は約31MBで、大半はフォントのサブセットファイル（938件）。表示時に必要な分だけ読み込まれるが、将来の最適化候補。
- **既知の残件**: npm audit で moderate 7件（eslint 9.39.5 の deprecated 警告含む）。バージョン変更を伴うため今回は未対応。E2E も Mac で実走し全21件 PASS（2026-11-23、既存の Chromium を使用、追加ダウンロードなし）。
- **節目のコミットについて**: 本追記と復旧ファイルは「feat: playwright設定と秘密チェックを復旧し引き継ぎを更新（Mac正本化）」としてコミットする。

---

## 10. 2026-11-24 フォント最適化（VM 作業コピーで実施）

§9 の残件だった「dist 約31MB・フォント938件」を解消した（コミット `4ff6831`）。

- **方式変更**: @fontsource を廃止し、公式フォント（Google Fonts）から生成したセルフホストの woff2 サブセットに置換。書体・ウェイト（Cormorant Garamond 500/600、Shippori Mincho B1 500/600、Zen Kaku Gothic New 400/500）は従来と同一で、見た目は不変（スクリーンショットで前後比較済み）。
- **2層サブセット**: core（サイト本文の全文字＋かな・ASCII・記号＋小学校配当漢字1,026字）と ext（残りの常用・人名用漢字）を `unicode-range` で出し分け。通常の閲覧では core の6ファイル・約1.04MBだけが転送され、珍しい漢字が出たときだけ ext が追加で読まれる。どちらの層にも無い文字はフォールバック書体で表示される。
- **成果**: dist 32MB → 3.0MB（ファイル数 941 → 18）、CSS 584KB → 105KB（gzip 247KB → 14.8KB）、フォント転送は 60ファイル → 6ファイル（総転送量は従来比で微減、コンテンツが増えても増えない）。
- **再生成**: `python3 scripts/build-fonts.py`（要 fonttools / brotli）。ソースフォントは `tools/font-cache/` に自動取得される（git 管理外）。**実データを入れた後は必ず再実行すること** — 本文で使う文字は自動で core に取り込まれる。
- **ライセンス**: 3書体とも SIL OFL 1.1。再配布条件として `public/fonts/licenses/OFL-*.txt` を同梱。
- **検証（VM）**: build / lint / check:content / check:secrets PASS、Playwright E2E 21/21 PASS。グリフ網羅チェック済み（従来フォントで表示できた文字はすべて新サブセットでも表示可能。タイトルの「｜」と絵文字「📍」は元々フォントに無く OS 側表示で従来どおり）。

---

## 11. 公開準備（デプロイ候補と手順）— 2026-11-24 整理、未実施

実際のデプロイはユーザーの承認があるまで行わない。本節は承認後すぐ実行できるよう手順を固定したもの。

### 候補の比較（追加コストなしの範囲）

| 候補 | 無料枠 | 非公開性 | 備考 |
|---|---|---|---|
| **Cloudflare Pages（推奨）** | ビルド月500回・帯域無制限 | Cloudflare Access 無料枠（50ユーザーまで）でメールOTP保護が可能。URL自体も推測困難 | `public/_headers`（noindex＋長期キャッシュ）がそのまま効く。Git連携で push 連動デプロイも可 |
| Vercel | Hobby 無料 | パスワード保護は有料（Pro）。noindex は可能 | 個人の非商用利用は Hobby 規約の範囲内か要確認 |
| Netlify | 無料枠あり | パスワード保護は有料（Pro） | _headers 形式も対応 |
| GitHub Pages | プライベートリポジトリでは有料プランが必要 | 実質公開のみ | ヘッダー制御不可のため不採用 |

### 推奨手順（Cloudflare Pages）

1. **公開前チェック**: `npm run verify`（build＋lint＋各種 check）と `npx playwright test` が全て PASS。`check:secrets` で dist に秘密情報が無いことを確認（従来ルールどおり、サプライズ情報はリポジトリ・成果物のどこにも置かない）。
2. **実データ最終化 → `python3 scripts/build-fonts.py` 再実行 → 再ビルド**（フォント core 層へ本文の文字を取り込むため）。
3. **Pages プロジェクト作成**（ユーザー作業）: Cloudflare アカウントで Pages を作成。方法は2通り:
   - Direct Upload: ダッシュボードへ `dist/` をアップロード（最も単純）。
   - Git 連携: GitHub リポジトリ `aakun919/disney-invitation` を接続し、ビルドコマンド `npm run build`、出力 `dist` を指定すると push 連動で自動デプロイ。
4. **（任意）Access 設定**: 渡す相手と自分のメールアドレスだけを通すポリシーを設定すると、URLを知らない第三者は開けない。
5. **公開後確認**: 実機（スマホ）でオープニング→本編を通し確認。`curl -sI <URL>` で `X-Robots-Tag: noindex` が付いていることを確認。
6. **共有**: URL（必要ならQRコード化）を相手へ。公開範囲は「URLを知っている人のみ＋noindex」が前提。
7. **サプライズの明かし方（従来ルール）**: サイト側に仕掛けは作らない。明かすタイミングでデータを更新して再デプロイするだけ。

### 費用

上記の範囲では ¥0（無料枠内）。独自ドメインを使う場合のみドメイン代が別途かかる（任意）。

---

## 12. 2026-11-24 仕掛けの実装（VM 作業コピーで実施）

設計案 `gimmick-design-proposal.md`（Muse の目標ファイル置き場に保管）の全項目を実装した。「遊びは増やす、秘密は入れない」が原則で、仕掛けの中身はすべて汎用文・公開済み日程のみ。

- **A1 流れ星タップ**: 非インタラクティブ領域のタップで金のきらめき＋短い一言（`SparkleLayer`）。reduced-motion では無効。
- **A2 宝石の返事**: オーナメントの宝石がボタンになり、タップで発光＋ラテン語フレーズ表示（`OrnamentGem`、ヒーロー／夜／フッター／イントロに配置）。
- **A3 日付で変わる挨拶**: `src/lib/trip.ts` のフェーズ判定（before/soon/departure/day1/day2/after、JST）でイントロの挨拶とカウントダウン表示が変化。
- **A4 概要ジャンプ**: イントロの三日間の行が各セクションへのスムーズスクロールリンクに（aria-label 付き）。
- **B1 当日モード**: `DayPlan.dateISO` と現在時刻（JST）を突き合わせ、その時間帯の予定1件に「ただいま」チップ＋金の枠、過ぎた予定は減光。重なる予定では開始が最も遅いものを優先。1分ごとに再評価。
- **B2 カード展開**: 説明文のある予定は「詳しく見る」で展開（サンプルとして昼食・夜の2件に説明文を追加。status は sample のまま）。
- **C1 題字の隠しタップ**: 「ふたりの旅のしおり」を3回タップで星屑＋「見つけてくれて、ありがとう」。
- **C2 エピローグ**: 3/15 以降に開くとフッター前に「旅の終わりに」カードが現れる。
- **検証（VM）**: build / lint / check:content / check:secrets PASS、E2E 21/21 PASS（A4 のリンク追加でキーボード操作テストが落ちたため、リンクに aria-label を付けて解消）。加えて Playwright の時計モックで 3/12 出発日・3/13 12:45 当日モード・3/16 エピローグを実測し、全14項目の仕掛けチェックが PASS。
