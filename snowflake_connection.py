import os
from dotenv import load_dotenv
import snowflake.connector
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.backends import default_backend

# ==========================================
# CONFIGURATION
# ==========================================
load_dotenv()

SF_USER = os.getenv("SF_USER")
SF_ACCOUNT = os.getenv("SF_ACCOUNT")
SF_WAREHOUSE = os.getenv("SF_WAREHOUSE")
DATABASE = os.getenv("SF_DATABASE")
SCHEMA = os.getenv("SF_SCHEMA")
KEY_PATH = os.getenv("SF_PRIVATE_KEY_PATH")

# 1. Leer los bytes del archivo de la llave privada y desempaquetarla
with open(KEY_PATH, "rb") as key_file:
    p_key = serialization.load_pem_private_key(
        key_file.read(),
        password=None,  # Como la creamos con -nocrypt, no lleva contraseña interna
        backend=default_backend()
    )

# 2. Convertir la llave al formato de bytes DER que requiere estrictamente Snowflake
private_key_bytes = p_key.private_bytes(
    encoding=serialization.Encoding.DER,
    format=serialization.PrivateFormat.PKCS8,
    encryption_algorithm=serialization.NoEncryption()
)

# 3. Configurar el diccionario usando 'private_key' en lugar de 'password'
SNOWFLAKE_CONFIG = {
    "user": SF_USER,
    "account": SF_ACCOUNT,
    "warehouse": SF_WAREHOUSE,
    "database": DATABASE,
    "schema": SCHEMA,
    "private_key": private_key_bytes,
}

STAGE_NAME = "AUDIO"
TEST_WAV_PATH = "sample.wav"


def run_pipeline():
    # ----------------------------------------------------
    # PHASE 1: Test Snowflake Connection
    # ----------------------------------------------------
    print("⏳ [Phase 1] Attempting to connect to Snowflake...")
    try:
        conn = snowflake.connector.connect(**SNOWFLAKE_CONFIG)
        cursor = conn.cursor()

        # Run a baseline query to verify connectivity
        cursor.execute("SELECT CURRENT_VERSION(), CURRENT_USER();")
        version, user = cursor.fetchone()
        print(f"✅ Connection successful!")
        print(f"   - Snowflake Version: {version}")
        print(f"   - Authenticated User: {user}\n")

    except Exception as e:
        print(f"❌ Connection failed. Check your config dictionary.")
        print(f"   Error Details: {e}")
        return

    # ----------------------------------------------------
    # PHASE 2: Upload File & Execute Snowflake Queries
    # ----------------------------------------------------
    # CORRECCIÓN: Este bloque ahora está correctamente des-indentado
    # y se ejecutará secuencialmente después de la Fase 1.
    if not os.path.exists(TEST_WAV_PATH):
        print(f"⚠️ Skipping Phase 2: Local file '{TEST_WAV_PATH}' not found.")
        return

    print(
        f"⏳ [Phase 2] Found '{TEST_WAV_PATH}'. Preparing upload to Snowflake...")
    try:
        filename = os.path.basename(TEST_WAV_PATH)
        absolute_path = os.path.abspath(TEST_WAV_PATH).replace("\\", "/")

        # 1. Subir el archivo físicamente al stage @AUDIO
        print(f"🚀 Uploading {filename} to @{STAGE_NAME}...")
        put_query = f"PUT 'file://{absolute_path}' @{STAGE_NAME}/ auto_compress=False overwrite=True;"
        cursor.execute(put_query)
        put_result = cursor.fetchone()
        print(f"✅ Upload completed. Status: {put_result}")

        # 2. Ejecutar el pipeline de consultas que transcribe y llena tus tablas
        print("🤖 Triggering Snowflake Batch Audio Processing Pipeline...")

        pipeline_query = """
        INSERT INTO audio_transcripts_raw (file_name, full_transcript, channel0_transcript, channel1_transcript)
        SELECT
            a.relative_path,
            -- Envolvemos la URL con TO_FILE() para convertir el VARCHAR en un objeto tipo FILE
            SNOWFLAKE.CORTEX.AI_TRANSCRIBE(TO_FILE(BUILD_SCOPED_FILE_URL(@AUDIO, a.relative_path))),
            SNOWFLAKE.CORTEX.AI_TRANSCRIBE(TO_FILE(BUILD_SCOPED_FILE_URL(@AUDIO, a.relative_path))),
            SNOWFLAKE.CORTEX.AI_TRANSCRIBE(TO_FILE(BUILD_SCOPED_FILE_URL(@AUDIO, a.relative_path)))
        FROM DIRECTORY(@AUDIO) a
        WHERE a.relative_path ILIKE '%.wav'
        -- Evitamos procesar duplicados si el archivo ya fue transcrito antes
        AND a.relative_path NOT IN (SELECT file_name FROM audio_transcripts_raw);
        """
        cursor.execute(pipeline_query)
        print("✅ Step 1: Raw transcription inserted.")

        # 3. Mover datos limpios a la tabla final
        insert_final_query = """
        INSERT INTO audio_transcripts (file_name, transcript_json, full_text, channel0_text, channel1_text)
        SELECT
            file_name,
            full_transcript,
            full_transcript:text::VARCHAR,
            channel0_transcript:text::VARCHAR,
            channel1_transcript:text::VARCHAR
        FROM audio_transcripts_raw
        WHERE file_name NOT IN (SELECT file_name FROM audio_transcripts);
        """
        cursor.execute(insert_final_query)
        print("✅ Step 2: Final structured table populated.")

        # 4. Mostrar una vista previa de lo que quedó en la base de datos
        cursor.execute(
            "SELECT * FROM audio_transcripts ORDER BY transcribed_at DESC LIMIT 1;")
        db_record = cursor.fetchone()
        print("\n🎉 --- PIPELINE COMPLETADO EXITOSAMENTE ---")
        print(f"Archivo registrado: {db_record[0]}")
        print(f"Texto extraído: {db_record[2]}")

    except Exception as e:
        print(f"❌ Error durante la ejecución del pipeline SQL.")
        print(f"   Error Details: {e}")

    finally:
        # Cleanup connections
        cursor.close()
        conn.close()
        print("\n🔒 Snowflake session safely closed.")


if __name__ == "__main__":
    run_pipeline()
