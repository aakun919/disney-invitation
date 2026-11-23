type FilterState = {
  day: "すべて" | "1日目" | "夜" | "2日目";
  favoritesOnly: boolean;
  category: "moment" | "attraction" | "food" | "show" | "rest" | "shopping" | null;
};

const CATEGORY_LABELS = {
  moment: "すべて",
  attraction: "アトラクション",
  food: "食事",
  show: "ショー・パレード",
  rest: "休憩",
  shopping: "ショッピング",
};

export default function FilterBar({
  onDayChange,
  onFavoritesToggle,
  onCategoryChange,
  onReset,
}: {
  onDayChange: (day: FilterState["day"]) => void;
  onFavoritesToggle: (favoritesOnly: boolean) => void;
  onCategoryChange: (category: string | null) => void;
  onReset: () => void;
}) {
  return (
    <section className="filter-bar">
      <div className="filter-bar__inner container">
        <div className="filter-bar__nav">
          <button
            type="button"
            className="filter-bar__day-btn"
            onClick={() => onDayChange("1日目")}
            aria-label="1日目の予定を表示"
          >
            1日目
          </button>
          <button
            type="button"
            className="filter-bar__day-btn"
            onClick={() => onDayChange("夜")}
            aria-label="夜の予定を表示"
          >
            夜
          </button>
          <button
            type="button"
            className="filter-bar__day-btn"
            onClick={() => onDayChange("2日目")}
            aria-label="2日目の予定を表示"
          >
            2日目
          </button>
          <button
            type="button"
            className="filter-bar__day-btn"
            onClick={() => onDayChange("すべて")}
            aria-label="すべての予定を表示"
          >
            すべて
          </button>
        </div>

        <div className="filter-bar__actions">
          <button
            type="button"
            className="filter-bar__fav-btn"
            onClick={() => onFavoritesToggle(true)}
            aria-pressed={false}
            aria-label="お気に入りのみを表示"
          >
            <span className="filter-bar__fav-icon" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </span>
            お気に入り
          </button>

          <div className="filter-bar__category-chip">
            <button
              type="button"
              className="filter-bar__chip filter-bar__chip--active"
              onClick={() => onCategoryChange(null)}
            >
              {CATEGORY_LABELS["moment"]}
            </button>
            <button
              type="button"
              className="filter-bar__chip"
              onClick={() => onCategoryChange("attraction")}
            >
              {CATEGORY_LABELS["attraction"]}
            </button>
            <button
              type="button"
              className="filter-bar__chip"
              onClick={() => onCategoryChange("food")}
            >
              {CATEGORY_LABELS["food"]}
            </button>
            <button
              type="button"
              className="filter-bar__chip"
              onClick={() => onCategoryChange("show")}
            >
              {CATEGORY_LABELS["show"]}
            </button>
            <button
              type="button"
              className="filter-bar__chip"
              onClick={() => onCategoryChange("rest")}
            >
              {CATEGORY_LABELS["rest"]}
            </button>
          </div>
        </div>

        <button
          type="button"
          className="filter-bar__reset-btn"
          onClick={onReset}
          aria-label="絞り込みをリセット"
        >
          全件表示
        </button>
      </div>
    </section>
  );
}