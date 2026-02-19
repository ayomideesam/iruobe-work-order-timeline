import { Injectable, signal, WritableSignal } from '@angular/core';
import { WorkOrderDocument } from '../models';
import DEMO_WORK_ORDERS from '../data/demo-100-workorders.json';

const STORAGE_KEY = 'naologic_work_orders';
const STORAGE_HASH_KEY = 'naologic_work_orders_hash';

/**
 * Generate a simple hash from demo data to auto-detect changes.
 * Whenever demo-100-workorders.json is modified, this hash changes
 * and cached localStorage data is automatically invalidated.
 * Uses lightweight fields only — no JSON.stringify of full dataset.
 */
function computeDemoDataHash(): string {
  const demoData = DEMO_WORK_ORDERS as WorkOrderDocument[];
  const count = demoData.length;
  const firstId = demoData[0]?.docId || '';
  const lastId = demoData[count - 1]?.docId || '';
  // Use first + last order dates as part of the fingerprint (avoids stringifying full array)
  const firstDate = demoData[0]?.data?.startDate || '';
  const lastDate = demoData[count - 1]?.data?.endDate || '';
  return `v4-${count}-${firstId}-${lastId}-${firstDate}-${lastDate}`;
}

@Injectable({ providedIn: 'root' })
export class WorkOrderService {
  private _orders: WritableSignal<WorkOrderDocument[]> = signal<WorkOrderDocument[]>(this._loadFromStorage());

  // expose a readonly signal for components to read directly
  readonly orders = this._orders;

  getAll(): WorkOrderDocument[] {
    return this._orders();
  }

  create(order: WorkOrderDocument) {
    this._orders.update(current => [...current, order]);
    this._saveToStorage();
  }

  update(updated: WorkOrderDocument) {
    this._orders.update(current => current.map(o => (o.docId === updated.docId ? updated : o)));
    this._saveToStorage();
  }

  delete(docId: string) {
    this._orders.update(current => current.filter(o => o.docId !== docId));
    this._saveToStorage();
  }

  overlaps(candidate: WorkOrderDocument, ignoreDocId?: string): boolean {
    const candidateStart = new Date(candidate.data.startDate).getTime();
    const candidateEnd = new Date(candidate.data.endDate).getTime();

    return this._orders().some(o => {
      if (o.docId === ignoreDocId) return false;
      if (o.data.workCenterId !== candidate.data.workCenterId) return false;
      const s = new Date(o.data.startDate).getTime();
      const e = new Date(o.data.endDate).getTime();
      return Math.max(s, candidateStart) <= Math.min(e, candidateEnd);
    });
  }

  /** Load from localStorage, fall back to demo data if nothing stored */
  private _loadFromStorage(): WorkOrderDocument[] {
    const currentHash = computeDemoDataHash();
    try {
      const storedHash = localStorage.getItem(STORAGE_HASH_KEY);
      // If hash mismatch (demo data changed), clear old data and use fresh demo data
      if (storedHash !== currentHash) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(STORAGE_HASH_KEY, currentHash);
        return [...(DEMO_WORK_ORDERS as WorkOrderDocument[])];
      }
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as WorkOrderDocument[];
      }
    } catch {
      // Corrupted data — fall back to demo
    }
    localStorage.setItem(STORAGE_HASH_KEY, currentHash);
    return [...(DEMO_WORK_ORDERS as WorkOrderDocument[])];
  }

  /** Persist current state to localStorage */
  private _saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._orders()));
    } catch {
      // Storage full or unavailable — silent fail
    }
  }
}
