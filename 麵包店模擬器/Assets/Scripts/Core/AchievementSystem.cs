using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;

namespace BakerySimulator.Core
{
    [Serializable]
    public class Achievement
    {
        public string id;
        public string name;
        public string description;
        public int targetValue;
        public int currentProgress;
        public bool isUnlocked;
        public AchievementReward reward;
        
        public Achievement(string id, string name, string description, int targetValue)
        {
            this.id = id;
            this.name = name;
            this.description = description;
            this.targetValue = targetValue;
            this.currentProgress = 0;
            this.isUnlocked = false;
            this.reward = new AchievementReward();
        }
    }
    
    [Serializable]
    public class AchievementReward
    {
        public int money;
        public int experience;
        public string specialReward;
        
        public AchievementReward(int money = 0, int experience = 0, string specialReward = "")
        {
            this.money = money;
            this.experience = experience;
            this.specialReward = specialReward;
        }
    }
    
    [Serializable]
    public class AchievementData
    {
        public List<Achievement> achievements;
        public int totalUnlocked;
        
        public AchievementData()
        {
            achievements = new List<Achievement>();
            totalUnlocked = 0;
        }
    }
    
    public class AchievementSystem : MonoBehaviour
    {
        private AchievementData achievementData;
        private Dictionary<string, Achievement> achievementDict;
        
        public event Action<Achievement> OnAchievementUnlocked;
        
        private void Awake()
        {
            achievementData = new AchievementData();
            achievementDict = new Dictionary<string, Achievement>();
        }
        
        public void Initialize()
        {
            InitializeAchievements();
            Debug.Log("成就系統初始化完成");
        }
        
        private void InitializeAchievements()
        {
            AddAchievement(new Achievement("first_bread", "初次烘焙", "製作第一個麵包", 1)
            {
                reward = new AchievementReward(100, 10)
            });
            
            AddAchievement(new Achievement("first_sale", "初次交易", "完成第一筆銷售", 1)
            {
                reward = new AchievementReward(50, 5)
            });
            
            AddAchievement(new Achievement("bread_master", "烘焙大師", "製作100個麵包", 100)
            {
                reward = new AchievementReward(1000, 50)
            });
        }
        
        private void AddAchievement(Achievement achievement)
        {
            achievementData.achievements.Add(achievement);
            achievementDict[achievement.id] = achievement;
        }
        
        public void UpdateProgress(string achievementId, int progress)
        {
            if (achievementDict.ContainsKey(achievementId))
            {
                Achievement achievement = achievementDict[achievementId];
                if (!achievement.isUnlocked)
                {
                    achievement.currentProgress += progress;
                    
                    if (achievement.currentProgress >= achievement.targetValue)
                    {
                        UnlockAchievement(achievement);
                    }
                }
            }
        }
        
        private void UnlockAchievement(Achievement achievement)
        {
            achievement.isUnlocked = true;
            achievementData.totalUnlocked++;
            
            OnAchievementUnlocked?.Invoke(achievement);
            Debug.Log($"成就解鎖: {achievement.name}");
        }
        
        public AchievementData GetSaveData()
        {
            return achievementData;
        }
        
        public void LoadData(AchievementData data)
        {
            if (data != null)
            {
                achievementData = data;
                
                achievementDict.Clear();
                foreach (var achievement in achievementData.achievements)
                {
                    achievementDict[achievement.id] = achievement;
                }
            }
        }
    }
} 