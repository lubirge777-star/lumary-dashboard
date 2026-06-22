import { NextResponse } from "next/server"
import { getToolDefs, executeTool } from "@/tools"

const MCP_PROTOCOL_VERSION = "2025-03-26"
const SERVER_INFO = { name: "lumary-dashboard", version: "0.1.0" }
const MCP_API_KEY = process.env.MCP_API_KEY

function toolToMCP(tool: ReturnType<typeof getToolDefs>[number]) {
  const f = tool.function
  return {
    name: f.name,
    description: f.description,
    inputSchema: f.parameters,
  }
}

function unauthorized() {
  return NextResponse.json(
    { jsonrpc: "2.0", id: null, error: { code: -32001, message: "Unauthorized" } },
    { status: 401 }
  )
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}

export async function POST(req: Request) {
  if (MCP_API_KEY) {
    const auth = req.headers.get("authorization")
    if (!auth || auth !== `Bearer ${MCP_API_KEY}`) return unauthorized()
  }

  try {
    const body = await req.json()
    const messages = Array.isArray(body) ? body : [body]

    const responses = []
    for (const msg of messages) {
      const { id, method, params } = msg

      if (!method) {
        responses.push(errorResponse(id, -32600, "Method not specified"))
        continue
      }

      switch (method) {
        case "initialize":
          responses.push({
            jsonrpc: "2.0",
            id,
            result: {
              protocolVersion: MCP_PROTOCOL_VERSION,
              capabilities: { tools: {} },
              serverInfo: SERVER_INFO,
            },
          })
          break

        case "notifications/initialized":
          break

        case "tools/list":
          responses.push({
            jsonrpc: "2.0",
            id,
            result: {
              tools: getToolDefs().map(toolToMCP),
            },
          })
          break

        case "tools/call": {
          const { name, arguments: args } = params || {}
          if (!name) {
            responses.push(errorResponse(id, -32602, "Tool name required"))
            break
          }
          const result = await executeTool(name, args || {})
          responses.push({
            jsonrpc: "2.0",
            id,
            result: {
              content: [{ type: "text", text: JSON.stringify(result) }],
              isError: !result.success,
            },
          })
          break
        }

        default:
          responses.push(errorResponse(id, -32601, `Method not found: ${method}`))
      }
    }

    if (responses.length === 0) {
      return new NextResponse(null, { status: 202 })
    }

    return NextResponse.json(responses.length === 1 ? responses[0] : responses)
  } catch (e: any) {
    console.error("MCP ERROR", e.message)
    return NextResponse.json(
      errorResponse(null, -32700, `Parse error: ${e.message}`),
      { status: 500 }
    )
  }
}

function errorResponse(id: any, code: number, message: string) {
  return { jsonrpc: "2.0", id: id ?? null, error: { code, message } }
}
