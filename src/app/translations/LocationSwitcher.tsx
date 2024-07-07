import { useLocalStorage } from "../../hooks/useLocalStorage";
import { Locale } from "./messages";

export const LocationSwitcher = () => {
  const [locale, setLocale] = useLocalStorage<Locale>("locale", "en");

  return (
    <ul>
      <li onClick={() => setLocale("en")}>en</li>
      <li onClick={() => setLocale("es")}>es</li>
      Selected: <strong>{locale}</strong>
    </ul>
  );
};
