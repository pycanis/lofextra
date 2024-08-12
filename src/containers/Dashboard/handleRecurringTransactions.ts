import { queryClient, type SQLocal } from "@lofik/react";
import { QueryKeys } from "../../queries";
import { getUnixTimestamp } from "../../utils/dates";
import type { RecurringTransaction, Transaction } from "../../validators/types";

const countCurrentIndex = (
  recurringTransaction: RecurringTransaction
): number | undefined => {
  const now = getUnixTimestamp();

  const startsAt = new Date(recurringTransaction.createdAt);

  let iterationTimestamp =
    startsAt.getDate() <= recurringTransaction.repeatDay
      ? new Date(startsAt).setDate(recurringTransaction.repeatDay)
      : new Date(
          new Date(startsAt).setDate(recurringTransaction.repeatDay)
        ).setMonth(startsAt.getMonth() + 1);

  if (iterationTimestamp > now) {
    return;
  }

  let index = 0;

  while (iterationTimestamp < now) {
    index++;

    iterationTimestamp = new Date(iterationTimestamp).setMonth(
      new Date(iterationTimestamp).getMonth() + 1
    );
  }

  return index;
};

export const handleRecurringTransactions = async (
  sqlocal: SQLocal,
  { pubKeyHex }: { pubKeyHex: string; deviceId: string }
) => {
  let shouldRefetch = false;

  const recurringTransactions: RecurringTransaction[] = await sqlocal.sql(
    `SELECT * FROM recurringTransactions WHERE pubKeyHex = '${pubKeyHex}' AND deletedAt IS NULL`
  );

  for (const recurringTransaction of recurringTransactions) {
    const { id, title, amount, categoryId, createdAt } = recurringTransaction;

    const transactions: Transaction[] = await sqlocal.sql(
      `SELECT * FROM transactions WHERE recurringTransactionId = '${id}' ORDER BY recurringTransactionIndex`
    );

    const maxIndex =
      transactions[transactions.length - 1]?.recurringTransactionIndex;

    const currentIndex = countCurrentIndex(recurringTransaction);

    if (!currentIndex || currentIndex === maxIndex) {
      continue;
    }

    const startsAt = new Date(createdAt);

    let adjustedMaxIndex = maxIndex ?? 1;

    while (adjustedMaxIndex <= currentIndex) {
      const createdAt = new Date(
        new Date(startsAt).setDate(recurringTransaction.repeatDay)
      ).setMonth(
        startsAt.getMonth() +
          adjustedMaxIndex +
          (startsAt.getDate() <= recurringTransaction.repeatDay ? -1 : 0)
      );

      await sqlocal.sql(
        `INSERT INTO transactions (id, title, amount, pubKeyHex, categoryId, updatedAt, createdAt, recurringTransactionId, recurringTransactionIndex) VALUES ('${crypto.randomUUID()}', '${title}', ${amount}, '${pubKeyHex}', ${
          categoryId ? `'${categoryId}'` : null
        }, ${getUnixTimestamp()}, ${createdAt}, '${id}', ${adjustedMaxIndex})`
      );

      shouldRefetch = true;

      adjustedMaxIndex++;
    }
  }

  if (shouldRefetch) {
    for (const queryKey of Object.keys(QueryKeys)) {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    }
  }
};
