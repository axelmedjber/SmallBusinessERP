import { translations } from "./utils";

// Language types
export type Language = "en" | "fr" | "ar";
export type Direction = "ltr" | "rtl";
export type TranslationType = typeof translations['en'];

// Financial dashboard types
export type PeriodType = "monthly" | "quarterly" | "yearly" | "custom";