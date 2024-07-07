import { FormattedMessage } from "react-intl";
import { TranslationId, messages } from "./messages";

export const Translation = ({ id }: { id: TranslationId }) => (
  <FormattedMessage id={id} defaultMessage={messages[id]} />
);
