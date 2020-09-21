import { ipcMain } from "electron";
import main from "./window/main";
import contorl from "./window/control";

const { send: sendMainWindow } = main;
const { create: createControlWindow } = contorl;

export default function() {
  ipcMain.handle("login", async () => {
    let code = Math.floor(Math.random() * (999999 - 100000)) + 100000;
    return code;
  });

  ipcMain.on("control", (e, remoteCode) => {
    // 和服务端交互

    // 通知主进程
    sendMainWindow("control-state-change", remoteCode, 1);
    createControlWindow();
  });
}
