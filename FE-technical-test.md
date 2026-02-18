# Work Order Schedule Timeline - Frontend Technical Test

## Overview

You are tasked with building a Work Order Schedule Timeline component for a manufacturing ERP system. This interactive timeline allows users to visualize, create, and edit work orders across multiple work centers.

**AI Tools:** Feel free to use AI assistants to help with styling, date calculations, debugging, or component architecture. If you use AI for key decisions, save those prompts in a markdown file. We'd love to see your problem-solving process!

---

## At a Glance

**What you're building:** An interactive timeline component that displays work orders across work centers with create/edit functionality.

**Must implement:**
- Timeline grid with Day/Week/Month zoom levels
- Work order bars with status indicators
- Create/Edit slide-out panel with form validation
- Overlap detection (show error if work orders overlap on same work center)

**Required deliverables:**
1. Working Angular 17+ application
2. Pixel-perfect implementation matching designs
3. Sample data (work centers + work orders)
4. Loom demo (5-10 min)
5. GitHub repo with README

**Bonus (optional):**
- localStorage persistence
- Automated test suite
- Smooth animations/transitions
- Keyboard navigation
- Additional polish features

---

## Design Reference

**Sketch File:** https://www.sketch.com/s/d56a77de-9753-45a8-af7a-d93a42276667

**Font Family:** Circular Std

```html
<link rel="stylesheet" href="https://naologic-com-assets.naologic.com/fonts/circular-std/circular-std.css">
```

```scss
font-family: "Circular-Std";
```

You have access to the Sketch file for precise measurements, colors, and spacing. We expect pixel-perfect implementation of the provided designs.

---

## The Problem

Manufacturing facilities need to visualize work orders across multiple work centers (production lines, machines, etc.). Planners need to:

- See all scheduled work orders at a glance
- Quickly identify order status (Open, In Progress, Complete, Blocked)
- Create new work orders by clicking on the timeline
- Edit existing work orders
- Switch between day/week/month views for different planning horizons

Your job is to create this **Timeline Component** that provides an intuitive interface for work order management.

---

## Core Requirements

### 1. Timeline Grid

**Structure:**
```
┌─────────────────────────────────────────────────────────────────┐
│ Work Orders                                                     │
│ Timescale: [Day ▼]                                              │
├──────────────────┬──────────────────────────────────────────────┤
│ Work Center      │  Timeline Grid (horizontally scrollable)     │
├──────────────────┼──────────────────────────────────────────────┤
│ Extrusion Line A │ ████ Order Name [Complete] ████              │
│ CNC Machine 1    │      [click to add]                          │
│ Assembly Station │ ███ Order A [In Progress] ██ Order B ███     │
│ Quality Control  │ ████████ Order Name [Blocked] ███████████    │
│ Packaging Line   │                                              │
└──────────────────┴──────────────────────────────────────────────┘
                                        ↑ current day indicator
```

**Zoom Levels (Timescale dropdown):**
- **Day** (default): Shows individual days in header
- **Week**: Shows weeks in header
- **Month**: Shows months in header

All zoom levels show the same data, just at different scales. The timeline header updates to reflect the current zoom level.

**Visual Elements:**
- Left panel: Work Center names (fixed, does not scroll horizontally)
- Right panel: Timeline grid (horizontally scrollable)
- Current day indicator: Vertical line showing today's date
- Row hover state: Highlighted background (see designs)
- Initial visible range: Center on today's date with reasonable buffer (e.g., ±2 weeks for Day view)

### 2. Work Order Bars

Each work order displays as a horizontal bar on the timeline:

**Bar Contents:**
- Work order name (text label)
- Status badge (pill/tag style)
- Actions menu (three-dot button that opens dropdown with Edit/Delete options)

**Status Colors:**

| Status | Color | Description |
|--------|-------|-------------|
| Open | Blue | Default status on creation |
| In Progress | Blue/Purple | Work has started |
| Complete | Green | Work finished |
| Blocked | Yellow/Orange | Work is blocked |

**Positioning:**
- Bar start position = work order start date
- Bar end position = work order end date
- Multiple work orders can exist on the same row (work center)
- Work orders on the same row **cannot overlap**. Show an error if user tries to create/edit an overlapping order.

### 3. Create Panel

Triggered by clicking on empty timeline area.

**Panel Behavior:**
- Slides in from the right
- Fixed width (see designs)
- Clicking outside closes the panel
- Cancel button closes without saving

**Form Fields (use Reactive Forms with FormGroup):**

| Field | Type | Notes |
|-------|------|-------|
| Work Order Name | Text input | Required |
| Status | ng-select dropdown | Default: "Open" |
| Start Date | ngb-datepicker | Pre-filled from click position |
| End Date | ngb-datepicker | Pre-filled: Start Date + 7 days |

**On Create:**
- Validate no overlap with existing orders on same work center
- If overlap detected, show error and don't create
- If valid, add to work orders and close panel

### 4. Edit Panel

Triggered by clicking Edit from the three-dot menu on a work order bar.

**Same panel as Create, but:**
- Header: "Work Order Details" (same as create)
- Fields pre-populated with existing data
- Button text: "Save" instead of "Create"
- Same overlap validation (excluding the order being edited)

### 5. Interactions Summary

| Action | Result |
|--------|--------|
| Click empty timeline area | Open Create panel, pre-fill start date from click position |
| Click three-dot menu on bar | Open dropdown with Edit/Delete options |
| Click Edit from dropdown | Open Edit panel with order data |
| Click Delete from dropdown | Delete the work order |
| Click outside panel | Close panel |
| Click Cancel | Close panel |
| Click Create/Save | Validate, save, and close panel |
| Change Timescale dropdown | Update timeline zoom level |
| Horizontal scroll | Scroll timeline (left panel stays fixed) |
| Hover on row | Highlight row background |

---

## Data Structures

All documents follow this structure:
```typescript
{
  docId: string;        // Unique identifier
  docType: string;      // Document type
  data: {
    // Document-specific fields
  }
}
```

### Work Center

Work centers represent production lines, machines, or work areas where work orders are scheduled.

```typescript
interface WorkCenterDocument {
  docId: string;
  docType: 'workCenter';
  data: {
    name: string;
  };
}
```

Create **at least 5 work centers** with realistic manufacturing names (e.g., Extrusion Line A, CNC Machine 1, Assembly Station, Quality Control, Packaging Line).

### Work Order

```typescript
interface WorkOrderDocument {
  docId: string;
  docType: 'workOrder';
  data: {
    name: string;
    workCenterId: string;           // References WorkCenterDocument.docId
    status: WorkOrderStatus;
    startDate: string;              // ISO format (e.g., "2025-01-15")
    endDate: string;                // ISO format
  };
}

type WorkOrderStatus = 'open' | 'in-progress' | 'complete' | 'blocked';
```

### Sample Data Requirements

Create hardcoded sample data that demonstrates:
- At least 5 work centers
- At least 8 work orders across different centers
- All 4 status types represented
- At least one work center with multiple (non-overlapping) orders
- Orders spanning different date ranges

---

## Technical Requirements

### Stack (Mandatory)
- **Angular 17+** (standalone components preferred)
- **TypeScript** (strict mode)
- **SCSS** for all styling
- **Reactive Forms** (FormGroup, FormControl, Validators)
- **ng-select** for dropdown/select components
- **@ng-bootstrap/ng-bootstrap** (ngb-datepicker) for date picking

### Key Implementation Notes

**Timeline Positioning:**
- Calculate bar positions based on dates relative to visible timeline range
- Handle zoom level changes (recalculate column widths)
- Ensure smooth horizontal scrolling
- Left panel must stay fixed while timeline scrolls

**Form Validation:**
- All fields required
- End date must be after start date
- No overlap with existing orders on same work center

**Responsiveness:**
- Should not break badly on smaller screens
- Acceptable to require horizontal scroll on mobile

---

## What You Need to Deliver

### 1. Working Application (Required)

Angular 17+ application implementing:
- Timeline grid with all zoom levels (Day/Week/Month)
- Work order bars with correct positioning and status colors
- Create/Edit slide-out panel with form validation
- Three-dot actions menu with Edit/Delete options
- Overlap detection with error feedback
- All interactions from requirements

### 2. Pixel-Perfect Design (Required)

Match the provided Sketch designs as closely as possible:
- Colors, spacing, typography (Circular Std font)
- Status badge styles
- Panel layout and form styling
- Hover states
- Current day indicator

### 3. Sample Data (Required)

Hardcoded data following the document structure:
- 5+ work centers
- 8+ work orders
- All 4 status types
- Multiple orders on same work center (non-overlapping)

### 4. Documentation (Required)

**README.md** with:
- How to run the application (`ng serve`)
- Any setup steps required
- Brief description of your approach
- Libraries used and why

**Code comments** explaining:
- Complex date calculations
- Key decisions

### 5. Demo Video (Required)

**5-10 minute Loom video** showing:
- Application running with sample data
- All zoom levels (Day/Week/Month switching)
- Creating a new work order (click empty area, fill form, save)
- Editing an existing work order (via three-dot menu)
- Deleting a work order (via three-dot menu)
- Overlap error scenario
- Brief walkthrough of your code structure

### 6. Public Repository (Required)

**GitHub/GitLab repo** with:
- Working code (runnable with `ng serve`)
- Sample data
- README
- Clean commit history

---

## Bonus Points (Optional)

If you finish early or want to showcase advanced skills:

### Features
- **localStorage persistence**: Work orders survive page refresh
- **Smooth animations**: Panel slide-in/out, bar hover effects
- **Keyboard navigation**: Tab through form, Escape to close panel
- **Infinite scroll**: Dynamically load more date columns as user scrolls left/right (prepend past dates, append future dates)
- **"Today" button**: Quickly jump the viewport to center on today's date
- **Tooltip on bar hover**: Show work order details (name, status, full date range) in a tooltip

### Testing
- **Unit tests**: Component tests with Jest or Karma
- **E2E tests**: Cypress or Playwright scenarios

### Polish
- **Custom datepicker styling**: Match design system
- **Accessibility**: ARIA labels, focus management
- **Performance**: OnPush change detection, trackBy functions

### Documentation
- **AI prompts**: Save prompts used in markdown files
- **Trade-offs**: Document decisions you made and why
- **`@upgrade` comments**: Tag future improvements in code

---

## Evaluation Criteria

### Design Implementation (40%)
- **Pixel-perfect accuracy (25%)**: Matches Sketch designs
  - Colors, spacing, typography correct
  - Status badges styled correctly
  - Panel layout matches design
- **Responsive behavior (10%)**: Doesn't break on smaller screens
- **Visual polish (5%)**: Hover states, transitions, attention to detail

### Functionality (40%)
- **Core features working (25%)**:
  - Timeline renders correctly at all zoom levels
  - Work order bars positioned accurately
  - Create/Edit panel works correctly
  - Form validation works
- **Interactions (10%)**:
  - Click to create pre-fills date
  - Three-dot menu opens with Edit/Delete
  - Panel close behaviors work
- **Edge cases (5%)**:
  - Overlap detection works
  - Form validation prevents invalid data

### Code Quality (20%)
- **Angular best practices (8%)**:
  - Standalone components (preferred)
  - Reactive Forms properly used
  - Services for data management
  - Proper TypeScript typing throughout
- **Clean code (7%)**:
  - Logical component breakdown
  - Separation of concerns
  - SCSS organization
- **Communication (5%)**:
  - Clear Loom demo
  - Helpful code comments
  - Good README

### Bonus Points (Extra Credit)
- localStorage persistence
- Automated tests
- Animations and polish
- Infinite horizontal scroll
- "Today" button navigation
- Tooltip on bar hover
- Accessibility features
- AI prompt documentation
- Clean git history with meaningful commits

---

## Hints & Tips

**Start simple, add complexity gradually:**
1. Get static timeline rendering first (hardcoded columns)
2. Add work order bars (hardcoded positions)
3. Implement zoom level switching
4. Add click-to-create flow
5. Add edit flow
6. Add validation and overlap detection
7. Polish and responsive fixes

**Date positioning is the trickiest part:**
- Calculate the visible date range based on zoom level
- Convert dates to pixel positions relative to container width
- Remember to handle scroll offset

**Use the Sketch file:**
- Inspect for exact colors, spacing, font sizes
- Export assets if needed
- Don't guess, measure!

**Form state management:**
- Single panel component for both create and edit
- Use a mode flag: `'create' | 'edit'`
- Reset form when opening in create mode
- Populate form when opening in edit mode

**Infinite scroll (bonus) approach:**
- Detect when scroll position approaches left/right edge
- Prepend or append additional date columns
- When prepending, adjust scroll position to maintain view
- Consider virtual scrolling for performance with large ranges

---

## Common Questions

**Q: What Angular version should I use?**
A: Angular 17 or newer. Standalone components are preferred but not required.

**Q: Can I use other UI libraries besides ng-select and ng-bootstrap?**
A: You can add libraries, but you must use ng-select for dropdowns and ngb-datepicker for dates. You must still match the provided designs.

**Q: Should data persist across page refreshes?**
A: Not required, but it's a bonus feature. Hardcoded data is fine for the base requirement.

**Q: What if work orders overlap when editing?**
A: Show an error and don't save. The user must adjust dates to resolve the conflict.

**Q: What if I have ideas for further enhancements and upgrades?**
A: Submit what you have with `@upgrade` comments explaining what's incomplete. A working core is better than incomplete extras.

**Q: What date range should show when the app first loads?**
A: Center the timeline on today's date. Show a reasonable range based on zoom level (e.g., ±2 weeks for Day view, ±2 months for Week view, ±6 months for Month view).

---

## Submission

Provide:
1. **Public GitHub/GitLab repository** with:
  - Working Angular application
  - Sample data demonstrating features
  - README with setup instructions
  - Clean commit history
2. **Loom video** (max 10 minutes) demonstrating your solution
3. **(Bonus)** Automated test suite
4. **(Bonus)** Markdown files with AI prompts you used

---

**Good luck! We're excited to see your solution.** 🚀

**Naologic Team**
