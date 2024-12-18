import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { wilayaOptions } from '../../../core/arrays/wilayaOptions';
import { moughataaOptions } from '../../../core/arrays/moughataaOptions';

interface Pharmacy {
  id: number;
  name: string;
  longitude: number;
  latitude: number;
  willaya: string;
  moughataa: string;
  img: string | null;
  isOpenTonight: boolean;
}

@Component({
  selector: 'app-pharmacy-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pharmacy-form.component.html',
})
export class PharmacyFormComponent implements OnInit {
  pharmacyForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  isEditMode = false;
  pharmacyId: number | null = null;

  wilayaOptions = wilayaOptions;
  moughataaOptions = moughataaOptions;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    public router: Router,
    private route: ActivatedRoute
  ) {
    this.pharmacyForm = this.fb.group({
      name: ['', [Validators.required]],
      longitude: [null, [Validators.required]],
      latitude: [null, [Validators.required]],
      willaya: ['', [Validators.required]],
      moughataa: ['', [Validators.required]],
      isOpenTonight: [false],
    });
  }

  ngOnInit(): void {
    // Check if we're in edit mode by looking for an ID parameter
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEditMode = true;
        this.pharmacyId = +params['id'];
        this.loadPharmacyData();
      }
    });
  }

  loadPharmacyData() {
    if (!this.pharmacyId) return;

    this.isLoading = true;
    this.apiService
      .get<Pharmacy>(`/api/pharmacies/${this.pharmacyId}`)
      .subscribe({
        next: (pharmacy) => {
          this.pharmacyForm.patchValue({
            name: pharmacy.name,
            longitude: pharmacy.longitude,
            latitude: pharmacy.latitude,
            willaya: pharmacy.willaya,
            moughataa: pharmacy.moughataa,
            isOpenTonight: pharmacy.isOpenTonight,
          });
          this.isLoading = false;
        },
        error: (error) => {
          this.error = 'Failed to load pharmacy data. Please try again.';
          console.error('Error loading pharmacy:', error);
          this.isLoading = false;
        },
      });
  }

  onSubmit() {
    if (this.pharmacyForm.valid) {
      this.isLoading = true;
      this.error = null;

      const formData = {
        ...this.pharmacyForm.value,
        isOpenTonight: Boolean(this.pharmacyForm.value.isOpenTonight),
      };

      // Choose between update and create based on mode
      const request = this.isEditMode
        ? this.apiService.put(`/api/pharmacies/${this.pharmacyId}`, formData)
        : this.apiService.post('/api/pharmacies', formData);

      request.subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/pharmacy']);
        },
        error: (error) => {
          this.isLoading = false;
          this.error =
            error?.error?.message ||
            `Failed to ${
              this.isEditMode ? 'update' : 'create'
            } pharmacy. Please try again.`;
          console.error(
            `Error ${this.isEditMode ? 'updating' : 'creating'} pharmacy:`,
            error
          );
        },
      });
    } else {
      Object.keys(this.pharmacyForm.controls).forEach((key) => {
        const control = this.pharmacyForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  getFieldError(fieldName: string): string {
    const control = this.pharmacyForm.get(fieldName);
    if (control?.invalid && control?.touched) {
      if (control.errors?.['required']) {
        return `${
          fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
        } is required`;
      }
    }
    return '';
  }

  getBoolean(value: any): boolean {
    return Boolean(value);
  }
}
