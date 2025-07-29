import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/api/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  login() {
    if (this.username && this.password) {
      this.isLoading = true;
      this.errorMessage = '';

      const user: User = {
        username: this.username,
        password: this.password
      };

      this.authService.login(user).subscribe({
        next: (response) => {
          console.log('Login successful');
          this.isLoading = false;
          this.router.navigate(['/home']);
        },
        error: (error) => {
          console.error('Login error:', error);
          this.isLoading = false;
          this.errorMessage = error.error?.detail || 'Login failed. Please check your credentials.';
        }
      });
    } else {
      this.errorMessage = 'Please enter both username and password';
    }
  }

  goToSignup() {
    this.router.navigate(['/signup']);
  }
}
