import handleIPC from "./ipc";
// import main from "./window/main.js";
// let { create: createMainWindow } = main;
import robot from "./robot";

import control from "./window/control.js";
let { create: createMainWindow } = control;

export default function() {
  createMainWindow();
  handleIPC();
  robot();
}
