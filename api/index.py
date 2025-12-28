from flask import Flask, request, jsonify
from flask_cors import CORS

def calculate_football_edge(elo_home, elo_away, market_line):
    try:
        # Fórmula Maestra: (ELO Local + 100 - ELO Visita) / 140
        expected_margin = (float(elo_home) + 100 - float(elo_away)) / 140
        edge = expected_margin - float(market_line)
        return {
            "expected_margin": round(expected_margin, 2),
            "edge": round(edge, 2)
        }
    except Exception as e:
        return {"error": str(e)}

app = Flask(__name__)
CORS(app)

@app.route('/api/analizar_manual', methods=['POST'])
def analizar():
    try:
        data = request.json
        # Extraemos y limpiamos los datos
        h = data.get('h_rating')
        a = data.get('a_rating')
        line = data.get('line')

        # Verificación de seguridad
        if h is None or a is None or line is None:
            return jsonify({"error": "Faltan datos en la solicitud"}), 400

        res = calculate_football_edge(h, a, line)
        
        if "error" in res:
            return jsonify({"error": f"Error de formato: {res['error']}"}), 400
            
        return jsonify(res)
    except Exception as e:
        return jsonify({"error": "Error interno del servidor"}), 500

@app.route('/')
def home():
    return "Capital Shield API v2.0 Online"
