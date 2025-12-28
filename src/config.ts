export const CONFIG = {
  // Configuración de The Odds API
  ODDS_API_KEY:  // Aquí pondrás tus llaves
  ODDS_BASE_URL: 'https://api.the-odds-api.com/v4/sports',
  
  // Endpoint de tu Backend en Vercel
  API_BACKEND: '/api/analizar_manual',

  // Listado de Ligas Soportadas
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
