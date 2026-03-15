const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: (title) => ipcRenderer.invoke('select-folder', title),
  startSorting: (paths) => ipcRenderer.invoke('start-sorting', paths),
  onProgress: (callback) => ipcRenderer.on('sort-progress', (event, data) => callback(data)),
  onNewPerson: (callback) => ipcRenderer.on('new-person', (event, data) => callback(data))
});
