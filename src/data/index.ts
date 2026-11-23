import { DAY1 } from "./day1";
import { NIGHT } from "./night";
import { DAY2 } from "./day2";

export { DAY1, NIGHT, DAY2 };

export const ALL_PLANS = [DAY1, NIGHT, DAY2] as const;

export type PlanId = (typeof ALL_PLANS)[number]["id"];
