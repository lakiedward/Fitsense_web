import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/api/user.service';
import { TrainingService } from '../../core/services/api/training.service';
import { HealthConnectService } from '../../core/services/api/health-connect.service';
import { AuthService } from '../../core/services/api/auth.service';
import { WorkoutSummary } from '../../core/models/training.model';
import { HealthConnectActivity } from '../../core/models/health-connect.model';

interface MetricSummary {
  label: string;
  value: string | number;
  unit?: string;
  icon?: string;
  change?: number; // percentage change
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  userName: string = 'Athlete';
  todaysDate: Date = new Date();
  isLoading: boolean = true;
  errorMessage: string = '';

  // Today's workout
  todaysWorkout: WorkoutSummary | null = null;

  // Quick actions
  quickActions = [
    { label: 'Start Workout', icon: 'play_circle', action: () => this.startWorkout() },
    { label: 'Calendar', icon: 'calendar_today', action: () => this.navigateTo('/calendar') },
    { label: 'Training Plan', icon: 'assignment', action: () => this.navigateTo('/workout/plans') }
  ];

  // Metrics
  metrics: MetricSummary[] = [];

  // Recent activities
  recentActivities: HealthConnectActivity[] = [];

  constructor(
    private router: Router,
    private userService: UserService,
    private trainingService: TrainingService,
    private healthConnectService: HealthConnectService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.loadUserData();
    this.loadTodaysWorkout();
    this.loadRecentActivities();
    this.loadMetrics();
  }

  loadUserData(): void {
    this.userService.getUserTrainingData().subscribe({
      next: (data) => {
        this.userName = data.name || 'Athlete';
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading user data:', error);
        this.errorMessage = 'Failed to load user data';
        this.isLoading = false;
      }
    });
  }

  loadTodaysWorkout(): void {
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    this.trainingService.getTrainingPlan().subscribe({
      next: (plans) => {
        // Find today's workout
        const todaysPlan = plans.find(plan => plan.date === today);

        if (todaysPlan) {
          this.todaysWorkout = {
            id: todaysPlan.id.toString(),
            title: todaysPlan.title,
            type: todaysPlan.type,
            duration: todaysPlan.duration,
            scheduledTime: todaysPlan.scheduledTime,
            completed: todaysPlan.completed
          };
        }
      },
      error: (error) => {
        console.error('Error loading today\'s workout:', error);
      }
    });
  }

  loadRecentActivities(): void {
    this.healthConnectService.getActivities(1, 3).subscribe({
      next: (activities) => {
        this.recentActivities = activities;
      },
      error: (error) => {
        console.error('Error loading recent activities:', error);
      }
    });
  }

  loadMetrics(): void {
    // Get health stats
    this.healthConnectService.getStats().subscribe({
      next: (stats) => {
        this.metrics = [
          {
            label: 'Activities',
            value: stats.total_activities,
            icon: 'fitness_center',
            change: 0
          },
          {
            label: 'Distance',
            value: Math.round(stats.total_distance / 1000 * 10) / 10,
            unit: 'km',
            icon: 'straighten',
            change: 0
          },
          {
            label: 'Calories',
            value: stats.total_calories,
            icon: 'local_fire_department',
            change: 0
          }
        ];
      },
      error: (error) => {
        console.error('Error loading health stats:', error);
        // Use default metrics if stats can't be loaded
        this.metrics = [
          { label: 'Sleep', value: 7.5, unit: 'hrs', icon: 'bedtime', change: 0 },
          { label: 'Steps', value: 0, icon: 'directions_walk', change: 0 },
          { label: 'Calories', value: '0/0', icon: 'local_fire_department', change: 0 }
        ];
      }
    });
  }

  startWorkout(): void {
    if (this.todaysWorkout) {
      this.router.navigate(['/workout/execute', this.todaysWorkout.id]);
    } else {
      this.router.navigate(['/workout/plans']);
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  viewWorkoutDetails(workoutId: string): void {
    this.router.navigate(['/workout/details', workoutId]);
  }

  viewActivityDetails(activityId: string): void {
    this.router.navigate(['/activity/details', activityId]);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
