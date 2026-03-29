# ============================================
# CAPITAL SHIELD - Configuración Centralizada
# ============================================

import os

class Config:
    """Configuración general de la aplicación"""
    
    # API Keys pool (en producción usar variables de entorno)
    API_KEYS = os.getenv('API_KEYS', '').split(',') if os.getenv('API_KEYS') else []
    
    # URLs base
    ODDS_BASE_URL = 'https://api.the-odds-api.com/v4/sports'
    
    # Configuración Flask
    DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-key-change-in-production')
    
    # CORS
    ALLOWED_ORIGINS = [
        'https://capital-shield.vercel.app',
        'http://localhost:3000',
        'http://localhost:5173'
    ]


class LeagueCodes:
    """Códigos de ligas para el motor matemático"""
    
    SOCCER = {
        # Europa
        'epl': 65,
        'laliga': 72,
        'bundesliga': 68,
        'seriea': 70,
        'ligue1': 75,
        'eredivisie': 73,
        'liga_portugal': 77,
        'pro_league': 74,
        'super_lig': 80,
        'premier_league': 78,
        
        # Copas Europeas
        'fa_cup': 62,
        'efl_cup': 60,
        'copa_del_rey': 70,
        'supercopa': 65,
        'dfb_pokal': 65,
        'coppa_italia': 68,
        'supercoppa': 63,
        'coupe_de_france': 72,
        'trophee_des_champions': 68,
        'taca_de_portugal': 74,
        'taca_da_liga': 72,
        'knvb_beker': 70,
        'coupe_de_belgique': 71,
        'turkish_cup': 77,
        'russian_cup': 75,
        
        # Internacionales UEFA
        'uefa_cl': 55,
        'uefa_el': 58,
        'uefa_ecl': 60,
        'nations_league': 50,
        
        # Latinoamérica
        'brasileirao': 82,
        'copa_do_brasil': 80,
        'liga_profesional': 88,
        'copa_argentina': 85,
        'liga_mx': 95,
        'copa_mx': 92,
        'mls': 85,
        'us_open_cup': 82,
        'primera_a': 90,
        'copa_colombia': 87,
        'primera_division': 86,  # Chile
        'copa_chile': 83,
        
        # Internacionales CONMEBOL/CONCACAF
        'libertadores': 50,
        'sudamericana': 52,
        'concacaf_cl': 65,
        'gold_cup': 60,
        
        # Mundiales
        'world_cup': 45,
        'copa_america': 48,
        'euro': 47,
        
        # Default
        'generic': 70
    }
    
    NBA_HOME_ADVANTAGE = 3.2
    MLB_AVG_RUNS = 4.5


# Instancia global
config = Config()
league_codes = LeagueCodes()
