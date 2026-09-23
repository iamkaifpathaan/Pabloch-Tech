/** Contact form options. Budgets line up with the published starting prices. */

export interface Choice {
  readonly value: string;
  readonly label: string;
}

export const projectTypes: readonly Choice[] = [
  { value: "Website", label: "Website" },
  { value: "Online store", label: "Online store" },
  { value: "Landing page", label: "Landing page" },
  { value: "Product feature", label: "Product feature" },
  { value: "Redesign", label: "Redesign" },
  { value: "Website care", label: "Website care" },
  { value: "Not sure yet", label: "Not sure yet" },
];

export const budgets: readonly Choice[] = [
  { value: "$400 – $700", label: "$400 – 700" },
  { value: "$700 – $1,200", label: "$700 – 1,200" },
  { value: "$1,200 – $2,500", label: "$1,200 – 2,500" },
  { value: "$2,500+", label: "$2,500+" },
  { value: "Not sure yet", label: "Not sure yet" },
];

export const callPreferences: readonly Choice[] = [
  { value: "Email is fine", label: "Email is fine" },
  { value: "Zoom call", label: "Zoom" },
  { value: "Google Meet", label: "Google Meet" },
  { value: "Telegram", label: "Telegram" },
  { value: "Phone call", label: "Phone" },
];

export const contactCopy = {
  title: "Tell us what you’re building.",
  lede: "A few lines is enough. We reply within 24 hours with what we’d build, what it would cost and how long it would take — and if it’s a fit, your first draft is free.",
  submit: "Send project brief",
  reassurance: "No deposit, no card details, no obligation. Your details go to our inbox and nowhere else.",
  success: {
    title: "Brief received.",
    body: "It’s landed in our inbox. We’ll reply within 24 hours with what we’d build, what it would cost and how long it would take — and if you asked for a call, the invite comes with that reply.",
  },
} as const;
