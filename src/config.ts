export const CONFIG = {
  ODDS_API_KEY: import.meta.env.VITE_ODDS_API_KEY || '',
  ODDS_BASE_URL: 'https://api.the-odds-api.com/v4/sports',
  API_BACKEND: '/api/analizar_manual',
  LEAGUES: {
    SOCCER: [
      { id: 'soccer_argentina_primera_division', name: 'Argentina - 1ª' },
      { id: 'soccer_brazil_campeonato', name: 'Brasil - Serie A' },
      { id: 'soccer_spain_la_liga', name: 'España - La Liga' },
      { id: 'soccer_epl', name: 'Inglaterra - Premier' },
      { id: 'soccer_italy_serie_a', name: 'Italia - Serie A' },
      { id: 'soccer_mexico_ligamx', name: 'México - Liga MX' },
      { id: 'soccer_usa_mls', name: 'USA - MLS' },
      { id: 'soccer_fifa_world_cup', name: 'FIFA World Cup' },
      { id: 'soccer_conmebol_copa_libertadores', name: 'Copa Libertadores' },
      { id: 'soccer_france_ligue_one', name: 'Francia - Ligue 1' },
      { id: 'soccer_germany_bundesliga', name: 'Alemania - Bundesliga' },
      // Agrega aquí el resto de la lista que pasaste siguiendo este formato
    ],
    NBA: [{ id: 'basketball_nba', name: 'NBA' }],
    MLB: [{ id: 'baseball_mlb', name: 'MLB' }]
  }
};
