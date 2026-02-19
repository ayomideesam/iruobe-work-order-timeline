import { Component, OnDestroy, inject, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineHeaderComponent } from '../timeline-header/timeline-header.component';
import { TimelineGridComponent, PanelOpenEvent } from '../timeline-grid/timeline-grid.component';
import { WorkOrderPanelComponent } from '../work-order-panel/work-order-panel.component';
import { DeviceWarningComponent } from '../device-warning/device-warning.component';
import { WorkOrderDocument } from 'src/app/core/models';
import { DeviceDetectionService, InactivityService, TimelineZoomService } from 'src/app/core/services';

@Component({
  selector: 'app-timeline-container',
  standalone: true,
  imports: [CommonModule, TimelineHeaderComponent, TimelineGridComponent, WorkOrderPanelComponent, DeviceWarningComponent],
  templateUrl: './timeline-container.component.html',
  styleUrls: ['./timeline-container.component.scss']
})
export class TimelineContainerComponent implements OnDestroy {
  private readonly inactivity = inject(InactivityService);
  private readonly zoomService = inject(TimelineZoomService);
  protected readonly deviceDetection = inject(DeviceDetectionService);

  @ViewChild('timelineGrid') timelineGrid!: TimelineGridComponent;

  isPanelOpen = signal(false);
  panelMode = signal<'create' | 'edit'>('create');
  selectedOrder = signal<WorkOrderDocument | null>(null);
  createWorkCenterId = signal<string | null>(null);
  createStartDate = signal<Date | null>(null);

  /** The work center ID the panel is currently acting on (create or edit) */
  activeWorkCenterId = computed(() => {
    if (!this.isPanelOpen()) return null;
    const order = this.selectedOrder();
    if (order) return order.data.workCenterId;
    return this.createWorkCenterId();
  });

  constructor() {
    this.inactivity.start();
  }

  ngOnDestroy(): void {
    this.inactivity.stop();
    this.zoomService.setZoom('month'); // Reset zoom so header and grid stay in sync on re-entry
  }

  onOpenPanel(event: PanelOpenEvent): void {
    this.panelMode.set(event.mode);
    if (event.mode === 'edit' && event.order) {
      this.selectedOrder.set(event.order);
    } else {
      this.selectedOrder.set(null);
      this.createWorkCenterId.set(event.workCenterId || null);
      this.createStartDate.set(event.startDate || null);
    }
    this.isPanelOpen.set(true);
  }

  onClosePanel(): void {
    this.isPanelOpen.set(false);
    this.selectedOrder.set(null);
    this.createWorkCenterId.set(null);
    this.createStartDate.set(null);
  }

  onScrollToToday(): void {
    this.timelineGrid?.scrollToToday();
  }
}
