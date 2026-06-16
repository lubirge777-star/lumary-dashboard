export interface Resource {
  icon: string
  title: string
  desc: string
  url: string
  tag: string
  color: string
}

export const RESOURCES: Resource[] = [
  { icon: "🔥", title: "freeCodeCamp", desc: "Full curriculum — HTML, CSS, JS, React", url: "https://freecodecamp.org", tag: "FREE", color: "text-emerald-600" },
  { icon: "⚔️", title: "The Odin Project", desc: "Full-stack curriculum with projects", url: "https://theodinproject.com", tag: "FREE", color: "text-blue-600" },
  { icon: "💜", title: "Scrimba", desc: "Interactive coding — React, JS, CSS", url: "https://scrimba.com", tag: "FREEMIUM", color: "text-purple-600" },
  { icon: "📖", title: "javascript.info", desc: "The best JS reference — read everything", url: "https://javascript.info", tag: "FREE", color: "text-amber-600" },
  { icon: "▶️", title: "Traversy Media", desc: "YouTube — crash courses in everything", url: "https://youtube.com/@TraversyMedia", tag: "CHANNEL", color: "text-red-600" },
  { icon: "⚡", title: "Fireship", desc: "YouTube — quick concept explanations", url: "https://youtube.com/@Fireship", tag: "CHANNEL", color: "text-orange-600" },
  { icon: "⚛️", title: "React Docs", desc: "Official React docs — learn.react.dev", url: "https://react.dev/learn", tag: "OFFICIAL", color: "text-emerald-600" },
  { icon: "🦊", title: "MDN Web Docs", desc: "The web reference — HTML, CSS, JS, API", url: "https://developer.mozilla.org", tag: "DOCS", color: "text-blue-600" },
  { icon: "🎨", title: "Kevin Powell", desc: "YouTube — CSS deep dives, best teacher", url: "https://youtube.com/@KevinPowell", tag: "CHANNEL", color: "text-purple-600" },
  { icon: "🌊", title: "Tailwind Docs", desc: "Utility-first CSS — read it all", url: "https://tailwindcss.com/docs", tag: "DOCS", color: "text-amber-600" },
  { icon: "▲", title: "Next.js Learn", desc: "Official Next.js course with quizzes", url: "https://nextjs.org/learn", tag: "COURSE", color: "text-red-600" },
  { icon: "📘", title: "Total TypeScript", desc: "Matt Pocock — best TS teaching", url: "https://totaltypescript.com", tag: "FREEMIUM", color: "text-orange-600" },
  { icon: "🕋", title: "arabic101.org", desc: "Quranic Arabic — reading, grammar", url: "https://arabic101.org", tag: "FREE", color: "text-emerald-600" },
  { icon: "🎯", title: "Refactoring UI", desc: "Design for developers — read it all", url: "https://refactoringui.com", tag: "BOOK", color: "text-blue-600" },
  { icon: "📱", title: "Expo Docs", desc: "React Native + Expo official guide", url: "https://docs.expo.dev", tag: "DOCS", color: "text-purple-600" },
]
