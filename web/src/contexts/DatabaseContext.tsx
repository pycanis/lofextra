import styles from "@/app/dashboard/styles.module.css";
import { SelectRow, initDatabase, utils } from "@/db/db";
import { OpfsDatabase } from "@sqlite.org/sqlite-wasm";
import * as comlink from "comlink";
import {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";

type DatabaseContext = {
  exec: <T extends Record<string, unknown>>(sql: string) => Promise<T[]>;
  exportDatabase: () => Promise<unknown>;
  db: comlink.Remote<OpfsDatabase>;
};

export const DatabaseContext = createContext({} as DatabaseContext);

type Props = {
  children: ReactNode;
};

export const DatabaseProvider = ({ children }: Props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [{ promiser, exportDatabase }, setPromiser] = useState({
    promiser: (..._args: unknown[]) => new Promise(() => {}),
    exportDatabase: () => new Promise(() => {}),
  });

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

  useEffect(() => {
    import("@sqlite.org/sqlite-wasm").then(
      // @ts-ignore
      ({ sqlite3Worker1Promiser }) => {
        initDatabase(sqlite3Worker1Promiser).then(
          ({ promiser: _promiser, exportDatabase }) => {
            setPromiser({ promiser: _promiser, exportDatabase });
            setIsLoading(false);
          }
        );
      }
    );
  }, []);

  const exec = useCallback(
    async <T extends Record<string, unknown>>(sql: string) => {
      const result: T[] = [];

      await promiser("exec", {
        sql,
        callback: (res: SelectRow) => utils.mergeSelect<T>(res, result),
      });

      return result;
    },
    [promiser]
  );

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
      value={{ exec, exportDatabase, db: db as comlink.Remote<OpfsDatabase> }}
    >
      <main className={styles.main}>
        {isLoading || dbLoading ? <div aria-busy="true" /> : children}
      </main>
    </DatabaseContext.Provider>
  );
};
