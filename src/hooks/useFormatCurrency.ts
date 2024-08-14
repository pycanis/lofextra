import { useCallback, useMemo } from "react";
import { useConfigContext } from "../containers/Dashboard/Config/ConfigContext";

export const useFormatCurrency = () => {
  const { baseCurrency } = useConfigContext();

  const formatCurrency = useCallback((num: number, currency?: string) => {
    const formatter = new Intl.NumberFormat(navigator.language, {
      currency: currency || baseCurrency,
      style: "currency",
    });

    return formatter.format(num);
  }, []);

  return useMemo(() => ({ formatCurrency }), [formatCurrency]);
};
