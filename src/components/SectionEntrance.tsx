import { useEffect, useRef, useState } from "react";

/**
 * E2: 夕暮れのアーチの映像セクション（本編の締めくくり、エピローグ/フッターの前）。
 * - 動画は大きく重い（約6.2MB）ため、画面に近づくまで読み込まない（遅延読み込み）
 * - ミュート自動再生・ループ・インライン再生が前提
 * - prefers-reduced-motion では動画を出さず、ポスター静止画だけを表示する
 * - 映像そのものがサイトの基調色（ネイビー）へフェードイン/アウトする作り
 */
export default function SectionEntrance() {
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
    <section className="entrance reveal" aria-label="夕暮れのアーチの映像" id="entrance">
      <div className="entrance__inner">
        <div className="section-hero__latin-wrap">
          <span className="section-hero__line" aria-hidden="true" />
          <p className="latin-label section-hero__latin">THE ARCHWAY</p>
          <span className="section-hero__line" aria-hidden="true" />
        </div>

        <h2 className="entrance__title font-display gold-text">夕暮れのアーチをくぐって</h2>
        <p className="entrance__lead">
          一日の終わりに、灯りのともるアーチの向こうへ。
          旅の続きは、扉の先で静かに待っています。
        </p>

        <div className="entrance__frame" ref={frameRef}>
          {reducedMotion ? (
            <img
              className="entrance__media"
              src="/media/entrance-teaser-poster.jpg"
              alt="夕暮れの石造りのアーチと、温かな灯りの静止画"
            />
          ) : (
            <video
              ref={videoRef}
              className="entrance__media"
              muted
              loop
              playsInline
              preload="none"
              poster="/media/entrance-teaser-poster.jpg"
              aria-label="夕暮れのアーチをくぐる映像"
            >
              {shouldLoad && (
                <source src="/media/entrance-teaser.mp4" type="video/mp4" />
              )}
            </video>
          )}
        </div>

        <p className="entrance__caption">夕暮れの石畳と、アーチの向こうの灯り</p>
      </div>
    </section>
  );
}
