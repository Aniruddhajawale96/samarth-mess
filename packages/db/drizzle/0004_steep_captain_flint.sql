ALTER TABLE "users" ADD COLUMN "qr_token" text;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_qr_token_unique" UNIQUE("qr_token");