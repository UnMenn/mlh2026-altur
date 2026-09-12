import { useState } from 'react'
import './App.css'

function App() {
  const [audios, setAudios] = useState<File[]>([])
  const [mostrarResultado, setMostrarResultado] = useState(false)
  const [analizando, setAnalizando] = useState(false)
  const [error, setError] = useState('')

  // Datos temporales para probar la interfaz
  const datosPrueba = [
    {
      esHumano: true,
      acustica: 35,
      comportamiento: 25,
      semantica: 20,
      contexto: 20
    },
    {
      esHumano: false,
      acustica: 15,
      comportamiento: 30,
      semantica: 25,
      contexto: 30
    },
    {
      esHumano: true,
      acustica: 40,
      comportamiento: 20,
      semantica: 25,
      contexto: 15
    }
  ]

  const seleccionarAudios = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivosSeleccionados = Array.from(e.target.files || [])

    if (archivosSeleccionados.length > 3) {
      setError('Puedes analizar un máximo de 3 audios a la vez.')
      setAudios([])
      return
    }

    const archivosInvalidos = archivosSeleccionados.filter(
      (archivo) => !archivo.type.startsWith('audio/')
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
      setError('Selecciona al menos un archivo de audio.')
      return
    }

    setError('')
    setAnalizando(true)

    setTimeout(() => {
      setAnalizando(false)
      setMostrarResultado(true)
    }, 2000)
  }

  const nuevoAnalisis = () => {
    setMostrarResultado(false)
    setAudios([])
    setError('')
  }

  return (
    <main className="pagina">

      <header className="barraSuperior">
        <h2>Verificación de Audio</h2>
      </header>

      {!mostrarResultado ? (

        <section className="contenidoPrincipal">

          <div className="textoPrincipal">

            <span>ANÁLISIS DE LLAMADAS</span>

            <h1>
              Sube tus llamadas
              <br />
              para analizarlas.
            </h1>

            <p>
              Selecciona hasta 3 archivos de audio para comenzar.
            </p>

          </div>

          <div className="tarjetaAudio">

            <label className="zonaSubirAudio">

              <input
                type="file"
                accept="audio/*"
                multiple
                onChange={seleccionarAudios}
              />

              <div className="iconoAudio">♪</div>

              <h3>
                {audios.length > 0
                  ? `${audios.length} archivos seleccionados`
                  : 'Sube tus audios'}
              </h3>

              <p>
                {audios.length > 0
                  ? 'Archivos listos para analizar'
                  : 'Arrastra hasta 3 archivos aquí o selecciónalos desde tu computadora'}
              </p>

              {audios.length > 0 && (
                <div className="listaArchivos">

                  {audios.map((audio, index) => (
                    <p key={index}>
                      {audio.name}
                    </p>
                  ))}

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
                  Analizando audios...
                </p>

              </div>
            )}

            <button
              className="botonAnalizar"
              disabled={audios.length === 0 || analizando}
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
                Se analizaron {audios.length} audio
                {audios.length > 1 ? 's' : ''}
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

            {audios.map((audio, index) => {
              const resultado = datosPrueba[index]

              return (

                <div className="tarjetaAnalisis" key={index}>

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
                      className="graficaPastel"
                      style={{
                        background: `conic-gradient(
                          #292929 0% ${resultado.acustica}%,

                          #666666 ${resultado.acustica}% ${
                            resultado.acustica +
                            resultado.comportamiento
                          }%,

                          #999999 ${
                            resultado.acustica +
                            resultado.comportamiento
                          }% ${
                            resultado.acustica +
                            resultado.comportamiento +
                            resultado.semantica
                          }%,

                          #cccccc ${
                            resultado.acustica +
                            resultado.comportamiento +
                            resultado.semantica
                          }% 100%
                        )`
                      }}
                    />

                    <div className="datosGrafica">

                      <div className="datoGrafica">

                        <span className="colorDato colorAcustica"></span>

                        <div>
                          <p>Detección acústica</p>
                          <strong>
                            {resultado.acustica}%
                          </strong>
                        </div>

                      </div>

                      <div className="datoGrafica">

                        <span className="colorDato colorComportamiento"></span>

                        <div>
                          <p>Comportamiento</p>
                          <strong>
                            {resultado.comportamiento}%
                          </strong>
                        </div>

                      </div>

                      <div className="datoGrafica">

                        <span className="colorDato colorSemantica"></span>

                        <div>
                          <p>Semántica</p>
                          <strong>
                            {resultado.semantica}%
                          </strong>
                        </div>

                      </div>

                      <div className="datoGrafica">

                        <span className="colorDato colorContexto"></span>

                        <div>
                          <p>Contexto</p>
                          <strong>
                            {resultado.contexto}%
                          </strong>
                        </div>

                      </div>

                    </div>

                  </div>

                </div>
              )
            })}

          </div>

        </section>

      )}

    </main>
  )
}

export default App