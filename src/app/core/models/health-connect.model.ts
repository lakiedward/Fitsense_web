export interface HealthConnectActivity {
  id: string;
  source: string;
  type: string;
  start_time: string;
  end_time: string;
  duration: number;
  distance?: number;
  calories?: number;
  heart_rate_avg?: number;
  heart_rate_max?: number;
  steps?: number;
  speed_avg?: number;
  speed_max?: number;
  power_avg?: number;
  power_max?: number;
  cadence_avg?: number;
  cadence_max?: number;
  elevation_gain?: number;
}

export interface HealthConnectStats {
  total_activities: number;
  total_duration: number;
  total_distance: number;
  total_calories: number;
  activities_by_type: {
    [key: string]: number;
  };
  activities_by_month: {
    [key: string]: number;
  };
}

export interface HealthConnectSyncRequest {
  start_time?: string;
  end_time?: string;
  types?: string[];
}

export interface HealthConnectSyncResponse {
  synced_activities: number;
  new_activities: number;
  updated_activities: number;
  sync_time: string;
}

export interface LastSyncResponse {
  last_sync: string | null;
}

export interface DeleteActivityResponse {
  success: boolean;
  message: string;
}
