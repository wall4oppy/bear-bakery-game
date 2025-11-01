import { gameState } from './gameState.js';

// 根據 avatarValue 顯示圖片或 emoji
export function setPlayerAvatarDisplay(avatarValue, retry = 0) {
    const playerAvatarElement = document.getElementById('playerAvatar');
    if (!playerAvatarElement) {
        // DOM 尚未渲染完成，最多重試 5 次，每次延遲 100ms
        if (retry < 5) {
            setTimeout(() => setPlayerAvatarDisplay(avatarValue, retry + 1), 100);
        }
        return;
    }
    // 判斷是圖片還是 emoji
    if (avatarValue && (avatarValue.endsWith('.png') || avatarValue.endsWith('.jpg') || avatarValue.endsWith('.gif'))) {
        playerAvatarElement.innerHTML = `<img src="${avatarValue}" alt="玩家頭像" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;" />`;
    } else {
        playerAvatarElement.textContent = avatarValue || '';
    }
}

// === 玩家資料功能 ===
export function updatePlayerInfo() {
    const playerNameElement = document.getElementById('playerName');
    const playerLevelElement = document.getElementById('playerLevel');
    const playerCoinsElement = document.getElementById('playerCoins');
    
    if (playerNameElement) playerNameElement.textContent = gameState.playerData.name;
    setPlayerAvatarDisplay(gameState.playerData.avatar);
    if (playerLevelElement) playerLevelElement.textContent = gameState.playerData.level;
    if (playerCoinsElement) playerCoinsElement.textContent = gameState.playerData.coins;

    // 同步 localStorage
    if (gameState.playerData.avatar) {
        localStorage.setItem('avatar', gameState.playerData.avatar);
    }
}

// 單獨刷新頭像顯示
export function refreshPlayerAvatar() {
    setPlayerAvatarDisplay(gameState.playerData.avatar);
}

// === 進貨系統功能 ===
export function updateInventoryDisplay() {
    Object.keys(gameState.inventory).forEach(breadType => {
        const stockElement = document.getElementById(`${breadType}-stock`);
        if (stockElement) {
            stockElement.textContent = gameState.inventory[breadType];
        }
    });
}

// === 報表功能 ===
export function updateReportsDisplay() {
    const incomeElement = document.getElementById('total-income');
    const expenseElement = document.getElementById('total-expense');
    const profitElement = document.getElementById('net-profit');
    
    if (incomeElement) incomeElement.textContent = `$${gameState.reports.totalIncome}`;
    if (expenseElement) expenseElement.textContent = `$${gameState.reports.totalExpense}`;
    if (profitElement) profitElement.textContent = `$${gameState.reports.netProfit}`;
    
    // 更新進度條
    const maxValue = Math.max(gameState.reports.totalIncome, gameState.reports.totalExpense, gameState.reports.netProfit);
    
    // 更新統計圖表的寬度
    updateStatBar('total-income', gameState.reports.totalIncome, maxValue);
    updateStatBar('total-expense', gameState.reports.totalExpense, maxValue);
    updateStatBar('net-profit', gameState.reports.netProfit, maxValue);
}

function updateStatBar(elementId, value, maxValue) {
    const percentage = Math.max(10, (value / maxValue) * 100);
    const parentElement = document.getElementById(elementId);
    if (parentElement) {
        const statFill = parentElement.parentElement.querySelector('.stat-fill');
        if (statFill) {
            statFill.style.width = `${percentage}%`;
        }
    }
}

// === 設定功能 ===
export function updateSettingsDisplay() {
    const musicVolumeSlider = document.getElementById('music-volume');
    const musicValueDisplay = document.getElementById('music-value');
    const backgroundMusicToggle = document.getElementById('background-music');
    const soundEffectsToggle = document.getElementById('sound-effects');
    const brightnessSelect = document.getElementById('brightness');
    const languageSelect = document.getElementById('language');
    
    if (musicVolumeSlider) musicVolumeSlider.value = gameState.settings.musicVolume;
    if (musicValueDisplay) musicValueDisplay.textContent = `${gameState.settings.musicVolume}%`;
    if (backgroundMusicToggle) backgroundMusicToggle.checked = gameState.settings.backgroundMusic;
    if (soundEffectsToggle) soundEffectsToggle.checked = gameState.settings.soundEffects;
    if (brightnessSelect) brightnessSelect.value = gameState.settings.brightness;
    if (languageSelect) languageSelect.value = gameState.settings.language;
    
    applyBrightnessSetting(gameState.settings.brightness);
}

export function applyBrightnessSetting(brightness) {
    const body = document.body;
    body.classList.remove('brightness-dark', 'brightness-normal', 'brightness-bright');
    
    switch(brightness) {
        case 'dark':
            body.classList.add('brightness-dark');
            break;
        case 'bright':
            body.classList.add('brightness-bright');
            break;
        default:
            body.classList.add('brightness-normal');
    }
}

// === 工具函數 ===
export function showNotification(message, type = 'info') {
    // 創建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(135deg, #27ae60, #229954);
        color: white;
        padding: 15px 20px;
        border: 3px solid #1e8449;
        box-shadow: 3px 3px 0 #16a085;
        font-family: 'Press Start 2P', monospace;
        font-size: 10px;
        z-index: 10000;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    if (type === 'error') {
        notification.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
        notification.style.borderColor = '#a93226';
        notification.style.boxShadow = '3px 3px 0 #922b21';
    } else if (type === 'warning') {
        notification.style.background = 'linear-gradient(135deg, #f39c12, #e67e22)';
        notification.style.borderColor = '#d68910';
        notification.style.boxShadow = '3px 3px 0 #b7700a';
    } else if (type === 'success') {
        notification.style.background = 'linear-gradient(135deg, #27ae60, #229954)';
        notification.style.borderColor = '#1e8449';
        notification.style.boxShadow = '3px 3px 0 #16a085';
    }
    
    document.body.appendChild(notification);
    
    // 自動移除通知
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}
