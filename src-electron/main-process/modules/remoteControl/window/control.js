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

export default {
  create
};
