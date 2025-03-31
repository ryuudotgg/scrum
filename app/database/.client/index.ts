import type { PGlite } from "@electric-sql/pglite";
import { PGliteWorker } from "@electric-sql/pglite/worker";
import { PgDialect } from "drizzle-orm/pg-core/dialect";
import { drizzle } from "drizzle-orm/pglite";
import migrations from "./migrations/export.json";
import * as schema from "./schema";
import PGWorker from "./worker?worker";

const isDev = process.env.NODE_ENV === "development";
export const dbName = isDev ? "scrum-dev" : "scrum";

export const client = new PGliteWorker(
  new PGWorker({ name: `${dbName}-worker` }),
  { dataDir: `idb://${dbName}` },
) as unknown as PGlite;

const _db = drizzle({ client, schema, casing: "snake_case", logger: isDev });

let isLocalDBSchemaSynced = false;
if (!isLocalDBSchemaSynced) {
  // @ts-ignore
  await new PgDialect().migrate(migrations, _db._.session, dbName);

  isLocalDBSchemaSynced = true;
}

const db = Object.assign(_db, { schema, casing: "snake_case" });

export { db };
