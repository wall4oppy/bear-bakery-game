/**
 * FitnessPro 主應用
 * 整合所有功能模組
 */
class FitnessApp {
    constructor() {
        this.config = window.AppConfig;
        this.storage = window.storage;
        this.helpers = window.Helpers;
        
        this.modules = {};
        this.charts = {};
        this.userData = null;
        
        this.init();
    }

    /**
     * 初始化應用
     */
    async init() {
        try {
            console.log('FitnessPro App 初始化中...');
            
            // 載入用戶數據
            this.loadUserData();
            
            // 初始化模組
            this.initModules();
            
            // 綁定事件
            this.bindEvents();
            
            // 初始化UI
            this.initUI();
            
            // 初始化圖表
            setTimeout(() => {
                this.initCharts();
            }, 100);
            
            // 啟動定期任務
            this.startPeriodicTasks();
            
            console.log('FitnessPro App 初始化完成');
            
        } catch (error) {
            console.error('應用初始化失敗:', error);
        }
    }

    /**
     * 載入用戶數據
     */
    loadUserData() {
        this.userData = this.storage.get('userData', this.config.defaults.user);
        
        // 合併默認數據，確保所有必要字段存在
        this.userData = this.helpers.merge({}, this.config.defaults.user, this.userData);
        
        // 保存更新的數據
        this.saveUserData();
    }

    /**
     * 保存用戶數據
     */
    saveUserData() {
        this.storage.set('userData', this.userData);
        
        // 如果Firebase同步已啟用，同步到雲端
        if (window.firebaseUserManager && window.firebaseUserManager.syncEnabled) {
            window.firebaseUserManager.saveUserData(this.userData);
        }
    }

    /**
     * 初始化模組
     */
    initModules() {
        // 簽到模組已在 checkin.js 中自動初始化
        if (window.checkinModule) {
            this.modules.checkin = window.checkinModule;
            
            // 監聽簽到事件
            this.modules.checkin.events.addEventListener('checkin', (e) => {
                this.handleCheckinEvent(e.detail);
            });
            
            this.modules.checkin.events.addEventListener('levelup', (e) => {
                this.handleLevelUpEvent(e.detail);
            });
            
            this.modules.checkin.events.addEventListener('achievement', (e) => {
                this.handleAchievementEvent(e.detail);
            });
        }

        // 初始化新模組
        this.initNewModules();
    }

    /**
     * 初始化新模組
     */
    initNewModules() {
        // Avatar模組
        if (window.avatarModule) {
            this.modules.avatar = window.avatarModule;
            console.log('Avatar模組已初始化');
        }

        // 成就模組
        if (window.achievementModule) {
            this.modules.achievement = window.achievementModule;
            console.log('成就模組已初始化');
        }

        // 飲食模組
        if (window.mealModule) {
            this.modules.meal = window.mealModule;
            console.log('飲食模組已初始化');
        }

        // 排行榜模組
        if (window.leaderboardModule) {
            this.modules.leaderboard = window.leaderboardModule;
            console.log('排行榜模組已初始化');
        }

        // Firebase模組
        if (window.firebaseUserManager) {
            this.modules.firebase = window.firebaseUserManager;
            console.log('Firebase模組已初始化');
        }

        // 主題模組
        if (window.themeModule) {
            this.modules.theme = window.themeModule;
            console.log('主題模組已初始化');
        }
    }

    /**
     * 綁定事件
     */
    bindEvents() {
        // 導航切換
        document.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem) {
                const tab = navItem.dataset.tab;
                if (tab) {
                    this.switchTab(tab);
                }
            }
        });

        // 生成任務按鈕
        document.addEventListener('click', (e) => {
            if (e.target.id === 'generateTasksBtn' || e.target.closest('#generateTasksBtn')) {
                e.preventDefault();
                this.generateDailyTasks();
            }
        });

        // 關閉升級彈窗
        document.addEventListener('click', (e) => {
            if (e.target.id === 'closeLevelUpBtn' || e.target.closest('#closeLevelUpBtn')) {
                e.preventDefault();
                this.closeLevelUpModal();
            }
        });

        // 任務點擊
        document.addEventListener('click', (e) => {
            const taskCheckbox = e.target.closest('.task-checkbox');
            if (taskCheckbox) {
                const taskIndex = Array.from(taskCheckbox.parentNode.parentNode.children).indexOf(taskCheckbox.parentNode);
                this.toggleTask(taskIndex);
            }
        });

        // 雲端同步按鈕
        document.addEventListener('click', (e) => {
            if (e.target.id === 'enableSyncBtn' || e.target.closest('#enableSyncBtn')) {
                e.preventDefault();
                this.toggleCloudSync();
            }
            
            if (e.target.id === 'backupDataBtn' || e.target.closest('#backupDataBtn')) {
                e.preventDefault();
                this.backupUserData();
            }
            
            if (e.target.id === 'restoreDataBtn' || e.target.closest('#restoreDataBtn')) {
                e.preventDefault();
                this.showRestoreOptions();
            }
        });

        // 網路狀態監控
        window.addEventListener('online', () => this.updateNetworkStatus());
        window.addEventListener('offline', () => this.updateNetworkStatus());

        // 頁面可見性變化
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.onPageVisible();
            }
        });

        // 觸摸手勢支持
        this.initTouchGestures();

        // 監聽模組事件
        this.bindModuleEvents();
    }

    /**
     * 綁定模組事件
     */
    bindModuleEvents() {
        // 監聽等級變化事件
        document.addEventListener('levelUp', (e) => {
            this.handleLevelUpEvent(e.detail);
        });

        // 監聽成就解鎖事件
        document.addEventListener('achievementUnlocked', (e) => {
            this.handleAchievementUnlocked(e.detail);
        });

        // 監聽飲食添加事件
        document.addEventListener('mealAdded', (e) => {
            this.handleMealAdded(e.detail);
        });

        // 監聽簽到完成事件
        document.addEventListener('checkinCompleted', (e) => {
            this.handleCheckinCompleted(e.detail);
        });

        // 監聽任務完成事件
        document.addEventListener('taskCompleted', (e) => {
            this.handleTaskCompleted(e.detail);
        });

        // 監聽主題變更事件
        document.addEventListener('themeChanged', (e) => {
            this.handleThemeChanged(e.detail);
        });
    }

    /**
     * 初始化UI
     */
    initUI() {
        this.updateUI();
        this.generateDailyTasks();
        this.updateNetworkStatus();
    }

    /**
     * 更新UI
     */
    updateUI() {
        // 更新用戶信息
        const userAvatar = document.getElementById('userAvatar');
        const userLevel = document.getElementById('userLevel');
        const welcomeText = document.getElementById('welcomeText');
        const checkinStreak = document.getElementById('checkinStreak');

        if (userAvatar) userAvatar.src = this.userData.profile.avatarUrl;
        if (userLevel) userLevel.textContent = `LV ${this.userData.stats.level}`;
        if (welcomeText) welcomeText.textContent = this.helpers.getWelcomeMessage();
        if (checkinStreak) checkinStreak.textContent = this.userData.leaderboardSnapshot.checkinStreak || 0;

        // 更新簽到信息
        const checkinDays = document.getElementById('checkinDays');
        if (checkinDays) checkinDays.textContent = this.userData.progress.checkinDays.length;

        // 更新XP信息
        this.updateXPInfo();

        // 更新Flow狀態
        this.updateFlowState();

        // 更新任務列表
        this.renderTasks();

        // 更新雲端同步狀態
        this.updateCloudSyncStatus();
    }

    /**
     * 更新XP信息
     */
    updateXPInfo() {
        const currentXP = document.getElementById('currentXP');
        const nextLevelXP = document.getElementById('nextLevelXP');
        
        if (currentXP && nextLevelXP) {
            const nextLevelXPRequired = this.userData.stats.level * this.config.game.xpPerLevel;
            currentXP.textContent = `${this.userData.stats.XP} XP`;
            nextLevelXP.textContent = `/ ${nextLevelXPRequired} XP`;
        }
    }

    /**
     * 更新Flow狀態
     */
    updateFlowState() {
        const flowPercentage = document.getElementById('flowPercentage');
        if (flowPercentage) {
            flowPercentage.textContent = `${this.userData.stats.flowState}%`;
        }
    }

    /**
     * 初始化圖表
     */
    initCharts() {
        this.initXPChart();
        this.initFlowChart();
        this.initNutritionChart();
    }

    /**
     * 初始化XP圖表
     */
    initXPChart() {
        const ctx = document.getElementById('xpChart');
        if (!ctx) return;

        const nextLevelXP = this.userData.stats.level * this.config.game.xpPerLevel;
        
        this.charts.xp = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [this.userData.stats.XP, nextLevelXP - this.userData.stats.XP],
                    backgroundColor: [this.config.ui.chartColors.primary, '#f1f3f4'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '80%',
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    /**
     * 初始化Flow圖表
     */
    initFlowChart() {
        const ctx = document.getElementById('flowChart');
        if (!ctx) return;

        this.charts.flow = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [this.userData.stats.flowState, 100 - this.userData.stats.flowState],
                    backgroundColor: [this.config.ui.chartColors.accent, '#f1f3f4'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '80%',
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    /**
     * 初始化營養圖表
     */
    initNutritionChart() {
        const ctx = document.getElementById('nutritionChart');
        if (!ctx) return;

        this.charts.nutrition = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['蛋白質', '碳水化合物', '脂肪'],
                datasets: [{
                    data: [30, 45, 25],
                    backgroundColor: [
                        this.config.ui.chartColors.primary,
                        this.config.ui.chartColors.secondary,
                        '#f093fb'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { font: { size: 12 } }
                    }
                }
            }
        });
    }

    /**
     * 更新圖表
     */
    updateCharts() {
        if (this.charts.xp) {
            const nextLevelXP = this.userData.stats.level * this.config.game.xpPerLevel;
            this.charts.xp.data.datasets[0].data = [
                this.userData.stats.XP, 
                nextLevelXP - this.userData.stats.XP
            ];
            this.charts.xp.update();
        }

        if (this.charts.flow) {
            this.charts.flow.data.datasets[0].data = [
                this.userData.stats.flowState, 
                100 - this.userData.stats.flowState
            ];
            this.charts.flow.update();
        }
    }

    /**
     * 切換頁籤
     */
    switchTab(tab) {
        // 隱藏所有內容
        document.querySelectorAll('.main-content').forEach(content => {
            content.classList.remove('active');
        });

        // 顯示選中的內容
        const targetContent = document.getElementById(tab + 'Content');
        if (targetContent) {
            targetContent.classList.add('active');
        }

        // 更新導航狀態
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        const activeNavItem = document.querySelector(`[data-tab="${tab}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        // 根據標籤初始化對應模組
        this.initTabModules(tab);
    }

    /**
     * 根據標籤初始化對應模組
     */
    initTabModules(tab) {
        switch (tab) {
            case 'avatar':
                if (this.modules.avatar) {
                    this.modules.avatar.init();
                }
                break;
            case 'diet':
                if (this.modules.meal) {
                    this.modules.meal.init();
                }
                break;
            case 'leaderboard':
                if (this.modules.leaderboard) {
                    this.modules.leaderboard.init();
                }
                break;
            case 'workout':
                // workout模組已在workout.js中自動初始化
                break;
            case 'calorie':
                // calorie模組已在calorie.js中自動初始化
                break;
        }
    }

    /**
     * 生成每日任務
     */
    generateDailyTasks() {
        const taskTemplates = [
            { title: "喝 8 杯水", type: "hydration", completed: false },
            { title: "完成 30 分鐘有氧運動", type: "cardio", completed: false },
            { title: "攝取 100g 蛋白質", type: "nutrition", completed: false },
            { title: "步行 10,000 步", type: "walking", completed: false },
            { title: "冥想 10 分鐘", type: "meditation", completed: false },
            { title: "做 50 個深蹲", type: "strength", completed: false },
            { title: "睡眠 7-8 小時", type: "sleep", completed: false }
        ];

        // 隨機選擇3個任務
        const todayTasks = this.helpers.randomSelect(taskTemplates, 3);
        this.userData.tasks.todayTasks = todayTasks;
        
        this.renderTasks();
        this.saveUserData();
    }

    /**
     * 渲染任務列表
     */
    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        if (!tasksList) return;

        tasksList.innerHTML = '';

        this.userData.tasks.todayTasks.forEach((task, index) => {
            const taskItem = document.createElement('li');
            taskItem.className = 'task-item';
            taskItem.innerHTML = `
                <div class="task-checkbox ${task.completed ? 'completed' : ''}" 
                     data-index="${index}"></div>
                <div class="task-text ${task.completed ? 'completed' : ''}">${task.title}</div>
            `;
            tasksList.appendChild(taskItem);
        });
    }

    /**
     * 切換任務狀態
     */
    toggleTask(index) {
        const task = this.userData.tasks.todayTasks[index];
        if (!task) return;

        task.completed = !task.completed;

        if (task.completed) {
            // 完成任務獲得XP和Flow
            this.userData.stats.XP += this.config.game.taskXP;
            this.userData.stats.flowState = Math.min(100, this.userData.stats.flowState + this.config.game.flowIncrement);

            // 檢查升級
            this.checkLevelUp();
        } else {
            // 取消完成減少Flow
            this.userData.stats.flowState = Math.max(0, this.userData.stats.flowState - this.config.game.flowIncrement);
        }

        this.renderTasks();
        this.updateUI();
        this.saveUserData();
    }

    /**
     * 檢查升級
     */
    checkLevelUp() {
        const currentLevel = this.userData.stats.level;
        const requiredXP = currentLevel * this.config.game.xpPerLevel;

        if (this.userData.stats.XP >= requiredXP) {
            this.userData.stats.level++;
            this.userData.stats.XP = this.userData.stats.XP - requiredXP;
            
            this.showLevelUpModal(this.userData.stats.level);
            return true;
        }

        return false;
    }

    /**
     * 顯示升級彈窗
     */
    showLevelUpModal(newLevel) {
        const modal = document.getElementById('levelUpModal');
        const levelUpText = document.getElementById('levelUpText');
        
        if (modal && levelUpText) {
            levelUpText.textContent = `您已達到等級 ${newLevel}！`;
            modal.classList.add('show');
        }
    }

    /**
     * 關閉升級彈窗
     */
    closeLevelUpModal() {
        const modal = document.getElementById('levelUpModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    /**
     * 載入食譜 (已移至 meal.js 模組)
     */
    loadRecipes() {
        // 此功能已移至 meal.js 模組處理
        console.log('食譜載入功能已移至 meal.js 模組');
    }

    /**
     * 添加到飲食 (已移至 meal.js 模組)
     */
    addToMeal(recipeName) {
        // 此功能已移至 meal.js 模組處理
        console.log('添加飲食功能已移至 meal.js 模組');
    }

    /**
     * 載入排行榜 (已移至 leaderboard.js 模組)
     */
    loadLeaderboard() {
        // 此功能已移至 leaderboard.js 模組處理
        console.log('排行榜載入功能已移至 leaderboard.js 模組');
    }

    /**
     * 載入成就 (已移至 achievement.js 模組)
     */
    loadAchievements() {
        // 此功能已移至 achievement.js 模組處理
        console.log('成就載入功能已移至 achievement.js 模組');
    }

    /**
     * 更新Avatar (已移至 avatar.js 模組)
     */
    updateAvatar() {
        // 此功能已移至 avatar.js 模組處理
        console.log('Avatar更新功能已移至 avatar.js 模組');
    }

    /**
     * 更新網路狀態
     */
    updateNetworkStatus() {
        const banner = document.getElementById('offlineBanner');
        if (!banner) return;

        if (this.helpers.isOnline()) {
            banner.style.display = 'none';
        } else {
            banner.style.display = 'block';
        }
    }

    /**
     * 頁面可見時的處理
     */
    onPageVisible() {
        this.updateUI();
        this.updateNetworkStatus();
    }

    /**
     * 初始化觸摸手勢
     */
    initTouchGestures() {
        if (!this.helpers.isTouchDevice()) return;

        let startY = 0;
        
        document.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
        });

        document.addEventListener('touchmove', (e) => {
            const currentY = e.touches[0].clientY;
            const diff = startY - currentY;

            // 下拉刷新
            if (diff < -100 && window.scrollY === 0) {
                location.reload();
            }
        });
    }

    /**
     * 啟動定期任務
     */
    startPeriodicTasks() {
        // 自動保存
        setInterval(() => {
            this.saveUserData();
        }, this.config.app.saveInterval);

        // 定期更新時間相關信息
        setInterval(() => {
            if (!document.hidden) {
                const welcomeText = document.getElementById('welcomeText');
                if (welcomeText) {
                    welcomeText.textContent = this.helpers.getWelcomeMessage();
                }
            }
        }, 60000); // 每分鐘檢查一次
    }

    /**
     * 處理簽到事件
     */
    handleCheckinEvent(detail) {
        this.userData = detail.userData;
        this.updateUI();
    }

    /**
     * 處理升級事件
     */
    handleLevelUpEvent(detail) {
        const { newLevel, oldLevel } = detail;
        
        // 更新用戶資料
        this.userData.stats.level = newLevel;
        this.saveUserData();

        // 顯示升級動畫
        this.showLevelUpModal(newLevel);

        // 更新Avatar（如果模組存在）
        if (this.modules.avatar) {
            this.modules.avatar.updateLevel(newLevel);
        }

        // 更新排行榜快照
        if (window.firebaseUserManager && window.firebaseUserManager.syncEnabled) {
            window.firebaseUserManager.updateLeaderboardSnapshot(this.userData);
        }
    }

    /**
     * 處理成就事件
     */
    handleAchievementEvent(detail) {
        this.userData = detail.userData;
        this.loadAchievements();
        this.showMessage(`🎉 成就解鎖：${detail.achievement.title}`, 'success');
    }

    /**
     * 處理成就解鎖事件
     */
    handleAchievementUnlocked(detail) {
        const { achievement } = detail;
        
        // 更新用戶資料
        if (!this.userData.progress.unlockedAchievements) {
            this.userData.progress.unlockedAchievements = [];
        }
        this.userData.progress.unlockedAchievements.push(achievement.id);
        
        // 增加XP獎勵
        this.userData.stats.xp += achievement.xpReward;
        this.saveUserData();

        // 檢查是否升級
        this.checkLevelUp();

        this.showMessage(`成就解鎖：${achievement.title}！獲得 ${achievement.xpReward} XP`, 'success');
    }

    /**
     * 處理飲食添加事件
     */
    handleMealAdded(detail) {
        const { meal } = detail;
        
        // 更新用戶資料
        if (!this.userData.progress.mealHistory) {
            this.userData.progress.mealHistory = [];
        }
        this.userData.progress.mealHistory.unshift(meal);
        
        // 限制歷史記錄數量
        if (this.userData.progress.mealHistory.length > 30) {
            this.userData.progress.mealHistory = this.userData.progress.mealHistory.slice(0, 30);
        }
        
        this.saveUserData();

        // 更新營養圖表
        this.updateNutritionChart();
    }

    /**
     * 處理簽到完成事件
     */
    handleCheckinCompleted(detail) {
        // 更新連續簽到天數
        this.userData.leaderboardSnapshot.checkinStreak = detail.streak;
        this.saveUserData();

        // 檢查成就
        if (this.modules.achievement) {
            this.modules.achievement.checkAchievements();
        }
    }

    /**
     * 處理任務完成事件
     */
    handleTaskCompleted(detail) {
        // 更新心流狀態
        this.userData.stats.flowState += 10;
        if (this.userData.stats.flowState > 100) {
            this.userData.stats.flowState = 100;
        }
        
        this.saveUserData();
        this.updateFlowState();

        // 檢查成就
        if (this.modules.achievement) {
            this.modules.achievement.checkAchievements();
        }
    }

    /**
     * 處理主題變更事件
     */
    handleThemeChanged(detail) {
        const { theme, themeData } = detail;
        
        // 更新圖表顏色（如果圖表存在）
        this.updateChartColors(themeData);
        
        // 更新UI元素顏色
        this.updateUITheme(themeData);
        
        console.log('主題已變更為:', theme);
    }

    /**
     * 更新圖表顏色
     */
    updateChartColors(themeData) {
        // 更新XP圖表
        if (this.charts.xp) {
            this.charts.xp.data.datasets[0].backgroundColor = [
                themeData.primaryColor,
                themeData.secondaryColor
            ];
            this.charts.xp.update();
        }

        // 更新Flow圖表
        if (this.charts.flow) {
            this.charts.flow.data.datasets[0].backgroundColor = [
                themeData.accentColor,
                '#f1f3f4'
            ];
            this.charts.flow.update();
        }

        // 更新營養圖表
        if (this.charts.nutrition) {
            this.charts.nutrition.data.datasets[0].backgroundColor = [
                themeData.primaryColor,
                themeData.secondaryColor,
                themeData.accentColor
            ];
            this.charts.nutrition.update();
        }
    }

    /**
     * 更新UI主題
     */
    updateUITheme(themeData) {
        // 更新按鈕顏色
        const buttons = document.querySelectorAll('.btn:not(.btn-secondary)');
        buttons.forEach(btn => {
            btn.style.background = themeData.primaryColor;
        });

        // 更新卡片背景
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.style.background = themeData.cardBackground;
        });

        // 更新導覽列活動狀態
        const activeNav = document.querySelector('.nav-item.active');
        if (activeNav) {
            activeNav.style.color = themeData.primaryColor;
        }
    }

    /**
     * 顯示消息
     */
    showMessage(message, type = 'info') {
        if (this.modules.checkin && this.modules.checkin.showMessage) {
            this.modules.checkin.showMessage(message, type);
        }
    }

    /**
     * 切換雲端同步
     */
    async toggleCloudSync() {
        if (!window.firebaseUserManager) {
            this.showMessage('Firebase未初始化', 'error');
            return;
        }

        if (window.firebaseUserManager.syncEnabled) {
            window.firebaseUserManager.disableSync();
            this.showMessage('雲端同步已停用', 'info');
        } else {
            const success = window.firebaseUserManager.enableSync();
            if (success) {
                this.showMessage('雲端同步已啟用', 'success');
                // 立即同步當前資料
                await window.firebaseUserManager.syncToCloud();
            } else {
                this.showMessage('啟用雲端同步失敗', 'error');
            }
        }

        this.updateCloudSyncStatus();
    }

    /**
     * 備份用戶資料
     */
    async backupUserData() {
        if (!window.firebaseUserManager) {
            this.showMessage('Firebase未初始化', 'error');
            return;
        }

        try {
            const success = await window.firebaseUserManager.backupUserData();
            if (success) {
                this.showMessage('資料備份成功', 'success');
            } else {
                this.showMessage('資料備份失敗', 'error');
            }
        } catch (error) {
            this.showMessage('備份過程發生錯誤', 'error');
        }
    }

    /**
     * 顯示恢復選項
     */
    async showRestoreOptions() {
        if (!window.firebaseUserManager) {
            this.showMessage('Firebase未初始化', 'error');
            return;
        }

        try {
            const backups = await window.firebaseUserManager.getBackupList();
            if (backups.length === 0) {
                this.showMessage('沒有可用的備份', 'info');
                return;
            }

            // 創建備份選擇模態框
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <h3>選擇要恢復的備份</h3>
                    <div class="backup-list">
                        ${backups.map(backup => `
                            <div class="backup-item" data-backup-id="${backup.id}">
                                <div class="backup-date">${new Date(backup.timestamp).toLocaleString()}</div>
                                <div class="backup-version">版本: ${backup.version}</div>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn btn-secondary" id="cancelRestoreBtn">取消</button>
                </div>
            `;

            document.body.appendChild(modal);
            setTimeout(() => modal.classList.add('show'), 100);

            // 綁定備份選擇事件
            modal.addEventListener('click', async (e) => {
                const backupItem = e.target.closest('.backup-item');
                if (backupItem) {
                    const backupId = backupItem.dataset.backupId;
                    const success = await window.firebaseUserManager.restoreUserData(backupId);
                    if (success) {
                        this.showMessage('資料恢復成功', 'success');
                        // 重新載入頁面以應用恢復的資料
                        location.reload();
                    } else {
                        this.showMessage('資料恢復失敗', 'error');
                    }
                    modal.remove();
                }

                if (e.target.id === 'cancelRestoreBtn') {
                    modal.remove();
                }
            });

        } catch (error) {
            this.showMessage('取得備份列表失敗', 'error');
        }
    }
}

// 初始化應用
document.addEventListener('DOMContentLoaded', () => {
    window.fitnessApp = new FitnessApp();
});

// 導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FitnessApp;
}
if (typeof window !== 'undefined') {
    window.FitnessApp = FitnessApp;
} 