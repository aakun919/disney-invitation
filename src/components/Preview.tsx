import { useEffect, useMemo } from "react";
import { DAY1 } from "../data/day1";
import { NIGHT } from "../data/night";
import { DAY2 } from "../data/day2";
import { tripPhase } from "../lib/trip";
import OrnamentGem from "./OrnamentGem";
import SectionHero from "./SectionHero";
import SectionIntro from "./SectionIntro";
import SectionNight from "./SectionNight";
import SparkleLayer from "./SparkleLayer";
import Timeline from "./Timeline";
import StarField from "./StarField";

export default function Preview() {
  // スクロール連動のフェードイン（Reveal）監視
  useEffect(() => {
    // reduced-motion の場合は即座に全要素を表示
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const revealElements = document.querySelectorAll<HTMLElement>(".reveal");

    if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
      revealElements.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -40px 0px",
        threshold: 0.1,
      }
    );

    revealElements.forEach((el) => observer.observe(el));

    // フォールバック: 万一IntersectionObserverが発火しなかった場合でも確実に表示
    const fallbackTimer = setTimeout(() => {
      revealElements.forEach((el) => {
        if (!el.classList.contains("is-visible")) {
          el.classList.add("is-visible");
        }
      });
    }, 1200);

    return () => {
      clearTimeout(fallbackTimer);
      observer.disconnect();
    };
  }, []);

  // C2: 旅の後にだけ現れるエピローグの出し分け
  const phase = useMemo(() => tripPhase(), []);

  return (
    <div className="layer-content preview-page">
      <StarField />
      <SparkleLayer />

      <main className="container preview-main">
        {/* 旅行全体のイントロダクション */}
        <SectionIntro />

        {/* 1日目 */}
        <section className="preview__section day-section" aria-label="1日目" id="day1">
          <SectionHero
            title={DAY1.dateLabel}
            lead={DAY1.intro}
            parkName={DAY1.parkName}
            latinLabel={DAY1.parkLatin}
            dateText={DAY1.dateText}
          />
          <Timeline items={DAY1.items} dayLabel="1日目" dateISO={DAY1.dateISO} />
        </section>

        {/* 夜 */}
        <section className="preview__section night-section" aria-label="夜" id="night">
          <SectionNight />
          <Timeline items={NIGHT.items} dayLabel="夜" dateISO={NIGHT.dateISO} />
        </section>

        {/* 2日目 */}
        <section className="preview__section day-section" aria-label="2日目" id="day2">
          <SectionHero
            title={DAY2.dateLabel}
            lead={DAY2.intro}
            parkName={DAY2.parkName}
            latinLabel={DAY2.parkLatin}
            dateText={DAY2.dateText}
          />
          <Timeline items={DAY2.items} dayLabel="2日目" dateISO={DAY2.dateISO} />
        </section>

        {/* C2: エピローグ（旅の後に開いたときだけ現れる） */}
        {phase === "after" && (
          <section className="epilogue reveal" aria-label="旅の終わりに">
            <div className="epilogue__inner">
              <OrnamentGem className="section-hero__ornament" />
              <h2 className="epilogue__title font-display gold-text">旅の終わりに</h2>
              <p className="epilogue__text">
                ふたりの旅は、これでおしまい。
                けれど、思い出はここから色づいていきます。
                素敵な時間を、ありがとうございました。
              </p>
              <p className="epilogue__sub">Thank You for the Wonderful Journey</p>
            </div>
          </section>
        )}
      </main>

      {/* 上質なブックレットフッター */}
      <footer className="preview__footer">
        <div className="preview__footer-inner">
          <OrnamentGem className="section-hero__ornament" />
          <p className="preview__footer-message">
            心に残る特別な時間をお過ごしいただけますように
          </p>
          <p className="preview__footer-sub">A Wonderful Journey Awaits You</p>
        </div>
      </footer>
    </div>
  );
}
