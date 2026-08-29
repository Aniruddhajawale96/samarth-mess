CREATE TABLE "payment_webhook_events" (
	"id" text PRIMARY KEY NOT NULL,
	"provider_event_id" varchar(255) NOT NULL,
	"provider_payment_id" varchar(255) NOT NULL,
	"event" varchar(100) NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payment_webhook_events_provider_event_id_unique" UNIQUE("provider_event_id")
);
