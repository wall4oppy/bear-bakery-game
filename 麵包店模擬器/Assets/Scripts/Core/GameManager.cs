using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace BakerySimulator.Core
{
    public class GameManager : MonoBehaviour
    {
        public static GameManager Instance { get; private set; }
        
        [Header("Game Settings")]
        public bool isGamePaused = false;
        public float gameSpeed = 1.0f;
        
        [Header("Systems")]
        public BakeryManager bakeryManager;
        public EconomySystem economySystem;
        public CustomerManager customerManager;
        public EmployeeManager employeeManager;
        public AchievementSystem achievementSystem;
        public SaveLoadSystem saveLoadSystem;
        
        [Header("UI")]
        public UIManager uiManager;
        
        public delegate void GameEvent();
        public static event GameEvent OnGamePaused;
        public static event GameEvent OnGameResumed;
        public static event GameEvent OnGameSpeedChanged;
        
        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
                InitializeSystems();
            }
            else
            {
                Destroy(gameObject);
            }
        }
        
        private void Start()
        {
            StartNewGame();
        }
        
        private void Update()
        {
            HandleInput();
        }
        
        private void InitializeSystems()
        {
            // 確保所有系統都已初始化
            if (bakeryManager == null) bakeryManager = FindObjectOfType<BakeryManager>();
            if (economySystem == null) economySystem = FindObjectOfType<EconomySystem>();
            if (customerManager == null) customerManager = FindObjectOfType<CustomerManager>();
            if (employeeManager == null) employeeManager = FindObjectOfType<EmployeeManager>();
            if (achievementSystem == null) achievementSystem = FindObjectOfType<AchievementSystem>();
            if (saveLoadSystem == null) saveLoadSystem = FindObjectOfType<SaveLoadSystem>();
            if (uiManager == null) uiManager = FindObjectOfType<UIManager>();
        }
        
        public void StartNewGame()
        {
            Debug.Log("開始新遊戲");
            
            // 初始化所有系統
            economySystem?.Initialize();
            bakeryManager?.Initialize();
            customerManager?.Initialize();
            employeeManager?.Initialize();
            achievementSystem?.Initialize();
            
            // 設置初始狀態
            isGamePaused = false;
            gameSpeed = 1.0f;
            Time.timeScale = gameSpeed;
            
            uiManager?.ShowGameUI();
        }
        
        public void LoadGame(GameSaveData saveData)
        {
            Debug.Log("載入遊戲");
            
            // 從存檔資料載入各系統狀態
            economySystem?.LoadData(saveData.economyData);
            bakeryManager?.LoadData(saveData.bakeryData);
            customerManager?.LoadData(saveData.customerData);
            employeeManager?.LoadData(saveData.employeeData);
            achievementSystem?.LoadData(saveData.achievementData);
            
            isGamePaused = saveData.isPaused;
            gameSpeed = saveData.gameSpeed;
            Time.timeScale = isGamePaused ? 0 : gameSpeed;
            
            uiManager?.ShowGameUI();
        }
        
        public void SaveGame()
        {
            if (saveLoadSystem != null)
            {
                GameSaveData saveData = new GameSaveData
                {
                    economyData = economySystem?.GetSaveData(),
                    bakeryData = bakeryManager?.GetSaveData(),
                    customerData = customerManager?.GetSaveData(),
                    employeeData = employeeManager?.GetSaveData(),
                    achievementData = achievementSystem?.GetSaveData(),
                    isPaused = isGamePaused,
                    gameSpeed = gameSpeed,
                    saveTime = System.DateTime.Now.ToBinary()
                };
                
                saveLoadSystem.SaveGame(saveData);
            }
        }
        
        public void PauseGame()
        {
            isGamePaused = true;
            Time.timeScale = 0;
            OnGamePaused?.Invoke();
            Debug.Log("遊戲暫停");
        }
        
        public void ResumeGame()
        {
            isGamePaused = false;
            Time.timeScale = gameSpeed;
            OnGameResumed?.Invoke();
            Debug.Log("遊戲繼續");
        }
        
        public void SetGameSpeed(float speed)
        {
            gameSpeed = Mathf.Clamp(speed, 0.5f, 3.0f);
            if (!isGamePaused)
            {
                Time.timeScale = gameSpeed;
            }
            OnGameSpeedChanged?.Invoke();
            Debug.Log($"遊戲速度設為: {gameSpeed}x");
        }
        
        public void ReturnToMainMenu()
        {
            SaveGame();
            Time.timeScale = 1.0f;
            SceneManager.LoadScene("MainMenu");
        }
        
        public void QuitGame()
        {
            SaveGame();
            
#if UNITY_EDITOR
            UnityEditor.EditorApplication.isPlaying = false;
#else
            Application.Quit();
#endif
        }
        
        private void HandleInput()
        {
            if (Input.GetKeyDown(KeyCode.Space))
            {
                if (isGamePaused)
                    ResumeGame();
                else
                    PauseGame();
            }
            
            if (Input.GetKeyDown(KeyCode.Escape))
            {
                uiManager?.TogglePauseMenu();
            }
            
            // 遊戲速度快捷鍵
            if (Input.GetKeyDown(KeyCode.Alpha1)) SetGameSpeed(0.5f);
            if (Input.GetKeyDown(KeyCode.Alpha2)) SetGameSpeed(1.0f);
            if (Input.GetKeyDown(KeyCode.Alpha3)) SetGameSpeed(2.0f);
            if (Input.GetKeyDown(KeyCode.Alpha4)) SetGameSpeed(3.0f);
        }
        
        private void OnApplicationPause(bool pauseStatus)
        {
            if (pauseStatus && !isGamePaused)
            {
                PauseGame();
            }
        }
        
        private void OnApplicationFocus(bool hasFocus)
        {
            if (!hasFocus && !isGamePaused)
            {
                PauseGame();
            }
        }
        
        private void OnDestroy()
        {
            SaveGame();
        }
    }
} 