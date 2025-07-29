export interface TrainingPlan {
  id: number;
  title: string;
  description: string;
  type: string;
  date: string;
  duration: number;
  intensity: string;
  completed: boolean;
  scheduledTime?: string;
  notes?: string;
}

export interface TrainingPlanGenerate {
  race_date: string;
  race_type?: string;
  race_distance?: number;
  training_days_per_week?: number;
}

export interface TrainingDateUpdate {
  new_date: string;
}

export interface WorkoutSummary {
  id: string;
  title: string;
  type: string;
  duration: number;
  scheduledTime?: string;
  completed: boolean;
}

export interface SavedWorkout {
  training_plan_id: number;
  completed: boolean;
  actual_duration: number;
  perceived_exertion: number;
  notes?: string;
}

export interface TrainingStats {
  planned_workouts: number;
  completed_workouts: number;
  completion_rate: number;
  total_planned_duration: number;
  total_actual_duration: number;
  average_perceived_exertion: number;
}
