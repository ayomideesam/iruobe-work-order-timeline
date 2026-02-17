import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `<span class="badge" [style.background]="color">{{ label }}</span>`,
  styles: ['.badge{padding:4px 8px;border-radius:999px;color:#fff;font-size:12px;font-weight:500;}']
})
export class StatusBadgeComponent {
  @Input() label = '';
  @Input() color = '#5B6FED';
}
