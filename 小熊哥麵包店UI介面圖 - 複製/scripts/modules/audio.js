/**
 * 小熊哥麵包店 - 音樂管理系統
 * 支援跨頁面背景音樂播放
 */

export default class BearBakeryMusicManager {
    constructor() {
        this.audioContext = null;
        this.masterGainNode = null; // 全域音量控制
        this.musicBuffer = null; // MP3 音樂緩衝
        this.musicSource = null; // 當前播放 source
        this.musicEnabled = true;
        this.volume = 0.5;
        this.isPlaying = false;
        this.soundEffects = {};
        this.fadeTimeout = null;
        this.pageVisibilityAPI = this.getPageVisibilityAPI();
        this.musicFile = '../../assets/audio/nostalgia2-fast.mp3'; // Corrected path for module
        this.sfxVolume = 0.7; // 新增音效音量
        this.initializeAudioContext();
        this.setupSoundEffects();
        this.loadSettings();
        this.loadMusicBuffer();
        this.setupVisibilityListener();
        console.log('🎵 小熊哥麵包店音樂管理器已初始化');
    }

    // 初始化AudioContext
    initializeAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            // 新增 masterGainNode
            this.masterGainNode = this.audioContext.createGain();
            this.masterGainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
            this.masterGainNode.connect(this.audioContext.destination);
            console.log('🎵 AudioContext已初始化');
        } catch (error) {
            console.warn('Web Audio API不支援，將使用替代方案');
        }
    }

    // 設置音效系統（來自原本script.js）
    setupSoundEffects() {
        if (!this.audioContext) return;
        
        this.soundEffects = {
            click: this.createClickSound.bind(this),
            success: this.createSuccessSound.bind(this),
            error: this.createErrorSound.bind(this),
            coin: this.createCoinSound.bind(this),
            bread: this.createBreadSound.bind(this),
            purchase: this.createPurchaseSound.bind(this)
        };
        
        console.log('🎵 音效系統已設置');
    }

    // 創建點擊音效（清脆像素聲）
    createClickSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGainNode);
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(700, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.08 * this.sfxVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    // 創建成功音效（上升音調）
    createSuccessSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGainNode);
        
        oscillator.frequency.setValueAtTime(523, this.audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659, this.audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(784, this.audioContext.currentTime + 0.2); // G5
        
        gainNode.gain.setValueAtTime(0.15 * this.sfxVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }

    // 創建錯誤音效（下降音調）
    createErrorSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGainNode);
        
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.15 * this.sfxVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }

    // 創建金幣音效（鈴鐺聲）
    createCoinSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGainNode);
        
        oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1200, this.audioContext.currentTime + 0.05);
        oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.1 * this.sfxVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }

    // 創建麵包音效（溫暖的低音）
    createBreadSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGainNode);
        
        oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime); // A3
        oscillator.frequency.setValueAtTime(330, this.audioContext.currentTime + 0.1); // E4
        
        gainNode.gain.setValueAtTime(0.1 * this.sfxVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.4);
    }

    // 創建購買音效（愉快的音調）
    createPurchaseSound() {
        if (!this.audioContext) return;
        
        const oscillator1 = this.audioContext.createOscillator();
        const oscillator2 = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(this.masterGainNode);
        
        oscillator1.frequency.setValueAtTime(523, this.audioContext.currentTime); // C5
        oscillator2.frequency.setValueAtTime(659, this.audioContext.currentTime); // E5
        
        gainNode.gain.setValueAtTime(0.08 * this.sfxVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        
        oscillator1.start(this.audioContext.currentTime);
        oscillator2.start(this.audioContext.currentTime);
        oscillator1.stop(this.audioContext.currentTime + 0.5);
        oscillator2.stop(this.audioContext.currentTime + 0.5);
    }

    // 播放音效
    playSound(soundType) {
        if (!this.musicEnabled || !this.audioContext) return;
        
        // 如果AudioContext需要用戶互動才能啟動
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        if (this.soundEffects[soundType]) {
            try {
                this.soundEffects[soundType]();
                console.log(`🎵 播放音效: ${soundType}`);
            } catch (error) {
                console.warn('音效播放失敗:', error);
            }
        }
    }

    // 載入 MP3 音樂檔
    loadMusicBuffer() {
        if (!this.audioContext) return;
        fetch(this.musicFile)
            .then(res => res.arrayBuffer())
            .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                this.musicBuffer = audioBuffer;
                console.log('🎵 背景音樂已載入');
            })
            .catch(err => console.error('音樂載入失敗:', err));
    }

    // 播放背景音樂
    play() {
        if (!this.musicEnabled || !this.audioContext || !this.musicBuffer) return;
        this.stop();
        this.musicSource = this.audioContext.createBufferSource();
        this.musicSource.buffer = this.musicBuffer;
        this.musicSource.loop = true;
        this.musicSource.connect(this.masterGainNode);
        // 淡入
        if (this.masterGainNode) {
            this.masterGainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            this.masterGainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 1);
        }
        this.musicSource.start(0);
        this.isPlaying = true;
        console.log('🎵 播放背景音樂');
    }

    // 停止背景音樂
    stop() {
        if (this.musicSource) {
            try { this.musicSource.stop(); } catch (e) {}
            this.musicSource.disconnect();
            this.musicSource = null;
        }
        this.isPlaying = false;
        console.log('🎵 背景音樂已停止');
    }

    // 暫停音樂
    pause() {
        if (this.audioContext && this.audioContext.state === 'running') {
            this.audioContext.suspend();
            console.log('🎵 音樂已暫停');
        }
    }

    // 恢復音樂
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(() => {
                if (this.masterGainNode) {
                    this.masterGainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                    this.masterGainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 1);
                }
                if (!this.isPlaying) this.play();
                console.log('🎵 音樂已恢復');
            });
        }
    }

    // 設置音量
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.masterGainNode) {
            this.masterGainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.2);
        }
        console.log(`🎵 音量設置為: ${Math.round(this.volume * 100)}%`);
    }

    // 設置音效音量
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
        console.log(`🔊 音效音量設置為: ${Math.round(this.sfxVolume * 100)}%`);
    }

    // 切換音樂開關
    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        
        if (this.musicEnabled) {
            this.play();
        } else {
            this.stop();
        }
        
        console.log(`🎵 音樂${this.musicEnabled ? '開啟' : '關閉'}`);
        return this.musicEnabled;
    }

    // 載入設定
    loadSettings() {
        const settings = localStorage.getItem('bearBakeryMusicSettings');
        if (settings) {
            const parsed = JSON.parse(settings);
            this.volume = parsed.volume || 0.5;
            this.sfxVolume = parsed.sfxVolume !== undefined ? parsed.sfxVolume : 0.7;
            this.musicEnabled = parsed.musicEnabled !== false;
        }
    }

    // 儲存設定
    saveSettings() {
        const settings = {
            volume: this.volume,
            sfxVolume: this.sfxVolume,
            musicEnabled: this.musicEnabled,
            lastSaved: new Date().toISOString()
        };
        localStorage.setItem('bearBakeryMusicSettings', JSON.stringify(settings));
    }

    // 取得狀態
    getStatus() {
        return {
            isPlaying: this.isPlaying,
            volume: this.volume,
            sfxVolume: this.sfxVolume,
            musicEnabled: this.musicEnabled
        };
    }

    // 頁面可見性API
    getPageVisibilityAPI() {
        if (typeof document.hidden !== 'undefined') {
            return {
                hidden: 'hidden',
                visibilityChange: 'visibilitychange'
            };
        } else if (typeof document.webkitHidden !== 'undefined') {
            return {
                hidden: 'webkitHidden',
                visibilityChange: 'webkitvisibilitychange'
            };
        }
        return null;
    }

    // 設置頁面可見性監聽器
    setupVisibilityListener() {
        if (!this.pageVisibilityAPI) return;
        
        document.addEventListener(this.pageVisibilityAPI.visibilityChange, () => {
            if (document[this.pageVisibilityAPI.hidden]) {
                this.pause();
            } else {
                this.resume();
            }
        });
    }
}
