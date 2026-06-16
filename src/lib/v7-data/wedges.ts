export interface WedgeDefault {
  name: string
  market: string
  competition: string
  advantage: string
}

export const DEFAULT_WEDGES: WedgeDefault[] = [
  { name: "Construction + Coding = Digital Construction Tools", market: "Tanzania construction firms", competition: "Low", advantage: "You understand both worlds — most devs don't know construction, most builders don't code" },
  { name: "Arabic + Coding = Arabic EdTech", market: "Muslim world, 1.8B people", competition: "Medium", advantage: "You're learning both simultaneously — authentic empathy for the learner" },
  { name: "Design + Coding = Design-to-Code Services", market: "Startups & agencies", competition: "Medium", advantage: "Rare combo — most people do one or the other" },
  { name: "Local Market + Tech = Tanzania-first SaaS", market: "East African businesses", competition: "Low", advantage: "You ARE the user — you know what Tanzania needs" },
]
