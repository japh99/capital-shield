import math

def calculate_expected_goals(h_elo, a_elo, league='generic'):
    """
    Motor ELO → Expected Goals con ventaja local calibrada
    """
    HOME_ADVANTAGE = {
        'epl': 65, 'laliga': 72, 'bundesliga': 68, 'seriea': 70,
        'ligue1': 75, 'mls': 85, 'liga_mx': 95, 'libertadores': 50,
        'uefa_cl': 55, 'generic': 70
    }
    
    ha_points = HOME_ADVANTAGE.get(league.lower(), 70)
    elo_diff = (h_elo + ha_points) - a_elo
    win_prob = 1 / (1 + 10 ** (-elo_diff / 400))
    
    expected_home = 1.2 + (win_prob - 0.5) * 2.8
    expected_away = 1.2 + ((1 - win_prob) - 0.5) * 2.8
    
    expected_home = max(0.3, min(4.5, expected_home))
    expected_away = max(0.3, min(4.5, expected_away))
    
    return {
        'home_xg': round(expected_home, 2),
        'away_xg': round(expected_away, 2),
        'margin': round(expected_home - expected_away, 2),
        'total': round(expected_home + expected_away, 2),
        'win_probability': round(win_prob * 100, 1)
    }
