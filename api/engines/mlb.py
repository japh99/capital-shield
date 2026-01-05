def calculate_expected_runs(h_rating, a_rating, h_pitcher_era=None, a_pitcher_era=None):
    """
    Motor MLB con ajuste por Starting Pitchers
    """
    MLB_AVG_RUNS = 4.5
    
    base_runs_home = (h_rating - a_rating) / 200 + MLB_AVG_RUNS
    base_runs_away = (a_rating - h_rating) / 200 + MLB_AVG_RUNS
    
    if h_pitcher_era and a_pitcher_era:
        h_pitcher_factor = (a_pitcher_era - 4.00) * 0.15
        a_pitcher_factor = (h_pitcher_era - 4.00) * 0.15
        base_runs_home += h_pitcher_factor
        base_runs_away += a_pitcher_factor
    
    expected_home = max(2.0, min(8.0, base_runs_home))
    expected_away = max(2.0, min(8.0, base_runs_away))
    
    return {
        'home_runs': round(expected_home, 2),
        'away_runs': round(expected_away, 2),
        'margin': round(expected_home - expected_away, 2),
        'total': round(expected_home + expected_away, 2)
    }
