import { Injectable } from '@angular/core';
import { addDays, differenceInDays } from 'date-fns';
import { ZoomLevel } from '../models';

@Injectable({ providedIn: 'root' })
export class DateCalculationService {
  // Returns number of columns to render for given visible range (days)
  daysBetween(startIso: string, endIso: string): number {
    const s = new Date(startIso);
    const e = new Date(endIso);
    return Math.max(1, differenceInDays(e, s) + 1);
  }

  // Given zoom level, compute approximate column width (px)
  columnWidthFor(zoom: ZoomLevel) {
    switch (zoom) {
      case 'day': return 80;
      case 'week': return 120;
      default: return 150;
    }
  }

  // Utility: add days to ISO date
  addDays(iso: string, n: number) {
    return addDays(new Date(iso), n).toISOString().slice(0,10);
  }
}
