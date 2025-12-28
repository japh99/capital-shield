// Capital Shield - Configuración de Datos Maestra
const getApiKey = () => {
  const pool = import.meta.env.VITE_ODDS_KEYS || '';
  const cleanPool = pool.replace(/[\[\]"'\s\n\r]/g, '');
  const keys = cleanPool.split(',').filter(k => k.length > 0);
  return keys.length > 0 ? keys[Math.floor(Math.random() * keys.length)].trim() : '';
};

export const CONFIG = {
  ODDS_API_KEY: getApiKey(),
  ODDS_BASE_URL: 'https://api.the-odds-api.com/v4/sports',
  API_BACKEND: '/api/analizar_manual',
  LEAGUES: {
    SOCCER: [
      { id: 'soccer_fifa_world_cup', name: '🌍 MUNDIAL | FIFA World Cup' },
      { id: 'soccer_uefa_champs_league', name: '🇪🇺 EUROPA | Champions League' },
      { id: 'soccer_uefa_europa_league', name: '🇪🇺 EUROPA | Europa League' },
      { id: 'soccer_epl', name: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 INGLATERRA | Premier League' },
      { id: 'soccer_england_efl_cup', name: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 INGLATERRA | Carabao Cup' },
      { id: 'soccer_england_fa_cup', name: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 INGLATERRA | FA Cup' },
      { id: 'soccer_spain_la_liga', name: '🇪🇸 ESPAÑA | La Liga' },
      { id: 'soccer_spain_copa_del_rey', name: '🇪🇸 ESPAÑA | Copa del Rey' },
      { id: 'soccer_italy_serie_a', name: '🇮🇹 ITALIA | Serie A' },
      { id: 'soccer_italy_coppa_italia', name: '🇮🇹 ITALIA | Coppa Italia' },
      { id: 'soccer_germany_bundesliga', name: '🇩🇪 ALEMANIA | Bundesliga' },
      { id: 'soccer_germany_dfb_pokal', name: '🇩🇪 ALEMANIA | DFB Pokal' },
      { id: 'soccer_france_ligue_one', name: '🇫🇷 FRANCIA | Ligue 1' },
      { id: 'soccer_france_coupe_de_france', name: '🇫🇷 FRANCIA | Coupe de France' },
      { id: 'soccer_mexico_ligamx', name: '🇲🇽 MÉXICO | Liga MX' },
      { id: 'soccer_argentina_primera_division', name: '🇦🇷 ARGENTINA | Primera Div' },
      { id: 'soccer_brazil_campeonato', name: '🇧🇷 BRASIL | Serie A' },
      { id: 'soccer_conmebol_copa_libertadores', name: '🏆 SUDAMÉRICA | Libertadores' },
      { id: 'soccer_usa_mls', name: '🇺🇸 USA | MLS' }
    ],
    NBA: [{ id: 'basketball_nba', name: '🏀 NBA' }],
    MLB: [{ id: 'baseball_mlb', name: '⚾ MLB' }]
  }
};
