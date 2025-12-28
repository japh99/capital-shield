// Capital Shield - Configuración Profesional
const getApiKey = () => {
  const pool = import.meta.env.VITE_ODDS_KEYS;
  if (!pool) return '';
  const cleanPool = pool.replace(/[\[\]"'\s\n\r]/g, '');
  const keys = cleanPool.split(',').filter(k => k.length > 0);
  if (keys.length === 0) return '';
  const randomIndex = Math.floor(Math.random() * keys.length);
  return keys[randomIndex].trim();
};

export const CONFIG = {
  ODDS_API_KEY: getApiKey(),
  ODDS_BASE_URL: 'https://api.the-odds-api.com/v4/sports',
  API_BACKEND: '/api/analizar_manual',
  LEAGUES: {
    SOCCER: [
      { id: 'soccer_uefa_champs_league', name: '🇪🇺 UEFA Champions League' },
      { id: 'soccer_epl', name: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra - Premier League' },
      { id: 'soccer_england_efl_cup', name: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra - Carabao Cup' },
      { id: 'soccer_efl_champ', name: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra - Championship' },
      { id: 'soccer_spain_la_liga', name: '🇪🇸 España - La Liga' },
      { id: 'soccer_spain_segunda_division', name: '🇪🇸 España - Segunda División' },
      { id: 'soccer_italy_serie_a', name: '🇮🇹 Italia - Serie A' },
      { id: 'soccer_germany_bundesliga', name: '🇩🇪 Alemania - Bundesliga' },
      { id: 'soccer_france_ligue_one', name: '🇫🇷 Francia - Ligue 1' },
      { id: 'soccer_mexico_ligamx', name: '🇲🇽 México - Liga MX' },
      { id: 'soccer_argentina_primera_division', name: '🇦🇷 Argentina - Primera' },
      { id: 'soccer_brazil_campeonato', name: '🇧🇷 Brasil - Serie A' },
      { id: 'soccer_conmebol_copa_libertadores', name: '🏆 Copa Libertadores' },
      { id: 'soccer_usa_mls', name: '🇺🇸 USA - MLS' }
    ],
    NBA: [{ id: 'basketball_nba', name: '🏀 NBA' }],
    MLB: [{ id: 'baseball_mlb', name: '⚾ MLB' }]
  }
};
