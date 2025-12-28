def calculate_mlb_edge(rating_home, rating_away, market_line):
    """
    Fórmula: (Rating Local + 25 - Rating Visita) / 200 = Carreras Ventaja
    """
    try:
        # En MLB la localía es menos determinante (25 puntos).
        # La dispersión por carreras se calcula sobre base 200.
        expected_margin = (float(rating_home) + 25 - float(rating_away)) / 200
        
        # Calculamos la diferencia contra el spread (run line) del mercado.
        edge = expected_margin - float(market_line)
        
        return {
            "expected_margin": round(expected_margin, 3),
            "edge": round(edge, 3),
            "status": "success"
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
