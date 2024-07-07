"use client";

import { IntlProvider } from "react-intl";
import { ReactNode, useEffect, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Locale, TranslationMessages, messages } from "./translations/messages";

const getMessages = async (locale: Locale): Promise<TranslationMessages> => {
  if (locale === "es") {
    return (await import("./translations/es")).messages_ES;
  }

  return (await import("./translations/messages")).messages;
};

export const App = ({ children }: { children: ReactNode }) => {
  const [locale] = useLocalStorage<Locale>("locale", "en");

  const [messages, setMessages] = useState<TranslationMessages | null>(null);

  useEffect(() => {
    getMessages(locale).then((value) => {
      setMessages(value);
    });
  }, [locale, setMessages]);

  if (messages === null) {
    return null;
  }

  return (
    <IntlProvider messages={messages} locale={locale} defaultLocale="en">
      {children}
    </IntlProvider>
  );
};
