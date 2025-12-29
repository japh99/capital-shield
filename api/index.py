from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/analizar_manual', methods=['POST'])
def analizar():
    try:
        data = request.json
        sport = data.get('sport')
        
        # Datos base
        h = float(data.get('h_rating', 0))
        a = float(data.get('a_rating', 0))
        line = float(data.get('line', 0))

        # --- LÓGICA FÚTBOL (HANDICAP / MARGEN) ---
        if sport == 'soccer':
            expected_margin = (h + 100 - a) / 140
            edge = expected_margin - line
            return jsonify({"expected_value": round(expected_margin, 2), "edge": round(edge, 2)})

        # --- LÓGICA OVER / UNDER (UNIVERSAL: FÚTBOL Y NBA) ---
        elif sport == 'soccer_ou' or sport == 'nba_ou':
            # Aquí 'h' se usa como la Proyección Total del usuario
            edge = h - line
            return jsonify({"expected_value": round(h, 2), "edge": round(edge, 2)})

        return jsonify({"error": "Deporte no soportado"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/')
def home():
    return "Capital Shield Unified Engine v5.1 Online"
