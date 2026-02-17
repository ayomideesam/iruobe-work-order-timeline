import { Component, DestroyRef, inject, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { trigger, transition, style, animate } from '@angular/animations';
import { ToastService, Toast } from 'src/app/core/services/toast.service';

interface ToastWithTimer extends Toast {
  timeoutId?: ReturnType<typeof setTimeout>;
}

@Component({
  selector: 'app-toast',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Default, // needs Default for array mutations
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css'],
  animations: [
    trigger('toastAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px) scale(0.95)' }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ]),
      transition(':leave', [
        animate('250ms cubic-bezier(0.4, 0, 1, 1)',
          style({ opacity: 0, transform: 'translateY(10px) scale(0.95)' }))
      ])
    ])
  ],
  host: {
    class: 'toast-container'
  }
})
export class ToastComponent {
  toasts: ToastWithTimer[] = [];

  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.toastService.toast$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((toast) => {
        const t: ToastWithTimer = { ...toast };
        this.toasts.push(t);
        if (t.duration > 0) {
          t.timeoutId = setTimeout(() => this.removeToast(t.id), t.duration);
        }
      });

    this.toastService.clear$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.toasts.forEach(t => { if (t.timeoutId) clearTimeout(t.timeoutId); });
        this.toasts = [];
      });

    this.toastService.remove$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((id) => this.removeToast(id));

    this.destroyRef.onDestroy(() => {
      this.toasts.forEach(t => { if (t.timeoutId) clearTimeout(t.timeoutId); });
    });
  }

  removeToast(id: string): void {
    const idx = this.toasts.findIndex(t => t.id === id);
    if (idx !== -1) {
      const toast = this.toasts[idx];
      if (toast.timeoutId) clearTimeout(toast.timeoutId);
      this.toasts.splice(idx, 1);
    }
  }
}
