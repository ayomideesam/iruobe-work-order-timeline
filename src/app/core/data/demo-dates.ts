import { WorkOrderDocument } from '../models';

/**
 * The demo orders were written around this date: it sits in the busiest stretch of the
 * schedule (12 orders within three weeks either side, across 8 of the 9 work centres).
 *
 * At load time every demo date moves by the same whole number of weeks, so this anchor
 * lands in the current week. The demo stays populated around today, and each order keeps
 * both its length and its weekday.
 */
export const DEMO_ANCHOR_DATE = '2026-04-05';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** YYYY-MM-DD → milliseconds at UTC midnight. Counting on the UTC calendar keeps DST out of the day math. */
function isoToUtcMs(iso: string): number {
  const [year, month, day] = iso.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

function addDays(iso: string, days: number): string {
  return new Date(isoToUtcMs(iso) + days * MS_PER_DAY).toISOString().slice(0, 10);
}

/** A date as YYYY-MM-DD on the user's own calendar (not UTC). */
export function toLocalIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Returns a copy of the orders, every date moved by the whole number of weeks
 * that brings DEMO_ANCHOR_DATE closest to `today`. The input is not modified.
 */
export function shiftDemoOrders(
  orders: readonly WorkOrderDocument[],
  today: Date = new Date()
): WorkOrderDocument[] {
  const daysToToday = (isoToUtcMs(toLocalIsoDate(today)) - isoToUtcMs(DEMO_ANCHOR_DATE)) / MS_PER_DAY;
  const shiftDays = Math.round(daysToToday / 7) * 7;

  return orders.map(order => ({
    ...order,
    data: {
      ...order.data,
      startDate: addDays(order.data.startDate, shiftDays),
      endDate: addDays(order.data.endDate, shiftDays),
    },
  }));
}
