import { Component, Input, Output, EventEmitter, HostListener, ElementRef, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { WorkOrderDocument } from 'src/app/core/models';

@Component({
  selector: 'app-work-order-bar',
  standalone: true,
  imports: [CommonModule, NgbTooltipModule],
  templateUrl: './work-order-bar.component.html',
  styleUrls: ['./work-order-bar.component.scss']
})
export class WorkOrderBarComponent implements OnDestroy {
  // Shared tracker: only one menu open across all instances
  private static currentlyOpenMenu: WorkOrderBarComponent | null = null;

  @Input() order!: WorkOrderDocument;
  @Output() edit = new EventEmitter<WorkOrderDocument>();
  @Output() delete = new EventEmitter<WorkOrderDocument>();
  @Output() menuOpen = new EventEmitter<boolean>();

  private elementRef = inject(ElementRef);
  private scrollListener: (() => void) | null = null;
  isMenuOpen = false;
  dropdownAlignEnd = false;

  /** Dropdown position for position:fixed */
  dropdownTop = 0;
  dropdownLeft = 0;

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

  /** Build tooltip text */
  getTooltipText(): string {
    const name = this.order.data.name;
    const status = this.getStatusLabel(this.order.data.status);
    const start = this.formatDate(this.order.data.startDate);
    const end = this.formatDate(this.order.data.endDate);
    const days = this.getDurationDays();
    return `${name}\nStatus: ${status}\n${start} \u2192 ${end} (${days} day${days !== 1 ? 's' : ''})`;
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      if (this.isMenuOpen) {
        this._closeMenu();
      }
    }
  }
}
