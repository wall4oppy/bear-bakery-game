import BearBakeryMusicManager from './modules/audio.js';
import { gameState } from './modules/gameState.js';
import * as ui from './modules/ui.js';
import * as gameLogic from './modules/gameLogic.js';

let soundManager;

document.addEventListener('DOMContentLoaded', function() {
    soundManager = new BearBakeryMusicManager();
    window.soundManager = soundManager; // Make it globally available if needed
    window._gameState = gameState; // 讓 HTML 也能安全存取
    gameLogic.initializeGameLogic(soundManager);

    const savedData = localStorage.getItem('bearBakeryGameState');
    if (savedData) {
        const loadedState = JSON.parse(savedData);
        if (loadedState.isLoggedIn) {
            Object.assign(gameState, loadedState);
            initializeGame();
        } else {
            window.location.href = '../pages/login.html';
        }
    } else {
        window.location.href = '../pages/login.html';
    }
});

function initializeGame() {
    ui.updatePlayerInfo();
    ui.updateInventoryDisplay();
    ui.updateReportsDisplay();
    ui.updateSettingsDisplay();
    setupEventListeners();
    showSection('game');
}

function setupEventListeners() {
    const navButtons = document.querySelectorAll('.nav-btn:not(.logout-btn)');
    navButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            if (soundManager) {
                soundManager.playSound('click');
            }
            const section = this.dataset.section;
            if (section) {
                showSection(section);
            }
        });
    });

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (soundManager) {
                soundManager.playSound('error');
            }
            logout();
        });
    }

    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    setupSettingsListeners();
    gameLogic.setupGameControls();
    setupButtonSounds();

    // START GAME 彈窗控制
    const startModal = document.getElementById('start-modal');
    const startGameBtn = document.querySelector('.start-game-btn');
    const loginBtn = document.getElementById('login-btn');
    const guestBtn = document.getElementById('guest-btn');

    if (startGameBtn && startModal) {
        startGameBtn.addEventListener('click', (e) => {
            e.preventDefault();
            startModal.classList.remove('hidden');
        });
    }
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            startModal.classList.add('hidden');
            // TODO: 執行登入流程
        });
    }
    if (guestBtn) {
        guestBtn.addEventListener('click', () => {
            startModal.classList.add('hidden');
            // TODO: 執行訪客流程
        });
    }

    // 故事分頁按鈕事件
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageIndicator = document.getElementById('page-indicator');
    const storyTitle = document.querySelector('.story-title');
    const storyContent = document.querySelector('.story-content');

    function updateStoryPage() {
        if (!window._gameState || !window._gameState.storyPages) return;
        const currentPage = window._gameState.storyPages[window._gameState.currentStoryPage];
        if (storyTitle) storyTitle.textContent = currentPage.title;
        if (storyContent) storyContent.textContent = currentPage.content;
        if (pageIndicator) pageIndicator.textContent = `${window._gameState.currentStoryPage + 1} / ${window._gameState.storyPages.length}`;
        if (prevBtn) prevBtn.disabled = window._gameState.currentStoryPage === 0;
        if (nextBtn) nextBtn.disabled = window._gameState.currentStoryPage === window._gameState.storyPages.length - 1;
    }

    if (prevBtn) prevBtn.addEventListener('click', function() {
        if (!window._gameState || !window._gameState.storyPages) return;
        if (window._gameState.currentStoryPage > 0) {
            window._gameState.currentStoryPage--;
            updateStoryPage();
        }
    });
    if (nextBtn) nextBtn.addEventListener('click', function() {
        if (!window._gameState || !window._gameState.storyPages) return;
        if (window._gameState.currentStoryPage < window._gameState.storyPages.length - 1) {
            window._gameState.currentStoryPage++;
            updateStoryPage();
        }
    });
    // 初始化顯示
    updateStoryPage();
}

function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        gameState.currentSection = sectionId;
    }

    updateNavButtons(sectionId);

    document.getElementById('hamburger').classList.remove('active');
    document.getElementById('nav-menu').classList.remove('active');

    if (gameState.isLoggedIn && sectionId !== 'login' && soundManager && gameState.settings.backgroundMusic) {
        soundManager.play();
    }
}

function updateNavButtons(activeSection) {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.section === activeSection) {
            btn.classList.add('active');
        }
    });
}

function logout() {
    if (gameState.isGuestMode) {
        window.location.href = '../pages/index.html';
        return;
    }

    if (confirm('確定要登出嗎？您的遊戲進度將會保存。')) {
        if (soundManager) {
            soundManager.stop();
        }
        gameState.isLoggedIn = false;
        gameState.isGuestMode = false;
        gameLogic.saveGameData();
        alert('已成功登出！感謝您的使用！');
        window.location.replace('../pages/index.html');
    }
}

function setupSettingsListeners() {
    const musicVolumeSlider = document.getElementById('music-volume');
    const musicValueDisplay = document.getElementById('music-value');
    if (musicVolumeSlider && musicValueDisplay) {
        musicVolumeSlider.addEventListener('input', function() {
            const value = this.value;
            musicValueDisplay.textContent = `${value}%`;
            window._gameState.settings.musicVolume = parseInt(value);
            if (soundManager) {
                soundManager.setVolume(value / 100);
            }
            gameLogic.saveGameData();
        });
    }

    const backgroundMusicToggle = document.getElementById('background-music');
    if (backgroundMusicToggle) {
        backgroundMusicToggle.addEventListener('change', function() {
            window._gameState.settings.backgroundMusic = this.checked;
            if (soundManager) {
                if (soundManager.audioContext && soundManager.audioContext.state === 'suspended') {
                    soundManager.audioContext.resume();
                }
                if (this.checked) {
                    soundManager.play();
                } else {
                    soundManager.stop();
                }
            }
            gameLogic.saveGameData();
        });
    }

    const soundEffectsToggle = document.getElementById('sound-effects');
    if (soundEffectsToggle) {
        soundEffectsToggle.addEventListener('change', function() {
            window._gameState.settings.soundEffects = this.checked;
            if (this.checked && soundManager) {
                soundManager.playSound('click');
            }
            gameLogic.saveGameData();
        });
    }

    const sfxVolumeSlider = document.getElementById('sfx-volume');
    const sfxValueDisplay = document.getElementById('sfx-value');
    if (sfxVolumeSlider && sfxValueDisplay) {
        sfxVolumeSlider.addEventListener('input', function() {
            const value = this.value;
            sfxValueDisplay.textContent = `${value}%`;
            window._gameState.settings.sfxVolume = parseInt(value);
            if (soundManager) {
                soundManager.setSfxVolume(value / 100);
            }
            gameLogic.saveGameData();
        });
    }

    const brightnessSelect = document.getElementById('brightness');
    if (brightnessSelect) {
        brightnessSelect.addEventListener('input', function() {
            window._gameState.settings.brightness = this.value;
            ui.applyBrightnessSetting(this.value);
            gameLogic.saveGameData();
        });
    }

    const languageSelect = document.getElementById('language');
    if (languageSelect) {
        languageSelect.addEventListener('change', function() {
            window._gameState.settings.language = this.value;
            gameLogic.saveGameData();
        });
    }
}

function setupButtonSounds() {
    const allButtons = document.querySelectorAll('.pixel-btn');
    allButtons.forEach(button => {
        if (!button.hasAttribute('data-sound-attached')) {
            button.addEventListener('click', function() {
                if (this.textContent.includes('進貨') || this.textContent.includes('購買')) {
                    return;
                } else if (this.textContent.includes('播放') || this.textContent.includes('測試')) {
                    if (soundManager) {
                        soundManager.playSound('bread');
                    }
                } else if (this.textContent.includes('重置') || this.textContent.includes('登出')) {
                    if (soundManager) {
                        soundManager.playSound('error');
                    }
                } else {
                    if (soundManager) {
                        soundManager.playSound('click');
                    }
                }
            });
            button.setAttribute('data-sound-attached', 'true');
        }
    });
}

document.addEventListener('keydown', function(e) {
    if (!gameState.isLoggedIn) {
        return;
    }

    if (e.key >= '1' && e.key <= '5') {
        const sections = ['profile', 'inventory', 'game', 'reports', 'settings'];
        const sectionIndex = parseInt(e.key) - 1;
        if (sections[sectionIndex]) {
            showSection(sections[sectionIndex]);
            e.preventDefault();
        }
    }

    if (e.key === 'Escape') {
        showSection('game');
        e.preventDefault();
    }

    if (gameState.currentSection === 'game') {
        if (e.key === 'ArrowLeft') {
            if (document.getElementById('story-section').classList.contains('active')) {
                gameLogic.previousStory();
            } else {
                gameLogic.previousQuestion();
            }
            e.preventDefault();
        } else if (e.key === 'ArrowRight') {
            if (document.getElementById('story-section').classList.contains('active')) {
                gameLogic.nextStory();
            } else {
                gameLogic.nextQuestion();
            }
            e.preventDefault();
        }
    }
});

let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', function(e) {
    if (!touchStartX || !touchStartY) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (gameState.currentSection === 'game') {
            if (diffX > 0) {
                if (document.getElementById('story-section').classList.contains('active')) {
                    gameLogic.nextStory();
                } else {
                    gameLogic.nextQuestion();
                }
            } else {
                if (document.getElementById('story-section').classList.contains('active')) {
                    gameLogic.previousStory();
                } else {
                    gameLogic.previousQuestion();
                }
            }
        }
    }

    touchStartX = 0;
    touchStartY = 0;
}, { passive: true });
