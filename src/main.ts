/**
 * @project FitSense
 * @component Web UI (Angular)
 *
 * @related_components
 * - Backend API: /home/laki-edward/PycharmProjects/Fitness_app/
 * - Android UI: /home/laki-edward/StudioProjects/FitnessApp/
 */

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
