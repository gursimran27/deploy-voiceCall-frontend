import { toggleOpenpaint } from "@/slice/menuSlice";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { useDispatch } from "react-redux";
import styles from "@/component/close/index.module.css";
import { useSocket } from "@/context/socket";
import { useRouter } from "next/router";

const Close = () => {
  const socket = useSocket();
  const { roomId } = useRouter().query;

  const dispatch = useDispatch();

  const handleClose = () => {
    dispatch(toggleOpenpaint({open: false}));
    socket?.emit('handleTooglePaint',roomId, false)
  };

  return (
    <div className={styles.top} onClick={handleClose}>
      <FontAwesomeIcon icon={faXmark} size="2xl" className={styles.lower} />
    </div>
  );
};

export default Close;
