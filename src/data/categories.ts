import type { Category, CategoryId } from "../types";

export const CATEGORIES: Category[] = [
  { id: "moment", label: "ひととき" },
  { id: "attraction", label: "アトラクション" },
  { id: "food", label: "食事" },
  { id: "show", label: "ショー・パレード" },
  { id: "rest", label: "休憩" },
  { id: "shopping", label: "ショッピング" },
];

export const CATEGORY_LABEL: Record<CategoryId, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.label]),
) as Record<CategoryId, string>;
