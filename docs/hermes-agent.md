# Connecting Nous Hermes Agent to LUMARY Dashboard

This project exposes its tool system as an **MCP (Model Context Protocol) server** at `/api/v1/mcp`. The [Hermes Agent](https://hermes-agent.nousresearch.com) by Nous Research connects to it and gains full control over the dashboard.

## Architecture

```
WhatsApp/Telegram/Slack ←→ Hermes Agent (server) ←→ MCP ──→ /api/v1/mcp ──→ Dashboard tools
```

You talk to Hermes via messaging apps. Hermes calls the dashboard's MCP endpoint to query data, create reminders, manage projects, etc.

## Prerequisites

1. A running instance of this dashboard (deployed or local)
2. [Hermes Agent installed](https://hermes-agent.nousresearch.com/docs/installation/) on a Linux/macOS/WSL2 server
3. (Optional) `MCP_API_KEY` env var set on the dashboard for auth

## Setup

### 1. Add the MCP server to Hermes config

Edit `~/.hermes/config.yaml`:

```yaml
mcp_servers:
  lumary_dashboard:
    url: "https://your-dashboard.com/api/v1/mcp"
    headers:
      Authorization: "Bearer ${MCP_API_KEY}"
    enabled: true
    timeout: 120
    tools:
      include: []      # empty = all tools
```

If running locally:

```yaml
mcp_servers:
  lumary_dashboard:
    url: "http://localhost:3000/api/v1/mcp"
    enabled: true
```

### 2. Verify the connection

Start Hermes and check the banner shows MCP loaded:

```bash
hermes
```

Then ask:

```
What tools do you have from the LUMARY dashboard?
```

### 3. (Optional) Set up WhatsApp gateway

Configure Hermes to use WhatsApp so you can talk to it from your phone:

```bash
hermes gateway add whatsapp
```

## Tools exposed

The MCP endpoint exposes 30+ tools across these domains:

| Domain | Tools |
|--------|-------|
| Dashboard | `get_dashboard_metrics`, `get_activity_feed`, `get_today_briefing` |
| Clients | `get_clients`, `get_client`, `create_client`, `update_client`, `delete_client` |
| Projects | `get_projects`, `get_project`, `create_project`, `update_project_status` |
| Finance | `list_payments`, `create_payment`, `update_payment`, `list_expenses`, `create_expense`, `get_monthly_pnl`, `list_retainers`, `create_retainer`, `update_retainer` |
| Messaging | `send_whatsapp`, `get_client_phone`, `get_conversation_history` |
| Personal | `list_goals`, `create_goal`, `update_goal`, `get_todays_habits`, `toggle_habit`, `list_journal_entries`, `create_journal_entry` |
| Reminders | `create_reminder`, `dismiss_reminder`, `list_reminders` |
| Schedule | `list_appointments`, `create_appointment` |
| System | `log_activity`, `list_user_config` |

## Auth

Set `MCP_API_KEY` in the dashboard's `.env` to require a bearer token:

```
MCP_API_KEY=your-secret-key
```

Then Hermes sends it automatically via the header configured above.
