import { ApplicationConfig } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./public-landing.component').then(m => m.PublicLandingComponent)
  },
  {
    path: 'dashboard',
    // lazy-load the timeline container component to defer heavy UI code until needed
    loadComponent: () => import('./features/timeline/components/timeline-container/timeline-container.component').then(m => m.TimelineContainerComponent)
  }
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync()
  ]
};
