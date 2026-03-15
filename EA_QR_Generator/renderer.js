const firstNameInput = document.getElementById('firstNameInput');
const lastNameInput = document.getElementById('lastNameInput');
const dateInput = document.getElementById('dateInput');
const generateBtn = document.getElementById('generateBtn');
const qrOverlay = document.getElementById('qrOverlay');
const closeOverlayBtn = document.getElementById('closeOverlayBtn');
const historyList = document.getElementById('historyList');

const canvas = document.getElementById('qrcodeCanvas');
const displayFullName = document.getElementById('displayFullName');
const displayDate = document.getElementById('displayDate');
const qrDataHint = document.getElementById('qrDataHint');

let history = [];

// Init date
const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');
dateInput.value = `${yyyy}-${mm}-${dd}`;

generateBtn.addEventListener('click', generateQR);

function generateQR() {
    let first = firstNameInput.value.trim();
    let last = lastNameInput.value.trim();
    const dateVal = dateInput.value;

    if (!first || !last) {
        alert("Veuillez remplir le nom et le prénom.");
        return;
    }

    // Formatage
    first = first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
    last = last.toUpperCase();

    const targetDate = new Date(dateVal);
    const dd = String(targetDate.getDate()).padStart(2, '0');
    const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
    const yyyy = targetDate.getFullYear();
    const dateFile = `${dd}${mm}${yyyy}`;
    
    const displayOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const dateDisplayText = targetDate.toLocaleDateString('fr-FR', displayOptions);

    const qrData = `${first} ${last}_${dateFile}`;

    // Update Display
    displayFullName.textContent = `${first} ${last}`;
    displayDate.textContent = dateDisplayText;
    qrDataHint.textContent = qrData;

    // Generate QR
    QRCode.toCanvas(canvas, qrData, {
        width: 450,
        margin: 2,
        color: {
            dark: '#003399',
            light: '#ffffff'
        }
    }, function (error) {
        if (error) console.error(error);
        
        // Show Overlay
        qrOverlay.style.display = 'flex';
        
        // Add to history
        addToHistory(first, last, dateDisplayText, qrData);
    });
}

function addToHistory(first, last, dateStr, fullData) {
    const item = {
        name: `${first} ${last}`,
        date: dateStr,
        data: fullData,
        id: Date.now()
    };
    
    history.unshift(item);
    if (history.length > 10) history.pop();
    
    renderHistory();
}

function renderHistory() {
    if (history.length === 0) {
        historyList.innerHTML = '<p class="empty-hint">Aucun historique</p>';
        return;
    }

    historyList.innerHTML = history.map(item => `
        <div class="history-item" onclick="reloadFromHistory('${item.id}')">
            <span class="name">${item.name}</span>
            <span class="date">${item.date}</span>
        </div>
    `).join('');
}

window.reloadFromHistory = function(id) {
    const item = history.find(i => i.id == id);
    if (item) {
        const parts = item.name.split(' ');
        firstNameInput.value = parts[0];
        lastNameInput.value = parts.slice(1).join(' ');
        generateQR();
    }
};

closeOverlayBtn.addEventListener('click', () => {
    qrOverlay.style.display = 'none';
    firstNameInput.value = '';
    lastNameInput.value = '';
    firstNameInput.focus();
});

// Entrée pour générer
window.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (qrOverlay.style.display === 'flex') {
            closeOverlayBtn.click();
        } else {
            generateQR();
        }
    }
});
