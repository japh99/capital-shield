from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import os

app = Flask(__name__)
CORS(app)

AI_MODEL = "google/gemini-2.0-flash-exp:free"

def clean_json_response(text):
    text = text.strip()
    if "```json" in text: text = text.split("```json")[1].split("```")[0]
    elif "```" in text: text = text.split("```")[1].split("```")[0]
    return text.strip()

@app.route('/api', methods=['POST', 'OPTIONS'])
@app.route('/api/', methods=['POST', 'OPTIONS'])
def gateway():
    if request.method == 'OPTIONS': return jsonify({"status": "ok"}), 200
    
    try:
        data = request.json
        task = data.get('task')
        api_key = os.environ.get("OPENROUTER_API_KEY")

        if task == 'radar':
            matches = data.get('matches', [])
            summary = [f"- {m['home_team']} vs {m['away_team']}" for m in matches[:15]]
            prompt = f"Analiza estos partidos de NBA hoy: {', '.join(summary)}. Selecciona los 3 mas prometedores. Responde SOLO JSON: {{\"priorities\": [{{\"teams\": \"A vs B\", \"score\": 95, \"reason\": \"Corta\"}}]}}"
            
            response = requests.post(
                url="https://openrouter.ai/api/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}", "HTTP-Referer": "https://capital-shield.vercel.app", "Content-Type": "application/json"},
                data=json.dumps({"model": AI_MODEL, "messages": [{"role": "user", "content": prompt}]}),
                timeout=9
            )
            content = clean_json_response(response.json()['choices'][0]['message']['content'])
            return jsonify(json.loads(content))

        elif task == 'math':
            h, a, line = float(data.get('h_rating', 0)), float(data.get('a_rating', 0)), float(data.get('line', 0))
            sport = data.get('sport')
            if sport == 'soccer': exp = (h + 100 - a) / 140
            elif sport == 'mlb': exp = (h + 25 - a) / 200
            else: exp = h # NBA Totals
            return jsonify({"expected_value": round(exp, 2), "edge": round(exp - line, 2)})

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

def handler(environ, start_response):
    return app(environ, start_response)
