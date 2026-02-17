import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-date-column-header',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="date-column-header">Date header</div>`,
  styles: ['.date-column-header{padding:6px 12px;color:#666;}']
})
export class DateColumnHeaderComponent {}
