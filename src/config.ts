// Capital Shield - Engine de Rotación de APIs corregido
const getApiKey = () => {
  // Ajustado al nombre exacto de tu captura en Vercel
  const pool = import.meta.env.VITE_ODDS_KEYS;
  
  if (!pool) return '';
  
  // Limpiamos posibles espacios o caracteres extraños
  const keys = pool.replace(/[\[\]"]/g, '').split(',');
  const randomIndex = Math.floor(Math.random() * keys.length);
  return keys[randomIndex].trim();
};

export const CONFIG = {
  ODDS_API_KEY: getApiKey(),
  ODDS_BASE_URL: 'https://api.the-odds-api.com/v4/sports',
  API_BACKEND: '/api/analizar_manual',
  LEAGUES: {
    SOCCER: [
        { id: 'soccer_uefa_champs_league', name: 'Champions League' },
        { id: 'soccer_spain_la_liga', name: 'España - La Liga' },
        { id: 'soccer_england_epl', name: 'Inglaterra - Premier League' },
        { id: 'soccer_spain_copa_del_rey', name: 'España - Copa del Rey' },
        { id: 'soccer_england_efl_cup', name: 'Inglaterra - Carabao Cup' },
        { id: 'soccer_italy_serie_a', name: 'Italia - Serie A' },
        { id: 'soccer_germany_bundesliga', name: 'Alemania - Bundesliga' },
        { id: 'soccer_mexico_ligamx', name: 'México - Liga MX' },
        { id: 'soccer_brazil_campeonato', name: 'Brasil - Serie A' },
        { id: 'soccer_argentina_primera_division', name: 'Argentina - Primera' },
        { id: 'soccer_usa_mls', name: 'USA - MLS' },
        { id: 'soccer_fifa_world_cup', name: 'FIFA World Cup' }
    ],
    NBA: [{ id: 'basketball_nba', name: 'NBA' }],
    MLB: [{ id: 'baseball_mlb', name: 'MLB' }]
  }
};
