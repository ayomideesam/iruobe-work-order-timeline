import { Injectable, signal, WritableSignal } from '@angular/core';
import { ZoomLevel } from '../models';
import { WorkOrderDocument } from '../models';

@Injectable({ providedIn: 'root' })
export class TimelineStateService {
  private _zoom: WritableSignal<ZoomLevel> = signal<ZoomLevel>('month');
  private _panelOpen = signal<boolean>(false);
  private _selectedOrder = signal<WorkOrderDocument | null>(null);

  readonly zoom = this._zoom;
  readonly panelOpen = this._panelOpen;
  readonly selectedOrder = this._selectedOrder;

  setZoom(z: ZoomLevel) { this._zoom.set(z); }
  openPanel(order?: WorkOrderDocument) { this._selectedOrder.set(order ?? null); this._panelOpen.set(true); }
  closePanel() { this._panelOpen.set(false); this._selectedOrder.set(null); }
}
