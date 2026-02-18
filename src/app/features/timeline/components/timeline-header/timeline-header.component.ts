import { Component, computed, signal, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { DateFilterService, TimelineZoomService } from 'src/app/core/services';

@Component({
  selector: 'app-timeline-header',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule, NgbDatepickerModule],
  templateUrl: './timeline-header.component.html',
  styleUrls: ['./timeline-header.component.scss']
})
export class TimelineHeaderComponent {
  private zoomService = inject(TimelineZoomService);
  private dateFilter = inject(DateFilterService);

  @Output() scrollToToday = new EventEmitter<void>();

  timescales = [
    { label: 'Hour', value: 'hour', disabled: true },
    { label: 'Day', value: 'day' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' }
  ];

  selected = signal<'hour'|'day'|'week'|'month'>(this.zoomService.zoomLevel());
  selectedDate = signal<any>(null);
  
  // ✅ Dropdown state
  isDropdownOpen = false;

  setZoom(z: 'hour'|'day'|'week'|'month'): void {
    this.selected.set(z);
    this.zoomService.setZoom(z);
  }

  onDateSelected(date: any): void {
    if (date) {
      // Convert NgbDateStruct to Date
      const dateObj = new Date(date.year, date.month - 1, date.day);
      // Set range to the selected month
      const start = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
      const end = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0);
      this.dateFilter.setDateRange(start, end);
    } else {
      this.dateFilter.reset();
    }
  }

  // ✅ Handle dropdown open
  onDropdownOpen(): void {
    this.isDropdownOpen = true;
  }

  // ✅ Handle dropdown close
  onDropdownClose(): void {
    this.isDropdownOpen = false;
  }

  // ✅ Emit scroll to today event
  onTodayClick(): void {
    this.scrollToToday.emit();
  }
}