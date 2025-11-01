using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System.IO;
using System;

namespace BakerySimulator.Core
{
    public class SaveLoadSystem : MonoBehaviour
    {
        [Header("Save Settings")]
        public string saveFileName = "bakery_save.json";
        public bool autoSave = true;
        public float autoSaveInterval = 300f; // 5分鐘
        
        private string savePath;
        
        public event Action OnGameSaved;
        public event Action OnGameLoaded;
        
        private void Awake()
        {
            savePath = Path.Combine(Application.persistentDataPath, saveFileName);
        }
        
        private void Start()
        {
            if (autoSave)
            {
                StartCoroutine(AutoSaveCoroutine());
            }
        }
        
        public void SaveGame(GameSaveData saveData)
        {
            try
            {
                saveData.saveTime = DateTime.Now.ToBinary();
                string jsonData = JsonUtility.ToJson(saveData, true);
                File.WriteAllText(savePath, jsonData);
                
                OnGameSaved?.Invoke();
                Debug.Log($"遊戲已保存到: {savePath}");
            }
            catch (Exception e)
            {
                Debug.LogError($"保存遊戲失敗: {e.Message}");
            }
        }
        
        public GameSaveData LoadGame()
        {
            try
            {
                if (File.Exists(savePath))
                {
                    string jsonData = File.ReadAllText(savePath);
                    GameSaveData saveData = JsonUtility.FromJson<GameSaveData>(jsonData);
                    
                    if (saveData.IsValid())
                    {
                        OnGameLoaded?.Invoke();
                        Debug.Log("遊戲載入成功");
                        return saveData;
                    }
                    else
                    {
                        Debug.LogWarning("存檔文件損壞");
                        return null;
                    }
                }
                else
                {
                    Debug.Log("找不到存檔文件");
                    return null;
                }
            }
            catch (Exception e)
            {
                Debug.LogError($"載入遊戲失敗: {e.Message}");
                return null;
            }
        }
        
        public bool HasSaveFile()
        {
            return File.Exists(savePath);
        }
        
        public void DeleteSaveFile()
        {
            try
            {
                if (File.Exists(savePath))
                {
                    File.Delete(savePath);
                    Debug.Log("存檔文件已刪除");
                }
            }
            catch (Exception e)
            {
                Debug.LogError($"刪除存檔失敗: {e.Message}");
            }
        }
        
        private IEnumerator AutoSaveCoroutine()
        {
            while (true)
            {
                yield return new WaitForSeconds(autoSaveInterval);
                
                if (GameManager.Instance != null)
                {
                    GameManager.Instance.SaveGame();
                }
            }
        }
        
        public string GetSaveFileInfo()
        {
            if (HasSaveFile())
            {
                try
                {
                    FileInfo fileInfo = new FileInfo(savePath);
                    return $"存檔時間: {fileInfo.LastWriteTime:yyyy年MM月dd日 HH:mm:ss}";
                }
                catch
                {
                    return "無法讀取存檔信息";
                }
            }
            
            return "無存檔";
        }
    }
} 