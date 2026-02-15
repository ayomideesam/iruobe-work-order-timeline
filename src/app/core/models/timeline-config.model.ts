import { ZoomLevel } from './zoom-level.type';

export interface TimelineConfig {
  zoom: ZoomLevel;
  visibleStart?: string; // ISO date
  visibleEnd?: string;   // ISO date
}
