import { useEffect } from "react";
import { DAY1 } from "../data/day1";
import { NIGHT } from "../data/night";
import { DAY2 } from "../data/day2";
import SectionHero from "./SectionHero";
import SectionIntro from "./SectionIntro";
import SectionNight from "./SectionNight";
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

  return (
    <div className="layer-content preview-page">
      <StarField />

      <main className="container preview-main">
        {/* 旅行全体のイントロダクション */}
        <SectionIntro />

        {/* 1日目 */}
        <section className="preview__section day-section" aria-label="1日目">
          <SectionHero
            title={DAY1.dateLabel}
            lead={DAY1.intro}
            parkName={DAY1.parkName}
            latinLabel={DAY1.parkLatin}
            dateText={DAY1.dateText}
          />
          <Timeline items={DAY1.items} dayLabel="1日目" />
        </section>

        {/* 夜 */}
        <section className="preview__section night-section" aria-label="夜">
          <SectionNight />
          <Timeline items={NIGHT.items} dayLabel="夜" />
        </section>

        {/* 2日目 */}
        <section className="preview__section day-section" aria-label="2日目">
          <SectionHero
            title={DAY2.dateLabel}
            lead={DAY2.intro}
            parkName={DAY2.parkName}
            latinLabel={DAY2.parkLatin}
            dateText={DAY2.dateText}
          />
          <Timeline items={DAY2.items} dayLabel="2日目" />
        </section>
      </main>

      {/* 上質なブックレットフッター */}
      <footer className="preview__footer">
        <div className="preview__footer-inner">
          <div className="ornament section-hero__ornament" aria-hidden="true">
            <span className="ornament__gem" />
          </div>
          <p className="preview__footer-message">
            心に残る特別な時間をお過ごしいただけますように
          </p>
          <p className="preview__footer-sub">A Wonderful Journey Awaits You</p>
        </div>
      </footer>
    </div>
  );
}
