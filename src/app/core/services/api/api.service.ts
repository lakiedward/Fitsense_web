import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  protected apiUrl = environment.apiUrl;

  constructor(protected http: HttpClient) {}

  /**
   * Builds a properly formatted URL by handling trailing and leading slashes
   * @param endpoint The API endpoint to call
   * @returns A properly formatted URL
   */
  private buildUrl(endpoint: string): string {
    // Remove trailing slash from base URL and leading slash from endpoint
    const baseUrl = this.apiUrl.replace(/\/+$/, '');
    const cleanEndpoint = endpoint.replace(/^\/+/, '');

    return `${baseUrl}/${cleanEndpoint}`;
  }

  /**
   * Performs a GET request to the specified endpoint
   * @param endpoint The API endpoint to call
   * @param params Optional query parameters
   * @returns An Observable of the response
   */
  get<T>(endpoint: string, params?: any): Observable<T> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }

    return this.http.get<T>(this.buildUrl(endpoint), { params: httpParams });
  }

  /**
   * Performs a POST request to the specified endpoint
   * @param endpoint The API endpoint to call
   * @param data The data to send in the request body
   * @returns An Observable of the response
   */
  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(this.buildUrl(endpoint), data);
  }

  /**
   * Performs a PUT request to the specified endpoint
   * @param endpoint The API endpoint to call
   * @param data The data to send in the request body
   * @returns An Observable of the response
   */
  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(this.buildUrl(endpoint), data);
  }

  /**
   * Performs a DELETE request to the specified endpoint
   * @param endpoint The API endpoint to call
   * @returns An Observable of the response
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(this.buildUrl(endpoint));
  }
}
