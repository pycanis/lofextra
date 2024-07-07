export const messages = {
  LOCAL_FIRST_EXPENSE_TRACKER: "local-first expense tracker",
  TO_APP: "to app",
};

export type TranslationId = keyof typeof messages;

export type TranslationMessages = Partial<Record<TranslationId, string>>;

export const locales = ["en", "es"] as const;

export type Locale = (typeof locales)[number];
