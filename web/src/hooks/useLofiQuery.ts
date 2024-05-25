import {
  QueryKey,
  UndefinedInitialDataOptions,
  useQuery,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { ZodSchema, optional } from "zod";
import { useDatabaseContext } from "./contexts";

type Params<T extends ZodSchema> = {
  sql: string;
  schema: T;
  options: Omit<
    UndefinedInitialDataOptions<unknown, Error, unknown, QueryKey>,
    "queryFn"
  >;
};
export const useLofiQuery = <T extends ZodSchema>({
  sql,
  schema,
  options,
}: Params<T>) => {
  const { db } = useDatabaseContext();
  const query = useQuery({ ...options, queryFn: () => db.selectObjects(sql) });

  const validatedData = useMemo(
    () => optional(schema).parse(query.data),
    [query.data, schema]
  );

  return {
    ...query,
    data: validatedData,
  };
};
