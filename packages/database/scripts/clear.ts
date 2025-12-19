import { database } from "@keeper.sh/database";
import { user as userTable } from "@keeper.sh/database/auth-schema";
import { log } from "@keeper.sh/log";
import { getTableName } from "drizzle-orm";
import type { PgTableWithColumns, TableConfig } from "drizzle-orm/pg-core";

type ExtractTableConfig<T> = T extends PgTableWithColumns<infer U> ? U : never;

const makeLogDeletedRecords = <
  TableSignature extends PgTableWithColumns<ExtractTableConfig<TableSignature>>,
>(
  table: TableSignature,
) => {
  return ({ length: count }: unknown[]) => {
    log.debug({ count }, "deleted records from %s", getTableName(table));
  };
};

const clear = async () => {
  log.info("clearing database");

  const logDeleteUsers = makeLogDeletedRecords(userTable);

  await database.delete(userTable).returning().then(logDeleteUsers);

  log.info("database cleared");
};

await clear();
