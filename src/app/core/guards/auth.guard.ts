import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable, map, catchError, of } from 'rxjs';
import { ApiService } from '../services/api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(private router: Router, private apiService: ApiService) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.apiService.get<boolean>('/api/auth/check-admin').pipe(
      map((response) => {
        return response === true ? true : this.router.createUrlTree(['/login']);
      }),
      catchError(() => {
        return of(this.router.createUrlTree(['/login']));
      })
    );
  }
}
