import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StravaService, StravaActivity, StravaAthlete } from '../../core/services/api/strava.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-strava-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="strava-dashboard">
      <div class="header">
        <h1>Strava Integration</h1>
        <div class="connection-status" [class.connected]="isConnected" [class.disconnected]="!isConnected">
          <span class="status-indicator"></span>
          {{ isConnected ? 'Connected' : 'Not Connected' }}
        </div>
      </div>

      <!-- Connection Section -->
      <div class="connection-section" *ngIf="!isConnected">
        <div class="connect-card">
          <div class="strava-logo">
            <img src="assets/strava-logo.png" alt="Strava" />
          </div>
          <h2>Connect to Strava</h2>
          <p>Connect your Strava account to sync your activities and get detailed analytics.</p>
          <button
            class="connect-btn"
            (click)="connectToStrava()"
            [disabled]="isLoading"
            *ngIf="!errorMessage">
            <span *ngIf="isLoading" class="spinner"></span>
            {{ isLoading ? 'Connecting...' : 'Connect to Strava' }}
          </button>

          <!-- Error state with retry button -->
          <div class="error-section" *ngIf="errorMessage">
            <div class="error-message">
              <span class="error-icon">⚠️</span>
              {{ errorMessage }}
            </div>
            <div class="error-actions">
              <button class="retry-btn" (click)="retryStravaConnection()" [disabled]="isLoading">
                <span *ngIf="isLoading" class="spinner"></span>
                {{ isLoading ? 'Connecting...' : 'Try Again' }}
              </button>
            </div>
            <p class="error-help" *ngIf="errorMessage.includes('Popup was blocked')">
              💡 <strong>Tip:</strong> Please allow popups for this site in your browser settings and try again.
            </p>
          </div>
        </div>
      </div>

      <!-- Connected Section -->
      <div class="connected-section" *ngIf="isConnected">
        <!-- Athlete Info -->
        <div class="athlete-card" *ngIf="athlete">
          <div class="athlete-header">
            <img [src]="athlete.profile_medium" [alt]="athlete.firstname + ' ' + athlete.lastname" class="profile-pic" />
            <div class="athlete-info">
              <h2>{{ athlete.firstname }} {{ athlete.lastname }}</h2>
              <p class="location" *ngIf="athlete.city || athlete.state || athlete.country">
                {{ formatLocation(athlete.city, athlete.state, athlete.country) }}
              </p>
              <span class="premium-badge" *ngIf="athlete.premium">Premium</span>
            </div>
            <button class="disconnect-btn" (click)="disconnectFromStrava()">
              Disconnect
            </button>
          </div>
        </div>

        <!-- Actions -->
        <div class="actions-section">
          <div class="action-card">
            <h3>Sync Activities</h3>
            <p>Sync your latest activities from Strava</p>
            <button
              class="action-btn sync-btn"
              (click)="syncActivities()"
              [disabled]="isSyncing">
              <span *ngIf="isSyncing" class="spinner"></span>
              {{ isSyncing ? 'Syncing...' : 'Sync Now' }}
            </button>
          </div>

          <div class="action-card">
            <h3>Comprehensive Analysis</h3>
            <p>Get detailed fitness analysis based on your activities</p>
            <button
              class="action-btn analysis-btn"
              (click)="runComprehensiveAnalysis()"
              [disabled]="isAnalyzing">
              <span *ngIf="isAnalyzing" class="spinner"></span>
              {{ isAnalyzing ? 'Analyzing...' : 'Run Analysis' }}
            </button>
          </div>
        </div>

        <!-- Recent Activities -->
        <div class="activities-section" *ngIf="activities.length > 0">
          <h3>Recent Activities</h3>
          <div class="activities-grid">
            <div class="activity-card" *ngFor="let activity of activities.slice(0, 6)">
              <div class="activity-header">
                <span class="activity-type">{{ activity.type }}</span>
                <span class="activity-date">{{ formatDate(activity.start_date) }}</span>
              </div>
              <h4>{{ activity.name }}</h4>
              <div class="activity-stats">
                <div class="stat">
                  <span class="label">Distance</span>
                  <span class="value">{{ formatDistance(activity.distance) }}</span>
                </div>
                <div class="stat">
                  <span class="label">Time</span>
                  <span class="value">{{ formatTime(activity.moving_time) }}</span>
                </div>
                <div class="stat" *ngIf="activity.average_heartrate">
                  <span class="label">Avg HR</span>
                  <span class="value">{{ activity.average_heartrate }} bpm</span>
                </div>
              </div>
            </div>
          </div>
          <button class="view-all-btn" (click)="viewAllActivities()">
            View All Activities
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .strava-dashboard {
      padding: 1rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .connection-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 500;
    }

    .connection-status.connected {
      background: #d4edda;
      color: #155724;
    }

    .connection-status.disconnected {
      background: #f8d7da;
      color: #721c24;
    }

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
    }

    .connect-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      text-align: center;
      max-width: 400px;
      margin: 0 auto;
    }

    .strava-logo img {
      height: 60px;
      margin-bottom: 1rem;
    }

    .connect-btn {
      background: #fc4c02;
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 1rem auto 0;
    }

    .connect-btn:hover:not(:disabled) {
      background: #e03d00;
    }

    .connect-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .athlete-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }

    .athlete-header {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .profile-pic {
      width: 60px;
      height: 60px;
      border-radius: 50%;
    }

    .athlete-info {
      flex: 1;
    }

    .athlete-info h2 {
      margin: 0 0 0.25rem 0;
      color: #333;
    }

    .location {
      color: #666;
      margin: 0;
    }

    .premium-badge {
      background: #fc4c02;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .disconnect-btn {
      background: #dc3545;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
    }

    .actions-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .action-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .action-btn {
      background: #007bff;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .sync-btn {
      background: #28a745;
    }

    .analysis-btn {
      background: #6f42c1;
    }

    .activities-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .activity-card {
      background: white;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }

    .activity-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .activity-type {
      background: #e9ecef;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .activity-date {
      color: #666;
      font-size: 0.875rem;
    }

    .activity-stats {
      display: flex;
      gap: 1rem;
      margin-top: 0.5rem;
    }

    .stat {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .stat .label {
      font-size: 0.75rem;
      color: #666;
      text-transform: uppercase;
    }

    .stat .value {
      font-weight: 600;
      color: #333;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-message {
      color: #dc3545;
      margin-top: 1rem;
      padding: 0.75rem;
      background: #f8d7da;
      border-radius: 6px;
    }

    .view-all-btn {
      background: #6c757d;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      width: 100%;
    }
  `]
})
export class StravaDashboardComponent implements OnInit {
  isConnected = false;
  isLoading = false;
  isSyncing = false;
  isAnalyzing = false;
  errorMessage = '';

  athlete: StravaAthlete | null = null;
  activities: StravaActivity[] = [];

  constructor(private stravaService: StravaService) {}

  ngOnInit() {
    this.checkConnectionStatus();
  }

  async checkConnectionStatus() {
    try {
      const status = await firstValueFrom(this.stravaService.checkStravaConnection());
      this.isConnected = status.connected;

      if (this.isConnected) {
        await this.loadAthleteData();
        await this.loadRecentActivities();
      }
    } catch (error) {
      console.error('Error checking Strava connection:', error);
      this.isConnected = false;
    }
  }

  async connectToStrava() {
    try {
      this.isLoading = true;
      this.errorMessage = '';

      // Use the centralized OAuth service
      const result = await this.stravaService.initiateStravaConnect();

      if (result.success) {
        this.isConnected = true;
        this.isLoading = false;

        // Load data in parallel for better performance
        await Promise.all([
          this.loadAthleteData(),
          this.loadRecentActivities()
        ]);
      } else {
        this.errorMessage = result.error || 'Failed to connect to Strava';
        this.isLoading = false;
      }
    } catch (error: any) {
      console.error('Strava connection error:', error);
      this.errorMessage = error.message || 'Failed to connect to Strava';
      this.isLoading = false;
    }
  }

  // Retry connection method for better UX
  retryStravaConnection() {
    this.connectToStrava();
  }

  async disconnectFromStrava() {
    try {
      await firstValueFrom(this.stravaService.disconnectStrava());
      this.isConnected = false;
      this.athlete = null;
      this.activities = [];
    } catch (error) {
      console.error('Error disconnecting from Strava:', error);
    }
  }

  async loadAthleteData() {
    try {
      this.athlete = await firstValueFrom(this.stravaService.getStravaAthlete());
    } catch (error) {
      console.error('Error loading athlete data:', error);
    }
  }

  async loadRecentActivities() {
    try {
      this.activities = await firstValueFrom(this.stravaService.getActivities());
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  }

  async syncActivities() {
    try {
      this.isSyncing = true;
      // Note: This would typically be a Server-Sent Events endpoint
      // For now, we'll just refresh the activities
      await this.loadRecentActivities();
      this.isSyncing = false;
    } catch (error) {
      console.error('Error syncing activities:', error);
      this.isSyncing = false;
    }
  }

  async runComprehensiveAnalysis() {
    try {
      this.isAnalyzing = true;
      const analysis = await firstValueFrom(this.stravaService.getComprehensiveAnalysis());
      console.log('Comprehensive analysis:', analysis);
      // You could show the analysis results in a modal or navigate to a results page
      this.isAnalyzing = false;
    } catch (error) {
      console.error('Error running comprehensive analysis:', error);
      this.isAnalyzing = false;
    }
  }

  viewAllActivities() {
    // Navigate to activities page or show all activities
    console.log('View all activities');
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatDistance(meters: number): string {
    const km = meters / 1000;
    return `${km.toFixed(1)} km`;
  }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  formatLocation(city?: string, state?: string, country?: string): string {
    return [city, state, country].filter(item => item && item.trim()).join(', ');
  }
}
