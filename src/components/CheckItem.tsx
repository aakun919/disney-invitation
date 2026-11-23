import type { ScheduleItem } from "../types";
import { useLocalStorageState } from "../hooks/useLocalStorageState";

interface CheckItemProps {
  item: ScheduleItem;
}

/**
 * 予定チェック項目。
 * - localStorage に `check:${id}` として永続化
 * - チェック済みは金色チェックマーク＋控えめな取り消し線で視覚化
 * - aria-pressed / aria-label で状態を伝達
 * - タップ領域はデザイントークン --tap-min (44px) を下回らない
 */
export default function CheckItem({ item }: CheckItemProps) {
  const [checked, setChecked, error] = useLocalStorageState<boolean>(
    `check:${item.id}`,
    false,
    {
      validate: (v): v is boolean => typeof v === "boolean",
    }
  );

  return (
    <button
      type="button"
      className={`check-item ${checked ? "check-item--checked" : ""}`}
      onClick={() => setChecked(!checked)}
      aria-pressed={checked}
      aria-label={`${item.title} のチェック状態を${checked ? "解除" : "設定"}する`}
      title={error ?? undefined}
    >
      <span className="check-item__check" aria-hidden="true">
        {checked ? "\u2714" : ""}
      </span>
      <span className="check-item__label">{checked ? "完了" : "未完了"}</span>
      <span className="sr-only">{item.title}</span>
      {item.subtitle && <span className="check-item__subtitle">{item.subtitle}</span>}
    </button>
  );
}
