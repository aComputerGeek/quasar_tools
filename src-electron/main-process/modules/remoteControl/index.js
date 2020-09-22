import handleIPC from "./ipc";
import main from "./window/main.js";
import robot from "./robot";

let { create: createMainWindow } = main;

export default function() {
  createMainWindow();
  handleIPC();
  robot();
}
