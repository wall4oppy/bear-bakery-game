using System;
using System.Collections.Generic;
using UnityEngine;

namespace BakerySimulator.Core
{
    [Serializable]
    public class GameSaveData
    {
        [Header("Game State")]
        public long saveTime;
        public bool isPaused;
        public float gameSpeed;
        public int gameVersion;
        
        [Header("System Data")]
        public EconomyData economyData;
        public BakeryData bakeryData;
        public CustomerData customerData;
        public EmployeeData employeeData;
        public AchievementData achievementData;
        public SettingsData settingsData;
        
        [Header("Player Progress")]
        public int playerLevel;
        public float playerExperience;
        public List<string> unlockedFeatures;
        public Dictionary<string, object> customData;
        
        public GameSaveData()
        {
            saveTime = DateTime.Now.ToBinary();
            isPaused = false;
            gameSpeed = 1.0f;
            gameVersion = 1;
            
            economyData = new EconomyData();
            bakeryData = new BakeryData();
            customerData = new CustomerData();
            employeeData = new EmployeeData();
            achievementData = new AchievementData();
            settingsData = new SettingsData();
            
            playerLevel = 1;
            playerExperience = 0f;
            unlockedFeatures = new List<string>();
            customData = new Dictionary<string, object>();
        }
        
        public DateTime GetSaveDateTime()
        {
            return DateTime.FromBinary(saveTime);
        }
        
        public string GetSaveTimeString()
        {
            return GetSaveDateTime().ToString("yyyy年MM月dd日 HH:mm:ss");
        }
        
        public bool IsValid()
        {
            return economyData != null && 
                   bakeryData != null && 
                   customerData != null && 
                   employeeData != null && 
                   achievementData != null;
        }
    }
    
    [Serializable]
    public class SettingsData
    {
        public float masterVolume;
        public float musicVolume;
        public float sfxVolume;
        public bool fullscreen;
        public int resolutionWidth;
        public int resolutionHeight;
        public int qualityLevel;
        public string language;
        public bool showTutorials;
        public bool autoSave;
        public float autoSaveInterval;
        
        public SettingsData()
        {
            masterVolume = 1.0f;
            musicVolume = 0.8f;
            sfxVolume = 1.0f;
            fullscreen = true;
            resolutionWidth = 1920;
            resolutionHeight = 1080;
            qualityLevel = 2;
            language = "zh-TW";
            showTutorials = true;
            autoSave = true;
            autoSaveInterval = 300f; // 5分鐘
        }
    }
} 