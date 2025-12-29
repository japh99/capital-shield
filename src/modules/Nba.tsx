const runSmartRadar = async () => {
    if (filteredMatches.length === 0) return alert("No hay partidos para escanear.");
    setIsScanning(true);
    setRadarResults([]);
    
    try {
      // Llamamos a la puerta única /api
      const resp = await axios.post('/api', { 
        task: 'radar',
        matches: filteredMatches 
      });
      
      // Si el backend devolvió un error JSON
      if (resp.data.error) {
        alert("Aviso del Servidor: " + resp.data.error);
      } else {
        setRadarResults(resp.data.priorities || []);
      }

    } catch (e: any) {
      // AQUÍ MATAMOS EL [object Object]
      const errorReal = e.response?.data?.error || e.message || "Error de conexión";
      alert("Fallo Técnico: " + errorReal);
    } finally {
      setIsScanning(false);
    }
  };
