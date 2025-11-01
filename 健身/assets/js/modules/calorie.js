/**
 * CalorieCalculatorModule - 熱量計算機
 * 計算BMR與TDEE，依活動等級顯示每日消耗熱量
 */
class CalorieCalculatorModule {
    constructor(containerId = 'calorieCalculator') {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        this.init();
    }

    /**
     * 初始化
     */
    init() {
        this.renderForm();
        this.bindEvents();
        this.renderResult();
    }

    /**
     * 渲染表單
     */
    renderForm() {
        this.container.innerHTML = `
        <div class="calorie-calculator">
            <!-- 標題區域 -->
            <div class="calorie-header">
                <div class="calorie-title">
                    <div class="pixel-icon">🔥</div>
                    <h2>熱量消耗計算機</h2>
                </div>
                <div class="calorie-subtitle">計算您的基礎代謝率與每日總消耗熱量</div>
            </div>

            <!-- 表單區域 -->
            <div class="calorie-form-container">
                <form id="calorieForm" class="calorie-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="pixel-label">
                                <span class="label-icon">👤</span>
                                性別
                            </label>
                            <select id="calorieGender" class="pixel-select" required>
                                <option value="male">男性</option>
                                <option value="female">女性</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="pixel-label">
                                <span class="label-icon">🎂</span>
                                年齡
                            </label>
                            <input type="number" id="calorieAge" class="pixel-input" 
                                   min="10" max="100" value="25" required>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="pixel-label">
                                <span class="label-icon">📏</span>
                                身高 (cm)
                            </label>
                            <input type="number" id="calorieHeight" class="pixel-input" 
                                   min="100" max="250" value="170" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="pixel-label">
                                <span class="label-icon">⚖️</span>
                                體重 (kg)
                            </label>
                            <input type="number" id="calorieWeight" class="pixel-input" 
                                   min="30" max="200" value="65" required>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button class="pixel-btn calculate-btn" type="submit">
                            <span class="btn-icon">🧮</span>
                            計算熱量消耗
                        </button>
                    </div>
                </form>
            </div>

            <!-- 結果區域 -->
            <div id="calorieResult" class="calorie-result"></div>
        </div>
        `;
    }

    /**
     * 綁定事件
     */
    bindEvents() {
        this.container.querySelector('#calorieForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.renderResult();
        });

        // 添加輸入框動畫效果
        const inputs = this.container.querySelectorAll('.pixel-input, .pixel-select');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
            });
            input.addEventListener('blur', () => {
                input.parentElement.classList.remove('focused');
            });
        });
    }

    /**
     * 計算BMR
     */
    calcBMR({gender, age, height, weight}) {
        if (gender === 'male') {
            return 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
            return 10 * weight + 6.25 * height - 5 * age - 161;
        }
    }

    /**
     * 活動等級資料
     */
    getActivityLevels() {
        return [
            { 
                label: '久坐不動', 
                factor: 1.2, 
                desc: '幾乎不運動，整天坐著',
                icon: '🛋️',
                color: '#ff6b6b'
            },
            { 
                label: '輕度運動', 
                factor: 1.375, 
                desc: '一週運動1-3天，輕度活動',
                icon: '🚶',
                color: '#4ecdc4'
            },
            { 
                label: '中度運動', 
                factor: 1.55, 
                desc: '一週運動3-5天，中等強度',
                icon: '🏃',
                color: '#45b7d1'
            },
            { 
                label: '高度運動', 
                factor: 1.725, 
                desc: '一週運動6-7天，高強度訓練',
                icon: '💪',
                color: '#96ceb4'
            }
        ];
    }

    /**
     * 渲染結果
     */
    renderResult() {
        // 取得表單值
        const gender = this.container.querySelector('#calorieGender').value;
        const age = parseInt(this.container.querySelector('#calorieAge').value, 10);
        const height = parseInt(this.container.querySelector('#calorieHeight').value, 10);
        const weight = parseInt(this.container.querySelector('#calorieWeight').value, 10);
        const bmr = Math.round(this.calcBMR({gender, age, height, weight}));
        const activityLevels = this.getActivityLevels();

        let html = `
        <div class="result-container">
            <!-- BMR 顯示 -->
            <div class="bmr-display">
                <div class="bmr-icon">⚡</div>
                <div class="bmr-content">
                    <div class="bmr-label">基礎代謝率 (BMR)</div>
                    <div class="bmr-value">${bmr.toLocaleString()}</div>
                    <div class="bmr-unit">kcal/天</div>
                </div>
            </div>

            <!-- 活動等級表格 -->
            <div class="activity-levels">
                <h3 class="levels-title">每日總消耗熱量 (TDEE)</h3>
                <div class="levels-grid">
        `;

        activityLevels.forEach((level, index) => {
            const tdee = Math.round(bmr * level.factor);
            html += `
            <div class="level-card" style="animation-delay: ${index * 0.1}s">
                <div class="level-header">
                    <div class="level-icon">${level.icon}</div>
                    <div class="level-info">
                        <div class="level-name">${level.label}</div>
                        <div class="level-desc">${level.desc}</div>
                    </div>
                </div>
                <div class="level-calories">
                    <div class="calories-value">${tdee.toLocaleString()}</div>
                    <div class="calories-unit">kcal/天</div>
                </div>
                <div class="level-bar" style="background: ${level.color}"></div>
            </div>
            `;
        });

        html += `
                </div>
            </div>

            <!-- 建議區域 -->
            <div class="calorie-tips">
                <div class="tips-header">
                    <span class="tips-icon">💡</span>
                    <span>健康建議</span>
                </div>
                <div class="tips-content">
                    <p>• 減重目標：每日攝取熱量比TDEE少300-500卡路里</p>
                    <p>• 增重目標：每日攝取熱量比TDEE多300-500卡路里</p>
                    <p>• 維持體重：攝取熱量等於TDEE</p>
                </div>
            </div>
        </div>
        `;

        const resultContainer = this.container.querySelector('#calorieResult');
        resultContainer.innerHTML = html;
        resultContainer.classList.add('show');
    }
}

// 自動掛載
if (document.getElementById('calorieCalculator')) {
    window.calorieCalculatorModule = new CalorieCalculatorModule();
}
if (typeof window !== 'undefined') {
    window.CalorieCalculatorModule = CalorieCalculatorModule;
} 