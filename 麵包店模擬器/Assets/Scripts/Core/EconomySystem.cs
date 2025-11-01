using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;

namespace BakerySimulator.Core
{
    [Serializable]
    public class Transaction
    {
        public string type; // "收入" 或 "支出"
        public string category; // "銷售", "採購", "薪資", "租金" 等
        public string description;
        public float amount;
        public DateTime timestamp;
        
        public Transaction(string type, string category, string description, float amount)
        {
            this.type = type;
            this.category = category;
            this.description = description;
            this.amount = amount;
            this.timestamp = DateTime.Now;
        }
    }
    
    [Serializable]
    public class PriceData
    {
        public string itemName;
        public float basePrice;
        public float currentPrice;
        public float demandMultiplier;
        public float qualityMultiplier;
        
        public PriceData(string itemName, float basePrice)
        {
            this.itemName = itemName;
            this.basePrice = basePrice;
            this.currentPrice = basePrice;
            this.demandMultiplier = 1.0f;
            this.qualityMultiplier = 1.0f;
        }
    }
    
    [Serializable]
    public class EconomyData
    {
        public float currentMoney;
        public float totalRevenue;
        public float totalExpenses;
        public List<Transaction> transactionHistory;
        public Dictionary<string, PriceData> priceDict;
        public float dailyRent;
        public float employeeSalaries;
        public int gameDay;
        
        public EconomyData()
        {
            currentMoney = 5000.0f; // 初始金錢
            totalRevenue = 0f;
            totalExpenses = 0f;
            transactionHistory = new List<Transaction>();
            priceDict = new Dictionary<string, PriceData>();
            dailyRent = 200.0f;
            employeeSalaries = 0f;
            gameDay = 1;
        }
    }
    
    public class EconomySystem : MonoBehaviour
    {
        [Header("Economy Settings")]
        public float startingMoney = 5000.0f;
        public float dailyRentCost = 200.0f;
        public float marketDemandVariation = 0.2f;
        
        private EconomyData economyData;
        private Dictionary<string, float> ingredientPrices;
        
        public event Action<float> OnMoneyChanged;
        public event Action<Transaction> OnTransactionAdded;
        public event Action OnDailyReportGenerated;
        public event Action OnBankruptcy;
        
        private void Awake()
        {
            economyData = new EconomyData();
            ingredientPrices = new Dictionary<string, float>();
            InitializePrices();
        }
        
        public void Initialize()
        {
            economyData.currentMoney = startingMoney;
            economyData.dailyRent = dailyRentCost;
            
            StartCoroutine(DailyEconomicCycle());
            Debug.Log($"經濟系統初始化完成，初始資金: ${economyData.currentMoney:F2}");
        }
        
        private void InitializePrices()
        {
            // 初始化麵包價格
            economyData.priceDict["白吐司"] = new PriceData("白吐司", 25f);
            economyData.priceDict["全麥麵包"] = new PriceData("全麥麵包", 35f);
            economyData.priceDict["法式長棍"] = new PriceData("法式長棍", 40f);
            economyData.priceDict["可頌"] = new PriceData("可頌", 45f);
            economyData.priceDict["丹麥麵包"] = new PriceData("丹麥麵包", 55f);
            
            // 初始化材料成本
            ingredientPrices["麵粉"] = 2.0f;
            ingredientPrices["全麥麵粉"] = 2.5f;
            ingredientPrices["酵母"] = 1.5f;
            ingredientPrices["鹽"] = 0.5f;
            ingredientPrices["糖"] = 1.0f;
            ingredientPrices["奶油"] = 3.0f;
            ingredientPrices["雞蛋"] = 0.8f;
            ingredientPrices["牛奶"] = 1.2f;
        }
        
        public bool SpendMoney(float amount, string category, string description)
        {
            if (economyData.currentMoney >= amount)
            {
                economyData.currentMoney -= amount;
                economyData.totalExpenses += amount;
                
                Transaction transaction = new Transaction("支出", category, description, amount);
                economyData.transactionHistory.Add(transaction);
                
                OnMoneyChanged?.Invoke(economyData.currentMoney);
                OnTransactionAdded?.Invoke(transaction);
                
                Debug.Log($"支出: ${amount:F2} - {description}");
                
                CheckBankruptcy();
                return true;
            }
            else
            {
                Debug.LogWarning($"資金不足，無法支付 ${amount:F2}");
                return false;
            }
        }
        
        public void EarnMoney(float amount, string category, string description)
        {
            economyData.currentMoney += amount;
            economyData.totalRevenue += amount;
            
            Transaction transaction = new Transaction("收入", category, description, amount);
            economyData.transactionHistory.Add(transaction);
            
            OnMoneyChanged?.Invoke(economyData.currentMoney);
            OnTransactionAdded?.Invoke(transaction);
            
            Debug.Log($"收入: ${amount:F2} - {description}");
        }
        
        public float SellBread(string breadName, int quantity, float customerSatisfaction = 1.0f)
        {
            if (!economyData.priceDict.ContainsKey(breadName))
            {
                Debug.LogWarning($"找不到商品價格: {breadName}");
                return 0f;
            }
            
            PriceData priceData = economyData.priceDict[breadName];
            float unitPrice = priceData.currentPrice * customerSatisfaction;
            float totalAmount = unitPrice * quantity;
            
            EarnMoney(totalAmount, "銷售", $"銷售 {breadName} x{quantity}");
            
            // 更新需求數據
            UpdateDemand(breadName, quantity);
            
            return totalAmount;
        }
        
        public float BuyIngredients(string ingredientName, int quantity)
        {
            if (!ingredientPrices.ContainsKey(ingredientName))
            {
                Debug.LogWarning($"找不到材料價格: {ingredientName}");
                return 0f;
            }
            
            float unitPrice = ingredientPrices[ingredientName];
            float totalCost = unitPrice * quantity;
            
            if (SpendMoney(totalCost, "採購", $"購買 {ingredientName} x{quantity}"))
            {
                return totalCost;
            }
            
            return 0f;
        }
        
        public void SetBreadPrice(string breadName, float newPrice)
        {
            if (economyData.priceDict.ContainsKey(breadName))
            {
                economyData.priceDict[breadName].currentPrice = newPrice;
                Debug.Log($"設定 {breadName} 價格為 ${newPrice:F2}");
            }
        }
        
        public float GetBreadPrice(string breadName)
        {
            if (economyData.priceDict.ContainsKey(breadName))
            {
                return economyData.priceDict[breadName].currentPrice;
            }
            return 0f;
        }
        
        public float GetIngredientPrice(string ingredientName)
        {
            return ingredientPrices.ContainsKey(ingredientName) ? 
                   ingredientPrices[ingredientName] : 0f;
        }
        
        private void UpdateDemand(string breadName, int soldQuantity)
        {
            if (economyData.priceDict.ContainsKey(breadName))
            {
                PriceData priceData = economyData.priceDict[breadName];
                
                // 銷量越好，需求倍數略微上升
                float demandIncrease = soldQuantity * 0.01f;
                priceData.demandMultiplier = Mathf.Clamp(
                    priceData.demandMultiplier + demandIncrease, 
                    0.5f, 2.0f
                );
                
                // 根據需求調整市場價格建議
                float suggestedPrice = priceData.basePrice * priceData.demandMultiplier;
                Debug.Log($"{breadName} 市場建議價格: ${suggestedPrice:F2}");
            }
        }
        
        private IEnumerator DailyEconomicCycle()
        {
            while (true)
            {
                yield return new WaitForSeconds(300f); // 遊戲中的一天（5分鐘）
                
                ProcessDailyExpenses();
                GenerateDailyReport();
                UpdateMarketPrices();
                economyData.gameDay++;
            }
        }
        
        private void ProcessDailyExpenses()
        {
            // 支付每日租金
            SpendMoney(economyData.dailyRent, "營運", "每日店鋪租金");
            
            // 支付員工薪資
            if (economyData.employeeSalaries > 0)
            {
                SpendMoney(economyData.employeeSalaries, "人事", "員工薪資");
            }
            
            // 隨機營運成本
            float randomCost = UnityEngine.Random.Range(20f, 80f);
            SpendMoney(randomCost, "營運", "水電及雜費");
        }
        
        private void GenerateDailyReport()
        {
            float dailyRevenue = 0f;
            float dailyExpenses = 0f;
            
            DateTime today = DateTime.Now.Date;
            foreach (var transaction in economyData.transactionHistory)
            {
                if (transaction.timestamp.Date == today)
                {
                    if (transaction.type == "收入")
                        dailyRevenue += transaction.amount;
                    else
                        dailyExpenses += transaction.amount;
                }
            }
            
            float dailyProfit = dailyRevenue - dailyExpenses;
            
            Debug.Log($"=== 第 {economyData.gameDay} 天財務報告 ===");
            Debug.Log($"收入: ${dailyRevenue:F2}");
            Debug.Log($"支出: ${dailyExpenses:F2}");
            Debug.Log($"淨利: ${dailyProfit:F2}");
            Debug.Log($"總資產: ${economyData.currentMoney:F2}");
            
            OnDailyReportGenerated?.Invoke();
        }
        
        private void UpdateMarketPrices()
        {
            // 隨機更新材料價格
            List<string> ingredients = new List<string>(ingredientPrices.Keys);
            foreach (string ingredient in ingredients)
            {
                float variation = UnityEngine.Random.Range(-marketDemandVariation, marketDemandVariation);
                float newPrice = ingredientPrices[ingredient] * (1 + variation);
                ingredientPrices[ingredient] = Mathf.Max(0.1f, newPrice);
            }
            
            Debug.Log("市場價格已更新");
        }
        
        private void CheckBankruptcy()
        {
            if (economyData.currentMoney <= 0)
            {
                Debug.LogWarning("破產警告！資金不足");
                OnBankruptcy?.Invoke();
            }
        }
        
        public float GetCurrentMoney()
        {
            return economyData.currentMoney;
        }
        
        public float GetTotalRevenue()
        {
            return economyData.totalRevenue;
        }
        
        public float GetTotalExpenses()
        {
            return economyData.totalExpenses;
        }
        
        public float GetNetProfit()
        {
            return economyData.totalRevenue - economyData.totalExpenses;
        }
        
        public List<Transaction> GetRecentTransactions(int count = 10)
        {
            int startIndex = Mathf.Max(0, economyData.transactionHistory.Count - count);
            return economyData.transactionHistory.GetRange(startIndex, 
                   economyData.transactionHistory.Count - startIndex);
        }
        
        public EconomyData GetSaveData()
        {
            return economyData;
        }
        
        public void LoadData(EconomyData data)
        {
            if (data != null)
            {
                economyData = data;
                OnMoneyChanged?.Invoke(economyData.currentMoney);
            }
        }
        
        public void AddEmployeeSalary(float salary)
        {
            economyData.employeeSalaries += salary;
        }
        
        public void RemoveEmployeeSalary(float salary)
        {
            economyData.employeeSalaries = Mathf.Max(0, economyData.employeeSalaries - salary);
        }
    }
} 