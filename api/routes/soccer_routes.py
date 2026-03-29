"""
Soccer Routes - Capital Shield API
===================================
Endpoints para análisis de fútbol (soccer)
"""

from flask import Blueprint, request, jsonify
from api.engines.soccer import calculate_expected_goals

soccer_bp = Blueprint('soccer', __name__, url_prefix='/api/soccer')


@soccer_bp.route('/analyze', methods=['POST'])
def analyze_match():
    """
    Analiza un partido de fútbol y devuelve métricas avanzadas
    
    Expected JSON:
    {
        "home_elo": float,
        "away_elo": float,
        "league": string (optional),
        "line": float (optional)
    }
    """
    try:
        data = request.json
        
        if not data:
            return jsonify({"error": "No se proporcionaron datos"}), 400
        
        home_elo = float(data.get('home_elo', 0))
        away_elo = float(data.get('away_elo', 0))
        league = data.get('league', 'generic')
        line = float(data.get('line', 0))
        
        result = calculate_expected_goals(home_elo, away_elo, league)
        
        return jsonify({
            "status": "success",
            "data": {
                "expected_value": result['margin'],
                "edge": round(result['margin'] - line, 2),
                "home_xg": result['home_xg'],
                "away_xg": result['away_xg'],
                "total_goals": result['total'],
                "win_probability": result['win_probability'],
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
