import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-three-dot-menu',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="three-dot">⋯</div>`,
  styles: ['.three-dot{cursor:pointer;padding:6px;}']
})
export class ThreeDotMenuComponent {}
