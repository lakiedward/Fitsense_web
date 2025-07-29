import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { User, AuthResponse } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends ApiService {

  /**
   * Authenticates a user and stores the JWT token
   * @param user User credentials (username and password)
   * @returns Observable with the authentication response
   */
  login(user: User): Observable<AuthResponse> {
    return this.post<AuthResponse>('users/token', user).pipe(
      tap(response => {
        localStorage.setItem('authToken', response.access_token);
        localStorage.setItem('tokenType', response.token_type);
        localStorage.setItem('isLoggedIn', 'true');
      })
    );
  }

  /**
   * Registers a new user
   * @param user User information (username and password)
   * @returns Observable with the registration response
   */
  register(user: User): Observable<{ message: string }> {
    return this.post<{ message: string }>('users/create_user', user);
  }

  /**
   * Logs out the current user by removing stored tokens
   */
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('isLoggedIn');
  }

  /**
   * Checks if the user is currently logged in
   * @returns Boolean indicating login status
   */
  isLoggedIn(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
  }

  /**
   * Gets the current authentication token
   * @returns The JWT token or null if not logged in
   */
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  /**
   * Gets the token type (usually 'bearer')
   * @returns The token type or null if not logged in
   */
  getTokenType(): string | null {
    return localStorage.getItem('tokenType');
  }

  /**
   * Gets the full authorization header value
   * @returns The authorization header value or null if not logged in
   */
  getAuthorizationHeader(): string | null {
    const token = this.getToken();
    const tokenType = this.getTokenType();

    if (token && tokenType) {
      return `${tokenType} ${token}`;
    }

    return null;
  }
}
