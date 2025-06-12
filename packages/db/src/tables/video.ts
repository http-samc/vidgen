import { relations } from "drizzle-orm";
import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { user } from "../auth-schema";
import { preset } from "./preset";

export const video = pgTable("videos", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  presetId: integer("preset_id").references(() => preset.id, {
    onDelete: "set null",
  }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const videoRelations = relations(video, ({ one }) => ({
  user: one(user, {
    fields: [video.userId],
    references: [user.id],
  }),
  preset: one(preset, {
    fields: [video.presetId],
    references: [preset.id],
  }),
}));
