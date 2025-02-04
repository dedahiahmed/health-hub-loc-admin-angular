// cabinet-form.component.ts
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

interface Cabinet {
  id: number;
  nom: string;
  longitude: number;
  latitude: number;
  willaya: string;
  moughataa: string;
  img: string;
}

@Component({
  selector: 'app-cabinet-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cabinet-form.component.html',
})
export class CabinetFormComponent implements OnInit {
  cabinetForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  isEditMode = false;
  cabinetId: number | null = null;
  wilayaOptions = wilayaOptions;
  moughataaOptions = moughataaOptions;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    public router: Router,
    private route: ActivatedRoute
  ) {
    this.cabinetForm = this.fb.group({
      nom: ['', [Validators.required]],
      longitude: [null, [Validators.required]],
      latitude: [null, [Validators.required]],
      willaya: ['', [Validators.required]],
      moughataa: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEditMode = true;
        this.cabinetId = +params['id'];
        this.loadCabinetData();
      }
    });
  }

  loadCabinetData() {
    if (!this.cabinetId) return;

    this.isLoading = true;
    this.apiService.get<Cabinet>(`/api/cabinets/${this.cabinetId}`).subscribe({
      next: (cabinet) => {
        this.cabinetForm.patchValue({
          nom: cabinet.nom,
          longitude: cabinet.longitude,
          latitude: cabinet.latitude,
          willaya: cabinet.willaya,
          moughataa: cabinet.moughataa,
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to load cabinet data. Please try again.';
        console.error('Error loading cabinet:', error);
        this.isLoading = false;
      },
    });
  }

  onSubmit() {
    if (this.cabinetForm.valid) {
      this.isLoading = true;
      this.error = null;

      const formData = {
        ...this.cabinetForm.value,
      };

      const request = this.isEditMode
        ? this.apiService.put(`/api/cabinets/${this.cabinetId}`, formData)
        : this.apiService.post('/api/cabinets', formData);

      request.subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/cabinet']);
        },
        error: (error) => {
          this.isLoading = false;
          this.error =
            error?.error?.message ||
            `Failed to ${
              this.isEditMode ? 'update' : 'create'
            } cabinet. Please try again.`;
          console.error(
            `Error ${this.isEditMode ? 'updating' : 'creating'} cabinet:`,
            error
          );
        },
      });
    } else {
      Object.keys(this.cabinetForm.controls).forEach((key) => {
        const control = this.cabinetForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  getFieldError(fieldName: string): string {
    const control = this.cabinetForm.get(fieldName);
    if (control?.invalid && control?.touched) {
      if (control.errors?.['required']) {
        return `${
          fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
        } is required`;
      }
    }
    return '';
  }
}
