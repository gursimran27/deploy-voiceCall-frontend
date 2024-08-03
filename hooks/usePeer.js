import { useSocket } from "@/context/socket"
import { useRouter } from "next/router"

const { useState, useEffect, useRef } = require("react")

const usePeer = (name) => {
    const socket = useSocket()
    const roomId = useRouter().query.roomId;//current roomID from URL
    const [peer, setPeer] = useState(null)
    const [myId, setMyId] = useState('')
    const isPeerSet = useRef(false)

    useEffect(() => {
        if (isPeerSet.current || !roomId || !socket) return;
        isPeerSet.current = true;//to prevent rerender
        let myPeer;
        (async function initPeer() {
            myPeer = new (await import('peerjs')).default() //to prevent SSR
            setPeer(myPeer)

            myPeer.on('open', (id) => {
                console.log(`your peer id is ${id}`)
                setMyId(id)
                socket?.emit('join-room', roomId, id,name)
            })
        })()
    }, [roomId, socket])

    return {
        peer,
        myId
    }
}

export default usePeer;