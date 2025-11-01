# 麵包店模擬器 - 開發指南

## 項目概述

麵包店模擬器是一款使用 Unity 2022.3 LTS 開發的經營模擬遊戲，玩家可以經營自己的麵包店，從小型家庭麵包坊發展為大型連鎖企業。

## 開發環境設置

### 必要軟件
- **Unity Hub** 3.5.0 或更新版本
- **Unity Editor** 2022.3.12f1 LTS
- **Visual Studio 2022** 或 **Visual Studio Code**
- **Git** 版本控制

### 推薦軟件
- **Blender** 3.6+ (用於3D建模)
- **Photoshop** 或 **GIMP** (用於貼圖製作)
- **Audacity** (用於音效編輯)

## 項目結構

```
麵包店模擬器/
├── Assets/
│   ├── Scripts/
│   │   ├── Core/           # 核心遊戲系統
│   │   ├── UI/             # 用戶界面
│   │   ├── Production/     # 生產系統
│   │   ├── Customer/       # 客戶系統
│   │   ├── Steam/          # Steam 集成
│   │   └── Data/           # 數據結構
│   ├── Scenes/             # 遊戲場景
│   ├── Prefabs/            # 預製件
│   ├── Materials/          # 材質
│   ├── Textures/           # 貼圖
│   ├── Audio/              # 音效和音樂
│   └── Models/             # 3D模型
├── ProjectSettings/        # Unity 項目設置
├── Packages/              # Unity 包管理
├── Builds/                # 構建輸出
└── Documentation/         # 項目文檔
```

## 核心系統架構

### 1. GameManager
- **位置**: `Assets/Scripts/Core/GameManager.cs`
- **功能**: 管理整個遊戲的狀態和流程
- **職責**: 場景切換、暫停/繼續、存檔/讀檔

### 2. EconomySystem
- **位置**: `Assets/Scripts/Core/EconomySystem.cs`
- **功能**: 處理所有經濟相關邏輯
- **職責**: 金錢管理、定價、交易記錄、財務報表

### 3. BakeryManager
- **位置**: `Assets/Scripts/Core/BakeryManager.cs`
- **功能**: 管理麵包店的生產和庫存
- **職責**: 麵包製作、材料管理、庫存控制、配方解鎖

### 4. CustomerManager
- **位置**: `Assets/Scripts/Core/CustomerManager.cs`
- **功能**: 管理客戶系統
- **職責**: 客戶生成、訂單處理、滿意度計算、VIP系統

### 5. EmployeeManager
- **位置**: `Assets/Scripts/Core/EmployeeManager.cs`
- **功能**: 管理員工系統
- **職責**: 員工招聘、技能培訓、薪資管理、工作分配

## 開發工作流程

### 1. 代碼規範
- 使用 C# 命名規範
- 所有公共字段使用 `[Header]` 屬性分組
- 添加適當的註釋和文檔
- 使用命名空間 `BakerySimulator.Core`

### 2. 版本控制
```bash
# 初始化倉庫
git init
git add .
git commit -m "初始提交"

# 創建開發分支
git checkout -b develop
git checkout -b feature/新功能名稱
```

### 3. 測試流程
- 每個新功能都要進行單元測試
- 在多個平台上測試構建
- 性能測試和記憶體檢查

## Steam 發布準備

### 1. Steam SDK 集成
```csharp
// 啟用 Steam 功能
#define STEAM_ENABLED
```

### 2. Steam 成就設置
- 在 Steamworks 後台配置成就
- 更新 `SteamIntegration.cs` 中的成就映射
- 測試成就解鎖功能

### 3. Steam 雲存檔
- 配置 Steam 雲存檔設置
- 測試存檔同步功能
- 處理離線/在線轉換

## 構建和部署

### 自動化構建
```csharp
// 使用 Unity 編輯器菜單
Build → Build All Platforms
Build → Build Steam Version
```

### 手動構建
1. 打開 Unity 編輯器
2. 選擇 `File → Build Settings`
3. 選擇目標平台
4. 配置構建設置
5. 點擊 `Build` 或 `Build and Run`

### Steam 上傳
1. 使用 SteamCMD 或 Steamworks SDK
2. 配置 depot 文件
3. 上傳構建文件
4. 提交到 Steam 審核

## 性能優化

### 1. 渲染優化
- 使用 URP (Universal Render Pipeline)
- 批次處理相似材質
- LOD (Level of Detail) 系統
- 光照烘焙

### 2. 腳本優化
- 避免在 Update() 中進行昂貴操作
- 使用對象池管理客戶和麵包
- 緩存組件引用
- 使用事件而非輪詢

### 3. 記憶體管理
- 及時釋放未使用的資源
- 使用 Addressables 系統
- 監控記憶體使用情況

## 調試技巧

### 1. 日誌系統
```csharp
Debug.Log("普通信息");
Debug.LogWarning("警告信息");
Debug.LogError("錯誤信息");
```

### 2. Unity Profiler
- 監控 CPU 使用率
- 檢查記憶體分配
- 分析渲染性能

### 3. 控制台命令
- 實現開發者控制台
- 添加調試命令
- 快速測試功能

## 發布清單

### 上架前檢查
- [ ] 所有核心功能正常運作
- [ ] 在所有目標平台測試通過
- [ ] Steam 成就和統計正常
- [ ] 存檔/讀檔功能穩定
- [ ] 性能達到最低要求
- [ ] 無嚴重 Bug 或崩潰
- [ ] 音效和音樂品質良好
- [ ] UI/UX 用戶體驗良好
- [ ] 多語言支持（如需要）
- [ ] 法律合規檢查

### Steam 商店頁面
- [ ] 遊戲描述和特色
- [ ] 截圖和預告片
- [ ] 系統需求
- [ ] 價格設定
- [ ] 發布日期
- [ ] 年齡分級

## 聯繫方式

如有開發相關問題，請聯繫：
- **技術負責人**: developer@bakerysimulator.com
- **項目經理**: pm@bakerysimulator.com
- **技術支持**: support@bakerysimulator.com

## 版本歷史

### v1.0.0 (開發中)
- 基礎遊戲系統
- Steam 集成
- 多平台支持 