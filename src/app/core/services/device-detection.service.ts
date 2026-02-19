import { Injectable, inject, signal, effect } from '@angular/core';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

export type DeviceType = 'small-phone' | 'large-phone' | 'tablet' | 'desktop';
export type ViewOptimization = 'supported' | 'degraded' | 'unsupported';

/**
 * Service to detect device type and provide responsive guidance
 * Gantt/Timeline is optimized for tablets (768px+) and desktops
 * 
 * Breakpoints:
 * - Small phones (< 576px): Unsupported - show warning
 * - Large phones (576px - 767px): Degraded - show warning  
 * - Tablets (768px - 1024px): Supported with minor adjustments
 * - Desktop (> 1024px): Fully supported
 */
@Injectable({
  providedIn: 'root'
})
export class DeviceDetectionService {
  private breakpointObserver: BreakpointObserver = inject(BreakpointObserver);

  // Public signals
  deviceType = signal<DeviceType>('desktop');
  viewOptimization = signal<ViewOptimization>('supported');
  showDeviceWarning = signal(false);
  warningMessage = signal('');

  // Signals for current device state (initialized in constructor)
  private isSmallPhone!: any;
  private isLargePhone!: any;
  private isTablet!: any;
  private isDesktop!: any;

  constructor() {
    // Initialize breakpoint observables
    this.isSmallPhone = toSignal(
      this.breakpointObserver.observe([Breakpoints.XSmall])
        .pipe(map((result: BreakpointState) => result.matches)),
      { initialValue: false }
    );

    this.isLargePhone = toSignal(
      this.breakpointObserver.observe(['(min-width: 576px) and (max-width: 767px)'])
        .pipe(map((result: BreakpointState) => result.matches)),
      { initialValue: false }
    );

    this.isTablet = toSignal(
      this.breakpointObserver.observe(['(min-width: 768px) and (max-width: 1024px)'])
        .pipe(map((result: BreakpointState) => result.matches)),
      { initialValue: false }
    );

    this.isDesktop = toSignal(
      this.breakpointObserver.observe(['(min-width: 1025px)'])
        .pipe(map((result: BreakpointState) => result.matches)),
      { initialValue: false }
    );

    // Update device type whenever breakpoint changes
    effect(() => {
      if (this.isSmallPhone()) {
        this.deviceType.set('small-phone');
        this.viewOptimization.set('unsupported');
        this.showDeviceWarning.set(true);
        this.warningMessage.set(
          'This timeline view is optimized for tablets and desktops (768px+). ' +
          'Please use a larger device for the best experience.'
        );
      } else if (this.isLargePhone()) {
        this.deviceType.set('large-phone');
        this.viewOptimization.set('degraded');
        this.showDeviceWarning.set(true);
        this.warningMessage.set(
          'This timeline view works better on tablets and desktops. ' +
          'Some features may be limited on your device.'
        );
      } else if (this.isTablet()) {
        this.deviceType.set('tablet');
        this.viewOptimization.set('supported');
        this.showDeviceWarning.set(false);
      } else if (this.isDesktop()) {
        this.deviceType.set('desktop');
        this.viewOptimization.set('supported');
        this.showDeviceWarning.set(false);
      }
    });
  }

  /**
   * Check if current device supports full Gantt timeline interaction
   */
  isSupported(): boolean {
    return this.viewOptimization() === 'supported';
  }

  /**
   * Check if device is small/phone-sized
   */
  isSmallDevice(): boolean {
    return this.deviceType() === 'small-phone' || this.deviceType() === 'large-phone';
  }

  /**
   * Get minimum recommended width for this device
   */
  getMinimumRecommendedWidth(): number {
    const device = this.deviceType();
    switch (device) {
      case 'small-phone':
        return 320;
      case 'large-phone':
        return 576;
      case 'tablet':
        return 768;
      case 'desktop':
        return 1024;
      default:
        return 1440;
    }
  }
}
