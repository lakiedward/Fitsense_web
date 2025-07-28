import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface SettingsItem {
  title: string;
  description: string;
  icon: string;
  route?: string;
  action?: () => void;
}

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

@Component({
  selector: 'app-more',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './more.component.html',
  styleUrls: ['./more.component.css']
})
export class MoreComponent {
  userName: string = 'Athlete';
  userEmail: string = 'athlete@example.com';

  settingsSections: SettingsSection[] = [
    {
      title: 'Account',
      items: [
        {
          title: 'Profile',
          description: 'Edit your personal information',
          icon: 'person',
          route: '/profile'
        },
        {
          title: 'Notifications',
          description: 'Manage your notification preferences',
          icon: 'notifications',
          route: '/notifications'
        },
        {
          title: 'Privacy',
          description: 'Control your privacy settings',
          icon: 'security',
          route: '/privacy'
        }
      ]
    },
    {
      title: 'Training',
      items: [
        {
          title: 'Training Zones',
          description: 'Configure your heart rate and power zones',
          icon: 'speed',
          route: '/training-zones'
        },
        {
          title: 'Sport Metrics',
          description: 'Update your FTP, running pace, and swim pace',
          icon: 'fitness_center',
          route: '/sport-metrics'
        },
        {
          title: 'Training Plan',
          description: 'Adjust your training plan settings',
          icon: 'calendar_today',
          route: '/training-plan'
        }
      ]
    },
    {
      title: 'Integrations',
      items: [
        {
          title: 'App Integrations',
          description: 'Connect with Strava, Garmin, and more',
          icon: 'link',
          route: '/integrations'
        },
        {
          title: 'Devices',
          description: 'Manage your connected devices',
          icon: 'devices',
          route: '/devices'
        },
        {
          title: 'Health Connect',
          description: 'Connect with health and fitness apps',
          icon: 'favorite',
          route: '/health-connect'
        }
      ]
    },
    {
      title: 'Support',
      items: [
        {
          title: 'Help Center',
          description: 'Get help and support',
          icon: 'help',
          route: '/help'
        },
        {
          title: 'About',
          description: 'App version and information',
          icon: 'info',
          route: '/about'
        },
        {
          title: 'Logout',
          description: 'Sign out of your account',
          icon: 'logout',
          action: () => this.logout()
        }
      ]
    }
  ];

  constructor(private router: Router) {}

  navigateTo(route: string | undefined, action: (() => void) | undefined): void {
    if (action) {
      action();
    } else if (route) {
      this.router.navigate([route]);
    }
  }

  logout(): void {
    // TODO: Implement with actual auth service
    localStorage.removeItem('isLoggedIn');
    this.router.navigate(['/login']);
  }
}
