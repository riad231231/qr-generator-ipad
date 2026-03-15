let sourcePath = null;
let destPath = null;

const sourceBtn = document.getElementById('sourceBtn');
const destBtn = document.getElementById('destBtn');
const startBtn = document.getElementById('startBtn');
const statusZone = document.getElementById('statusZone');
const progressBarFill = document.getElementById('progressBarFill');
const progressText = document.getElementById('progressText');
const detectedName = document.getElementById('detectedName');

sourceBtn.addEventListener('click', async () => {
    const path = await window.electronAPI.selectFolder('Sélectionner le dossier des photos source');
    if (path) {
        sourcePath = path;
        document.getElementById('sourcePath').textContent = path;
        checkReady();
    }
});

destBtn.addEventListener('click', async () => {
    const path = await window.electronAPI.selectFolder('Sélectionner le dossier de destination');
    if (path) {
        destPath = path;
        document.getElementById('destPath').textContent = path;
        checkReady();
    }
});

function checkReady() {
    if (sourcePath && destPath) {
        startBtn.disabled = false;
    }
}

startBtn.addEventListener('click', async () => {
    startBtn.disabled = true;
    statusZone.style.display = 'block';
    
    const result = await window.electronAPI.startSorting({ 
        inputDir: sourcePath, 
        outputDir: destPath 
    });

    if (result.success) {
        progressText.textContent = `Terminé ! ${result.count} portraits triés.`;
        progressBarFill.style.width = '100%';
        startBtn.disabled = false;
    } else {
        alert('Erreur : ' + result.message);
        startBtn.disabled = false;
    }
});

window.electronAPI.onProgress((data) => {
    const percent = Math.round((data.current / data.total) * 100);
    progressBarFill.style.width = `${percent}%`;
    progressText.textContent = data.status;
});

window.electronAPI.onNewPerson((data) => {
    detectedName.textContent = data.name;
    // Petit effet flash pour signaler la nouvelle détection
    document.getElementById('detectionAlert').style.backgroundColor = 'rgba(255,255,255,0.3)';
    setTimeout(() => {
        document.getElementById('detectionAlert').style.backgroundColor = 'rgba(0,0,0,0.2)';
    }, 500);
});
