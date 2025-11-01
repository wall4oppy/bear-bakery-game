import BearBakeryMusicManager from './modules/audio.js';
import { refreshPlayerAvatar, setPlayerAvatarDisplay } from './modules/ui.js';

// 初始化音樂管理器並掛到 window
window.musicManager = new BearBakeryMusicManager();

let gameState = {
    isLoggedIn: false,
    isGuestMode: false,
    playerData: {
        name: '小熊哥',
        avatar: '🧑‍🍳',
        level: 1,
        coins: 1000,
        experience: 0
    },
    currentStoryPage: 0,
    storyPages: [
        {
            title: '第一章：開店準備',
            content: '小熊哥決定開一家麵包店，但他發現光會做麵包還不夠，還需要學會如何行銷...'
        },
        {
            title: '第二章：了解顧客',
            content: '小熊哥開始觀察鄰近的顧客，發現每個人的需求都不同。有些喜歡甜食，有些偏愛鹹味...'
        },
        {
            title: '第三章：制定策略',
            content: '經過市場調查後，小熊哥決定推出三種不同的麵包套餐來滿足不同顧客的需求...'
        },
        {
            title: '第四章：開業大吉',
            content: '經過精心的準備和行銷策略，小熊哥的麵包店正式開業了！顧客絡繹不絕...'
        }
    ]
};

function loadGameState() {
    try {
        const saved = localStorage.getItem('bearBakeryGameState');
        if (saved) {
            const data = JSON.parse(saved);
            gameState.playerData = {
                name: data.playerData?.name || '訪客玩家',
                avatar: data.playerData?.avatar || localStorage.getItem('avatar') || '👤',
                level: data.playerData?.level || 1,
                coins: data.playerData?.coins || 1000,
                experience: data.playerData?.experience || 0
            };
            // 同步 avatar 到 localStorage
            localStorage.setItem('avatar', gameState.playerData.avatar);
            if (data.isLoggedIn !== undefined) {
                gameState.isLoggedIn = data.isLoggedIn;
            }
            if (data.isGuestMode !== undefined) {
                gameState.isGuestMode = data.isGuestMode;
            }
            console.log('最終遊戲狀態:', gameState);
            console.log('頭像檢查:', gameState.playerData.avatar);
            if (data.isGuestMode && !gameState.playerData.avatar) {
                gameState.playerData.avatar = '👤';
                localStorage.setItem('avatar', gameState.playerData.avatar);
                console.log('設定訪客頭像:', gameState.playerData.avatar);
            }
        } else {
            // 沒有存檔時，也同步預設頭像到 localStorage
            localStorage.setItem('avatar', gameState.playerData.avatar || '👤');
            console.log('未找到localStorage資料，使用預設值');
        }
    } catch (error) {
        console.error('載入失敗:', error);
    }
}

function playClickSound() {
    if (window.musicManager) window.musicManager.playSound('click');
}

function showSection(sectionId) {
    playClickSound();
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(sectionId).classList.add('active');
    event.target.classList.add('active');
}

function updatePlayerInfo() {
    let displayName = gameState.playerData.name || '小熊哥';
    let displayAvatar = gameState.playerData.avatar || '🧑‍🍳';
    let displayLevel = gameState.playerData.level || 1;
    let displayCoins = gameState.playerData.coins || 1000;
    
    if (gameState.isGuestMode && gameState.playerData.name === '訪客玩家') {
        displayAvatar = '👤';
        gameState.playerData.avatar = '👤';
    }
    
    if(document.getElementById('playerName')) document.getElementById('playerName').textContent = displayName;
    setPlayerAvatarDisplay(displayAvatar);
    setTimeout(() => setPlayerAvatarDisplay(displayAvatar), 200);
    if(document.getElementById('playerLevel')) document.getElementById('playerLevel').textContent = displayLevel;
    if(document.getElementById('playerCoinsStatus')) document.getElementById('playerCoinsStatus').textContent = displayCoins;
    
    console.log('更新玩家資訊:', {
        name: displayName,
        avatar: displayAvatar,
        level: displayLevel,
        coins: displayCoins,
        isGuestMode: gameState.isGuestMode
    });
    console.log('切換時頭像:', gameState.playerData.avatar);
    
    saveGameState();
}

function updateStoryPage() {
    console.log('  [監視器] 正在執行 updateStoryPage...');
    const storyTitle = document.querySelector('.story-title');
    const storyContent = document.querySelector('.story-content');
    const pageIndicator = document.querySelector('.story-page-indicator');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const currentPage = gameState.storyPages[gameState.currentStoryPage];

    if (storyTitle) storyTitle.textContent = currentPage.title;
    if (storyContent) storyContent.textContent = currentPage.content;
    if (pageIndicator) pageIndicator.textContent = `${gameState.currentStoryPage + 1} / ${gameState.storyPages.length}`;

    if (prevBtn) {
        prevBtn.disabled = gameState.currentStoryPage === 0;
        prevBtn.style.opacity = prevBtn.disabled ? '0.5' : '1';
    }
    if (nextBtn) {
        nextBtn.disabled = gameState.currentStoryPage === gameState.storyPages.length - 1;
        nextBtn.style.opacity = nextBtn.disabled ? '0.5' : '1';
    }
    console.log('  [監視器] updateStoryPage 執行完畢。');
}

function prevStoryPage() {
    console.log('  [監視器] prevStoryPage 被呼叫！');
    playClickSound();
    if (gameState.currentStoryPage > 0) {
        gameState.currentStoryPage--;
        updateStoryPage();
    }
}

function nextStoryPage() {
    console.log('  [監視器] nextStoryPage 被呼叫！');
    playClickSound();
    if (gameState.currentStoryPage < gameState.storyPages.length - 1) {
        gameState.currentStoryPage++;
        updateStoryPage();
    }
}

function changeAvatar() {
    playClickSound();
    const avatars = ['🧑‍🍳', '👨‍🍳', '👩‍🍳', '👤', '🧑', '👨', '👩'];
    const current = avatars.indexOf(gameState.playerData.avatar);
    const next = (current + 1) % avatars.length;
    gameState.playerData.avatar = avatars[next];
    
    updatePlayerInfo();
    
    console.log('頭像已更換為:', gameState.playerData.avatar);
}

function goHome() {
    playClickSound();
    if (window.musicManager && window.musicManager.musicEnabled) {
        window.musicManager.play('main');
        console.log('🎵 切換回主題音樂');
    }
    
    setTimeout(() => {
        window.location.href = './index.html';
    }, 200);
}

function logout() {
    playClickSound();
    const logoutChoice = confirm('請選擇登出方式：\n\n點擊「確定」→ 登出並繼續以訪客模式遊玩\n點擊「取消」→ 完全登出並返回首頁');
    
    if (logoutChoice) {
        gameState.isLoggedIn = true;
        gameState.isGuestMode = true;
        gameState.playerData.name = '訪客玩家';
        gameState.playerData.email = 'guest@bearBakery.com';
        gameState.playerData.avatar = '👤';
        gameState.playerData.level = 1;
        gameState.playerData.coins = 1000;
        gameState.playerData.experience = 0;
        
        saveGameState();
        
        updatePlayerInfo();
        
        console.log('已登出，切換為訪客模式');
        alert('已登出帳號，現在以訪客模式繼續遊玩！');
    } else {
        const confirmFullLogout = confirm('確定要完全登出嗎？\n\n這將清除所有遊戲資料並返回首頁');
        if (confirmFullLogout) {
            localStorage.removeItem('bearBakeryGameState');
            console.log('完全登出，已清除所有資料');
            
            alert('已完全登出，即將返回首頁');
            window.location.href = './index.html';
        }
    }
}

function saveGameState() {
    localStorage.setItem('bearBakeryGameState', JSON.stringify(gameState));
    // 同步 avatar 到 localStorage
    localStorage.setItem('avatar', gameState.playerData.avatar);
    console.log('遊戲狀態已儲存:', gameState);
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('[系統] 頁面載入完成，開始綁定功能...');

    // --- 舊有功能 (例如劇情翻頁、讀取遊戲狀態等) ---
    // 你其他的初始化函式 (如 updatePlayerInfo, updateStoryPage) 應該在監聽器外部，保持不變

    // --- 全新像素風格「玩家中心」彈出視窗邏輯 ---
    const gameModal = document.getElementById('game-modal');
    if (gameModal) {
        const openProfileBtn = document.getElementById('open-profile-button');
        const closeBtn = gameModal.querySelector('#modal-close-btn');
        
        // 新增其他按鈕的獲取（成就按鈕已改為好友按鈕，不再綁定到此彈窗）
        const openLeaderboardBtn = document.getElementById('open-leaderboard-button');
        const openStockBtn = document.getElementById('open-stocking-button');
        
        const mainTabs = gameModal.querySelectorAll('.main-tab');
        const mainTabContents = gameModal.querySelectorAll('.tab-content');
        const subTabs = gameModal.querySelectorAll('.sub-tab');
        const subTabContents = gameModal.querySelectorAll('.sub-content');

        // 關閉視窗的函式
        function closeModal() {
            gameModal.classList.remove('active');
        }

        // 開啟視窗並指定頁籤的函式
        function openModalAndShowTab(tabId, subTabId) {
            gameModal.classList.add('active');
            // 模擬點擊對應的主頁籤
            const targetTab = gameModal.querySelector(`.main-tab[data-tab="${tabId}"]`);
            if (targetTab) {
                targetTab.click();
            }
            // 新增：如果有 subTabId，等主分頁切換完再切子分頁
            if (subTabId) {
                setTimeout(() => {
                    const subTab = gameModal.querySelector(`.sub-tab[data-subtab="${subTabId}"]`);
                    if (subTab) subTab.click();
                }, 0);
            }
        }
        
        // 開啟視窗 (現在只有玩家資料按鈕觸發此彈窗，其他都有獨立彈窗)
        if(openProfileBtn) openProfileBtn.addEventListener('click', () => openModalAndShowTab('profile'));
        // 好友按鈕（原成就按鈕）有自己的獨立彈窗
        // 排行榜按鈕不綁定到玩家資料彈窗，它有自己的獨立彈窗
        // 進貨按鈕不綁定到玩家資料彈窗，它有自己的獨立彈窗

        // 關閉視窗的事件綁定
        if(closeBtn) closeBtn.addEventListener('click', closeModal);
        gameModal.addEventListener('click', (e) => {
            if(e.target === gameModal) closeModal();
        });

        // 主頁籤切換邏輯
        mainTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                mainTabs.forEach(t => t.classList.remove('active'));
                mainTabContents.forEach(c => c.classList.remove('active'));
                
                tab.classList.add('active');
                const contentId = tab.dataset.tab;
                const activeContent = gameModal.querySelector(`.tab-content[data-content="${contentId}"]`);
                if(activeContent) activeContent.classList.add('active');
            });
        });

        // 副頁籤切換邏輯
        subTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                subTabs.forEach(t => t.classList.remove('active'));
                subTabContents.forEach(c => c.classList.remove('active'));

                tab.classList.add('active');
                const contentId = tab.dataset.subtab;
                const activeContent = gameModal.querySelector(`.sub-content[data-subcontent="${contentId}"]`);
                if(activeContent) activeContent.classList.add('active');
            });
        });
        console.log('✅ 全新玩家中心功能已綁定！');
    }

    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    if (prevBtn) prevBtn.onclick = prevStoryPage;
    if (nextBtn) nextBtn.onclick = nextStoryPage;
    updateStoryPage();
});

function setupMusicControls() {
    const musicVolumeSlider = document.getElementById('musicVolume');
    const musicVolumeValue = document.getElementById('musicVolume-value');
    
    musicVolumeSlider.addEventListener('input', function() {
        const volume = this.value / 100;
        musicVolumeValue.textContent = this.value + '%';
        
        if (window.musicManager) {
            window.musicManager.setVolume(volume);
            window.musicManager.saveSettings();
        }
    });
    
    const backgroundMusicCheckbox = document.getElementById('backgroundMusic');
    const musicStatus = document.getElementById('musicStatus');
    
    backgroundMusicCheckbox.addEventListener('change', function() {
        if (window.musicManager) {
            if (this.checked) {
                window.musicManager.musicEnabled = true;
                window.musicManager.play('game');
                musicStatus.textContent = '🎵 播放中';
            } else {
                window.musicManager.musicEnabled = false;
                window.musicManager.stop();
                musicStatus.textContent = '🔇 已關閉';
            }
            window.musicManager.saveSettings();
        }
    });
    
    if (window.musicManager) {
        const status = window.musicManager.getStatus();
        musicVolumeSlider.value = Math.round(status.volume * 100);
        musicVolumeValue.textContent = Math.round(status.volume * 100) + '%';
        backgroundMusicCheckbox.checked = status.musicEnabled;
        musicStatus.textContent = status.musicEnabled ? '🎵 播放中' : '🔇 已關閉';
        document.getElementById('sfxVolume').value = Math.round((status.sfxVolume ?? 0.7) * 100);
        document.getElementById('sfxVolumeValue').textContent = Math.round((status.sfxVolume ?? 0.7) * 100) + '%';
    }
}

// 讓 HTML 可以直接呼叫這些函式
window.showSection = showSection;
window.logout = logout;
window.changeAvatar = changeAvatar;

export { logout };

document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // 強制從 localStorage 取 avatar
        const savedAvatar = localStorage.getItem('avatar');
        if (savedAvatar) {
            gameState.playerData.avatar = savedAvatar;
        }
        updatePlayerInfo();
    }
});