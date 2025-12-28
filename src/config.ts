export const CONFIG = {
  // Ahora usamos variables de entorno de Vite
  ODDS_API_KEY: import.meta.env.VITE_ODDS_API_KEY || '', 
  ODDS_BASE_URL: 'https://api.the-odds-api.com/v4/sports',
  
  API_BACKEND: '/api/analizar_manual',

  LEAGUES: {
    SOCCER: [
      { id: 'soccer_usa_mls', name: 'MLS (USA)' },
      { id: 'soccer_spain_la_liga', name: 'La Liga (España)' },
      { id: 'soccer_epl', name: 'Premier League (UK)' }
    ],
    NBA: [
      { id: 'basketball_nba', name: 'NBA' }
    ],
    MLB: [
      { id: 'baseball_mlb', name: 'MLB' }
    ]
  }
};
