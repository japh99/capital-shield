// Capital Shield - Configuración con IDs Oficiales de tu cuenta
const getApiKey = () => {
  const pool = import.meta.env.VITE_ODDS_KEYS;
  if (!pool) return '';

  // Limpieza total para iPad: quita corchetes, comillas, espacios y saltos de línea
  const cleanPool = pool.replace(/[\[\]"'\s\n\r]/g, '');
  const keys = cleanPool.split(',').filter(k => k.length > 0);
  
  if (keys.length === 0) return '';
  
  // Rotación aleatoria entre tus 50 llaves
  const randomIndex = Math.floor(Math.random() * keys.length);
  return keys[randomIndex].trim();
};

export const CONFIG = {
  ODDS_API_KEY: getApiKey(),
  ODDS_BASE_URL: 'https://api.the-odds-api.com/v4/sports',
  API_BACKEND: '/api/analizar_manual',
  LEAGUES: {
    SOCCER: [
        // Ligas de tu lista oficial (Verificadas)
        { id: 'soccer_epl', name: 'Inglaterra - Premier League' },
        { id: 'soccer_england_efl_cup', name: 'Inglaterra - EFL Cup (Carabao)' },
        { id: 'soccer_efl_champ', name: 'Inglaterra - Championship' },
        { id: 'soccer_spain_la_liga', name: 'España - La Liga' },
        { id: 'soccer_spain_segunda_division', name: 'España - La Liga 2' },
        { id: 'soccer_italy_serie_a', name: 'Italia - Serie A' },
        { id: 'soccer_germany_bundesliga', name: 'Alemania - Bundesliga' },
        { id: 'soccer_france_ligue_one', name: 'Francia - Ligue 1' },
        { id: 'soccer_mexico_ligamx', name: 'México - Liga MX' },
        { id: 'soccer_conmebol_copa_libertadores', name: 'Copa Libertadores' },
        { id: 'soccer_conmebol_copa_sudamericana', name: 'Copa Sudamericana' },
        { id: 'soccer_argentina_primera_division', name: 'Argentina - Primera' },
        { id: 'soccer_brazil_campeonato', name: 'Brasil - Serie A' },
        { id: 'soccer_chile_campeonato', name: 'Chile - Primera' },
        { id: 'soccer_usa_mls', name: 'USA - MLS' },
        { id: 'soccer_fifa_world_cup_qualifiers_south_america', name: 'Eliminatorias CONMEBOL' }
    ],
    NBA: [{ id: 'basketball_nba', name: 'NBA' }],
    MLB: [{ id: 'baseball_mlb', name: 'MLB' }]
  }
};
