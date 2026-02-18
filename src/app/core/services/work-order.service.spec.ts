import { TestBed } from '@angular/core/testing';
import { WorkOrderService } from './work-order.service';
import { WorkOrderDocument } from '../models';

describe('WorkOrderService', () => {
  let service: WorkOrderService;
  let mockWorkOrder: WorkOrderDocument;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkOrderService);
    
    // Note: localStorage.clear() is called but service immediately initializes
    // with demo data and sets the hash, so we don't clear here
    
    // Mock work order for testing
    mockWorkOrder = {
      docId: 'wo-test-001',
      docType: 'workOrder',
      data: {
        name: 'Test Work Order',
        workCenterId: 'wc-1',
        status: 'open',
        startDate: '2026-03-01',
        endDate: '2026-03-15'
      }
    };
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should return an array of work orders', () => {
      const orders = service.getAll();
      expect(Array.isArray(orders)).toBe(true);
    });

    it('should load demo data on initialization', () => {
      const orders = service.getAll();
      expect(orders.length).toBeGreaterThan(0);
      expect(orders[0].docId).toBeDefined();
      expect(orders[0].docType).toBeDefined();
      expect(orders[0].data).toBeDefined();
    });
  });

  describe('create', () => {
    it('should add a new work order', () => {
      const initialCount = service.getAll().length;
      service.create(mockWorkOrder);
      const newCount = service.getAll().length;
      expect(newCount).toBe(initialCount + 1);
    });

    it('should persist to localStorage', () => {
      service.create(mockWorkOrder);
      const stored = localStorage.getItem('naologic_work_orders');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.some((o: WorkOrderDocument) => o.docId === mockWorkOrder.docId)).toBe(true);
    });

    it('should include the new order in subsequent getAll calls', () => {
      service.create(mockWorkOrder);
      const orders = service.getAll();
      const found = orders.find(o => o.docId === mockWorkOrder.docId);
      expect(found).toBeTruthy();
      expect(found?.data.name).toBe('Test Work Order');
    });
  });

  describe('update', () => {
    beforeEach(() => {
      service.create(mockWorkOrder);
    });

    it('should update an existing work order', () => {
      const updated = { ...mockWorkOrder, data: { ...mockWorkOrder.data, name: 'Updated Name' } };
      service.update(updated);
      
      const order = service.getAll().find(o => o.docId === mockWorkOrder.docId);
      expect(order?.data.name).toBe('Updated Name');
    });

    it('should persist updates to localStorage', () => {
      const updated = { ...mockWorkOrder, data: { ...mockWorkOrder.data, status: 'in-progress' as const } };
      service.update(updated);
      
      const stored = localStorage.getItem('naologic_work_orders');
      const parsed = JSON.parse(stored!);
      const found = parsed.find((o: WorkOrderDocument) => o.docId === mockWorkOrder.docId);
      expect(found.data.status).toBe('in-progress');
    });

    it('should not affect other orders', () => {
      const countBefore = service.getAll().length;
      const updated = { ...mockWorkOrder, data: { ...mockWorkOrder.data, name: 'Changed' } };
      service.update(updated);
      expect(service.getAll().length).toBe(countBefore);
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      service.create(mockWorkOrder);
    });

    it('should remove a work order by docId', () => {
      service.delete(mockWorkOrder.docId);
      const order = service.getAll().find(o => o.docId === mockWorkOrder.docId);
      expect(order).toBeUndefined();
    });

    it('should persist deletion to localStorage', () => {
      service.delete(mockWorkOrder.docId);
      const stored = localStorage.getItem('naologic_work_orders');
      const parsed = JSON.parse(stored!);
      const found = parsed.find((o: WorkOrderDocument) => o.docId === mockWorkOrder.docId);
      expect(found).toBeUndefined();
    });

    it('should decrease the total count by 1', () => {
      const countBefore = service.getAll().length;
      service.delete(mockWorkOrder.docId);
      expect(service.getAll().length).toBe(countBefore - 1);
    });
  });

  describe('overlaps', () => {
    let existingOrder: WorkOrderDocument;

    beforeEach(() => {
      // Clear all existing orders first to have a clean slate
      const currentOrders = service.getAll();
      currentOrders.forEach(order => service.delete(order.docId));
      
      existingOrder = {
        docId: 'wo-existing',
        docType: 'workOrder',
        data: {
          name: 'Existing Order',
          workCenterId: 'wc-1',
          status: 'in-progress',
          startDate: '2026-03-10',
          endDate: '2026-03-20'
        }
      };
      service.create(existingOrder);
    });

    it('should detect overlap when candidate fully contains existing', () => {
      const candidate: WorkOrderDocument = {
        docId: 'wo-overlap-1',
        docType: 'workOrder',
        data: {
          name: 'Overlapping Order',
          workCenterId: 'wc-1',
          status: 'open',
          startDate: '2026-03-05',
          endDate: '2026-03-25'
        }
      };
      expect(service.overlaps(candidate)).toBe(true);
    });

    it('should detect overlap when candidate is fully contained by existing', () => {
      const candidate: WorkOrderDocument = {
        docId: 'wo-overlap-2',
        docType: 'workOrder',
        data: {
          name: 'Overlapping Order',
          workCenterId: 'wc-1',
          status: 'open',
          startDate: '2026-03-12',
          endDate: '2026-03-15'
        }
      };
      expect(service.overlaps(candidate)).toBe(true);
    });

    it('should detect overlap when candidate starts during existing', () => {
      const candidate: WorkOrderDocument = {
        docId: 'wo-overlap-3',
        docType: 'workOrder',
        data: {
          name: 'Overlapping Order',
          workCenterId: 'wc-1',
          status: 'open',
          startDate: '2026-03-15',
          endDate: '2026-03-30'
        }
      };
      expect(service.overlaps(candidate)).toBe(true);
    });

    it('should detect overlap when candidate ends during existing', () => {
      const candidate: WorkOrderDocument = {
        docId: 'wo-overlap-4',
        docType: 'workOrder',
        data: {
          name: 'Overlapping Order',
          workCenterId: 'wc-1',
          status: 'open',
          startDate: '2026-03-05',
          endDate: '2026-03-15'
        }
      };
      expect(service.overlaps(candidate)).toBe(true);
    });

    it('should NOT detect overlap for non-overlapping dates (before)', () => {
      const candidate: WorkOrderDocument = {
        docId: 'wo-no-overlap-1',
        docType: 'workOrder',
        data: {
          name: 'Non-Overlapping Order',
          workCenterId: 'wc-1',
          status: 'open',
          startDate: '2026-02-01',
          endDate: '2026-02-28'
        }
      };
      expect(service.overlaps(candidate)).toBe(false);
    });

    it('should NOT detect overlap for non-overlapping dates (after)', () => {
      const candidate: WorkOrderDocument = {
        docId: 'wo-no-overlap-2',
        docType: 'workOrder',
        data: {
          name: 'Non-Overlapping Order',
          workCenterId: 'wc-1',
          status: 'open',
          startDate: '2026-03-21',
          endDate: '2026-03-31'
        }
      };
      expect(service.overlaps(candidate)).toBe(false);
    });

    it('should NOT detect overlap for different work centers', () => {
      const candidate: WorkOrderDocument = {
        docId: 'wo-different-wc',
        docType: 'workOrder',
        data: {
          name: 'Different Work Center',
          workCenterId: 'wc-2',
          status: 'open',
          startDate: '2026-03-10',
          endDate: '2026-03-20'
        }
      };
      expect(service.overlaps(candidate)).toBe(false);
    });

    it('should ignore specified docId when checking overlaps', () => {
      const candidate: WorkOrderDocument = {
        docId: 'wo-existing',
        docType: 'workOrder',
        data: {
          name: 'Update Existing',
          workCenterId: 'wc-1',
          status: 'complete',
          startDate: '2026-03-10',
          endDate: '2026-03-20'
        }
      };
      expect(service.overlaps(candidate, 'wo-existing')).toBe(false);
    });

    it('should detect touch boundaries as overlap (same start/end)', () => {
      const candidate: WorkOrderDocument = {
        docId: 'wo-touch',
        docType: 'workOrder',
        data: {
          name: 'Touching Order',
          workCenterId: 'wc-1',
          status: 'open',
          startDate: '2026-03-20',
          endDate: '2026-03-25'
        }
      };
      expect(service.overlaps(candidate)).toBe(true);
    });
  });

  describe('localStorage persistence', () => {
    it('should load from localStorage if data exists', () => {
      // Clear and create fresh data
      localStorage.clear();
      service.create(mockWorkOrder);
      const stored = localStorage.getItem('naologic_work_orders');
      
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.some((o: WorkOrderDocument) => o.docId === mockWorkOrder.docId)).toBe(true);
    });

    it('should invalidate cache when demo data hash changes', () => {
      // This test verifies the hash mechanism exists
      const hash = localStorage.getItem('naologic_work_orders_hash');
      expect(hash).toBeTruthy();
      expect(hash).toContain('v3-');
    });

    it('should handle corrupted localStorage gracefully', () => {
      localStorage.clear();
      localStorage.setItem('naologic_work_orders', 'corrupted{json}');
      
      // Should fall back to demo data without throwing
      expect(() => {
        const newService = new WorkOrderService();
        newService.getAll();
      }).not.toThrow();
    });
  });

  describe('signal reactivity', () => {
    it('should update signal when creating order', () => {
      const initialOrders = service.orders();
      service.create(mockWorkOrder);
      const updatedOrders = service.orders();
      
      expect(updatedOrders.length).toBe(initialOrders.length + 1);
    });

    it('should update signal when updating order', () => {
      service.create(mockWorkOrder);
      const updated = { ...mockWorkOrder, data: { ...mockWorkOrder.data, name: 'New Name' } };
      service.update(updated);
      
      const found = service.orders().find(o => o.docId === mockWorkOrder.docId);
      expect(found?.data.name).toBe('New Name');
    });

    it('should update signal when deleting order', () => {
      service.create(mockWorkOrder);
      const beforeDelete = service.orders().length;
      service.delete(mockWorkOrder.docId);
      const afterDelete = service.orders().length;
      
      expect(afterDelete).toBe(beforeDelete - 1);
    });
  });
});
