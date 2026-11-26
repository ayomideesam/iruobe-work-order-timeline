import DEMO_WORK_ORDERS from './demo-100-workorders.json';
import { WORK_CENTERS } from './sample-data';
import { DEMO_ANCHOR_DATE, shiftDemoOrders, toLocalIsoDate } from './demo-dates';
import { WorkOrderDocument } from '../models';

const DEMO = DEMO_WORK_ORDERS as WorkOrderDocument[];
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function utcMs(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}
function daysFrom(fromIso: string, toIso: string): number {
  return Math.round((utcMs(toIso) - utcMs(fromIso)) / MS_PER_DAY);
}
function weekday(iso: string): number {
  return new Date(utcMs(iso)).getUTCDay();
}

describe('demo work order data', () => {
  // The sample-data rules from the brief, plus the rules the app enforces on every save

  it('has at least 5 work centres and 8 work orders', () => {
    expect(WORK_CENTERS.length).toBeGreaterThanOrEqual(5);
    expect(DEMO.length).toBeGreaterThanOrEqual(8);
  });

  it('uses all four statuses', () => {
    const statuses = new Set(DEMO.map(o => o.data.status));
    expect([...statuses].sort()).toEqual(['blocked', 'complete', 'in-progress', 'open']);
  });

  it('has at least one work centre with more than one order', () => {
    const perCentre = new Map<string, number>();
    for (const o of DEMO) perCentre.set(o.data.workCenterId, (perCentre.get(o.data.workCenterId) ?? 0) + 1);
    expect(Math.max(...perCentre.values())).toBeGreaterThan(1);
  });

  it('only references work centres that exist', () => {
    const ids = new Set(WORK_CENTERS.map(c => c.docId));
    const unknown = DEMO.filter(o => !ids.has(o.data.workCenterId)).map(o => o.docId);
    expect(unknown).toEqual([]);
  });

  it('never ends an order before it starts', () => {
    // The panel refuses an end date before the start date, so demo data must too
    const backwards = DEMO.filter(o => o.data.endDate < o.data.startDate).map(o => o.docId);
    expect(backwards).toEqual([]);
  });

  it('never overlaps two orders on the same work centre (end dates inclusive)', () => {
    const clashes: string[] = [];
    for (let i = 0; i < DEMO.length; i++) {
      for (let j = i + 1; j < DEMO.length; j++) {
        const a = DEMO[i].data;
        const b = DEMO[j].data;
        if (a.workCenterId !== b.workCenterId) continue;
        // ISO dates compare correctly as strings; <= matches WorkOrderService.overlaps
        const latestStart = a.startDate > b.startDate ? a.startDate : b.startDate;
        const earliestEnd = a.endDate < b.endDate ? a.endDate : b.endDate;
        if (latestStart <= earliestEnd) clashes.push(`${DEMO[i].docId} × ${DEMO[j].docId}`);
      }
    }
    expect(clashes).toEqual([]);
  });
});

describe('shiftDemoOrders', () => {
  const today = new Date(2026, 10, 26); // Thu 26 Nov 2026, local time

  it('moves the anchor to within half a week of today', () => {
    const [shifted] = shiftDemoOrders(
      [{ ...DEMO[0], data: { ...DEMO[0].data, startDate: DEMO_ANCHOR_DATE, endDate: DEMO_ANCHOR_DATE } }],
      today
    );
    expect(Math.abs(daysFrom(toLocalIsoDate(today), shifted.data.startDate))).toBeLessThanOrEqual(3);
  });

  it('moves every date by the same whole number of weeks', () => {
    const shifted = shiftDemoOrders(DEMO, today);
    const shift = daysFrom(DEMO[0].data.startDate, shifted[0].data.startDate);
    expect(shift % 7).toBe(0);
    shifted.forEach((o, i) => {
      expect(daysFrom(DEMO[i].data.startDate, o.data.startDate)).toBe(shift);
      expect(daysFrom(DEMO[i].data.endDate, o.data.endDate)).toBe(shift);
    });
  });

  it('keeps each order on its weekday and keeps its length', () => {
    const shifted = shiftDemoOrders(DEMO, today);
    shifted.forEach((o, i) => {
      expect(weekday(o.data.startDate)).toBe(weekday(DEMO[i].data.startDate));
      expect(daysFrom(o.data.startDate, o.data.endDate)).toBe(daysFrom(DEMO[i].data.startDate, DEMO[i].data.endDate));
    });
  });

  it('leaves the demo data unchanged on the anchor date', () => {
    const [y, m, d] = DEMO_ANCHOR_DATE.split('-').map(Number);
    expect(shiftDemoOrders(DEMO, new Date(y, m - 1, d))).toEqual(DEMO);
  });

  it('crosses a year boundary cleanly', () => {
    const [shifted] = shiftDemoOrders(
      [{ ...DEMO[0], data: { ...DEMO[0].data, startDate: '2026-04-01', endDate: '2026-04-10' } }],
      new Date(2027, 0, 1)
    );
    expect(shifted.data.startDate).toMatch(/^2026-12-|^2027-01-/);
    expect(daysFrom(shifted.data.startDate, shifted.data.endDate)).toBe(9);
  });

  it('does not modify the orders it was given', () => {
    const before = JSON.stringify(DEMO);
    shiftDemoOrders(DEMO, today);
    expect(JSON.stringify(DEMO)).toBe(before);
  });
});
