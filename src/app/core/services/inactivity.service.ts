import { Injectable, inject, DestroyRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, merge, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })

export class InactivityService {
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly ngZone = inject(NgZone);

  private readonly TIMEOUT = 30 * 60 * 1000;        // 30 minutes
  private readonly WARNING_BEFORE = 60 * 1000;       // 1 minute before logout

  private timeoutId?: ReturnType<typeof setTimeout>;
  private warningId?: ReturnType<typeof setTimeout>;
  private warningShown = false;
  private active = false;
  private activitySub?: Subscription;

  private readonly ACTIVITY_EVENTS = ['click', 'mousemove', 'keydown', 'touchstart', 'scroll'] as const;

  /** Start tracking inactivity. Call once when entering a protected route. */
  start(): void {
    if (this.active) return;
    this.active = true;

    this.ngZone.runOutsideAngular(() => {
      const streams = this.ACTIVITY_EVENTS.map(e =>
        fromEvent(document, e).pipe(debounceTime(500))
      );

      this.activitySub = merge(...streams).subscribe(() => {
        if (this.active) this.onActivity();
      });
    });

    this.resetTimers();
  }

  /** Stop tracking. Call when leaving a protected route. */
  stop(): void {
    this.active = false;
    this.clearTimers();
    this.activitySub?.unsubscribe();
    this.activitySub = undefined;
  }

  private onActivity(): void {
    if (this.warningShown) {
      this.warningShown = false;
      this.toast.clear();
    }
    this.resetTimers();
  }

  private resetTimers(): void {
    this.clearTimers();
    if (!this.active) return;

    this.ngZone.runOutsideAngular(() => {
      this.warningId = setTimeout(() => {
        this.ngZone.run(() => {
          this.warningShown = true;
          this.toast.warning(
            'Your session will expire in 1 minute due to inactivity.',
            'Session Expiring'
          );
        });
      }, this.TIMEOUT - this.WARNING_BEFORE);

      this.timeoutId = setTimeout(() => {
        this.ngZone.run(() => this.logout());
      }, this.TIMEOUT);
    });
  }

  private clearTimers(): void {
    if (this.timeoutId) { clearTimeout(this.timeoutId); this.timeoutId = undefined; }
    if (this.warningId) { clearTimeout(this.warningId); this.warningId = undefined; }
  }

  private logout(): void {
    this.stop();
    this.toast.error('Session expired due to inactivity.', 'Session Expired');
    this.router.navigate(['/']);
  }
}