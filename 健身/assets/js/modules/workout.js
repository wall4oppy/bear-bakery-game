/**
 * WorkoutModule - 訓練運動模組
 * 依部位分類，顯示運動名稱、教學解說、影片
 */
class WorkoutModule {
    constructor() {
        this.data = this.getWorkoutData();
        this.container = document.getElementById('workoutContent');
        this.init();
    }

    /**
     * 初始化
     */
    init() {
        this.renderWorkoutCategories();
        this.bindEvents();
    }

    /**
     * 綁定事件
     */
    bindEvents() {
        // 分類切換
        this.container.addEventListener('click', (e) => {
            const btn = e.target.closest('.workout-category-btn');
            if (btn) {
                const part = btn.dataset.part;
                this.renderWorkoutList(part);
            }
        });
    }

    /**
     * 取得運動資料
     */
    getWorkoutData() {
        return {
            '腹部': [
                {
                    name: '仰臥捲腹',
                    desc: '平躺，雙膝彎曲，雙手放胸前或頭後，腹部發力將上半身捲起，注意下背不離地。',
                    video: 'https://www.youtube.com/embed/Xyd_fa5zoEU'
                },
                {
                    name: '棒式（Plank）',
                    desc: '俯臥，手肘撐地，腳尖點地，身體呈一直線，核心收緊，保持姿勢。',
                    video: 'https://www.youtube.com/embed/pSHjTRCQxIw'
                }
            ],
            '胸部': [
                {
                    name: '伏地挺身',
                    desc: '雙手撐地與肩同寬，身體打直，屈臂下降至胸部接近地面，推回起始。',
                    video: 'https://www.youtube.com/embed/IODxDxX7oi4'
                }
            ],
            '背部': [
                {
                    name: '超人式',
                    desc: '俯臥，雙手雙腳同時抬起，感受背部收縮，停留數秒後放下。',
                    video: 'https://www.youtube.com/embed/6gW6zTLrFjY'
                }
            ],
            '手臂': [
                {
                    name: '三頭肌撐體',
                    desc: '背對椅子，雙手撐椅緣，屈肘下降臀部，推回起始。',
                    video: 'https://www.youtube.com/embed/0326dy_-CzM'
                }
            ],
            '腿部': [
                {
                    name: '深蹲',
                    desc: '雙腳與肩同寬，背部挺直，屈膝下蹲至大腿平行地面，站起。',
                    video: 'https://www.youtube.com/embed/aclHkVaku9U'
                }
            ],
            '臀部': [
                {
                    name: '臀橋',
                    desc: '平躺，雙膝彎曲，腳掌踩地，臀部發力抬高至身體成一直線，停留後放下。',
                    video: 'https://www.youtube.com/embed/8bbE64NuDTU'
                }
            ],
            '肩膀': [
                {
                    name: '肩推舉（啞鈴/水瓶）',
                    desc: '雙手持啞鈴或水瓶，從肩膀推舉至頭頂上方，慢慢放下。',
                    video: 'https://www.youtube.com/embed/B-aVuyhvLHU'
                }
            ]
        };
    }

    /**
     * 渲染分類按鈕
     */
    renderWorkoutCategories() {
        const categories = Object.keys(this.data);
        let html = `<div class="workout-categories" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">`;
        categories.forEach((part, idx) => {
            html += `<button class="workout-category-btn btn btn-secondary" data-part="${part}" ${idx===0?'style="background:#667eea;color:#fff;"':''}>${part}</button>`;
        });
        html += `</div><div id="workoutList"></div>`;
        this.container.innerHTML = html;
        // 預設顯示第一個分類
        this.renderWorkoutList(categories[0]);
    }

    /**
     * 渲染運動列表
     */
    renderWorkoutList(part) {
        // 高亮分類按鈕
        this.container.querySelectorAll('.workout-category-btn').forEach(btn => {
            btn.style.background = '';
            btn.style.color = '';
            if (btn.dataset.part === part) {
                btn.style.background = '#667eea';
                btn.style.color = '#fff';
            }
        });
        const list = this.data[part] || [];
        let html = '';
        list.forEach(item => {
            html += `
            <div class="card fade-in" style="margin-bottom:18px;">
                <div class="card-header">
                    <h3 class="card-title">${item.name}</h3>
                </div>
                <div style="margin-bottom:10px;">${item.desc}</div>
                <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;">
                    <iframe src="${item.video}" frameborder="0" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;border-radius:12px;"></iframe>
                </div>
            </div>
            `;
        });
        this.container.querySelector('#workoutList').innerHTML = html;
    }
}

// 實例化
if (document.getElementById('workoutContent')) {
    window.workoutModule = new WorkoutModule();
}

if (typeof window !== 'undefined') {
    window.WorkoutModule = WorkoutModule;
} 