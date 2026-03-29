// ============================================
// CAPITAL SHIELD - Utility Functions
// ============================================

/**
 * Parsea una línea de hándicap a número decimal
 */
export const parseLine = (input: string): number => {
  if (!input) return 0;
  let clean = input.toString().replace(/\s+/g, '').replace('+', '');
  if (clean.includes('/')) {
    const parts = clean.split('/');
    return (parseFloat(parts[0]) + parseFloat(parts[1])) / 2;
  }
  return parseFloat(clean) || 0;
};

/**
 * Convierte fecha UTC a hora de Colombia
 */
export const getColombiaTime = (utcDate: string): string => {
  try {
    return new Date(utcDate).toLocaleTimeString('es-CO', {
      timeZone: 'America/Bogota', 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true
    });
  } catch (e) { 
    return "N/A"; 
  }
};

/**
 * Extrae las cuotas de un partido
 */
export const extractOdds = (match: any): string => {
  if (!match?.bookmakers?.[0]?.markets?.[0]) return "Cuotas no disponibles";
  try {
    return match.bookmakers[0].markets[0].outcomes
      .map((o: any) => `${o.name}: ${o.price}`)
      .join(' | ');
  } catch (e) { 
    return "N/A"; 
  }
};

/**
 * Calcula el edge porcentual
 */
export const calculateEdge = (expected: number, line: number): number => {
  return expected - line;
};

/**
 * Formatea un número con decimales específicos
 */
export const formatDecimal = (value: number, decimals: number = 2): string => {
  return value.toFixed(decimals);
};

/**
 * Determina si un edge es positivo (valor)
 */
export const isValueBet = (edge: number): boolean => {
  return edge > 0;
};

/**
 * Clasifica la confianza basada en el edge
 */
export const getConfidenceLevel = (edge: number): string => {
  if (edge >= 10) return 'ALTA';
  if (edge >= 5) return 'MEDIA';
  if (edge >= 2) return 'BAJA';
  return 'SIN VALOR';
};

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD para Colombia
 */
export const getColombiaDate = (): string => {
  return new Date().toLocaleDateString('en-CA', {timeZone: 'America/Bogota'});
};
