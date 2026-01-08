// ============================================
// CAPITAL SHIELD - CONFIGURACIÓN CENTRAL
// ============================================

export const CONFIG = {
  // Backend API
  API_BACKEND: '/api',
  
  // The Odds API
  ODDS_BASE_URL: 'https://api.the-odds-api.com/v4/sports',
  ODDS_API_KEY: process.env.ODDS_API_KEY || '',
  
  // ============================================
  // LIGAS DE FÚTBOL ORGANIZADAS POR REGIÓN
  // ============================================
  LEAGUES: {
    SOCCER: [
      // ========================================
      // 🇪🇺 EUROPA - MERCADO DE ÉLITE
      // ========================================
      {
        category: '🇪🇺 EUROPA - ÉLITE',
        leagues: [
          // INGLATERRA
          { 
            id: 'soccer_epl', 
            name: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League',
            country: 'England',
            league_code: 'epl'
          },
          { 
            id: 'soccer_fa_cup', 
            name: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 FA Cup',
            country: 'England',
            league_code: 'fa_cup'
          },
          { 
            id: 'soccer_league_cup', 
            name: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 EFL Cup (Carabao)',
            country: 'England',
            league_code: 'efl_cup'
          },
          
          // ESPAÑA
          { 
            id: 'soccer_spain_la_liga', 
            name: '🇪🇸 La Liga',
            country: 'Spain',
            league_code: 'laliga'
          },
          { 
            id: 'soccer_spain_copa_del_rey', 
            name: '🇪🇸 Copa del Rey',
            country: 'Spain',
            league_code: 'copa_del_rey'
          },
          { 
            id: 'soccer_spain_segunda_division', 
            name: '🇪🇸 Supercopa de España',
            country: 'Spain',
            league_code: 'supercopa'
          },
          
          // ITALIA
          { 
            id: 'soccer_italy_serie_a', 
            name: '🇮🇹 Serie A',
            country: 'Italy',
            league_code: 'seriea'
          },
          { 
            id: 'soccer_italy_serie_b', 
            name: '🇮🇹 Coppa Italia',
            country: 'Italy',
            league_code: 'coppa_italia'
          },
          { 
            id: 'soccer_italy_coppa_italia', 
            name: '🇮🇹 Supercoppa Italiana',
            country: 'Italy',
            league_code: 'supercoppa'
          },
          
          // ALEMANIA
          { 
            id: 'soccer_germany_bundesliga', 
            name: '🇩🇪 Bundesliga',
            country: 'Germany',
            league_code: 'bundesliga'
          },
          { 
            id: 'soccer_germany_bundesliga2', 
            name: '🇩🇪 DFB-Pokal',
            country: 'Germany',
            league_code: 'dfb_pokal'
          },
          
          // FRANCIA
          { 
            id: 'soccer_france_ligue_one', 
            name: '🇫🇷 Ligue 1',
            country: 'France',
            league_code: 'ligue1'
          },
          { 
            id: 'soccer_france_ligue_two', 
            name: '🇫🇷 Coupe de France',
            country: 'France',
            league_code: 'coupe_de_france'
          },
          
          // PORTUGAL
          { 
            id: 'soccer_portugal_primeira_liga', 
            name: '🇵🇹 Liga Portugal Betclic',
            country: 'Portugal',
            league_code: 'liga_portugal'
          },
          { 
            id: 'soccer_portugal_cup', 
            name: '🇵🇹 Taça de Portugal',
            country: 'Portugal',
            league_code: 'taca_de_portugal'
          },
          { 
            id: 'soccer_portugal_league_cup', 
            name: '🇵🇹 Taça da Liga',
            country: 'Portugal',
            league_code: 'taca_da_liga'
          },
          
          // PAÍSES BAJOS
          { 
            id: 'soccer_netherlands_eredivisie', 
            name: '🇳🇱 Eredivisie',
            country: 'Netherlands',
            league_code: 'eredivisie'
          },
          { 
            id: 'soccer_netherlands_cup', 
            name: '🇳🇱 KNVB Beker',
            country: 'Netherlands',
            league_code: 'knvb_beker'
          },
        ]
      },
      
      // ========================================
      // 🌎 LATINOAMÉRICA - VALOR Y VOLATILIDAD
      // ========================================
      {
        category: '🌎 LATINOAMÉRICA - VOLATILIDAD',
        leagues: [
          // BRASIL
          { 
            id: 'soccer_brazil_campeonato', 
            name: '🇧🇷 Brasileirão Série A',
            country: 'Brazil',
            league_code: 'brasileirao'
          },
          { 
            id: 'soccer_brazil_serie_b', 
            name: '🇧🇷 Copa do Brasil',
            country: 'Brazil',
            league_code: 'copa_do_brasil'
          },
          
          // ARGENTINA
          { 
            id: 'soccer_argentina_primera_division', 
            name: '🇦🇷 Liga Profesional (AFA)',
            country: 'Argentina',
            league_code: 'liga_profesional'
          },
          { 
            id: 'soccer_argentina_copa', 
            name: '🇦🇷 Copa Argentina',
            country: 'Argentina',
            league_code: 'copa_argentina'
          },
          
          // MÉXICO
          { 
            id: 'soccer_mexico_ligamx', 
            name: '🇲🇽 Liga MX',
            country: 'Mexico',
            league_code: 'liga_mx'
          },
          { 
            id: 'soccer_mexico_copa_mx', 
            name: '🇲🇽 Copa MX',
            country: 'Mexico',
            league_code: 'copa_mx'
          },
          
          // COLOMBIA
          { 
            id: 'soccer_colombia_primera_a', 
            name: '🇨🇴 Liga BetPlay Dimayor',
            country: 'Colombia',
            league_code: 'primera_a'
          },
          { 
            id: 'soccer_colombia_copa', 
            name: '🇨🇴 Copa Colombia',
            country: 'Colombia',
            league_code: 'copa_colombia'
          },
          
          // CHILE
          { 
            id: 'soccer_chile_campeonato', 
            name: '🇨🇱 Primera División',
            country: 'Chile',
            league_code: 'primera_division'
          },
          { 
            id: 'soccer_chile_copa', 
            name: '🇨🇱 Copa Chile',
            country: 'Chile',
            league_code: 'copa_chile'
          },
          
          // ECUADOR
          { 
            id: 'soccer_ecuador_ligapro', 
            name: '🇪🇨 LigaPro Serie A',
            country: 'Ecuador',
            league_code: 'ligapro'
          },
          { 
            id: 'soccer_ecuador_copa', 
            name: '🇪🇨 Copa Ecuador',
            country: 'Ecuador',
            league_code: 'copa_ecuador'
          },
          
          // PERÚ
          { 
            id: 'soccer_peru_liga_1', 
            name: '🇵🇪 Liga 1',
            country: 'Peru',
            league_code: 'liga_1'
          },
          { 
            id: 'soccer_peru_copa', 
            name: '🇵🇪 Copa Bicentenario',
            country: 'Peru',
            league_code: 'copa_bicentenario'
          },
        ]
      },
      
      // ========================================
      // 🇺🇸 USA & CANADÁ
      // ========================================
      {
        category: '🇺🇸 USA & CANADÁ',
        leagues: [
          { 
            id: 'soccer_usa_mls', 
            name: '🇺🇸 MLS (Major League Soccer)',
            country: 'USA',
            league_code: 'mls'
          },
          { 
            id: 'soccer_usa_open_cup', 
            name: '🇺🇸 Lamar Hunt U.S. Open Cup',
            country: 'USA',
            league_code: 'us_open_cup'
          },
          { 
            id: 'soccer_leagues_cup', 
            name: '🏆 Leagues Cup (MLS + Liga MX)',
            country: 'USA/Mexico',
            league_code: 'leagues_cup'
          },
        ]
      },
      
      // ========================================
      // 🏆 COMPETICIONES INTERNACIONALES
      // ========================================
      {
        category: '🏆 COMPETICIONES INTERNACIONALES',
        leagues: [
          // UEFA
          { 
            id: 'soccer_uefa_champs_league', 
            name: '⭐ UEFA Champions League',
            country: 'Europe',
            league_code: 'uefa_cl'
          },
          { 
            id: 'soccer_uefa_europa_league', 
            name: '🟡 UEFA Europa League',
            country: 'Europe',
            league_code: 'uefa_el'
          },
          { 
            id: 'soccer_uefa_europa_conference_league', 
            name: '🟢 UEFA Conference League',
            country: 'Europe',
            league_code: 'uefa_ecl'
          },
          { 
            id: 'soccer_uefa_nations_league', 
            name: '🇪🇺 UEFA Nations League',
            country: 'Europe',
            league_code: 'nations_league'
          },
          
          // CONMEBOL
          { 
            id: 'soccer_conmebol_libertadores', 
            name: '🏆 Copa CONMEBOL Libertadores',
            country: 'South America',
            league_code: 'libertadores'
          },
          { 
            id: 'soccer_conmebol_sudamericana', 
            name: '🥈 Copa Sudamericana',
            country: 'South America',
            league_code: 'sudamericana'
          },
          { 
            id: 'soccer_copa_america', 
            name: '🌎 Copa América (CONMEBOL)',
            country: 'South America',
            league_code: 'copa_america'
          },
          
          // CONCACAF
          { 
            id: 'soccer_concacaf_champions_league', 
            name: '⚽ CONCACAF Champions Cup',
            country: 'North America',
            league_code: 'concacaf_cl'
          },
          { 
            id: 'soccer_concacaf_gold_cup', 
            name: '🏅 CONCACAF Gold Cup',
            country: 'North America',
            league_code: 'gold_cup'
          },
          
          // COPAS MUNDIALES
          { 
            id: 'soccer_fifa_world_cup', 
            name: '🌍 FIFA World Cup',
            country: 'International',
            league_code: 'world_cup'
          },
          { 
            id: 'soccer_uefa_european_championship', 
            name: '🇪🇺 UEFA Euro',
            country: 'Europe',
            league_code: 'euro'
          },
        ]
      }
    ]
  }
};
