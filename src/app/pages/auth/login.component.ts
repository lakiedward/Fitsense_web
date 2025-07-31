import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/api/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  standalone: true
})
export class LoginComponent implements OnInit {
  @ViewChild('emailInput') emailInput!: ElementRef<HTMLInputElement>;
  @ViewChild('loginCard') loginCard!: ElementRef<HTMLElement>;
  
  // Reactive Form
  loginForm!: FormGroup;
  
  // UI states
  isLoading: boolean = false;
  showPassword: boolean = false;
  isDarkMode: boolean = false;
  isLowLightMode: boolean = false;
  rememberMe: boolean = false;
  loadingTip: string = '';
  
  // Error states
  generalError: string = '';
  
  // Password strength
  passwordStrength: number = 0;
  passwordStrengthText: string = '';
  passwordStrengthClass: string = '';
  
  // Biometric support
  biometricSupported: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.checkBiometricSupport();
    this.checkExistingAuth();
    this.loadRememberMePreference();
    this.initThemeFromService();
  }

  ngAfterViewInit(): void {
    // Autofocus email input for better UX
    if (this.emailInput) {
      this.emailInput.nativeElement.focus();
    }
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.loginCard) {
      const card = this.loginCard.nativeElement;
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const mouseX = event.clientX - centerX;
      const mouseY = event.clientY - centerY;
      
      const rotateX = (mouseY / (rect.height / 2)) * -5;
      const rotateY = (mouseX / (rect.width / 2)) * 5;
      
      card.style.transform = `translateY(-2px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      card.classList.add('mouse-move');
    }
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    if (this.loginCard) {
      const card = this.loginCard.nativeElement;
      card.style.transform = 'translateY(-2px) rotateY(0deg) rotateX(0deg)';
      card.classList.remove('mouse-move');
    }
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [
        Validators.required, 
        Validators.email
      ]],
      password: ['', [
        Validators.required, 
        Validators.minLength(6)
      ]]
    });

    // Watch password changes for strength calculation
    this.loginForm.get('password')?.valueChanges.subscribe(password => {
      this.updatePasswordStrength(password);
    });

    // Clear errors when user starts typing
    this.loginForm.valueChanges.subscribe(() => {
      this.clearErrors();
    });
  }

  private checkExistingAuth(): void {
    // Check if user is already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']);
    }
  }

  private loadRememberMePreference(): void {
    // Load remember me preference from auth service
    this.rememberMe = this.authService.getRememberMe();
  }

  private initThemeFromService(): void {
    // Subscribe to theme changes
    this.themeService.currentTheme$.subscribe(theme => {
      this.isDarkMode = theme === 'dark';
      this.isLowLightMode = theme === 'low-light';
    });
  }

  // Theme application is now handled by ThemeService

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  private updatePasswordStrength(password: string): void {
    if (!password) {
      this.passwordStrength = 0;
      this.passwordStrengthText = '';
      this.passwordStrengthClass = '';
      return;
    }

    let strength = 0;
    const checks = [
      password.length >= 8, // Length
      /[a-z]/.test(password), // Lowercase
      /[A-Z]/.test(password), // Uppercase
      /[0-9]/.test(password), // Numbers
      /[!@#$%^&*(),.?":{}|<>]/.test(password), // Special characters
      password.length >= 12, // Extra length bonus
      !/(.)\1{2,}/.test(password), // No repeated characters
      !/(123|abc|qwe|password|admin)/i.test(password) // No common patterns
    ];

    checks.forEach(check => {
      if (check) strength += 12.5; // 100% / 8 checks
    });

    this.passwordStrength = Math.min(strength, 100);

    if (strength <= 25) {
      this.passwordStrengthText = 'Very Weak 😰';
      this.passwordStrengthClass = 'very-weak';
    } else if (strength <= 50) {
      this.passwordStrengthText = 'Weak 😕';
      this.passwordStrengthClass = 'weak';
    } else if (strength <= 75) {
      this.passwordStrengthText = 'Good 👍';
      this.passwordStrengthClass = 'good';
    } else {
      this.passwordStrengthText = 'Strong 💪';
      this.passwordStrengthClass = 'strong';
    }
  }

  // UI interactions
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onRememberMeChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.rememberMe = target.checked;
  }

  clearErrors(): void {
    this.generalError = '';
  }

  // Form helpers
  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;
    
    if (errors['required']) {
      return `${controlName === 'email' ? 'Email' : 'Password'} is required`;
    }
    
    if (errors['email']) {
      return 'Please enter a valid email address';
    }
    
    if (errors['minlength']) {
      return `Password must be at least ${errors['minlength'].requiredLength} characters`;
    }

    return '';
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  // Authentication
  login(): void {
    if (this.loginForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    this.clearErrors();
    this.setLoadingTip();

    const formValue = this.loginForm.value;
    const user = {
      username: formValue.email,
      password: formValue.password
    };

    this.authService.login(user, this.rememberMe).subscribe({
      next: (response) => {
        // Navigate to home page
        this.router.navigate(['/home']);
      },
      error: (error) => {
        this.handleLoginError(error);
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  private handleLoginError(error: any): void {
    console.error('Login error:', error);
    
    // Handle specific error cases
    if (error.status === 401) {
      this.generalError = 'Invalid email or password. Please check your credentials and try again.';
    } else if (error.status === 429) {
      this.generalError = 'Too many login attempts. Please wait a few minutes before trying again.';
    } else if (error.status === 0 || error.status === 503) {
      this.generalError = 'Service temporarily unavailable. Please try again later.';
    } else if (error.status >= 500) {
      this.generalError = 'Server error. Please try again later.';
    } else {
      this.generalError = 'Login failed. Please check your connection and try again.';
    }
    
    // Focus back to email input for better UX
    setTimeout(() => {
      if (this.emailInput) {
        this.emailInput.nativeElement.focus();
      }
    }, 100);
  }

  // Social login methods
  loginWithGoogle(): void {
    this.generalError = 'Google login is not yet implemented. Please use email/password login.';
  }

  loginWithFacebook(): void {
    this.generalError = 'Facebook login is not yet implemented. Please use email/password login.';
  }

  loginWithApple(): void {
    this.generalError = 'Apple login is not yet implemented. Please use email/password login.';
  }



  // Biometric authentication
  private async checkBiometricSupport(): Promise<void> {
    // Check if biometric authentication is available
    if ('credentials' in navigator && 'preventSilentAccess' in navigator.credentials) {
      this.biometricSupported = true;
    }
  }

  loginWithBiometric(): void {
    this.generalError = 'Biometric authentication is not yet implemented. Please use email/password login.';
  }

  // Navigation
  goToSignup(): void {
    this.router.navigate(['/signup']);
  }

  goToForgotPassword(): void {
    this.generalError = 'Forgot password functionality is not yet implemented. Please contact support.';
  }

  private setLoadingTip(): void {
    const tips = [
      "💪 Every workout counts towards your goals!",
      "🏃‍♂️ Consistency beats perfection every time.",
      "🌟 You're one step closer to your fitness journey!",
      "🔥 Small progress is still progress!",
      "🎯 Focus on progress, not perfection.",
      "💫 Your future self will thank you!",
      "🚀 Every expert was once a beginner.",
      "🌈 The only bad workout is the one that didn't happen."
    ];
    
    this.loadingTip = tips[Math.floor(Math.random() * tips.length)];
  }

  // Keyboard support
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.login();
    }
  }
} 