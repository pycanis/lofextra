import * as comlink from "comlink";

import sqlite3InitModule from "@sqlite.org/sqlite-wasm";

const initSqlite = async () => {
  try {
    const sqlite3 = await sqlite3InitModule();

    if (!("opfs" in sqlite3)) {
      throw new Error("OPFS not suppored");
    }

    const db = new sqlite3.oo1.OpfsDb("mydb.sqlite3", "ct");

    comlink.expose(db);

    self.postMessage({ type: "dbReady" });
  } catch (err) {
    console.error("Initialization error:", err);
  }
};

initSqlite();
