import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get the auth token from localStorage
    const authToken = localStorage.getItem('authToken');
    const tokenType = localStorage.getItem('tokenType') || 'bearer';

    console.log('=== AUTH INTERCEPTOR DEBUG ===');
    console.log('Request URL:', req.url);
    console.log('Request Method:', req.method);
    console.log('Auth token:', authToken);
    console.log('Token type:', tokenType);
    console.log('Token length:', authToken?.length);
    console.log('Is logged in:', localStorage.getItem('isLoggedIn'));
    console.log('All localStorage keys:', Object.keys(localStorage));

    // Clone the request and add the authorization header if token exists
    if (authToken) {
      const authorizationHeader = `${tokenType} ${authToken}`;
      const authReq = req.clone({
        headers: req.headers.set('Authorization', authorizationHeader)
      });

      console.log('AuthInterceptor - Added Authorization header:', authorizationHeader);
      console.log('AuthInterceptor - All request headers:', authReq.headers.keys());
      console.log('AuthInterceptor - Authorization header value:', authReq.headers.get('Authorization'));
      console.log('=== END AUTH INTERCEPTOR DEBUG ===');

      return next.handle(authReq);
    }

    console.log('AuthInterceptor - No token found, proceeding without auth');
    console.log('=== END AUTH INTERCEPTOR DEBUG ===');
    // If no token, proceed with the original request
    return next.handle(req);
  }
}
