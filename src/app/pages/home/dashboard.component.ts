import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface WorkoutSummary {
  id: string;
  title: string;
  type: string;
  duration: number; // in minutes
  scheduledTime?: string;
  completed: boolean;
}

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

  // Today's workout
  todaysWorkout: WorkoutSummary | null = null;

  // Quick actions
  quickActions = [
    { label: 'Start Workout', icon: 'play_circle', action: () => this.startWorkout() },
    { label: 'Calendar', icon: 'calendar_today', action: () => this.navigateTo('/calendar') },
    { label: 'Training Plan', icon: 'assignment', action: () => this.navigateTo('/workout/plans') }
  ];

  // Metrics
  metrics: MetricSummary[] = [
    { label: 'Sleep', value: 7.5, unit: 'hrs', icon: 'bedtime', change: 5 },
    { label: 'Steps', value: 8432, icon: 'directions_walk', change: -2 },
    { label: 'Calories', value: '1850/2200', icon: 'local_fire_department', change: 3 },
    { label: 'FTP', value: 245, unit: 'W', icon: 'speed', change: 8 }
  ];

  // Recent activities
  recentActivities: WorkoutSummary[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadTodaysWorkout();
    this.loadRecentActivities();
  }

  loadUserData(): void {
    // TODO: Implement with actual service
    // Simulate loading user data
    setTimeout(() => {
      this.userName = 'John';
    }, 500);
  }

  loadTodaysWorkout(): void {
    // TODO: Implement with actual service
    // Simulate loading today's workout
    setTimeout(() => {
      this.todaysWorkout = {
        id: 'w1',
        title: 'Threshold Intervals',
        type: 'Cycling',
        duration: 60,
        scheduledTime: '18:00',
        completed: false
      };
    }, 500);
  }

  loadRecentActivities(): void {
    // TODO: Implement with actual service
    // Simulate loading recent activities
    setTimeout(() => {
      this.recentActivities = [
        {
          id: 'a1',
          title: 'Morning Run',
          type: 'Running',
          duration: 45,
          completed: true
        },
        {
          id: 'a2',
          title: 'Strength Training',
          type: 'Strength',
          duration: 30,
          completed: true
        },
        {
          id: 'a3',
          title: 'Recovery Ride',
          type: 'Cycling',
          duration: 90,
          completed: true
        }
      ];
    }, 500);
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
    // TODO: Implement with actual auth service
    localStorage.removeItem('isLoggedIn');
    this.router.navigate(['/login']);
  }
}
