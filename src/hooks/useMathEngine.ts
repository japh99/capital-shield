import axios from 'axios';
import { useCallback, useState } from 'react';
import { 
  SoccerAnalysisResponse, 
  NbaAnalysisResponse, 
  MlbAnalysisResponse,
  ApiErrorResponse 
} from '../types';

interface UseMathEngineOptions {
  baseUrl?: string;
}

/**
 * Hook para interactuar con el motor matemático del backend
 */
export const useMathEngine = (options: UseMathEngineOptions = {}) => {
  const { baseUrl = '/api' } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeSoccer = useCallback(
    async (
      homeElo: number,
      awayElo: number,
      line: number,
      league: string
    ): Promise<SoccerAnalysisResponse | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post<SoccerAnalysisResponse>(baseUrl, {
          task: 'math',
          sport: 'soccer',
          h_rating: homeElo,
          a_rating: awayElo,
          line,
          league
        });
        return response.data;
      } catch (e: any) {
        const errorMsg = e.response?.data?.error || 'Error en análisis soccer';
        setError(errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [baseUrl]
  );

  const analyzeNba = useCallback(
    async (
      homeRating: number,
      awayRating: number,
      line: number
    ): Promise<NbaAnalysisResponse | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post<NbaAnalysisResponse>(baseUrl, {
          task: 'math',
          sport: 'nba',
          h_rating: homeRating,
          a_rating: awayRating,
          line
        });
        return response.data;
      } catch (e: any) {
        const errorMsg = e.response?.data?.error || 'Error en análisis NBA';
        setError(errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [baseUrl]
  );

  const analyzeMlb = useCallback(
    async (
      homeRating: number,
      awayRating: number,
      line: number,
      homePitcherEra?: number,
      awayPitcherEra?: number
    ): Promise<MlbAnalysisResponse | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post<MlbAnalysisResponse>(baseUrl, {
          task: 'math',
          sport: 'mlb',
          h_rating: homeRating,
          a_rating: awayRating,
          line,
          h_pitcher_era: homePitcherEra,
          a_pitcher_era: awayPitcherEra
        });
        return response.data;
      } catch (e: any) {
        const errorMsg = e.response?.data?.error || 'Error en análisis MLB';
        setError(errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [baseUrl]
  );

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    analyzeSoccer,
    analyzeNba,
    analyzeMlb,
    resetError
  };
};
