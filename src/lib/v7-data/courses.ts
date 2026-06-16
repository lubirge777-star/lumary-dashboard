export interface Course {
  code: string
  title: string
  instructor: string
  schedule: string
  color: string
}

export const DIT_COURSES: Course[] = [
  { code: "CET 04201", title: "Building Maintenance", instructor: "Mr. Mpakani", schedule: "MON 10:00–12:00 (B4)\nFRI 08:00–10:00 (B2)", color: "from-blue-500 to-blue-600" },
  { code: "CET 04202", title: "Soil Mechanics", instructor: "Mr. Makau", schedule: "MON 08:00–10:00 (A1)\nFRI 10:00–12:00 (A3)", color: "from-amber-500 to-amber-600" },
  { code: "CET 04204", title: "Architectural Drawing", instructor: "Mr. Juma", schedule: "MON 14:00–16:00 (Drwg)\nTUE 14:00–16:00 (Drwg)", color: "from-purple-500 to-purple-600" },
  { code: "CET 04203", title: "Mathematics / Trigonometry", instructor: "Mr. Salehe", schedule: "THU 08:00–10:00 (A1)\nMON 12:00–14:00 (A1)", color: "from-emerald-500 to-emerald-600" },
  { code: "CET 04206", title: "Arc Welding", instructor: "Mr. Hassan", schedule: "WED 08:00–10:00 (Workshop)\nTHU 14:00–16:00 (Workshop)", color: "from-red-500 to-red-600" },
  { code: "CET 04207", title: "Spreadsheets & Databases", instructor: "Mr. Baraka", schedule: "WED 10:00–12:00 (Lab)\nTHU 12:00–14:00 (Lab)", color: "from-cyan-500 to-cyan-600" },
  { code: "CET 04205", title: "Masonry & Plumbing", instructor: "Mr. Kimaro", schedule: "THU 10:00–12:00 (Workshop)\nFRI 12:00–14:00 (Workshop)\nWED 14:00–16:00 (Field)", color: "from-pink-500 to-pink-600" },
]
