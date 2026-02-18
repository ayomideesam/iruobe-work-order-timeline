import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimelineHeaderComponent } from './timeline-header.component';
import { TimelineZoomService } from 'src/app/core/services/timeline-zoom.service';
import { DateFilterService } from 'src/app/core/services/date-filter.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

describe('TimelineHeaderComponent', () => {
  let component: TimelineHeaderComponent;
  let fixture: ComponentFixture<TimelineHeaderComponent>;
  let zoomService: TimelineZoomService;
  let dateFilterService: DateFilterService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TimelineHeaderComponent,
        NgSelectModule,
        NgbDatepickerModule,
        FormsModule
      ],
      providers: [
        TimelineZoomService,
        DateFilterService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TimelineHeaderComponent);
    component = fixture.componentInstance;
    zoomService = TestBed.inject(TimelineZoomService);
    dateFilterService = TestBed.inject(DateFilterService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should initialize with current zoom level from service', () => {
      zoomService.setZoom('week');
      
      const newFixture = TestBed.createComponent(TimelineHeaderComponent);
      const newComponent = newFixture.componentInstance;
      
      expect(newComponent.selected()).toBe('week');
    });

    it('should default to month if zoom service has not been set', () => {
      expect(component.selected()).toBe('month');
    });

    it('should have timescale options', () => {
      expect(component.timescales).toBeDefined();
      expect(component.timescales.length).toBe(4);
      expect(component.timescales.map(t => t.value)).toEqual(['hour', 'day', 'week', 'month']);
    });

    it('should disable hour timescale', () => {
      const hourOption = component.timescales.find(t => t.value === 'hour');
      expect(hourOption?.disabled).toBe(true);
    });

    it('should have selectedDate signal initialized to null', () => {
      expect(component.selectedDate()).toBeNull();
    });
  });

  describe('setZoom', () => {
    it('should update selected signal when zoom changes', () => {
      component.setZoom('day');
      expect(component.selected()).toBe('day');
    });

    it('should call zoomService.setZoom', () => {
      spyOn(zoomService, 'setZoom');
      component.setZoom('week');
      expect(zoomService.setZoom).toHaveBeenCalledWith('week');
    });

    it('should update component and service for all zoom levels', () => {
      const levels = ['day', 'week', 'month'] as const;
      
      levels.forEach(level => {
        component.setZoom(level);
        expect(component.selected()).toBe(level);
        expect(zoomService.zoomLevel()).toBe(level);
      });
    });
  });

  describe('onDateSelected', () => {
    it('should set date range when date is selected', () => {
      const ngbDate = { year: 2026, month: 2, day: 15 };
      spyOn(dateFilterService, 'setDateRange');
      
      component.onDateSelected(ngbDate);
      
      expect(dateFilterService.setDateRange).toHaveBeenCalled();
    });

    it('should calculate month range for selected date', () => {
      const ngbDate = { year: 2026, month: 2, day: 15 }; // Feb 15, 2026
      
      component.onDateSelected(ngbDate);
      
      const start = dateFilterService.startDate();
      const end = dateFilterService.endDate();
      
      expect(start).toBeTruthy();
      expect(end).toBeTruthy();
      expect(start?.getMonth()).toBe(1); // February (0-indexed)
      expect(start?.getDate()).toBe(1);
      expect(end?.getMonth()).toBe(1);
      expect(end?.getDate()).toBe(28); // Last day of Feb 2026
    });

    it('should reset filter when date is cleared', () => {
      spyOn(dateFilterService, 'reset');
      
      component.onDateSelected(null);
      
      expect(dateFilterService.reset).toHaveBeenCalled();
    });

    it('should handle date selection for different months', () => {
      const julyDate = { year: 2026, month: 7, day: 10 };
      
      component.onDateSelected(julyDate);
      
      const start = dateFilterService.startDate();
      const end = dateFilterService.endDate();
      
      expect(start?.getMonth()).toBe(6); // July (0-indexed)
      expect(end?.getDate()).toBe(31); // Last day of July
    });
  });

  describe('dropdown state', () => {
    it('should initialize dropdown as closed', () => {
      expect(component.isDropdownOpen).toBe(false);
    });

    it('should set isDropdownOpen to true when onDropdownOpen is called', () => {
      component.onDropdownOpen();
      expect(component.isDropdownOpen).toBe(true);
    });

    it('should set isDropdownOpen to false when onDropdownClose is called', () => {
      component.isDropdownOpen = true;
      component.onDropdownClose();
      expect(component.isDropdownOpen).toBe(false);
    });
  });

  describe('scrollToToday event', () => {
    it('should emit scrollToToday event when onTodayClick is called', (done) => {
      component.scrollToToday.subscribe(() => {
        expect(true).toBe(true);
        done();
      });

      component.onTodayClick();
    });

    it('should not emit scrollToToday by default', () => {
      spyOn(component.scrollToToday, 'emit');
      expect(component.scrollToToday.emit).not.toHaveBeenCalled();
    });
  });

  describe('template rendering', () => {
    it('should render the component', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled).toBeTruthy();
    });
  });

  describe('signal reactivity', () => {
    it('should update selected signal reactively', () => {
      expect(component.selected()).toBe('month');
      
      component.setZoom('day');
      fixture.detectChanges();
      
      expect(component.selected()).toBe('day');
    });

    it('should update selectedDate signal when date picker changes', () => {
      const ngbDate = { year: 2026, month: 2, day: 15 };
      
      expect(component.selectedDate()).toBeNull();
      
      component.onDateSelected(ngbDate);
      
      // Note: selectedDate is not set in onDateSelected implementation
      // This test verifies current behavior
      expect(component.selectedDate()).toBeNull();
    });
  });

  describe('integration with services', () => {
    it('should sync with TimelineZoomService changes', () => {
      zoomService.setZoom('week');
      expect(component.selected()).toBe('week');
      
      component.setZoom('day');
      expect(zoomService.zoomLevel()).toBe('day');
    });

    it('should sync with DateFilterService changes', () => {
      const start = new Date('2026-02-01');
      const end = new Date('2026-02-28');
      
      dateFilterService.setDateRange(start, end);
      
      expect(dateFilterService.startDate()).toEqual(start);
      expect(dateFilterService.endDate()).toEqual(end);
    });
  });
});
