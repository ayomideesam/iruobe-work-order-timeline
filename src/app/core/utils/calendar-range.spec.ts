import { calendarRange, MONTHS_AROUND_TODAY } from './calendar-range';
import { WorkOrderDocument } from '../models';

function order(startDate: string, endDate: string): WorkOrderDocument {
  return {
    docId: `wo-${startDate}`,
    docType: 'workOrder',
    data: { name: 'Order', workCenterId: 'wc-1', status: 'open', startDate, endDate },
  };
}

describe('calendarRange', () => {
  const today = new Date(2026, 10, 26); // Thu 26 Nov 2026

  it(`shows ${MONTHS_AROUND_TODAY} months either side of today when there are no orders`, () => {
    const { start, end } = calendarRange([], today);
    expect(start).toEqual(new Date(2025, 10, 1));  // 1 Nov 2025
    expect(end).toEqual(new Date(2027, 10, 30));   // 30 Nov 2027
  });

  it('starts on the 1st and ends on the last day of a month', () => {
    const { start, end } = calendarRange([order('2024-02-17', '2028-02-03')], today);
    expect(start).toEqual(new Date(2024, 1, 1));
    expect(end).toEqual(new Date(2028, 1, 29)); // 2028 is a leap year
  });

  it('widens to include orders before and after the default window', () => {
    const { start, end } = calendarRange([order('2023-06-10', '2023-07-01'), order('2028-03-01', '2028-05-20')], today);
    expect(start).toEqual(new Date(2023, 5, 1));
    expect(end).toEqual(new Date(2028, 4, 31));
  });

  it('does not shrink below the default window for orders near today', () => {
    const { start, end } = calendarRange([order('2026-11-20', '2026-12-04')], today);
    expect(start).toEqual(new Date(2025, 10, 1));
    expect(end).toEqual(new Date(2027, 10, 30));
  });

  it('keeps today on the grid after the old fixed range ended (regression: Dec 2026)', () => {
    const newYear = new Date(2027, 0, 15);
    const { start, end } = calendarRange([order('2024-01-08', '2026-12-15')], newYear);
    expect(newYear >= start && newYear <= end).toBe(true);
  });

  it('skips an order with an unparseable date instead of breaking the range', () => {
    const { start, end } = calendarRange([order('not-a-date', 'also-not')], today);
    expect(start).toEqual(new Date(2025, 10, 1));
    expect(end).toEqual(new Date(2027, 10, 30));
  });
});
