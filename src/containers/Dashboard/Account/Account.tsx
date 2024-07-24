import { LofikProviderWrapper } from "../../../layouts/LofikProviderWrapper";
import { Mnemonic } from "./Mnemonic";
import { Recovery } from "./Recovery";

export const Account1 = () => {
  return (
    <>
      <Mnemonic />
      <Recovery />
    </>
  );
};

export const Account = () => {
  return (
    <LofikProviderWrapper>
      <Account1 />
    </LofikProviderWrapper>
  );
};
