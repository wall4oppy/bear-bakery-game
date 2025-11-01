/**
 * 主題管理模組
 * 處理主題配色切換和持久化
 */
class ThemeModule {
    constructor() {
        this.config = window.AppConfig;
        this.storage = window.storage;
        this.helpers = window.Helpers;
        
        this.currentTheme = 'default';
        this.themes = {
            default: {
                name: '經典藍紫',
                headerGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                bodyBackground: '#f8f9fa',
                primaryColor: '#667eea',
                secondaryColor: '#764ba2',
                accentColor: '#f093fb',
                textColor: '#333',
                cardBackground: '#fff'
            },
            ocean: {
                name: '海洋藍',
                headerGradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                bodyBackground: '#f0f8ff',
                primaryColor: '#4facfe',
                secondaryColor: '#00f2fe',
                accentColor: '#667eea',
                textColor: '#333',
                cardBackground: '#fff'
            },
            sunset: {
                name: '夕陽橙',
                headerGradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                bodyBackground: '#fff5f5',
                primaryColor: '#fa709a',
                secondaryColor: '#fee140',
                accentColor: '#ff6b6b',
                textColor: '#333',
                cardBackground: '#fff'
            },
            forest: {
                name: '森林綠',
                headerGradient: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)',
                bodyBackground: '#f0fff4',
                primaryColor: '#56ab2f',
                secondaryColor: '#a8e6cf',
                accentColor: '#4ade80',
                textColor: '#333',
                cardBackground: '#fff'
            },
            lavender: {
                name: '薰衣草',
                headerGradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                bodyBackground: '#faf5ff',
                primaryColor: '#a8edea',
                secondaryColor: '#fed6e3',
                accentColor: '#c084fc',
                textColor: '#333',
                cardBackground: '#fff'
            },
            coral: {
                name: '珊瑚粉',
                headerGradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                bodyBackground: '#fff0f6',
                primaryColor: '#ff9a9e',
                secondaryColor: '#fecfef',
                accentColor: '#fb7185',
                textColor: '#333',
                cardBackground: '#fff'
            }
        };
        
        this.init();
    }

    /**
     * 初始化模組
     */
    init() {
        console.log('主題模組初始化');
        this.loadTheme();
        this.bindEvents();
        this.applyTheme();
        this.updateThemeSelector();
    }

    /**
     * 載入保存的主題
     */
    loadTheme() {
        this.currentTheme = this.storage.get('selectedTheme', 'default');
        console.log('載入主題:', this.currentTheme);
    }

    /**
     * 保存主題設定
     */
    saveTheme() {
        this.storage.set('selectedTheme', this.currentTheme);
        console.log('保存主題:', this.currentTheme);
    }

    /**
     * 綁定事件
     */
    bindEvents() {
        document.addEventListener('click', (e) => {
            const themeOption = e.target.closest('.theme-option');
            if (themeOption) {
                const themeName = themeOption.dataset.theme;
                this.switchTheme(themeName);
            }
        });
    }

    /**
     * 切換主題
     */
    switchTheme(themeName) {
        if (!this.themes[themeName]) {
            console.error('未知主題:', themeName);
            return;
        }

        // 更新選中狀態
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
        });
        
        const selectedOption = document.querySelector(`[data-theme="${themeName}"]`);
        if (selectedOption) {
            selectedOption.classList.add('active');
        }

        // 更新當前主題
        this.currentTheme = themeName;
        this.saveTheme();
        this.applyTheme();

        // 顯示切換動畫
        this.showThemeSwitchAnimation(themeName);

        // 觸發主題變更事件
        const event = new CustomEvent('themeChanged', {
            detail: {
                theme: themeName,
                themeData: this.themes[themeName]
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * 應用主題到頁面
     */
    applyTheme() {
        const theme = this.themes[this.currentTheme];
        if (!theme) return;

        // 創建CSS變數
        const cssVars = `
            :root {
                --header-gradient: ${theme.headerGradient};
                --body-background: ${theme.bodyBackground};
                --primary-color: ${theme.primaryColor};
                --secondary-color: ${theme.secondaryColor};
                --accent-color: ${theme.accentColor};
                --text-color: ${theme.textColor};
                --card-background: ${theme.cardBackground};
            }
        `;

        // 移除舊的主題樣式
        const oldStyle = document.getElementById('theme-style');
        if (oldStyle) {
            oldStyle.remove();
        }

        // 添加新的主題樣式
        const style = document.createElement('style');
        style.id = 'theme-style';
        style.textContent = cssVars;
        document.head.appendChild(style);

        // 更新具體元素樣式
        this.updateElementStyles(theme);
    }

    /**
     * 更新具體元素樣式
     */
    updateElementStyles(theme) {
        // 更新header背景
        const header = document.querySelector('.header');
        if (header) {
            header.style.background = theme.headerGradient;
        }

        // 更新body背景
        document.body.style.background = theme.headerGradient;

        // 更新container背景
        const container = document.querySelector('.container');
        if (container) {
            container.style.background = theme.bodyBackground;
        }

        // 更新按鈕顏色
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => {
            if (!btn.classList.contains('btn-secondary')) {
                btn.style.background = theme.primaryColor;
            }
        });

        // 更新卡片樣式
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.style.background = theme.cardBackground;
        });

        // 更新導覽列活動狀態
        const activeNav = document.querySelector('.nav-item.active');
        if (activeNav) {
            activeNav.style.color = theme.primaryColor;
        }
    }

    /**
     * 顯示主題切換動畫
     */
    showThemeSwitchAnimation(themeName) {
        const theme = this.themes[themeName];
        if (!theme) return;

        // 創建切換動畫元素
        const animation = document.createElement('div');
        animation.className = 'theme-switch-animation';
        animation.innerHTML = `
            <div class="theme-switch-content">
                <div class="theme-switch-icon">🎨</div>
                <div class="theme-switch-text">已切換至 ${theme.name}</div>
            </div>
        `;
        
        document.body.appendChild(animation);
        
        // 移除動畫元素
        setTimeout(() => {
            animation.remove();
        }, 2000);
    }

    /**
     * 獲取當前主題
     */
    getCurrentTheme() {
        return {
            name: this.currentTheme,
            data: this.themes[this.currentTheme]
        };
    }

    /**
     * 獲取所有可用主題
     */
    getAvailableThemes() {
        return this.themes;
    }

    /**
     * 更新主題選擇器狀態
     */
    updateThemeSelector() {
        // 移除所有活動狀態
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
        });
        
        // 設置當前主題為活動狀態
        const currentOption = document.querySelector(`[data-theme="${this.currentTheme}"]`);
        if (currentOption) {
            currentOption.classList.add('active');
        }
    }

    /**
     * 重置為預設主題
     */
    resetToDefault() {
        this.switchTheme('default');
    }
}

// 自動初始化
window.themeModule = new ThemeModule(); 