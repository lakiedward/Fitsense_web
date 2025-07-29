import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import {
  TrainingPlan,
  TrainingPlanGenerate,
  TrainingDateUpdate,
  SavedWorkout,
  TrainingStats
} from '../../models/training.model';

@Injectable({
  providedIn: 'root'
})
export class TrainingService extends ApiService {

  constructor(
    protected override http: HttpClient,
    private authService: AuthService
  ) {
    super(http);
  }

  /**
   * Gets the user's training plan
   * @returns Observable with the training plan
   */
  getTrainingPlan(): Observable<TrainingPlan[]> {
    const authHeader = this.authService.getAuthorizationHeader();
    if (!authHeader) {
      throw new Error('User not authenticated');
    }

    return this.get<TrainingPlan[]>('training/get_training_plan');
  }

  /**
   * Generates a training plan based on sport
   * @param raceDate The target race date
   * @returns Observable with the response
   */
  generateTrainingPlanBySport(raceDate: string): Observable<{ message: string }> {
    const authHeader = this.authService.getAuthorizationHeader();
    if (!authHeader) {
      throw new Error('User not authenticated');
    }

    return this.post<{ message: string }>('plan/generate_based_on_sport', { race_date: raceDate });
  }

  /**
   * Generates a cycling training plan
   * @param trainingPlanGenerate The training plan generation parameters
   * @returns Observable with the response
   */
  generateCyclingPlan(trainingPlanGenerate: TrainingPlanGenerate): Observable<{ message: string }> {
    const authHeader = this.authService.getAuthorizationHeader();
    if (!authHeader) {
      throw new Error('User not authenticated');
    }

    return this.post<{ message: string }>('api/generate_cycling_plan', trainingPlanGenerate);
  }

  /**
   * Updates the date of a training plan
   * @param planId The ID of the training plan
   * @param newDate The new date for the training plan
   * @returns Observable with the response
   */
  updateTrainingPlanDate(planId: number, newDate: string): Observable<{ message: string }> {
    const authHeader = this.authService.getAuthorizationHeader();
    if (!authHeader) {
      throw new Error('User not authenticated');
    }

    const update: TrainingDateUpdate = { new_date: newDate };
    return this.put<{ message: string }>(`training/training_plan/${planId}/date`, update);
  }

  /**
   * Saves a completed workout
   * @param workout The workout data to save
   * @returns Observable with the response
   */
  saveWorkout(workout: SavedWorkout): Observable<any> {
    const authHeader = this.authService.getAuthorizationHeader();
    if (!authHeader) {
      throw new Error('User not authenticated');
    }

    return this.post<any>('workout-execution/workouts/save', workout);
  }

  /**
   * Gets the user's training statistics
   * @param days Number of days to include in the statistics (default: 30)
   * @returns Observable with the training statistics
   */
  getTrainingStats(days: number = 30): Observable<TrainingStats> {
    const authHeader = this.authService.getAuthorizationHeader();
    if (!authHeader) {
      throw new Error('User not authenticated');
    }

    return this.get<TrainingStats>('workout-execution/workouts/planned-vs-actual-stats', { days });
  }

  /**
   * Gets the overreaching status of the user
   * @returns Observable with the overreaching status
   */
  getOverreachingStatus(): Observable<any> {
    const authHeader = this.authService.getAuthorizationHeader();
    if (!authHeader) {
      throw new Error('User not authenticated');
    }

    return this.get<any>('workout-execution/workouts/overreaching_status');
  }

  /**
   * Adjusts the training plan for overreaching
   * @returns Observable with the adjustment response
   */
  adjustPlanForOverreaching(): Observable<any> {
    const authHeader = this.authService.getAuthorizationHeader();
    if (!authHeader) {
      throw new Error('User not authenticated');
    }

    return this.post<any>('workout-execution/workouts/adjust-plan-for-overreaching', {});
  }
}
