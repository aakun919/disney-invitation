interface FilterBarProps {
  favoritesOnly: boolean;
  favoritesCount: number;
  onFavoritesOnlyChange: (next: boolean) => void;
}

/**
 * D2: お気に入りだけを見るためのバー。
 * - お気に入りの件数を表示し、ON の間は各タイムラインがお気に入りのみ表示になる
 * - 状態は持たず、Preview が保持する favoritesOnly を受け取るだけの制御コンポーネント
 * （旧 FilterBar は未接続だったため、この形に置き換えた）
 */
export default function FilterBar({
  favoritesOnly,
  favoritesCount,
  onFavoritesOnlyChange,
}: FilterBarProps) {
  return (
    <div className="filter-bar reveal">
      <p className="filter-bar__count" aria-live="polite">
        お気に入り <span className="filter-bar__count-num">{favoritesCount}</span> 件
      </p>
      <button
        type="button"
        className={`filter-bar__fav-btn${favoritesOnly ? " is-active" : ""}`}
        onClick={() => onFavoritesOnlyChange(!favoritesOnly)}
        aria-pressed={favoritesOnly}
        aria-label="お気に入りだけを表示"
      >
        <svg
          className="filter-bar__fav-icon"
          viewBox="0 0 24 24"
          width="14"
          height="14"
          aria-hidden="true"
          fill={favoritesOnly ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        お気に入りだけ
      </button>
    </div>
  );
}
