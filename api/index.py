from flask import Flask, request, jsonify
from flask_cors import CORS

# Motores
def calculate_football_edge(elo_home, elo_away, market_line):
    try:
        expected_margin = (float(elo_home) + 100 - float(elo_away)) / 140
        edge = expected_margin - float(market_line)
        return {"expected_margin": round(expected_margin, 2), "edge": round(edge, 2)}
    except:
        return None

app = Flask(__name__)
CORS(app)

@app.route('/api/analizar_manual', methods=['POST'])
def analizar():
    try:
        data = request.json
        sport = data.get('sport')
        # Limpieza de datos: Forzamos a flotante para evitar errores
        h = float(data.get('h_rating', 0))
        a = float(data.get('a_rating', 0))
        line = float(data.get('line', 0))
        
        if sport == 'soccer':
            res = calculate_football_edge(h, a, line)
            if res:
                return jsonify(res)
        
        return jsonify({"error": "Cálculo fallido"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/health')
def health():
    return "OK"
