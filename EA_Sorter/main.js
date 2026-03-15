const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const { createCanvas, loadImage } = require('canvas');
const jsQR = require('jsqr');
const glob = require('glob');

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    titleBarStyle: 'hiddenInset',
    vibrancy: 'under-window', // Effet de flou macOS
    visualEffectState: 'active',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadFile('index.html');
  // win.webContents.openDevTools(); // Utile pour le debug
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// --- IPC Handlers ---

ipcMain.handle('select-folder', async (event, title) => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    title: title
  });
  return result.filePaths[0];
});

ipcMain.handle('start-sorting', async (event, { inputDir, outputDir }) => {
  try {
    const extensions = ['jpg', 'jpeg', 'JPG', 'JPEG'];
    let photoPaths = [];
    
    for (const ext of extensions) {
      const files = glob.sync(path.join(inputDir, `*.${ext}`));
      photoPaths = photoPaths.concat(files);
    }
    
    photoPaths.sort();
    
    if (photoPaths.length === 0) return { success: false, message: 'Aucune photo trouvée.' };

    let currentPerson = "INCONNU_SANS_QR";
    let counter = 1;
    let renamedCount = 0;

    event.sender.send('sort-progress', { total: photoPaths.length, current: 0, status: 'Démarrage...' });

    for (let i = 0; i < photoPaths.length; i++) {
      const filePath = photoPaths[i];
      const fileName = path.basename(filePath);
      
      event.sender.send('sort-progress', { 
        total: photoPaths.length, 
        current: i + 1, 
        status: `Analyse de ${fileName}...` 
      });

      // Détection QR Code
      const qrData = await detectQRCode(filePath);
      
      if (qrData) {
        currentPerson = qrData;
        counter = 1;
        event.sender.send('new-person', { name: currentPerson });
        continue;
      } else {
        const newFileName = `${currentPerson}-${counter}.jpg`;
        const destPath = path.join(outputDir, newFileName);
        
        await fs.copy(filePath, destPath);
        renamedCount++;
        counter++;
      }
    }

    return { success: true, count: renamedCount };
  } catch (error) {
    console.error(error);
    return { success: false, message: error.message };
  }
});

async function detectQRCode(imagePath) {
  try {
    const image = await loadImage(imagePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    
    return code ? code.data.trim() : null;
  } catch (err) {
    return null;
  }
}
