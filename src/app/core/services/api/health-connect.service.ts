import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import {
  HealthConnectActivity,
  HealthConnectStats,
  HealthConnectSyncRequest,
  HealthConnectSyncResponse,
  LastSyncResponse,
  DeleteActivityResponse
} from '../../models/health-connect.model';

@Injectable({
  providedIn: 'root'
})
export class HealthConnectService extends ApiService {

  constructor(
    protected override http: HttpClient,
    private authService: AuthService
  ) {
    super(http);
  }

  /**
   * Synchronizes activities from Health Connect
   * @param syncRequest The sync request parameters
   * @returns Observable with the sync response
   */
  syncActivities(syncRequest: HealthConnectSyncRequest): Observable<HealthConnectSyncResponse> {
    const authHeader = this.authService.getAuthorizationHeader();
    if (!authHeader) {
      throw new Error('User not authenticated');
    }

    return this.post<HealthConnectSyncResponse>('health-connect/sync-activities', syncRequest);
  }

  /**
   * Gets the last sync time
   * @returns Observable with the last sync response
   */
  getLastSync(): Observable<LastSyncResponse> {
    const authHeader = this.authService.getAuthorizationHeader();
    if (!authHeader) {
      throw new Error('User not authenticated');
    }

    return this.get<LastSyncResponse>('health-connect/last-sync');
  }

  /**
   * Triggers a manual sync of Health Connect activities
   * @param syncRequest The sync request parameters
   * @returns Observable with the sync response
   */
  triggerManualSync(syncRequest: HealthConnectSyncRequest): Observable<HealthConnectSyncResponse> {
    const authHeader = this.authService.getAuthorizationHeader();
    if (!authHeader) {
      throw new Error('User not authenticated');
    }

    return this.post<HealthConnectSyncResponse>('health-connect/manual-sync', syncRequest);
  }

  /**
   * Gets activities from Health Connect
   * @param page Page number for pagination
   * @param perPage Number of items per page
   * @param startDate Optional start date filter
   * @param endDate Optional end date filter
   * @returns Observable with the activities
   */
  getActivities(
    page: number = 1,
    perPage: number = 20,
    startDate?: string,
    endDate?: string
  ): Observable<HealthConnectActivity[]> {
    const authHeader = this.authService.getAuthorizationHeader();
    if (!authHeader) {
      throw new Error('User not authenticated');
    }

    const params: any = { page, per_page: perPage };
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    return this.get<HealthConnectActivity[]>('health-connect/activities', params);
  }

  /**
   * Gets statistics from Health Connect
   * @returns Observable with the statistics
   */
  getStats(): Observable<HealthConnectStats> {
    const authHeader = this.authService.getAuthorizationHeader();
    if (!authHeader) {
      throw new Error('User not authenticated');
    }

    return this.get<HealthConnectStats>('health-connect/stats');
  }

  /**
   * Deletes an activity from Health Connect
   * @param activityId The ID of the activity to delete
   * @returns Observable with the delete response
   */
  deleteActivity(activityId: string): Observable<DeleteActivityResponse> {
    const authHeader = this.authService.getAuthorizationHeader();
    if (!authHeader) {
      throw new Error('User not authenticated');
    }

    return this.delete<DeleteActivityResponse>(`health-connect/activities/${activityId}`);
  }

  /**
   * Deletes a Strava activity
   * @param stravaId The Strava ID of the activity to delete
   * @returns Observable with the delete response
   */
  deleteStravaActivity(stravaId: number): Observable<{ message: string }> {
    const authHeader = this.authService.getAuthorizationHeader();
    if (!authHeader) {
      throw new Error('User not authenticated');
    }

    return this.delete<{ message: string }>(`strava/activities/${stravaId}`);
  }

  /**
   * Deletes an app workout
   * @param workoutId The ID of the workout to delete
   * @returns Observable with the delete response
   */
  deleteAppWorkout(workoutId: number): Observable<{ message: string }> {
    const authHeader = this.authService.getAuthorizationHeader();
    if (!authHeader) {
      throw new Error('User not authenticated');
    }

    return this.delete<{ message: string }>(`workout-execution/workouts/${workoutId}`);
  }
}
