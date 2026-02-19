import {
  Component, Input, Output, EventEmitter,
  OnChanges, SimpleChanges, inject, OnInit, Injectable,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder, FormGroup, FormControl,
  Validators, AbstractControl, ValidationErrors
} from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import {
  NgbDatepickerModule,
  NgbDateStruct,
  NgbDateParserFormatter,
} from '@ng-bootstrap/ng-bootstrap';
import { WorkOrderDocument, WorkOrderStatus } from 'src/app/core/models';
import { WorkOrderService } from 'src/app/core/services/work-order.service';
import { ToastService } from 'src/app/core/services/toast.service';

/**
 * Custom formatter — displays dates as MM.DD.YYYY
 */
@Injectable()
export class CustomDateParserFormatter extends NgbDateParserFormatter {
  parse(value: string): NgbDateStruct | null {
    if (!value) return null;
    const parts = value.trim().split('.');
    if (parts.length !== 3) return null;
    const [mm, dd, yyyy] = parts.map(Number);
    if (isNaN(mm) || isNaN(dd) || isNaN(yyyy)) return null;
    return { year: yyyy, month: mm, day: dd };
  }

  format(date: NgbDateStruct | null): string {
    if (!date) return '';
    return `${String(date.month).padStart(2, '0')}.${String(date.day).padStart(2, '0')}.${date.year}`;
  }
}

/**
 * Cross-field validator: end must be strictly after start.
 */
function endDateAfterStart(group: AbstractControl): ValidationErrors | null {
  const start = group.get('startDate')?.value as NgbDateStruct | null;
  const end   = group.get('endDate')?.value   as NgbDateStruct | null;
  if (!start || !end) return null;
  const s = new Date(start.year, start.month - 1, start.day);
  const e = new Date(end.year,   end.month - 1,   end.day);
  return e.getTime() > s.getTime() ? null : { endBeforeStart: true };
}

@Component({
  selector: 'app-work-order-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule, NgbDatepickerModule],
  templateUrl: './work-order-panel.component.html',
  styleUrls: ['./work-order-panel.component.scss'],
  providers: [
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
  ]
})
export class WorkOrderPanelComponent implements OnChanges, OnInit {
  @Input() isOpen       = false;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() order: WorkOrderDocument | null = null;
  @Input() workCenterId: string | null = null;
  @Input() startDate: Date | null = null;
  @Output() close = new EventEmitter<void>();

  private fb        = inject(FormBuilder);
  private woService = inject(WorkOrderService);
  private toastService = inject(ToastService);

  form!: FormGroup;
  errorMessage = '';

  // ── Inline picker visibility flags ────────────────────────────
  startPickerOpen = false;
  endPickerOpen   = false;

  // ── Expose form controls for template binding ─────────────────
  get startDateControl(): FormControl<NgbDateStruct | null> {
    return this.form?.get('startDate') as FormControl<NgbDateStruct | null>;
  }
  get endDateControl(): FormControl<NgbDateStruct | null> {
    return this.form?.get('endDate') as FormControl<NgbDateStruct | null>;
  }

  readonly statusOptions: { value: WorkOrderStatus; label: string }[] = [
    { value: 'open',        label: 'Open'        },
    { value: 'in-progress', label: 'In progress' },
    { value: 'complete',    label: 'Complete'    },
    { value: 'blocked',     label: 'Blocked'     },
  ];

  ngOnInit(): void {
    this._buildForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      if (this.isOpen) {
        this.errorMessage = '';
        this.startPickerOpen = false;
        this.endPickerOpen   = false;
        if (!this.form) this._buildForm();

        if (this.mode === 'edit' && this.order) {
          this.form.patchValue({
            name:      this.order.data.name,
            status:    this.order.data.status,
            startDate: this._isoToNgbDate(this.order.data.startDate),
            endDate:   this._isoToNgbDate(this.order.data.endDate),
          });
        } else {
          const start = this.startDate ?? new Date();
          const end   = new Date(start);
          end.setDate(end.getDate() + 7);
          this.form.reset({
            name:      '',
            status:    'open',
            startDate: this._dateToNgbDate(start),
            endDate:   this._dateToNgbDate(end),
          });
        }
        this.form.markAsPristine();
        this.form.markAsUntouched();
      } else {
        // Panel closing — close any open pickers
        this.startPickerOpen = false;
        this.endPickerOpen   = false;
      }
    }
  }

  // ── Date formatting for display input ─────────────────────────
  formatDate(date: NgbDateStruct | null): string {
    if (!date) return '';
    return `${String(date.month).padStart(2, '0')}.${String(date.day).padStart(2, '0')}.${date.year}`;
  }

  // ── Picker toggles ─────────────────────────────────────────────
  toggleStartPicker(): void {
    this.startPickerOpen = !this.startPickerOpen;
    if (this.startPickerOpen) {
      this.endPickerOpen = false;
    }
  }

  toggleEndPicker(): void {
    this.endPickerOpen = !this.endPickerOpen;
    if (this.endPickerOpen) {
      this.startPickerOpen = false;
    }
  }

  onStartDateSelect(date: NgbDateStruct): void {
    this.startDateControl.setValue(date);
    this.startDateControl.markAsDirty();
    this.startDateControl.markAsTouched();
    this.startPickerOpen = false;
  }

  onEndDateSelect(date: NgbDateStruct): void {
    this.endDateControl.setValue(date);
    this.endDateControl.markAsDirty();
    this.endDateControl.markAsTouched();
    this.endPickerOpen = false;
  }

  // ── Status helpers ─────────────────────────────────────────────
  getStatusLabel(value: WorkOrderStatus): string {
    return this.statusOptions.find(o => o.value === value)?.label ?? value;
  }

  // ── Panel actions ──────────────────────────────────────────────
  onBackdropClick(): void {
    this.startPickerOpen = false;
    this.endPickerOpen   = false;
    this.close.emit();
  }

  onCancel(): void {
    this.startPickerOpen = false;
    this.endPickerOpen   = false;
    this.close.emit();
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      if      (this.form.get('name')?.hasError('required')) this.errorMessage = 'Work order name is required.';
      else if (!this.form.get('startDate')?.value)          this.errorMessage = 'Start date is required.';
      else if (!this.form.get('endDate')?.value)            this.errorMessage = 'End date is required.';
      else if (this.form.hasError('endBeforeStart'))        this.errorMessage = 'End date must be after start date.';
      return;
    }

    const { name, status, startDate, endDate } = this.form.value;
    const startIso = this._ngbDateToIso(startDate as NgbDateStruct);
    const endIso   = this._ngbDateToIso(endDate   as NgbDateStruct);

    const candidateWorkCenterId =
      this.mode === 'edit' && this.order
        ? this.order.data.workCenterId
        : (this.workCenterId || '');

    const candidate: WorkOrderDocument = {
      docId:   this.mode === 'edit' && this.order ? this.order.docId : 'wo-' + Date.now(),
      docType: 'workOrder',
      data: {
        name:         (name as string).trim(),
        workCenterId: candidateWorkCenterId,
        status,
        startDate:    startIso,
        endDate:      endIso,
      },
    };

    const ignoreId = this.mode === 'edit' && this.order ? this.order.docId : undefined;
    if (this.woService.overlaps(candidate, ignoreId)) {
      this.errorMessage = 'This work order overlaps with an existing order on the same work center. Please adjust the dates.';
      return;
    }

    if (this.mode === 'create') {
      this.woService.create(candidate);
      this.toastService.success(`Work order "${candidate.data.name}" created successfully`);
    } else {
      this.woService.update(candidate);
      this.toastService.success(`Work order "${candidate.data.name}" updated successfully`);
    }
    
    this.close.emit();
  }

  // ── Private helpers ────────────────────────────────────────────
  private _buildForm(): void {
    this.form = this.fb.group(
      {
        name:      ['',   [Validators.required, Validators.minLength(1)]],
        status:    ['open' as WorkOrderStatus, Validators.required],
        startDate: [null  as NgbDateStruct | null, Validators.required],
        endDate:   [null  as NgbDateStruct | null, Validators.required],
      },
      { validators: endDateAfterStart }
    );
  }

  private _isoToNgbDate(iso: string): NgbDateStruct {
    const [year, month, day] = iso.split('-').map(Number);
    return { year, month, day };
  }

  private _dateToNgbDate(d: Date): NgbDateStruct {
    return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
  }

  private _ngbDateToIso(d: NgbDateStruct): string {
    return `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
  }
}