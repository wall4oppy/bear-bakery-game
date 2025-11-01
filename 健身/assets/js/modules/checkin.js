/**
 * 簽到系統模組
 * 管理每日簽到功能
 */
class CheckinModule {
    constructor() {
        this.storage = window.storage;
        this.config = window.AppConfig;
        this.events = new EventTarget();
        
        this.init();
    }

    /**
     * 初始化
     */
    init() {
        this.bindEvents();
        this.checkTodayStatus();
    }

    /**
     * 綁定事件
     */
    bindEvents() {
        // 監聽簽到按鈕點擊
        document.addEventListener('click', (e) => {
            if (e.target.id === 'checkinBtn' || e.target.closest('#checkinBtn')) {
                e.preventDefault();
                this.performCheckin();
            }
        });

        // 監聽頁面可見性變化
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.checkTodayStatus();
            }
        });
    }

    /**
     * 執行簽到
     */
    async performCheckin() {
        try {
            // 檢查今日是否已簽到
            if (this.hasCheckedInToday()) {
                this.showMessage('今日已經簽到過了！', 'warning');
                return;
            }

            // 獲取當前用戶數據
            const userData = this.getUserData();
            
            // 添加簽到記錄
            const today = new Date().toISOString();
            userData.progress.checkinDays.push(today);
            
            // 增加XP
            userData.stats.XP += this.config.game.checkinXP;
            
            // 更新連續簽到數據
            this.updateStreakData(userData);
            
            // 保存數據
            this.saveUserData(userData);
            
            // 檢查升級
            const levelUp = this.checkLevelUp(userData);
            
            // 檢查成就
            this.checkAchievements(userData);
            
            // 更新UI
            this.updateUI(userData);
            
            // 顯示簽到動畫
            this.showCheckinAnimation();
            
            // 觸發事件
            this.events.dispatchEvent(new CustomEvent('checkin', {
                detail: { userData, levelUp }
            }));
            
            // 顯示成功消息
            this.showMessage('簽到成功！獲得 10 XP', 'success');
            
        } catch (error) {
            console.error('簽到失敗:', error);
            this.showMessage('簽到失敗，請稍後再試', 'error');
        }
    }

    /**
     * 檢查今日是否已簽到
     */
    hasCheckedInToday() {
        const userData = this.getUserData();
        const today = new Date().toDateString();
        
        return userData.progress.checkinDays.some(date => {
            return new Date(date).toDateString() === today;
        });
    }

    /**
     * 檢查今日簽到狀態
     */
    checkTodayStatus() {
        const checkinBtn = document.getElementById('checkinBtn');
        if (!checkinBtn) return;

        if (this.hasCheckedInToday()) {
            this.updateCheckinButton(true);
        } else {
            this.updateCheckinButton(false);
        }
    }

    /**
     * 更新簽到按鈕狀態
     * @param {boolean} checked 是否已簽到
     */
    updateCheckinButton(checked) {
        const checkinBtn = document.getElementById('checkinBtn');
        if (!checkinBtn) return;

        if (checked) {
            checkinBtn.innerHTML = '<i class="fas fa-check"></i> 今日已簽到';
            checkinBtn.disabled = true;
            checkinBtn.style.opacity = '0.6';
            checkinBtn.classList.add('checked');
        } else {
            checkinBtn.innerHTML = '<i class="fas fa-calendar-check"></i> 今日簽到';
            checkinBtn.disabled = false;
            checkinBtn.style.opacity = '1';
            checkinBtn.classList.remove('checked');
        }
    }

    /**
     * 更新連續簽到數據
     * @param {Object} userData 用戶數據
     */
    updateStreakData(userData) {
        const checkinDays = userData.progress.checkinDays;
        let streak = 1;
        
        if (checkinDays.length > 1) {
            // 計算連續簽到天數
            for (let i = checkinDays.length - 2; i >= 0; i--) {
                const currentDate = new Date(checkinDays[i + 1]);
                const prevDate = new Date(checkinDays[i]);
                const diffDays = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));
                
                if (diffDays === 1) {
                    streak++;
                } else {
                    break;
                }
            }
        }
        
        userData.leaderboardSnapshot.checkinStreak = streak;
    }

    /**
     * 檢查升級
     * @param {Object} userData 用戶數據
     */
    checkLevelUp(userData) {
        const currentLevel = userData.stats.level;
        const requiredXP = currentLevel * this.config.game.xpPerLevel;
        
        if (userData.stats.XP >= requiredXP) {
            userData.stats.level++;
            userData.stats.XP = userData.stats.XP - requiredXP; // 保留剩餘XP
            
            // 觸發升級事件
            this.events.dispatchEvent(new CustomEvent('levelup', {
                detail: { newLevel: userData.stats.level, userData }
            }));
            
            return true;
        }
        
        return false;
    }

    /**
     * 檢查成就
     * @param {Object} userData 用戶數據
     */
    checkAchievements(userData) {
        const checkinDays = userData.progress.checkinDays.length;
        const streak = userData.leaderboardSnapshot.checkinStreak;
        
        const achievements = [
            { id: 'first_checkin', condition: checkinDays >= 1, title: '初次簽到' },
            { id: 'week_streak', condition: streak >= 7, title: '連續7天' },
            { id: 'month_streak', condition: streak >= 30, title: '連續30天' },
            { id: 'hundred_days', condition: checkinDays >= 100, title: '百日健身' }
        ];

        achievements.forEach(achievement => {
            if (achievement.condition && 
                !userData.progress.unlockedAchievements.includes(achievement.id)) {
                
                userData.progress.unlockedAchievements.push(achievement.id);
                
                // 觸發成就解鎖事件
                this.events.dispatchEvent(new CustomEvent('achievement', {
                    detail: { achievement, userData }
                }));
            }
        });
    }

    /**
     * 顯示簽到動畫
     */
    showCheckinAnimation() {
        const checkinBtn = document.getElementById('checkinBtn');
        if (!checkinBtn) return;

        // 添加動畫類
        checkinBtn.classList.add('checkin-success');
        
        // 按鈕縮放動畫
        checkinBtn.style.transform = 'scale(1.1)';
        checkinBtn.innerHTML = '<i class="fas fa-check"></i> 簽到成功！';
        
        setTimeout(() => {
            checkinBtn.style.transform = 'scale(1)';
            this.updateCheckinButton(true);
            checkinBtn.classList.remove('checkin-success');
        }, 1000);

        // 創建粒子效果
        this.createParticleEffect();
    }

    /**
     * 創建粒子效果
     */
    createParticleEffect() {
        const container = document.querySelector('.checkin-container');
        if (!container) return;

        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: 6px;
                height: 6px;
                background: #667eea;
                border-radius: 50%;
                pointer-events: none;
                animation: particle-burst 1s ease-out forwards;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
            `;
            
            container.style.position = 'relative';
            container.appendChild(particle);
            
            // 隨機方向動畫
            const angle = (360 / 10) * i;
            const distance = 50 + Math.random() * 50;
            
            particle.style.setProperty('--angle', `${angle}deg`);
            particle.style.setProperty('--distance', `${distance}px`);
            
            // 清理粒子
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 1000);
        }

        // 添加粒子動畫樣式
        if (!document.getElementById('particle-styles')) {
            const style = document.createElement('style');
            style.id = 'particle-styles';
            style.textContent = `
                @keyframes particle-burst {
                    0% {
                        opacity: 1;
                        transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scale(1);
                    }
                    100% {
                        opacity: 0;
                        transform: translate(-50%, -50%) rotate(var(--angle)) translateY(calc(-1 * var(--distance))) scale(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * 更新UI
     * @param {Object} userData 用戶數據
     */
    updateUI(userData) {
        // 更新簽到天數
        const checkinDaysEl = document.getElementById('checkinDays');
        if (checkinDaysEl) {
            checkinDaysEl.textContent = userData.progress.checkinDays.length;
        }

        // 更新連續簽到
        const streakEl = document.getElementById('checkinStreak');
        if (streakEl) {
            streakEl.textContent = userData.leaderboardSnapshot.checkinStreak;
        }

        // 更新等級
        const levelEl = document.getElementById('userLevel');
        if (levelEl) {
            levelEl.textContent = `LV ${userData.stats.level}`;
        }

        // 更新XP信息
        const currentXPEl = document.getElementById('currentXP');
        const nextLevelXPEl = document.getElementById('nextLevelXP');
        if (currentXPEl && nextLevelXPEl) {
            const nextLevelXP = userData.stats.level * this.config.game.xpPerLevel;
            currentXPEl.textContent = `${userData.stats.XP} XP`;
            nextLevelXPEl.textContent = `/ ${nextLevelXP} XP`;
        }
    }

    /**
     * 顯示消息
     * @param {string} message 消息內容
     * @param {string} type 消息類型
     */
    showMessage(message, type = 'info') {
        // 簡單的消息提示實現
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            border-radius: 25px;
            color: white;
            font-weight: 500;
            z-index: 9999;
            animation: message-slide 3s ease forwards;
        `;

        // 設置顏色
        const colors = {
            success: '#28a745',
            warning: '#ffc107',
            error: '#dc3545',
            info: '#667eea'
        };
        messageEl.style.background = colors[type] || colors.info;

        document.body.appendChild(messageEl);

        // 添加動畫樣式
        if (!document.getElementById('message-styles')) {
            const style = document.createElement('style');
            style.id = 'message-styles';
            style.textContent = `
                @keyframes message-slide {
                    0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
                    10%, 90% { opacity: 1; transform: translateX(-50%) translateY(0); }
                    100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
                }
            `;
            document.head.appendChild(style);
        }

        // 自動移除
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 3000);
    }

    /**
     * 獲取用戶數據
     */
    getUserData() {
        return this.storage.get('userData', this.config.defaults.user);
    }

    /**
     * 保存用戶數據
     * @param {Object} userData 用戶數據
     */
    saveUserData(userData) {
        this.storage.set('userData', userData);
    }

    /**
     * 獲取簽到統計
     */
    getCheckinStats() {
        const userData = this.getUserData();
        const checkinDays = userData.progress.checkinDays;
        
        return {
            totalDays: checkinDays.length,
            currentStreak: userData.leaderboardSnapshot.checkinStreak,
            longestStreak: this.calculateLongestStreak(checkinDays),
            thisMonth: this.getThisMonthCheckins(checkinDays),
            hasCheckedToday: this.hasCheckedInToday()
        };
    }

    /**
     * 計算最長連續簽到
     * @param {Array} checkinDays 簽到日期數組
     */
    calculateLongestStreak(checkinDays) {
        if (checkinDays.length === 0) return 0;
        
        let maxStreak = 1;
        let currentStreak = 1;
        
        for (let i = 1; i < checkinDays.length; i++) {
            const currentDate = new Date(checkinDays[i]);
            const prevDate = new Date(checkinDays[i - 1]);
            const diffDays = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                currentStreak++;
                maxStreak = Math.max(maxStreak, currentStreak);
            } else {
                currentStreak = 1;
            }
        }
        
        return maxStreak;
    }

    /**
     * 獲取本月簽到次數
     * @param {Array} checkinDays 簽到日期數組
     */
    getThisMonthCheckins(checkinDays) {
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        
        return checkinDays.filter(date => {
            const d = new Date(date);
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        }).length;
    }
}

// 創建實例
const checkinModule = new CheckinModule();

// 導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CheckinModule;
}
if (typeof window !== 'undefined') {
    window.CheckinModule = CheckinModule;
    window.checkinModule = checkinModule;
} 