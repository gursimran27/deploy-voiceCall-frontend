
import { Mic, MicOff } from "lucide-react";

import styles from "@/component/Player/index.module.css";
import { useEffect, useRef } from "react";

const Player = (props) => {
  const { url, muted, isActive, name } = props;
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current && url) {
      audioRef.current.srcObject = url;
    }
  }, [url]);
  return (
    <>
      <div className={styles.playerContainer}>
        
        <img
          src={`https://api.dicebear.com/5.x/initials/svg?seed=${name}`}
          className={styles.img}
          width={400}
          height={400}

        />
        <span className={styles.name}>{name}</span>

        <audio ref={audioRef} autoPlay muted={muted} controls={false} />

        <div className={styles.icon}>
          {isActive ? (
            muted ? (
              <MicOff className={"text-white"} size={25}/>
            ) : (
              <Mic className={"text-white"} size={25} />
            )
          ) : undefined}
        </div>
      </div>
    </>
  );
};

export default Player;
