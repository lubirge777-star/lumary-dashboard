CREATE TABLE IF NOT EXISTS "WebhookLog" (
  "id" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'received',
  "error" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WebhookLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "WebhookLog_source_idx" ON "WebhookLog"("source");
CREATE INDEX IF NOT EXISTS "WebhookLog_createdAt_idx" ON "WebhookLog"("createdAt");
CREATE INDEX IF NOT EXISTS "WebhookLog_status_idx" ON "WebhookLog"("status");
