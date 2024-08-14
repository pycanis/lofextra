import { zodResolver } from "@hookform/resolvers/zod";
import {
  DatabaseMutationOperation,
  useLofikAccount,
  useLofikMutation,
} from "@lofik/react";
import Mexp from "math-expression-evaluator";
import { z, type TypeOf } from "zod";
import { CategoryPicker } from "../../../components/CategoryPicker";
import { CurrencyPicker } from "../../../components/CurrencyPicker";
import { Form } from "../../../components/Form";
import { Input } from "../../../components/Input";
import { useCurrencies } from "../../../hooks/currencies/useCurrencies";
import { useRefetchQueries } from "../../../hooks/useRefetchQueries";
import {
  appendSecondsAndMilis,
  formatDateForInput,
  getDateFromTimestamp,
  getUnixTimestamp,
} from "../../../utils/dates";
import { type Transaction as TransactionType } from "../../../validators/types";
import { TableNames } from "../constants";
import styles from "./styles.module.css";

export type FormTransaction = Omit<
  TransactionType,
  "id" | "amount" | "baseAmount" | "pubKeyHex" | "updatedAt" | "deletedAt"
> & { id: string | null; amount: number | null; baseAmount: number | null };

type Props = {
  transaction: FormTransaction;
  onSuccess?: () => void;
  onCancel?: () => void;
};

const schema = z.object({
  title: z.string(),
  amount: z.string(),
  categoryId: z.string().nullable(),
  createdAt: z.string(),
  currency: z.string(),
});

type FormValues = TypeOf<typeof schema>;

const mexp = new Mexp();

export const TransactionForm = ({
  transaction,
  onSuccess,
  onCancel,
}: Props) => {
  const { pubKeyHex } = useLofikAccount();
  const { getAmountInCurrency } = useCurrencies();

  const refetchQueries = useRefetchQueries();
  const { mutate } = useLofikMutation({
    shouldSync: true,
    onSuccess: () => {
      refetchQueries();

      onSuccess?.();
    },
  });

  const onSubmit = async ({
    categoryId,
    title,
    amount,
    createdAt: createdAtValue,
    currency,
  }: FormValues) => {
    let amountEval: number;

    try {
      amountEval = mexp.eval(amount);
    } catch (err) {
      alert(err);

      return;
    }

    const createdAt = getUnixTimestamp(
      new Date(appendSecondsAndMilis(transaction.createdAt, createdAtValue))
    );

    const baseAmount =
      transaction.amount !== amountEval ||
      transaction.currency !== currency ||
      transaction.createdAt !== createdAt
        ? await getAmountInCurrency({
            amount: amountEval,
            createdAt,
            currency,
          })
        : transaction.baseAmount;

    if (!baseAmount) {
      return;
    }

    mutate({
      operation: DatabaseMutationOperation.Upsert,
      tableName: TableNames.TRANSACTIONS,
      columnDataMap: {
        id: transaction.id || crypto.randomUUID(),
        title,
        amount: Math.abs(amountEval),
        pubKeyHex,
        currency,
        baseAmount,
        categoryId: categoryId || null,
        deletedAt: null,
        createdAt,
      },
    });
  };

  return (
    <Form<FormValues>
      onSubmit={onSubmit}
      resolver={zodResolver(schema)}
      values={{
        categoryId: transaction.categoryId,
        createdAt: formatDateForInput(
          getDateFromTimestamp(transaction.createdAt)
        ),
        title: transaction.title,
        amount: transaction.amount?.toString() ?? "",
        currency: transaction.currency,
      }}
    >
      <fieldset>
        <Input name="title" placeholder="title" aria-label="title" autoFocus />

        <div role="group">
          <div className={`${styles["margin-right"]} ${styles.flex}`}>
            <CategoryPicker name="categoryId" />
          </div>

          <div className={styles.flex}>
            <Input name="createdAt" aria-label="date" type="datetime-local" />
          </div>
        </div>

        <div role="group">
          <div className={`${styles["margin-right"]} ${styles.flex}`}>
            <Input
              name="amount"
              placeholder="5+5"
              aria-label="amount"
              inputMode="tel"
            />
          </div>

          <div className={styles.flex}>
            <CurrencyPicker name="currency" />
          </div>
        </div>
      </fieldset>

      <div className={styles["flex-container"]}>
        <button
          type="button"
          className={`contrast ${styles.flex} ${styles["no-margin-bottom"]}`}
          onClick={onCancel}
        >
          cancel
        </button>

        <button
          className={`${styles.flex} ${styles["no-margin-bottom"]}`}
          type="submit"
        >
          {transaction.id ? "save" : "create"}
        </button>
      </div>
    </Form>
  );
};
