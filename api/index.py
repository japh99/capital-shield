from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# --- MOTORES INDEPENDIENTES (TODOS LOS DEPORTES) ---

def calculate_soccer(h, a, line):
    """Lógica de Fútbol basada en ELO"""
    # Fórmula: (ELO Local + 100 - ELO Visita) / 140
    expected_margin = (h + 100 - a) / 140
    edge = expected_margin - line
    return {"expected": round(expected_margin, 2), "edge": round(edge, 2)}

def calculate_nba_ou(proj_total, market_line):
    """Lógica de NBA para Over/Under (Totales)"""
    # El valor h_rating se usa como la proyección de puntos totales
    edge = proj_total - market_line
    return {"expected": round(proj_total, 2), "edge": round(edge, 2)}

def calculate_nba_handicap(h, a, line):
    """Lógica de NBA para Handicap (Spreads)"""
    # Si los ratings son altos (ELO), usamos divisor 28. Si son bajos (Dunkel), diferencia directa.
    if h > 500:
        expected_margin = (h + 100 - a) / 28
    else:
        expected_margin = (h - a) + 3 # +3 por ventaja de localía estándar
    edge = expected_margin - line
    return {"expected": round(expected_margin, 2), "edge": round(edge, 2)}

def calculate_mlb(h, a, line):
    """Lógica de MLB basada en Sabermetría"""
    # Fórmula: (Rating Local + 25 - Rating Visita) / 200
    expected_margin = (h + 25 - a) / 200
    edge = expected_margin - line
    return {"expected": round(expected_margin, 2), "edge": round(edge, 2)}

# --- RUTA PRINCIPAL DE ANÁLISIS ---

@app.route('/api/analizar_manual', methods=['POST'])
def analizar():
    try:
        data = request.json
        sport = data.get('sport')
        
        # Limpieza y conversión forzada de datos para evitar errores de iPad
        h = float(data.get('h_rating', 0))
        a = float(data.get('a_rating', 0))
        line = float(data.get('line', 0))

        # Selector de motor según el deporte enviado por el Frontend
        if sport == 'soccer':
            res = calculate_soccer(h, a, line)
        elif sport == 'nba_ou':
            res = calculate_nba_ou(h, line) # En Totales, h es la proyección
        elif sport == 'nba_handicap' or sport == 'nba':
            res = calculate_nba_handicap(h, a, line)
        elif sport == 'mlb':
            res = calculate_mlb(h, a, line)
        else:
            return jsonify({"error": f"Deporte '{sport}' no soportado"}), 400

        # Respuesta unificada que todos los módulos de React entienden
        return jsonify({
            "expected_value": res["expected"], # Margen o Total esperado
            "expected_margin": res["expected"], # Alias para compatibilidad con Soccer
            "edge": res["edge"],
            "status": "success"
        })

    except Exception as e:
        # Si algo falla, el backend informa el error exacto sin detenerse
        return jsonify({"error": f"Error de cálculo: {str(e)}"}), 400

@app.route('/')
def home():
    return "Capital Shield Unified Engine v5.0 Online"
