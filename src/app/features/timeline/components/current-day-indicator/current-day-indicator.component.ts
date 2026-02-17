import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineZoomService } from 'src/app/core/services';

@Component({
  selector: 'app-current-day-indicator',
  standalone: true,
  imports: [CommonModule],
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
export class CurrentDayIndicatorComponent {
  @Input() gridStartDate!: Date;
  private zoomService = inject(TimelineZoomService);

  get leftOffset(): number {
    if (!this.gridStartDate) return 0;
    const today = new Date();
    return this.zoomService.getDateOffset(today, this.gridStartDate, []);
  }
}
