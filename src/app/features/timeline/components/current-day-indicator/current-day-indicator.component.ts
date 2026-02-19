import { Component, inject, Input, ChangeDetectionStrategy, OnInit, OnChanges, SimpleChanges, signal } from '@angular/core';
import { TimelineZoomService } from 'src/app/core/services';

@Component({
  selector: 'app-current-day-indicator',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="current-day-line" [style.left.px]="leftOffset" aria-hidden="true"></div>
  `,
  styles: [`
    :host {
      position: absolute;
      top: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 0; /* Same level as column-dividers; DOM order (before rows) keeps it behind bars */
    }
    .current-day-line {
      position: absolute;
      top: 0;
      height: 100%;
      width: 2px;
      background: var(--primary);
      box-shadow: 0 0 8px rgba(35, 127, 252, 0.3);
    }
  `]
})
export class CurrentDayIndicatorComponent implements OnChanges {
  @Input() gridStartDate!: Date;
  private zoomService = inject(TimelineZoomService);

  /** Cached offset — recalculated only when gridStartDate or zoom changes */
  cachedLeftOffset = 0;
  /** Track last zoom to detect zoom changes in getter */
  private _lastZoom = '';

  ngOnChanges(_changes: SimpleChanges): void {
    this._lastZoom = this.zoomService.zoomLevel();
    this._recalculate();
  }

  get leftOffset(): number {
    // Read zoom signal for OnPush reactivity; recalculate when zoom changes
    const zoom = this.zoomService.zoomLevel();
    if (zoom !== this._lastZoom) {
      this._lastZoom = zoom;
      this._recalculate();
    }
    return this.cachedLeftOffset;
  }

  private _recalculate(): void {
    if (!this.gridStartDate) {
      this.cachedLeftOffset = 0;
      return;
    }
    const today = new Date();
    this.cachedLeftOffset = this.zoomService.getDateOffset(today, this.gridStartDate, []);
  }
}
