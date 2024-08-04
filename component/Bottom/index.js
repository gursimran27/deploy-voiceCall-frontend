import cx from "classnames";
import { Mic, PhoneOff, MicOff } from "lucide-react";

import styles from "@/component/Bottom/index.module.css";

const Bottom = (props) => {
  const { muted, toggleAudio, leaveRoom, clickable, players } = props;

  const handleAudio = ()=>{
    if(Object.keys(players).length ==1 || clickable){
      // console.log(Object.keys(players).length)
      toggleAudio();
    }else{
      alert("connection in progress pls wait");
    }
  }

  return (
    <div className={styles.bottomMenu}>
      {muted ? (
        <MicOff
          className={cx(styles.icon, styles.active)}
          size={55}
          onClick={handleAudio}
        />
      ) : (
        <Mic className={styles.icon} size={55} onClick={handleAudio} />
      )}
      <PhoneOff size={55} className={cx(styles.icon)} onClick={leaveRoom}/>
    </div>
  );
};

export default Bottom;
