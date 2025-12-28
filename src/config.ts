// Capital Shield - Configuración Profesional Blindada
const getApiKey = () => {
  const pool = import.meta.env.VITE_ODDS_KEYS;
  if (!pool) return '';
  // Limpieza total de caracteres ocultos
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
      // INTERNACIONAL
      { id: 'soccer_uefa_champs_league', name: 'UEFA Champions League' },
      { id: 'soccer_uefa_europa_league', name: 'UEFA Europa League' },
      { id: 'soccer_conmebol_copa_libertadores', name: 'Copa Libertadores' },
      { id: 'soccer_conmebol_copa_sudamericana', name: 'Copa Sudamericana' },

      // INGLATERRA
      { id: 'soccer_epl', name: 'Inglaterra - Premier League' },
      { id: 'soccer_england_efl_cup', name: 'Inglaterra - Carabao Cup' },
      { id: 'soccer_england_fa_cup', name: 'Inglaterra - FA Cup' },
      { id: 'soccer_efl_champ', name: 'Inglaterra - Championship' },

      // ESPAÑA
      { id: 'soccer_spain_la_liga', name: 'España - La Liga' },
      { id: 'soccer_spain_segunda_division', name: 'España - Segunda Division' },
      { id: 'soccer_spain_copa_del_rey', name: 'España - Copa del Rey' },

      // ITALIA
      { id: 'soccer_italy_serie_a', name: 'Italia - Serie A' },
      { id: 'soccer_italy_coppa_italia', name: 'Italia - Coppa Italia' },

      // ALEMANIA
      { id: 'soccer_germany_bundesliga', name: 'Alemania - Bundesliga' },
      { id: 'soccer_germany_dfb_pokal', name: 'Alemania - DFB Pokal' },

      // FRANCIA
      { id: 'soccer_france_ligue_one', name: 'Francia - Ligue 1' },
      { id: 'soccer_france_coupe_de_france', name: 'Francia - Coupe de France' },

      // AMÉRICAS
      { id: 'soccer_mexico_ligamx', name: 'Mexico - Liga MX' },
      { id: 'soccer_usa_mls', name: 'USA - MLS' },
      { id: 'soccer_argentina_primera_division', name: 'Argentina - Primera' },
      { id: 'soccer_brazil_campeonato', name: 'Brasil - Serie A' },
      { id: 'soccer_fifa_world_cup_qualifiers_south_america', name: 'Eliminatorias CONMEBOL' }
    ],
    NBA: [{ id: 'basketball_nba', name: 'NBA Basketball' }],
    MLB: [{ id: 'baseball_mlb', name: 'MLB Baseball' }]
  }
};
