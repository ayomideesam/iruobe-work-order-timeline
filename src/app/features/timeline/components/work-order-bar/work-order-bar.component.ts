import { Component, Input, Output, EventEmitter, ElementRef, inject, OnDestroy, OnInit, ChangeDetectionStrategy, NgZone } from '@angular/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { WorkOrderDocument } from 'src/app/core/models';

@Component({
  selector: 'app-work-order-bar',
  standalone: true,
  imports: [NgbTooltipModule],
  templateUrl: './work-order-bar.component.html',
  styleUrls: ['./work-order-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkOrderBarComponent implements OnInit, OnDestroy {
  // Shared tracker: only one menu open across all instances
  private static currentlyOpenMenu: WorkOrderBarComponent | null = null;
  /** Single shared document click listener — registered once, not per-instance */
  private static sharedClickListener: ((e: MouseEvent) => void) | null = null;
  private static instanceCount = 0;

  @Input() order!: WorkOrderDocument;
  @Output() edit = new EventEmitter<WorkOrderDocument>();
  @Output() delete = new EventEmitter<WorkOrderDocument>();
  @Output() menuOpen = new EventEmitter<boolean>();

  private elementRef = inject(ElementRef);
  private ngZone = inject(NgZone);
  private scrollListener: (() => void) | null = null;
  isMenuOpen = false;
  dropdownAlignEnd = false;

  /** Dropdown position for position:fixed */
  dropdownTop = 0;
  dropdownLeft = 0;

  /** Cached tooltip text — recomputed only when order data changes */
  private _cachedTooltip = '';
  private _tooltipOrderId = '';

  ngOnInit(): void {
    // Register shared document click listener once (first instance only)
    WorkOrderBarComponent.instanceCount++;
    if (!WorkOrderBarComponent.sharedClickListener) {
      WorkOrderBarComponent.sharedClickListener = (event: MouseEvent) => {
        const openMenu = WorkOrderBarComponent.currentlyOpenMenu;
        if (openMenu && !openMenu.elementRef.nativeElement.contains(event.target)) {
          openMenu.ngZone.run(() => openMenu._closeMenu());
        }
      };
      // Register outside NgZone — only enters zone via ngZone.run() when actually closing a menu
      this.ngZone.runOutsideAngular(() => {
        document.addEventListener('click', WorkOrderBarComponent.sharedClickListener!);
      });
    }
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'complete': 'Complete',
      'in-progress': 'In progress',
      'blocked': 'Blocked',
      'open': 'Open'
    };
    return labels[status] || status;
  }

  /** Format ISO date string to readable format (e.g., Feb 17, 2026) */
  formatDate(isoDate: string): string {
    const date = new Date(isoDate + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  /** Calculate duration in days between start and end */
  getDurationDays(): number {
    const start = new Date(this.order.data.startDate + 'T00:00:00');
    const end = new Date(this.order.data.endDate + 'T00:00:00');
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  /** Build tooltip text (cached — only recomputed when order changes) */
  getTooltipText(): string {
    if (this._tooltipOrderId === this.order?.docId && this._cachedTooltip) {
      return this._cachedTooltip;
    }
    const name = this.order.data.name;
    const status = this.getStatusLabel(this.order.data.status);
    const start = this.formatDate(this.order.data.startDate);
    const end = this.formatDate(this.order.data.endDate);
    const days = this.getDurationDays();
    this._cachedTooltip = `${name}\nStatus: ${status}\n${start} \u2192 ${end} (${days} day${days !== 1 ? 's' : ''})`;
    this._tooltipOrderId = this.order.docId;
    return this._cachedTooltip;
  }

  toggleMenu(event: MouseEvent): void {
    event.stopPropagation();

    if (this.isMenuOpen) {
      // Closing this menu
      this._closeMenu();
    } else {
      // Close any previously open menu first
      if (WorkOrderBarComponent.currentlyOpenMenu && WorkOrderBarComponent.currentlyOpenMenu !== this) {
        WorkOrderBarComponent.currentlyOpenMenu._closeMenu();
      }
      this.isMenuOpen = true;
      WorkOrderBarComponent.currentlyOpenMenu = this;
      this.menuOpen.emit(true);
      this._calculateDropdownPosition();
      this._addScrollListener();
    }
  }

  private _closeMenu(): void {
    this.isMenuOpen = false;
    if (WorkOrderBarComponent.currentlyOpenMenu === this) {
      WorkOrderBarComponent.currentlyOpenMenu = null;
    }
    this.menuOpen.emit(false);
    this._removeScrollListener();
  }

  private _addScrollListener(): void {
    // Close dropdown when any scroll happens
    this.scrollListener = () => {
      if (this.isMenuOpen) {
        this._closeMenu();
      }
    };
    // Use capture to catch scroll events on any scrollable parent
    window.addEventListener('scroll', this.scrollListener, true);
  }

  private _removeScrollListener(): void {
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener, true);
      this.scrollListener = null;
    }
  }

  ngOnDestroy(): void {
    this._removeScrollListener();
    // Unregister shared listener when last instance is destroyed
    WorkOrderBarComponent.instanceCount--;
    if (WorkOrderBarComponent.instanceCount === 0 && WorkOrderBarComponent.sharedClickListener) {
      document.removeEventListener('click', WorkOrderBarComponent.sharedClickListener);
      WorkOrderBarComponent.sharedClickListener = null;
    }
    if (WorkOrderBarComponent.currentlyOpenMenu === this) {
      WorkOrderBarComponent.currentlyOpenMenu = null;
    }
  }

  onEdit(): void {
    this._closeMenu();
    this.edit.emit(this.order);
  }

  onDelete(): void {
    this._closeMenu();
    this.delete.emit(this.order);
  }

  /** Calculate dropdown position using getBoundingClientRect for position:fixed */
  private _calculateDropdownPosition(): void {
    const el = this.elementRef.nativeElement as HTMLElement;
    const barRect = el.getBoundingClientRect();
    const dropdownWidth = 200;
    const dropdownHeight = 80;

    // Position dropdown below the three-dot button, aligned to the right of the bar
    this.dropdownTop = barRect.bottom - 3;
    this.dropdownLeft = barRect.right - 36; // Align near the three-dot button

    // Check if dropdown would overflow viewport right edge
    if (this.dropdownLeft + dropdownWidth > window.innerWidth) {
      this.dropdownLeft = barRect.right - dropdownWidth + 10;
      this.dropdownAlignEnd = true;
    } else {
      this.dropdownAlignEnd = false;
    }

    // Check if dropdown would overflow viewport bottom edge
    if (this.dropdownTop + dropdownHeight > window.innerHeight) {
      this.dropdownTop = barRect.top - dropdownHeight + 3;
    }
  }
}
