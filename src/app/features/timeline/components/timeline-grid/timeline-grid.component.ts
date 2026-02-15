import { Component, inject, effect, signal, Input, ViewChild, ElementRef, Output, EventEmitter, ChangeDetectionStrategy, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkOrderService, WorkCenterService, TimelineZoomService } from 'src/app/core/services';
import { WorkOrderBarComponent } from '../work-order-bar/work-order-bar.component';
import { CurrentDayIndicatorComponent } from '../current-day-indicator/current-day-indicator.component';
import { WorkOrderDocument } from 'src/app/core/models';

interface DateColumn {
  date: Date;
  label: string;
  width: number;
}

// Panel mode for create/edit
export type PanelMode = 'create' | 'edit' | null;

// Event payload for opening panel
export interface PanelOpenEvent {
  mode: 'create' | 'edit';
  workCenterId?: string;
  startDate?: Date;
  order?: WorkOrderDocument;
}

@Component({
  selector: 'app-timeline-grid',
  standalone: true,
  imports: [CommonModule, WorkOrderBarComponent, CurrentDayIndicatorComponent],
  templateUrl: './timeline-grid.component.html',
  styleUrls: ['./timeline-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineGridComponent implements AfterViewInit {
  private woService = inject(WorkOrderService);
  private centerService = inject(WorkCenterService);
  private zoomService = inject(TimelineZoomService);

  orders = this.woService.orders;
  centers = this.centerService.centers;
  zoomLevel = this.zoomService.zoomLevel;

  // Fixed calendar range: January 2024 - December 2026
  readonly CALENDAR_START = new Date(2024, 0, 1);  // Jan 1, 2024
  readonly CALENDAR_END = new Date(2026, 11, 31);  // Dec 31, 2026
  private hasScrolledToToday = false;

  @ViewChild('rightPanel') rightPanelEl!: ElementRef<HTMLElement>;
  @Input() activeWorkCenterId: string | null = null;
  @Output() openPanel = new EventEmitter<PanelOpenEvent>();

  dateColumns: DateColumn[] = [];
  gridStartDate: Date = new Date();
  gridEndDate: Date = new Date();
  totalGridWidth: number = 0;
  selectedDateColumn = signal<DateColumn | null>(null);
  headerScrollLeft = signal<number>(0);
  private previousZoom: string = 'month';
  hoverRowId = signal<string | null>(null);
  hoverX = signal<number>(0);
  hoverIsFirstRow = signal<boolean>(false);
  hoveredCenterId = signal<string | null>(null);

  // Cached arrays to avoid re-creating on every change detection cycle
  cachedWorkCenters: { id: string; name: string }[] = [];
  cachedOrdersByCenter: Map<string, WorkOrderDocument[]> = new Map();

  // Keyboard navigation state
  focusedOrderId = signal<string | null>(null);
  private allOrdersFlat: WorkOrderDocument[] = [];

  /** Keyboard navigation handler */
  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Skip if user is typing in an input
    if (this._isInputFocused()) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this._navigateOrders(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this._navigateOrders(-1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this._navigateColumns(1);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this._navigateColumns(-1);
        break;
      case 'Enter':
        this._openFocusedOrder();
        break;
      case 'Escape':
        this._clearFocus();
        break;
      case 't':
      case 'T':
        // Quick shortcut: T for Today
        if (!event.ctrlKey && !event.metaKey) {
          this.scrollToToday();
        }
        break;
    }
  }

  private _isInputFocused(): boolean {
    const tag = document.activeElement?.tagName.toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select';
  }

  private _navigateOrders(direction: number): void {
    this._buildFlatOrderList();
    if (this.allOrdersFlat.length === 0) return;

    const currentId = this.focusedOrderId();
    let currentIndex = currentId
      ? this.allOrdersFlat.findIndex(o => o.docId === currentId)
      : -1;

    let newIndex = currentIndex + direction;
    if (newIndex < 0) newIndex = this.allOrdersFlat.length - 1;
    if (newIndex >= this.allOrdersFlat.length) newIndex = 0;

    const newOrder = this.allOrdersFlat[newIndex];
    this.focusedOrderId.set(newOrder.docId);
    this._scrollToOrder(newOrder);
  }

  private _navigateColumns(direction: number): void {
    if (this.dateColumns.length === 0) return;

    const current = this.selectedDateColumn();
    let currentIndex = current
      ? this.dateColumns.findIndex(c => c.date.getTime() === current.date.getTime())
      : -1;

    let newIndex = currentIndex + direction;
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= this.dateColumns.length) newIndex = this.dateColumns.length - 1;

    this.onDateColumnClick(this.dateColumns[newIndex]);
  }

  private _openFocusedOrder(): void {
    const orderId = this.focusedOrderId();
    if (!orderId) return;

    this._buildFlatOrderList();
    const order = this.allOrdersFlat.find(o => o.docId === orderId);
    if (order) {
      this.onEditOrder(order);
    }
  }

  private _clearFocus(): void {
    this.focusedOrderId.set(null);
    this.selectedDateColumn.set(null);
  }

  private _buildFlatOrderList(): void {
    this.allOrdersFlat = [];
    for (const center of this.cachedWorkCenters) {
      const orders = this.cachedOrdersByCenter.get(center.id) || [];
      this.allOrdersFlat.push(...orders);
    }
  }

  private _scrollToOrder(order: WorkOrderDocument): void {
    if (!this.rightPanelEl?.nativeElement) return;

    const leftPos = this.getOrderLeftPosition(order);
    const viewportWidth = this.rightPanelEl.nativeElement.clientWidth;
    const scrollLeft = this.rightPanelEl.nativeElement.scrollLeft;

    // Scroll if order is outside visible area
    if (leftPos < scrollLeft || leftPos > scrollLeft + viewportWidth - 100) {
      this.rightPanelEl.nativeElement.scrollLeft = Math.max(0, leftPos - 100);
    }
  }

  /** Check if an order is currently focused (for styling) */
  isOrderFocused(order: WorkOrderDocument): boolean {
    return this.focusedOrderId() === order.docId;
  }

  /** Handle grid focus - auto-select first order for keyboard navigation */
  onGridFocus(): void {
    // Only auto-select if no order is currently focused
    if (!this.focusedOrderId()) {
      this._buildFlatOrderList();
      if (this.allOrdersFlat.length > 0) {
        this.focusedOrderId.set(this.allOrdersFlat[0].docId);
      }
    }
  }

  /** Handle grid click - ensure grid is focusable for keyboard nav on all platforms */
  onGridClick(event: MouseEvent): void {
    // Don't steal focus from interactive elements
    const target = event.target as HTMLElement;
    if (target.tagName.toLowerCase() === 'button') return;
  }

  constructor() {
    effect(() => {
      // Track zoom level changes
      const currentZoom = this.zoomLevel();
      
      // If zoom level changed, clear selection, hide badge, and re-scroll to today
      if (currentZoom !== this.previousZoom) {
        this.selectedDateColumn.set(null);
        this.hasScrolledToToday = false; // Reset to trigger scroll on zoom change
        this.previousZoom = currentZoom;
      }
      
      this.orders();
      this._recalculateGrid();
      this._cacheWorkCenters();
      this._cacheOrdersByCenter();

      // Scroll to today after grid is ready (or after zoom change)
      if (!this.hasScrolledToToday && this.dateColumns.length > 0) {
        // Use setTimeout to ensure DOM is updated before scrolling
        setTimeout(() => this._scrollToToday(), 50);
      }
    });
  }

  ngAfterViewInit(): void {
    // Ensure scroll to today on initial load
    setTimeout(() => {
      if (!this.hasScrolledToToday && this.dateColumns.length > 0) {
        this._scrollToToday();
      }
    }, 100);
  }

  /** Public method: Scroll the grid to center on today's date */
  scrollToToday(): void {
    this._scrollToToday();
  }

  /** Scroll the grid to center on today's date */
  private _scrollToToday(): void {
    if (!this.rightPanelEl?.nativeElement) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find the column containing today (or closest to today)
    let targetColumnIndex = this.dateColumns.findIndex(col => {
      const colDate = new Date(col.date);
      colDate.setHours(0, 0, 0, 0);
      const zoom = this.zoomLevel();

      if (zoom === 'day') {
        return colDate.getTime() === today.getTime();
      } else if (zoom === 'week') {
        const weekEnd = new Date(colDate);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return today >= colDate && today <= weekEnd;
      } else {
        return colDate.getFullYear() === today.getFullYear() && 
               colDate.getMonth() === today.getMonth();
      }
    });

    // If not found (today outside range), scroll to end
    if (targetColumnIndex === -1) {
      targetColumnIndex = this.dateColumns.length - 1;
    }

    // Calculate scroll position to center the target column
    let scrollLeft = 0;
    for (let i = 0; i < targetColumnIndex; i++) {
      scrollLeft += this.dateColumns[i].width;
    }

    // Center the column in viewport
    const viewportWidth = this.rightPanelEl.nativeElement.clientWidth;
    const columnWidth = this.dateColumns[targetColumnIndex]?.width || 180;
    scrollLeft = Math.max(0, scrollLeft - (viewportWidth / 2) + (columnWidth / 2));

    this.rightPanelEl.nativeElement.scrollLeft = scrollLeft;
    this.hasScrolledToToday = true;
  }

  private _recalculateGrid(): void {
    // Use fixed calendar range: January 2024 - December 2026
    const startMonth = new Date(this.CALENDAR_START);
    const endMonth = new Date(this.CALENDAR_END);

    this.dateColumns = this._generateColumns(startMonth, endMonth);
    this.totalGridWidth = this.dateColumns.reduce((sum, col) => sum + col.width, 0);

    // Set grid boundaries from actual column positions (columns may start
    // earlier than startMonth for week zoom due to Sunday alignment)
    if (this.dateColumns.length > 0) {
      this.gridStartDate = new Date(this.dateColumns[0].date);
      const lastCol = this.dateColumns[this.dateColumns.length - 1];
      const zoom = this.zoomLevel();
      if (zoom === 'day') {
        this.gridEndDate = new Date(lastCol.date);
        this.gridEndDate.setDate(this.gridEndDate.getDate() + 1);
      } else if (zoom === 'week') {
        this.gridEndDate = new Date(lastCol.date);
        this.gridEndDate.setDate(this.gridEndDate.getDate() + 7);
      } else {
        this.gridEndDate = new Date(lastCol.date);
        this.gridEndDate.setMonth(this.gridEndDate.getMonth() + 1);
      }
    } else {
      this.gridStartDate = startMonth;
      this.gridEndDate = endMonth;
    }
  }

  private _generateColumns(startDate: Date, endDate: Date): DateColumn[] {
    const zoom = this.zoomLevel();
    const columns: DateColumn[] = [];

    if (zoom === 'day') {
      let current = new Date(startDate);
      while (current <= endDate) {
        const date = new Date(current);
        columns.push({
          date,
          label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
          width: 140
        });
        current.setDate(current.getDate() + 1);
      }
    } else if (zoom === 'week') {
      let current = new Date(startDate);
      current.setDate(current.getDate() - current.getDay());
      while (current <= endDate) {
        const date = new Date(current);
        columns.push({
          date,
          label: `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
          width: 175
        });
        current.setDate(current.getDate() + 7);
      }
    } else {
      let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      while (current <= endDate) {
        const date = new Date(current);
        columns.push({
          date,
          label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          width: 180
        });
        current.setMonth(current.getMonth() + 1);
      }
    }

    return columns;
  }

  /** Get work centers (returns cached array — stable reference) */
  getWorkCenters(): { id: string; name: string }[] {
    return this.cachedWorkCenters;
  }

  /** Build and cache work centers list */
  private _cacheWorkCenters(): void {
    const centerMap = new Map<string, string>();
    this.centers().forEach(c => {
      centerMap.set(c.docId, c.data.name);
    });
    this.orders().forEach(o => {
      if (!centerMap.has(o.data.workCenterId)) {
        centerMap.set(o.data.workCenterId, `Center ${o.data.workCenterId}`);
      }
    });
    this.cachedWorkCenters = Array.from(centerMap.entries()).map(([id, name]) => ({ id, name }));
  }

  /** Build and cache orders grouped by center */
  private _cacheOrdersByCenter(): void {
    this.cachedOrdersByCenter.clear();
    const selectedColumn = this.selectedDateColumn();

    for (const center of this.cachedWorkCenters) {
      let filtered: WorkOrderDocument[];

      if (selectedColumn !== null) {
        const columnStart = selectedColumn.date;
        const columnEnd = new Date(columnStart);
        if (this.zoomLevel() === 'day') {
          columnEnd.setDate(columnEnd.getDate() + 1);
        } else if (this.zoomLevel() === 'week') {
          columnEnd.setDate(columnEnd.getDate() + 7);
        } else {
          columnEnd.setMonth(columnEnd.getMonth() + 1);
        }
        filtered = this.orders().filter(o => {
          const orderStart = new Date(o.data.startDate);
          const orderEnd = new Date(o.data.endDate);
          return o.data.workCenterId === center.id &&
            orderStart < columnEnd &&
            orderEnd >= columnStart;
        });
      } else {
        filtered = this.orders().filter(o => {
          const orderStart = new Date(o.data.startDate);
          const orderEnd = new Date(o.data.endDate);
          return o.data.workCenterId === center.id &&
            orderStart < this.gridEndDate &&
            orderEnd >= this.gridStartDate;
        });
      }

      this.cachedOrdersByCenter.set(center.id, filtered);
    }
  }

  /** Calculate left offset for a work order within a column */
  getOrderLeftOffset(order: WorkOrderDocument, dateColumn: DateColumn): string {
    const orderStart = new Date(order.data.startDate);
    const columnStart = dateColumn.date;

    if (orderStart >= columnStart) {
      // Order starts in this column
      return '0px';
    } else {
      // Order started before this column
      return '0px';
    }
  }

  /** Calculate width of work order within its columns */
  getOrderWidth(order: WorkOrderDocument): string {
    const startDate = new Date(order.data.startDate);
    const endDate = new Date(order.data.endDate);
    const zoom = this.zoomLevel();

    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    let width: number;

    if (zoom === 'day') {
      width = Math.max(105, daysDiff * 105);
    } else if (zoom === 'week') {
      const weeksDiff = Math.ceil(daysDiff / 7);
      width = Math.max(140, weeksDiff * 140);
    } else {
      const monthsDiff = Math.ceil(daysDiff / 30);
      width = Math.max(180, monthsDiff * 180);
    }

    return `${width}px`;
  }

  /** Get all orders for a work center (returns cached array — stable reference) */
  getOrdersForCenter(centerId: string): WorkOrderDocument[] {
    return this.cachedOrdersByCenter.get(centerId) || [];
  }

  /** Calculate left pixel position for a work order relative to the grid start */
  getOrderLeftPosition(order: WorkOrderDocument): number {
    const orderStart = new Date(order.data.startDate);
    const zoom = this.zoomLevel();

    if (zoom === 'month') {
      // Find which column the order starts in and calculate offset within that column
      const orderStartMonth = new Date(orderStart.getFullYear(), orderStart.getMonth(), 1);
      let leftPx = 0;

      for (const col of this.dateColumns) {
        if (col.date.getTime() === orderStartMonth.getTime()) {
          // Order starts in this column — calculate fractional offset within the month
          const daysInMonth = new Date(orderStart.getFullYear(), orderStart.getMonth() + 1, 0).getDate();
          const dayOfMonth = orderStart.getDate() - 1; // 0-based
          const fractionIntoMonth = dayOfMonth / daysInMonth;
          leftPx += fractionIntoMonth * col.width;
          break;
        } else if (col.date < orderStartMonth) {
          leftPx += col.width;
        } else {
          break;
        }
      }

      // Clamp to 0 if order starts before grid
      return Math.max(0, leftPx);
    } else if (zoom === 'week') {
      // Calculate based on days from grid start
      const gridStartTime = this.gridStartDate.getTime();
      const orderStartTime = Math.max(orderStart.getTime(), gridStartTime);
      const daysDiff = (orderStartTime - gridStartTime) / (1000 * 60 * 60 * 24);
      return (daysDiff / 7) * 175;
    } else {
      // Day zoom
      const gridStartTime = this.gridStartDate.getTime();
      const orderStartTime = Math.max(orderStart.getTime(), gridStartTime);
      const daysDiff = (orderStartTime - gridStartTime) / (1000 * 60 * 60 * 24);
      return daysDiff * 140;
    }
  }

  /** Calculate width in pixels for a work order bar */
  getOrderWidthPx(order: WorkOrderDocument): number {
    const orderStart = new Date(order.data.startDate);
    const orderEnd = new Date(order.data.endDate);
    const zoom = this.zoomLevel();

    let rawWidth = 0;

    if (zoom === 'month') {
      // Calculate pixel width by mapping the order's date range onto the column grid
      const clampedStart = orderStart < this.gridStartDate ? this.gridStartDate : orderStart;
      const clampedEnd = orderEnd > this.gridEndDate ? this.gridEndDate : orderEnd;

      let startPx = this.getOrderLeftPosition(order);
      
      // Calculate end position similarly
      const endMonth = new Date(clampedEnd.getFullYear(), clampedEnd.getMonth(), 1);
      let endPx = 0;

      for (const col of this.dateColumns) {
        if (col.date.getTime() === endMonth.getTime()) {
          const daysInMonth = new Date(clampedEnd.getFullYear(), clampedEnd.getMonth() + 1, 0).getDate();
          const dayOfMonth = clampedEnd.getDate(); // inclusive end date
          const fractionIntoMonth = dayOfMonth / daysInMonth;
          endPx += fractionIntoMonth * col.width;
          break;
        } else if (col.date < endMonth) {
          endPx += col.width;
        } else {
          break;
        }
      }

      const width = endPx - startPx;
      rawWidth = Math.max(180, width);
    } else if (zoom === 'week') {
      // Coordinate-based: compute end position then width = endPx - leftPx
      const leftPx = this.getOrderLeftPosition(order);
      const endDateExclusive = new Date(orderEnd);
      endDateExclusive.setDate(endDateExclusive.getDate() + 1); // inclusive end
      const gridStartTime = this.gridStartDate.getTime();
      const endTime = Math.min(endDateExclusive.getTime(), this.gridEndDate.getTime());
      const endDays = (endTime - gridStartTime) / (1000 * 60 * 60 * 24);
      const endPx = (endDays / 7) * 175;
      rawWidth = Math.max(20, endPx - leftPx);
    } else {
      // Day zoom — coordinate-based
      const leftPx = this.getOrderLeftPosition(order);
      const endDateExclusive = new Date(orderEnd);
      endDateExclusive.setDate(endDateExclusive.getDate() + 1); // inclusive end
      const gridStartTime = this.gridStartDate.getTime();
      const endTime = Math.min(endDateExclusive.getTime(), this.gridEndDate.getTime());
      const endDays = (endTime - gridStartTime) / (1000 * 60 * 60 * 24);
      const endPx = endDays * 140;
      rawWidth = Math.max(20, endPx - leftPx);
    }

    // Clamp: bar must not extend beyond the grid boundary
    const left = this.getOrderLeftPosition(order);
    if (left + rawWidth > this.totalGridWidth) {
      rawWidth = Math.max(0, this.totalGridWidth - left);
    }
    return rawWidth;
  }

  /** Handle date column click for selection/deselection */
  onDateColumnClick(column: DateColumn): void {
    const current = this.selectedDateColumn();
    const isCurrentlySelected = current !== null && current.date.getTime() === column.date.getTime();
    this.selectedDateColumn.set(isCurrentlySelected ? null : column);
    // Recache orders since selection affects filtering
    this._cacheOrdersByCenter();
  }

  /** Check if a column is selected */
  isColumnSelected(column: DateColumn): boolean {
    const selected = this.selectedDateColumn();
    return selected !== null && selected.date.getTime() === column.date.getTime();
  }

  /** Get the index of the currently selected column (-1 if none) */
  get selectedColumnIndex(): number {
    const selected = this.selectedDateColumn();
    if (!selected) return -1;
    return this.dateColumns.findIndex(c => c.date.getTime() === selected.date.getTime());
  }

  /** Get the current label for selected column */
  getCurrentLabel(): string {
    const zoom = this.zoomLevel();
    if (zoom === 'day') {
      return 'Current day';
    } else if (zoom === 'week') {
      return 'Current week';
    } else {
      return 'Current month';
    }
  }

  /** Get work orders for a specific center and column, filtered by selection */
  getOrdersForCenterAndDate(centerId: string, dateColumn: DateColumn): WorkOrderDocument[] {
    const selectedColumn = this.selectedDateColumn();

    // If a column is selected, only show orders from that column
    if (selectedColumn !== null) {
      const columnToCheck = selectedColumn;
      const columnStart = columnToCheck.date;
      const columnEnd = new Date(columnStart);

      // Extend column end based on zoom
      if (this.zoomLevel() === 'day') {
        columnEnd.setDate(columnEnd.getDate() + 1);
      } else if (this.zoomLevel() === 'week') {
        columnEnd.setDate(columnEnd.getDate() + 7);
      } else {
        columnEnd.setMonth(columnEnd.getMonth() + 1);
      }

      return this.orders().filter(o => {
        const orderStart = new Date(o.data.startDate);
        const orderEnd = new Date(o.data.endDate);

        // Work order overlaps with the selected date column
        return o.data.workCenterId === centerId &&
          orderStart < columnEnd &&
          orderEnd >= columnStart;
      });
    }

    // No selection - show all orders for this column
    const columnStart = dateColumn.date;
    const columnEnd = new Date(columnStart);

    // Extend column end based on zoom
    if (this.zoomLevel() === 'day') {
      columnEnd.setDate(columnEnd.getDate() + 1);
    } else if (this.zoomLevel() === 'week') {
      columnEnd.setDate(columnEnd.getDate() + 7);
    } else {
      columnEnd.setMonth(columnEnd.getMonth() + 1);
    }

    return this.orders().filter(o => {
      const orderStart = new Date(o.data.startDate);
      const orderEnd = new Date(o.data.endDate);

      // Work order overlaps with this date column
      return o.data.workCenterId === centerId &&
        orderStart < columnEnd &&
        orderEnd >= columnStart;
    });
  }

  /** Track horizontal scroll of the right panel */
  onHeaderScroll(event: Event): void {
    const el = event.target as HTMLElement;
    this.headerScrollLeft.set(el.scrollLeft);
  }

  /** Handle mouse move over timeline cells for ghost hover */
  onCellMouseMove(event: MouseEvent, centerId: string, isFirstRow: boolean): void {
    const container = event.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();
    this.hoverX.set(event.clientX - rect.left);
    this.hoverRowId.set(centerId);
    this.hoverIsFirstRow.set(isFirstRow);
  }

  /** Handle mouse leave from timeline cells */
  onCellMouseLeave(): void {
    this.hoverRowId.set(null);
  }

  /** Calculate the center position of the selected column (CSS translateX(-50%) handles centering) */
  getSelectedColumnPosition(): number {
    const selected = this.selectedDateColumn();
    if (!selected) return 0;

    // Find the index of the selected column
    const columnIndex = this.dateColumns.findIndex(
      col => col.date.getTime() === selected.date.getTime()
    );

    if (columnIndex === -1) return 0;

    // Try to read from the actual DOM for pixel-perfect centering
    const panelEl = this.rightPanelEl?.nativeElement;
    if (panelEl) {
      const columnElements = panelEl.querySelectorAll('.date-column-header');
      const selectedEl = columnElements[columnIndex] as HTMLElement;
      if (selectedEl) {
        // Return column center — CSS transform: translateX(-50%) handles badge centering
        return selectedEl.offsetLeft + (selectedEl.offsetWidth / 2);
      }
    }

    // Fallback: calculate from column data
    const leftOffset = this.dateColumns
      .slice(0, columnIndex)
      .reduce((sum, col) => sum + col.width, 0);

    return leftOffset + (this.dateColumns[columnIndex].width / 2);
  }

  /** Handle edit event from work-order-bar */
  onEditOrder(order: WorkOrderDocument): void {
    this.openPanel.emit({
      mode: 'edit',
      order
    });
  }

  /** Handle delete event from work-order-bar */
  onDeleteOrder(order: WorkOrderDocument): void {
    this.woService.delete(order.docId);
  }

  /** Handle click on empty timeline area to create new work order */
  onTimelineClick(event: MouseEvent, centerId: string): void {
    // Don't open panel if clicking on an existing work order bar
    const target = event.target as HTMLElement;
    if (target.closest('app-work-order-bar')) {
      return;
    }

    const container = event.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();
    const clickX = event.clientX - rect.left;

    // Calculate the date based on click position
    const startDate = this.getDateFromPosition(clickX);

    this.openPanel.emit({
      mode: 'create',
      workCenterId: centerId,
      startDate
    });
  }

  /** Calculate date from pixel position in the timeline */
  private getDateFromPosition(xPos: number): Date {
    const zoom = this.zoomLevel();
    let accumulatedWidth = 0;

    for (const col of this.dateColumns) {
      if (accumulatedWidth + col.width > xPos) {
        // Click is within this column
        const fractionIntoColumn = (xPos - accumulatedWidth) / col.width;
        const columnDate = new Date(col.date);

        if (zoom === 'day') {
          // For day zoom, just return the column date
          return columnDate;
        } else if (zoom === 'week') {
          // Add fractional days within the week
          const daysIntoWeek = Math.floor(fractionIntoColumn * 7);
          columnDate.setDate(columnDate.getDate() + daysIntoWeek);
          return columnDate;
        } else {
          // Month zoom - add fractional days within the month
          const daysInMonth = new Date(columnDate.getFullYear(), columnDate.getMonth() + 1, 0).getDate();
          const daysIntoMonth = Math.floor(fractionIntoColumn * daysInMonth);
          columnDate.setDate(columnDate.getDate() + daysIntoMonth);
          return columnDate;
        }
      }
      accumulatedWidth += col.width;
    }

    // Default to last column date
    return this.dateColumns.length > 0 ? new Date(this.dateColumns[this.dateColumns.length - 1].date) : new Date();
  }

  // ── trackBy functions to preserve DOM identity ──
  trackByCenter(_index: number, center: { id: string; name: string }): string {
    return center.id;
  }

  trackByOrder(_index: number, order: WorkOrderDocument): string {
    return order.docId;
  }

  trackByColumn(_index: number, col: DateColumn): number {
    return col.date.getTime();
  }
}
