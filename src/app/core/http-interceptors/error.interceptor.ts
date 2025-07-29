import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Unauthorized - redirect to login
          console.error('Unauthorized access attempt. Redirecting to login.');
          localStorage.removeItem('authToken');
          localStorage.removeItem('tokenType');
          localStorage.removeItem('isLoggedIn');
          this.router.navigate(['/login']);
        } else if (error.status === 403) {
          // Forbidden - user doesn't have permission
          console.error('Forbidden access attempt.');
          // You could redirect to an access denied page or show a notification
        } else if (error.status === 404) {
          // Not found
          console.error('Resource not found:', req.url);
        } else if (error.status === 500) {
          // Server error
          console.error('Server error occurred:', error.message);
        } else {
          // Other errors
          console.error('HTTP error occurred:', error);
        }

        // Return the error for further handling
        return throwError(() => error);
      })
    );
  }
}
