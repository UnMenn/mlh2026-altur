import { useState } from 'react'
import { Link } from 'react-router-dom'

import {
  analyzeAudio,
  type AudioAnalysisResponse,
} from './services/audioAnalysis'

import './App.css'

function App() {
  const [audios, setAudios] = useState<File[]>([])
  const [resultados, setResultados] =
    useState<AudioAnalysisResponse[]>([])

  const [mostrarResultado, setMostrarResultado] =
    useState(false)

  const [analizando, setAnalizando] =
    useState(false)

  const [error, setError] =
    useState('')

  const seleccionarAudios = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const archivosSeleccionados = Array.from(
      e.target.files || []
    )
    const archivosInvalidos =
      archivosSeleccionados.filter(
        (archivo) =>
          !archivo.type.startsWith('audio/')
      )

    if (archivosInvalidos.length > 0) {
      setError(
        'Solo puedes subir archivos de audio.'
      )

      setAudios([])
      setResultados([])

      return
    }

    setError('')
    setResultados([])
    setAudios(archivosSeleccionados)
  }

  const analizarAudios = async () => {
    if (audios.length === 0) {
      setError(
        'Selecciona al menos un archivo de audio.'
      )

      return
    }

    try {
      setError('')
      setAnalizando(true)

      /*
       * Envía todos los audios seleccionados
       * al endpoint /api/process.
       */
      const respuestas =
        await Promise.all(
          audios.map((audio) =>
            analyzeAudio(audio)
          )
        )

      console.log(
        'Resultados de la API:',
        respuestas
      )

      setResultados(respuestas)
      setMostrarResultado(true)
    } catch (err) {
      console.error(
        'Error analizando audios:',
        err
      )

      setError(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error durante el análisis.'
      )
    } finally {
      setAnalizando(false)
    }
  }

  const nuevoAnalisis = () => {
    setMostrarResultado(false)
    setAudios([])
    setResultados([])
    setError('')
    setAnalizando(false)
  }

  return (
    <main className="pagina">
      <header className="barraSuperior">
        <h2>
          Verificación de Audio
          <span className="brand-dot">
            .
          </span>
        </h2>
      </header>

      {!mostrarResultado ? (
        <section className="contenidoPrincipal">
          <div className="textoPrincipal">
            <span>
              ANÁLISIS DE LLAMADAS
            </span>

            <h1>
              Sube tus llamadas
              <br />
              para analizarlas.
            </h1>

            <p>
              Selecciona hasta 3 archivos de audio
              para comenzar.
            </p>

            <Link
              to="/demo"
              className="live-demo-link"
            >
              Probar en vivo
            </Link>
          </div>

          <div className="tarjetaAudio">
            <label className="zonaSubirAudio">
              <input
                type="file"
                accept="audio/*"
                multiple
                onChange={seleccionarAudios}
              />

              <div className="iconoAudio">
                ♪
              </div>

              <h3>
                {audios.length > 0
                  ? `${audios.length} ${
                      audios.length === 1
                        ? 'archivo seleccionado'
                        : 'archivos seleccionados'
                    }`
                  : 'Sube tus audios'}
              </h3>

              <p>
                {audios.length > 0
                  ? 'Archivos listos para analizar'
                  : 'Arrastra hasta 3 archivos aquí o selecciónalos desde tu computadora'}
              </p>

              {audios.length > 0 && (
                <div className="listaArchivos">
                  {audios.map(
                    (audio, index) => (
                      <p key={index}>
                        {audio.name}
                      </p>
                    )
                  )}
                </div>
              )}

              <span className="botonArchivo">
                {audios.length > 0
                  ? 'Cambiar archivos'
                  : 'Elegir archivos'}
              </span>
            </label>

            {error && (
              <p className="mensajeError">
                {error}
              </p>
            )}

            {analizando && (
              <div className="estadoCarga">
                <div className="circuloCarga" />

                <p>
                  Analizando llamadas...
                </p>
              </div>
            )}

            <button
              className="botonAnalizar"
              disabled={
                audios.length === 0 ||
                analizando
              }
              onClick={analizarAudios}
            >
              {analizando
                ? 'Analizando...'
                : 'Analizar audios →'}
            </button>
          </div>
        </section>
      ) : (
        <section className="resultados">
          <span className="etiquetaResultado">
            RESULTADOS DEL ANÁLISIS
          </span>

          <div className="encabezadoResultado">
            <div>
              <p className="textoResultado">
                Se analizaron{' '}
                {resultados.length}{' '}
                audio
                {resultados.length !== 1
                  ? 's'
                  : ''}
              </p>

              <h1 className="tituloResultado">
                Resultados
              </h1>
            </div>

            <button
              className="botonNuevoAnalisis"
              onClick={nuevoAnalisis}
            >
              Analizar otras llamadas
            </button>
          </div>

          <div className="listaResultados">
            {resultados.map(
              (resultado, index) => {
                const esSintetico =
                  resultado.prediction
                    .toLowerCase() ===
                  'synthetic'

                const probabilidadSintetica =
                  resultado.synthetic_probability *
                  100

                const probabilidadHumana =
                  100 -
                  probabilidadSintetica

                return (
                  <div
                    className="tarjetaAnalisis"
                    key={`${resultado.filename}-${index}`}
                  >
                    <div className="encabezadoAnalisis">
                      <span>
                        ANÁLISIS DE DETECCIÓN
                      </span>

                      <h2>
                        {resultado.filename}
                      </h2>
                    </div>

                    <h1 className="resultadoAudio">
                      {esSintetico
                        ? 'AUDIO SINTÉTICO'
                        : 'AUDIO HUMANO'}
                    </h1>

                    <div className="seccionGrafica">
                      <div
                        className="graficaPastel"
                        style={{
                          background: `
                            conic-gradient(
                              #292929 0%
                              ${probabilidadSintetica}%,
                              #cccccc
                              ${probabilidadSintetica}%
                              100%
                            )
                          `,
                        }}
                      />

                      <div className="datosGrafica">
                        <div className="datoGrafica">
                          <span className="colorDato colorAcustica" />

                          <div>
                            <p>
                              Probabilidad sintética
                            </p>

                            <strong>
                              {probabilidadSintetica.toFixed(
                                2
                              )}
                              %
                            </strong>
                          </div>
                        </div>

                        <div className="datoGrafica">
                          <span className="colorDato colorContexto" />

                          <div>
                            <p>
                              Probabilidad humana
                            </p>

                            <strong>
                              {probabilidadHumana.toFixed(
                                2
                              )}
                              %
                            </strong>
                          </div>
                        </div>

                        <div className="datoGrafica">
                          <span className="colorDato colorComportamiento" />

                          <div>
                            <p>
                              Predicción
                            </p>

                            <strong>
                              {esSintetico
                                ? 'Sintético'
                                : resultado.prediction}
                            </strong>
                          </div>
                        </div>

                        <div className="datoGrafica">
                          <span className="colorDato colorSemantica" />

                          <div>
                            <p>
                              Estado del canal
                            </p>

                            <strong>
                              {resultado.channel_status}
                            </strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }
            )}
          </div>
        </section>
      )}
    </main>
  )
}

export default App