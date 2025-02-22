/*
Initializes the database connection and schema for the app.
*/

import { profilesTable, receiptsTable } from "@/db/schema"
import { config } from "dotenv"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

config({ path: ".env.local" })

const schema = { profiles: profilesTable, receipts: receiptsTable }

const client = postgres(process.env.DATABASE_URL!)

export const db = drizzle(client, { schema })
