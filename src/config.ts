// ============================================
// CAPITAL SHIELD - CONFIGURACIÓN CENTRAL
// ============================================

// 🔑 POOL DE API KEYS (50 Keys para rotación automática)
const API_KEYS_POOL = [
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

// 🔄 SISTEMA DE ROTACIÓN INTELIGENTE
class KeyRotator {
  private keys: string[];
  private currentIndex: number;
  private usageCount: Map<string, number>;
  private lastReset: Date;

  constructor(keys: string[]) {
    this.keys = keys;
    this.currentIndex = 0;
    this.usageCount = new Map();
    this.lastReset = new Date();
    
    // Inicializar contadores
    keys.forEach(key => this.usageCount.set(key, 0));
  }

  getNextKey(): string {
    // Reset cada hora (500 llamadas por key por hora)
    const now = new Date();
    const hoursPassed = (now.getTime() - this.lastReset.getTime()) / (1000 * 60 * 60);
    
    if (hoursPassed >= 1) {
      this.usageCount.forEach((_, key) => this.usageCount.set(key, 0));
      this.lastReset = now;
      this.currentIndex = 0;
    }

    // Rotar al siguiente key
    const key = this.keys[this.currentIndex];
    const usage = this.usageCount.get(key) || 0;
    
    // Si este key superó 450 llamadas, pasar al siguiente
    if (usage >= 450) {
      this.currentIndex = (this.currentIndex + 1) % this.keys.length;
      return this.getNextKey(); // Recursión para encontrar key disponible
    }

    // Incrementar uso y devolver key
    this.usageCount.set(key, usage + 1);
    this.currentIndex = (this.currentIndex + 1) % this.keys.length;
    
    return key;
  }

  getStats() {
    const totalCalls = Array.from(this.usageCount.values()).reduce((a, b) => a + b, 0);
    const keysAvailable = Array.from(this.usageCount.values()).filter(usage => usage < 450).length;
    
    return {
      totalKeys: this.keys.length,
      keysAvailable,
      totalCallsThisHour: totalCalls,
      currentKeyIndex: this.currentIndex,
      nextReset: new Date(this.lastReset.getTime() + 60 * 60 * 1000).toLocaleTimeString('es-CO')
    };
  }
}

// Instancia global del rotador
const keyRotator = new KeyRotator(API_KEYS_POOL);

export const CONFIG = {
  // Backend API
  API_BACKEND: '/api',
  
  // The Odds API
  ODDS_BASE_URL: 'https://api.the-odds-api.com/v4/sports',
  
  // 🔄 Función para obtener API Key con rotación
  getApiKey: () => keyRotator.getNextKey(),
  
  // 📊 Estadísticas de uso
  getKeyStats: () => keyRotator.getStats(),
  
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
          
          // ITALIA
          { 
            id: 'soccer_italy_serie_a', 
            name: '🇮🇹 Serie A',
            country: 'Italy',
            league_code: 'seriea'
          },
          
          // ALEMANIA
          { 
            id: 'soccer_germany_bundesliga', 
            name: '🇩🇪 Bundesliga',
            country: 'Germany',
            league_code: 'bundesliga'
          },
          
          // FRANCIA
          { 
            id: 'soccer_france_ligue_one', 
            name: '🇫🇷 Ligue 1',
            country: 'France',
            league_code: 'ligue1'
          },
          
          // PORTUGAL
          { 
            id: 'soccer_portugal_primeira_liga', 
            name: '🇵🇹 Liga Portugal',
            country: 'Portugal',
            league_code: 'liga_portugal'
          },
          
          // PAÍSES BAJOS
          { 
            id: 'soccer_netherlands_eredivisie', 
            name: '🇳🇱 Eredivisie',
            country: 'Netherlands',
            league_code: 'eredivisie'
          },
          
          // BÉLGICA
          { 
            id: 'soccer_belgium_first_div', 
            name: '🇧🇪 Pro League',
            country: 'Belgium',
            league_code: 'pro_league'
          },
          
          // TURQUÍA
          { 
            id: 'soccer_turkey_super_league', 
            name: '🇹🇷 Süper Lig',
            country: 'Turkey',
            league_code: 'super_lig'
          },
          
          // AUSTRIA
          { 
            id: 'soccer_austria_bundesliga', 
            name: '🇦🇹 Bundesliga',
            country: 'Austria',
            league_code: 'bundesliga_austria'
          },
          
          // SUIZA
          { 
            id: 'soccer_switzerland_superleague', 
            name: '🇨🇭 Super League',
            country: 'Switzerland',
            league_code: 'super_league'
          },
          
          // DINAMARCA
          { 
            id: 'soccer_denmark_superliga', 
            name: '🇩🇰 Superliga',
            country: 'Denmark',
            league_code: 'superliga'
          },
          
          // SUECIA
          { 
            id: 'soccer_sweden_allsvenskan', 
            name: '🇸🇪 Allsvenskan',
            country: 'Sweden',
            league_code: 'allsvenskan'
          },
          
          // NORUEGA
          { 
            id: 'soccer_norway_eliteserien', 
            name: '🇳🇴 Eliteserien',
            country: 'Norway',
            league_code: 'eliteserien'
          },
          
          // POLONIA
          { 
            id: 'soccer_poland_ekstraklasa', 
            name: '🇵🇱 Ekstraklasa',
            country: 'Poland',
            league_code: 'ekstraklasa'
          },
          
          // GRECIA
          { 
            id: 'soccer_greece_super_league', 
            name: '🇬🇷 Super League',
            country: 'Greece',
            league_code: 'super_league_greece'
          },
          
          // ESCOCIA
          { 
            id: 'soccer_spl', 
            name: '🏴󠁧󠁢󠁳󠁣󠁴󠁿 Premiership',
            country: 'Scotland',
            league_code: 'premiership'
          },
          
          // IRLANDA
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
          
          // ARGENTINA
          { 
            id: 'soccer_argentina_primera_division', 
            name: '🇦🇷 Liga Profesional',
            country: 'Argentina',
            league_code: 'liga_profesional'
          },
          
          // MÉXICO
          { 
            id: 'soccer_mexico_ligamx', 
            name: '🇲🇽 Liga MX',
            country: 'Mexico',
            league_code: 'liga_mx'
          },
          
          // CHILE
          { 
            id: 'soccer_chile_campeonato', 
            name: '🇨🇱 Primera División',
            country: 'Chile',
            league_code: 'primera_division'
          },
        ]
      },
      
      // ========================================
      // 🌏 USA & ASIA
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
          
          // COPAS MUNDIALES
          { 
            id: 'soccer_fifa_world_cup_winner', 
            name: '🌍 FIFA World Cup',
            country: 'International',
            league_code: 'world_cup'
          },
          { 
            id: 'soccer_fifa_world_cup_qualifiers_south_america', 
            name: '🌎 WC Qualifiers - CONMEBOL',
            country: 'South America',
            league_code: 'wc_qualifiers_sa'
          },
          { 
            id: 'soccer_fifa_world_cup_qualifiers_europe', 
            name: '🇪🇺 WC Qualifiers - UEFA',
            country: 'Europe',
            league_code: 'wc_qualifiers_uefa'
          },
        ]
      }
    ]
  }
};
