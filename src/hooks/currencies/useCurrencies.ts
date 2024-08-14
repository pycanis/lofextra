import { useCallback, useMemo } from "react";
import { useConfigContext } from "../../containers/Dashboard/Config/ConfigContext";
import { getUnixTimestamp } from "../../utils/dates";
import { getCnbBaseCurrencyExchangeRate } from "./apis/cnbApi";
import { getBitcoinVsCurrencyExchangeRate } from "./apis/coingeckoApi";

type GetAmountInCurrencyParams = {
  currency: string;
  createdAt: number;
  baseCurrency?: string;
  amount: number;
};

export const useCurrencies = () => {
  const { baseCurrency: baseCurrencyConfig } = useConfigContext();

  const getAmountInCurrency = useCallback(
    async ({
      currency,
      baseCurrency = baseCurrencyConfig,
      createdAt,
      amount,
    }: GetAmountInCurrencyParams) => {
      if (baseCurrency === currency) {
        return amount;
      }

      if (baseCurrency === "BTC" || currency === "BTC") {
        if (createdAt <= getUnixTimestamp() - 1000 * 60 * 60 * 24 * 365) {
          return alert(
            "Can't get Bitcoin price older than a year from Coingecko API"
          );
        }

        const exchangeRate = await getBitcoinVsCurrencyExchangeRate(
          baseCurrency === "BTC" ? currency : baseCurrency,
          createdAt
        );

        if (!exchangeRate) {
          return alert(
            "Failed to get or parse exchange rates from Coingecko API"
          );
        }

        return baseCurrency === "BTC"
          ? amount / exchangeRate
          : amount * exchangeRate;
      }

      const exchangeRate = await getCnbBaseCurrencyExchangeRate(
        baseCurrency,
        currency,
        createdAt
      );

      if (!exchangeRate) {
        return alert("Failed to get or parse exchange rates from CNB API");
      }

      return amount * exchangeRate;
    },
    [baseCurrencyConfig]
  );

  return useMemo(() => ({ getAmountInCurrency }), [getAmountInCurrency]);
};
