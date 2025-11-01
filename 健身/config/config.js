// 應用配置
const AppConfig = {
    // Firebase 模擬配置
    firebase: {
        apiKey: "模擬-api-key",
        authDomain: "fitness-app.firebaseapp.com",
        projectId: "fitness-app",
        storageBucket: "fitness-app.appspot.com",
        messagingSenderId: "123456789",
        appId: "模擬-app-id"
    },
    
    // 應用設定
    app: {
        name: "FitnessPro",
        version: "1.0.0",
        maxRetries: 3,
        saveInterval: 30000, // 30秒自動保存
        theme: "light", // light, dark, auto
        language: "zh-TW"
    },
    
    // 遊戲設定
    game: {
        maxLevel: 50,
        xpPerLevel: 100,
        checkinXP: 10,
        taskXP: 20,
        flowIncrement: 10,
        maxFlow: 100
    },
    
    // UI 設定
    ui: {
        maxWidth: 414,
        animationDuration: 300,
        chartColors: {
            primary: '#667eea',
            secondary: '#764ba2',
            accent: '#ff6b6b',
            success: '#28a745',
            warning: '#ffc107',
            danger: '#dc3545'
        }
    },
    
    // API 設定
    api: {
        timeout: 10000,
        retryDelay: 1000,
        endpoints: {
            // 可以在這裡配置外部API端點
        }
    },
    
    // 本地存儲鍵名
    storage: {
        userData: 'fitnessUserData',
        settings: 'fitnessSettings',
        cache: 'fitnessCache'
    },
    
    // 默認數據
    defaults: {
        user: {
            profile: {
                name: "健身勇者",
                avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
                email: "user@fitness.com"
            },
            stats: {
                level: 1,
                XP: 0,
                flowState: 0,
                currentWeight: 72,
                bodyFat: 18
            },
            progress: {
                checkinDays: [],
                workoutHistory: [],
                dietHistory: [],
                unlockedAchievements: [],
                avatarItems: ['basic']
            },
            tasks: {
                todayTasks: []
            },
            leaderboardSnapshot: {
                XP: 0,
                checkinStreak: 0,
                taskCompletionRate: 0
            }
        }
    }
};

// 導出配置（支援ES6模組和CommonJS）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppConfig;
}
if (typeof window !== 'undefined') {
    window.AppConfig = AppConfig;
} 