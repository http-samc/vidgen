import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, serial, text } from "drizzle-orm/pg-core";

import { presetCharacters } from "./preset-characters";

export const positionEnum = pgEnum("position", ["left", "right"]);
export const roleEnum = pgEnum("role", ["teacher", "student"]);

// Character Table
export const character = pgTable("characters", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  name: text("name").notNull(),
  voiceId: text("voice_id").notNull(),
  position: positionEnum("position").notNull(),
  width: integer("width").notNull(),
  role: roleEnum("role").notNull(),
});

export const characterRelations = relations(character, ({ many }) => ({
  presets: many(presetCharacters),
}));
