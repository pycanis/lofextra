import { useLofikQuery } from "@lofik/react";
import { useMemo } from "react";
import { QueryKeys } from "../containers/Dashboard/constants";
import { currenciesSchema } from "../validators/validators";
import { Select } from "./Select";

type Props = {
  name: string;
  label?: string;
} & React.DetailedHTMLProps<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  HTMLSelectElement
>;

export const CurrencyPicker = ({ name, label, ...props }: Props) => {
  const { data } = useLofikQuery({
    sql: `SELECT * FROM currencies ORDER BY sortOrder`,
    schema: currenciesSchema,
    queryKey: [QueryKeys.GET_CURRENCIES],
  });

  const options = useMemo(
    () =>
      data?.map(({ code, currency }) => ({
        label: `${code} - ${currency}`,
        value: code,
      })),
    [data]
  );

  return (
    <Select
      name={name}
      options={options}
      label={label || "currency"}
      {...props}
    />
  );
};
