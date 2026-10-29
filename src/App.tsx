import StarField from "./components/StarField";

/* [REPLACE] 仮タイトル・仮コピー。ステップ3以降の正式コピーに差し替えること */
const PREVIEW_TITLE = "星の夜へのご招待";
const PREVIEW_LEAD =
  "この画面はデザイン基盤の確認用です。文字・余白・細い線で静かな高級感を組み立てています。";

const SPACE_TOKENS: Array<{ token: string; px: number }> = [
  { token: "--space-4", px: 16 },
  { token: "--space-5", px: 24 },
  { token: "--space-6", px: 32 },
  { token: "--space-7", px: 48 },
  { token: "--space-8", px: 64 },
];

export default function App() {
  return (
    <>
      <StarField />
      <main className="preview layer-content container">
        {/* ヒーロー: 仮の招待状タイトル */}
        <header className="preview__hero">
          <div className="ornament" aria-hidden="true">
            <span className="ornament__gem" />
          </div>
          <p className="latin-label">Design Preview</p>
          <h1 className="preview__title font-display gold-text">
            {PREVIEW_TITLE}
          </h1>
          <p className="text-lead preview__lead">{PREVIEW_LEAD}</p>
        </header>

        {/* タイポグラフィ階層 */}
        <section className="preview__section" aria-label="文字階層の見本">
          <h2 className="preview__section-title">Typography</h2>
          <div className="type-sample">
            <div>
              <p className="type-sample__label">見出し 大 / 明朝 + Cormorant</p>
              <h2 className="font-display gold-text">ふたりの特別な一日</h2>
            </div>
            <div>
              <p className="type-sample__label">本文 / 明朝</p>
              <p className="text-lead">
                忙しい毎日を少し離れて、星の下をふたりで歩く時間をおくりませんか。
              </p>
            </div>
            <div>
              <p className="type-sample__label">本文 / ゴシック</p>
              <p>
                開催日や集合場所などの詳細は、しおりの各ページでご案内します。
              </p>
            </div>
            <div>
              <p className="type-sample__label">補助テキスト</p>
              <p className="text-caption">
                ※ このページはプレビューです。内容は後日差し替わります。
              </p>
            </div>
          </div>
        </section>

        <hr className="hairline-divider" />

        {/* UI 部品見本 */}
        <section className="preview__section" aria-label="UI部品の見本">
          <h2 className="preview__section-title">Components</h2>
          <div className="preview__grid-2">
            <div style={{ display: "grid", gap: "var(--space-4)" }}>
              <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
                <button type="button" className="btn btn--gold">
                  招待状をひらく
                </button>
                <button type="button" className="btn btn--ghost">
                  詳細を見る
                </button>
              </div>
              <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                <span className="chip">アトラクション</span>
                <span className="chip">食事</span>
                <span className="chip">ショー・パレード</span>
              </div>
            </div>
            <article className="card card--interactive">
              <p className="latin-label">Sample Card</p>
              <h3
                className="font-display"
                style={{ fontSize: "var(--fs-600)", margin: "var(--space-2) 0" }}
              >
                見本カード — ひとつの予定
              </h3>
              {/* [REPLACE] カード本文は仮文案 */}
              <p style={{ color: "var(--ivory-soft)", fontSize: "var(--fs-350)" }}>
                時刻・場所・ひとこと説明で構成される予定カードです。タップで詳細がひらきます。
              </p>
            </article>
          </div>
        </section>

        <hr className="hairline-divider" />

        {/* スペーシングスケール */}
        <section className="preview__section" aria-label="余白スケールの見本">
          <h2 className="preview__section-title">Spacing Scale</h2>
          <div className="space-scale">
            {SPACE_TOKENS.map(({ token, px }) => (
              <div key={token} className="space-scale__row">
                <span style={{ width: 96 }}>{token}</span>
                <span
                  className="space-scale__bar"
                  style={{ width: px * 2 }}
                  aria-hidden="true"
                />
                <span>{px}px</span>
              </div>
            ))}
          </div>
        </section>

        <footer className="preview__hero" style={{ marginTop: "var(--space-9)" }}>
          <div className="ornament" aria-hidden="true">
            <span className="ornament__gem" />
          </div>
          <p className="text-caption">Design System Preview / Navy &amp; Champagne Gold</p>
        </footer>
      </main>
    </>
  );
}
