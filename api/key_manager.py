import os
import random
from datetime import datetime, timedelta
from typing import Optional, List, Dict
import json

class KeyRotator:
    """
    Sistema inteligente de rotación de API Keys
    Distribuye llamadas entre múltiples keys para evitar rate limits
    """
    
    def __init__(self):
        self.keys = self._load_keys()
        self.usage = self._initialize_usage()
        self.max_calls_per_hour = 450  # The Odds API permite ~500/hora por key (dejamos margen)
        
    def _load_keys(self) -> List[str]:
        """Carga todas las API keys desde variables de entorno"""
        keys = []
        
        # Intentar cargar hasta 50 keys (ODDS_API_KEY_1, ODDS_API_KEY_2, ...)
        for i in range(1, 51):
            key = os.getenv(f'ODDS_API_KEY_{i}')
            if key:
                keys.append(key)
        
        # Fallback: si no hay keys numeradas, usar key única
        if not keys:
            single_key = os.getenv('ODDS_API_KEY')
            if single_key:
                keys.append(single_key)
        
        if not keys:
            raise ValueError("❌ No se encontraron API Keys en variables de entorno")
        
        print(f"✅ Cargadas {len(keys)} API Key(s) para rotación")
        return keys
    
    def _initialize_usage(self) -> Dict[str, Dict]:
        """Inicializa contador de uso por key"""
        return {
            key: {
                'calls': 0,
                'reset_time': datetime.now(),
                'blocked_until': None,
                'total_lifetime_calls': 0
            }
            for key in self.keys
        }
    
    def get_key(self) -> str:
        """
        Devuelve la API key con menor uso en la última hora
        Implementa estrategia de 'least recently used' con auto-reset
        """
        now = datetime.now()
        
        # Reset contadores cada hora
        for key in self.usage:
            time_since_reset = now - self.usage[key]['reset_time']
            
            if time_since_reset > timedelta(hours=1):
                self.usage[key]['calls'] = 0
                self.usage[key]['reset_time'] = now
                self.usage[key]['blocked_until'] = None
        
        # Filtrar keys disponibles (no bloqueadas y bajo el límite)
        available_keys = [
            key for key in self.keys
            if (self.usage[key]['blocked_until'] is None or 
                self.usage[key]['blocked_until'] < now) and
               self.usage[key]['calls'] < self.max_calls_per_hour
        ]
        
        if not available_keys:
            # 🚨 TODAS LAS KEYS AGOTADAS - estrategia de emergencia
            print("⚠️ RATE LIMIT: Todas las keys agotadas, esperando reset...")
            
            # Encontrar la key que se resetea más pronto
            next_reset = min(
                self.usage.values(), 
                key=lambda x: x['reset_time']
            )
            
            wait_seconds = (next_reset['reset_time'] + timedelta(hours=1) - now).total_seconds()
            
            raise Exception(
                f"Rate limit alcanzado. Próximo reset en {int(wait_seconds/60)} minutos. "
                f"Considera añadir más API keys."
            )
        
        # Seleccionar key con menor uso
        selected_key = min(
            available_keys,
            key=lambda k: self.usage[k]['calls']
        )
        
        # Incrementar contador
        self.usage[selected_key]['calls'] += 1
        self.usage[selected_key]['total_lifetime_calls'] += 1
        
        return selected_key
    
    def mark_key_blocked(self, key: str, minutes: int = 60):
        """Marca una key como bloqueada temporalmente"""
        if key in self.usage:
            self.usage[key]['blocked_until'] = datetime.now() + timedelta(minutes=minutes)
            print(f"🚫 Key bloqueada por {minutes} minutos")
    
    def get_stats(self) -> Dict:
        """Devuelve estadísticas de uso de keys"""
        now = datetime.now()
        
        stats = {
            'total_keys': len(self.keys),
            'keys_available': sum(
                1 for key in self.keys
                if (self.usage[key]['blocked_until'] is None or 
                    self.usage[key]['blocked_until'] < now) and
                   self.usage[key]['calls'] < self.max_calls_per_hour
            ),
            'total_calls_this_hour': sum(
                self.usage[key]['calls'] for key in self.keys
            ),
            'total_lifetime_calls': sum(
                self.usage[key]['total_lifetime_calls'] for key in self.keys
            ),
            'per_key_usage': [
                {
                    'key_id': f"Key_{i+1}",
                    'calls_this_hour': self.usage[key]['calls'],
                    'remaining_calls': self.max_calls_per_hour - self.usage[key]['calls'],
                    'status': 'blocked' if (self.usage[key]['blocked_until'] and 
                                           self.usage[key]['blocked_until'] > now) 
                             else 'available'
                }
                for i, key in enumerate(self.keys)
            ]
        }
        
        return stats


# ============================================
# 🌐 INTEGRACIÓN CON INDEX.PY
# ============================================

# Instancia global del rotador (se carga una sola vez)
try:
    key_rotator = KeyRotator()
except ValueError as e:
    print(f"❌ Error inicializando rotador: {e}")
    key_rotator = None


def get_odds_api_key() -> str:
    """
    Función helper para obtener una key disponible
    Usar esta función en lugar de acceder directamente a CONFIG.ODDS_API_KEY
    """
    if key_rotator is None:
        # Fallback si no hay rotador
        return os.getenv('ODDS_API_KEY', '')
    
    try:
        return key_rotator.get_key()
    except Exception as e:
        print(f"⚠️ Error obteniendo key: {e}")
        # Fallback a key estática
        return os.getenv('ODDS_API_KEY', '')


def get_key_stats() -> Dict:
    """Devuelve estadísticas del sistema de rotación"""
    if key_rotator is None:
        return {"error": "Key rotator no inicializado"}
    
    return key_rotator.get_stats()
