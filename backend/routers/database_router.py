from fastapi import APIRouter, HTTPException
from backend.tiger_database import db

router = APIRouter()

@router.get("/telemetry")
async def get_all_telemetry(limit: int = 50):
    """Devuelve el historial completo de llamadas procesadas ordenadas por tiempo."""
    if not db.pool:
        raise HTTPException(status_code=503, detail="Base de datos no conectada")
    
    try:
        query = """
            SELECT time, call_id, synthetic_probability, channel_status, segments_count 
            FROM call_telemetry 
            ORDER BY time DESC 
            LIMIT $1;
        """
        async with db.pool.acquire() as connection:
            rows = await connection.fetch(query, limit)
            # Convertir las filas a un formato JSON serializable (fechas a string)
            return [
                {
                    "time": row["time"].isoformat(),
                    "call_id": row["call_id"],
                    "synthetic_probability": row["synthetic_probability"],
                    "channel_status": row["channel_status"],
                    "segments_count": row["segments_count"],
                }
                for row in rows
            ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error consultando la base de datos: {str(e)}")

@router.get("/metrics/summary")
async def get_metrics_summary():
    """Devuelve un resumen general de detecciones para alimentar tarjetas de estadísticas en el frontend."""
    if not db.pool:
        raise HTTPException(status_code=503, detail="Base de datos no conectada")
    
    try:
        query = """
            SELECT 
                COUNT(*) AS total_calls,
                SUM(CASE WHEN channel_status = 'suspicious' THEN 1 ELSE 0 END) AS suspicious_calls,
                AVG(synthetic_probability) AS avg_probability
            FROM call_telemetry;
        """
        async with db.pool.acquire() as connection:
            row = await connection.fetchrow(query)
            return {
                "total_calls": row["total_calls"] or 0,
                "suspicious_calls": row["suspicious_calls"] or 0,
                "avg_probability": float(row["avg_probability"] or 0.0),
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculando métricas: {str(e)}")
