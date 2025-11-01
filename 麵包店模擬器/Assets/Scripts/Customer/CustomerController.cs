using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.AI;

namespace BakerySimulator.Core
{
    public class CustomerController : MonoBehaviour
    {
        [Header("Components")]
        public NavMeshAgent agent;
        public Animator animator;
        public Transform orderBubble;
        public UnityEngine.UI.Slider patienceBar;
        
        [Header("Animation")]
        public string walkAnimParam = "IsWalking";
        public string idleAnimParam = "IsIdle";
        public string happyAnimParam = "IsHappy";
        public string angryAnimParam = "IsAngry";
        
        private Customer customer;
        private CustomerManager customerManager;
        private Transform targetPosition;
        private bool hasReachedCounter = false;
        
        public void Initialize(Customer customer, CustomerManager manager)
        {
            this.customer = customer;
            this.customerManager = manager;
            
            if (agent == null)
                agent = GetComponent<NavMeshAgent>();
            if (animator == null)
                animator = GetComponent<Animator>();
            
            SetupCustomer();
            MoveToCounter();
        }
        
        private void SetupCustomer()
        {
            // 設置客戶外觀和屬性
            UpdatePatienceBar();
            
            if (orderBubble != null)
            {
                orderBubble.gameObject.SetActive(true);
            }
        }
        
        private void Update()
        {
            if (customer != null)
            {
                UpdateMovement();
                UpdatePatienceBar();
                CheckCustomerState();
            }
        }
        
        private void UpdateMovement()
        {
            if (agent != null && animator != null)
            {
                bool isMoving = agent.velocity.magnitude > 0.1f;
                animator.SetBool(walkAnimParam, isMoving);
                animator.SetBool(idleAnimParam, !isMoving);
            }
            
            // 檢查是否到達櫃檯
            if (!hasReachedCounter && agent != null && !agent.pathPending)
            {
                if (agent.remainingDistance < 0.5f)
                {
                    hasReachedCounter = true;
                    OnReachedCounter();
                }
            }
        }
        
        private void UpdatePatienceBar()
        {
            if (patienceBar != null && customer != null)
            {
                float patienceRatio = customer.patience / customer.maxPatience;
                patienceBar.value = patienceRatio;
                
                // 根據耐心改變顏色
                var colors = patienceBar.colors;
                if (patienceRatio > 0.6f)
                    colors.normalColor = Color.green;
                else if (patienceRatio > 0.3f)
                    colors.normalColor = Color.yellow;
                else
                    colors.normalColor = Color.red;
                
                patienceBar.colors = colors;
            }
        }
        
        private void CheckCustomerState()
        {
            if (customer == null) return;
            
            // 根據客戶狀態播放動畫
            if (customer.patience <= 0)
            {
                PlayAngryAnimation();
            }
            else if (customer.satisfactionLevel > 0.8f)
            {
                PlayHappyAnimation();
            }
        }
        
        private void MoveToCounter()
        {
            // 尋找最近的櫃檯位置
            Transform counter = FindNearestCounter();
            if (counter != null && agent != null)
            {
                agent.SetDestination(counter.position);
            }
        }
        
        private Transform FindNearestCounter()
        {
            // 簡化處理，實際應該找到最近的空閒櫃檯
            GameObject counter = GameObject.FindGameObjectWithTag("Counter");
            return counter != null ? counter.transform : transform;
        }
        
        private void OnReachedCounter()
        {
            Debug.Log($"{customer.name} 到達櫃檯");
            
            // 處理訂單
            if (customerManager != null)
            {
                bool orderCompleted = customerManager.ProcessCustomerOrder(customer);
                
                if (orderCompleted)
                {
                    PlayHappyAnimation();
                    StartCoroutine(LeaveAfterDelay(2f));
                }
                else
                {
                    PlayAngryAnimation();
                    StartCoroutine(LeaveAfterDelay(1f));
                }
            }
        }
        
        private void PlayHappyAnimation()
        {
            if (animator != null)
            {
                animator.SetTrigger(happyAnimParam);
            }
        }
        
        private void PlayAngryAnimation()
        {
            if (animator != null)
            {
                animator.SetTrigger(angryAnimParam);
            }
        }
        
        private IEnumerator LeaveAfterDelay(float delay)
        {
            yield return new WaitForSeconds(delay);
            
            // 移動到出口
            MoveToExit();
            
            // 3秒後銷毀
            yield return new WaitForSeconds(3f);
            
            if (customerManager != null)
            {
                customerManager.CustomerLeaves(customer);
            }
            
            Destroy(gameObject);
        }
        
        private void MoveToExit()
        {
            GameObject exit = GameObject.FindGameObjectWithTag("Exit");
            if (exit != null && agent != null)
            {
                agent.SetDestination(exit.transform.position);
            }
        }
        
        public Customer GetCustomer()
        {
            return customer;
        }
        
        public void OnClicked()
        {
            // 玩家點擊客戶時的處理
            if (customer != null && hasReachedCounter)
            {
                Debug.Log($"與客戶 {customer.name} 互動");
                // 顯示訂單詳情UI等
            }
        }
        
        private void OnMouseDown()
        {
            OnClicked();
        }
    }
} 