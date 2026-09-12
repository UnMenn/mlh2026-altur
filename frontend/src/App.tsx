import { useState } from 'react'
import './App.css'

function App() {
  const [audio, setAudio] = useState<File | null>(null)
  const [mostrarResultado, setMostrarResultado] = useState(false)

  // Datos temporales para probar la interfaz
  const dummyData = {
    esHumano: true,
    acustica: 35,
    comportamiento: 25,
    semantica: 20,
    contexto: 20
  }

  return (
    <main className="page">
      <header className="topbar">
        <h2>Verificación de Audio</h2>
      </header>

      {!mostrarResultado ? (
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
              onClick={() => setMostrarResultado(true)}
            >
              Analizar audio →
            </button>
          </div>
        </section>
      ) : (
        <section className="results">

          <span className="result-label">
            RESULTADO DEL ANÁLISIS
          </span>

          <div className="result-top">
            <div>
              <p className="result-small">
                Resultado de la llamada
              </p>

              <h1 className="result-title">
                {dummyData.esHumano
                  ? 'ES HUMANO'
                  : 'NO ES HUMANO'}
              </h1>
            </div>

            <button
              className="new-analysis"
              onClick={() => {
                setMostrarResultado(false)
                setAudio(null)
              }}
            >
              Analizar otra llamada
            </button>
          </div>

          <div className="analysis-card">

            <div className="card-header">
              <div>
                <span>ANÁLISIS DE DETECCIÓN</span>
                <h2>Datos de la llamada</h2>
              </div>
            </div>

            <div className="pie-section">

              <div
                className="pie-chart"
                style={{
                  background: `conic-gradient(
                    #292929 0% ${dummyData.acustica}%,
                    #666666 ${dummyData.acustica}% ${
                      dummyData.acustica +
                      dummyData.comportamiento
                    }%,
                    #999999 ${
                      dummyData.acustica +
                      dummyData.comportamiento
                    }% ${
                      dummyData.acustica +
                      dummyData.comportamiento +
                      dummyData.semantica
                    }%,
                    #cccccc ${
                      dummyData.acustica +
                      dummyData.comportamiento +
                      dummyData.semantica
                    }% 100%
                  )`
                }}
              />

              <div className="legend">

                <div className="legend-item">
                  <span className="legend-color color-1"></span>

                  <div>
                    <p>Detección acústica</p>
                    <strong>
                      {dummyData.acustica}%
                    </strong>
                  </div>
                </div>

                <div className="legend-item">
                  <span className="legend-color color-2"></span>

                  <div>
                    <p>Comportamiento</p>
                    <strong>
                      {dummyData.comportamiento}%
                    </strong>
                  </div>
                </div>

                <div className="legend-item">
                  <span className="legend-color color-3"></span>

                  <div>
                    <p>Semántica</p>
                    <strong>
                      {dummyData.semantica}%
                    </strong>
                  </div>
                </div>

                <div className="legend-item">
                  <span className="legend-color color-4"></span>

                  <div>
                    <p>Contexto</p>
                    <strong>
                      {dummyData.contexto}%
                    </strong>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  )
}

export default App 