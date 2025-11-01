/**
 * AchievementModule - 成就徽章系統
 * 管理成就解鎖條件、動畫效果與本地儲存
 */
class AchievementModule {
    constructor(containerId = 'achievementContainer') {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        this.achievements = this.getAchievementData();
        this.unlockedAchievements = [];
        
        this.init();
    }

    /**
     * 初始化
     */
    init() {
        this.loadUnlockedAchievements();
        this.renderAchievements();
        this.bindEvents();
        this.checkAchievements();
    }

    /**
     * 成就資料定義
     */
    getAchievementData() {
        return [
            {
                id: 'first_checkin',
                title: '初次簽到',
                description: '完成第一次每日簽到',
                icon: '📅',
                condition: 'checkin_count >= 1',
                xpReward: 50,
                rarity: 'common'
            },
            {
                id: 'checkin_streak_7',
                title: '堅持一週',
                description: '連續簽到7天',
                icon: '🔥',
                condition: 'checkin_streak >= 7',
                xpReward: 200,
                rarity: 'rare'
            },
            {
                id: 'checkin_streak_30',
                title: '月月堅持',
                description: '連續簽到30天',
                icon: '💎',
                condition: 'checkin_streak >= 30',
                xpReward: 500,
                rarity: 'epic'
            },
            {
                id: 'level_5',
                title: '健身新手',
                description: '達到等級5',
                icon: '⭐',
                condition: 'level >= 5',
                xpReward: 300,
                rarity: 'rare'
            },
            {
                id: 'level_10',
                title: '健身達人',
                description: '達到等級10',
                icon: '🏆',
                condition: 'level >= 10',
                xpReward: 800,
                rarity: 'epic'
            },
            {
                id: 'complete_all_tasks',
                title: '完美主義者',
                description: '一天內完成所有任務',
                icon: '✅',
                condition: 'daily_tasks_completed >= 3',
                xpReward: 150,
                rarity: 'common'
            },
            {
                id: 'workout_master',
                title: '運動大師',
                description: '完成10次運動訓練',
                icon: '💪',
                condition: 'workout_count >= 10',
                xpReward: 400,
                rarity: 'rare'
            },
            {
                id: 'diet_tracker',
                title: '飲食追蹤者',
                description: '記錄7天的飲食日誌',
                icon: '🥗',
                condition: 'diet_log_days >= 7',
                xpReward: 250,
                rarity: 'rare'
            },
            {
                id: 'flow_state',
                title: '心流狀態',
                description: '達到100%心流狀態',
                icon: '🌊',
                condition: 'flow_percentage >= 100',
                xpReward: 600,
                rarity: 'epic'
            }
        ];
    }

    /**
     * 載入已解鎖成就
     */
    loadUnlockedAchievements() {
        const userData = StorageManager.getUserData();
        this.unlockedAchievements = userData.unlockedAchievements || [];
    }

    /**
     * 儲存已解鎖成就
     */
    saveUnlockedAchievements() {
        const userData = StorageManager.getUserData();
        userData.unlockedAchievements = this.unlockedAchievements;
        StorageManager.saveUserData(userData);
    }

    /**
     * 檢查成就條件
     */
    checkAchievements() {
        const userData = StorageManager.getUserData();
        const stats = {
            checkin_count: userData.checkinCount || 0,
            checkin_streak: userData.checkinStreak || 0,
            level: userData.level || 1,
            daily_tasks_completed: userData.dailyTasksCompleted || 0,
            workout_count: userData.workoutCount || 0,
            diet_log_days: userData.dietLogDays || 0,
            flow_percentage: userData.flowPercentage || 0
        };

        this.achievements.forEach(achievement => {
            if (!this.unlockedAchievements.includes(achievement.id)) {
                if (this.evaluateCondition(achievement.condition, stats)) {
                    this.unlockAchievement(achievement);
                }
            }
        });
    }

    /**
     * 評估成就條件
     */
    evaluateCondition(condition, stats) {
        const operators = {
            '>=': (a, b) => a >= b,
            '>': (a, b) => a > b,
            '<=': (a, b) => a <= b,
            '<': (a, b) => a < b,
            '==': (a, b) => a == b,
            '===': (a, b) => a === b
        };

        for (const [op, func] of Object.entries(operators)) {
            if (condition.includes(op)) {
                const [variable, value] = condition.split(op).map(s => s.trim());
                const statValue = stats[variable];
                const targetValue = parseInt(value);
                return func(statValue, targetValue);
            }
        }

        return false;
    }

    /**
     * 解鎖成就
     */
    unlockAchievement(achievement) {
        this.unlockedAchievements.push(achievement.id);
        this.saveUnlockedAchievements();
        
        // 顯示解鎖動畫
        this.showUnlockAnimation(achievement);
        
        // 發送事件通知其他模組
        document.dispatchEvent(new CustomEvent('achievementUnlocked', {
            detail: { achievement }
        }));
    }

    /**
     * 顯示解鎖動畫
     */
    showUnlockAnimation(achievement) {
        // 創建通知元素
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-unlock-content">
                <div class="achievement-unlock-icon">${achievement.icon}</div>
                <div class="achievement-unlock-title">成就解鎖！</div>
                <div class="achievement-unlock-name">${achievement.title}</div>
                <div class="achievement-unlock-desc">${achievement.description}</div>
                <div class="achievement-unlock-reward">+${achievement.xpReward} XP</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 動畫序列
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // 發光效果
        setTimeout(() => {
            notification.classList.add('glow');
        }, 500);
        
        // 移除通知
        setTimeout(() => {
            notification.classList.remove('show', 'glow');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
        
        // 更新成就顯示
        this.renderAchievements();
    }

    /**
     * 渲染成就列表
     */
    renderAchievements() {
        const unlockedCount = this.unlockedAchievements.length;
        const totalCount = this.achievements.length;
        
        let html = `
            <div class="achievements-header">
                <h3>成就徽章</h3>
                <div class="achievements-progress">${unlockedCount}/${totalCount}</div>
            </div>
            <div class="achievements-grid">
        `;
        
        this.achievements.forEach(achievement => {
            const isUnlocked = this.unlockedAchievements.includes(achievement.id);
            html += `
                <div class="achievement-badge ${isUnlocked ? 'unlocked' : 'locked'} ${achievement.rarity}" 
                     data-achievement-id="${achievement.id}">
                    <div class="achievement-icon">${achievement.icon}</div>
                    <div class="achievement-info">
                        <div class="achievement-title">${achievement.title}</div>
                        <div class="achievement-description">${achievement.description}</div>
                        ${isUnlocked ? `
                            <div class="achievement-reward">+${achievement.xpReward} XP</div>
                        ` : `
                            <div class="achievement-condition">${achievement.condition}</div>
                        `}
                    </div>
                    ${isUnlocked ? '<div class="achievement-check">✓</div>' : ''}
                </div>
            `;
        });
        
        html += '</div>';
        this.container.innerHTML = html;
    }

    /**
     * 綁定事件
     */
    bindEvents() {
        // 監聽成就徽章點擊
        this.container.addEventListener('click', (e) => {
            const badge = e.target.closest('.achievement-badge');
            if (badge) {
                const achievementId = badge.dataset.achievementId;
                const achievement = this.achievements.find(a => a.id === achievementId);
                if (achievement) {
                    this.showAchievementDetail(achievement);
                }
            }
        });
        
        // 監聽其他模組的事件
        document.addEventListener('checkinCompleted', () => {
            setTimeout(() => this.checkAchievements(), 100);
        });
        
        document.addEventListener('taskCompleted', () => {
            setTimeout(() => this.checkAchievements(), 100);
        });
        
        document.addEventListener('levelUp', () => {
            setTimeout(() => this.checkAchievements(), 100);
        });
    }

    /**
     * 顯示成就詳情
     */
    showAchievementDetail(achievement) {
        const isUnlocked = this.unlockedAchievements.includes(achievement.id);
        
        const modal = document.createElement('div');
        modal.className = 'achievement-detail-modal';
        modal.innerHTML = `
            <div class="achievement-detail-content">
                <div class="achievement-detail-header">
                    <div class="achievement-detail-icon ${achievement.rarity}">${achievement.icon}</div>
                    <div class="achievement-detail-title">${achievement.title}</div>
                </div>
                <div class="achievement-detail-description">${achievement.description}</div>
                <div class="achievement-detail-status">
                    ${isUnlocked ? 
                        `<div class="achievement-unlocked">已解鎖！獲得 ${achievement.xpReward} XP</div>` :
                        `<div class="achievement-locked">尚未解鎖</div>`
                    }
                </div>
                <button class="achievement-detail-close">關閉</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        setTimeout(() => modal.classList.add('show'), 100);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('achievement-detail-close')) {
                modal.classList.remove('show');
                setTimeout(() => {
                    if (document.body.contains(modal)) {
                        document.body.removeChild(modal);
                    }
                }, 300);
            }
        });
    }

    /**
     * 手動觸發成就檢查（用於測試）
     */
    forceCheck() {
        this.checkAchievements();
    }
}

// 自動掛載
if (document.getElementById('achievementContainer')) {
    window.achievementModule = new AchievementModule();
}
if (typeof window !== 'undefined') {
    window.AchievementModule = AchievementModule;
} 