import { useState, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import './App.css'

function App() {
  const [audios, setAudios] = useState<File[]>([])
  const [mostrarResultado, setMostrarResultado] = useState(false)
  const [mostrarVerificacion, setMostrarVerificacion] = useState(false)
  const [audioSeleccionado, setAudioSeleccionado] = useState<number | null>(null)
  const [analizando, setAnalizando] = useState(false)
  const [error, setError] = useState('')

  const datosPrueba = [
    {
      esHumano: true,
      acustica: 35,
      comportamiento: 25,
      semantica: 20,
      contexto: 20,
    },
    {
      esHumano: false,
      acustica: 15,
      comportamiento: 30,
      semantica: 25,
      contexto: 30,
    },
    {
      esHumano: true,
      acustica: 40,
      comportamiento: 20,
      semantica: 25,
      contexto: 15,
    },
  ]

  const seleccionarAudios = (
    e: ChangeEvent<HTMLInputElement>
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
      setError('Solo puedes subir archivos de audio.')
      setAudios([])
      return
    }

    setError('')
    setAudios(archivosSeleccionados)
  }

  const analizarAudios = () => {
    if (audios.length === 0) {
      setError(
        'Selecciona al menos un archivo de audio.'
      )
      return
    }

    setError('')
    setAnalizando(true)

    setTimeout(() => {
      setAnalizando(false)
      setMostrarVerificacion(true)
    }, 2000)
  }

  const verResultado = (index: number) => {
    setAudioSeleccionado(index)
    setMostrarVerificacion(false)
    setMostrarResultado(true)
  }

  const volverAudios = () => {
    setMostrarResultado(false)
    setMostrarVerificacion(true)
    setAudioSeleccionado(null)
  }

  const nuevoAnalisis = () => {
    setMostrarResultado(false)
    setMostrarVerificacion(false)
    setAudioSeleccionado(null)
    setAudios([])
    setError('')
    setAnalizando(false)
  }

  return (
    <main className="pagina">

      <header className="barraSuperior">
        <h2>
          Verificación de Audio
          <span className="brand-dot">.</span>
        </h2>
      </header>


      {!mostrarResultado && !mostrarVerificacion ? (

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
              Selecciona los archivos de audio
              que quieras analizar.
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
                  : 'Arrastra los archivos aquí o selecciónalos desde tu computadora'}
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

                <div className="circuloCarga"></div>

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


      ) : mostrarVerificacion ? (

        <section className="resultados">

          <span className="etiquetaResultado">
            VERIFICACIÓN DE AUDIO
          </span>


          <div className="encabezadoResultado">

            <div>

              <p className="textoResultado">
                Selecciona un audio para ver su resultado
              </p>

              <h1 className="tituloResultado">
                Verificación de audio
              </h1>

            </div>


            <button
              className="botonNuevoAnalisis"
              onClick={nuevoAnalisis}
            >
              Subir nuevos audios
            </button>

          </div>


          <div className="listaVerificacion">

            {audios.map(
              (audio, index) => (

                <button
                  className="audioVerificacion"
                  key={index}
                  onClick={() =>
                    verResultado(index)
                  }
                >

                  <div className="numeroAudio">
                    {index + 1}
                  </div>

                  <div className="infoAudio">

                    <span>
                      Audio {index + 1}
                    </span>

                    <p>
                      {audio.name}
                    </p>

                  </div>

                  <div className="flechaAudio">
                    →
                  </div>

                </button>

              )
            )}

          </div>

        </section>


      ) : (

        <section className="resultados">

          <span className="etiquetaResultado">
            RESULTADO DEL ANÁLISIS
          </span>


          <div className="encabezadoResultado">

            <div>

              <p className="textoResultado">
                Resultado del audio seleccionado
              </p>

              <h1 className="tituloResultado">
                Resultados
              </h1>

            </div>


            <button
              className="botonNuevoAnalisis"
              onClick={volverAudios}
            >
              ← Volver a los audios
            </button>

          </div>


          <div className="listaResultados">

            {audioSeleccionado !== null && (() => {

              const audio =
                audios[audioSeleccionado]

              const resultado =
                datosPrueba[
                  audioSeleccionado %
                  datosPrueba.length
                ]

              return (

                <div className="tarjetaAnalisis">

                  <div className="encabezadoAnalisis">

                    <span>
                      ANÁLISIS DE DETECCIÓN
                    </span>

                    <h2>
                      {audio.name}
                    </h2>

                  </div>


                  <h1 className="resultadoAudio">

                    {resultado.esHumano
                      ? 'ES HUMANO'
                      : 'NO ES HUMANO'}

                  </h1>


                  <div className="seccionGrafica">

                    <div
                      className="graficaPastel graficaAnimada"

                      style={{
                        background: `conic-gradient(
                          #8bd0e9
                          ${resultado.acustica}%,

                          #cb78ed
                          ${resultado.acustica}%
                          ${
                            resultado.acustica +
                            resultado.comportamiento
                          }%,

                          #ee975a
                          ${
                            resultado.acustica +
                            resultado.comportamiento
                          }%
                          ${
                            resultado.acustica +
                            resultado.comportamiento +
                            resultado.semantica
                          }%,

                          #80ee7a
                          ${
                            resultado.acustica +
                            resultado.comportamiento +
                            resultado.semantica
                          }%
                          100%
                        )`,
                      }}
                    />


                    <div className="datosGrafica">

                      <div className="datoGrafica">

                        <span className="colorDato colorAcustica"></span>

                        <div>

                          <p>
                            Detección acústica
                          </p>

                          <strong>
                            {resultado.acustica}%
                          </strong>

                        </div>

                      </div>


                      <div className="datoGrafica">

                        <span className="colorDato colorComportamiento"></span>

                        <div>

                          <p>
                            Comportamiento
                          </p>

                          <strong>
                            {resultado.comportamiento}%
                          </strong>

                        </div>

                      </div>


                      <div className="datoGrafica">

                        <span className="colorDato colorSemantica"></span>

                        <div>

                          <p>
                            Semántica
                          </p>

                          <strong>
                            {resultado.semantica}%
                          </strong>

                        </div>

                      </div>


                      <div className="datoGrafica">

                        <span className="colorDato colorContexto"></span>

                        <div>

                          <p>
                            Contexto
                          </p>

                          <strong>
                            {resultado.contexto}%
                          </strong>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              )

            })()}

          </div>

        </section>

      )}

    </main>
  )
}

export default App