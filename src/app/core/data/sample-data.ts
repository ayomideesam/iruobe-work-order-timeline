import { WorkCenterDocument, WorkOrderDocument } from '../models';

export const WORK_CENTERS: WorkCenterDocument[] = [
  { docId: 'wc-1', docType: 'workCenter', data: { name: 'Genesis Hardware' } },
  { docId: 'wc-2', docType: 'workCenter', data: { name: 'Rodriques Electrics' } },
  { docId: 'wc-3', docType: 'workCenter', data: { name: 'Dangote Industries' } },
  { docId: 'wc-4', docType: 'workCenter', data: { name: 'McMarrow Distribution' } },
  { docId: 'wc-5', docType: 'workCenter', data: { name: 'Spartan Manufacturing' } },
  { docId: 'wc-6', docType: 'workCenter', data: { name: 'BUA Group' } },
  { docId: 'wc-7', docType: 'workCenter', data: { name: 'Sany Heavy Industry' } },
  { docId: 'wc-8', docType: 'workCenter', data: { name: 'Siemens Gamesa' } },
  { docId: 'wc-9', docType: 'workCenter', data: { name: 'Konsulting Inc' } }
];

export const WORK_ORDERS: WorkOrderDocument[] = [
  {
    docId: 'wo-1',
    docType: 'workOrder',
    data: {
      name: 'Aluminum Extrusion Batch 42',
      workCenterId: 'wc-1',
      status: 'in-progress',
      startDate: '2025-01-10',
      endDate: '2025-01-14'
    }
  },
  {
    docId: 'wo-2',
    docType: 'workOrder',
    data: {
      name: 'CNC Chassis Run',
      workCenterId: 'wc-2',
      status: 'open',
      startDate: '2025-01-11',
      endDate: '2025-01-13'
    }
  },
  {
    docId: 'wo-3',
    docType: 'workOrder',
    data: {
      name: 'Assembly - Model X',
      workCenterId: 'wc-3',
      status: 'blocked',
      startDate: '2025-01-09',
      endDate: '2025-01-12'
    }
  },
  {
    docId: 'wo-4',
    docType: 'workOrder',
    data: {
      name: 'QC - Batch 37',
      workCenterId: 'wc-4',
      status: 'complete',
      startDate: '2025-01-05',
      endDate: '2025-01-08'
    }
  },
  {
    docId: 'wo-5',
    docType: 'workOrder',
    data: {
      name: 'Packaging Run A',
      workCenterId: 'wc-5',
      status: 'open',
      startDate: '2025-01-13',
      endDate: '2025-01-15'
    }
  },
  {
    docId: 'wo-6',
    docType: 'workOrder',
    data: {
      name: 'Extrusion Maintenance',
      workCenterId: 'wc-1',
      status: 'open',
      startDate: '2025-01-16',
      endDate: '2025-01-18'
    }
  },
  {
    docId: 'wo-7',
    docType: 'workOrder',
    data: {
      name: 'CNC Prototype',
      workCenterId: 'wc-2',
      status: 'in-progress',
      startDate: '2025-01-14',
      endDate: '2025-01-17'
    }
  },
  {
    docId: 'wo-8',
    docType: 'workOrder',
    data: {
      name: 'Final Assembly - Batch Z',
      workCenterId: 'wc-3',
      status: 'in-progress',
      startDate: '2025-01-13',
      endDate: '2025-01-19'
    }
  }
];
