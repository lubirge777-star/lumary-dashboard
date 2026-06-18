import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface RelatedLink {
  label: string
  href: string
  description?: string
}

interface RelatedLinksProps {
  title?: string
  links: RelatedLink[]
}

export function RelatedLinks({ title = "Related", links }: RelatedLinksProps) {
  if (links.length === 0) return null

  return (
    <div className="mt-6 p-4 rounded-xl bg-surface-variant/5 border border-outline-variant/20">
      <p className="text-[10px] uppercase tracking-wider text-on-surface-variant/50 font-semibold mb-2.5">{title}</p>
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-outline-variant/20 text-xs text-on-surface-variant/70 hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all group"
          >
            {link.label}
            <ChevronRight className="w-3 h-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
          </Link>
        ))}
      </div>
    </div>
  )
}
