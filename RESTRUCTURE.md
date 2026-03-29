# 🛡️ Capital Shield - Estructura Reorganizada

**SaaS Dashboard for Mathematical Advantage Analysis**

## 📁 Nueva Estructura del Proyecto

### Backend (Python/Flask)

```
api/
├── index.py              # Punto de entrada principal (legacy + gateway)
├── engines/              # Motores matemáticos puros
│   ├── __init__.py
│   ├── soccer.py         # Motor ELO → Expected Goals
│   ├── nba.py            # Motor ELO/Dunkel → Margen esperado
│   └── mlb.py            # Motor con ajuste por pitchers
├── routes/               # Endpoints API organizados por deporte
│   ├── __init__.py
│   ├── soccer_routes.py  # POST /api/soccer/analyze
│   ├── nba_routes.py     # POST /api/nba/analyze
│   └── mlb_routes.py     # POST /api/mlb/analyze
└── key_manager.py        # Gestión de API keys
```

### Frontend (React/TypeScript)

```
src/
├── App.tsx               # Componente principal
├── main.tsx              # Punto de entrada React
├── index.ts              # Barrel exports
├── config.ts             # Configuración de ligas y API keys
├── types/                # TypeScript interfaces
│   └── index.ts
├── hooks/                # Custom React hooks
│   ├── useApiKeys.ts     # Rotación de API keys
│   └── useMathEngine.ts  # Llamadas al backend
├── utils/                # Funciones utilitarias
│   └── helpers.ts
├── components/           # Componentes reutilizables
│   └── Layout.tsx
└── modules/              # Módulos por deporte
    ├── Soccer.tsx
    ├── Nba.tsx
    └── Mlb.tsx
```

### Configuración Centralizada

```
config/
└── __init__.py           # Configuración global y códigos de liga
```

## 🔄 Cambios Principales

### 1. **Backend Modular**
- ✅ Motores matemáticos separados en `api/engines/`
- ✅ Rutas API organizadas en `api/routes/` usando Blueprints
- ✅ Gateway legacy mantenido para compatibilidad
- ✅ Nuevos endpoints RESTful:
  - `POST /api/soccer/analyze`
  - `POST /api/nba/analyze`
  - `POST /api/mlb/analyze`

### 2. **Frontend Tipado**
- ✅ Interfaces TypeScript en `src/types/`
- ✅ Hooks customizados para lógica reutilizable
- ✅ Utilidades centralizadas en `src/utils/`
- ✅ Exportación unificada vía `src/index.ts`

### 3. **Configuración Unificada**
- ✅ Códigos de liga centralizados en `config/__init__.py`
- ✅ Variables de entorno soportadas
- ✅ Constantes compartidas backend/frontend

## 🚀 Uso de la API

### Endpoint Legacy (mantenido)
```python
POST /api
{
  "task": "math",
  "sport": "soccer",
  "h_rating": 1500,
  "a_rating": 1450,
  "line": -0.5,
  "league": "laliga"
}
```

### Nuevos Endpoints Modulares

#### Soccer
```python
POST /api/soccer/analyze
{
  "home_elo": 1500,
  "away_elo": 1450,
  "league": "laliga",
  "line": -0.5
}
```

#### NBA
```python
POST /api/nba/analyze
{
  "home_rating": 1650,
  "away_rating": 1600,
  "line": -5.5,
  "rating_system": "elo"
}
```

#### MLB
```python
POST /api/mlb/analyze
{
  "home_rating": 95,
  "away_rating": 88,
  "line": -1.5,
  "home_pitcher_era": 3.25,
  "away_pitcher_era": 4.10
}
```

## 📦 Instalación

### Backend
```bash
pip install flask flask-cors
```

### Frontend
```bash
npm install
npm run dev
```

## 🧠 Filosofía del Proyecto

1. **Motor de Cuotas (Python):** Calcula el valor real (Fair Value) utilizando modelos ELO y Power Ratings.
2. **Terminal de Usuario (React):** Interfaz Titanium optimizada para la toma de decisiones rápida.
3. **Análisis Cualitativo (AI):** Generación de prompts estructurales para validación con modelos de lenguaje externos.

## ⚖️ Disclaimer

Este software es una herramienta de análisis estadístico. No es un sitio de apuestas y no garantiza resultados financieros.
