from flask import Flask, request, jsonify
from flask_cors import CORS

# Importamos los motores que creamos anteriormente
from engines.football import calculate_football_edge
from engines.nba import calculate_nba_edge
from engines.mlb import calculate_mlb_edge

app = Flask(__name__)
CORS(app) # Permite que el Frontend se comunique con el Backend

@app.route('/api/analizar_manual', methods=['POST'])
def analizar_manual():
    try:
        data = request.json
        
        # Extraer parámetros del request
        sport = data.get('sport')
        h_rating = data.get('h_rating')
        a_rating = data.get('a_rating')
        line = data.get('line')

        # Validar que todos los campos existan
        if not all([sport, h_rating, a_rating, line]):
            return jsonify({"status": "error", "message": "Faltan datos requeridos"}), 400

        # Seleccionar el motor según el deporte
        if sport == 'soccer':
            result = calculate_football_edge(h_rating, a_rating, line)
        elif sport == 'nba':
            result = calculate_nba_edge(h_rating, a_rating, line)
        elif sport == 'mlb':
            result = calculate_mlb_edge(h_rating, a_rating, line)
        else:
            return jsonify({"status": "error", "message": "Deporte no soportado"}), 400

        # Retornar el cálculo al Frontend
        return jsonify(result)

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# Requerido para Vercel
@app.route('/')
def health_check():
    return "Capital Shield API is Running"
