import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

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

  /**
   * Connect to Strava (Web) - Initiate OAuth flow
   */
  connectStrava(): Observable<StravaConnectResponse> {
    return this.get<StravaConnectResponse>('/strava/connect');
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
   * Check if user is connected to Strava
   */
  checkStravaConnection(): Observable<any> {
    return this.get<any>('/strava/status');
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
