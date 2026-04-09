export type DateRange = {
  start: Date | null
  end: Date | null
}

export type Note = {
  id: string
  dateStr: string // YYYY-MM-DD
  content: string
}

export type ThemeColors = {
  primary: string
  primaryLight: string
}
