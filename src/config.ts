export const CONFIG = {
  ODDS_API_KEY: import.meta.env.VITE_ODDS_API_KEY || '',
  ODDS_BASE_URL: 'https://api.the-odds-api.com/v4/sports',
  API_BACKEND: '/api/analizar_manual',
  LEAGUES: {
    SOCCER: [
      // PRINCIPALES Y COPAS EUROPA
      { id: 'soccer_uefa_champs_league', name: 'Champions League' },
      { id: 'soccer_uefa_europa_league', name: 'Europa League' },
      { id: 'soccer_spain_la_liga', name: 'España - La Liga' },
      { id: 'soccer_spain_segunda_division', name: 'España - La Liga 2' },
      { id: 'soccer_spain_copa_del_rey', name: 'España - Copa del Rey' },
      { id: 'soccer_england_efl_cup', name: 'Inglaterra - Carabao Cup' },
      { id: 'soccer_england_fa_cup', name: 'Inglaterra - FA Cup' },
      { id: 'soccer_epl', name: 'Inglaterra - Premier League' },
      { id: 'soccer_efl_champ', name: 'Inglaterra - Championship' },
      { id: 'soccer_italy_serie_a', name: 'Italia - Serie A' },
      { id: 'soccer_italy_coppa_italia', name: 'Italia - Coppa Italia' },
      { id: 'soccer_germany_bundesliga', name: 'Alemania - Bundesliga' },
      { id: 'soccer_germany_dfb_pokal', name: 'Alemania - DFB Pokal' },
      { id: 'soccer_france_ligue_one', name: 'Francia - Ligue 1' },
      
      // AMÉRICA
      { id: 'soccer_argentina_primera_division', name: 'Argentina - Primera' },
      { id: 'soccer_brazil_campeonato', name: 'Brasil - Serie A' },
      { id: 'soccer_mexico_ligamx', name: 'México - Liga MX' },
      { id: 'soccer_usa_mls', name: 'USA - MLS' },
      { id: 'soccer_conmebol_copa_libertadores', name: 'Copa Libertadores' },
      { id: 'soccer_conmebol_copa_sudamericana', name: 'Copa Sudamericana' },
      
      // INTERNACIONAL
      { id: 'soccer_fifa_world_cup', name: 'FIFA World Cup' },
      { id: 'soccer_fifa_world_cup_qualifiers_south_america', name: 'Eliminatorias CONMEBOL' }
    ],
    NBA: [{ id: 'basketball_nba', name: 'NBA' }],
    MLB: [{ id: 'baseball_mlb', name: 'MLB' }]
  }
};
