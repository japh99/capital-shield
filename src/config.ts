// ============================================
// CAPITAL SHIELD - CONFIGURACIÓN COMPLETA FINAL
// ============================================

// 🔑 POOL DE 50 API KEYS
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

let keyIndex = 0;

export const CONFIG = {
  API_BACKEND: '/api',
  ODDS_BASE_URL: 'https://api.the-odds-api.com/v4/sports',
  
  getNextKey: () => {
    const key = API_KEYS[keyIndex];
    keyIndex = (keyIndex + 1) % API_KEYS.length;
    return key;
  },

  LEAGUES: {
    // ============================================
    // ⚽ FÚTBOL - TOP 8 EUROPA + COPAS
    // ============================================
    SOCCER: [
      {
        category: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 INGLATERRA',
        leagues: [
          { id: 'soccer_epl', name: 'Premier League', country: 'England', league_code: 'epl' },
          { id: 'soccer_england_efl_cup', name: 'EFL Cup (Carabao Cup)', country: 'England', league_code: 'efl_cup' },
          { id: 'soccer_fa_cup', name: 'FA Cup', country: 'England', league_code: 'fa_cup' },
          { id: 'soccer_efl_champ', name: 'Championship', country: 'England', league_code: 'championship' },
        ]
      },
      
      {
        category: '🇪🇸 ESPAÑA',
        leagues: [
          { id: 'soccer_spain_la_liga', name: 'La Liga', country: 'Spain', league_code: 'laliga' },
          { id: 'soccer_spain_copa_del_rey', name: 'Copa del Rey', country: 'Spain', league_code: 'copa_del_rey' },
          { id: 'soccer_spain_segunda_division', name: 'La Liga 2', country: 'Spain', league_code: 'laliga2' },
        ]
      },
      
      {
        category: '🇮🇹 ITALIA',
        leagues: [
          { id: 'soccer_italy_serie_a', name: 'Serie A', country: 'Italy', league_code: 'seriea' },
          { id: 'soccer_italy_serie_b', name: 'Serie B', country: 'Italy', league_code: 'serieb' },
          { id: 'soccer_italy_coppa_italia', name: 'Coppa Italia', country: 'Italy', league_code: 'coppa_italia' },
        ]
      },
      
      {
        category: '🇩🇪 ALEMANIA',
        leagues: [
          { id: 'soccer_germany_bundesliga', name: 'Bundesliga', country: 'Germany', league_code: 'bundesliga' },
          { id: 'soccer_germany_bundesliga2', name: 'Bundesliga 2', country: 'Germany', league_code: 'bundesliga2' },
          { id: 'soccer_germany_dfb_pokal', name: 'DFB-Pokal', country: 'Germany', league_code: 'dfb_pokal' },
        ]
      },
      
      {
        category: '🇫🇷 FRANCIA',
        leagues: [
          { id: 'soccer_france_ligue_one', name: 'Ligue 1', country: 'France', league_code: 'ligue1' },
          { id: 'soccer_france_ligue_two', name: 'Ligue 2', country: 'France', league_code: 'ligue2' },
          { id: 'soccer_france_coupe_de_france', name: 'Coupe de France', country: 'France', league_code: 'coupe_de_france' },
        ]
      },
      
      {
        category: '🇵🇹 PORTUGAL',
        leagues: [
          { id: 'soccer_portugal_primeira_liga', name: 'Liga Portugal', country: 'Portugal', league_code: 'liga_portugal' },
          { id: 'soccer_portugal_taca_de_portugal', name: 'Taça de Portugal', country: 'Portugal', league_code: 'taca_de_portugal' },
          { id: 'soccer_portugal_taca_da_liga', name: 'Taça da Liga', country: 'Portugal', league_code: 'taca_da_liga' },
        ]
      },
      
      {
        category: '🇳🇱 PAÍSES BAJOS',
        leagues: [
          { id: 'soccer_netherlands_eredivisie', name: 'Eredivisie', country: 'Netherlands', league_code: 'eredivisie' },
          { id: 'soccer_netherlands_knvb_beker', name: 'KNVB Beker (Copa)', country: 'Netherlands', league_code: 'knvb_beker' },
        ]
      },
      
      {
        category: '🇧🇪 BÉLGICA',
        leagues: [
          { id: 'soccer_belgium_first_div', name: 'Pro League', country: 'Belgium', league_code: 'pro_league' },
          { id: 'soccer_belgium_cup', name: 'Coupe de Belgique', country: 'Belgium', league_code: 'coupe_de_belgique' },
        ]
      },
      
      {
        category: '🌎 BRASIL',
        leagues: [
          { id: 'soccer_brazil_campeonato', name: 'Brasileirão Série A', country: 'Brazil', league_code: 'brasileirao' },
          { id: 'soccer_brazil_serie_b', name: 'Série B', country: 'Brazil', league_code: 'brasileirao_b' },
          { id: 'soccer_brazil_copa_do_brasil', name: 'Copa do Brasil', country: 'Brazil', league_code: 'copa_do_brasil' },
        ]
      },
      
      {
        category: '🇦🇷 ARGENTINA',
        leagues: [
          { id: 'soccer_argentina_primera_division', name: 'Liga Profesional', country: 'Argentina', league_code: 'liga_profesional' },
          { id: 'soccer_argentina_copa', name: 'Copa Argentina', country: 'Argentina', league_code: 'copa_argentina' },
        ]
      },
      
      {
        category: '🇲🇽 MÉXICO',
        leagues: [
          { id: 'soccer_mexico_ligamx', name: 'Liga MX', country: 'Mexico', league_code: 'liga_mx' },
          { id: 'soccer_mexico_copa_mx', name: 'Copa MX', country: 'Mexico', league_code: 'copa_mx' },
        ]
      },
      
      {
        category: '🇨🇴 COLOMBIA',
        leagues: [
          { id: 'soccer_colombia_primera_a', name: 'Liga BetPlay Dimayor', country: 'Colombia', league_code: 'primera_a' },
          { id: 'soccer_colombia_copa', name: 'Copa Colombia', country: 'Colombia', league_code: 'copa_colombia' },
        ]
      },
      
      {
        category: '🇨🇱 CHILE',
        leagues: [
          { id: 'soccer_chile_campeonato', name: 'Primera División', country: 'Chile', league_code: 'primera_division' },
          { id: 'soccer_chile_copa', name: 'Copa Chile', country: 'Chile', league_code: 'copa_chile' },
        ]
      },
      
      {
        category: '🇪🇨 ECUADOR',
        leagues: [
          { id: 'soccer_ecuador_ligapro', name: 'LigaPro Serie A', country: 'Ecuador', league_code: 'ligapro' },
          { id: 'soccer_ecuador_copa', name: 'Copa Ecuador', country: 'Ecuador', league_code: 'copa_ecuador' },
        ]
      },
      
      {
        category: '🇵🇪 PERÚ',
        leagues: [
          { id: 'soccer_peru_liga_1', name: 'Liga 1', country: 'Peru', league_code: 'liga_1' },
          { id: 'soccer_peru_copa', name: 'Copa Bicentenario', country: 'Peru', league_code: 'copa_bicentenario' },
        ]
      },
      
      {
        category: '🇺🇸 USA',
        leagues: [
          { id: 'soccer_usa_mls', name: 'MLS (Major League Soccer)', country: 'USA', league_code: 'mls' },
          { id: 'soccer_usa_open_cup', name: 'U.S. Open Cup', country: 'USA', league_code: 'us_open_cup' },
          { id: 'soccer_concacaf_leagues_cup', name: 'Leagues Cup (MLS + Liga MX)', country: 'USA/Mexico', league_code: 'leagues_cup' },
        ]
      },
      
      {
        category: '🏆 COMPETICIONES INTERNACIONALES',
        leagues: [
          { id: 'soccer_uefa_champs_league', name: '⭐ UEFA Champions League', country: 'Europe', league_code: 'uefa_cl' },
          { id: 'soccer_uefa_europa_league', name: '🟡 UEFA Europa League', country: 'Europe', league_code: 'uefa_el' },
          { id: 'soccer_uefa_europa_conference_league', name: '🟢 UEFA Conference League', country: 'Europe', league_code: 'uefa_ecl' },
          { id: 'soccer_uefa_nations_league', name: '🇪🇺 UEFA Nations League', country: 'Europe', league_code: 'nations_league' },
          { id: 'soccer_conmebol_libertadores', name: '🏆 Copa Libertadores', country: 'South America', league_code: 'libertadores' },
          { id: 'soccer_conmebol_sudamericana', name: '🥈 Copa Sudamericana', country: 'South America', league_code: 'sudamericana' },
          { id: 'soccer_copa_america', name: '🌎 Copa América', country: 'South America', league_code: 'copa_america' },
          { id: 'soccer_concacaf_champions_cup', name: '⚽ CONCACAF Champions Cup', country: 'North America', league_code: 'concacaf_cl' },
          { id: 'soccer_concacaf_gold_cup', name: '🏅 Gold Cup', country: 'North America', league_code: 'gold_cup' },
          { id: 'soccer_fifa_world_cup_winner', name: '🌍 FIFA World Cup', country: 'International', league_code: 'world_cup' },
          { id: 'soccer_uefa_european_championship', name: '🇪🇺 UEFA Euro', country: 'Europe', league_code: 'euro' },
          { id: 'soccer_fifa_world_cup_qualifiers_south_america', name: '🌎 WC Qualifiers CONMEBOL', country: 'South America', league_code: 'wc_qualifiers_sa' },
          { id: 'soccer_fifa_world_cup_qualifiers_europe', name: '🇪🇺 WC Qualifiers UEFA', country: 'Europe', league_code: 'wc_qualifiers_uefa' },
        ]
      }
    ],
    
    // ============================================
    // 🏀 NBA
    // ============================================
    NBA: [
      { 
        id: 'basketball_nba', 
        name: '🏀 NBA (National Basketball Association)', 
        league_code: 'nba' 
      }
    ],
    
    // ============================================
    // ⚾ MLB
    // ============================================
    MLB: [
      { 
        id: 'baseball_mlb', 
        name: '⚾ MLB (Major League Baseball)', 
        league_code: 'mlb' 
      }
    ]
  }
};
