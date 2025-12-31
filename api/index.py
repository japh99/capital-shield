from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
# Permitimos CORS para que el iPad pueda comunicarse sin bloqueos
CORS(app)

@app.route('/api', methods=['POST', 'OPTIONS'])
@app.route('/api/', methods=['POST', 'OPTIONS'])
def gateway():
    # Respuesta rápida para peticiones de prueba (Pre-flight) del navegador
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"}), 200
    
    try:
        data = request.json
        task = data.get('task') # Ahora solo recibiremos la tarea 'math'

        if task == 'math':
            sport = data.get('sport')
            # Forzamos la conversión a número para evitar errores de texto
            h = float(data.get('h_rating', 0))
            a = float(data.get('a_rating', 0))
            line = float(data.get('line', 0))

            # --- MOTOR FÚTBOL (ELO) ---
            if sport == 'soccer':
                expected = (h + 100 - a) / 140
            
            # --- MOTOR NBA (Handicap) ---
            elif sport == 'nba':
                # Detecta automáticamente si usas ELO (>500) o Dunkel (<500)
                expected = (h + 100 - a) / 28 if h > 500 else (h - a) + 3
            
            # --- MOTOR MLB (Sabermetría) ---
            elif sport == 'mlb':
                expected = (h + 25 - a) / 200
            
            # --- MOTOR OVER/UNDER (Universal) ---
            elif 'ou' in str(sport) or sport == 'ou':
                # En O/U, h_rating es la proyección total directa
                expected = h
            
            else:
                return jsonify({"error": "Deporte no reconocido"}), 400

            # Respuesta estandarizada para el Frontend
            return jsonify({
                "expected_value": round(expected, 2),
                "edge": round(expected - line, 2),
                "status": "success"
            })

        return jsonify({"error": "Tarea no válida"}), 400

    except Exception as e:
        # Si hay un error de escritura en el iPad, el servidor no se cae
        return jsonify({"error": f"Fallo matemático: {str(e)}"}), 400

@app.route('/')
def health():
    return "Capital Shield Math Engine v9.0 Online"
