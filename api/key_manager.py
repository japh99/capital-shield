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
        keys = ["734f30d0866696cf90d5029ac106cfba",
  "10fb6d9d7b3240906d0acea646068535",
  "a9ff72549c4910f1fa9659e175a35cc0",
  "25e9d8872877f5110254ff6ef42056c6",
  "6205cdb2cfd889e6fc44518f950f7dad",
  "d39a6f31abf6412d46b2c7185a5dfffe",
  "fbd5dece2a99c992cfd783aedfcd2ef3",
  "687ba857bcae9c7f33545dcbe59aeb2b",
  "f9ff83040b9d2afc1862094694f53da2",
  "f730fa9137a7cd927554df334af916dc",
  "9091ec0ea25e0cdfc161b91603e31a9a",
  "c0f7d526dd778654dfee7c0686124a77",
  "61a015bc1506aac11ec62901a6189dc6",
  "d585a73190a117c1041ccc78b92b23d9",
  "4056628d07b0b900175cb332c191cda0",
  "ac4d3eb2d6df42030568eadeee906770",
  "3cebba62ff5330d1a409160e6870bfd6",
  "358644d442444f95bd0b0278e4d3ea22",
  "45dff0519cde0396df06fc4bc1f9bce1",
  "a4f585765036f57be0966b39125f87a0",
  "349f8eff303fa0963424c54ba181535b",
  "f54405559ba5aaa27a9687992a84ae2f",
  "24772de60f0ebe37a554b179e0dd819f",
  "b7bdefecc83235f7923868a0f2e3e114",
  "3a9d3110045fd7373875bdbc7459c82c",
  "d2aa9011f39bfcb309b3ee1da6328573",
  "107ad40390a24eb61ee02ff976f3d3ac",
  "8f6358efeec75d6099147764963ae0f8",
  "672962843293d4985d0bed1814d3b716",
  "4b1867baf919f992554c77f493d258c5",
  "b3fd66af803adc62f00122d51da7a0e6",
  "53ded39e2281f16a243627673ad2ac8c",
  "bf785b4e9fba3b9cd1adb99b9905880b",
  "60e3b2a9a7324923d78bfc6dd6f3e5d3",
  "cc16776a60e3eee3e1053577216b7a29",
  "a0cc233165bc0ed04ee42feeaf2c9d30",
  "d2afc749fc6b64adb4d8361b0fe58b4b",
  "b351eb6fb3f5e95b019c18117e93db1b",
  "74dbc42e50dd64687dc1fad8af59c490",
  "7b4a5639cbe63ddf37b64d7e327d3e71",
  "20cec1e2b8c3fd9bb86d9e4fad7e6081",
  "1352436d9a0e223478ec83aec230b4aa",
  "29257226d1c9b6a15c141d989193ef72",
  "24677adc5f5ff8401c6d98ea033e0f0b",
  "54e84a82251def9696ba767d6e2ca76c",
  "ff3e9e3a12c2728c6c4ddea087bc51a9",
  "f3ff0fb5d7a7a683f88b8adec904e7b8",
  "1e0ab1ff51d111c88aebe4723020946a",
  "6f74a75a76f42fabaa815c4461c59980",
  "86de2f86b0b628024ef6d5546b479c0f"]
        
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
