import { log } from "@keeper.sh/log";
import type { CronOptions } from "cronbake";

export const injectJobs = (configurations: CronOptions[]) => {
  return configurations.map(({ callback, ...job }) => ({
    ...job,
    callback: new Proxy(callback, {
      apply: (...parameters) => {
        log.info("running cron job %s", job.name);
        return Reflect.apply(...parameters);
      },
    }),
  }));
};
