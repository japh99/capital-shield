"""
MLB Routes - Capital Shield API
================================
Endpoints para análisis de béisbol (MLB)
"""

from flask import Blueprint, request, jsonify
from api.engines.mlb import calculate_expected_runs

mlb_bp = Blueprint('mlb', __name__, url_prefix='/api/mlb')


@mlb_bp.route('/analyze', methods=['POST'])
def analyze_game():
    """
    Analiza un partido de MLB y devuelve carreras esperadas
    
    Expected JSON:
    {
        "home_rating": float,
        "away_rating": float,
        "line": float (optional),
        "home_pitcher_era": float (optional),
        "away_pitcher_era": float (optional)
    }
    """
    try:
        data = request.json
        
        if not data:
            return jsonify({"error": "No se proporcionaron datos"}), 400
        
        home_rating = float(data.get('home_rating', 0))
        away_rating = float(data.get('away_rating', 0))
        line = float(data.get('line', 0))
        home_pitcher_era = data.get('home_pitcher_era')
        away_pitcher_era = data.get('away_pitcher_era')
        
        # Convertir ERA a float si existe
        if home_pitcher_era:
            home_pitcher_era = float(home_pitcher_era)
        if away_pitcher_era:
            away_pitcher_era = float(away_pitcher_era)
        
        result = calculate_expected_runs(
            home_rating, 
            away_rating, 
            home_pitcher_era, 
            away_pitcher_era
        )
        
        return jsonify({
            "status": "success",
            "data": {
                "expected_value": result['margin'],
                "edge": round(result['margin'] - line, 2),
                "total_runs": result['total'],
                "home_runs": result['home_runs'],
                "away_runs": result['away_runs'],
                "confidence": _get_confidence_level(result['margin'] - line)
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
