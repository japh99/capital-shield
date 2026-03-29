"""
Capital Shield - API Routes Module
==================================
Este módulo exporta todas las rutas de la API para mantener el código organizado.
"""

from . import soccer_routes
from . import nba_routes
from . import mlb_routes

__all__ = ['soccer_routes', 'nba_routes', 'mlb_routes']
