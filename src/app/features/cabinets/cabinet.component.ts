// cabinet.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { extractLabel } from '../../core/helpers/extractLabel';
import { wilayaOptions } from '../../core/arrays/wilayaOptions';
import { moughataaOptions } from '../../core/arrays/moughataaOptions';

interface Cabinet {
  id: number;
  nom: string;
  longitude: number;
  latitude: number;
  willaya: string;
  moughataa: string;
  img: string;
}

interface PageableResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

@Component({
  selector: 'app-cabinet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cabinet.component.html',
})
export class CabinetComponent implements OnInit {
  cabinets: Cabinet[] = [];
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
    this.loadCabinets();
  }

  loadCabinets() {
    this.isLoading = true;
    this.error = null;

    this.apiService
      .get<PageableResponse<Cabinet>>(
        `/api/cabinets?page=${this.currentPage}&size=${this.itemsPerPage}`
      )
      .subscribe({
        next: (response) => {
          this.cabinets = response.content.map((cabinet) => ({
            ...cabinet,
            img: 'https://firebasestorage.googleapis.com/v0/b/health-hub-loc-828d4.appspot.com/o/pharmacy-sign-uk-D9C3RR.jpg?alt=media&token=1ff94864-b3a3-48ef-9b43-0e2e74c14834',
          }));
          this.totalPages = response.totalPages;
          this.currentPage = response.number;
          this.itemsPerPage = response.size;
          this.totalElements = response.totalElements;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching cabinets:', error);
          this.error = 'Failed to load cabinets. Please try again later.';
          this.isLoading = false;
        },
      });
  }

  navigateToNewCabinet() {
    this.router.navigate(['/cabinet/new']);
  }

  editCabinet(id: number) {
    this.router.navigate(['/cabinet/edit', id]);
  }

  deleteCabinet(id: number) {
    if (confirm('Are you sure you want to delete this cabinet?')) {
      this.apiService.delete(`/api/cabinets/${id}`).subscribe({
        next: () => {
          this.cabinets = this.cabinets.filter((c) => c.id !== id);
          if (this.cabinets.length === 0 && this.currentPage > 0) {
            this.changePage(this.currentPage - 1);
          } else {
            this.loadCabinets();
          }
        },
        error: (error) => {
          console.error('Error deleting cabinet:', error);
          alert('Failed to delete cabinet. Please try again.');
        },
      });
    }
  }

  changePage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadCabinets();
      window.scrollTo(0, 0);
    }
  }
}
