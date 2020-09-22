import { ipcMain } from "electron";
import main from "./window/main";
import contorl from "./window/control";
import signal from "./signal";

const { send: sendMainWindow } = main;
const { create: createControlWindow, send: sendControlWindow } = contorl;
const { invoke } = signal;

export default function() {
  ipcMain.handle("login", async () => {
    let { code } = await invoke("login", null, "logined");
    return code;
  });

  ipcMain.on("control", (e, remote) => {
    // 和服务端交互
    signal.send("control", { remote });
  });
  signal.on("controlled", data => {
    createControlWindow();
    // 通知主进程
    sendMainWindow("control-state-change", data.remote, 1);
  });
  signal.on("be-controlled", data => {
    // 通知主进程
    sendMainWindow("control-state-change", data.remote, 2);
  });

  /**
   * 信令部分逻辑
   */
  // puppet、control共享的信道，就是转发
  ipcMain.on("forward", (e, event, data) => {
    signal.send("forward", { event, data });
  });
  // 收到offer，puppet响应
  signal.on("offer", data => {
    sendMainWindow("offer", data);
  });
  // 收到puppet证书，answer响应
  signal.on("answer", data => {
    sendControlWindow("answer", data);
  });
  // 收到control证书，puppet响应
  signal.on("puppet-candidate", data => {
    sendControlWindow("candidate", data);
  });
  // 收到puppet证书，control响应
  signal.on("control-candidate", data => {
    sendMainWindow("candidate", data);
  });
}
