export type DataStatus = "sample" | "confirmed";

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
  status: DataStatus;
}

export interface DayPlan {
  id: string;
  /** [REPLACE] 実日程に置き換えること（check:content --strict が sample を検出します） */
  dateLabel: string;
  parkName: string;
  parkLatin: string;
  intro: string;
  items: ScheduleItem[];
}
