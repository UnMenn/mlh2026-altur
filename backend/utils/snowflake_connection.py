import os
from dotenv import load_dotenv
import snowflake.connector
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.backends import default_backend
from pathlib import Path

CURRENT_FILE = Path(__file__).resolve()
PROJECT_ROOT = CURRENT_FILE.parents[2]
INPUT_DIR = Path(r"C:\Users\calvo\dev\mlh2026-altur\data\input")


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

# 1. Read and unpack the private key bytes.
with open(KEY_PATH, "rb") as key_file:
    p_key = serialization.load_pem_private_key(
        key_file.read(),
        # The key was created with -nocrypt and has no passphrase.
        password=None,
        backend=default_backend()
    )

# 2. Convert the key to the DER byte format required by Snowflake.
private_key_bytes = p_key.private_bytes(
    encoding=serialization.Encoding.DER,
    format=serialization.PrivateFormat.PKCS8,
    encryption_algorithm=serialization.NoEncryption()
)

# 3. Configure the dictionary using private_key instead of password.
SNOWFLAKE_CONFIG = {
    "user": SF_USER,
    "account": SF_ACCOUNT,
    "warehouse": SF_WAREHOUSE,
    "database": DATABASE,
    "schema": SCHEMA,
    "private_key": private_key_bytes,
    "role": "SYSADMIN"
}

STAGE_NAME = "AUDIO"


def snowflake_connection(call_id):
    # ----------------------------------------------------
    # PHASE 1: Test Snowflake Connection
    # ----------------------------------------------------
    print("Connecting to Snowflake...")
    try:
        conn = snowflake.connector.connect(**SNOWFLAKE_CONFIG)
        cursor = conn.cursor()

        cursor.execute("SELECT CURRENT_VERSION(), CURRENT_USER();")
        print(f"Connection successful!")

    except Exception as e:
        print(f"Connection failed. Check your config dictionary.")
        print(f"Error Details: {e}")
        return

    audio_completo = f"{call_id}_stereo.wav"
    audio_canal0 = f"{call_id}_caller.wav"
    audio_canal1 = f"{call_id}_agent.wav"

    path_stereo = INPUT_DIR / audio_completo
    path_c0 = INPUT_DIR / audio_canal0
    path_c1 = INPUT_DIR / audio_canal1

    # Verify that the file set exists in the working directory.
    if not path_stereo.exists():
        print(f"Skipping Phase 2: Base file '{audio_completo}' not found.")
        print(
            f"Make sure {audio_completo}, {audio_canal0}, and {audio_canal1} are in your folder.")
        cursor.close()
        conn.close()
        return

    print(f"[Phase 2] Found audio set. Preparing upload to Snowflake...")
    try:
        # 1. Upload each file independently to its corresponding stage.
        print("Uploading separated files to their respective stages...")

        abs_stereo = str(path_stereo.resolve()).replace("\\", "/")
        abs_c0 = str(path_c0.resolve()).replace("\\", "/")
        abs_c1 = str(path_c1.resolve()).replace("\\", "/")

        cursor.execute(
            f"PUT 'file://{abs_stereo}' @AUDIO/ AUTO_COMPRESS=FALSE OVERWRITE=TRUE;")
        cursor.execute(
            f"PUT 'file://{abs_c0}' @CHANNEL_0_AUDIO/ AUTO_COMPRESS=FALSE OVERWRITE=TRUE;")
        cursor.execute(
            f"PUT 'file://{abs_c1}' @CHANNEL_1_AUDIO/ AUTO_COMPRESS=FALSE OVERWRITE=TRUE;")
        print("All individual channels were uploaded successfully.")

        # 2. Refresh the directories so Snowflake indexes the new names.
        print("Synchronizing storage catalogs...")
        cursor.execute("ALTER STAGE AUDIO REFRESH;")
        cursor.execute("ALTER STAGE CHANNEL_0_AUDIO REFRESH;")
        cursor.execute("ALTER STAGE CHANNEL_1_AUDIO REFRESH;")

        # 3. Run the insert pipeline across the stages dynamically.
        print(f"Triggering your Multi-Channel AI_TRANSCRIBE Pipeline...")

        pipeline_query = f"""
        INSERT INTO audio_transcripts_raw (
            file_name,
            full_transcript,
            channel0_transcript,
            channel1_transcript
        )
        SELECT
            a.relative_path as file_name,

            -- Transcribe the full stereo file
            SNOWFLAKE.CORTEX.AI_TRANSCRIBE(TO_FILE(BUILD_SCOPED_FILE_URL(@AUDIO, a.relative_path))),

            -- Find the corresponding file by replacing the filename suffix
            SNOWFLAKE.CORTEX.AI_TRANSCRIBE(TO_FILE(BUILD_SCOPED_FILE_URL(@CHANNEL_0_AUDIO, REPLACE(a.relative_path, '_stereo.wav', '_caller.wav')))),

            SNOWFLAKE.CORTEX.AI_TRANSCRIBE(TO_FILE(BUILD_SCOPED_FILE_URL(@CHANNEL_1_AUDIO, REPLACE(a.relative_path, '_stereo.wav', '_agent.wav'))))

        FROM DIRECTORY(@AUDIO) a
        WHERE a.relative_path = '{audio_completo}'
        AND a.relative_path NOT IN (SELECT file_name FROM audio_transcripts_raw);
        """
        cursor.execute(pipeline_query)
        print("Step 1: Multi-channel transcription saved to audio_transcripts_raw.")

        # 4. Move cleaned data to the final table.
        print("Populating final audio_transcripts table...")

        insert_final_query = f"""
        INSERT INTO audio_transcripts (
            file_name,
            transcript_json,
            full_text,
            channel0_text,
            channel1_text
        )
        SELECT
            file_name,
            full_transcript,
            full_transcript:text::VARCHAR,
            channel0_transcript:text::VARCHAR,
            channel1_transcript:text::VARCHAR
        FROM audio_transcripts_raw
        WHERE file_name = '{audio_completo}'
        AND file_name NOT IN (SELECT file_name FROM audio_transcripts);
        """
        cursor.execute(insert_final_query)
        print("Step 2: Final table audio_transcripts populated successfully.")

        # 5. Show a preview of the actual channel split in the console.
        print(f"Fetching results for '{audio_completo}'...")
        cursor.execute(f"""
            SELECT file_name, full_text, channel0_text, channel1_text
            FROM audio_transcripts
            WHERE file_name = '{audio_completo}';
        """)
        db_record = cursor.fetchone()

        if db_record is not None:
            print("\n--- MULTI-CHANNEL PIPELINE COMPLETED SUCCESSFULLY ---")
            print(f"Stereo File: {db_record[0]}")
            print(f"Mixed Text: {db_record[1][:120]}...")
            print(f"Caller Channel (C0): {db_record[2][:120]}...")
            print(f"Agent Channel (C1): {db_record[3][:120]}...")
        else:
            print(
                "\nError: The record was processed, but the final row could not be read.")
    except Exception as e:
        print("Error while running the SQL pipeline.")
        print(f"Error Details: {e}")

    finally:
        cursor.close()
        conn.close()
        print("\nSnowflake session safely closed.")
