import { relations } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";

import { user } from "../auth-schema";

export const key = pgTable("keys", {
  hash: text("hash").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const keyRelations = relations(key, ({ one }) => ({
  user: one(user, {
    fields: [key.userId],
    references: [user.id],
  }),
}));
