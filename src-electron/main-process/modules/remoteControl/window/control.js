import { BrowserWindow } from "electron";

let win;
function create() {
  win = new BrowserWindow({
    width: 1000,
    height: 680,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadURL(process.env.APP_URL + "/#/remote-control/control");
}

function send(channel, ...args) {
  win.webContents.send(channel, ...args);
}
export default {
  create,
  send
};
