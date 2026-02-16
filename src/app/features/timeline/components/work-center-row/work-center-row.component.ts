import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkCenterDocument } from '../../../../app/core/models';

@Component({
  selector: 'app-work-center-row',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './work-center-row.component.html',
  styleUrls: ['./work-center-row.component.scss']
})
export class WorkCenterRowComponent {
  @Input() center!: WorkCenterDocument;
}
