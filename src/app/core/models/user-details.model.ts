export interface UserDetails {
  age: number;
  weight: number;
  height: number;
  gender: string;
  fitnessLevel: string;
}

export interface UserWeekAvailability {
  day: string;
  startTime: string;
  endTime: string;
  duration: number;
}

export interface UserTrainingData {
  name?: string;
  age?: number;
  weight?: number;
  height?: number;
  gender?: string;
  fitnessLevel?: string;
  sports?: string[];
  ftpCycling?: number;
  ftpRunning?: number;
  swimPace?: number;
}
