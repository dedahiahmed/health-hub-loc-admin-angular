import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service'; // Assuming you're using ngx-cookie-service

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent {
  isSidebarOpen = false;

  constructor(private cookieService: CookieService, private router: Router) {}

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout() {
    this.cookieService.delete('token');
    this.router.navigate(['/login']);
  }
}
