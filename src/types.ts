export type DataStatus = "sample" | "tentative" | "confirmed";

export type CategoryId =
  | "moment"
  | "attraction"
  | "food"
  | "show"
  | "rest"
  | "shopping";

export interface Category {
  id: CategoryId;
  label: string;
}

export interface ScheduleItem {
  id: string;
  /** 表示用の時刻 "HH:mm"。未確定の場合は空文字にしないこと（check:content が検出します） */
  time: string;
  endTime?: string;
  title: string;
  subtitle?: string;
  description: string;
  category: CategoryId;
  location?: string;
  duration?: string;
  tips?: string[];
  /**
   * 情報の確定度。
   * - sample: 制作段階の仮データ（本番前に実データへ差し替え必須）
   * - tentative: 実情報だが未確定・調整中（画面に「調整中」と表示される）
   * - confirmed: 確定情報（画面に「確定」と表示される）
   */
  status: DataStatus;
}

export interface DayPlan {
  id: string;
  /** [REPLACE] 実日程に置き換えること（check:content --strict が sample を検出します） */
  dateLabel: string;
  /** 表示用の日付（例: "2027年3月13日（土）"）。未設定なら表示しない */
  dateText?: string;
  /** 機械可読な日付（"YYYY-MM-DD"）。当日モード（B1）の判定に使う */
  dateISO?: string;
  parkName: string;
  parkLatin: string;
  intro: string;
  items: ScheduleItem[];
}
