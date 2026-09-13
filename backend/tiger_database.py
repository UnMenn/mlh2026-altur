import os
import asyncpg
from dotenv import load_dotenv, find_dotenv

# Cargar automáticamente el archivo .env desde la raíz del proyecto
load_dotenv(find_dotenv())
DATABASE_URL = os.getenv("TIGER_DATABASE_URL")

class DatabaseManager:
    def _init_(self):
        self.pool = None

    async def connect(self):
        if not self.pool:
            try:
                self.pool = await asyncpg.create_pool(DATABASE_URL, min_size=1, max_size=10)
                print("Conexión exitosa al pool de Tiger Data.", flush=True)
            except Exception as e:
                print(f"Error conectando a Tiger Data: {e}", flush=True)

    async def close(self):
        if self.pool:
            await self.pool.close()
            print("Conexión a Tiger Data cerrada.", flush=True)

    async def log_call_telemetry(self, filename: str, probability: float, status: str, segments_count: int):
        if not self.pool:
            # Si no hay conexión configurada en local para pruebas rápidas, evitamos fallo crítico
            print("Advertencia: No hay conexión activa a Tiger Data. Omitiendo guardado.", flush=True)
            return

        query = """
            INSERT INTO call_telemetry (time, call_id, synthetic_probability, channel_status, segments_count)
            VALUES (NOW(), $1, $2, $3, $4)
        """
        async with self.pool.acquire() as connection:
            await connection.execute(query, filename, probability, status, segments_count)

db = DatabaseManager()
