def calculate_football_edge(elo_home, elo_away, market_line):
    """
    Fórmula: (ELO Local + 100 - ELO Visita) / 140 = Goles Ventaja
    """
    try:
        # Cálculo del margen esperado (Fair Value)
        expected_margin = (float(elo_home) + 100 - float(elo_away)) / 140
        
        # Diferencia contra la cuota de la casa (Edge)
        edge = expected_margin - float(market_line)
        
        return {
            "expected_margin": round(expected_margin, 2),
            "edge": round(edge, 2),
            "status": "success"
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
