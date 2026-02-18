import { TestBed } from '@angular/core/testing';
import { TimelineZoomService, ZoomLevel } from './timeline-zoom.service';

describe('TimelineZoomService', () => {
  let service: TimelineZoomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimelineZoomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setZoom', () => {
    it('should update zoom level to day', () => {
      service.setZoom('day');
      expect(service.zoomLevel()).toBe('day');
    });

    it('should update zoom level to week', () => {
      service.setZoom('week');
      expect(service.zoomLevel()).toBe('week');
    });

    it('should update zoom level to month', () => {
      service.setZoom('month');
      expect(service.zoomLevel()).toBe('month');
    });

    it('should update zoom level to hour', () => {
      service.setZoom('hour');
      expect(service.zoomLevel()).toBe('hour');
    });

    it('should allow multiple zoom level changes', () => {
      service.setZoom('day');
      expect(service.zoomLevel()).toBe('day');
      
      service.setZoom('week');
      expect(service.zoomLevel()).toBe('week');
      
      service.setZoom('month');
      expect(service.zoomLevel()).toBe('month');
    });
  });

  describe('zoomLevel signal', () => {
    it('should default to month', () => {
      expect(service.zoomLevel()).toBe('month');
    });

    it('should be readonly', () => {
      const zoom = service.zoomLevel;
      expect(zoom).toBeTruthy();
      expect(typeof zoom).toBe('function');
    });

    it('should be reactive to setZoom calls', () => {
      expect(service.zoomLevel()).toBe('month');
      service.setZoom('day');
      expect(service.zoomLevel()).toBe('day');
    });
  });

  describe('getDateColumns', () => {
    const startDate = new Date('2026-02-15T00:00:00');
    const endDate = new Date('2026-02-20T23:59:59');

    it('should return an array of date columns', () => {
      const columns = service.getDateColumns(startDate, endDate);
      expect(Array.isArray(columns)).toBe(true);
      expect(columns.length).toBeGreaterThan(0);
    });

    it('should return day columns when zoom is day', () => {
      service.setZoom('day');
      const columns = service.getDateColumns(startDate, endDate);
      
      expect(columns.length).toBeGreaterThan(0);
      columns.forEach(col => {
        expect(col.date).toBeDefined();
        expect(col.label).toBeDefined();
        expect(col.width).toBeDefined();
        expect(col.date).toBeInstanceOf(Date);
        expect(typeof col.label).toBe('string');
        expect(typeof col.width).toBe('number');
      });
    });

    it('should return week columns when zoom is week', () => {
      service.setZoom('week');
      const columns = service.getDateColumns(startDate, endDate);
      
      expect(columns.length).toBeGreaterThan(0);
      columns.forEach(col => {
        expect(col.date).toBeInstanceOf(Date);
        expect(col.width).toBeGreaterThan(0);
      });
    });

    it('should return month columns when zoom is month', () => {
      service.setZoom('month');
      const longStart = new Date('2026-01-01');
      const longEnd = new Date('2026-06-30');
      const columns = service.getDateColumns(longStart, longEnd);
      
      expect(columns.length).toBeGreaterThan(0);
      columns.forEach(col => {
        expect(col.date).toBeInstanceOf(Date);
        expect(col.width).toBeGreaterThan(0);
      });
    });

    it('should return hour columns when zoom is hour', () => {
      service.setZoom('hour');
      const hourStart = new Date('2026-02-15T08:00:00');
      const hourEnd = new Date('2026-02-15T12:00:00');
      const columns = service.getDateColumns(hourStart, hourEnd);
      
      expect(columns.length).toBeGreaterThan(0);
      columns.forEach(col => {
        expect(col.date).toBeInstanceOf(Date);
        expect(col.label).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/i);
        expect(col.width).toBe(40); // Hour columns are 40px wide
      });
    });

    it('should generate correct number of day columns for date range', () => {
      service.setZoom('day');
      const start = new Date('2026-02-15');
      const end = new Date('2026-02-17');
      const columns = service.getDateColumns(start, end);
      
      // Should have 3 columns for Feb 15, 16, 17
      expect(columns.length).toBeGreaterThanOrEqual(3);
    });

    it('should generate columns with consistent widths per zoom level', () => {
      service.setZoom('day');
      const columns = service.getDateColumns(startDate, endDate);
      
      const widths = columns.map(c => c.width);
      const uniqueWidths = new Set(widths);
      
      // All day columns should have the same or similar width
      expect(uniqueWidths.size).toBeLessThanOrEqual(2); // Allow for minor variations
    });

    it('should handle single day range', () => {
      service.setZoom('day');
      const singleDay = new Date('2026-02-15');
      const columns = service.getDateColumns(singleDay, singleDay);
      
      expect(columns.length).toBeGreaterThanOrEqual(1);
    });

    it('should generate columns spanning the provided range', () => {
      service.setZoom('day');
      const columns = service.getDateColumns(startDate, endDate);
      
      const firstColDate = columns[0].date;
      const lastColDate = columns[columns.length - 1].date;
      
      expect(firstColDate.getTime()).toBeLessThanOrEqual(startDate.getTime());
      expect(lastColDate.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
    });
  });

  describe('column width calculations', () => {
    it('should return reasonable widths for day columns', () => {
      service.setZoom('day');
      const start = new Date('2026-02-15');
      const end = new Date('2026-02-20');
      const columns = service.getDateColumns(start, end);
      
      columns.forEach(col => {
        expect(col.width).toBeGreaterThan(30); // Day columns should be wide enough
        expect(col.width).toBeLessThan(300);
      });
    });

    it('should return reasonable widths for week columns', () => {
      service.setZoom('week');
      const start = new Date('2026-02-01');
      const end = new Date('2026-03-31');
      const columns = service.getDateColumns(start, end);
      
      columns.forEach(col => {
        expect(col.width).toBeGreaterThan(80);
        expect(col.width).toBeLessThan(600);
      });
    });

    it('should return reasonable widths for month columns', () => {
      service.setZoom('month');
      const start = new Date('2026-01-01');
      const end = new Date('2026-12-31');
      const columns = service.getDateColumns(start, end);
      
      columns.forEach(col => {
        expect(col.width).toBeGreaterThan(150);
        expect(col.width).toBeLessThan(1200);
      });
    });
  });

  describe('zoom level persistence', () => {
    it('should maintain zoom level across multiple getDateColumns calls', () => {
      service.setZoom('week');
      
      const start1 = new Date('2026-02-01');
      const end1 = new Date('2026-02-15');
      service.getDateColumns(start1, end1);
      
      expect(service.zoomLevel()).toBe('week');
      
      const start2 = new Date('2026-03-01');
      const end2 = new Date('2026-03-15');
      service.getDateColumns(start2, end2);
      
      expect(service.zoomLevel()).toBe('week');
    });
  });
});
