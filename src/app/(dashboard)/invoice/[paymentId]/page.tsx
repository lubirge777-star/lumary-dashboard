"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { formatTSh } from "@/lib/utils"
import type { Payment } from "@/types"
import { Button } from "@/components/ui/button"
import { Printer, ArrowLeft, Loader2 } from "lucide-react"

export default function InvoicePage() {
  useEffect(() => { document.title = "Invoice — LUMARY Studio" }, [])
  const params = useParams()
  const paymentId = params.paymentId as string

  const { data: payment, isLoading, error } = useQuery<Payment>({
    queryKey: ["payment", paymentId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/payments/${paymentId}`)
      if (!res.ok) throw new Error("Payment not found")
      return res.json()
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !payment) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg font-medium text-on-surface mb-2">Invoice not found</p>
          <p className="text-sm text-on-surface-variant/80 mb-4">{(error as Error)?.message || "Payment could not be loaded"}</p>
          <Link href="/finance" className="text-primary text-sm font-semibold hover:underline">
            Back to Finance
          </Link>
        </div>
      </div>
    )
  }

  const invoiceDate = format(new Date(payment.createdAt), "MMMM dd, yyyy")
  const invoiceNumber = `INV-${paymentId.toUpperCase()}`

  return (
    <>
      <style>{`
        @media print {
          body { background: #fff !important; margin: 0 !important; padding: 0 !important; }
          aside { display: none !important; }
          header { display: none !important; }
          main { margin-left: 0 !important; overflow: visible !important; height: auto !important; }
          main > div:first-of-type { padding: 0 !important; }
          .no-print { display: none !important; }
          .print-invoice {
            position: fixed;
            top: 0; left: 0;
            width: 100vw;
            min-height: 100vh;
            margin: 0;
            padding: 40px 48px;
            border: none;
            box-shadow: none;
            border-radius: 0;
            background: #fff;
            z-index: 9999;
          }
          @page { margin: 0; size: A4; }
          * { box-shadow: none !important; }
        }
      `}</style>

      <div className="no-print flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/finance"
            className="w-9 h-9 rounded-xl border border-outline-variant/30 bg-white flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:border-outline transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-2xl font-heading font-semibold text-on-surface">Invoice</h1>
        </div>
        <Button onClick={() => window.print()}>
          <Printer className="w-4 h-4" />
          Download PDF
        </Button>
      </div>

      <div className="print-invoice bg-white max-w-[210mm] mx-auto p-8 md:p-12 rounded-2xl border border-outline-variant/30 shadow-lg">
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF8E5E] to-[#4FACFE] text-white flex items-center justify-center text-lg font-bold font-heading leading-none">
                L
              </div>
              <span className="text-xl font-heading font-bold text-primary">LUMARY</span>
            </div>
            <p className="text-xs text-on-surface-variant font-medium tracking-widest uppercase">Studio</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-heading font-bold text-primary">INVOICE</h2>
            <p className="text-sm text-on-surface-variant mt-1 font-mono">{invoiceNumber}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-2">From</h3>
            <p className="text-sm font-semibold text-on-surface">LUMARY Studio</p>
            <p className="text-sm text-on-surface-variant">P.O. Box 169</p>
            <p className="text-sm text-on-surface-variant">Mwanza, Tanzania</p>
            <p className="text-sm text-on-surface-variant">+255 65 136 0763</p>
            <p className="text-sm text-primary">lubirge@lumary.com</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-2">Bill To</h3>
            <p className="text-sm font-semibold text-on-surface">{payment.clientName || "\u2014"}</p>
            {payment.projectService && (
              <p className="text-sm text-on-surface-variant mt-0.5">{payment.projectService}</p>
            )}
            <p className="text-sm text-on-surface-variant mt-4">
              <span className="font-medium text-on-surface">Invoice Date:</span> {invoiceDate}
            </p>
          </div>
        </div>

        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-primary/20">
              <th className="text-left py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
                Description
              </th>
              <th className="text-right py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
                Amount (TSh)
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-outline-variant/30">
              <td className="py-3 text-sm text-on-surface">{payment.projectService || "Payment"}</td>
              <td className="py-3 text-sm text-right font-mono font-semibold text-on-surface">
                {formatTSh(payment.amount)}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex items-center justify-between py-3 border-t-2 border-primary">
              <span className="text-sm font-bold text-on-surface">Total</span>
              <span className="text-lg font-bold font-mono text-primary">{formatTSh(payment.amount)}</span>
            </div>
          </div>
        </div>

        {payment.balanceDue !== undefined && payment.balanceDue > 0 && (
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex items-center justify-between py-2 border-t border-outline-variant/30">
                <span className="text-xs text-on-surface-variant">Balance Due</span>
                <span className="text-sm font-mono text-error font-semibold">{formatTSh(payment.balanceDue)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-8 mb-8 p-4 bg-surface-variant/30 rounded-xl">
          <div>
            <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-2">
              Payment Method
            </h3>
            <p className="text-sm text-on-surface font-medium">{payment.method}</p>
            {payment.mpesaReference && (
              <>
                <p className="text-xs text-on-surface-variant mt-2">M-Pesa Reference</p>
                <p className="text-sm text-on-surface font-mono">{payment.mpesaReference}</p>
              </>
            )}
          </div>
          <div>
            <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-2">Status</h3>
            <p className="text-sm text-on-surface font-medium">{payment.status}</p>
            {payment.paidAt && (
              <>
                <p className="text-xs text-on-surface-variant mt-2">Paid On</p>
                <p className="text-sm text-on-surface">{format(new Date(payment.paidAt), "MMMM dd, yyyy")}</p>
              </>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-2">
            Terms &amp; Conditions
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Payment is due within 30 days of the invoice date. Late payments may incur additional charges.
            Thank you for choosing LUMARY Studio for your creative and digital solutions.
          </p>
          {payment.notes && (
            <p className="text-xs text-on-surface-variant leading-relaxed mt-2 italic">
              Note: {payment.notes}
            </p>
          )}
        </div>

        <div className="pt-4 border-t border-outline-variant/30 text-center space-y-0.5">
          <p className="text-xs text-on-surface-variant/80">
            LUMARY Studio &mdash; Digital Solutions &amp; Creative Design
          </p>
          <p className="text-xs text-on-surface-variant/80">
            Mwanza, Tanzania | lubirge@lumary.com | +255 65 136 0763
          </p>
        </div>
      </div>
    </>
  )
}
