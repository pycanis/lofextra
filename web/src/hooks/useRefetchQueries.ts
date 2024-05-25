import { QueryKeys, queries } from "@/queries";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

export const useRefetchQueries = () => {
  const queryClient = useQueryClient();

  const refetch = useCallback(() => {
    for (const queryKey of Object.keys(queries)) {
      if (queries[queryKey as QueryKeys].refetchOnRemoteUpdate) {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      }
    }
  }, [queryClient]);

  return useMemo(() => refetch, [refetch]);
};
