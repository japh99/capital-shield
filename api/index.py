from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import os

app = Flask(__name__)
CORS(app)

# MODELO GRATUITO ULTRA-RÁPIDO
AI_MODEL = "google/gemini-2.0-flash-exp:free"

def clean_json(text):
    text = text.strip()
    if "```json" in text: text = text.split("```json")[1].split("```")[0]
    elif "```" in text: text = text.split("```")[1].split("```")[0]
    return text.strip()

@app.route('/api/index.py', methods=['POST', 'GET', 'OPTIONS'])
@app.route('/api/', methods=['POST', 'GET', 'OPTIONS'])
@app.route('/api', methods=['POST', 'GET', 'OPTIONS'])
def handler():
    if request.method == 'OPTIONS': return jsonify({}), 200
    if request.method == 'GET': return "Capital Shield Gateway Online", 200

    try:
        data = request.json
        task = data.get('task') # 'radar', 'math', o 'audit'
        api_key = os.environ.get("OPENROUTER_API_KEY")

        # --- TAREA 1: SMART RADAR (ESCANEO) ---
        if task == 'radar':
            matches = data.get('matches', [])
            summary = [f"- {m['home_team']} vs {m['away_team']}" for m in matches[:15]]
            prompt = f"NBA Today: {', '.join(summary)}. Select 3 high-value games. Return ONLY JSON: {{\"priorities\": [{{\"teams\": \"A vs B\", \"score\": 95, \"reason\": \"Short explanation in Spanish\"}}]}}"
            
            response = requests.post(
                url="https://openrouter.ai/api/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}", "HTTP-Referer": "https://capital-shield.vercel.app"},
                data=json.dumps({"model": AI_MODEL, "messages": [{"role": "user", "content": prompt}]}),
                timeout=8
            )
            content = clean_json(response.json()['choices'][0]['message']['content'])
            return jsonify(json.loads(content))

        # --- TAREA 2: CÁLCULO MATEMÁTICO ---
        elif task == 'math':
            h = float(data.get('h_rating', 0))
            a = float(data.get('a_rating', 0))
            line = float(data.get('line', 0))
            sport = data.get('sport')
            
            if sport == 'soccer': expected = (h + 100 - a) / 140
            elif sport == 'mlb': expected = (h + 25 - a) / 200
            else: expected = h # NBA Totals
            
            return jsonify({"expected_value": round(expected, 2), "edge": round(expected - line, 2)})

        # --- TAREA 3: AUDITORÍA INDIVIDUAL ---
        elif task == 'audit':
            response = requests.post(
                url="https://openrouter.ai/api/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}"},
                data=json.dumps({"model": AI_MODEL, "messages": [{"role": "user", "content": data.get('prompt')}]}),
                timeout=8
            )
            return jsonify({"analysis": response.json()['choices'][0]['message']['content']})

    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Requerido para Vercel
def app_handler(environ, start_response):
    return app(environ, start_response)
