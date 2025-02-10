import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { ApiService } from '../../core/services/api.service';

import { ToastrService } from 'ngx-toastr';

interface Pharmacy {
  id: number;

  name: string;

  isSelected?: boolean;
}

interface BulkUpdateResponse {
  success: boolean;

  message: string;
}

@Component({
  selector: 'app-garde',

  standalone: true,

  imports: [CommonModule, FormsModule],

  templateUrl: './garde.component.html',
})
export class GardeComponent implements OnInit {
  pharmacies: Pharmacy[] = [];

  isLoading = false;

  error: string | null = null;

  selectAll = false;

  openTonight = false;

  constructor(
    private apiService: ApiService,

    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadPharmacies();
  }

  loadPharmacies() {
    this.isLoading = true;

    this.apiService.get<any>('/api/pharmacies?page=0&size=1000000').subscribe({
      next: (response) => {
        this.pharmacies = response.content.map((pharmacy: any) => ({
          ...pharmacy,

          isSelected: false,
        }));

        this.isLoading = false;
      },

      error: (error) => {
        console.error('Error fetching pharmacies:', error);

        this.toastr.error('Failed to load pharmacies. Please try again later.');

        this.error = 'Failed to load pharmacies. Please try again later.';

        this.isLoading = false;
      },
    });
  }

  toggleSelectAll() {
    this.pharmacies = this.pharmacies.map((pharmacy) => ({
      ...pharmacy,

      isSelected: this.selectAll,
    }));
  }

  updateSelectedStatus() {
    const selectedPharmacyIds = this.pharmacies

      .filter((pharmacy) => pharmacy.isSelected)

      .map((pharmacy) => pharmacy.id);

    if (selectedPharmacyIds.length === 0) {
      this.toastr.warning('Please select at least one pharmacy');

      return;
    }

    const payload = {
      pharmacyIds: selectedPharmacyIds,

      openTonight: this.openTonight,
    };

    this.isLoading = true;

    this.apiService

      .patch<BulkUpdateResponse>('/api/pharmacies/open-status/bulk', payload)

      .subscribe({
        next: (response) => {
          if (response.success) {
            this.toastr.success(response.message);

            // Reset selections only on success

            this.selectAll = false;

            this.pharmacies = this.pharmacies.map((pharmacy) => ({
              ...pharmacy,

              isSelected: false,
            }));
          } else {
            this.toastr.error(response.message);
          }

          this.isLoading = false;
        },

        error: (error) => {
          console.error('Error updating open status:', error);

          this.toastr.error(
            error.error?.message || 'Failed to update open status'
          );

          this.isLoading = false;
        },
      });
  }

  updateSelectAllState() {
    this.selectAll = this.pharmacies.every((pharmacy) => pharmacy.isSelected);
  }
}
