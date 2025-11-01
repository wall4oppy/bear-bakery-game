/**
 * 任務模組
 * 處理每日任務的生成、完成和獎勵
 */
class TaskModule {
    constructor() {
        this.config = window.AppConfig;
        this.storage = window.storage;
        this.helpers = window.Helpers;
        
        this.tasks = [];
        this.init();
    }

    /**
     * 初始化模組
     */
    init() {
        console.log('任務模組初始化');
        this.loadTasks();
        this.bindEvents();
    }

    /**
     * 載入任務
     */
    loadTasks() {
        this.tasks = this.storage.get('dailyTasks', []);
        
        // 檢查是否需要生成新任務
        const lastGenerated = this.storage.get('lastTaskGeneration', 0);
        const today = new Date().toDateString();
        
        if (lastGenerated !== today) {
            this.generateDailyTasks();
        }
    }

    /**
     * 生成每日任務
     */
    generateDailyTasks() {
        const taskTemplates = [
            { 
                id: 'drink_water',
                title: "喝 8 杯水", 
                type: "hydration", 
                completed: false,
                xpReward: 10,
                icon: '💧'
            },
            { 
                id: 'cardio_30min',
                title: "完成 30 分鐘有氧運動", 
                type: "cardio", 
                completed: false,
                xpReward: 25,
                icon: '🏃‍♂️'
            },
            { 
                id: 'protein_100g',
                title: "攝取 100g 蛋白質", 
                type: "nutrition", 
                completed: false,
                xpReward: 15,
                icon: '🥩'
            },
            { 
                id: 'walk_10000',
                title: "步行 10,000 步", 
                type: "walking", 
                completed: false,
                xpReward: 20,
                icon: '🚶‍♂️'
            },
            { 
                id: 'meditation_10min',
                title: "冥想 10 分鐘", 
                type: "meditation", 
                completed: false,
                xpReward: 15,
                icon: '🧘‍♀️'
            },
            { 
                id: 'squats_50',
                title: "做 50 個深蹲", 
                type: "strength", 
                completed: false,
                xpReward: 20,
                icon: '💪'
            },
            { 
                id: 'sleep_8h',
                title: "睡眠 7-8 小時", 
                type: "sleep", 
                completed: false,
                xpReward: 15,
                icon: '😴'
            }
        ];

        // 隨機選擇3個任務
        this.tasks = this.helpers.randomSelect(taskTemplates, 3);
        
        // 保存任務和生成時間
        this.storage.set('dailyTasks', this.tasks);
        this.storage.set('lastTaskGeneration', new Date().toDateString());
        
        console.log('每日任務已生成:', this.tasks);
    }

    /**
     * 綁定事件
     */
    bindEvents() {
        // 監聽任務完成事件
        document.addEventListener('click', (e) => {
            const taskCheckbox = e.target.closest('.task-checkbox');
            if (taskCheckbox) {
                const taskIndex = parseInt(taskCheckbox.dataset.index);
                this.toggleTask(taskIndex);
            }
        });

        // 重新生成任務按鈕
        document.addEventListener('click', (e) => {
            if (e.target.id === 'generateTasksBtn' || e.target.closest('#generateTasksBtn')) {
                e.preventDefault();
                this.generateDailyTasks();
                this.renderTasks();
            }
        });
    }

    /**
     * 切換任務狀態
     */
    toggleTask(index) {
        if (index < 0 || index >= this.tasks.length) return;

        const task = this.tasks[index];
        task.completed = !task.completed;

        if (task.completed) {
            // 完成任務
            this.completeTask(task);
        } else {
            // 取消完成
            this.uncompleteTask(task);
        }

        this.saveTasks();
        this.renderTasks();
    }

    /**
     * 完成任務
     */
    completeTask(task) {
        // 觸發任務完成事件
        const event = new CustomEvent('taskCompleted', {
            detail: {
                task: task,
                xpReward: task.xpReward
            }
        });
        document.dispatchEvent(event);

        // 顯示完成動畫
        this.showTaskCompleteAnimation(task);
    }

    /**
     * 取消完成任務
     */
    uncompleteTask(task) {
        // 觸發任務取消事件
        const event = new CustomEvent('taskUncompleted', {
            detail: {
                task: task
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * 顯示任務完成動畫
     */
    showTaskCompleteAnimation(task) {
        // 創建完成動畫元素
        const animation = document.createElement('div');
        animation.className = 'task-complete-animation';
        animation.innerHTML = `
            <div class="task-complete-content">
                <div class="task-complete-icon">${task.icon}</div>
                <div class="task-complete-text">+${task.xpReward} XP</div>
            </div>
        `;
        
        document.body.appendChild(animation);
        
        // 移除動畫元素
        setTimeout(() => {
            animation.remove();
        }, 2000);
    }

    /**
     * 渲染任務列表
     */
    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        if (!tasksList) return;

        tasksList.innerHTML = '';

        this.tasks.forEach((task, index) => {
            const taskItem = document.createElement('li');
            taskItem.className = 'task-item';
            taskItem.innerHTML = `
                <div class="task-checkbox ${task.completed ? 'completed' : ''}" 
                     data-index="${index}">
                    ${task.completed ? '<i class="fas fa-check"></i>' : ''}
                </div>
                <div class="task-content">
                    <div class="task-icon">${task.icon}</div>
                    <div class="task-text ${task.completed ? 'completed' : ''}">${task.title}</div>
                    <div class="task-reward">+${task.xpReward} XP</div>
                </div>
            `;
            tasksList.appendChild(taskItem);
        });
    }

    /**
     * 保存任務
     */
    saveTasks() {
        this.storage.set('dailyTasks', this.tasks);
    }

    /**
     * 獲取任務統計
     */
    getTaskStats() {
        const completed = this.tasks.filter(task => task.completed).length;
        const total = this.tasks.length;
        const totalXP = this.tasks
            .filter(task => task.completed)
            .reduce((sum, task) => sum + task.xpReward, 0);

        return {
            completed,
            total,
            completionRate: total > 0 ? (completed / total) * 100 : 0,
            totalXP
        };
    }

    /**
     * 重置任務
     */
    resetTasks() {
        this.tasks.forEach(task => {
            task.completed = false;
        });
        this.saveTasks();
        this.renderTasks();
    }
}

// 自動初始化
window.taskModule = new TaskModule(); 