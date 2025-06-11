/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schema";

export const db = drizzle(process.env.POSTGRES_URL!, {
  schema,
  casing: "snake_case",
});
