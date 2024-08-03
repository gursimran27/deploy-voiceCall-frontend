import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";

import styles from "@/styles/home.module.css";
import { useState } from "react";
import { Star } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const [name, setName] = useState("");

  const createAndJoin = () => {
    if (name) {
      const roomId = uuidv4();
      router.push(`/${name}/${roomId}`);
    } else {
      alert("Please provide Name");
    }
  };

  const joinRoom = () => {
    if (roomId && name) router.push(`/${name}/${roomId}`);
    else {
      alert("Please provide a valid room id or name");
    }
  };
  return (
    <>
      <div className="circle1"></div>
      <div className="circle2"></div>
      <div className=" flex justify-center items-center w-[100vw] h-[100vh] absolute">
        <div className={styles.homeContainer}>
          <h1>Voice Call App</h1>
          <div className={styles.enterRoom}>
            <div className=" relative w-full text-center">
              <input
              required
                className="text-black text-lg p-1 rounded w-9/12 mb-3"
                placeholder="Enter Your Name"
                value={name}
                onChange={(e) => setName(e?.target?.value)}
              />
              <Star color="black" size={16} className=" absolute -top-1 right-12 fill-red-500"/>
            </div>
            <span className=""> Enter RoomID</span>
            <input
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e?.target?.value)}
            />
            <button onClick={joinRoom}>Join Room</button>
          </div>
          <span className={styles.separatorText}>
            --------------- OR ---------------
          </span>

          <button onClick={createAndJoin}>Create a new room</button>
        </div>
      </div>
    </>
  );
}
