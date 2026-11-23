import type { ScheduleItem } from "../types";

/** 予定カード（重要度で視覚的強弱をつけるコンポーネント） */
interface PlanCardProps {
  item: ScheduleItem;
  /** チェック状態のトグルコールバック */
  onToggleCheck?: () => void;
  /** お気に入りトグルコールバック */
  onToggleFavorite?: () => void;
  /** モーダル開くコールバック */
  onOpenModal?: (itemId: string) => void;
}

/** 重要度によるティア判定 */
const determineTier = (item: ScheduleItem): "high" | "medium" | "low" => {
  // 時刻とタイトルがある場合は上級、それ以外は基本表示
  if (item.time && item.title) return "high";
  // サブタイトルまたは説明がある場合は中級
  if (item.subtitle || item.description) return "medium";
  return "low";
};

export default function PlanCard({
  item,
  onToggleCheck,
  onToggleFavorite,
  onOpenModal,
}: PlanCardProps) {
  const tier = determineTier(item);
  const isChecked = item.status !== "sample" ? true : false; // サンプルデータは未チェック

  return (
    <article
      className={`plan-card plan-card--${tier}`}
      aria-label={`${item.title}の計画`}
      style={{
        borderColor: tier === "high" ? "var(--hairline)" : "transparent",
      }}
    >
      <div className="plan-card__inner">
        {/* 時刻表示 */}
        {item.time && (
          <div className="plan-card__time">
            <span className="plan-card__time-text">{item.time}</span>
            {item.endTime && (
              <span className="plan-card__time-end">–{item.endTime}</span>
            )}
          </div>
        )}

        {/* タイトル */}
        <h3 className="plan-card__title font-display">{item.title}</h3>

        {/* 説明 */}
        {item.description && (
          <p className="plan-card__description">
            {item.description}
          </p>
        )}

        {/* カテゴリーラベル */}
        {item.category && (
          <span className="plan-card__category">
            {item.category}
          </span>
        )}

        {/* アクション領域 */}
        <div className="plan-card__actions">
          {onToggleCheck && (
            <button
              type="button"
              className="plan-card__check-btn"
              onClick={onToggleCheck}
              aria-pressed={isChecked}
              aria-label={`${item.title}のチェック状態を切り替える`}
              title="チェック"
            >
              <span className="plan-card__check-icon">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </span>
            </button>
          )}

          {onToggleFavorite && (
            <button
              type="button"
              className="plan-card__fav-btn"
              onClick={onToggleFavorite}
              aria-label="お気に入り"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="plan-card__fav-label">お気に入り</span>
            </button>
          )}

          {/* モーダル開くボタン */}
          {onOpenModal && (
            <button
              type="button"
              className="plan-card__detail-btn"
              onClick={() => onOpenModal(item.id)}
              aria-label="詳細を表示"
              title="詳細"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 8l-6.92 6.08L2 2l6.97-6.02L12 3.5 21 3l-5.06 4.92L23 9l-6.43 6.34L21 21l-1-1z" />
              </svg>
              <span className="plan-card__detail-label">詳細</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}