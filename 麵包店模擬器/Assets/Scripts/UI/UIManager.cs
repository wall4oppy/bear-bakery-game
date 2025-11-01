using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

namespace BakerySimulator.Core
{
    public class UIManager : MonoBehaviour
    {
        [Header("Main UI Panels")]
        public GameObject mainGameUI;
        public GameObject pauseMenu;
        public GameObject mainMenu;
        public GameObject settingsMenu;
        public GameObject achievementPanel;
        
        [Header("Game UI Elements")]
        public Text moneyText;
        public Text dayText;
        public Slider customerSatisfactionSlider;
        public Text customerSatisfactionText;
        
        [Header("Production UI")]
        public Transform productionButtonsParent;
        public GameObject productionButtonPrefab;
        public Transform inventoryListParent;
        public GameObject inventoryItemPrefab;
        
        [Header("Employee UI")]
        public GameObject employeePanel;
        public Transform employeeListParent;
        public GameObject employeeItemPrefab;
        
        [Header("Notifications")]
        public GameObject notificationPrefab;
        public Transform notificationParent;
        
        private EconomySystem economySystem;
        private BakeryManager bakeryManager;
        private CustomerManager customerManager;
        private EmployeeManager employeeManager;
        private AchievementSystem achievementSystem;
        
        private void Awake()
        {
            // 初始化時隱藏所有面板
            HideAllPanels();
        }
        
        private void Start()
        {
            // 獲取系統引用
            economySystem = FindObjectOfType<EconomySystem>();
            bakeryManager = FindObjectOfType<BakeryManager>();
            customerManager = FindObjectOfType<CustomerManager>();
            employeeManager = FindObjectOfType<EmployeeManager>();
            achievementSystem = FindObjectOfType<AchievementSystem>();
            
            // 訂閱事件
            SubscribeToEvents();
            
            // 初始化UI
            InitializeUI();
        }
        
        private void SubscribeToEvents()
        {
            if (economySystem != null)
            {
                economySystem.OnMoneyChanged += UpdateMoneyDisplay;
            }
            
            if (bakeryManager != null)
            {
                bakeryManager.OnInventoryChanged += UpdateInventoryDisplay;
            }
            
            if (customerManager != null)
            {
                customerManager.OnCustomerLeft += UpdateCustomerSatisfaction;
            }
            
            if (achievementSystem != null)
            {
                achievementSystem.OnAchievementUnlocked += ShowAchievementNotification;
            }
        }
        
        private void InitializeUI()
        {
            SetupProductionButtons();
            UpdateAllDisplays();
        }
        
        private void HideAllPanels()
        {
            if (mainGameUI != null) mainGameUI.SetActive(false);
            if (pauseMenu != null) pauseMenu.SetActive(false);
            if (mainMenu != null) mainMenu.SetActive(true); // 開始時顯示主菜單
            if (settingsMenu != null) settingsMenu.SetActive(false);
            if (achievementPanel != null) achievementPanel.SetActive(false);
            if (employeePanel != null) employeePanel.SetActive(false);
        }
        
        public void ShowMainMenu()
        {
            HideAllPanels();
            if (mainMenu != null) mainMenu.SetActive(true);
        }
        
        public void ShowGameUI()
        {
            HideAllPanels();
            if (mainGameUI != null) mainGameUI.SetActive(true);
            UpdateAllDisplays();
        }
        
        public void ShowPauseMenu()
        {
            if (pauseMenu != null) pauseMenu.SetActive(true);
        }
        
        public void HidePauseMenu()
        {
            if (pauseMenu != null) pauseMenu.SetActive(false);
        }
        
        public void TogglePauseMenu()
        {
            if (pauseMenu != null)
            {
                bool isActive = pauseMenu.activeSelf;
                pauseMenu.SetActive(!isActive);
                
                if (!isActive)
                {
                    GameManager.Instance?.PauseGame();
                }
                else
                {
                    GameManager.Instance?.ResumeGame();
                }
            }
        }
        
        public void ShowAchievementPanel()
        {
            if (achievementPanel != null)
            {
                achievementPanel.SetActive(true);
                UpdateAchievementDisplay();
            }
        }
        
        public void ShowEmployeePanel()
        {
            if (employeePanel != null)
            {
                employeePanel.SetActive(true);
                UpdateEmployeeDisplay();
            }
        }
        
        private void SetupProductionButtons()
        {
            if (bakeryManager == null || productionButtonsParent == null || productionButtonPrefab == null)
                return;
            
            var availableRecipes = bakeryManager.GetAvailableRecipes();
            
            foreach (string recipe in availableRecipes)
            {
                GameObject buttonObj = Instantiate(productionButtonPrefab, productionButtonsParent);
                Button button = buttonObj.GetComponent<Button>();
                Text buttonText = buttonObj.GetComponentInChildren<Text>();
                
                if (buttonText != null)
                {
                    buttonText.text = recipe;
                }
                
                if (button != null)
                {
                    string breadName = recipe; // 閉包變量
                    button.onClick.AddListener(() => OnProductionButtonClicked(breadName));
                }
            }
        }
        
        private void OnProductionButtonClicked(string breadName)
        {
            if (bakeryManager != null)
            {
                bool success = bakeryManager.StartBreadProduction(breadName);
                if (!success)
                {
                    ShowNotification($"無法製作 {breadName}：材料不足或烤箱已滿", Color.red);
                }
                else
                {
                    ShowNotification($"開始製作 {breadName}", Color.green);
                }
            }
        }
        
        private void UpdateMoneyDisplay(float currentMoney)
        {
            if (moneyText != null)
            {
                moneyText.text = $"${currentMoney:F2}";
            }
        }
        
        private void UpdateInventoryDisplay()
        {
            if (inventoryListParent == null || inventoryItemPrefab == null || bakeryManager == null)
                return;
            
            // 清除現有項目
            foreach (Transform child in inventoryListParent)
            {
                Destroy(child.gameObject);
            }
            
            // 添加庫存項目
            var availableRecipes = bakeryManager.GetAvailableRecipes();
            foreach (string breadName in availableRecipes)
            {
                int quantity = bakeryManager.GetBreadQuantity(breadName);
                
                GameObject itemObj = Instantiate(inventoryItemPrefab, inventoryListParent);
                Text itemText = itemObj.GetComponentInChildren<Text>();
                
                if (itemText != null)
                {
                    itemText.text = $"{breadName}: {quantity}";
                }
            }
        }
        
        private void UpdateCustomerSatisfaction(Customer customer)
        {
            if (customerManager == null) return;
            
            float satisfaction = customerManager.GetAverageSatisfaction();
            
            if (customerSatisfactionSlider != null)
            {
                customerSatisfactionSlider.value = satisfaction;
            }
            
            if (customerSatisfactionText != null)
            {
                customerSatisfactionText.text = $"客戶滿意度: {satisfaction:P0}";
            }
        }
        
        private void UpdateEmployeeDisplay()
        {
            if (employeeManager == null || employeeListParent == null || employeeItemPrefab == null)
                return;
            
            // 清除現有項目
            foreach (Transform child in employeeListParent)
            {
                Destroy(child.gameObject);
            }
            
            // 添加員工項目
            var employees = employeeManager.GetEmployees();
            foreach (var employee in employees)
            {
                GameObject itemObj = Instantiate(employeeItemPrefab, employeeListParent);
                Text itemText = itemObj.GetComponentInChildren<Text>();
                
                if (itemText != null)
                {
                    itemText.text = $"{employee.name} - {employee.type} (等級 {employee.skillLevel})";
                }
            }
        }
        
        private void UpdateAchievementDisplay()
        {
            // 更新成就面板顯示
            if (achievementSystem != null)
            {
                var achievements = achievementSystem.GetAllAchievements();
                // 這裡可以實現成就列表的顯示
            }
        }
        
        private void UpdateAllDisplays()
        {
            if (economySystem != null)
            {
                UpdateMoneyDisplay(economySystem.GetCurrentMoney());
            }
            
            UpdateInventoryDisplay();
            
            if (customerManager != null)
            {
                float satisfaction = customerManager.GetAverageSatisfaction();
                if (customerSatisfactionSlider != null)
                {
                    customerSatisfactionSlider.value = satisfaction;
                }
                if (customerSatisfactionText != null)
                {
                    customerSatisfactionText.text = $"客戶滿意度: {satisfaction:P0}";
                }
            }
            
            if (dayText != null && economySystem != null)
            {
                // 這裡可以顯示遊戲天數
                dayText.text = "第 1 天"; // 簡化顯示
            }
        }
        
        private void ShowAchievementNotification(Achievement achievement)
        {
            ShowNotification($"🏆 成就解鎖: {achievement.name}", Color.yellow);
        }
        
        public void ShowNotification(string message, Color color)
        {
            if (notificationPrefab == null || notificationParent == null)
            {
                Debug.Log($"通知: {message}");
                return;
            }
            
            GameObject notification = Instantiate(notificationPrefab, notificationParent);
            Text notificationText = notification.GetComponentInChildren<Text>();
            
            if (notificationText != null)
            {
                notificationText.text = message;
                notificationText.color = color;
            }
            
            // 3秒後自動消失
            StartCoroutine(DestroyNotificationAfterDelay(notification, 3f));
        }
        
        private IEnumerator DestroyNotificationAfterDelay(GameObject notification, float delay)
        {
            yield return new WaitForSeconds(delay);
            if (notification != null)
            {
                Destroy(notification);
            }
        }
        
        // UI按鈕事件
        public void OnStartGameClicked()
        {
            ShowGameUI();
            GameManager.Instance?.StartNewGame();
        }
        
        public void OnLoadGameClicked()
        {
            var saveLoadSystem = FindObjectOfType<SaveLoadSystem>();
            if (saveLoadSystem != null && saveLoadSystem.HasSaveFile())
            {
                var saveData = saveLoadSystem.LoadGame();
                if (saveData != null)
                {
                    GameManager.Instance?.LoadGame(saveData);
                    ShowGameUI();
                }
            }
            else
            {
                ShowNotification("找不到存檔文件", Color.red);
            }
        }
        
        public void OnSaveGameClicked()
        {
            GameManager.Instance?.SaveGame();
            ShowNotification("遊戲已保存", Color.green);
        }
        
        public void OnSettingsClicked()
        {
            if (settingsMenu != null)
            {
                settingsMenu.SetActive(!settingsMenu.activeSelf);
            }
        }
        
        public void OnQuitGameClicked()
        {
            GameManager.Instance?.QuitGame();
        }
        
        public void OnResumeClicked()
        {
            HidePauseMenu();
            GameManager.Instance?.ResumeGame();
        }
        
        public void OnReturnToMainMenuClicked()
        {
            GameManager.Instance?.ReturnToMainMenu();
            ShowMainMenu();
        }
    }
} 