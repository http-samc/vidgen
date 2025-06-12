import { relations } from "drizzle-orm";
import { integer, pgTable } from "drizzle-orm/pg-core";

import { character } from "./character";
import { preset } from "./preset";

export const presetCharacters = pgTable(
  "presets_characters",
  {
    presetId: integer("preset_id")
      .notNull()
      .references(() => preset.id, { onDelete: "cascade" }),
    characterId: integer("character_id")
      .notNull()
      .references(() => character.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: [table.presetId, table.characterId],
  }),
);

export const presetCharactersRelations = relations(
  presetCharacters,
  ({ one }) => ({
    preset: one(preset, {
      fields: [presetCharacters.presetId],
      references: [preset.id],
    }),
    character: one(character, {
      fields: [presetCharacters.characterId],
      references: [character.id],
    }),
  }),
);
