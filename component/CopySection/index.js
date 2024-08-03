import { CopyToClipboard } from "react-copy-to-clipboard";
import { Copy, CopyCheck } from "lucide-react";

import styles from "@/component/CopySection/index.module.css";
import { useState } from "react";

const CopySection = (props) => {
  const { roomId } = props;
  const [copy, setCopy] = useState(false);

  const handleCopy = () => {
    setCopy(true);
    setTimeout(() => {
      setCopy(false);
    }, 5000);
  };

  return (
    <div className={styles.copyContainer}>
      <div className={styles.copyHeading}>Copy Room ID:</div>
      <hr />
      <div className={styles.copyDescription}>
        <span>{roomId}</span>
        <CopyToClipboard text={roomId}>
          {!copy ? (
            <Copy color="#da4310" onClick={handleCopy} className="ml-3cursor-pointer" />
          ) : (
            <CopyCheck color="#1dd353" className="ml-3 cursor-pointer"/>
          )}
        </CopyToClipboard>
      </div>
    </div>
  );
};

export default CopySection;
