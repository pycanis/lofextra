import * as comlink from "comlink";

import sqlite3InitModule from "@sqlite.org/sqlite-wasm";
import { createTables } from "./create";
import { migrate } from "./migrations";
import { seed } from "./seeds";

const DB_NAME = "mydb.sqlite3";

const initSqlite = async () => {
  try {
    const sqlite3 = await sqlite3InitModule();

    if (!("opfs" in sqlite3)) {
      throw new Error("OPFS not suppored");
    }

    const db = new sqlite3.oo1.OpfsDb(DB_NAME, "ct");

    createTables(db);
    seed(db);
    migrate(db);

    comlink.expose(db);

    self.postMessage({ type: "dbReady" });
  } catch (err) {
    console.error("Initialization error:", err);
  }
};

initSqlite();
