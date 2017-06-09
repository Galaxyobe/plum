// In the main process.
const BrowserWindow = require('electron').BrowserWindow;


var win = new BrowserWindow({ width: 800, height: 600, show: false });
win.on('closed', function() {
  win = null;
});

win.loadURL('https://github.com');
win.show();