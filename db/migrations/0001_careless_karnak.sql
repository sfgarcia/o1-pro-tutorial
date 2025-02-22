CREATE TYPE "public"."category" AS ENUM('food', 'transport', 'lodging', 'other');--> statement-breakpoint
CREATE TABLE "receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"original_file" text NOT NULL,
	"merchant" text,
	"amount" numeric(10, 2),
	"date" timestamp,
	"category" "category",
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
