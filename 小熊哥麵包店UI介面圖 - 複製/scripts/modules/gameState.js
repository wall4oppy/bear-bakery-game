export let gameState = {
    currentSection: 'game',
    isLoggedIn: false,
    isGuestMode: false,
    playerData: {
        name: '小熊哥',
        avatar: localStorage.getItem('avatar') || '🧑‍🍳',
        level: 1,
        coins: 1000
    },
    inventory: {
        bread1: 10,
        bread2: 5,
        bread3: 8,
        bread4: 15
    },
    gameProgress: {
        currentStory: 1,
        currentQuestion: 1,
        totalStories: 4,
        totalQuestions: 4,
        completedQuestions: [],
        storyCompleted: false,
        questionsCompleted: false
    },
    reports: {
        totalIncome: 2500,
        totalExpense: 1200,
        netProfit: 1300
    },
    settings: {
        musicVolume: 50,
        soundEffects: true,
        backgroundMusic: true,
        brightness: 'normal',
        language: 'zh-TW'
    },
    currentStoryPage: 0,
    storyPages: [
        { title: '第一章：開店準備', content: '小熊哥決定開一家麵包店，但他發現光會做麵包還不夠，還需要學會如何行銷...' },
        { title: '第二章：行銷初體驗', content: '他開始學習如何吸引顧客，並嘗試各種促銷活動...' }
    ]
};