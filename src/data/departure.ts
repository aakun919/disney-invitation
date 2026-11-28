import type { DayPlan } from "../types";

export const DEPARTURE: DayPlan = {
  id: "departure",
  dateLabel: "出発の日",
  dateText: "2027年3月12日（金）",
  dateISO: "2027-03-12",
  parkName: "",
  parkLatin: "DEPARTURE",
  intro:
    "夕方、名古屋を出発して東京へ。旅の始まりは、夜の新幹線から。",
  items: [
    {
      id: "dep-train",
      time: "19:20",
      endTime: "20:57",
      title: "のぞみ46号で東京へ",
      description: "名古屋駅19:20発、東京駅20:57着。夜の新幹線で、いよいよ旅の始まりです。",
      category: "moment",
      location: "名古屋駅 → 東京駅",
      status: "confirmed",
    },
    {
      id: "dep-checkin",
      time: "22:00",
      title: "ホテルにチェックイン",
      description: "到着は22:00ごろの予定です。禁煙ダブルのお部屋で、明日のランドに備えてゆっくり休みます。",
      category: "rest",
      location: "相鉄グランドフレッサ東京ベイ有明",
      status: "confirmed",
    },
  ],
};
