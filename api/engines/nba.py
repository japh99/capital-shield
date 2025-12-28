
def calculate_nba_edge(rating_home, rating_away, market_line):
    """
    Fórmula: (Rating Local + 100 - Rating Visita) / 28 = Puntos Ventaja
    """
    try:
        # En la NBA el factor de localía (100) es muy pesado.
        # Dividimos entre 28 para obtener el spread de puntos esperado.
        expected_margin = (float(rating_home) + 100 - float(rating_away)) / 28
        
        # El Edge es la diferencia entre nuestra proyección y la línea de la casa.
        edge = expected_margin - float(market_line)
        
        return {
            "expected_margin": round(expected_margin, 2),
            "edge": round(edge, 2),
            "status": "success"
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
