import { gameState } from './gameState.js';
import { updatePlayerInfo, updateInventoryDisplay, updateReportsDisplay, showNotification } from './ui.js';

let soundManager;

export function initializeGameLogic(manager) {
    soundManager = manager;
}

// === 玩家資料功能 ===
export function changeName() {
    const newName = prompt('請輸入新的玩家名稱：', gameState.playerData.name);
    if (newName && newName.trim()) {
        gameState.playerData.name = newName.trim();
        updatePlayerInfo();
        saveGameData();
        
        if (soundManager) {
            soundManager.playSound('success');
        }
        
        alert('名稱已更新！');
    }
}

export function changeAvatar() {
    const avatars = ['🧑‍🍳', '👨‍🍳', '👩‍🍳', '🧑‍💼', '👨‍💼', '👩‍💼', '🧑', '👨', '👩'];
    const currentIndex = avatars.indexOf(gameState.playerData.avatar);
    const nextIndex = (currentIndex + 1) % avatars.length;
    
    gameState.playerData.avatar = avatars[nextIndex];
    updatePlayerInfo();
    saveGameData();
    
    if (soundManager) {
        soundManager.playSound('click');
    }
}

// === 進貨系統功能 ===
export function purchaseBread(breadType, cost) {
    const qtyInput = document.getElementById(`${breadType}-qty`);
    const quantity = parseInt(qtyInput.value) || 1;
    const totalCost = cost * quantity;
    
    if (gameState.playerData.coins >= totalCost) {
        gameState.playerData.coins -= totalCost;
        gameState.inventory[breadType] += quantity;
        
        if (soundManager) {
            soundManager.playSound('purchase');
            setTimeout(() => soundManager.playSound('bread'), 200);
        }
        
        updatePlayerInfo();
        updateInventoryDisplay();
        saveGameData();
        
        gameState.reports.totalExpense += totalCost;
        updateReportsDisplay();
        
        alert(`成功進貨 ${quantity} 個！花費 $${totalCost}`);
    } else {
        if (soundManager) {
            soundManager.playSound('error');
        }
        alert('遊戲幣不足！請先完成遊戲賺取更多金幣。');
    }
}

// === 遊戲主要功能 ===
export function setupGameControls() {
    showGameContent('story');
}

function showGameContent(contentType) {
    const storySection = document.getElementById('story-section');
    const questionSection = document.getElementById('question-section');
    
    if (contentType === 'story') {
        storySection.classList.add('active');
        questionSection.classList.remove('active');
        updateStoryDisplay();
    } else if (contentType === 'question') {
        storySection.classList.remove('active');
        questionSection.classList.add('active');
        updateQuestionDisplay();
    }
}

function updateStoryDisplay() {
    const stories = document.querySelectorAll('.story-page');
    const progressElement = document.getElementById('story-progress');
    
    stories.forEach((story, index) => {
        if (index === gameState.gameProgress.currentStory - 1) {
            story.classList.add('active');
        } else {
            story.classList.remove('active');
        }
    });
    
    if (progressElement) {
        progressElement.textContent = `${gameState.gameProgress.currentStory} / ${gameState.gameProgress.totalStories}`;
    }
    
    const prevBtn = document.getElementById('prev-story');
    const nextBtn = document.getElementById('next-story');
    
    if (prevBtn) {
        prevBtn.disabled = gameState.gameProgress.currentStory <= 1;
        prevBtn.style.opacity = gameState.gameProgress.currentStory <= 1 ? '0.5' : '1';
    }
    
    if (nextBtn) {
        if (gameState.gameProgress.currentStory >= gameState.gameProgress.totalStories) {
            nextBtn.textContent = '開始挑戰';
            nextBtn.onclick = () => {
                gameState.gameProgress.storyCompleted = true;
                showGameContent('question');
            };
        } else {
            nextBtn.textContent = '下一頁';
            nextBtn.disabled = false;
            nextBtn.style.opacity = '1';
        }
    }
}

export function previousStory() {
    if (gameState.gameProgress.currentStory > 1) {
        gameState.gameProgress.currentStory--;
        updateStoryDisplay();
    }
}

export function nextStory() {
    if (gameState.gameProgress.currentStory < gameState.gameProgress.totalStories) {
        gameState.gameProgress.currentStory++;
        updateStoryDisplay();
    }
}

function updateQuestionDisplay() {
    const questions = document.querySelectorAll('.question');
    const progressElement = document.getElementById('question-progress');
    
    questions.forEach((question, index) => {
        if (index === gameState.gameProgress.currentQuestion - 1) {
            question.classList.add('active');
        } else {
            question.classList.remove('active');
        }
    });
    
    if (progressElement) {
        progressElement.textContent = `${gameState.gameProgress.currentQuestion} / ${gameState.gameProgress.totalQuestions}`;
    }
    
    const prevBtn = document.getElementById('prev-question');
    const nextBtn = document.getElementById('next-question');
    
    if (prevBtn) {
        prevBtn.disabled = gameState.gameProgress.currentQuestion <= 1;
        prevBtn.style.opacity = gameState.gameProgress.currentQuestion <= 1 ? '0.5' : '1';
    }
    
    if (nextBtn) {
        if (gameState.gameProgress.currentQuestion >= gameState.gameProgress.totalQuestions) {
            if (gameState.gameProgress.questionsCompleted) {
                nextBtn.textContent = '完成遊戲';
                nextBtn.onclick = () => {
                    alert('恭喜完成所有挑戰！您已經掌握了基本的麵包店行銷知識！');
                    showSection('reports');
                };
            } else {
                nextBtn.textContent = '查看報表';
                nextBtn.disabled = true;
                nextBtn.style.opacity = '0.5';
            }
        } else {
            nextBtn.textContent = '下一題';
        }
    }
}

export function previousQuestion() {
    if (gameState.gameProgress.currentQuestion > 1) {
        gameState.gameProgress.currentQuestion--;
        updateQuestionDisplay();
        hideFeedback();
    }
}

export function nextQuestion() {
    if (gameState.gameProgress.currentQuestion < gameState.gameProgress.totalQuestions) {
        gameState.gameProgress.currentQuestion++;
        updateQuestionDisplay();
        hideFeedback();
    }
}

export function selectAnswer(questionId, answer, points) {
    if (soundManager) {
        soundManager.playSound('click');
    }
    
    const feedback = document.getElementById('feedback');
    const feedbackMessages = {
        1: {
            'A': '正確！學校附近的主要客群確實是學生和年輕人。他們注重價格實惠和便利性，這對您的定價策略很重要。',
            'B': '部分正確。雖然可能有一些商務人士經過，但學校附近的主要客群還是學生。',
            'C': '需要再考慮。退休長者通常不是學校附近的主要客群。'
        },
        2: {
            'A': '正確！針對學生客群，平價親民路線是最佳選擇。學生的消費預算有限，價格實惠能吸引更多顧客。',
            'B': '不太適合。高價精品路線對學生來說負擔太重，可能會失去主要客群。',
            'C': '可以考慮，但平價路線更適合學生客群的消費習慣。'
        },
        3: {
            'A': '正確！學生證打折是針對目標客群的精準促銷，既能吸引學生又能建立品牌忠誠度。',
            'B': '成本較高。買一送一雖然吸引人，但會大幅降低利潤率。',
            'C': '不錯的選擇！集點活動能培養客戶忠誠度，適合長期經營。'
        },
        4: {
            'A': '正確！年輕人經常使用社群媒體，這是最有效觸及學生客群的宣傳管道。',
            'B': '效果有限。學生較少閱讀報紙，這個管道無法有效觸及目標客群。',
            'C': '有一定效果，但不如社群媒體精準有效。'
        }
    };
    
    if (feedback && feedbackMessages[questionId] && feedbackMessages[questionId][answer]) {
        feedback.innerHTML = `
            <h4>回答反饋</h4>
            <p>${feedbackMessages[questionId][answer]}</p>
            <p><strong>獲得遊戲幣：+${points}</strong> 💰</p>
        `;
        feedback.classList.add('show');
        
        gameState.playerData.coins += points;
        updatePlayerInfo();
        
        if (soundManager && points > 0) {
            setTimeout(() => soundManager.playSound('coin'), 300);
        }
        
        gameState.reports.totalIncome += points;
        gameState.reports.netProfit = gameState.reports.totalIncome - gameState.reports.totalExpense;
        updateReportsDisplay();
        
        if (!gameState.gameProgress.completedQuestions.includes(questionId)) {
            gameState.gameProgress.completedQuestions.push(questionId);
        }
        
        if (gameState.gameProgress.completedQuestions.length === gameState.gameProgress.totalQuestions) {
            gameState.gameProgress.questionsCompleted = true;
            gameState.playerData.level++;
            updatePlayerInfo();
            
            setTimeout(() => {
                alert('恭喜！您已完成所有問題，等級提升了！');
            }, 1000);
        }
        
        saveGameData();
    }
    
    const currentQuestion = document.getElementById(`question-${questionId}`);
    if (currentQuestion) {
        const optionButtons = currentQuestion.querySelectorAll('.option-btn');
        optionButtons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.6';
        });
    }
    
    const nextBtn = document.getElementById('next-question');
    if (nextBtn) {
        nextBtn.disabled = false;
        nextBtn.style.opacity = '1';
    }
}

function hideFeedback() {
    const feedback = document.getElementById('feedback');
    if (feedback) {
        feedback.classList.remove('show');
    }
}

// === 儲存/載入功能 ===
export function saveGameData() {
    try {
        localStorage.setItem('bearBakeryGameState', JSON.stringify(gameState));
    } catch (error) {
        console.error('儲存遊戲資料失敗:', error);
    }
}

export function resetProgress() {
    if (confirm('確定要重置所有遊戲進度嗎？這個操作無法復原！')) {
        localStorage.removeItem('bearBakeryGameState');
        localStorage.removeItem('bakeryGameData');
        localStorage.removeItem('bearBakeryUsers');
        location.reload();
    }
}

export function exportData() {
    const dataStr = JSON.stringify(gameState, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bakery-game-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('遊戲資料已匯出！');
}
