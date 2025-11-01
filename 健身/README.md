# FitnessPro - 健身遊戲 Web App

一個以「飲食控制、部位鍛鍊、身材管理、遊戲化互動」為主題的手機端健身遊戲 Web App 原型。

## 🎯 功能特色

### 9大核心功能模組

1. **✅ 每日簽到系統** - 連續打卡天數追蹤、XP獲得
2. **✅ 等級系統** - Chart.js 進度條、升級動畫  
3. **✅ Avatar 裝備系統** - 根據等級解鎖不同裝備
4. **✅ 排行榜系統** - 前10名用戶排序顯示
5. **✅ 心流進度條** - 圓形Chart.js圖表
6. **✅ 成就徽章系統** - 多種解鎖條件成就
7. **✅ 個人化任務生成器** - 隨機生成每日任務
8. **✅ 食譜推薦系統** - 營養分析圓餅圖
9. **✅ 身材對比視覺圖** - 過去vs現在對比

## 🏗️ 模組化架構

### 文件結構

```
FitnessPro/
├── index.html                     # 原始單文件版本
├── index-modular.html             # 模組化版本入口
├── README.md                      # 項目說明文檔
├── config/
│   └── config.js                  # 應用配置文件
├── assets/
│   ├── css/
│   │   ├── main.css              # 基礎樣式和佈局
│   │   ├── components.css        # 組件樣式（卡片、按鈕、表單等）
│   │   └── navigation.css        # 導航和響應式樣式
│   └── js/
│       ├── app.js                # 主應用管理器
│       ├── utils/
│       │   ├── storage.js        # 本地存儲管理器
│       │   └── helpers.js        # 通用輔助函數
│       └── modules/
│           └── checkin.js        # 簽到系統模組
```

### 核心架構

#### 1. 配置層 (`config/`)
- **config.js**: 統一管理應用配置、遊戲設定、UI配置等

#### 2. 工具層 (`assets/js/utils/`)
- **storage.js**: 本地存儲管理，支援過期時間、數據備份等
- **helpers.js**: 通用工具函數，防抖節流、日期格式化、動畫等

#### 3. 功能模組層 (`assets/js/modules/`)
- **checkin.js**: 簽到系統，包含簽到邏輯、升級檢查、成就解鎖
- _其他模組可以按需添加_

#### 4. 主應用層 (`assets/js/app.js`)
- **FitnessApp**: 主應用管理器，整合所有模組和功能

#### 5. 樣式層 (`assets/css/`)
- **main.css**: 基礎樣式和佈局
- **components.css**: 可重用組件樣式
- **navigation.css**: 導航和響應式設計

## 🚀 使用方式

### 快速開始

1. **單文件版本**：直接開啟 `index.html`
2. **模組化版本**：開啟 `index-modular.html`

### 開發建議

#### 添加新功能模組

1. 在 `assets/js/modules/` 創建新模組文件
2. 遵循現有模組的結構模式：

```javascript
class NewModule {
    constructor() {
        this.storage = window.storage;
        this.config = window.AppConfig;
        this.events = new EventTarget();
        this.init();
    }

    init() {
        this.bindEvents();
        // 初始化邏輯
    }

    bindEvents() {
        // 事件綁定
    }

    // 其他功能方法...
}

// 創建實例
const newModule = new NewModule();

// 導出
if (typeof window !== 'undefined') {
    window.NewModule = NewModule;
    window.newModule = newModule;
}
```

3. 在 `index-modular.html` 中引入新模組
4. 在 `app.js` 中整合新模組

#### 添加新樣式組件

1. 在 `assets/css/components.css` 中添加新組件樣式
2. 遵循BEM命名規範
3. 使用CSS變數來保持一致性

#### 修改配置

1. 編輯 `config/config.js` 來調整應用設定
2. 配置包含：遊戲參數、UI顏色、API端點等

## 🎨 設計特色

### UI風格
- **iOS App風格**：白底、圓角、漸層按鈕、陰影卡片
- **Mobile-First響應式設計**
- **深色模式支持**
- **觸摸手勢支持**

### 技術特點
- **模組化架構**：易於維護和擴展
- **事件驅動**：模組間鬆耦合通信
- **本地存儲**：支援數據持久化和備份
- **圖表視覺化**：使用Chart.js呈現數據
- **性能優化**：防抖節流、按需載入

## 📱 響應式支持

- **手機端** (< 480px)：主要目標平台
- **小尺寸手機** (< 360px)：優化佈局
- **平板端** (≥ 768px)：擴展佈局

## 🔧 技術棧

### 前端框架
- **純 JavaScript ES6+**：無框架依賴
- **Chart.js**：圖表視覺化
- **Font Awesome**：圖標庫
- **Google Fonts**：字體

### 數據存儲
- **localStorage**：本地數據持久化
- **Firebase Firestore 模擬**：可擴展到雲端

### 開發工具
- **模組化設計**：便於團隊協作
- **代碼分離**：HTML/CSS/JS完全分離
- **註釋完善**：JSDoc風格註釋

## 🎮 遊戲系統

### 經驗值系統
- 簽到：+10 XP
- 完成任務：+20 XP
- 升級所需：等級 × 100 XP

### 心流系統  
- 完成任務：+10%
- 達到100%：觸發特殊動畫

### 成就系統
- 初次簽到、連續簽到、等級達成等多種條件
- 解鎖時顯示動畫和通知

## 📊 數據結構

```javascript
userData = {
    profile: { name, avatarUrl, email },
    stats: { level, XP, flowState, currentWeight, bodyFat },
    progress: {
        checkinDays: [timestamps],
        workoutHistory: [...],
        dietHistory: [...],
        unlockedAchievements: [achievementIds],
        avatarItems: [itemIds]
    },
    tasks: { todayTasks: [...] },
    leaderboardSnapshot: { XP, checkinStreak, taskCompletionRate }
}
```

## 🔮 擴展計劃

### 可添加的功能模組
- **訓練系統模組**：運動計劃、動作庫、進度追蹤
- **飲食系統模組**：卡路里計算、營養建議、飲食記錄
- **社交系統模組**：好友系統、分享功能、群組挑戰
- **數據分析模組**：詳細統計、趨勢分析、個人報告
- **通知系統模組**：推送提醒、習慣培養、目標設定

### 技術升級
- 升級到現代前端框架（React/Vue）
- 集成真實的Firebase後端
- PWA支持（離線使用、安裝到主屏幕）
- TypeScript類型支持
- 單元測試覆蓋

## 📄 授權

此項目僅供學習和演示使用。

---

**開發者**：AI Assistant  
**最後更新**：2024年12月

🚀 **立即體驗**：開啟 `index-modular.html` 開始您的健身之旅！ 