import { sqlocal, type SQLocal } from "@lofik/react";
import { getUnixTimestamp } from "../../utils/dates";

enum Migrations {
  CategoriesSortColumn = "CategoriesSortColumn",
  RecurringTransactions = "RecurringTransactions",
  Currencies = "Currencies",
}

const findMigration = async (sqlocal: SQLocal, migration: Migrations) => {
  const data = await sqlocal.sql(
    `SELECT * FROM migrations WHERE name = '${migration}'`
  );

  return data[0];
};

const createMigration = async (sql = sqlocal.sql, migration: Migrations) => {
  await sql(
    `INSERT INTO migrations (name, createdAt) VALUES ('${migration}', ${getUnixTimestamp()});`
  );
};

const categoriesSortColumnMigration = async (sqlocal: SQLocal) => {
  const migration = await findMigration(
    sqlocal,
    Migrations.CategoriesSortColumn
  );

  if (migration) {
    return;
  }

  await sqlocal.transaction(async (tx) => {
    await tx.sql("ALTER TABLE categories ADD COLUMN sortOrder INTEGER");

    const categories = await tx.sql(
      "SELECT * FROM categories WHERE deletedAt IS NULL ORDER BY createdAt ASC"
    );

    const groupedCategoriesByPubKeyHex = Object.groupBy(
      categories,
      (c) => c.pubKeyHex
    );

    for (const pubKeyHex of Object.keys(groupedCategoriesByPubKeyHex)) {
      const categoriesByPubKeyHex = groupedCategoriesByPubKeyHex[pubKeyHex];

      for (const [i, category] of (categoriesByPubKeyHex ?? []).entries()) {
        await tx.sql(
          `UPDATE categories SET sortOrder = ${i + 1} WHERE id = '${
            category.id
          }'`
        );
      }
    }

    await createMigration(tx.sql, Migrations.CategoriesSortColumn);
  });
};

const recurringTransactionsMigration = async (sqlocal: SQLocal) => {
  const migration = await findMigration(
    sqlocal,
    Migrations.RecurringTransactions
  );

  if (migration) {
    return;
  }

  await sqlocal.transaction(async (tx) => {
    await tx.sql(
      "CREATE TABLE recurringTransactions (id VARCHAR(40) PRIMARY KEY, title TEXT NOT NULL, amount REAL NOT NULL, currency TEXT DEFAULT 'USD', categoryId VARCHAR(40), repeatDay INTEGER NOT NULL, repeatInterval TEXT NOT NULL CHECK(repeatInterval IN ('month')), pubKeyHex TEXT NOT NULL, deletedAt INTEGER, updatedAt INTEGER NOT NULL, createdAt INTEGER NOT NULL, FOREIGN KEY (categoryId) REFERENCES categories(id))"
    );

    await tx.sql(
      "ALTER TABLE transactions ADD COLUMN recurringTransactionId VARCHAR(40)"
    );

    await tx.sql(
      "ALTER TABLE transactions ADD COLUMN recurringTransactionIndex INTEGER"
    );

    await tx.sql(
      "CREATE TABLE transactionsNew (id VARCHAR(40) PRIMARY KEY, title TEXT NOT NULL, amount REAL NOT NULL, currency TEXT DEFAULT 'USD', pubKeyHex TEXT NOT NULL, categoryId VARCHAR(40), deletedAt INTEGER, updatedAt INTEGER NOT NULL, createdAt INTEGER NOT NULL, recurringTransactionId VARCHAR(40), recurringTransactionIndex INTEGER, FOREIGN KEY (recurringTransactionId) REFERENCES recurringTransactions(id))"
    );

    await tx.sql("INSERT INTO transactionsNew SELECT * FROM transactions");

    await tx.sql("DROP TABLE transactions");

    await tx.sql("ALTER TABLE transactionsNew RENAME TO transactions");

    await createMigration(tx.sql, Migrations.RecurringTransactions);
  });
};

const currenciesMigration = async (sqlocal: SQLocal) => {
  const migration = await findMigration(sqlocal, Migrations.Currencies);

  if (migration) {
    return;
  }

  const now = getUnixTimestamp();

  await sqlocal.transaction(async (tx) => {
    await tx.sql(
      "CREATE TABLE currencies (code VARCHAR(3) PRIMARY KEY, currency TEXT NOT NULL, sortOrder INTEGER NOT NULL, deletedAt INTEGER, updatedAt INTEGER NOT NULL, createdAt INTEGER NOT NULL)"
    );

    await tx.sql(
      `INSERT INTO currencies (code, currency, sortOrder, updatedAt, createdAt) VALUES ('CZK', 'Czech Koruna', 1, ${now}, ${now})`
    );
    await tx.sql(
      `INSERT INTO currencies (code, currency, sortOrder, updatedAt, createdAt) VALUES ('EUR', 'Euro', 2, ${now}, ${now})`
    );
    await tx.sql(
      `INSERT INTO currencies (code, currency, sortOrder, updatedAt, createdAt) VALUES ('USD', 'United States Dollar', 3, ${now}, ${now})`
    );
    await tx.sql(
      `INSERT INTO currencies (code, currency, sortOrder, updatedAt, createdAt) VALUES ('BTC', 'Bitcoin', 4, ${now}, ${now})`
    );
    await tx.sql(
      `INSERT INTO currencies (code, currency, sortOrder, updatedAt, createdAt) VALUES ('PLN', 'Polish Zloty', 5, ${now}, ${now})`
    );
    await tx.sql(
      `INSERT INTO currencies (code, currency, sortOrder, updatedAt, createdAt) VALUES ('GBP', 'British Pound Sterling', 6, ${now}, ${now})`
    );
    await tx.sql(
      `INSERT INTO currencies (code, currency, sortOrder, updatedAt, createdAt) VALUES ('CHF', 'Swiss Franc', 7, ${now}, ${now})`
    );
    await tx.sql(
      `INSERT INTO currencies (code, currency, sortOrder, updatedAt, createdAt) VALUES ('AUD', 'Australian Dollar', 8, ${now}, ${now})`
    );
    await tx.sql(
      `INSERT INTO currencies (code, currency, sortOrder, updatedAt, createdAt) VALUES ('BRL', 'Brazilian Real', 9, ${now}, ${now})`
    );
    await tx.sql(
      `INSERT INTO currencies (code, currency, sortOrder, updatedAt, createdAt) VALUES ('BGN', 'Bulgarian Lev', 10, ${now}, ${now})`
    );
    await tx.sql(
      `INSERT INTO currencies (code, currency, sortOrder, updatedAt, createdAt) VALUES ('CNY', 'Chinese Renminbi', 11, ${now}, ${now})`
    );
    await tx.sql(
      `INSERT INTO currencies (code, currency, sortOrder, updatedAt, createdAt) VALUES ('DKK', 'Danish Krone', 12, ${now}, ${now})`
    );
    await tx.sql(
      `INSERT INTO currencies (code, currency, sortOrder, updatedAt, createdAt) VALUES ('PHP', 'Philippine Peso', 13, ${now}, ${now})`
    );
    await tx.sql(
      `INSERT INTO currencies (code, currency, sortOrder, updatedAt, createdAt) VALUES ('HKD', 'Hong Kong Dollar', 14, ${now}, ${now})`
    );
    await tx.sql(
      `INSERT INTO currencies (code, currency, sortOrder, updatedAt, createdAt) VALUES ('INR', 'Indian Rupee', 15, ${now}, ${now})`
    );
    await tx.sql(
      `INSERT INTO currencies (code, currency, sortOrder, updatedAt, createdAt) VALUES ('IDR', 'Indonesian Rupiah', 16, ${now}, ${now})`
    );
    await tx.sql(
      `INSERT INTO currencies (code, currency, sortOrder, updatedAt, createdAt) VALUES ('ISK', 'Icelandic Króna', 17, ${now}, ${now})`
    );
    await tx.sql(
      `INSERT INTO currencies (code, currency, sortOrder, updatedAt, createdAt) VALUES ('ILS', 'Israeli New Shekel', 18, ${now}, ${now})`
    );
    await tx.sql(
      `INSERT INTO currencies (code, currency, sortOrder, updatedAt, createdAt) VALUES ('JPY', 'Japanese Yen', 19, ${now}, ${now})`
    );
    await tx.sql(
      `INSERT INTO currencies (code, currency, sortOrder, updatedAt, createdAt) VALUES ('ZAR', 'South African Rand', 20, ${now}, ${now})`
    );
    await tx.sql(
      `INSERT INTO currencies (code, currency, sortOrder, updatedAt, createdAt) VALUES ('CAD', 'Canadian Dollar', 21, ${now}, ${now})`
    );
    await tx.sql(
      `INSERT INTO currencies (code, currency, sortOrder, updatedAt, createdAt) VALUES ('KRW', 'South Korean Won', 22, ${now}, ${now})`
    );
    await tx.sql(
      `INSERT INTO currencies (code, currency, sortOrder, updatedAt, createdAt) VALUES ('HUF', 'Hungarian Forint', 23, ${now}, ${now})`
    );
    await tx.sql(
      `INSERT INTO currencies (code, currency, sortOrder, updatedAt, createdAt) VALUES ('MYR', 'Malaysian Ringgit', 24, ${now}, ${now})`
    );
    await tx.sql(
      `INSERT INTO currencies (code, currency, sortOrder, updatedAt, createdAt) VALUES ('MXN', 'Mexican Peso', 25, ${now}, ${now})`
    );
    await tx.sql(
      `INSERT INTO currencies (code, currency, sortOrder, updatedAt, createdAt) VALUES ('XDR', 'IMF Special Drawing Rights', 26, ${now}, ${now})`
    );
    await tx.sql(
      `INSERT INTO currencies (code, currency, sortOrder, updatedAt, createdAt) VALUES ('NOK', 'Norwegian Krone', 27, ${now}, ${now})`
    );
    await tx.sql(
      `INSERT INTO currencies (code, currency, sortOrder, updatedAt, createdAt) VALUES ('NZD', 'New Zealand Dollar', 28, ${now}, ${now})`
    );
    await tx.sql(
      `INSERT INTO currencies (code, currency, sortOrder, updatedAt, createdAt) VALUES ('RON', 'Romanian Leu', 29, ${now}, ${now})`
    );
    await tx.sql(
      `INSERT INTO currencies (code, currency, sortOrder, updatedAt, createdAt) VALUES ('SGD', 'Singapore Dollar', 30, ${now}, ${now})`
    );
    await tx.sql(
      `INSERT INTO currencies (code, currency, sortOrder, updatedAt, createdAt) VALUES ('SEK', 'Swedish Krona', 31, ${now}, ${now})`
    );
    await tx.sql(
      `INSERT INTO currencies (code, currency, sortOrder, updatedAt, createdAt) VALUES ('THB', 'Thai Baht', 32, ${now}, ${now})`
    );
    await tx.sql(
      `INSERT INTO currencies (code, currency, sortOrder, updatedAt, createdAt) VALUES ('TRY', 'Turkish Lira', 33, ${now}, ${now})`
    );

    await tx.sql(
      "CREATE TABLE configs (pubKeyHex TEXT PRIMARY KEY, baseCurrency VARCHAR(3) NOT NULL, deletedAt INTEGER, updatedAt INTEGER NOT NULL, createdAt INTEGER NOT NULL, FOREIGN KEY (baseCurrency) REFERENCES currencies(code))"
    );

    await tx.sql("ALTER TABLE transactions ADD COLUMN baseAmount REAL");

    await createMigration(tx.sql, Migrations.Currencies);
  });
};

export const runMigrations = async (sqlocal: SQLocal) => {
  await categoriesSortColumnMigration(sqlocal);
  await recurringTransactionsMigration(sqlocal);
  await currenciesMigration(sqlocal);
};
