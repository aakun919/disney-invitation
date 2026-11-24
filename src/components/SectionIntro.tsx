import { useMemo, useRef, useState } from "react";
import { daysUntilDeparture, tripPhase, type TripPhase } from "../lib/trip";
import OrnamentGem from "./OrnamentGem";

/**
 * 旅行全体のイントロダクション（招待状の本文）。
 * オープニングの後に置き、旅の概要・日程・行程の骨子を伝える。
 *
 * ここに載せるのは、贈る相手に見せてよい確定済みの骨子のみ。
 * 個別の予定の詳細は各日のタイムライン（src/data/）で管理する。
 *
 * 仕掛け:
 * - A3: 挨拶文とカウントダウン表示が日付（フェーズ）で変わる
 * - A4: 行程の骨子の行から各日のセクションへジャンプできる
 * - C1: 題字を3回タップすると小さな「発見」がある（中身は汎用メッセージのみ）
 */

const LEADS: Record<TripPhase, string> = {
  before:
    "2027年の春、東京ディズニーリゾートで過ごす特別な週末に、あなたをご招待します。名古屋を出発し、夢の国で過ごす二日間。その計画を、このしおりにまとめました。",
  soon:
    "2027年の春、東京ディズニーリゾートで過ごす特別な週末まで、あと少し。名古屋を出発し、夢の国で過ごす二日間。その計画を、このしおりにまとめました。",
  departure:
    "本日、名古屋を出発します。東京ディズニーリゾートで過ごす、特別な週末の始まりです。どうぞ素敵な旅を。",
  day1:
    "夢の国での一日が始まります。開園から夜まで、ふたりのペースでゆっくりと。今日の計画は、このしおりの中にあります。",
  day2:
    "旅の最終日。海の物語に浸る一日を、最後まで満喫ください。夜には名古屋へ帰ります。",
  after:
    "おかえりなさい。ふたりの旅は終わりましたが、思い出はここから色づいていきます。このしおりは、その記録として残ります。",
};

const COUNTDOWN_TEXT: Partial<Record<TripPhase, string>> = {
  departure: "本日、出発です",
  day1: "本日、1日目",
  day2: "本日、2日目（最終日）",
};

const FACTS: { term: string; value: string }[] = [
  { term: "日程", value: "2027年3月12日（金）〜 14日（日）" },
  { term: "行き先", value: "東京ディズニーリゾート" },
  { term: "出発", value: "名古屋（12日 夕方）" },
  { term: "人数", value: "2名" },
];

const OVERVIEW: { date: string; weekday: string; text: string; target: string }[] = [
  { date: "3.12", weekday: "FRI", text: "夕方、名古屋を出発して東京へ", target: "#departure" },
  { date: "3.13", weekday: "SAT", text: "東京ディズニーランドで過ごす一日", target: "#day1" },
  { date: "3.14", weekday: "SUN", text: "東京ディズニーシー、夜に名古屋へ", target: "#day2" },
];

export default function SectionIntro() {
  const phase = useMemo(() => tripPhase(), []);
  const daysLeft = useMemo(
    () => (phase === "before" || phase === "soon" ? daysUntilDeparture() : null),
    [phase],
  );

  // C1: 題字への隠しタップ
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const tapsRef = useRef<{ count: number; lastAt: number }>({ count: 0, lastAt: 0 });
  const [found, setFound] = useState(false);
  const foundTimerRef = useRef<number | null>(null);

  const handleTitleClick = () => {
    const now = Date.now();
    const taps = tapsRef.current;
    taps.count = now - taps.lastAt < 1200 ? taps.count + 1 : 1;
    taps.lastAt = now;
    if (taps.count < 3) return;
    taps.count = 0;
    const rect = titleRef.current?.getBoundingClientRect();
    window.dispatchEvent(
      new CustomEvent("invitation:celebrate", {
        detail: {
          x: rect ? rect.left + rect.width / 2 : window.innerWidth / 2,
          y: rect ? rect.top + rect.height / 2 : window.innerHeight / 3,
        },
      }),
    );
    setFound(true);
    if (foundTimerRef.current !== null) window.clearTimeout(foundTimerRef.current);
    foundTimerRef.current = window.setTimeout(() => setFound(false), 4200);
  };

  return (
    <section className="intro reveal" aria-label="旅行のご案内" id="intro">
      <div className="intro__inner">
        <div className="section-hero__latin-wrap">
          <span className="section-hero__line" aria-hidden="true" />
          <p className="latin-label section-hero__latin">THE INVITATION</p>
          <span className="section-hero__line" aria-hidden="true" />
        </div>

        <h2
          className="intro__title font-display gold-text"
          ref={titleRef}
          onClick={handleTitleClick}
        >
          ふたりの旅のしおり
        </h2>

        {found && <p className="intro__found">見つけてくれて、ありがとう</p>}

        <p className="intro__lead">{LEADS[phase]}</p>

        {daysLeft !== null && (
          <p className="intro__countdown">
            出発まで、あと <span className="intro__countdown-num">{daysLeft}</span> 日
          </p>
        )}
        {COUNTDOWN_TEXT[phase] && (
          <p className="intro__countdown">{COUNTDOWN_TEXT[phase]}</p>
        )}

        <dl className="intro__facts" id="departure">
          {FACTS.map((f) => (
            <div className="intro__fact" key={f.term}>
              <dt className="intro__fact-term">{f.term}</dt>
              <dd className="intro__fact-value">{f.value}</dd>
            </div>
          ))}
        </dl>

        <ol className="intro__overview">
          {OVERVIEW.map((o) => (
            <li key={o.date}>
              <a
                className="intro__overview-item"
                href={o.target}
                aria-label={`${o.date.replace(".", "月")}日 ${o.text}（セクションへ移動）`}
              >
                <span className="intro__overview-date">
                  {o.date}
                  <span className="intro__overview-weekday">{o.weekday}</span>
                </span>
                <span className="intro__overview-text">{o.text}</span>
              </a>
            </li>
          ))}
        </ol>

        <p className="intro__note">
          掲載の予定は、確定したものから順次更新されます。
        </p>

        <OrnamentGem className="section-hero__ornament" />
      </div>
    </section>
  );
}
