using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;

namespace BakerySimulator.Core
{
    public class BreadProduction : MonoBehaviour
    {
        [Header("Production Visual")]
        public GameObject breadModel;
        public ParticleSystem steamEffect;
        public AudioSource ovenSound;
        
        [Header("Progress Display")]
        public GameObject progressBar;
        public UnityEngine.UI.Slider progressSlider;
        public UnityEngine.UI.Text breadNameText;
        public UnityEngine.UI.Text timeRemainingText;
        
        public BreadType breadType { get; private set; }
        private float productionTime;
        private float timeRemaining;
        private bool isProducing;
        private Action<BreadProduction> onCompleteCallback;
        
        public void Initialize(BreadType breadType, Action<BreadProduction> onComplete)
        {
            this.breadType = breadType;
            this.productionTime = breadType.productionTime;
            this.timeRemaining = productionTime;
            this.onCompleteCallback = onComplete;
            this.isProducing = true;
            
            SetupVisuals();
            StartCoroutine(ProductionProcess());
        }
        
        private void SetupVisuals()
        {
            if (breadNameText != null)
            {
                breadNameText.text = breadType.displayName;
            }
            
            if (progressSlider != null)
            {
                progressSlider.maxValue = productionTime;
                progressSlider.value = productionTime;
            }
            
            if (steamEffect != null)
            {
                steamEffect.Play();
            }
            
            if (ovenSound != null)
            {
                ovenSound.Play();
            }
        }
        
        private IEnumerator ProductionProcess()
        {
            while (timeRemaining > 0 && isProducing)
            {
                timeRemaining -= Time.deltaTime;
                UpdateUI();
                yield return null;
            }
            
            if (isProducing)
            {
                CompleteProduction();
            }
        }
        
        private void UpdateUI()
        {
            if (progressSlider != null)
            {
                progressSlider.value = productionTime - timeRemaining;
            }
            
            if (timeRemainingText != null)
            {
                int minutes = Mathf.FloorToInt(timeRemaining / 60);
                int seconds = Mathf.FloorToInt(timeRemaining % 60);
                timeRemainingText.text = $"{minutes:00}:{seconds:00}";
            }
        }
        
        private void CompleteProduction()
        {
            isProducing = false;
            
            if (steamEffect != null)
            {
                steamEffect.Stop();
            }
            
            if (ovenSound != null)
            {
                ovenSound.Stop();
            }
            
            // 播放完成音效
            PlayCompletionEffect();
            
            // 通知完成
            onCompleteCallback?.Invoke(this);
        }
        
        private void PlayCompletionEffect()
        {
            // 可以添加完成特效
            if (breadModel != null)
            {
                breadModel.SetActive(true);
            }
            
            Debug.Log($"{breadType.displayName} 烘焙完成！");
        }
        
        public void CancelProduction()
        {
            isProducing = false;
            StopAllCoroutines();
            
            if (steamEffect != null)
            {
                steamEffect.Stop();
            }
            
            if (ovenSound != null)
            {
                ovenSound.Stop();
            }
        }
        
        public float GetProgress()
        {
            return productionTime > 0 ? (productionTime - timeRemaining) / productionTime : 0f;
        }
        
        public bool IsCompleted()
        {
            return timeRemaining <= 0;
        }
    }
} 