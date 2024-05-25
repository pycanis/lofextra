import { useDatabaseContext } from "@/hooks/contexts";
import { useEffect } from "react";
import { Mnemonic } from "./Mnemonic";
import { Recovery } from "./Recovery";

export const Account = () => {
  const { workerApi } = useDatabaseContext();

  useEffect(() => {
    workerApi.selectObjects("select * from categories").then(console.log);
  }, [workerApi]);

  return (
    <>
      <Mnemonic />
      <Recovery />
    </>
  );
};
