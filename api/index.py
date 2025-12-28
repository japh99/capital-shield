from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/analizar_manual', methods=['POST'])
def analizar():
    try:
        data = request.json
        h = float(data.get('h_rating', 0))
        a = float(data.get('a_rating', 0))
        
        # FÓRMULA MAESTRA: Probabilidad real de goles de diferencia
        expected_margin = (h + 100 - a) / 140
        
        return jsonify({
            "expected_margin": round(expected_margin, 2),
            "status": "success"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/')
def health():
    return "Capital Shield Engine v3.0 Online"
