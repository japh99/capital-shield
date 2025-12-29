// Reemplaza SOLO la función runSmartRadar dentro de Nba.tsx

const runSmartRadar = async () => {
    if (filteredMatches.length === 0) return alert("No hay partidos para analizar.");
    
    setIsScanning(true);
    setRadarResults([]);
    
    try {
        const resp = await axios.post('/api/smart_radar', { 
            matches: filteredMatches 
        });

        // Verificamos si el servidor nos mandó un error claro
        if (resp.data.error) {
          alert("Aviso: " + resp.data.error);
          return;
        }

        setRadarResults(resp.data.priorities || []);

    } catch (e: any) {
        // --- AQUÍ SE SOLUCIONA EL [object Object] ---
        let mensajeError = "Error desconocido";
        
        if (e.response) {
            // El servidor respondió con un error (400, 500, etc)
            mensajeError = e.response.data.error || JSON.stringify(e.response.data);
        } else if (e.request) {
            // La petición se hizo pero no hubo respuesta
            mensajeError = "El servidor no responde. Vercel pudo haber cortado la conexión.";
        } else {
            mensajeError = e.message;
        }

        alert("Fallo en Smart Scan: " + mensajeError);
    } finally {
        setIsScanning(false);
    }
};
