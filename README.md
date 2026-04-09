# Wall Calendar

An interactive wall calendar built with React, TypeScript, and Tailwind CSS. Pick date ranges, attach notes, pin important dates, and personalize each month with your own photos.

---

## Core Features

- 🗓 **Month navigation** with animated transitions and a "Go to Today" shortcut
- 📅 **Date & range selection** with live hover preview
- 📝 **Notes** — per-date and per-range, isolated by month, with a hover tooltip preview
- ⭐ **Pin dates** — mark important dates with a gold star, persisted across sessions
- 🖼️ **Custom hero photo** per month — upload, drag-drop, or reset to default; accent color auto-extracted
- 🌙 **Dark mode** toggle — remembers your preference and respects system setting
- 💾 **Full localStorage persistence** — nothing is lost on refresh

---

## Features

### 📅 Calendar
- Browse months with the prev/next arrows
- **"Go to Today"** button appears when you've navigated away — jumps straight back
- Today's date shows a pulsing ring highlight
- **Saturdays** are tinted indigo, **Sundays** are tinted red
- Month navigation slides in the correct direction

### 🖱️ Date Selection
- Click a date to select it; click a second date to form a range
- Range is previewed live as you hover over dates
- Start/end dates get a filled circle; in-range dates show a subtle connecting track

### 📝 Notes
- Add a note to any single date or a date range via the footer
- Notes are isolated per month — April's notes won't show in May
- Single-date and range notes are stored separately and never collide
- Hover over a date that has a note → a tooltip previews the text
- **All Notes** button opens a drawer with every note for the current month (edit / delete)

### ⭐ Pin Dates
- Select a single date → a **Pin Date** button appears in the footer
- Pinned dates show a gold ⭐ in their cell corner
- Pins persist across page refreshes

### 🖼️ Hero Image
- Each month has a default themed photo
- Click **Upload** (or drag-and-drop) on the photo panel to use your own image
- Click **Reset** to restore the default
- The UI accent color is auto-extracted from whichever image is active

### 🌙 Dark Mode
- Moon/Sun toggle button fixed in the top-right corner
- Remembers your preference; defaults to your system's color scheme on first visit
- All surfaces, text, and borders update automatically

### 💾 Persistence
Everything survives a page refresh — stored in `localStorage`:

| Key | What it stores |
|---|---|
| `calendar_notes_YYYY-MM` | Notes for that month |
| `calendar_pinned_dates` | All pinned date strings |
| `calendar_img_YYYY-MM` | Custom hero photo (base64) |
| `calendar_current_month` | Last viewed month |
| `calendar_dark_mode` | Dark/light preference |

---

## Tech Stack

| What | Library |
|---|---|
| Framework | React 18 + Vite |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS Variables |
| Animations | Framer Motion |
| Date logic | date-fns |
| Icons | Lucide React |
| Color extraction | ColorThief |

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Project Structure

```
tuf_project/
├── .gitignore
├── README.md
├── index.html
├── vite.config.ts
└── src/
    ├── index.css               # CSS variables, dark mode, fonts
    ├── App.tsx                 # Root — dark mode toggle, layout
    ├── components/
    │   ├── Calendar/
    │   │   ├── Calendar.tsx    # Main state container
    │   │   ├── CalendarGrid.tsx # Month grid + navigation
    │   │   ├── DateCell.tsx    # Day cell — selection, pins, tooltip
    │   │   └── HeroSection.tsx # Photo panel + upload + color extraction
    │   └── Notes/
    │       ├── NotesPanel.tsx  # Note editor (modal)
    │       └── AllNotesPanel.tsx # All notes drawer
    └── hooks/
        ├── useCalendarState.ts # Date range selection logic
        ├── useNotes.ts         # Per-month note storage
        ├── useMonthImages.ts   # Photo upload + compression
        ├── usePinnedDates.ts   # Pin/unpin dates
        └── useDarkMode.ts      # Dark mode toggle + persistence
```
