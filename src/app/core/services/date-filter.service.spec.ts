import { TestBed } from '@angular/core/testing';
import { DateFilterService } from './date-filter.service';

describe('DateFilterService', () => {
  let service: DateFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DateFilterService);
  });

  afterEach(() => {
    service.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have null startDate by default', () => {
      expect(service.startDate()).toBeNull();
    });

    it('should have null endDate by default', () => {
      expect(service.endDate()).toBeNull();
    });
  });

  describe('setDateRange', () => {
    it('should set start and end dates', () => {
      const start = new Date('2026-02-15');
      const end = new Date('2026-02-20');
      
      service.setDateRange(start, end);
      
      expect(service.startDate()).toEqual(start);
      expect(service.endDate()).toEqual(end);
    });

    it('should allow setting only startDate', () => {
      const start = new Date('2026-02-15');
      
      service.setDateRange(start, null);
      
      expect(service.startDate()).toEqual(start);
      expect(service.endDate()).toBeNull();
    });

    it('should allow setting only endDate', () => {
      const end = new Date('2026-02-20');
      
      service.setDateRange(null, end);
      
      expect(service.startDate()).toBeNull();
      expect(service.endDate()).toEqual(end);
    });

    it('should allow setting both to null', () => {
      const start = new Date('2026-02-15');
      const end = new Date('2026-02-20');
      
      service.setDateRange(start, end);
      service.setDateRange(null, null);
      
      expect(service.startDate()).toBeNull();
      expect(service.endDate()).toBeNull();
    });

    it('should update signals reactively', () => {
      const start = new Date('2026-02-15');
      const end = new Date('2026-02-20');
      
      expect(service.startDate()).toBeNull();
      
      service.setDateRange(start, end);
      
      expect(service.startDate()).toEqual(start);
    });
  });

  describe('isInRange', () => {
    it('should return true when no range is set', () => {
      const date = new Date('2026-02-15');
      expect(service.isInRange(date)).toBe(true);
    });

    it('should return true for date within range', () => {
      const start = new Date('2026-02-10');
      const end = new Date('2026-02-20');
      const date = new Date('2026-02-15');
      
      service.setDateRange(start, end);
      
      expect(service.isInRange(date)).toBe(true);
    });

    it('should return false for date before start', () => {
      const start = new Date('2026-02-10');
      const end = new Date('2026-02-20');
      const date = new Date('2026-02-05');
      
      service.setDateRange(start, end);
      
      expect(service.isInRange(date)).toBe(false);
    });

    it('should return false for date after end', () => {
      const start = new Date('2026-02-10');
      const end = new Date('2026-02-20');
      const date = new Date('2026-02-25');
      
      service.setDateRange(start, end);
      
      expect(service.isInRange(date)).toBe(false);
    });

    it('should return true for date equal to start', () => {
      const start = new Date('2026-02-10');
      const end = new Date('2026-02-20');
      const date = new Date('2026-02-10');
      
      service.setDateRange(start, end);
      
      expect(service.isInRange(date)).toBe(true);
    });

    it('should return true for date equal to end', () => {
      const start = new Date('2026-02-10');
      const end = new Date('2026-02-20');
      const date = new Date('2026-02-20');
      
      service.setDateRange(start, end);
      
      expect(service.isInRange(date)).toBe(true);
    });

    it('should accept string dates in ISO format', () => {
      const start = new Date('2026-02-10');
      const end = new Date('2026-02-20');
      
      service.setDateRange(start, end);
      
      expect(service.isInRange('2026-02-15')).toBe(true);
      expect(service.isInRange('2026-02-05')).toBe(false);
      expect(service.isInRange('2026-02-25')).toBe(false);
    });

    it('should handle only startDate set', () => {
      const start = new Date('2026-02-10');
      
      service.setDateRange(start, null);
      
      expect(service.isInRange(new Date('2026-02-15'))).toBe(true);
      expect(service.isInRange(new Date('2026-02-05'))).toBe(false);
    });

    it('should handle only endDate set', () => {
      const end = new Date('2026-02-20');
      
      service.setDateRange(null, end);
      
      expect(service.isInRange(new Date('2026-02-15'))).toBe(true);
      expect(service.isInRange(new Date('2026-02-25'))).toBe(false);
    });
  });

  describe('reset', () => {
    it('should clear both startDate and endDate', () => {
      const start = new Date('2026-02-10');
      const end = new Date('2026-02-20');
      
      service.setDateRange(start, end);
      expect(service.startDate()).toEqual(start);
      expect(service.endDate()).toEqual(end);
      
      service.reset();
      
      expect(service.startDate()).toBeNull();
      expect(service.endDate()).toBeNull();
    });

    it('should allow setting new range after reset', () => {
      const start1 = new Date('2026-02-10');
      const end1 = new Date('2026-02-20');
      
      service.setDateRange(start1, end1);
      service.reset();
      
      const start2 = new Date('2026-03-01');
      const end2 = new Date('2026-03-31');
      
      service.setDateRange(start2, end2);
      
      expect(service.startDate()).toEqual(start2);
      expect(service.endDate()).toEqual(end2);
    });

    it('should make isInRange return true after reset', () => {
      const start = new Date('2026-02-10');
      const end = new Date('2026-02-20');
      
      service.setDateRange(start, end);
      expect(service.isInRange(new Date('2026-03-01'))).toBe(false);
      
      service.reset();
      expect(service.isInRange(new Date('2026-03-01'))).toBe(true);
    });
  });

  describe('signal reactivity', () => {
    it('should update startDate signal when range changes', () => {
      const start = new Date('2026-02-15');
      
      expect(service.startDate()).toBeNull();
      
      service.setDateRange(start, null);
      
      expect(service.startDate()).toEqual(start);
    });

    it('should update endDate signal when range changes', () => {
      const end = new Date('2026-02-20');
      
      expect(service.endDate()).toBeNull();
      
      service.setDateRange(null, end);
      
      expect(service.endDate()).toEqual(end);
    });

    it('should update both signals simultaneously', () => {
      const start = new Date('2026-02-15');
      const end = new Date('2026-02-20');
      
      service.setDateRange(start, end);
      
      expect(service.startDate()).toEqual(start);
      expect(service.endDate()).toEqual(end);
    });
  });

  describe('edge cases', () => {
    it('should handle dates with time components', () => {
      const start = new Date('2026-02-15T08:30:00');
      const end = new Date('2026-02-20T17:45:00');
      const date = new Date('2026-02-18T12:00:00');
      
      service.setDateRange(start, end);
      
      expect(service.isInRange(date)).toBe(true);
    });

    it('should handle invalid date strings gracefully', () => {
      const start = new Date('2026-02-10');
      const end = new Date('2026-02-20');
      
      service.setDateRange(start, end);
      
      // Invalid date string creates Invalid Date, which comparisons handle
      const result = service.isInRange('invalid-date');
      expect(typeof result).toBe('boolean');
    });

    it('should handle same start and end date', () => {
      const sameDate = new Date('2026-02-15');
      
      service.setDateRange(sameDate, sameDate);
      
      expect(service.isInRange(new Date('2026-02-15'))).toBe(true);
      expect(service.isInRange(new Date('2026-02-14'))).toBe(false);
      expect(service.isInRange(new Date('2026-02-16'))).toBe(false);
    });
  });
});
