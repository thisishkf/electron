const { app, BrowserWindow } = require('electron');
const path = require('path');
const config = require('./config');

const createWindow = () => {
  let win = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'lib', 'pre-load.js')
    }
  });
  win.loadURL(config.url);
}

app.on('ready', () => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
