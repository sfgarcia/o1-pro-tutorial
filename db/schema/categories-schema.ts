/**
 * @description
 * Defines the database enum for receipt categories.
 *
 * Categories:
 * - food: Food and dining expenses
 * - transport: Transportation costs
 * - lodging: Accommodation expenses
 * - other: Miscellaneous expenses
 */

import { pgEnum } from "drizzle-orm/pg-core"

export const categoryEnum = pgEnum("category", [
  "food",
  "transport",
  "lodging",
  "other"
])

// No types needed for enums in Drizzle
