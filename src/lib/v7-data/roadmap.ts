export interface TaskSource {
  tag: string
  tc: string
  url: string
  name: string
}

export interface RoadmapTask {
  lbl: string
  src: TaskSource[]
}

export interface Phase {
  id: number
  label: string
  time: string
  color: string
  earn: string
  midAfter: number
  tasks: RoadmapTask[]
}

export interface FigmaStage {
  t: string
  s: string
  c: string
  d: string
  r: TaskSource[]
}

export const ROADMAP_PHASES: Phase[] = [
  { id: 0, label: "Foundations", time: "0-3mo", color: "from-emerald-500 to-emerald-600", earn: "$100-400", midAfter: 4, tasks: [
    { lbl: "How the web works — browsers, DNS, HTTP, servers, frontend vs backend", src: [{ tag: "VIDEO", tc: "#ec4899", url: "https://www.youtube.com/watch?v=zN8YNNHcaZc", name: "CS50: How the Internet Works (Harvard, 45 min)" }, { tag: "READ", tc: "#4d9de0", url: "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/How_the_Web_works", name: "MDN: How the Web Works" }] },
    { lbl: "HTML — semantic tags, forms, inputs, labels, structure", src: [{ tag: "COURSE", tc: "#2dd4a0", url: "https://www.freecodecamp.org/learn/2022/responsive-web-design/", name: "freeCodeCamp — Responsive Web Design" }, { tag: "VIDEO", tc: "#ec4899", url: "https://www.youtube.com/watch?v=UB1O30fR-EE", name: "HTML Crash Course — Traversy Media (1 hr)" }] },
    { lbl: "CSS — selectors, box model, colors, fonts, Google Fonts", src: [{ tag: "VIDEO", tc: "#ec4899", url: "https://www.youtube.com/watch?v=1Rs2ND1ryYc", name: "CSS Crash Course — Traversy Media (1.5 hrs)" }, { tag: "VIDEO", tc: "#ec4899", url: "https://www.youtube.com/watch?v=rIO5326FgPE", name: "Kevin Powell — CSS Box Model" }] },
    { lbl: "CSS Flexbox — justify-content, align-items, flex-direction, wrap, gap", src: [{ tag: "GAME", tc: "#f59e0b", url: "https://flexboxfroggy.com", name: "Flexbox Froggy — complete all 24 levels" }, { tag: "VIDEO", tc: "#ec4899", url: "https://www.youtube.com/watch?v=u044iM9xsWU", name: "Kevin Powell — Flexbox deep dive" }] },
    { lbl: "CSS Grid + Responsive Design — grid-template-columns, media queries", src: [{ tag: "GAME", tc: "#f59e0b", url: "https://cssgridgarden.com", name: "CSS Grid Garden — complete all 28 levels" }, { tag: "VIDEO", tc: "#ec4899", url: "https://www.youtube.com/watch?v=0ohtVzCSHqs", name: "Kevin Powell — Responsive CSS" }] },
    { lbl: "JavaScript basics — let/const, functions, loops, arrays, objects", src: [{ tag: "READ", tc: "#4d9de0", url: "https://javascript.info/first-steps", name: "javascript.info — Chapters 1-9" }, { tag: "VIDEO", tc: "#ec4899", url: "https://www.youtube.com/watch?v=hdI2bqOjy3c", name: "JS Crash Course — Traversy Media" }] },
    { lbl: "DOM manipulation — querySelector, addEventListener, classList, events", src: [{ tag: "READ", tc: "#4d9de0", url: "https://javascript.info/document", name: "javascript.info — Document and Events" }, { tag: "VIDEO", tc: "#ec4899", url: "https://www.youtube.com/watch?v=0ik6X4DJKCc", name: "DOM Crash Course — Traversy Media" }] },
    { lbl: "Git & GitHub — init, add, commit, push, repos, basic workflow", src: [{ tag: "VIDEO", tc: "#ec4899", url: "https://www.youtube.com/watch?v=SWYqp7iY_Tc", name: "Git & GitHub Crash Course (32 min)" }, { tag: "GAME", tc: "#f59e0b", url: "https://learngitbranching.js.org", name: "Learn Git Branching" }] },
    { lbl: "BUILD — 3-page website (Home, About, Contact) deployed on Netlify", src: [{ tag: "GUIDE", tc: "#06b6d4", url: "https://www.netlify.com/blog/2016/09/29/a-step-by-step-guide-deploying-on-netlify/", name: "Netlify deploy guide" }] },
  ]},
  { id: 1, label: "Frontend Dev", time: "3-6mo", color: "from-blue-500 to-blue-600", earn: "$300-1,500", midAfter: 4, tasks: [
    { lbl: "React — components, JSX, props, composing UIs from reusable pieces", src: [{ tag: "DOCS", tc: "#4d9de0", url: "https://react.dev/learn", name: "React official docs — Quick Start" }, { tag: "VIDEO", tc: "#ec4899", url: "https://www.youtube.com/watch?v=w7ejDZ8SWv8", name: "React Crash Course — Traversy Media" }] },
    { lbl: "React hooks — useState for state, useEffect for side effects & fetching", src: [{ tag: "DOCS", tc: "#4d9de0", url: "https://react.dev/learn/state-a-components-memory", name: "React docs — State: A Component's Memory" }] },
    { lbl: "React Router — client-side routing, Link, useNavigate, params", src: [{ tag: "DOCS", tc: "#4d9de0", url: "https://reactrouter.com/en/main/start/tutorial", name: "React Router official tutorial" }] },
    { lbl: "TypeScript — types, interfaces, generics, typing React props", src: [{ tag: "DOCS", tc: "#4d9de0", url: "https://www.typescriptlang.org/docs/handbook/intro.html", name: "TypeScript Handbook" }, { tag: "COURSE", tc: "#2dd4a0", url: "https://www.totaltypescript.com/tutorials/beginners-typescript", name: "Total TypeScript Beginners Tutorial" }] },
    { lbl: "Tailwind CSS — utility classes, responsive prefixes, flex/grid, dark mode", src: [{ tag: "VIDEO", tc: "#ec4899", url: "https://www.youtube.com/watch?v=dFgzHOX84xQ", name: "Tailwind CSS Crash Course" }, { tag: "DOCS", tc: "#4d9de0", url: "https://tailwindcss.com/docs/utility-first", name: "Tailwind docs" }] },
    { lbl: "State management — React Context for shared state, Zustand for larger", src: [{ tag: "DOCS", tc: "#4d9de0", url: "https://react.dev/learn/passing-data-deeply-with-context", name: "React docs — Context" }] },
    { lbl: "Next.js — file-based routing, SSR vs SSG, App Router, Server Components", src: [{ tag: "COURSE", tc: "#2dd4a0", url: "https://nextjs.org/learn", name: "Next.js official Learn course" }] },
    { lbl: "BUILD — React + TypeScript SPA deployed on Vercel", src: [{ tag: "GUIDE", tc: "#06b6d4", url: "https://vercel.com/docs/getting-started-with-vercel", name: "Vercel deploy guide" }] },
  ]},
  { id: 2, label: "Backend Dev", time: "6-10mo", color: "from-purple-500 to-purple-600", earn: "$1K-4K", midAfter: 4, tasks: [
    { lbl: "Node.js — runtime, modules, npm, package.json, building a server", src: [{ tag: "VIDEO", tc: "#ec4899", url: "https://www.youtube.com/watch?v=fBNz5xF-Kx4", name: "Node.js Crash Course" }] },
    { lbl: "Express.js — routing, middleware, request/response, error handling, REST", src: [{ tag: "VIDEO", tc: "#ec4899", url: "https://www.youtube.com/watch?v=L72fhGm1tfE", name: "Express.js Crash Course" }] },
    { lbl: "PostgreSQL + SQL + Prisma ORM — tables, JOINs, CRUD, indexes", src: [{ tag: "COURSE", tc: "#2dd4a0", url: "https://www.postgresqltutorial.com", name: "PostgreSQL Tutorial" }, { tag: "DOCS", tc: "#4d9de0", url: "https://www.prisma.io/docs/getting-started", name: "Prisma ORM docs" }] },
    { lbl: "MongoDB + Mongoose — documents, collections, CRUD, NoSQL vs SQL", src: [{ tag: "VIDEO", tc: "#ec4899", url: "https://www.youtube.com/watch?v=-56x56UppqQ", name: "MongoDB Crash Course" }] },
    { lbl: "Authentication — JWT, bcrypt, protected routes, login/signup flow", src: [{ tag: "VIDEO", tc: "#ec4899", url: "https://www.youtube.com/watch?v=mbsmsi7l3r4", name: "JWT Authentication — build from scratch" }] },
    { lbl: "Redis — caching strategy, session storage, pub/sub basics", src: [{ tag: "VIDEO", tc: "#ec4899", url: "https://www.youtube.com/watch?v=jgpVdJB2sKQ", name: "Redis in 10 min — Fireship" }] },
    { lbl: "API security — CORS, Zod validation, rate limiting, OWASP Top 10", src: [{ tag: "READ", tc: "#4d9de0", url: "https://owasp.org/www-project-top-ten/", name: "OWASP Top 10" }] },
    { lbl: "BUILD — Full REST API with Swagger docs, deployed on Railway", src: [{ tag: "TOOL", tc: "#06b6d4", url: "https://railway.app", name: "Railway — free hosting" }] },
  ]},
  { id: 3, label: "Mobile", time: "10-14mo", color: "from-amber-500 to-amber-600", earn: "$2K-8K", midAfter: 3, tasks: [
    { lbl: "React Native + Expo — core components, Expo vs bare, setup", src: [{ tag: "DOCS", tc: "#4d9de0", url: "https://docs.expo.dev/tutorial/introduction/", name: "Expo tutorial" }] },
    { lbl: "React Navigation — Stack, Tab, Drawer, params between screens", src: [{ tag: "DOCS", tc: "#4d9de0", url: "https://reactnavigation.org/docs/getting-started", name: "React Navigation docs" }] },
    { lbl: "Mobile state — Zustand global, AsyncStorage for persistence", src: [{ tag: "DOCS", tc: "#4d9de0", url: "https://react-native-async-storage.github.io/async-storage/docs/usage", name: "AsyncStorage docs" }] },
    { lbl: "Expo APIs — Camera, Location, Push Notifications, Image Picker", src: [{ tag: "DOCS", tc: "#4d9de0", url: "https://docs.expo.dev/versions/latest/", name: "Expo SDK reference" }] },
    { lbl: "Reanimated — animations, useSharedValue, gestures", src: [{ tag: "DOCS", tc: "#4d9de0", url: "https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/your-first-animation", name: "Reanimated — Your First Animation" }] },
    { lbl: "Publishing — EAS Build, App Store, Play Store, OTA updates", src: [{ tag: "DOCS", tc: "#4d9de0", url: "https://docs.expo.dev/build/introduction/", name: "EAS Build docs" }] },
    { lbl: "BUILD — Cross-platform app published to iOS and Android", src: [{ tag: "INSPO", tc: "#8b5cf6", url: "https://mobbin.com", name: "Mobbin — real app UI inspiration" }] },
  ]},
  { id: 4, label: "DevOps", time: "14-18mo", color: "from-cyan-500 to-cyan-600", earn: "$3K-15K", midAfter: 3, tasks: [
    { lbl: "Docker — images, containers, Dockerfile, Compose", src: [{ tag: "VIDEO", tc: "#ec4899", url: "https://www.youtube.com/watch?v=pTFZFxd5hIk", name: "Docker Crash Course" }] },
    { lbl: "CI/CD — GitHub Actions: automated testing, building, deploying", src: [{ tag: "DOCS", tc: "#4d9de0", url: "https://docs.github.com/en/actions/writing-workflows/quickstart", name: "GitHub Actions Quickstart" }] },
    { lbl: "Cloud deployment — Railway full-stack, AWS EC2, S3 basics", src: [{ tag: "GUIDE", tc: "#06b6d4", url: "https://railway.app", name: "Railway — free full-stack deployment" }] },
    { lbl: "Monitoring — Sentry error tracking, structured logging, uptime", src: [{ tag: "DOCS", tc: "#4d9de0", url: "https://docs.sentry.io/platforms/javascript/guides/node/", name: "Sentry Node.js guide" }] },
    { lbl: "Kubernetes basics — pods, services, deployments, scaling concepts", src: [{ tag: "VIDEO", tc: "#ec4899", url: "https://www.youtube.com/watch?v=s_o8dwzRlu4", name: "Kubernetes in 6 min" }] },
    { lbl: "BUILD — Containerize API + CI/CD pipeline + cloud deployment", src: [{ tag: "GUIDE", tc: "#06b6d4", url: "https://docs.railway.app/guides/dockerfiles", name: "Deploy Docker on Railway" }] },
  ]},
  { id: 5, label: "AI + SaaS", time: "18mo+", color: "from-pink-500 to-pink-600", earn: "$5K-20K+", midAfter: 3, tasks: [
    { lbl: "AI APIs — Claude + OpenAI: messages, system prompts, tokens, streaming", src: [{ tag: "DOCS", tc: "#4d9de0", url: "https://docs.anthropic.com/en/api/getting-started", name: "Anthropic API docs" }] },
    { lbl: "RAG — embeddings, vector databases, chunking, LangChain", src: [{ tag: "VIDEO", tc: "#ec4899", url: "https://www.youtube.com/watch?v=T-D1OfcDW1M", name: "RAG Explained — Fireship" }] },
    { lbl: "AI features — chat interfaces, document Q&A, streaming responses", src: [{ tag: "GUIDE", tc: "#06b6d4", url: "https://sdk.vercel.ai/docs/introduction", name: "Vercel AI SDK" }] },
    { lbl: "SaaS — multi-tenancy, Stripe billing, usage metering, webhooks", src: [{ tag: "DOCS", tc: "#4d9de0", url: "https://stripe.com/docs/billing/subscriptions/build-subscriptions", name: "Stripe — Build Subscriptions" }] },
    { lbl: "System design — monolith vs microservices, message queues, load balancers", src: [{ tag: "VIDEO", tc: "#ec4899", url: "https://www.youtube.com/watch?v=i53Gi_K3o7I", name: "System Design for Beginners" }] },
    { lbl: "BUILD — AI-powered SaaS MVP with Stripe subscriptions and real users", src: [{ tag: "INSPO", tc: "#8b5cf6", url: "https://www.producthunt.com", name: "Product Hunt — validate your idea" }] },
  ]},
]

export const FIGMA_STAGES: FigmaStage[] = [
  { t: "Essentials", s: "DONE ✅", c: "text-emerald-600", d: "Component creation, auto layout, variants, styles, prototyping, inspect mode, export.", r: [{ tag: "CHANNEL", tc: "#2dd4a0", url: "https://www.youtube.com/@bringyourownlaptop", name: "BYOL — Daniel Scott" }, { tag: "READ", tc: "#f59e0b", url: "https://www.refactoringui.com", name: "Refactoring UI — start now" }] },
  { t: "Advanced", s: "In progress", c: "text-blue-600", d: "Advanced auto layout, complex component properties, boolean variants, interactive components, smart animate.", r: [{ tag: "COURSE", tc: "#2dd4a0", url: "https://www.bringyourownlaptop.com", name: "BYOL Advanced Figma" }, { tag: "CHANNEL", tc: "#ec4899", url: "https://www.youtube.com/@MalewiczHype", name: "Malewicz — UI design critiques" }] },
  { t: "Design Tokens", s: "3 hrs", c: "text-amber-600", d: "Token naming, Token Studio plugin, W3C spec format, dark/light theme switching.", r: [{ tag: "CHANNEL", tc: "#f59e0b", url: "https://www.youtube.com/@TokensStudio", name: "Token Studio Official" }, { tag: "DOCS", tc: "#4d9de0", url: "https://docs.tokens.studio", name: "Token Studio Docs" }] },
  { t: "Accessibility", s: "2 hrs", c: "text-cyan-600", d: "WCAG 2.1 AA contrast, touch targets 44x44px, focus state design, reduced-motion.", r: [{ tag: "COURSE", tc: "#06b6d4", url: "https://dequeuniversity.com/courses", name: "Deque University" }, { tag: "TOOL", tc: "#4d9de0", url: "https://webaim.org/resources/contrastchecker/", name: "WebAIM Contrast Checker" }] },
  { t: "Adv. Prototyping", s: "3 hrs", c: "text-purple-600", d: "Smart animate, scroll containers, interactive component state machines, Lottie animation.", r: [{ tag: "CHANNEL", tc: "#ec4899", url: "https://www.youtube.com/@juxtopposed", name: "Juxtopposed" }, { tag: "CHANNEL", tc: "#ec4899", url: "https://www.youtube.com/@MalewiczHype", name: "Malewicz — interaction critiques" }] },
  { t: "Dev Handoff", s: "2 hrs", c: "text-pink-600", d: "Figma Dev Mode: inspect panel, CSS/Tailwind code snippets, annotation layers.", r: [{ tag: "GUIDE", tc: "#ec4899", url: "https://www.figma.com/dev-mode/", name: "Figma Dev Mode" }] },
  { t: "Portfolio", s: "Ongoing", c: "text-amber-500", d: "Case study structure: problem, your role, process, decisions, outcome.", r: [{ tag: "CHANNEL", tc: "#f59e0b", url: "https://www.youtube.com/@femkesvs", name: "Femke van Schoonhoven" }, { tag: "STUDY", tc: "#06b6d4", url: "https://www.casestudy.club", name: "Case Study Club" }] },
  { t: "LUMARY System", s: "Ship it", c: "text-pink-500", d: "LUMARY design system v1: dark gold arc-reactor tokens, published on Figma Community.", r: [{ tag: "READ", tc: "#ec4899", url: "https://bradfrost.com/blog/post/atomic-web-design/", name: "Atomic Design by Brad Frost" }, { tag: "STUDY", tc: "#4d9de0", url: "https://m3.material.io", name: "Material Design 3" }] },
]

export const ARABIC_STAGES = [
  { t: "Learn to Read Arabic Script", icon: "📖", color: "from-emerald-500 to-emerald-600", d: "Master the Arabic alphabet — 28 letters, forms, vowel marks. Goal: Read any Arabic text aloud.", r: [{ tag: "APP", tc: "#2dd4a0", url: "https://www.duolingo.com/course/ar/en/Learn-Arabic", name: "Duolingo Arabic" }, { tag: "VIDEO", tc: "#ec4899", url: "https://www.youtube.com/playlist?list=PL6TlMIZ5ylgpLYKU_z1YxdAAw7wrTWvcQ", name: "Arabic 101 — Read Anything" }] },
  { t: "Pronounce — Makharij", icon: "🗣️", color: "from-amber-500 to-amber-600", d: "Correct pronunciation (makharij) of every letter. Tajweed rules for Quran recitation.", r: [{ tag: "VIDEO", tc: "#ec4899", url: "https://www.youtube.com/playlist?list=PL6TlMIZ5ylgqoNf7LW6hHEdPVIMWCnMFm", name: "Makharij & Sifaat (30 lessons)" }] },
  { t: "Understand 50% of Quran", icon: "🕌", color: "from-blue-500 to-blue-600", d: "Learn the most frequent Quranic vocabulary. 70% of Quran uses only 500 words.", r: [{ tag: "COURSE", tc: "#2dd4a0", url: "https://academy.arabic101.org/courses/understand-the-holy-quran", name: "Arabic 101 Academy" }] },
  { t: "Quranic Grammar", icon: "📐", color: "from-purple-500 to-purple-600", d: "Sarf (morphology) and Nahw (syntax) — how words are built and sentences structured.", r: [{ tag: "VIDEO", tc: "#ec4899", url: "https://www.youtube.com/watch?v=QzGG66l6frQ", name: "Verb Roots MADE EASY" }] },
  { t: "Speak at 65%+", icon: "💬", color: "from-pink-500 to-pink-600", d: "Start speaking Arabic in daily situations. Mistakes are proof you're trying.", r: [{ tag: "VIDEO", tc: "#ec4899", url: "https://www.youtube.com/playlist?list=PL0A4EB5D68AF2E67E", name: "Maha Arabic Beginner Lessons" }, { tag: "COURSE", tc: "#2dd4a0", url: "https://www.arabicpod101.com", name: "ArabicPod101" }] },
  { t: "Understand 85% of Quran", icon: "🌟", color: "from-amber-500 to-amber-600", d: "Deep vocabulary expansion. Study tafsir alongside. Read Quran daily with understanding.", r: [{ tag: "VIDEO", tc: "#ec4899", url: "https://www.youtube.com/@Arabic101/playlists", name: "Quranology (76 lessons)" }] },
  { t: "Fluency", icon: "🏆", color: "from-emerald-500 to-emerald-600", d: "Full fluency in reading, writing, speaking, and understanding Arabic. Teach others.", r: [{ tag: "VIDEO", tc: "#ec4899", url: "https://www.youtube.com/@ArabicPod101", name: "ArabicPod101 YouTube" }] },
]
