// === Modal 互動功能 ===
document.addEventListener('DOMContentLoaded', function() {
    const mainModal = document.getElementById('main-modal');
    if (!mainModal) {
        console.error('錯誤：找不到 Modal 元素！');
        return;
    }

    const modalCloseBtn = mainModal.querySelector('[data-modal-close]');
    const modalTabs = mainModal.querySelectorAll('.modal-tab');
    const modalContent = mainModal.querySelector('.modal-content');

    // 開啟 Modal 的按鈕們
    const openProfileBtn = document.getElementById('open-profile-button');
    const openAchievementsBtn = document.getElementById('open-achievements-button');
    const openLeaderboardBtn = document.getElementById('open-leaderboard-button');
    const openStockBtn = document.getElementById('open-stocking-button');

    // 關閉 Modal 的通用函式
    function closeModal() {
        mainModal.classList.remove('active');
    }

    // 開啟 Modal 並切換到指定頁籤的函式
    function openModal(tabName) {
        modalTabs.forEach(t => t.classList.remove('active'));
        const targetTab = mainModal.querySelector(`.modal-tab[data-tab="${tabName}"]`);
        if(targetTab) {
            targetTab.classList.add('active');
        }
        updateModalContent(tabName);
        mainModal.classList.add('active');
    }

    // 更新 Modal 內容的函式
    function updateModalContent(tabName) {
        const contentTitle = tabName.charAt(0).toUpperCase() + tabName.slice(1);
        modalContent.innerHTML = `<h1>${contentTitle}</h1><p>這裡是 ${tabName} 的內容。</p>`;
    }

    // 綁定事件
    if (openProfileBtn) openProfileBtn.addEventListener('click', () => openModal('profile'));
    if (openAchievementsBtn) openAchievementsBtn.addEventListener('click', () => openModal('achievements'));
    if (openLeaderboardBtn) openLeaderboardBtn.addEventListener('click', () => openModal('leaderboard'));
    if (openStockBtn) openStockBtn.addEventListener('click', () => openModal('stock'));

    modalTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            modalTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            updateModalContent(tabName);
        });
    });

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    mainModal.addEventListener('click', (e) => {
        if (e.target === mainModal) {
            closeModal();
        }
    });
}); 