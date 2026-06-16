"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useCreateClient } from "@/lib/api-hooks"
import { Input, Select } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ClientStatus } from "@/types"

const clientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  whatsappNumber: z.string().min(8, "At least 8 digits"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  businessType: z.string().optional(),
  location: z.string().optional(),
  referralSource: z.string().optional(),
  status: z.enum(["ACTIVE", "RETAINER", "DORMANT", "CHURNED"]),
  servicesUsed: z.string().optional(),
  notes: z.string().optional(),
})

type ClientForm = z.infer<typeof clientSchema>

const statuses: { value: ClientStatus; label: string }[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "RETAINER", label: "Retainer" },
  { value: "DORMANT", label: "Dormant" },
  { value: "CHURNED", label: "Churned" },
]

export function AddClientForm({ onClose }: { onClose: () => void }) {
  const createClient = useCreateClient()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ClientForm>({
    resolver: zodResolver(clientSchema),
    defaultValues: { whatsappNumber: "255", status: "ACTIVE" },
  })

  const onSubmit = (data: ClientForm) => {
    createClient.mutate({
      name: data.name,
      whatsappNumber: data.whatsappNumber,
      email: data.email || undefined,
      businessType: data.businessType || undefined,
      location: data.location || undefined,
      referralSource: data.referralSource || undefined,
      status: data.status,
      servicesUsed: data.servicesUsed ? data.servicesUsed.split(",").map((s) => s.trim()) : [],
      notes: data.notes || undefined,
      firstProjectDate: undefined,
      lastProjectDate: undefined,
    }, {
      onSuccess: () => onClose(),
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Client Name *"
          placeholder="e.g. Mama Fatuma"
          error={errors.name?.message}
          {...register("name")}
        />
        <Input
          label="WhatsApp Number *"
          placeholder="255651360763"
          error={errors.whatsappNumber?.message}
          {...register("whatsappNumber")}
        />
        <Input
          label="Email"
          placeholder="fatuma@salon.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select label="Status" options={statuses.map((s) => ({ value: s.value, label: s.label }))} value={field.value} onChange={field.onChange} />
          )}
        />
        <Input
          label="Business Type"
          placeholder="Salon, Student, Restaurant..."
          {...register("businessType")}
        />
        <Input
          label="Location"
          placeholder="Kigamboni, DIT Campus..."
          {...register("location")}
        />
        <Input
          label="Referral Source"
          placeholder="Walk-in, WhatsApp, Referral..."
          {...register("referralSource")}
        />
        <Input
          label="Services Used (comma separated)"
          placeholder="Brand Starter, CV Redesign"
          {...register("servicesUsed")}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-on-surface-variant block mb-1.5">Notes</label>
        <textarea
          className="w-full bg-white border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/80 focus:outline-none focus:border-primary/50 transition-colors h-20 resize-none"
          placeholder="Any notes about this client..."
          {...register("notes")}
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Create Client</Button>
      </div>
    </form>
  )
}
