import { registerDestinationProvider } from "@keeper.sh/integrations";
import { GoogleCalendarProvider } from "./provider";

registerDestinationProvider(GoogleCalendarProvider);

export { GoogleCalendarProvider };
export {
  getGoogleAccountsByPlan,
  getGoogleAccountsForUser,
  getUserEvents,
  type GoogleAccount,
} from "./sync";
