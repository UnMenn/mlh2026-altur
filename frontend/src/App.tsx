import {
  useState,
  type ChangeEvent,
} from "react";

import { Link } from "react-router-dom";

import Historial from "./pages/historial";

import {
  analyzeAudio,
  type AudioAnalysisResponse,
} from "./services/audioAnalysis";

import "./App.css";

function App() {
  const [audios, setAudios] =
    useState<File[]>([]);

  const [resultados, setResultados] =
    useState<AudioAnalysisResponse[]>([]);

  const [
    mostrarResultado,
    setMostrarResultado,
  ] = useState(false);

  const [
    mostrarVerificacion,
    setMostrarVerificacion,
  ] = useState(false);

  const [
    mostrarHistorial,
    setMostrarHistorial,
  ] = useState(false);

  const [
    audioSeleccionado,
    setAudioSeleccionado,
  ] = useState<number | null>(null);

  const [
    analizando,
    setAnalizando,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const seleccionarAudios = (
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const archivosSeleccionados =
      Array.from(
        e.target.files || [],
      );

    const archivosInvalidos =
      archivosSeleccionados.filter(
        (archivo) =>
          !archivo.name
            .toLowerCase()
            .endsWith(".wav"),
      );

    if (
      archivosInvalidos.length > 0
    ) {
      setError(
        "Solo puedes subir archivos WAV.",
      );

      setAudios([]);
      setResultados([]);

      return;
    }

    setError("");
    setResultados([]);

    setAudios(
      archivosSeleccionados,
    );
  };

  const analizarAudios =
    async () => {
      if (
        audios.length === 0
      ) {
        setError(
          "Selecciona al menos un archivo de audio.",
        );

        return;
      }

      try {
        setError("");
        setAnalizando(true);
        setResultados([]);

        const respuestas =
          await Promise.all(
            audios.map(
              (audio) =>
                analyzeAudio(audio),
            ),
          );

        console.log(
          "Resultados Gemini:",
          respuestas,
        );

        setResultados(
          respuestas,
        );

        setMostrarVerificacion(
          true,
        );
      } catch (error) {
        console.error(
          "Error analizando audios:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "No se pudieron analizar los audios.",
        );
      } finally {
        setAnalizando(false);
      }
    };

  const verResultado = (
    index: number,
  ) => {
    setAudioSeleccionado(
      index,
    );

    setMostrarVerificacion(
      false,
    );

    setMostrarResultado(
      true,
    );
  };

  const volverAudios = () => {
    setMostrarResultado(
      false,
    );

    setMostrarVerificacion(
      true,
    );

    setAudioSeleccionado(
      null,
    );
  };

  const nuevoAnalisis = () => {
    setMostrarResultado(
      false,
    );

    setMostrarVerificacion(
      false,
    );

    setMostrarHistorial(
      false,
    );

    setAudioSeleccionado(
      null,
    );

    setAudios([]);
    setResultados([]);

    setError("");
    setAnalizando(false);
  };

  const formatPrediction = (
    prediction: string,
  ) => {
    if (
      prediction
        .toLowerCase() ===
      "synthetic"
    ) {
      return "Sintético";
    }

    if (
      prediction
        .toLowerCase() ===
      "real"
    ) {
      return "Real";
    }

    return prediction;
  };

  const formatChannelStatus = (
    status: string,
  ) => {
    if (
      status
        .toLowerCase() ===
      "suspicious"
    ) {
      return "Sospechoso";
    }

    if (
      status
        .toLowerCase() ===
      "safe"
    ) {
      return "Seguro";
    }

    return status;
  };

  if (mostrarHistorial) {
    return (
      <Historial
        onVolver={() =>
          setMostrarHistorial(
            false,
          )
        }
      />
    );
  }

  return (
    <main className="pagina">
      <header
        className="barraSuperior"
      >
        <h2>
          Verificación de Audio

          <span
            className="brand-dot"
          >
            .
          </span>
        </h2>
      </header>

      {!mostrarResultado &&
      !mostrarVerificacion ? (
        <section
          className="contenidoPrincipal"
        >
          <div
            className="textoPrincipal"
          >
            <span>
              ANÁLISIS DE LLAMADAS
            </span>

            <h1>
              Sube tus llamadas
              <br />
              para analizarlas.
            </h1>

            <p>
              Selecciona los archivos
              de audio que quieras
              analizar.
            </p>

            <Link
              to="/demo"
              className="live-demo-link"
            >
              Probar en vivo
            </Link>
          </div>

          <div
            className="tarjetaAudio"
          >
            <label
              className="zonaSubirAudio"
            >
              <input
                type="file"
                accept=".wav,audio/wav"
                multiple
                onChange={
                  seleccionarAudios
                }
              />

              <div
                className="iconoAudio"
              >
                ♪
              </div>

              <h3>
                {audios.length > 0
                  ? `${audios.length} ${
                      audios.length ===
                      1
                        ? "archivo seleccionado"
                        : "archivos seleccionados"
                    }`
                  : "Sube tus audios"}
              </h3>

              <p>
                {audios.length > 0
                  ? "Archivos listos para analizar"
                  : "Arrastra los archivos aquí o selecciónalos desde tu computadora"}
              </p>

              {audios.length >
                0 && (
                <div
                  className="listaArchivos"
                >
                  {audios.map(
                    (
                      audio,
                      index,
                    ) => (
                      <p
                        key={
                          index
                        }
                      >
                        {
                          audio.name
                        }
                      </p>
                    ),
                  )}
                </div>
              )}

              <span
                className="botonArchivo"
              >
                {audios.length > 0
                  ? "Cambiar archivos"
                  : "Elegir archivos"}
              </span>
            </label>

            {error && (
              <p
                className="mensajeError"
              >
                {error}
              </p>
            )}

            {analizando ? (
              <div
                className="estadoCarga"
              >
                <div
                  className="circuloCarga"
                />

                <p>
                  Analizando con
                  Gemini...
                </p>
              </div>
            ) : (
              <button
                className="botonAnalizar botonGemini"
                disabled={
                  audios.length ===
                  0
                }
                onClick={
                  analizarAudios
                }
              >
                Analizar con Gemini ✦
              </button>
            )}
          </div>
        </section>
      ) : mostrarVerificacion ? (
        <section
          className="resultados"
        >
          <div
            className="barraEtiquetas"
          >
            <span
              className="etiquetaResultado"
            >
              VERIFICACIÓN DE AUDIO
            </span>

            <button
              className="botonHistorial"
              onClick={() =>
                setMostrarHistorial(
                  true,
                )
              }
            >
              HISTORIAL
            </button>
          </div>

          <div
            className="encabezadoResultado"
          >
            <div>
              <p
                className="textoResultado"
              >
                Selecciona un audio
                para ver su resultado
              </p>

              <h1
                className="tituloResultado"
              >
                Verificación de audio
              </h1>
            </div>

            <button
              className="botonNuevoAnalisis"
              onClick={
                nuevoAnalisis
              }
            >
              Subir nuevos audios
            </button>
          </div>

          <div
            className="listaVerificacion"
          >
            {audios.map(
              (
                audio,
                index,
              ) => {
                const resultado =
                  resultados[
                    index
                  ];

                return (
                  <button
                    className="audioVerificacion"
                    key={index}
                    onClick={() =>
                      verResultado(
                        index,
                      )
                    }
                  >
                    <div
                      className="numeroAudio"
                    >
                      {index +
                        1}
                    </div>

                    <div
                      className="infoAudio"
                    >
                      <span>
                        Audio{" "}
                        {index +
                          1}
                      </span>

                      <p>
                        {
                          audio.name
                        }
                      </p>

                      {resultado && (
                        <small>
                          {formatChannelStatus(
                            resultado.channel_status,
                          )}
                        </small>
                      )}
                    </div>

                    <div
                      className="flechaAudio"
                    >
                      →
                    </div>
                  </button>
                );
              },
            )}
          </div>
        </section>
      ) : (
        <section
          className="resultados"
        >
          <div
            className="barraEtiquetas"
          >
            <span
              className="etiquetaResultado"
            >
              RESULTADO DEL ANÁLISIS
            </span>

            <button
              className="botonHistorial"
              onClick={() =>
                setMostrarHistorial(
                  true,
                )
              }
            >
              HISTORIAL
            </button>
          </div>

          <div
            className="encabezadoResultado"
          >
            <div>
              <p
                className="textoResultado"
              >
                Resultado del audio
                seleccionado
              </p>

              <h1
                className="tituloResultado"
              >
                Resultados
              </h1>
            </div>

            <button
              className="botonNuevoAnalisis"
              onClick={
                volverAudios
              }
            >
              ← Volver a los audios
            </button>
          </div>

          <div
            className="listaResultados"
          >
            {audioSeleccionado !==
              null &&
              (() => {
                const resultado =
                  resultados[
                    audioSeleccionado
                  ];

                if (!resultado) {
                  return (
                    <div
                      className="tarjetaAnalisis"
                    >
                      <p>
                        No hay resultado
                        disponible para
                        este audio.
                      </p>
                    </div>
                  );
                }

                const porcentajeSintetico =
                  Math.max(
                    0,
                    Math.min(
                      100,
                      resultado
                        .synthetic_probability *
                        100,
                    ),
                  );

                const esSintetico =
                  resultado
                    .prediction
                    .toLowerCase() ===
                  "synthetic";

                const esReal =
                  resultado
                    .prediction
                    .toLowerCase() ===
                  "real";

                return (
                  <div
                    className="tarjetaAnalisis"
                  >
                    <div
                      className="encabezadoAnalisis"
                    >
                      <span>
                        ANÁLISIS DE
                        DETECCIÓN
                      </span>

                      <h2>
                        {
                          resultado.filename
                        }
                      </h2>
                    </div>

                    <h1
                      className="resultadoAudio"
                    >
                      {esSintetico
                        ? "AUDIO SINTÉTICO"
                        : esReal
                          ? "AUDIO REAL"
                          : resultado.prediction.toUpperCase()}
                    </h1>

                    <div
                      className="seccionGrafica"
                    >
                      <div
                        className="graficaPastel graficaAnimada"
                        style={{
                          background: `conic-gradient(
                            #8bd0e9 0%
                            ${porcentajeSintetico}%,
                            #eeeeee
                            ${porcentajeSintetico}%
                            100%
                          )`,
                        }}
                      />

                      <div
                        className="datosGrafica"
                      >
                        <div
                          className="datoGrafica"
                        >
                          <span
                            className="colorDato colorAcustica"
                          />

                          <div>
                            <p>
                              Archivo
                            </p>

                            <strong>
                              {
                                resultado.filename
                              }
                            </strong>
                          </div>
                        </div>

                        <div
                          className="datoGrafica"
                        >
                          <span
                            className="colorDato colorComportamiento"
                          />

                          <div>
                            <p>
                              Predicción
                            </p>

                            <strong>
                              {formatPrediction(
                                resultado.prediction,
                              )}
                            </strong>
                          </div>
                        </div>

                        <div
                          className="datoGrafica"
                        >
                          <span
                            className="colorDato colorSemantica"
                          />

                          <div>
                            <p>
                              Probabilidad
                              sintética
                            </p>

                            <strong>
                              {porcentajeSintetico.toFixed(
                                2,
                              )}
                              %
                            </strong>
                          </div>
                        </div>

                        <div
                          className="datoGrafica"
                        >
                          <span
                            className="colorDato colorContexto"
                          />

                          <div>
                            <p>
                              Estado del canal
                            </p>

                            <strong>
                              {formatChannelStatus(
                                resultado.channel_status,
                              )}
                            </strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
          </div>
        </section>
      )}
    </main>
  );
}

export default App;