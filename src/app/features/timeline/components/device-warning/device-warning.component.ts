import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DeviceDetectionService } from 'src/app/core/services/device-detection.service';

@Component({
  selector: 'app-device-warning',
  standalone: true,
  imports: [CommonModule, NgbModule],
  template: `
    @if (deviceDetection.showDeviceWarning()) {
      <div class="device-warning-container">
        <div [ngClass]="'alert alert-' + (deviceDetection.viewOptimization() === 'unsupported' ? 'danger' : 'warning')" role="alert">
          <div class="warning-content">
            <div class="warning-icon">
              @if (deviceDetection.viewOptimization() === 'unsupported') {
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              } @else {
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              }
            </div>
            <div class="warning-text">
              <strong>
                @if (deviceDetection.viewOptimization() === 'unsupported') {
                  Device Not Supported
                } @else {
                  Limited Experience
                }
              </strong>
              <p>{{ deviceDetection.warningMessage() }}</p>
              <small class="device-info-inline">Current device: {{ deviceDetection.deviceType() | titlecase }}</small>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .device-warning-container {
      position: sticky;
      top: 0;
      z-index: 1000;
      width: 100%;
      box-sizing: border-box;
      padding: 12px 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .alert {
      margin: 0;
      padding: 12px 16px;
      border-radius: 6px;
      overflow: visible;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    .alert-danger {
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      color: #721c24;
    }

    .alert-warning {
      background-color: #fff3cd;
      border: 1px solid #ffeeba;
      color: #856404;
    }

    .warning-content {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      width: 100%;
    }

    .warning-icon {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      margin-top: 2px;
    }

    .warning-icon svg {
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .warning-text {
      flex: 1;
      min-width: 0;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    .warning-text strong {
      display: block;
      margin-bottom: 4px;
      font-size: 14px;
      font-family: var(--type-circular-medium);
    }

    .warning-text p {
      margin: 0 0 4px 0;
      font-size: 13px;
      line-height: 1.4;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    .device-info-inline {
      display: block;
      font-size: 11px;
      opacity: 0.7;
      margin-top: 2px;
    }

    @media (max-width: 576px) {
      .device-warning-container {
        padding: 8px 10px;
      }

      .alert {
        padding: 10px 12px;
      }

      .warning-content {
        gap: 8px;
      }

      .warning-text strong {
        font-size: 13px;
      }

      .warning-text p {
        font-size: 12px;
      }
    }
  `]
})
export class DeviceWarningComponent {
  protected deviceDetection = inject(DeviceDetectionService);
}
