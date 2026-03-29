// ============================================
// CAPITAL SHIELD - Types & Interfaces
// ============================================

export interface League {
  id: string;
  name: string;
  country?: string;
  league_code: string;
}

export interface LeagueCategory {
  category: string;
  leagues: League[];
}

export interface Match {
  id: string;
  home_team: string;
  away_team: string;
  commence_time: string;
  bookmakers?: Bookmaker[];
}

export interface Bookmaker {
  key: string;
  title: string;
  markets: Market[];
}

export interface Market {
  key: string;
  outcomes: Outcome[];
}

export interface Outcome {
  name: string;
  price: number;
  point?: number;
}

export interface HandicapLine {
  team: 'home' | 'away';
  line: string;
  odds: string;
}

export interface OuLine {
  type: 'over' | 'under';
  value: string;
  odds: string;
}

export interface AnalysisResult {
  team?: 'home' | 'away';
  type?: 'over' | 'under';
  line?: string;
  value?: string;
  odds?: string;
  edge: number;
  expected?: number;
}

export interface SoccerAnalysisResponse {
  expected_value: number;
  edge: number;
  home_xg: number;
  away_xg: number;
  total_goals: number;
  win_probability: number;
  status: string;
}

export interface NbaAnalysisResponse {
  expected_value: number;
  edge: number;
  status: string;
}

export interface MlbAnalysisResponse {
  expected_value: number;
  edge: number;
  total_runs: number;
  home_runs: number;
  away_runs: number;
  status: string;
}

export interface ApiErrorResponse {
  error: string;
}
