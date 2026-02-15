import { Injectable, signal } from '@angular/core';

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

@Injectable({ providedIn: 'root' })
export class DateFilterService {
  readonly startDate = signal<Date | null>(null);
  readonly endDate = signal<Date | null>(null);

  setDateRange(start: Date | null, end: Date | null): void {
    this.startDate.set(start);
    this.endDate.set(end);
  }

  isInRange(date: Date | string): boolean {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const start = this.startDate();
    const end = this.endDate();

    if (!start && !end) return true;
    if (start && dateObj < start) return false;
    if (end && dateObj > end) return false;
    return true;
  }

  reset(): void {
    this.startDate.set(null);
    this.endDate.set(null);
  }
}
