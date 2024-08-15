import { useCallback, useMemo } from "react";
import { useConfigContext } from "../containers/Dashboard/Config/ConfigContext";

export const useFormatCurrency = () => {
  const { baseCurrency, showSats } = useConfigContext();

  const formatCurrency = useCallback((num: number, currency?: string) => {
    const curr = currency || baseCurrency;

    const isBtc = curr === "BTC";

    const formatter = new Intl.NumberFormat(navigator.language, {
      currency: curr,
      style: isBtc ? "decimal" : "currency",
      minimumFractionDigits: isBtc ? (showSats ? 0 : 8) : undefined,
      maximumFractionDigits: isBtc ? (showSats ? 0 : 8) : undefined,
    });

    return `${
      isBtc
        ? showSats
          ? formatter.format(num * 100000000) + " sats"
          : `₿${formatter.format(num)}`
        : formatter.format(num)
    }`;
  }, []);

  return useMemo(() => ({ formatCurrency }), [formatCurrency]);
};
