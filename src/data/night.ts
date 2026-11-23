import type { DayPlan } from "../types";

export const NIGHT: DayPlan = {
  id: "night",
  dateLabel: "夜",
  parkName: "",
  parkLatin: "",
  intro: "",
  items: [
    {
      id: "night-special",
      time: "19:30",
      endTime: "21:00",
      title: "今夜は少し特別な時間を過ごそう",
      description: "",
      category: "moment",
      status: "sample",
    },
    {
      id: "night-stroll",
      time: "21:00",
      title: "夜の散歩",
      description: "",
      category: "moment",
      status: "sample",
    },
  ],
};
