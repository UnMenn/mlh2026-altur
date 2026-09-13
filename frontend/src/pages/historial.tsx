import '../styles/historial.css'

type HistorialProps = {
  onVolver: () => void
}

function Historial({
  onVolver,
}: HistorialProps) {

  const historialAudios = [
    {
      time:
        '2026-09-13T03:24:34.488876+00:00',

      call_id:
        'call_76856257e3ef.wav',

      synthetic_probability:
        0.996204896635181,

      channel_status:
        'suspicious',

      segments_count: 10,
    },

    {
      time:
        '2026-09-13T02:58:27.281329+00:00',

      call_id:
        'call_76856257e3ef.wav',

      synthetic_probability:
        0.996204896635181,

      channel_status:
        'suspicious',

      segments_count: 10,
    },
  ]

  const formatearProbabilidad = (
    probabilidad: number
  ) => {

    return (
      probabilidad * 100
    ).toFixed(2)

  }

  const formatearEstado = (
    estado: string
  ) => {

    if (
      estado === 'suspicious'
    ) {
      return 'Sospechoso'
    }

    return 'Sin sospecha'
  }

  const formatearFecha = (
    fecha: string
  ) => {

    return new Date(
      fecha
    ).toLocaleString(
      'es-MX',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    )

  }

  return (

    <main className="historialPagina">

      <header className="historialHeader">

        <h2>

          Verificación de Audio

          <span className="brand-dot">
            .
          </span>

        </h2>

      </header>

      <section className="historialContenido">

        <div className="historialNavegacion">

          <button
            className="historialTab"
            onClick={onVolver}
          >
            VERIFICACIÓN DE AUDIO
          </button>

          <span
            className="
              historialTab
              historialTabActivo
            "
          >
            HISTORIAL
          </span>

        </div>

        <div className="historialIntro">

          <p>
            Consulta los resultados de
            tus análisis anteriores
          </p>

          <h1>
            Historial
          </h1>

        </div>

        {historialAudios.length > 0 ? (

          <div className="historialLista">

            {historialAudios.map(
              (audio, index) => (

                <div
                  className="historialTarjeta"
                  key={index}
                >

                  <div className="historialTarjetaSuperior">

                    <div className="historialAudioInfo">

                      <span>
                        Audio {index + 1}
                      </span>

                      <h3>
                        {audio.call_id}
                      </h3>

                    </div>

                    <span
                      className={
                        audio.channel_status ===
                        'suspicious'

                          ? 'historialEstado historialEstadoSospechoso'

                          : 'historialEstado historialEstadoSeguro'
                      }
                    >

                      {formatearEstado(
                        audio.channel_status
                      )}

                    </span>

                  </div>

                  <div className="historialDatos">

                    <div className="historialDato">

                      <p>
                        Probabilidad sintética
                      </p>

                      <strong className="historialProbabilidad">

                        {formatearProbabilidad(
                          audio.synthetic_probability
                        )}
                        %

                      </strong>

                    </div>

                    <div className="historialDato">

                      <p>
                        Estado
                      </p>

                      <strong>

                        {formatearEstado(
                          audio.channel_status
                        )}

                      </strong>

                    </div>

                    <div className="historialDato">

                      <p>
                        Segmentos analizados
                      </p>

                      <strong>
                        {audio.segments_count}
                      </strong>

                    </div>

                  </div>

                  <p className="historialFecha">

                    Analizado el{' '}

                    {formatearFecha(
                      audio.time
                    )}

                  </p>

                </div>

              )
            )}

          </div>

        ) : (

          <div className="historialVacio">

            <h3>
              Todavía no hay análisis
            </h3>

            <p>
              Cuando analices un audio
              aparecerá aquí.
            </p>

            <button
              className="historialBotonVolver"
              onClick={onVolver}
            >
              Analizar un audio
            </button>

          </div>

        )}

      </section>

    </main>

  )
}

export default Historial 