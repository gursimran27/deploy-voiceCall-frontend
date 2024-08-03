import { useEffect, useState } from "react";
import { cloneDeep } from "lodash";

import { useSocket } from "@/context/socket";
import usePeer from "@/hooks/usePeer";
import useMediaStream from "@/hooks/useMediaStream";
import usePlayer from "@/hooks/usePlayer";

import Player from "@/component/Player";
import Bottom from "@/component/Bottom";
import CopySection from "@/component/CopySection";

import styles from "@/styles/room.module.css";
import { useRouter } from "next/router";
import { UserSquare2 } from "lucide-react";

const Room = () => {
  const socket = useSocket();
  const router = useRouter()
  const { name, roomId } = useRouter().query;
  const { peer, myId } = usePeer(name);
  const { stream } = useMediaStream();
  const {
    players,
    setPlayers,
    playerHighlighted,
    nonHighlightedPlayers,
    toggleAudio,
    leaveRoom,
  } = usePlayer(myId, roomId, peer,stream);

  const [users, setUsers] = useState([]);

  // call the joined person and send strams also and also receive the streams from him/her
  useEffect(() => {
    if (!socket || !peer || !stream) return;
    const handleUserConnected = (newUser, remoteName) => {
      console.log(`user connected in room with userId ${newUser} and name ${remoteName}`);

      const call = peer.call(newUser, stream, { metadata: { name: name } });

      call.on("stream", (incomingStream) => {
        console.log(`incoming stream from ${newUser}`);
        setPlayers((prev) => ({
          ...prev,
          [newUser]: {
            url: incomingStream,
            muted: true,
            name: remoteName,
          },
        }));

        setUsers((prev) => ({
          ...prev,
          [newUser]: call,
        }));
      });
    };
    socket.on("user-connected", handleUserConnected);

    return () => {
      socket.off("user-connected", handleUserConnected);
    };
  }, [peer, setPlayers, socket, stream]);

  useEffect(() => {
    if (!socket) return;
    const handleToggleAudio = (userId) => {
      console.log(`user with id ${userId} toggled audio`);
      setPlayers((prev) => {
        const copy = cloneDeep(prev);
        copy[userId].muted = !copy[userId].muted;
        return { ...copy };
      });
    };

    const handleUserLeave = (userId) => {
      console.log(`user ${userId} is leaving the room`);
      users[userId]?.close(); //as users contain the call obj
      const playersCopy = cloneDeep(players);
      delete playersCopy[userId];
      // peer?.disconnect();
      // stream.getTracks().forEach(track => track.stop());
      setPlayers(playersCopy);
      // router.push('/')
    };
    socket.on("user-toggle-audio", handleToggleAudio);
    socket.on("user-leave", handleUserLeave);
    return () => {
      socket.off("user-toggle-audio", handleToggleAudio);
      socket.off("user-leave", handleUserLeave);
    };
  }, [players, setPlayers, socket, users]);

  // the receiver answer calls and send its streams also
  useEffect(() => {
    if (!peer || !stream) return;
    peer.on("call", (call) => {
      const { peer: callerId } = call;
      call.answer(stream); //send streams also
      const rName = call.metadata.name;

      call.on("stream", (incomingStream) => {
        console.log(`incoming stream from ${callerId}`);
        setPlayers((prev) => ({
          ...prev,
          [callerId]: {
            url: incomingStream,
            muted: true,
            playing: true,
            name: rName,
          },
        }));

        setUsers((prev) => ({
          ...prev,
          [callerId]: call,
        }));
      });
    });
  }, [peer, setPlayers, stream]);

  // opening streams of current user
  useEffect(() => {
    if (!stream || !myId) return;
    console.log(`setting my stream ${myId}`);
    setPlayers((prev) => ({
      ...prev,
      [myId]: {
        url: stream,
        muted: true,
        name: name,
      },
    }));
  }, [myId, setPlayers, stream]);

  return (
    <>
      <div className={styles.activePlayerContainer}>
        {Object.keys(nonHighlightedPlayers).length != 0 ? (
          Object.keys(nonHighlightedPlayers).map((playerId) => {
            const { url, muted, name } = nonHighlightedPlayers[playerId];
            return (
              <Player
                key={playerId}
                url={url}
                muted={muted}
                isActive={true}
                name={name}
              />
            );
          })
        ) : (
          <>
            <div className=" text-center mx-auto my-auto text-4xl mt-10 font-light text-blue-300 animate-pulse">
              Connecting...
            </div>
            <div className={styles.activePlayerContainer}>
            <UserSquare2 className={styles.user} size={400} />
            </div>
          </>
        )}
      </div>
      <CopySection roomId={roomId} />
      <Bottom
        muted={playerHighlighted?.muted}
        playing={playerHighlighted?.playing}
        toggleAudio={toggleAudio}
        leaveRoom={leaveRoom}
      />
    </>
  );
};

export default Room;
