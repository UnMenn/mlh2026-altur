import { useState } from 'react'
import './App.css'

function App() {
  const [audio, setAudio] = useState<File | null>(null)

  return (
    <main className="page">
      <header className="topbar">
        <h2>Verificación de Audio</h2>
      </header>

      <section className="content">
        <div className="text">
          <span>ANÁLISIS DE LLAMADAS</span>

          <h1>
            Sube una llamada
            <br />
            para analizarla.
          </h1>

          <p>
            Selecciona un archivo de audio para comenzar.
          </p>
        </div>

        <div className="upload-card">
          <label className="upload-box">
            <input
              type="file"
              accept="audio/*"
              onChange={(e) =>
                setAudio(e.target.files?.[0] || null)
              }
            />

            <div className="audio-icon">♪</div>

            <h3>
              {audio ? audio.name : 'Sube tu audio'}
            </h3>

            <p>
              {audio
                ? 'Archivo listo para analizar'
                : 'Arrastra un archivo aquí o selecciónalo desde tu computadora'}
            </p>

            <span className="file-button">
              {audio ? 'Cambiar archivo' : 'Elegir archivo'}
            </span>
          </label>

          <button
            className="analyze-button"
            disabled={!audio}
          >
            Analizar audio →
          </button>
        </div>
      </section>
    </main>
  )
}

export default App