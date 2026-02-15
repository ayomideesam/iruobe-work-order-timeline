import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastSubject = new Subject<Toast>();
  private readonly clearSubject = new Subject<void>();
  private readonly removeSubject = new Subject<string>();

  readonly toast$ = this.toastSubject.asObservable();
  readonly clear$ = this.clearSubject.asObservable();
  readonly remove$ = this.removeSubject.asObservable();

  success(message: string, title = 'Success'): void {
    this.show('success', title, message, 3000);
  }

  error(message: string, title = 'Error'): void {
    this.show('error', title, message, 5000);
  }

  warning(message: string, title = 'Warning'): void {
    this.show('warning', title, message, 6000);
  }

  info(message: string, title = 'Info'): void {
    this.show('info', title, message, 4000);
  }

  clear(): void {
    this.clearSubject.next();
  }

  remove(id: string): void {
    this.removeSubject.next(id);
  }

  private show(type: ToastType, title: string, message: string, duration: number): void {
    this.clearSubject.next();
    this.toastSubject.next({
      id: `toast-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
      type,
      title,
      message,
      duration,
    });
  }
}