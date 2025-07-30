import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { StravaService } from '../../core/services/api/strava.service';

@Component({
  selector: 'app-strava-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="callback-container">
      <div class="callback-content">
        <div *ngIf="isProcessing" class="processing">
          <div class="spinner"></div>
          <p>Processing Strava connection...</p>
        </div>

        <div *ngIf="success" class="success">
          <div class="success-icon">✓</div>
          <h2>Successfully connected to Strava!</h2>
          <p>You can now close this window and return to the app.</p>
        </div>

        <div *ngIf="error" class="error">
          <div class="error-icon">✗</div>
          <h2>Connection failed</h2>
          <p>{{ errorMessage }}</p>
          <button (click)="closeWindow()">Close</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .callback-content {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      text-align: center;
      max-width: 400px;
      width: 90%;
    }

    .processing {
      color: #666;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .success {
      color: #28a745;
    }

    .success-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .error {
      color: #dc3545;
    }

    .error-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    button {
      background: #667eea;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
      margin-top: 1rem;
    }

    button:hover {
      background: #5a6fd8;
    }

    h2 {
      margin: 1rem 0;
      color: #333;
    }

    p {
      margin: 0.5rem 0;
      line-height: 1.5;
    }
  `]
})
export class StravaCallbackComponent implements OnInit {
  isProcessing = true;
  success = false;
  error = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private stravaService: StravaService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      const state = params['state'];
      const error = params['error'];

      if (error) {
        this.handleError('Authorization was denied or cancelled');
        return;
      }

      if (!code || !state) {
        this.handleError('Missing authorization code or state parameter');
        return;
      }

      this.processCallback(code, state);
    });
  }

  private processCallback(code: string, state: string) {
    this.stravaService.handleStravaCallback(code, state).subscribe({
      next: (response) => {
        this.isProcessing = false;
        this.success = true;

        // Notify parent window of success
        if (window.opener) {
          window.opener.postMessage({
            type: 'STRAVA_AUTH_SUCCESS',
            data: response
          }, window.location.origin);
        }

        // Auto-close after 3 seconds
        setTimeout(() => {
          window.close();
        }, 3000);
      },
      error: (error) => {
        this.handleError(error.error?.detail || 'Failed to process Strava callback');
      }
    });
  }

  private handleError(message: string) {
    this.isProcessing = false;
    this.error = true;
    this.errorMessage = message;

    // Notify parent window of error
    if (window.opener) {
      window.opener.postMessage({
        type: 'STRAVA_AUTH_ERROR',
        error: message
      }, window.location.origin);
    }
  }

  closeWindow() {
    window.close();
  }
}
