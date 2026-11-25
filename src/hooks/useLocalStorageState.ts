import { useCallback, useRef, useState } from "react";

const STORAGE_NAMESPACE = "disney-invitation";
const STORAGE_VERSION = "v1";

/**
 * 同一ウィンドウ内で localStorage の変更を他コンポーネントへ知らせるイベント。
 * 標準の storage イベントは同一ウィンドウでは発火しないため、
 * お気に入り件数の集計や持ち物リストの進捗など、別コンポーネントが
 * 同じ保存値を参照する場面（D1/D2）で使う。detail は { key } のみ。
 */
export const STORAGE_CHANGED_EVENT = "disney-invitation:storage-changed";

function buildKey(suffix: string) {
  return `${STORAGE_NAMESPACE}:${STORAGE_VERSION}:${suffix}`;
}

/**
 * localStorage を安全に読み書きするための汎用フック。
 *
 * - 保存キーはプロジェクト専用の名前空間＋バージョン＋サフィックス
 * - JSON パース失敗・型不正・不正データは初期値にフォールバック
 * - 読み書き失敗時も画面上の状態は維持し、エラー文字列を返す
 * - localStorage が利用不可の環境でも画面内操作は可能
 * - React の state updater 内では副作用を実行しない
 */
export function useLocalStorageState<T>(
  suffix: string,
  initialValue: T,
  options?: {
    validate?: (value: unknown) => boolean;
    onError?: (message: string) => void;
  }
): [T, (next: T | ((prev: T) => T)) => void, string | null] {
  const key = buildKey(suffix);
  const { validate, onError } = options ?? {};

  const readStored = useCallback((): T => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return initialValue;

      const parsed: unknown = JSON.parse(raw);
      if (parsed === null || typeof parsed !== "object" || !("value" in parsed)) {
        return initialValue;
      }

      const candidate = (parsed as { value: unknown }).value;
      if (validate && !validate(candidate)) return initialValue;

      return candidate as T;
    } catch {
      return initialValue;
    }
  }, [key, initialValue, validate]);

  const [value, setValue] = useState<T>(readStored);
  const valueRef = useRef(value);
  const [storageError, setStorageError] = useState<string | null>(null);

  const setStoredValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved =
        typeof next === "function"
          ? (next as (prev: T) => T)(valueRef.current)
          : next;

      valueRef.current = resolved;
      setValue(resolved);
      setStorageError(null);

      try {
        window.localStorage.setItem(
          key,
          JSON.stringify({ value: resolved, ts: Date.now() })
        );
      } catch {
        const message = `localStorage write failed for key "${key}"`;
        setStorageError(message);
        onError?.(message);
      }

      // 同一ウィンドウの他コンポーネントへ変更を通知する（集計表示などのため。
      // 購読側は localStorage を読み直すので、必ず保存の後に発火させる）
      try {
        window.dispatchEvent(
          new CustomEvent(STORAGE_CHANGED_EVENT, { detail: { key } })
        );
      } catch {
        /* 通知に失敗しても状態更新自体は継続する */
      }
    },
    [key, onError]
  );

  return [value, setStoredValue, storageError];
}

export { STORAGE_NAMESPACE, STORAGE_VERSION, buildKey };
