/**
 * AvatarModule - Avatar裝備系統
 * 根據等級切換Avatar圖片與裝備，支援動畫效果
 */
class AvatarModule {
    constructor(containerId = 'avatarContainer') {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        this.currentLevel = 1;
        this.currentAvatar = 'default';
        this.avatars = this.getAvatarData();
        
        this.init();
    }

    /**
     * 初始化
     */
    init() {
        this.renderAvatar();
        this.bindEvents();
        this.loadUserData();
    }

    /**
     * Avatar資料定義
     */
    getAvatarData() {
        return {
            default: {
                name: '初心者',
                image: '👤',
                description: '健身新手，準備開始你的健身之旅！',
                unlockLevel: 1
            },
            level2: {
                name: '健身學徒',
                image: '💪',
                description: '開始看到進步，繼續努力！',
                unlockLevel: 2,
                equipment: ['運動手環']
            },
            level3: {
                name: '健身愛好者',
                image: '🏃',
                description: '已經養成運動習慣，很棒！',
                unlockLevel: 3,
                equipment: ['運動手環', '運動鞋']
            },
            level5: {
                name: '健身達人',
                image: '🏋️',
                description: '健身專家，身體素質大幅提升！',
                unlockLevel: 5,
                equipment: ['運動手環', '運動鞋', '健身手套']
            },
            level8: {
                name: '健身大師',
                image: '🥇',
                description: '健身大師，擁有完美的體態！',
                unlockLevel: 8,
                equipment: ['運動手環', '運動鞋', '健身手套', '冠軍腰帶']
            },
            level10: {
                name: '健身傳奇',
                image: '👑',
                description: '健身傳奇，你已經達到了巔峰！',
                unlockLevel: 10,
                equipment: ['運動手環', '運動鞋', '健身手套', '冠軍腰帶', '傳奇皇冠']
            }
        };
    }

    /**
     * 載入使用者資料
     */
    loadUserData() {
        const userData = StorageManager.getUserData();
        if (userData && userData.level) {
            this.updateLevel(userData.level);
        }
    }

    /**
     * 更新等級
     */
    updateLevel(newLevel) {
        if (newLevel === this.currentLevel) return;
        
        const oldLevel = this.currentLevel;
        this.currentLevel = newLevel;
        
        // 檢查是否有新Avatar解鎖
        const newAvatar = this.getAvatarByLevel(newLevel);
        if (newAvatar && newAvatar !== this.currentAvatar) {
            this.unlockAvatar(newAvatar, oldLevel);
        }
        
        this.renderAvatar();
    }

    /**
     * 根據等級取得Avatar
     */
    getAvatarByLevel(level) {
        const avatars = Object.keys(this.avatars);
        let bestAvatar = 'default';
        
        for (const avatarKey of avatars) {
            const avatar = this.avatars[avatarKey];
            if (level >= avatar.unlockLevel && avatar.unlockLevel > this.avatars[bestAvatar].unlockLevel) {
                bestAvatar = avatarKey;
            }
        }
        
        return bestAvatar;
    }

    /**
     * 解鎖新Avatar
     */
    unlockAvatar(avatarKey, oldLevel) {
        const avatar = this.avatars[avatarKey];
        this.currentAvatar = avatarKey;
        
        // 顯示解鎖動畫
        this.showUnlockAnimation(avatar, oldLevel);
        
        // 儲存到本地
        const userData = StorageManager.getUserData();
        userData.avatar = avatarKey;
        StorageManager.saveUserData(userData);
    }

    /**
     * 顯示解鎖動畫
     */
    showUnlockAnimation(avatar, oldLevel) {
        const notification = document.createElement('div');
        notification.className = 'avatar-unlock-notification';
        notification.innerHTML = `
            <div class="unlock-content">
                <div class="unlock-icon">🎉</div>
                <div class="unlock-title">新Avatar解鎖！</div>
                <div class="unlock-avatar">${avatar.image}</div>
                <div class="unlock-name">${avatar.name}</div>
                <div class="unlock-desc">${avatar.description}</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 動畫效果
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    /**
     * 渲染Avatar
     */
    renderAvatar() {
        const avatar = this.avatars[this.currentAvatar];
        
        this.container.innerHTML = `
            <div class="avatar-display">
                <div class="avatar-image-container">
                    <div class="avatar-image ${this.currentAvatar !== 'default' ? 'equipped' : ''}">
                        ${avatar.image}
                    </div>
                    <div class="avatar-level-badge">LV ${this.currentLevel}</div>
                </div>
                <div class="avatar-info">
                    <h3 class="avatar-name">${avatar.name}</h3>
                    <p class="avatar-description">${avatar.description}</p>
                    ${avatar.equipment ? `
                        <div class="avatar-equipment">
                            <div class="equipment-title">裝備：</div>
                            <div class="equipment-list">
                                ${avatar.equipment.map(item => `
                                    <span class="equipment-item">${item}</span>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="avatar-progress">
                <div class="next-avatar">
                    <div class="next-avatar-label">下一個Avatar：</div>
                    ${this.getNextAvatarPreview()}
                </div>
            </div>
        `;
    }

    /**
     * 取得下一個Avatar預覽
     */
    getNextAvatarPreview() {
        const avatars = Object.keys(this.avatars);
        let nextAvatar = null;
        
        for (const avatarKey of avatars) {
            const avatar = this.avatars[avatarKey];
            if (avatar.unlockLevel > this.currentLevel) {
                nextAvatar = avatar;
                break;
            }
        }
        
        if (nextAvatar) {
            return `
                <div class="next-avatar-preview">
                    <div class="next-avatar-image">${nextAvatar.image}</div>
                    <div class="next-avatar-name">${nextAvatar.name}</div>
                    <div class="next-avatar-level">需要 LV ${nextAvatar.unlockLevel}</div>
                </div>
            `;
        }
        
        return '<div class="next-avatar-max">已達到最高等級！</div>';
    }

    /**
     * 綁定事件
     */
    bindEvents() {
        // 監聽等級變化事件
        document.addEventListener('levelUp', (e) => {
            this.updateLevel(e.detail.newLevel);
        });
    }

    /**
     * 手動切換Avatar（用於測試）
     */
    switchAvatar(avatarKey) {
        if (this.avatars[avatarKey]) {
            this.currentAvatar = avatarKey;
            this.renderAvatar();
        }
    }
}

// 自動掛載
if (document.getElementById('avatarContainer')) {
    window.avatarModule = new AvatarModule();
}
if (typeof window !== 'undefined') {
    window.AvatarModule = AvatarModule;
} 