import { useMemo } from "react";

/**
 * 旅行全体のイントロダクション（招待状の本文）。
 * オープニングの後に置き、旅の概要・日程・行程の骨子を伝える。
 *
 * ここに載せるのは、贈る相手に見せてよい確定済みの骨子のみ。
 * 個別の予定の詳細は各日のタイムライン（src/data/）で管理する。
 */

const DEPARTURE_DATE = new Date("2027-03-12T00:00:00+09:00");

function useDaysUntilDeparture(): number | null {
  return useMemo(() => {
    const diffMs = DEPARTURE_DATE.getTime() - Date.now();
    const days = Math.ceil(diffMs / 86_400_000);
    return days > 0 ? days : null;
  }, []);
}

const FACTS: { term: string; value: string }[] = [
  { term: "日程", value: "2027年3月12日（金）〜 14日（日）" },
  { term: "行き先", value: "東京ディズニーリゾート" },
  { term: "出発", value: "名古屋（12日 夕方）" },
  { term: "人数", value: "2名" },
];

const OVERVIEW: { date: string; weekday: string; text: string }[] = [
  { date: "3.12", weekday: "FRI", text: "夕方、名古屋を出発して東京へ" },
  { date: "3.13", weekday: "SAT", text: "東京ディズニーランドで過ごす一日" },
  { date: "3.14", weekday: "SUN", text: "東京ディズニーシー、夜に名古屋へ" },
];

export default function SectionIntro() {
  const daysLeft = useDaysUntilDeparture();

  return (
    <section className="intro reveal" aria-label="旅行のご案内">
      <div className="intro__inner">
        <div className="section-hero__latin-wrap">
          <span className="section-hero__line" aria-hidden="true" />
          <p className="latin-label section-hero__latin">THE INVITATION</p>
          <span className="section-hero__line" aria-hidden="true" />
        </div>

        <h2 className="intro__title font-display gold-text">ふたりの旅のしおり</h2>

        <p className="intro__lead">
          2027年の春、東京ディズニーリゾートで過ごす特別な週末に、あなたをご招待します。
          名古屋を出発し、夢の国で過ごす二日間。その計画を、このしおりにまとめました。
        </p>

        {daysLeft !== null && (
          <p className="intro__countdown">
            出発まで、あと <span className="intro__countdown-num">{daysLeft}</span> 日
          </p>
        )}

        <dl className="intro__facts">
          {FACTS.map((f) => (
            <div className="intro__fact" key={f.term}>
              <dt className="intro__fact-term">{f.term}</dt>
              <dd className="intro__fact-value">{f.value}</dd>
            </div>
          ))}
        </dl>

        <ol className="intro__overview">
          {OVERVIEW.map((o) => (
            <li className="intro__overview-item" key={o.date}>
              <span className="intro__overview-date">
                {o.date}
                <span className="intro__overview-weekday">{o.weekday}</span>
              </span>
              <span className="intro__overview-text">{o.text}</span>
            </li>
          ))}
        </ol>

        <p className="intro__note">
          掲載の予定は、確定したものから順次更新されます。
        </p>

        <div className="ornament section-hero__ornament" aria-hidden="true">
          <span className="ornament__gem" />
        </div>
      </div>
    </section>
  );
}
