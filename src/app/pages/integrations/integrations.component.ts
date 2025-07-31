import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StravaService } from '../../core/services/api/strava.service';

interface IntegrationItem {
  title: string;
  description: string;
  icon: string;
  logoSrc?: string;
  isConnected: boolean;
  route?: string;
  connectAction?: () => void;
}

@Component({
  selector: 'app-integrations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './integrations.component.html',
  styleUrls: ['./integrations.component.css']
})
export class IntegrationsComponent implements OnInit {
  isLoading = true;
  errorMessage = '';

  integrations: IntegrationItem[] = [
    {
      title: 'Strava',
      description: 'Connect with Strava to sync your activities and get detailed analytics.',
      icon: 'directions_bike',
      logoSrc: 'assets/strava-logo.png',
      isConnected: false,
      route: '/strava'
    },
    {
      title: 'Garmin Connect',
      description: 'Sync your Garmin device data with FitSense.',
      icon: 'watch',
      isConnected: false,
      // This is a placeholder - not implemented yet
      connectAction: () => this.showComingSoon('Garmin Connect')
    },
    {
      title: 'Apple Health',
      description: 'Connect with Apple Health to sync your health and fitness data.',
      icon: 'favorite',
      isConnected: false,
      // This is a placeholder - not implemented yet
      connectAction: () => this.showComingSoon('Apple Health')
    },
    {
      title: 'Google Fit',
      description: 'Sync your Google Fit data with FitSense.',
      icon: 'fitness_center',
      isConnected: false,
      // This is a placeholder - not implemented yet
      connectAction: () => this.showComingSoon('Google Fit')
    }
  ];

  constructor(
    private router: Router,
    private stravaService: StravaService
  ) {}

  ngOnInit(): void {
    this.checkStravaConnection();
  }

  checkStravaConnection(): void {
    this.isLoading = true;
    this.stravaService.checkStravaConnection().subscribe({
      next: (response) => {
        // Update Strava connection status
        const stravaIntegration = this.integrations.find(i => i.title === 'Strava');
        if (stravaIntegration) {
          stravaIntegration.isConnected = response.is_connected;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error checking Strava connection:', error);
        this.errorMessage = 'Failed to check integration status';
        this.isLoading = false;
      }
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  connectToService(integration: IntegrationItem): void {
    if (integration.isConnected && integration.route) {
      // If already connected, navigate to the integration dashboard
      this.navigateTo(integration.route);
    } else if (integration.connectAction) {
      // If not connected and has a connect action, execute it
      integration.connectAction();
    } else if (integration.route) {
      // If not connected but has a route, navigate to it
      this.navigateTo(integration.route);
    }
  }

  showComingSoon(service: string): void {
    alert(`${service} integration coming soon!`);
  }

  goBack(): void {
    this.router.navigate(['/more']);
  }
}
