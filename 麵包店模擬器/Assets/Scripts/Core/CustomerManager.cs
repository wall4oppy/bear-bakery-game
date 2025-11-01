using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;

namespace BakerySimulator.Core
{
    [Serializable]
    public class Customer
    {
        public string name;
        public CustomerType type;
        public float patience;
        public float maxPatience;
        public List<BreadOrder> orders;
        public float satisfactionLevel;
        public float loyaltyPoints;
        public Vector3 position;
        public bool isVIP;
        
        public Customer(string name, CustomerType type)
        {
            this.name = name;
            this.type = type;
            this.maxPatience = GetPatienceByType(type);
            this.patience = maxPatience;
            this.orders = new List<BreadOrder>();
            this.satisfactionLevel = 0.5f;
            this.loyaltyPoints = 0f;
            this.isVIP = false;
        }
        
        private float GetPatienceByType(CustomerType type)
        {
            switch (type)
            {
                case CustomerType.Hurried: return 30f;
                case CustomerType.Normal: return 60f;
                case CustomerType.Patient: return 120f;
                case CustomerType.VIP: return 90f;
                default: return 60f;
            }
        }
    }
    
    [Serializable]
    public class BreadOrder
    {
        public string breadName;
        public int quantity;
        public float maxPrice;
        public float urgency;
        
        public BreadOrder(string breadName, int quantity, float maxPrice, float urgency = 1.0f)
        {
            this.breadName = breadName;
            this.quantity = quantity;
            this.maxPrice = maxPrice;
            this.urgency = urgency;
        }
    }
    
    public enum CustomerType
    {
        Normal,    // 普通客戶
        Hurried,   // 急躁客戶
        Patient,   // 耐心客戶
        VIP        // VIP客戶
    }
    
    [Serializable]
    public class CustomerData
    {
        public List<Customer> currentCustomers;
        public float customerSatisfactionAverage;
        public int totalCustomersServed;
        public float totalRevenue;
        public Dictionary<string, int> popularityStats;
        
        public CustomerData()
        {
            currentCustomers = new List<Customer>();
            customerSatisfactionAverage = 0.5f;
            totalCustomersServed = 0;
            totalRevenue = 0f;
            popularityStats = new Dictionary<string, int>();
        }
    }
    
    public class CustomerManager : MonoBehaviour
    {
        [Header("Customer Spawn Settings")]
        public float baseSpawnRate = 30f;
        public float spawnRateVariation = 10f;
        public int maxCustomersInStore = 8;
        
        [Header("Customer Prefabs")]
        public GameObject[] customerPrefabs;
        public Transform[] customerSpawnPoints;
        public Transform[] customerWaitingAreas;
        
        [Header("Customer Names")]
        public string[] customerNames = {
            "張小明", "李美麗", "王大華", "陳小芳", "林志明",
            "黃淑雯", "吳建成", "周雅婷", "鄭偉強", "蔡佳玲"
        };
        
        private CustomerData customerData;
        private BakeryManager bakeryManager;
        private EconomySystem economySystem;
        private List<string> availableBreads;
        
        public event Action<Customer> OnCustomerArrived;
        public event Action<Customer> OnCustomerLeft;
        public event Action<Customer, BreadOrder> OnOrderPlaced;
        public event Action<Customer, float> OnCustomerSatisfactionChanged;
        
        private void Awake()
        {
            customerData = new CustomerData();
            availableBreads = new List<string>();
        }
        
        public void Initialize()
        {
            bakeryManager = FindObjectOfType<BakeryManager>();
            economySystem = FindObjectOfType<EconomySystem>();
            
            availableBreads = bakeryManager.GetAvailableRecipes();
            
            StartCoroutine(SpawnCustomers());
            StartCoroutine(UpdateCustomerPatience());
            
            Debug.Log("客戶管理系統初始化完成");
        }
        
        private IEnumerator SpawnCustomers()
        {
            while (true)
            {
                float spawnDelay = baseSpawnRate + UnityEngine.Random.Range(-spawnRateVariation, spawnRateVariation);
                yield return new WaitForSeconds(spawnDelay);
                
                if (customerData.currentCustomers.Count < maxCustomersInStore)
                {
                    SpawnNewCustomer();
                }
            }
        }
        
        private void SpawnNewCustomer()
        {
            if (customerSpawnPoints.Length == 0) return;
            
            // 隨機選擇客戶類型
            CustomerType type = GetRandomCustomerType();
            string name = customerNames[UnityEngine.Random.Range(0, customerNames.Length)];
            
            Customer newCustomer = new Customer(name, type);
            
            // 生成訂單
            GenerateCustomerOrder(newCustomer);
            
            // 實例化客戶物件
            Vector3 spawnPosition = customerSpawnPoints[UnityEngine.Random.Range(0, customerSpawnPoints.Length)].position;
            GameObject customerObj = Instantiate(
                customerPrefabs[UnityEngine.Random.Range(0, customerPrefabs.Length)], 
                spawnPosition, 
                Quaternion.identity
            );
            
            CustomerController controller = customerObj.GetComponent<CustomerController>();
            if (controller != null)
            {
                controller.Initialize(newCustomer, this);
            }
            
            newCustomer.position = spawnPosition;
            customerData.currentCustomers.Add(newCustomer);
            
            OnCustomerArrived?.Invoke(newCustomer);
            Debug.Log($"新客戶到達: {newCustomer.name} ({newCustomer.type})");
        }
        
        private CustomerType GetRandomCustomerType()
        {
            float random = UnityEngine.Random.value;
            if (random < 0.6f) return CustomerType.Normal;
            if (random < 0.8f) return CustomerType.Hurried;
            if (random < 0.95f) return CustomerType.Patient;
            return CustomerType.VIP;
        }
        
        private void GenerateCustomerOrder(Customer customer)
        {
            if (availableBreads.Count == 0) return;
            
            int orderCount = UnityEngine.Random.Range(1, 4); // 1-3個訂單
            
            for (int i = 0; i < orderCount; i++)
            {
                string breadName = availableBreads[UnityEngine.Random.Range(0, availableBreads.Count)];
                int quantity = UnityEngine.Random.Range(1, 5);
                
                float basePrice = economySystem.GetBreadPrice(breadName);
                float maxPrice = basePrice * UnityEngine.Random.Range(0.8f, 1.2f);
                
                if (customer.type == CustomerType.VIP)
                {
                    maxPrice *= 1.3f; // VIP願意付更高價格
                }
                else if (customer.type == CustomerType.Hurried)
                {
                    maxPrice *= 1.1f; // 急躁客戶願意付稍高價格
                }
                
                BreadOrder order = new BreadOrder(breadName, quantity, maxPrice);
                customer.orders.Add(order);
            }
            
            OnOrderPlaced?.Invoke(customer, customer.orders[0]);
        }
        
        public bool ProcessCustomerOrder(Customer customer)
        {
            bool allOrdersFulfilled = true;
            float totalSatisfaction = 0f;
            float totalRevenue = 0f;
            
            foreach (var order in customer.orders)
            {
                int availableQuantity = bakeryManager.GetBreadQuantity(order.breadName);
                
                if (availableQuantity >= order.quantity)
                {
                    // 成功完成訂單
                    bakeryManager.SellBread(order.breadName, order.quantity);
                    
                    float salePrice = economySystem.GetBreadPrice(order.breadName);
                    float customerSatisfaction = CalculateOrderSatisfaction(order, salePrice);
                    
                    totalSatisfaction += customerSatisfaction;
                    totalRevenue += economySystem.SellBread(order.breadName, order.quantity, customerSatisfaction);
                    
                    Debug.Log($"完成訂單: {order.breadName} x{order.quantity}");
                }
                else
                {
                    // 無法完成訂單
                    allOrdersFulfilled = false;
                    totalSatisfaction += 0.2f; // 低滿意度
                    Debug.Log($"無法完成訂單: {order.breadName} x{order.quantity} (庫存不足)");
                }
            }
            
            // 計算平均滿意度
            customer.satisfactionLevel = totalSatisfaction / customer.orders.Count;
            
            // 更新客戶忠誠度
            if (customer.satisfactionLevel > 0.7f)
            {
                customer.loyaltyPoints += 10f;
            }
            else if (customer.satisfactionLevel < 0.3f)
            {
                customer.loyaltyPoints = Mathf.Max(0, customer.loyaltyPoints - 5f);
            }
            
            // 檢查是否升級為VIP
            if (customer.loyaltyPoints >= 100f && !customer.isVIP)
            {
                customer.isVIP = true;
                customer.type = CustomerType.VIP;
                Debug.Log($"{customer.name} 升級為VIP客戶！");
            }
            
            UpdateStatistics(customer, totalRevenue);
            OnCustomerSatisfactionChanged?.Invoke(customer, customer.satisfactionLevel);
            
            return allOrdersFulfilled;
        }
        
        private float CalculateOrderSatisfaction(BreadOrder order, float actualPrice)
        {
            float priceSatisfaction = 1.0f - Mathf.Clamp01((actualPrice - order.maxPrice) / order.maxPrice);
            
            // 基礎滿意度考慮價格接受度
            float baseSatisfaction = Mathf.Lerp(0.3f, 1.0f, priceSatisfaction);
            
            // 時間因素（如果等待太久，滿意度下降）
            float timeFactor = 1.0f; // 這裡可以根據等待時間調整
            
            return baseSatisfaction * timeFactor;
        }
        
        private void UpdateStatistics(Customer customer, float revenue)
        {
            customerData.totalCustomersServed++;
            customerData.totalRevenue += revenue;
            
            // 更新平均滿意度
            float totalSatisfaction = customerData.customerSatisfactionAverage * (customerData.totalCustomersServed - 1);
            totalSatisfaction += customer.satisfactionLevel;
            customerData.customerSatisfactionAverage = totalSatisfaction / customerData.totalCustomersServed;
            
            // 更新受歡迎商品統計
            foreach (var order in customer.orders)
            {
                if (customerData.popularityStats.ContainsKey(order.breadName))
                {
                    customerData.popularityStats[order.breadName]++;
                }
                else
                {
                    customerData.popularityStats[order.breadName] = 1;
                }
            }
        }
        
        public void CustomerLeaves(Customer customer)
        {
            customerData.currentCustomers.Remove(customer);
            OnCustomerLeft?.Invoke(customer);
            Debug.Log($"客戶離開: {customer.name} (滿意度: {customer.satisfactionLevel:F2})");
        }
        
        private IEnumerator UpdateCustomerPatience()
        {
            while (true)
            {
                yield return new WaitForSeconds(1f);
                
                for (int i = customerData.currentCustomers.Count - 1; i >= 0; i--)
                {
                    Customer customer = customerData.currentCustomers[i];
                    customer.patience -= 1f;
                    
                    if (customer.patience <= 0)
                    {
                        // 客戶失去耐心離開
                        customer.satisfactionLevel = 0.1f;
                        CustomerLeaves(customer);
                        
                        // 移除對應的遊戲物件
                        GameObject customerObj = FindCustomerGameObject(customer);
                        if (customerObj != null)
                        {
                            Destroy(customerObj);
                        }
                    }
                }
            }
        }
        
        private GameObject FindCustomerGameObject(Customer customer)
        {
            CustomerController[] controllers = FindObjectsOfType<CustomerController>();
            foreach (var controller in controllers)
            {
                if (controller.GetCustomer() == customer)
                {
                    return controller.gameObject;
                }
            }
            return null;
        }
        
        public List<Customer> GetCurrentCustomers()
        {
            return new List<Customer>(customerData.currentCustomers);
        }
        
        public float GetAverageSatisfaction()
        {
            return customerData.customerSatisfactionAverage;
        }
        
        public int GetTotalCustomersServed()
        {
            return customerData.totalCustomersServed;
        }
        
        public Dictionary<string, int> GetPopularityStats()
        {
            return new Dictionary<string, int>(customerData.popularityStats);
        }
        
        public CustomerData GetSaveData()
        {
            return customerData;
        }
        
        public void LoadData(CustomerData data)
        {
            if (data != null)
            {
                customerData = data;
            }
        }
    }
} 