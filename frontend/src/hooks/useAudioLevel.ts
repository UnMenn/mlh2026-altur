import {
  useEffect,
  useRef,
  useState,
} from "react";

export function useAudioLevel(
  enabled = false,
) {
  const [level, setLevel] = useState(0);

  const animationFrame =
    useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLevel(0);
      return;
    }

    let stream: MediaStream | null = null;
    let audioContext: AudioContext | null =
      null;

    async function start() {
      try {
        stream =
          await navigator.mediaDevices.getUserMedia(
            {
              audio: true,
            },
          );

        audioContext =
          new AudioContext();

        const source =
          audioContext.createMediaStreamSource(
            stream,
          );

        const analyser =
          audioContext.createAnalyser();

        analyser.fftSize = 256;

        source.connect(analyser);

        const data =
          new Uint8Array(
            analyser.frequencyBinCount,
          );

        function update() {
          analyser.getByteFrequencyData(data);

          const average =
            data.reduce(
              (sum, value) => sum + value,
              0,
            ) / data.length;

          setLevel(
            Math.min(average / 100, 1),
          );

          animationFrame.current =
            requestAnimationFrame(update);
        }

        update();
      } catch (error) {
        console.error(
          "Unable to access microphone:",
          error,
        );
      }
    }

    start();

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(
          animationFrame.current,
        );
      }

      stream
        ?.getTracks()
        .forEach((track) =>
          track.stop(),
        );

      audioContext?.close();
    };
  }, [enabled]);

  return level;
}