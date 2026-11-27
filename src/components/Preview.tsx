import { useEffect, useMemo, useState } from "react";
import { DAY1 } from "../data/day1";
import { NIGHT } from "../data/night";
import { DAY2 } from "../data/day2";
import { ALL_PLANS } from "../data";
import { jstDayPart, tripPhase } from "../lib/trip";
import { useStoredFlags } from "../hooks/useStoredFlags";
import FilterBar from "./FilterBar";
import OrnamentGem from "./OrnamentGem";
import SectionHero from "./SectionHero";
import SectionAerial from "./SectionAerial";
import SectionIntro from "./SectionIntro";
import SectionNight from "./SectionNight";
import SectionPacking from "./SectionPacking";
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

  // D3: 時間帯（朝・昼・夕・夜）で空気を変える
  const dayPart = useMemo(() => jstDayPart(), []);

  // D2: お気に入りの件数と「お気に入りだけ」表示の状態
  const allItemIds = useMemo(
    () => ALL_PLANS.flatMap((plan) => plan.items.map((i) => i.id)),
    []
  );
  const favFlags = useStoredFlags("favorite", allItemIds);
  const favoritesCount = allItemIds.filter((id) => favFlags[id]).length;
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  // D6: 印刷時にだけ出す出典（URL は開いている場所そのものを使う）
  const printUrl = useMemo(
    () => (typeof window !== "undefined" ? window.location.href : ""),
    []
  );

  return (
    <div className="layer-content preview-page" data-daypart={dayPart}>
      <StarField dayPart={dayPart} />
      <SparkleLayer />

      <main className="container preview-main">
        {/* 旅行全体のイントロダクション */}
        <SectionIntro />

        {/* E1: 舞浜の空撮風動画（イントロ直下・持ち物リストの前） */}
        <SectionAerial />

        {/* D2: お気に入りだけを見る */}
        <FilterBar
          favoritesOnly={favoritesOnly}
          favoritesCount={favoritesCount}
          onFavoritesOnlyChange={setFavoritesOnly}
        />

        {/* D1: 持ち物リスト（出発前の準備として、日程の前に置く） */}
        <SectionPacking />

        {/* 1日目 */}
        <section className="preview__section day-section" aria-label="1日目" id="day1">
          <SectionHero
            title={DAY1.dateLabel}
            lead={DAY1.intro}
            parkName={DAY1.parkName}
            latinLabel={DAY1.parkLatin}
            dateText={DAY1.dateText}
          />
          <Timeline items={DAY1.items} dayLabel="1日目" dateISO={DAY1.dateISO} favoritesOnly={favoritesOnly} />
        </section>

        {/* 夜 */}
        <section className="preview__section night-section" aria-label="夜" id="night">
          <SectionNight />
          <Timeline items={NIGHT.items} dayLabel="夜" dateISO={NIGHT.dateISO} favoritesOnly={favoritesOnly} />
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
          <Timeline items={DAY2.items} dayLabel="2日目" dateISO={DAY2.dateISO} favoritesOnly={favoritesOnly} />
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

      {/* D6: 印刷時にだけ現れる出典・URL（画面では非表示） */}
      <div className="print-only print-source" aria-hidden="true">
        <p className="print-source__title">A Wonderful Evening｜ふたりの旅のしおり</p>
        <p className="print-source__url">{printUrl}</p>
        <p className="print-source__qr">QRコードは配布時にここへ掲載</p>
      </div>

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
