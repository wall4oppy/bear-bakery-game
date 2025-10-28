// 遊戲主頁面功能
document.addEventListener('DOMContentLoaded', function() {
    // ================= 日誌過濾器（整理控制台輸出） =================
    (function setupConsoleFilter() {
        const originalLog = console.log.bind(console);
        const originalInfo = console.info.bind(console);
        const originalWarn = console.warn.bind(console);
        const originalError = console.error.bind(console);

        const MODES = { OFF: 'off', MIN: 'minimal', VERBOSE: 'verbose' };
        const emojiWhitelist = /[✅⚠️❌📦🏆🎯🎉📊🍯📈📉]/; // 重要訊息常用圖示

        const state = {
            mode: (localStorage.getItem('logMode') || MODES.MIN).toLowerCase()
        };

        function shouldPrint(args) {
            if (state.mode === MODES.OFF) return false;
            if (state.mode === MODES.VERBOSE) return true;
            // minimal 模式：只有包含重點 emoji 的訊息才輸出
            const joined = args.map(a => (typeof a === 'string' ? a : '')).join(' ');
            return emojiWhitelist.test(joined);
        }

        console.log = function(...args) {
            if (shouldPrint(args)) originalLog(...args);
        };
        // info 與 warn/error 保持輸出（重要）
        console.info = function(...args) {
            if (shouldPrint(args) || state.mode !== MODES.OFF) originalInfo(...args);
        };
        console.warn = originalWarn;
        console.error = originalError;

        window.setLogMode = function(mode) {
            const m = String(mode || '').toLowerCase();
            if ([MODES.OFF, MODES.MIN, MODES.VERBOSE].includes(m)) {
                state.mode = m;
                localStorage.setItem('logMode', m);
                originalInfo(`🔧 LogMode 已切換為: ${m}`);
            } else {
                originalWarn('無效的 LogMode，請使用: off|minimal|verbose');
            }
        };

        window.getLogMode = function() { return state.mode; };
        // 初始化提示（僅首次載入時在 minimal 也會顯示）
        originalInfo(`🔧 LogMode: ${state.mode}（可呼叫 window.setLogMode('off'|'minimal'|'verbose') 切換）`);
    })();
    // ================= 日誌過濾器結束 =================
    // ========== 虛擬玩家系統 ==========
    const VirtualPlayersSystem = {
        players: [],
        
        // 虛擬玩家資料模板
        playerTemplates: [
            { 
                name: '蜂蜜大王', 
                avatar: '🐻', 
                personality: 'aggressive', // 激進型
                skillLevel: 0.9 // 技能水平 0-1
            },
            { 
                name: '甜蛋女帝', 
                avatar: '🐻', 
                personality: 'balanced', // 均衡型
                skillLevel: 0.85 
            },
            { 
                name: '道聽塗熊', 
                avatar: '🐻', 
                personality: 'conservative', // 保守型
                skillLevel: 0.75 
            },
            { 
                name: '樂樂王子', 
                avatar: '🧙', 
                personality: 'aggressive', 
                skillLevel: 0.8 
            },
            { 
                name: '蛋糕女帝', 
                avatar: '🍰', 
                personality: 'balanced', 
                skillLevel: 0.7 
            },
            { 
                name: '鮮奶達人', 
                avatar: '👻', 
                personality: 'conservative', 
                skillLevel: 0.65 
            },
            { 
                name: '司康高手', 
                avatar: '🧙', 
                personality: 'balanced', 
                skillLevel: 0.6 
            },
            { 
                name: '奶酪專家', 
                avatar: '🎀', 
                personality: 'conservative', 
                skillLevel: 0.55 
            }
        ],
        
        // 初始化虛擬玩家
        initialize() {
            console.log('🤖 初始化虛擬玩家系統...');
            
            // 檢查是否已有虛擬玩家資料
            const savedPlayers = localStorage.getItem('virtualPlayers');
            
            if (savedPlayers) {
                this.players = JSON.parse(savedPlayers);
                console.log('✅ 載入已存在的虛擬玩家資料');
            } else {
                this.createPlayers();
                console.log('✅ 創建新的虛擬玩家');
            }
            
            return this.players;
        },
        
        // 創建虛擬玩家
        createPlayers() {
            this.players = this.playerTemplates.map(template => ({
                id: this.generateId(),
                name: template.name,
                avatar: template.avatar,
                personality: template.personality,
                skillLevel: template.skillLevel,
                resources: {
                    honey: 300000, // 蜂蜜幣（與真人玩家相同）
                    satisfaction: 0, // 顧客滿意度（與真人玩家相同）
                    reputation: 0 // 聲望（與真人玩家相同）
                },
                gameProgress: {
                    currentRound: 1,
                    eventsCompleted: 0,
                    selectedRegion: null,
                    selectedDistrict: null,
                    selectedCoefficient: 1.0,
                    hasStocked: false
                },
                stats: {
                    totalEarnings: 0, // 總收益
                    totalSpending: 0, // 總支出
                    totalRent: 0, // 總租金
                    totalStockCost: 0, // 總進貨成本
                    correctAnswers: 0, // 正確答案數
                    wrongAnswers: 0 // 錯誤答案數
                },
                inventory: {
                    // 麵包庫存
                }
            }));
            
            this.savePlayers();
        },
        
        // 生成唯一ID
        generateId() {
            return 'vp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        },
        
        // 儲存玩家資料
        savePlayers() {
            localStorage.setItem('virtualPlayers', JSON.stringify(this.players));
        },
        
        // 重置所有虛擬玩家（當真人玩家重新開始時）
        resetAllPlayers() {
            console.log('🔄 重置所有虛擬玩家...');
            localStorage.removeItem('virtualPlayers');
            this.createPlayers();
            console.log('✅ 虛擬玩家已重置');
        },
        
        // 模擬虛擬玩家進行事件選擇
        simulateEventChoice(player, event) {
            if (!event) return null;
            
            // 找到選項 - 可能叫 choices 或 options，可能在不同位置
            let choices = event.choices || event.options || 
                         event.event?.choices || event.event?.options;
            
            if (!choices || !Array.isArray(choices) || choices.length === 0) {
                console.warn(`⚠️ ${player.name}: 事件沒有可選擇的選項`);
                console.log('   事件結構:', event);
                return null;
            }
            
            let selectedChoice = null;
            
            // 根據性格和技能水平選擇
            switch (player.personality) {
                case 'aggressive':
                    // 激進型：偏好高風險高回報
                    selectedChoice = this.selectAggressiveChoice(choices, player.skillLevel);
                    break;
                case 'balanced':
                    // 均衡型：平衡風險和回報
                    selectedChoice = this.selectBalancedChoice(choices, player.skillLevel);
                    break;
                case 'conservative':
                    // 保守型：偏好低風險穩定回報
                    selectedChoice = this.selectConservativeChoice(choices, player.skillLevel);
                    break;
            }
            
            return selectedChoice;
        },
        
        // 激進型選擇
        selectAggressiveChoice(choices, skillLevel) {
            // 激進型玩家會選擇潛在收益最高的選項
            // 技能水平影響正確率
            const correctChance = 0.5 + (skillLevel * 0.4); // 50%-90%
            const isCorrect = Math.random() < correctChance;
            
            if (isCorrect) {
                // 嘗試找到最佳選項
                return choices.find(c => c.isCorrect) || choices[Math.floor(Math.random() * choices.length)];
            } else {
                // 選錯
                const wrongChoices = choices.filter(c => !c.isCorrect);
                return wrongChoices[Math.floor(Math.random() * wrongChoices.length)] || choices[0];
            }
        },
        
        // 均衡型選擇
        selectBalancedChoice(choices, skillLevel) {
            const correctChance = 0.4 + (skillLevel * 0.4); // 40%-80%
            const isCorrect = Math.random() < correctChance;
            
            if (isCorrect) {
                return choices.find(c => c.isCorrect) || choices[Math.floor(Math.random() * choices.length)];
            } else {
                const wrongChoices = choices.filter(c => !c.isCorrect);
                return wrongChoices[Math.floor(Math.random() * wrongChoices.length)] || choices[0];
            }
        },
        
        // 保守型選擇
        selectConservativeChoice(choices, skillLevel) {
            const correctChance = 0.3 + (skillLevel * 0.4); // 30%-70%
            const isCorrect = Math.random() < correctChance;
            
            if (isCorrect) {
                return choices.find(c => c.isCorrect) || choices[Math.floor(Math.random() * choices.length)];
            } else {
                const wrongChoices = choices.filter(c => !c.isCorrect);
                return wrongChoices[Math.floor(Math.random() * wrongChoices.length)] || choices[0];
            }
        },
        
        // 應用選擇結果到虛擬玩家
        applyChoiceResult(player, choice, isCorrect) {
            if (!choice) {
                console.warn(`⚠️ ${player.name}: 沒有選擇`);
                return;
            }
            
            // 找到 effects - 可能在不同位置
            let effects = choice.effects || choice.result?.effects;
            
            if (!effects) {
                console.log(`💡 ${player.name}: 選擇沒有效果資料，使用隨機變化`);
                // 即使沒有effects，也給予隨機變化讓遊戲更有趣
                const randomChange = Math.floor(Math.random() * 2000) - 1000; // -1000 到 +1000
                player.resources.honey += randomChange;
                player.resources.honey = Math.max(5000, player.resources.honey); // 最少保持5000
                
                const satisfactionChange = Math.floor(Math.random() * 20) - 10; // -10 到 +10
                player.resources.satisfaction += satisfactionChange;
                player.resources.satisfaction = Math.max(50, Math.min(100, player.resources.satisfaction));
                
                const reputationChange = Math.floor(Math.random() * 30) - 15; // -15 到 +15
                player.resources.reputation += reputationChange;
                player.resources.reputation = Math.max(50, player.resources.reputation);
                
                console.log(`   💰 ${player.name} 新蜂蜜幣: ${player.resources.honey.toLocaleString()}`);
                
                // 更新統計
                if (isCorrect) {
                    player.stats.correctAnswers++;
                } else {
                    player.stats.wrongAnswers++;
                }
                
                return;
            }
            
            console.log(`📝 ${player.name} 應用效果:`, effects);
            
            // 計算銷售收入（模擬真人玩家的銷售流程）
            let salesRevenue = 0;
            if (player.inventory && Object.keys(player.inventory).length > 0) {
                // 根據選項係數計算銷售
                const optionMultiplier = isCorrect ? (choice.optionMultiplier || 1.2) : 1.0;
                const regionCoefficient = player.gameProgress.selectedCoefficient || 1.0;
                const economicCoefficient = 1.0; // 簡化處理
                
                // 計算每種麵包的銷售（不清空庫存，因為一輪有7個事件都要賣）
                Object.entries(player.inventory).forEach(([breadId, quantity]) => {
                    if (quantity > 0 && window.BreadProducts) {
                        const bread = BreadProducts.getBreadById(breadId);
                        if (bread) {
                            // 每個事件銷售庫存的一部分（約1/7，因為有7個事件）
                            const demandRate = 0.1 + (Math.random() * 0.1); // 10%-20%，7個事件約70%-140%
                            const baseDemand = Math.floor(quantity * demandRate);
                            const adjustedDemand = Math.floor(baseDemand * regionCoefficient * economicCoefficient * optionMultiplier);
                            const actualSales = Math.min(adjustedDemand, quantity);
                            
                            salesRevenue += actualSales * bread.price;
                            // 減少庫存（而不是清空）
                            player.inventory[breadId] -= actualSales;
                        }
                    }
                });
            }
            
            // 應用銷售收入
            player.resources.honey += salesRevenue;
            player.stats.totalEarnings += salesRevenue;
            
            // 應用蜂蜜幣變化（事件直接效果）
            if (effects.honey !== undefined) {
                const change = isCorrect ? effects.honey : Math.floor(effects.honey * 0.5);
                player.resources.honey += change;
            }
            
            // 應用顧客滿意度變化
            if (effects.satisfaction !== undefined) {
                const change = isCorrect ? effects.satisfaction : Math.floor(effects.satisfaction * 0.5);
                player.resources.satisfaction += change;
                player.resources.satisfaction = Math.max(0, Math.min(100, player.resources.satisfaction));
            }
            
            // 應用聲望變化
            if (effects.reputation !== undefined) {
                const change = isCorrect ? effects.reputation : Math.floor(effects.reputation * 0.5);
                player.resources.reputation += change;
                player.resources.reputation = Math.max(0, player.resources.reputation);
            }
            
            console.log(`   💰 銷售收入: +${salesRevenue.toLocaleString()}`);
            console.log(`   💰 當前蜂蜜幣: ${player.resources.honey.toLocaleString()}`);
            console.log(`   😊 當前顧客滿意度: ${player.resources.satisfaction.toLocaleString()}`);
            console.log(`   🏆 當前聲望: ${player.resources.reputation.toLocaleString()}`);
            
            // 更新統計
            if (isCorrect) {
                player.stats.correctAnswers++;
            } else {
                player.stats.wrongAnswers++;
            }
            
            this.savePlayers();
        },
        
        // 模擬虛擬玩家選擇地區
        simulateRegionSelection(realPlayerRegion, realPlayerDistrict) {
            console.log('\n🗺️ ========== 虛擬玩家選擇地區 ==========');
            
            if (!window.RegionCoefficientsManager) {
                console.warn('⚠️ 地區係數管理器未初始化');
                return;
            }
            
            this.players.forEach(player => {
                // 根據性格選擇地區
                let selectedRegion, selectedDistrict, coefficient;
                
                if (player.personality === 'aggressive') {
                    // 激進型：選擇商業區（高成本高回報）
                    selectedRegion = '商業區';
                    const districts = RegionCoefficientsManager.getDistricts(selectedRegion);
                    const districtKeys = Object.keys(districts);
                    selectedDistrict = districtKeys[Math.floor(Math.random() * districtKeys.length)];
                } else if (player.personality === 'conservative') {
                    // 保守型：選擇住宅區（低成本穩定）
                    selectedRegion = '住宅區';
                    const districts = RegionCoefficientsManager.getDistricts(selectedRegion);
                    const districtKeys = Object.keys(districts);
                    selectedDistrict = districtKeys[Math.floor(Math.random() * districtKeys.length)];
                } else {
                    // 均衡型：選擇學區（中等）
                    selectedRegion = '學區';
                    const districts = RegionCoefficientsManager.getDistricts(selectedRegion);
                    const districtKeys = Object.keys(districts);
                    selectedDistrict = districtKeys[Math.floor(Math.random() * districtKeys.length)];
                }
                
                coefficient = RegionCoefficientsManager.getCoefficient(selectedRegion, selectedDistrict);
                const rent = RegionCoefficientsManager.calculateTotalRent(selectedRegion, coefficient);
                
                // 扣除租金
                player.resources.honey -= rent;
                player.stats.totalRent += rent;
                player.stats.totalSpending += rent;
                
                // 儲存選擇
                player.gameProgress.selectedRegion = selectedRegion;
                player.gameProgress.selectedDistrict = selectedDistrict;
                player.gameProgress.selectedCoefficient = coefficient;
                
                console.log(`🏠 ${player.name}: ${selectedRegion} - ${selectedDistrict}`);
                console.log(`   💰 支付租金: ${rent.toLocaleString()} (剩餘: ${player.resources.honey.toLocaleString()})`);
            });
            
            this.savePlayers();
            console.log('✅ 所有虛擬玩家完成地區選擇');
        },
        
        // 模擬虛擬玩家進貨
        simulateStocking() {
            console.log('\n📦 ========== 虛擬玩家進貨 ==========');
            
            if (!window.BreadProducts) {
                console.warn('⚠️ 麵包產品系統未初始化');
                return;
            }
            
            const allBreads = BreadProducts.getAllBreads();
            
            this.players.forEach(player => {
                let totalCost = 0;
                player.inventory = {};
                
                allBreads.forEach(bread => {
                    // 根據性格決定進貨量（每輪都進貨，且至少1400個）
                    let quantity;
                    const baseQuantity = 1400; // 提高基礎進貨量
                    
                    if (player.personality === 'aggressive') {
                        // 激進型：大量進貨（1400-1800）
                        quantity = baseQuantity + Math.floor(Math.random() * 400);
                    } else if (player.personality === 'conservative') {
                        // 保守型：保守進貨（1400-1600）
                        quantity = baseQuantity + Math.floor(Math.random() * 200);
                    } else {
                        // 均衡型：中等進貨（1400-1700）
                        quantity = baseQuantity + Math.floor(Math.random() * 300);
                    }
                    
                    const cost = quantity * bread.cost;
                    totalCost += cost;
                    player.inventory[bread.id] = quantity;
                });
                
                // 扣除進貨成本
                player.resources.honey -= totalCost;
                player.stats.totalStockCost += totalCost;
                player.stats.totalSpending += totalCost;
                player.gameProgress.hasStocked = true;
                
                const totalQuantity = Object.values(player.inventory).reduce((sum, qty) => sum + qty, 0);
                console.log(`📦 ${player.name}: 進貨 ${totalQuantity} 個麵包，花費 ${totalCost.toLocaleString()} 元 (剩餘: ${player.resources.honey.toLocaleString()})`);
            });
            
            this.savePlayers();
            console.log('✅ 所有虛擬玩家完成進貨');
        },
        
        // 模擬所有虛擬玩家進行一輪遊戲
        simulateRound(event) {
            console.log('\n🎮 ========== 虛擬玩家進行遊戲 ==========');
            
            if (!event) {
                console.warn('⚠️ 沒有事件資料，虛擬玩家無法進行');
                return;
            }
            
            console.log('📋 事件:', event.title || '未命名事件');
            
            // 檢查選項位置
            let choices = event.choices || event.options || 
                         event.event?.choices || event.event?.options;
            if (choices && Array.isArray(choices)) {
                console.log(`✅ 找到 ${choices.length} 個選項`);
            } else {
                console.warn('⚠️ 找不到選項！嘗試顯示事件結構:');
                console.log('   event.choices:', event.choices);
                console.log('   event.options:', event.options);
                console.log('   event.event?.options:', event.event?.options);
                console.log('   完整事件物件鍵:', Object.keys(event));
            }
            
            this.players.forEach((player, index) => {
                console.log(`\n🤖 ${player.name} (${player.personality}, 技能${(player.skillLevel*100).toFixed(0)}%)`);
                const choice = this.simulateEventChoice(player, event);
                if (choice) {
                    const isCorrect = choice.isCorrect || false;
                    console.log(`   ✅ 做出選擇: ${choice.text || choice.option || '選項' + (index % 4 + 1)} (${isCorrect ? '正確✓' : '錯誤✗'})`);
                    this.applyChoiceResult(player, choice, isCorrect);
                    player.gameProgress.eventsCompleted++;
                    console.log(`   💰 蜂蜜幣: ${player.resources.honey.toLocaleString()}`);
                } else {
                    console.warn(`   ⚠️ 無法做出選擇`);
                }
            });
            
            this.savePlayers();
            console.log('✅ 所有虛擬玩家完成本輪遊戲');
            console.log('📊 當前排行:', this.getLeaderboard('honey').slice(0, 3).map(p => `${p.name}: ${p.resources.honey}`));
            
            // 如果真人玩家完成了7個事件，虛擬玩家準備下一輪
            if (window.GameFlowManager && GameFlowManager.eventsCompleted >= GameFlowManager.totalEventsPerRound) {
                const currentRound = GameFlowManager.currentRound;
                console.log(`\n🎯 第${currentRound}輪完成，虛擬玩家準備下一輪`);
                this.players.forEach(player => {
                    const inventoryCount = Object.values(player.inventory || {}).reduce((sum, qty) => sum + qty, 0);
                    console.log(`   📦 ${player.name}: 剩餘庫存 ${inventoryCount} 個麵包 (完成 ${player.gameProgress.eventsCompleted} 個事件)`);
                });
                this.savePlayers();
                console.log('✅ 虛擬玩家已準備好進入下一輪（每輪重新進貨）\n');
            }
        },
        
        // 獲取排行榜資料
        getLeaderboard(type = 'honey') {
            let sortedPlayers = [...this.players];
            
            // 根據類型排序
            switch (type) {
                case 'honey':
                    sortedPlayers.sort((a, b) => b.resources.honey - a.resources.honey);
                    break;
                case 'satisfaction':
                    sortedPlayers.sort((a, b) => b.resources.satisfaction - a.resources.satisfaction);
                    break;
                case 'reputation':
                    sortedPlayers.sort((a, b) => b.resources.reputation - a.resources.reputation);
                    break;
            }
            
            return sortedPlayers;
        },
        
        // 獲取真人玩家在排行榜中的位置
        getRealPlayerRank(realPlayerResources, type = 'honey') {
            // 獲取玩家名稱（如果有設置的話）
            const playerName = localStorage.getItem('playerName') || '我';
            
            const allPlayers = [
                { 
                    name: playerName, 
                    avatar: '🐻', // 使用熊頭像而不是👤
                    isRealPlayer: true,
                    resources: realPlayerResources 
                },
                ...this.players
            ];
            
            // 排序
            let sortedPlayers = [...allPlayers];
            switch (type) {
                case 'honey':
                    sortedPlayers.sort((a, b) => b.resources.honey - a.resources.honey);
                    break;
                case 'satisfaction':
                    sortedPlayers.sort((a, b) => b.resources.satisfaction - a.resources.satisfaction);
                    break;
                case 'reputation':
                    sortedPlayers.sort((a, b) => b.resources.reputation - a.resources.reputation);
                    break;
            }
            
            return sortedPlayers;
        }
    };
    
    // 地區係數管理系統
    const RegionCoefficientsManager = {
        coefficients: {},
        baseRents: {
            '住宅區': 26000,
            '商業區': 42800,
            '學區': 36000
        },
        
        // 載入地區係數
        async loadCoefficients() {
            try {
                const response = await fetch('data/regionCoefficients.json');
                this.coefficients = await response.json();
                console.log('✅ 已載入地區係數配置');
                return true;
            } catch (error) {
                console.error('載入地區係數失敗:', error);
                return false;
            }
        },
        
        // 取得特定地區類型的所有行政區
        getDistricts(regionType) {
            return this.coefficients[regionType] || {};
        },
        
        // 取得特定行政區的係數
        getCoefficient(regionType, district) {
            return this.coefficients[regionType]?.[district] || 1.0;
        },
        
        // 取得基礎租金
        getBaseRent(regionType) {
            return this.baseRents[regionType] || 0;
        },
        
        // 計算總租金
        calculateTotalRent(regionType, coefficient) {
            const baseRent = this.getBaseRent(regionType);
            return Math.round(baseRent * coefficient);
        }
    };
    
    // 行銷題庫管理系統
    const QuestionBank = {
        questions: [],
        categories: [
            '行銷理論與管理',
            '行銷策略與企劃', 
            '市場研究',
            '全球與國際行銷',
            '數位與網路行銷'
        ],
        categoryProgress: {}, // 記錄每個類別的完成次數和答對率
        currentCategory: null,
        
        // 載入題庫
        async loadQuestions() {
            try {
                const response = await fetch('data/questions.json');
                this.questions = await response.json();
                console.log(`✅ 已載入 ${this.questions.length} 道行銷題目`);
                
                // 初始化類別進度
                this.loadProgress();
                
                // 按類別統計題目數量
                this.categories.forEach(cat => {
                    const count = this.questions.filter(q => q.category === cat).length;
                    console.log(`📚 ${cat}: ${count} 題`);
                });
            } catch (error) {
                console.error('載入題庫失敗:', error);
                this.questions = [];
            }
        },
        
        // 載入進度
        loadProgress() {
            const saved = localStorage.getItem('categoryProgress');
            if (saved) {
                try {
                    this.categoryProgress = JSON.parse(saved);
                } catch (e) {
                    this.categoryProgress = {};
                }
            }
            
            // 確保每個類別都有初始化
            this.categories.forEach(cat => {
                if (!this.categoryProgress[cat]) {
                    this.categoryProgress[cat] = {
                        attempts: [],  // 每次嘗試的記錄 [{correctRate: 0.7, timestamp: ...}]
                        unlocked: cat === '行銷理論與管理' // 第一個類別預設解鎖
                    };
                }
            });
        },
        
        // 儲存進度
        saveProgress() {
            localStorage.setItem('categoryProgress', JSON.stringify(this.categoryProgress));
        },
        
        // 獲取當前可用的類別
        getCurrentCategory() {
            for (let cat of this.categories) {
                if (this.categoryProgress[cat].unlocked) {
                    const attempts = this.categoryProgress[cat].attempts;
                    // 檢查是否需要繼續這個類別（未達到1回且7成以上）
                    const qualifiedAttempts = attempts.filter(a => a.correctRate >= 0.7).length;
                    if (qualifiedAttempts < 1) {
                        return cat;
                    }
                }
            }
            // 如果都完成了，返回最後一個
            return this.categories[this.categories.length - 1];
        },
        
        // 根據類別獲取題目
        getQuestionsByCategory(category, count = 10) {
            const categoryQuestions = this.questions.filter(q => q.category === category);
            
            // 隨機選擇指定數量的題目
            const shuffled = [...categoryQuestions].sort(() => Math.random() - 0.5);
            return shuffled.slice(0, Math.min(count, shuffled.length));
        },
        
        // 獲取混合題目（五類各5題，共25題）
        getMixedQuestions() {
            const mixedQuestions = [];
            const questionsPerCategory = 5;
            
            this.categories.forEach(category => {
                const categoryQuestions = this.questions.filter(q => q.category === category);
                if (categoryQuestions.length > 0) {
                    const shuffled = [...categoryQuestions].sort(() => Math.random() - 0.5);
                    const selected = shuffled.slice(0, Math.min(questionsPerCategory, categoryQuestions.length));
                    mixedQuestions.push(...selected);
                }
            });
            
            // 打亂所有題目的順序
            return mixedQuestions.sort(() => Math.random() - 0.5);
        },
        
        // 記錄測驗結果
        recordAttempt(category, correctCount, totalCount) {
            const correctRate = correctCount / totalCount;
            
            if (!this.categoryProgress[category]) {
                this.categoryProgress[category] = { attempts: [], unlocked: true };
            }
            
            this.categoryProgress[category].attempts.push({
                correctRate: correctRate,
                correctCount: correctCount,
                totalCount: totalCount,
                timestamp: new Date().toISOString()
            });
            
            // 檢查是否解鎖下一個類別
            const qualifiedAttempts = this.categoryProgress[category].attempts.filter(
                a => a.correctRate >= 0.7
            ).length;
            
            if (qualifiedAttempts >= 1) {
                const currentIndex = this.categories.indexOf(category);
                if (currentIndex < this.categories.length - 1) {
                    const nextCategory = this.categories[currentIndex + 1];
                    this.categoryProgress[nextCategory].unlocked = true;
                    console.log(`🎉 解鎖新類別: ${nextCategory}`);
                }
            }
            
            this.saveProgress();
            return correctRate;
        },
        
        // 獲取類別狀態
        getCategoryStatus(category) {
            const progress = this.categoryProgress[category];
            if (!progress) return { unlocked: false, attempts: 0, qualified: 0 };
            
            const qualifiedAttempts = progress.attempts.filter(a => a.correctRate >= 0.7).length;
            
            return {
                unlocked: progress.unlocked,
                attempts: progress.attempts.length,
                qualified: qualifiedAttempts,
                completed: qualifiedAttempts >= 1
            };
        }
    };
    
    // 測驗模式系統
    const QuizMode = {
        isActive: false,
        currentCategory: null,
        questions: [],
        currentQuestionIndex: 0,
    answers: [], // 記錄用戶答案 [{questionIndex, userAnswer, isCorrect, question}]
    rewardGranted: false, // 本次測驗是否已發獎
        startTime: null,
        timeLimit: 15 * 60 * 1000, // 15分鐘（毫秒）
        timerInterval: null,
        
        // 開始測驗
        start(category) {
            this.isActive = true;
            this.currentCategory = category;
            this.questions = QuestionBank.getMixedQuestions(); // 使用混合題目（25題）
            this.currentQuestionIndex = 0;
            this.answers = [];
            this.startTime = Date.now();
            this.rewardGranted = false;
            
            console.log(`開始測驗: 混合題目, 共 ${this.questions.length} 題`);
            
            // 開始計時器
            this.startTimer();
        },
        
        // 開始計時器
        startTimer() {
            this.timerInterval = setInterval(() => {
                const elapsed = Date.now() - this.startTime;
                const remaining = this.timeLimit - elapsed;
                
                if (remaining <= 0) {
                    this.end();
                }
                
                // 更新顯示
                this.updateTimerDisplay(remaining);
            }, 1000);
        },
        
        // 更新計時器顯示
        updateTimerDisplay(remaining) {
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            const timerElement = document.getElementById('quizTimer');
            
            if (timerElement) {
                timerElement.textContent = `⏱ ${minutes}:${seconds.toString().padStart(2, '0')}`;
                
                // 時間快結束時變紅
                if (remaining < 60000) {
                    timerElement.style.color = '#dc143c';
                } else {
                    timerElement.style.color = '#8b4513';
                }
            }
        },
        
        // 提交答案
        submitAnswer(questionIndex, userAnswer) {
            const question = this.questions[questionIndex];
            const isCorrect = userAnswer === question.answer;
            
            this.answers.push({
                questionIndex: questionIndex,
                userAnswer: userAnswer,
                isCorrect: isCorrect,
                question: question
            });
            
            return isCorrect;
        },
        
        // 下一題
        nextQuestion() {
            this.currentQuestionIndex++;
            
            if (this.currentQuestionIndex >= this.questions.length) {
                this.end();
                return null;
            }
            
            return this.questions[this.currentQuestionIndex];
        },
        
        // 結束測驗
        end() {
            this.isActive = false;
            
            // 停止計時器
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }
            
            // 計算結果
            const correctCount = this.answers.filter(a => a.isCorrect).length;
            const totalCount = this.questions.length;
            const correctRate = correctCount / totalCount;
            
            // 記錄到類別進度
            QuestionBank.recordAttempt(this.currentCategory, correctCount, totalCount);
            
            // 計算獎勵（基於答對率）
            let reward = 0;
            if (correctRate === 1.0) reward = 5000; // 全對
            else if (correctRate >= 0.9) reward = 3500; // 90%以上
            else if (correctRate >= 0.8) reward = 2000; // 80%以上
            else if (correctRate >= 0.7) reward = 1000; // 70%以上
            
            if (reward > 0 && !this.rewardGranted) {
                GameResources.addResource('honey', reward); // 右上角資源會即時更新
                this.rewardGranted = true;
            }
            
            // 檢查答題成就
            if (window.AchievementSystem) {
                window.AchievementSystem.checkProgress('correct_answers', correctCount);
                if (correctCount === 10) {
                    window.AchievementSystem.checkProgress('perfect_quiz', 1);
                }
            }
            
            console.log(`📊 測驗結束: ${correctCount}/${totalCount} (${(correctRate * 100).toFixed(0)}%), 獲得 ${reward} 蜂蜜幣`);
            
            return {
                correctCount,
                totalCount,
                correctRate,
                reward,
                answers: this.answers
            };
        },
        
        // 強制結束（點×按鈕）
        forceEnd() {
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }
            
            const result = this.end();
            return result;
        },
        
        // 獲取當前題目
        getCurrentQuestion() {
            return this.questions[this.currentQuestionIndex];
        },
        
        // 獲取進度
        getProgress() {
            return {
                current: this.currentQuestionIndex + 1,
                total: this.questions.length
            };
        }
    };
    
    // 遊戲資源管理系統
    const GameResources = {
        // 初始資源值
        resources: {
            honey: 300000,    // 蜂蜜幣（營收資金）
            bearPoints: 0,   // 熊點數（顧客滿意度）
            medals: 0        // 勳章（聲望）
        },
        
        // 從本地存儲載入資源
        loadResources() {
            const saved = localStorage.getItem('gameResources');
            if (saved) {
                try {
                    this.resources = { ...this.resources, ...JSON.parse(saved) };
                } catch (e) {
                    console.warn('載入資源資料失敗，使用預設值');
                }
            }
            this.updateDisplay();
        },
        
        // 儲存資源到本地存儲
        saveResources() {
            localStorage.setItem('gameResources', JSON.stringify(this.resources));
        },
        
        // 更新顯示
        updateDisplay() {
            const honeyElement = document.querySelector('.honey-icon .resource-value');
            const bearPointsElement = document.querySelector('.bear-point-icon .resource-value');
            const medalsElement = document.querySelector('.medal-icon .resource-value');
            
            if (honeyElement) honeyElement.textContent = this.formatNumber(this.resources.honey);
            if (bearPointsElement) bearPointsElement.textContent = this.formatNumber(this.resources.bearPoints);
            if (medalsElement) medalsElement.textContent = this.formatNumber(this.resources.medals);
        },
        
        // 格式化數字顯示
        formatNumber(num) {
            // 處理 null 或 undefined
            if (num == null) {
                return '0';
            }
            
            // 確保是數字
            num = Number(num);
            
            // 使用千分位逗號格式
            return num.toLocaleString('en-US');
        },
        
        // 增加資源
        addResource(type, amount) {
            if (this.resources.hasOwnProperty(type)) {
                this.resources[type] += amount;
                this.updateDisplay();
                this.saveResources();
                this.showResourceChange(type, amount, true);
                
                // 檢查成就進度
                if (window.AchievementSystem) {
                    if (type === 'honey') {
                        window.AchievementSystem.checkProgress('total_honey', this.resources[type]);
                    } else if (type === 'bearPoints') {
                        window.AchievementSystem.checkProgress('satisfaction', this.resources[type]);
                    } else if (type === 'medals') {
                        window.AchievementSystem.checkProgress('reputation', this.resources[type]);
                        window.AchievementSystem.checkProgress('medals', this.resources[type]);
                    }
                }
                
                return true;
            }
            return false;
        },
        
        // 減少資源
        subtractResource(type, amount) {
            if (this.resources.hasOwnProperty(type) && this.resources[type] >= amount) {
                this.resources[type] -= amount;
                this.updateDisplay();
                this.saveResources();
                this.showResourceChange(type, -amount, false);
                return true;
            }
            return false;
        },
        
        // 檢查是否有足夠資源
        hasEnoughResource(type, amount) {
            return this.resources.hasOwnProperty(type) && this.resources[type] >= amount;
        },
        
        // 獲取資源數量
        getResource(type) {
            return this.resources[type] || 0;
        },
        
        // 設置資源數量
        setResource(type, amount) {
            if (this.resources.hasOwnProperty(type)) {
                this.resources[type] = Math.max(0, amount);
                this.updateDisplay();
                this.saveResources();
                return true;
            }
            return false;
        },
        
        // 顯示資源變化動畫
        showResourceChange(type, amount, isPositive) {
            let targetElement = null;
            
            switch(type) {
                case 'honey':
                    targetElement = document.querySelector('.honey-icon .resource-value');
                    break;
                case 'bearPoints':
                    targetElement = document.querySelector('.bear-point-icon .resource-value');
                    break;
                case 'medals':
                    targetElement = document.querySelector('.medal-icon .resource-value');
                    break;
            }
            
            if (targetElement) {
                // 動畫：以 CSS 變數控制縮放，結束後強制回到初始 transform
                targetElement.style.setProperty('--pulse-scale', '1.2');
                targetElement.style.transition = 'color 0.3s ease, transform 0.3s ease';
                targetElement.style.color = isPositive ? '#4ecdc4' : '#ff6b6b';
                // 觸發重排，確保變數生效
                void targetElement.offsetWidth;
                
                setTimeout(() => {
                    targetElement.style.setProperty('--pulse-scale', '1');
                    targetElement.style.color = '#654321';
                    // 在動畫結束後，重置內聯 transform，避免殘留導致偏移
                    setTimeout(() => {
                        targetElement.style.transform = '';
                    }, 300);
                }, 300);
            }
        }
        ,
        // 重置為初始資源值
        resetToInitial() {
            this.resources = {
                honey: 300000,
                bearPoints: 0,
                medals: 0
            };
            this.updateDisplay();
            this.saveResources();
        }
    };
    
    // 麵包品項資料定義
    const BreadProducts = {
        items: [
            { id: 'cream', name: '奶油麵包', cost: 9, price: 30, icon: 'assets/images/奶油麵包1.png' },
            { id: 'strawberry', name: '草莓麵包', cost: 20, price: 30, icon: 'assets/images/草莓麵包.png' },
            { id: 'pineapple', name: '爆漿菠蘿', cost: 20, price: 45, icon: 'assets/images/爆漿菠蘿1.png' },
            { id: 'walnut', name: '核桃麵包', cost: 40, price: 50, icon: 'assets/images/核桃麵包.png' },
            { id: 'cake', name: '草莓蛋糕', cost: 30, price: 60, icon: 'assets/images/草莓蛋糕.png' }
        ],
        
        // 根據 ID 獲取麵包資料
        getBreadById(id) {
            return this.items.find(bread => bread.id === id);
        },
        
        // 獲取所有麵包資料
        getAllBreads() {
            return this.items;
        }
    };
    
    // 景氣燈號係數
    const EconomicMultipliers = {
        '紅燈': 1.2,  // 熱絡
        '綠燈': 1.0,  // 平穩
        '藍燈': 0.8   // 低迷
    };
    
    // 地區租金配置
    const RegionRent = {
        '住宅區': 26000,
        '商業區': 42800,
        '學區': 36000
    };
    
    // 事件題目系統（為未來整合預留）
    const EventSystem = {
        // 事件選項結果處理
        processEventChoice(choiceData) {
            if (choiceData.resourceChanges) {
                choiceData.resourceChanges.forEach(change => {
                    if (change.type === 'add') {
                        GameResources.addResource(change.resource, change.amount);
                    } else if (change.type === 'subtract') {
                        GameResources.subtractResource(change.resource, change.amount);
                    } else if (change.type === 'set') {
                        GameResources.setResource(change.resource, change.amount);
                    }
                });
            }
            
            if (choiceData.message) {
                showMessage(choiceData.message, choiceData.messageType || 'info');
            }
        },
        
        // 檢查事件選項是否可用（基於資源）
        isChoiceAvailable(choiceData) {
            if (choiceData.cost) {
                return choiceData.cost.every(cost => 
                    GameResources.hasEnoughResource(cost.resource, cost.amount)
                );
            }
            return true;
        }
    };
    
    // 銷售計算系統
    const SalesCalculator = {
        // 計算單次事件的銷售
        calculateEventSales(inventory, regionType, district, economicLevel, optionCoefficient) {
            let totalRevenue = 0;
            let totalSalesVolume = 0;
            let salesDetail = [];
            
            // 取得係數
            const regionCoef = RegionCoefficientsManager.getCoefficient(regionType, district);
            const economicCoef = EconomicMultipliers[economicLevel];
            
            console.log(`📊 銷售計算參數: 地區係數=${regionCoef}, 景氣係數=${economicCoef}, 選項係數=${optionCoefficient}`);
            
            // 計算每種麵包
            BreadProducts.items.forEach(bread => {
                // 1. 隨機需求基數 (200-600)
                const randomDemand = Math.floor(Math.random() * 401) + 200;
                
                // 2. 調整後需求量
                const adjustedDemand = Math.floor(
                    randomDemand * regionCoef * economicCoef * optionCoefficient
                );
                
                // 3. 實際銷售量 = min(進貨量, 需求量)
                const playerStock = inventory[bread.id] || 0;
                const actualSales = Math.min(playerStock, adjustedDemand);
                
                // 4. 計算收入
                const revenue = actualSales * bread.price;
                
                // 5. 扣除庫存
                if (actualSales > 0) {
                    StockingSystem.consumeStock(bread.id, actualSales);
                }
                
                totalRevenue += revenue;
                totalSalesVolume += actualSales;
                
                salesDetail.push({
                    breadName: bread.name,
                    breadId: bread.id,
                    randomDemand,
                    adjustedDemand,
                    playerStock,
                    actualSales,
                    unitPrice: bread.price,
                    revenue
                });
                
                console.log(`🍞 ${bread.name}: 隨機需求=${randomDemand}, 調整需求=${adjustedDemand}, 進貨=${playerStock}, 實際銷售=${actualSales}, 收入=${revenue}`);
            });
            
            // 儲存更新後的庫存
            StockingSystem.saveInventory();
            
            return {
                totalRevenue,
                totalSalesVolume,
                salesDetail,
                regionCoef,
                economicCoef,
                optionCoefficient
            };
        },
        
        // 計算進貨成本
        calculateStockingCost(inventory, economicLevel) {
            let totalCost = 0;
            const economicCoef = EconomicMultipliers[economicLevel];
            
            BreadProducts.items.forEach(bread => {
                const quantity = inventory[bread.id] || 0;
                const cost = quantity * bread.cost * economicCoef;
                totalCost += cost;
            });
            
            return totalCost;
        }
    };
    
    // 財務報表系統
    const FinancialReport = {
        history: [],              // 歷史報表記錄
        currentRoundData: {       // 當前輪次數據（7 個事件）
            events: [],
            totalRevenue: 0,
            totalCost: 0,
            totalSalesVolume: 0,
            satisfactionChange: 0,
            reputationChange: 0,
            regionType: null,
            district: null,
            rentPaid: 0
        },
        
        // 記錄單次事件
        recordEvent(eventData, isStockingEvent = false) {
            console.log(`📝 記錄${isStockingEvent ? '進貨' : '事件'}: ${eventData.eventTitle}, 收入=${eventData.revenue}, 成本=${eventData.cost}, 滿意度=${eventData.satisfactionChange}, 聲望=${eventData.reputationChange}`);
            
            // 只有非進貨事件才計入 events 陣列
            if (!isStockingEvent) {
            this.currentRoundData.events.push(eventData);
            }
            
            this.currentRoundData.totalRevenue += eventData.revenue || 0;
            this.currentRoundData.totalCost += eventData.cost || 0;
            this.currentRoundData.totalSalesVolume += eventData.salesVolume || 0;
            this.currentRoundData.satisfactionChange += eventData.satisfactionChange || 0;
            this.currentRoundData.reputationChange += eventData.reputationChange || 0;
            
            console.log(`   累計: 收入=${this.currentRoundData.totalRevenue}, 成本=${this.currentRoundData.totalCost}, 銷售量=${this.currentRoundData.totalSalesVolume}`);
            console.log(`   地區: ${this.currentRoundData.regionType} - ${this.currentRoundData.district}`);
            
            // 顯示當前事件總數
            console.log(`   📊 當前事件數: ${this.currentRoundData.events.length}/${GameFlowManager.totalEventsPerRound}`);
            
            // 只有真實的事件（非進貨）才檢查是否完成所有事件
            if (!isStockingEvent && this.currentRoundData.events.length >= GameFlowManager.totalEventsPerRound) {
                console.log(`✅ 已完成${GameFlowManager.totalEventsPerRound}個事件，準備生成財務報表`);
                this.generateRoundReport();
            }
        },
        
        // 生成輪次報表
        generateRoundReport() {
            console.log('📊 開始生成財務報表...');
            console.log('   當前輪次數據:', JSON.stringify(this.currentRoundData, null, 2));
            
            // 使用 GameFlowManager.currentRound 作為輪次號碼，確保一致性
            const currentRoundNumber = GameFlowManager.currentRound;
            
            const report = {
                roundNumber: currentRoundNumber,
                timestamp: new Date().toISOString(),
                regionType: this.currentRoundData.regionType,
                district: this.currentRoundData.district,
                totalSalesVolume: this.currentRoundData.totalSalesVolume,
                totalRevenue: this.currentRoundData.totalRevenue,
                totalCost: this.currentRoundData.totalCost + this.currentRoundData.rentPaid,
                netProfit: this.currentRoundData.totalRevenue - (this.currentRoundData.totalCost + this.currentRoundData.rentPaid),
                satisfactionChange: this.currentRoundData.satisfactionChange,
                reputationChange: this.currentRoundData.reputationChange,
                events: [...this.currentRoundData.events]
            };
            
            this.history.push(report);
            this.saveReport();
            
            console.log(`✅ 第${report.roundNumber}輪財務報表生成完成:`);
            console.log(`   🏢 地區: ${report.regionType} - ${report.district}`);
            console.log(`   💰 總收入=${report.totalRevenue}, 總成本=${report.totalCost}, 淨利=${report.netProfit}`);
            console.log(`   📦 銷售量=${report.totalSalesVolume}, 滿意度=${report.satisfactionChange}, 聲望=${report.reputationChange}`);
            console.log('   完整報表:', report);
            
            // 重置當前輪次數據
            this.resetCurrentRound();
            
            return report;
        },
        
        // 重置當前輪次數據
        resetCurrentRound() {
            this.currentRoundData = {
                events: [],
                totalRevenue: 0,
                totalCost: 0,
                totalSalesVolume: 0,
                satisfactionChange: 0,
                reputationChange: 0,
                regionType: null,
                district: null,
                rentPaid: 0
            };
        },
        
        // 設置地區資訊
        setRegionInfo(regionType, district, actualRentPaid) {
            this.currentRoundData.regionType = regionType;
            this.currentRoundData.district = district;
            this.currentRoundData.rentPaid = actualRentPaid; // 記錄實際支付的租金（含係數）
            console.log(`✅ 財務報表設置地區: ${regionType} - ${district}, 租金=${actualRentPaid}`);
            console.log('   當前輪次數據:', this.currentRoundData);
        },
        
        // 儲存報表
        saveReport() {
            localStorage.setItem('financialReport', JSON.stringify(this.history));
        },
        
        // 載入報表
        loadReport() {
            const saved = localStorage.getItem('financialReport');
            if (saved) {
                try {
                    this.history = JSON.parse(saved);
                    console.log('✅ 財務報表載入成功，共', this.history.length, '個報表');
                } catch (e) {
                    console.warn('載入財務報表失敗:', e);
                    this.history = [];
                }
            } else {
                console.log('📊 沒有找到財務報表歷史記錄');
            }
        },
        
        // 手動修復財務報表（調試用）
        fixFinancialReport() {
            console.log('🔧 開始修復財務報表...');
            console.log('   當前輪次:', GameFlowManager.currentRound);
            console.log('   已完成事件:', GameFlowManager.eventsCompleted);
            console.log('   當前輪次事件數:', this.currentRoundData.events.length);
            console.log('   報表歷史數量:', this.history.length);
            
            // 如果當前輪次有足夠的事件但沒有報表，強制生成
            if (this.currentRoundData.events.length >= GameFlowManager.totalEventsPerRound) {
                const hasReport = this.history.some(report => report.roundNumber === GameFlowManager.currentRound);
                if (!hasReport) {
                    console.log('  → 強制生成缺失的財務報表');
                    this.generateRoundReport();
                    return true;
                }
            }
            
            console.log('  ✅ 財務報表狀態正常');
            return false;
        },
        
        // 顯示報表 UI
        showReport() {
            // 創建報表彈窗
            const modal = document.createElement('div');
            modal.className = 'financial-report-modal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease-in;
            `;
            modal.innerHTML = `
                <div class="modal-content custom-scrollbar" style="
                    background-color: transparent;
                    border: 4px solid #8b4513;
                    border-radius: 12px;
                    padding: 30px;
                    max-width: 500px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                    position: relative;
                    animation: modalSlideIn 0.3s ease-in;
                ">
                    <div class="modal-header">
                        <h2>📊 財務報表</h2>
                        <button class="close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        ${this.generateReportHTML()}
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // 關閉按鈕事件
            modal.querySelector('.close-btn').addEventListener('click', () => {
                document.body.removeChild(modal);
            });
            
            // 點擊背景關閉
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                }
            });
        },
        
        // 生成報表 HTML
        generateReportHTML() {
            if (this.history.length === 0) {
                return '<p>尚無財務記錄</p>';
            }
            
            const latestReport = this.history[this.history.length - 1];
            
            return `
                <div class="report-summary">
                    <h3>第${latestReport.roundNumber}輪財務摘要</h3>
                    <div class="summary-grid">
                        <div class="summary-item">
                            <span class="label">總銷售量:</span>
                            <span class="value">${latestReport.totalSalesVolume} 個</span>
                        </div>
                        <div class="summary-item">
                            <span class="label">總銷貨收入:</span>
                            <span class="value"><img src="assets/images/蜂蜜幣.png" style="width: 18px; height: 18px; vertical-align: middle; margin-right: 3px;">${latestReport.totalRevenue.toLocaleString()} HBC</span>
                        </div>
                        <div class="summary-item">
                            <span class="label">總成本:</span>
                            <span class="value"><img src="assets/images/蜂蜜幣.png" style="width: 18px; height: 18px; vertical-align: middle; margin-right: 3px;">${latestReport.totalCost.toLocaleString()} HBC</span>
                        </div>
                        <div class="summary-item">
                            <span class="label">淨利:</span>
                            <span class="value ${latestReport.netProfit >= 0 ? 'positive' : 'negative'}"><img src="assets/images/蜂蜜幣.png" style="width: 18px; height: 18px; vertical-align: middle; margin-right: 3px;">${latestReport.netProfit.toLocaleString()} HBC</span>
                        </div>
                        <div class="summary-item">
                            <span class="label">顧客滿意度變化:</span>
                            <span class="value ${latestReport.satisfactionChange >= 0 ? 'positive' : 'negative'}"><img src="assets/images/顧客滿意度.png" style="width: 18px; height: 18px; vertical-align: middle; margin-right: 3px;">${latestReport.satisfactionChange >= 0 ? '+' : ''}${latestReport.satisfactionChange}</span>
                        </div>
                        <div class="summary-item">
                            <span class="label">聲望變化:</span>
                            <span class="value ${latestReport.reputationChange >= 0 ? 'positive' : 'negative'}"><img src="assets/images/聲望.png" style="width: 18px; height: 18px; vertical-align: middle; margin-right: 3px;">${latestReport.reputationChange >= 0 ? '+' : ''}${latestReport.reputationChange}</span>
                        </div>
                    </div>
                </div>
                <div class="report-history">
                    <h3>歷史記錄</h3>
                    <div class="history-list">
                        ${this.history.map(report => `
                            <div class="history-item">
                                <span class="round">第${report.roundNumber}輪</span>
                                <span class="region">${report.regionType} - ${report.district}</span>
                                <span class="profit ${report.netProfit >= 0 ? 'positive' : 'negative'}"><img src="assets/images/蜂蜜幣.png" style="width: 18px; height: 18px; vertical-align: middle; margin-right: 3px;">${report.netProfit.toLocaleString()} HBC</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    };
    
    // 進貨系統
    const StockingSystem = {
        currentInventory: {},  // 當前庫存
        stockingHistory: [],   // 進貨歷史
        
        // 初始化庫存
        initInventory() {
            BreadProducts.items.forEach(bread => {
                this.currentInventory[bread.id] = 0;
            });
        },
        
        // 進貨
        stockBread(breadId, quantity, economicLevel) {
            if (!this.currentInventory.hasOwnProperty(breadId)) {
                this.currentInventory[breadId] = 0;
            }
            
            this.currentInventory[breadId] += quantity;
            
            // 記錄進貨歷史
            this.stockingHistory.push({
                breadId,
                quantity,
                economicLevel,
                timestamp: new Date().toISOString()
            });
            
            console.log(`📦 進貨: ${BreadProducts.getBreadById(breadId)?.name} x${quantity}`);
        },
        
        // 獲取當前庫存
        getCurrentInventory() {
            return { ...this.currentInventory };
        },
        
        // 獲取特定麵包庫存
        getBreadStock(breadId) {
            return this.currentInventory[breadId] || 0;
        },
        
        // 消耗庫存（銷售時使用）
        consumeStock(breadId, quantity) {
            if (this.currentInventory[breadId] >= quantity) {
                this.currentInventory[breadId] -= quantity;
                return true;
            }
            return false;
        },
        
        // 計算進貨成本
        calculateStockingCost(quantities, economicLevel) {
            let totalCost = 0;
            const economicCoef = EconomicMultipliers[economicLevel];
            
            BreadProducts.items.forEach(bread => {
                const quantity = quantities[bread.id] || 0;
                const cost = quantity * bread.cost * economicCoef;
                totalCost += cost;
            });
            
            return totalCost;
        },
        
        // 執行進貨
        executeStocking(quantities, economicLevel) {
            let totalCost = 0;
            const economicCoef = EconomicMultipliers[economicLevel];
            
            // 計算總成本
            BreadProducts.items.forEach(bread => {
                const quantity = quantities[bread.id] || 0;
                const cost = quantity * bread.cost * economicCoef;
                totalCost += cost;
                
                // 更新庫存
                if (quantity > 0) {
                    this.stockBread(bread.id, quantity, economicLevel);
                }
            });
            
            return totalCost;
        },
        
        // 重置庫存
        resetInventory() {
            this.initInventory();
        },
        
        // 儲存庫存到本地存儲
        saveInventory() {
            localStorage.setItem('currentInventory', JSON.stringify(this.currentInventory));
            localStorage.setItem('stockingHistory', JSON.stringify(this.stockingHistory));
        },
        
        // 從本地存儲載入庫存
        loadInventory() {
            const savedInventory = localStorage.getItem('currentInventory');
            const savedHistory = localStorage.getItem('stockingHistory');
            
            if (savedInventory) {
                try {
                    this.currentInventory = JSON.parse(savedInventory);
                } catch (e) {
                    this.initInventory();
                }
            } else {
                this.initInventory();
            }
            
            if (savedHistory) {
                try {
                    this.stockingHistory = JSON.parse(savedHistory);
                } catch (e) {
                    this.stockingHistory = [];
                }
            }
        }
    };
    
    // 檢查登入狀態（已移除登入檢查）
    function checkLoginStatus() {
        // 直接返回 true，不再檢查登入狀態
        return true;
    }
    
    // 初始化用戶資訊
    function initUserInfo() {
        // 檢查是否已經設定過玩家名稱
        const savedPlayerName = localStorage.getItem('playerName');
        const playerNameElement = document.querySelector('.player-name');
        
        if (savedPlayerName) {
            // 如果已經有保存的名稱，直接使用
            if (playerNameElement) {
                playerNameElement.textContent = savedPlayerName;
            }
        } else {
            // 如果沒有保存的名稱，顯示名稱輸入彈窗
            showPlayerNameInput();
        }
    }
    
    // 顯示玩家名稱輸入彈窗
    function showPlayerNameInput() {
        // 創建彈窗覆蓋層
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease-in;
        `;
        
        // 創建彈窗容器
        const modal = document.createElement('div');
        modal.style.cssText = `
            background-color: #f5e5c5;
            border: 4px solid #8b4513;
            border-radius: 12px;
            padding: 30px;
            max-width: 500px;
            width: 90%;
            text-align: center;
            box-shadow: 
                inset 2px 2px 0px rgba(255,255,255,0.6),
                inset -2px -2px 0px rgba(212, 165, 116, 0.3),
                0 8px 16px rgba(0,0,0,0.3);
            animation: modalSlideIn 0.3s ease-out;
        `;
        
        // 標題
        const title = document.createElement('h2');
        title.textContent = '歡迎來到小熊哥麵包坊！';
        title.style.cssText = `
            color: #8b4513;
            font-family: 'Zpix', 'Press Start 2P', monospace;
            font-size: 23px;
            margin-bottom: 20px;
            text-shadow: 2px 2px 0px rgba(222, 184, 135, 0.5);
        `;
        
        // 說明文字
        const description = document.createElement('p');
        description.textContent = '我該怎麼稱呼你呢？';
        description.style.cssText = `
            color: #654321;
            font-family: 'Zpix', 'Press Start 2P', monospace;
            font-size: 16px;
            margin-bottom: 20px;
        `;
        
        // 輸入框
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = '輸入你的名字...';
        input.maxLength = 20;
        input.style.cssText = `
            width: 100%;
            padding: 12px;
            font-family: 'Zpix', 'Press Start 2P', monospace;
            font-size: 16px;
            border: 3px solid #8b4513;
            border-radius: 8px;
            background-color: #fff;
            color: #654321;
            text-align: center;
            margin-bottom: 20px;
            box-sizing: border-box;
        `;
        
        // 按鈕容器
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 15px;
            justify-content: center;
        `;
        
        // 確認按鈕
        const confirmButton = document.createElement('button');
        confirmButton.textContent = '確認';
        confirmButton.style.cssText = `
            background-color: #daa520;
            border: 3px solid #8b4513;
            border-radius: 8px;
            color: #fff;
            font-family: 'Zpix', 'Press Start 2P', monospace;
            font-size: 15px;
            padding: 12px 24px;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 
                inset -2px -2px 0px rgba(0,0,0,0.3),
                inset 2px 2px 0px rgba(255,255,255,0.3);
        `;
        
        // 隨機名稱按鈕
        const randomButton = document.createElement('button');
        randomButton.textContent = '隨機名稱';
        randomButton.style.cssText = `
            background-color: #4CAF50;
            border: 3px solid #2E7D32;
            border-radius: 8px;
            color: #fff;
            font-family: 'Zpix', 'Press Start 2P', monospace;
            font-size: 15px;
            padding: 12px 24px;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 
                inset -2px -2px 0px rgba(0,0,0,0.3),
                inset 2px 2px 0px rgba(255,255,255,0.3);
        `;
        
        // 隨機名稱列表
        const randomNames = [
            '小熊店長', '麵包大師', '甜蜜熊', '烘焙師', '小熊老闆',
            '蜂蜜熊', '麵包熊', '甜點師', '小熊廚師', '烘焙熊',
            '甜蜜大師', '麵包師傅', '小熊師傅', '甜點熊', '烘焙大師'
        ];
        
        // 事件監聽器
        randomButton.addEventListener('click', () => {
            const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
            input.value = randomName;
        });
        
        confirmButton.addEventListener('click', () => {
            const playerName = input.value.trim();
            if (playerName) {
                // 保存玩家名稱
                localStorage.setItem('playerName', playerName);
                
                // 更新顯示的名稱
                const playerNameElement = document.querySelector('.player-name');
                if (playerNameElement) {
                    playerNameElement.textContent = playerName;
                }
                
                // 關閉彈窗
                overlay.style.animation = 'fadeOut 0.3s ease-out';
                modal.style.animation = 'modalSlideOut 0.3s ease-out';
                setTimeout(() => {
                    document.body.removeChild(overlay);
                }, 300);
                
                // 顯示歡迎訊息
                showMessage(`歡迎，${playerName}！開始你的麵包坊之旅吧！`, 'success');
            } else {
                showMessage('請輸入你的名字！', 'error');
            }
        });
        
        // 按 Enter 鍵確認
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                confirmButton.click();
            }
        });
        
        // 按鈕懸停效果
        [confirmButton, randomButton].forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-2px)';
            });
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translateY(0)';
            });
            button.addEventListener('mousedown', () => {
                button.style.transform = 'translateY(1px)';
            });
            button.addEventListener('mouseup', () => {
                button.style.transform = 'translateY(-2px)';
            });
        });
        
        // 組裝元素
        buttonContainer.appendChild(confirmButton);
        buttonContainer.appendChild(randomButton);
        
        modal.appendChild(title);
        modal.appendChild(description);
        modal.appendChild(input);
        modal.appendChild(buttonContainer);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // 自動聚焦到輸入框
        setTimeout(() => {
            input.focus();
        }, 100);
    }
    
    // 存檔管理功能
    function saveGameProgress() {
        // 獲取玩家名稱
        const playerName = localStorage.getItem('playerName') || 'BEAR';
        
        // 收集所有遊戲數據
        const gameData = {
            playerName: playerName,
            playerEmail: localStorage.getItem('playerEmail'),
            categoryProgress: localStorage.getItem('categoryProgress'),
            gameResources: localStorage.getItem('gameResources'),
            financialReport: localStorage.getItem('financialReport'),
            currentInventory: localStorage.getItem('currentInventory'),
            stockingHistory: localStorage.getItem('stockingHistory'),
            selectedRegion: localStorage.getItem('selectedRegion'),
            selectedDistrict: localStorage.getItem('selectedDistrict'),
            selectedCoefficient: localStorage.getItem('selectedCoefficient'),
            currentRound: localStorage.getItem('currentRound'),
            eventsCompleted: localStorage.getItem('eventsCompleted'),
            hasStocked: localStorage.getItem('hasStocked'),
            musicEnabled: localStorage.getItem('musicEnabled'),
            soundEnabled: localStorage.getItem('soundEnabled'),
            timestamp: new Date().toISOString()
        };
        
        // 轉換為 JSON 字符串
        const saveData = JSON.stringify(gameData, null, 2);
        
        // 創建下載鏈接
        const blob = new Blob([saveData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${playerName}_小熊哥麵包坊存檔_${new Date().toLocaleDateString()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showMessage(`${playerName}的存檔已下載！`, 'success');
    }
    
    // 載入存檔功能
    function loadGameProgress() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        const gameData = JSON.parse(e.target.result);
                        
                        // 恢復所有遊戲數據
                        if (gameData.playerName) localStorage.setItem('playerName', gameData.playerName);
                        if (gameData.playerEmail) localStorage.setItem('playerEmail', gameData.playerEmail);
                        if (gameData.categoryProgress) localStorage.setItem('categoryProgress', gameData.categoryProgress);
                        if (gameData.gameResources) localStorage.setItem('gameResources', gameData.gameResources);
                        if (gameData.financialReport) localStorage.setItem('financialReport', gameData.financialReport);
                        if (gameData.currentInventory) localStorage.setItem('currentInventory', gameData.currentInventory);
                        if (gameData.stockingHistory) localStorage.setItem('stockingHistory', gameData.stockingHistory);
                        if (gameData.selectedRegion) localStorage.setItem('selectedRegion', gameData.selectedRegion);
                        if (gameData.selectedDistrict) localStorage.setItem('selectedDistrict', gameData.selectedDistrict);
                        if (gameData.selectedCoefficient) localStorage.setItem('selectedCoefficient', gameData.selectedCoefficient);
                        if (gameData.currentRound) localStorage.setItem('currentRound', gameData.currentRound);
                        if (gameData.eventsCompleted) localStorage.setItem('eventsCompleted', gameData.eventsCompleted);
                        if (gameData.hasStocked) localStorage.setItem('hasStocked', gameData.hasStocked);
                        if (gameData.musicEnabled) localStorage.setItem('musicEnabled', gameData.musicEnabled);
                        if (gameData.soundEnabled) localStorage.setItem('soundEnabled', gameData.soundEnabled);
                        
                        const playerName = gameData.playerName || 'BEAR';
                        showMessage(`${playerName}的存檔載入成功！請重新整理頁面`, 'success');
                        setTimeout(() => {
                            window.location.reload();
                        }, 2000);
                    } catch (error) {
                        showMessage('存檔格式錯誤！', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }
    
    // 綁定電子郵件
    function bindEmail() {
        // 創建彈窗覆蓋層
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease-in;
        `;
        
        // 創建彈窗容器
        const modal = document.createElement('div');
        modal.style.cssText = `
            background-color: #f5e5c5;
            border: 4px solid #8b4513;
            border-radius: 12px;
            padding: 30px;
            max-width: 500px;
            width: 90%;
            text-align: center;
            box-shadow: 
                inset 2px 2px 0px rgba(255,255,255,0.6),
                inset -2px -2px 0px rgba(212, 165, 116, 0.3),
                0 8px 16px rgba(0,0,0,0.3);
            animation: modalSlideIn 0.3s ease-out;
        `;
        
        // 標題
        const title = document.createElement('h2');
        title.textContent = '📧 綁定電子郵件';
        title.style.cssText = `
            color: #8b4513;
            font-family: 'Zpix', 'Press Start 2P', monospace;
            font-size: 18px;
            margin-bottom: 20px;
            text-shadow: 2px 2px 0px rgba(222, 184, 135, 0.5);
        `;
        
        // 說明文字
        const description = document.createElement('p');
        description.innerHTML = `綁定電子郵件後，可以：<br>
            ✓ 保存進度到雲端<br>
            ✓ 在多個設備同步進度<br>
            ✓ 防止進度丟失`;
        description.style.cssText = `
            color: #654321;
            font-family: 'Zpix', 'Press Start 2P', monospace;
            font-size: 12px;
            margin-bottom: 20px;
            line-height: 1.8;
            text-align: left;
            background-color: rgba(255, 235, 205, 0.5);
            padding: 15px;
            border-radius: 8px;
            border: 2px solid #daa520;
        `;
        
        // 輸入框
        const input = document.createElement('input');
        input.type = 'email';
        input.placeholder = '輸入你的電子郵件...';
        input.style.cssText = `
            width: 100%;
            padding: 12px;
            font-family: 'Zpix', 'Press Start 2P', monospace;
            font-size: 12px;
            border: 3px solid #8b4513;
            border-radius: 8px;
            background-color: #fff;
            color: #654321;
            text-align: center;
            margin-bottom: 20px;
            box-sizing: border-box;
        `;
        
        // 按鈕容器
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 15px;
            justify-content: center;
        `;
        
        // 確認按鈕
        const confirmButton = document.createElement('button');
        confirmButton.textContent = '確認綁定';
        confirmButton.style.cssText = `
            background-color: #4CAF50;
            border: 3px solid #2E7D32;
            border-radius: 8px;
            color: #fff;
            font-family: 'Zpix', 'Press Start 2P', monospace;
            font-size: 12px;
            padding: 12px 24px;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 
                inset -2px -2px 0px rgba(0,0,0,0.3),
                inset 2px 2px 0px rgba(255,255,255,0.3);
        `;
        
        // 取消按鈕
        const cancelButton = document.createElement('button');
        cancelButton.textContent = '取消';
        cancelButton.style.cssText = `
            background-color: #f44336;
            border: 3px solid #d32f2f;
            border-radius: 8px;
            color: #fff;
            font-family: 'Zpix', 'Press Start 2P', monospace;
            font-size: 12px;
            padding: 12px 24px;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 
                inset -2px -2px 0px rgba(0,0,0,0.3),
                inset 2px 2px 0px rgba(255,255,255,0.3);
        `;
        
        // 事件監聽器
        confirmButton.addEventListener('click', () => {
            const email = input.value.trim();
            // 簡單的電子郵件驗證
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (email && emailRegex.test(email)) {
                // 保存電子郵件
                localStorage.setItem('playerEmail', email);
                
                // 關閉彈窗
                overlay.style.animation = 'fadeOut 0.3s ease-out';
                modal.style.animation = 'modalSlideOut 0.3s ease-out';
                setTimeout(() => {
                    document.body.removeChild(overlay);
                }, 300);
                
                // 顯示成功訊息
                showMessage(`已成功綁定：${email}`, 'success');
                
                // 重新載入設定頁面
                setTimeout(() => {
                    // 關閉當前設定頁面
                    const settingsOverlay = document.querySelector('.settings-overlay');
                    if (settingsOverlay) {
                        document.body.removeChild(settingsOverlay);
                    }
                    // 重新打開設定頁面
                    showSettingsScreen();
                }, 1000);
            } else if (!email) {
                showMessage('請輸入電子郵件！', 'error');
            } else {
                showMessage('請輸入有效的電子郵件格式！', 'error');
            }
        });
        
        cancelButton.addEventListener('click', () => {
            overlay.style.animation = 'fadeOut 0.3s ease-out';
            modal.style.animation = 'modalSlideOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(overlay);
            }, 300);
        });
        
        // 按 Enter 鍵確認
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                confirmButton.click();
            }
        });
        
        // 按鈕懸停效果
        [confirmButton, cancelButton].forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-2px)';
            });
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translateY(0)';
            });
            button.addEventListener('mousedown', () => {
                button.style.transform = 'translateY(1px)';
            });
            button.addEventListener('mouseup', () => {
                button.style.transform = 'translateY(-2px)';
            });
        });
        
        // 組裝元素
        buttonContainer.appendChild(confirmButton);
        buttonContainer.appendChild(cancelButton);
        
        modal.appendChild(title);
        modal.appendChild(description);
        modal.appendChild(input);
        modal.appendChild(buttonContainer);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // 自動聚焦到輸入框
        setTimeout(() => {
            input.focus();
        }, 100);
    }
    
    // 解除綁定電子郵件
    function unbindEmail() {
        const currentEmail = localStorage.getItem('playerEmail');
        
        showConfirmModal(
            '確認解除綁定',
            `確定要解除綁定電子郵件<br><strong>${currentEmail}</strong>嗎？<br><br>解除後將無法同步雲端進度。`,
            function() {
                // 確認，解除綁定
                localStorage.removeItem('playerEmail');
                showMessage('已解除綁定電子郵件', 'success');
                
                // 重新載入設定頁面
                setTimeout(() => {
                    // 關閉當前設定頁面
                    const settingsOverlay = document.querySelector('.settings-overlay');
                    if (settingsOverlay) {
                        document.body.removeChild(settingsOverlay);
                    }
                    // 重新打開設定頁面
                    showSettingsScreen();
                }, 1000);
            },
            function() {
                // 取消，不做任何事
            }
        );
    }
    
    // 修改玩家名稱
    function changePlayerName() {
        const currentName = localStorage.getItem('playerName') || 'BEAR';
        
        // 創建彈窗覆蓋層
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease-in;
        `;
        
        // 創建彈窗容器
        const modal = document.createElement('div');
        modal.style.cssText = `
            background-color: #f5e5c5;
            border: 4px solid #8b4513;
            border-radius: 12px;
            padding: 30px;
            max-width: 500px;
            width: 90%;
            text-align: center;
            box-shadow: 
                inset 2px 2px 0px rgba(255,255,255,0.6),
                inset -2px -2px 0px rgba(212, 165, 116, 0.3),
                0 8px 16px rgba(0,0,0,0.3);
            animation: modalSlideIn 0.3s ease-out;
        `;
        
        // 標題
        const title = document.createElement('h2');
        title.textContent = '🐻 修改店長名稱';
        title.style.cssText = `
            color: #8b4513;
            font-family: 'Zpix', 'Press Start 2P', monospace;
            font-size: 18px;
            margin-bottom: 20px;
            text-shadow: 2px 2px 0px rgba(222, 184, 135, 0.5);
        `;
        
        // 說明文字
        const description = document.createElement('p');
        description.textContent = `目前名稱：${currentName}`;
        description.style.cssText = `
            color: #654321;
            font-family: 'Zpix', 'Press Start 2P', monospace;
            font-size: 14px;
            margin-bottom: 20px;
        `;
        
        // 輸入框
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = '輸入新的名字...';
        input.maxLength = 20;
        input.value = currentName;
        input.style.cssText = `
            width: 100%;
            padding: 12px;
            font-family: 'Zpix', 'Press Start 2P', monospace;
            font-size: 14px;
            border: 3px solid #8b4513;
            border-radius: 8px;
            background-color: #fff;
            color: #654321;
            text-align: center;
            margin-bottom: 20px;
            box-sizing: border-box;
        `;
        
        // 按鈕容器
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 15px;
            justify-content: center;
        `;
        
        // 確認按鈕
        const confirmButton = document.createElement('button');
        confirmButton.textContent = '確認';
        confirmButton.style.cssText = `
            background-color: #daa520;
            border: 3px solid #8b4513;
            border-radius: 8px;
            color: #fff;
            font-family: 'Zpix', 'Press Start 2P', monospace;
            font-size: 12px;
            padding: 12px 24px;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 
                inset -2px -2px 0px rgba(0,0,0,0.3),
                inset 2px 2px 0px rgba(255,255,255,0.3);
        `;
        
        // 取消按鈕
        const cancelButton = document.createElement('button');
        cancelButton.textContent = '取消';
        cancelButton.style.cssText = `
            background-color: #f44336;
            border: 3px solid #d32f2f;
            border-radius: 8px;
            color: #fff;
            font-family: 'Zpix', 'Press Start 2P', monospace;
            font-size: 12px;
            padding: 12px 24px;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 
                inset -2px -2px 0px rgba(0,0,0,0.3),
                inset 2px 2px 0px rgba(255,255,255,0.3);
        `;
        
        // 事件監聽器
        confirmButton.addEventListener('click', () => {
            const newName = input.value.trim();
            if (newName && newName !== currentName) {
                // 保存新名稱
                localStorage.setItem('playerName', newName);
                
                // 更新顯示的名稱
        const playerNameElement = document.querySelector('.player-name');
                if (playerNameElement) {
                    playerNameElement.textContent = newName;
                }
                
                // 關閉彈窗
                overlay.style.animation = 'fadeOut 0.3s ease-out';
                modal.style.animation = 'modalSlideOut 0.3s ease-out';
                setTimeout(() => {
                    document.body.removeChild(overlay);
                }, 300);
                
                // 顯示成功訊息
                showMessage(`名稱已更改為：${newName}`, 'success');
            } else if (newName === currentName) {
                showMessage('名稱沒有改變！', 'info');
            } else {
                showMessage('請輸入有效名稱！', 'error');
            }
        });
        
        cancelButton.addEventListener('click', () => {
            overlay.style.animation = 'fadeOut 0.3s ease-out';
            modal.style.animation = 'modalSlideOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(overlay);
            }, 300);
        });
        
        // 按 Enter 鍵確認
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                confirmButton.click();
            }
        });
        
        // 按鈕懸停效果
        [confirmButton, cancelButton].forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-2px)';
            });
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translateY(0)';
            });
            button.addEventListener('mousedown', () => {
                button.style.transform = 'translateY(1px)';
            });
            button.addEventListener('mouseup', () => {
                button.style.transform = 'translateY(-2px)';
            });
        });
        
        // 組裝元素
        buttonContainer.appendChild(confirmButton);
        buttonContainer.appendChild(cancelButton);
        
        modal.appendChild(title);
        modal.appendChild(description);
        modal.appendChild(input);
        modal.appendChild(buttonContainer);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // 自動聚焦到輸入框並選中文字
        setTimeout(() => {
            input.focus();
            input.select();
        }, 100);
    }
    
    // 清除所有進度
    function clearAllProgress() {
        if (confirm('確定要清除所有遊戲進度嗎？此操作無法復原！')) {
            localStorage.clear();
            showMessage('所有進度已清除！重新開始遊戲', 'success');
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }
    }
    
    // 創建自定義確認彈窗
    function showConfirmModal(title, message, onConfirm, onCancel) {
        // 創建彈窗覆蓋層
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            animation: fadeIn 0.3s ease-out;
        `;
        
        // 創建彈窗主體
        const modal = document.createElement('div');
        modal.className = 'game-modal';
        modal.style.cssText = `
            background-color: #f5e5c5;
            border: 6px solid #8b4513;
            border-radius: 12px;
            padding: 25px;
            max-width: 350px;
            width: 90%;
            position: relative;
            box-shadow: 
                0 0 0 3px #654321,
                inset 0 0 0 3px #fff,
                inset 3px 3px 0 #fff,
                inset -3px -3px 0 #d4a574,
                0 15px 30px rgba(0, 0, 0, 0.4);
            animation: modalSlideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        `;
        
        // 創建小熊頭像
        const bearIcon = document.createElement('img');
        bearIcon.src = 'assets/images/dreamina-2025-10-07-9873-學習stardew valley的畫風生成小熊,溫暖麵包坊像素風,不需要場景_CocoAI_20251007_162855.PNG';
        bearIcon.alt = '小熊頭像';
        bearIcon.style.cssText = `
            width: 60px;
            height: 60px;
            border: none;
            border-radius: 0;
            margin: 0 auto 20px;
            display: block;
            object-fit: contain;
            background-color: transparent;
        `;
        
        // 創建標題
        const titleElement = document.createElement('h3');
        titleElement.textContent = title;
        titleElement.style.cssText = `
            color: #8b4513;
            font-size: 15px;
            text-align: center;
            margin-bottom: 15px;
            text-shadow: 1px 1px 0px #deb887;
            font-family: 'Zpix', 'Press Start 2P', monospace;
        `;
        
        // 創建訊息內容
        const messageElement = document.createElement('p');
        messageElement.textContent = message;
        messageElement.style.cssText = `
            color: #654321;
            font-size: 11px;
            text-align: center;
            margin-bottom: 25px;
            line-height: 1.6;
            font-family: 'Zpix', 'Press Start 2P', monospace;
        `;
        
        // 創建按鈕容器
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 15px;
            justify-content: center;
        `;
        
        // 創建確認按鈕
        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = '確定';
        confirmBtn.style.cssText = `
            padding: 10px 20px;
            background: linear-gradient(145deg, #ff6b6b, #e55555);
            border: 3px solid #cc4444;
            border-radius: 6px;
            color: white;
            font-family: 'Zpix', 'Press Start 2P', monospace;
            font-size: 10px;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 
                inset -2px -2px 0px #cc4444,
                inset 2px 2px 0px #ff8888,
                0 3px 6px rgba(0, 0, 0, 0.2);
        `;
        
        // 創建取消按鈕
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '取消';
        cancelBtn.style.cssText = `
            padding: 10px 20px;
            background: linear-gradient(145deg, #8b4513, #654321);
            border: 3px solid #5d3a1a;
            border-radius: 6px;
            color: white;
            font-family: 'Zpix', 'Press Start 2P', monospace;
            font-size: 10px;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 
                inset -2px -2px 0px #5d3a1a,
                inset 2px 2px 0px #a0522d,
                0 3px 6px rgba(0, 0, 0, 0.2);
        `;
        
        // 按鈕懸停效果
        confirmBtn.addEventListener('mouseenter', function() {
            this.style.background = 'linear-gradient(145deg, #e55555, #cc4444)';
            this.style.transform = 'translateY(-1px)';
        });
        
        confirmBtn.addEventListener('mouseleave', function() {
            this.style.background = 'linear-gradient(145deg, #ff6b6b, #e55555)';
            this.style.transform = 'translateY(0)';
        });
        
        cancelBtn.addEventListener('mouseenter', function() {
            this.style.background = 'linear-gradient(145deg, #654321, #5d3a1a)';
            this.style.transform = 'translateY(-1px)';
        });
        
        cancelBtn.addEventListener('mouseleave', function() {
            this.style.background = 'linear-gradient(145deg, #8b4513, #654321)';
            this.style.transform = 'translateY(0)';
        });
        
        // 按鈕點擊效果
        confirmBtn.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                closeModal();
                if (onConfirm) onConfirm();
            }, 100);
        });
        
        cancelBtn.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                closeModal();
                if (onCancel) onCancel();
            }, 100);
        });
        
        // 關閉彈窗函數
        function closeModal() {
            overlay.style.animation = 'fadeOut 0.3s ease-out';
            modal.style.animation = 'modalSlideOut 0.3s ease-in';
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 300);
        }
        
        // 點擊覆蓋層關閉彈窗
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeModal();
                if (onCancel) onCancel();
            }
        });
        
        // ESC鍵關閉彈窗
        function handleEscape(e) {
            if (e.key === 'Escape') {
                closeModal();
                if (onCancel) onCancel();
                document.removeEventListener('keydown', handleEscape);
            }
        }
        document.addEventListener('keydown', handleEscape);
        
        // 組裝彈窗
        buttonContainer.appendChild(cancelBtn);
        buttonContainer.appendChild(confirmBtn);
        modal.appendChild(bearIcon);
        modal.appendChild(titleElement);
        modal.appendChild(messageElement);
        modal.appendChild(buttonContainer);
        overlay.appendChild(modal);
        
        // 添加到頁面
        document.body.appendChild(overlay);
        
        // 聚焦到確認按鈕
        setTimeout(() => {
            confirmBtn.focus();
        }, 100);
    }

    
    // 檢查登入狀態
    if (!checkLoginStatus()) {
        return; // 如果未登入，直接返回
    }
    
    // 初始化頁面
    initUserInfo();
    
    // 初始化資源系統
    GameResources.loadResources();
    
    // 載入地區係數配置
    RegionCoefficientsManager.loadCoefficients();
    
    // 載入行銷題庫
    QuestionBank.loadQuestions();
    
    // 初始化進貨系統
    StockingSystem.loadInventory();
    
    // 載入財務報表
    FinancialReport.loadReport();
    
    // 確保進貨按鈕狀態正確恢復
    setTimeout(() => {
        if (window.updateStockButtonState) {
            window.updateStockButtonState();
        }
    }, 100);
    
    // 玩家資料點擊事件 - 打開設定畫面
        const playerInfo = document.querySelector('.player-info');
        if (playerInfo) {
        console.log('玩家資料元素找到了:', playerInfo);
        playerInfo.style.cursor = 'pointer';
        playerInfo.addEventListener('click', function(e) {
            console.log('玩家資料被點擊了！');
            e.stopPropagation();
            showSettingsScreen();
        });
        console.log('玩家資料點擊事件已綁定');
    } else {
        console.error('找不到玩家資料元素！');
    }
    
    // 導航按鈕功能已移到文件末尾，使用ContentManager
    
    // 顯示設定畫面 - 標籤頁式設計
    function showSettingsScreen() {
        // 創建遮罩層
        const overlay = document.createElement('div');
        overlay.className = 'settings-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            animation: fadeIn 0.3s ease-out;
        `;
        
        // 點擊遮罩層關閉設定
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeSettings();
            }
        });
        
        // 創建設定容器（彈窗）
        const settingsContainer = document.createElement('div');
        settingsContainer.className = 'settings-container';
        settingsContainer.style.cssText = `
            background-color: #f5e5c5;
            border: 7px solid #8b4513;
            border-radius: 14px;
            padding: 0;
            width: 960px;
            height: 720px;
            max-height: 90vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            position: relative;
                box-shadow: 
                0 0 0 4px #654321,
                inset 0 0 0 4px #fff,
                inset 4px 4px 0 #fff,
                inset -4px -4px 0 #d4a574,
                0 18px 36px rgba(0, 0, 0, 0.5);
            animation: modalSlideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        `;
        
        // 添加關閉按鈕（右上角 X）
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '✕';
        closeButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background-color: #d2691e;
            border: 3px solid #654321;
            border-radius: 50%;
            width: 35px;
            height: 35px;
            color: #fff;
            font-size: 18px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            box-shadow: 
                inset -2px -2px 0px rgba(0,0,0,0.3),
                inset 2px 2px 0px rgba(255,255,255,0.3);
            z-index: 10;
        `;
        
        closeButton.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
            this.style.backgroundColor = '#cd853f';
        });
        
        closeButton.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.backgroundColor = '#d2691e';
        });
        
        closeButton.addEventListener('click', closeSettings);
        
        // 創建標籤頁容器
        const tabContainer = document.createElement('div');
        tabContainer.className = 'settings-tab-container';
        tabContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            height: 100%;
        `;
        
        // 創建標籤頁標題欄
        const tabHeader = document.createElement('div');
        tabHeader.className = 'settings-tab-header';
        tabHeader.style.cssText = `
            display: flex;
            background-color: #f5e5c5;
            border-bottom: 3px solid #8b4513;
            position: relative;
        `;
        
        // 創建標籤頁按鈕
        const playerDataTab = document.createElement('button');
        playerDataTab.className = 'settings-tab active';
        playerDataTab.textContent = '玩家資料';
        playerDataTab.style.cssText = `
            flex: 1;
            padding: 18px 24px;
            background-color: #f5e5c5;
            border: none;
            border-right: 2px solid #8b4513;
            color: #654321;
            font-family: 'Zpix', 'Press Start 2P', monospace;
            font-size: 20px;
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
            z-index: 2;
            transform: translateY(3px);
        `;
        
        const gameSettingsTab = document.createElement('button');
        gameSettingsTab.className = 'settings-tab';
        gameSettingsTab.textContent = '遊戲設定';
        gameSettingsTab.style.cssText = `
            flex: 1;
            padding: 18px 24px;
            background-color: #d4a574;
            border: none;
            color: #654321;
            font-family: 'Zpix', 'Press Start 2P', monospace;
            font-size: 20px;
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
            z-index: 1;
        `;
        
        // 標籤頁切換功能
        function switchTab(activeTab, inactiveTab) {
            activeTab.className = 'settings-tab active';
            activeTab.style.cssText = `
                flex: 1;
                padding: 15px 20px;
                background-color: #f5e5c5;
                border: none;
                border-right: 2px solid #8b4513;
                color: #654321;
                font-family: 'Zpix', 'Press Start 2P', monospace;
                font-size: 16.8px;
                cursor: pointer;
                transition: all 0.2s ease;
                position: relative;
                z-index: 2;
                transform: translateY(3px);
            `;
            
            inactiveTab.className = 'settings-tab';
            inactiveTab.style.cssText = `
                flex: 1;
                padding: 15px 20px;
                background-color: #d4a574;
                border: none;
                color: #654321;
                font-family: 'Zpix', 'Press Start 2P', monospace;
                font-size: 16.8px;
                cursor: pointer;
                transition: all 0.2s ease;
                position: relative;
                z-index: 1;
            `;
        }
        
        playerDataTab.addEventListener('click', () => {
            switchTab(playerDataTab, gameSettingsTab);
            showPlayerDataContent();
        });
        
        gameSettingsTab.addEventListener('click', () => {
            switchTab(gameSettingsTab, playerDataTab);
            showGameSettingsContent();
        });
        
        // 創建內容區域
        const contentArea = document.createElement('div');
        contentArea.className = 'settings-content-area';
        contentArea.style.cssText = `
            flex: 1;
            display: flex;
            background-color: #f5e5c5;
            overflow: hidden;
        `;
        
        // 關閉設定函數
        function closeSettings() {
            overlay.style.animation = 'fadeOut 0.3s ease-out';
            settingsContainer.style.animation = 'modalSlideOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(overlay);
            }, 300);
        }
        
        // 顯示玩家資料內容
        function showPlayerDataContent() {
            contentArea.innerHTML = '';
            
            // 左側玩家資訊面板
            const leftPanel = document.createElement('div');
            leftPanel.className = 'player-info-panel';
            leftPanel.style.cssText = `
                width: 320px;
            background-color: rgba(255, 239, 213, 0.9);
                border-right: 4px solid #8b4513;
            padding: 24px;
                display: flex;
                flex-direction: column;
                gap: 24px;
                flex-shrink: 0;
            `;
            
            // 頭像區域
            const avatarSection = document.createElement('div');
            avatarSection.style.cssText = `
                text-align: center;
                padding: 24px;
                background-color: transparent;
                border: none;
                border-radius: 10px;
                margin-bottom: 20px;
            `;
            
            const avatarDisplay = document.createElement('div');
            avatarDisplay.className = 'avatar-display';
            avatarDisplay.style.cssText = `
                width: 224px;
                height: 224px;
                background-color: rgba(255, 255, 255, 0.8);
                border: 4px solid #8b4513;
                border-radius: 16px;
                margin: 0 auto;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 74px;
                color: #654321;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            `;
            
            // 獲取當前選中的頭像
            const currentAvatar = localStorage.getItem('selectedAvatar') || 'avatar1';
            const avatarOptions = [
                { id: 'avatar1', image: 'assets/images/頭像1.png', name: '頭像1' },
                { id: 'avatar2', image: 'assets/images/頭像2.png', name: '頭像2' },
                { id: 'avatar3', image: 'assets/images/頭像3.png', name: '頭像3' },
                { id: 'avatar4', image: 'assets/images/頭像4.png', name: '頭像4' },
                { id: 'avatar5', image: 'assets/images/頭像5.png', name: '頭像5' },
                { id: 'avatar6', image: 'assets/images/頭像6.png', name: '頭像6' }
            ];
            
            const selectedAvatar = avatarOptions.find(avatar => avatar.id === currentAvatar);
            if (selectedAvatar) {
                avatarDisplay.innerHTML = `<img src="${selectedAvatar.image}" alt="${selectedAvatar.name}" style="width: 100%; height: 100%; object-fit: contain;">`;
            } else {
                avatarDisplay.innerHTML = `<img src="assets/images/頭像1.png" alt="頭像1" style="width: 100%; height: 100%; object-fit: contain;">`;
            }
            
            avatarSection.appendChild(avatarDisplay);
            
            // 玩家資訊
            const playerInfo = document.createElement('div');
            playerInfo.style.cssText = `
                display: flex;
                flex-direction: column;
                gap: 15px;
            `;
            
            const userName = localStorage.getItem('playerName') || 'BEAR';
            const userEmail = localStorage.getItem('playerEmail') || null;
            
            const playerNameInfo = document.createElement('div');
            playerNameInfo.style.cssText = `
                display: flex;
                justify-content: space-between;
                font-size: 16.8px;
                color: #654321;
                font-family: 'Zpix', 'Press Start 2P', monospace;
            `;
            playerNameInfo.innerHTML = `<span>玩家名稱 :</span><span>${userName}</span>`;
        
            const userEmailInfo = document.createElement('div');
            userEmailInfo.style.cssText = `
                display: flex;
                justify-content: space-between;
                font-size: 16.8px;
                color: #654321;
                font-family: 'Zpix', 'Press Start 2P', monospace;
            `;
        
        if (userEmail) {
            // 已綁定電子郵件
            userEmailInfo.innerHTML = `
                    <span>電子郵件 :</span>
                    <span style="color: #2E7D32;">${userEmail}</span>
            `;
        } else {
            // 未綁定電子郵件
            userEmailInfo.innerHTML = `
                    <span>電子郵件 :</span>
                    <span style="color: #f44336;">未綁定</span>
                `;
            }
            
            playerInfo.appendChild(playerNameInfo);
            playerInfo.appendChild(userEmailInfo);
            
            // 按鈕區域
            const buttonArea = document.createElement('div');
            buttonArea.style.cssText = `
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin-top: auto;
            `;
            
            // 綁定/解綁郵件按鈕
            const emailButton = document.createElement('button');
            emailButton.textContent = userEmail ? '解除綁定' : '綁定郵件';
            emailButton.style.cssText = `
                background-color: ${userEmail ? '#f44336' : '#4CAF50'};
                border: 2px solid ${userEmail ? '#d32f2f' : '#2E7D32'};
                border-radius: 6px;
                color: #fff;
                font-family: 'Zpix', 'Press Start 2P', monospace;
                font-size: 14.4px;
                padding: 8px 16px;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 
                    inset -2px -2px 0px rgba(0,0,0,0.3),
                    inset 2px 2px 0px rgba(255,255,255,0.3);
            `;
        
        emailButton.addEventListener('click', () => {
            if (userEmail) {
                // 解除綁定
                unbindEmail();
            } else {
                // 綁定郵件
                bindEmail();
            }
        });
        
        emailButton.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        emailButton.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
        
            buttonArea.appendChild(emailButton);
            
            // 存檔管理按鈕
            const saveButton = createButton('備份存檔', '#4CAF50', saveGameProgress);
            const loadButton = createButton('載入存檔', '#2196F3', loadGameProgress);
            const clearButton = createButton('清除進度', '#f44336', clearAllProgress);
            
            buttonArea.appendChild(saveButton);
            buttonArea.appendChild(loadButton);
            buttonArea.appendChild(clearButton);
            
            leftPanel.appendChild(avatarSection);
            leftPanel.appendChild(playerInfo);
            leftPanel.appendChild(buttonArea);
            
            // 右側內容區域
            const rightPanel = document.createElement('div');
            rightPanel.className = 'player-content-panel';
            rightPanel.style.cssText = `
                flex: 1;
                display: flex;
                flex-direction: column;
                background-color: rgba(255, 255, 255, 0.3);
                min-width: 0;
            `;
            
            // 子標籤頁
            const subTabHeader = document.createElement('div');
            subTabHeader.style.cssText = `
                display: flex;
                background-color: #f5e5c5;
                border-bottom: 2px solid #8b4513;
            `;
            
            const avatarSubTab = document.createElement('button');
            avatarSubTab.className = 'sub-tab active';
            avatarSubTab.textContent = '頭像';
            avatarSubTab.style.cssText = `
                flex: 1;
                padding: 14px;
                background-color: #f5e5c5;
                border: none;
                border-right: 1px solid #8b4513;
                color: #654321;
                font-family: 'Zpix', 'Press Start 2P', monospace;
                font-size: 17px;
                cursor: pointer;
                transition: all 0.2s ease;
            `;
            
            const achievementSubTab = document.createElement('button');
            achievementSubTab.className = 'sub-tab';
            achievementSubTab.textContent = '成就';
            achievementSubTab.style.cssText = `
                flex: 1;
                padding: 14px;
                background-color: #d4a574;
                border: none;
                border-right: 1px solid #8b4513;
                color: #654321;
                font-family: 'Zpix', 'Press Start 2P', monospace;
                font-size: 17px;
                cursor: pointer;
                transition: all 0.2s ease;
            `;
            
            
            // 子標籤頁內容區域
            const subContentArea = document.createElement('div');
            subContentArea.className = 'sub-content-area';
            subContentArea.style.cssText = `
                flex: 1;
                padding: 16px 20px;
                background-color: rgba(255, 255, 255, 0.5);
                display: flex;
                flex-direction: column;
                color: #654321;
                font-family: 'Zpix', 'Press Start 2P', monospace;
                font-size: 20px;
                overflow-y: auto;
            `;
            subContentArea.classList.add('custom-scrollbar');
            
            // 頭像選項
            const avatarOptionsForSelection = [
                { id: 'avatar1', image: 'assets/images/頭像1.png', name: '頭像1' },
                { id: 'avatar2', image: 'assets/images/頭像2.png', name: '頭像2' },
                { id: 'avatar3', image: 'assets/images/頭像3.png', name: '頭像3' },
                { id: 'avatar4', image: 'assets/images/頭像4.png', name: '頭像4' },
                { id: 'avatar5', image: 'assets/images/頭像5.png', name: '頭像5' },
                { id: 'avatar6', image: 'assets/images/頭像6.png', name: '頭像6' }
            ];
            
            // 創建頭像選擇內容
            function createAvatarSelection() {
                subContentArea.innerHTML = '';
                
                // 標題
                const title = document.createElement('div');
                title.textContent = '選擇頭像';
                title.style.cssText = `
                    font-size: 23px;
                    font-weight: bold;
                    margin-bottom: 20px;
                    text-align: center;
                    color: #654321;
                `;
                
                // 頭像網格
                const avatarGrid = document.createElement('div');
                avatarGrid.style.cssText = `
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 14px;
                    width: 100%;
                    height: fit-content;
                    padding: 16px;
                    box-sizing: border-box;
                    justify-items: center;
                    align-items: center;
                `;
                
                // 獲取當前選中的頭像
                const currentAvatar = localStorage.getItem('selectedAvatar') || 'avatar1';
                
                avatarOptionsForSelection.forEach(avatar => {
                    const avatarItem = document.createElement('div');
                    avatarItem.className = 'avatar-option';
                    avatarItem.dataset.avatarId = avatar.id;
                    
                    const isSelected = avatar.id === currentAvatar;
                    
                    avatarItem.style.cssText = `
                        width: 100px;
                        height: 100px;
                        background-color: ${isSelected ? '#ffd700' : '#f5e5c5'};
                        border: ${isSelected ? '3px solid #8b4513' : '2px solid #8b4513'};
                        border-radius: 10px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        box-shadow: ${isSelected ? '0 4px 8px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.2)'};
                        overflow: hidden;
                        flex-shrink: 0;
                    `;
                    
                    // 創建圖片元素
                    const avatarImage = document.createElement('img');
                    avatarImage.src = avatar.image;
                    avatarImage.alt = avatar.name;
                    avatarImage.style.cssText = `
                        width: 90%;
                        height: 90%;
                        object-fit: contain;
                        image-rendering: pixelated;
                    `;
                    
                    avatarItem.appendChild(avatarImage);
                    
                    // 點擊事件
                    avatarItem.addEventListener('click', () => {
                        // 移除所有選中狀態
                        document.querySelectorAll('.avatar-option').forEach(item => {
                            item.style.backgroundColor = '#f5e5c5';
                            item.style.border = '2px solid #8b4513';
                            item.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                        });
                        
                        // 設置當前選中
                        avatarItem.style.backgroundColor = '#ffd700';
                        avatarItem.style.border = '4px solid #8b4513';
                        avatarItem.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                        
                        // 保存選擇
                        localStorage.setItem('selectedAvatar', avatar.id);
                        
                        // 更新左側頭像顯示
                        const leftAvatar = document.querySelector('.avatar-display');
                        if (leftAvatar) {
                            leftAvatar.innerHTML = `<img src="${avatar.image}" alt="${avatar.name}" style="width: 100%; height: 100%; object-fit: contain; image-rendering: pixelated;">`;
                        }
                        
                        // 更新頂部頭像
                        const topAvatar = document.querySelector('.player-avatar');
                        if (topAvatar) {
                            topAvatar.innerHTML = `<img src="${avatar.image}" alt="${avatar.name}" style="width: 100%; height: 100%; object-fit: contain; image-rendering: pixelated;">`;
                        }
                        
                        showMessage(`已選擇頭像：${avatar.name}`, 'success');
                    });
                    
                    // 懸停效果
                    avatarItem.addEventListener('mouseenter', function() {
                        if (!isSelected) {
                            this.style.backgroundColor = '#ffed4e';
                            this.style.transform = 'scale(1.05)';
                        }
                    });
                    
                    avatarItem.addEventListener('mouseleave', function() {
                        if (!isSelected) {
                            this.style.backgroundColor = '#f5e5c5';
                            this.style.transform = 'scale(1)';
                        }
                    });
                    
                    avatarGrid.appendChild(avatarItem);
                });
                
                subContentArea.appendChild(title);
                subContentArea.appendChild(avatarGrid);
            }
            
            // 成就系統
            window.AchievementSystem = {
                achievements: [
                    // 資源累積類成就
                    { id: 'honey_100k', title: '蜂蜜富翁', description: '累積獲得 100,000 蜂蜜幣', icon: '🍯', category: 'resource', condition: { type: 'total_honey', value: 100000 } },
                    { id: 'honey_500k', title: '蜂蜜大亨', description: '累積獲得 500,000 蜂蜜幣', icon: '💰', category: 'resource', condition: { type: 'total_honey', value: 500000 } },
                    { id: 'honey_1m', title: '蜂蜜皇帝', description: '累積獲得 1,000,000 蜂蜜幣', icon: '👑', category: 'resource', condition: { type: 'total_honey', value: 1000000 } },
                    { id: 'satisfaction_100', title: '滿意度達人', description: '顧客滿意度達到 100', icon: '😊', category: 'resource', condition: { type: 'satisfaction', value: 100 } },
                    { id: 'reputation_200', title: '聲望之星', description: '聲望達到 200', icon: '⭐', category: 'resource', condition: { type: 'reputation', value: 200 } },
                    { id: 'medals_50', title: '勳章收集家', description: '勳章數量達到 50', icon: '🏅', category: 'resource', condition: { type: 'medals', value: 50 } },
                    
                    // 麵包數量相關成就
                    { id: 'bread_100', title: '麵包學徒', description: '累積販售 100 個麵包', icon: '🥖', category: 'resource', condition: { type: 'total_bread', value: 100 } },
                    { id: 'bread_500', title: '麵包師傅', description: '累積販售 500 個麵包', icon: '🥐', category: 'resource', condition: { type: 'total_bread', value: 500 } },
                    { id: 'bread_1000', title: '麵包大師', description: '累積販售 1,000 個麵包', icon: '🍞', category: 'resource', condition: { type: 'total_bread', value: 1000 } },
                    { id: 'bread_5000', title: '麵包傳奇', description: '累積販售 5,000 個麵包', icon: '🥨', category: 'resource', condition: { type: 'total_bread', value: 5000 } },
                    { id: 'bread_10000', title: '麵包之神', description: '累積販售 10,000 個麵包', icon: '👑', category: 'resource', condition: { type: 'total_bread', value: 10000 } },
                    
                    // 答題成就
                    { id: 'correct_10', title: '初學者', description: '答對 10 題', icon: '📚', category: 'quiz', condition: { type: 'correct_answers', value: 10 } },
                    { id: 'correct_50', title: '學習者', description: '答對 50 題', icon: '🎓', category: 'quiz', condition: { type: 'correct_answers', value: 50 } },
                    { id: 'correct_100', title: '專家', description: '答對 100 題', icon: '🧠', category: 'quiz', condition: { type: 'correct_answers', value: 100 } },
                    { id: 'correct_200', title: '大師', description: '答對 200 題', icon: '🎯', category: 'quiz', condition: { type: 'correct_answers', value: 200 } },
                    { id: 'perfect_quiz', title: '完美主義者', description: '單次測驗答對 10 題', icon: '💯', category: 'quiz', condition: { type: 'perfect_quiz', value: 1 } },
                    { id: 'streak_20', title: '連勝王', description: '連續答對 20 題', icon: '🔥', category: 'quiz', condition: { type: 'streak', value: 20 } },
                    
                    // 排行榜成就
                    { id: 'top_5', title: '競爭者', description: '在排行榜中進入前 5 名', icon: '🏆', category: 'leaderboard', condition: { type: 'top_rank', value: 5 } },
                    { id: 'top_3', title: '挑戰者', description: '在排行榜中進入前 3 名', icon: '🥉', category: 'leaderboard', condition: { type: 'top_rank', value: 3 } },
                    { id: 'champion', title: '冠軍', description: '在排行榜中獲得第 1 名', icon: '👑', category: 'leaderboard', condition: { type: 'top_rank', value: 1 } },
                    
                    // 特殊成就（包含原扭蛋成就）
                    { id: 'login_7', title: '堅持不懈', description: '連續登入 7 天', icon: '📅', category: 'special', condition: { type: 'login_streak', value: 7 } },
                    { id: 'quiz_10', title: '勤奮學習', description: '完成 10 次測驗', icon: '📖', category: 'special', condition: { type: 'quiz_completed', value: 10 } },
                    { id: 'chat_5', title: '社交達人', description: '使用聊天室 5 次', icon: '💬', category: 'special', condition: { type: 'chat_used', value: 5 } },
                    { id: 'gashapon_5', title: '扭蛋新手', description: '進行 5 次扭蛋', icon: '🎰', category: 'special', condition: { type: 'gashapon_count', value: 5 } },
                    { id: 'gashapon_20', title: '扭蛋達人', description: '進行 20 次扭蛋', icon: '🎲', category: 'special', condition: { type: 'gashapon_count', value: 20 } },
                    { id: 'lucky_draw', title: '幸運兒', description: '單次扭蛋獲得 3 個獎品', icon: '🍀', category: 'special', condition: { type: 'lucky_draw', value: 1 } },
                    { id: 'gashapon_50', title: '扭蛋收藏家', description: '進行 50 次扭蛋', icon: '🎪', category: 'special', condition: { type: 'gashapon_count', value: 50 } }
                ],
                
                // 載入成就進度
                loadProgress() {
                    const saved = localStorage.getItem('achievementProgress');
                    if (saved) {
                        try {
                            this.progress = JSON.parse(saved);
                        } catch (e) {
                            this.progress = {};
                        }
                    } else {
                        this.progress = {};
                    }
                },
                
                // 儲存成就進度
                saveProgress() {
                    localStorage.setItem('achievementProgress', JSON.stringify(this.progress));
                },
                
                // 檢查成就進度
                checkProgress(type, value) {
                    this.loadProgress();
                    
                    this.achievements.forEach(achievement => {
                        if (achievement.condition.type === type) {
                            const currentValue = this.progress[achievement.id] || 0;
                            
                            if (type === 'total_honey' || type === 'total_bread') {
                                this.progress[achievement.id] = Math.max(currentValue, value);
                            } else if (type === 'correct_answers' || type === 'gashapon_count') {
                                this.progress[achievement.id] = currentValue + value;
                            } else {
                                this.progress[achievement.id] = Math.max(currentValue, value);
                            }
                            
                            // 檢查是否達成成就
                            if (this.progress[achievement.id] >= achievement.condition.value && !this.isUnlocked(achievement.id)) {
                                this.unlockAchievement(achievement.id);
                            }
                        }
                    });
                    
                    this.saveProgress();
                },
                
                // 解鎖成就
                unlockAchievement(achievementId) {
                    const unlocked = this.getUnlockedAchievements();
                    if (!unlocked.includes(achievementId)) {
                        unlocked.push(achievementId);
                        localStorage.setItem('unlockedAchievements', JSON.stringify(unlocked));
                        
                        // 顯示成就解鎖通知
                        this.showUnlockNotification(achievementId);
                    }
                },
                
                // 獲取已解鎖的成就
                getUnlockedAchievements() {
                    const saved = localStorage.getItem('unlockedAchievements');
                    return saved ? JSON.parse(saved) : [];
                },
                
                // 檢查成就是否已解鎖
                isUnlocked(achievementId) {
                    return this.getUnlockedAchievements().includes(achievementId);
                },
                
                // 顯示成就解鎖通知
                showUnlockNotification(achievementId) {
                    const achievement = this.achievements.find(a => a.id === achievementId);
                    if (achievement) {
                        showMessage(`🏆 成就解鎖：${achievement.title}`, 'success');
                    }
                }
            };
            
            // 創建成就內容
            function createAchievementContent() {
                subContentArea.innerHTML = '';
                
                // 成就分類標籤
                const categoryTabs = document.createElement('div');
                categoryTabs.className = 'category-tabs';
                categoryTabs.style.cssText = `
                    display: flex;
                    gap: 12px;
                    margin-bottom: 20px;
                    margin-top: -30px;
                    justify-content: center;
                    flex-wrap: wrap;
                `;
                
                const categories = [
                    { id: 'all', name: '全部', icon: '🏆' },
                    { id: 'resource', name: '資源', icon: '💰' },
                    { id: 'quiz', name: '答題', icon: '📚' },
                    { id: 'leaderboard', name: '排行榜', icon: '🏆' },
                    { id: 'special', name: '特殊', icon: '⭐' }
                ];
                
                categories.forEach(category => {
                    const tab = document.createElement('button');
                    tab.textContent = `${category.icon} ${category.name}`;
                    tab.className = `category-tab ${category.id === 'leaderboard' ? 'leaderboard' : ''}`;
                    tab.style.cssText = `
                        padding: 12px 19px;
                        background-color: #d4a574;
                        border: 2px solid #8b4513;
                        border-radius: 10px;
                        color: #654321;
                        font-family: 'Zpix', 'Press Start 2P', monospace;
                        font-size: 13px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        min-width: 96px;
                        white-space: nowrap;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 7px;
                    `;
                    
                    if (category.id === 'all') {
                        tab.style.backgroundColor = '#f5e5c5';
                    }
                    
                    // 特別調整排行榜標籤的寬度
                    if (category.id === 'leaderboard') {
                        tab.style.minWidth = '120px';
                        tab.style.fontSize = '12px';
                    }
                    
                    tab.addEventListener('click', () => {
                        // 重置所有標籤樣式
                        categoryTabs.querySelectorAll('button').forEach(btn => {
                            btn.style.backgroundColor = '#d4a574';
                        });
                        tab.style.backgroundColor = '#f5e5c5';
                        
                        // 顯示對應分類的成就
                        showAchievementsByCategory(category.id);
                    });
                    
                    categoryTabs.appendChild(tab);
                });
                
                // 成就列表容器
                const achievementList = document.createElement('div');
                achievementList.id = 'achievementList';
                achievementList.style.cssText = `
                    max-height: 360px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    padding: 0 8px;
                    width: 100%;
                    box-sizing: border-box;
                `;
                achievementList.classList.add('custom-scrollbar');
                
                subContentArea.appendChild(categoryTabs);
                subContentArea.appendChild(achievementList);
                
                // 初始顯示全部成就
                showAchievementsByCategory('all');
            }
            
            // 顯示指定分類的成就
            function showAchievementsByCategory(categoryId) {
                const achievementList = document.getElementById('achievementList');
                achievementList.innerHTML = '';
                
                AchievementSystem.loadProgress();
                const unlockedAchievements = AchievementSystem.getUnlockedAchievements();
                
                const filteredAchievements = categoryId === 'all' 
                    ? AchievementSystem.achievements 
                    : AchievementSystem.achievements.filter(a => a.category === categoryId);
                
                filteredAchievements.forEach(achievement => {
                    const isUnlocked = unlockedAchievements.includes(achievement.id);
                    const progress = AchievementSystem.progress[achievement.id] || 0;
                    const conditionValue = achievement.condition.value;
                    
                    const achievementItem = document.createElement('div');
                    achievementItem.style.cssText = `
                        display: flex;
                        align-items: center;
                        padding: 12px 16px;
                        background-color: ${isUnlocked ? 'rgba(255, 215, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'};
                        border: 2px solid ${isUnlocked ? '#ffd700' : '#8b4513'};
                        border-radius: 10px;
                        opacity: ${isUnlocked ? '1' : '0.7'};
                        width: 100%;
                        box-sizing: border-box;
                    `;
                    
                    // 成就圖標
                    const icon = document.createElement('div');
                    icon.textContent = achievement.icon;
                    icon.style.cssText = `
                        font-size: 28px;
                        margin-right: 12px;
                        filter: ${isUnlocked ? 'none' : 'grayscale(100%)'};
                        flex-shrink: 0;
                    `;
                    
                    // 成就資訊
                    const info = document.createElement('div');
                    info.style.cssText = `
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        gap: 4px;
                        min-width: 0;
                    `;
                
                const title = document.createElement('div');
                    title.textContent = achievement.title;
                title.style.cssText = `
                        font-size: 17px;
                    font-weight: bold;
                        color: ${isUnlocked ? '#654321' : '#8b4513'};
                        line-height: 1.2;
                    `;
                    
                    const description = document.createElement('div');
                    description.textContent = achievement.description;
                    description.style.cssText = `
                        font-size: 14px;
                        color: #8b4513;
                        line-height: 1.3;
                    `;
                    
                    // 進度條
                    const progressBar = document.createElement('div');
                    progressBar.style.cssText = `
                        width: 100%;
                        height: 8px;
                        background-color: #d4a574;
                        border-radius: 4px;
                        overflow: hidden;
                        margin-top: 4px;
                    `;
                    
                    const progressFill = document.createElement('div');
                    const progressPercent = Math.min((progress / conditionValue) * 100, 100);
                    progressFill.style.cssText = `
                        width: ${progressPercent}%;
                        height: 100%;
                        background-color: ${isUnlocked ? '#ffd700' : '#8b4513'};
                        transition: width 0.3s ease;
                    `;
                    
                    progressBar.appendChild(progressFill);
                    
                    // 進度文字
                    const progressText = document.createElement('div');
                    progressText.textContent = isUnlocked ? '✅ 已完成' : `${progress}/${conditionValue}`;
                    progressText.style.cssText = `
                        font-size: 12px;
                        color: ${isUnlocked ? '#654321' : '#8b4513'};
                        text-align: right;
                        margin-top: 2px;
                    `;
                    
                    info.appendChild(title);
                    info.appendChild(description);
                    info.appendChild(progressBar);
                    info.appendChild(progressText);
                    
                    achievementItem.appendChild(icon);
                    achievementItem.appendChild(info);
                    achievementList.appendChild(achievementItem);
                });
            }
            
            
            // 子標籤頁切換功能
            function switchSubTab(activeTab, inactiveTabs) {
                activeTab.className = 'sub-tab active';
                activeTab.style.backgroundColor = '#f5e5c5';
                
                inactiveTabs.forEach(tab => {
                    tab.className = 'sub-tab';
                    tab.style.backgroundColor = '#d4a574';
                });
                
                // 更新內容
                if (activeTab === avatarSubTab) {
                    createAvatarSelection();
                } else if (activeTab === achievementSubTab) {
                    createAchievementContent();
                }
            }
            
            avatarSubTab.addEventListener('click', () => {
                switchSubTab(avatarSubTab, [achievementSubTab]);
            });
            
            achievementSubTab.addEventListener('click', () => {
                switchSubTab(achievementSubTab, [avatarSubTab]);
            });
            
            
            subTabHeader.appendChild(avatarSubTab);
            subTabHeader.appendChild(achievementSubTab);
            
            rightPanel.appendChild(subTabHeader);
            rightPanel.appendChild(subContentArea);
            
            contentArea.appendChild(leftPanel);
            contentArea.appendChild(rightPanel);
            
            // 預設顯示頭像選擇
            createAvatarSelection();
        }
        
        // 顯示遊戲設定內容
        function showGameSettingsContent() {
            contentArea.innerHTML = '';
            
            const gameSettingsPanel = document.createElement('div');
            gameSettingsPanel.style.cssText = `
                width: 100%;
                padding: 30px;
                display: flex;
                flex-direction: column;
                gap: 30px;
            `;
            
            // 遊戲設定區塊
            const gameSettingsSection = document.createElement('div');
            gameSettingsSection.className = 'settings-section';
            gameSettingsSection.style.cssText = `
                background-color: rgba(255, 239, 213, 0.9);
                border: 3px solid #8b4513;
                border-radius: 8px;
                padding: 20px;
                box-shadow: 
                    inset 2px 2px 0px rgba(255,255,255,0.6),
                    inset -2px -2px 0px rgba(212, 165, 116, 0.3);
            `;
            
            const gameSettingsTitle = document.createElement('h3');
            gameSettingsTitle.textContent = '遊戲設定';
            gameSettingsTitle.style.cssText = `
                font-size: 23.04px;
                color: #654321;
                margin-bottom: 15px;
                border-bottom: 2px solid #d4a574;
                padding-bottom: 8px;
            `;
            
            // 音效開關
            const soundOption = createToggleOption('音效', 'soundEnabled', true);
            
            // 音效音量滑桿
            const soundVolumeOption = createVolumeSliderOption('音效音量', 'soundVolume', 0.5);
            
            // 音樂開關
            const musicOption = createToggleOption('背景音樂', 'musicEnabled', true);
            
            // 音樂音量滑桿
            const musicVolumeOption = createVolumeSliderOption('音樂音量', 'musicVolume', 0.5);
            
            gameSettingsSection.appendChild(gameSettingsTitle);
            gameSettingsSection.appendChild(soundOption);
            gameSettingsSection.appendChild(soundVolumeOption);
            gameSettingsSection.appendChild(musicOption);
            gameSettingsSection.appendChild(musicVolumeOption);
            
            gameSettingsPanel.appendChild(gameSettingsSection);
            
            contentArea.appendChild(gameSettingsPanel);
        }
        
        // 組裝所有元素
        tabHeader.appendChild(playerDataTab);
        tabHeader.appendChild(gameSettingsTab);
        
        tabContainer.appendChild(tabHeader);
        tabContainer.appendChild(contentArea);
        
        settingsContainer.appendChild(closeButton);
        settingsContainer.appendChild(tabContainer);
        overlay.appendChild(settingsContainer);
        document.body.appendChild(overlay);
        
        // 預設顯示玩家資料內容
        showPlayerDataContent();
        
        // 更新頂部頭像顯示
        const topAvatar = document.querySelector('.player-avatar');
        if (topAvatar) {
            const currentAvatar = localStorage.getItem('selectedAvatar') || 'avatar1';
            const avatarOptionsForTop = [
                { id: 'avatar1', image: 'assets/images/頭像1.png', name: '頭像1' },
                { id: 'avatar2', image: 'assets/images/頭像2.png', name: '頭像2' },
                { id: 'avatar3', image: 'assets/images/頭像3.png', name: '頭像3' },
                { id: 'avatar4', image: 'assets/images/頭像4.png', name: '頭像4' },
                { id: 'avatar5', image: 'assets/images/頭像5.png', name: '頭像5' },
                { id: 'avatar6', image: 'assets/images/頭像6.png', name: '頭像6' }
            ];
            
            const selectedAvatar = avatarOptionsForTop.find(avatar => avatar.id === currentAvatar);
            if (selectedAvatar) {
                topAvatar.innerHTML = `<img src="${selectedAvatar.image}" alt="${selectedAvatar.name}" style="width: 100%; height: 100%; object-fit: contain; image-rendering: pixelated;">`;
            } else {
                topAvatar.innerHTML = `<img src="assets/images/頭像1.png" alt="頭像1" style="width: 100%; height: 100%; object-fit: contain; image-rendering: pixelated;">`;
            }
        }
    }
    
    // 自訂游標管理器
    const CursorManager = {
        currentCursor: 'default',
        customCursor: null,
        
        // 初始化自訂游標系統
        init() {
            this.createCustomCursor();
            this.setupCursorEvents();
        },
        
        // 創建自訂游標元素
        createCustomCursor() {
            this.customCursor = document.createElement('div');
            this.customCursor.id = 'custom-cursor';
            this.customCursor.style.cssText = `
                position: fixed;
                width: 32px;
                height: 32px;
                background-image: url('assets/images/蜜蜂鼠標.png');
                background-size: contain;
                background-repeat: no-repeat;
                pointer-events: none;
                z-index: 9999;
                transition: transform 0.1s ease;
                display: none;
            `;
            document.body.appendChild(this.customCursor);
        },
        
        // 設定游標事件
        setupCursorEvents() {
            // 隱藏系統游標
            document.body.style.cursor = 'none';
            
            // 跟隨滑鼠移動
            document.addEventListener('mousemove', (e) => {
                if (this.customCursor) {
                    this.customCursor.style.left = e.clientX - 2 + 'px';
                    this.customCursor.style.top = e.clientY - 2 + 'px';
                    this.customCursor.style.display = 'block';
                }
            });
            
            // 點擊效果
            document.addEventListener('mousedown', () => {
                if (this.customCursor) {
                    this.customCursor.style.transform = 'scale(0.9)';
                }
            });
            
            document.addEventListener('mouseup', () => {
                if (this.customCursor) {
                    this.customCursor.style.transform = 'scale(1)';
                }
            });
            
            // 滑鼠離開視窗時隱藏
            document.addEventListener('mouseleave', () => {
                if (this.customCursor) {
                    this.customCursor.style.display = 'none';
                }
            });
            
            document.addEventListener('mouseenter', () => {
                if (this.customCursor) {
                    this.customCursor.style.display = 'block';
                }
            });
        },
        
        // 設定特定游標樣式
        setCursor(type) {
            if (!this.customCursor) return;
            
            const cursorImages = {
                'default': 'assets/images/蜜蜂鼠標.png',
                'pointer': 'assets/images/蜜蜂鼠標.png',
                'text': 'assets/images/蜜蜂鼠標.png',
                'move': 'assets/images/蜜蜂鼠標.png',
                'loading': 'assets/images/蜜蜂鼠標.png',
                'disabled': 'assets/images/蜜蜂鼠標.png'
            };
            
            if (cursorImages[type]) {
                this.customCursor.style.backgroundImage = `url('${cursorImages[type]}')`;
                this.currentCursor = type;
            }
        },
        
        // 啟用/禁用自訂游標
        setEnabled(enabled) {
            if (enabled) {
                document.body.style.cursor = 'none';
                if (this.customCursor) {
                    this.customCursor.style.display = 'block';
                }
            } else {
                document.body.style.cursor = 'auto';
                if (this.customCursor) {
                    this.customCursor.style.display = 'none';
                }
            }
        }
    };

    // 音樂管理器
    const MusicManager = {
        audio: null,
        isEnabled: true,
        volume: parseFloat(localStorage.getItem('musicVolume')) || 0.5, // 預設音量 50%
        
        // 初始化音樂管理器
        init() {
            this.audio = document.getElementById('backgroundMusic');
            if (this.audio) {
                // 檢查 localStorage 中的設定
                const musicEnabled = localStorage.getItem('musicEnabled') !== 'false';
                
                // 設定預設音量
                this.audio.volume = this.volume;
                
                this.setEnabled(musicEnabled);
                
                // 嘗試播放音樂（需要用戶互動）
                this.audio.addEventListener('canplaythrough', () => {
                    if (this.isEnabled) {
                        this.play().catch(() => {
                            // 自動播放被阻止，等待用戶互動
                        });
                    }
                });
            }
        },
        
        // 設定音樂開關
        setEnabled(enabled) {
            this.isEnabled = enabled;
            if (this.audio) {
                if (enabled) {
                    this.audio.volume = this.volume;
                } else {
                    this.audio.volume = 0;
                    this.audio.pause();
                }
            }
        },

        // 設定音樂音量
        setVolume(volume) {
            this.volume = Math.max(0, Math.min(1, volume)); // 限制在 0-1 範圍
            localStorage.setItem('musicVolume', this.volume.toString());
            if (this.audio) {
                this.audio.volume = this.volume;
            }
        },
        
        // 播放音樂
        async play() {
            if (this.audio && this.isEnabled) {
                try {
                    await this.audio.play();
                } catch (error) {
                    // 自動播放被阻止，這是正常的
                    console.log('音樂播放需要用戶互動');
                }
            }
        },
        
        // 暫停音樂
        pause() {
            if (this.audio) {
                this.audio.pause();
            }
        },
        
        // 設定音量
        setVolume(volume) {
            this.volume = Math.max(0, Math.min(1, volume));
            if (this.audio && this.isEnabled) {
                this.audio.volume = this.volume;
            }
        }
    };

    // 音效管理器（WebAudio 合成多種音效）
    const SoundManager = {
        audioContext: null,
        isEnabled: localStorage.getItem('soundEnabled') !== 'false',
        volume: parseFloat(localStorage.getItem('soundVolume')) || 0.5, // 預設音量 50%
        initialized: false,
        lastPlayTime: 0, // 防止音效重疊

        init() {
            // 僅在首次互動或顯式呼叫時初始化
            if (this.initialized) return;
            try {
                const Ctor = window.AudioContext || window.webkitAudioContext;
                if (!Ctor) return; // 瀏覽器不支援
                this.audioContext = new Ctor();
                this.initialized = true;
            } catch (e) {
                // 安全失敗
            }
        },

        setEnabled(enabled) {
            this.isEnabled = enabled;
        },

        setVolume(volume) {
            this.volume = Math.max(0, Math.min(1, volume)); // 限制在 0-1 範圍
            localStorage.setItem('soundVolume', this.volume.toString());
        },

        resumeIfNeeded() {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume().catch(() => {});
            }
        },

        // 基礎音效生成函數
        makeBeep(frequency, start, duration, gain = 0.08, type = 'square') {
            if (!this.audioContext) return;
            const osc = this.audioContext.createOscillator();
            const amp = this.audioContext.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(frequency, start);
            // 應用音量控制
            const finalGain = gain * this.volume;
            amp.gain.setValueAtTime(finalGain, start);
            amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
            osc.connect(amp).connect(this.audioContext.destination);
            osc.start(start);
            osc.stop(start + duration + 0.01);
        },

        // 播放音效（防止重疊）
        playSound(soundFunction) {
            if (!this.isEnabled) return;
            if (!this.audioContext) this.init();
            if (!this.audioContext) return;

            // 防止音效重疊（50ms 內不重複播放）
            const now = Date.now();
            if (now - this.lastPlayTime < 50) return;
            this.lastPlayTime = now;

            this.resumeIfNeeded();
            soundFunction();
        },

        // 導覽按鈕音效（清脆的咔嗒聲）
        playNavClick() {
            this.playSound(() => {
                const now = this.audioContext.currentTime;
                this.makeBeep(2200, now, 0.03);
                this.makeBeep(1600, now + 0.03, 0.025);
            });
        },

        // 確認按鈕音效（上升音調）
        playConfirm() {
            this.playSound(() => {
                const now = this.audioContext.currentTime;
                this.makeBeep(800, now, 0.1, 0.06);
                this.makeBeep(1200, now + 0.05, 0.1, 0.06);
                this.makeBeep(1600, now + 0.1, 0.1, 0.06);
            });
        },

        // 取消按鈕音效（下降音調）
        playCancel() {
            this.playSound(() => {
                const now = this.audioContext.currentTime;
                this.makeBeep(1600, now, 0.1, 0.06);
                this.makeBeep(1200, now + 0.05, 0.1, 0.06);
                this.makeBeep(800, now + 0.1, 0.1, 0.06);
            });
        },

        // 成功音效（歡快的上升音階）
        playSuccess() {
            this.playSound(() => {
                const now = this.audioContext.currentTime;
                this.makeBeep(523, now, 0.15, 0.08); // C5
                this.makeBeep(659, now + 0.1, 0.15, 0.08); // E5
                this.makeBeep(784, now + 0.2, 0.2, 0.08); // G5
            });
        },

        // 錯誤音效（低沉的震動聲）
        playError() {
            this.playSound(() => {
                const now = this.audioContext.currentTime;
                this.makeBeep(200, now, 0.3, 0.1, 'sawtooth');
                this.makeBeep(150, now + 0.1, 0.2, 0.08, 'sawtooth');
            });
        },

        // 扭蛋機音效（神秘的金屬聲）
        playGashapon() {
            this.playSound(() => {
                const now = this.audioContext.currentTime;
                this.makeBeep(300, now, 0.2, 0.07, 'triangle');
                this.makeBeep(600, now + 0.1, 0.15, 0.05, 'triangle');
                this.makeBeep(900, now + 0.2, 0.1, 0.03, 'triangle');
            });
        },

        // 進貨音效（收銀機聲）
        playStock() {
            this.playSound(() => {
                const now = this.audioContext.currentTime;
                this.makeBeep(1000, now, 0.05, 0.06);
                this.makeBeep(1200, now + 0.05, 0.05, 0.06);
                this.makeBeep(800, now + 0.1, 0.1, 0.08);
            });
        },

        // 答題音效（思考的滴答聲）
        playQuiz() {
            this.playSound(() => {
                const now = this.audioContext.currentTime;
                this.makeBeep(1000, now, 0.08, 0.05);
                this.makeBeep(1200, now + 0.1, 0.08, 0.05);
                this.makeBeep(1400, now + 0.2, 0.1, 0.06);
            });
        },

        // 排行榜音效（勝利號角）
        playLeaderboard() {
            this.playSound(() => {
                const now = this.audioContext.currentTime;
                this.makeBeep(523, now, 0.2, 0.07); // C5
                this.makeBeep(659, now + 0.15, 0.2, 0.07); // E5
                this.makeBeep(784, now + 0.3, 0.25, 0.08); // G5
            });
        },

        // 聊天音效（輕快的通知聲）
        playChat() {
            this.playSound(() => {
                const now = this.audioContext.currentTime;
                this.makeBeep(800, now, 0.1, 0.05);
                this.makeBeep(1000, now + 0.05, 0.1, 0.05);
            });
        },

        // 設定音效（齒輪轉動聲）
        playSettings() {
            this.playSound(() => {
                const now = this.audioContext.currentTime;
                this.makeBeep(400, now, 0.1, 0.06, 'sawtooth');
                this.makeBeep(500, now + 0.05, 0.1, 0.06, 'sawtooth');
                this.makeBeep(600, now + 0.1, 0.1, 0.06, 'sawtooth');
            });
        },

        // 關閉音效（簡短的關閉聲）
        playClose() {
            this.playSound(() => {
                const now = this.audioContext.currentTime;
                this.makeBeep(1000, now, 0.05, 0.04);
                this.makeBeep(800, now + 0.05, 0.05, 0.04);
            });
        },

        // 預設點擊音效（向後兼容）
        playClick() {
            this.playNavClick();
        }
    };

    // 全域按鈕音效輔助函數
    function addClickSoundToButton(button) {
        if (!button) return;
        button.addEventListener('click', function() {
            if (typeof SoundManager === 'undefined') return;
            
            // 根據按鈕類型和內容決定音效
            const buttonId = this.id || '';
            const buttonClass = this.className || '';
            const buttonText = this.textContent || '';
            
            // 導覽按鈕
            if (buttonId.startsWith('nav')) {
                if (buttonId === 'navGashapon') {
                    SoundManager.playGashapon();
                } else if (buttonId === 'navStock') {
                    SoundManager.playStock();
                } else if (buttonId === 'navMarketing') {
                    SoundManager.playQuiz();
                } else if (buttonId === 'navLeaderboard') {
                    SoundManager.playLeaderboard();
                } else if (buttonId === 'navChat') {
                    SoundManager.playChat();
                } else {
                    SoundManager.playNavClick();
                }
            }
            // 排行榜相關按鈕
            else if (buttonClass.includes('leaderboard')) {
                if (buttonClass.includes('close') || buttonText.includes('關閉')) {
                    SoundManager.playClose();
                } else if (buttonClass.includes('refresh') || buttonText.includes('刷新')) {
                    SoundManager.playNavClick();
                } else {
                    SoundManager.playNavClick();
                }
            }
            // 確認按鈕
            else if (buttonText.includes('確認') || buttonText.includes('確定') || buttonText.includes('綁定') || buttonText.includes('保存')) {
                SoundManager.playConfirm();
            }
            // 取消按鈕
            else if (buttonText.includes('取消') || buttonText.includes('關閉') || buttonClass.includes('close')) {
                SoundManager.playCancel();
            }
            // 設定相關按鈕
            else if (buttonClass.includes('settings') || buttonText.includes('設定') || buttonText.includes('設置')) {
                SoundManager.playSettings();
            }
            // 成功相關按鈕
            else if (buttonText.includes('成功') || buttonText.includes('完成') || buttonText.includes('獲得')) {
                SoundManager.playSuccess();
            }
            // 錯誤相關按鈕
            else if (buttonText.includes('錯誤') || buttonText.includes('失敗') || buttonText.includes('重試')) {
                SoundManager.playError();
            }
            // 隨機/抽獎按鈕
            else if (buttonText.includes('隨機') || buttonText.includes('抽獎') || buttonText.includes('扭蛋')) {
                SoundManager.playGashapon();
            }
            // 預設音效
            else {
                SoundManager.playNavClick();
            }
        });
    }

    // 為所有按鈕添加音效的函數
    function addClickSoundToAllButtons() {
        // 靜態按鈕
        const staticButtons = document.querySelectorAll('button, .button, .btn, [role="button"]');
        staticButtons.forEach(addClickSoundToButton);
        
        // 動態按鈕（使用 MutationObserver 監聽新增的按鈕）
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        // 檢查新增的節點本身是否為按鈕
                        if (node.tagName === 'BUTTON' || node.classList.contains('button') || node.classList.contains('btn')) {
                            addClickSoundToButton(node);
                        }
                        // 檢查新增節點內的按鈕
                        const buttons = node.querySelectorAll ? node.querySelectorAll('button, .button, .btn, [role="button"]') : [];
                        buttons.forEach(addClickSoundToButton);
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // 創建音量滑桿選項
    function createVolumeSliderOption(label, storageKey, defaultValue = 0.5) {
        const option = document.createElement('div');
        option.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            font-size: 16.8px;
            color: #654321;
        `;
        
        const labelSpan = document.createElement('span');
        labelSpan.textContent = label;
        
        const sliderContainer = document.createElement('div');
        sliderContainer.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '0';
        slider.max = '1';
        slider.step = '0.1';
        slider.value = localStorage.getItem(storageKey) || defaultValue;
        slider.style.cssText = `
            width: 120px;
            height: 6px;
            background: #d4a574;
            outline: none;
            border-radius: 3px;
            -webkit-appearance: none;
            appearance: none;
            cursor: pointer;
        `;
        
        // 添加滑桿滑塊樣式
        const style = document.createElement('style');
        style.textContent = `
            input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 18px;
                height: 18px;
                background: #8b4513;
                border: 2px solid #daa520;
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }
            
            input[type="range"]::-moz-range-thumb {
                width: 18px;
                height: 18px;
                background: #8b4513;
                border: 2px solid #daa520;
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }
            
            input[type="range"]::-webkit-slider-track {
                background: transparent;
            }
            
            input[type="range"]::-moz-range-track {
                background: transparent;
            }
        `;
        document.head.appendChild(style);
        
        // 自訂滑桿樣式
        slider.style.background = `linear-gradient(to right, #daa520 0%, #daa520 ${slider.value * 100}%, #d4a574 ${slider.value * 100}%, #d4a574 100%)`;
        
        const volumeDisplay = document.createElement('span');
        volumeDisplay.style.cssText = `
            font-size: 14px;
            color: #654321;
            min-width: 30px;
            text-align: center;
        `;
        volumeDisplay.textContent = Math.round(slider.value * 100) + '%';
        
        // 滑桿事件監聽
        slider.addEventListener('input', function() {
            const value = parseFloat(this.value);
            volumeDisplay.textContent = Math.round(value * 100) + '%';
            
            // 更新滑桿背景色
            this.style.background = `linear-gradient(to right, #daa520 0%, #daa520 ${value * 100}%, #d4a574 ${value * 100}%, #d4a574 100%)`;
            
            // 保存設定
            localStorage.setItem(storageKey, value.toString());
            
            // 更新對應的音量管理器
            if (storageKey === 'soundVolume' && typeof SoundManager !== 'undefined') {
                SoundManager.setVolume(value);
            } else if (storageKey === 'musicVolume' && typeof MusicManager !== 'undefined') {
                MusicManager.setVolume(value);
            }
            
            // 播放測試音效（僅音效滑桿）
            if (storageKey === 'soundVolume' && typeof SoundManager !== 'undefined') {
                SoundManager.playNavClick();
            }
        });
        
        sliderContainer.appendChild(slider);
        sliderContainer.appendChild(volumeDisplay);
        
        option.appendChild(labelSpan);
        option.appendChild(sliderContainer);
        
        return option;
    }

    // 創建切換開關選項
    function createToggleOption(label, storageKey, defaultValue) {
        const option = document.createElement('div');
        option.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            font-size: 16.8px;
            color: #654321;
        `;
        
        const labelSpan = document.createElement('span');
        labelSpan.textContent = label;
        
        const toggleSwitch = document.createElement('div');
        const isEnabled = localStorage.getItem(storageKey) !== 'false';
        toggleSwitch.style.cssText = `
            width: 50px;
            height: 26px;
            background-color: ${isEnabled ? '#daa520' : '#d4a574'};
            border: 3px solid #8b4513;
            border-radius: 13px;
            position: relative;
            cursor: pointer;
            transition: background-color 0.3s;
            box-shadow: inset 2px 2px 0px rgba(0,0,0,0.2);
        `;
        
        const toggleKnob = document.createElement('div');
        toggleKnob.style.cssText = `
            width: 18px;
            height: 18px;
            background-color: #fff;
            border: 2px solid #8b4513;
            border-radius: 50%;
            position: absolute;
            top: 1px;
            left: ${isEnabled ? '26px' : '1px'};
            transition: left 0.3s;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        `;
        
        toggleSwitch.appendChild(toggleKnob);
        
        // 點擊切換
        toggleSwitch.addEventListener('click', function() {
            const currentState = localStorage.getItem(storageKey) !== 'false';
            const newState = !currentState;
            localStorage.setItem(storageKey, newState);
            
            toggleSwitch.style.backgroundColor = newState ? '#daa520' : '#d4a574';
            toggleKnob.style.left = newState ? '26px' : '1px';
            
            // 如果是背景音樂設定，更新音樂管理器
            if (storageKey === 'musicEnabled') {
                MusicManager.setEnabled(newState);
                if (newState) {
                    MusicManager.play();
                }
            }
            // 如果是音效設定，更新音效管理器
            if (storageKey === 'soundEnabled') {
                if (typeof SoundManager !== 'undefined') {
                    SoundManager.setEnabled(newState);
                    if (newState) {
                        SoundManager.init();
                    }
                }
            }
        });
        
        option.appendChild(labelSpan);
        option.appendChild(toggleSwitch);
        
        return option;
    }

    
    // 創建按鈕
    function createButton(text, bgColor, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.cssText = `
            padding: 8px 16px;
            background-color: ${bgColor};
            border: 2px solid ${bgColor};
            border-radius: 6px;
            color: #fff;
            font-family: 'Zpix', 'Press Start 2P', monospace;
            font-size: 14.4px;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 
                inset -2px -2px 0px rgba(0,0,0,0.3),
                inset 2px 2px 0px rgba(255,255,255,0.3),
                0 4px 8px rgba(0,0,0,0.2);
        `;
        
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = `
                inset -2px -2px 0px rgba(0,0,0,0.3),
                inset 2px 2px 0px rgba(255,255,255,0.3),
                0 6px 12px rgba(0,0,0,0.3)
            `;
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = `
                inset -2px -2px 0px rgba(0,0,0,0.3),
                inset 2px 2px 0px rgba(255,255,255,0.3),
                0 4px 8px rgba(0,0,0,0.2)
            `;
        });
        
        button.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(1px)';
        });
        
        button.addEventListener('mouseup', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('click', onClick);
        
        return button;
    }
    
    // 顯示扭蛋機畫面
    function showGashaponScreen() {
        const windowContent = document.querySelector('.window-content');
        
        // 清空現有內容
        windowContent.innerHTML = '';
        
        // 創建扭蛋機容器
        const gashaponContainer = document.createElement('div');
        gashaponContainer.className = 'gashapon-container';
        gashaponContainer.style.cssText = `
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: transparent;
        `;
        
        // 創建 GIF 圖片元素
        const gashaponGif = document.createElement('img');
        gashaponGif.src = 'assets/videos/扭蛋機.gif';
        gashaponGif.alt = '扭蛋機';
        gashaponGif.style.cssText = `
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            image-rendering: pixelated;
            image-rendering: -moz-crisp-edges;
            image-rendering: crisp-edges;
            cursor: pointer;
            transition: transform 0.2s ease;
        `;
        
        // 懸停效果
        gashaponGif.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
        });
        
        gashaponGif.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
        
        // 點擊扭蛋機開始抽獎
        gashaponGif.addEventListener('click', function() {
            // 檢查熊點數是否足夠
            const bearPoints = GameResources.resources.bearPoints;
            if (bearPoints < 10) {
                showMessage('熊點數不足！需要 10 點才能抽獎', 'error');
                return;
            }
            
            // 扣除熊點數
            GameResources.subtractResource('bearPoints', 10);
            
            // 進行抽獎
            performGashaponDraw();
        });
        
        // 組裝元素
        gashaponContainer.appendChild(gashaponGif);
        windowContent.appendChild(gashaponContainer);
    }
    
    // 扭蛋抽獎邏輯
    function performGashaponDraw() {
        // 獎品池
        const prizes = [
            { name: '蜂蜜幣 x100', type: 'honey', amount: 100, rarity: 'common' },
            { name: '蜂蜜幣 x500', type: 'honey', amount: 500, rarity: 'common' },
            { name: '蜂蜜幣 x1000', type: 'honey', amount: 1000, rarity: 'uncommon' },
            { name: '蜂蜜幣 x2000', type: 'honey', amount: 2000, rarity: 'rare' },
            { name: '熊點數 x5', type: 'bearPoints', amount: 5, rarity: 'common' },
            { name: '熊點數 x10', type: 'bearPoints', amount: 10, rarity: 'uncommon' },
            { name: '熊點數 x20', type: 'bearPoints', amount: 20, rarity: 'rare' },
            { name: '勳章 x1', type: 'medals', amount: 1, rarity: 'uncommon' },
            { name: '勳章 x3', type: 'medals', amount: 3, rarity: 'rare' },
            { name: '勳章 x5', type: 'medals', amount: 5, rarity: 'epic' }
        ];
        
        // 根據稀有度決定抽獎機率
        const rarityWeights = {
            'common': 50,
            'uncommon': 30,
            'rare': 15,
            'epic': 5
        };
        
        // 隨機選擇獎品
        const totalWeight = prizes.reduce((sum, prize) => sum + rarityWeights[prize.rarity], 0);
        let random = Math.random() * totalWeight;
        
        let selectedPrize = null;
        for (const prize of prizes) {
            random -= rarityWeights[prize.rarity];
            if (random <= 0) {
                selectedPrize = prize;
                break;
            }
        }
        
        // 給予獎品
        if (selectedPrize) {
            GameResources.addResource(selectedPrize.type, selectedPrize.amount);
            
            // 檢查扭蛋成就
            if (window.AchievementSystem) {
                window.AchievementSystem.checkProgress('gashapon_count', 1);
            }
            
            // 顯示抽獎結果
            showGashaponResult(selectedPrize);
        }
    }
    
    // 顯示扭蛋抽獎結果
    function showGashaponResult(prize) {
        const overlay = document.createElement('div');
        overlay.className = 'gashapon-result-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            animation: fadeIn 0.3s ease-out;
        `;
        
        const resultContainer = document.createElement('div');
        resultContainer.style.cssText = `
            background: linear-gradient(180deg, #f5deb3 0%, #daa574 100%);
            border: 6px solid #8b4513;
            border-radius: 16px;
            padding: 30px;
            text-align: center;
            max-width: 400px;
            animation: modalSlideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        `;
        
        const rarityColors = {
            'common': '#8b4513',
            'uncommon': '#4169e1',
            'rare': '#ffd700',
            'epic': '#ff69b4'
        };
        
        resultContainer.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 20px;">🎉</div>
            <h2 style="color: #654321; font-family: 'Zpix', 'Press Start 2P', monospace; font-size: 20px; margin-bottom: 15px;">
                抽獎結果
            </h2>
            <div style="font-size: 24px; margin-bottom: 10px;">${prize.name}</div>
            <div style="color: ${rarityColors[prize.rarity]}; font-family: 'Zpix', 'Press Start 2P', monospace; font-size: 14px; margin-bottom: 20px;">
                稀有度: ${prize.rarity.toUpperCase()}
            </div>
            <button id="closeResult" style="
                background: linear-gradient(180deg, #8b4513 0%, #654321 100%);
                color: #f4d4a6;
                border: 3px solid #654321;
                border-radius: 8px;
                padding: 12px 24px;
                font-family: 'Zpix', 'Press Start 2P', monospace;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
            ">確定</button>
        `;
        
        overlay.appendChild(resultContainer);
        document.body.appendChild(overlay);
        
        // 關閉按鈕事件
        document.getElementById('closeResult').addEventListener('click', () => {
            overlay.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(overlay);
            }, 300);
        });
        
        // 點擊遮罩關閉
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.style.animation = 'fadeOut 0.3s ease-out';
                setTimeout(() => {
                    document.body.removeChild(overlay);
                }, 300);
            }
        });
    }
    
    // 顯示扭蛋抽獎彈窗
    function showGashaponDrawModal() {
        // 創建遮罩層
        const overlay = document.createElement('div');
        overlay.className = 'gashapon-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            animation: fadeIn 0.3s ease-out;
        `;
        
        // 點擊遮罩層關閉彈窗
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeGashaponModal();
            }
        });
        
        // 獲取中間框的尺寸並縮小 10%
        const windowContent = document.querySelector('.window-content');
        const contentRect = windowContent.getBoundingClientRect();
        const scaledWidth = contentRect.width * 0.9;
        const scaledHeight = contentRect.height * 0.9;
        
        // 創建抽獎畫面容器
        const drawContainer = document.createElement('div');
        drawContainer.className = 'gashapon-draw-container';
        drawContainer.style.cssText = `
            position: relative;
            width: ${scaledWidth}px;
            height: ${scaledHeight}px;
            display: flex;
            justify-content: center;
            align-items: center;
            animation: modalSlideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        `;
        
        // 創建扭蛋畫面圖片
        const drawImage = document.createElement('img');
        drawImage.src = 'assets/images/扭蛋畫面.png';
        drawImage.alt = '扭蛋畫面';
        drawImage.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: contain;
            image-rendering: pixelated;
            image-rendering: -moz-crisp-edges;
            image-rendering: crisp-edges;
        `;
        
        // 創建關閉按鈕
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '✕';
        closeButton.style.cssText = `
            position: absolute;
            top: 12px;
            right: 12px;
            background-color: #ff6b6b;
            border: 4px solid #654321;
            border-radius: 50%;
            width: 54px;
            height: 54px;
            color: #fff;
            font-size: 29px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            z-index: 10;
            box-shadow: 
                inset -2px -2px 0px rgba(0,0,0,0.3),
                inset 2px 2px 0px rgba(255,255,255,0.3),
                0 5px 10px rgba(0,0,0,0.4);
        `;
        
        closeButton.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1) rotate(90deg)';
            this.style.backgroundColor = '#ff5555';
        });
        
        closeButton.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) rotate(0deg)';
            this.style.backgroundColor = '#ff6b6b';
        });
        
        closeButton.addEventListener('click', closeGashaponModal);
        
        // 關閉彈窗函數
        function closeGashaponModal() {
            overlay.style.animation = 'fadeOut 0.3s ease-out';
            drawContainer.style.animation = 'modalSlideOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(overlay);
            }, 300);
        }
        
        // 組裝元素
        drawContainer.appendChild(drawImage);
        drawContainer.appendChild(closeButton);
        overlay.appendChild(drawContainer);
        document.body.appendChild(overlay);
    }
    
    // 顯示排行榜彈窗
    function showLeaderboardModal() {
        // TODO: 待重新設計排行榜頁面
    }
    
    // 顯示訊息功能
    function showMessage(message, type = 'info') {
        // 播放對應音效
        if (typeof SoundManager !== 'undefined') {
            if (type === 'success') {
                SoundManager.playSuccess();
            } else if (type === 'error') {
                SoundManager.playError();
            } else {
                SoundManager.playNavClick();
            }
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 30px;
            left: 50%;
            transform: translateX(-50%);
            background-color: ${type === 'error' ? '#ff6b6b' : type === 'success' ? '#4ecdc4' : '#ffd700'};
            color: ${type === 'success' || type === 'error' ? 'white' : '#654321'};
            padding: 18px 36px;
            border-radius: 9px;
            font-family: 'Zpix', 'Press Start 2P', monospace;
            font-size: 15px;
            z-index: 1001;
            border: 5px solid ${type === 'error' ? '#e55555' : type === 'success' ? '#45b7aa' : '#daa520'};
            box-shadow: 
                inset -3px -3px 0px rgba(0,0,0,0.2),
                inset 3px 3px 0px rgba(255,255,255,0.3),
                0 6px 12px rgba(0,0,0,0.3);
            animation: slideDown 0.3s ease-out;
            text-align: center;
            line-height: 1.6;
            max-width: 600px;
        `;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.style.animation = 'slideUp 0.3s ease-in';
                setTimeout(() => {
                    if (messageDiv.parentNode) {
                        messageDiv.parentNode.removeChild(messageDiv);
                    }
                }, 300);
            }
        }, 3000);
    }
    
    // 添加CSS動畫
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from {
                transform: translateX(-50%) translateY(-100%);
                opacity: 0;
            }
            to {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
            }
        }
        
        @keyframes slideUp {
            from {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
            }
            to {
                transform: translateX(-50%) translateY(-100%);
                opacity: 0;
            }
        }
        
        @keyframes fadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }
        
        @keyframes fadeOut {
            from {
                opacity: 1;
            }
            to {
                opacity: 0;
            }
        }
        
        @keyframes modalSlideIn {
            from {
                transform: scale(0.7) translateY(-50px);
                opacity: 0;
            }
            to {
                transform: scale(1) translateY(0);
                opacity: 1;
            }
        }
        
        @keyframes modalSlideOut {
            from {
                transform: scale(1) translateY(0);
                opacity: 1;
            }
            to {
                transform: scale(0.7) translateY(-50px);
                opacity: 0;
            }
        }
        
        .game-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            padding: 20px;
        }
        
        .welcome-back {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .welcome-back h2 {
            font-size: 18px;
            color: #8b4513;
            margin-bottom: 10px;
            text-shadow: 2px 2px 0px #deb887;
        }
        
        .welcome-back p {
            font-size: 11px;
            color: #654321;
        }
        
        .game-content {
            width: 100%;
            max-width: 400px;
        }
        
        .bakery-scene {
            background-color: #f5e5c5;
            border: 3px solid #8b4513;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            box-shadow: 
                inset 2px 2px 0px #fff,
                inset -2px -2px 0px #a0522d;
        }
        
        .bread-display {
            display: flex;
            justify-content: space-around;
            align-items: center;
            gap: 20px;
        }
        
        .bread-item {
            font-size: 48px;
            animation: float 3s ease-in-out infinite;
            cursor: pointer;
            transition: transform 0.2s ease;
        }
        
        .bread-item:nth-child(2) {
            animation-delay: -1s;
        }
        
        .bread-item:nth-child(3) {
            animation-delay: -2s;
        }
        
        .bread-item:hover {
            transform: scale(1.2);
        }
        
        @keyframes float {
            0%, 100% {
                transform: translateY(0px);
            }
            50% {
                transform: translateY(-10px);
            }
        }
    `;
    document.head.appendChild(style);
    
    // 麵包點擊效果
    const breadItems = document.querySelectorAll('.bread-item');
    breadItems.forEach(item => {
        item.addEventListener('click', function() {
            this.style.transform = 'scale(1.5) rotate(360deg)';
            setTimeout(() => {
                this.style.transform = '';
            }, 500);
            
            const breadTypes = ['🍞', '🥐', '🥖'];
            const breadNames = ['吐司', '可頌', '法式長棍'];
            const index = breadTypes.indexOf(this.textContent);
            const breadName = index !== -1 ? breadNames[index] : '麵包';
            
            showMessage(`你選擇了${breadName}！`, 'success');
        });
    });
    
    // 歡迎訊息
    const userName = localStorage.getItem('playerName') || 'BEAR';
    setTimeout(() => {
        showMessage(`歡迎回來，${userName}！`, 'success');
    }, 1000);
    
    // 定期檢查登入狀態（已移除登入檢查）
    // setInterval(() => {
    //     if (!checkLoginStatus()) {
    //         return;
    //     }
    // }, 5 * 60 * 1000);
    
    // 測試功能：演示事件選項與資源系統的整合
    // 可以在控制台中使用：window.testEventChoice()
    window.testEventChoice = function() {
        // 模擬事件選項數據
        const sampleEventChoice = {
            resourceChanges: [
                { type: 'subtract', resource: 'honey', amount: 500 },
                { type: 'add', resource: 'bearPoints', amount: 50 },
                { type: 'add', resource: 'medals', amount: 10 }
            ],
            message: '您完成了麵包製作任務！',
            messageType: 'success'
        };
        
        EventSystem.processEventChoice(sampleEventChoice);
    };
    
    // 事件流程管理器（管理四個畫面的顯示）
    const EventFlowManager = {
        eventsData: null,
        currentEvent: null,
        currentStage: 0, // 0:景氣燈號, 1:劇情, 2:事件, 3:反饋+教室
        selectedOption: null,
        eventCompleted: false, // 防止重複完成同一事件
        
        // 保存事件狀態到 localStorage
        saveEventState() {
            const eventState = {
                currentEvent: this.currentEvent,
                currentStage: this.currentStage,
                selectedOption: this.selectedOption,
                eventCompleted: this.eventCompleted
            };
            localStorage.setItem('eventFlowState', JSON.stringify(eventState));
        },
        
        // 從 localStorage 恢復事件狀態
        loadEventState() {
            try {
                const savedState = localStorage.getItem('eventFlowState');
                if (savedState) {
                    const eventState = JSON.parse(savedState);
                    this.currentEvent = eventState.currentEvent;
                    this.currentStage = eventState.currentStage || 0;
                    this.selectedOption = eventState.selectedOption;
                    this.eventCompleted = eventState.eventCompleted || false;
                    return true;
                }
            } catch (error) {
                console.error('❌ 恢復事件狀態失敗:', error);
            }
            return false;
        },
        
        // 清除事件狀態
        clearEventState() {
            localStorage.removeItem('eventFlowState');
            this.currentEvent = null;
            this.currentStage = 0;
            this.selectedOption = null;
            this.eventCompleted = false;
        },
        
        // 內嵌題庫數據（解決 file:// CORS 問題）
        embeddedEventsData: {
            "regions": {
                "住宅區": [
                    {
                        "id": 1,
                        "title": "鄰居競爭",
                        "economicSignal": {
                            "level": "綠燈",
                            "message": "今日景氣：🟢綠燈（景氣平穩）"
                        },
                        "story": {
                            "image": "assets/images/劇情.png",
                            "text": "清晨的陽光灑落在住宅區的小路上，你剛把進貨的麵包擺上架，卻聞到另一股香氣——不是來自你的店，而是從樹懶媽媽家傳來的。\n她剛出爐的「自製麵包」吸引了鄰居們聚集，孩子們嚷著：「下次要不要直接跟樹懶媽媽買就好？」\n小熊愣在攤位前，第一次感覺到「不是只有麵包坊能賣麵包」。"
                        },
                        "event": {
                            "title": "鄰居競爭",
                            "description": "面對鄰居的自製麵包競爭，小熊該怎麼做？",
                            "marketingLesson": "● 差異化策略(Differentiation Strategy):透過強調「專業」和「安全」,與自製麵包形成明顯區隔。\n● 關係行銷(Relationship Marketing):加強與顧客的情感連結,提升黏著度。\n● 價格戰(Price War):雖能短期增加銷量,但會損害長期品牌形象。",
                            "options": [
                                {
                                    "id": "A",
                                    "text": "強調專業與品質：「推出『安心標章』：在店門口張貼食材來源與衛生證明，凸顯專業。」",
                                    "feedback": "顧客看了標示後安心不少，媽媽們覺得小熊的店更可靠。雖然樹懶媽媽的麵包香氣誘人，但多數家庭還是傾向選擇專業店家。(效果：+5 聲望，+3 顧客滿意度)",
                                    "coefficient": 1.0,
                                    "effects": { "honey": -200 }
                                },
                                {
                                    "id": "B",
                                    "text": "打情感牌：「舉辦『社區好友日』：凡帶家人一起來購買，贈送一份小點心。」",
                                    "feedback": "鄰居們覺得很窩心，孩子們拿著小點心笑嘻嘻。雖然支出增加，但人潮多了起來，小熊的店熱鬧不少。(效果：+8 顧客滿意度,短期利潤增加3500HBC)",
                                    "coefficient": 1.2,
                                    "effects": { "honey": -1000 }
                                },
                                {
                                    "id": "C",
                                    "text": "直接壓低價格：「全品項降價 10%，吸引顧客回流。」",
                                    "feedback": "短時間內人潮確實回流，但許多人開始期待小熊「永遠便宜」。長期來看，品牌價值被削弱，顧客只在意價格，不再在意品質。(效果：+3000 HBC 營收，聲望 -2)",
                                    "coefficient": 0.7,
                                    "effects": { "honey": 3000 }
                                }
                            ]
                        }
                    },
                    {
                        "id": 2,
                        "title": "活動促銷",
                        "economicSignal": {
                            "level": "紅燈",
                            "message": "今日景氣：🔴紅燈（市場熱絡）"
                        },
                        "story": {
                            "image": "assets/images/劇情.png",
                            "text": "午後，微風帶著桂花香，你整理著貨架上的月餅與應景麵包。孩子們湊到門口，眼睛亮晶晶：「小熊，聽說今天有活動嗎？」\n街坊媽媽們也竊竊私語：「今年小熊的店會不會有新花樣？我們都在等呢！」\n小熊看著滿架的麵包，心裡正盤算：要靠促銷拉人氣？還是維持原價，靠巧思打動人心？"
                        },
                        "event": {
                            "title": "活動促銷",
                            "description": "選擇本次活動促銷的方式?",
                            "marketingLesson": "● 價格策略:短期折扣可拉動銷量,但需注意長期品牌價值。\n● 附加價值策略:不必降價也能增加顧客滿意度。",
                            "options": [
                                {
                                    "id": "A",
                                    "text": "節日限定促銷（買二送一）",
                                    "feedback": "人潮湧進店裡，孩子們拉著父母大喊要買，店裡氣氛熱鬧非凡。顧客笑著說「小熊真會辦活動」，雖然單據堆滿收銀台，但利潤卻被壓縮了。(效果：+7 顧客滿意度)",
                                    "coefficient": 1.0,
                                    "effects": { "honey": 0 }
                                },
                                {
                                    "id": "B",
                                    "text": "全品項折扣 10%",
                                    "feedback": "年輕學生立刻成群搶購，上班族也覺得划算，但有熟客媽媽低聲說「小熊是不是只靠便宜取勝了？」氣氛雖熱鬧，卻多了一絲隱憂。(效果：+3 顧客滿意度，聲望 -1)",
                                    "coefficient": 0.8,
                                    "effects": { "honey": 0 }
                                },
                                {
                                    "id": "C",
                                    "text": "維持原價，推出附加價值（小禮袋或飲品）",
                                    "feedback": "顧客拿到小禮袋時驚喜不已，孩子們抱著飲料笑著在門口分享麵包，整間店充滿溫暖氛圍。顧客心裡暗暗覺得「小熊很用心」，品牌形象大幅提升。(效果：+5 顧客滿意度，+3 聲望)",
                                    "coefficient": 1.3,
                                    "effects": { "honey": -500 }
                                }
                            ]
                        }
                    }
                ],
                "商業區": [],
                "學區": []
            }
        },
        
        // 依目前階段顯示對應畫面（用於返回事件時）
        showCurrentStage() {
            // 先嘗試恢復事件狀態
            if (!this.currentEvent) {
                const stateRestored = this.loadEventState();
                if (stateRestored && this.currentEvent) {
                    console.log('✅ 已恢復事件狀態，當前階段:', this.currentStage);
                } else {
                    // 若尚未有事件，只有在已選地區且已選行政區時才啟動事件流程
                    if (GameFlowManager.selectedRegion && GameFlowManager.selectedDistrict) {
                        this.startEventFlow(GameFlowManager.selectedRegion);
                    } else {
                        // 回到地區選擇
                        ContentManager.showContent('region-select');
                    }
                    return;
                }
            }
            switch (this.currentStage) {
                case 0:
                    // 景氣燈號階段，直接跳到劇情畫面
                    this.currentStage = 1;
                    this.showStory();
                    break;
                case 1:
                    this.showStory();
                    break;
                case 2:
                    this.showEvent();
                    break;
                case 3:
                    this.showFeedbackAndLesson();
                    break;
                default:
                    // 未知階段，回到劇情畫面作為安全落點
                    this.currentStage = 1;
                    this.showStory();
            }
        },
        
        // 載入題庫
        async loadEventsData() {
            try {
                // 優先使用內嵌數據，避免 file:// CORS 問題
                this.eventsData = this.embeddedEventsData;
                console.log('✅ 題庫載入成功（使用內嵌數據）', this.eventsData);
                
                // 如果是 http/https 環境，可以嘗試從外部文件加載
                if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
                    try {
                        const response = await fetch('data/events.json');
                        const externalData = await response.json();
                        this.eventsData = externalData;
                        console.log('✅ 已從外部文件更新題庫');
                    } catch (fetchError) {
                        console.log('ℹ️ 使用內嵌題庫（外部文件未找到）');
                    }
                }
            } catch (error) {
                console.error('❌ 題庫載入失敗:', error);
                showMessage('題庫載入失敗', 'error');
            }
        },
        
        // 開始事件流程
        async startEventFlow(region) {
            // 確保題庫已載入
            if (!this.eventsData) {
                await this.loadEventsData();
            }
            
            // 獲取該地區的事件列表
            const regionEvents = this.eventsData.regions[region];
            if (!regionEvents || regionEvents.length === 0) {
                showMessage(`${region}暫無事件`, 'warning');
                return;
            }
            
            // 獲取當前應該顯示的事件（根據已完成的事件數）
            const eventIndex = GameFlowManager.eventsCompleted;
            if (eventIndex >= regionEvents.length) {
                showMessage('本地區事件已全部完成', 'success');
                return;
            }
            
            this.currentEvent = regionEvents[eventIndex];
            this.currentStage = 0;
            this.selectedOption = null;
            this.eventCompleted = false;
            
            // 保存事件狀態
            this.saveEventState();
            
            // 顯示第一個畫面：景氣燈號
            this.showEconomicSignal();
        },
        
        // 畫面1：景氣燈號
        showEconomicSignal() {
            const windowContent = document.querySelector('.window-content');
            
            // 創建全螢幕遮罩
            const overlay = document.createElement('div');
            overlay.id = 'economic-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.9);
                z-index: 9999;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                cursor: pointer;
            `;
            
            // 小熊精靈圖片
            const bearSprite = document.createElement('img');
            bearSprite.src = 'assets/images/鼠標熊精靈.png';
            bearSprite.style.cssText = `
                width: 150px;
                height: 150px;
                margin-bottom: 30px;
                image-rendering: pixelated;
                animation: float 2s ease-in-out infinite;
            `;
            
            // 訊息框
            const messageBox = document.createElement('div');
            messageBox.style.cssText = `
                background-color: #f5e5c5;
                border: 4px solid #8b4513;
                border-radius: 12px;
                padding: 30px;
                max-width: 500px;
                text-align: center;
                box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
            `;
            
            // 景氣燈號文字
            const signalText = document.createElement('div');
            signalText.style.cssText = `
                font-family: 'Zpix', 'Press Start 2P', monospace;
                font-size: 21px;
                color: #654321;
                line-height: 1.8;
                margin-bottom: 15px;
            `;
            signalText.textContent = this.currentEvent.economicSignal.message;
            
            // 係數說明文字
            const coefficientText = document.createElement('div');
            coefficientText.style.cssText = `
                font-family: 'Zpix', 'Press Start 2P', monospace;
                font-size: 18px;
                color: #8b4513;
                line-height: 1.6;
                margin-bottom: 15px;
            `;
            // 從事件數據中讀取係數說明訊息，如果沒有則使用預設訊息
            coefficientText.textContent = this.currentEvent.economicSignal.coefficientMessage || '每個選項會有相對應的係數，係數將會影響銷售數量，請玩家做好選擇。';
            
            // 提示文字
            const hintText = document.createElement('div');
            hintText.style.cssText = `
                font-family: 'Zpix', 'Press Start 2P', monospace;
                font-size: 12px;
                color: #999;
                margin-top: 20px;
            `;
            hintText.textContent = '點擊任意處繼續...';
            
            messageBox.appendChild(signalText);
            messageBox.appendChild(coefficientText);
            messageBox.appendChild(hintText);
            
            overlay.appendChild(bearSprite);
            overlay.appendChild(messageBox);
            
            // 添加浮動動畫
            const style = document.createElement('style');
            style.textContent = `
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
            `;
            document.head.appendChild(style);
            
            // 點擊關閉遮罩，進入下一階段
            overlay.addEventListener('click', () => {
                overlay.remove();
                style.remove();
                this.currentStage = 1;
                // 防呆：若當前事件不存在則不繼續
                if (!this.currentEvent) return;
                // 保存狀態
                this.saveEventState();
                this.showStory();
            });
            
            document.body.appendChild(overlay);
        },
        
        // 畫面2：劇情
        showStory() {
            const windowContent = document.querySelector('.window-content');
            windowContent.innerHTML = '';
            // 防呆：若事件遺失則嘗試重啟當前地區的事件
            if (!this.currentEvent) {
                if (GameFlowManager.selectedRegion) {
                    this.startEventFlow(GameFlowManager.selectedRegion);
                }
                return;
            }
            
            // 將劇情文字按句子或段落拆分
            const fullText = this.currentEvent.story.text;
            const dialogues = fullText.split('\n').filter(line => line.trim() !== '');
            let currentDialogueIndex = 0;
            
            const storyContainer = document.createElement('div');
            storyContainer.style.cssText = `
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                position: relative;
                box-sizing: border-box;
                overflow: hidden;
                background: transparent;
            `;
            
            // 劇情圖片容器（填滿整個畫面）
            const imageContainer = document.createElement('div');
            imageContainer.style.cssText = `
                width: 100%;
                height: 100%;
                position: absolute;
                top: 0;
                left: 0;
                background: transparent;
            `;
            
            // 劇情圖片
            const storyImage = document.createElement('img');
            storyImage.src = this.currentEvent.story.image;
            storyImage.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: cover;
                object-position: center;
                image-rendering: pixelated;
                display: block;
            `;
            storyImage.onerror = () => {
                storyImage.style.display = 'none';
            };
            
            imageContainer.appendChild(storyImage);
            
            // 對話框（固定在底部）
            const dialogBox = document.createElement('div');
            dialogBox.style.cssText = `
                position: absolute;
                bottom: 20px;
                left: 20px;
                right: 20px;
                background-color: rgba(245, 229, 197, 0.95);
                border: 4px solid #8b4513;
                border-radius: 12px;
                padding: 18px 20px;
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
                cursor: pointer;
                z-index: 10;
            `;
            
            // 劇情文字
            const storyText = document.createElement('p');
            storyText.style.cssText = `
                font-family: 'Zpix', 'Press Start 2P', monospace;
                font-size: 14px;
                color: #654321;
                line-height: 1.8;
                margin: 0;
                min-height: 50px;
                opacity: 1;
                transition: opacity 0.15s ease-out;
            `;
            storyText.textContent = dialogues[currentDialogueIndex];
            
            // 點擊提示圖標
            const clickHint = document.createElement('div');
            clickHint.innerHTML = '▼';
            clickHint.style.cssText = `
                position: absolute;
                bottom: 10px;
                right: 15px;
                color: #8b4513;
                font-size: 16px;
                animation: bounce 1s infinite;
            `;
            
            // 添加動畫
            const style = document.createElement('style');
            style.textContent = `
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
            `;
            document.head.appendChild(style);
            
            dialogBox.appendChild(storyText);
            dialogBox.appendChild(clickHint);
            
            // 防止連點
            let isAnimating = false;
            
            // 點擊對話框切換到下一句
            dialogBox.addEventListener('click', () => {
                if (isAnimating) return; // 防止動畫進行中重複點擊
                
                currentDialogueIndex++;
                
                if (currentDialogueIndex < dialogues.length) {
                    isAnimating = true;
                    
                    // 1. 舊文字淡出（0.15秒）
                    storyText.style.opacity = '0';
                    
                    // 2. 等待淡出完成後更換文字並淡入
                    setTimeout(() => {
                        // 更換文字
                        storyText.textContent = dialogues[currentDialogueIndex];
                        
                        // 新文字淡入
                        storyText.style.opacity = '1';
                        
                        // 動畫結束
                        setTimeout(() => {
                            isAnimating = false;
                        }, 150);
                    }, 150);
                } else {
                    // 對話結束，進入事件畫面
                this.currentStage = 2;
                // 保存狀態
                this.saveEventState();
                this.showEvent();
                }
            });
            
            storyContainer.appendChild(imageContainer);
            storyContainer.appendChild(dialogBox);
            
            windowContent.appendChild(storyContainer);
        },
        
        // 畫面3：事件（題目+選項）
        showEvent() {
            const windowContent = document.querySelector('.window-content');
            windowContent.innerHTML = '';
            
            const eventContainer = document.createElement('div');
            eventContainer.style.cssText = `
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                align-items: center;
                padding: 20px 15px;
                box-sizing: border-box;
                overflow-y: auto;
            `;
            eventContainer.classList.add('custom-scrollbar');
            
            // 事件卡片
            const eventCard = document.createElement('div');
            eventCard.style.cssText = `
                background-color: rgba(245, 229, 197, 0.95);
                border: 3px solid #8b4513;
                border-radius: 12px;
                padding: 20px;
                max-width: 650px;
                width: 100%;
                box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
            `;
            
            // 事件標題
            const eventTitle = document.createElement('h2');
            eventTitle.textContent = this.currentEvent.event.title;
            eventTitle.style.cssText = `
                font-family: 'Zpix', 'Press Start 2P', monospace;
                font-size: 20.7px;
                color: #8b4513;
                text-align: center;
                margin-bottom: 15px;
                margin-top: 0;
            `;
            
            // 問題描述
            const eventDescription = document.createElement('p');
            eventDescription.textContent = this.currentEvent.event.description;
            eventDescription.style.cssText = `
                font-family: 'Zpix', 'Press Start 2P', monospace;
                font-size: 14.95px;
                color: #654321;
                text-align: center;
                margin-bottom: 20px;
                line-height: 1.6;
            `;
            
            // 選項容器
            const optionsContainer = document.createElement('div');
            optionsContainer.style.cssText = `
                display: flex;
                flex-direction: column;
                gap: 12px;
            `;
            
            // 創建三個選項按鈕
            this.currentEvent.event.options.forEach(option => {
                const optionButton = document.createElement('button');
                optionButton.style.cssText = `
                    padding: 8px 16px;
                    background-color: #f5e5c5;
                    border: 2px solid #8b4513;
                    border-radius: 6px;
                    font-family: 'Zpix', 'Press Start 2P', monospace;
                    font-size: 14.4px;
                    color: #654321;
                    text-align: left;
                    cursor: pointer;
                    transition: all 0.3s;
                `;
                
                const optionLabel = document.createElement('div');
                optionLabel.textContent = `選項 ${option.id}`;
                optionLabel.style.cssText = `
                    font-weight: bold;
                    margin-bottom: 6px;
                    color: #8b4513;
                `;
                
                const optionText = document.createElement('div');
                optionText.textContent = option.text;
                optionText.style.lineHeight = '1.5';
                
                optionButton.appendChild(optionLabel);
                optionButton.appendChild(optionText);
                
                optionButton.addEventListener('mouseenter', () => {
                    optionButton.style.backgroundColor = '#e5d5b5';
                    optionButton.style.transform = 'translateX(8px)';
                    optionButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
                });
                optionButton.addEventListener('mouseleave', () => {
                    optionButton.style.backgroundColor = '#f5e5c5';
                    optionButton.style.transform = 'translateX(0)';
                    optionButton.style.boxShadow = 'none';
                });
                
                optionButton.addEventListener('click', () => {
                    this.selectedOption = option;
                    this.currentStage = 3;
                    // 保存狀態
                    this.saveEventState();
                    this.showFeedbackAndLesson();
                });
                
                optionsContainer.appendChild(optionButton);
            });
            
            eventCard.appendChild(eventTitle);
            eventCard.appendChild(eventDescription);
            eventCard.appendChild(optionsContainer);
            
            eventContainer.appendChild(eventCard);
            windowContent.appendChild(eventContainer);
        },
        
        // 畫面4：即時反饋 + 行銷教室（帶動畫效果）
        showFeedbackAndLesson() {
            const windowContent = document.querySelector('.window-content');
            windowContent.innerHTML = '';
            
            // 初始化效果應用標記
            this.effectsApplied = false;
            
            const feedbackContainer = document.createElement('div');
            feedbackContainer.style.cssText = `
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                align-items: center;
                padding: 15px;
                box-sizing: border-box;
                overflow-y: auto;
            `;
            feedbackContainer.classList.add('custom-scrollbar');
            
            // 結果卡片容器
            const resultCard = document.createElement('div');
            resultCard.style.cssText = `
                background-color: rgba(245, 229, 197, 0.95);
                border: 3px solid #8b4513;
                border-radius: 12px;
                padding: 20px;
                max-width: 650px;
                width: 100%;
                box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
            `;
            
            // === 第一步：即時反饋區塊（帶淡入動畫） ===
            const feedbackSection = document.createElement('div');
            feedbackSection.style.cssText = `
                background: linear-gradient(135deg, #fff8dc 0%, #ffe4b5 100%);
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 20px;
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.6s ease, transform 0.6s ease;
                box-shadow: 0 4px 12px rgba(218, 165, 32, 0.3);
            `;
            
            const feedbackTitle = document.createElement('h3');
            feedbackTitle.innerHTML = '<img src="assets/images/蜜蜂鼠標.png" style="width: 18px; height: 18px; vertical-align: middle; margin-right: 6px;">即時反饋';
            feedbackTitle.style.cssText = `
                font-family: 'Zpix', 'Press Start 2P', monospace;
                font-size: 18px;
                color: #8b4513;
                margin-bottom: 12px;
                margin-top: 0;
                text-align: center;
            `;
            
            const feedbackText = document.createElement('p');
            feedbackText.textContent = this.selectedOption.feedback;
            feedbackText.style.cssText = `
                font-family: 'Zpix', 'Press Start 2P', monospace;
                font-size: 16px;
                color: #654321;
                line-height: 1.6;
                white-space: pre-wrap;
                margin: 0;
                text-align: center;
            `;
            
            feedbackSection.appendChild(feedbackTitle);
            feedbackSection.appendChild(feedbackText);
            
            // === 分隔線圖片 ===
            const dividerImage = document.createElement('img');
            dividerImage.src = 'assets/images/分隔線.png';
            dividerImage.style.cssText = `
                width: 100%;
                max-width: 500px;
                height: auto;
                display: block;
                margin: 15px auto;
                opacity: 0;
                transition: opacity 0.6s ease;
            `;
            
            // === 第二步：資源變化區塊（動畫版） ===
            const resourceSection = document.createElement('div');
            resourceSection.style.cssText = `
                background: linear-gradient(135deg, #fff8dc 0%, #ffe4b5 100%);
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 15px;
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.6s ease, transform 0.6s ease;
                box-shadow: 0 4px 12px rgba(218, 165, 32, 0.3);
            `;
            
            const resourceTitle = document.createElement('h4');
            resourceTitle.innerHTML = '<img src="assets/images/蜂蜜幣.png" style="width: 18px; height: 18px; vertical-align: middle; margin-right: 6px;">資源變化';
            resourceTitle.style.cssText = `
                font-family: 'Zpix', 'Press Start 2P', monospace;
                font-size: 18px;
                color: #8b4513;
                margin-bottom: 8px;
                margin-top: 0;
                text-align: center;
            `;
            
            const honeyChange = this.selectedOption.effects.honey;
            const honeyColor = honeyChange >= 0 ? '#2d8659' : '#d32f2f';
            
            // 蜂蜜幣變化區域
            const honeyChangeDiv = document.createElement('div');
            honeyChangeDiv.style.cssText = 'margin-bottom: 10px;';
            honeyChangeDiv.innerHTML = `
                <img src="assets/images/蜂蜜幣.png" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px;">選項成本(蜂蜜幣)：<span id="honey-change-value" style="color: ${honeyColor}; font-weight: bold; font-size: 16px;">0 HBC</span>
            `;
            
            // 客流量星星區域
            const trafficDiv = document.createElement('div');
            trafficDiv.innerHTML = `<img src="assets/images/客流量.png" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px;">客流量：<span id="traffic-stars"></span>`;
            
            resourceSection.appendChild(resourceTitle);
            resourceSection.appendChild(honeyChangeDiv);
            resourceSection.appendChild(trafficDiv);
            
            // === 第二條分隔線圖片 ===
            const dividerImage2 = document.createElement('img');
            dividerImage2.src = 'assets/images/分隔線.png';
            dividerImage2.style.cssText = `
                width: 100%;
                max-width: 500px;
                height: auto;
                display: block;
                margin: 15px auto;
                opacity: 0;
                transition: opacity 0.6s ease;
            `;
            
            // === 第三步：行銷教室區塊（壓軸總結） ===
            const lessonSection = document.createElement('div');
            lessonSection.style.cssText = `
                background: linear-gradient(135deg, #fff8dc 0%, #ffe4b5 100%);
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 15px;
                opacity: 0;
                transform: translateY(30px);
                transition: opacity 0.8s ease, transform 0.8s ease;
                box-shadow: 0 4px 12px rgba(218, 165, 32, 0.3);
            `;
            
            const lessonTitle = document.createElement('h3');
            lessonTitle.innerHTML = '<img src="assets/images/小熊哥.png" style="width: 18px; height: 18px; vertical-align: middle; margin-right: 6px;">小熊哥的行銷教室';
            lessonTitle.style.cssText = `
                font-family: 'Zpix', 'Press Start 2P', monospace;
                font-size: 18px;
                color: #8b4513;
                margin-bottom: 15px;
                text-align: center;
                padding-bottom: 10px;
            `;
            
            const lessonText = document.createElement('p');
            lessonText.textContent = this.currentEvent.event.marketingLesson;
            lessonText.style.cssText = `
                font-family: 'Zpix', 'Press Start 2P', monospace;
                font-size: 15px;
                color: #654321;
                line-height: 1.8;
                white-space: pre-wrap;
                margin: 0;
                text-align: center;
            `;
            
            lessonSection.appendChild(lessonTitle);
            lessonSection.appendChild(lessonText);
            
            // === 完成按鈕 ===
            const continueButton = document.createElement('button');
            continueButton.textContent = '完成事件 →';
            continueButton.style.cssText = `
                width: 100%;
                padding: 12px;
                background-color: #8b4513;
                color: white;
                border: none;
                border-radius: 8px;
                font-family: 'Zpix', 'Press Start 2P', monospace;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.3s;
                opacity: 0;
                transform: translateY(20px);
            `;
            
            continueButton.addEventListener('mouseenter', () => {
                continueButton.style.backgroundColor = '#654321';
                continueButton.style.transform = 'scale(1.02) translateY(0)';
            });
            continueButton.addEventListener('mouseleave', () => {
                continueButton.style.backgroundColor = '#8b4513';
                continueButton.style.transform = 'scale(1) translateY(0)';
            });
            
            continueButton.addEventListener('click', () => {
                if (this.eventCompleted) return;
                this.eventCompleted = true;
                continueButton.disabled = true;
                continueButton.style.opacity = '0.7';
                
                // 資源效果已在動畫時應用，這裡不再重複調用
                // this.applyEventEffects();
                GameFlowManager.completeEvent();
                
                this.currentStage = 0;
                this.currentEvent = null;
                this.selectedOption = null;
                this.effectsApplied = false; // 重置標記供下次使用
                
                // 清除事件狀態
                this.clearEventState();
                
                const regionEvents = this.eventsData?.regions?.[GameFlowManager.selectedRegion] || [];
                if (GameFlowManager.eventsCompleted >= Math.max(GameFlowManager.totalEventsPerRound, regionEvents.length)) {
                    showMessage('本輪事件已全部完成！', 'success');
                    GameFlowManager.hasStocked = false;
                    localStorage.setItem('hasStocked', 'false');
                    
                    if (window.updateStockButtonState) {
                        window.updateStockButtonState();
                    }
                    
                    StockingSystem.resetInventory();
                    StockingSystem.saveInventory();
                    
                    setTimeout(() => {
                        ContentManager.showContent('financial-report');
                    }, 1000);
                } else {
                    showMessage(`事件 ${GameFlowManager.eventsCompleted}/${GameFlowManager.totalEventsPerRound} 完成`, 'success');
                    setTimeout(() => {
                        ContentManager.showContent('event');
                    }, 1000);
                }
            });
            
            resultCard.appendChild(feedbackSection);
            resultCard.appendChild(dividerImage);
            resultCard.appendChild(resourceSection);
            resultCard.appendChild(dividerImage2);
            resultCard.appendChild(lessonSection);
            resultCard.appendChild(continueButton);
            
            feedbackContainer.appendChild(resultCard);
            windowContent.appendChild(feedbackContainer);
            
            // === 動畫時間軸：故事 → 結果 → 學習 ===
            setTimeout(() => {
                // 第一步：即時反饋淡入（0-2秒）
                feedbackSection.style.opacity = '1';
                feedbackSection.style.transform = 'translateY(0)';
            }, 100);
            
            setTimeout(() => {
                // 1.5步：分隔線圖片淡入（1秒後）
                dividerImage.style.opacity = '1';
            }, 1000);
            
            setTimeout(() => {
                // 第二步：資源變化區塊淡入（2-4秒）
                resourceSection.style.opacity = '1';
                resourceSection.style.transform = 'translateY(0)';
                
                // 應用資源效果（實際更新資源）
                if (!this.effectsApplied) {
                    this.applyEventEffects();
                    this.effectsApplied = true;
                }
                
                // 蜂蜜幣數字動畫
                this.animateHoneyChange(honeyChange);
                
                // 客流量星星動畫
                const allCoefficients = this.currentEvent.event.options.map(option => option.coefficient);
                const trafficLevel = this.calculateTrafficLevel(this.selectedOption.coefficient, allCoefficients);
                this.animateTrafficStars(trafficLevel);
            }, 2000);
            
            setTimeout(() => {
                // 2.5步：第二條分隔線圖片淡入（3秒後）
                dividerImage2.style.opacity = '1';
            }, 3000);
            
            setTimeout(() => {
                // 第三步：行銷教室滑入（4-6秒）- 壓軸總結
                lessonSection.style.opacity = '1';
                lessonSection.style.transform = 'translateY(0)';
                
                // 自動滾動到行銷教室，確保完整顯示
                setTimeout(() => {
                    lessonSection.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start',
                        inline: 'nearest'
                    });
                }, 400); // 等淡入動畫進行後再滾動
            }, 4000);
            
            setTimeout(() => {
                // 第四步：完成按鈕亮起（最後）
                continueButton.style.opacity = '1';
                continueButton.style.transform = 'translateY(0)';
            }, 6000);
        },
        
        // 蜂蜜幣數字動畫
        animateHoneyChange(targetChange) {
            const honeyValueElement = document.getElementById('honey-change-value');
            if (!honeyValueElement) return;
            
            const currentHoney = GameResources.resources.honey;
            const duration = 1000; // 1秒
            const steps = 30;
            const stepValue = targetChange / steps;
            const stepDelay = duration / steps;
            
            let currentStep = 0;
            const interval = setInterval(() => {
                currentStep++;
                const displayValue = Math.round(stepValue * currentStep);
                const displayText = displayValue >= 0 ? `+${displayValue}` : displayValue;
                honeyValueElement.textContent = `${displayText} HBC`;
                
                if (currentStep >= steps) {
                    clearInterval(interval);
                    const finalText = targetChange >= 0 ? `+${targetChange}` : targetChange;
                    honeyValueElement.textContent = `${finalText} HBC`;
                }
            }, stepDelay);
        },
        
        // 客流量星星動畫
        animateTrafficStars(trafficLevel) {
            const starsElement = document.getElementById('traffic-stars');
            if (!starsElement) return;
            
            // 提取星星數量
            const starCount = (trafficLevel.match(/⭐/g) || []).length;
            
            let currentStar = 0;
            const interval = setInterval(() => {
                if (currentStar < starCount) {
                    currentStar++;
                    starsElement.textContent = '⭐'.repeat(currentStar);
                    // 播放音效（如果有）
                    // this.playStarSound();
                } else {
                    clearInterval(interval);
                    starsElement.innerHTML = `<span style="color: #8b4513; font-weight: bold;">${trafficLevel}</span>`;
                }
            }, 400); // 每0.4秒一顆星
        },
        
        // 應用事件效果（更新資源）
        applyEventEffects() {
            if (!this.selectedOption) return;
            
            const effects = this.selectedOption.effects;
            const currentEvent = this.currentEvent;
            
            // 1. 處理選項成本（蜂蜜幣支出）
            if (effects.hasOwnProperty('honey')) {
                GameResources.addResource('honey', effects.honey);
            }
            
            // 2. 計算銷售收入
            let salesResult = null;
            if (currentEvent && GameFlowManager.selectedRegion && GameFlowManager.selectedDistrict) {
                const inventory = StockingSystem.getCurrentInventory();
                const regionType = GameFlowManager.selectedRegion;
                const district = GameFlowManager.selectedDistrict;
                const economicLevel = currentEvent.economicSignal?.level || currentEvent.economicSignal || '綠燈';
                const optionCoefficient = this.selectedOption.coefficient;
                
                // 計算銷售
                salesResult = SalesCalculator.calculateEventSales(
                    inventory, regionType, district, economicLevel, optionCoefficient
                );
                
                // 加入銷售收入
                GameResources.addResource('honey', salesResult.totalRevenue);
                
                console.log(`💰 事件銷售完成: 收入=${salesResult.totalRevenue}, 銷售量=${salesResult.totalSalesVolume}`);
            }
            
            // 3. 更新顧客滿意度（熊點數）
            if (effects.hasOwnProperty('satisfaction')) {
                GameResources.addResource('bearPoints', effects.satisfaction);
            }
            
            // 4. 更新聲望（勳章）
            if (effects.hasOwnProperty('reputation')) {
                GameResources.addResource('medals', effects.reputation);
            }
            
            // 5. 記錄到財務報表（在所有資源更新後）
            // 無論是否有銷售，都要記錄事件
            const optionHoney = effects.honey || 0;
            const eventRevenue = (salesResult ? salesResult.totalRevenue : 0) + (optionHoney > 0 ? optionHoney : 0);
            const eventCost = optionHoney < 0 ? Math.abs(optionHoney) : 0;
            
            FinancialReport.recordEvent({
                eventTitle: currentEvent.title,
                revenue: eventRevenue, // 銷售收入 + 選項蜂蜜幣收入
                cost: eventCost, // 選項蜂蜜幣支出
                salesVolume: salesResult ? salesResult.totalSalesVolume : 0,
                satisfactionChange: effects.satisfaction || 0,
                reputationChange: effects.reputation || 0,
                salesDetail: salesResult ? salesResult.salesDetail : []
            });
        },
        
        // 恢復事件流程（從當前階段繼續）
        resumeEventFlow() {
            // 先嘗試恢復事件狀態
            if (!this.currentEvent) {
                const stateRestored = this.loadEventState();
                if (stateRestored && this.currentEvent) {
                    console.log('✅ 已恢復事件狀態，當前階段:', this.currentStage);
                } else {
                    // 如果沒有當前事件，重新開始
                    if (GameFlowManager.selectedRegion) {
                        this.startEventFlow(GameFlowManager.selectedRegion);
                    }
                    return;
                }
            }
            
            // 根據當前階段恢復對應畫面
            switch(this.currentStage) {
                case 0:
                    // 景氣燈號已經顯示過，跳到劇情
                    this.showStory();
                    break;
                case 1:
                    this.showStory();
                    break;
                case 2:
                    this.showEvent();
                    break;
                case 3:
                    this.showFeedbackAndLesson();
                    break;
                default:
                    // 如果狀態異常，重新開始
                    this.startEventFlow(GameFlowManager.selectedRegion);
            }
        },
        
        // 計算客流量等級和星級顯示（相對比較）
        calculateTrafficLevel(coefficient, allCoefficients) {
            // 對所有係數進行排序
            const sortedCoefficients = [...allCoefficients].sort((a, b) => b - a);
            
            // 找到當前係數在排序後的位置
            const index = sortedCoefficients.indexOf(coefficient);
            
            let level = '';
            let stars = '';
            
            // 根據在排序中的位置決定等級
            if (index === 0) {
                // 最高
                level = '高';
                stars = '<img src="assets/images/客流量星星.png" style="width: 16px; height: 16px; vertical-align: middle; margin: 0 1px;"><img src="assets/images/客流量星星.png" style="width: 16px; height: 16px; vertical-align: middle; margin: 0 1px;"><img src="assets/images/客流量星星.png" style="width: 16px; height: 16px; vertical-align: middle; margin: 0 1px;">';
            } else if (index === 1) {
                // 中等
                level = '中';
                stars = '<img src="assets/images/客流量星星.png" style="width: 16px; height: 16px; vertical-align: middle; margin: 0 1px;"><img src="assets/images/客流量星星.png" style="width: 16px; height: 16px; vertical-align: middle; margin: 0 1px;">';
            } else {
                // 最低
                level = '低';
                stars = '<img src="assets/images/客流量星星.png" style="width: 16px; height: 16px; vertical-align: middle; margin: 0 1px;">';
            }
            
            return `${level} ${stars}`;
        }
    };
    
    // 遊戲流程管理器
    const GameFlowManager = {
        currentRound: 1,
        eventsCompleted: 0,
        totalEventsPerRound: 7,
        hasSelectedRegion: false,
        hasStocked: false, // 本輪是否已進貨
        selectedRegion: null, // 地區類型（住宅區/商業區/學區）
        selectedDistrict: null, // 行政區（鹽埕區、新興區等）
        selectedCoefficient: 1.0, // 選擇的行政區係數
        
        // 初始化遊戲流程
        init() {
            // 檢查是否已經選擇過地區
            const savedRegion = localStorage.getItem('selectedRegion');
            const savedDistrict = localStorage.getItem('selectedDistrict');
            const savedCoefficient = localStorage.getItem('selectedCoefficient');
            const savedRound = localStorage.getItem('currentRound');
            const savedEvents = localStorage.getItem('eventsCompleted');
            const savedStocked = localStorage.getItem('hasStocked');
            
            // 除錯：顯示當前玩家狀態
            console.log('=== 玩家當前狀態 ===');
            console.log('selectedRegion:', savedRegion);
            console.log('currentRound:', savedRound);
            console.log('eventsCompleted:', savedEvents);
            
            // 判斷玩家身份
            if (!savedRegion && !savedRound) {
                console.log('→ 狀況1：第一次進入遊戲');
            } else if (!savedRegion && savedRound) {
                console.log(`→ 狀況2：第${savedRound}次進入遊戲但還沒選擇地區`);
            } else if (savedRegion && parseInt(savedEvents) >= this.totalEventsPerRound) {
                console.log(`→ 狀況3：已完成7個事件，查看財務報表中`);
            } else if (savedRegion) {
                console.log(`→ 進行中：第${savedRound}輪，已選擇「${savedRegion}」，完成${savedEvents}個事件`);
            }
            console.log('==================');
            
            // 需要顯示地區選擇的情況：
            // 1. 第一次進入遊戲 (savedRegion 不存在，且 savedRound 不存在)
            // 2. 第二次進入遊戲但還沒選擇地區 (savedRegion 不存在，但 savedRound 存在)
            // 3. 已經過7個事件以及財務報表，點擊下一輪按鈕 (會清除 savedRegion)
            
            if (savedRegion) {
                // 已經選擇過地區，繼續遊戲
                this.hasSelectedRegion = true;
                this.selectedRegion = savedRegion;
                this.selectedDistrict = savedDistrict;
                this.selectedCoefficient = parseFloat(savedCoefficient) || 1.0;
                this.currentRound = parseInt(savedRound) || 1;
                this.eventsCompleted = parseInt(savedEvents) || 0;
                this.hasStocked = savedStocked === 'true';
                
                // 若尚未選擇行政區，返回地區選擇畫面
                if (!this.selectedDistrict) {
                    ContentManager.showContent('region-select');
                    return;
                }
                
                // 如果已完成7個事件，顯示財務報表
                if (this.eventsCompleted >= this.totalEventsPerRound) {
                    ContentManager.showContent('financial-report');
                } else {
                    // 繼續進行事件（恢復到正確的階段）
                    ContentManager.showContent('event');
                }
            } else {
                // 還沒選擇地區，必須先選擇
                // 恢復輪數和事件計數（如果有的話）
                this.currentRound = parseInt(savedRound) || 1;
                this.eventsCompleted = parseInt(savedEvents) || 0;
                this.hasSelectedRegion = false;
                this.selectedRegion = null;
                
                // 顯示地區選擇畫面
                ContentManager.showContent('region-select');
            }
        },
        
        // 選擇地區類型（第一階段）
        selectRegionType(regionType) {
            this.selectedRegion = regionType;
            // 顯示該地區類型的行政區選擇
            ContentManager.showDistrictSelectContent(regionType);
        },
        
        // 選擇行政區（第二階段）
        selectDistrict(regionType, district, coefficient) {
            // 計算總租金 = 基礎租金 × 行政區係數
            const totalRent = RegionCoefficientsManager.calculateTotalRent(regionType, coefficient);
            
            // 檢查蜂蜜幣是否足夠
            if (GameResources.resources.honey < totalRent) {
                showMessage(`蜂蜜幣不足！<br>需要 <img src="assets/images/蜂蜜幣.png" style="width: 16px; height: 16px; vertical-align: middle; margin: 0 2px;"> ${totalRent.toLocaleString()}，但只有 <img src="assets/images/蜂蜜幣.png" style="width: 16px; height: 16px; vertical-align: middle; margin: 0 2px;"> ${GameResources.resources.honey.toLocaleString()}`, 'error');
                return;
            }
            
            // 扣除租金
            console.log(`🏢 選擇地區: ${regionType} - ${district} (係數${coefficient})`);
            console.log(`💰 支付租金: 基礎租金${RegionCoefficientsManager.getBaseRent(regionType)} × ${coefficient} = ${totalRent}`);
            GameResources.resources.honey -= totalRent;
            GameResources.updateDisplay();
            GameResources.saveResources();
            
            this.selectedRegion = regionType;
            this.selectedDistrict = district;
            this.selectedCoefficient = coefficient;
            this.hasSelectedRegion = true;
            this.eventsCompleted = 0;
            this.saveProgress();
            
            // 設置財務報表的地區資訊（傳入實際支付的租金）
            FinancialReport.setRegionInfo(regionType, district, totalRent);
            
            // 🤖 讓虛擬玩家也選擇地區
            if (window.VirtualPlayersSystem) {
                VirtualPlayersSystem.simulateRegionSelection(regionType, district);
            }
            
            showMessage(`已選擇：${regionType} - ${district}<br>支付租金：<img src="assets/images/蜂蜜幣.png" style="width: 16px; height: 16px; vertical-align: middle; margin: 0 3px;"> ${totalRent.toLocaleString()}`, 'success');
            
            // 選擇行政區後自動跳轉到進貨畫面
            setTimeout(() => {
                ContentManager.showContent('stock');
            }, 1500);
        },
        
        // 完成一個事件
        completeEvent() {
            this.eventsCompleted++;
            this.saveProgress();
            
            console.log(`已完成 ${this.eventsCompleted}/${this.totalEventsPerRound} 個事件`);
            
            // 讓虛擬玩家也完成這個事件
            if (window.VirtualPlayersSystem && window.EventFlowManager && EventFlowManager.currentEvent) {
                VirtualPlayersSystem.simulateRound(EventFlowManager.currentEvent);
            }
            
            // 檢查是否完成7個事件
            if (this.eventsCompleted >= this.totalEventsPerRound) {
                // 顯示財務報表
                setTimeout(() => {
                    ContentManager.showContent('financial-report');
                }, 1000);
            }
        },
        
        // 開始下一輪
        startNextRound() {
            this.currentRound++;
            this.eventsCompleted = 0;
            this.hasSelectedRegion = false;
            this.selectedRegion = null;
            this.selectedDistrict = null;
            this.selectedCoefficient = 1.0;
            
            // 清除儲存的地區選擇
            localStorage.removeItem('selectedRegion');
            localStorage.removeItem('selectedDistrict');
            localStorage.removeItem('selectedCoefficient');
            this.saveProgress();
            
            // 🤖 讓虛擬玩家也準備新一輪
            if (window.VirtualPlayersSystem) {
                console.log('\n🔄 ========== 準備虛擬玩家進入第 ' + this.currentRound + ' 輪 ==========');
                VirtualPlayersSystem.players.forEach(player => {
                    console.log(`🤖 ${player.name}: 重置進度...`);
                    console.log(`   💰 當前蜂蜜幣: ${player.resources.honey.toLocaleString()}`);
                    console.log(`   😊 滿意度: ${player.resources.satisfaction}`);
                    console.log(`   🏆 聲望: ${player.resources.reputation}`);
                    
                    player.gameProgress.currentRound = this.currentRound;
                    player.gameProgress.eventsCompleted = 0;
                    player.gameProgress.selectedRegion = null;
                    player.gameProgress.selectedDistrict = null;
                    player.gameProgress.selectedCoefficient = 1.0;
                    player.gameProgress.hasStocked = false;
                    // 保留庫存，不清空 player.inventory
                    
                    console.log(`   ✅ 已重置：地區、進貨狀態（保留庫存）`);
                });
                VirtualPlayersSystem.savePlayers();
                console.log('✅ 所有虛擬玩家準備完成，等待第 ' + this.currentRound + ' 輪開始\n');
            }
            
            showMessage(`準備開始第 ${this.currentRound} 輪！`, 'success');
            
            // 返回地區選擇
            setTimeout(() => {
                ContentManager.showContent('region-select');
            }, 1000);
        },
        
        // 儲存進度
        saveProgress() {
            if (this.selectedRegion) {
                localStorage.setItem('selectedRegion', this.selectedRegion);
            }
            if (this.selectedDistrict) {
                localStorage.setItem('selectedDistrict', this.selectedDistrict);
            }
            if (this.selectedCoefficient) {
                localStorage.setItem('selectedCoefficient', this.selectedCoefficient.toString());
            }
            localStorage.setItem('currentRound', this.currentRound.toString());
            localStorage.setItem('eventsCompleted', this.eventsCompleted.toString());
        },
        
        // 重置遊戲（從頭開始）
        resetGame() {
            this.currentRound = 1;
            this.eventsCompleted = 0;
            this.hasSelectedRegion = false;
            this.selectedRegion = null;
            this.selectedDistrict = null;
            this.selectedCoefficient = 1.0;
            
            localStorage.removeItem('selectedRegion');
            localStorage.removeItem('selectedDistrict');
            localStorage.removeItem('selectedCoefficient');
            localStorage.removeItem('currentRound');
            localStorage.removeItem('eventsCompleted');
            
            showMessage('已重置遊戲，回到第1輪', 'success');
            ContentManager.showContent('region-select');
        },
        
        // 重新選擇地區（保持當前輪數）
        resetRegionSelection() {
            this.hasSelectedRegion = false;
            this.selectedRegion = null;
            this.selectedDistrict = null;
            this.selectedCoefficient = 1.0;
            this.eventsCompleted = 0;
            
            localStorage.removeItem('selectedRegion');
            localStorage.removeItem('selectedDistrict');
            localStorage.removeItem('selectedCoefficient');
            localStorage.setItem('eventsCompleted', '0');
            
            showMessage(`回到第 ${this.currentRound} 輪的地區選擇`, 'info');
            ContentManager.showContent('region-select');
        }
    };

    // 一鍵重置玩家狀態
    function resetPlayerState() {
        // 清除流程相關狀態
        GameFlowManager.currentRound = 1;
        GameFlowManager.eventsCompleted = 0;
        GameFlowManager.hasSelectedRegion = false;
        GameFlowManager.hasStocked = false; // 重置進貨狀態
        GameFlowManager.selectedRegion = null;
        localStorage.removeItem('selectedRegion');
        localStorage.removeItem('hasStocked'); // 清除進貨狀態
        localStorage.setItem('currentRound', '1');
        localStorage.setItem('eventsCompleted', '0');
        GameFlowManager.saveProgress();

        // 清除事件流程狀態
        if (window.EventFlowManager) {
            EventFlowManager.currentStage = 0;
            EventFlowManager.currentEvent = null;
            EventFlowManager.selectedOption = null;
        }

        // 重置資源
        GameResources.resetToInitial();
        
        // 重置進貨系統
        StockingSystem.resetInventory();
        StockingSystem.saveInventory();
        
        // 重置財務報表
        FinancialReport.resetCurrentRound();
        FinancialReport.history = [];
        FinancialReport.saveReport();
        
        // 重置虛擬玩家
        if (window.VirtualPlayersSystem) {
            VirtualPlayersSystem.resetAllPlayers();
        }

        showMessage('玩家狀態已重置為初始', 'success');
        ContentManager.showContent('region-select');
    }
    
    // 事件題庫系統
    const EventDatabase = {
        // 住宅區事件題庫
        residential: [],
        
        // 商業區事件題庫
        commercial: [],
        
        // 學區事件題庫
        school: [],
        
        // 添加事件到題庫
        addEvent(region, eventData) {
            this[region].push(eventData);
        },
        
        // 獲取隨機事件
        getRandomEvent(region) {
            const events = this[region];
            if (events.length === 0) return null;
            return events[Math.floor(Math.random() * events.length)];
        }
    };
    
    // 事件顯示系統
    const EventDisplayManager = {
        currentEventData: null,
        currentStep: 1, // 1:景氣燈號 2:劇情 3:事件選擇 4:即時反饋
        selectedChoice: null,
        
        // 開始顯示事件（4個畫面流程）
        startEventSequence(eventData) {
            this.currentEventData = eventData;
            this.currentStep = 1;
            this.selectedChoice = null;
            
            // 暫停事件進度
            EventManager.pauseEventProgress();
            
            // 顯示第一個畫面：景氣燈號
            this.showEconomicIndicator();
        },
        
        // 第1個畫面：景氣燈號
        showEconomicIndicator() {
            const indicator = this.currentEventData.economicIndicator;
            
            // 創建全螢幕遮罩
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.8);
                z-index: 1000;
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                animation: fadeIn 0.3s ease-in;
            `;
            
            // 內容容器
            const content = document.createElement('div');
            content.style.cssText = `
                background: linear-gradient(135deg, #f5e5c5 0%, #deb887 100%);
                border: 5px solid #8b4513;
                border-radius: 20px;
                padding: 40px;
                max-width: 600px;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            `;
            
            // 小熊精靈
            const bearSprite = document.createElement('img');
            bearSprite.src = 'assets/videos/被壓縮的熊精靈.gif';
            bearSprite.alt = '小熊精靈';
            bearSprite.style.cssText = `
                width: 120px;
                height: 120px;
                margin-bottom: 20px;
                image-rendering: pixelated;
            `;
            
            // 標題
            const title = document.createElement('h2');
            title.textContent = '今日景氣燈號';
            title.style.cssText = `
                color: #8b4513;
                font-size: 24px;
                margin-bottom: 20px;
                text-shadow: 2px 2px 0px #deb887;
            `;
            
            // 景氣燈號
            const indicatorText = document.createElement('div');
            indicatorText.textContent = indicator;
            indicatorText.style.cssText = `
                color: #654321;
                font-size: 18px;
                line-height: 1.8;
                margin-bottom: 20px;
                padding: 20px;
                background-color: rgba(255, 255, 255, 0.7);
                border-radius: 10px;
                border: 3px solid #8b4513;
            `;
            
            // 提示文字
            const hint = document.createElement('p');
            hint.textContent = '點擊任意處繼續...';
            hint.style.cssText = `
                color: #8b4513;
                font-size: 14px;
                animation: blink 1.5s infinite;
            `;
            
            // 組裝
            content.appendChild(bearSprite);
            content.appendChild(title);
            content.appendChild(indicatorText);
            content.appendChild(hint);
            overlay.appendChild(content);
            document.body.appendChild(overlay);
            
            // 點擊關閉並進入下一個畫面
            overlay.addEventListener('click', () => {
                overlay.remove();
                this.currentStep = 2;
                this.showStoryScene();
            });
        },
        
        // 第2個畫面：劇情
        showStoryScene() {
            const windowContent = document.querySelector('.window-content');
            windowContent.innerHTML = '';
            
            const storyContainer = document.createElement('div');
            storyContainer.style.cssText = `
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                background-color: transparent;
                position: relative;
            `;
            
            // 劇情圖片
            const storyImage = document.createElement('img');
            storyImage.src = this.currentEventData.storyImage;
            storyImage.alt = '劇情圖片';
            storyImage.style.cssText = `
                width: 100%;
                flex: 1;
                object-fit: cover;
                border-radius: 8px 8px 0 0;
                image-rendering: pixelated;
            `;
            
            // 對話框容器
            const dialogBox = document.createElement('div');
            dialogBox.style.cssText = `
                width: 100%;
                background: linear-gradient(135deg, rgba(139, 69, 19, 0.95) 0%, rgba(101, 67, 33, 0.95) 100%);
                border-radius: 0 0 8px 8px;
                padding: 20px;
                box-sizing: border-box;
                border-top: 3px solid #daa520;
            `;
            
            // 將劇情文字按句號分割
            const storyContent = this.currentEventData.storyText;
            const sentences = storyContent.split('。').filter(s => s.trim().length > 0);
            
            // 劇情文字容器
            const storyText = document.createElement('p');
            storyText.style.cssText = `
                color: #f5e5c5;
                font-size: 14px;
                line-height: 1.8;
                margin: 0 0 15px 0;
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
                min-height: 60px;
            `;
            
            // 劇情繼續按鈕
            const storyContinueButton = document.createElement('button');
            storyContinueButton.textContent = '繼續 →';
            storyContinueButton.style.cssText = `
                padding: 8px 20px;
                background: linear-gradient(135deg, #daa520 0%, #b8860b 100%);
                border: 2px solid #8b4513;
                border-radius: 6px;
                color: #fff;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.3s ease;
                display: block;
                margin: 0 auto;
            `;
            
            let currentSentenceIndex = 0;
            
            // 顯示當前句子
            const showCurrentSentence = () => {
                if (currentSentenceIndex < sentences.length) {
                    storyText.textContent = sentences[currentSentenceIndex] + '。';
                    
                    // 如果是最後一句，改變按鈕文字
                    if (currentSentenceIndex === sentences.length - 1) {
                        storyContinueButton.textContent = '我明白了 ✓';
                        storyContinueButton.style.background = 'linear-gradient(135deg, #32cd32 0%, #228b22 100%)';
                    }
                } else {
                    // 所有句子都顯示完了，隱藏按鈕
                    storyContinueButton.style.display = 'none';
                }
            };
            
            // 劇情按鈕點擊事件
            storyContinueButton.addEventListener('mouseenter', () => {
                storyContinueButton.style.transform = 'scale(1.05)';
            });
            storyContinueButton.addEventListener('mouseleave', () => {
                storyContinueButton.style.transform = 'scale(1)';
            });
            storyContinueButton.addEventListener('click', () => {
                currentSentenceIndex++;
                if (currentSentenceIndex < sentences.length) {
                    showCurrentSentence();
                } else {
                    // 完成所有句子，隱藏按鈕並顯示最終繼續按鈕
                    storyContinueButton.style.display = 'none';
                    setTimeout(() => {
                        finalContinueButton.style.display = 'block';
                        setTimeout(() => {
                            finalContinueButton.style.opacity = '1';
                        }, 50);
                    }, 300);
                }
            });
            
            // 初始化顯示第一句
            showCurrentSentence();
            
            dialogBox.appendChild(storyText);
            dialogBox.appendChild(storyContinueButton);
            
            // 最終繼續按鈕（隱藏狀態）
            const finalContinueButton = document.createElement('button');
            finalContinueButton.textContent = '繼續 →';
            finalContinueButton.style.cssText = `
                position: absolute;
                bottom: 20px;
                right: 20px;
                padding: 10px 25px;
                background: linear-gradient(135deg, #daa520 0%, #b8860b 100%);
                border: 3px solid #8b4513;
                border-radius: 6px;
                color: #fff;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                opacity: 0;
                display: none;
            `;
            
            finalContinueButton.addEventListener('mouseenter', () => {
                finalContinueButton.style.background = 'linear-gradient(135deg, #ffd700 0%, #daa520 100%)';
                finalContinueButton.style.transform = 'translateY(-2px)';
            });
            
            finalContinueButton.addEventListener('mouseleave', () => {
                finalContinueButton.style.background = 'linear-gradient(135deg, #daa520 0%, #b8860b 100%)';
                finalContinueButton.style.transform = 'translateY(0)';
            });
            
            finalContinueButton.addEventListener('click', () => {
                this.currentStep = 3;
                this.showEventQuestion();
            });
            
            storyContainer.appendChild(storyImage);
            storyContainer.appendChild(dialogBox);
            storyContainer.appendChild(finalContinueButton);
            windowContent.appendChild(storyContainer);
        },
        
        // 第3個畫面：事件選擇
        showEventQuestion() {
            const windowContent = document.querySelector('.window-content');
            windowContent.innerHTML = '';
            
            const questionContainer = document.createElement('div');
            questionContainer.style.cssText = `
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, rgba(245, 222, 179, 0.9) 0%, rgba(222, 184, 135, 0.9) 100%);
                border-radius: 12px;
                padding: 30px;
                box-sizing: border-box;
            `;
            
            // 題目
            const question = document.createElement('h3');
            question.textContent = this.currentEventData.question;
            question.style.cssText = `
                color: #8b4513;
                font-size: 18px;
                margin-bottom: 30px;
                text-align: center;
                line-height: 1.6;
                max-width: 500px;
            `;
            
            // 選項容器
            const choicesContainer = document.createElement('div');
            choicesContainer.style.cssText = `
                display: flex;
                flex-direction: column;
                gap: 15px;
                width: 100%;
                max-width: 500px;
            `;
            
            // 三個選項
            this.currentEventData.choices.forEach((choice, index) => {
                const choiceButton = document.createElement('button');
                choiceButton.textContent = `${String.fromCharCode(65 + index)}. ${choice.text}`;
                choiceButton.style.cssText = `
                    padding: 15px 20px;
                    background: linear-gradient(135deg, #fff 0%, #f5e5c5 100%);
                    border: 3px solid #8b4513;
                    border-radius: 8px;
                    color: #654321;
                    font-size: 14px;
                    text-align: left;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                `;
                
                choiceButton.addEventListener('mouseenter', () => {
                    choiceButton.style.transform = 'translateX(10px)';
                    choiceButton.style.borderColor = '#daa520';
                    choiceButton.style.boxShadow = '0 6px 12px rgba(218, 165, 32, 0.4)';
                });
                
                choiceButton.addEventListener('mouseleave', () => {
                    choiceButton.style.transform = 'translateX(0)';
                    choiceButton.style.borderColor = '#8b4513';
                    choiceButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
                });
                
                choiceButton.addEventListener('click', () => {
                    this.selectedChoice = choice;
                    this.currentStep = 4;
                    this.showFeedback();
                });
                
                choicesContainer.appendChild(choiceButton);
            });
            
            questionContainer.appendChild(question);
            questionContainer.appendChild(choicesContainer);
            windowContent.appendChild(questionContainer);
        },
        
        // 第4個畫面：即時反饋 + 行銷教室
        showFeedback() {
            const windowContent = document.querySelector('.window-content');
            windowContent.innerHTML = '';
            
            const feedbackContainer = document.createElement('div');
            feedbackContainer.style.cssText = `
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, rgba(245, 222, 179, 0.9) 0%, rgba(222, 184, 135, 0.9) 100%);
                border-radius: 12px;
                padding: 30px;
                box-sizing: border-box;
                overflow-y: auto;
            `;
            feedbackContainer.classList.add('custom-scrollbar');
            
            // 即時反饋區塊
            const feedbackBlock = document.createElement('div');
            feedbackBlock.style.cssText = `
                background-color: rgba(255, 255, 255, 0.9);
                border: 4px solid #8b4513;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 20px;
                max-width: 500px;
                width: 100%;
            `;
            
            const feedbackTitle = document.createElement('h3');
            feedbackTitle.textContent = '📊 即時反饋';
            feedbackTitle.style.cssText = `
                color: #8b4513;
                font-size: 18px;
                margin-bottom: 15px;
                text-align: center;
            `;
            
            const feedbackText = document.createElement('p');
            feedbackText.textContent = this.selectedChoice.feedback;
            feedbackText.style.cssText = `
                color: #654321;
                font-size: 14px;
                line-height: 1.6;
            `;
            
            feedbackBlock.appendChild(feedbackTitle);
            feedbackBlock.appendChild(feedbackText);
            
            // 行銷教室區塊
            const marketingBlock = document.createElement('div');
            marketingBlock.style.cssText = `
                background-color: rgba(255, 248, 220, 0.9);
                border: 4px solid #daa520;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 20px;
                max-width: 500px;
                width: 100%;
            `;
            
            const marketingTitle = document.createElement('h3');
            marketingTitle.textContent = '📚 行銷教室';
            marketingTitle.style.cssText = `
                color: #8b4513;
                font-size: 18px;
                margin-bottom: 15px;
                text-align: center;
            `;
            
            const marketingText = document.createElement('p');
            marketingText.textContent = this.selectedChoice.marketingLesson;
            marketingText.style.cssText = `
                color: #654321;
                font-size: 14px;
                line-height: 1.6;
            `;
            
            marketingBlock.appendChild(marketingTitle);
            marketingBlock.appendChild(marketingText);
            
            // 完成按鈕
            const completeButton = document.createElement('button');
            completeButton.textContent = '✓ 完成事件';
            completeButton.style.cssText = `
                padding: 15px 40px;
                background: linear-gradient(135deg, #32cd32 0%, #228b22 100%);
                border: 4px solid #8b4513;
                border-radius: 8px;
                color: #fff;
                font-size: 15px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            `;
            
            completeButton.addEventListener('mouseenter', () => {
                completeButton.style.background = 'linear-gradient(135deg, #3cb371 0%, #32cd32 100%)';
                completeButton.style.transform = 'translateY(-2px)';
            });
            
            completeButton.addEventListener('mouseleave', () => {
                completeButton.style.background = 'linear-gradient(135deg, #32cd32 0%, #228b22 100%)';
                completeButton.style.transform = 'translateY(0)';
            });
            
            completeButton.addEventListener('click', () => {
                // 完成事件
                this.completeEvent();
            });
            
            feedbackContainer.appendChild(feedbackBlock);
            feedbackContainer.appendChild(marketingBlock);
            feedbackContainer.appendChild(completeButton);
            windowContent.appendChild(feedbackContainer);
        },
        
        // 完成事件
        completeEvent() {
            // 增加事件完成計數
            GameFlowManager.completeEvent();
            
            // 顯示完成訊息
            showMessage('事件完成！', 'success');
            
            // 回到事件畫面
            ContentManager.showContent('event');
        }
    };
    
    // 事件系統
    const EventManager = {
        currentEvent: null,
        eventProgress: 0,
        isEventActive: false,
        eventTimer: null,
        
        // 初始化事件系統
        init() {
            this.showDefaultEvent();
        },
        
        // 顯示預設事件畫面
        showDefaultEvent() {
            const windowContent = document.querySelector('.window-content');
            
            // 清空現有內容
            windowContent.innerHTML = '';
            
            // 創建事件容器
            const eventContainer = document.createElement('div');
            eventContainer.className = 'event-container';
            eventContainer.style.cssText = `
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background-color: transparent;
                padding: 20px;
                box-sizing: border-box;
            `;
            
            // 創建事件標題
            const eventTitle = document.createElement('h2');
            eventTitle.textContent = '正在進行的事件';
            eventTitle.style.cssText = `
                color: #654321;
                font-size: 18px;
                margin-bottom: 20px;
                text-shadow: 2px 2px 0px #deb887;
                text-align: center;
            `;
            
            // 創建事件內容
            const eventContent = document.createElement('div');
            eventContent.className = 'event-content';
            eventContent.innerHTML = `
                <p style="color: #8b4513; font-size: 14px; text-align: center; margin-bottom: 15px; line-height: 1.6;">
                    麵包坊正在營業中...<br>
                    等待顧客上門或事件發生
                </p>
                <div style="
                    width: 60px;
                    height: 60px;
                    margin: 0 auto;
                    background-color: #daa520;
                    border: 3px solid #8b4513;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    animation: rotate 2s linear infinite;
                ">
                    🍞
                </div>
            `;
            
            // 添加旋轉動畫
            const style = document.createElement('style');
            style.textContent = `
                @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
            
            // 組裝事件容器
            eventContainer.appendChild(eventTitle);
            eventContainer.appendChild(eventContent);
            windowContent.appendChild(eventContainer);
            
            // 啟動事件進度
            this.startEventProgress();
        },
        
        // 開始事件進度
        startEventProgress() {
            // 先清除現有的計時器，避免重複
            if (this.eventTimer) {
                clearInterval(this.eventTimer);
            }
            
            this.isEventActive = true;
            this.eventProgress = 0;
            
            // 模擬事件進度（每5秒增加10%）
            this.eventTimer = setInterval(() => {
                if (this.isEventActive) {
                    this.eventProgress += 10;
                    console.log(`事件進度: ${this.eventProgress}%`);
                    
                    // 當進度達到100%時，觸發事件
                    if (this.eventProgress >= 100) {
                        this.triggerRandomEvent();
                        this.eventProgress = 0; // 重置進度
                    }
                }
            }, 5000);
        },
        
        // 暫停事件進度
        pauseEventProgress() {
            this.isEventActive = false;
            if (this.eventTimer) {
                clearInterval(this.eventTimer);
            }
            console.log(`事件進度已暫停，當前進度: ${this.eventProgress}%`);
        },
        
        // 恢復事件進度
        resumeEventProgress() {
            // 先清除現有的計時器，避免重複
            if (this.eventTimer) {
                clearInterval(this.eventTimer);
            }
            
            this.isEventActive = true;
            
            // 重新啟動計時器
            this.eventTimer = setInterval(() => {
                if (this.isEventActive) {
                    this.eventProgress += 10;
                    console.log(`事件進度已恢復: ${this.eventProgress}%`);
                    
                    if (this.eventProgress >= 100) {
                        this.triggerRandomEvent();
                        this.eventProgress = 0;
                    }
                }
            }, 5000);
        },
        
        // 觸發隨機事件
        triggerRandomEvent() {
            const events = [
                {
                    title: '顧客上門',
                    message: '一位顧客走進麵包坊，想要購買麵包！',
                    type: 'customer'
                },
                {
                    title: '麵包出爐',
                    message: '新鮮的麵包出爐了，香氣四溢！',
                    type: 'bread'
                },
                {
                    title: '供應商來訪',
                    message: '麵粉供應商送來了新的原料！',
                    type: 'supplier'
                }
            ];
            
            const randomEvent = events[Math.floor(Math.random() * events.length)];
            showMessage(`${randomEvent.title}: ${randomEvent.message}`, 'success');
        }
    };
    
    // 內容管理器
    const ContentManager = {
        currentContent: 'event', // 當前顯示的內容類型
        contentHistory: [], // 內容歷史記錄
        
        // 顯示指定內容
        showContent(contentType) {
            // 如果當前是事件內容，切換到其他內容時暫停事件
            if (this.currentContent === 'event' && contentType !== 'event') {
                EventManager.pauseEventProgress();
            }
            
            // 記錄內容切換
            this.contentHistory.push(this.currentContent);
            this.currentContent = contentType;
            
            // 根據內容類型顯示對應內容
            switch(contentType) {
                case 'region-select':
                    this.showRegionSelectContent();
                    break;
                case 'event':
                    this.showEventContent();
                    break;
                case 'financial-report':
                    this.showFinancialReportContent();
                    break;
                case 'gashapon':
                    this.showGashaponContent();
                    break;
                case 'stock':
                    this.showStockContent();
                    break;
                case 'marketing':
                    this.showMarketingContent();
                    break;
                case 'leaderboard':
                    this.showLeaderboardContent();
                    break;
                case 'chat':
                    this.showChatContent();
                    break;
                default:
                    this.showEventContent();
            }
        },
        
        // 返回事件內容
        backToEvent() {
            // 返回事件流程中的最後停留畫面
            if (window.EventFlowManager && EventFlowManager.currentEvent) {
                this.currentContent = 'event';
                EventFlowManager.showCurrentStage();
            } else {
                // 如果沒有當前事件，重新啟動事件流程
                if (GameFlowManager.selectedRegion) {
                    EventFlowManager.startEventFlow(GameFlowManager.selectedRegion);
                } else {
                    // 如果沒有選擇地區，回到地區選擇
                    this.showContent('region-select');
                }
            }
        },
        
        // 顯示地區選擇內容
        showRegionSelectContent() {
            const windowContent = document.querySelector('.window-content');
            windowContent.innerHTML = '';
            
            const regionContainer = document.createElement('div');
            regionContainer.style.cssText = `
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: transparent;
                border-radius: 12px;
                padding: 30px;
                box-sizing: border-box;
                position: relative;
            `;
            
            // 標題
            const title = document.createElement('h2');
            title.textContent = `第 ${GameFlowManager.currentRound} 輪 - 選擇營業地區`;
            title.style.cssText = `
                color: #8b4513;
                font-size: 24px;
                margin-bottom: 30px;
                text-shadow: 2px 2px 0px #deb887;
                text-align: center;
            `;
            
            // 地區選項容器
            const regionsGrid = document.createElement('div');
            regionsGrid.style.cssText = `
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
                max-width: 600px;
                width: 100%;
            `;
            
            // 地區列表
            const regions = [
                { name: '商業區', icon: '<img src="assets/images/商業區.png" style="width: 96px; height: 96px; vertical-align: middle;">', description: '人潮多，競爭激烈', rent: 36000 },
                { name: '學區', icon: '<img src="assets/images/學區.png" style="width: 96px; height: 96px; vertical-align: middle;">', description: '學生客群，時段集中', rent: 26000 },
                { name: '住宅區', icon: '<img src="assets/images/住宅區.png" style="width: 96px; height: 96px; vertical-align: middle;">', description: '穩定客源，節奏平緩', rent: 42800 }
            ];
            
            regions.forEach(region => {
                const regionCard = document.createElement('div');
                regionCard.className = 'region-card';
                regionCard.style.cssText = `
                    background: linear-gradient(135deg, #fff 0%, #f5e5c5 100%);
                    border: 4px solid #8b4513;
                    border-radius: 12px;
                    padding: 20px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-align: center;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                `;
                
                const regionIcon = document.createElement('div');
                regionIcon.innerHTML = region.icon;
                regionIcon.style.cssText = `
                    margin-bottom: 10px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                `;
                
                const regionName = document.createElement('h3');
                regionName.textContent = region.name;
                regionName.style.cssText = `
                    color: #8b4513;
                    font-size: 17px;
                    margin-bottom: 8px;
                `;
                
                const regionDesc = document.createElement('p');
                regionDesc.textContent = region.description;
                regionDesc.style.cssText = `
                    color: #654321;
                    font-size: 14px;
                    line-height: 1.4;
                    margin-bottom: 8px;
                `;
                
                // 租金顯示
                const rentInfo = document.createElement('div');
                rentInfo.style.cssText = `
                    background: rgba(139, 69, 19, 0.1);
                    border-radius: 8px;
                    padding: 8px;
                    margin-top: 8px;
                `;
                
                const rentLabel = document.createElement('p');
                rentLabel.textContent = '基礎租金';
                rentLabel.style.cssText = `
                    color: #8b4513;
                    font-size: 13px;
                    margin: 0 0 3px 0;
                `;
                
                const rentValue = document.createElement('p');
                rentValue.innerHTML = `<img src="assets/images/蜂蜜幣.png" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 3px;"> ${region.rent.toLocaleString()}`;
                rentValue.style.cssText = `
                    color: #d2691e;
                    font-size: 15px;
                    font-weight: bold;
                    margin: 0;
                `;
                
                rentInfo.appendChild(rentLabel);
                rentInfo.appendChild(rentValue);
                
                regionCard.appendChild(regionIcon);
                regionCard.appendChild(regionName);
                regionCard.appendChild(regionDesc);
                regionCard.appendChild(rentInfo);
                
                // 懸停效果
                regionCard.addEventListener('mouseenter', () => {
                    regionCard.style.transform = 'translateY(-5px) scale(1.05)';
                    regionCard.style.borderColor = '#daa520';
                    regionCard.style.boxShadow = '0 8px 16px rgba(218, 165, 32, 0.4)';
                });
                
                regionCard.addEventListener('mouseleave', () => {
                    regionCard.style.transform = 'translateY(0) scale(1)';
                    regionCard.style.borderColor = '#8b4513';
                    regionCard.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
                });
                
                // 點擊選擇地區類型
                regionCard.addEventListener('click', () => {
                    GameFlowManager.selectRegionType(region.name);
                });
                
                regionsGrid.appendChild(regionCard);
            });
            
            regionContainer.appendChild(title);
            regionContainer.appendChild(regionsGrid);
            windowContent.appendChild(regionContainer);
        },
        
        // 顯示行政區選擇內容（第二階段）
        showDistrictSelectContent(regionType) {
            const windowContent = document.querySelector('.window-content');
            windowContent.innerHTML = '';
            
            const districtContainer = document.createElement('div');
            districtContainer.style.cssText = `
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                background: transparent;
                border-radius: 12px;
                padding: 20px;
                box-sizing: border-box;
                position: relative;
                overflow-y: auto;
            `;
            districtContainer.classList.add('custom-scrollbar');
            
            // 標題
            const title = document.createElement('h2');
            title.textContent = `選擇${regionType}的營業行政區`;
            title.style.cssText = `
                color: #8b4513;
                font-size: 22px;
                margin-bottom: 15px;
                text-shadow: 2px 2px 0px #deb887;
                text-align: center;
            `;
            
            // 說明文字
            const hint = document.createElement('p');
            const baseRent = RegionCoefficientsManager.getBaseRent(regionType);
            hint.innerHTML = `右上角為該行政區係數 係數隨著人口密度高低而有不同<br><span style="color: #d2691e; font-weight: bold;">基礎租金：<img src="assets/images/蜂蜜幣.png" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 2px;"> ${baseRent.toLocaleString()}</span>`;
            hint.style.cssText = `
                color: #654321;
                font-size: 18px;
                margin-bottom: 20px;
                text-align: center;
                line-height: 1.6;
            `;
            
            // 返回按鈕
            const backButton = document.createElement('button');
            backButton.textContent = '← 返回地區選擇';
            backButton.style.cssText = `
                position: absolute;
                top: 20px;
                left: 20px;
                background: #8b4513;
                color: white;
                border: none;
                padding: 8px 15px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 12px;
                font-family: 'Zpix', monospace;
            `;
            backButton.addEventListener('click', () => {
                ContentManager.showContent('region-select');
            });
            
            // 行政區選項容器
            const districtsGrid = document.createElement('div');
            districtsGrid.style.cssText = `
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
                gap: 15px;
                width: 100%;
                max-width: 850px;
                padding: 10px;
            `;
            
            // 獲取該地區類型的所有行政區
            const districts = RegionCoefficientsManager.getDistricts(regionType);
            
            // 按係數排序（從高到低）
            const sortedDistricts = Object.entries(districts).sort((a, b) => b[1] - a[1]);
            
            sortedDistricts.forEach(([districtName, coefficient]) => {
                const districtCard = document.createElement('div');
                districtCard.className = 'district-card';
                districtCard.style.cssText = `
                    background: linear-gradient(135deg, #fff 0%, #f5e5c5 100%);
                    border: 3px solid #8b4513;
                    border-radius: 10px;
                    padding: 15px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-align: center;
                    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
                    position: relative;
                `;
                
                // 係數標籤
                const coefficientBadge = document.createElement('div');
                coefficientBadge.textContent = `×${coefficient}`;
                coefficientBadge.style.cssText = `
                    position: absolute;
                    top: -10px;
                    right: -10px;
                    background: ${coefficient >= 1.2 ? '#FFD700' : coefficient >= 1.0 ? '#90EE90' : '#FFA07A'};
                    color: ${coefficient >= 1.2 ? '#8b4513' : coefficient >= 1.0 ? '#2d5016' : '#8b0000'};
                    font-size: 12px;
                    font-weight: bold;
                    padding: 5px 10px;
                    border-radius: 12px;
                    border: 2px solid #8b4513;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                `;
                
                // 行政區名稱
                const districtNameEl = document.createElement('h3');
                districtNameEl.textContent = districtName;
                districtNameEl.style.cssText = `
                    color: #8b4513;
                    font-size: 18px;
                    margin: 5px 0;
                `;
                
                // 市場潛力說明
                let marketDesc = '';
                if (coefficient >= 1.2) {
                    marketDesc = '🔥 高潛力市場';
                } else if (coefficient >= 1.0) {
                    marketDesc = '✨ 中等市場';
                } else {
                    marketDesc = '📍 發展中市場';
                }
                
                const marketDescEl = document.createElement('p');
                marketDescEl.textContent = marketDesc;
                marketDescEl.style.cssText = `
                    color: #654321;
                    font-size: 13px;
                    margin: 5px 0 8px 0;
                `;
                
                // 總租金顯示 = 基礎租金 × 行政區係數
                const totalRent = RegionCoefficientsManager.calculateTotalRent(regionType, coefficient);
                const totalRentEl = document.createElement('div');
                totalRentEl.style.cssText = `
                    background: rgba(210, 105, 30, 0.15);
                    border-radius: 6px;
                    padding: 6px 8px;
                    margin-top: 8px;
                `;
                
                const rentText = document.createElement('p');
                rentText.innerHTML = `<span style="font-size: 12px; color: #8b4513;">總租金=基礎租金×係數</span><br><span style="font-size: 12px; font-weight: bold; color: #d2691e;"><img src="assets/images/蜂蜜幣.png" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 2px;"> ${totalRent.toLocaleString()}</span>`;
                rentText.style.cssText = `
                    margin: 0;
                    text-align: center;
                    line-height: 1.4;
                `;
                
                totalRentEl.appendChild(rentText);
                
                districtCard.appendChild(coefficientBadge);
                districtCard.appendChild(districtNameEl);
                districtCard.appendChild(marketDescEl);
                districtCard.appendChild(totalRentEl);
                
                // 懸停效果
                districtCard.addEventListener('mouseenter', () => {
                    districtCard.style.transform = 'translateY(-3px) scale(1.05)';
                    districtCard.style.borderColor = '#daa520';
                    districtCard.style.boxShadow = '0 6px 12px rgba(218, 165, 32, 0.4)';
                });
                
                districtCard.addEventListener('mouseleave', () => {
                    districtCard.style.transform = 'translateY(0) scale(1)';
                    districtCard.style.borderColor = '#8b4513';
                    districtCard.style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.2)';
                });
                
                // 點擊選擇行政區
                districtCard.addEventListener('click', () => {
                    GameFlowManager.selectDistrict(regionType, districtName, coefficient);
                });
                
                districtsGrid.appendChild(districtCard);
            });
            
            districtContainer.appendChild(backButton);
            districtContainer.appendChild(title);
            districtContainer.appendChild(hint);
            districtContainer.appendChild(districtsGrid);
            windowContent.appendChild(districtContainer);
        },
        
        // 顯示事件內容
        showEventContent() {
            // 使用新的事件流程系統
            if (GameFlowManager.selectedRegion) {
                // 先嘗試恢復事件狀態，如果沒有則開始新事件
                if (EventFlowManager.currentEvent) {
                    EventFlowManager.showCurrentStage();
                } else {
                    EventFlowManager.startEventFlow(GameFlowManager.selectedRegion);
                }
            } else {
                // 如果沒有選擇地區，顯示地區選擇
                this.showContent('region-select');
            }
        },
        
        // 顯示財務報表內容
        showFinancialReportContent() {
            const windowContent = document.querySelector('.window-content');
            windowContent.innerHTML = '';
            
            console.log('📊 顯示財務報表 - 除錯信息:');
            console.log('  當前輪次:', GameFlowManager.currentRound);
            console.log('  報表歷史數量:', FinancialReport.history.length);
            console.log('  當前輪次事件數量:', FinancialReport.currentRoundData.events.length);
            console.log('  報表歷史:', FinancialReport.history);
            
            // 自動修復財務報表問題
            FinancialReport.fixFinancialReport();
            
            // 如果當前輪次數據有 7 個事件但還沒生成報表，強制生成
            // 檢查當前輪次是否已經有對應的報表
            const currentRoundNumber = GameFlowManager.currentRound;
            const hasReportForCurrentRound = FinancialReport.history.some(report => report.roundNumber === currentRoundNumber);
            
            console.log('  是否已有當前輪次報表:', hasReportForCurrentRound);
            console.log('  當前輪次事件數量:', FinancialReport.currentRoundData.events.length);
            console.log('  需要的事件數量:', GameFlowManager.totalEventsPerRound);
            
            // 強制生成報表的條件：
            // 1. 當前輪次事件數量達到要求
            // 2. 且沒有對應的報表
            // 3. 且當前輪次數據不為空
            if (FinancialReport.currentRoundData.events.length >= GameFlowManager.totalEventsPerRound && 
                !hasReportForCurrentRound && 
                FinancialReport.currentRoundData.events.length > 0) {
                console.log('  → 強制生成財務報表');
                FinancialReport.generateRoundReport();
            }
            
            // 取得財務報表 - 優先顯示最新完成的報表
            // 如果當前輪次已完成，顯示當前輪次報表；否則顯示上一輪報表
            let latestReport = null;
            
            if (FinancialReport.history.length > 0) {
                // 先嘗試找當前輪次的報表
                const currentRoundReport = FinancialReport.history.find(
                    report => report.roundNumber === GameFlowManager.currentRound
                );
                
                if (currentRoundReport) {
                    latestReport = currentRoundReport;
                    console.log('  ✅ 找到當前輪次報表:', currentRoundReport.roundNumber);
                } else {
                    // 如果找不到當前輪次報表，使用最後一個報表
                    latestReport = FinancialReport.history[FinancialReport.history.length - 1];
                    console.log('  ⚠️ 找不到當前輪次報表，使用最新報表:', latestReport.roundNumber);
                }
            } else {
                console.log('  ❌ 沒有任何財務報表歷史');
            }
            
            console.log('🔍 UI顯示用的報表數據:');
            console.log('   當前輪次:', GameFlowManager.currentRound);
            console.log('   報表歷史數量:', FinancialReport.history.length);
            console.log('   選中的報表:', latestReport);
            console.log('   totalSalesVolume:', latestReport?.totalSalesVolume);
            console.log('   totalRevenue:', latestReport?.totalRevenue);
            console.log('   totalCost:', latestReport?.totalCost);
            console.log('   netProfit:', latestReport?.netProfit);
            
            const reportContainer = document.createElement('div');
            reportContainer.style.cssText = `
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-start;
                background: linear-gradient(135deg, rgba(245, 222, 179, 0.9) 0%, rgba(222, 184, 135, 0.9) 100%);
                border-radius: 12px;
                padding: 15px;
                box-sizing: border-box;
                position: relative;
                overflow-y: auto;
            `;
            reportContainer.classList.add('custom-scrollbar');
            
            // 標題
            const title = document.createElement('h2');
            // 如果有報表，使用報表的輪次號碼；否則使用當前輪次
            const displayRound = latestReport ? latestReport.roundNumber : GameFlowManager.currentRound;
            title.textContent = `第 ${displayRound} 輪財務報表`;
            title.style.cssText = `
                color: #8b4513;
                font-size: 20px;
                margin-bottom: 12px;
                margin-top: 5px;
                text-shadow: 2px 2px 0px #deb887;
                text-align: center;
                flex-shrink: 0;
            `;
            
            // 報表內容
            const reportContent = document.createElement('div');
            reportContent.style.cssText = `
                background-color: rgba(255, 255, 255, 0.9);
                border: 4px solid #8b4513;
                border-radius: 12px;
                padding: 18px;
                max-width: 380px;
                width: 100%;
                margin-bottom: 12px;
                flex-shrink: 0;
            `;
            
            let reportHTML;
            if (latestReport) {
                // 顯示真實的財務報表資料
                reportHTML = `
                    <div style="margin-bottom: 10px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: #654321; font-size: 14px;">總銷售量：</span>
                            <strong style="color: #2e8b57; font-size: 14px;">${latestReport.totalSalesVolume} 個</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: #654321; font-size: 14px;">銷貨收入：</span>
                            <strong style="color: #2e8b57; font-size: 14px;">+${latestReport.totalRevenue.toLocaleString()} <img src="assets/images/蜂蜜幣.png" style="width: 18px; height: 18px; vertical-align: middle; margin-left: 3px;"></strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: #654321; font-size: 14px;">銷貨成本：</span>
                            <strong style="color: #dc143c; font-size: 14px;">-${latestReport.totalCost.toLocaleString()} <img src="assets/images/蜂蜜幣.png" style="width: 18px; height: 18px; vertical-align: middle; margin-left: 3px;"></strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                            <span style="color: #654321; font-size: 18px; font-weight: bold;">淨利：</span>
                            <strong style="color: ${latestReport.netProfit >= 0 ? '#daa520' : '#dc143c'}; font-size: 18px;">${latestReport.netProfit >= 0 ? '+' : ''}${latestReport.netProfit.toLocaleString()} <img src="assets/images/蜂蜜幣.png" style="width: 18px; height: 18px; vertical-align: middle; margin-left: 3px;"></strong>
                        </div>
                        <hr style="border: 2px solid #8b4513; margin: 12px 0;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: #654321; font-size: 14px;">聲望：</span>
                            <strong style="color: ${latestReport.reputationChange >= 0 ? '#4169e1' : '#dc143c'}; font-size: 14px;">${latestReport.reputationChange >= 0 ? '+' : ''}${latestReport.reputationChange} <img src="assets/images/聲望.png" style="width: 18px; height: 18px; vertical-align: middle; margin-left: 3px;"></strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: #654321; font-size: 14px;">顧客滿意度：</span>
                            <strong style="color: ${latestReport.satisfactionChange >= 0 ? '#ff69b4' : '#dc143c'}; font-size: 14px;">${latestReport.satisfactionChange >= 0 ? '+' : ''}${latestReport.satisfactionChange} <img src="assets/images/顧客滿意度.png" style="width: 18px; height: 18px; vertical-align: middle; margin-left: 3px;"></strong>
                        </div>
                        <div style="margin-top: 8px; padding: 6px; background: rgba(139, 69, 19, 0.1); border-radius: 6px;">
                            <span style="color: #654321; font-size: 13px;">地區：${latestReport.regionType} - ${latestReport.district}</span>
                        </div>
                    </div>
                `;
            } else {
                // 如果沒有報表資料，顯示預設訊息
                reportHTML = `
                    <div style="margin-bottom: 10px; text-align: center;">
                        <span style="color: #654321; font-size: 13px;">尚無財務記錄</span>
                    </div>
                `;
            }
            
            reportContent.innerHTML = reportHTML;
            
            // 下一輪按鈕
            const nextRoundButton = document.createElement('button');
            nextRoundButton.textContent = '下一輪';
            nextRoundButton.style.cssText = `
                padding: 10px 30px;
                background: linear-gradient(135deg, #daa520 0%, #b8860b 100%);
                border: 3px solid #8b4513;
                border-radius: 8px;
                color: #fff;
                font-size: 13px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                flex-shrink: 0;
            `;
            
            nextRoundButton.addEventListener('mouseenter', () => {
                nextRoundButton.style.background = 'linear-gradient(135deg, #ffd700 0%, #daa520 100%)';
                nextRoundButton.style.transform = 'translateY(-2px)';
                nextRoundButton.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.4)';
            });
            
            nextRoundButton.addEventListener('mouseleave', () => {
                nextRoundButton.style.background = 'linear-gradient(135deg, #daa520 0%, #b8860b 100%)';
                nextRoundButton.style.transform = 'translateY(0)';
                nextRoundButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
            });
            
            nextRoundButton.addEventListener('click', () => {
                GameFlowManager.startNextRound();
            });
            
            reportContainer.appendChild(title);
            reportContainer.appendChild(reportContent);
            reportContainer.appendChild(nextRoundButton);
            windowContent.appendChild(reportContainer);
        },
        
        // 顯示扭蛋機內容
        showGashaponContent() {
            const windowContent = document.querySelector('.window-content');
            windowContent.innerHTML = '';
            
            const gashaponContainer = document.createElement('div');
            gashaponContainer.className = 'gashapon-container';
            gashaponContainer.style.cssText = `
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                background-color: transparent;
                position: relative;
            `;
            
            // 返回按鈕（樣式與行銷題庫一致）
            const backButton = document.createElement('button');
            backButton.innerHTML = '<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width: 16px; height: 16px; vertical-align: middle;"><path d="M20 11v2H8v2H6v-2H4v-2h2V9h2v2h12zM10 8v2H8v-2h2zm0 0h2v2h-2v-2z" fill="currentColor"/></svg>';
            backButton.style.cssText = `
                position: absolute;
                top: 20px;
                left: 20px;
                padding: 8px 16px;
                background-color: #8b4513;
                color: white;
                border: 2px solid #654321;
                border-radius: 5px;
                cursor: pointer;
                font-family: 'Zpix', monospace;
                font-size: 12px;
                z-index: 1000;
            `;
            backButton.addEventListener('click', () => {
                // 未選地區或尚未選行政區 → 回地區選擇
                if (!GameFlowManager.selectedRegion || !GameFlowManager.selectedDistrict) {
                    ContentManager.showContent('region-select');
                    return;
                }
                
                // 已選地區與行政區，根據當前狀態導航
                const hasStocked = localStorage.getItem('hasStocked') === 'true';
                const eventsCompleted = parseInt(localStorage.getItem('eventsCompleted') || '0');
                const totalEventsPerRound = 7;
                
                if (eventsCompleted >= totalEventsPerRound) {
                    // 已完成7個事件 → 財務報表
                    ContentManager.showContent('financial-report');
                } else if (!hasStocked) {
                    // 未進貨 → 進貨頁面
                    ContentManager.showContent('stock');
                } else {
                    // 已進貨但未完成事件 → 事件流程
                    ContentManager.showContent('event');
                }
            });
            
            const gashaponGif = document.createElement('img');
            gashaponGif.src = 'assets/videos/扭蛋機.gif';
            gashaponGif.alt = '扭蛋機';
            gashaponGif.style.cssText = `
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
                image-rendering: pixelated;
                image-rendering: -moz-crisp-edges;
                image-rendering: crisp-edges;
                cursor: pointer;
                transition: transform 0.2s ease;
            `;
            
            gashaponGif.addEventListener('click', () => {
                showGashaponDrawModal();
            });
            
            gashaponContainer.appendChild(backButton);
            gashaponContainer.appendChild(gashaponGif);
            windowContent.appendChild(gashaponContainer);
        },
        
        // 顯示進貨內容
        showStockContent() {
            const windowContent = document.querySelector('.window-content');
            windowContent.innerHTML = '';
            
            const stockContainer = document.createElement('div');
            stockContainer.style.cssText = `
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                padding: 8px 12px 10px 12px;
                box-sizing: border-box;
                overflow: hidden;
                justify-content: space-between;
            `;
            
            // 使用 BreadProducts 的資料
            const products = BreadProducts.getAllBreads().map(bread => ({
                ...bread,
                quantity: 1400
            }));
            
            // 表頭
            const header = document.createElement('div');
            header.style.cssText = `
                display: grid;
                grid-template-columns: 1.5fr 1fr 1fr 1.5fr;
                gap: 8px;
                padding: 8px 12px;
                background: linear-gradient(135deg, #6b4423 0%, #8b5a3c 100%);
                border: 4px solid #4a2f1a;
                border-radius: 8px;
                margin-bottom: 6px;
                box-shadow: 0 3px 6px rgba(0,0,0,0.3);
                flex-shrink: 0;
            `;
            header.innerHTML = `
                <span style="color: #f5deb3; font-size: 13px; font-weight: bold; text-align: center;">品項</span>
                <span style="color: #f5deb3; font-size: 13px; font-weight: bold; text-align: center;">售價</span>
                <span style="color: #f5deb3; font-size: 13px; font-weight: bold; text-align: center;">成本</span>
                <span style="color: #f5deb3; font-size: 13px; font-weight: bold; text-align: center;">數量</span>
            `;
            
            stockContainer.appendChild(header);
            
            // 商品列表容器
            const productsContainer = document.createElement('div');
            productsContainer.style.cssText = `
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 5px;
                overflow: hidden;
                padding-bottom: 15px;
            `;
            
            // 商品列表
            products.forEach((product, index) => {
                const productRow = document.createElement('div');
                productRow.style.cssText = `
                    display: grid;
                    grid-template-columns: 1.5fr 1fr 1fr 1.5fr;
                    gap: 8px;
                    padding: 6px 10px;
                    background: linear-gradient(135deg, #a67c52 0%, #bf9270 100%);
                    border: 3px solid #8b6544;
                    border-radius: 8px;
                    align-items: center;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                `;
                
                // 品項（圖標 + 名稱）
                const itemName = document.createElement('div');
                itemName.style.cssText = `
                    display: flex;
                    align-items: center;
                    gap: 8px;
                `;
                
                // 創建圖片元素
                const iconImg = document.createElement('img');
                iconImg.src = product.icon;
                iconImg.alt = product.name;
                iconImg.style.cssText = `
                    width: 32px;
                    height: 32px;
                    object-fit: contain;
                    image-rendering: pixelated;
                    image-rendering: -moz-crisp-edges;
                    image-rendering: crisp-edges;
                `;
                
                const nameSpan = document.createElement('span');
                nameSpan.style.cssText = 'color: #2c1810; font-size: 12px; font-weight: bold;';
                nameSpan.textContent = product.name;
                
                itemName.appendChild(iconImg);
                itemName.appendChild(nameSpan);
                
                // 售價
                const price = document.createElement('div');
                price.style.cssText = 'text-align: center; color: #2c1810; font-size: 13px; font-weight: bold;';
                price.textContent = `$${product.price}`;
                
                // 成本
                const cost = document.createElement('div');
                cost.style.cssText = 'text-align: center; color: #2c1810; font-size: 13px; font-weight: bold;';
                cost.textContent = `$${String(product.cost).padStart(2, '0')}`;
                
                // 數量控制
                const quantityControl = document.createElement('div');
                quantityControl.style.cssText = `
                    display: flex;
                align-items: center;
                justify-content: center;
                    gap: 8px;
                `;
                
                // 減少按鈕
                const decreaseBtn = document.createElement('button');
                decreaseBtn.textContent = '－';
                
                // 增加按鈕
                const increaseBtn = document.createElement('button');
                increaseBtn.textContent = '＋';
                
                // 數量顯示
                const quantityDisplay = document.createElement('span');
                quantityDisplay.style.cssText = `
                    color: #2c1810;
                    font-size: 13px;
                    font-weight: bold;
                    min-width: 50px;
                    text-align: center;
                `;
                quantityDisplay.textContent = product.quantity;
                
                // 檢查是否已進貨（從 localStorage 重新讀取確保狀態同步）
                const hasStocked = localStorage.getItem('hasStocked') === 'true';
                GameFlowManager.hasStocked = hasStocked;
                
                if (hasStocked) {
                    // 已進貨 - 禁用按鈕
                    decreaseBtn.disabled = true;
                    increaseBtn.disabled = true;
                    
                    decreaseBtn.style.cssText = `
                        width: 28px;
                        height: 28px;
                        background: #999;
                        border: 2px solid #666;
                        border-radius: 6px;
                        color: #ccc;
                        font-size: 15px;
                        font-weight: bold;
                        cursor: not-allowed;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        opacity: 0.5;
                    `;
                    
                    increaseBtn.style.cssText = `
                        width: 28px;
                        height: 28px;
                        background: #999;
                        border: 2px solid #666;
                        border-radius: 6px;
                        color: #ccc;
                        font-size: 15px;
                        font-weight: bold;
                        cursor: not-allowed;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        opacity: 0.5;
                    `;
                } else {
                    // 未進貨 - 正常按鈕
                decreaseBtn.style.cssText = `
                    width: 28px;
                    height: 28px;
                    background: linear-gradient(135deg, #8b6544 0%, #6b4423 100%);
                    border: 2px solid #5a3a1f;
                    border-radius: 6px;
                    color: #f5deb3;
                    font-size: 15px;
                    font-weight: bold;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                `;
                
                increaseBtn.style.cssText = `
                    width: 28px;
                    height: 28px;
                    background: linear-gradient(135deg, #8b6544 0%, #6b4423 100%);
                    border: 2px solid #5a3a1f;
                    border-radius: 6px;
                    color: #f5deb3;
                    font-size: 15px;
                    font-weight: bold;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                `;
                
                // 按鈕事件
                decreaseBtn.addEventListener('click', () => {
                    let currentQty = parseInt(quantityDisplay.textContent);
                    if (currentQty > 0) {
                        quantityDisplay.textContent = currentQty - 50;
                    }
                });
                
                increaseBtn.addEventListener('click', () => {
                    let currentQty = parseInt(quantityDisplay.textContent);
                    quantityDisplay.textContent = currentQty + 50;
                });
                
                // hover效果
                decreaseBtn.addEventListener('mouseenter', () => {
                    decreaseBtn.style.background = 'linear-gradient(135deg, #a67c52 0%, #8b6544 100%)';
                });
                decreaseBtn.addEventListener('mouseleave', () => {
                    decreaseBtn.style.background = 'linear-gradient(135deg, #8b6544 0%, #6b4423 100%)';
                });
                
                increaseBtn.addEventListener('mouseenter', () => {
                    increaseBtn.style.background = 'linear-gradient(135deg, #a67c52 0%, #8b6544 100%)';
                });
                increaseBtn.addEventListener('mouseleave', () => {
                    increaseBtn.style.background = 'linear-gradient(135deg, #8b6544 0%, #6b4423 100%)';
                });
                }
                
                quantityControl.appendChild(decreaseBtn);
                quantityControl.appendChild(quantityDisplay);
                quantityControl.appendChild(increaseBtn);
                
                // 組裝商品行
                productRow.appendChild(itemName);
                productRow.appendChild(price);
                productRow.appendChild(cost);
                productRow.appendChild(quantityControl);
                
                productsContainer.appendChild(productRow);
            });
            
            stockContainer.appendChild(productsContainer);
            
            // 底部按鈕區域容器
            const buttonArea = document.createElement('div');
            buttonArea.style.cssText = `
                margin-top: 0px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 100%;
                flex-shrink: 0;
                height: 45px;
                box-sizing: border-box;
            `;
            
            // 左側提示文字（提醒樣式）
            const tipText = document.createElement('div');
            tipText.innerHTML = `
                <div style="
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
                    border: 2px solid #ffc107;
                    border-radius: 8px;
                    padding: 8px 12px;
                    box-shadow: 0 2px 8px rgba(255, 193, 7, 0.3);
                    animation: pulse-warning 2s ease-in-out infinite;
                ">
                    <svg viewBox="0 0 16 16" width="18" height="18" xmlns="http://www.w3.org/2000/svg" style="display:inline-block; color: #856404; image-rendering: pixelated; flex-shrink: 0;">
                            <g fill="currentColor" shape-rendering="crispEdges">
                                <rect x="7" y="2" width="2" height="9"/>
                                <rect x="7" y="12" width="2" height="2"/>
                            </g>
                        </svg>
                        <span style="
                        color: #856404;
                        font-weight: bold;
                        font-size: 13px;
                        text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
                    ">每一種麵包最低進貨數量建議在 <span style="color: #dc3545; font-size: 14px;">1400以上</span></span>
                </div>
                <style>
                    @keyframes pulse-warning {
                        0%, 100% { 
                            transform: scale(1);
                            box-shadow: 0 2px 8px rgba(255, 193, 7, 0.3);
                        }
                        50% { 
                            transform: scale(1.02);
                            box-shadow: 0 4px 12px rgba(255, 193, 7, 0.5);
                        }
                    }
                </style>
            `;
            tipText.style.cssText = `
                flex: 1;
                margin-right: 13.5px;
            `;
            
            // 右側進貨按鈕
            const purchaseBtn = document.createElement('button');
            purchaseBtn.textContent = '進貨';
            
            // 檢查是否已經進貨（從 localStorage 重新讀取確保狀態同步）
            const hasStocked = localStorage.getItem('hasStocked') === 'true';
            GameFlowManager.hasStocked = hasStocked;
            
            if (hasStocked) {
                // 已進貨 - 禁用按鈕
                purchaseBtn.disabled = true;
                purchaseBtn.textContent = '已進貨';
                purchaseBtn.style.cssText = `
                    padding: 9px 31.5px;
                    background: #999;
                    border: 2.7px solid #666;
                    border-radius: 7.2px;
                    color: #ccc;
                    font-size: 12.6px;
                    font-weight: bold;
                    cursor: not-allowed;
                    box-shadow: none;
                    transition: all 0.2s ease;
                    flex-shrink: 0;
                    height: 45px;
                    box-sizing: border-box;
                    opacity: 0.6;
                    transform: scale(0.9);
                `;
            } else {
                // 未進貨 - 正常按鈕
            purchaseBtn.style.cssText = `
                padding: 9px 31.5px;
                background: linear-gradient(135deg, #c99a6e 0%, #a67c52 100%);
                border: 2.7px solid #8b6544;
                border-radius: 7.2px;
                color: #fff;
                font-size: 12.6px;
                font-weight: bold;
                cursor: pointer;
                box-shadow: 0 3.6px 7.2px rgba(0,0,0,0.3);
                transition: all 0.2s ease;
                flex-shrink: 0;
                height: 45px;
                box-sizing: border-box;
                transform: scale(0.9);
            `;
            
            purchaseBtn.addEventListener('mouseenter', () => {
                purchaseBtn.style.background = 'linear-gradient(135deg, #d4a574 0%, #bf9270 100%)';
                purchaseBtn.style.transform = 'scale(0.9) translateY(-2px)';
                purchaseBtn.style.boxShadow = '0 6px 12px rgba(0,0,0,0.4)';
            });
            
            purchaseBtn.addEventListener('mouseleave', () => {
                purchaseBtn.style.background = 'linear-gradient(135deg, #c99a6e 0%, #a67c52 100%)';
                purchaseBtn.style.transform = 'scale(0.9) translateY(0)';
                purchaseBtn.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
            });
            }
            
            // 只在未進貨時才添加點擊事件（使用最新的狀態檢查）
            if (!hasStocked) {
            purchaseBtn.addEventListener('click', () => {
                // 再次檢查進貨狀態，防止重複進貨
                const currentStockedStatus = localStorage.getItem('hasStocked') === 'true';
                if (currentStockedStatus) {
                    showMessage('本輪已經進貨過了！', 'warning');
                    return;
                }
                
                // 收集進貨數量
                const quantities = stockContainer.querySelectorAll('span[style*="min-width: 50px"]');
                const stockingQuantities = {};
                
                quantities.forEach((qtyElement, index) => {
                    const breadId = BreadProducts.items[index].id;
                    const qty = parseInt(qtyElement.textContent);
                    stockingQuantities[breadId] = qty;
                });
                
                // 使用當前事件的景氣燈號計算成本（如果沒有事件，使用綠燈）
                const currentEvent = EventFlowManager.currentEvent;
                const economicLevel = currentEvent ? (currentEvent.economicSignal?.level || currentEvent.economicSignal || '綠燈') : '綠燈';
                
                // 計算總成本（包含景氣係數）
                const totalCost = StockingSystem.calculateStockingCost(stockingQuantities, economicLevel);
                
                // 檢查蜂蜜幣是否足夠
                if (totalCost > GameResources.resources.honey) {
                    showMessage(`蜂蜜幣不足！需要 ${totalCost.toLocaleString()} <img src="assets/images/蜂蜜幣.png" style="width: 16px; height: 16px; vertical-align: middle; margin: 0 2px;">，目前只有 ${GameResources.resources.honey.toLocaleString()} <img src="assets/images/蜂蜜幣.png" style="width: 16px; height: 16px; vertical-align: middle; margin: 0 2px;">`, 'error');
                    return;
                }
                
                // 執行進貨
                const actualCost = StockingSystem.executeStocking(stockingQuantities, economicLevel);
                
                // 扣除蜂蜜幣
                GameResources.addResource('honey', -actualCost);
                
                // 儲存庫存
                StockingSystem.saveInventory();
                
                // 記錄進貨成本到財務報表（標記為進貨事件，不計入事件數量）
                FinancialReport.recordEvent({
                    eventTitle: '進貨',
                    revenue: 0,
                    cost: actualCost,
                    salesVolume: 0,
                    satisfactionChange: 0,
                    reputationChange: 0,
                    stockingDetail: stockingQuantities
                }, true);
                
                // 標記本輪已進貨
                GameFlowManager.hasStocked = true;
                localStorage.setItem('hasStocked', 'true');
                
                // 🤖 讓虛擬玩家也進貨
                if (window.VirtualPlayersSystem) {
                    VirtualPlayersSystem.simulateStocking();
                }
                
                // 更新導航按鈕狀態
                if (window.updateStockButtonState) {
                    window.updateStockButtonState();
                }
                
                // 顯示成功訊息
                showMessage(`進貨成功！總成本：${actualCost.toLocaleString()} <img src="assets/images/蜂蜜幣.png" style="width: 16px; height: 16px; vertical-align: middle; margin: 0 2px;">，剩餘蜂蜜幣：${GameResources.resources.honey.toLocaleString()} <img src="assets/images/蜂蜜幣.png" style="width: 16px; height: 16px; vertical-align: middle; margin: 0 2px;">`, 'success');
                
                // 重置數量到預設值
                quantities.forEach(qtyElement => {
                    qtyElement.textContent = '1400';
                });
                
                // 進貨完成後自動跳轉到景氣燈號並開始事件
                setTimeout(() => {
                    if (GameFlowManager.selectedRegion) {
                        EventFlowManager.startEventFlow(GameFlowManager.selectedRegion);
                    }
                }, 1500);
            });
            }
            
            // 組裝按鈕區域
            buttonArea.appendChild(tipText);
            buttonArea.appendChild(purchaseBtn);
            stockContainer.appendChild(buttonArea);
            
            windowContent.appendChild(stockContainer);
        },
        
        // 顯示行銷題庫內容
        showMarketingContent() {
            const windowContent = document.querySelector('.window-content');
            windowContent.innerHTML = '';
            
            // 檢查測驗狀態
            if (!QuizMode.isActive) {
                this.showQuizStartScreen();
            } else {
                this.showQuizQuestionScreen();
            }
        },
        
        // 顯示測驗開始畫面
        showQuizStartScreen() {
            const windowContent = document.querySelector('.window-content');
            windowContent.innerHTML = '';
            
            const currentCategory = QuestionBank.getCurrentCategory();
            const categoryStatus = QuestionBank.getCategoryStatus(currentCategory);
            
            const container = document.createElement('div');
            container.style.cssText = `
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 15px 10px 10px 10px;
                box-sizing: border-box;
                overflow-y: auto;
            `;
            container.classList.add('custom-scrollbar');
            
            // 已移除標題和「當前類別顯示」區塊，保留更簡潔的開始畫面
            
            
            // 規則說明
            const rulesBox = document.createElement('div');
            rulesBox.style.cssText = `
                background-color: rgba(255, 255, 255, 0.95);
                border: 3px solid #8b4513;
                border-radius: 10px;
                padding: 15px;
                margin-top: 5px;
                margin-bottom: 12px;
                width: 100%;
                max-width: 500px;
                text-align: left;
            `;
            rulesBox.classList.add('custom-scrollbar');
            rulesBox.innerHTML = `
                <h2 style="color: #8b4513; font-size: 20px; margin-bottom: 15px; text-align: center; border-bottom: 2px solid #8b4513; padding-bottom: 8px;">📋 行銷題庫規則</h2>
                
                <div style="margin-bottom: 15px;">
                    <h3 style="color: #8b4513; font-size: 16px; margin-bottom: 8px;"><img src="assets/images/釘子.png" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;">基本設定</h3>
                    <p style="color: #654321; font-size: 14px; margin-bottom: 4px; margin-left: 15px;">• 答題時間：<strong>不限時間</strong></p>
                    <p style="color: #654321; font-size: 14px; margin-bottom: 4px; margin-left: 15px;">• 題目總數：<strong>25題</strong></p>
                    <p style="color: #654321; font-size: 14px; margin-bottom: 0; margin-left: 15px;">• 結束條件：<strong>答完所有題目</strong></p>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <h3 style="color: #8b4513; font-size: 16px; margin-bottom: 8px;">🎯 題目分類</h3>
                    <p style="color: #654321; font-size: 14px; margin-bottom: 8px; margin-left: 15px;">本測驗分為五大類別，每類隨機出5題：</p>
                    <div style="margin-left: 20px;">
                        <p style="color: #654321; font-size: 13px; margin-bottom: 3px;"><span style="display: inline-block; width: 16px; height: 16px; background: #4CAF50; color: white; text-align: center; line-height: 16px; font-size: 11px; font-weight: bold; border-radius: 2px; margin-right: 6px;">1</span> 行銷理論與管理</p>
                        <p style="color: #654321; font-size: 13px; margin-bottom: 3px;"><span style="display: inline-block; width: 16px; height: 16px; background: #2196F3; color: white; text-align: center; line-height: 16px; font-size: 11px; font-weight: bold; border-radius: 2px; margin-right: 6px;">2</span> 行銷策略與企劃</p>
                        <p style="color: #654321; font-size: 13px; margin-bottom: 3px;"><span style="display: inline-block; width: 16px; height: 16px; background: #FF9800; color: white; text-align: center; line-height: 16px; font-size: 11px; font-weight: bold; border-radius: 2px; margin-right: 6px;">3</span> 市場研究</p>
                        <p style="color: #654321; font-size: 13px; margin-bottom: 3px;"><span style="display: inline-block; width: 16px; height: 16px; background: #9C27B0; color: white; text-align: center; line-height: 16px; font-size: 11px; font-weight: bold; border-radius: 2px; margin-right: 6px;">4</span> 全球與國際行銷</p>
                        <p style="color: #654321; font-size: 13px; margin-bottom: 0;"><span style="display: inline-block; width: 16px; height: 16px; background: #F44336; color: white; text-align: center; line-height: 16px; font-size: 11px; font-weight: bold; border-radius: 2px; margin-right: 6px;">5</span> 數位與網路行銷</p>
                    </div>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <h3 style="color: #8b4513; font-size: 16px; margin-bottom: 8px;"><img src="assets/images/燈泡.png" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 6px;">即時回饋</h3>
                    <p style="color: #654321; font-size: 14px; margin-bottom: 6px; margin-left: 15px;">每題作答後立即顯示：</p>
                    <div style="margin-left: 20px;">
                        <p style="color: #654321; font-size: 13px; margin-bottom: 3px;">• 正確答案與詳細解析</p>
                        <p style="color: #654321; font-size: 13px; margin-bottom: 3px;">• 本題相關行銷概念</p>
                        <p style="color: #654321; font-size: 13px; margin-bottom: 0;">• 建議複習方向</p>
                    </div>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <h3 style="color: #8b4513; font-size: 16px; margin-bottom: 8px;"><img src="assets/images/報表.png" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 6px;">測驗結果</h3>
                    <p style="color: #654321; font-size: 14px; margin-bottom: 6px; margin-left: 15px;">答題結束後系統將顯示：</p>
                    <div style="margin-left: 20px;">
                        <p style="color: #654321; font-size: 13px; margin-bottom: 3px;">• 五大類別能力雷達圖</p>
                        <p style="color: #654321; font-size: 13px; margin-bottom: 0;">• 個人化職業建議與學習方向</p>
                    </div>
                </div>
                
                <div style="margin-bottom: 0;">
                    <h3 style="color: #8b4513; font-size: 16px; margin-bottom: 8px;"><img src="assets/images/蜂蜜幣.png" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 6px;">獎勵機制</h3>
                    <div style="margin-left: 15px;">
                        <p style="color: #654321; font-size: 13px; margin-bottom: 3px;">答對率達 <strong style="color: #daa520;">70%</strong> → +1000 蜂蜜幣</p>
                        <p style="color: #654321; font-size: 13px; margin-bottom: 3px;">答對率達 <strong style="color: #daa520;">80%</strong> → +2000 蜂蜜幣</p>
                        <p style="color: #654321; font-size: 13px; margin-bottom: 3px;">答對率達 <strong style="color: #daa520;">90%</strong> → +3500 蜂蜜幣</p>
                        <p style="color: #654321; font-size: 13px; margin-bottom: 0;">全對 <strong style="color: #daa520;">100%</strong> → +5000 蜂蜜幣</p>
                    </div>
                </div>
            `;
            
            // 開始按鈕（樣式與返回按鈕一致）
            const startButton = document.createElement('button');
            startButton.textContent = '開始測驗';
            startButton.style.cssText = `
                padding: 10px 20px;
                background-color: #8b4513;
                color: white;
                border: 2px solid #654321;
                border-radius: 5px;
                cursor: pointer;
                font-family: 'Zpix', monospace;
                font-size: 14px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                margin-bottom: 10px;
            `;
            
            startButton.addEventListener('mouseenter', () => {
                startButton.style.background = 'linear-gradient(135deg, #ffd700 0%, #daa520 100%)';
                startButton.style.transform = 'translateY(-2px)';
            });
            
            startButton.addEventListener('mouseleave', () => {
                startButton.style.background = 'linear-gradient(135deg, #daa520 0%, #b8860b 100%)';
                startButton.style.transform = 'translateY(0)';
            });
            
            startButton.addEventListener('click', () => {
                QuizMode.start(currentCategory);
                this.showQuizQuestionScreen();
            });
            
            // 組裝
            container.appendChild(rulesBox);
            container.appendChild(startButton);
            
            // 添加返回按鈕
            const backButton = document.createElement('button');
            backButton.innerHTML = '<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width: 16px; height: 16px; vertical-align: middle;"><path d="M20 11v2H8v2H6v-2H4v-2h2V9h2v2h12zM10 8v2H8v-2h2zm0 0h2v2h-2v-2z" fill="currentColor"/></svg>';
            backButton.style.cssText = `
                position: absolute;
                top: 20px;
                left: 20px;
                padding: 8px 16px;
                background-color: #8b4513;
                color: white;
                border: 2px solid #654321;
                border-radius: 5px;
                cursor: pointer;
                font-family: 'Zpix', monospace;
                font-size: 12px;
                z-index: 1000;
            `;
            backButton.addEventListener('click', () => {
                ContentManager.showContent('main-menu');
            });
            container.appendChild(backButton);
            
            windowContent.appendChild(container);
        },
        
        // 顯示測驗答題畫面
        showQuizQuestionScreen() {
            const windowContent = document.querySelector('.window-content');
            windowContent.innerHTML = '';
            
            const question = QuizMode.getCurrentQuestion();
            if (!question) {
                // 沒有題目了，顯示結果
                this.showQuizResultScreen();
                return;
            }
            
            const progress = QuizMode.getProgress();
            
            const container = document.createElement('div');
            container.style.cssText = `
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                padding: 10px;
                box-sizing: border-box;
                position: relative;
            `;
            
            // 頂部控制欄（進度、關閉按鈕）
            const topBar = document.createElement('div');
            topBar.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
                padding: 0 5px;
            `;
            
            // 進度顯示
            const progressDisplay = document.createElement('div');
            progressDisplay.style.cssText = `
                color: #8b4513;
                font-size: 15px;
                font-weight: bold;
            `;
            progressDisplay.textContent = `📝 ${progress.current}/${progress.total}`;
            
            // 關閉按鈕
            const closeButton = document.createElement('button');
            closeButton.textContent = '✕';
            closeButton.style.cssText = `
                background-color: #dc143c;
                color: #fff;
                border: 2px solid #8b0000;
                border-radius: 50%;
                width: 36px;
                height: 36px;
                cursor: pointer;
                font-size: 20px;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            closeButton.addEventListener('click', () => {
                if (confirm('確定要結束測驗嗎？')) {
                    QuizMode.forceEnd();
                    this.showQuizResultScreen();
                }
            });
            
            topBar.appendChild(progressDisplay);
            topBar.appendChild(closeButton);
            
            // 題目卡片
            const questionCard = document.createElement('div');
            questionCard.style.cssText = `
                flex: 1;
                background-color: rgba(245, 229, 197, 0.95);
                border: 3px solid #8b4513;
                border-radius: 10px;
                padding: 15px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
            `;
            
            // 滾動條樣式已在頁面載入時全域注入
            
            // 添加 CSS 類別
            questionCard.classList.add('custom-scrollbar');
            
            // 題目文字
            const questionText = document.createElement('p');
            questionText.textContent = question.question;
            questionText.style.cssText = `
                color: #654321;
                font-size: 15px;
                line-height: 1.6;
                margin-bottom: 15px;
                font-weight: bold;
            `;
            
            // 選項容器
            const optionsContainer = document.createElement('div');
            optionsContainer.style.cssText = 'display: flex; flex-direction: column; gap: 8px; flex: 1;';
            
            let selectedAnswer = null;
            let answerSubmitted = false;
            
            // 創建選項按鈕
            question.options.forEach((option, index) => {
                const optionButton = document.createElement('button');
                optionButton.textContent = `${index + 1}. ${option}`;
                optionButton.style.cssText = `
                    padding: 10px 12px;
                    background-color: #fff;
                    border: 2px solid #8b4513;
                    border-radius: 8px;
                    color: #654321;
                    font-size: 13px;
                    text-align: left;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    line-height: 1.5;
                `;
                
                optionButton.addEventListener('click', () => {
                    if (answerSubmitted) return;
                    
                    // 移除其他選項的選中狀態
                    optionsContainer.querySelectorAll('button').forEach(btn => {
                        btn.style.backgroundColor = '#fff';
                        btn.style.borderColor = '#8b4513';
                        btn.style.fontWeight = 'normal';
                    });
                    
                    // 標記當前選項為選中
                    optionButton.style.backgroundColor = '#f5e6d3';
                    optionButton.style.borderColor = '#d4a574';
                    optionButton.style.fontWeight = 'bold';
                    selectedAnswer = index + 1;
                });
                
                optionsContainer.appendChild(optionButton);
            });
            
            // 提交按鈕
            const submitButton = document.createElement('button');
            submitButton.textContent = '提交答案';
            submitButton.style.cssText = `
                padding: 12px 30px;
                background: linear-gradient(135deg, #d4a574 0%, #c99a6e 100%);
                border: 3px solid #b8895f;
                border-radius: 8px;
                color: #fff;
                font-size: 15px;
                font-weight: bold;
                cursor: pointer;
                margin-top: 12px;
                transition: all 0.2s ease;
                box-shadow: 0 3px 6px rgba(0,0,0,0.15);
            `;
            
            submitButton.addEventListener('mouseenter', () => {
                submitButton.style.background = 'linear-gradient(135deg, #e6b566 0%, #d4a574 100%)';
                submitButton.style.transform = 'translateY(-2px)';
                submitButton.style.boxShadow = '0 4px 8px rgba(0,0,0,0.25)';
            });
            
            submitButton.addEventListener('mouseleave', () => {
                submitButton.style.background = 'linear-gradient(135deg, #d4a574 0%, #c99a6e 100%)';
                submitButton.style.transform = 'translateY(0)';
                submitButton.style.boxShadow = '0 3px 6px rgba(0,0,0,0.15)';
            });
            
            submitButton.addEventListener('click', () => {
                if (selectedAnswer === null) {
                    showMessage('請先選擇一個答案！', 'warning');
                    return;
                }
                
                if (answerSubmitted) return;
                answerSubmitted = true;
                
                // 提交答案
                const isCorrect = QuizMode.submitAnswer(QuizMode.currentQuestionIndex, selectedAnswer);
                
                // 顯示對錯結果
                const resultDisplay = document.createElement('div');
                resultDisplay.style.cssText = `
                    margin-top: 15px;
                    padding: 15px;
                    border-radius: 8px;
                    text-align: center;
                    font-size: 18px;
                    font-weight: bold;
                `;
                
                if (isCorrect) {
                    resultDisplay.style.backgroundColor = '#d4edda';
                    resultDisplay.style.border = '2px solid #28a745';
                    resultDisplay.style.color = '#155724';
                    resultDisplay.innerHTML = '⭕ 答對了！';
                } else {
                    resultDisplay.style.backgroundColor = '#f8d7da';
                    resultDisplay.style.border = '2px solid #dc3545';
                    resultDisplay.style.color = '#721c24';
                    resultDisplay.innerHTML = '❌ 答錯了！';
                }
                
                // 顯示正確答案
                const correctAnswerDisplay = document.createElement('div');
                correctAnswerDisplay.style.cssText = `
                    margin-top: 10px;
                    padding: 10px;
                    background-color: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 5px;
                    font-size: 14px;
                `;
                correctAnswerDisplay.innerHTML = `<strong>正確答案：</strong>選項 ${question.answer}. ${question.options[question.answer - 1]}`;
                
                // 顯示解析（如果有的話）
                const explanationDisplay = document.createElement('div');
                explanationDisplay.style.cssText = `
                    margin-top: 10px;
                    padding: 10px;
                    background-color: #e7f3ff;
                    border: 1px solid #b3d9ff;
                    border-radius: 5px;
                    font-size: 14px;
                    line-height: 1.5;
                `;
                explanationDisplay.innerHTML = `
                    <strong>解析：</strong>${question.explanation || '此題目暫無詳細解析。'}<br>
                    <strong>本題概念：</strong>${question.concept || '此題目暫無概念說明。'}<br>
                    <strong>建議複習方向：</strong>${question.review || '建議複習相關章節內容。'}
                `;
                
                // 下一題按鈕
                const nextButton = document.createElement('button');
                nextButton.textContent = '下一題';
                nextButton.style.cssText = `
                    padding: 12px 30px;
                    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                    border: 3px solid #1e7e34;
                    border-radius: 8px;
                    color: #fff;
                    font-size: 15px;
                    font-weight: bold;
                    cursor: pointer;
                    margin-top: 15px;
                    transition: all 0.2s ease;
                    box-shadow: 0 3px 6px rgba(0,0,0,0.15);
                `;
                
                nextButton.addEventListener('click', () => {
                    const nextQuestion = QuizMode.nextQuestion();
                    if (nextQuestion) {
                        this.showQuizQuestionScreen();
                    } else {
                        this.showQuizResultScreen();
                    }
                });
                
                // 隱藏提交按鈕，顯示結果
                submitButton.style.display = 'none';
                questionCard.appendChild(resultDisplay);
                questionCard.appendChild(correctAnswerDisplay);
                questionCard.appendChild(explanationDisplay);
                questionCard.appendChild(nextButton);
                
                // 自動滑動到解析部分
                setTimeout(() => {
                    explanationDisplay.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start',
                        inline: 'nearest'
                    });
                }, 300);
            });
            
            // 組裝題目卡片
            questionCard.appendChild(questionText);
            questionCard.appendChild(optionsContainer);
            questionCard.appendChild(submitButton);
            
            // 組裝主容器
            container.appendChild(topBar);
            container.appendChild(questionCard);
            
            windowContent.appendChild(container);
        },
        
        // 顯示測驗結果畫面
        showQuizResultScreen() {
            const windowContent = document.querySelector('.window-content');
            windowContent.innerHTML = '';
            
            const result = QuizMode.isActive ? QuizMode.end() : {
                correctCount: QuizMode.answers.filter(a => a.isCorrect).length,
                totalCount: QuizMode.questions.length,
                correctRate: QuizMode.answers.filter(a => a.isCorrect).length / QuizMode.questions.length,
                reward: 0,
                answers: QuizMode.answers
            };
            
            // 計算各類別答對率
            const categoryStats = {};
            QuestionBank.categories.forEach(category => {
                const categoryAnswers = result.answers.filter(a => a.question.category === category);
                const correctCount = categoryAnswers.filter(a => a.isCorrect).length;
                const totalCount = categoryAnswers.length;
                categoryStats[category] = {
                    correctCount,
                    totalCount,
                    correctRate: totalCount > 0 ? correctCount / totalCount : 0
                };
            });
            
            // 找出最高分的類別
            const topCategory = Object.keys(categoryStats).reduce((a, b) => 
                categoryStats[a].correctRate > categoryStats[b].correctRate ? a : b
            );
            
			// 職業建議資料（對齊命名：career_guidance）
			const career_guidance = {
                '行銷理論與管理': {
                    representative_jobs: ['行銷經理', '品牌經理', '產品經理', '行銷總監'],
                    required_skills: ['行銷策略規劃', '品牌管理', '市場分析', '團隊領導'],
                    student_recommendations: ['修習行銷管理課程', '學習品牌建立策略', '了解消費者行為', '培養領導能力']
                },
                '行銷策略與企劃': {
                    representative_jobs: ['行銷企劃專員', '活動企劃', '行銷策略師', '企劃經理'],
                    required_skills: ['企劃能力', '創意思維', '專案管理', '溝通協調'],
                    student_recommendations: ['學習企劃書撰寫', '培養創意思考', '了解專案管理', '提升溝通技巧']
                },
                '市場研究': {
                    representative_jobs: ['市場研究員', '數據分析師', '消費者洞察專員', '研究經理'],
                    required_skills: ['數據分析', '統計方法', '問卷設計', '報告撰寫'],
                    student_recommendations: ['學習統計學', '掌握數據分析工具', '了解研究方法', '提升報告撰寫能力']
                },
                '全球與國際行銷': {
                    representative_jobs: ['國際行銷專員', '海外業務', '跨國品牌經理', '國際貿易專員'],
                    required_skills: ['外語能力', '跨文化溝通', '國際貿易', '全球市場分析'],
                    student_recommendations: ['加強外語能力', '了解國際貿易', '學習跨文化溝通', '關注全球市場趨勢']
                },
                '數位與網路行銷': {
                    representative_jobs: ['數位行銷專員', '社群媒體經理', 'SEO專員', '電商營運'],
                    required_skills: ['數位工具操作', '社群媒體管理', 'SEO/SEM', '數據分析'],
                    student_recommendations: ['學習數位行銷工具', '了解社群媒體策略', '掌握SEO技巧', '培養數據分析能力']
                }
            };
            
            const container = document.createElement('div');
            container.style.cssText = `
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 15px 10px 10px 10px;
                box-sizing: border-box;
                overflow-y: auto;
            `;
            container.classList.add('custom-scrollbar');
            
            // 標題
            const title = document.createElement('div');
            title.style.cssText = 'display: flex; align-items: center; justify-content: center; margin-bottom: 15px;';
            
            const titleIcon = document.createElement('img');
            titleIcon.src = 'assets/images/報表.png';
            titleIcon.style.cssText = 'width: 24px; height: 24px; margin-right: 8px;';
            titleIcon.alt = '報表';
            
            const titleText = document.createElement('h1');
            titleText.textContent = '測驗結果';
            titleText.style.cssText = 'color: #8b4513; font-size: 20px; margin: 0; display: inline;';
            
            title.appendChild(titleIcon);
            title.appendChild(titleText);
            
            // 成績卡片
            const scoreCard = document.createElement('div');
            scoreCard.style.cssText = `
                background: linear-gradient(135deg, ${result.correctRate >= 0.7 ? '#90ee90' : '#ffcccb'} 0%, 
                                                    ${result.correctRate >= 0.7 ? '#98fb98' : '#ffa07a'} 100%);
                border: 4px solid #8b4513;
                border-radius: 10px;
                padding: 20px;
                margin-bottom: 15px;
                width: 100%;
                max-width: 500px;
                text-align: center;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            `;
            
            scoreCard.innerHTML = `
                <p style="font-size: 46px; margin-bottom: 8px;">${result.correctRate >= 0.7 ? '🎉' : '😅'}</p>
                <p style="color: #654321; font-size: 18px; font-weight: bold; margin-bottom: 6px;">
                    答對 ${result.correctCount} / ${result.totalCount} 題
                </p>
                <p style="color: #654321; font-size: 16px; margin-bottom: 12px;">
                    答對率：${(result.correctRate * 100).toFixed(0)}%
                </p>
                <hr style="border: 1px solid #8b4513; margin: 12px 0;">
                <p style="color: #daa520; font-size: 18px; font-weight: bold; display: flex; align-items: center; justify-content: center;">
                    <img src="assets/images/蜂蜜幣.png" style="width: 20px; height: 20px; margin-right: 6px; vertical-align: middle;">
                    獲得 ${result.reward} 蜂蜜幣
                </p>
            `;
            
            // 若沒有任何作答，顯示提示並跳過雷達圖與職業建議
            const answeredCount = result.answers ? result.answers.length : 0;
            const hasAnswered = answeredCount > 0;
            
            // 能力雷達圖
            const radarSection = document.createElement('div');
            radarSection.style.cssText = `
                width: 100%;
                max-width: 500px;
                margin-bottom: 15px;
                background-color: rgba(255, 255, 255, 0.95);
                border: 3px solid #8b4513;
                border-radius: 10px;
                padding: 15px;
            `;
            
            const radarTitle = document.createElement('h3');
            radarTitle.textContent = '能力雷達圖';
            radarTitle.style.cssText = 'color: #8b4513; font-size: 16px; margin-bottom: 10px; text-align: center;';
            
            if (!hasAnswered) {
                const emptyMsg = document.createElement('p');
                emptyMsg.style.cssText = 'color:#654321; font-size:14px; text-align:center; margin: 4px 0 2px;';
                emptyMsg.textContent = '尚未作答，請完成至少一題以生成能力雷達圖。';
                radarSection.appendChild(radarTitle);
                radarSection.appendChild(emptyMsg);
                
                // 先將空狀態的雷達區塊加入
                container.appendChild(title);
                container.appendChild(scoreCard);
                container.appendChild(radarSection);
                
                // 跳過後續雷達繪製與職業建議，直接返回
                windowContent.innerHTML = '';
                windowContent.appendChild(container);
                return;
            }
            
			// 使用 Canvas 畫出五邊形雷達圖
			const radarWrapper = document.createElement('div');
			radarWrapper.style.cssText = 'display:flex; justify-content:center;';
			const canvas = document.createElement('canvas');
			
			// 處理高解析度螢幕的像素密度
			const devicePixelRatio = window.devicePixelRatio || 1;
			const baseWidth = 480;
			const baseHeight = 360;
			
			// 設定實際 Canvas 尺寸（考慮像素密度）
			canvas.width = baseWidth * devicePixelRatio;
			canvas.height = baseHeight * devicePixelRatio;
			
			// 設定 CSS 顯示尺寸
			canvas.style.width = baseWidth + 'px';
			canvas.style.height = baseHeight + 'px';
			canvas.style.maxWidth = '100%';
			
			radarWrapper.appendChild(canvas);
			const ctx = canvas.getContext('2d');
			
			// 縮放 Canvas 以適應高解析度
			ctx.scale(devicePixelRatio, devicePixelRatio);
			
			// 啟用高品質渲染
			ctx.imageSmoothingEnabled = true;
			ctx.imageSmoothingQuality = 'high';
			
			// 準備資料
			const labels = QuestionBank.categories;
			const values = labels.map(c => Math.round((categoryStats[c].correctRate || 0) * 100));
			
			// 幾何設定（使用基礎尺寸）
			const cx = baseWidth / 2;
			const cy = baseHeight / 2 + 10; // 略微下移，留給頂部標籤
			const radius = Math.min(baseWidth, baseHeight) * 0.35;
			const steps = 5; // 20%,40%,60%,80%,100%
			const angleStep = (Math.PI * 2) / labels.length;
			
			// 助手：極座標轉直角
			const toXY = (r, angle) => {
				return { x: cx + r * Math.sin(angle), y: cy - r * Math.cos(angle) };
			};
			// 助手：像素貼齊（讓 1px 線條更銳利）
			const snap = (v) => Math.round(v) + 0.5;
			
			// 畫同心多邊形網格（半像素貼齊，避免模糊）
			ctx.lineWidth = 1;
			ctx.strokeStyle = '#ddd';
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			for (let s = 1; s <= steps; s++) {
				const r = (radius * s) / steps;
				ctx.beginPath();
				for (let i = 0; i < labels.length; i++) {
					const { x, y } = toXY(r, i * angleStep);
					const sx = snap(x);
					const sy = snap(y);
					if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
				}
				ctx.closePath();
				ctx.stroke();
			}
			
			// 畫軸線（半像素貼齊）
			ctx.strokeStyle = '#ccc';
			ctx.lineWidth = 1;
			for (let i = 0; i < labels.length; i++) {
				const { x, y } = toXY(radius, i * angleStep);
				const sx = snap(x);
				const sy = snap(y);
				ctx.beginPath();
				ctx.moveTo(snap(cx), snap(cy));
				ctx.lineTo(sx, sy);
				ctx.stroke();
			}
			
			// 畫百分比標示 (20% 間距)
			ctx.fillStyle = '#666';
			ctx.font = 'bold 14px "Microsoft YaHei", "PingFang SC", "Helvetica Neue", Arial, sans-serif';
			ctx.textAlign = 'left';
			ctx.textBaseline = 'middle';
			// 啟用文字平滑
			ctx.textRenderingOptimization = 'optimizeQuality';
			for (let s = 1; s <= steps; s++) {
				const r = (radius * s) / steps;
				ctx.fillText(`${s * 20}%`, Math.round(cx + 8), Math.round(cy - r));
			}
			
			// 畫標籤
			ctx.fillStyle = '#654321';
			ctx.font = 'bold 15px "Microsoft YaHei", "PingFang SC", "Helvetica Neue", Arial, sans-serif';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			labels.forEach((label, i) => {
				const pos = toXY(radius + 20, i * angleStep);
				ctx.fillText(label, Math.round(pos.x), Math.round(pos.y));
			});
			
			// 畫數據多邊形
			ctx.beginPath();
			values.forEach((val, i) => {
				const r = (radius * val) / 100;
				const { x, y } = toXY(r, i * angleStep);
				if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
			});
			ctx.closePath();
			ctx.fillStyle = 'rgba(66, 133, 244, 0.4)';
			ctx.strokeStyle = 'rgba(66, 133, 244, 1)';
			ctx.lineWidth = 2.5;
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			ctx.fill();
			ctx.stroke();
			
			// 畫數據點
			ctx.fillStyle = 'rgba(66, 133, 244, 1)';
			values.forEach((val, i) => {
				const r = (radius * val) / 100;
				const { x, y } = toXY(r, i * angleStep);
				ctx.beginPath();
				ctx.arc(x, y, 4, 0, Math.PI * 2);
				ctx.fill();
			});
			
			// 將雷達圖加入版面
			radarSection.appendChild(radarTitle);
			radarSection.appendChild(radarWrapper);
            
            // 職業建議
            const careerSection = document.createElement('div');
            careerSection.style.cssText = `
                width: 100%;
                max-width: 500px;
                margin-bottom: 15px;
                background-color: rgba(255, 255, 255, 0.95);
                border: 3px solid #8b4513;
                border-radius: 10px;
                padding: 15px;
            `;
            
            const careerTitle = document.createElement('h3');
            careerTitle.textContent = '💼 個人化職業建議';
            careerTitle.style.cssText = 'color: #8b4513; font-size: 16px; margin-bottom: 10px; text-align: center;';
            
			const careerData_obj = career_guidance[topCategory];
            careerSection.innerHTML = `
                <div style="margin-bottom: 10px;">
                    <strong style="color: #654321;">🏆 最強領域：</strong>
                    <span style="color: #8b4513; font-weight: bold;">${topCategory}</span>
                </div>
                <div style="margin-bottom: 10px;">
                    <strong style="color: #654321;">💼 代表職業：</strong>
                    <div style="color: #654321; margin-top: 5px;">
                        ${careerData_obj.representative_jobs.map(job => `• ${job}`).join('<br>')}
                    </div>
                </div>
                <div style="margin-bottom: 10px;">
                    <strong style="color: #654321;">🛠️ 所需技能：</strong>
                    <div style="color: #654321; margin-top: 5px;">
                        ${careerData_obj.required_skills.map(skill => `• ${skill}`).join('<br>')}
                    </div>
                </div>
                <div>
                    <strong style="color: #654321;">📚 建議學習方向：</strong>
                    <div style="color: #654321; margin-top: 5px;">
                        ${careerData_obj.student_recommendations.map(rec => `• ${rec}`).join('<br>')}
                    </div>
                </div>
            `;
            
            // 錯題回顧
            const wrongAnswers = result.answers.filter(a => !a.isCorrect);
            if (wrongAnswers.length > 0) {
                const reviewSection = document.createElement('div');
                reviewSection.style.cssText = `
                    width: 100%;
                    max-width: 500px;
                    margin-bottom: 15px;
                `;
                
                const reviewTitle = document.createElement('h3');
                reviewTitle.textContent = '📝 錯題回顧';
                reviewTitle.style.cssText = 'color: #8b4513; font-size: 16px; margin-bottom: 10px;';
                
                reviewSection.appendChild(reviewTitle);
                
                wrongAnswers.forEach((answer, index) => {
                    const reviewItem = document.createElement('div');
                    reviewItem.style.cssText = `
                        background-color: rgba(255, 255, 255, 0.95);
                        border: 2px solid #dc143c;
                        border-radius: 8px;
                        padding: 12px;
                        margin-bottom: 8px;
                    `;
                    
                    reviewItem.innerHTML = `
                        <p style="color: #654321; font-size: 13px; margin-bottom: 8px; line-height: 1.5;">
                            <strong>第${answer.questionIndex + 1}題：</strong>${answer.question.question}
                        </p>
                        <p style="color: #dc143c; font-size: 12px; margin-bottom: 4px;">
                            ❌ 你的答案：${answer.question.options[answer.userAnswer - 1]}
                        </p>
                        <p style="color: #2e8b57; font-size: 12px; margin-bottom: 4px;">
                            ✅ 正確答案：${answer.question.options[answer.question.answer - 1]}
                        </p>
                        <div style="color: #654321; font-size: 12px; margin-top: 8px; padding: 8px; background-color: #f8f9fa; border-radius: 4px;">
                            <strong>解析：</strong>${answer.question.explanation || '此題目暫無詳細解析。'}<br>
                            <strong>本題概念：</strong>${answer.question.concept || '此題目暫無概念說明。'}<br>
                            <strong>建議複習方向：</strong>${answer.question.review || '建議複習相關章節內容。'}
                        </div>
                    `;
                    
                    reviewSection.appendChild(reviewItem);
                });
                
                container.appendChild(title);
                container.appendChild(scoreCard);
                container.appendChild(radarSection);
                container.appendChild(careerSection);
                container.appendChild(reviewSection);
            } else {
                container.appendChild(title);
                container.appendChild(scoreCard);
                container.appendChild(radarSection);
                container.appendChild(careerSection);
                
                const perfectMsg = document.createElement('p');
                perfectMsg.textContent = '🎊 完美答對！沒有錯題！';
                perfectMsg.style.cssText = 'color: #2e8b57; font-size: 15px; margin-bottom: 15px; text-align: center;';
                container.appendChild(perfectMsg);
            }
            
            // 按鈕容器
            const buttonContainer = document.createElement('div');
            buttonContainer.style.cssText = 'display: flex; gap: 12px; margin-top: 8px; flex-wrap: wrap; justify-content: center;';
            
            // 重新測驗按鈕
            const retryButton = document.createElement('button');
            retryButton.textContent = '🔄 重新測驗';
            retryButton.style.cssText = `
                padding: 12px 22px;
                background: linear-gradient(135deg, #d4a574 0%, #c99a6e 100%);
                border: 3px solid #b8895f;
                border-radius: 8px;
                color: #fff;
                font-size: 14px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 3px 6px rgba(0,0,0,0.15);
            `;
            retryButton.addEventListener('click', () => {
                const currentCategory = QuestionBank.getCurrentCategory();
                QuizMode.start(currentCategory);
                this.showQuizQuestionScreen();
            });
            
            // 返回按鈕
            const backButton = document.createElement('button');
            backButton.textContent = '🏠 返回主選單';
            backButton.style.cssText = `
                padding: 12px 22px;
                background: linear-gradient(135deg, #8b4513 0%, #654321 100%);
                border: 3px solid #5d3a1a;
                border-radius: 8px;
                color: #fff;
                font-size: 14px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 3px 6px rgba(0,0,0,0.15);
            `;
            backButton.addEventListener('click', () => {
                ContentManager.showContent('main-menu');
            });
            
            buttonContainer.appendChild(retryButton);
            buttonContainer.appendChild(backButton);
            container.appendChild(buttonContainer);
            
            windowContent.appendChild(container);
        },
        
        // 顯示排行榜內容
        showLeaderboardContent() {
            // TODO: 待重新設計排行榜頁面
        },
        
        // 顯示聊天室內容
        showChatContent() {
            // 創建遮罩層
            const overlay = document.createElement('div');
            overlay.id = 'chatOverlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                z-index: 9999;
                display: flex;
                justify-content: center;
                align-items: center;
                animation: fadeIn 0.3s ease;
            `;
            
            // 創建聊天室容器
            const chatContainer = document.createElement('div');
            chatContainer.style.cssText = `
                position: relative;
                width: 90%;
                max-width: 800px;
                height: 85%;
                max-height: 700px;
                background: linear-gradient(135deg, rgba(245, 222, 179, 0.98) 0%, rgba(222, 184, 135, 0.98) 100%);
                border: 5px solid #8b4513;
                border-radius: 20px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                display: flex;
                flex-direction: column;
                padding: 20px;
                animation: slideIn 0.3s ease;
            `;
            
            // 創建標題區域
            const header = document.createElement('div');
            header.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 3px solid #8b4513;
            `;
            
            const titleArea = document.createElement('div');
            titleArea.style.cssText = `
                display: flex;
                align-items: center;
            `;
            
            const bearIcon = document.createElement('img');
            bearIcon.src = 'assets/images/小熊哥.png';
            bearIcon.alt = '小熊哥';
            bearIcon.style.cssText = `
                width: 32px;
                height: 32px;
                margin-right: 15px;
                object-fit: contain;
            `;
            
            const title = document.createElement('h2');
            title.textContent = '小熊哥';
            title.style.cssText = `
                color: #8b4513;
                font-size: 24px;
                margin: 0;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
            `;
            
            titleArea.appendChild(bearIcon);
            titleArea.appendChild(title);
            
            // 創建關閉按鈕
            const closeButton = document.createElement('button');
            closeButton.innerHTML = '✕';
            closeButton.style.cssText = `
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
                border: 3px solid #8b4513;
                border-radius: 50%;
                color: white;
                font-size: 24px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                justify-content: center;
                line-height: 1;
                padding: 0;
            `;
            
            closeButton.addEventListener('mouseenter', () => {
                closeButton.style.transform = 'scale(1.1) rotate(90deg)';
                closeButton.style.background = 'linear-gradient(135deg, #ff8787 0%, #ff6b6b 100%)';
            });
            
            closeButton.addEventListener('mouseleave', () => {
                closeButton.style.transform = 'scale(1) rotate(0deg)';
                closeButton.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)';
            });
            
            closeButton.addEventListener('click', () => {
                overlay.style.animation = 'fadeOut 0.3s ease';
                chatContainer.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    document.body.removeChild(overlay);
                }, 300);
            });
            
            // 創建清空聊天記錄按鈕
            const clearButton = document.createElement('button');
            clearButton.innerHTML = '🗑️';
            clearButton.title = '清空聊天記錄';
            clearButton.style.cssText = `
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #ffa500 0%, #ff8c00 100%);
                border: 3px solid #8b4513;
                border-radius: 50%;
                color: white;
                font-size: 18px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                justify-content: center;
                line-height: 1;
                padding: 0;
            `;
            
            clearButton.addEventListener('mouseenter', () => {
                clearButton.style.transform = 'scale(1.1)';
                clearButton.style.background = 'linear-gradient(135deg, #ffb347 0%, #ffa500 100%)';
            });
            
            clearButton.addEventListener('mouseleave', () => {
                clearButton.style.transform = 'scale(1)';
                clearButton.style.background = 'linear-gradient(135deg, #ffa500 0%, #ff8c00 100%)';
            });
            
            clearButton.addEventListener('click', () => {
                this.clearChatHistory();
            });
            
            // 創建按鈕容器，將清空按鈕和關閉按鈕放在一起
            const buttonContainer = document.createElement('div');
            buttonContainer.style.cssText = `
                display: flex;
                align-items: center;
                gap: 10px;
            `;
            
            buttonContainer.appendChild(clearButton);
            buttonContainer.appendChild(closeButton);
            
            header.appendChild(titleArea);
            header.appendChild(buttonContainer);
            
            // 創建聊天訊息顯示區域
            const chatArea = document.createElement('div');
            chatArea.id = 'chatMessagesArea';
            chatArea.style.cssText = `
                flex: 1;
                background: rgba(255, 255, 255, 0.9);
                border: 3px solid #8b4513;
                border-radius: 15px;
                padding: 20px;
                overflow-y: auto;
                margin-bottom: 15px;
                display: flex;
                flex-direction: column;
                gap: 12px;
            `;
            chatArea.classList.add('custom-scrollbar');
            
            // 載入聊天記錄
            this.loadChatMessages(chatArea);
            
            // 創建輸入區域（類似 LINE）
            const inputArea = document.createElement('div');
            inputArea.style.cssText = `
                display: flex;
                gap: 10px;
                align-items: flex-end;
                background: rgba(255, 255, 255, 0.95);
                padding: 15px;
                border: 3px solid #8b4513;
                border-radius: 15px;
            `;
            
            // 創建輸入框
            const messageInput = document.createElement('textarea');
            messageInput.placeholder = '輸入訊息...';
            messageInput.style.cssText = `
                flex: 1;
                padding: 12px 15px;
                border: 2px solid #d2b48c;
                border-radius: 20px;
                background: white;
                color: #654321;
                font-family: 'Zpix', 'Press Start 2P', monospace;
                font-size: 14px;
                resize: none;
                height: 45px;
                max-height: 100px;
                line-height: 1.5;
                transition: border-color 0.3s ease;
                outline: none;
                overflow: hidden;
            `;
            
            // 自動調整輸入框高度
            messageInput.addEventListener('input', function() {
                this.style.height = '45px';
                this.style.height = Math.min(this.scrollHeight, 100) + 'px';
            });
            
            messageInput.addEventListener('focus', () => {
                messageInput.style.borderColor = '#8b4513';
            });
            
            messageInput.addEventListener('blur', () => {
                messageInput.style.borderColor = '#d2b48c';
            });
            
            // 創建發送按鈕（使用往上箭頭圖示）
            const sendButton = document.createElement('button');
            sendButton.innerHTML = '↑';
            sendButton.style.cssText = `
                width: 45px;
                height: 45px;
                background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
                border: none;
                border-radius: 50%;
                color: white;
                font-size: 24px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
                flex-shrink: 0;
                transform: rotate(0deg);
            `;
            
            sendButton.addEventListener('mouseenter', () => {
                sendButton.style.transform = 'scale(1.1)';
                sendButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
            });
            
            sendButton.addEventListener('mouseleave', () => {
                sendButton.style.transform = 'scale(1)';
                sendButton.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
            });
            
            // 發送訊息功能
            const sendMessage = () => {
                const message = messageInput.value.trim();
                if (message) {
                    // 保存用戶訊息到聊天記錄
                    window.addChatMessage('user', message);
                    
                    // 顯示用戶訊息
                    const userBubble = this.createChatBubble('user', message);
                    chatArea.appendChild(userBubble);
                    
                    // 清空輸入框
                    messageInput.value = '';
                    messageInput.style.height = 'auto';
                    
                    // 滾動到底部
                    chatArea.scrollTop = chatArea.scrollHeight;
                    
                    // 顯示「正在輸入」指示器
                    const typingIndicator = this.createTypingIndicator();
                    chatArea.appendChild(typingIndicator);
                    chatArea.scrollTop = chatArea.scrollHeight;
                    
                    // 調用 Botpress API 獲取回應
                    this.sendToBotpress(message, chatArea, typingIndicator);
                }
            };
            
            sendButton.addEventListener('click', sendMessage);
            
            // 按 Enter 發送，Shift+Enter 換行
            messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
            
            // 組裝輸入區域
            inputArea.appendChild(messageInput);
            inputArea.appendChild(sendButton);
            
            // 組裝容器
            chatContainer.appendChild(header);
            chatContainer.appendChild(chatArea);
            chatContainer.appendChild(inputArea);
            overlay.appendChild(chatContainer);
            
            // 保存聊天區域引用，供其他函數使用
            this.currentChatArea = chatArea;
            
            // 添加動畫樣式和滾動條樣式
            const style = document.createElement('style');
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-50px) scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                @keyframes slideOut {
                    from {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                    to {
                        opacity: 0;
                        transform: translateY(-50px) scale(0.9);
                    }
                }
                @keyframes bounce {
                    0%, 80%, 100% { transform: translateY(0); }
                    40% { transform: translateY(-5px); }
                }
                /* 聊天區域使用統一滾動條樣式 */
            `;
            document.head.appendChild(style);
            
            // 添加到頁面
            document.body.appendChild(overlay);
            
            // 確保輸入框獲得焦點
            setTimeout(() => {
                messageInput.focus();
            }, 300);
        },
        
        // 載入聊天記錄
        loadChatMessages(chatArea) {
            if (!chatArea) {
                chatArea = this.currentChatArea;
            }
            
            if (!chatArea) {
                console.log('❌ 聊天區域未找到');
                return;
            }
            
            // 清空現有訊息
            chatArea.innerHTML = '';
            
            // 載入聊天記錄
            if (window.chatHistory && window.chatHistory.length > 0) {
                console.log(`📖 載入 ${window.chatHistory.length} 條聊天記錄`);
                
                window.chatHistory.forEach(msg => {
                    const bubble = this.createChatBubble(msg.type, msg.message, msg.timestamp);
                    chatArea.appendChild(bubble);
                });
                
                // 滾動到底部
                setTimeout(() => {
                    chatArea.scrollTop = chatArea.scrollHeight;
                }, 100);
            } else {
                // 如果沒有聊天記錄，顯示歡迎訊息
                const welcomeMsg = this.createChatBubble('bear', '嗨～我是小熊哥，歡迎來到熊熊烘焙屋，今天想吃點什麼甜甜的呀？');
                chatArea.appendChild(welcomeMsg);
            }
        },
        
        // 清空聊天記錄
        clearChatHistory() {
            if (confirm('確定要清空所有聊天記錄嗎？')) {
                window.clearChatHistory();
                
                // 重新載入聊天記錄（會顯示歡迎訊息）
                this.loadChatMessages();
                
                console.log('🗑️ 聊天記錄已清空');
            }
        },
        
        // 創建聊天氣泡
        createChatBubble(type, message, timestamp) {
            const bubble = document.createElement('div');
            bubble.style.cssText = `
                display: flex;
                ${type === 'user' ? 'justify-content: flex-end;' : 'justify-content: flex-start;'}
                animation: fadeIn 0.3s ease;
            `;
            
            const messageBox = document.createElement('div');
            messageBox.style.cssText = `
                max-width: 70%;
                padding: 12px 16px;
                border-radius: 18px;
                font-size: 14px;
                        line-height: 1.5;
                word-wrap: break-word;
                ${type === 'user' 
                    ? 'background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; border-bottom-right-radius: 4px;'
                    : 'background: rgba(139, 69, 19, 0.1); color: #654321; border: 2px solid #8b4513; border-bottom-left-radius: 4px;'
                }
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                position: relative;
            `;
            messageBox.textContent = message;
            
            // 添加時間戳（如果有提供）
            if (timestamp) {
                const timeElement = document.createElement('div');
                timeElement.style.cssText = `
                    font-size: 10px;
                    opacity: 0.7;
                    margin-top: 4px;
                    text-align: ${type === 'user' ? 'right' : 'left'};
                `;
                timeElement.textContent = new Date(timestamp).toLocaleTimeString();
                messageBox.appendChild(timeElement);
            }
            
            bubble.appendChild(messageBox);
            return bubble;
        },
        
        // 創建「正在輸入」指示器
        createTypingIndicator() {
            const indicator = document.createElement('div');
            indicator.className = 'typing-indicator';
            indicator.style.cssText = `
                display: flex;
                justify-content: flex-start;
                animation: fadeIn 0.3s ease;
            `;
            
            const box = document.createElement('div');
            box.style.cssText = `
                padding: 12px 16px;
                border-radius: 18px;
                background: rgba(139, 69, 19, 0.1);
                border: 2px solid #8b4513;
                border-bottom-left-radius: 4px;
                display: flex;
                gap: 4px;
            `;
            
            for (let i = 0; i < 3; i++) {
                const dot = document.createElement('span');
                dot.style.cssText = `
                    width: 8px;
                    height: 8px;
                    background: #8b4513;
                    border-radius: 50%;
                    animation: bounce 1.4s infinite;
                    animation-delay: ${i * 0.2}s;
                `;
                box.appendChild(dot);
            }
            
            indicator.appendChild(box);
            return indicator;
        },
        
        // 發送訊息到 Botpress 並獲取回應（整合到聊天室）
        async sendToBotpress(message, chatArea, typingIndicator) {
            try {
                console.log('📤 發送訊息到 Botpress:', message);
                
                // 等待 Botpress 準備就緒
                const isReady = await this.waitForBotpressReady();
                
                if (!isReady) {
                    console.log('❌ Botpress 未準備就緒，使用內建聊天機器人');
                    throw new Error('USE_FALLBACK');
                }
                
                // 找到可用的 Botpress API
                const botpressAPI = this.findBotpressAPI();
                
                if (!botpressAPI) {
                    console.log('❌ 找不到可用的 Botpress API，使用內建聊天機器人');
                    throw new Error('USE_FALLBACK');
                }
                
                console.log(`✅ 使用 ${botpressAPI.name} 發送訊息`);
                
                // 隱藏 Botpress 的默認聊天窗口（如果存在）
                this.hideBotpressWidget();
                
                // 發送訊息
                botpressAPI.obj.sendEvent({
                    type: 'text',
                    text: message
                });
                
                console.log(`✅ 訊息已發送到 ${botpressAPI.name}`);
                
                // 監聽回應
                let messageReceived = false;
                const messageHandler = (event) => {
                    console.log('📥 收到 Botpress 事件:', event);
                    
                    if (event.type === 'text' && !messageReceived) {
                        messageReceived = true;
                        
                        // 移除「正在輸入」指示器
                        if (typingIndicator && typingIndicator.parentNode) {
                            typingIndicator.remove();
                        }
                        
                        // 保存機器人回應到聊天記錄
                        window.addChatMessage('bear', event.text);
                        
                        // 顯示機器人回應
                        const botBubble = this.createChatBubble('bear', `🐻 小熊哥：${event.text}`);
                        chatArea.appendChild(botBubble);
                        chatArea.scrollTop = chatArea.scrollHeight;
                        
                        console.log('✅ 顯示 Botpress 回應:', event.text);
                    }
                };
                
                // 註冊事件監聽器（嘗試多種方法）
                let eventListenerRegistered = false;
                
                // 方法1: 標準 onEvent
                if (typeof botpressAPI.obj.onEvent === 'function') {
                    try {
                        botpressAPI.obj.onEvent(messageHandler, ['text']);
                        console.log(`✅ ${botpressAPI.name} 事件監聽器已註冊 (onEvent)`);
                        eventListenerRegistered = true;
                    } catch (error) {
                        console.log(`⚠️ ${botpressAPI.name} onEvent 註冊失敗:`, error);
                    }
                }
                
                // 方法2: eventEmitter
                if (!eventListenerRegistered && botpressAPI.obj.eventEmitter) {
                    try {
                        // 嘗試多種事件類型
                        const eventTypes = ['text', 'message', 'bot-message', 'user-message', 'botpress-message'];
                        eventTypes.forEach(eventType => {
                            try {
                                botpressAPI.obj.eventEmitter.on(eventType, messageHandler);
                                console.log(`✅ ${botpressAPI.name} 事件監聽器已註冊 (eventEmitter: ${eventType})`);
                            } catch (e) {
                                // 忽略單個事件類型註冊失敗
                            }
                        });
                        eventListenerRegistered = true;
                    } catch (error) {
                        console.log(`⚠️ ${botpressAPI.name} eventEmitter 註冊失敗:`, error);
                    }
                }
                
                // 方法3: 直接監聽 window 事件
                if (!eventListenerRegistered) {
                    try {
                        const windowEventTypes = ['botpress-message', 'botpress-response', 'webchat-message', 'bot-message'];
                        windowEventTypes.forEach(eventType => {
                            window.addEventListener(eventType, messageHandler);
                        });
                        console.log(`✅ ${botpressAPI.name} 事件監聽器已註冊 (window)`);
                        eventListenerRegistered = true;
                    } catch (error) {
                        console.log(`⚠️ ${botpressAPI.name} window 事件註冊失敗:`, error);
                    }
                }
                
                // 方法4: 監聽 Botpress 內部事件
                if (!eventListenerRegistered && botpressAPI.obj.components) {
                    try {
                        // 嘗試監聽 Botpress 組件事件
                        if (typeof botpressAPI.obj.components.onMessage === 'function') {
                            botpressAPI.obj.components.onMessage(messageHandler);
                            console.log(`✅ ${botpressAPI.name} 事件監聽器已註冊 (components)`);
                            eventListenerRegistered = true;
                        }
                    } catch (error) {
                        console.log(`⚠️ ${botpressAPI.name} components 事件註冊失敗:`, error);
                    }
                }
                
                // 方法5: 使用輪詢方式檢查回應
                if (!eventListenerRegistered) {
                    console.log(`⚠️ ${botpressAPI.name} 無法註冊事件監聽器，將使用輪詢方式`);
                    
                    // 輪詢檢查 Botpress 狀態
                    const pollInterval = setInterval(() => {
                        try {
                            // 檢查是否有新的回應
                            if (botpressAPI.obj.state && botpressAPI.obj.state.messages) {
                                const messages = botpressAPI.obj.state.messages;
                                const lastMessage = messages[messages.length - 1];
                                
                                if (lastMessage && lastMessage.type === 'text' && 
                                    lastMessage.direction === 'incoming' && 
                                    !messageReceived) {
                                    
                                    messageReceived = true;
                                    clearInterval(pollInterval);
                                    
                                    // 移除「正在輸入」指示器
                                    if (typingIndicator && typingIndicator.parentNode) {
                                        typingIndicator.remove();
                                    }
                                    
                                    // 保存機器人回應到聊天記錄
                                    window.addChatMessage('bear', lastMessage.text);
                                    
                                    // 顯示機器人回應
                                    const botBubble = this.createChatBubble('bear', `🐻 小熊哥：${lastMessage.text}`);
                                    chatArea.appendChild(botBubble);
                                    chatArea.scrollTop = chatArea.scrollHeight;
                                    
                                    console.log('✅ 輪詢收到 Botpress 回應:', lastMessage.text);
                                }
                            }
                        } catch (error) {
                            // 忽略輪詢錯誤
                        }
                    }, 1000); // 每秒檢查一次
                    
                    // 10秒後停止輪詢
                    setTimeout(() => {
                        clearInterval(pollInterval);
                    }, 10000);
                }
                
                // 設置超時保護（15秒後如果沒收到回應就使用備用）
                    setTimeout(() => {
                    if (!messageReceived) {
                        console.log('⚠️ Botpress 回應超時，使用備用回應');
                        if (typingIndicator && typingIndicator.parentNode) {
                            typingIndicator.remove();
                        }
                        
                        // 使用內建回應
                        const response = this.generateLocalResponse(message);
                        
                        // 保存機器人回應到聊天記錄
                        window.addChatMessage('bear', response);
                        
                        const botBubble = this.createChatBubble('bear', `🐻 小熊哥：${response}`);
                        chatArea.appendChild(botBubble);
                        chatArea.scrollTop = chatArea.scrollHeight;
                    }
                }, 15000);
                
            } catch (error) {
                console.log('💡 使用內建聊天機器人回應');
                
                // 移除「正在輸入」指示器
                if (typingIndicator && typingIndicator.parentNode) {
                    setTimeout(() => {
                        typingIndicator.remove();
                    }, 500);
                }
                
                // 使用內建的智能回應系統
                setTimeout(() => {
                    const response = this.generateLocalResponse(message);
                    
                    // 保存機器人回應到聊天記錄
                    window.addChatMessage('bear', response);
                    
                    const botBubble = this.createChatBubble('bear', `🐻 小熊哥：${response}`);
                    chatArea.appendChild(botBubble);
                    chatArea.scrollTop = chatArea.scrollHeight;
                }, 800 + Math.random() * 1000);
            }
        },
        
        // 隱藏 Botpress 的默認聊天窗口
        hideBotpressWidget() {
            console.log('🚫 強制隱藏所有 Botpress UI 元素...');
            
            // 隱藏可能的 Botpress 聊天窗口
            const selectors = [
                '#botpress-webchat',
                '.botpress-webchat',
                '[data-botpress]',
                '.bp-widget',
                '#bp-widget',
                '.webchat-container',
                '#webchat-container',
                '.bp-webchat',
                '#bp-webchat'
            ];
            
            selectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    if (element) {
                        element.style.display = 'none !important';
                        element.style.visibility = 'hidden !important';
                        element.style.opacity = '0 !important';
                        element.style.pointerEvents = 'none !important';
                        element.style.position = 'absolute !important';
                        element.style.left = '-9999px !important';
                        element.style.top = '-9999px !important';
                        element.style.zIndex = '-9999 !important';
                        element.style.transform = 'scale(0) !important';
                        element.style.width = '0 !important';
                        element.style.height = '0 !important';
                        element.style.overflow = 'hidden !important';
                        console.log(`🚫 隱藏 Botpress 元素: ${selector}`);
                    }
                });
            });
            
            // 隱藏可能的浮動按鈕（包括藍色氣泡）
            const fabSelectors = [
                '.bp-fab',
                '#bp-fab',
                '.botpress-fab',
                '.webchat-fab',
                '.bp-floating-button',
                '#bp-floating-button',
                // 通用的浮動聊天按鈕
                '.chat-widget',
                '.chat-button',
                '.floating-chat',
                '.chat-bubble',
                '.chat-icon',
                // 可能的第三方聊天按鈕
                '[class*="chat-"]',
                '[id*="chat-"]',
                '[class*="bp-"]',
                '[class*="botpress"]',
                '[class*="webchat"]',
                '[id*="bp-"]',
                '[id*="botpress"]',
                '[id*="webchat"]'
            ];
            
            fabSelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    if (element) {
                        element.style.display = 'none !important';
                        element.style.visibility = 'hidden !important';
                        element.style.opacity = '0 !important';
                        element.style.pointerEvents = 'none !important';
                        element.style.position = 'absolute !important';
                        element.style.left = '-9999px !important';
                        element.style.top = '-9999px !important';
                        element.style.zIndex = '-9999 !important';
                        element.style.transform = 'scale(0) !important';
                        element.style.width = '0 !important';
                        element.style.height = '0 !important';
                        element.style.overflow = 'hidden !important';
                        console.log(`🚫 隱藏 Botpress 浮動按鈕: ${selector}`);
                    }
                });
            });
            
            // 額外檢查：查找所有可能包含 "chat" 或 "bot" 的元素
            const allElements = document.querySelectorAll('*');
            allElements.forEach(element => {
                const className = element.className || '';
                const id = element.id || '';
                
                if ((className.includes('chat') || className.includes('bot') || 
                     id.includes('chat') || id.includes('bot')) &&
                    (element.style.position === 'fixed' || element.style.position === 'absolute') &&
                    (element.style.bottom !== '' || element.style.right !== '')) {
                    
                    element.style.display = 'none !important';
                    element.style.visibility = 'hidden !important';
                    element.style.opacity = '0 !important';
                    console.log(`🚫 隱藏可疑的浮動元素: ${element.tagName}.${className}#${id}`);
                }
            });
        },
        
        // 等待 Botpress 準備就緒
        async waitForBotpressReady() {
            console.log('⏳ 等待 Botpress 準備就緒...');
            
            return new Promise((resolve) => {
                const timeout = setTimeout(() => {
                    console.log('⚠️ 等待 Botpress READY 事件超時，嘗試強制初始化...');
                    this.forceInitializeBotpress();
                    resolve(true); // 即使超時也嘗試使用
                }, 12000); // 增加到12秒超時
                
                // 檢查所有可能的 Botpress API
                const botpressAPIs = [
                    { name: 'botpressWebChat', obj: window.botpressWebChat },
                    { name: 'botpress', obj: window.botpress },
                    { name: 'botpressChat', obj: window.botpressChat },
                    { name: 'webchat', obj: window.webchat }
                ];
                
                let readyHandlerRegistered = false;
                
                for (const api of botpressAPIs) {
                    if (api.obj && typeof api.obj.onEvent === 'function') {
                        try {
                            console.log(`🔄 註冊 ${api.name} READY 事件監聽器...`);
                            
                            api.obj.onEvent((event) => {
                                console.log(`📥 ${api.name} 事件:`, event);
                                
                                // 檢查各種可能的 READY 事件類型
                                if (event.type === 'LIFECYCLE.READY' || 
                                    event.type === 'BP_WEBCHAT_READY' ||
                                    event.type === 'READY' ||
                                    event.type === 'ready' ||
                                    event.type === 'webchat:ready' ||
                                    (event.type && event.type.toLowerCase().includes('ready'))) {
                                    
                                    console.log(`✅ ${api.name} 已準備就緒！`);
                                    clearTimeout(timeout);
                                    resolve(true);
                                }
                            });
                            
                            readyHandlerRegistered = true;
                            console.log(`✅ ${api.name} READY 事件監聽器已註冊`);
                            break;
                        } catch (error) {
                            console.log(`⚠️ ${api.name} 事件監聽器註冊失敗:`, error);
                            continue;
                        }
                    }
                }
                
                if (!readyHandlerRegistered) {
                    console.log('⚠️ 無法註冊 READY 事件監聽器，檢查 Botpress 是否已載入...');
                    
                    // 如果無法註冊事件監聽器，檢查是否已經準備就緒
                    for (const api of botpressAPIs) {
                        if (api.obj && (api.obj.initialized === true || api.obj.isReady === true)) {
                            console.log(`✅ ${api.name} 已經初始化完成`);
                            clearTimeout(timeout);
                            resolve(true);
                            return;
                        }
                    }
                    
                    // 如果都沒有準備就緒，等待一段時間後再檢查
            setTimeout(() => {
                        console.log('⚠️ Botpress 可能已經準備就緒，但沒有收到 READY 事件');
                        clearTimeout(timeout);
                        resolve(true); // 即使沒有 READY 事件也嘗試使用
                    }, 2000);
                }
            });
        },
        
        // 強制初始化 Botpress
        forceInitializeBotpress() {
            console.log('🔧 強制初始化 Botpress...');
            
            const botpressAPIs = [
                { name: 'botpressWebChat', obj: window.botpressWebChat },
                { name: 'botpress', obj: window.botpress },
                { name: 'botpressChat', obj: window.botpressChat },
                { name: 'webchat', obj: window.webchat }
            ];
            
            for (const api of botpressAPIs) {
                if (api.obj) {
                    try {
                        // 設置基本配置
                        if (!api.obj.configuration && window.botpressConfig) {
                            api.obj.configuration = window.botpressConfig;
                        }
                        
                        // 標記為已初始化
                        if (api.obj.initialized !== undefined) {
                            api.obj.initialized = true;
                        }
                        
                        // 嘗試調用 open 方法
                        if (typeof api.obj.open === 'function') {
                            api.obj.open();
                        }
                        
                        // 嘗試調用 init 方法
                        if (typeof api.obj.init === 'function') {
                            try {
                                api.obj.init();
                            } catch (initError) {
                                console.log(`⚠️ ${api.name} init 失敗:`, initError);
                            }
                        }
                        
                        // 設置狀態為 ready
                        if (api.obj.state === 'initial') {
                            api.obj.state = 'ready';
                        }
                        
                        // 設置必要的 ID
                        if (!api.obj.botId && window.botpressConfig && window.botpressConfig.botId) {
                            api.obj.botId = window.botpressConfig.botId;
                        }
                        if (!api.obj.clientId && window.botpressConfig && window.botpressConfig.clientId) {
                            api.obj.clientId = window.botpressConfig.clientId;
                        }
                        
                        console.log(`✅ ${api.name} 強制初始化完成`);
                        return true;
                    } catch (error) {
                        console.log(`⚠️ ${api.name} 強制初始化失敗:`, error);
                        continue;
                    }
                }
            }
            
            return false;
        },
        
        // 找到可用的 Botpress API
        findBotpressAPI() {
            const botpressAPIs = [
                { name: 'botpressWebChat', obj: window.botpressWebChat },
                { name: 'botpress', obj: window.botpress },
                { name: 'botpressChat', obj: window.botpressChat },
                { name: 'webchat', obj: window.webchat }
            ];
            
            for (const api of botpressAPIs) {
                if (api.obj && typeof api.obj.sendEvent === 'function') {
                    console.log(`✅ 找到可用的 Botpress API: ${api.name}`);
                    console.log(`📋 ${api.name} 可用方法:`, Object.keys(api.obj));
                    return api;
                }
            }
            
            return null;
        },
        
        // 內建智能回應系統（備用方案）
        generateLocalResponse(userMessage) {
            const msg = userMessage.toLowerCase();
            
            // 1. 優先使用智能回應（基於背景知識）
            if (window.generateSmartResponse) {
                const smartResponse = window.generateSmartResponse(userMessage);
                if (smartResponse) {
                    return smartResponse;
                }
            }
            
            // 2. 檢查自訂回應配置
            const customResponses = window.customBotResponses || {};
            for (const [keyword, response] of Object.entries(customResponses)) {
                if (msg.includes(keyword.toLowerCase())) {
                    return response;
                }
            }
            
            // 關於麵包坊的回應
            if (msg.includes('麵包') || msg.includes('產品') || msg.includes('商品')) {
                const responses = [
                    '我們店裡有各種美味的麵包！蜂蜜麵包、草莓麵包、核桃麵包等等，每一款都是精心製作的喔！',
                    '推薦你試試我們的爆漿菠蘿和草莓蛋糕，這些都是店裡的招牌商品！',
                    '所有麵包都是當天新鮮出爐的，保證品質最好！'
                ];
                return responses[Math.floor(Math.random() * responses.length)];
            }
            
            // 關於遊戲玩法
            if (msg.includes('怎麼玩') || msg.includes('玩法') || msg.includes('規則')) {
                return '歡迎來到小熊麵包坊！你可以透過進貨、答題行銷、參與隨機事件來經營麵包坊。努力賺取蜂蜜幣和熊點數，讓店鋪越來越興旺吧！';
            }
            
            // 關於進貨
            if (msg.includes('進貨') || msg.includes('庫存')) {
                return '點擊下方的「進貨」按鈕就可以補充庫存了！記得根據不同區域的特性來選擇合適的商品喔！';
            }
            
            // 關於行銷題庫
            if (msg.includes('題庫') || msg.includes('答題') || msg.includes('行銷')) {
                return '透過答對行銷題目，你可以提升店鋪的知名度和客流量！多多練習，成為行銷高手吧！';
            }
            
            // 關於蜂蜜幣
            if (msg.includes('蜂蜜幣') || msg.includes('賺錢') || msg.includes('金幣')) {
                return '蜂蜜幣是店鋪的主要貨幣，可以用來進貨和升級。完成事件、答對題目都能獲得蜂蜜幣喔！';
            }
            
            // 關於熊點數
            if (msg.includes('熊點數') || msg.includes('點數')) {
                return '熊點數是特殊貨幣，可以用來抽扭蛋獲得珍貴道具！記得多多累積喔！';
            }
            
            // 關於扭蛋
            if (msg.includes('扭蛋') || msg.includes('抽獎')) {
                return '扭蛋機裡有各種好東西！使用熊點數就可以抽獎，說不定能抽到稀有道具呢！';
            }
            
            // 問候語
            if (msg.includes('你好') || msg.includes('嗨') || msg.includes('哈囉') || msg.includes('hi') || msg.includes('hello')) {
                const greetings = [
                    '你好！很高興見到你！有什麼可以幫助你的嗎？',
                    '嗨！歡迎來到小熊麵包坊！需要我的協助嗎？',
                    '哈囉！今天想了解些什麼呢？'
                ];
                return greetings[Math.floor(Math.random() * greetings.length)];
            }
            
            // 感謝
            if (msg.includes('謝謝') || msg.includes('感謝') || msg.includes('thanks')) {
                const thanks = [
                    '不客氣！很高興能幫到你！',
                    '別客氣！有任何問題隨時問我喔！',
                    '很高興能幫上忙！祝你經營順利！'
                ];
                return thanks[Math.floor(Math.random() * thanks.length)];
            }
            
            // 幫助請求
            if (msg.includes('幫助') || msg.includes('幫忙') || msg.includes('help')) {
                return '我可以回答關於麵包坊經營、遊戲玩法、商品資訊等問題。你想了解什麼呢？';
            }
            
            // 預設回應
            const defaultResponses = [
                '這是個有趣的問題！讓我想想該怎麼回答你...',
                '嗯嗯，我明白了。你可以試著從進貨或答題開始經營店鋪喔！',
                '有任何關於麵包坊經營的問題都可以問我！比如進貨、行銷、商品等等。',
                '我會盡力幫助你！如果想了解遊戲玩法，可以問我「怎麼玩」喔！',
                '很高興與你聊天！需要什麼協助嗎？'
            ];
            
            return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
        }
    };
    
    // 更新進貨按鈕狀態的函數（設為全域，方便其他地方調用）
    window.updateStockButtonState = function() {
        const stockButton = document.getElementById('navStock');
        if (stockButton) {
            // 從 localStorage 重新讀取進貨狀態，確保狀態同步
            const hasStocked = localStorage.getItem('hasStocked') === 'true';
            GameFlowManager.hasStocked = hasStocked;
            
            if (hasStocked) {
                stockButton.style.opacity = '0.5';
                stockButton.style.cursor = 'not-allowed';
                stockButton.style.filter = 'grayscale(50%)';
                console.log('📦 進貨按鈕已禁用（已進貨）');
            } else {
                stockButton.style.opacity = '1';
                stockButton.style.cursor = 'pointer';
                stockButton.style.filter = 'none';
                console.log('📦 進貨按鈕已啟用（未進貨）');
            }
        }
    };
    
    // 初始化按鈕狀態
    window.updateStockButtonState();
    
    // 底部導覽列按鈕事件
    const navButtons = document.querySelectorAll('.nav-button');
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const buttonId = this.id;
            console.log(`導覽按鈕被點擊: ${buttonId}`);
            
            // 嘗試啟動背景音樂（需要用戶互動）
            if (MusicManager.isEnabled) {
                MusicManager.play();
            }
            
            // 移除所有按鈕的active類
            navButtons.forEach(btn => btn.classList.remove('active'));
            
            // 添加active類到當前按鈕
            this.classList.add('active');
            
            // 根據按鈕ID顯示對應內容
            switch(buttonId) {
                case 'navGashapon':
                    ContentManager.showContent('gashapon');
                    break;
                case 'navStock':
                    // 檢查是否已經進貨
                    if (GameFlowManager.hasStocked) {
                        showMessage('本輪已經進貨過了！完成 7 個事件後才能再次進貨。', 'error');
                        // 移除剛才添加的 active 類，保持之前的狀態
                        this.classList.remove('active');
                        // 找回之前的 active 按鈕
                        const previousActive = document.querySelector('.nav-button.active');
                        if (!previousActive) {
                            // 如果沒有 active 的按鈕，預設顯示扭蛋機
                            document.getElementById('navGashapon')?.classList.add('active');
                        }
                        return;
                    }
                    ContentManager.showContent('stock');
                    break;
                case 'navMarketing':
                    ContentManager.showContent('marketing');
                    break;
                case 'navLeaderboard':
                    ContentManager.showContent('leaderboard');
                    break;
                case 'navChat':
                    ContentManager.showContent('chat');
                    break;
            }
        });
    });
    
    // 初始化遊戲流程管理器
    GameFlowManager.init();
    
    // 將系統暴露到全局，方便未來事件系統調用
    window.GameResources = GameResources;
    window.EventSystem = EventSystem;
    window.EventManager = EventManager;
    window.ContentManager = ContentManager;
    window.RegionCoefficientsManager = RegionCoefficientsManager;
    window.QuestionBank = QuestionBank;
    
    // 初始化虛擬玩家系統
    VirtualPlayersSystem.initialize();
    
    // 暴露全局變數
    window.GameFlowManager = GameFlowManager;
    window.EventFlowManager = EventFlowManager;
    window.MusicManager = MusicManager;
    window.SoundManager = SoundManager;
    window.CursorManager = CursorManager;
    
    // 確保在 DOM 載入後立即可用
    console.log('🎵 音效和音樂管理器已初始化');
    console.log('SoundManager:', typeof window.SoundManager);
    console.log('MusicManager:', typeof window.MusicManager);
    window.resetPlayerState = resetPlayerState;
    window.BreadProducts = BreadProducts;
    window.StockingSystem = StockingSystem;
    window.SalesCalculator = SalesCalculator;
    window.FinancialReport = FinancialReport;
    window.EconomicMultipliers = EconomicMultipliers;
    window.RegionRent = RegionRent;
    window.VirtualPlayersSystem = VirtualPlayersSystem;
    
    // 除錯工具：查看玩家狀態
    window.showPlayerStatus = function() {
        const status = {
            '🏢 地區類型': GameFlowManager.selectedRegion || '未選擇',
            '📍 行政區': GameFlowManager.selectedDistrict || '未選擇',
            '📊 地區係數': GameFlowManager.selectedCoefficient || '-',
            '🎯 當前輪次': GameFlowManager.currentRound,
            '✅ 已完成事件': `${GameFlowManager.eventsCompleted}/7`,
            '📝 當前事件': EventFlowManager.currentEvent?.title || '無',
            '🌡️ 景氣燈號': EventFlowManager.currentEvent?.economicSignal?.level || '-',
            '💰 蜂蜜幣': GameResources.resources.honey.toLocaleString(),
            '😊 顧客滿意度': GameResources.resources.bearPoints,
            '🏆 聲望': GameResources.resources.medals,
            '📦 庫存狀態': Object.entries(StockingSystem.currentInventory).map(([id, qty]) => {
                const bread = BreadProducts.getBreadById(id);
                return `${bread?.name}: ${qty}`;
            }).join(', ')
        };
        
        console.log('=== 🐻 玩家當前狀態 ===');
        Object.entries(status).forEach(([key, value]) => {
            if (typeof value === 'object') {
                console.log(`${key}:`, value);
            } else {
                console.log(`${key}: ${value}`);
            }
        });
        console.log('=====================');
        
        return status;
    };
    
     // Botpress 整合測試工具
     window.testBotpressIntegration = function() {
         console.log('🧪 === Botpress 整合測試工具 ===');
         
         // 1. 檢查 Botpress 載入狀態
         console.log('1️⃣ 檢查 Botpress 載入狀態');
         const botpressAPIs = [
             { name: 'botpressWebChat', obj: window.botpressWebChat },
             { name: 'botpress', obj: window.botpress },
             { name: 'botpressChat', obj: window.botpressChat },
             { name: 'webchat', obj: window.webchat }
         ];
         
         let foundAPI = null;
         botpressAPIs.forEach(api => {
             if (api.obj) {
                 console.log(`   ✅ ${api.name}: 已載入`);
                 console.log(`   📋 可用方法:`, Object.keys(api.obj));
                 if (!foundAPI) foundAPI = api;
             } else {
                 console.log(`   ❌ ${api.name}: 未載入`);
             }
         });
         
         // 2. 檢查默認 UI 是否被隱藏
         console.log('\n2️⃣ 檢查默認 UI 隱藏狀態');
         const uiSelectors = [
             '#botpress-webchat',
             '.botpress-webchat',
             '.bp-widget',
             '.bp-fab',
             '.webchat-container'
         ];
         
         uiSelectors.forEach(selector => {
             const elements = document.querySelectorAll(selector);
             if (elements.length > 0) {
                 console.log(`   ⚠️ 發現 ${selector}: ${elements.length} 個元素`);
                 elements.forEach((el, index) => {
                     const isHidden = el.style.display === 'none' || 
                                     el.style.visibility === 'hidden' ||
                                     window.getComputedStyle(el).display === 'none';
                     console.log(`      ${index + 1}. 隱藏狀態: ${isHidden ? '✅ 已隱藏' : '❌ 未隱藏'}`);
                 });
             } else {
                 console.log(`   ✅ ${selector}: 未找到元素`);
             }
         });
         
         // 3. 測試聊天室整合
         console.log('\n3️⃣ 測試聊天室整合');
         const chatContainer = document.querySelector('.chat-container');
         const chatContent = document.querySelector('#chatContent');
         
         if (chatContainer) {
             console.log('   ✅ 聊天室容器已找到');
         } else {
             console.log('   ⚠️ 聊天室容器未找到，嘗試其他選擇器...');
             
             // 嘗試其他可能的選擇器
             const altSelectors = [
                 '.chat-overlay',
                 '.chat-popup',
                 '#chatModal',
                 '.modal-content',
                 '.chat-interface'
             ];
             
             let foundAlt = false;
             altSelectors.forEach(selector => {
                 const element = document.querySelector(selector);
                 if (element) {
                     console.log(`   ✅ 找到替代容器: ${selector}`);
                     foundAlt = true;
                 }
             });
             
             if (!foundAlt) {
                 console.log('   ❌ 未找到任何聊天室容器');
                 console.log('   💡 請先打開聊天室頁面，然後重新運行測試');
             }
         }
         
         if (chatContent) {
             console.log('   ✅ 聊天室內容元素已找到');
             
             if (chatContent.style.display !== 'none') {
                 console.log('   ✅ 聊天室內容正在顯示');
                 
                 // 測試發送訊息功能
                 const messageInput = chatContent.querySelector('textarea');
                 if (messageInput) {
                     console.log('   ✅ 訊息輸入框已找到');
                     console.log('   💡 可以在聊天室中輸入訊息測試 Botpress 整合');
                 } else {
                     console.log('   ❌ 訊息輸入框未找到');
                 }
             } else {
                 console.log('   ⚠️ 聊天室內容未顯示，請先打開聊天室');
                 console.log('   💡 點擊導航按鈕中的「聊天室」來打開聊天室');
             }
         } else {
             console.log('   ❌ 聊天室內容元素未找到');
             console.log('   💡 請先打開聊天室頁面，然後重新運行測試');
         }
         
         // 4. 測試 API 功能
         console.log('\n4️⃣ 測試 API 功能');
         if (foundAPI) {
             try {
                 if (typeof foundAPI.obj.sendEvent === 'function') {
                     console.log(`   ✅ ${foundAPI.name} 有 sendEvent 方法`);
                 } else {
                     console.log(`   ❌ ${foundAPI.name} 沒有 sendEvent 方法`);
                 }
                 
                 if (typeof foundAPI.obj.onEvent === 'function') {
                     console.log(`   ✅ ${foundAPI.name} 有 onEvent 方法`);
                 } else {
                     console.log(`   ❌ ${foundAPI.name} 沒有 onEvent 方法`);
                 }
             } catch (error) {
                 console.log(`   ❌ 測試 API 時發生錯誤:`, error);
             }
         }
         
         console.log('\n=====================');
         console.log('💡 整合狀態總結:');
         console.log(`   🤖 Botpress API: ${foundAPI ? '✅ 可用' : '❌ 不可用'}`);
         console.log(`   🎨 默認 UI: ${uiSelectors.some(s => document.querySelector(s)) ? '⚠️ 需要檢查' : '✅ 已隱藏'}`);
         console.log(`   💬 聊天室: ${chatContainer ? '✅ 已找到' : '❌ 未找到'}`);
         console.log('💡 如果看到問題，請檢查網路連線和 Botpress 配置');
         
         return {
             api: foundAPI,
             chatContainer: !!chatContainer,
             uiHidden: !uiSelectors.some(s => document.querySelector(s))
         };
     };
     
     // 立即隱藏所有 Botpress UI
     window.hideAllBotpressUI = function() {
         // 靜默隱藏，不輸出日誌
         
         // 隱藏所有可能的 Botpress 元素
         const allSelectors = [
             '#botpress-webchat', '.botpress-webchat', '[data-botpress]',
             '.bp-widget', '#bp-widget', '.webchat-container', '#webchat-container',
             '.bp-webchat', '#bp-webchat', '.bp-fab', '#bp-fab',
             '.botpress-fab', '.webchat-fab', '.bp-floating-button', '#bp-floating-button',
             '.chat-widget', '.chat-button', '.floating-chat', '.chat-bubble', '.chat-icon',
             '[class*="chat-"]', '[id*="chat-"]', '[class*="bp-"]', '[class*="botpress"]',
             '[class*="webchat"]', '[id*="bp-"]', '[id*="botpress"]', '[id*="webchat"]',
             // 特別針對 IFRAME 元素
             'iframe[class*="bp"]', 'iframe[id*="bp"]', 'iframe[class*="botpress"]',
             'iframe[id*="botpress"]', 'iframe[class*="webchat"]', 'iframe[id*="webchat"]',
             'iframe[class*="chat"]', 'iframe[id*="chat"]', 'iframe.bpFAB',
             // 特別針對 bpFAB
             '.bpFAB', 'iframe.bpFAB', '[class*="bpFAB"]'
         ];
         
         let hiddenCount = 0;
         allSelectors.forEach(selector => {
             try {
                 const elements = document.querySelectorAll(selector);
                 elements.forEach(element => {
                     if (element) {
                         element.style.display = 'none !important';
                         element.style.visibility = 'hidden !important';
                         element.style.opacity = '0 !important';
                         element.style.pointerEvents = 'none !important';
                         element.style.position = 'absolute !important';
                         element.style.left = '-9999px !important';
                         element.style.top = '-9999px !important';
                         element.style.zIndex = '-9999 !important';
                         element.style.transform = 'scale(0) !important';
                         element.style.width = '0 !important';
                         element.style.height = '0 !important';
                         element.style.overflow = 'hidden !important';
                         element.style.border = 'none !important';
                         element.style.margin = '0 !important';
                         element.style.padding = '0 !important';
                         hiddenCount++;
                     }
                 });
             } catch (error) {
                 // 忽略選擇器錯誤
             }
         });
         
         // 特別檢查所有 IFRAME 元素
         const allIframes = document.querySelectorAll('iframe');
         allIframes.forEach(iframe => {
             const className = iframe.className || '';
             const id = iframe.id || '';
             const src = iframe.src || '';
             
             if (className.includes('bp') || className.includes('botpress') || 
                 className.includes('webchat') || className.includes('chat') ||
                 id.includes('bp') || id.includes('botpress') || 
                 id.includes('webchat') || id.includes('chat') ||
                 src.includes('botpress') || src.includes('webchat')) {
                 
                 iframe.style.display = 'none !important';
                 iframe.style.visibility = 'hidden !important';
                 iframe.style.opacity = '0 !important';
                 iframe.style.pointerEvents = 'none !important';
                 iframe.style.position = 'absolute !important';
                 iframe.style.left = '-9999px !important';
                 iframe.style.top = '-9999px !important';
                 iframe.style.zIndex = '-9999 !important';
                 iframe.style.transform = 'scale(0) !important';
                 iframe.style.width = '0 !important';
                 iframe.style.height = '0 !important';
                 iframe.style.overflow = 'hidden !important';
                 iframe.style.border = 'none !important';
                 iframe.style.margin = '0 !important';
                 iframe.style.padding = '0 !important';
                 hiddenCount++;
             }
         });
         
         // 額外檢查：查找所有浮動元素
         const allElements = document.querySelectorAll('*');
         allElements.forEach(element => {
             const className = element.className || '';
             const id = element.id || '';
             const computedStyle = window.getComputedStyle(element);
             
             if ((className.includes('chat') || className.includes('bot') || 
                  id.includes('chat') || id.includes('bot')) &&
                 (computedStyle.position === 'fixed' || computedStyle.position === 'absolute') &&
                 (computedStyle.bottom !== 'auto' || computedStyle.right !== 'auto')) {
                 
                 element.style.display = 'none !important';
                 element.style.visibility = 'hidden !important';
                 element.style.opacity = '0 !important';
                 hiddenCount++;
             }
         });
         
         // 只在有隱藏元素時才輸出日誌
         if (hiddenCount > 0) {
             console.log(`✅ 已隱藏 ${hiddenCount} 個 Botpress UI 元素`);
         }
         return hiddenCount;
     };
     
     // 立即執行隱藏
     setTimeout(() => {
         hideAllBotpressUI();
     }, 1000);
     
     // 靜默隱藏函數（不輸出日誌）
     window.silentHideBotpressUI = function() {
         // 靜默隱藏所有 Botpress 元素
         const allSelectors = [
             '#botpress-webchat', '.botpress-webchat', '[data-botpress]',
             '.bp-widget', '#bp-widget', '.webchat-container', '#webchat-container',
             '.bp-webchat', '#bp-webchat', '.bp-fab', '#bp-fab',
             '.botpress-fab', '.webchat-fab', '.bp-floating-button', '#bp-floating-button',
             '.chat-widget', '.chat-button', '.floating-chat', '.chat-bubble', '.chat-icon',
             '[class*="chat-"]', '[id*="chat-"]', '[class*="bp-"]', '[class*="botpress"]',
             '[class*="webchat"]', '[id*="bp-"]', '[id*="botpress"]', '[id*="webchat"]',
             'iframe[class*="bp"]', 'iframe[id*="bp"]', 'iframe[class*="botpress"]',
             'iframe[id*="botpress"]', 'iframe[class*="webchat"]', 'iframe[id*="webchat"]',
             'iframe[class*="chat"]', 'iframe[id*="chat"]', 'iframe.bpFAB',
             '.bpFAB', 'iframe.bpFAB', '[class*="bpFAB"]'
         ];
         
         let hiddenCount = 0;
         allSelectors.forEach(selector => {
             try {
                 const elements = document.querySelectorAll(selector);
                 elements.forEach(element => {
                     if (element) {
                         element.style.display = 'none !important';
                         element.style.visibility = 'hidden !important';
                         element.style.opacity = '0 !important';
                         element.style.pointerEvents = 'none !important';
                         element.style.position = 'absolute !important';
                         element.style.left = '-9999px !important';
                         element.style.top = '-9999px !important';
                         element.style.zIndex = '-9999 !important';
                         element.style.transform = 'scale(0) !important';
                         element.style.width = '0 !important';
                         element.style.height = '0 !important';
                         element.style.overflow = 'hidden !important';
                         element.style.border = 'none !important';
                         element.style.margin = '0 !important';
                         element.style.padding = '0 !important';
                         hiddenCount++;
                     }
                 });
             } catch (error) {
                 // 忽略選擇器錯誤
             }
         });
         
         // 特別檢查所有 IFRAME 元素
         const allIframes = document.querySelectorAll('iframe');
         allIframes.forEach(iframe => {
             const className = iframe.className || '';
             const id = iframe.id || '';
             const src = iframe.src || '';
             
             if (className.includes('bp') || className.includes('botpress') || 
                 className.includes('webchat') || className.includes('chat') ||
                 id.includes('bp') || id.includes('botpress') || 
                 id.includes('webchat') || id.includes('chat') ||
                 src.includes('botpress') || src.includes('webchat')) {
                 
                 iframe.style.display = 'none !important';
                 iframe.style.visibility = 'hidden !important';
                 iframe.style.opacity = '0 !important';
                 iframe.style.pointerEvents = 'none !important';
                 iframe.style.position = 'absolute !important';
                 iframe.style.left = '-9999px !important';
                 iframe.style.top = '-9999px !important';
                 iframe.style.zIndex = '-9999 !important';
                 iframe.style.transform = 'scale(0) !important';
                 iframe.style.width = '0 !important';
                 iframe.style.height = '0 !important';
                 iframe.style.overflow = 'hidden !important';
                 iframe.style.border = 'none !important';
                 iframe.style.margin = '0 !important';
                 iframe.style.padding = '0 !important';
                 hiddenCount++;
             }
         });
         
         return hiddenCount;
     };
     
     // 定期檢查並隱藏（防止動態載入的元素）- 使用靜默版本
     setInterval(() => {
         silentHideBotpressUI();
     }, 3000);
     
     // 激進的隱藏方法：直接移除元素
     window.forceRemoveBotpressUI = function() {
         console.log('🗑️ 強制移除所有 Botpress UI 元素...');
         
         let removedCount = 0;
         
         // 查找並移除所有 Botpress 相關元素
         const allElements = document.querySelectorAll('*');
         allElements.forEach(element => {
             const className = element.className || '';
             const id = element.id || '';
             const tagName = element.tagName.toLowerCase();
             
             // 檢查是否為 Botpress 相關元素
             if ((className.includes('bp') || className.includes('botpress') || 
                  className.includes('webchat') || className.includes('chat') ||
                  id.includes('bp') || id.includes('botpress') || 
                  id.includes('webchat') || id.includes('chat')) &&
                 (tagName === 'iframe' || tagName === 'div' || tagName === 'button')) {
                 
                 // 特別檢查位置是否在右下角
                 const computedStyle = window.getComputedStyle(element);
                 const isBottomRight = (computedStyle.position === 'fixed' || computedStyle.position === 'absolute') &&
                                      (computedStyle.bottom !== 'auto' || computedStyle.right !== 'auto');
                 
                 if (isBottomRight || tagName === 'iframe') {
                     try {
                         element.remove();
                         removedCount++;
                     } catch (error) {
                         // 忽略移除錯誤
                     }
                 }
             }
         });
         
         // 只在有移除元素時才輸出日誌
         if (removedCount > 0) {
             console.log(`✅ 已移除 ${removedCount} 個 Botpress UI 元素`);
         }
         return removedCount;
     };
     
     // 簡單初始化 Botpress（不使用 init）
     window.simpleInitBotpress = function() {
         console.log('🔧 簡單初始化 Botpress（跳過 init）...');
         
         const botpressAPI = window.botpress;
         if (!botpressAPI) {
             console.log('❌ Botpress API 未找到');
             return false;
         }
         
         try {
             // 直接設置狀態和 ID
             botpressAPI.state = 'ready';
             botpressAPI.initialized = true;
             botpressAPI.botId = 'default-bot';
             botpressAPI.clientId = 'webchat-client';
             
             console.log('✅ 狀態和 ID 已設置');
             console.log('🎉 Botpress 簡單初始化完成！');
             return true;
             
         } catch (error) {
             console.log('❌ 簡單初始化失敗:', error);
             return false;
         }
     };
     
     // 手動初始化 Botpress
     window.initializeBotpress = function() {
         console.log('🔧 手動初始化 Botpress...');
         
         const botpressAPI = window.botpress;
         if (!botpressAPI) {
             console.log('❌ Botpress API 未找到');
             return false;
         }
         
         try {
             // 設置必要的 ID（不調用 init）
             if (window.botpressConfig) {
                 botpressAPI.botId = window.botpressConfig.botId || 'default-bot';
                 botpressAPI.clientId = window.botpressConfig.clientId || 'webchat-client';
                 console.log('✅ ID 已設置');
             }
             
             // 設置狀態為 ready（跳過 init）
             botpressAPI.state = 'ready';
             botpressAPI.initialized = true;
             console.log('✅ 狀態已設置為 ready');
             
             // 嘗試打開
             if (typeof botpressAPI.open === 'function') {
                 botpressAPI.open();
                 console.log('✅ open() 已調用');
             }
             
             console.log('🎉 Botpress 手動初始化完成！');
             return true;
             
         } catch (error) {
             console.log('❌ 手動初始化失敗:', error);
             return false;
         }
     };
     
     // 自訂機器人回應管理
     window.customBotResponses = window.customBotResponses || {};
     
     // 機器人背景知識庫
     window.botKnowledgeBase = window.botKnowledgeBase || [];
     window.botResponseTemplates = window.botResponseTemplates || {};
     
     // 載入知識庫文件
     window.loadBotKnowledge = async function() {
         try {
             console.log('📚 載入機器人知識庫...');
             const response = await fetch('data/bot-knowledge.json');
             const data = await response.json();
             
             // 載入知識庫
             window.botKnowledgeBase = data.knowledgeBase || [];
             window.botResponseTemplates = data.responses || {};
             
             console.log(`✅ 已載入 ${window.botKnowledgeBase.length} 條背景知識`);
             console.log(`✅ 已載入 ${Object.keys(window.botResponseTemplates).length} 個回應模板`);
             
             return true;
         } catch (error) {
             console.log('❌ 載入知識庫失敗:', error);
             return false;
         }
     };
     
     // 重新載入知識庫
     window.reloadBotKnowledge = async function() {
         console.log('🔄 重新載入機器人知識庫...');
         return await loadBotKnowledge();
     };
     
     // 檢查知識庫狀態
     window.checkKnowledgeStatus = function() {
         console.log('📚 === 知識庫狀態檢查 ===');
         console.log(`📖 背景知識條目: ${window.botKnowledgeBase.length}`);
         console.log(`📝 回應模板類別: ${Object.keys(window.botResponseTemplates).length}`);
         
         if (window.botKnowledgeBase.length > 0) {
             console.log('📚 背景知識預覽:');
             window.botKnowledgeBase.slice(0, 3).forEach((knowledge, index) => {
                 console.log(`  ${index + 1}. ${knowledge.substring(0, 50)}...`);
             });
         }
         
         if (Object.keys(window.botResponseTemplates).length > 0) {
             console.log('📝 回應模板預覽:');
             Object.entries(window.botResponseTemplates).forEach(([type, responses]) => {
                 console.log(`  ${type}: ${responses.length} 個回應`);
             });
         }
         
         console.log('=====================');
         return {
             knowledgeCount: window.botKnowledgeBase.length,
             templateCount: Object.keys(window.botResponseTemplates).length
         };
    };
    
    // 測試行銷回應
    window.testMarketingResponses = function() {
        console.log('🧪 === 測試行銷回應 ===');
        const testQuestions = [
            '行銷4P是什麼？',
            '如何做市場區隔？',
            '價格策略有哪些？',
            '推廣策略怎麼做？',
            '競爭策略如何制定？',
            '如何提升顧客體驗？',
            '品牌管理怎麼做？',
            '數位行銷策略？',
            '危機管理如何處理？',
            '產品創新策略？',
            '行銷分析指標？'
        ];
        
        testQuestions.forEach(question => {
            console.log(`\n❓ 問題: ${question}`);
            const response = window.generateSmartResponse(question);
            console.log(`✅ 回應: ${response || '無回應'}`);
        });
        
        console.log('\n=====================');
    };
    
    // 詳細調試行銷回應
    window.debugMarketingResponse = function(question) {
        console.log('🔍 === 詳細調試行銷回應 ===');
        console.log(`❓ 問題: ${question}`);
        
        const msg = question.toLowerCase();
        console.log(`📝 轉換後訊息: "${msg}"`);
        
        const templates = window.botResponseTemplates || {};
        console.log(`📚 可用模板類別: ${Object.keys(templates).join(', ')}`);
        
        // 檢查4P關鍵字
        if (msg.includes('4p') || msg.includes('四p') || msg.includes('行銷4p') || msg.includes('行銷四p')) {
            console.log('✅ 匹配到4P關鍵字');
            const fourP = templates['4p'] || [];
            console.log(`📋 4P模板數量: ${fourP.length}`);
            if (fourP.length > 0) {
                const response = fourP[Math.floor(Math.random() * fourP.length)];
                console.log(`🎯 4P回應: ${response}`);
                return response;
            }
        }
        
        // 檢查市場區隔關鍵字
        if (msg.includes('市場區隔') || msg.includes('區隔') || msg.includes('分群') || msg.includes('客群')) {
            console.log('✅ 匹配到市場區隔關鍵字');
            const segmentation = templates.segmentation || [];
            console.log(`📋 市場區隔模板數量: ${segmentation.length}`);
            if (segmentation.length > 0) {
                const response = segmentation[Math.floor(Math.random() * segmentation.length)];
                console.log(`🎯 市場區隔回應: ${response}`);
                return response;
            }
        }
        
        console.log('❌ 沒有匹配到特定關鍵字');
        return null;
    };
    
    // 自動載入知識庫
     loadBotKnowledge();
     
     // 聊天記錄管理
     window.chatHistory = window.chatHistory || [];
     window.chatHistoryKey = 'bearBakery_chatHistory';
     
     // 保存聊天記錄到本地存儲
     window.saveChatHistory = function() {
         try {
             localStorage.setItem(window.chatHistoryKey, JSON.stringify(window.chatHistory));
             console.log(`💾 已保存 ${window.chatHistory.length} 條聊天記錄`);
             return true;
         } catch (error) {
             console.log('❌ 保存聊天記錄失敗:', error);
             return false;
         }
     };
     
     // 載入聊天記錄
     window.loadChatHistory = function() {
         try {
             const saved = localStorage.getItem(window.chatHistoryKey);
             if (saved) {
                 window.chatHistory = JSON.parse(saved);
                 console.log(`📖 已載入 ${window.chatHistory.length} 條聊天記錄`);
                 return true;
             }
         } catch (error) {
             console.log('❌ 載入聊天記錄失敗:', error);
         }
         return false;
     };
     
     // 添加聊天記錄
     window.addChatMessage = function(type, message, timestamp) {
         const chatMessage = {
             type: type, // 'user' 或 'bot'
             message: message,
             timestamp: timestamp || new Date().toISOString(),
             id: Date.now() + Math.random()
         };
         
         window.chatHistory.push(chatMessage);
         
         // 限制聊天記錄數量（最多保存100條）
         if (window.chatHistory.length > 100) {
             window.chatHistory = window.chatHistory.slice(-100);
         }
         
         // 自動保存
         window.saveChatHistory();
         
         return chatMessage;
     };
     
     // 清空聊天記錄
     window.clearChatHistory = function() {
         window.chatHistory = [];
         localStorage.removeItem(window.chatHistoryKey);
         console.log('🗑️ 已清空聊天記錄');
         return true;
     };
     
     // 顯示聊天記錄
     window.showChatHistory = function() {
         console.log('📜 === 聊天記錄 ===');
         if (window.chatHistory.length === 0) {
             console.log('📝 目前沒有聊天記錄');
         } else {
             window.chatHistory.forEach((msg, index) => {
                 const time = new Date(msg.timestamp).toLocaleTimeString();
                 const type = msg.type === 'user' ? '👤 用戶' : '🐻 熊熊';
                 console.log(`${index + 1}. [${time}] ${type}: ${msg.message}`);
             });
         }
         console.log('==================');
         return window.chatHistory;
     };
     
     // 自動載入聊天記錄
     loadChatHistory();
     
     // 添加自訂回應
     window.addCustomResponse = function(keyword, response) {
         window.customBotResponses[keyword] = response;
         console.log(`✅ 已添加自訂回應: "${keyword}" -> "${response}"`);
         console.log('📝 當前自訂回應:', window.customBotResponses);
         return true;
     };
     
     // 移除自訂回應
     window.removeCustomResponse = function(keyword) {
         if (window.customBotResponses[keyword]) {
             delete window.customBotResponses[keyword];
             console.log(`🗑️ 已移除自訂回應: "${keyword}"`);
             console.log('📝 當前自訂回應:', window.customBotResponses);
             return true;
         } else {
             console.log(`❌ 找不到自訂回應: "${keyword}"`);
             return false;
         }
     };
     
     // 查看所有自訂回應
     window.showCustomResponses = function() {
         console.log('📝 === 自訂機器人回應 ===');
         if (Object.keys(window.customBotResponses).length === 0) {
             console.log('📭 目前沒有自訂回應');
             console.log('💡 使用 addCustomResponse("關鍵字", "回應內容") 來添加');
         } else {
             Object.entries(window.customBotResponses).forEach(([keyword, response], index) => {
                 console.log(`${index + 1}. "${keyword}" -> "${response}"`);
             });
         }
         console.log('=====================');
         return window.customBotResponses;
     };
     
     // 清空所有自訂回應
     window.clearCustomResponses = function() {
         const count = Object.keys(window.customBotResponses).length;
         window.customBotResponses = {};
         console.log(`🗑️ 已清空 ${count} 個自訂回應`);
         return true;
     };
     
     // 測試自訂回應
     window.testCustomResponse = function(message) {
         console.log(`🧪 測試訊息: "${message}"`);
         
         const msg = message.toLowerCase();
         const customResponses = window.customBotResponses || {};
         
         for (const [keyword, response] of Object.entries(customResponses)) {
             if (msg.includes(keyword.toLowerCase())) {
                 console.log(`✅ 匹配到關鍵字: "${keyword}"`);
                 console.log(`🤖 回應: "${response}"`);
                 return response;
             }
         }
         
         console.log('❌ 沒有匹配的自訂回應');
         return null;
     };
     
     // 添加背景知識
     window.addBotKnowledge = function(knowledge) {
         window.botKnowledgeBase.push(knowledge);
         console.log(`✅ 已添加背景知識: "${knowledge}"`);
         console.log('📚 當前知識庫:', window.botKnowledgeBase);
         return true;
     };
     
     // 查看所有背景知識
     window.showBotKnowledge = function() {
         console.log('📚 === 機器人背景知識庫 ===');
         if (window.botKnowledgeBase.length === 0) {
             console.log('📭 目前沒有背景知識');
             console.log('💡 使用 addBotKnowledge("知識內容") 來添加');
         } else {
             window.botKnowledgeBase.forEach((knowledge, index) => {
                 console.log(`${index + 1}. ${knowledge}`);
             });
         }
         console.log('=====================');
         return window.botKnowledgeBase;
     };
     
     // 清空背景知識庫
     window.clearBotKnowledge = function() {
         const count = window.botKnowledgeBase.length;
         window.botKnowledgeBase = [];
         console.log(`🗑️ 已清空 ${count} 條背景知識`);
         return true;
     };
     
     // 智能回應生成（基於背景知識）
     window.generateSmartResponse = function(userMessage) {
         console.log(`🧠 智能分析訊息: "${userMessage}"`);
         
         const msg = userMessage.toLowerCase();
         const knowledgeBase = window.botKnowledgeBase || [];
         const templates = window.botResponseTemplates || {};
         
         console.log(`📚 知識庫條目數量: ${knowledgeBase.length}`);
         console.log(`📝 回應模板數量: ${Object.keys(templates).length}`);
         
         // 直接使用回應模板（優先）- 按優先級排序
         if (msg.includes('你好') || msg.includes('嗨') || msg.includes('歡迎')) {
             const greetings = templates.greeting || [];
             if (greetings.length > 0) {
                 const response = greetings[Math.floor(Math.random() * greetings.length)];
                 console.log(`✅ 使用問候模板: "${response}"`);
                 return response;
             }
         } else if (msg.includes('價格') || msg.includes('多少錢') || msg.includes('費用') || msg.includes('元') || msg.includes('錢')) {
             const prices = templates.price || [];
             if (prices.length > 0) {
                 const response = prices[Math.floor(Math.random() * prices.length)];
                 console.log(`✅ 使用價格模板: "${response}"`);
                 return response;
             }
         } else if (msg.includes('時間') || msg.includes('什麼時候') || msg.includes('營業') || msg.includes('開門') || msg.includes('關門')) {
             const hours = templates.hours || [];
             if (hours.length > 0) {
                 const response = hours[Math.floor(Math.random() * hours.length)];
                 console.log(`✅ 使用時間模板: "${response}"`);
                 return response;
             }
         } else if (msg.includes('外送') || msg.includes('配送') || msg.includes('送貨') || msg.includes('外賣')) {
             const delivery = templates.delivery || [];
             if (delivery.length > 0) {
                 const response = delivery[Math.floor(Math.random() * delivery.length)];
                 console.log(`✅ 使用外送模板: "${response}"`);
                 return response;
             }
         } else if (msg.includes('地址') || msg.includes('位置') || msg.includes('在哪裡') || msg.includes('地點')) {
             const location = templates.location || [];
             if (location.length > 0) {
                 const response = location[Math.floor(Math.random() * location.length)];
                 console.log(`✅ 使用位置模板: "${response}"`);
                 return response;
             }
         } else if (msg.includes('景氣燈號') || msg.includes('景氣') || msg.includes('燈號')) {
             // 檢查是否詢問特定顏色的燈號
             if (msg.includes('綠燈') || msg.includes('綠色')) {
                 const trafficLight = templates.traffic_light || [];
                 const greenResponses = trafficLight.filter(response => response.includes('綠燈'));
                 if (greenResponses.length > 0) {
                     const response = greenResponses[Math.floor(Math.random() * greenResponses.length)];
                     console.log(`✅ 使用綠燈模板: "${response}"`);
                     return response;
                 }
             } else if (msg.includes('紅燈') || msg.includes('紅色')) {
                 const trafficLight = templates.traffic_light || [];
                 const redResponses = trafficLight.filter(response => response.includes('紅燈'));
                 if (redResponses.length > 0) {
                     const response = redResponses[Math.floor(Math.random() * redResponses.length)];
                     console.log(`✅ 使用紅燈模板: "${response}"`);
                     return response;
                 }
             } else if (msg.includes('藍燈') || msg.includes('藍色')) {
                 const trafficLight = templates.traffic_light || [];
                 const blueResponses = trafficLight.filter(response => response.includes('藍燈'));
                 if (blueResponses.length > 0) {
                     const response = blueResponses[Math.floor(Math.random() * blueResponses.length)];
                     console.log(`✅ 使用藍燈模板: "${response}"`);
                     return response;
                 }
             }
             
             // 一般景氣燈號問題
             const economy = templates.economy || [];
             if (economy.length > 0) {
                 const response = economy[Math.floor(Math.random() * economy.length)];
                 console.log(`✅ 使用景氣燈號模板: "${response}"`);
                 return response;
             }
        } else if (msg.includes('遊戲') || msg.includes('怎麼玩') || msg.includes('玩法') || msg.includes('經營') || msg.includes('步驟') || msg.includes('進貨') || msg.includes('事件') || msg.includes('收益') || msg.includes('聲望') || msg.includes('滿意度') || msg.includes('報表') || msg.includes('營收') || msg.includes('成本') || msg.includes('淨利潤')) {
            const game = templates.game || [];
            if (game.length > 0) {
                const response = game[Math.floor(Math.random() * game.length)];
                console.log(`✅ 使用遊戲模板: "${response}"`);
                return response;
            }
        } else if (msg.includes('心情') || msg.includes('難過') || msg.includes('煩惱') || msg.includes('安慰') || msg.includes('不開心')) {
             const comfort = templates.comfort || [];
             if (comfort.length > 0) {
                 const response = comfort[Math.floor(Math.random() * comfort.length)];
                 console.log(`✅ 使用安慰模板: "${response}"`);
                 return response;
             }
        } else if (msg.includes('天氣') || msg.includes('下雨') || msg.includes('晴天') || msg.includes('陰天')) {
            const weather = templates.weather || [];
            if (weather.length > 0) {
                const response = weather[Math.floor(Math.random() * weather.length)];
                console.log(`✅ 使用天氣模板: "${response}"`);
                return response;
            }
        } else if (msg.includes('4p') || msg.includes('四p') || msg.includes('行銷4p') || msg.includes('行銷四p')) {
            const fourP = templates['4p'] || [];
            if (fourP.length > 0) {
                const response = fourP[Math.floor(Math.random() * fourP.length)];
                console.log(`✅ 使用4P模板: "${response}"`);
                return response;
            }
        } else if (msg.includes('市場區隔') || msg.includes('區隔') || msg.includes('分群') || msg.includes('客群')) {
            const segmentation = templates.segmentation || [];
            if (segmentation.length > 0) {
                const response = segmentation[Math.floor(Math.random() * segmentation.length)];
                console.log(`✅ 使用市場區隔模板: "${response}"`);
                return response;
            }
        } else if (msg.includes('價格策略') || msg.includes('定價') || msg.includes('價格戰') || msg.includes('心理定價') || msg.includes('價值定價')) {
            const pricing = templates.pricing || [];
            if (pricing.length > 0) {
                const response = pricing[Math.floor(Math.random() * pricing.length)];
                console.log(`✅ 使用價格策略模板: "${response}"`);
                return response;
            }
        } else if (msg.includes('推廣策略') || msg.includes('促銷') || msg.includes('廣告') || msg.includes('宣傳') || msg.includes('行銷活動')) {
            const promotion = templates.promotion || [];
            if (promotion.length > 0) {
                const response = promotion[Math.floor(Math.random() * promotion.length)];
                console.log(`✅ 使用推廣策略模板: "${response}"`);
                return response;
            }
        } else if (msg.includes('競爭') || msg.includes('競爭對手') || msg.includes('差異化') || msg.includes('定位')) {
            const competition = templates.competition || [];
            if (competition.length > 0) {
                const response = competition[Math.floor(Math.random() * competition.length)];
                console.log(`✅ 使用競爭策略模板: "${response}"`);
                return response;
            }
        } else if (msg.includes('顧客體驗') || msg.includes('顧客滿意') || msg.includes('顧客回饋') || msg.includes('顧客忠誠') || msg.includes('顧客服務')) {
            const customer = templates.customer || [];
            if (customer.length > 0) {
                const response = customer[Math.floor(Math.random() * customer.length)];
                console.log(`✅ 使用顧客管理模板: "${response}"`);
                return response;
            }
        } else if (msg.includes('品牌') || msg.includes('品牌管理') || msg.includes('品牌定位') || msg.includes('品牌形象') || msg.includes('品牌資產')) {
            const brand = templates.brand || [];
            if (brand.length > 0) {
                const response = brand[Math.floor(Math.random() * brand.length)];
                console.log(`✅ 使用品牌管理模板: "${response}"`);
                return response;
            }
        } else if (msg.includes('數位行銷') || msg.includes('數位') || msg.includes('數位化') || msg.includes('電商') || msg.includes('線上') || msg.includes('網路') || msg.includes('社群') || msg.includes('內容行銷')) {
            const digital = templates.digital || [];
            if (digital.length > 0) {
                const response = digital[Math.floor(Math.random() * digital.length)];
                console.log(`✅ 使用數位行銷模板: "${response}"`);
                return response;
            }
        } else if (msg.includes('危機管理') || msg.includes('危機') || msg.includes('危機處理') || msg.includes('危機溝通') || msg.includes('危機預防')) {
            const crisis = templates.crisis || [];
            if (crisis.length > 0) {
                const response = crisis[Math.floor(Math.random() * crisis.length)];
                console.log(`✅ 使用危機管理模板: "${response}"`);
                return response;
            }
        } else if (msg.includes('創新') || msg.includes('產品創新') || msg.includes('服務創新') || msg.includes('商業模式') || msg.includes('新產品') || msg.includes('研發')) {
            const innovation = templates.innovation || [];
            if (innovation.length > 0) {
                const response = innovation[Math.floor(Math.random() * innovation.length)];
                console.log(`✅ 使用創新管理模板: "${response}"`);
                return response;
            }
        } else if (msg.includes('分析') || msg.includes('數據分析') || msg.includes('行銷分析') || msg.includes('顧客分析') || msg.includes('競爭分析') || msg.includes('roi') || msg.includes('kpi') || msg.includes('指標')) {
            const analytics = templates.analytics || [];
            if (analytics.length > 0) {
                const response = analytics[Math.floor(Math.random() * analytics.length)];
                console.log(`✅ 使用行銷分析模板: "${response}"`);
                return response;
            }
        } else if (msg.includes('行銷') || msg.includes('市場') || msg.includes('品牌') || msg.includes('口碑') || msg.includes('社群') || msg.includes('危機管理') || msg.includes('接觸點') || msg.includes('關係行銷') || msg.includes('多通路') || msg.includes('回饋')) {
            const marketing = templates.marketing || [];
            if (marketing.length > 0) {
                const response = marketing[Math.floor(Math.random() * marketing.length)];
                console.log(`✅ 使用行銷模板: "${response}"`);
                return response;
            }
        } else if (msg.includes('策略') || msg.includes('規劃') || msg.includes('方案') || msg.includes('方法') || msg.includes('技巧') || msg.includes('建議') || msg.includes('如何') || msg.includes('怎麼做') || msg.includes('經營策略') || msg.includes('商業策略') || msg.includes('行銷策略') || msg.includes('定價策略') || msg.includes('通路策略') || msg.includes('推廣策略') || msg.includes('競爭策略') || msg.includes('差異化策略') || msg.includes('定位策略') || msg.includes('品牌策略') || msg.includes('顧客策略') || msg.includes('市場策略')) {
            const strategy = templates.strategy || [];
            if (strategy.length > 0) {
                const response = strategy[Math.floor(Math.random() * strategy.length)];
                console.log(`✅ 使用策略模板: "${response}"`);
                return response;
            }
        } else if (msg.includes('經營') || msg.includes('管理') || msg.includes('營運') || msg.includes('運營') || msg.includes('生意') || msg.includes('商業') || msg.includes('企業') || msg.includes('公司') || msg.includes('店鋪') || msg.includes('店面') || msg.includes('開店') || msg.includes('創業') || msg.includes('投資') || msg.includes('利潤') || msg.includes('成本') || msg.includes('收益') || msg.includes('營收') || msg.includes('財務') || msg.includes('報表') || msg.includes('分析') || msg.includes('改善') || msg.includes('優化') || msg.includes('效率') || msg.includes('品質') || msg.includes('服務') || msg.includes('滿意度') || msg.includes('忠誠度') || msg.includes('回頭客') || msg.includes('新客') || msg.includes('客群') || msg.includes('目標客群') || msg.includes('市場分析') || msg.includes('競爭分析') || msg.includes('swot') || msg.includes('優勢') || msg.includes('劣勢') || msg.includes('機會') || msg.includes('威脅')) {
            const business = templates.business || [];
            if (business.length > 0) {
                const response = business[Math.floor(Math.random() * business.length)];
                console.log(`✅ 使用經營模板: "${response}"`);
                return response;
            }
        } else if (msg.includes('麵包') || msg.includes('產品') || msg.includes('商品') || msg.includes('什麼') || msg.includes('種類')) {
            const products = templates.products || [];
            if (products.length > 0) {
                const response = products[Math.floor(Math.random() * products.length)];
                console.log(`✅ 使用產品模板: "${response}"`);
                return response;
            }
        }
         
         // 如果沒有匹配的模板，嘗試使用背景知識
         const keywords = msg.split(' ').filter(word => word.length > 1);
         const relevantKnowledge = [];
         
         knowledgeBase.forEach(knowledge => {
             const knowledgeLower = knowledge.toLowerCase();
             keywords.forEach(keyword => {
                 if (knowledgeLower.includes(keyword)) {
                     relevantKnowledge.push(knowledge);
                 }
             });
         });
         
         if (relevantKnowledge.length > 0) {
             const defaults = templates.default || [];
             if (defaults.length > 0) {
                 const response = defaults[Math.floor(Math.random() * defaults.length)];
                 console.log(`✅ 使用預設模板: "${response}"`);
                 return response;
             } else {
                 const response = `根據我的了解，${relevantKnowledge[0]}。有什麼其他想問的嗎？`;
                 console.log(`✅ 基於背景知識生成回應: "${response}"`);
                 return response;
             }
         }
         
         console.log('❌ 沒有找到相關的背景知識或模板');
         return null;
     };
     
     
     // 基於知識生成回應
     function generateResponseFromKnowledge(userMessage, knowledge) {
         const msg = userMessage.toLowerCase();
         const templates = window.botResponseTemplates || {};
         
         // 使用回應模板
         if (msg.includes('你好') || msg.includes('嗨') || msg.includes('歡迎')) {
             const greetings = templates.greeting || [];
             return greetings[Math.floor(Math.random() * greetings.length)] || `你好！歡迎來到小熊哥麵包坊！`;
         } else if (msg.includes('麵包') || msg.includes('產品') || msg.includes('商品') || msg.includes('什麼')) {
             const products = templates.products || [];
             return products[Math.floor(Math.random() * products.length)] || `我們店裡有各種美味的麵包！`;
         } else if (msg.includes('價格') || msg.includes('多少錢') || msg.includes('費用')) {
             const prices = templates.price || [];
             return prices[Math.floor(Math.random() * prices.length)] || `我們的麵包價格都很合理！`;
         } else if (msg.includes('時間') || msg.includes('什麼時候') || msg.includes('營業')) {
             const hours = templates.hours || [];
             return hours[Math.floor(Math.random() * hours.length)] || `我們每天上午8點到晚上8點營業！`;
         } else if (msg.includes('外送') || msg.includes('配送') || msg.includes('送貨')) {
             const delivery = templates.delivery || [];
             return delivery[Math.floor(Math.random() * delivery.length)] || `我們提供外送服務！`;
         } else if (msg.includes('地址') || msg.includes('位置') || msg.includes('在哪裡')) {
             const location = templates.location || [];
             return location[Math.floor(Math.random() * location.length)] || `我們位於住宅區中心！`;
         } else {
             // 使用背景知識生成回應
             const defaults = templates.default || [];
             if (defaults.length > 0) {
                 return defaults[Math.floor(Math.random() * defaults.length)];
             } else {
                 return `根據我的了解，${knowledge[0]}。有什麼其他想問的嗎？`;
             }
         }
     };
     
     // 檢查 Botpress 狀態
     window.checkBotpressState = function() {
         console.log('🔍 === Botpress 狀態檢查 ===');
         
         const botpressAPI = window.botpress;
         if (!botpressAPI) {
             console.log('❌ Botpress API 未找到');
             return;
         }
         
         console.log('📊 Botpress 狀態:');
         console.log('  - initialized:', botpressAPI.initialized);
         console.log('  - version:', botpressAPI.version);
         console.log('  - botId:', botpressAPI.botId);
         console.log('  - clientId:', botpressAPI.clientId);
         console.log('  - conversationId:', botpressAPI.conversationId);
         
         if (botpressAPI.state) {
             console.log('📝 Botpress 狀態對象:');
             console.log('  - state:', botpressAPI.state);
             
             if (botpressAPI.state.messages) {
                 console.log('💬 訊息歷史:');
                 botpressAPI.state.messages.forEach((msg, index) => {
                     console.log(`  ${index + 1}. [${msg.direction}] ${msg.type}: ${msg.text || msg.payload || 'N/A'}`);
                 });
             }
         }
         
         if (botpressAPI.eventEmitter) {
             console.log('🎧 事件發射器:', botpressAPI.eventEmitter);
             console.log('  - 監聽器數量:', botpressAPI.eventEmitter.listenerCount ? 
                 Object.keys(botpressAPI.eventEmitter._events || {}).length : '未知');
         }
         
         console.log('=====================');
         return botpressAPI;
     };
     
     // 快速打開聊天室進行測試
     window.openChatForTest = function() {
         console.log('🚀 快速打開聊天室進行測試...');
         
         // 檢查是否有 ContentManager
         if (window.ContentManager) {
             try {
                 // 直接調用顯示聊天內容
                 ContentManager.showChatContent();
                 console.log('✅ 聊天室已打開');
                 
                 // 等待一下讓聊天室完全載入
                 setTimeout(() => {
                     console.log('💡 現在可以運行 testBotpressIntegration() 來測試整合');
                     
                     // 自動運行整合測試
                     setTimeout(() => {
                         testBotpressIntegration();
                     }, 1000);
                 }, 500);
                 
             } catch (error) {
                 console.log('❌ 打開聊天室失敗:', error);
                 console.log('💡 請手動點擊導航按鈕中的「聊天室」');
             }
         } else {
             console.log('❌ ContentManager 未找到');
             console.log('💡 請手動點擊導航按鈕中的「聊天室」');
         }
     };
     
     // Botpress 測試工具
     window.testBotpress = function() {
         console.log('🧪 === Botpress 測試工具 ===');
         
         // 1. 檢查 Botpress 載入狀態
         console.log('1️⃣ 檢查 Botpress 載入狀態');
         const botpressAPIs = [
             { name: 'botpressWebChat', obj: window.botpressWebChat },
             { name: 'botpress', obj: window.botpress },
             { name: 'botpressChat', obj: window.botpressChat },
             { name: 'webchat', obj: window.webchat }
         ];
         
         let foundAPI = null;
         botpressAPIs.forEach(api => {
             if (api.obj) {
                 console.log(`   ✅ ${api.name}: 已載入`);
                 console.log(`   📋 可用方法:`, Object.keys(api.obj));
                 if (!foundAPI) foundAPI = api;
             } else {
                 console.log(`   ❌ ${api.name}: 未載入`);
             }
         });
         
         // 2. 檢查配置
         console.log('\n2️⃣ 檢查配置');
         console.log('   window.botpressConfig:', window.botpressConfig);
         
         // 3. 測試初始化
         console.log('\n3️⃣ 測試初始化');
         if (foundAPI) {
             try {
                 if (typeof foundAPI.obj.init === 'function') {
                     foundAPI.obj.init();
                     console.log(`   ✅ ${foundAPI.name} 初始化成功`);
                 } else {
                     console.log(`   ⚠️ ${foundAPI.name} 沒有 init 方法`);
                 }
             } catch (error) {
                 console.log(`   ❌ ${foundAPI.name} 初始化失敗:`, error);
             }
         }
         
         // 4. 測試發送訊息
         console.log('\n4️⃣ 測試發送訊息');
         if (foundAPI && typeof foundAPI.obj.sendEvent === 'function') {
             try {
                 foundAPI.obj.sendEvent({
                     type: 'text',
                     text: '測試訊息'
                 });
                 console.log(`   ✅ ${foundAPI.name} 發送測試訊息成功`);
             } catch (error) {
                 console.log(`   ❌ ${foundAPI.name} 發送失敗:`, error);
             }
         } else {
             console.log('   ❌ 沒有可用的 sendEvent 方法');
         }
         
         // 5. 測試事件監聽
         console.log('\n5️⃣ 測試事件監聽');
         if (foundAPI && typeof foundAPI.obj.onEvent === 'function') {
             try {
                 foundAPI.obj.onEvent((event) => {
                     console.log(`   📥 收到事件:`, event);
                 });
                 console.log(`   ✅ ${foundAPI.name} 事件監聽器註冊成功`);
             } catch (error) {
                 console.log(`   ❌ ${foundAPI.name} 事件監聽器註冊失敗:`, error);
             }
         } else {
             console.log('   ❌ 沒有可用的 onEvent 方法');
         }
         
         console.log('\n=====================');
         console.log('💡 如果看到問題，請檢查網路連線和 Botpress 配置');
         return foundAPI;
     };
     
     // 除錯工具：查看虛擬玩家狀態
     window.showVirtualPlayers = function() {
        console.log('=== 🤖 虛擬玩家狀態 ===');
        VirtualPlayersSystem.players.forEach((player, index) => {
            console.log(`\n【${index + 1}】 ${player.avatar} ${player.name}`);
            console.log(`   性格: ${player.personality} | 技能: ${(player.skillLevel * 100).toFixed(0)}%`);
            console.log(`   💰 蜂蜜幣: ${player.resources.honey.toLocaleString()}`);
            console.log(`   😊 滿意度: ${player.resources.satisfaction.toLocaleString()}`);
            console.log(`   🏆 聲望: ${player.resources.reputation.toLocaleString()}`);
            console.log(`   🏢 地區: ${player.gameProgress.selectedRegion || '未選擇'} - ${player.gameProgress.selectedDistrict || '-'}`);
            console.log(`   📦 庫存: ${Object.keys(player.inventory || {}).length} 種麵包`);
            console.log(`   📊 進度: 第${player.gameProgress.currentRound}輪 | 完成${player.gameProgress.eventsCompleted}事件`);
            console.log(`   💸 總支出: ${player.stats.totalSpending.toLocaleString()} (租金${player.stats.totalRent.toLocaleString()} + 進貨${player.stats.totalStockCost.toLocaleString()})`);
            console.log(`   💵 總收入: ${player.stats.totalEarnings.toLocaleString()}`);
            console.log(`   ✅ 正確: ${player.stats.correctAnswers} | ❌ 錯誤: ${player.stats.wrongAnswers}`);
        });
        console.log('\n=====================');
        return VirtualPlayersSystem.players;
    };
    
    // 診斷工具：檢查排行榜系統
    window.diagnoseLeaderboard = function() {
        console.log('=== 🔍 排行榜系統診斷 ===\n');
        
        // 1. 檢查虛擬玩家系統
        console.log('1️⃣ 虛擬玩家系統');
        if (window.VirtualPlayersSystem) {
            console.log('   ✅ 已初始化');
            console.log(`   📊 玩家數量: ${VirtualPlayersSystem.players.length}`);
            if (VirtualPlayersSystem.players.length > 0) {
                console.log('   🏆 前三名:');
                VirtualPlayersSystem.getLeaderboard('honey').slice(0, 3).forEach((p, i) => {
                    console.log(`      ${i+1}. ${p.name}: 💰${p.resources.honey.toLocaleString()}`);
                });
            }
        } else {
            console.log('   ❌ 未初始化');
        }
        
        // 2. 檢查真人玩家資源
        console.log('\n2️⃣ 真人玩家資源');
        console.log(`   💰 蜂蜜幣: ${GameResources.resources.honey.toLocaleString()}`);
        console.log(`   😊 滿意度: ${GameResources.resources.bearPoints}`);
        console.log(`   🏆 聲望: ${GameResources.resources.medals}`);
        
        // 3. 檢查排行榜模態框
        console.log('\n3️⃣ 排行榜模態框');
        const modal = document.getElementById('leaderboardModal');
        if (modal) {
            console.log('   ✅ 已找到');
            console.log(`   👁️ 顯示狀態: ${modal.style.display}`);
        } else {
            console.log('   ❌ 未找到');
        }
        
        // 4. 測試排行榜生成
        console.log('\n4️⃣ 測試排行榜生成');
        try {
            const realPlayerResources = {
                honey: GameResources.resources.honey,
                satisfaction: GameResources.resources.bearPoints,
                reputation: GameResources.resources.medals
            };
            const allPlayers = VirtualPlayersSystem.getRealPlayerRank(realPlayerResources, 'honey');
            console.log(`   ✅ 成功生成排行榜`);
            console.log(`   📊 總玩家數: ${allPlayers.length}`);
            console.log(`   🏆 完整排行:`);
            allPlayers.forEach((p, i) => {
                const marker = p.isRealPlayer ? '👤' : '🤖';
                console.log(`      ${marker} ${i+1}. ${p.name}: 💰${p.resources.honey.toLocaleString()}`);
            });
        } catch (error) {
            console.log(`   ❌ 生成失敗: ${error.message}`);
        }
        
        // 5. 檢查遊戲進度
        console.log('\n5️⃣ 遊戲進度');
        console.log(`   🎮 當前輪次: ${GameFlowManager.currentRound}`);
        console.log(`   ✅ 完成事件: ${GameFlowManager.eventsCompleted}/${GameFlowManager.totalEventsPerRound}`);
        
        console.log('\n=====================');
        console.log('💡 如果看到問題，請截圖給開發者');
        console.log('💡 嘗試打開排行榜並點擊「刷新排行榜」按鈕');
    };
    
      // 快速完成遊戲指令（測試用）
      window.quickFinishRound = function() {
          console.log('🚀 ========== 快速完成一輪遊戲 ==========');
          
          try {
              // 1. 檢查是否已選擇地區
              if (!GameFlowManager.hasSelectedRegion) {
                  console.log('📍 步驟 1/3: 選擇地區...');
                  // 自動選擇住宅區 - 苓雅區
                  const regionType = '住宅區';
                  const district = '苓雅區';
                  const coefficient = 1.27;
                  
                  const totalRent = RegionCoefficientsManager.calculateTotalRent(regionType, coefficient);
                  GameResources.resources.honey -= totalRent;
                  GameResources.updateDisplay();
                  GameResources.saveResources();
                  
                  GameFlowManager.selectedRegion = regionType;
                  GameFlowManager.selectedDistrict = district;
                  GameFlowManager.selectedCoefficient = coefficient;
                  GameFlowManager.hasSelectedRegion = true;
                  GameFlowManager.eventsCompleted = 0;
                  GameFlowManager.saveProgress();
                  
                  FinancialReport.setRegionInfo(regionType, district, totalRent);
                  
                  // 虛擬玩家也選擇地區
                  if (window.VirtualPlayersSystem) {
                      VirtualPlayersSystem.simulateRegionSelection(regionType, district);
                  }
                  
                  console.log(`✅ 已選擇: ${regionType} - ${district}, 支付租金: ${totalRent.toLocaleString()}`);
              } else {
                  console.log('✅ 已選擇地區，跳過步驟 1');
                  
                  // 確保財務報表也有地區信息（可能是第二輪或之後）
                  if (GameFlowManager.selectedRegion && GameFlowManager.selectedDistrict) {
                      const savedRent = FinancialReport.currentRoundData.rentPaid || 
                                       RegionCoefficientsManager.calculateTotalRent(
                                           GameFlowManager.selectedRegion, 
                                           GameFlowManager.selectedCoefficient
                                       );
                      FinancialReport.setRegionInfo(
                          GameFlowManager.selectedRegion, 
                          GameFlowManager.selectedDistrict, 
                          savedRent
                      );
                      console.log(`✅ 財務報表地區信息已更新: ${GameFlowManager.selectedRegion} - ${GameFlowManager.selectedDistrict}`);
                  }
              }
              
              // 2. 檢查是否已進貨
              if (!GameFlowManager.hasStocked) {
                  console.log('📦 步驟 2/3: 進貨...');
                  const allBreads = BreadProducts.getAllBreads();
                  const stockingQuantities = {};
                  let totalCost = 0;
                  
                  allBreads.forEach(bread => {
                      const quantity = 1400;
                      stockingQuantities[bread.id] = quantity;
                      totalCost += quantity * bread.cost;
                  });
                  
                  StockingSystem.executeStocking(stockingQuantities, '綠燈');
                  GameResources.addResource('honey', -totalCost);
                  StockingSystem.saveInventory();
                  
                  FinancialReport.recordEvent({
                      eventTitle: '進貨',
                      revenue: 0,
                      cost: totalCost,
                      salesVolume: 0,
                      satisfactionChange: 0,
                      reputationChange: 0,
                      stockingDetail: stockingQuantities
                  }, true);
                  
                  GameFlowManager.hasStocked = true;
                  localStorage.setItem('hasStocked', 'true');
                  
                  // 虛擬玩家也進貨
                  if (window.VirtualPlayersSystem) {
                      VirtualPlayersSystem.simulateStocking();
                  }
                  
                  console.log(`✅ 已進貨，總成本: ${totalCost.toLocaleString()}`);
              } else {
                  console.log('✅ 已進貨，跳過步驟 2');
              }
              
              // 3. 快速完成7個事件
              console.log('🎮 步驟 3/3: 快速完成事件...');
              const eventsToComplete = 7 - GameFlowManager.eventsCompleted;
              
              if (eventsToComplete > 0) {
                  console.log(`   需要完成 ${eventsToComplete} 個事件`);
                  
                  // 載入事件數據
                  fetch('data/events.json')
                      .then(response => response.json())
                      .then(eventsData => {
                          const regionEvents = eventsData.regions[GameFlowManager.selectedRegion] || [];
                          
                          for (let i = 0; i < eventsToComplete; i++) {
                              const eventIndex = (GameFlowManager.eventsCompleted + i) % regionEvents.length;
                              const event = regionEvents[eventIndex];
                              
                              if (!event) {
                                  console.warn(`⚠️ 事件 ${i + 1} 找不到`);
                                  continue;
                              }
                              
                              console.log(`   📋 事件 ${GameFlowManager.eventsCompleted + i + 1}/7: ${event.title}`);
                              
                              // 找到正確答案
                              const correctChoice = event.event.options.find(opt => opt.isCorrect);
                              if (!correctChoice) {
                                  console.warn(`   ⚠️ ${event.title} 沒有正確答案`);
                                  continue;
                              }
                              
                              // 計算銷售
                              const salesResult = SalesCalculator.calculateSales(
                                  StockingSystem.inventory,
                                  GameFlowManager.selectedCoefficient,
                                  1.0, // 景氣係數
                                  correctChoice.optionMultiplier || 1.2
                              );
                              
                              // 應用效果
                              const effects = correctChoice.effects;
                              if (effects.honey) GameResources.addResource('honey', effects.honey);
                              if (effects.satisfaction) GameResources.addResource('bearPoints', effects.satisfaction);
                              if (effects.reputation) GameResources.addResource('medals', effects.reputation);
                              
                              // 記錄到財務報表
                              const eventRevenue = salesResult.totalRevenue + (effects.honey > 0 ? effects.honey : 0);
                              const eventCost = effects.honey < 0 ? Math.abs(effects.honey) : 0;
                              
                              FinancialReport.recordEvent({
                                  eventTitle: event.title,
                                  revenue: eventRevenue,
                                  cost: eventCost,
                                  salesVolume: salesResult.totalSalesVolume,
                                  satisfactionChange: effects.satisfaction || 0,
                                  reputationChange: effects.reputation || 0,
                                  salesDetail: salesResult.salesDetail
                              });
                              
                              // 虛擬玩家也完成事件
                              if (window.VirtualPlayersSystem) {
                                  VirtualPlayersSystem.simulateRound(event);
                              }
                              
                              console.log(`   ✅ 完成! 收入: ${salesResult.totalRevenue.toLocaleString()}, 銷售量: ${salesResult.totalSalesVolume}`);
                          }
                          
                          console.log('\n✅ ========== 一輪遊戲完成！ ==========');
                          console.log(`📊 已完成 ${GameFlowManager.eventsCompleted}/${GameFlowManager.totalEventsPerRound} 個事件`);
                          console.log(`💰 當前蜂蜜幣: ${GameResources.resources.honey.toLocaleString()}`);
                          console.log(`😊 顧客滿意度: ${GameResources.resources.bearPoints}`);
                          console.log(`🏆 聲望: ${GameResources.resources.medals}`);
                          console.log('\n🎉 正在跳轉到財務報表...');
                          
                          // 延遲一下讓數據保存
                          setTimeout(() => {
                              ContentManager.showContent('financial-report');
                              console.log('✅ 已跳轉到財務報表！');
                          }, 500);
                      })
                      .catch(error => {
                          console.error('❌ 載入事件數據失敗:', error);
                      });
              } else {
                  console.log('✅ 所有事件已完成！');
                  console.log('\n🎉 正在跳轉到財務報表...');
                  setTimeout(() => {
                      ContentManager.showContent('financial-report');
                      console.log('✅ 已跳轉到財務報表！');
                  }, 500);
              }
              
          } catch (error) {
              console.error('❌ 快速完成遊戲時發生錯誤:', error);
              console.error(error.stack);
          }
      };
      
      // 測試多輪遊戲指令
      window.testMultipleRounds = function(rounds = 2) {
          console.log(`🚀 ========== 測試連續 ${rounds} 輪遊戲 ==========\n`);
          
          let currentRoundNum = 1;
          
          const runNextRound = () => {
              if (currentRoundNum > rounds) {
                  console.log('\n🎉 ========== 測試完成！ ==========');
                  console.log(`✅ 已完成 ${rounds} 輪遊戲測試`);
                  console.log('\n📊 最終排行榜:');
                  showVirtualPlayers();
                  return;
              }
              
              console.log(`\n🎮 ========== 開始第 ${currentRoundNum} 輪 ==========`);
              
              quickFinishRound();
              
              // 等待本輪完成後開始下一輪
              setTimeout(() => {
                  console.log(`\n✅ 第 ${currentRoundNum} 輪完成`);
                  console.log('📊 當前排行:');
                  VirtualPlayersSystem.getLeaderboard('honey').slice(0, 3).forEach((p, i) => {
                      console.log(`   ${i+1}. ${p.name}: ${p.resources.honey.toLocaleString()}`);
                  });
                  
                  currentRoundNum++;
                  
                  if (currentRoundNum <= rounds) {
                      console.log(`\n⏭️ 準備開始第 ${currentRoundNum} 輪...`);
                      GameFlowManager.startNextRound();
                      
                      // 等待一下讓 startNextRound 完成
                      setTimeout(runNextRound, 2000);
                  } else {
                      runNextRound(); // 完成所有輪次
                  }
              }, 3000);
          };
          
          // 開始第一輪
          runNextRound();
    };
    
    console.log('💡 提示：輸入 showPlayerStatus() 可查看玩家狀態');
      console.log('💡 提示：輸入 showVirtualPlayers() 可查看虛擬玩家狀態');
      console.log('💡 提示：輸入 diagnoseLeaderboard() 可診斷排行榜問題');
      console.log('💡 提示：輸入 quickFinishRound() 可快速完成一輪遊戲並跳轉到財務報表');
    console.log('🔧 財務報表修復：輸入 fixFinancialReport() 可手動修復財務報表問題');
    
    // 全局調試函數
    window.fixFinancialReport = function() {
        if (window.FinancialReport) {
            return FinancialReport.fixFinancialReport();
        } else {
            console.error('❌ FinancialReport 未初始化');
            return false;
        }
    };
      console.log('💡 提示：輸入 testMultipleRounds(N) 可測試連續N輪遊戲（預設2輪）');
     console.log('💡 提示：輸入 checkKnowledgeStatus() 可檢查知識庫載入狀態');
    console.log('💡 提示：輸入 reloadBotKnowledge() 可重新載入機器人知識庫');
    console.log('💡 提示：輸入 checkKnowledgeStatus() 可檢查知識庫狀態');
    console.log('💡 提示：輸入 testMarketingResponses() 可測試行銷回應');
    console.log('💡 提示：輸入 debugMarketingResponse("問題") 可詳細調試行銷回應');
    console.log('💡 提示：輸入 generateSmartResponse("測試訊息") 可測試智能回應');
     console.log('💡 提示：輸入 addCustomResponse("關鍵字", "回應內容") 可添加自訂機器人回應');
     console.log('💡 提示：輸入 showCustomResponses() 可查看所有自訂回應');
     console.log('💡 提示：輸入 testCustomResponse("測試訊息") 可測試自訂回應');
     console.log('💡 提示：輸入 showChatHistory() 可查看聊天記錄');
     console.log('💡 提示：輸入 clearChatHistory() 可清空聊天記錄');
     console.log('💡 提示：輸入 checkBotpressState() 可檢查 Botpress 狀態和訊息歷史');
     console.log('💡 提示：輸入 openChatForTest() 可快速打開聊天室並測試 Botpress 整合');
     console.log('💡 提示：輸入 testBotpressIntegration() 可測試 Botpress 聊天室整合');
     console.log('💡 提示：輸入 testBotpress() 可測試 Botpress 聊天機器人');
     console.log('💡 提示：輸入 checkBotpressLoaded() 可檢查 Botpress 載入狀態');
     console.log('📚 機器人知識庫已自動載入！編輯 data/bot-knowledge.json 來修改機器人回應');
     console.log('💾 聊天記錄已自動保存！刷新頁面後聊天記錄不會丟失');
     console.log('🎉 Botpress 已成功初始化！現在可以在聊天室中使用 Botpress 聊天機器人');
    
    // 初始化音樂管理器
    MusicManager.init();
    
    // 初始化音效管理器
    SoundManager.init();
    
    // 為所有按鈕添加點擊音效
    addClickSoundToAllButtons();
    
    // 初始化自訂游標管理器（可選）
    // CursorManager.init(); // 取消註解以啟用 JavaScript 游標系統
    
    // 添加頁面點擊事件來啟動音樂（瀏覽器需要用戶互動才能播放音頻）
    document.addEventListener('click', function() {
        if (MusicManager.isEnabled && MusicManager.audio && MusicManager.audio.paused) {
            MusicManager.play();
        }
    }, { once: true }); // 只執行一次
    
    // 快捷鍵：Shift + R 重置玩家狀態
    document.addEventListener('keydown', (e) => {
        if (e.shiftKey && (e.key === 'R' || e.key === 'r')) {
            e.preventDefault();
            resetPlayerState();
        }
    });
    
    // ========== 排行榜彈窗控制 ==========
    const LeaderboardModal = {
        modal: null,
        closeBtns: [],
        refreshBtn: null,
        tabs: [],
        
        init() {
            this.modal = document.getElementById('leaderboardModal');
            if (!this.modal) return;
            
            // 獲取控制元素
            this.closeBtns = this.modal.querySelectorAll('.close-btn');
            this.refreshBtn = this.modal.querySelector('.refresh-btn');
            this.tabs = this.modal.querySelectorAll('.leaderboard-tab');
            
            // 綁定事件
            this.bindEvents();
        },
        
        bindEvents() {
            // 關閉按鈕事件
            this.closeBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    if (typeof SoundManager !== 'undefined') {
                        SoundManager.playClick();
                    }
                    this.close();
                });
            });
            
            // 點擊遮罩層關閉
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.close();
                }
            });
            
            // ESC 鍵關閉
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.modal.style.display !== 'none') {
                    this.close();
                }
            });
            
            // 刷新按鈕
            if (this.refreshBtn) {
                this.refreshBtn.addEventListener('click', () => {
                    this.refresh();
                });
            }
            
            // 標籤切換
            this.tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    this.switchTab(tab);
                });
            });
        },
        
        open() {
            if (!this.modal) return;
            this.modal.style.display = 'flex';
            console.log('🏆 排行榜已開啟');
            
            // 首次打開時載入當前 active 標籤的數據
            const activeTab = this.modal.querySelector('.leaderboard-tab.active');
            if (activeTab) {
                const tabType = activeTab.dataset.tab;
                console.log(`📊 載入 ${tabType} 排行榜數據`);
                
                if (tabType === 'all') {
                    this.loadAllLeaderboard();
                } else if (tabType === 'friends') {
                    this.loadFriendsLeaderboard();
                } else if (tabType === 'reputation') {
                    this.loadReputationLeaderboard();
                }
            }
        },
        
        close() {
            if (!this.modal) return;
            this.modal.style.display = 'none';
            console.log('🏆 排行榜已關閉');
        },
        
        refresh() {
            console.log('🔄 刷新排行榜資料...');
            
            // 強制重新載入當前標籤的排行榜
            const activeTab = this.modal.querySelector('.leaderboard-tab.active');
            if (activeTab) {
                const tabType = activeTab.dataset.tab;
                
                if (tabType === 'all') {
                    this.loadAllLeaderboard();
                } else if (tabType === 'friends') {
                    this.loadFriendsLeaderboard();
                } else if (tabType === 'reputation') {
                    this.loadReputationLeaderboard();
                }
            }
            
            // 檢查排行榜成就
            this.checkLeaderboardAchievements();
            
            console.log('✅ 排行榜資料已刷新');
        },
        
        // 檢查排行榜成就
        checkLeaderboardAchievements() {
            if (!window.AchievementSystem) return;
            
            const realPlayerResources = {
                honey: GameResources.resources.honey,
                satisfaction: GameResources.resources.bearPoints,
                reputation: GameResources.resources.medals
            };
            
            // 檢查蜂蜜幣排行榜排名
            const honeyRank = VirtualPlayersSystem.getRealPlayerRank(realPlayerResources, 'honey');
            const playerHoneyRank = honeyRank.findIndex(p => p.isRealPlayer) + 1;
            
            if (playerHoneyRank > 0) {
                window.AchievementSystem.checkProgress('top_rank', playerHoneyRank);
            }
        },
        
        switchTab(clickedTab) {
            const tabType = clickedTab.dataset.tab;
            
            // 更新標籤樣式
            this.tabs.forEach(tab => {
                tab.classList.remove('active');
            });
            clickedTab.classList.add('active');
            
            // 更新標題和表頭
            const title = this.modal.querySelector('.leaderboard-title');
            const scoreLabel = this.modal.querySelector('#scoreLabel');
            
            // 根據標籤類型載入不同資料
            if (tabType === 'all') {
                console.log('📊 切換到全部排行榜');
                if (title) title.textContent = '蜂蜜幣排行榜';
                if (scoreLabel) scoreLabel.textContent = '蜂蜜幣';
                this.loadAllLeaderboard();
            } else if (tabType === 'friends') {
                console.log('👥 切換到顧客滿意度排行榜');
                if (title) title.textContent = '顧客滿意度排行榜';
                if (scoreLabel) scoreLabel.textContent = '顧客滿意度';
                this.loadFriendsLeaderboard();
            } else if (tabType === 'reputation') {
                console.log('🏆 切換到聲望排行榜');
                if (title) title.textContent = '聲望排行榜';
                if (scoreLabel) scoreLabel.textContent = '聲望';
                this.loadReputationLeaderboard();
            }
        },
        
        updateLeaderboardData() {
            // 模擬更新資料的動畫效果
            const items = this.modal.querySelectorAll('.leaderboard-item');
            items.forEach((item, index) => {
                setTimeout(() => {
                    item.style.animation = 'none';
                    setTimeout(() => {
                        item.style.animation = 'fadeIn 0.3s ease';
                    }, 10);
                }, index * 50);
            });
            
            console.log('✅ 排行榜資料已更新');
        },
        
        loadAllLeaderboard() {
            // 載入蜂蜜幣排行榜
            console.log('📥 載入蜂蜜幣排行榜資料...');
            
            // 檢查虛擬玩家系統
            if (!window.VirtualPlayersSystem) {
                console.error('❌ 虛擬玩家系統未初始化');
                return;
            }
            
            console.log('🤖 虛擬玩家數量:', VirtualPlayersSystem.players.length);
            
            // 獲取真人玩家資源
            const realPlayerResources = {
                honey: GameResources.resources.honey,
                satisfaction: GameResources.resources.bearPoints,
                reputation: GameResources.resources.medals
            };
            
            console.log('👤 真人玩家資源:', realPlayerResources);
            
            // 獲取包含虛擬玩家的排行榜
            const allPlayers = VirtualPlayersSystem.getRealPlayerRank(realPlayerResources, 'honey');
            
            console.log('📊 排行榜玩家數:', allPlayers.length);
            console.log('🏆 前三名:', allPlayers.slice(0, 3).map(p => `${p.name}: ${p.resources.honey}`));
            
            // 前三名
            const top3 = allPlayers.slice(0, 3).map((player, index) => ({
                rank: index + 1,
                icon: index === 0 ? 'assets/images/第一名.png' : (index === 1 ? 'assets/images/第二名.png' : 'assets/images/第三名.png'),
                avatar: player.avatar,
                name: player.isRealPlayer ? '我' : player.name,
                score: `💰 ${player.resources.honey.toLocaleString()}`
            }));
            
            // 補齊到3名
            while (top3.length < 3) {
                top3.push({ 
                    rank: top3.length + 1, 
                    icon: top3.length === 0 ? 'assets/images/第一名.png' : (top3.length === 1 ? 'assets/images/第二名.png' : 'assets/images/第三名.png'),
                    avatar: '🐻', 
                    name: '-', 
                    score: '-' 
                });
            }
            
            this.updateTopThree(top3);
            
            // 第4-8名
            const rest = allPlayers.slice(3, 8).map((player, index) => ({
                rank: index + 4,
                name: player.isRealPlayer ? '我' : player.avatar + ' ' + player.name,
                score: `💰 ${player.resources.honey.toLocaleString()}`
            }));
            
            // 補齊到5名
            while (rest.length < 5) {
                rest.push({ 
                    rank: rest.length + 4, 
                    name: '-', 
                    score: '-' 
                });
            }
            
            this.updateListData(rest);
        },
        
        loadFriendsLeaderboard() {
            // 載入顧客滿意度排行榜
            console.log('📥 載入顧客滿意度排行榜資料...');
            
            // 檢查虛擬玩家系統
            if (!window.VirtualPlayersSystem) {
                console.error('❌ 虛擬玩家系統未初始化');
                return;
            }
            
            // 獲取真人玩家資源
            const realPlayerResources = {
                honey: GameResources.resources.honey,
                satisfaction: GameResources.resources.bearPoints,
                reputation: GameResources.resources.medals
            };
            
            console.log('👤 真人玩家滿意度:', realPlayerResources.satisfaction);
            
            // 獲取包含虛擬玩家的排行榜
            const allPlayers = VirtualPlayersSystem.getRealPlayerRank(realPlayerResources, 'satisfaction');
            
            console.log('📊 滿意度排行玩家數:', allPlayers.length);
            console.log('🏆 滿意度前三名:', allPlayers.slice(0, 3).map(p => `${p.name}(${p.isRealPlayer ? '真人' : '虛擬'}): ${p.resources.satisfaction}`));
            console.log('📋 完整排行:', allPlayers.map((p, i) => `第${i+1}名: ${p.name}(${p.isRealPlayer ? '真人' : '虛擬'}) - ${p.resources.satisfaction}`));
            
            // 前三名
            const top3 = allPlayers.slice(0, 3).map((player, index) => ({
                rank: index + 1,
                icon: index === 0 ? 'assets/images/第一名.png' : (index === 1 ? 'assets/images/第二名.png' : 'assets/images/第三名.png'),
                avatar: player.avatar,
                name: player.isRealPlayer ? '我' : player.name,
                score: `😊 ${player.resources.satisfaction.toLocaleString()}`
            }));
            
            // 補齊到3名
            while (top3.length < 3) {
                top3.push({ 
                    rank: top3.length + 1, 
                    icon: top3.length === 0 ? 'assets/images/第一名.png' : (top3.length === 1 ? 'assets/images/第二名.png' : 'assets/images/第三名.png'),
                    avatar: '🐻', 
                    name: '-', 
                    score: '-' 
                });
            }
            
            this.updateTopThree(top3);
            
            // 找出真人玩家的排名
            const realPlayerIndex = allPlayers.findIndex(p => p.isRealPlayer);
            const realPlayerRank = realPlayerIndex + 1;
            
            // 第4-8名
            const rest = allPlayers.slice(3, 8).map((player, index) => ({
                rank: index + 4,
                name: player.isRealPlayer ? '我' : player.avatar + ' ' + player.name,
                score: `😊 ${player.resources.satisfaction.toLocaleString()}`
            }));
            
            // 如果真人玩家不在前8名，顯示真人玩家
            if (realPlayerRank > 8) {
                rest[rest.length - 1] = {
                    rank: realPlayerRank,
                    name: '我',
                    score: `😊 ${allPlayers[realPlayerIndex].resources.satisfaction.toLocaleString()}`
                };
            }
            
            // 補齊到5名
            while (rest.length < 5) {
                rest.push({ 
                    rank: rest.length + 4, 
                    name: '-', 
                    score: '-' 
                });
            }
            
            this.updateListData(rest);
        },
        
        loadReputationLeaderboard() {
            // 載入聲望排行榜
            console.log('📥 載入聲望排行榜資料...');
            
            // 檢查虛擬玩家系統
            if (!window.VirtualPlayersSystem) {
                console.error('❌ 虛擬玩家系統未初始化');
                return;
            }
            
            // 獲取真人玩家資源
            const realPlayerResources = {
                honey: GameResources.resources.honey,
                satisfaction: GameResources.resources.bearPoints,
                reputation: GameResources.resources.medals
            };
            
            console.log('👤 真人玩家聲望:', realPlayerResources.reputation);
            
            // 獲取包含虛擬玩家的排行榜
            const allPlayers = VirtualPlayersSystem.getRealPlayerRank(realPlayerResources, 'reputation');
            
            console.log('📊 聲望排行玩家數:', allPlayers.length);
            console.log('🏆 聲望前三名:', allPlayers.slice(0, 3).map(p => `${p.name}(${p.isRealPlayer ? '真人' : '虛擬'}): ${p.resources.reputation}`));
            console.log('📋 完整排行:', allPlayers.map((p, i) => `第${i+1}名: ${p.name}(${p.isRealPlayer ? '真人' : '虛擬'}) - ${p.resources.reputation}`));
            
            // 前三名
            const top3 = allPlayers.slice(0, 3).map((player, index) => ({
                rank: index + 1,
                icon: index === 0 ? 'assets/images/第一名.png' : (index === 1 ? 'assets/images/第二名.png' : 'assets/images/第三名.png'),
                avatar: player.avatar,
                name: player.isRealPlayer ? '我' : player.name,
                score: `🏆 ${player.resources.reputation.toLocaleString()}`
            }));
            
            // 補齊到3名
            while (top3.length < 3) {
                top3.push({ 
                    rank: top3.length + 1, 
                    icon: top3.length === 0 ? 'assets/images/第一名.png' : (top3.length === 1 ? 'assets/images/第二名.png' : 'assets/images/第三名.png'),
                    avatar: '🐻', 
                    name: '-', 
                    score: '-' 
                });
            }
            
            this.updateTopThree(top3);
            
            // 找出真人玩家的排名
            const realPlayerIndex = allPlayers.findIndex(p => p.isRealPlayer);
            const realPlayerRank = realPlayerIndex + 1;
            
            // 第4-8名
            const rest = allPlayers.slice(3, 8).map((player, index) => ({
                rank: index + 4,
                name: player.isRealPlayer ? '我' : player.avatar + ' ' + player.name,
                score: `🏆 ${player.resources.reputation.toLocaleString()}`
            }));
            
            // 如果真人玩家不在前8名，顯示真人玩家
            if (realPlayerRank > 8) {
                rest[rest.length - 1] = {
                    rank: realPlayerRank,
                    name: '我',
                    score: `🏆 ${allPlayers[realPlayerIndex].resources.reputation.toLocaleString()}`
                };
            }
            
            // 補齊到5名
            while (rest.length < 5) {
                rest.push({ 
                    rank: rest.length + 4, 
                    name: '-', 
                    score: '-' 
                });
            }
            
            this.updateListData(rest);
        },
        
        updateTopThree(data) {
            // 更新前三名卡片的資料
            const cards = this.modal.querySelectorAll('.top-rank-card');
            data.forEach((item, index) => {
                const card = cards[index === 0 ? 1 : (index === 1 ? 0 : 2)]; // 調整順序：2,1,3
                if (card) {
                    const rankIcon = card.querySelector('.rank-icon');
                    const name = card.querySelector('.rank-name');
                    const score = card.querySelector('.rank-score');
                    
                    // 更新圖示
                    if (rankIcon) {
                        rankIcon.innerHTML = `<img src="${item.icon}" alt="第${item.rank}名" class="rank-icon-img">`;
                    }
                    
                    if (name) name.textContent = item.name;
                    if (score) score.textContent = item.score;
                }
            });
        },
        
        updateListData(data) {
            // 更新列表資料
            const listContent = this.modal.querySelector('.leaderboard-list-content');
            if (!listContent) return;
            
            listContent.innerHTML = data.map(item => `
                <div class="leaderboard-item">
                    <span class="item-rank">#${item.rank}</span>
                    <span class="item-player">${item.name}</span>
                    <span class="item-score">${item.score}</span>
                </div>
            `).join('');
        }
    };
    
    // 初始化排行榜彈窗
    LeaderboardModal.init();
    
    // 修改排行榜按鈕點擊事件
    const navLeaderboardBtn = document.getElementById('navLeaderboard');
    if (navLeaderboardBtn) {
        // 移除原有的事件監聽器並添加新的
        navLeaderboardBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止事件冒泡
            LeaderboardModal.open();
        });
    }
    
    // 將排行榜模態框暴露到全局
    window.LeaderboardModal = LeaderboardModal;
    
    // 確保音效和音樂管理器立即可用
    window.SoundManager = SoundManager;
    window.MusicManager = MusicManager;
    
    console.log('🏆 排行榜系統已初始化');
    console.log('🎵 音效和音樂管理器已暴露到全局');
    console.log('SoundManager:', typeof window.SoundManager);
    console.log('MusicManager:', typeof window.MusicManager);
});
