"""
NBA Routes - Capital Shield API
================================
Endpoints para análisis de baloncesto (NBA)
"""

from flask import Blueprint, request, jsonify
from api.engines.nba import calculate_expected_margin

nba_bp = Blueprint('nba', __name__, url_prefix='/api/nba')


@nba_bp.route('/analyze', methods=['POST'])
def analyze_game():
    """
    Analiza un partido de NBA y devuelve el margen esperado
    
    Expected JSON:
    {
        "home_rating": float,
        "away_rating": float,
        "line": float (optional),
        "rating_system": string (optional, default: 'elo')
    }
    """
    try:
        data = request.json
        
        if not data:
            return jsonify({"error": "No se proporcionaron datos"}), 400
        
        home_rating = float(data.get('home_rating', 0))
        away_rating = float(data.get('away_rating', 0))
        line = float(data.get('line', 0))
        rating_system = data.get('rating_system', 'elo')
        
        expected_margin = calculate_expected_margin(home_rating, away_rating, rating_system)
        
        return jsonify({
            "status": "success",
            "data": {
                "expected_value": expected_margin,
                "edge": round(expected_margin - line, 2),
                "confidence": _get_confidence_level(expected_margin - line)
            }
        })
        
    except ValueError as e:
        return jsonify({"error": f"Error en números: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": f"Error interno: {str(e)}"}), 500


def _get_confidence_level(edge: float) -> str:
    """Determina el nivel de confianza basado en el edge"""
    if edge >= 10:
        return 'ALTA'
    elif edge >= 5:
        return 'MEDIA'
    elif edge >= 2:
        return 'BAJA'
    else:
        return 'SIN VALOR'
