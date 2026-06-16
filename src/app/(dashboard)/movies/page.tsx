"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Film, Heart, Clapperboard, Search, Filter, Loader2, AlertCircle, RefreshCw,
  Eye, EyeOff, Star, CheckCircle,
} from "lucide-react"
import clsx from "clsx"

type Movie = {
  key: string
  title: string
  year: number
  saga: string
  phase?: string
}

type Saga = {
  name: string
  movies: Movie[]
}

type Category = {
  name: string
  movies: Movie[]
}

const MCU_SAGAS: Saga[] = [
  {
    name: "Earth-616 Sacred Timeline",
    movies: [
      { key: "iron-man", title: "Iron Man", year: 2008, saga: "Earth-616 Sacred Timeline", phase: "Phase 1" },
      { key: "incredible-hulk", title: "The Incredible Hulk", year: 2008, saga: "Earth-616 Sacred Timeline", phase: "Phase 1" },
      { key: "iron-man-2", title: "Iron Man 2", year: 2010, saga: "Earth-616 Sacred Timeline", phase: "Phase 1" },
      { key: "thor", title: "Thor", year: 2011, saga: "Earth-616 Sacred Timeline", phase: "Phase 1" },
      { key: "captain-america-first-avenger", title: "Captain America: The First Avenger", year: 2011, saga: "Earth-616 Sacred Timeline", phase: "Phase 1" },
      { key: "the-avengers", title: "The Avengers", year: 2012, saga: "Earth-616 Sacred Timeline", phase: "Phase 1" },
      { key: "iron-man-3", title: "Iron Man 3", year: 2013, saga: "Earth-616 Sacred Timeline", phase: "Phase 2" },
      { key: "thor-dark-world", title: "Thor: The Dark World", year: 2013, saga: "Earth-616 Sacred Timeline", phase: "Phase 2" },
      { key: "winter-soldier", title: "Captain America: The Winter Soldier", year: 2014, saga: "Earth-616 Sacred Timeline", phase: "Phase 2" },
      { key: "guardians-1", title: "Guardians of the Galaxy", year: 2014, saga: "Earth-616 Sacred Timeline", phase: "Phase 2" },
      { key: "age-of-ultron", title: "Avengers: Age of Ultron", year: 2015, saga: "Earth-616 Sacred Timeline", phase: "Phase 2" },
      { key: "ant-man-1", title: "Ant-Man", year: 2015, saga: "Earth-616 Sacred Timeline", phase: "Phase 2" },
      { key: "civil-war", title: "Captain America: Civil War", year: 2016, saga: "Earth-616 Sacred Timeline", phase: "Phase 3" },
      { key: "doctor-strange-1", title: "Doctor Strange", year: 2016, saga: "Earth-616 Sacred Timeline", phase: "Phase 3" },
      { key: "guardians-2", title: "Guardians of the Galaxy Vol. 2", year: 2017, saga: "Earth-616 Sacred Timeline", phase: "Phase 3" },
      { key: "homecoming", title: "Spider-Man: Homecoming", year: 2017, saga: "Earth-616 Sacred Timeline", phase: "Phase 3" },
      { key: "ragnarok", title: "Thor: Ragnarok", year: 2017, saga: "Earth-616 Sacred Timeline", phase: "Phase 3" },
      { key: "black-panther-1", title: "Black Panther", year: 2018, saga: "Earth-616 Sacred Timeline", phase: "Phase 3" },
      { key: "infinity-war", title: "Avengers: Infinity War", year: 2018, saga: "Earth-616 Sacred Timeline", phase: "Phase 3" },
      { key: "ant-man-wasp", title: "Ant-Man and the Wasp", year: 2018, saga: "Earth-616 Sacred Timeline", phase: "Phase 3" },
      { key: "captain-marvel", title: "Captain Marvel", year: 2019, saga: "Earth-616 Sacred Timeline", phase: "Phase 3" },
      { key: "endgame", title: "Avengers: Endgame", year: 2019, saga: "Earth-616 Sacred Timeline", phase: "Phase 3" },
      { key: "far-from-home", title: "Spider-Man: Far From Home", year: 2019, saga: "Earth-616 Sacred Timeline", phase: "Phase 3" },
      { key: "black-widow", title: "Black Widow", year: 2021, saga: "Earth-616 Sacred Timeline", phase: "Phase 4" },
      { key: "shang-chi", title: "Shang-Chi and the Legend of the Ten Rings", year: 2021, saga: "Earth-616 Sacred Timeline", phase: "Phase 4" },
      { key: "eternals", title: "Eternals", year: 2021, saga: "Earth-616 Sacred Timeline", phase: "Phase 4" },
      { key: "no-way-home", title: "Spider-Man: No Way Home", year: 2021, saga: "Earth-616 Sacred Timeline", phase: "Phase 4" },
      { key: "multiverse-of-madness", title: "Doctor Strange in the Multiverse of Madness", year: 2022, saga: "Earth-616 Sacred Timeline", phase: "Phase 4" },
      { key: "love-and-thunder", title: "Thor: Love and Thunder", year: 2022, saga: "Earth-616 Sacred Timeline", phase: "Phase 4" },
      { key: "wakanda-forever", title: "Black Panther: Wakanda Forever", year: 2022, saga: "Earth-616 Sacred Timeline", phase: "Phase 4" },
      { key: "quantumania", title: "Ant-Man and the Wasp: Quantumania", year: 2023, saga: "Earth-616 Sacred Timeline", phase: "Phase 5" },
      { key: "gotg-vol-3", title: "Guardians of the Galaxy Vol. 3", year: 2023, saga: "Earth-616 Sacred Timeline", phase: "Phase 5" },
      { key: "the-marvels", title: "The Marvels", year: 2023, saga: "Earth-616 Sacred Timeline", phase: "Phase 5" },
      { key: "brave-new-world", title: "Captain America: Brave New World", year: 2025, saga: "Earth-616 Sacred Timeline", phase: "Phase 5" },
      { key: "thunderbolts", title: "Thunderbolts*", year: 2025, saga: "Earth-616 Sacred Timeline", phase: "Phase 5" },
      { key: "blade", title: "Blade", year: 2025, saga: "Earth-616 Sacred Timeline", phase: "Phase 6" },
      { key: "doomsday", title: "Avengers: Doomsday", year: 2026, saga: "Earth-616 Sacred Timeline", phase: "Phase 6" },
      { key: "secret-wars", title: "Avengers: Secret Wars", year: 2027, saga: "Earth-616 Sacred Timeline", phase: "Phase 6" },
    ],
  },
  {
    name: "X-Men Track A",
    movies: [
      { key: "first-class", title: "X-Men: First Class", year: 2011, saga: "X-Men Track A", phase: "Story 1962" },
      { key: "x-men-1", title: "X-Men", year: 2000, saga: "X-Men Track A", phase: "Original Trilogy" },
      { key: "x2", title: "X2: X-Men United", year: 2003, saga: "X-Men Track A", phase: "Original Trilogy" },
      { key: "last-stand", title: "X-Men: The Last Stand", year: 2006, saga: "X-Men Track A", phase: "Original Trilogy" },
      { key: "origins-wolverine", title: "X-Men Origins: Wolverine", year: 2009, saga: "X-Men Track A", phase: "Wolverine Saga" },
      { key: "the-wolverine", title: "The Wolverine", year: 2013, saga: "X-Men Track A", phase: "Wolverine Saga" },
      { key: "dofp-future", title: "X-Men: Days of Future Past (Future)", year: 2014, saga: "X-Men Track A", phase: "Story 2023" },
    ],
  },
  {
    name: "X-Men Track B",
    movies: [
      { key: "dofp-past", title: "X-Men: Days of Future Past (1973)", year: 2014, saga: "X-Men Track B", phase: "Story 1973" },
      { key: "apocalypse", title: "X-Men: Apocalypse", year: 2016, saga: "X-Men Track B", phase: "Story 1983" },
      { key: "dark-phoenix", title: "X-Men: Dark Phoenix", year: 2019, saga: "X-Men Track B", phase: "Story 1992" },
      { key: "deadpool-1", title: "Deadpool", year: 2016, saga: "X-Men Track B", phase: "Deadpool Saga" },
      { key: "deadpool-2", title: "Deadpool 2", year: 2018, saga: "X-Men Track B", phase: "Deadpool Saga" },
      { key: "deadpool-wolverine", title: "Deadpool & Wolverine", year: 2024, saga: "X-Men Track B", phase: "Deadpool Saga" },
    ],
  },
  {
    name: "Raimi Universe",
    movies: [
      { key: "spider-man-2002", title: "Spider-Man", year: 2002, saga: "Raimi Universe", phase: "Raimi Trilogy" },
      { key: "spider-man-2-2004", title: "Spider-Man 2", year: 2004, saga: "Raimi Universe", phase: "Raimi Trilogy" },
      { key: "spider-man-3-2007", title: "Spider-Man 3", year: 2007, saga: "Raimi Universe", phase: "Raimi Trilogy" },
    ],
  },
  {
    name: "Webb Universe",
    movies: [
      { key: "amazing-spider-man-1", title: "The Amazing Spider-Man", year: 2012, saga: "Webb Universe", phase: "Webb Duology" },
      { key: "amazing-spider-man-2", title: "The Amazing Spider-Man 2", year: 2014, saga: "Webb Universe", phase: "Webb Duology" },
    ],
  },
  {
    name: "Sony SSU",
    movies: [
      { key: "venom-1", title: "Venom", year: 2018, saga: "Sony SSU", phase: "Venom Trilogy" },
      { key: "venom-2", title: "Venom: Let There Be Carnage", year: 2021, saga: "Sony SSU", phase: "Venom Trilogy" },
      { key: "venom-3", title: "Venom: The Last Dance", year: 2024, saga: "Sony SSU", phase: "Venom Trilogy" },
      { key: "morbius", title: "Morbius", year: 2022, saga: "Sony SSU", phase: "SSU" },
      { key: "madame-web", title: "Madame Web", year: 2024, saga: "Sony SSU", phase: "SSU" },
      { key: "kraven", title: "Kraven the Hunter", year: 2024, saga: "Sony SSU", phase: "SSU" },
    ],
  },
  {
    name: "Animated Spider-Verse",
    movies: [
      { key: "into-spider-verse", title: "Spider-Man: Into the Spider-Verse", year: 2018, saga: "Animated Spider-Verse", phase: "Spider-Verse" },
      { key: "across-spider-verse", title: "Spider-Man: Across the Spider-Verse", year: 2023, saga: "Animated Spider-Verse", phase: "Spider-Verse" },
      { key: "beyond-spider-verse", title: "Spider-Man: Beyond the Spider-Verse", year: 2026, saga: "Animated Spider-Verse", phase: "Spider-Verse" },
    ],
  },
  {
    name: "Non-linear / Loki / What If...? / Fantastic Four",
    movies: [
      { key: "loki-s1", title: "Loki: Season 1", year: 2021, saga: "Non-linear / Loki / What If...? / Fantastic Four", phase: "Multiverse Saga" },
      { key: "loki-s2", title: "Loki: Season 2", year: 2023, saga: "Non-linear / Loki / What If...? / Fantastic Four", phase: "Multiverse Saga" },
      { key: "what-if-s1", title: "What If...? Season 1", year: 2021, saga: "Non-linear / Loki / What If...? / Fantastic Four", phase: "Multiverse Saga" },
      { key: "what-if-s2", title: "What If...? Season 2", year: 2023, saga: "Non-linear / Loki / What If...? / Fantastic Four", phase: "Multiverse Saga" },
      { key: "what-if-s3", title: "What If...? Season 3", year: 2024, saga: "Non-linear / Loki / What If...? / Fantastic Four", phase: "Multiverse Saga" },
      { key: "fantastic-four-first-steps", title: "The Fantastic Four: First Steps", year: 2025, saga: "Non-linear / Loki / What If...? / Fantastic Four", phase: "Phase 6" },
    ],
  },
]

const DATE_NIGHT_CATEGORIES: Category[] = [
  {
    name: "Romance / Rom-Com",
    movies: [
      { key: "before-sunrise", title: "Before Sunrise", year: 1995, saga: "Romance / Rom-Com" },
      { key: "before-sunset", title: "Before Sunset", year: 2004, saga: "Romance / Rom-Com" },
      { key: "before-midnight", title: "Before Midnight", year: 2013, saga: "Romance / Rom-Com" },
      { key: "eternal-sunshine", title: "Eternal Sunshine of the Spotless Mind", year: 2004, saga: "Romance / Rom-Com" },
      { key: "pride-and-prejudice", title: "Pride & Prejudice", year: 2005, saga: "Romance / Rom-Com" },
      { key: "la-la-land", title: "La La Land", year: 2016, saga: "Romance / Rom-Com" },
      { key: "about-time", title: "About Time", year: 2013, saga: "Romance / Rom-Com" },
      { key: "the-notebook", title: "The Notebook", year: 2004, saga: "Romance / Rom-Com" },
      { key: "titanic", title: "Titanic", year: 1997, saga: "Romance / Rom-Com" },
      { key: "when-harry-met-sally", title: "When Harry Met Sally...", year: 1989, saga: "Romance / Rom-Com" },
      { key: "notting-hill", title: "Notting Hill", year: 1999, saga: "Romance / Rom-Com" },
      { key: "crazy-rich-asians", title: "Crazy Rich Asians", year: 2018, saga: "Romance / Rom-Com" },
      { key: "10-things", title: "10 Things I Hate About You", year: 1999, saga: "Romance / Rom-Com" },
      { key: "crazy-stupid-love", title: "Crazy, Stupid, Love", year: 2011, saga: "Romance / Rom-Com" },
      { key: "love-actually", title: "Love Actually", year: 2003, saga: "Romance / Rom-Com" },
      { key: "the-holiday", title: "The Holiday", year: 2006, saga: "Romance / Rom-Com" },
    ],
  },
  {
    name: "Feel-Good / Comedy",
    movies: [
      { key: "grand-budapest", title: "The Grand Budapest Hotel", year: 2014, saga: "Feel-Good / Comedy" },
      { key: "little-miss-sunshine", title: "Little Miss Sunshine", year: 2006, saga: "Feel-Good / Comedy" },
      { key: "school-of-rock", title: "School of Rock", year: 2003, saga: "Feel-Good / Comedy" },
      { key: "paddington-2", title: "Paddington 2", year: 2017, saga: "Feel-Good / Comedy" },
      { key: "ferris-bueller", title: "Ferris Bueller's Day Off", year: 1986, saga: "Feel-Good / Comedy" },
    ],
  },
  {
    name: "Sci-Fi / Fantasy",
    movies: [
      { key: "interstellar", title: "Interstellar", year: 2014, saga: "Sci-Fi / Fantasy" },
      { key: "arrival", title: "Arrival", year: 2016, saga: "Sci-Fi / Fantasy" },
      { key: "her", title: "Her", year: 2013, saga: "Sci-Fi / Fantasy" },
      { key: "inception", title: "Inception", year: 2010, saga: "Sci-Fi / Fantasy" },
      { key: "the-prestige", title: "The Prestige", year: 2006, saga: "Sci-Fi / Fantasy" },
    ],
  },
  {
    name: "Animated",
    movies: [
      { key: "up", title: "Up", year: 2009, saga: "Animated" },
      { key: "coco", title: "Coco", year: 2017, saga: "Animated" },
      { key: "soul", title: "Soul", year: 2020, saga: "Animated" },
      { key: "spirited-away", title: "Spirited Away", year: 2001, saga: "Animated" },
      { key: "your-name", title: "Your Name", year: 2016, saga: "Animated" },
    ],
  },
  {
    name: "Classics",
    movies: [
      { key: "casablanca", title: "Casablanca", year: 1942, saga: "Classics" },
      { key: "roman-holiday", title: "Roman Holiday", year: 1953, saga: "Classics" },
      { key: "breakfast-at-tiffanys", title: "Breakfast at Tiffany's", year: 1961, saga: "Classics" },
      { key: "annie-hall", title: "Annie Hall", year: 1977, saga: "Classics" },
    ],
  },
  {
    name: "Foreign",
    movies: [
      { key: "parasite", title: "Parasite", year: 2019, saga: "Foreign" },
      { key: "cinema-paradiso", title: "Cinema Paradiso", year: 1988, saga: "Foreign" },
      { key: "lives-of-others", title: "The Lives of Others", year: 2006, saga: "Foreign" },
      { key: "amour", title: "Amour", year: 2012, saga: "Foreign" },
      { key: "amelie", title: "Amélie", year: 2001, saga: "Foreign" },
    ],
  },
  {
    name: "Documentary",
    movies: [
      { key: "wont-you-be-my-neighbor", title: "Won't You Be My Neighbor?", year: 2018, saga: "Documentary" },
      { key: "free-solo", title: "Free Solo", year: 2018, saga: "Documentary" },
    ],
  },
  {
    name: "Epic",
    movies: [
      { key: "out-of-africa", title: "Out of Africa", year: 1985, saga: "Epic" },
      { key: "atonement", title: "Atonement", year: 2007, saga: "Epic" },
    ],
  },
]

const MCU_FILTERS = [
  { id: "all" as const, label: "All", icon: Film },
  { id: "unwatched" as const, label: "Unwatched", icon: EyeOff },
  { id: "with-mary" as const, label: "With Mary", icon: Heart },
  { id: "rewatch" as const, label: "Rewatch", icon: RefreshCw },
]

const MCU_TOTAL = MCU_SAGAS.reduce((sum, s) => sum + s.movies.length, 0)
const DATE_TOTAL = DATE_NIGHT_CATEGORIES.reduce((sum, c) => sum + c.movies.length, 0)

export default function MoviesPage() {
  useEffect(() => { document.title = "Movies \u2014 LUMARY Studio" }, [])

  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<"mcu" | "date-night">("mcu")
  const [mcuFilter, setMcuFilter] = useState<"all" | "unwatched" | "with-mary" | "rewatch">("all")
  const [dateCategoryFilter, setDateCategoryFilter] = useState("All")
  const [collapsedSagas, setCollapsedSagas] = useState(() => new Set<string>())
  const [collapsedCategories, setCollapsedCategories] = useState(() => new Set<string>())
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; movieKey: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const { data: statusResp, isLoading, error, refetch } = useQuery({
    queryKey: ["movies"],
    queryFn: () => fetch("/api/v1/movies").then((r) => r.json()),
  })

  const saveMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      fetch("/api/v1/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] })
    },
  })

  const statusMap = useMemo(() => {
    const items: Record<string, unknown>[] = statusResp?.items ?? []
    const map: Record<string, Record<string, unknown>> = {}
    for (const item of items) {
      map[item.key as string] = item
    }
    return map
  }, [statusResp])

  const allMCUMovies = useMemo(() => MCU_SAGAS.flatMap((s) => s.movies), [])
  const allDateMovies = useMemo(() => DATE_NIGHT_CATEGORIES.flatMap((c) => c.movies), [])

  const filteredMCUSagas = useMemo(() => {
    if (mcuFilter === "all") return MCU_SAGAS
    return MCU_SAGAS
      .map((saga) => ({
        ...saga,
        movies: saga.movies.filter((m) => {
          const status = statusMap[m.key]
          if (mcuFilter === "unwatched") return !status?.watched
          if (mcuFilter === "with-mary") return !!status?.withMary
          if (mcuFilter === "rewatch") return !!status?.rewatch
          return true
        }),
      }))
      .filter((saga) => saga.movies.length > 0)
  }, [mcuFilter, statusMap])

  const filteredDateCategories = useMemo(() => {
    if (dateCategoryFilter === "All") return DATE_NIGHT_CATEGORIES
    return DATE_NIGHT_CATEGORIES.filter((c) => c.name === dateCategoryFilter)
  }, [dateCategoryFilter])

  const searchedMCU = useMemo(() => {
    if (!searchQuery.trim()) return filteredMCUSagas
    const q = searchQuery.toLowerCase()
    return filteredMCUSagas
      .map((saga) => ({
        ...saga,
        movies: saga.movies.filter(
          (m) => m.title.toLowerCase().includes(q) || m.phase?.toLowerCase().includes(q)
        ),
      }))
      .filter((saga) => saga.movies.length > 0)
  }, [filteredMCUSagas, searchQuery])

  const searchedDate = useMemo(() => {
    if (!searchQuery.trim()) return filteredDateCategories
    const q = searchQuery.toLowerCase()
    return filteredDateCategories
      .map((cat) => ({
        ...cat,
        movies: cat.movies.filter((m) => m.title.toLowerCase().includes(q)),
      }))
      .filter((cat) => cat.movies.length > 0)
  }, [filteredDateCategories, searchQuery])

  const mcuStats = useMemo(() => {
    const watched = allMCUMovies.filter((m) => statusMap[m.key]?.watched).length
    const withMary = allMCUMovies.filter((m) => statusMap[m.key]?.withMary).length
    const rewatched = allMCUMovies.filter((m) => statusMap[m.key]?.rewatch).length
    return { total: allMCUMovies.length, watched, withMary, rewatched }
  }, [allMCUMovies, statusMap])

  const dateStats = useMemo(() => {
    const watched = allDateMovies.filter((m) => statusMap[m.key]?.watched).length
    const saved = allDateMovies.filter((m) => statusMap[m.key]?.withMary).length
    return { total: allDateMovies.length, watched, saved }
  }, [allDateMovies, statusMap])

  const handleToggleWatched = useCallback(
    (movie: Movie) => {
      const current = statusMap[movie.key] ?? {}
      saveMutation.mutate({
        key: movie.key,
        title: movie.title,
        year: movie.year,
        saga: movie.saga,
        phase: movie.phase ?? "",
        watched: !current.watched,
        withMary: current.withMary ?? false,
        rewatch: current.rewatch ?? false,
      })
    },
    [statusMap, saveMutation]
  )

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, movieKey: string) => {
      e.preventDefault()
      setContextMenu({ x: e.clientX, y: e.clientY, movieKey })
    },
    []
  )

  const handleContextAction = useCallback(
    (movieKey: string, field: "withMary" | "rewatch") => {
      const movie = allMCUMovies.find((m) => m.key === movieKey)
      if (!movie) return
      const current = statusMap[movieKey] ?? {}
      saveMutation.mutate({
        key: movie.key,
        title: movie.title,
        year: movie.year,
        saga: movie.saga,
        phase: movie.phase ?? "",
        watched: current.watched ?? false,
        withMary: field === "withMary" ? !current.withMary : (current.withMary ?? false),
        rewatch: field === "rewatch" ? !current.rewatch : (current.rewatch ?? false),
      })
      setContextMenu(null)
    },
    [allMCUMovies, statusMap, saveMutation]
  )

  useEffect(() => {
    const handleClick = () => setContextMenu(null)
    window.addEventListener("click", handleClick)
    return () => window.removeEventListener("click", handleClick)
  }, [])

  const toggleSaga = (name: string) => {
    setCollapsedSagas((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const toggleCategory = (name: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] animate-fadeIn">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-error-container border border-error/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-error" />
          </div>
          <h3 className="text-lg font-semibold text-on-surface mb-1">Failed to load movie data</h3>
          <p className="text-sm text-on-surface-variant/70 mb-6">Please try refreshing the page</p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary-fixed-dim transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" />
          <div className="h-6 w-48 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" />
        </div>
        <div className="glass-card p-card-padding space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-24 flex-1 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" />
              <div className="h-24 flex-1 rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-highest bg-[length:200%_100%] animate-shimmer" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 stagger-children">
      <div>
        <h1 className="text-2xl font-heading font-semibold text-on-surface flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
            <Clapperboard className="w-5 h-5 text-white" />
          </span>
          Movies
        </h1>
        <p className="text-sm text-on-surface-variant/80 mt-1">
          Track your MCU multiverse journey and date night watchlist
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-2xl bg-surface-variant/30 border border-outline-variant/20 w-fit">
        <button
          onClick={() => setActiveTab("mcu")}
          className={clsx(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all",
            activeTab === "mcu"
              ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
              : "text-on-surface-variant/80 hover:text-on-surface hover:bg-white/40"
          )}
        >
          <Film className="w-4 h-4" />
          MCU Multiverse ({MCU_TOTAL})
        </button>
        <button
          onClick={() => setActiveTab("date-night")}
          className={clsx(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all",
            activeTab === "date-night"
              ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
              : "text-on-surface-variant/80 hover:text-on-surface hover:bg-white/40"
          )}
        >
          <Heart className="w-4 h-4" />
          Date Night with Mary ({DATE_TOTAL})
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/70" />
        <input
          type="text"
          placeholder={activeTab === "mcu" ? "Search MCU movies..." : "Search date night movies..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-outline-variant/30 rounded-xl pl-11 pr-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(157,67,25,0.08)] transition-all"
        />
      </div>

      {/* MCU Tab */}
      {activeTab === "mcu" && (
        <>
          {/* MCU Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-card p-4">
              <p className="text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider mb-1">Total</p>
              <p className="text-2xl font-bold font-heading text-on-surface">{mcuStats.total}</p>
              <p className="text-xs text-on-surface-variant/80 mt-0.5">MCU films</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider mb-1">Watched</p>
              <p className="text-2xl font-bold font-heading text-emerald-600">{mcuStats.watched}</p>
              <p className="text-xs text-on-surface-variant/80 mt-0.5">{((mcuStats.watched / mcuStats.total) * 100).toFixed(0)}% complete</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider mb-1">With Mary</p>
              <p className="text-2xl font-bold font-heading text-rose-500">{mcuStats.withMary}</p>
              <p className="text-xs text-on-surface-variant/80 mt-0.5">Watched together</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider mb-1">Rewatched</p>
              <p className="text-2xl font-bold font-heading text-amber-500">{mcuStats.rewatched}</p>
              <p className="text-xs text-on-surface-variant/80 mt-0.5">Repeat viewings</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="glass-card p-card-padding">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider">
                Watch Progress
              </span>
              <span className="text-sm font-semibold font-mono text-primary">
                {mcuStats.watched}/{mcuStats.total}
              </span>
            </div>
            <div className="h-3 rounded-full bg-surface-variant/50 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-700"
                style={{ width: `${mcuStats.total ? (mcuStats.watched / mcuStats.total) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* MCU Filter buttons */}
          <div className="flex flex-wrap gap-2">
            {MCU_FILTERS.map((f) => {
              const Icon = f.icon
              return (
                <button
                  key={f.id}
                  onClick={() => setMcuFilter(f.id)}
                  className={clsx(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all",
                    mcuFilter === f.id
                      ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                      : "bg-white/60 border border-outline-variant/30 text-on-surface-variant/70 hover:bg-white hover:text-on-surface"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {f.label}
                </button>
              )
            })}
          </div>

          {/* MCU Sagas */}
          <div className="space-y-4">
            {searchedMCU.map((saga) => {
              const collapsed = collapsedSagas.has(saga.name)
              const watchedCount = saga.movies.filter((m) => statusMap[m.key]?.watched).length
              return (
                <div key={saga.name} className="glass-card p-card-padding overflow-hidden">
                  <button
                    onClick={() => toggleSaga(saga.name)}
                    className="w-full flex items-center justify-between text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={clsx(
                        "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                        "bg-gradient-to-br from-primary/10 to-primary/5"
                      )}>
                        <Film className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-on-surface">{saga.name}</h3>
                        <p className="text-xs text-on-surface-variant/80">
                          {saga.movies.length} films &middot; {watchedCount} watched
                        </p>
                      </div>
                    </div>
                    <div className={clsx(
                      "w-6 h-6 rounded-lg bg-surface-variant/30 flex items-center justify-center transition-transform duration-300",
                      collapsed && "rotate-180"
                    )}>
                      <svg className="w-3.5 h-3.5 text-on-surface-variant/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  <div className={clsx(
                    "transition-all duration-300 overflow-hidden",
                    collapsed ? "max-h-0 opacity-0 mt-0" : "max-h-[9999px] opacity-100 mt-4"
                  )}>
                    {watchedCount > 0 && (
                      <div className="h-1.5 rounded-full bg-surface-variant/50 overflow-hidden mb-4">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-700"
                          style={{ width: `${(watchedCount / saga.movies.length) * 100}%` }}
                        />
                      </div>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
                      {saga.movies.map((movie) => {
                        const status = statusMap[movie.key] ?? {}
                        const isWatched = !!status.watched
                        const isWithMary = !!status.withMary
                        const isRewatch = !!status.rewatch
                        return (
                          <div
                            key={movie.key}
                            onClick={() => handleToggleWatched(movie)}
                            onContextMenu={(e) => handleContextMenu(e, movie.key)}
                            className={clsx(
                              "group/card relative p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none",
                              isWatched
                                ? "bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-700/30 hover:bg-emerald-50 hover:shadow-md hover:shadow-emerald-500/10"
                                : "bg-white/60 border-outline-variant/20 hover:bg-white hover:border-primary/20 hover:shadow-md hover:shadow-primary/5",
                            )}
                          >
                            {/* Indicators */}
                            <div className="absolute top-2 right-2 flex items-center gap-1">
                              {isWatched && (
                                <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm shadow-emerald-500/30">
                                  <CheckCircle className="w-3 h-3 text-white" />
                                </span>
                              )}
                              {isWithMary && (
                                <span className="w-4 h-4 rounded-full bg-rose-400 flex items-center justify-center shadow-sm shadow-rose-400/30">
                                  <Heart className="w-2.5 h-2.5 text-white fill-white" />
                                </span>
                              )}
                            </div>

                            {/* Rewatch badge */}
                            {isRewatch && (
                              <span className="absolute top-2 left-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[10px] font-semibold">
                                <RefreshCw className="w-2.5 h-2.5" />
                                REWATCH
                              </span>
                            )}

                            <div className={clsx(isRewatch ? "mt-5" : "")}>
                              <p className={clsx(
                                "text-xs font-semibold leading-tight transition-colors line-clamp-2",
                                isWatched
                                  ? "text-emerald-800 dark:text-emerald-200"
                                  : "text-on-surface group-hover/card:text-primary"
                              )}>
                                {movie.title}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <span className={clsx(
                                  "text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-md",
                                  isWatched
                                    ? "bg-emerald-100/70 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                                    : "bg-surface-variant/40 text-on-surface-variant/80"
                                )}>
                                  {movie.year}
                                </span>
                                {movie.phase && (
                                  <span className={clsx(
                                    "text-[10px] font-medium truncate max-w-[80px]",
                                    isWatched
                                      ? "text-emerald-600/60 dark:text-emerald-400/60"
                                      : "text-on-surface-variant/70"
                                  )}>
                                    {movie.phase}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}

            {searchedMCU.length === 0 && (
              <div className="glass-card p-card-padding flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-surface-variant/50 border border-outline-variant/30 flex items-center justify-center mx-auto mb-3">
                    <Search className="w-6 h-6 text-on-surface-variant/80" />
                  </div>
                  <p className="text-sm font-semibold text-on-surface mb-1">No movies found</p>
                  <p className="text-xs text-on-surface-variant/80">Try a different search or filter</p>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Date Night Tab */}
      {activeTab === "date-night" && (
        <>
          {/* Date Night Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card p-4">
              <p className="text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider mb-1">Total</p>
              <p className="text-2xl font-bold font-heading text-on-surface">{dateStats.total}</p>
              <p className="text-xs text-on-surface-variant/80 mt-0.5">Date night films</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider mb-1">Watched</p>
              <p className="text-2xl font-bold font-heading text-emerald-600">{dateStats.watched}</p>
              <p className="text-xs text-on-surface-variant/80 mt-0.5">{((dateStats.watched / dateStats.total) * 100).toFixed(0)}% complete</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider mb-1">Saved for Later</p>
              <p className="text-2xl font-bold font-heading text-rose-500">{dateStats.saved}</p>
              <p className="text-xs text-on-surface-variant/80 mt-0.5">On the watchlist</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="glass-card p-card-padding">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-on-surface-variant/80 uppercase tracking-wider">
                Date Night Progress
              </span>
              <span className="text-sm font-semibold font-mono text-primary">
                {dateStats.watched}/{dateStats.total}
              </span>
            </div>
            <div className="h-3 rounded-full bg-surface-variant/50 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-400 to-pink-500 transition-all duration-700"
                style={{ width: `${dateStats.total ? (dateStats.watched / dateStats.total) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setDateCategoryFilter("All")}
              className={clsx(
                "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all",
                dateCategoryFilter === "All"
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                  : "bg-white/60 border border-outline-variant/30 text-on-surface-variant/70 hover:bg-white hover:text-on-surface"
              )}
            >
              <Filter className="w-3.5 h-3.5" />
              All
            </button>
            {DATE_NIGHT_CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setDateCategoryFilter(cat.name)}
                className={clsx(
                  "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all",
                  dateCategoryFilter === cat.name
                    ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                    : "bg-white/60 border border-outline-variant/30 text-on-surface-variant/70 hover:bg-white hover:text-on-surface"
                )}
              >
                {cat.movies.length}
              </button>
            ))}
          </div>

          {/* Date Night Categories */}
          <div className="space-y-4">
            {searchedDate.map((cat) => {
              const collapsed = collapsedCategories.has(cat.name)
              const watchedCount = cat.movies.filter((m) => statusMap[m.key]?.watched).length
              return (
                <div key={cat.name} className="glass-card p-card-padding overflow-hidden">
                  <button
                    onClick={() => toggleCategory(cat.name)}
                    className="w-full flex items-center justify-between text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={clsx(
                        "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                        "bg-gradient-to-br from-rose-500/10 to-pink-500/5"
                      )}>
                        <Heart className="w-4 h-4 text-rose-500" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-on-surface">{cat.name}</h3>
                        <p className="text-xs text-on-surface-variant/80">
                          {cat.movies.length} films &middot; {watchedCount} watched
                        </p>
                      </div>
                    </div>
                    <div className={clsx(
                      "w-6 h-6 rounded-lg bg-surface-variant/30 flex items-center justify-center transition-transform duration-300",
                      collapsed && "rotate-180"
                    )}>
                      <svg className="w-3.5 h-3.5 text-on-surface-variant/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  <div className={clsx(
                    "transition-all duration-300 overflow-hidden",
                    collapsed ? "max-h-0 opacity-0 mt-0" : "max-h-[9999px] opacity-100 mt-4"
                  )}>
                    {watchedCount > 0 && (
                      <div className="h-1.5 rounded-full bg-surface-variant/50 overflow-hidden mb-4">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-rose-400 to-pink-500 transition-all duration-700"
                          style={{ width: `${(watchedCount / cat.movies.length) * 100}%` }}
                        />
                      </div>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                      {cat.movies.map((movie) => {
                        const status = statusMap[movie.key] ?? {}
                        const isWatched = !!status.watched
                        const isSaved = !!status.withMary
                        return (
                          <div
                            key={movie.key}
                            onClick={() => handleToggleWatched(movie)}
                            className={clsx(
                              "group/card relative p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none",
                              isWatched
                                ? "bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-700/30 hover:bg-emerald-50 hover:shadow-md hover:shadow-emerald-500/10"
                                : "bg-white/60 border-outline-variant/20 hover:bg-white hover:border-rose-300/40 hover:shadow-md hover:shadow-rose-500/5",
                            )}
                          >
                            <div className="absolute top-2 right-2 flex items-center gap-1">
                              {isWatched && (
                                <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm shadow-emerald-500/30">
                                  <CheckCircle className="w-3 h-3 text-white" />
                                </span>
                              )}
                              {isSaved && (
                                <span className="w-4 h-4 rounded-full bg-rose-400 flex items-center justify-center shadow-sm shadow-rose-400/30">
                                  <Heart className="w-2.5 h-2.5 text-white fill-white" />
                                </span>
                              )}
                            </div>

                            <p className={clsx(
                              "text-xs font-semibold leading-tight transition-colors line-clamp-2 pt-5",
                              isWatched
                                ? "text-emerald-800 dark:text-emerald-200"
                                : "text-on-surface group-hover/card:text-rose-600"
                            )}>
                              {movie.title}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <span className={clsx(
                                "text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-md",
                                isWatched
                                  ? "bg-emerald-100/70 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                                  : "bg-surface-variant/40 text-on-surface-variant/80"
                              )}>
                                {movie.year}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}

            {searchedDate.length === 0 && (
              <div className="glass-card p-card-padding flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-surface-variant/50 border border-outline-variant/30 flex items-center justify-center mx-auto mb-3">
                    <Search className="w-6 h-6 text-on-surface-variant/80" />
                  </div>
                  <p className="text-sm font-semibold text-on-surface mb-1">No movies found</p>
                  <p className="text-xs text-on-surface-variant/80">Try a different search or filter</p>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 w-48 rounded-xl bg-white border border-outline-variant/20 shadow-xl shadow-black/10 overflow-hidden animate-fadeIn"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {(() => {
            const movie = allMCUMovies.find((m) => m.key === contextMenu.movieKey)
            if (!movie) return null
            const status = statusMap[movie.key] ?? {}
            return (
              <>
                <div className="px-4 py-2.5 border-b border-outline-variant/10">
                  <p className="text-xs font-semibold text-on-surface truncate">{movie.title}</p>
                  <p className="text-[10px] text-on-surface-variant/80">{movie.year}</p>
                </div>
                <button
                  onClick={() => handleContextAction(movie.key, "withMary")}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-on-surface hover:bg-surface-variant/30 transition-all text-left"
                >
                  <Heart className={clsx("w-3.5 h-3.5", status.withMary ? "text-rose-500 fill-rose-500" : "text-on-surface-variant/80")} />
                  {status.withMary ? "Remove With Mary" : "Mark With Mary"}
                </button>
                <button
                  onClick={() => handleContextAction(movie.key, "rewatch")}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-on-surface hover:bg-surface-variant/30 transition-all text-left"
                >
                  <RefreshCw className={clsx("w-3.5 h-3.5", status.rewatch ? "text-amber-500" : "text-on-surface-variant/80")} />
                  {status.rewatch ? "Remove Rewatch" : "Mark as Rewatch"}
                </button>
              </>
            )
          })()}
        </div>
      )}
    </div>
  )
}
