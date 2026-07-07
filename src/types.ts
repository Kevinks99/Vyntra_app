export type ActiveScreen = 
  | 'splash'
  | 'onboarding'
  | 'login'
  | 'dashboard'
  | 'sleep'
  | 'fitness'
  | 'weight'
  | 'nutrition'
  | 'profile'
  | 'agenda'
  | 'ranking'
  | 'estudos'
  | 'biblioteca'
  | 'assistant';

export interface RankedUser {
  id: string;
  name: string;
  avatarUrl: string;
  points: number;
  streak: number;
  rank: number;
  isCurrentUser?: boolean;
}

export interface UserProfile {
  name: string;
  location: string;
  temperature: string;
  avatarUrl: string;
  avatarFitnessUrl: string;
  avatarSleepUrl: string;
  avatarWeightUrl: string;
  avatarNutritionUrl: string;
  streakDays: number;
}

export interface WeightLog {
  day: string;
  weight: number;
}

export interface Meal {
  id: string;
  type: 'Café da Manhã' | 'Almoço' | 'Lanche' | 'Jantar';
  time: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  imageUrl: string;
  completed: boolean;
}

export interface Workout {
  id: string;
  type: 'Musculação' | 'Corrida' | 'Yoga Transcendente' | string;
  timeMinutes: number;
  caloriesBurned: number;
  intensity: 'Alta' | 'Intensa' | 'Baixa' | string;
  icon: string;
  color: string;
}

export interface SleepLog {
  day: string;
  hours: number;
  score: number;
}

export interface AgendaEvent {
  id: string;
  time: string;
  endTime?: string;
  category: string;
  title: string;
  locationOrMode?: string;
  dateString: string; // YYYY-MM-DD
  alertEnabled?: boolean;
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  progress: number;
  status: 'EM PROGRESSO' | 'PAUSADO' | 'CONCLUÍDO';
  bannerUrl: string;
  nextClass: string;
  icon: string;
  linkUrl?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  progressPercent: number;
  currentPage: number;
  totalPages: number;
  coverUrl: string;
  format?: 'Físico' | 'Digital';
  bookUrl?: string;
}

export interface RecentActivity {
  id: string;
  text: string;
  time: string;
  iconType: 'book' | 'add' | 'edit';
}

export interface AppState {
  profile: UserProfile;
  waterIntakeCups: number;
  waterIntakeGoalCups: number;
  currentWeight: number;
  weightGoal: number;
  weightLogs: WeightLog[];
  weightViewMode: 'weekly' | 'monthly';
  meals: Meal[];
  workouts: Workout[];
  sleepScore: number;
  sleepGoalHours: number;
  bedTime: string;
  wakeTime: string;
  sleepLogs: SleepLog[];
  dailyProgressPercentage: number;
  ringCalories: number;
  ringCaloriesGoal: number;
  ringMinutes: number;
  ringMinutesGoal: number;
  ringStand: number;
  ringStandGoal: number;
  // Expanded modules
  agendaEvents: AgendaEvent[];
  courses: Course[];
  books: Book[];
  recentActivities: RecentActivity[];
  notificationsEnabled: boolean;
  biometricsEnabled: boolean;
  contacts?: RankedUser[];
}
