import { ipcMain } from "electron";
import robot from "robotjs";

function handleMouse(data) {
  // data {clienX, clienY, screen: {width, height}, video: {width, height},  }
  let { clientX, clientY, screen, video } = data;
  let x = (clientX * screen.width) / video.width;
  let y = (clientY * screen.height) / video.height;

  robot.moveMouse(x, y);
  robot.mouseClick();
}
function handleKey(data) {
  // data {keyCode, meta, alt, ctrl, shift}
  const modifiers = [];
  if (data.meta) modifiers.push("meta");
  if (data.shift) modifiers.push("shift");
  if (data.ctrl) modifiers.push("ctrl");
  if (data.alt) modifiers.push("alt");
  let key = vkey[data.keyCode].toLowerCase();
  //<shift>
  if (key[0] !== "<") {
    robot.keyTap(key, modifiers);
  }
  robot.keyTap(key, modifiers);
}

export default function() {
  ipcMain.on("robot", (e, type, data) => {
    console.log(type);
    // 触发鼠标 键盘操作
    if (type === "mouse") {
      handleMouse(data);
    } else if (type === "key") {
      handleKey(data);
    }
  });
}
