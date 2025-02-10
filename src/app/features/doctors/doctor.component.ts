import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { DoctorResponse } from '../../core/models/doctor.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-doctor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doctor.component.html',
})
export class DoctorComponent implements OnInit {
  doctors: DoctorResponse[] = [];
  isLoading = true;
  error: string | null = null;
  currentPage = 0;
  totalPages = 1;
  itemsPerPage = 8;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadDoctors();
  }

  loadDoctors() {
    this.isLoading = true;
    this.error = null;

    this.apiService
      .get<any>(
        `/api/doctors?page=${this.currentPage}&size=${this.itemsPerPage}`
      )
      .subscribe({
        next: (response) => {
          this.doctors = response.content;
          this.totalPages = response.totalPages;
          this.currentPage = response.number;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching doctors:', error);
          this.toastr.error('Failed to load doctors. Please try again later.');
          this.error = 'Failed to load doctors. Please try again later.';
          this.isLoading = false;
        },
      });
  }

  navigateToNewDoctor() {
    this.router.navigate(['/doctor/new']);
  }

  editDoctor(id: number) {
    this.router.navigate(['/doctor/edit', id]);
  }

  deleteDoctor(id: number) {
    const doctor = this.doctors.find((d) => d.id === id);
    if (!doctor) return;

    if (
      window.confirm(`Are you sure you want to delete doctor "${doctor.name}"?`)
    ) {
      this.apiService.delete(`/api/doctors/${id}`).subscribe({
        next: () => {
          this.toastr.success('Doctor deleted successfully');
          this.doctors = this.doctors.filter((d) => d.id !== id);
          if (this.doctors.length === 0 && this.currentPage > 0) {
            this.changePage(this.currentPage - 1);
          } else {
            this.loadDoctors();
          }
        },
        error: (error) => {
          console.error('Error deleting doctor:', error);
          this.toastr.error(
            error.error?.message ||
              'Failed to delete doctor. Please try again.',
            'Error'
          );
        },
      });
    }
  }

  changePage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadDoctors();
      window.scrollTo(0, 0);
    }
  }

  getDays(schedule: { [key: string]: string }): string[] {
    return Object.keys(schedule);
  }
}
