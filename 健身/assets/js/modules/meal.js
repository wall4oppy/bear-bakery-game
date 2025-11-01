/**
 * MealModule - 飲食推薦與營養追蹤
 * 管理食譜推薦、營養圓餅圖與飲食紀錄
 */
class MealModule {
    constructor(containerId = 'mealContainer') {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        this.currentMeal = null;
        this.mealHistory = [];
        this.chart = null;
        
        this.init();
    }

    /**
     * 初始化
     */
    init() {
        this.loadMealHistory();
        this.renderMealRecommendation();
        this.bindEvents();
        this.initNutritionChart();
    }

    /**
     * 食譜資料庫
     */
    getMealDatabase() {
        return [
            {
                id: 'meal_1',
                name: '雞胸肉沙拉',
                category: '減重餐',
                calories: 320,
                protein: 35,
                carbs: 15,
                fat: 12,
                fiber: 8,
                image: '🥗',
                ingredients: ['雞胸肉', '生菜', '番茄', '橄欖油'],
                description: '高蛋白低脂的完美減重餐'
            },
            {
                id: 'meal_2',
                name: '鮭魚糙米飯',
                category: '增肌餐',
                calories: 450,
                protein: 28,
                carbs: 45,
                fat: 18,
                fiber: 6,
                image: '🍚',
                ingredients: ['鮭魚', '糙米', '花椰菜', '檸檬'],
                description: '富含Omega-3的增肌營養餐'
            },
            {
                id: 'meal_3',
                name: '希臘優格碗',
                category: '早餐',
                calories: 280,
                protein: 20,
                carbs: 25,
                fat: 8,
                fiber: 4,
                image: '🥣',
                ingredients: ['希臘優格', '藍莓', '堅果', '蜂蜜'],
                description: '清爽營養的早餐選擇'
            },
            {
                id: 'meal_4',
                name: '藜麥雞肉碗',
                category: '均衡餐',
                calories: 380,
                protein: 32,
                carbs: 35,
                fat: 14,
                fiber: 7,
                image: '🥙',
                ingredients: ['藜麥', '雞肉', '蔬菜', '酪梨'],
                description: '超級食物藜麥的完美搭配'
            },
            {
                id: 'meal_5',
                name: '豆腐蔬菜湯',
                category: '素食',
                calories: 220,
                protein: 15,
                carbs: 20,
                fat: 6,
                fiber: 10,
                image: '🍲',
                ingredients: ['豆腐', '蔬菜', '香菇', '海帶'],
                description: '低卡高纖的素食選擇'
            },
            {
                id: 'meal_6',
                name: '燕麥蛋白粉',
                category: '運動後',
                calories: 310,
                protein: 25,
                carbs: 40,
                fat: 5,
                fiber: 6,
                image: '🥤',
                ingredients: ['燕麥', '蛋白粉', '香蕉', '牛奶'],
                description: '運動後快速補充營養'
            },
            {
                id: 'meal_7',
                name: '烤蔬菜雞胸',
                category: '減脂餐',
                calories: 290,
                protein: 38,
                carbs: 18,
                fat: 8,
                fiber: 9,
                image: '🍗',
                ingredients: ['雞胸肉', '彩椒', '洋蔥', '香料'],
                description: '無油烤製的健康選擇'
            },
            {
                id: 'meal_8',
                name: '堅果能量棒',
                category: '點心',
                calories: 180,
                protein: 8,
                carbs: 22,
                fat: 12,
                fiber: 3,
                image: '🍫',
                ingredients: ['堅果', '燕麥', '蜂蜜', '巧克力'],
                description: '天然能量補充'
            }
        ];
    }

    /**
     * 載入飲食紀錄
     */
    loadMealHistory() {
        const userData = StorageManager.getUserData();
        this.mealHistory = userData.mealHistory || [];
    }

    /**
     * 儲存飲食紀錄
     */
    saveMealHistory() {
        const userData = StorageManager.getUserData();
        userData.mealHistory = this.mealHistory;
        StorageManager.saveUserData(userData);
    }

    /**
     * 渲染食譜推薦
     */
    renderMealRecommendation() {
        const meal = this.getRandomMeal();
        this.currentMeal = meal;
        
        this.container.innerHTML = `
            <div class="meal-recommendation">
                <div class="meal-header">
                    <h3>今日推薦食譜</h3>
                    <button class="refresh-meal-btn" id="refreshMeal">
                        <span class="refresh-icon">🔄</span>
                        換一個
                    </button>
                </div>
                
                <div class="meal-card">
                    <div class="meal-image">${meal.image}</div>
                    <div class="meal-info">
                        <div class="meal-name">${meal.name}</div>
                        <div class="meal-category">${meal.category}</div>
                        <div class="meal-description">${meal.description}</div>
                        <div class="meal-calories">${meal.calories} 卡路里</div>
                    </div>
                </div>
                
                <div class="meal-details">
                    <div class="meal-ingredients">
                        <h4>食材：</h4>
                        <div class="ingredients-list">
                            ${meal.ingredients.map(ingredient => 
                                `<span class="ingredient-tag">${ingredient}</span>`
                            ).join('')}
                        </div>
                    </div>
                    
                    <div class="meal-nutrition">
                        <h4>營養成分：</h4>
                        <div class="nutrition-grid">
                            <div class="nutrition-item">
                                <span class="nutrition-label">蛋白質</span>
                                <span class="nutrition-value">${meal.protein}g</span>
                            </div>
                            <div class="nutrition-item">
                                <span class="nutrition-label">碳水化合物</span>
                                <span class="nutrition-value">${meal.carbs}g</span>
                            </div>
                            <div class="nutrition-item">
                                <span class="nutrition-label">脂肪</span>
                                <span class="nutrition-value">${meal.fat}g</span>
                            </div>
                            <div class="nutrition-item">
                                <span class="nutrition-label">纖維</span>
                                <span class="nutrition-value">${meal.fiber}g</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="meal-actions">
                    <button class="meal-action-btn primary" id="addToHistory">
                        <span class="btn-icon">📝</span>
                        加入飲食紀錄
                    </button>
                    <button class="meal-action-btn secondary" id="viewHistory">
                        <span class="btn-icon">📊</span>
                        查看紀錄
                    </button>
                </div>
            </div>
            
            <div class="nutrition-chart-container">
                <h3>營養分布</h3>
                <canvas id="nutritionChart" width="300" height="300"></canvas>
            </div>
        `;
        
        this.updateNutritionChart();
    }

    /**
     * 取得隨機食譜
     */
    getRandomMeal() {
        const meals = this.getMealDatabase();
        const randomIndex = Math.floor(Math.random() * meals.length);
        return meals[randomIndex];
    }

    /**
     * 初始化營養圓餅圖
     */
    initNutritionChart() {
        const ctx = document.getElementById('nutritionChart');
        if (!ctx) return;
        
        this.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['蛋白質', '碳水化合物', '脂肪'],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: [
                        '#FF6B6B',
                        '#4ECDC4',
                        '#45B7D1'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }

    /**
     * 更新營養圓餅圖
     */
    updateNutritionChart() {
        if (!this.chart || !this.currentMeal) return;
        
        const { protein, carbs, fat } = this.currentMeal;
        this.chart.data.datasets[0].data = [protein, carbs, fat];
        this.chart.update('active');
    }

    /**
     * 加入飲食紀錄
     */
    addToHistory() {
        if (!this.currentMeal) return;
        
        const mealRecord = {
            ...this.currentMeal,
            date: new Date().toISOString(),
            timestamp: Date.now()
        };
        
        this.mealHistory.unshift(mealRecord);
        
        // 只保留最近30筆紀錄
        if (this.mealHistory.length > 30) {
            this.mealHistory = this.mealHistory.slice(0, 30);
        }
        
        this.saveMealHistory();
        this.showAddSuccess();
        
        // 發送事件通知其他模組
        document.dispatchEvent(new CustomEvent('mealAdded', {
            detail: { meal: mealRecord }
        }));
    }

    /**
     * 顯示加入成功動畫
     */
    showAddSuccess() {
        const notification = document.createElement('div');
        notification.className = 'meal-add-notification';
        notification.innerHTML = `
            <div class="meal-add-content">
                <div class="meal-add-icon">✅</div>
                <div class="meal-add-text">已加入飲食紀錄！</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 2000);
    }

    /**
     * 顯示飲食紀錄
     */
    showMealHistory() {
        const modal = document.createElement('div');
        modal.className = 'meal-history-modal';
        
        let historyHtml = `
            <div class="meal-history-content">
                <div class="meal-history-header">
                    <h3>飲食紀錄</h3>
                    <button class="meal-history-close">✕</button>
                </div>
                <div class="meal-history-list">
        `;
        
        if (this.mealHistory.length === 0) {
            historyHtml += '<div class="no-meals">還沒有飲食紀錄，快來添加吧！</div>';
        } else {
            this.mealHistory.forEach((meal, index) => {
                const date = new Date(meal.date).toLocaleDateString();
                historyHtml += `
                    <div class="meal-history-item">
                        <div class="meal-history-image">${meal.image}</div>
                        <div class="meal-history-info">
                            <div class="meal-history-name">${meal.name}</div>
                            <div class="meal-history-date">${date}</div>
                            <div class="meal-history-calories">${meal.calories} 卡路里</div>
                        </div>
                        <button class="meal-history-remove" data-index="${index}">🗑️</button>
                    </div>
                `;
            });
        }
        
        historyHtml += `
                </div>
            </div>
        `;
        
        modal.innerHTML = historyHtml;
        document.body.appendChild(modal);
        
        setTimeout(() => modal.classList.add('show'), 100);
        
        // 綁定關閉事件
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('meal-history-close')) {
                modal.classList.remove('show');
                setTimeout(() => {
                    if (document.body.contains(modal)) {
                        document.body.removeChild(modal);
                    }
                }, 300);
            }
        });
        
        // 綁定刪除事件
        modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('meal-history-remove')) {
                const index = parseInt(e.target.dataset.index);
                this.removeMealFromHistory(index);
                modal.remove();
                this.showMealHistory(); // 重新顯示
            }
        });
    }

    /**
     * 從紀錄中移除餐點
     */
    removeMealFromHistory(index) {
        this.mealHistory.splice(index, 1);
        this.saveMealHistory();
    }

    /**
     * 綁定事件
     */
    bindEvents() {
        this.container.addEventListener('click', (e) => {
            if (e.target.id === 'refreshMeal' || e.target.closest('#refreshMeal')) {
                this.renderMealRecommendation();
            } else if (e.target.id === 'addToHistory' || e.target.closest('#addToHistory')) {
                this.addToHistory();
            } else if (e.target.id === 'viewHistory' || e.target.closest('#viewHistory')) {
                this.showMealHistory();
            }
        });
    }

    /**
     * 取得今日營養總計
     */
    getTodayNutrition() {
        const today = new Date().toDateString();
        const todayMeals = this.mealHistory.filter(meal => 
            new Date(meal.date).toDateString() === today
        );
        
        return todayMeals.reduce((total, meal) => ({
            calories: total.calories + meal.calories,
            protein: total.protein + meal.protein,
            carbs: total.carbs + meal.carbs,
            fat: total.fat + meal.fat,
            fiber: total.fiber + meal.fiber
        }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
    }
}

// 自動掛載
if (document.getElementById('mealContainer')) {
    window.mealModule = new MealModule();
}
if (typeof window !== 'undefined') {
    window.MealModule = MealModule;
} 