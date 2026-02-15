import { Injectable, signal } from '@angular/core';
import { WorkCenterDocument } from '../models';
import { WORK_CENTERS } from '../data/sample-data';

@Injectable({ providedIn: 'root' })
export class WorkCenterService {
  private _centers = signal<WorkCenterDocument[]>([...WORK_CENTERS]);

  readonly centers = this._centers;

  getAll(): WorkCenterDocument[] {
    return this._centers();
  }
}
