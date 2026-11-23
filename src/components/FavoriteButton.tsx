import { useLocalStorageState } from "../hooks/useLocalStorageState";

interface FavoriteButtonProps {
  id: string;
  /** 対象アイテムのタイトル（aria-label とスクリーンリーダー用に使う。画面表示は「お気に入り」で統一） */
  label?: string;
}

/**
 * お気に入り登録ボタン。
 * - localStorage に `favorite:${id}` として永続化
 * - aria-pressed / aria-label で状態を伝達
 * - キーボード操作（Enter/Space）に対応（button 要素標準）
 * - タップ領域はデザイントークン --tap-min (44px) を下回らない
 * - 画面上のラベルは「お気に入り」で統一し、対象タイトルは sr-only で併記する
 *   （カード見出しとボタン文言でタイトルが二重表示されるのを避ける）
 */
export default function FavoriteButton({ id, label }: FavoriteButtonProps) {
  const [favorited, setFavorite, error] = useLocalStorageState<boolean>(
    `favorite:${id}`,
    false,
    {
      validate: (v): v is boolean => typeof v === "boolean",
      onError: (_msg) => {
        /* コンソールには出力済み（useLocalStorageState 内）。UI では title で控えめに案内 */
      },
    }
  );

  return (
    <button
      type="button"
      className={`favorite-button ${favorited ? "favorite-button--active" : ""}`}
      onClick={() => setFavorite(!favorited)}
      aria-pressed={favorited}
      aria-label={
        label
          ? `${label}をお気に入り${favorited ? "から外す" : "に追加する"}`
          : undefined
      }
      title={error ?? undefined}
    >
      <svg
        className="favorite-button__star"
        viewBox="0 0 24 24"
        aria-hidden="true"
        fill={favorited ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      <span className="favorite-button__label">お気に入り</span>
      {label && <span className="sr-only">{label}</span>}
    </button>
  );
}
