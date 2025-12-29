from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import os

app = Flask(__name__)
CORS(app)

# --- LIMPIADOR DE JSON ---
def clean_json(text):
    return text.replace("```json", "").replace("```", "").strip()

# --- RADAR INTELIGENTE ---
@app.route('/api/smart_radar', methods=['POST', 'OPTIONS'])
def smart_radar():
    if request.method == 'OPTIONS': return jsonify({}), 200
    try:
        data = request.json
        matches = data.get('matches', [])
        sport = data.get('sport', 'NBA')
        
        matches_data = []
        for m in matches:
            odds = "N/A"
            if m.get('bookmakers'):
                outcomes = m['bookmakers'][0]['markets'][0]['outcomes']
                odds = " | ".join([f"{o['name']}: {o['price']}" for o in outcomes])
            matches_data.append(f"- {m['home_team']} vs {m['away_team']} (Cuotas: {odds})")

        prompt = f"Analiza estos partidos de {sport} y sus cuotas: {' '.join(matches_data)}. Selecciona los 3 con más valor. Responde SOLO un JSON con este formato: {{\"priorities\": [{{\"teams\": \"...\", \"score\": 95, \"reason\": \"...\"}}]}}"
        
        api_key = os.environ.get("OPENROUTER_API_KEY")
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            data=json.dumps({
                "model": "google/gemini-2.0-flash-001",
                "messages": [{"role": "user", "content": prompt}]
            })
        )
        
        res_text = clean_json(response.json()['choices'][0]['message']['content'])
        return jsonify(json.loads(res_text))
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# --- ANALIZADOR MATEMÁTICO ---
@app.route('/api/analizar_manual', methods=['POST', 'OPTIONS'])
def analizar():
    if request.method == 'OPTIONS': return jsonify({}), 200
    try:
        data = request.json
        sport = data.get('sport')
        h = float(data.get('h_rating', 0))
        a = float(data.get('a_rating', 0))
        line = float(data.get('line', 0))

        if sport == 'soccer':
            exp = (h + 100 - a) / 140
        elif 'nba' in sport:
            exp = h # En Over/Under h es la proyeccion
            return jsonify({"expected_value": exp, "edge": round(h - line, 2)})
        elif sport == 'mlb':
            exp = (h + 25 - a) / 200
        else: exp = 0

        return jsonify({"expected_value": round(exp, 2), "edge": round(exp - line, 2)})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# --- AUDITORÍA IA INDIVIDUAL ---
@app.route('/api/ai_analysis', methods=['POST', 'OPTIONS'])
def ai_analysis():
    if request.method == 'OPTIONS': return jsonify({}), 200
    data = request.json
    api_key = os.environ.get("OPENROUTER_API_KEY")
    response = requests.post(
        url="https://openrouter.ai/api/v1/chat/completions",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        data=json.dumps({
            "model": "google/gemini-2.0-flash-001",
            "messages": [{"role": "user", "content": data.get('prompt')}]
        })
    )
    return jsonify({"analysis": response.json()['choices'][0]['message']['content']})

@app.route('/')
def home():
    return "Capital Shield Core v7.0 Ready"
