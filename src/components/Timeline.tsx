import type { ScheduleItem } from "../types";
import { CATEGORY_LABEL } from "../data/categories";
import CheckItem from "./CheckItem";
import FavoriteButton from "./FavoriteButton";

interface TimelineProps {
  items: ScheduleItem[];
  dayLabel?: string;
}

/**
 * 日付ごとのタイムライン。
 * - 時刻・タイトル・説明・カテゴリーチップを縦列表示
 * - .reveal クラスでスクロール連動フェードイン（base.css で定義済み）
 * - モバイル 390px 幅ではみ出さず、PC でも自然に表示
 */
export default function Timeline({ items, dayLabel }: TimelineProps) {
  return (
    <section className="timeline" aria-label={dayLabel ?? undefined}>
      <h2 className="timeline__day-label">{dayLabel}</h2>
      {items.map((item) => (
        <article key={item.id} className="timeline__item reveal">
          <time className="timeline__time" dateTime={item.time}>
            {item.time}{item.endTime ? ` – ${item.endTime}` : ""}
          </time>
          <div className="timeline__body">
            <h4 className="timeline__title">{item.title}</h4>
            {item.location && <p className="timeline__location">{item.location}</p>}
            {item.description && <p className="timeline__desc">{item.description}</p>}
            <span className={`chip chip--${item.category}`}>{CATEGORY_LABEL[item.category]}</span>
            <div className="timeline__actions">
              <CheckItem item={item} />
              <FavoriteButton id={item.id} label={item.title} />
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
