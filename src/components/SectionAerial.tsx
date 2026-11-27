import { useEffect, useRef, useState } from "react";

/**
 * E1: 舞浜の空撮風動画セクション（イントロ直下・持ち物リストの前）。
 * - 動画は大きく重い（約8.6MB）ため、画面に近づくまで読み込まない（遅延読み込み）
 * - ミュート自動再生・ループ・インライン再生が前提
 * - prefers-reduced-motion では動画を出さず、ポスター静止画だけを表示する
 * - 素材は OSM＋地理院空中写真をベースにした AI 生成のイメージ映像（帰属は下部に明記）
 */
export default function SectionAerial() {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [reducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  // 画面に近づいたら初めて動画の読み込みを始める
  useEffect(() => {
    if (reducedMotion) return;
    const el = frameRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  // source を差し込んだら明示的に load + play する（autoPlay 属性だけでは後差しが動かないため）
  useEffect(() => {
    if (!shouldLoad) return;
    const video = videoRef.current;
    if (!video) return;
    video.load();
    video.play().catch(() => {
      /* 自動再生が抑止された場合はポスター表示のまま（操作は不要） */
    });
  }, [shouldLoad]);

  return (
    <section className="aerial reveal" aria-label="舞浜の空撮映像" id="aerial">
      <div className="aerial__inner">
        <div className="section-hero__latin-wrap">
          <span className="section-hero__line" aria-hidden="true" />
          <p className="latin-label section-hero__latin">AERIAL VIEW</p>
          <span className="section-hero__line" aria-hidden="true" />
        </div>

        <h2 className="aerial__title font-display gold-text">空から眺める、舞浜</h2>
        <p className="aerial__lead">
          旅の舞台となる舞浜を、空からの眺めでひと足先に。
        </p>

        <div className="aerial__frame" ref={frameRef}>
          {reducedMotion ? (
            <img
              className="aerial__media"
              src="/media/maihama-aerial-poster.jpg"
              alt="舞浜エリアを空から眺めた静止画"
            />
          ) : (
            <video
              ref={videoRef}
              className="aerial__media"
              muted
              loop
              playsInline
              preload="none"
              poster="/media/maihama-aerial-poster.jpg"
              aria-label="舞浜エリアの空撮風動画"
            >
              {shouldLoad && (
                <source src="/media/maihama-aerial.mp4" type="video/mp4" />
              )}
            </video>
          )}
        </div>

        <p className="aerial__caption">舞浜エリアの空撮風イメージ映像</p>
        <p className="aerial__credit">
          3Dベースデータ: © OpenStreetMap contributors（ODbL）／
          国土地理院の空中写真をもとに作成したAI生成映像です
        </p>
      </div>
    </section>
  );
}
