/**
 * LeaderboardModule - 排行榜系統
 * 管理排行榜資料、排序與當前使用者標示
 */
class LeaderboardModule {
    constructor(containerId = 'leaderboardContainer') {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        this.leaderboardData = [];
        this.currentUserId = 'user_' + Math.random().toString(36).substr(2, 9);
        
        this.init();
    }

    /**
     * 初始化
     */
    init() {
        this.generateLeaderboardData();
        this.renderLeaderboard();
        this.bindEvents();
        this.startAutoUpdate();
    }

    /**
     * 生成排行榜假資料
     */
    generateLeaderboardData() {
        const names = [
            '健身小王子', '肌肉女王', '運動達人', '健康生活家',
            '體能戰士', '健美先生', '活力女孩', '力量王者',
            '耐力跑者', '瑜伽大師', '拳擊手', '游泳健將',
            '籃球高手', '足球明星', '網球選手', '田徑選手'
        ];
        
        const avatars = ['👤', '💪', '🏃', '🏋️', '🥊', '🏊', '🏀', '⚽', '🎾', '🏃‍♀️'];
        
        this.leaderboardData = [];
        
        // 生成10個假使用者
        for (let i = 0; i < 10; i++) {
            const level = Math.floor(Math.random() * 20) + 1;
            const xp = level * 100 + Math.floor(Math.random() * 500);
            const checkinStreak = Math.floor(Math.random() * 50) + 1;
            const workoutCount = Math.floor(Math.random() * 100) + 10;
            
            this.leaderboardData.push({
                id: i === 0 ? this.currentUserId : `user_${i}`,
                name: names[i % names.length],
                avatar: avatars[i % avatars.length],
                level: level,
                xp: xp,
                checkinStreak: checkinStreak,
                workoutCount: workoutCount,
                rank: 0
            });
        }
        
        // 排序並設定排名
        this.sortLeaderboard();
    }

    /**
     * 排序排行榜
     */
    sortLeaderboard() {
        this.leaderboardData.sort((a, b) => {
            // 主要排序：等級
            if (b.level !== a.level) {
                return b.level - a.level;
            }
            // 次要排序：XP
            if (b.xp !== a.xp) {
                return b.xp - a.xp;
            }
            // 第三排序：連續簽到天數
            return b.checkinStreak - a.checkinStreak;
        });
        
        // 設定排名
        this.leaderboardData.forEach((user, index) => {
            user.rank = index + 1;
        });
    }

    /**
     * 渲染排行榜
     */
    renderLeaderboard() {
        let html = `
            <div class="leaderboard-header">
                <h3>🏆 排行榜</h3>
                <div class="leaderboard-stats">
                    <span class="stats-item">總參與者：${this.leaderboardData.length}</span>
                    <span class="stats-item">最高等級：${Math.max(...this.leaderboardData.map(u => u.level))}</span>
                </div>
            </div>
            <div class="leaderboard-list">
        `;
        
        this.leaderboardData.forEach((user, index) => {
            const isCurrentUser = user.id === this.currentUserId;
            const rankClass = index < 3 ? `rank-${index + 1}` : '';
            const userClass = isCurrentUser ? 'current-user' : '';
            
            html += `
                <div class="leaderboard-item ${rankClass} ${userClass}" data-user-id="${user.id}">
                    <div class="rank-number">
                        ${this.getRankIcon(user.rank)}
                        <span class="rank-text">${user.rank}</span>
                    </div>
                    <div class="user-avatar">${user.avatar}</div>
                    <div class="user-details">
                        <div class="user-name">
                            ${user.name}
                            ${isCurrentUser ? '<span class="current-user-badge">你</span>' : ''}
                        </div>
                        <div class="user-stats">
                            <span class="stat-item">LV ${user.level}</span>
                            <span class="stat-item">${user.xp.toLocaleString()} XP</span>
                            <span class="stat-item">🔥 ${user.checkinStreak}天</span>
                        </div>
                    </div>
                    <div class="user-achievements">
                        <div class="achievement-count">🏅 ${user.workoutCount}</div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        
        // 添加當前使用者詳細資訊
        const currentUser = this.leaderboardData.find(u => u.id === this.currentUserId);
        if (currentUser) {
            html += `
                <div class="current-user-summary">
                    <div class="summary-header">你的排名</div>
                    <div class="summary-content">
                        <div class="summary-rank">第 ${currentUser.rank} 名</div>
                        <div class="summary-stats">
                            <div class="summary-stat">
                                <span class="stat-label">等級</span>
                                <span class="stat-value">${currentUser.level}</span>
                            </div>
                            <div class="summary-stat">
                                <span class="stat-label">XP</span>
                                <span class="stat-value">${currentUser.xp.toLocaleString()}</span>
                            </div>
                            <div class="summary-stat">
                                <span class="stat-label">連續簽到</span>
                                <span class="stat-value">${currentUser.checkinStreak}天</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        this.container.innerHTML = html;
    }

    /**
     * 取得排名圖標
     */
    getRankIcon(rank) {
        const icons = {
            1: '🥇',
            2: '🥈', 
            3: '🥉'
        };
        return icons[rank] || '';
    }

    /**
     * 更新當前使用者資料
     */
    updateCurrentUserData(userData) {
        const currentUser = this.leaderboardData.find(u => u.id === this.currentUserId);
        if (currentUser) {
            currentUser.level = userData.level || currentUser.level;
            currentUser.xp = userData.xp || currentUser.xp;
            currentUser.checkinStreak = userData.checkinStreak || currentUser.checkinStreak;
            currentUser.workoutCount = userData.workoutCount || currentUser.workoutCount;
            
            this.sortLeaderboard();
            this.renderLeaderboard();
        }
    }

    /**
     * 開始自動更新
     */
    startAutoUpdate() {
        // 每30秒更新一次排行榜（模擬其他使用者活動）
        setInterval(() => {
            this.simulateOtherUserActivity();
        }, 30000);
    }

    /**
     * 模擬其他使用者活動
     */
    simulateOtherUserActivity() {
        this.leaderboardData.forEach(user => {
            if (user.id !== this.currentUserId) {
                // 隨機增加XP和等級
                if (Math.random() < 0.3) {
                    user.xp += Math.floor(Math.random() * 50) + 10;
                    user.level = Math.floor(user.xp / 100) + 1;
                }
                
                // 隨機增加簽到天數
                if (Math.random() < 0.2) {
                    user.checkinStreak += 1;
                }
                
                // 隨機增加運動次數
                if (Math.random() < 0.4) {
                    user.workoutCount += Math.floor(Math.random() * 3) + 1;
                }
            }
        });
        
        this.sortLeaderboard();
        this.renderLeaderboard();
    }

    /**
     * 顯示使用者詳情
     */
    showUserDetail(userId) {
        const user = this.leaderboardData.find(u => u.id === userId);
        if (!user) return;
        
        const modal = document.createElement('div');
        modal.className = 'user-detail-modal';
        modal.innerHTML = `
            <div class="user-detail-content">
                <div class="user-detail-header">
                    <div class="user-detail-avatar">${user.avatar}</div>
                    <div class="user-detail-info">
                        <div class="user-detail-name">${user.name}</div>
                        <div class="user-detail-rank">第 ${user.rank} 名</div>
                    </div>
                    <button class="user-detail-close">✕</button>
                </div>
                <div class="user-detail-stats">
                    <div class="detail-stat">
                        <span class="detail-stat-label">等級</span>
                        <span class="detail-stat-value">${user.level}</span>
                    </div>
                    <div class="detail-stat">
                        <span class="detail-stat-label">總XP</span>
                        <span class="detail-stat-value">${user.xp.toLocaleString()}</span>
                    </div>
                    <div class="detail-stat">
                        <span class="detail-stat-label">連續簽到</span>
                        <span class="detail-stat-value">${user.checkinStreak} 天</span>
                    </div>
                    <div class="detail-stat">
                        <span class="detail-stat-label">運動次數</span>
                        <span class="detail-stat-value">${user.workoutCount} 次</span>
                    </div>
                </div>
                <div class="user-detail-achievements">
                    <h4>最近成就</h4>
                    <div class="achievements-preview">
                        <span class="achievement-preview">🏆 等級達人</span>
                        <span class="achievement-preview">🔥 簽到大師</span>
                        <span class="achievement-preview">💪 運動健將</span>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        setTimeout(() => modal.classList.add('show'), 100);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('user-detail-close')) {
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
     * 綁定事件
     */
    bindEvents() {
        this.container.addEventListener('click', (e) => {
            const leaderboardItem = e.target.closest('.leaderboard-item');
            if (leaderboardItem) {
                const userId = leaderboardItem.dataset.userId;
                this.showUserDetail(userId);
            }
        });
        
        // 監聽其他模組的事件
        document.addEventListener('checkinCompleted', (e) => {
            const userData = StorageManager.getUserData();
            this.updateCurrentUserData(userData);
        });
        
        document.addEventListener('levelUp', (e) => {
            const userData = StorageManager.getUserData();
            this.updateCurrentUserData(userData);
        });
    }

    /**
     * 取得排行榜資料（供其他模組使用）
     */
    getLeaderboardData() {
        return this.leaderboardData;
    }

    /**
     * 取得當前使用者排名
     */
    getCurrentUserRank() {
        const currentUser = this.leaderboardData.find(u => u.id === this.currentUserId);
        return currentUser ? currentUser.rank : null;
    }
}

// 自動掛載
if (document.getElementById('leaderboardContainer')) {
    window.leaderboardModule = new LeaderboardModule();
}
if (typeof window !== 'undefined') {
    window.LeaderboardModule = LeaderboardModule;
} 