import styles from "@/app/dashboard/styles.module.css";
import { OpfsDatabase } from "@sqlite.org/sqlite-wasm";
import * as comlink from "comlink";
import { ReactNode, createContext, useEffect, useState } from "react";

type DatabaseContext = {
  db: comlink.Remote<OpfsDatabase>;
};

export const DatabaseContext = createContext({} as DatabaseContext);

type Props = {
  children: ReactNode;
};

export const DatabaseProvider = ({ children }: Props) => {
  const [dbLoading, setDbLoading] = useState(true);
  const [db, setDb] = useState<comlink.Remote<OpfsDatabase>>();

  useEffect(() => {
    const worker = new Worker(new URL("../db/worker.ts", import.meta.url), {
      type: "module",
    });

    worker.onmessage = (ev) => {
      if (ev.data.type === "dbReady") {
        setDbLoading(false);

        worker.onmessage = null;

        const db = comlink.wrap<OpfsDatabase>(worker);

        setDb(() => db);
      }
    };
  }, []);

  // this is a better approach for exporting the database
  // but unfortunately not supported in some major browsers yet (mozilla)

  // const exportDatabase = async () => {
  //   const opfsRoot = await navigator.storage.getDirectory();

  //   const fileHandle = await opfsRoot.getFileHandle(DB_NAME);

  //   try {
  //     const saveHandle = await showSaveFilePicker({
  //       suggestedName: "lofextra.sqlite3",
  //     });

  //     const writable = await saveHandle.createWritable();

  //     await writable.write(await fileHandle.getFile());

  //     await writable.close();
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  return (
    <DatabaseContext.Provider
      value={{ db: db as comlink.Remote<OpfsDatabase> }}
    >
      <main className={styles.main}>
        {dbLoading ? <div aria-busy="true" /> : children}
      </main>
    </DatabaseContext.Provider>
  );
};
