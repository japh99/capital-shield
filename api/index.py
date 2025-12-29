from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json

app = Flask(__name__)
CORS(app)

# --- MOTORES MATEMÁTICOS ---
def engine_soccer(h, a, line):
    expected = (h + 100 - a) / 140
    return {"expected": round(expected, 2), "edge": round(expected - line, 2)}

def engine_nba_ou(total_proj, line_vegas):
    return {"expected": round(total_proj, 2), "edge": round(total_proj - line_vegas, 2)}

def engine_mlb(h, a, line):
    # Fórmula Sabermétrica: (Rating Local + 25 - Rating Visita) / 200
    expected = (h + 25 - a) / 200
    return {"expected": round(expected, 2), "edge": round(expected - line, 2)}

# --- INTEGRACIÓN CON OPENROUTER ---
def get_ai_analysis(prompt):
    api_key = requests.utils.os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        return "Error: OPENROUTER_API_KEY no configurada en Vercel."

    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            data=json.dumps({
                "model": "google/gemini-2.0-flash-001", # Rápido y con acceso a web
                "messages": [{"role": "user", "content": prompt}]
            })
        )
        res_json = response.json()
        return res_json['choices'][0]['message']['content']
    except Exception as e:
        return f"Error en el análisis de IA: {str(e)}"

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
    data = request.json
    prompt = data.get('prompt')
    analysis = get_ai_analysis(prompt)
    return jsonify({"analysis": analysis})

@app.route('/')
def home():
    return "Capital Shield AI-Core v6.0 Online"
