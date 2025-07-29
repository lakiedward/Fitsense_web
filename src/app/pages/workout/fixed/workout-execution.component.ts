import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';

interface WorkoutStep {
  id: string;
  name: string;
  description: string;
  duration: number; // in seconds
  targetPower?: number; // in watts
  targetHeartRate?: number; // in bpm
  targetCadence?: number; // in rpm
  type: 'warmup' | 'work' | 'recovery' | 'cooldown';
}

interface WorkoutData {
  id: string;
  title: string;
  description: string;
  sport: string;
  totalDuration: number; // in seconds
  steps: WorkoutStep[];
}

@Component({
  selector: 'app-workout-execution',
  standalone: true,
  imports: [CommonModule],
  templateUrl: '../workout-execution.component.html',
  styleUrls: ['../workout-execution.component.css']
})
export class WorkoutExecutionComponent implements OnInit, OnDestroy {
  workoutId: string | null = null;
  workout: WorkoutData | null = null;

  // Workout execution state
  isStarted: boolean = false;
  isPaused: boolean = false;
  currentStepIndex: number = 0;
  elapsedTime: number = 0; // in seconds
  stepElapsedTime: number = 0; // in seconds

  // Metrics
  currentPower: number = 0; // in watts
  currentHeartRate: number = 0; // in bpm
  currentCadence: number = 0; // in rpm

  // Timer subscription
  private timerSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.workoutId = this.route.snapshot.paramMap.get('id');
    if (this.workoutId) {
      this.loadWorkout(this.workoutId);
    } else {
      this.navigateBack();
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  loadWorkout(workoutId: string): void {
    // TODO: Implement with actual service
    // Simulate loading workout data
    setTimeout(() => {
      this.workout = {
        id: workoutId,
        title: 'Threshold Intervals',
        description: '5 x 5 minutes at threshold power with 3 minutes recovery',
        sport: 'Cycling',
        totalDuration: 3600, // 60 minutes
        steps: [
          {
            id: 's1',
            name: 'Warm Up',
            description: 'Easy pedaling to get ready',
            duration: 600, // 10 minutes
            targetPower: 150,
            targetHeartRate: 120,
            targetCadence: 90,
            type: 'warmup'
          },
          {
            id: 's2',
            name: 'Interval 1',
            description: 'First threshold interval',
            duration: 300, // 5 minutes
            targetPower: 250,
            targetHeartRate: 160,
            targetCadence: 95,
            type: 'work'
          },
          {
            id: 's3',
            name: 'Recovery 1',
            description: 'Easy spinning to recover',
            duration: 180, // 3 minutes
            targetPower: 130,
            targetHeartRate: 130,
            targetCadence: 85,
            type: 'recovery'
          },
          {
            id: 's4',
            name: 'Interval 2',
            description: 'Second threshold interval',
            duration: 300, // 5 minutes
            targetPower: 250,
            targetHeartRate: 160,
            targetCadence: 95,
            type: 'work'
          },
          {
            id: 's5',
            name: 'Recovery 2',
            description: 'Easy spinning to recover',
            duration: 180, // 3 minutes
            targetPower: 130,
            targetHeartRate: 130,
            targetCadence: 85,
            type: 'recovery'
          },
          {
            id: 's6',
            name: 'Interval 3',
            description: 'Third threshold interval',
            duration: 300, // 5 minutes
            targetPower: 250,
            targetHeartRate: 160,
            targetCadence: 95,
            type: 'work'
          },
          {
            id: 's7',
            name: 'Recovery 3',
            description: 'Easy spinning to recover',
            duration: 180, // 3 minutes
            targetPower: 130,
            targetHeartRate: 130,
            targetCadence: 85,
            type: 'recovery'
          },
          {
            id: 's8',
            name: 'Interval 4',
            description: 'Fourth threshold interval',
            duration: 300, // 5 minutes
            targetPower: 250,
            targetHeartRate: 160,
            targetCadence: 95,
            type: 'work'
          },
          {
            id: 's9',
            name: 'Recovery 4',
            description: 'Easy spinning to recover',
            duration: 180, // 3 minutes
            targetPower: 130,
            targetHeartRate: 130,
            targetCadence: 85,
            type: 'recovery'
          },
          {
            id: 's10',
            name: 'Interval 5',
            description: 'Fifth threshold interval',
            duration: 300, // 5 minutes
            targetPower: 250,
            targetHeartRate: 160,
            targetCadence: 95,
            type: 'work'
          },
          {
            id: 's11',
            name: 'Cool Down',
            description: 'Easy pedaling to cool down',
            duration: 600, // 10 minutes
            targetPower: 120,
            targetHeartRate: 110,
            targetCadence: 85,
            type: 'cooldown'
          }
        ]
      };

      // Simulate some metrics
      this.currentPower = 150;
      this.currentHeartRate = 120;
      this.currentCadence = 90;
    }, 500);
  }

  startWorkout(): void {
    if (!this.isStarted) {
      this.isStarted = true;
      this.isPaused = false;
      this.startTimer();
    }
  }

  pauseWorkout(): void {
    if (this.isStarted && !this.isPaused) {
      this.isPaused = true;
      this.stopTimer();
    }
  }

  resumeWorkout(): void {
    if (this.isStarted && this.isPaused) {
      this.isPaused = false;
      this.startTimer();
    }
  }

  stopWorkout(): void {
    if (this.isStarted) {
      this.isStarted = false;
      this.isPaused = false;
      this.stopTimer();

      // Show confirmation dialog before navigating away
      if (confirm('Are you sure you want to end this workout?')) {
        this.navigateBack();
      }
    }
  }

  skipStep(): void {
    if (this.isStarted && this.workout) {
      if (this.currentStepIndex < this.workout.steps.length - 1) {
        this.currentStepIndex++;
        this.stepElapsedTime = 0;
      }
    }
  }

  private startTimer(): void {
    this.stopTimer(); // Ensure no existing timer

    this.timerSubscription = interval(1000).subscribe(() => {
      this.elapsedTime++;
      this.stepElapsedTime++;

      // Simulate changing metrics
      this.updateMetrics();

      // Check if current step is complete
      const currentStep = this.getCurrentStep();
      if (this.workout && currentStep && this.stepElapsedTime >= currentStep.duration) {
        if (this.currentStepIndex < this.workout.steps.length - 1) {
          // Move to next step
          this.currentStepIndex++;
          this.stepElapsedTime = 0;
        } else {
          // Workout complete
          this.completeWorkout();
        }
      }
    });
  }

  private stopTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
  }

  private updateMetrics(): void {
    // Simulate changing metrics based on current step
    const currentStep = this.getCurrentStep();
    if (currentStep) {
      // Simulate power fluctuations around target
      if (currentStep.targetPower) {
        const fluctuation = Math.random() * 20 - 10; // -10 to +10
        this.currentPower = Math.round(currentStep.targetPower + fluctuation);
      }

      // Simulate heart rate changes (slower to respond)
      if (currentStep.targetHeartRate) {
        const currentDiff = currentStep.targetHeartRate - this.currentHeartRate;
        const change = currentDiff * 0.05; // 5% closer to target each second
        this.currentHeartRate = Math.round(this.currentHeartRate + change);
      }

      // Simulate cadence fluctuations
      if (currentStep.targetCadence) {
        const fluctuation = Math.random() * 6 - 3; // -3 to +3
        this.currentCadence = Math.round(currentStep.targetCadence + fluctuation);
      }
    }
  }

  private completeWorkout(): void {
    this.stopTimer();
    this.isStarted = false;

    // Show completion message
    alert('Workout completed! Great job!');

    // Navigate back
    this.navigateBack();
  }

  getCurrentStep(): WorkoutStep | undefined {
    return this.workout?.steps[this.currentStepIndex];
  }

  getStepProgress(): number {
    const currentStep = this.getCurrentStep();
    if (!currentStep) return 0;

    return (this.stepElapsedTime / currentStep.duration) * 100;
  }

  getWorkoutProgress(): number {
    if (!this.workout) return 0;

    return (this.elapsedTime / this.workout.totalDuration) * 100;
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  getStepTimeRemaining(): string {
    const currentStep = this.getCurrentStep();
    if (!currentStep) return '00:00';

    const remaining = currentStep.duration - this.stepElapsedTime;
    return this.formatTime(Math.max(0, remaining));
  }

  getWorkoutTimeRemaining(): string {
    if (!this.workout) return '00:00';

    const remaining = this.workout.totalDuration - this.elapsedTime;
    return this.formatTime(Math.max(0, remaining));
  }

  getStepTypeClass(type: string): string {
    switch (type) {
      case 'warmup': return 'warmup';
      case 'work': return 'work';
      case 'recovery': return 'recovery';
      case 'cooldown': return 'cooldown';
      default: return '';
    }
  }

  navigateBack(): void {
    this.router.navigate(['/workout/plans']);
  }
}
