import { useEffect, useLayoutEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";

import { MENU_ITEMS } from "@/constants";
import { actionItemClick, menuItemClick } from "@/slice/menuSlice";

import { useSocket } from "@/context/socket"
import { useRouter } from "next/router";
import { changeBrushSize, changeColor } from "@/slice/toolboxSlice";

const Board = () => {
  const socket = useSocket()
  const dispatch = useDispatch();
  const canvasRef = useRef(null);
  const drawHistory = useRef([]);
  const historyPointer = useRef(0);
  const shouldDraw = useRef(false);
  const { activeMenuItem, actionMenuItem } = useSelector((state) => state.menu);
  const { color, size } = useSelector((state) => state.toolbox[activeMenuItem]);
  const { roomId } = useRouter().query;
  // console.log('board',roomId)
  const roomIdref = useRef(roomId);

  // useEffect(() => {
  //   if (!socket) {
  //     connectSocket();
  //     console.log("socket-connected", socket);
  //   }
  // }, [socket]);

  useEffect(() => {
    roomIdref.current = roomId;
  }, [roomId]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (actionMenuItem === MENU_ITEMS.DOWNLOAD) {
      const URL = canvas.toDataURL();
      const anchor = document.createElement("a");
      anchor.href = URL;
      anchor.download = "sketch.jpg";
      anchor.click();
    } else if (
      actionMenuItem === MENU_ITEMS.UNDO ||
      actionMenuItem === MENU_ITEMS.REDO
    ) {
      if (historyPointer.current > 0 && actionMenuItem === MENU_ITEMS.UNDO)
        historyPointer.current -= 1;
      if (
        historyPointer.current < drawHistory.current.length - 1 &&
        actionMenuItem === MENU_ITEMS.REDO
      )
        historyPointer.current += 1;
      if (historyPointer.current < 0) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        historyPointer.current = 0;
        return;
      } else if (historyPointer.current >= drawHistory.current.length) {
        historyPointer.current = drawHistory.current.length - 1;
        return;
      }
      const imageData = drawHistory.current[historyPointer.current];
      context.putImageData(imageData, 0, 0);
    } else if (actionMenuItem === MENU_ITEMS.CLEAR) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      historyPointer.current = 0;
      drawHistory.current = [];
    }
    dispatch(actionItemClick(null));
  }, [actionMenuItem, dispatch]);

  // for changing color and brush size
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const changeConfig = (color, size) => {
      context.strokeStyle = color;
      context.lineWidth = size;
    };

    const handleChangeConfig = (config) => {
      // console.log("config", config);
      changeConfig(config.color, config.size);
      dispatch(changeColor({ item: activeMenuItem, color: config.color }));
      dispatch(changeBrushSize({ item: activeMenuItem, size: config.size }));
    };
    changeConfig(color, size);
    socket.on("changeConfig", handleChangeConfig);

    return () => {
      socket.off("changeConfig", handleChangeConfig);
    };
  }, [color, size, roomId]);

  useEffect(() => {
    // if (!canvasRef.current) return;
    // const canvas = canvasRef.current;
    // const context = canvas.getContext("2d");

    const handleUpdateMenuItem = (itemName) => {
      // console.log('itename',itemName)
      dispatch(menuItemClick(itemName));
    };
    const handleUpdateMenuAction = (itemName) => {
      // console.log('itename',itemName)
      dispatch(actionItemClick(itemName));
    };
    socket.on("updateMenuItem", handleUpdateMenuItem);
    socket.on("updateMenuAction", handleUpdateMenuAction);

    return () => {
      socket.off("updateMenuItem", handleUpdateMenuItem);
      socket.off("updateMenuAction", handleUpdateMenuAction);
    };
  }, [socket]);

  // executes before useEffect
  useLayoutEffect(() => {
    if (!canvasRef.current && roomId) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const beginPath = (x, y) => {
      context.beginPath();
      context.moveTo(x, y); //new line start
    };

    const drawLine = (x, y) => {
      context.lineTo(x, y);
      context.stroke();
    };
    const handleMouseDown = (e) => {
      //left mouse btn clicked
      shouldDraw.current = true;
      beginPath(
        e.clientX || e.touches[0].clientX,
        e.clientY || e.touches[0].clientY
      );
      socket.emit("beginPath", {
        x: e.clientX || e.touches[0].clientX,
        y: e.clientY || e.touches[0].clientY,
        roomId: roomIdref.current,
      });
    };

    const handleMouseMove = (e) => {
      if (!shouldDraw.current) return;
      drawLine(
        e.clientX || e.touches[0].clientX,
        e.clientY || e.touches[0].clientY
      );
      socket.emit("drawLine", {
        x: e.clientX || e.touches[0].clientX,
        y: e.clientY || e.touches[0].clientY,
        roomId: roomIdref.current,
      });
    };

    const handleMouseUp = (e) => {
      shouldDraw.current = false;
      // save snapshots of canvas to history for undo/redo
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      drawHistory.current.push(imageData);
      historyPointer.current = drawHistory.current.length - 1;
      socket.emit("mouseUp", roomId);
    };

    const handleBeginPath = (path) => {
      beginPath(path.x, path.y);
    };

    const handleDrawLine = (path) => {
      drawLine(path.x, path.y);
    };
    
    const handleCaptureCanvasOnMouseUp = () => {
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      drawHistory.current.push(imageData);
      historyPointer.current = drawHistory.current.length - 1;
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);

    canvas.addEventListener("touchstart", handleMouseDown);
    canvas.addEventListener("touchmove", handleMouseMove);
    canvas.addEventListener("touchend", handleMouseUp);

    socket.on("beginPath", handleBeginPath);
    socket.on("drawLine", handleDrawLine);
    socket.on("captureCanvasOnMouseUp", handleCaptureCanvasOnMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);

      canvas.removeEventListener("touchstart", handleMouseDown);
      canvas.removeEventListener("touchmove", handleMouseMove);
      canvas.removeEventListener("touchend", handleMouseUp);

      socket.off("beginPath", handleBeginPath);
      socket.off("drawLine", handleDrawLine);
      socket.off("captureCanvasOnMouseUp", handleCaptureCanvasOnMouseUp);
    };
  }, [roomId]);

  return <canvas ref={canvasRef} className={`${activeMenuItem == MENU_ITEMS.PENCIL ? "canvasWithPenCursor" : "canvasWithEraserCursor"}`}></canvas>;
};

export default Board;
