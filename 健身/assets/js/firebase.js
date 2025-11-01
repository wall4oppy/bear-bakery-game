/**
 * Firebase Firestore 雲端同步架構
 * 提供使用者資料的雲端儲存與同步功能
 */

// Firebase 配置（請替換為您的實際配置）
const firebaseConfig = {
    // 請將此處替換為您的 Firebase 配置
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};

// Firebase 初始化
let app, db, auth;

// 初始化 Firebase
function initializeFirebase() {
    try {
        // 檢查是否已經初始化
        if (typeof firebase === 'undefined') {
            console.warn('Firebase SDK 未載入，請確保已引入 Firebase 腳本');
            return false;
        }

        // 初始化 Firebase App
        if (!firebase.apps.length) {
            app = firebase.initializeApp(firebaseConfig);
        } else {
            app = firebase.app();
        }

        // 初始化 Firestore
        db = firebase.firestore();
        
        // 初始化 Auth（可選）
        auth = firebase.auth();

        console.log('Firebase 初始化成功');
        return true;
    } catch (error) {
        console.error('Firebase 初始化失敗:', error);
        return false;
    }
}

/**
 * 取得使用者資料參考
 * @param {string} userId - 使用者ID
 * @returns {Object} Firestore 文件參考
 */
function getUserRef(userId) {
    if (!db) {
        console.error('Firestore 未初始化');
        return null;
    }
    return db.collection('users').doc(userId);
}

/**
 * 使用者資料管理類別
 */
class FirebaseUserManager {
    constructor() {
        this.currentUserId = null;
        this.isInitialized = false;
        this.syncEnabled = false;
    }

    /**
     * 初始化
     */
    async init() {
        if (!initializeFirebase()) {
            console.warn('Firebase 初始化失敗，將使用本地儲存');
            return false;
        }

        this.isInitialized = true;
        this.currentUserId = this.getCurrentUserId();
        
        // 啟用離線支援
        db.enableNetwork();
        
        console.log('Firebase 使用者管理器初始化成功');
        return true;
    }

    /**
     * 取得當前使用者ID
     */
    getCurrentUserId() {
        // 從本地儲存取得或生成新的使用者ID
        let userId = localStorage.getItem('fitness_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('fitness_user_id', userId);
        }
        return userId;
    }

    /**
     * 啟用同步
     */
    enableSync() {
        if (!this.isInitialized) {
            console.error('Firebase 未初始化');
            return false;
        }
        
        this.syncEnabled = true;
        console.log('雲端同步已啟用');
        return true;
    }

    /**
     * 停用同步
     */
    disableSync() {
        this.syncEnabled = false;
        console.log('雲端同步已停用');
    }

    /**
     * 儲存使用者資料到雲端
     * @param {Object} userData - 使用者資料
     */
    async saveUserData(userData) {
        if (!this.syncEnabled || !this.isInitialized) {
            console.log('雲端同步未啟用，僅儲存到本地');
            return false;
        }

        try {
            const userRef = getUserRef(this.currentUserId);
            if (!userRef) return false;

            const timestamp = firebase.firestore.FieldValue.serverTimestamp();
            
            // 準備雲端資料結構
            const cloudData = {
                stats: {
                    level: userData.level || 1,
                    xp: userData.xp || 0,
                    flowState: userData.flowState || 0,
                    lastUpdated: timestamp
                },
                progress: {
                    checkinDays: userData.checkinDays || [],
                    unlockedAchievements: userData.unlockedAchievements || [],
                    dietHistory: userData.mealHistory || [],
                    avatarItems: userData.avatarItems || [],
                    lastUpdated: timestamp
                },
                tasks: {
                    todayTasks: userData.todayTasks || [],
                    completedTasks: userData.completedTasks || [],
                    lastUpdated: timestamp
                },
                leaderboardSnapshot: {
                    xp: userData.xp || 0,
                    level: userData.level || 1,
                    checkinStreak: userData.checkinStreak || 0,
                    workoutCount: userData.workoutCount || 0,
                    lastUpdated: timestamp
                },
                profile: {
                    name: userData.name || '健身玩家',
                    avatar: userData.avatar || 'default',
                    createdAt: timestamp,
                    lastLogin: timestamp
                }
            };

            await userRef.set(cloudData, { merge: true });
            console.log('使用者資料已同步到雲端');
            return true;
        } catch (error) {
            console.error('雲端儲存失敗:', error);
            return false;
        }
    }

    /**
     * 從雲端載入使用者資料
     */
    async loadUserData() {
        if (!this.syncEnabled || !this.isInitialized) {
            console.log('雲端同步未啟用，從本地載入');
            return StorageManager.getUserData();
        }

        try {
            const userRef = getUserRef(this.currentUserId);
            if (!userRef) return null;

            const doc = await userRef.get();
            
            if (!doc.exists) {
                console.log('雲端無使用者資料，使用本地資料');
                return StorageManager.getUserData();
            }

            const cloudData = doc.data();
            
            // 轉換為本地格式
            const localData = {
                level: cloudData.stats?.level || 1,
                xp: cloudData.stats?.xp || 0,
                flowState: cloudData.stats?.flowState || 0,
                checkinDays: cloudData.progress?.checkinDays || [],
                unlockedAchievements: cloudData.progress?.unlockedAchievements || [],
                mealHistory: cloudData.progress?.dietHistory || [],
                avatarItems: cloudData.progress?.avatarItems || [],
                todayTasks: cloudData.tasks?.todayTasks || [],
                completedTasks: cloudData.tasks?.completedTasks || [],
                name: cloudData.profile?.name || '健身玩家',
                avatar: cloudData.profile?.avatar || 'default',
                checkinStreak: cloudData.leaderboardSnapshot?.checkinStreak || 0,
                workoutCount: cloudData.leaderboardSnapshot?.workoutCount || 0
            };

            console.log('從雲端載入使用者資料成功');
            return localData;
        } catch (error) {
            console.error('雲端載入失敗:', error);
            return StorageManager.getUserData();
        }
    }

    /**
     * 同步本地資料到雲端
     */
    async syncToCloud() {
        if (!this.syncEnabled) return false;

        const localData = StorageManager.getUserData();
        return await this.saveUserData(localData);
    }

    /**
     * 從雲端同步到本地
     */
    async syncFromCloud() {
        if (!this.syncEnabled) return false;

        const cloudData = await this.loadUserData();
        if (cloudData) {
            StorageManager.saveUserData(cloudData);
            return true;
        }
        return false;
    }

    /**
     * 取得排行榜資料
     */
    async getLeaderboardData() {
        if (!this.isInitialized) return [];

        try {
            const snapshot = await db.collection('users')
                .orderBy('leaderboardSnapshot.xp', 'desc')
                .orderBy('leaderboardSnapshot.level', 'desc')
                .limit(50)
                .get();

            const leaderboardData = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.leaderboardSnapshot && data.profile) {
                    leaderboardData.push({
                        id: doc.id,
                        name: data.profile.name,
                        avatar: data.profile.avatar,
                        level: data.leaderboardSnapshot.level,
                        xp: data.leaderboardSnapshot.xp,
                        checkinStreak: data.leaderboardSnapshot.checkinStreak,
                        workoutCount: data.leaderboardSnapshot.workoutCount
                    });
                }
            });

            return leaderboardData;
        } catch (error) {
            console.error('取得排行榜資料失敗:', error);
            return [];
        }
    }

    /**
     * 更新排行榜快照
     */
    async updateLeaderboardSnapshot(userData) {
        if (!this.syncEnabled) return false;

        try {
            const userRef = getUserRef(this.currentUserId);
            if (!userRef) return false;

            await userRef.update({
                'leaderboardSnapshot.xp': userData.xp || 0,
                'leaderboardSnapshot.level': userData.level || 1,
                'leaderboardSnapshot.checkinStreak': userData.checkinStreak || 0,
                'leaderboardSnapshot.workoutCount': userData.workoutCount || 0,
                'leaderboardSnapshot.lastUpdated': firebase.firestore.FieldValue.serverTimestamp()
            });

            return true;
        } catch (error) {
            console.error('更新排行榜快照失敗:', error);
            return false;
        }
    }

    /**
     * 監聽使用者資料變化
     */
    listenToUserData(callback) {
        if (!this.syncEnabled || !this.isInitialized) return null;

        const userRef = getUserRef(this.currentUserId);
        if (!userRef) return null;

        return userRef.onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                callback(data);
            }
        }, (error) => {
            console.error('監聽使用者資料失敗:', error);
        });
    }

    /**
     * 停止監聽
     */
    stopListening(unsubscribe) {
        if (unsubscribe) {
            unsubscribe();
        }
    }

    /**
     * 備份使用者資料
     */
    async backupUserData() {
        const localData = StorageManager.getUserData();
        const backupData = {
            ...localData,
            backupTimestamp: new Date().toISOString(),
            version: '1.0.0'
        };

        try {
            const userRef = getUserRef(this.currentUserId);
            await userRef.collection('backups').add(backupData);
            console.log('使用者資料備份成功');
            return true;
        } catch (error) {
            console.error('備份失敗:', error);
            return false;
        }
    }

    /**
     * 恢復使用者資料
     */
    async restoreUserData(backupId) {
        try {
            const backupRef = getUserRef(this.currentUserId)
                .collection('backups')
                .doc(backupId);

            const doc = await backupRef.get();
            if (!doc.exists) {
                console.error('備份不存在');
                return false;
            }

            const backupData = doc.data();
            delete backupData.backupTimestamp;
            delete backupData.version;

            StorageManager.saveUserData(backupData);
            await this.saveUserData(backupData);

            console.log('使用者資料恢復成功');
            return true;
        } catch (error) {
            console.error('恢復失敗:', error);
            return false;
        }
    }

    /**
     * 取得備份列表
     */
    async getBackupList() {
        try {
            const snapshot = await getUserRef(this.currentUserId)
                .collection('backups')
                .orderBy('backupTimestamp', 'desc')
                .get();

            const backups = [];
            snapshot.forEach(doc => {
                backups.push({
                    id: doc.id,
                    timestamp: doc.data().backupTimestamp,
                    version: doc.data().version
                });
            });

            return backups;
        } catch (error) {
            console.error('取得備份列表失敗:', error);
            return [];
        }
    }
}

// 全域 Firebase 使用者管理器實例
window.firebaseUserManager = new FirebaseUserManager();

// 自動初始化（當 DOM 載入完成後）
document.addEventListener('DOMContentLoaded', async () => {
    await window.firebaseUserManager.init();
});

// 匯出模組
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeFirebase,
        getUserRef,
        FirebaseUserManager
    };
}

// 全域匯出
if (typeof window !== 'undefined') {
    window.initializeFirebase = initializeFirebase;
    window.getUserRef = getUserRef;
    window.FirebaseUserManager = FirebaseUserManager;
} 