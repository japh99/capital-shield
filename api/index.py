from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import os

app = Flask(__name__)
CORS(app)

# --- MOTORES MATEMÁTICOS INTEGRADOS ---
def engine_soccer(h, a, line):
    expected = (h + 100 - a) / 140
    return {"expected": round(expected, 2), "edge": round(expected - line, 2)}

def engine_nba_ou(total_proj, line_vegas):
    return {"expected": round(total_proj, 2), "edge": round(total_proj - line_vegas, 2)}

def engine_mlb(h, a, line):
    expected = (h + 25 - a) / 200
    return {"expected": round(expected, 2), "edge": round(expected - line, 2)}

# --- RADAR DE PRIORIDAD CON PESO DE CUOTAS ---
@app.route('/api/smart_radar', methods=['POST'])
def smart_radar():
    try:
        data = request.json
        matches = data.get('matches', [])
        sport = data.get('sport', 'NBA')
        
        # Procesamos partidos con sus cuotas para el prompt
        matches_data = []
        for m in matches:
            # Intentamos extraer la cuota del primer bookmaker (Vegas/H2H)
            odds_str = "Cuotas no disponibles"
            if m.get('bookmakers') and len(m['bookmakers']) > 0:
                outcomes = m['bookmakers'][0]['markets'][0]['outcomes']
                odds_str = " | ".join([f"{o['name']}: {o['price']}" for o in outcomes])
            
            matches_data.append(f"- {m['home_team']} vs {m['away_team']} (Mercado: {odds_str})")

        matches_str = "\n".join(matches_data)
        
        prompt = f"""
        Actúa como un Quant Trader de élite en apuestas deportivas. 
        Analiza esta lista de partidos de {sport} y sus cuotas de mercado actuales:
        {matches_str}
        
        Tu misión es identificar los 3 eventos con mayor "Potencial de Ineficiencia".
        Criterios de Peso:
        1. Cuotas de valor aparente (ej. equipos fuertes con cuotas atractivas).
        2. Partidos de alta relevancia mediática (donde el dinero inteligente se mueve).
        3. Eventos con cuotas muy ajustadas (donde un análisis de ELO/Dunkel puede marcar la diferencia).

        Responde estrictamente en este formato JSON:
        {{"priorities": [
            {{"teams": "Local vs Visita", "score": 98, "reason": "Breve explicación técnica del por qué este partido y esa cuota son interesantes"}}
        ]}}
        """
        
        api_key = os.environ.get("OPENROUTER_API_KEY")
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            data=json.dumps({
                "model": "google/gemini-2.0-flash-001",
                "messages": [{"role": "user", "content": prompt}],
                "response_format": { "type": "json_object" }
            })
        )
        return jsonify(response.json()['choices'][0]['message']['content'])
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/analizar_manual', methods=['POST'])
def analizar():
    try:
        data = request.json
        sport = data.get('sport')
        h = float(data.get('h_rating', 0))
        a = float(data.get('a_rating', 0))
        line = float(data.get('line', 0))

        if sport == 'soccer': res = engine_soccer(h, a, line)
        elif sport == 'nba_ou': res = engine_nba_ou(h, line)
        elif sport == 'mlb': res = engine_mlb(h, a, line)
        else: return jsonify({"error": "Deporte no soportado"}), 400

        return jsonify({"expected_value": res["expected"], "edge": res["edge"], "status": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/ai_analysis', methods=['POST'])
def ai_analysis():
    # ... (Mantenemos tu lógica de análisis individual que ya funciona) ...
    data = request.json
    prompt = data.get('prompt')
    api_key = os.environ.get("OPENROUTER_API_KEY")
    response = requests.post(
        url="https://openrouter.ai/api/v1/chat/completions",
        headers={"Authorization": f"Bearer {api_key}"},
        data=json.dumps({
            "model": "google/gemini-2.0-flash-001",
            "messages": [{"role": "user", "content": prompt}]
        })
    )
    return jsonify({"analysis": response.json()['choices'][0]['message']['content']})

@app.route('/')
def home():
    return "Capital Shield AI-Integrated Core v6.5 Online"
