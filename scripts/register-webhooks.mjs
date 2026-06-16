#!/usr/bin/env node
// Registers webhook URLs with Evolution API and Chatwoot
// Usage: node scripts/register-webhooks.mjs

const DASHBOARD_URL = process.env.DASHBOARD_URL || "http://localhost:3000"
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "http://localhost:8080"
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "429683C4C977415CAAFCCE10F7D57E11"
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE || "lumary_business"
const CHATWOOT_URL = process.env.CHATWOOT_URL || "http://localhost:3003"
const CHATWOOT_API_KEY = process.env.CHATWOOT_API_KEY || ""
const CHATWOOT_ACCOUNT_ID = process.env.CHATWOOT_ACCOUNT_ID || "1"

async function registerEvolution() {
  console.log(`\n[Evolution API] Registering webhook for instance "${EVOLUTION_INSTANCE}"...`)
  try {
    const res = await fetch(
      `${EVOLUTION_API_URL}/instance/setWebhook/${EVOLUTION_INSTANCE}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apiKey": EVOLUTION_API_KEY,
        },
        body: JSON.stringify({
          webhook: `${DASHBOARD_URL}/api/v1/webhooks/evolution`,
          webhookByEvents: true,
          events: ["messages.upsert", "presence.update", "status.update"],
        }),
      }
    )
    const data = await res.json()
    console.log(`  → ${res.status} ${res.ok ? "OK" : "FAIL"}:`, JSON.stringify(data).slice(0, 200))
    return res.ok
  } catch (e) {
    console.log(`  → ERROR: ${e.message}`)
    return false
  }
}

async function registerChatwoot() {
  if (!CHATWOOT_API_KEY) {
    console.log(`\n[Chatwoot] SKIPPED — CHATWOOT_API_KEY not set (sign in at ${CHATWOOT_URL} first)`)
    return false
  }
  console.log(`\n[Chatwoot] Registering webhook for account ${CHATWOOT_ACCOUNT_ID}...`)
  try {
    const res = await fetch(
      `${CHATWOOT_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/inboxes`,
      { headers: { api_access_token: CHATWOOT_API_KEY } }
    )
    const inboxes = await res.json()
    const inbox = Array.isArray(inboxes) ? inboxes[0] : inboxes?.payload?.[0]
    if (!inbox?.id) {
      console.log("  → No inbox found. Create one in Chatwoot first.")
      return false
    }
    const whRes = await fetch(
      `${CHATWOOT_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/inboxes/${inbox.id}/webhooks`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          api_access_token: CHATWOOT_API_KEY,
        },
        body: JSON.stringify({
          webhook_url: `${DASHBOARD_URL}/api/v1/webhooks/chatwoot`,
        }),
      }
    )
    const whData = await whRes.json()
    console.log(`  → ${whRes.status} ${whRes.ok ? "OK" : "FAIL"}:`, JSON.stringify(whData).slice(0, 200))
    return whRes.ok
  } catch (e) {
    console.log(`  → ERROR: ${e.message}`)
    return false
  }
}

async function main() {
  console.log("=== Webhook Registration ===\n")
  console.log(`Dashboard URL: ${DASHBOARD_URL}`)
  const evo = await registerEvolution()
  const cw = await registerChatwoot()
  console.log(`\n=== Summary ===`)
  console.log(`Evolution API: ${evo ? "✅ Registered" : "❌ Failed"}`)
  console.log(`Chatwoot:      ${cw ? "✅ Registered" : cw === null ? "⏭️ Skipped" : "❌ Failed"}`)
  console.log(`\nTypebot webhooks must be configured manually in the Typebot builder at http://localhost:8081`)
}

main().catch(console.error)
