import type { BetterAuthPlugin } from "better-auth";

export const schema: BetterAuthPlugin["schema"] = {
  user: {
    fields: {
      username: {
        type: "string",
        required: true,
        unique: true,
      },
    },
  },
};
