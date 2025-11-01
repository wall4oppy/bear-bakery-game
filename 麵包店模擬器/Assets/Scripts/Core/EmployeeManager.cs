using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;

namespace BakerySimulator.Core
{
    [Serializable]
    public class Employee
    {
        public string name;
        public EmployeeType type;
        public int skillLevel;
        public float salary;
        public float workEfficiency;
        public float happiness;
        public float experience;
        public bool isWorking;
        public string currentTask;
        public DateTime hireDate;
        
        public Employee(string name, EmployeeType type)
        {
            this.name = name;
            this.type = type;
            this.skillLevel = 1;
            this.salary = GetBaseSalary(type);
            this.workEfficiency = 1.0f;
            this.happiness = 0.7f;
            this.experience = 0f;
            this.isWorking = false;
            this.currentTask = "";
            this.hireDate = DateTime.Now;
        }
        
        private float GetBaseSalary(EmployeeType type)
        {
            switch (type)
            {
                case EmployeeType.Baker: return 80f;
                case EmployeeType.Cashier: return 60f;
                case EmployeeType.Assistant: return 50f;
                case EmployeeType.Manager: return 120f;
                default: return 50f;
            }
        }
    }
    
    public enum EmployeeType
    {
        Baker,      // 烘焙師
        Cashier,    // 收銀員
        Assistant,  // 助手
        Manager     // 經理
    }
    
    [Serializable]
    public class EmployeeData
    {
        public List<Employee> employees;
        public float totalSalaryExpense;
        public int maxEmployees;
        
        public EmployeeData()
        {
            employees = new List<Employee>();
            totalSalaryExpense = 0f;
            maxEmployees = 6;
        }
    }
    
    public class EmployeeManager : MonoBehaviour
    {
        [Header("Employee Settings")]
        public int maxEmployees = 6;
        public float baseSalaryMultiplier = 1.0f;
        public float skillUpgradeChance = 0.1f;
        
        [Header("Employee Names")]
        public string[] employeeNames = {
            "張師傅", "李小芳", "王阿姨", "陳大哥", "林美美",
            "黃老師", "吳小明", "周師父", "鄭阿貴", "蔡美女"
        };
        
        private EmployeeData employeeData;
        private EconomySystem economySystem;
        private BakeryManager bakeryManager;
        private Dictionary<Employee, GameObject> employeeObjects;
        
        public event Action<Employee> OnEmployeeHired;
        public event Action<Employee> OnEmployeeFired;
        public event Action<Employee> OnEmployeeSkillUp;
        public event Action<Employee, string> OnTaskAssigned;
        
        private void Awake()
        {
            employeeData = new EmployeeData();
            employeeObjects = new Dictionary<Employee, GameObject>();
        }
        
        public void Initialize()
        {
            economySystem = FindObjectOfType<EconomySystem>();
            bakeryManager = FindObjectOfType<BakeryManager>();
            
            employeeData.maxEmployees = maxEmployees;
            
            StartCoroutine(ProcessDailyWork());
            StartCoroutine(UpdateEmployeeHappiness());
            
            Debug.Log("員工管理系統初始化完成");
        }
        
        public bool HireEmployee(EmployeeType type)
        {
            if (employeeData.employees.Count >= employeeData.maxEmployees)
            {
                Debug.LogWarning("已達到最大員工數量限制");
                return false;
            }
            
            string name = employeeNames[UnityEngine.Random.Range(0, employeeNames.Length)];
            Employee newEmployee = new Employee(name, type);
            
            // 計算雇用成本
            float hireCost = newEmployee.salary * 2; // 雇用費為月薪的兩倍
            
            if (!economySystem.SpendMoney(hireCost, "人事", $"雇用 {newEmployee.name}"))
            {
                Debug.LogWarning("資金不足，無法雇用員工");
                return false;
            }
            
            employeeData.employees.Add(newEmployee);
            economySystem.AddEmployeeSalary(newEmployee.salary);
            
            OnEmployeeHired?.Invoke(newEmployee);
            Debug.Log($"雇用新員工: {newEmployee.name} ({newEmployee.type})");
            
            return true;
        }
        
        public bool FireEmployee(Employee employee)
        {
            if (!employeeData.employees.Contains(employee))
            {
                Debug.LogWarning("員工不存在");
                return false;
            }
            
            // 支付離職補償
            float compensation = employee.salary * 0.5f;
            economySystem.SpendMoney(compensation, "人事", $"{employee.name} 離職補償");
            
            employeeData.employees.Remove(employee);
            economySystem.RemoveEmployeeSalary(employee.salary);
            
            if (employeeObjects.ContainsKey(employee))
            {
                Destroy(employeeObjects[employee]);
                employeeObjects.Remove(employee);
            }
            
            OnEmployeeFired?.Invoke(employee);
            Debug.Log($"員工離職: {employee.name}");
            
            return true;
        }
        
        public void AssignTask(Employee employee, string task)
        {
            if (!employeeData.employees.Contains(employee))
            {
                Debug.LogWarning("員工不存在");
                return;
            }
            
            employee.currentTask = task;
            employee.isWorking = true;
            
            OnTaskAssigned?.Invoke(employee, task);
            Debug.Log($"指派任務: {employee.name} -> {task}");
        }
        
        public void TrainEmployee(Employee employee)
        {
            if (!employeeData.employees.Contains(employee))
            {
                Debug.LogWarning("員工不存在");
                return;
            }
            
            float trainingCost = employee.salary * 0.5f;
            
            if (!economySystem.SpendMoney(trainingCost, "培訓", $"培訓 {employee.name}"))
            {
                Debug.LogWarning("資金不足，無法進行培訓");
                return;
            }
            
            employee.experience += 25f;
            employee.happiness += 0.1f;
            
            // 檢查是否可以升級技能
            if (employee.experience >= employee.skillLevel * 100f)
            {
                UpgradeEmployeeSkill(employee);
            }
            
            Debug.Log($"培訓員工: {employee.name}");
        }
        
        private void UpgradeEmployeeSkill(Employee employee)
        {
            employee.skillLevel++;
            employee.experience = 0f;
            employee.workEfficiency += 0.2f;
            employee.salary *= 1.1f; // 薪資增加10%
            
            OnEmployeeSkillUp?.Invoke(employee);
            Debug.Log($"員工技能升級: {employee.name} -> 等級 {employee.skillLevel}");
        }
        
        private IEnumerator ProcessDailyWork()
        {
            while (true)
            {
                yield return new WaitForSeconds(300f); // 每天處理一次
                
                foreach (var employee in employeeData.employees)
                {
                    ProcessEmployeeWork(employee);
                }
            }
        }
        
        private void ProcessEmployeeWork(Employee employee)
        {
            if (!employee.isWorking) return;
            
            // 根據員工類型處理不同工作
            switch (employee.type)
            {
                case EmployeeType.Baker:
                    ProcessBakerWork(employee);
                    break;
                case EmployeeType.Cashier:
                    ProcessCashierWork(employee);
                    break;
                case EmployeeType.Assistant:
                    ProcessAssistantWork(employee);
                    break;
                case EmployeeType.Manager:
                    ProcessManagerWork(employee);
                    break;
            }
            
            // 增加經驗值
            employee.experience += UnityEngine.Random.Range(5f, 15f) * employee.workEfficiency;
            
            // 檢查是否自動升級
            if (employee.experience >= employee.skillLevel * 100f && 
                UnityEngine.Random.value < skillUpgradeChance)
            {
                UpgradeEmployeeSkill(employee);
            }
        }
        
        private void ProcessBakerWork(Employee employee)
        {
            // 烘焙師可以自動生產麵包
            if (employee.currentTask == "自動烘焙")
            {
                var availableRecipes = bakeryManager.GetAvailableRecipes();
                if (availableRecipes.Count > 0)
                {
                    string breadName = availableRecipes[UnityEngine.Random.Range(0, availableRecipes.Count)];
                    
                    // 根據技能等級和效率調整成功率
                    float successRate = 0.6f + (employee.skillLevel * 0.1f) + (employee.workEfficiency * 0.1f);
                    
                    if (UnityEngine.Random.value < successRate)
                    {
                        bakeryManager.StartBreadProduction(breadName);
                        Debug.Log($"{employee.name} 自動開始製作 {breadName}");
                    }
                }
            }
        }
        
        private void ProcessCashierWork(Employee employee)
        {
            // 收銀員可以提高客戶服務效率
            if (employee.currentTask == "客戶服務")
            {
                // 這裡可以與CustomerManager配合，提高客戶滿意度
                float serviceBonus = 0.1f * employee.skillLevel * employee.workEfficiency;
                Debug.Log($"{employee.name} 提供優質客戶服務，加成: {serviceBonus:P}");
            }
        }
        
        private void ProcessAssistantWork(Employee employee)
        {
            // 助手可以幫忙清理和準備材料
            if (employee.currentTask == "材料準備")
            {
                // 隨機補充一些基礎材料
                string[] basicIngredients = { "麵粉", "酵母", "鹽" };
                string ingredient = basicIngredients[UnityEngine.Random.Range(0, basicIngredients.Length)];
                int amount = UnityEngine.Random.Range(1, 5) * employee.skillLevel;
                
                bakeryManager.AddIngredient(ingredient, amount);
                Debug.Log($"{employee.name} 準備了 {ingredient} x{amount}");
            }
        }
        
        private void ProcessManagerWork(Employee employee)
        {
            // 經理可以提高整體效率
            if (employee.currentTask == "管理營運")
            {
                float efficiencyBonus = 0.05f * employee.skillLevel;
                // 這裡可以實際應用到生產效率中
                Debug.Log($"{employee.name} 管理營運，效率提升: {efficiencyBonus:P}");
            }
        }
        
        private IEnumerator UpdateEmployeeHappiness()
        {
            while (true)
            {
                yield return new WaitForSeconds(3600f); // 每小時更新一次
                
                foreach (var employee in employeeData.employees)
                {
                    UpdateHappiness(employee);
                }
            }
        }
        
        private void UpdateHappiness(Employee employee)
        {
            float happinessChange = 0f;
            
            // 工作狀態影響快樂度
            if (employee.isWorking)
            {
                happinessChange -= 0.02f; // 工作會略微降低快樂度
            }
            else
            {
                happinessChange += 0.01f; // 休息會提高快樂度
            }
            
            // 薪資滿意度
            float expectedSalary = GetBaseSalaryForSkillLevel(employee.type, employee.skillLevel);
            if (employee.salary >= expectedSalary)
            {
                happinessChange += 0.01f;
            }
            else
            {
                happinessChange -= 0.02f;
            }
            
            employee.happiness = Mathf.Clamp01(employee.happiness + happinessChange);
            
            // 快樂度影響工作效率
            employee.workEfficiency = 0.5f + (employee.happiness * 0.5f);
            
            // 如果快樂度太低，員工可能離職
            if (employee.happiness < 0.2f && UnityEngine.Random.value < 0.1f)
            {
                Debug.LogWarning($"{employee.name} 因為不滿意而主動離職");
                FireEmployee(employee);
            }
        }
        
        private float GetBaseSalaryForSkillLevel(EmployeeType type, int skillLevel)
        {
            Employee tempEmployee = new Employee("", type);
            return tempEmployee.salary * (1 + (skillLevel - 1) * 0.2f);
        }
        
        public void GiveRaise(Employee employee, float amount)
        {
            if (!employeeData.employees.Contains(employee))
            {
                Debug.LogWarning("員工不存在");
                return;
            }
            
            float oldSalary = employee.salary;
            employee.salary += amount;
            employee.happiness += 0.15f;
            
            economySystem.RemoveEmployeeSalary(oldSalary);
            economySystem.AddEmployeeSalary(employee.salary);
            
            Debug.Log($"為 {employee.name} 加薪 ${amount:F2}");
        }
        
        public List<Employee> GetEmployees()
        {
            return new List<Employee>(employeeData.employees);
        }
        
        public Employee GetBestEmployeeForTask(EmployeeType type)
        {
            Employee bestEmployee = null;
            float highestScore = 0f;
            
            foreach (var employee in employeeData.employees)
            {
                if (employee.type == type && !employee.isWorking)
                {
                    float score = employee.skillLevel + employee.workEfficiency + employee.happiness;
                    if (score > highestScore)
                    {
                        highestScore = score;
                        bestEmployee = employee;
                    }
                }
            }
            
            return bestEmployee;
        }
        
        public float GetTotalSalaryExpense()
        {
            float total = 0f;
            foreach (var employee in employeeData.employees)
            {
                total += employee.salary;
            }
            return total;
        }
        
        public EmployeeData GetSaveData()
        {
            employeeData.totalSalaryExpense = GetTotalSalaryExpense();
            return employeeData;
        }
        
        public void LoadData(EmployeeData data)
        {
            if (data != null)
            {
                employeeData = data;
            }
        }
    }
} 