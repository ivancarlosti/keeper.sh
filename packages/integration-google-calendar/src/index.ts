import { registerDestinationProvider } from "@keeper.sh/integrations";
import { GoogleCalendarProvider } from "./provider";

registerDestinationProvider(GoogleCalendarProvider);

export { GoogleCalendarProvider };
export {
  getGoogleAccountsByPlan,
  getGoogleAccountForUser,
  getUserEvents,
  type GoogleAccount,
} from "./sync";
