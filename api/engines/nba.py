def calculate_expected_margin(h_rating, a_rating, rating_system='elo'):
    """
    Motor NBA: ELO o Dunkel → Margen esperado
    """
    HOME_ADVANTAGE_NBA = 3.2
    
    if rating_system == 'elo' or h_rating > 500:
        elo_diff = h_rating - a_rating
        margin = (elo_diff / 28) + HOME_ADVANTAGE_NBA
    else:
        margin = (h_rating - a_rating) + HOME_ADVANTAGE_NBA
    
    return round(margin, 2)
