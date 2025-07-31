import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/api/auth.service';
import { UserService } from '../../core/services/api/user.service';
import { StravaService } from '../../core/services/api/strava.service';
import { User } from '../../core/models/user.model';
import { UserDetails, TrainingUserDetails } from '../../core/models/user-details.model';
import { firstValueFrom } from 'rxjs';

interface SignupData {
  email: string;
  password: string;
  gender: string;
  age: number | undefined;
  weight: number | undefined;
  height: number | undefined;
  weightUnit: string;
  heightUnit: string;
  stravaConnected: boolean;
  sports: string[];
  ftp?: number;
  runningPace?: number;
  swimPace?: number;
  planLength?: number;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  currentStep: number = 1;
  totalSteps: number = 8;

  signupData: SignupData = {
    email: '',
    password: '',
    gender: '',
    age: undefined,
    weight: undefined,
    height: undefined,
    weightUnit: 'kg',
    heightUnit: 'cm',
    stravaConnected: false,
    sports: [],
    ftp: undefined,
    runningPace: undefined,
    swimPace: undefined,
    planLength: 8
  };

  errorMessage: string = '';
  isLoading: boolean = false;
  loadingMessage: string = '';
  loadingTime: number = 0;
  private loadingTimer: any = null;
  availableSports: string[] = ['Cycling', 'Running', 'Swimming', 'Strength Training', 'Yoga'];

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private stravaService: StravaService
  ) {}

  nextStep() {
    if (this.validateCurrentStep()) {
      if (this.currentStep === 1) {
        // Call API to create user after step 1 validation
        this.createUserAccount();
      } else if (this.currentStep === 3) {
        // Call API to save user details after step 3 validation
        this.saveUserDetailsAndContinue();
      } else if (this.currentStep < this.totalSteps) {
        this.currentStep++;
      } else {
        this.completeSignup();
      }
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  validateCurrentStep(): boolean {
    this.errorMessage = '';

    switch (this.currentStep) {
      case 1: // Email & Password
        if (!this.signupData.email || !this.validateEmail(this.signupData.email)) {
          this.errorMessage = 'Please enter a valid email address';
          return false;
        }
        if (!this.signupData.password || this.signupData.password.length < 6) {
          this.errorMessage = 'Password must be at least 6 characters';
          return false;
        }
        return true;

      case 2: // Gender
        if (!this.signupData.gender) {
          this.errorMessage = 'Please select your gender';
          return false;
        }
        return true;

      case 3: // Physical Details (Age, Weight, Height)
        if (!this.signupData.age || this.signupData.age < 13 || this.signupData.age > 120) {
          this.errorMessage = 'Please enter a valid age (13-120)';
          return false;
        }
        if (!this.signupData.weight || this.signupData.weight <= 0) {
          this.errorMessage = 'Please enter a valid weight';
          return false;
        }
        if (!this.signupData.height || this.signupData.height <= 0) {
          this.errorMessage = 'Please enter a valid height';
          return false;
        }
        return true;

      case 4: // Strava Connection
        // Optional step, always valid
        return true;

      case 5: // Sports Selection
        if (this.signupData.sports.length === 0) {
          this.errorMessage = 'Please select at least one sport';
          return false;
        }
        return true;

      case 6: // Performance Metrics
        // Optional step, always valid
        return true;

      case 7: // Training Plan
        if (!this.signupData.planLength || this.signupData.planLength < 1 || this.signupData.planLength > 52) {
          this.errorMessage = 'Please select a valid plan length (1-52 weeks)';
          return false;
        }
        return true;

      case 8: // Summary
        return true;

      default:
        return true;
    }
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  selectGender(gender: string) {
    this.signupData.gender = gender;
  }

  toggleSport(sport: string) {
    const index = this.signupData.sports.indexOf(sport);
    if (index === -1) {
      this.signupData.sports.push(sport);
    } else {
      this.signupData.sports.splice(index, 1);
    }
  }

  isSportSelected(sport: string): boolean {
    return this.signupData.sports.includes(sport);
  }

  async connectStrava() {
    try {
      this.isLoading = true;
      this.loadingMessage = 'Connecting to Strava...';
      this.errorMessage = '';
      this.loadingTime = 0;

      // Start loading timer for progress indicators
      this.startLoadingTimer();

      // Use the centralized OAuth service
      const result = await this.stravaService.initiateStravaConnect();

      if (result.success) {
        this.signupData.stravaConnected = true;
        this.loadingMessage = 'Successfully connected to Strava!';

        // Keep success message visible for a moment
        setTimeout(() => {
          this.stopLoadingTimer();
          this.isLoading = false;
          this.loadingMessage = '';
        }, 1500);
      } else {
        this.errorMessage = result.error || 'Failed to connect to Strava';
        this.stopLoadingTimer();
        this.isLoading = false;
        this.loadingMessage = '';
      }
    } catch (error: any) {
      console.error('Strava connection error:', error);
      this.errorMessage = error.message || 'Failed to connect to Strava';
      this.stopLoadingTimer();
      this.isLoading = false;
      this.loadingMessage = '';
    }
  }

  private startLoadingTimer() {
    this.loadingTime = 0;
    this.loadingTimer = setInterval(() => {
      this.loadingTime++;
    }, 1000);
  }

  private stopLoadingTimer() {
    if (this.loadingTimer) {
      clearInterval(this.loadingTimer);
      this.loadingTimer = null;
    }
    this.loadingTime = 0;
  }

  // Retry connection method for better UX
  retryStravaConnection() {
    this.connectStrava();
  }

  disconnectStrava() {
    this.signupData.stravaConnected = false;
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  toggleWeightUnit(unit: string) {
    this.signupData.weightUnit = unit;
  }

  toggleHeightUnit(unit: string) {
    this.signupData.heightUnit = unit;
  }

  createUserAccount() {
    this.isLoading = true;
    this.loadingMessage = 'Creating your account...';
    this.errorMessage = '';

    // Create user with email and password
    const user: User = {
      username: this.signupData.email,
      password: this.signupData.password
    };

    this.authService.register(user).subscribe({
      next: () => {
        this.loadingMessage = 'Logging you in...';
        // Login to get authentication token
        this.authService.login(user).subscribe({
          next: () => {
            this.isLoading = false;
            this.loadingMessage = '';
            // Move to next step after successful registration and login
            this.currentStep++;
          },
          error: (error) => {
            this.isLoading = false;
            this.errorMessage = error.error?.detail || 'Login failed after registration';
          }
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.detail || 'Registration failed';
      }
    });
  }

  private saveUserDetailsAndContinue() {
    // Check if user is authenticated
    const authToken = localStorage.getItem('authToken');
    const tokenType = localStorage.getItem('tokenType') || 'bearer';

    console.log('=== SIGNUP COMPONENT DEBUG - STEP 3 ===');
    console.log('Current step:', this.currentStep);
    console.log('Auth token:', authToken);
    console.log('Token type:', tokenType);
    console.log('Token length:', authToken?.length);
    console.log('Token starts with:', authToken?.substring(0, 20) + '...');
    console.log('Is logged in:', localStorage.getItem('isLoggedIn'));
    console.log('All localStorage keys:', Object.keys(localStorage));
    console.log('localStorage size:', JSON.stringify(localStorage).length);

    if (!authToken) {
      this.errorMessage = 'Not authenticated. Please try again.';
      console.error('SIGNUP DEBUG - No auth token found in localStorage');
      console.log('=== END SIGNUP COMPONENT DEBUG ===');
      return;
    }

    this.isLoading = true;
    this.loadingMessage = 'Saving your details...';
    this.errorMessage = '';

    // Convert units to standard format before sending to backend
    const weight = this.signupData.weightUnit === 'lb'
      ? parseFloat((this.signupData.weight! * 0.453592).toFixed(1))
      : this.signupData.weight!;

    const height = this.signupData.heightUnit === 'ft'
      ? parseFloat((this.signupData.height! * 30.48).toFixed(1))
      : this.signupData.height!;

    // Create training user details object matching backend model
    const trainingDetails: TrainingUserDetails = {
      varsta: this.signupData.age!,
      inaltime: height,
      greutate: weight,
      gender: this.signupData.gender,
      discipline: 'Beginner' // Default discipline
    };

    console.log('SIGNUP DEBUG - Sending training details:', trainingDetails);
    console.log('SIGNUP DEBUG - Weight conversion:', {
      original: this.signupData.weight,
      unit: this.signupData.weightUnit,
      converted: weight
    });
    console.log('SIGNUP DEBUG - Height conversion:', {
      original: this.signupData.height,
      unit: this.signupData.heightUnit,
      converted: height
    });
    console.log('=== END SIGNUP COMPONENT DEBUG ===');

    this.userService.addTrainingUserDetails(trainingDetails).subscribe({
      next: (response) => {
        console.log('SIGNUP DEBUG - Training details saved successfully:', response);
        this.isLoading = false;
        this.loadingMessage = '';
        // Move to next step after successful save
        this.currentStep++;
      },
      error: (error) => {
        console.error('SIGNUP DEBUG - Error saving training details:', error);
        this.isLoading = false;
        this.errorMessage = error.error?.detail || 'Failed to save user details';
      }
    });
  }

  completeSignup() {
    this.isLoading = true;
    this.loadingMessage = 'Finalizing your account...';

    // Here you can save any remaining data or perform final setup
    setTimeout(() => {
      this.isLoading = false;
      this.router.navigate(['/dashboard']);
    }, 2000);
  }

  skipStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    } else {
      this.completeSignup();
    }
  }

  getStepTitle(): string {
    const titles = [
      '',
      'Create Account',
      'Personal Info',
      'Physical Details',
      'Connect Strava',
      'Select Sports',
      'Performance Metrics',
      'Training Plan',
      'Summary'
    ];
    return titles[this.currentStep] || '';
  }

  getStepDescription(): string {
    const descriptions = [
      '',
      'Enter your email and password',
      'Tell us about yourself',
      'Your physical measurements',
      'Connect your Strava account (optional)',
      'What sports do you practice?',
      'Your current performance levels (optional)',
      'Choose your training plan duration',
      'Review and complete your profile'
    ];
    return descriptions[this.currentStep] || '';
  }

  // Helper methods for step 6 (Performance Metrics)
  getFtpZone(ftp: number): string {
    if (ftp < 150) return 'Beginner';
    if (ftp < 200) return 'Recreational';
    if (ftp < 250) return 'Trained';
    if (ftp < 300) return 'Well Trained';
    if (ftp < 350) return 'Excellent';
    return 'Elite';
  }

  getRunningPaceZone(pace: number): string {
    // Pace in minutes per km
    if (pace > 7) return 'Beginner';
    if (pace > 6) return 'Recreational';
    if (pace > 5) return 'Trained';
    if (pace > 4.5) return 'Well Trained';
    if (pace > 4) return 'Excellent';
    return 'Elite';
  }

  getSwimPaceZone(pace: number): string {
    // Pace in minutes per 100m
    if (pace > 3) return 'Beginner';
    if (pace > 2.5) return 'Recreational';
    if (pace > 2) return 'Trained';
    if (pace > 1.8) return 'Well Trained';
    if (pace > 1.6) return 'Excellent';
    return 'Elite';
  }
}
