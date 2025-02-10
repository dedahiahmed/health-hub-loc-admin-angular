import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { extractLabel } from '../../core/helpers/extractLabel';
import { wilayaOptions } from '../../core/arrays/wilayaOptions';
import { moughataaOptions } from '../../core/arrays/moughataaOptions';
import { ToastrService } from 'ngx-toastr';

interface Pharmacy {
  id: number;
  name: string;
  longitude: number;
  latitude: number;
  willaya: string;
  moughataa: string;
  img: string | null;
  openTonight: boolean;
}

export interface PageableSort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface PageableResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: PageableSort;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  sort: PageableSort;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

@Component({
  selector: 'app-pharmacy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pharmacy.component.html',
})
export class PharmacyComponent implements OnInit {
  pharmacies: Pharmacy[] = [];
  isLoading = true;
  error: string | null = null;
  currentPage = 0;
  totalPages = 1;
  itemsPerPage = 8;
  totalElements = 0;
  protected readonly extractLabel = extractLabel;
  protected readonly wilayaOptions = wilayaOptions;
  protected readonly moughataaOptions = moughataaOptions;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadPharmacies();
  }

  loadPharmacies() {
    this.isLoading = true;
    this.error = null;

    this.apiService
      .get<PageableResponse<Pharmacy>>(
        `/api/pharmacies?page=${this.currentPage}&size=${this.itemsPerPage}`
      )
      .subscribe({
        next: (response) => {
          this.pharmacies = response.content;
          this.totalPages = response.totalPages;
          this.currentPage = response.number;
          this.itemsPerPage = response.size;
          this.totalElements = response.totalElements;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching pharmacies:', error);
          this.toastr.error(
            'Failed to load pharmacies. Please try again later.'
          );
          this.error = 'Failed to load pharmacies. Please try again later.';
          this.isLoading = false;
        },
      });
  }

  navigateToNewPharmacy() {
    this.router.navigate(['/pharmacy/new']);
  }

  editPharmacy(id: number) {
    this.router.navigate(['/pharmacy/edit', id]);
  }

  deletePharmacy(id: number) {
    const pharmacy = this.pharmacies.find((p) => p.id === id);
    if (!pharmacy) return;

    if (
      window.confirm(
        `Are you sure you want to delete pharmacy "${pharmacy.name}"?`
      )
    ) {
      this.apiService.delete(`/api/pharmacies/${id}`).subscribe({
        next: () => {
          this.toastr.success('Pharmacy deleted successfully');
          this.pharmacies = this.pharmacies.filter((p) => p.id !== id);
          if (this.pharmacies.length === 0 && this.currentPage > 0) {
            this.changePage(this.currentPage - 1);
          } else {
            this.loadPharmacies();
          }
        },
        error: (error) => {
          console.error('Error deleting pharmacy:', error);
          this.toastr.error(
            error.error?.message ||
              'Failed to delete pharmacy. Please try again.',
            'Error'
          );
        },
      });
    }
  }

  changePage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadPharmacies();
      window.scrollTo(0, 0);
    }
  }
}
