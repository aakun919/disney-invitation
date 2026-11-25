import { useMemo } from "react";
import type { ScheduleItem } from "../types";
import { PACKING_GROUPS, PACKING_ITEMS } from "../data/packing";
import { useStoredFlags } from "../hooks/useStoredFlags";
import CheckItem from "./CheckItem";
import OrnamentGem from "./OrnamentGem";

/**
 * D1: 持ち物リスト。
 * - チェックは既存の CheckItem（localStorage `check:packing-*`）をそのまま使う
 * - 進捗は金のリングで示し、チェックが増えるほど満ちていく
 * - 旅程データではないため、項目は旅行一般の準備品のみ（data/packing.ts）
 */
export default function SectionPacking() {
  const ids = useMemo(() => PACKING_ITEMS.map((i) => i.id), []);
  const flags = useStoredFlags("check", ids);
  const done = ids.filter((id) => flags[id]).length;
  const total = ids.length;
  const ratio = total === 0 ? 0 : done / total;

  // 進捗リング（SVG）の円周計算
  const R = 26;
  const CIRC = 2 * Math.PI * R;

  return (
    <section className="packing reveal" aria-label="持ち物リスト" id="packing">
      <div className="packing__inner">
        <div className="section-hero__latin-wrap">
          <span className="section-hero__line" aria-hidden="true" />
          <p className="latin-label section-hero__latin">PACKING LIST</p>
          <span className="section-hero__line" aria-hidden="true" />
        </div>

        <h2 className="packing__title font-display gold-text">旅の持ち物</h2>
        <p className="packing__lead">
          出発前に、ひとつずつ確認を。チェックはこの端末に保存されます。
        </p>

        <div className="packing__progress">
          <svg
            className="packing__ring"
            viewBox="0 0 64 64"
            width="64"
            height="64"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={done}
            aria-label={`持ち物の準備 ${done} / ${total}`}
          >
            <circle className="packing__ring-track" cx="32" cy="32" r={R} />
            <circle
              className="packing__ring-value"
              cx="32"
              cy="32"
              r={R}
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - ratio)}
            />
          </svg>
          <p className="packing__progress-text">
            <span className="packing__progress-num">{done}</span> / {total}{" "}
            準備できました
          </p>
        </div>

        {PACKING_GROUPS.map((group) => (
          <div className="packing__group" key={group.label}>
            <h3 className="packing__group-label">{group.label}</h3>
            <ul className="packing__list">
              {group.items.map((item) => (
                <li className="packing__row" key={item.id}>
                  <span className="packing__row-text">
                    <span className="packing__row-title">{item.title}</span>
                    {item.note && (
                      <span className="packing__row-note">{item.note}</span>
                    )}
                  </span>
                  <CheckItem item={toCheckTarget(item)} />
                </li>
              ))}
            </ul>
          </div>
        ))}

        <OrnamentGem className="section-hero__ornament" />
      </div>
    </section>
  );
}

/** CheckItem は ScheduleItem 型を受けるため、持ち物項目を最小形に変換する */
function toCheckTarget(item: { id: string; title: string }): ScheduleItem {
  return {
    id: item.id,
    time: "",
    title: item.title,
    description: "",
    category: "moment",
    status: "sample",
  };
}
