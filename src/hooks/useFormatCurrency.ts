import { useCallback, useMemo } from "react";
import { useConfigContext } from "../containers/Dashboard/Config/ConfigContext";

export const useFormatCurrency = () => {
  const { baseCurrency } = useConfigContext();

  const formatCurrency = useCallback((num: number, currency?: string) => {
    const curr = currency || baseCurrency;

    const formatter = new Intl.NumberFormat(navigator.language, {
      currency: curr,
      style: "currency",
      minimumFractionDigits: curr === "BTC" ? 8 : undefined,
    });

    return formatter.format(num);
  }, []);

  return useMemo(() => ({ formatCurrency }), [formatCurrency]);
};
