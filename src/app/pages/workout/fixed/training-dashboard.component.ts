import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface TrainingPlan {
  id: string;
  name: string;
  description: string;
  duration: number; // in weeks
  sport: string;
  level: string;
  progress: number; // percentage
}

interface ScheduledWorkout {
  id: string;
  title: string;
  description: string;
  date: Date;
  duration: number; // in minutes
  type: string;
  completed: boolean;
}

@Component({
  selector: 'app-training-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: '../training-dashboard.component.html',
  styleUrls: ['../training-dashboard.component.css']
})
export class TrainingDashboardComponent implements OnInit {
  activePlans: TrainingPlan[] = [];
  upcomingWorkouts: ScheduledWorkout[] = [];
  completedWorkouts: ScheduledWorkout[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadTrainingPlans();
    this.loadScheduledWorkouts();
  }

  loadTrainingPlans(): void {
    // TODO: Implement with actual service
    // Simulate loading training plans
    setTimeout(() => {
      this.activePlans = [
        {
          id: 'tp1',
          name: 'Cycling Base Builder',
          description: 'Build your aerobic base with this 8-week plan',
          duration: 8,
          sport: 'Cycling',
          level: 'Intermediate',
          progress: 35
        },
        {
          id: 'tp2',
          name: 'Running 5K Prep',
          description: 'Prepare for your first 5K race',
          duration: 6,
          sport: 'Running',
          level: 'Beginner',
          progress: 50
        }
      ];
    }, 500);
  }

  loadScheduledWorkouts(): void {
    // TODO: Implement with actual service
    // Simulate loading scheduled workouts
    setTimeout(() => {
      const today = new Date();

      // Upcoming workouts (next 7 days)
      this.upcomingWorkouts = [
        {
          id: 'w1',
          title: 'Threshold Intervals',
          description: '5 x 5 minutes at threshold power with 3 minutes recovery',
          date: new Date(today.getTime() + 24 * 60 * 60 * 1000), // tomorrow
          duration: 60,
          type: 'Cycling',
          completed: false
        },
        {
          id: 'w2',
          title: 'Easy Run',
          description: '30 minutes at zone 2 pace',
          date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // day after tomorrow
          duration: 30,
          type: 'Running',
          completed: false
        },
        {
          id: 'w3',
          title: 'Strength Training',
          description: 'Full body workout focusing on core and legs',
          date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
          duration: 45,
          type: 'Strength',
          completed: false
        }
      ];

      // Completed workouts
      this.completedWorkouts = [
        {
          id: 'w4',
          title: 'Recovery Ride',
          description: '60 minutes in zone 1-2',
          date: new Date(today.getTime() - 24 * 60 * 60 * 1000), // yesterday
          duration: 60,
          type: 'Cycling',
          completed: true
        },
        {
          id: 'w5',
          title: 'Tempo Run',
          description: '20 minutes warmup, 20 minutes at tempo pace, 10 minutes cooldown',
          date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
          duration: 50,
          type: 'Running',
          completed: true
        }
      ];
    }, 500);
  }

  viewPlanDetails(planId: string): void {
    this.router.navigate(['/workout/plan', planId]);
  }

  startWorkout(workoutId: string): void {
    this.router.navigate(['/workout/execute', workoutId]);
  }

  viewWorkoutDetails(workoutId: string): void {
    this.router.navigate(['/workout/details', workoutId]);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  navigateBack(): void {
    this.router.navigate(['/home']);
  }

  // Add the missing navigateTo method
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
