"use client"

import { useMemo, useState, useDeferredValue } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { usePayments, useExpenses, useCreatePayment, useCreateExpense } from "@/lib/api-hooks"
import { Table } from "@/components/ui/table"
import { Badge, statusBadge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { Input, Select } from "@/components/ui/input"
import { formatTSh } from "@/lib/utils"
import type { Payment, Expense } from "@/types"
import { Plus, AlertCircle, TrendingUp, TrendingDown, DollarSign, Receipt, Wallet, Clock, Search, X, FileText } from "lucide-react"
import { TableSkeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"

function IncomeTable({ payments }: { payments: Payment[] }) {
  const columns = [
    {
      key: "date",
      label: "Date",
      sortable: true,
      render: (p: Payment) => (
        <span className="text-sm text-on-surface-variant">
          {new Date(p.createdAt).toLocaleDateString("sw-TZ", { month: "short", day: "numeric" })}
        </span>
      ),
    },
    {
      key: "clientName",
      label: "Client",
      sortable: true,
      render: (p: Payment) => (
        <span className="text-sm text-on-surface">{p.clientName || "\u2014"}</span>
      ),
    },
    {
      key: "projectService",
      label: "Service",
      render: (p: Payment) => (
        <span className="text-xs text-on-surface-variant">{p.projectService || "\u2014"}</span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (p: Payment) => (
        <span className="text-sm text-on-surface font-mono">{formatTSh(p.amount)}</span>
      ),
    },
    {
      key: "method",
      label: "Method",
      render: (p: Payment) => (
        <span className="text-xs text-on-surface-variant/80">{p.method}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (p: Payment) => <Badge variant={statusBadge(p.status)}>{p.status}</Badge>,
    },
    {
      key: "invoice",
      label: "",
      render: (p: Payment) => (
        <Link
          href={`/invoice/${p.id}`}
          className="no-print inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          <FileText className="w-3.5 h-3.5" />
          Invoice
        </Link>
      ),
    },
  ]

  return <Table columns={columns} data={payments} />
}

function ExpenseTable({ expenses }: { expenses: Expense[] }) {
  const columns = [
    {
      key: "date",
      label: "Date",
      sortable: true,
      render: (e: Expense) => (
        <span className="text-sm text-on-surface-variant">
          {new Date(e.createdAt).toLocaleDateString("sw-TZ", { month: "short", day: "numeric" })}
        </span>
      ),
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
      render: (e: Expense) => (
        <span className="text-sm text-on-surface">{e.category}</span>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (e: Expense) => (
        <span className="text-sm text-on-surface-variant">{e.description}</span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (e: Expense) => (
        <span className="text-sm text-error font-mono">-{formatTSh(e.amount)}</span>
      ),
    },
  ]

  return <Table columns={columns} data={expenses} />
}

const incomeSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  amount: z.number().min(1, "Amount must be > 0"),
  method: z.enum(["MPESA", "BANK", "CASH", "STRIPE", "OTHER"]),
  status: z.enum(["PAID", "FIFTY_PERCENT", "UNPAID", "OVERDUE"]),
  notes: z.string().optional(),
})

type IncomeForm = z.infer<typeof incomeSchema>

const methodOptions = ["MPESA", "BANK", "CASH", "STRIPE", "OTHER"].map(v => ({ value: v, label: v }))
const statusOptions = ["PAID", "FIFTY_PERCENT", "UNPAID", "OVERDUE"].map(v => ({ value: v, label: v }))

function LogIncomeForm({ onSuccess }: { onSuccess: () => void }) {
  const mutation = useCreatePayment()
  const { register, handleSubmit, control, formState: { errors } } = useForm<IncomeForm>({
    resolver: zodResolver(incomeSchema),
    defaultValues: { method: "MPESA", status: "PAID" },
  })

  const onSubmit = (data: IncomeForm) => {
    mutation.mutate(data as any, { onSuccess })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Client Name" error={errors.clientName?.message} {...register("clientName")} />
      <Input label="Amount (TSh)" type="number" error={errors.amount?.message} {...register("amount", { valueAsNumber: true })} />
      <Controller name="method" control={control} render={({ field }) => (
        <Select label="Method" options={methodOptions} value={field.value} onChange={field.onChange} />
      )} />
      <Controller name="status" control={control} render={({ field }) => (
        <Select label="Status" options={statusOptions} value={field.value} onChange={field.onChange} />
      )} />
      <Input label="Notes" {...register("notes")} />
      <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : "Log Income"}</Button>
    </form>
  )
}

const expenseSchema = z.object({
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  amount: z.number().min(1, "Amount must be > 0"),
})

type ExpenseForm = z.infer<typeof expenseSchema>

function LogExpenseForm({ onSuccess }: { onSuccess: () => void }) {
  const mutation = useCreateExpense()
  const { register, handleSubmit, formState: { errors } } = useForm<ExpenseForm>({
    resolver: zodResolver(expenseSchema),
  })
  const categoryOptions = ["Software", "Internet", "Transport", "Marketing", "Equipment", "Office", "Other"].map(v => ({ value: v, label: v }))

  const onSubmit = (data: ExpenseForm) => {
    mutation.mutate(data as any, { onSuccess })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-on-surface-variant">Category</label>
        <select {...register("category")} className="w-full bg-white border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors">
          {categoryOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {errors.category && <p className="text-xs text-error">{errors.category.message}</p>}
      </div>
      <Input label="Description" error={errors.description?.message} {...register("description")} />
      <Input label="Amount (TSh)" type="number" error={errors.amount?.message} {...register("amount", { valueAsNumber: true })} />
      <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : "Log Expense"}</Button>
    </form>
  )
}

export function FinancePage() {
  const [paymentSearch, setPaymentSearch] = useState("")
  const [methodFilter, setMethodFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const deferredPaymentSearch = useDeferredValue(paymentSearch)
  const paymentParams = useMemo(() => {
    const p: Record<string, string> = {}
    if (deferredPaymentSearch) p.search = deferredPaymentSearch
    if (methodFilter) p.method = methodFilter
    if (statusFilter) p.status = statusFilter
    return p
  }, [deferredPaymentSearch, methodFilter, statusFilter])
  const paymentsQuery = usePayments(paymentParams)
  const expensesQuery = useExpenses()
  const refetchFinance = () => { paymentsQuery.refetch(); expensesQuery.refetch() }
  const payments: Payment[] = paymentsQuery.data?.items ?? []
  const expenses: Expense[] = expensesQuery.data?.items ?? []
  const [showIncome, setShowIncome] = useState(false)
  const [showExpense, setShowExpense] = useState(false)

  const summary = useMemo(() => {
    const revenue = payments.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amount, 0)
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
    const profit = revenue - totalExpenses
    const outstanding = payments.filter((p) => p.status === "UNPAID" || p.status === "FIFTY_PERCENT").reduce((s, p) => s + (p.balanceDue || 0), 0)
    return { revenue, expenses: totalExpenses, profit, outstanding, taxReserve: Math.round(profit * 0.03) }
  }, [payments, expenses])

  const isLoading = paymentsQuery.isLoading || expensesQuery.isLoading
  const hasError = paymentsQuery.error || expensesQuery.error

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
          <h3 className="text-lg font-medium text-on-surface mb-2">Failed to load finance data</h3>
          <p className="text-sm text-on-surface-variant/80 mb-6">Please try refreshing the page</p>
          <button onClick={refetchFinance} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all">Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 stagger-children">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-on-surface">Finance</h1>
          <p className="text-sm text-on-surface-variant/80 mt-1">Track income, expenses, and profitability</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowIncome(true)}>
            <TrendingUp className="w-4 h-4" />
            Log Income
          </Button>
          <Button onClick={() => setShowExpense(true)}>
            <TrendingDown className="w-4 h-4" />
            Log Expense
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Revenue", value: formatTSh(summary.revenue), color: "text-emerald-600", icon: DollarSign },
          { label: "Expenses", value: formatTSh(summary.expenses), color: "text-error", icon: Receipt },
          { label: "Profit", value: formatTSh(summary.profit), color: summary.profit >= 0 ? "text-emerald-600" : "text-error", icon: Wallet },
          { label: "Outstanding", value: formatTSh(summary.outstanding), color: "text-[#ffa502]", icon: Clock },
        ].map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="rounded-xl border border-outline-variant/50 bg-white dark:bg-surface-container-high border border-outline-variant/30 dark:border-white/5 p-5 card-hover relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-outline-variant/30 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-on-surface-variant/80" />
                </div>
                <p className="text-xs text-on-surface-variant/80 font-medium">{item.label}</p>
              </div>
              <p className={`text-xl font-semibold font-mono ${item.color}`}>{item.value}</p>
            </div>
          )
        })}
      </div>

      {/* P&L Summary bar */}
      <div className="rounded-xl border border-outline-variant/50 bg-white dark:bg-surface-container-high border border-outline-variant/30 dark:border-white/5 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-on-surface tracking-wide">Profit &amp; Loss Summary</h3>
          <span className={`text-xs font-mono font-semibold ${summary.profit >= 0 ? "text-emerald-600" : "text-error"}`}>
            {summary.profit >= 0 ? "+" : ""}{formatTSh(summary.profit)}
          </span>
        </div>
        <div className="h-3 rounded-full bg-white overflow-hidden flex">
          {summary.revenue > 0 && (
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-600 transition-all"
              style={{ width: `${Math.min((summary.revenue / (summary.revenue + Math.abs(summary.expenses))) * 100, 90)}%` }}
            />
          )}
          {summary.expenses > 0 && (
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-red-400 transition-all"
              style={{ width: `${Math.min((Math.abs(summary.expenses) / (summary.revenue + Math.abs(summary.expenses))) * 100, 90)}%` }}
            />
          )}
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-on-surface-variant/80">
          <span className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-600" /> Revenue
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-rose-400" /> Expenses
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/80" />
          <input
            className="w-full bg-white border border-outline-variant rounded-xl pl-9 pr-8 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(157,67,25,0.08)] transition-all"
            placeholder="Search payments..."
            value={paymentSearch}
            onChange={(e) => setPaymentSearch(e.target.value)}
          />
          {paymentSearch && (
            <button onClick={() => setPaymentSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/80 hover:text-on-surface">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <select
          value={methodFilter ?? ""}
          onChange={(e) => setMethodFilter(e.target.value || null)}
          className="bg-white border border-outline-variant rounded-xl px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary transition-all"
        >
          <option value="">All Methods</option>
          <option value="MPESA">MPESA</option>
          <option value="BANK">Bank</option>
          <option value="CASH">Cash</option>
          <option value="STRIPE">Stripe</option>
          <option value="OTHER">Other</option>
        </select>
        <select
          value={statusFilter ?? ""}
          onChange={(e) => setStatusFilter(e.target.value || null)}
          className="bg-white border border-outline-variant rounded-xl px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary transition-all"
        >
          <option value="">All Statuses</option>
          <option value="PAID">Paid</option>
          <option value="FIFTY_PERCENT">Fifty Percent</option>
          <option value="UNPAID">Unpaid</option>
          <option value="OVERDUE">Overdue</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-outline-variant/50 bg-white dark:bg-surface-container-high border border-outline-variant/30 dark:border-white/5 p-5">
          <h3 className="text-sm font-semibold text-on-surface tracking-wide mb-4">Income</h3>
          {isLoading ? (
            <TableSkeleton rows={4} cols={6} />
          ) : payments.length === 0 ? (
            <EmptyState title="No payments yet" description="Log your first income" />
          ) : (
            <IncomeTable payments={payments} />
          )}
        </div>

        <div className="rounded-xl border border-outline-variant/50 bg-white dark:bg-surface-container-high border border-outline-variant/30 dark:border-white/5 p-5">
          <h3 className="text-sm font-semibold text-on-surface tracking-wide mb-4">Expenses</h3>
          {isLoading ? (
            <TableSkeleton rows={4} cols={4} />
          ) : expenses.length === 0 ? (
            <EmptyState title="No expenses yet" description="Log your first expense" />
          ) : (
            <ExpenseTable expenses={expenses} />
          )}
        </div>
      </div>

      <Dialog open={showIncome} onClose={() => setShowIncome(false)} title="Log Income">
        <LogIncomeForm onSuccess={() => setShowIncome(false)} />
      </Dialog>

      <Dialog open={showExpense} onClose={() => setShowExpense(false)} title="Log Expense">
        <LogExpenseForm onSuccess={() => setShowExpense(false)} />
      </Dialog>
    </div>
  )
}
