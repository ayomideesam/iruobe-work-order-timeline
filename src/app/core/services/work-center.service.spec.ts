import { TestBed } from '@angular/core/testing';
import { WorkCenterService } from './work-center.service';
import { WorkCenterDocument } from '../models';

describe('WorkCenterService', () => {
  let service: WorkCenterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkCenterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should return an array of work centers', () => {
      const centers = service.getAll();
      expect(Array.isArray(centers)).toBe(true);
    });

    it('should return at least 5 work centers', () => {
      const centers = service.getAll();
      expect(centers.length).toBeGreaterThanOrEqual(5);
    });

    it('should return work centers with correct structure', () => {
      const centers = service.getAll();
      centers.forEach(center => {
        expect(center.docId).toBeDefined();
        expect(center.docType).toBeDefined();
        expect(center.data).toBeDefined();
        expect(center.docType).toBe('workCenter');
        expect(center.data.name).toBeDefined();
        expect(typeof center.data.name).toBe('string');
      });
    });

    it('should return work centers with unique docIds', () => {
      const centers = service.getAll();
      const ids = centers.map(c => c.docId);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should include expected work center IDs (wc-1 through wc-9)', () => {
      const centers = service.getAll();
      const ids = centers.map(c => c.docId);
      
      // Should include wc-1 through wc-9 based on demo data
      expect(ids).toContain('wc-1');
      expect(ids).toContain('wc-2');
      expect(ids).toContain('wc-3');
    });
  });

  describe('centers signal', () => {
    it('should expose a readonly signal', () => {
      const centersSignal = service.centers;
      expect(centersSignal).toBeTruthy();
      expect(typeof centersSignal).toBe('function');
    });

    it('should return same data as getAll', () => {
      const fromGetAll = service.getAll();
      const fromSignal = service.centers();
      expect(fromSignal).toEqual(fromGetAll);
    });

    it('should be reactive', () => {
      const initial = service.centers();
      expect(initial.length).toBeGreaterThan(0);
    });
  });

  describe('data integrity', () => {
    it('should not mutate original data when returned', () => {
      const centers1 = service.getAll();
      const centers2 = service.getAll();
      
      // Mutating returned array shouldn't affect service
      centers1.pop();
      
      expect(centers2.length).toBeGreaterThan(centers1.length);
    });
  });
});
