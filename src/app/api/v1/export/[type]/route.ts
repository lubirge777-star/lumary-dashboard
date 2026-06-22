import { NextRequest, NextResponse } from "next/server"
import { getClients, getProjects, getPayments, getExpenses, getFinanceSummary } from "@/lib/data-service"
import { requireAuth } from "@/lib/require-auth"

function escapeCSV(val: unknown): string {
  const str = val == null ? "" : String(val)
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function generateCSV(data: any[], columns: { key: string; label: string }[]): string {
  const header = columns.map((c) => c.label).join(",")
  const rows = data.map((item) => columns.map((c) => escapeCSV(item[c.key])).join(","))
  return [header, ...rows].join("\r\n")
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const authError = await requireAuth()
  if (authError) return authError

  try {
    const { type } = await params

    const exporters: Record<string, () => Promise<{ data: any[]; columns: { key: string; label: string }[] }>> = {
      clients: async () => {
        const result = await getClients({ page: 1, pageSize: 10000 })
        return {
          data: result.items,
          columns: [
            { key: "name", label: "Name" },
            { key: "email", label: "Email" },
            { key: "whatsappNumber", label: "WhatsApp" },
            { key: "businessType", label: "Business Type" },
            { key: "location", label: "Location" },
            { key: "status", label: "Status" },
            { key: "totalSpent", label: "Total Spent" },
            { key: "referralSource", label: "Referral Source" },
            { key: "createdAt", label: "Created At" },
          ],
        }
      },
      projects: async () => {
        const result = await getProjects({ page: 1, pageSize: 10000 })
        return {
          data: result.items,
          columns: [
            { key: "clientName", label: "Client Name" },
            { key: "serviceType", label: "Service Type" },
            { key: "status", label: "Status" },
            { key: "quotedAmount", label: "Quoted Amount" },
            { key: "depositAmount", label: "Deposit Amount" },
            { key: "revisionsUsed", label: "Revisions Used" },
            { key: "createdAt", label: "Created At" },
          ],
        }
      },
      payments: async () => {
        const result = await getPayments({ page: 1, pageSize: 10000 })
        return {
          data: result.items,
          columns: [
            { key: "clientName", label: "Client Name" },
            { key: "projectService", label: "Service" },
            { key: "amount", label: "Amount" },
            { key: "method", label: "Method" },
            { key: "status", label: "Status" },
            { key: "mpesaReference", label: "M-Pesa Reference" },
            { key: "paidAt", label: "Paid At" },
            { key: "createdAt", label: "Created At" },
          ],
        }
      },
      finance: async () => {
        const summary = await getFinanceSummary()
        return {
          data: [
            { category: "Revenue", amount: summary.revenue },
            { category: "Expenses", amount: summary.expenses },
            { category: "Profit", amount: summary.profit },
          ],
          columns: [
            { key: "category", label: "Category" },
            { key: "amount", label: "Amount" },
          ],
        }
      },
    }

    const exporter = exporters[type]
    if (!exporter) return NextResponse.json({ error: "Invalid export type" }, { status: 400 })

    const { data, columns: cols } = await exporter()
    const csv = generateCSV(data, cols)

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${type}-export.csv"`,
      },
    })
  } catch (e) {
    console.error("export error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
