export interface Nudge {
  id: string
  type: "habit" | "goal" | "focus" | "review" | "payment" | "evening" | "milestone"
  message: string
  severity: "low" | "medium" | "high"
  action?: { label: string; href: string }
}

export function generateNudges(data: {
  mode: string
  habits: { doneCount: number; totalCount: number }
  focus: { totalMinutes: number }
  goals: { today: unknown[] }
  weeklyReview: unknown | null
  upcoming: { unpaidPayments: unknown[] }
}): Nudge[] {
  const nudges: Nudge[] = []
  const { mode, habits, focus, goals, weeklyReview, upcoming } = data

  if (mode === "evening") {
    const undone = habits.totalCount - habits.doneCount
    if (undone > 0) {
      nudges.push({
        id: "habits-undone",
        type: "habit",
        message: `You still have ${undone} habit${undone > 1 ? "s" : ""} left today. Finish strong!`,
        severity: "medium",
        action: { label: "View Habits", href: "/habits" },
      })
    }
    if (focus.totalMinutes < 120) {
      nudges.push({
        id: "focus-low",
        type: "focus",
        message: `Only ${focus.totalMinutes} min of focus today. Try a quick evening session.`,
        severity: "low",
        action: { label: "Start Timer", href: "/timer" },
      })
    }
    nudges.push({
      id: "evening-reflection",
      type: "evening",
      message: "Evening reflection time — journal about your day.",
      severity: "low",
      action: { label: "Write Journal", href: "/journal" },
    })
  }

  if (mode === "morning") {
    if (goals.today.length === 0) {
      nudges.push({
        id: "no-today-goals",
        type: "goal",
        message: "No goals set for today. Define what matters most.",
        severity: "high",
        action: { label: "Set Goals", href: "/goals" },
      })
    }
    if (upcoming.unpaidPayments.length > 0) {
      nudges.push({
        id: "unpaid-payments",
        type: "payment",
        message: `${upcoming.unpaidPayments.length} payment${upcoming.unpaidPayments.length > 1 ? "s" : ""} pending. Follow up today.`,
        severity: "high",
        action: { label: "View Finance", href: "/finance" },
      })
    }
  }

  if (!weeklyReview) {
    nudges.push({
      id: "weekly-review-due",
      type: "review",
      message: "No weekly review this week yet. Reflect on your wins and lessons.",
      severity: "medium",
      action: { label: "Write Review", href: "/weekly-review" },
    })
  }

  return nudges
}
