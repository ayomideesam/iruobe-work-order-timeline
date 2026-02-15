import { Injectable } from '@angular/core';
import { WorkOrderDocument } from '../models';

@Injectable({ providedIn: 'root' })
export class OverlapDetectionService {
  static overlapsBetween(a: WorkOrderDocument, b: WorkOrderDocument): boolean {
    if (a.data.workCenterId !== b.data.workCenterId) return false;
    const aS = new Date(a.data.startDate).getTime();
    const aE = new Date(a.data.endDate).getTime();
    const bS = new Date(b.data.startDate).getTime();
    const bE = new Date(b.data.endDate).getTime();
    return Math.max(aS, bS) <= Math.min(aE, bE);
  }
}
