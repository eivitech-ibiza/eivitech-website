import type { HomeCareContentFile, HomeCareLanguage } from "./homeCare365";

export declare const HOME_CARE_PATH: "/home-care-365";
export declare const HOME_CARE_SOURCE: "home-care-365";

export declare function homeCareStructuredData(
  content: HomeCareContentFile,
  language: HomeCareLanguage,
): Record<string, unknown>[];

export declare function homeCareStaticHtml(
  content: HomeCareContentFile,
  language: HomeCareLanguage,
  contact: { phone: string; email: string },
): string;
