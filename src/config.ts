// Capital Shield - Configuración con Limpieza Automática de Keys
const getApiKey = () => {
  const pool = import.meta.env.VITE_ODDS_KEYS;
  
  if (!pool) {
    console.error("Variable VITE_ODDS_KEYS no encontrada");
    return '';
  }
  
  // LIMPIEZA: Eliminamos corchetes, comillas y espacios en blanco que se filtran en iPad
  const cleanPool = pool.replace(/[\[\]"'\s]/g, '');
  
  const keys = cleanPool.split(',');
  const randomIndex = Math.floor(Math.random() * keys.length);
  const selectedKey = keys[randomIndex].trim();
  
  return selectedKey;
};

export const CONFIG = {
  ODDS_API_KEY: getApiKey(),
  ODDS_BASE_URL: 'https://api.the-odds-api.com/v4/sports',
  API_BACKEND: '/api/analizar_manual',
  LEAGUES: {
    SOCCER: [
        { id: 'soccer_uefa_champs_league', name: 'Champions League' },
        { id: 'soccer_spain_la_liga', name: 'España - La Liga' },
        { id: 'soccer_spain_segunda_division', name: 'España - Segunda' },
        { id: 'soccer_england_epl', name: 'Inglaterra - Premier League' },
        { id: 'soccer_spain_copa_del_rey', name: 'España - Copa del Rey' },
        { id: 'soccer_england_efl_cup', name: 'Inglaterra - Carabao Cup' },
        { id: 'soccer_italy_serie_a', name: 'Italia - Serie A' },
        { id: 'soccer_germany_bundesliga', name: 'Alemania - Bundesliga' },
        { id: 'soccer_mexico_ligamx', name: 'México - Liga MX' },
        { id: 'soccer_brazil_campeonato', name: 'Brasil - Serie A' },
        { id: 'soccer_argentina_primera_division', name: 'Argentina - Primera' },
        { id: 'soccer_usa_mls', name: 'USA - MLS' }
    ],
    NBA: [{ id: 'basketball_nba', name: 'NBA' }],
    MLB: [{ id: 'baseball_mlb', name: 'MLB' }]
  }
};
