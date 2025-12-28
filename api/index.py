from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/analizar_manual', methods=['POST'])
def analizar():
    try:
        data = request.json
        sport = data.get('sport', 'soccer')
        h = float(data.get('h_rating', 0))
        a = float(data.get('a_rating', 0))
        
        if sport == 'soccer':
            # Fórmula Fútbol: (ELO + 100 - ELO) / 140
            expected_margin = (h + 100 - a) / 140
        elif sport == 'nba':
            # Lógica Inteligente para NBA:
            if h > 1000: 
                # Si es ELO (ej: 1600), usamos el divisor
                expected_margin = (h + 100 - a) / 28
            else:
                # Si es Dunkel (ej: 111), la diferencia ya son los puntos
                # Añadimos +3 por ventaja de localía estándar en NBA
                expected_margin = (h - a) + 3
        else:
            expected_margin = 0

        return jsonify({
            "expected_margin": round(expected_margin, 2),
            "status": "success"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/')
def health():
    return "Capital Shield Multi-Engine Online"
