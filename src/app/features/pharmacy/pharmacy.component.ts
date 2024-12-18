import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { extractLabel } from '../../core/helpers/extractLabel';
import { wilayaOptions } from '../../core/arrays/wilayaOptions';
import { moughataaOptions } from '../../core/arrays/moughataaOptions';

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

interface PageableSort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

interface PageableResponse<T> {
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
  constructor(private apiService: ApiService, private router: Router) {}

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
          console.log('Backend Response:', response);

          this.pharmacies = response.content;
          this.totalPages = response.totalPages;
          this.currentPage = response.number;
          this.itemsPerPage = response.size;
          this.totalElements = response.totalElements;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching pharmacies:', error);
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
    if (confirm('Are you sure you want to delete this pharmacy?')) {
      this.apiService.delete(`/api/pharmacies/${id}`).subscribe({
        next: () => {
          this.pharmacies = this.pharmacies.filter((p) => p.id !== id);
          // If we deleted the last item on the page, go to previous page
          if (this.pharmacies.length === 0 && this.currentPage > 0) {
            this.changePage(this.currentPage - 1);
          } else {
            this.loadPharmacies();
          }
        },
        error: (error) => {
          console.error('Error deleting pharmacy:', error);
          alert('Failed to delete pharmacy. Please try again.');
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
