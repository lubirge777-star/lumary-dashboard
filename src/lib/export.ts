"use client"

export function exportToCSV(
  data: any[],
  filename: string,
  columns: { key: string; label: string }[]
) {
  const header = columns.map((c) => c.label).join(",")
  const rows = data.map((item) =>
    columns
      .map((c) => {
        const val = item[c.key]
        const str = val == null ? "" : String(val)
        return str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")
          ? `"${str.replace(/"/g, '""')}"`
          : str
      })
      .join(",")
  )
  const csv = [header, ...rows].join("\r\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
