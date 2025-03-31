import { defineConfig } from "drizzle-kit";

const base = "./app/database/.client";
const migrationsFolder = `${base}/migrations`;

export default defineConfig({
  dialect: "postgresql",
  driver: "pglite",

  out: migrationsFolder,
  schema: `${base}/schema.ts`,

  casing: "snake_case",
});

export { migrationsFolder };
