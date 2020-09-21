import { BrowserWindow } from "electron";

let win;
function create() {
  win = new BrowserWindow({
    width: 600,
    height: 300,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadURL(process.env.APP_URL + "/#/remote-control/main");
}

function send(channel, ...args) {
  win.webContents.send(channel, ...args);
}

export default {
  create,
  send
};
