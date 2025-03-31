import { timestamp } from "drizzle-orm/pg-core";

export const dates = {
  createdAt: timestamp({ mode: "date", withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp({ mode: "date", withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};
