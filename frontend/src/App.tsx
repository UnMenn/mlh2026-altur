import { useState } from 'react'
import './App.css'

function App() {
  const [audio, setAudio] = useState<File | null>(null)
  const [mostrarResultado, setMostrarResultado] = useState(false)

  // Datos temporales para probar la interfaz
  const datosPrueba = {
    esHumano: true,
    acustica: 35,
    comportamiento: 25,
    semantica: 20,
    contexto: 20
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
              Sube una llamada
              <br />
              para analizarla.
            </h1>

            <p>
              Selecciona un archivo de audio para comenzar.
            </p>
          </div>

          <div className="tarjetaAudio">

            <label className="zonaSubirAudio">

              <input
                type="file"
                accept="audio/*"
                onChange={(e) =>
                  setAudio(e.target.files?.[0] || null)
                }
              />

              <div className="iconoAudio">♪</div>

              <h3>
                {audio ? audio.name : 'Sube tu audio'}
              </h3>

              <p>
                {audio
                  ? 'Archivo listo para analizar'
                  : 'Arrastra un archivo aquí o selecciónalo desde tu computadora'}
              </p>

              <span className="botonArchivo">
                {audio ? 'Cambiar archivo' : 'Elegir archivo'}
              </span>

            </label>

            <button
              className="botonAnalizar"
              disabled={!audio}
              onClick={() => setMostrarResultado(true)}
            >
              Analizar audio →
            </button>

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
                Resultado de la llamada
              </p>

              <h1 className="tituloResultado">
                {datosPrueba.esHumano
                  ? 'ES HUMANO'
                  : 'NO ES HUMANO'}
              </h1>
            </div>

            <button
              className="botonNuevoAnalisis"
              onClick={() => {
                setMostrarResultado(false)
                setAudio(null)
              }}
            >
              Analizar otra llamada
            </button>

          </div>

          <div className="tarjetaAnalisis">

            <div className="encabezadoAnalisis">
              <span>ANÁLISIS DE DETECCIÓN</span>
              <h2>Datos de la llamada</h2>
            </div>

            <div className="seccionGrafica">

              <div
                className="graficaPastel"
                style={{
                  background: `conic-gradient(
                    #292929 0% ${datosPrueba.acustica}%,

                    #666666 ${datosPrueba.acustica}% ${
                      datosPrueba.acustica +
                      datosPrueba.comportamiento
                    }%,

                    #999999 ${
                      datosPrueba.acustica +
                      datosPrueba.comportamiento
                    }% ${
                      datosPrueba.acustica +
                      datosPrueba.comportamiento +
                      datosPrueba.semantica
                    }%,

                    #cccccc ${
                      datosPrueba.acustica +
                      datosPrueba.comportamiento +
                      datosPrueba.semantica
                    }% 100%
                  )`
                }}
              />

              <div className="datosGrafica">

                <div className="datoGrafica">
                  <span className="colorDato colorAcustica"></span>

                  <div>
                    <p>Detección acústica</p>
                    <strong>{datosPrueba.acustica}%</strong>
                  </div>
                </div>

                <div className="datoGrafica">
                  <span className="colorDato colorComportamiento"></span>

                  <div>
                    <p>Comportamiento</p>
                    <strong>{datosPrueba.comportamiento}%</strong>
                  </div>
                </div>

                <div className="datoGrafica">
                  <span className="colorDato colorSemantica"></span>

                  <div>
                    <p>Semántica</p>
                    <strong>{datosPrueba.semantica}%</strong>
                  </div>
                </div>

                <div className="datoGrafica">
                  <span className="colorDato colorContexto"></span>

                  <div>
                    <p>Contexto</p>
                    <strong>{datosPrueba.contexto}%</strong>
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