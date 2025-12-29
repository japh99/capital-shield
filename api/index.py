from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import os

app = Flask(__name__)
# Configuración de CORS para permitir peticiones desde tu iPad/Navegador
CORS(app, resources={r"/api/*": {"origins": "*"}})

# --- CONFIGURACIÓN DE IA ---
# Usamos el modelo gratuito más potente y rápido de Google
AI_MODEL = "google/gemini-2.0-flash-exp:free"

def clean_json_response(text):
    """
    Limpia la respuesta de la IA. 
    Los modelos de Google suelen envolver el JSON en bloques ```json ... ```
    Esta función los quita para que el iPad pueda procesarlo.
    """
    text = text.strip()
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0]
    elif "```" in text:
        text = text.split("```")[1].split("```")[0]
    return text.strip()

# --- RUTA 1: RADAR INTELIGENTE (Smart Scan) ---
@app.route('/api/smart_radar', methods=['POST', 'OPTIONS'])
def smart_radar():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    try:
        data = request.json
        matches = data.get('matches', [])
        sport = data.get('sport', 'Deporte')
        
        # Construcción del reporte de partidos y cuotas para la IA
        matches_summary = []
        for m in matches:
            odds_str = "Sin cuotas"
            if m.get('bookmakers'):
                try:
                    outcomes = m['bookmakers'][0]['markets'][0]['outcomes']
                    odds_str = " | ".join([f"{o['name']}: {o['price']}" for o in outcomes])
                except: pass
            matches_summary.append(f"- {m['home_team']} vs {m['away_team']} (Cuotas: {odds_str})")

        prompt = f"""
        Actúa como analista senior de mercados deportivos. Analiza estos partidos de {sport} y sus cuotas:
        {chr(10).join(matches_summary)}
        
        TAREA: Selecciona los 3 eventos con mayor potencial de ineficiencia o valor.
        Responde ÚNICAMENTE en formato JSON con esta estructura exacta:
        {{
          "priorities": [
            {{"teams": "Local vs Visita", "score": 95, "reason": "Explicación técnica corta"}}
          ]
        }}
        """
        
        api_key = os.environ.get("OPENROUTER_API_KEY")
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            data=json.dumps({
                "model": AI_MODEL,
                "messages": [{"role": "user", "content": prompt}]
            })
        )
        
        res_json = response.json()
        raw_content = res_json['choices'][0]['message']['content']
        clean_content = clean_json_response(raw_content)
        
        return jsonify(json.loads(clean_content))

    except Exception as e:
        return jsonify({"error": f"Error en Radar: {str(e)}"}), 400

# --- RUTA 2: ANALIZADOR MATEMÁTICO (Fútbol, NBA, MLB) ---
@app.route('/api/analizar_manual', methods=['POST', 'OPTIONS'])
def analizar():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    try:
        data = request.json
        sport = data.get('sport')
        h = float(data.get('h_rating', 0))
        a = float(data.get('a_rating', 0))
        line = float(data.get('line', 0))

        # Motor de Fútbol (ELO)
        if sport == 'soccer':
            expected = (h + 100 - a) / 140
        # Motor de NBA Over/Under
        elif sport == 'nba_ou' or sport == 'soccer_ou':
            expected = h # h es la proyección total del usuario
        # Motor de MLB (Sabermetrics)
        elif sport == 'mlb':
            expected = (h + 25 - a) / 200
        # Motor de NBA Spreads (Handicap)
        elif sport == 'nba':
            expected = (h + 100 - a) / 28 if h > 500 else (h - a) + 3
        else:
            return jsonify({"error": "Deporte no configurado"}), 400

        return jsonify({
            "expected_value": round(expected, 2),
            "edge": round(expected - line, 2),
            "status": "success"
        })

    except Exception as e:
        return jsonify({"error": f"Error matemático: {str(e)}"}), 400

# --- RUTA 3: AUDITORÍA IA INDIVIDUAL (Single Match) ---
@app.route('/api/ai_analysis', methods=['POST', 'OPTIONS'])
def ai_analysis():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    try:
        data = request.json
        api_key = os.environ.get("OPENROUTER_API_KEY")
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            data=json.dumps({
                "model": AI_MODEL,
                "messages": [{"role": "user", "content": data.get('prompt')}]
            })
        )
        return jsonify({"analysis": response.json()['choices'][0]['message']['content']})
    except Exception as e:
        return jsonify({"error": f"Error de IA: {str(e)}"}), 400

@app.route('/')
def home():
    return "Capital Shield Unified Engine v8.0 Online"
