from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import os

app = Flask(__name__)
CORS(app)

# MODELO GRATUITO
AI_MODEL = "google/gemini-2.0-flash-exp:free"

def clean_json(text):
    text = text.strip()
    if "```json" in text: text = text.split("```json")[1].split("```")[0]
    elif "```" in text: text = text.split("```")[1].split("```")[0]
    return text.strip()

# PUERTA ÚNICA: Captura todo lo que llegue a /api
@app.route('/api', methods=['POST', 'OPTIONS'])
@app.route('/api/', methods=['POST', 'OPTIONS'])
def gateway():
    if request.method == 'OPTIONS': 
        return jsonify({"status": "ok"}), 200
    
    try:
        data = request.json
        task = data.get('task')
        api_key = os.environ.get("OPENROUTER_API_KEY")

        if not api_key:
            return jsonify({"error": "Falta la variable OPENROUTER_API_KEY en Vercel"}), 500

        # --- TAREA: SMART RADAR ---
        if task == 'radar':
            matches = data.get('matches', [])
            summary = [f"{m['home_team']} vs {m['away_team']}" for m in matches[:15]]
            prompt = f"NBA Today: {', '.join(summary)}. Select 3 best games. Return ONLY JSON: {{\"priorities\": [{{\"teams\": \"A vs B\", \"score\": 95, \"reason\": \"Short reason\"}}]}}"
            
            response = requests.post(
                url="https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "HTTP-Referer": "https://capital-shield.vercel.app",
                    "Content-Type": "application/json"
                },
                data=json.dumps({
                    "model": AI_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.1
                }),
                timeout=9 # Vercel corta a los 10s
            )
            
            res_json = response.json()
            if 'error' in res_json:
                return jsonify({"error": res_json['error'].get('message', 'Error de OpenRouter')}), 400

            content = res_json['choices'][0]['message']['content']
            return jsonify(json.loads(clean_json(content)))

        # --- TAREA: CÁLCULO MATEMÁTICO ---
        elif task == 'math':
            h = float(data.get('h_rating', 0))
            a = float(data.get('a_rating', 0))
            line = float(data.get('line', 0))
            # Fórmula NBA Spreads simplificada
            expected = (h + 100 - a) / 28 if h > 500 else (h - a) + 3
            return jsonify({"expected_value": round(expected, 2), "edge": round(expected - line, 2)})

        # --- TAREA: AUDITORÍA IA ---
        elif task == 'audit':
            response = requests.post(
                url="https://openrouter.ai/api/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}"},
                data=json.dumps({"model": AI_MODEL, "messages": [{"role": "user", "content": data.get('prompt')}]}),
                timeout=9
            )
            return jsonify({"analysis": response.json()['choices'][0]['message']['content']})

    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Requerido para Vercel
def handler(environ, start_response):
    return app(environ, start_response)
