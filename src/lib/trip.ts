/**
 * 旅行日程に関する日付ユーティリティ（すべて日本時間 JST 基準）。
 * 「日付で変わる挨拶」「当日モード」「エピローグ」の出し分けに使う。
 * ここで扱うのはページに公開済みの日程情報のみ。
 */

export const DEPARTURE_ISO = "2027-03-12";
export const DAY1_ISO = "2027-03-13";
export const DAY2_ISO = "2027-03-14";

export type TripPhase =
  | "before" // 出発まで8日以上
  | "soon" // 出発まで7日〜前日
  | "departure" // 3/12 出発日
  | "day1" // 3/13
  | "day2" // 3/14
  | "after"; // 3/15 以降

/** JST の今日を "YYYY-MM-DD" で返す */
export function jstToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** JST の現在時刻を 0:00 からの分数で返す */
export function jstNowMinutes(): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

export function tripPhase(today: string = jstToday()): TripPhase {
  if (today >= "2027-03-15") return "after";
  if (today === DAY2_ISO) return "day2";
  if (today === DAY1_ISO) return "day1";
  if (today === DEPARTURE_ISO) return "departure";
  if (today >= "2027-03-05") return "soon";
  return "before";
}

/** 出発までの日数（過ぎていれば null） */
export function daysUntilDeparture(today: string = jstToday()): number | null {
  const start = Date.parse(`${today}T00:00:00+09:00`);
  const goal = Date.parse(`${DEPARTURE_ISO}T00:00:00+09:00`);
  const days = Math.round((goal - start) / 86_400_000);
  return days > 0 ? days : null;
}

/** "HH:mm" を 0:00 からの分数にする（解釈できなければ null） */
export function parseTimeToMinutes(time: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

/* ---- D3: 時間帯で変わる空気（2026-11-25 追加） ---- */

export type DayPart = "morning" | "daytime" | "evening" | "night";

/** JST の現在時刻から時間帯を返す（朝 5–11 / 昼 11–17 / 夕 17–23 / 夜 23–5） */
export function jstDayPart(minutes: number = jstNowMinutes()): DayPart {
  if (minutes >= 5 * 60 && minutes < 11 * 60) return "morning";
  if (minutes >= 11 * 60 && minutes < 17 * 60) return "daytime";
  if (minutes >= 17 * 60 && minutes < 23 * 60) return "evening";
  return "night";
}

/**
 * 時間帯の挨拶（控えめなものだけを返す。昼・夕は null で何も出さない）。
 * フェーズ挨拶（A3）とは別に、時刻そのものへの小さな応答として使う。
 */
export const DAYPART_GREETING: Record<DayPart, string | null> = {
  morning: "おはようございます。素敵な一日のはじまりです。",
  daytime: null,
  evening: null,
  night: "夜の帳が下りました。星空とともに、しおりを開きましょう。",
};
