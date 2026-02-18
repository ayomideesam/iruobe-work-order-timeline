# Work Order Schedule Timeline

**Frontend Technical Test — by Iruobe Akhigbe Iruobe**

An interactive timeline component for visualizing, creating, and editing work orders across multiple work centers in a manufacturing ERP system, built with Angular 19.

---

## Overview

This Angular 19 application provides an intuitive interface for manufacturing planners to:
- Visualize **45 work orders** across **9 work centers** at Day, Week, and Month timescales
- Quickly identify work order status with color-coded bars and badges
- Create new work orders by clicking any empty timeline cell (date auto-prefilled from click position)
- Edit existing work orders via the three-dot dropdown menu
- Detect and prevent overlapping work orders on the same work center
- Navigate instantly to today's date with the **Today** button
- Persist all changes across page refreshes via **localStorage**

---

## Features

### Core Features (Required)
- **Interactive Timeline Grid** — Horizontally scrollable grid with a fixed work center panel on the left
- **Day / Week / Month Zoom** — Timescale dropdown switches column granularity; grid and header update in sync
- **Work Order Bars** — Color-coded status bars with name label, status badge, and three-dot action menu (Edit / Delete)
- **Create Panel** — Slide-out panel triggered by clicking an empty timeline area; start date pre-filled from click position, end date defaults to start + 7 days
- **Edit Panel** — Same panel with existing data pre-populated; Save updates the work order in place
- **Overlap Detection** — Error shown if a new or edited work order would overlap an existing one on the same work center
- **Status Management** — Open (blue), In Progress (purple), Complete (green), Blocked (orange)
- **Current Date Indicator** — Blue vertical line marking today across the full grid height

### Bonus Features (Implemented ✅)
- ✅ **localStorage Persistence** — All work orders survive page refresh; changes persist between sessions
- ✅ **Smooth Animations** — Panel slides in/out, status badges and bars have CSS transitions
- ✅ **Keyboard Navigation** — Arrow keys navigate between work order bars; Enter opens the edit panel; Escape closes any open panel or dropdown
- ✅ **Today Button** — Scrolls the timeline horizontally to center on today's date
- ✅ **Tooltips on Hover** — Full work order name, start/end dates, and status shown via ngb-tooltip on bar hover
- ✅ **Toast Notifications** — Auto-dismissing success/error toast system for create, update, and delete actions
- ✅ **Landing Page** — Splash screen with "Proceed to Dashboard" CTA before entering the timeline
- ✅ **Inactivity Detection** — Auto-saves state and warns user after period of inactivity
- ✅ **Zoom State Reset on Navigation** — Timescale automatically resets to Month when leaving and returning to the dashboard, keeping grid and header in sync

## Technology Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Angular | 19.2.18 | Core framework with standalone components & signals |
| TypeScript | 5.7.2 | Strict-mode type safety |
| SCSS | — | Component & global styles with CSS custom properties |
| Bootstrap | 5.3.8 | CSS utility foundation |
| ng-select | 14.9.0 | Status and zoom level dropdowns |
| ng-bootstrap | 18.0.0 | Datepicker (ngb-datepicker) and tooltips (ngb-tooltip) |
| date-fns | 4.1.0 | Date arithmetic and formatting |
| RxJS | 7.8.0 | Reactive streams (toast notifications, inactivity) |

---

## Project Structure

```
src/app/
├── core/
│   ├── constants/           # Timeline & color constants
│   ├── data/                # demo-100-workorders.json, sample-data.ts
│   ├── directives/          # UnsubscribeDirective base class
│   ├── models/              # WorkOrder, WorkCenter, ZoomLevel, TimelineConfig
│   └── services/
│       ├── work-order.service.ts        # CRUD + localStorage persistence
│       ├── work-center.service.ts       # 9 manufacturing centers
│       ├── timeline-zoom.service.ts     # Zoom level signal + column generation
│       ├── date-filter.service.ts       # Date range filtering
│       ├── date-calculation.service.ts  # Pixel positioning math
│       ├── overlap-detection.service.ts # Conflict detection
│       ├── timeline-state.service.ts    # Shared signal state
│       ├── toast.service.ts             # Notification stream
│       └── inactivity.service.ts        # Idle detection
│
├── features/timeline/components/
│   ├── timeline-container/     # Parent orchestrator (panel state, signal coordination)
│   ├── timeline-header/        # Zoom dropdown, Today button, date filter
│   ├── timeline-grid/          # Core grid (column generation, bar positioning, keyboard nav)
│   ├── timeline-header/        # Zoom controls + Today button
│   ├── work-order-bar/         # Bar visualization with fixed-position dropdown
│   ├── work-order-panel/       # Create/Edit slide-out form panel
│   ├── work-center-row/        # Row layout per work center
│   ├── current-day-indicator/  # Blue vertical today line
│   ├── date-column-header/     # Column header labels
│   ├── work-center-selector/   # Filter work centers
│   └── three-dot-menu/         # Edit / Delete actions dropdown
│
├── shared/
│   ├── components/status-badge/   # Reusable status pill
│   └── components/toast/          # Auto-dismiss toast notification
│
├── public-landing.component.ts    # Splash / landing page
├── app.component.ts
└── app.config.ts
```

---

## Getting Started

### Prerequisites
- Node.js 20.x or higher
- npm 10.x or higher

### Installation

```bash
git clone https://github.com/ayomideesam/iruobe-work-order-timeline.git
cd iruobe-work-order-timeline
npm install
```

> The `.npmrc` file sets `legacy-peer-deps=true` for ng-select / ng-bootstrap / Angular 19 compatibility.

### Development Server

```bash
npm start
```

Navigate to `http://localhost:4200/`. Hot-reload is enabled.

### Production Build

```bash
npm run build
```

Output: `dist/iruobe-work-order-timeline/`

---

## Sample Data

The application ships with **45 work orders** spread across **9 work centers** spanning Jan 2024 – Dec 2026. All orders are non-overlapping within their work center.

### Work Centers

| ID | Name |
|----|------|
| wc-1 | Genesis Hardware |
| wc-2 | Rodriques Electrics |
| wc-3 | Dangote Industries |
| wc-4 | McMarrow Distribution |
| wc-5 | Spartan Manufacturing |
| wc-6 | BUA Group |
| wc-7 | Sany Heavy Industry |
| wc-8 | Siemens Gamesa |
| wc-9 | Konsulting Inc |

### Work Order Stats

| Status | Count |
|--------|-------|
| Open | 15 |
| In Progress | 16 |
| Complete | 8 |
| Blocked | 6 |
| **Total** | **45** |

Data files: `src/app/core/data/demo-100-workorders.json` and `src/app/core/data/sample-data.ts`

---

## Data Structures

```typescript
interface WorkCenterDocument {
  docId: string;           // e.g. "wc-1"
  docType: 'workCenter';
  data: { name: string };
}

interface WorkOrderDocument {
  docId: string;           // e.g. "wo-001"
  docType: 'workOrder';
  data: {
    name: string;
    workCenterId: string;
    status: 'open' | 'in-progress' | 'complete' | 'blocked';
    startDate: string;     // ISO: "2026-02-01"
    endDate: string;       // ISO: "2026-03-15"
  };
}
```

---

## Usage Guide

### Viewing the Timeline
- Use the **Timescale** dropdown to switch between **Day**, **Week**, and **Month** views
- Scroll horizontally to navigate past and future dates
- Click **Today** to instantly scroll back to the current date

### Creating a Work Order
1. Click any empty cell on the timeline grid
2. The slide-out panel opens with the start date pre-filled from the clicked position
3. Fill in the name and status; adjust dates if needed (end date defaults to start + 7 days)
4. Click **Create** — overlap validation runs before saving

### Editing a Work Order
1. Click the **⋯** three-dot menu on any work order bar
2. Select **Edit**
3. Modify fields and click **Save**

### Deleting a Work Order
1. Click the **⋯** three-dot menu on any work order bar
2. Select **Delete** — the order is immediately removed and a toast confirms the action

### Keyboard Navigation
| Key | Action |
|-----|--------|
| `←` / `→` | Navigate between work order bars |
| `↑` / `↓` | Move between work centers |
| `Enter` | Open edit panel for focused bar |
| `Escape` | Close panel or dropdown |

---

## Design Reference

- **Sketch File**: https://www.sketch.com/s/d56a77de-9753-45a8-af7a-d93a42276667
- **Font**: Circular Std

```html
<link rel="stylesheet" href="https://naologic-com-assets.naologic.com/fonts/circular-std/circular-std.css">
```

### Status Colors

| Status | Color |
|--------|-------|
| Open | Blue |
| In Progress | Purple |
| Complete | Green |
| Blocked | Orange |

---

## Architecture Notes

- **Standalone components** throughout — no NgModules
- **OnPush change detection** on `TimelineGridComponent` for performance
- **Angular Signals** for reactive state (`zoomLevel`, `orders`, `isPanelOpen`, etc.)
- **`providedIn: 'root'` services** — singletons reset on `TimelineContainerComponent` destroy to prevent state leakage between navigations
- **localStorage persistence** via `WorkOrderService` — all CRUD operations serialize to `localStorage` automatically
- **Custom `NgbDateParserFormatter`** for MM.DD.YYYY date format in the panel form

---

## Build Scripts

```bash
npm start          # Dev server on :4200
npm run build      # Production build
npm test           # Karma + Jasmine unit tests
npm run watch      # Dev build with watch mode
```

---

## Submission Checklist

- ✅ Working Angular 19+ application
- ✅ All core features implemented (Timeline grid, zoom levels, bars, create/edit panel, overlap detection)
- ✅ 9 work centers and 45 work orders in sample data
- ✅ All 4 status types demonstrated
- ✅ localStorage persistence
- ✅ Smooth animations and transitions
- ✅ Keyboard navigation
- ✅ Today button
- ✅ Tooltips on hover
- ✅ Toast notifications
- ✅ Landing page
- ✅ Clean git history with 12 logical commits (Feb 15–18, 2026)
- ✅ README documentation complete
- [ ] Loom demo video (5–10 min) — pending

