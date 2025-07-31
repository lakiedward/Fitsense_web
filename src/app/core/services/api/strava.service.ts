import { Injectable } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { v4 as uuidv4 } from 'uuid';

export interface StravaConnectResponse {
  auth_url: string;
  message?: string;
  redirect_url?: string;
}

export interface StravaCallbackResponse {
  message: string;
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
}

export interface StravaActivity {
  id: number;
  name: string;
  type: string;
  start_date: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  average_speed?: number;
  max_speed?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  average_watts?: number;
  max_watts?: number;
}

export interface StravaAthlete {
  id: number;
  firstname: string;
  lastname: string;
  profile_medium: string;
  profile: string;
  city: string;
  state: string;
  country: string;
  sex: string;
  premium: boolean;
  created_at: string;
  updated_at: string;
}

export interface ComprehensiveAnalysis {
  cycling_fthr: any;
  running_fthr: any;
  swimming_fthr: any;
  other_fthr: any;
  hrtss_calculation: any;
  ftp_estimation: any;
  running_pace_predictions: any;
  swimming_best_times: any;
}

@Injectable({
  providedIn: 'root'
})
export class StravaService extends ApiService {

  private isConnecting = false; // Prevent multiple connection attempts
  private connectionStatusCache: { connected: boolean; timestamp: number } | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

  /**
   * Centralized Strava OAuth connection with all improvements
   */
  async initiateStravaConnect(): Promise<{ success: boolean; error?: string }> {
    // Prevent multiple connection attempts
    if (this.isConnecting) {
      return { success: false, error: 'Connection already in progress' };
    }

    try {
      this.isConnecting = true;

      // Get the authorization URL from the backend
      const response = await firstValueFrom(this.connectStrava());

      if (!response.auth_url) {
        throw new Error('No authorization URL received');
      }

      // Generate UUID for session management
      const authSessionId = uuidv4();

      // Store session ID in localStorage for cross-tab resilience
      localStorage.setItem('strava_auth_session', authSessionId);
      localStorage.setItem('strava_auth_timestamp', Date.now().toString());

      // Open Strava authorization in a new window
      const authWindow = window.open(
        response.auth_url,
        'strava-auth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      // Check for popup blocking
      if (!authWindow) {
        localStorage.removeItem('strava_auth_session');
        localStorage.removeItem('strava_auth_timestamp');
        throw new Error('Popup was blocked. Please allow popups for this site and try again.');
      }

      return new Promise((resolve) => {
        let resolved = false;
        let loadingTime = 0;

        // Set up message listener
        const messageListener = (event: MessageEvent) => {
          // Validate source for security
          if (event.source !== authWindow) return;

          // Check if this message is for our auth session
          if (event.data.sessionId && event.data.sessionId !== authSessionId) {
            return;
          }

          if (event.data.type === 'STRAVA_AUTH_SUCCESS') {
            this.handleAuthSuccess(authWindow, messageListener, checkClosed, timeoutId, authSessionId);
            if (!resolved) {
              resolved = true;
              resolve({ success: true });
            }
          } else if (event.data.type === 'STRAVA_AUTH_ERROR') {
            const error = event.data.error || 'Failed to connect to Strava';
            this.handleAuthError(authWindow, messageListener, checkClosed, timeoutId, authSessionId);
            if (!resolved) {
              resolved = true;
              resolve({ success: false, error });
            }
          }
        };

        window.addEventListener('message', messageListener);

        // Check if the window was closed manually with faster polling
        const checkClosed = setInterval(() => {
          if (authWindow.closed) {
            this.handleAuthError(authWindow, messageListener, checkClosed, timeoutId, authSessionId);
            if (!resolved) {
              resolved = true;
              // Fallback: Check connection status
              this.checkConnectionFallback().then(connected => {
                if (connected) {
                  resolve({ success: true });
                } else {
                  resolve({ success: false, error: 'Connection may have failed. Please check your dashboard.' });
                }
              });
            }
          }
        }, 500); // Reduced from 1000ms to 500ms

        // Shorter timeout (30s instead of 60s)
        const timeoutId = setTimeout(() => {
          this.handleAuthError(authWindow, messageListener, checkClosed, timeoutId, authSessionId);
          if (!resolved) {
            resolved = true;
            resolve({ success: false, error: 'Authentication timed out. Please try again.' });
          }
        }, 30000);

        // Track loading time for UX feedback
        const loadingTracker = setInterval(() => {
          loadingTime += 1;
          // Could emit loading time updates here for progress indicators
        }, 1000);

        // Clean up loading tracker when done
        const originalResolve = resolve;
        resolve = (result) => {
          clearInterval(loadingTracker);
          originalResolve(result);
        };
      });

    } catch (error: any) {
      this.isConnecting = false;
      localStorage.removeItem('strava_auth_session');
      localStorage.removeItem('strava_auth_timestamp');
      return { success: false, error: error.message || 'Failed to connect to Strava' };
    }
  }

  private handleAuthSuccess(authWindow: Window, messageListener: (event: MessageEvent) => void,
                           checkClosed: number, timeoutId: number, authSessionId: string) {
    this.cleanup(authWindow, messageListener, checkClosed, timeoutId, authSessionId);
  }

  private handleAuthError(authWindow: Window, messageListener: (event: MessageEvent) => void,
                         checkClosed: number, timeoutId: number, authSessionId: string) {
    this.cleanup(authWindow, messageListener, checkClosed, timeoutId, authSessionId);
  }

  private cleanup(authWindow: Window, messageListener: (event: MessageEvent) => void,
                 checkClosed: number, timeoutId: number, authSessionId: string) {
    this.isConnecting = false;
    clearInterval(checkClosed);
    clearTimeout(timeoutId);
    window.removeEventListener('message', messageListener);
    localStorage.removeItem('strava_auth_session');
    localStorage.removeItem('strava_auth_timestamp');

    // Force close the window
    if (authWindow && !authWindow.closed) {
      authWindow.close();
    }
  }

  private async checkConnectionFallback(): Promise<boolean> {
    try {
      const status = await this.checkStravaConnectionCached();
      return status.connected || false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Connect to Strava (Web) - Initiate OAuth flow
   */
  connectStrava(): Observable<StravaConnectResponse> {
    return this.get<StravaConnectResponse>('/strava/connect-mobile');
  }

  /**
   * Connect to Strava (Mobile) - Initiate OAuth flow for mobile apps
   */
  connectStravaMobile(): Observable<StravaConnectResponse> {
    return this.get<StravaConnectResponse>('/strava/connect-mobile');
  }

  /**
   * Handle Strava OAuth callback
   */
  handleStravaCallback(code: string, state: string): Observable<StravaCallbackResponse> {
    return this.get<StravaCallbackResponse>(`/strava/callback?code=${code}&state=${state}`);
  }

  /**
   * Get all Strava activities
   */
  getActivities(): Observable<StravaActivity[]> {
    return this.get<StravaActivity[]>('/strava/activities');
  }

  /**
   * Get activities by source (strava or app)
   */
  getActivitiesBySource(source: string): Observable<StravaActivity[]> {
    return this.get<StravaActivity[]>(`/strava/activities/by-source/${source}`);
  }

  /**
   * Sync activities live (Server-Sent Events)
   */
  syncActivitiesLive(): Observable<any> {
    return this.get<any>('/strava/sync-live');
  }

  /**
   * Get comprehensive fitness analysis
   */
  getComprehensiveAnalysis(): Observable<ComprehensiveAnalysis> {
    return this.get<ComprehensiveAnalysis>('/strava/comprehensive-analysis');
  }

  /**
   * Check if user is connected to Strava with caching
   */
  checkStravaConnection(): Observable<any> {
    return this.get<any>('/strava/status');
  }

  /**
   * Check connection status with caching for better performance
   */
  async checkStravaConnectionCached(): Promise<{ connected: boolean }> {
    // Check if we have valid cached data
    if (this.connectionStatusCache &&
        (Date.now() - this.connectionStatusCache.timestamp) < this.CACHE_DURATION) {
      return { connected: this.connectionStatusCache.connected };
    }

    try {
      // Fetch fresh data from API
      const status = await firstValueFrom(this.checkStravaConnection());
      const connected = status.connected || false;

      // Update cache
      this.connectionStatusCache = {
        connected,
        timestamp: Date.now()
      };

      return { connected };
    } catch (error) {
      // On error, return cached data if available, otherwise false
      if (this.connectionStatusCache) {
        return { connected: this.connectionStatusCache.connected };
      }
      return { connected: false };
    }
  }

  /**
   * Clear connection status cache (useful after connect/disconnect)
   */
  clearConnectionCache(): void {
    this.connectionStatusCache = null;
  }

  /**
   * Get Strava athlete information
   */
  getStravaAthlete(): Observable<StravaAthlete> {
    return this.get<StravaAthlete>('/strava/athlete');
  }

  /**
   * Disconnect from Strava
   */
  disconnectStrava(): Observable<any> {
    return this.delete<any>('/strava/disconnect');
  }
}
