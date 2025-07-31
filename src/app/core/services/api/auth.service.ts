import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { User, AuthResponse } from '../../models/user.model';
import { STORAGE_KEYS } from '../../constants/storage-keys';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends ApiService {

  /**
   * Authenticates a user and stores the JWT token
   * @param user User credentials (username and password)
   * @param rememberMe Whether to use a longer-lasting token
   * @returns Observable with the authentication response
   */
  login(user: User, rememberMe: boolean = false): Observable<AuthResponse> {
    const endpoint = rememberMe ? 'users/token/extended' : 'users/token';
    
    return this.post<AuthResponse>(endpoint, user).pipe(
      tap(response => {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.access_token);
        
        // Store refresh token if available
        if (response.refresh_token) {
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refresh_token);
        }
        
        // Ensure token type is properly capitalized
        const tokenType = response.token_type || 'bearer';
        localStorage.setItem(STORAGE_KEYS.TOKEN_TYPE, tokenType.charAt(0).toUpperCase() + tokenType.slice(1).toLowerCase());
        localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
        
        // Store remember me preference
        localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, rememberMe.toString());
        
        // Store token expiration if available
        if (response.expires_in) {
          const expirationTime = Date.now() + (response.expires_in * 1000);
          localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRATION, expirationTime.toString());
        }
        
        // Debug logging
        console.log('=== AUTH SERVICE DEBUG ===');
        console.log('Token saved:', response.access_token?.substring(0, 20) + '...');
        console.log('Token type saved:', localStorage.getItem(STORAGE_KEYS.TOKEN_TYPE));
        console.log('Is logged in set to:', localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN));
        console.log('Remember me:', rememberMe);
        console.log('=== END AUTH SERVICE DEBUG ===');
      })
    );
  }

  /**
   * Refreshes the authentication token using the refresh token
   * @returns Observable with the new authentication response
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    return this.post<AuthResponse>('users/token/refresh', { refresh_token: refreshToken }).pipe(
      tap(response => {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.access_token);
        
        if (response.refresh_token) {
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refresh_token);
        }
        
        if (response.expires_in) {
          const expirationTime = Date.now() + (response.expires_in * 1000);
          localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRATION, expirationTime.toString());
        }
      })
    );
  }

  /**
   * Checks if the current token is expired
   * @returns Boolean indicating if token is expired
   */
  isTokenExpired(): boolean {
    const expiration = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRATION);
    if (!expiration) return false;
    
    return Date.now() > parseInt(expiration);
  }

  /**
   * Gets the remember me preference
   * @returns Boolean indicating remember me preference
   */
  getRememberMe(): boolean {
    return localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === 'true';
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
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.TOKEN_TYPE);
    localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
    localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRATION);
  }

  /**
   * Checks if the user is currently logged in
   * @returns Boolean indicating login status
   */
  isLoggedIn(): boolean {
    return localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === 'true';
  }

  /**
   * Gets the current authentication token
   * @returns The JWT token or null if not logged in
   */
  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  /**
   * Gets the token type (usually 'Bearer')
   * @returns The token type or null if not logged in
   */
  getTokenType(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN_TYPE);
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
