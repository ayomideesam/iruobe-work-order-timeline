import { Injectable, signal } from '@angular/core';

export type ZoomLevel = 'hour' | 'day' | 'week' | 'month';

interface DateColumn {
  date: Date;
  label: string;
  width: number; // pixels
}

@Injectable({ providedIn: 'root' })
export class TimelineZoomService {
  private _zoomLevel = signal<ZoomLevel>('month');
  readonly zoomLevel = this._zoomLevel.asReadonly();

  setZoom(level: ZoomLevel): void {
    this._zoomLevel.set(level);
  }

  /**
   * Generate date columns based on zoom level and range
   */
  getDateColumns(startDate: Date, endDate: Date): DateColumn[] {
    const zoom = this._zoomLevel();
    const columns: DateColumn[] = [];

    if (zoom === 'hour') {
      return this._generateHourColumns(startDate, endDate);
    } else if (zoom === 'day') {
      return this._generateDayColumns(startDate, endDate);
    } else if (zoom === 'week') {
      return this._generateWeekColumns(startDate, endDate);
    } else {
      return this._generateMonthColumns(startDate, endDate);
    }
  }

  /** Hour view: each column is 1 hour (width: 40px) */
  private _generateHourColumns(startDate: Date, endDate: Date): DateColumn[] {
    const columns: DateColumn[] = [];
    let current = new Date(startDate);
    current.setMinutes(0, 0, 0);

    while (current <= endDate) {
      const date = new Date(current);
      columns.push({
        date,
        label: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        width: 40
      });
      current.setHours(current.getHours() + 1);
    }

    return columns;
  }

  /** Day view: each column is 1 day (width:80px) */
  private _generateDayColumns(startDate: Date, endDate: Date): DateColumn[] {
    const columns: DateColumn[] = [];
    let current = new Date(startDate);

    while (current <= endDate) {
      const date = new Date(current);
      columns.push({
        date,
        label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        width: 80
      });
      current.setDate(current.getDate() + 1);
    }

    return columns;
  }

  /** Week view: each column is 1 week (width: 175px) */
  private _generateWeekColumns(startDate: Date, endDate: Date): DateColumn[] {
    const columns: DateColumn[] = [];
    let current = new Date(startDate);
    current.setDate(current.getDate() - current.getDay()); // Start of week (Sunday)

    while (current <= endDate) {
      const date = new Date(current);
      const weekEnd = new Date(current);
      weekEnd.setDate(weekEnd.getDate() + 6);

      columns.push({
        date,
        label: `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        width: 175
      });

      current.setDate(current.getDate() + 7);
    }

    return columns;
  }

  /** Month view: each column is 1 month (width: 180px) */
  private _generateMonthColumns(startDate: Date, endDate: Date): DateColumn[] {
    const columns: DateColumn[] = [];
    let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

    while (current <= endDate) {
      const date = new Date(current);
      columns.push({
        date,
        label: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        width: 180
      });

      current.setMonth(current.getMonth() + 1);
    }

    return columns;
  }

  /**
   * Calculate the position (left offset in pixels) of a date within a zoom level
   * Useful for positioning work order bars
   */
  getDateOffset(targetDate: Date, startDate: Date, columns: DateColumn[]): number {
    const zoom = this._zoomLevel();
    const targetTime = targetDate.getTime();
    const startTime = startDate.getTime();

    if (zoom === 'hour') {
      const hoursOffset = Math.floor((targetTime - startTime) / (1000 * 60 * 60));
      return hoursOffset * 40;
    } else if (zoom === 'day') {
      // 140px per day — matches grid column width
      const daysOffset = (targetTime - startTime) / (1000 * 60 * 60 * 24);
      return daysOffset * 140;
    } else if (zoom === 'week') {
      // 175px per week — fractional so the indicator lands on the exact day
      const daysOffset = (targetTime - startTime) / (1000 * 60 * 60 * 24);
      return (daysOffset / 7) * 175;
    } else {
      // Month view — 180px per month with fractional day positioning
      const monthsDiff = (targetDate.getFullYear() - startDate.getFullYear()) * 12 +
        (targetDate.getMonth() - startDate.getMonth());
      const dayOfMonth = targetDate.getDate() - 1; // 0-based
      const daysInMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate();
      return (monthsDiff + dayOfMonth / daysInMonth) * 180;
    }
  }

  /**
   * Calculate the width of a date range within a zoom level
   */
  getDateRangeWidth(startDate: Date, endDate: Date): number {
    const zoom = this._zoomLevel();
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    if (zoom === 'hour') {
      const hoursDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
      return Math.max(40, hoursDiff * 40);
    } else if (zoom === 'day') {
      return Math.max(60, daysDiff * 60); // Min 60px
    } else if (zoom === 'week') {
      const weeksDiff = Math.ceil(daysDiff / 7);
      return Math.max(140, weeksDiff * 140);
    } else {
      // Month view
      const monthsDiff = Math.ceil(daysDiff / 30);
      return Math.max(180, monthsDiff * 180);
    }
  }
}
