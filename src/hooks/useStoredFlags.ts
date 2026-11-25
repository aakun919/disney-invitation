import { useCallback, useEffect, useMemo, useState } from "react";
import { buildKey, STORAGE_CHANGED_EVENT } from "./useLocalStorageState";

/**
 * 複数の localStorage フラグ（check: / favorite:）をまとめて読み、
 * 変更を購読するフック（D1 持ち物の進捗・D2 お気に入り件数/絞り込み用）。
 *
 * - 値は useLocalStorageState と同じ保存形式（JSON の { value }）から読む
 * - 不正な保存値は false として扱い、クラッシュしない
 * - 同一ウィンドウ内の変更は STORAGE_CHANGED_EVENT、別タブは storage イベントで検知する
 */
export function useStoredFlags(
  prefix: "check" | "favorite",
  ids: string[]
): Record<string, boolean> {
  const idsKey = ids.join("\n");
  const stableIds = useMemo(() => idsKey.split("\n").filter(Boolean), [idsKey]);

  const readAll = useCallback((): Record<string, boolean> => {
    const result: Record<string, boolean> = {};
    for (const id of stableIds) {
      result[id] = false;
      try {
        const raw = window.localStorage.getItem(buildKey(`${prefix}:${id}`));
        if (raw === null) continue;
        const parsed: unknown = JSON.parse(raw);
        if (
          parsed !== null &&
          typeof parsed === "object" &&
          "value" in parsed &&
          typeof (parsed as { value: unknown }).value === "boolean"
        ) {
          result[id] = (parsed as { value: boolean }).value;
        }
      } catch {
        /* 読めない値は false のまま */
      }
    }
    return result;
  }, [prefix, stableIds]);

  const [flags, setFlags] = useState<Record<string, boolean>>(readAll);

  useEffect(() => {
    setFlags(readAll());
    const refresh = () => setFlags(readAll());
    window.addEventListener(STORAGE_CHANGED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(STORAGE_CHANGED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [readAll]);

  return flags;
}
