
import { useEffect, useRef } from "react";

const AudioPlayerForCanvas = (props) => {
  const { url, muted } = props;
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current && url) {
      audioRef.current.srcObject = url;
    }
  }, [url]);
  return (
    <>
        <audio ref={audioRef} autoPlay muted={muted} controls={false} />
    </>
  );
};

export default AudioPlayerForCanvas;
