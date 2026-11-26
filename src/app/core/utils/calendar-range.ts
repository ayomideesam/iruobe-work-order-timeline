import { WorkOrderDocument } from '../models';

/** Months of calendar kept on each side of today, so there is always room to plan. */
export const MONTHS_AROUND_TODAY = 12;

export interface CalendarRange {
  /** Local midnight on the 1st of the first month shown. */
  start: Date;
  /** Local midnight on the last day of the last month shown. */
  end: Date;
}

/**
 * The timeline's date range: at least MONTHS_AROUND_TODAY either side of today,
 * widened to the first and last months that hold an order.
 *
 * Built from today, so the Today line is always on the grid. Built from the orders,
 * so no order is ever cut off, however far ahead someone schedules it.
 */
export function calendarRange(
  orders: readonly WorkOrderDocument[],
  today: Date = new Date()
): CalendarRange {
  let start = new Date(today.getFullYear(), today.getMonth() - MONTHS_AROUND_TODAY, 1);
  // Day 0 of the following month is the last day of this one
  let end = new Date(today.getFullYear(), today.getMonth() + MONTHS_AROUND_TODAY + 1, 0);

  for (const order of orders) {
    const orderStart = parseLocalIsoDate(order.data.startDate);
    const orderEnd = parseLocalIsoDate(order.data.endDate);
    // An unparseable date is NaN, and every comparison with NaN is false, so it is skipped
    if (orderStart < start) start = new Date(orderStart.getFullYear(), orderStart.getMonth(), 1);
    if (orderEnd > end) end = new Date(orderEnd.getFullYear(), orderEnd.getMonth() + 1, 0);
  }

  return { start, end };
}

/** YYYY-MM-DD → local midnight on that date. */
function parseLocalIsoDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}
