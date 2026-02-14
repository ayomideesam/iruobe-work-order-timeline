# Work Order Schedule Timeline

An interactive timeline component for visualizing, creating, and editing work orders across multiple work centers in a manufacturing ERP system.

## Overview

This Angular 19 application provides an intuitive interface for manufacturing planners to:
- Visualize work orders across multiple work centers at different time scales (Day/Week/Month)
- Quickly identify work order status with color-coded indicators
- Create new work orders with automatic date prefill from timeline clicks
- Edit existing work orders with inline validation
- Detect and prevent overlapping work orders on the same work center
- Switch between different zoom levels for flexible planning horizons

## Features

### Core Features
- **Interactive Timeline Grid** - Horizontally scrollable timeline with fixed work center panel
- **Multiple Zoom Levels** - Day, Week, and Month views for different planning granularities
- **Work Order Visualization** - Color-coded status bars with work order details
- **Create/Edit Panel** - Slide-out form panel with full validation
- **Overlap Detection** - Prevents scheduling conflicts on the same work center
- **Status Management** - Open, In Progress, Complete, and Blocked statuses
- **Current Date Indicator** - Visual marker showing today's date on timeline

### Bonus Features (Future)
- [ ] LocalStorage persistence - Work orders survive page refresh
- [ ] Smooth animations - Panel slide-in/out and hover effects
- [ ] Keyboard navigation - Tab through form, Escape to close panel
- [ ] Infinite horizontal scroll - Dynamically load past/future dates
- [ ] "Today" button - Quick navigation to current date
- [ ] Tooltip on hover - Show full work order details

## Technology Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Angular | 19.2.18 | Core framework |
| TypeScript | 5.7.2 | Type-safe development |
| SCSS | - | Styling |
| Bootstrap | 5.3.8 | CSS framework |
| ng-select | 14.9.0 | Dropdown/select components |
| ng-bootstrap | 18.0.0 | ngb-datepicker for date selection |
| date-fns | 4.1.0 | Date manipulation and formatting |
| RxJS | 7.8.0 | Reactive programming |

## Project Structure

```
work-order-timeline/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── models/
│   │   │   │   ├── work-center.model.ts
│   │   │   │   ├── work-order.model.ts
│   │   │   │   ├── timeline-config.model.ts
│   │   │   │   ├── zoom-level.type.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── work-order.service.ts
│   │   │   │   ├── date-calculation.service.ts
│   │   │   │   ├── overlap-detection.service.ts
│   │   │   │   ├── timeline-state.service.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── data/
│   │   │   │   └── sample-data.ts
│   │   │   │
│   │   │   └── constants/
│   │   │       ├── timeline.constants.ts
│   │   │       └── colors.constants.ts
│   │   │
│   │   ├── features/
│   │   │   └── timeline/
│   │   │       ├── components/
│   │   │       │   ├── timeline-container/
│   │   │       │   │   ├── timeline-container.component.ts
│   │   │       │   │   ├── timeline-container.component.html
│   │   │       │   │   ├── timeline-container.component.scss
│   │   │       │   │   └── timeline-container.component.spec.ts
│   │   │       │   │
│   │   │       │   ├── timeline-header/
│   │   │       │   │   ├── timeline-header.component.ts
│   │   │       │   │   ├── timeline-header.component.html
│   │   │       │   │   ├── timeline-header.component.scss
│   │   │       │   │   └── timeline-header.component.spec.ts
│   │   │       │   │
│   │   │       │   ├── timeline-grid/
│   │   │       │   │   ├── timeline-grid.component.ts
│   │   │       │   │   ├── timeline-grid.component.html
│   │   │       │   │   ├── timeline-grid.component.scss
│   │   │       │   │   └── timeline-grid.component.spec.ts
│   │   │       │   │
│   │   │       │   ├── work-center-row/
│   │   │       │   │   ├── work-center-row.component.ts
│   │   │       │   │   ├── work-center-row.component.html
│   │   │       │   │   ├── work-center-row.component.scss
│   │   │       │   │   └── work-center-row.component.spec.ts
│   │   │       │   │
│   │   │       │   ├── work-order-bar/
│   │   │       │   │   ├── work-order-bar.component.ts
│   │   │       │   │   ├── work-order-bar.component.html
│   │   │       │   │   ├── work-order-bar.component.scss
│   │   │       │   │   └── work-order-bar.component.spec.ts
│   │   │       │   │
│   │   │       │   ├── work-order-panel/
│   │   │       │   │   ├── work-order-panel.component.ts
│   │   │       │   │   ├── work-order-panel.component.html
│   │   │       │   │   ├── work-order-panel.component.scss
│   │   │       │   │   └── work-order-panel.component.spec.ts
│   │   │       │   │
│   │   │       │   ├── date-column-header/
│   │   │       │   │   ├── date-column-header.component.ts
│   │   │       │   │   ├── date-column-header.component.html
│   │   │       │   │   ├── date-column-header.component.scss
│   │   │       │   │   └── date-column-header.component.spec.ts
│   │   │       │   │
│   │   │       │   ├── current-day-indicator/
│   │   │       │   │   ├── current-day-indicator.component.ts
│   │   │       │   │   ├── current-day-indicator.component.html
│   │   │       │   │   ├── current-day-indicator.component.scss
│   │   │       │   │   └── current-day-indicator.component.spec.ts
│   │   │       │   │
│   │   │       │   └── three-dot-menu/
│   │   │       │       ├── three-dot-menu.component.ts
│   │   │       │       ├── three-dot-menu.component.html
│   │   │       │       ├── three-dot-menu.component.scss
│   │   │       │       └── three-dot-menu.component.spec.ts
│   │   │       │
│   │   │       └── utils/
│   │   │           ├── date.utils.ts
│   │   │           └── position.utils.ts
│   │   │
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── status-badge/
│   │   │   │   │   ├── status-badge.component.ts
│   │   │   │   │   ├── status-badge.component.html
│   │   │   │   │   ├── status-badge.component.scss
│   │   │   │   │   └── status-badge.component.spec.ts
│   │   │   │   │
│   │   │   │   ├── custom-button/
│   │   │   │   │   ├── custom-button.component.ts
│   │   │   │   │   ├── custom-button.component.html
│   │   │   │   │   ├── custom-button.component.scss
│   │   │   │   │   └── custom-button.component.spec.ts
│   │   │   │   │
│   │   │   │   └── form-field/
│   │   │   │       ├── form-field.component.ts
│   │   │   │       ├── form-field.component.html
│   │   │   │       ├── form-field.component.scss
│   │   │   │       └── form-field.component.spec.ts
│   │   │   │
│   │   │   ├── directives/
│   │   │   │   ├── click-outside.directive.ts
│   │   │   │   ├── horizontal-scroll.directive.ts
│   │   │   │   └── row-hover.directive.ts
│   │   │   │
│   │   │   └── pipes/
│   │   │       ├── date-format.pipe.ts
│   │   │       └── safe-html.pipe.ts
│   │   │
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   └── app.config.ts
│   │
│   ├── assets/
│   │   ├── fonts/
│   │   └── images/
│   │
│   ├── styles/
│   │   ├── _variables.scss
│   │   ├── _mixins.scss
│   │   ├── _typography.scss
│   │   ├── _colors.scss
│   │   ├── _grid.scss
│   │   ├── _forms.scss
│   │   └── styles.scss
│   │
│   ├── index.html
│   └── main.ts
│
├── .gitignore
├── angular.json
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.spec.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 20.x or higher
- npm 10.x or higher
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ayomideesam/iruobe-work-order-timeline.git
   cd iruobe-work-order-timeline
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   > Note: The `.npmrc` file enables `legacy-peer-deps=true` to ensure compatibility between ng-select, ng-bootstrap, and Angular 19.

3. **Verify setup**
   ```bash
   ng version
   ```
   Expected: Angular CLI 19.2.15 with Angular 19.2.18

### Development Server

Run the development server:
```bash
npm start
```

Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### Building

Build for production:
```bash
npm run build
```

Output will be in the `dist/` directory.

## Data Structures

### WorkCenter

Represents a production line, machine, or work area.

```typescript
interface WorkCenterDocument {
  docId: string;
  docType: 'workCenter';
  data: {
    name: string;
  };
}
```

### WorkOrder

Represents a scheduled work task with dates and status.

```typescript
interface WorkOrderDocument {
  docId: string;
  docType: 'workOrder';
  data: {
    name: string;
    workCenterId: string;           // References WorkCenterDocument.docId
    status: 'open' | 'in-progress' | 'complete' | 'blocked';
    startDate: string;              // ISO format: "2025-01-15"
    endDate: string;                // ISO format: "2025-01-22"
  };
}
```

## Sample Data

The application includes hardcoded sample data demonstrating:
- **5+ Work Centers**: Extrusion Line A, CNC Machine 1, Assembly Station, Quality Control, Packaging Line
- **8+ Work Orders**: Distributed across different centers with varying statuses
- **All Status Types**: Open, In Progress, Complete, and Blocked examples
- **Multiple Orders per Center**: Non-overlapping orders on same work center
- **Varied Date Ranges**: Orders spanning different durations

See `src/app/data/sample-data.ts` for the full dataset.

## Usage Guide

### Viewing the Timeline

1. **Select Time Scale**: Use the dropdown in the header to switch between Day, Week, and Month views
2. **Scroll Timeline**: Use horizontal scroll to navigate past/future dates
3. **View Work Orders**: See color-coded bars representing scheduled work orders
4. **Identify Status**: Check the status badge on each work order bar (Open, In Progress, Complete, Blocked)

### Creating a Work Order

1. **Click Empty Area**: Click on any empty space in the timeline grid
2. **Form Opens**: A slide-out panel appears from the right with a pre-filled start date
3. **Fill Details**:
   - Enter work order name
   - Select status (defaults to "Open")
   - Adjust start and end dates using the datepicker
   - End date defaults to start date + 7 days
4. **Validate**: Form validates all required fields and checks for overlaps
5. **Create**: Click "Create" button to save and close panel

### Editing a Work Order

1. **Open Menu**: Click the three-dot menu (⋯) on any work order bar
2. **Select Edit**: Click "Edit" from the dropdown
3. **Modify Details**: Update any field in the form
4. **Validate**: Overlap detection excludes the order being edited
5. **Save**: Click "Save" button to update and close panel

### Deleting a Work Order

1. **Open Menu**: Click the three-dot menu (⋯) on any work order bar
2. **Confirm Delete**: Click "Delete" and confirm the action
3. **Updated Timeline**: The work order is immediately removed from the timeline

### Error Handling

**Overlap Detection Error**: If you try to create or edit a work order that overlaps with an existing order on the same work center, you'll see an error message. Adjust the dates to resolve the conflict.

## Design Reference

The UI is designed to match the Sketch file specifications. Key design elements:
- **Font Family**: Circular Std (imported from Naologic assets)
- **Color Scheme**: 
  - Open: Blue
  - In Progress: Purple/Blue
  - Complete: Green
  - Blocked: Yellow/Orange
- **Spacing**: Follows 8px grid system
- **Responsive**: Acceptable for screens 1024px and larger

Sketch Design File: https://www.sketch.com/s/d56a77de-9753-45a8-af7a-d93a42276667

## Code Architecture

### Standalone Components
All components are built as Angular standalone components for simplified dependency management:

```typescript
@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectComponent, NgbModule],
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent { }
```

### Reactive Forms
Form management uses Angular's Reactive Forms with FormGroup and Validators:

```typescript
createForm = this.fb.group({
  name: ['', [Validators.required]],
  status: ['open', [Validators.required]],
  startDate: ['', [Validators.required]],
  endDate: ['', [Validators.required]]
});
```

### Services
Services handle business logic and data management:
- **WorkOrderService**: CRUD operations on work orders, overlap detection
- **WorkCenterService**: Retrieval and management of work centers

## Testing

### Running Tests

```bash
npm test
```

Tests use Karma and Jasmine. Run with coverage:

```bash
npm test -- --code-coverage
```

### Test Coverage

Current coverage:
- Component logic: Unit tested
- Services: Unit tested with mocked data
- Overlap detection: Edge case coverage

## Build & Deployment

### Production Build

```bash
npm run build
```

Built files are in `dist/iruobe-work-order-timeline/`.

### Deploy Considerations

- Application uses standalone components (no module bootstrapping needed)
- All data is currently in-memory (no backend API calls)
- No authentication required for MVP
- Works on any static hosting (Vercel, Netlify, GitHub Pages, etc.)

## Configuration

### Environment Variables

Create `.env` files for different environments:

```bash
# .env.development
NG_CLI_ANALYTICS=false

# .env.production
NG_CLI_ANALYTICS=false
```

### Build Modes

```bash
# Development server on port 4150 (auto-open browser)
npm start

# Development with HMR (Hot Module Replacement) for faster reload
npm run start:hmr

# Production build
npm run build

# Production build with stats
npm run build:prod

# Production build with stats JSON for bundle analysis
npm run build:stats

# Development with watch mode (rebuild on file changes)
npm run watch

# Testing
npm test

# Angular utilities
npm run ng -- <command>
```

## Troubleshooting

### Common Issues

**Problem**: `npm install` fails with peer dependency errors
- **Solution**: `.npmrc` is configured with `legacy-peer-deps=true`. If issues persist, ensure Node 20.x is installed.

**Problem**: ng-bootstrap datepicker not showing
- **Solution**: Ensure `NgbModule` is imported. Check browser console for errors.

**Problem**: Styles not loading correctly
- **Solution**: Boot CSS must be imported. Check `styles.scss` includes Bootstrap import.

**Problem**: Date calculations appear off
- **Solution**: Verify `date-fns` is properly installed and imported in service files.

## Performance Optimization

### Implemented
- OnPush change detection strategy (where applicable)
- TrackBy functions in *ngFor loops
- Lazy loading of route modules (if routing added)

### Future Optimizations
- Virtual scrolling for large date ranges (infinite scroll)
- Memoization of date calculations
- Web Worker for heavy computations
- Service Worker for offline support

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

Does **not** support IE 11.

## Contributing

### Commit Message Format

Follow conventional commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: `Feat`, `Fix`, `Docs`, `Style`, `Refactor`, `Test`, `Chore`

**Examples**:
```
Feat(timeline): Add Day/Week/Month zoom levels
Fix(overlap): Correct overlap detection logic
Docs(readme): Update installation instructions
```

### Branch Naming

- Feature: `feature/timeline-zoom`
- Fix: `fix/overlap-detection`
- Docs: `docs/update-readme`

## License

MIT License - See LICENSE file for details

## Contact

For questions or support, contact the Naologic team.

---

## Submission Checklist

- [ ] Working Angular 19+ application
- [ ] All core features implemented
- [ ] Pixel-perfect design matching Sketch file
- [ ] Sample data with 5+ work centers and 8+ work orders
- [ ] All 4 status types demonstrated
- [ ] README documentation complete
- [ ] Code comments on complex logic
- [ ] Clean git history with meaningful commits
- [ ] Public GitHub repository
- [ ] Loom demo video (5-10 minutes)

## Bonus Features Implemented

- [ ] LocalStorage persistence
- [ ] Smooth animations and transitions
- [ ] Keyboard navigation
- [ ] Infinite horizontal scroll
- [ ] "Today" button
- [ ] Tooltip on hover
- [ ] Unit test suite
- [ ] E2E test suite
- [ ] Accessibility (ARIA labels, focus management)
- [ ] Performance optimizations (OnPush, trackBy, virtual scroll)

---

**Last Updated**: February 2026
**Version**: 1.0.0-alpha
**Status**: In Development
