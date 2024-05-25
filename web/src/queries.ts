export enum QueryKeys {
  GET_ACCOUNT = "GET_ACCOUNT",
  GET_DEVICE = "GET_DEVICE",
  GET_CATEGORIES = "GET_CATEGORIES",
  GET_STATISTICS_TRANSACTIONS_IN_CATEGORY = "GET_STATISTICS_TRANSACTIONS_IN_CATEGORY",
  GET_STATISTICS = "GET_STATISTICS",
  GET_TRANSACTIONS = "GET_TRANSACTIONS",
  GET_TRANSACTIONS_TOTAL = "GET_TRANSACTIONS_TOTAL",
}

export const queries: Record<QueryKeys, { refetchOnRemoteUpdate: boolean }> = {
  [QueryKeys.GET_ACCOUNT]: {
    refetchOnRemoteUpdate: false,
  },
  [QueryKeys.GET_DEVICE]: {
    refetchOnRemoteUpdate: false,
  },
  [QueryKeys.GET_CATEGORIES]: {
    refetchOnRemoteUpdate: true,
  },
  [QueryKeys.GET_STATISTICS_TRANSACTIONS_IN_CATEGORY]: {
    refetchOnRemoteUpdate: true,
  },
  [QueryKeys.GET_STATISTICS]: {
    refetchOnRemoteUpdate: true,
  },
  [QueryKeys.GET_TRANSACTIONS]: {
    refetchOnRemoteUpdate: true,
  },
  [QueryKeys.GET_TRANSACTIONS_TOTAL]: {
    refetchOnRemoteUpdate: true,
  },
};
