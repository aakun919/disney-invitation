import { useEffect, useMemo, useState } from "react";
import type { ScheduleItem } from "../types";
import { CATEGORY_LABEL } from "../data/categories";
import { jstNowMinutes, jstToday, parseTimeToMinutes } from "../lib/trip";
import CheckItem from "./CheckItem";
import FavoriteButton from "./FavoriteButton";

interface TimelineProps {
  items: ScheduleItem[];
  dayLabel?: string;
  /** このタイムラインの日付（"YYYY-MM-DD"）。当日モード（B1）の判定に使う */
  dateISO?: string;
}

const STATUS_LABEL: Partial<Record<ScheduleItem["status"], string>> = {
  tentative: "調整中",
  confirmed: "確定",
};

type NowState = "past" | "now" | "upcoming";

/**
 * 日付ごとのタイムライン。
 * - 時刻・タイトル・説明・カテゴリーチップを縦列表示
 * - 確定度（調整中／確定）をステータスチップで明示する。sample は制作段階のため表示しない
 * - B1 当日モード: その日が当日（JST）の場合、現在時刻に当たる予定を「ただいま」で示し、
 *   過ぎた予定は静かに沈ませる（1分ごとに再評価）
 * - B2: 説明文がある予定は「詳しく見る」で展開できる
 * - .reveal クラスでスクロール連動フェードイン（base.css で定義済み）
 */
export default function Timeline({ items, dayLabel, dateISO }: TimelineProps) {
  const isToday = dateISO !== undefined && dateISO === jstToday();
  const [nowMin, setNowMin] = useState<number>(() => jstNowMinutes());

  useEffect(() => {
    if (!isToday) return;
    const t = window.setInterval(() => setNowMin(jstNowMinutes()), 60_000);
    return () => window.clearInterval(t);
  }, [isToday]);

  const ranges = useMemo(() => {
    return items.map((item, i) => {
      const start = parseTimeToMinutes(item.time);
      const explicitEnd = item.endTime ? parseTimeToMinutes(item.endTime) : null;
      const nextStart =
        i + 1 < items.length ? parseTimeToMinutes(items[i + 1].time) : null;
      const end = explicitEnd ?? nextStart ?? (start !== null ? start + 60 : null);
      return { start, end };
    });
  }, [items]);

  // 「ただいま」は重なりがあっても1件だけ（開始が最も遅い＝最も具体的な予定を優先）
  const nowIndex = useMemo(() => {
    if (!isToday) return -1;
    let idx = -1;
    ranges.forEach(({ start, end }, i) => {
      if (start !== null && end !== null && nowMin >= start && nowMin < end) idx = i;
    });
    return idx;
  }, [isToday, ranges, nowMin]);

  const stateOf = (index: number): NowState | null => {
    if (!isToday) return null;
    const { start, end } = ranges[index];
    if (start === null || end === null) return null;
    if (index === nowIndex) return "now";
    if (nowMin >= end) return "past";
    if (nowMin >= start) return null; // 進行中だが、より具体的な予定が「ただいま」
    return "upcoming";
  };

  return (
    <section className="timeline" aria-label={dayLabel ?? undefined}>
      <h2 className="timeline__day-label">{dayLabel}</h2>
      {items.map((item, i) => (
        <TimelineCard key={item.id} item={item} nowState={stateOf(i)} />
      ))}
    </section>
  );
}

function TimelineCard({
  item,
  nowState,
}: {
  item: ScheduleItem;
  nowState: NowState | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasDescription = item.description.trim().length > 0;

  const className = [
    "timeline__item",
    "reveal",
    nowState === "now" ? "timeline__item--now" : "",
    nowState === "past" ? "timeline__item--past" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={className}>
      <time className="timeline__time" dateTime={item.time}>
        {item.time}
        {item.endTime ? ` – ${item.endTime}` : ""}
      </time>
      <div className="timeline__body">
        <h4 className="timeline__title">{item.title}</h4>
        {item.location && <p className="timeline__location">{item.location}</p>}
        {hasDescription && (
          <>
            <div
              className={`timeline__desc-wrap${expanded ? " is-open" : ""}`}
              aria-hidden={!expanded}
            >
              <div className="timeline__desc-inner">
                <p className="timeline__desc">{item.description}</p>
              </div>
            </div>
            <button
              type="button"
              className="timeline__more"
              aria-expanded={expanded}
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? "閉じる" : "詳しく見る"}
              <span className="timeline__more-mark" aria-hidden="true">
                {expanded ? "−" : "+"}
              </span>
            </button>
          </>
        )}
        <div className="timeline__chips">
          <span className={`chip chip--${item.category}`}>
            {CATEGORY_LABEL[item.category]}
          </span>
          {STATUS_LABEL[item.status] && (
            <span className={`chip chip--status-${item.status}`}>
              {STATUS_LABEL[item.status]}
            </span>
          )}
          {nowState === "now" && <span className="chip chip--now">ただいま</span>}
        </div>
        <div className="timeline__actions">
          <CheckItem item={item} />
          <FavoriteButton id={item.id} label={item.title} />
        </div>
      </div>
    </article>
  );
}
