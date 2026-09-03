CREATE TABLE IF NOT EXISTS "notification_attempts" (
  "id" text PRIMARY KEY NOT NULL,
  "event" varchar(100) NOT NULL,
  "channel" varchar(30) NOT NULL,
  "recipient_user_id" text,
  "recipient" varchar(255),
  "status" varchar(20) DEFAULT 'PENDING' NOT NULL,
  "payload" jsonb NOT NULL,
  "error" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "notification_attempts_recipient_user_id_users_id_fk" FOREIGN KEY ("recipient_user_id") REFERENCES "users"("id") ON DELETE set null
);
