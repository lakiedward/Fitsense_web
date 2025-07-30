import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { UserDetails, UserWeekAvailability, UserTrainingData, TrainingUserDetails } from '../../models/user-details.model';

@Injectable({
  providedIn: 'root'
})
export class UserService extends ApiService {

  constructor(
    protected override http: HttpClient,
    private authService: AuthService
  ) {
    super(http);
  }

  /**
   * Adds or updates user details
   * @param details User details to add/update
   * @returns Observable with the response
   */
  addUserDetails(details: UserDetails): Observable<{ message: string }> {
    const authHeader = this.authService.getAuthorizationHeader();
    if (!authHeader) {
      throw new Error('User not authenticated');
    }

    return this.post<{ message: string }>('training/add_user_details', details);
  }

  /**
   * Adds user training details (matches backend DetaliiUser model)
   * @param details Training user details to add/update
   * @returns Observable with the response
   */
  addTrainingUserDetails(details: TrainingUserDetails): Observable<{ message: string }> {
    const authHeader = this.authService.getAuthorizationHeader();
    if (!authHeader) {
      throw new Error('User not authenticated');
    }

    return this.post<{ message: string }>('training/add_user_details', details);
  }

  /**
   * Adds user's weekly availability for training
   * @param availabilityList List of availability slots
   * @returns Observable with the response
   */
  addWeekAvailability(availabilityList: UserWeekAvailability[]): Observable<{ message: string }> {
    const authHeader = this.authService.getAuthorizationHeader();
    if (!authHeader) {
      throw new Error('User not authenticated');
    }

    return this.post<{ message: string }>('availability/add_week_availability', availabilityList);
  }

  /**
   * Gets the user's training data
   * @returns Observable with the user's training data
   */
  getUserTrainingData(): Observable<UserTrainingData> {
    const authHeader = this.authService.getAuthorizationHeader();
    if (!authHeader) {
      throw new Error('User not authenticated');
    }

    return this.get<UserTrainingData>('training/user_training_data');
  }

  /**
   * Adds or updates user's cycling FTP data
   * @param cyclingData Cycling data to add/update
   * @returns Observable with the response
   */
  addOrUpdateCyclingData(cyclingData: any): Observable<{ message: string }> {
    const authHeader = this.authService.getAuthorizationHeader();
    if (!authHeader) {
      throw new Error('User not authenticated');
    }

    return this.post<{ message: string }>('training/ftp/manual', cyclingData);
  }

  /**
   * Saves user's running data
   * @param runningData Running data to save
   * @returns Observable with the response
   */
  saveRunningData(runningData: { [key: string]: number | null }): Observable<void> {
    const authHeader = this.authService.getAuthorizationHeader();
    if (!authHeader) {
      throw new Error('User not authenticated');
    }

    return this.post<void>('running/save', runningData);
  }

  /**
   * Selects user's preferred sports
   * @param sportsRequest Sports selection request
   * @returns Observable with the response
   */
  selectUserSports(sportsRequest: any): Observable<void> {
    const authHeader = this.authService.getAuthorizationHeader();
    if (!authHeader) {
      throw new Error('User not authenticated');
    }

    return this.post<void>('sports/select', sportsRequest);
  }

  /**
   * Saves user's swimming pace data
   * @param swimmingData Swimming pace data to save
   * @returns Observable with the response
   */
  saveSwimmingData(swimmingData: { predictions: Array<{ distance_m: number; time: number }> }): Observable<{ message: string }> {
    const authHeader = this.authService.getAuthorizationHeader();
    if (!authHeader) {
      throw new Error('User not authenticated');
    }

    return this.post<{ message: string }>('swim/best-time-prediction/manual', swimmingData);
  }
}
