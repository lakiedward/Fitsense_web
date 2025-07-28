import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface SignupData {
  email: string;
  password: string;
  gender: string;
  age: number;
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
  totalSteps: number = 7;

  signupData: SignupData = {
    email: '',
    password: '',
    gender: '',
    age: 0,
    sports: [],
    ftp: undefined,
    runningPace: undefined,
    swimPace: undefined,
    planLength: 8
  };

  errorMessage: string = '';
  availableSports: string[] = ['Cycling', 'Running', 'Swimming', 'Strength Training', 'Yoga'];

  constructor(private router: Router) {}

  nextStep() {
    if (this.validateCurrentStep()) {
      if (this.currentStep < this.totalSteps) {
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

      case 3: // Age
        if (!this.signupData.age || this.signupData.age < 16 || this.signupData.age > 100) {
          this.errorMessage = 'Please enter a valid age (16-100)';
          return false;
        }
        return true;

      case 4: // Sports
        if (!this.signupData.sports.length) {
          this.errorMessage = 'Please select at least one sport';
          return false;
        }
        return true;

      case 5: // Training metrics (FTP, running pace, swim pace)
        if (this.signupData.sports.includes('Cycling') && !this.signupData.ftp) {
          this.errorMessage = 'Please enter your FTP for cycling';
          return false;
        }
        if (this.signupData.sports.includes('Running') && !this.signupData.runningPace) {
          this.errorMessage = 'Please enter your running pace';
          return false;
        }
        if (this.signupData.sports.includes('Swimming') && !this.signupData.swimPace) {
          this.errorMessage = 'Please enter your swim pace';
          return false;
        }
        return true;

      case 6: // Plan length
        if (!this.signupData.planLength) {
          this.errorMessage = 'Please select a training plan length';
          return false;
        }
        return true;

      case 7: // Review
        return true;

      default:
        return true;
    }
  }

  validateEmail(email: string): boolean {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
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

  completeSignup() {
    // TODO: Implement actual signup logic with a service
    console.log('Signup completed with data:', this.signupData);

    // Simulate successful signup
    localStorage.setItem('isLoggedIn', 'true');
    this.router.navigate(['/home']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
