import { relations } from "drizzle-orm";
import { pgEnum, pgTable, real, serial, text } from "drizzle-orm/pg-core";

import { presetCharacters } from "./preset-characters";

export const backgroundBlurEnum = pgEnum("background_blur", [
  "none",
  "medium",
  "high",
]);

// Preset Table
export const preset = pgTable("presets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  backgroundBlur: backgroundBlurEnum("background_blur")
    .notNull()
    .default("high"),
  delay: real("delay").notNull().default(0.5),
  backgroundVideo: text("background_video").notNull(),
});

export const presetRelations = relations(preset, ({ many }) => ({
  characters: many(presetCharacters),
}));
