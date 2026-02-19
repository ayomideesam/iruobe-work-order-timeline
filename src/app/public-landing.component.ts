import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DeviceWarningComponent } from './features/timeline/components/device-warning/device-warning.component';

@Component({
  selector: 'app-public-landing',
  standalone: true,
  imports: [CommonModule, DeviceWarningComponent],
  template: `
    <app-device-warning></app-device-warning>
    <div class="landing">
      <div class="content">
        <div class="card">
          <h1 class="title">Work Order Schedule Timeline</h1>
          <p class="subtitle">Frontend Technical Test — by IRUOBE AKHIGBE IRUOBE</p>
          <div class="actions">
            <button
              class="proceed-btn"
              (click)="proceed()"
              (mouseenter)="prefetch()"
              (focus)="prefetch()"
              type="button"
              aria-label="Proceed to dashboard">
              Proceed to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      width: 100%;
      min-height: 100vh;
      overflow-x: hidden;
    }

    .landing {
      width: 100%;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg);
      padding: 24px;
      box-sizing: border-box;
    }

    .content {
      width: 100%;
      max-width: 920px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .card {
      width: 100%;
      max-width: 460px;
      padding: 36px 40px;
      background: var(--surface);
      border-radius: var(--panel-radius);
      box-shadow: var(--card-shadow);
      text-align: center;
      box-sizing: border-box;
    }

    .title {
      font-family: var(--type-heading);
      font-weight: 400;
      font-size: 18px;
      margin: 0 0 6px 0;
      color: #1f2933;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    .subtitle {
      margin: 0 0 18px 0;
      color: var(--muted);
      font-size: 13px;
      letter-spacing: 0.2px;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    .actions {
      display: flex;
      justify-content: center;
      gap: 12px;
    }

    .proceed-btn {
      background: linear-gradient(180deg, var(--primary) 0%, var(--primary-600) 100%);
      color: #ffffff;
      border: none;
      padding: 10px 18px;
      border-radius: 999px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      transition: transform 0.14s ease, box-shadow 0.14s ease, background 0.14s ease;
      box-shadow: 0 6px 18px rgba(35, 127, 252, 0.14);
      display: inline-flex;
      align-items: center;
      gap: 10px;
    }

    .proceed-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 28px rgba(35, 127, 252, 0.18);
    }

    .proceed-btn:active {
      transform: translateY(0);
      box-shadow: 0 6px 18px rgba(35, 127, 252, 0.12);
    }

    .proceed-btn:focus-visible {
      outline: 3px solid rgba(35,127,252,0.14);
      outline-offset: 3px;
    }

    /* Tablet */
    @media (max-width: 768px) {
      .card {
        padding: 32px 36px;
      }
    }

    /* Mobile */
    @media (max-width: 600px) {
      .landing {
        padding: 16px;
      }
      
      .card {
        padding: 24px 20px;
      }
      
      .title {
        font-size: 16px;
      }
      
      .subtitle {
        font-size: 12px;
      }
    }

    /* Small mobile */
    @media (max-width: 375px) {
      .card {
        padding: 20px 16px;
      }
    }
  `]
})
export class PublicLandingComponent implements OnInit {
  private readonly router = inject(Router);
  private prefetchPromise: Promise<void> | null = null;

  ngOnInit(): void {
    setTimeout(() => this.prefetch(), 1500);
  }

  async proceed(): Promise<void> {
    await this.prefetch();
    await this.router.navigate(['/dashboard']);
  }

  prefetch(): Promise<void> {
    if (this.prefetchPromise) return this.prefetchPromise;

    this.prefetchPromise = import('./features/timeline/components/timeline-container/timeline-container.component')
      .then(() => {})
      .catch(() => {});

    return this.prefetchPromise;
  }
}