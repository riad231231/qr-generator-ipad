const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // No complex FS operations needed here for now, mostly UI logic
});
