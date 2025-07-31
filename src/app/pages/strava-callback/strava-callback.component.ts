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
    console.log('Callback component initialized');

    this.route.queryParams.subscribe(params => {
      console.log('Callback params:', params);

      const status = params['status'];
      const code = params['code'];
      const state = params['state'];
      const error = params['error'];

      // Get the auth session ID from localStorage (more reliable than sessionStorage)
      let authSessionId = null;
      try {
        // Try to get from opener's localStorage first
        if (window.opener && window.opener.localStorage) {
          authSessionId = window.opener.localStorage.getItem('strava_auth_session');
        }
        // Fallback to current window's localStorage
        if (!authSessionId) {
          authSessionId = localStorage.getItem('strava_auth_session');
        }
      } catch (e) {
        console.log('Could not access localStorage:', e);
        // Final fallback to sessionStorage for backward compatibility
        try {
          if (window.opener && window.opener.sessionStorage) {
            authSessionId = window.opener.sessionStorage.getItem('strava_auth_session');
          }
        } catch (e2) {
          console.log('Could not access sessionStorage either:', e2);
        }
      }

      // Handle backend redirect with status=success
      if (status === 'success') {
        console.log('Handling status=success');
        this.isProcessing = false;
        this.success = true;

        // Send success message with multiple fallback methods
        this.sendMessageToParent({
          type: 'STRAVA_AUTH_SUCCESS',
          sessionId: authSessionId,
          data: { message: 'Strava connected successfully' }
        });

        // Close window after a delay
        setTimeout(() => {
          console.log('Attempting to close window');
          this.closeWindow();
        }, 2000);
        return;
      }

      // Handle direct Strava callback (legacy flow)
      if (error) {
        console.log('Handling error:', error);
        this.handleError('Authorization was denied or cancelled', authSessionId);
        return;
      }

      if (!code || !state) {
        console.log('Missing code or state');
        this.handleError('Missing authorization code or state parameter', authSessionId);
        return;
      }

      console.log('Processing callback with code and state');
      this.processCallback(code, state, authSessionId);
    });
  }

  private sendMessageToParent(message: any) {
    console.log('Sending message to parent:', message);

    // Get the proper origin for security
    const targetOrigin = window.location.origin;

    // Try multiple methods to send the message with proper origin
    const methods = [
      () => window.opener?.postMessage(message, targetOrigin),
      () => window.parent?.postMessage(message, targetOrigin),
      () => window.top?.postMessage(message, targetOrigin),
      // Fallback with '*' for compatibility if origin-specific fails
      () => window.opener?.postMessage(message, '*'),
      () => window.parent?.postMessage(message, '*'),
      () => window.top?.postMessage(message, '*')
    ];

    methods.forEach((method, index) => {
      try {
        method();
        console.log(`Message sent via method ${index + 1}`);
      } catch (e) {
        console.log(`Method ${index + 1} failed:`, e);
      }
    });
  }

  private processCallback(code: string, state: string, authSessionId: string | null) {
    this.stravaService.handleStravaCallback(code, state).subscribe({
      next: (response) => {
        console.log('Callback processed successfully:', response);
        this.isProcessing = false;
        this.success = true;

        // Send success message
        this.sendMessageToParent({
          type: 'STRAVA_AUTH_SUCCESS',
          sessionId: authSessionId,
          data: response
        });

        // Close window after a delay
        setTimeout(() => {
          this.closeWindow();
        }, 2000);
      },
      error: (error) => {
        console.error('Callback processing failed:', error);
        this.handleError(error.error?.detail || 'Failed to process Strava callback', authSessionId);
      }
    });
  }

  private handleError(message: string, authSessionId: string | null = null) {
    console.log('Handling error:', message);
    this.isProcessing = false;
    this.error = true;
    this.errorMessage = message;

    // Send error message
    this.sendMessageToParent({
      type: 'STRAVA_AUTH_ERROR',
      sessionId: authSessionId,
      error: message
    });
  }

  closeWindow() {
    console.log('Attempting to close window');
    try {
      window.close();
    } catch (e) {
      console.log('Failed to close window:', e);
      // If window.close() fails, try to navigate back
      if (window.opener) {
        window.opener.focus();
      }
    }
  }
}
