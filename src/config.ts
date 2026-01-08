// ============================================
// CAPITAL SHIELD - CONFIGURACIÓN CENTRAL
// ============================================

// 🔑 POOL DE 50 API KEYS PARA ROTACIÓN
const API_KEYS = [
  "734f30d0866696cf90d5029ac106cfba",
  "10fb6d9d7b3240906d0acea646068535",
  "a9ff72549c4910f1fa9659e175a35cc0",
  "25e9d8872877f5110254ff6ef42056c6",
  "6205cdb2cfd889e6fc44518f950f7dad",
  "d39a6f31abf6412d46b2c7185a5dfffe",
  "fbd5dece2a99c992cfd783aedfcd2ef3",
  "687ba857bcae9c7f33545dcbe59aeb2b",
  "f9ff83040b9d2afc1862094694f53da2",
  "f730fa9137a7cd927554df334af916dc",
  "9091ec0ea25e0cdfc161b91603e31a9a",
  "c0f7d526dd778654dfee7c0686124a77",
  "61a015bc1506aac11ec62901a6189dc6",
  "d585a73190a117c1041ccc78b92b23d9",
  "4056628d07b0b900175cb332c191cda0",
  "ac4d3eb2d6df42030568eadeee906770",
  "3cebba62ff5330d1a409160e6870bfd6",
  "358644d442444f95bd0b0278e4d3ea22",
  "45dff0519cde0396df06fc4bc1f9bce1",
  "a4f585765036f57be0966b39125f87a0",
  "349f8eff303fa0963424c54ba181535b",
  "f54405559ba5aaa27a9687992a84ae2f",
  "24772de60f0ebe37a554b179e0dd819f",
  "b7bdefecc83235f7923868a0f2e3e114",
  "3a9d3110045fd7373875bdbc7459c82c",
  "d2aa9011f39bfcb309b3ee1da6328573",
  "107ad40390a24eb61ee02ff976f3d3ac",
  "8f6358efeec75d6099147764963ae0f8",
  "672962843293d4985d0bed1814d3b716",
  "4b1867baf919f992554c77f493d258c5",
  "b3fd66af803adc62f00122d51da7a0e6",
  "53ded39e2281f16a243627673ad2ac8c",
  "bf785b4e9fba3b9cd1adb99b9905880b",
  "60e3b2a9a7324923d78bfc6dd6f3e5d3",
  "cc16776a60e3eee3e1053577216b7a29",
  "a0cc233165bc0ed04ee42feeaf2c9d30",
  "d2afc749fc6b64adb4d8361b0fe58b4b",
  "b351eb6fb3f5e95b019c18117e93db1b",
  "74dbc42e50dd64687dc1fad8af59c490",
  "7b4a5639cbe63ddf37b64d7e327d3e71",
  "20cec1e2b8c3fd9bb86d9e4fad7e6081",
  "1352436d9a0e223478ec83aec230b4aa",
  "29257226d1c9b6a15c141d989193ef72",
  "24677adc5f5ff8401c6d98ea033e0f0b",
  "54e84a82251def9696ba767d6e2ca76c",
  "ff3e9e3a12c2728c6c4ddea087bc51a9",
  "f3ff0fb5d7a7a683f88b8adec904e7b8",
  "1e0ab1ff51d111c88aebe4723020946a",
  "6f74a75a76f42fabaa815c4461c59980",
  "86de2f86b0b628024ef6d5546b479c0f"
];

// Variable para trackear el índice actual
let currentKeyIndex = 0;

export const CONFIG = {
  // Backend API
  API_BACKEND: '/api',
  
  // The Odds API
  ODDS_BASE_URL: 'https://api.the-odds-api.com/v4/sports',
  
  // Pool de keys
  API_KEYS: API_KEYS,
  
  // Función simple de rotación
  ODDS_API_KEY: API_KEYS[0], // Default (no se usará, pero por compatibilidad)
  
  // Obtener siguiente key con rotación
  getNextKey: () => {
    const key = API_KEYS[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    return key;
  },
  
  // ============================================
  // LIGAS DE FÚTBOL CON COPAS INCLUIDAS
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
            id: 'soccer_england_efl_cup', 
            name: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 EFL Cup (Carabao)',
            country: 'England',
            league_code: 'efl_cup'
          },
          { 
            id: 'soccer_efl_champ', 
            name: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Championship',
            country: 'England',
            league_code: 'championship'
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
            id: 'soccer_spain_super_cup', 
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
            id: 'soccer_italy_coppa_italia', 
            name: '🇮🇹 Coppa Italia',
            country: 'Italy',
            league_code: 'coppa_italia'
          },
          { 
            id: 'soccer_italy_supercoppa', 
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
            id: 'soccer_germany_dfb_pokal', 
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
            id: 'soccer_france_coupe_de_france', 
            name: '🇫🇷 Coupe de France',
            country: 'France',
            league_code: 'coupe_de_france'
          },
          { 
            id: 'soccer_france_trophee_des_champions', 
            name: '🇫🇷 Trophée des Champions',
            country: 'France',
            league_code: 'trophee_des_champions'
          },
          
          // PORTUGAL
          { 
            id: 'soccer_portugal_primeira_liga', 
            name: '🇵🇹 Liga Portugal',
            country: 'Portugal',
            league_code: 'liga_portugal'
          },
          { 
            id: 'soccer_portugal_taca_de_portugal', 
            name: '🇵🇹 Taça de Portugal',
            country: 'Portugal',
            league_code: 'taca_de_portugal'
          },
          { 
            id: 'soccer_portugal_taca_da_liga', 
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
            id: 'soccer_netherlands_knvb_beker', 
            name: '🇳🇱 KNVB Beker',
            country: 'Netherlands',
            league_code: 'knvb_beker'
          },
          
          // BÉLGICA
          { 
            id: 'soccer_belgium_first_div', 
            name: '🇧🇪 Pro League',
            country: 'Belgium',
            league_code: 'pro_league'
          },
          { 
            id: 'soccer_belgium_cup', 
            name: '🇧🇪 Coupe de Belgique',
            country: 'Belgium',
            league_code: 'coupe_de_belgique'
          },
          
          // TURQUÍA
          { 
            id: 'soccer_turkey_super_league', 
            name: '🇹🇷 Süper Lig',
            country: 'Turkey',
            league_code: 'super_lig'
          },
          { 
            id: 'soccer_turkey_cup', 
            name: '🇹🇷 Turkish Cup',
            country: 'Turkey',
            league_code: 'turkish_cup'
          },
          
          // OTROS EUROPEOS
          { 
            id: 'soccer_austria_bundesliga', 
            name: '🇦🇹 Bundesliga Austria',
            country: 'Austria',
            league_code: 'bundesliga_austria'
          },
          { 
            id: 'soccer_switzerland_superleague', 
            name: '🇨🇭 Super League',
            country: 'Switzerland',
            league_code: 'super_league'
          },
          { 
            id: 'soccer_denmark_superliga', 
            name: '🇩🇰 Superliga',
            country: 'Denmark',
            league_code: 'superliga'
          },
          { 
            id: 'soccer_sweden_allsvenskan', 
            name: '🇸🇪 Allsvenskan',
            country: 'Sweden',
            league_code: 'allsvenskan'
          },
          { 
            id: 'soccer_norway_eliteserien', 
            name: '🇳🇴 Eliteserien',
            country: 'Norway',
            league_code: 'eliteserien'
          },
          { 
            id: 'soccer_poland_ekstraklasa', 
            name: '🇵🇱 Ekstraklasa',
            country: 'Poland',
            league_code: 'ekstraklasa'
          },
          { 
            id: 'soccer_greece_super_league', 
            name: '🇬🇷 Super League',
            country: 'Greece',
            league_code: 'super_league_greece'
          },
          { 
            id: 'soccer_spl', 
            name: '🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scottish Premiership',
            country: 'Scotland',
            league_code: 'premiership'
          },
          { 
            id: 'soccer_league_of_ireland', 
            name: '🇮🇪 League of Ireland',
            country: 'Ireland',
            league_code: 'league_ireland'
          },
        ]
      },
      
      // ========================================
      // 🌎 LATINOAMÉRICA
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
            name: '🇧🇷 Série B',
            country: 'Brazil',
            league_code: 'brasileirao_b'
          },
          { 
            id: 'soccer_brazil_copa_do_brasil', 
            name: '🇧🇷 Copa do Brasil',
            country: 'Brazil',
            league_code: 'copa_do_brasil'
          },
          
          // ARGENTINA
          { 
            id: 'soccer_argentina_primera_division', 
            name: '🇦🇷 Liga Profesional',
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
          
          // COLOMBIA
          { 
            id: 'soccer_colombia_primera_a', 
            name: '🇨🇴 Liga BetPlay',
            country: 'Colombia',
            league_code: 'primera_a'
          },
          { 
            id: 'soccer_colombia_copa', 
            name: '🇨🇴 Copa Colombia',
            country: 'Colombia',
            league_code: 'copa_colombia'
          },
          
          // ECUADOR
          { 
            id: 'soccer_ecuador_ligapro', 
            name: '🇪🇨 LigaPro',
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
      // 🇺🇸 USA & ASIA
      // ========================================
      {
        category: '🇺🇸 USA & ASIA',
        leagues: [
          { 
            id: 'soccer_usa_mls', 
            name: '🇺🇸 MLS',
            country: 'USA',
            league_code: 'mls'
          },
          { 
            id: 'soccer_usa_open_cup', 
            name: '🇺🇸 U.S. Open Cup',
            country: 'USA',
            league_code: 'us_open_cup'
          },
          { 
            id: 'soccer_concacaf_leagues_cup', 
            name: '🏆 Leagues Cup',
            country: 'USA/Mexico',
            league_code: 'leagues_cup'
          },
          { 
            id: 'soccer_japan_j_league', 
            name: '🇯🇵 J League',
            country: 'Japan',
            league_code: 'j_league'
          },
          { 
            id: 'soccer_korea_kleague1', 
            name: '🇰🇷 K League 1',
            country: 'Korea',
            league_code: 'k_league'
          },
          { 
            id: 'soccer_china_superleague', 
            name: '🇨🇳 Super League',
            country: 'China',
            league_code: 'super_league_china'
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
            name: '🏆 Copa Libertadores',
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
            name: '🌎 Copa América',
            country: 'South America',
            league_code: 'copa_america'
          },
          
          // CONCACAF
          { 
            id: 'soccer_concacaf_champions_cup', 
            name: '⚽ CONCACAF Champions Cup',
            country: 'North America',
            league_code: 'concacaf_cl'
          },
          { 
            id: 'soccer_concacaf_gold_cup', 
            name: '🏅 Gold Cup',
            country: 'North America',
            league_code: 'gold_cup'
          },
          
          // COPAS MUNDIALES
          { 
            id: 'soccer_fifa_world_cup_winner', 
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
          { 
            id: 'soccer_fifa_world_cup_qualifiers_south_america', 
            name: '🌎 WC Qualifiers CONMEBOL',
            country: 'South America',
            league_code: 'wc_qualifiers_sa'
          },
          { 
            id: 'soccer_fifa_world_cup_qualifiers_europe', 
            name: '🇪🇺 WC Qualifiers UEFA',
            country: 'Europe',
            league_code: 'wc_qualifiers_uefa'
          },
        ]
      }
    ]
  }
};
