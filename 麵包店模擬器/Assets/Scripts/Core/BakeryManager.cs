using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;

namespace BakerySimulator.Core
{
    [Serializable]
    public class BreadType
    {
        public string name;
        public string displayName;
        public int basePrice;
        public int productionTime; // 秒
        public List<IngredientRequirement> ingredients;
        public int difficultyLevel;
        public Sprite icon;
        
        public BreadType(string name, string displayName, int basePrice, int productionTime, int difficultyLevel)
        {
            this.name = name;
            this.displayName = displayName;
            this.basePrice = basePrice;
            this.productionTime = productionTime;
            this.difficultyLevel = difficultyLevel;
            this.ingredients = new List<IngredientRequirement>();
        }
    }
    
    [Serializable]
    public class IngredientRequirement
    {
        public string ingredientName;
        public int amount;
        
        public IngredientRequirement(string name, int amount)
        {
            this.ingredientName = name;
            this.amount = amount;
        }
    }
    
    [Serializable]
    public class BreadInventory
    {
        public string breadName;
        public int quantity;
        public float freshness; // 0-1, 1 是最新鮮
        public DateTime productionTime;
        
        public BreadInventory(string breadName, int quantity, float freshness)
        {
            this.breadName = breadName;
            this.quantity = quantity;
            this.freshness = freshness;
            this.productionTime = DateTime.Now;
        }
    }
    
    [Serializable]
    public class BakeryData
    {
        public List<BreadInventory> inventory;
        public Dictionary<string, int> ingredients;
        public List<string> availableRecipes;
        public int bakeryLevel;
        public int ovenCapacity;
        public float productionEfficiency;
        
        public BakeryData()
        {
            inventory = new List<BreadInventory>();
            ingredients = new Dictionary<string, int>();
            availableRecipes = new List<string>();
            bakeryLevel = 1;
            ovenCapacity = 4;
            productionEfficiency = 1.0f;
        }
    }
    
    public class BakeryManager : MonoBehaviour
    {
        [Header("Bakery Settings")]
        public int maxInventorySlots = 50;
        public float freshnessDecayRate = 0.1f; // 每小時減少的新鮮度
        
        [Header("Bread Types")]
        public List<BreadType> breadTypes;
        
        [Header("Production")]
        public Transform[] ovenSlots;
        public GameObject breadProductionPrefab;
        
        private BakeryData bakeryData;
        private List<BreadProduction> activeProductions;
        private Dictionary<string, BreadType> breadTypeDict;
        
        public event Action<string, int> OnBreadProduced;
        public event Action<string, int> OnIngredientUsed;
        public event Action OnInventoryChanged;
        
        private void Awake()
        {
            bakeryData = new BakeryData();
            activeProductions = new List<BreadProduction>();
            breadTypeDict = new Dictionary<string, BreadType>();
            
            InitializeBreadTypes();
        }
        
        public void Initialize()
        {
            // 初始化基礎配方和材料
            AddRecipe("白吐司");
            AddRecipe("全麥麵包");
            
            // 初始材料
            AddIngredient("麵粉", 50);
            AddIngredient("酵母", 20);
            AddIngredient("鹽", 30);
            AddIngredient("糖", 25);
            AddIngredient("奶油", 15);
            
            StartCoroutine(UpdateFreshness());
            Debug.Log("麵包店系統初始化完成");
        }
        
        private void InitializeBreadTypes()
        {
            breadTypes = new List<BreadType>
            {
                new BreadType("白吐司", "經典白吐司", 25, 300, 1),
                new BreadType("全麥麵包", "健康全麥麵包", 35, 360, 2),
                new BreadType("法式長棍", "傳統法式長棍", 40, 420, 3),
                new BreadType("可頌", "酥脆可頌", 45, 480, 4),
                new BreadType("丹麥麵包", "精緻丹麥麵包", 55, 540, 5)
            };
            
            // 設置配方
            breadTypes[0].ingredients.AddRange(new[] {
                new IngredientRequirement("麵粉", 3),
                new IngredientRequirement("酵母", 1),
                new IngredientRequirement("鹽", 1)
            });
            
            breadTypes[1].ingredients.AddRange(new[] {
                new IngredientRequirement("麵粉", 2),
                new IngredientRequirement("全麥麵粉", 2),
                new IngredientRequirement("酵母", 1),
                new IngredientRequirement("鹽", 1)
            });
            
            foreach (var breadType in breadTypes)
            {
                breadTypeDict[breadType.name] = breadType;
            }
        }
        
        public bool StartBreadProduction(string breadName)
        {
            if (!breadTypeDict.ContainsKey(breadName))
            {
                Debug.LogWarning($"找不到麵包類型: {breadName}");
                return false;
            }
            
            if (!bakeryData.availableRecipes.Contains(breadName))
            {
                Debug.LogWarning($"尚未解鎖配方: {breadName}");
                return false;
            }
            
            if (activeProductions.Count >= bakeryData.ovenCapacity)
            {
                Debug.LogWarning("烤箱已滿，無法開始新的生產");
                return false;
            }
            
            BreadType breadType = breadTypeDict[breadName];
            
            // 檢查材料是否足夠
            foreach (var ingredient in breadType.ingredients)
            {
                if (!bakeryData.ingredients.ContainsKey(ingredient.ingredientName) ||
                    bakeryData.ingredients[ingredient.ingredientName] < ingredient.amount)
                {
                    Debug.LogWarning($"材料不足: {ingredient.ingredientName}");
                    return false;
                }
            }
            
            // 消耗材料
            foreach (var ingredient in breadType.ingredients)
            {
                bakeryData.ingredients[ingredient.ingredientName] -= ingredient.amount;
                OnIngredientUsed?.Invoke(ingredient.ingredientName, ingredient.amount);
            }
            
            // 開始生產
            GameObject productionObj = Instantiate(breadProductionPrefab, GetAvailableOvenSlot());
            BreadProduction production = productionObj.GetComponent<BreadProduction>();
            production.Initialize(breadType, OnProductionComplete);
            activeProductions.Add(production);
            
            Debug.Log($"開始生產: {breadType.displayName}");
            return true;
        }
        
        private Transform GetAvailableOvenSlot()
        {
            for (int i = 0; i < ovenSlots.Length && i < bakeryData.ovenCapacity; i++)
            {
                if (ovenSlots[i].childCount == 0)
                {
                    return ovenSlots[i];
                }
            }
            return transform; // 備用位置
        }
        
        private void OnProductionComplete(BreadProduction production)
        {
            string breadName = production.breadType.name;
            int quantity = 1; // 基礎產量
            
            // 計算產量加成
            quantity = Mathf.RoundToInt(quantity * bakeryData.productionEfficiency);
            
            AddBreadToInventory(breadName, quantity);
            activeProductions.Remove(production);
            Destroy(production.gameObject);
            
            OnBreadProduced?.Invoke(breadName, quantity);
            Debug.Log($"完成生產: {breadTypeDict[breadName].displayName} x{quantity}");
        }
        
        public void AddBreadToInventory(string breadName, int quantity)
        {
            var existingInventory = bakeryData.inventory.Find(x => x.breadName == breadName && x.freshness > 0.8f);
            
            if (existingInventory != null)
            {
                existingInventory.quantity += quantity;
            }
            else
            {
                bakeryData.inventory.Add(new BreadInventory(breadName, quantity, 1.0f));
            }
            
            OnInventoryChanged?.Invoke();
        }
        
        public bool SellBread(string breadName, int quantity)
        {
            var inventory = bakeryData.inventory.Find(x => x.breadName == breadName && x.quantity >= quantity);
            
            if (inventory != null)
            {
                inventory.quantity -= quantity;
                if (inventory.quantity <= 0)
                {
                    bakeryData.inventory.Remove(inventory);
                }
                OnInventoryChanged?.Invoke();
                return true;
            }
            
            return false;
        }
        
        public void AddIngredient(string ingredientName, int amount)
        {
            if (bakeryData.ingredients.ContainsKey(ingredientName))
            {
                bakeryData.ingredients[ingredientName] += amount;
            }
            else
            {
                bakeryData.ingredients[ingredientName] = amount;
            }
        }
        
        public void AddRecipe(string breadName)
        {
            if (!bakeryData.availableRecipes.Contains(breadName))
            {
                bakeryData.availableRecipes.Add(breadName);
                Debug.Log($"解鎖新配方: {breadName}");
            }
        }
        
        public int GetBreadQuantity(string breadName)
        {
            int total = 0;
            foreach (var inventory in bakeryData.inventory)
            {
                if (inventory.breadName == breadName)
                {
                    total += inventory.quantity;
                }
            }
            return total;
        }
        
        public int GetIngredientQuantity(string ingredientName)
        {
            return bakeryData.ingredients.ContainsKey(ingredientName) ? 
                   bakeryData.ingredients[ingredientName] : 0;
        }
        
        public List<string> GetAvailableRecipes()
        {
            return new List<string>(bakeryData.availableRecipes);
        }
        
        private IEnumerator UpdateFreshness()
        {
            while (true)
            {
                yield return new WaitForSeconds(3600); // 每小時更新一次
                
                for (int i = bakeryData.inventory.Count - 1; i >= 0; i--)
                {
                    var inventory = bakeryData.inventory[i];
                    inventory.freshness -= freshnessDecayRate;
                    
                    if (inventory.freshness <= 0)
                    {
                        Debug.Log($"{inventory.breadName} 已過期，移除 {inventory.quantity} 個");
                        bakeryData.inventory.RemoveAt(i);
                    }
                }
                
                OnInventoryChanged?.Invoke();
            }
        }
        
        public BakeryData GetSaveData()
        {
            return bakeryData;
        }
        
        public void LoadData(BakeryData data)
        {
            if (data != null)
            {
                bakeryData = data;
                OnInventoryChanged?.Invoke();
            }
        }
        
        public void UpgradeBakery()
        {
            bakeryData.bakeryLevel++;
            bakeryData.ovenCapacity += 2;
            bakeryData.productionEfficiency += 0.1f;
            
            Debug.Log($"麵包店升級至等級 {bakeryData.bakeryLevel}");
        }
    }
} 