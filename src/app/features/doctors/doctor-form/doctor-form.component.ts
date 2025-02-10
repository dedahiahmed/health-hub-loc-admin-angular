// doctor-form.component.ts
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
import {
  DoctorCreateRequest,
  DoctorResponse,
} from '../../../core/models/doctor.model';

interface Cabinet {
  id: number;
  nom: string;
}

@Component({
  selector: 'app-doctor-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './doctor-form.component.html',
})
export class DoctorFormComponent implements OnInit {
  doctorForm!: FormGroup;
  isLoading = false;
  error: string | null = null;
  isEditMode = false;
  doctorId: number | null = null;
  cabinets: Cabinet[] = [];
  weekDays = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  specialities = [
    'CARDIOLOGIE',
    'DERMATOLOGIE',
    'PEDIATRIE',
    'GYNECOLOGIE',
    'NEUROLOGIE',
    'ONCOLOGIE',
    'ORTHOPEDIE',
    'OPHTALMOLOGIE',
    'RADIOLOGIE',
    'UROLOGIE',
  ];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    public router: Router,
    private route: ActivatedRoute
  ) {
    this.initForm();
  }

  private initForm() {
    this.doctorForm = this.fb.group({
      name: ['', [Validators.required]],
      speciality: ['', [Validators.required]],
      cabinetId: ['', [Validators.required]],
      schedule: this.fb.group(
        this.weekDays.reduce((acc, day) => ({ ...acc, [day]: [''] }), {})
      ),
    });
  }

  ngOnInit(): void {
    this.loadCabinets();
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEditMode = true;
        this.doctorId = +params['id'];
        this.loadDoctorData();
      }
    });
  }

  loadCabinets() {
    // Using a large page size to get all cabinets
    this.apiService.get<any>('/api/cabinets?page=0&size=1000000').subscribe({
      next: (response) => {
        this.cabinets = response.content;
      },
      error: (error) => {
        console.error('Error loading cabinets:', error);
        this.error = 'Failed to load cabinets';
      },
    });
  }

  loadDoctorData() {
    if (!this.doctorId) return;

    this.isLoading = true;
    this.apiService
      .get<DoctorResponse>(`/api/doctors/${this.doctorId}`)
      .subscribe({
        next: (doctor) => {
          this.doctorForm.patchValue({
            name: doctor.name,
            speciality: doctor.speciality,
            cabinetId: doctor.cabinetId,
            schedule: doctor.schedule,
          });
          this.isLoading = false;
        },
        error: (error) => {
          this.error = 'Failed to load doctor data';
          console.error('Error loading doctor:', error);
          this.isLoading = false;
        },
      });
  }

  onSubmit() {
    if (this.doctorForm.valid) {
      this.isLoading = true;
      this.error = null;

      const formData: DoctorCreateRequest = {
        name: this.doctorForm.value.name,
        speciality: this.doctorForm.value.speciality,
        schedule: this.doctorForm.value.schedule,
        cabinetId: parseInt(this.doctorForm.value.cabinetId),
      };

      const request = this.isEditMode
        ? this.apiService.put(`/api/doctors/${this.doctorId}`, formData)
        : this.apiService.post('/api/doctors', formData);

      request.subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/doctor']);
        },
        error: (error) => {
          this.isLoading = false;
          this.error =
            error?.error?.message ||
            `Failed to ${this.isEditMode ? 'update' : 'create'} doctor`;
          console.error('Error saving doctor:', error);
        },
      });
    }
  }

  getFieldError(fieldName: string): string {
    const control = this.doctorForm.get(fieldName);
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
