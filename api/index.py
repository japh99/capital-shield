from flask import Flask, request, jsonify
from flask_cors import CORS
import math
import os

app = Flask(__name__)

# CORS Seguro
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "https://capital-shield.vercel.app",
            "http://localhost:3000",
            "http://localhost:5173"
        ],
        "methods": ["POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# ==========================================
# MOTOR SOCCER - LIGAS PRINCIPALES + COPAS
# ==========================================
def soccer_expected_goals(h_elo, a_elo, league='generic'):
    """
    Motor ELO → Expected Goals
    Solo ligas principales y copas nacionales/internacionales
    """
    HOME_ADVANTAGE = {
        # ESPAÑA
        'laliga': 72,              # La Liga
        'copa_del_rey': 70,        # Copa del Rey
        'supercopa': 65,           # Supercopa de España
        
        # INGLATERRA
        'epl': 65,                 # Premier League
        'fa_cup': 62,              # FA Cup
        'efl_cup': 60,             # EFL Cup (Carabao)
        
        # ALEMANIA
        'bundesliga': 68,          # Bundesliga
        'dfb_pokal': 65,           # Copa de Alemania
        
        # ITALIA
        'seriea': 70,              # Serie A
        'coppa_italia': 68,        # Copa Italia
        'supercoppa': 63,          # Supercopa Italiana
        
        # FRANCIA
        'ligue1': 75,              # Ligue 1
        'coupe_de_france': 72,     # Copa de Francia
        'trophee_des_champions': 68,  # Supercopa Francesa
        
        # PORTUGAL
        'liga_portugal': 77,       # Primeira Liga
        'taca_de_portugal': 74,    # Copa de Portugal
        'taca_da_liga': 72,        # Taça da Liga
        
        # PAÍSES BAJOS
        'eredivisie': 73,          # Eredivisie
        'knvb_beker': 70,          # Copa de Países Bajos
        
        # BÉLGICA
        'pro_league': 74,          # Pro League
        'coupe_de_belgique': 71,   # Copa de Bélgica
        
        # TURQUÍA
        'super_lig': 80,           # Süper Lig
        'turkish_cup': 77,         # Copa de Turquía
        
        # RUSIA
        'premier_league': 78,      # Premier League Rusa
        'russian_cup': 75,         # Copa de Rusia
        
        # BRASIL
        'brasileirao': 82,         # Brasileirão Serie A
        'copa_do_brasil': 80,      # Copa do Brasil
        
        # ARGENTINA
        'liga_profesional': 88,    # Liga Profesional
        'copa_argentina': 85,      # Copa Argentina
        
        # MÉXICO
        'liga_mx': 95,             # Liga MX
        'copa_mx': 92,             # Copa MX
        
        # USA
        'mls': 85,                 # MLS
        'us_open_cup': 82,         # US Open Cup
        
        # COLOMBIA
        'primera_a': 90,           # Liga BetPlay
        'copa_colombia': 87,       # Copa Colombia
        
        # CHILE
        'primera_division': 86,    # Primera División
        'copa_chile': 83,          # Copa Chile
        
        # URUGUAY
        'primera_division': 84,    # Primera División
        
        # COMPETICIONES INTERNACIONALES
        'uefa_cl': 55,             # Champions League
        'uefa_el': 58,             # Europa League
        'uefa_ecl': 60,            # Conference League
        'libertadores': 50,        # Copa Libertadores
        'sudamericana': 52,        # Copa Sudamericana
        'concacaf_cl': 65,         # Champions CONCACAF
        
        # COPAS DEL MUNDO Y CONTINENTALES
        'world_cup': 45,           # Mundial
        'copa_america': 48,        # Copa América
        'euro': 47,                # Eurocopa
        'nations_league': 50,      # UEFA Nations League
        'gold_cup': 60,            # Copa Oro CONCACAF
        
        # DEFAULT
        'generic': 70
    }
    
    ha_points = HOME_ADVANTAGE.get(league.lower(), 70)
    elo_diff = (h_elo + ha_points) - a_elo
    win_prob = 1 / (1 + 10 ** (-elo_diff / 400))
    
    expected_home = 1.2 + (win_prob - 0.5) * 2.8
    expected_away = 1.2 + ((1 - win_prob) - 0.5) * 2.8
    
    expected_home = max(0.3, min(4.5, expected_home))
    expected_away = max(0.3, min(4.5, expected_away))
    
    return {
        'home_xg': round(expected_home, 2),
        'away_xg': round(expected_away, 2),
        'margin': round(expected_home - expected_away, 2),
        'total': round(expected_home + expected_away, 2),
        'win_probability': round(win_prob * 100, 1)
    }

# ==========================================
# MOTOR NBA
# ==========================================
def nba_expected_margin(h_rating, a_rating):
    HOME_ADVANTAGE_NBA = 3.2
    
    if h_rating > 500:
        elo_diff = h_rating - a_rating
        margin = (elo_diff / 28) + HOME_ADVANTAGE_NBA
    else:
        margin = (h_rating - a_rating) + HOME_ADVANTAGE_NBA
    
    return round(margin, 2)

# ==========================================
# MOTOR MLB
# ==========================================
def mlb_expected_runs(h_rating, a_rating, h_pitcher_era=None, a_pitcher_era=None):
    MLB_AVG_RUNS = 4.5
    
    base_runs_home = (h_rating - a_rating) / 200 + MLB_AVG_RUNS
    base_runs_away = (a_rating - h_rating) / 200 + MLB_AVG_RUNS
    
    if h_pitcher_era and a_pitcher_era:
        h_pitcher_factor = (a_pitcher_era - 4.00) * 0.15
        a_pitcher_factor = (h_pitcher_era - 4.00) * 0.15
        base_runs_home += h_pitcher_factor
        base_runs_away += a_pitcher_factor
    
    expected_home = max(2.0, min(8.0, base_runs_home))
    expected_away = max(2.0, min(8.0, base_runs_away))
    
    return {
        'home_runs': round(expected_home, 2),
        'away_runs': round(expected_away, 2),
        'margin': round(expected_home - expected_away, 2),
        'total': round(expected_home + expected_away, 2)
    }

# ==========================================
# API GATEWAY
# ==========================================
@app.route('/api', methods=['POST', 'OPTIONS'])
@app.route('/api/', methods=['POST', 'OPTIONS'])
def gateway():
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"}), 200
    
    try:
        data = request.json
        task = data.get('task')

        if task == 'math':
            sport = data.get('sport')
            
            # === SOCCER ===
            if sport == 'soccer':
                h_elo = float(data.get('h_rating', 0))
                a_elo = float(data.get('a_rating', 0))
                league = data.get('league', 'generic')
                line = float(data.get('line', 0))
                
                result = soccer_expected_goals(h_elo, a_elo, league)
                
                return jsonify({
                    "expected_value": result['margin'],
                    "edge": round(result['margin'] - line, 2),
                    "home_xg": result['home_xg'],
                    "away_xg": result['away_xg'],
                    "total_goals": result['total'],
                    "win_probability": result['win_probability'],
                    "status": "success"
                })
            
            # === NBA ===
            elif sport == 'nba':
                h = float(data.get('h_rating', 0))
                a = float(data.get('a_rating', 0))
                line = float(data.get('line', 0))
                
                expected = nba_expected_margin(h, a)
                
                return jsonify({
                    "expected_value": expected,
                    "edge": round(expected - line, 2),
                    "status": "success"
                })
            
            # === MLB ===
            elif sport == 'mlb':
                h = float(data.get('h_rating', 0))
                a = float(data.get('a_rating', 0))
                line = float(data.get('line', 0))
                h_era = data.get('h_pitcher_era')
                a_era = data.get('a_pitcher_era')
                
                if h_era:
                    h_era = float(h_era)
                if a_era:
                    a_era = float(a_era)
                
                result = mlb_expected_runs(h, a, h_era, a_era)
                
                return jsonify({
                    "expected_value": result['margin'],
                    "edge": round(result['margin'] - line, 2),
                    "total_runs": result['total'],
                    "home_runs": result['home_runs'],
                    "away_runs": result['away_runs'],
                    "status": "success"
                })
            
            # === OVER/UNDER ===
            elif 'ou' in str(sport).lower():
                projected_total = float(data.get('h_rating', 0))
                return jsonify({
                    "expected_value": projected_total,
                    "status": "success"
                })
            
            else:
                return jsonify({"error": "Deporte no reconocido"}), 400

        return jsonify({"error": "Tarea no válida"}), 400

    except ValueError as e:
        return jsonify({"error": f"Error en números: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": f"Error: {str(e)}"}), 400

@app.route('/')
def health():
    return "Capital Shield Math Engine v10.0 - Top Leagues Only"

@app.route('/api/leagues')
def get_leagues():
    """Endpoint para consultar todas las ligas disponibles"""
    leagues = {
        "europe": {
            "spain": ["laliga", "copa_del_rey", "supercopa"],
            "england": ["epl", "fa_cup", "efl_cup"],
            "germany": ["bundesliga", "dfb_pokal"],
            "italy": ["seriea", "coppa_italia", "supercoppa"],
            "france": ["ligue1", "coupe_de_france", "trophee_des_champions"],
            "portugal": ["liga_portugal", "taca_de_portugal", "taca_da_liga"],
            "netherlands": ["eredivisie", "knvb_beker"],
            "belgium": ["pro_league", "coupe_de_belgique"],
            "turkey": ["super_lig", "turkish_cup"],
            "russia": ["premier_league", "russian_cup"]
        },
        "americas": {
            "brazil": ["brasileirao", "copa_do_brasil"],
            "argentina": ["liga_profesional", "copa_argentina"],
            "mexico": ["liga_mx", "copa_mx"],
            "usa": ["mls", "us_open_cup"],
            "colombia": ["primera_a", "copa_colombia"],
            "chile": ["primera_division", "copa_chile"],
            "uruguay": ["primera_division"]
        },
        "international": {
            "uefa": ["uefa_cl", "uefa_el", "uefa_ecl", "nations_league"],
            "conmebol": ["libertadores", "sudamericana", "copa_america"],
            "concacaf": ["concacaf_cl", "gold_cup"],
            "world": ["world_cup", "euro"]
        }
    }
    return jsonify(leagues)

if __name__ == '__main__':
    app.run(debug=True)
