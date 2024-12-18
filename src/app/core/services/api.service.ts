import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'https://api.dedahi.com/location';

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private router: Router
  ) {}

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');

    const token = this.cookieService.get('token');
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  get<T>(endpoint: string): Observable<T> {
    const token = this.cookieService.get('token');
    if (!token) {
      this.router.navigate(['/login']);
      return new Observable();
    }

    console.log('Making GET request to:', `${this.baseUrl}${endpoint}`);
    console.log('With headers:', this.getHeaders().keys());

    return this.http
      .get<T>(`${this.baseUrl}${endpoint}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap({
          next: (response) => console.log('API Response:', response),
          error: (error) => console.error('API Error:', error),
        })
      );
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body, {
      headers: this.getHeaders(),
    });
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    const token = this.cookieService.get('token');
    if (!token) {
      this.router.navigate(['/login']);
      return new Observable();
    }
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, body, {
      headers: this.getHeaders(),
    });
  }

  delete<T>(endpoint: string): Observable<T> {
    const token = this.cookieService.get('token');
    if (!token) {
      this.router.navigate(['/login']);
      return new Observable();
    }
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders(),
    });
  }

  patch<T>(endpoint: string, body: any): Observable<T> {
    const token = this.cookieService.get('token');
    if (!token) {
      this.router.navigate(['/login']);
      return new Observable();
    }
    return this.http.patch<T>(`${this.baseUrl}${endpoint}`, body, {
      headers: this.getHeaders(),
    });
  }
}
