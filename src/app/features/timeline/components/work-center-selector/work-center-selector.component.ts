import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { WorkCenterService } from 'src/app/core/services';

@Component({
  selector: 'app-work-center-selector',
  standalone: true,
  imports: [],
  templateUrl: './work-center-selector.component.html',
  styleUrls: ['./work-center-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkCenterSelectorComponent {
  private workCenterService = inject(WorkCenterService);

  workCenters = this.workCenterService.centers;
  selectedCenterId = signal<string | null>(null);

  selectWorkCenter(centerId: string): void {
    this.selectedCenterId.set(this.selectedCenterId() === centerId ? null : centerId);
  }

  isSelected = (centerId: string) => this.selectedCenterId() === centerId;
}
