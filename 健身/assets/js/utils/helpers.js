/**
 * 通用輔助函數
 */
const Helpers = {
    /**
     * 防抖函數
     * @param {Function} func 要防抖的函數
     * @param {number} wait 等待時間
     * @param {boolean} immediate 是否立即執行
     */
    debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },

    /**
     * 節流函數
     * @param {Function} func 要節流的函數
     * @param {number} limit 限制時間
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * 格式化日期
     * @param {Date|string} date 日期
     * @param {string} format 格式
     */
    formatDate(date, format = 'YYYY-MM-DD') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');

        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    },

    /**
     * 計算時間差
     * @param {Date|string} startDate 開始時間
     * @param {Date|string} endDate 結束時間
     */
    getTimeDiff(startDate, endDate = new Date()) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diff = end - start;

        return {
            milliseconds: diff,
            seconds: Math.floor(diff / 1000),
            minutes: Math.floor(diff / (1000 * 60)),
            hours: Math.floor(diff / (1000 * 60 * 60)),
            days: Math.floor(diff / (1000 * 60 * 60 * 24))
        };
    },

    /**
     * 獲取問候語
     */
    getWelcomeMessage() {
        const hour = new Date().getHours();
        if (hour < 12) return "早安，健身勇者！";
        if (hour < 18) return "午安，健身勇者！";
        return "晚安，健身勇者！";
    },

    /**
     * 生成隨機ID
     * @param {number} length 長度
     */
    generateId(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },

    /**
     * 深度複製對象
     * @param {any} obj 要複製的對象
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    },

    /**
     * 合併對象
     * @param {Object} target 目標對象
     * @param {...Object} sources 源對象
     */
    merge(target, ...sources) {
        if (!sources.length) return target;
        const source = sources.shift();

        if (this.isObject(target) && this.isObject(source)) {
            for (const key in source) {
                if (this.isObject(source[key])) {
                    if (!target[key]) Object.assign(target, { [key]: {} });
                    this.merge(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }

        return this.merge(target, ...sources);
    },

    /**
     * 檢查是否為對象
     * @param {any} item 要檢查的項目
     */
    isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    },

    /**
     * 隨機選擇數組元素
     * @param {Array} array 數組
     * @param {number} count 選擇數量
     */
    randomSelect(array, count = 1) {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return count === 1 ? shuffled[0] : shuffled.slice(0, count);
    },

    /**
     * 格式化數字
     * @param {number} num 數字
     * @param {number} decimals 小數位數
     */
    formatNumber(num, decimals = 0) {
        return Number(Math.round(num + 'e' + decimals) + 'e-' + decimals);
    },

    /**
     * 動畫函數
     * @param {Function} callback 回調函數
     * @param {number} duration 持續時間
     */
    animate(callback, duration = 300) {
        const start = performance.now();
        
        function frame(time) {
            const progress = Math.min((time - start) / duration, 1);
            callback(progress);
            
            if (progress < 1) {
                requestAnimationFrame(frame);
            }
        }
        
        requestAnimationFrame(frame);
    },

    /**
     * 緩動函數
     */
    easing: {
        linear: t => t,
        easeInQuad: t => t * t,
        easeOutQuad: t => t * (2 - t),
        easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        easeInCubic: t => t * t * t,
        easeOutCubic: t => (--t) * t * t + 1,
        easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
    },

    /**
     * 檢查網路狀態
     */
    isOnline() {
        return navigator.onLine;
    },

    /**
     * 檢查是否為移動設備
     */
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    /**
     * 檢查是否支援觸摸
     */
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },

    /**
     * 獲取查詢參數
     * @param {string} param 參數名
     */
    getUrlParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    },

    /**
     * 平滑滾動到元素
     * @param {string|Element} element 元素或選擇器
     * @param {Object} options 選項
     */
    scrollTo(element, options = {}) {
        const target = typeof element === 'string' ? document.querySelector(element) : element;
        if (!target) return;

        const defaultOptions = {
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
        };

        target.scrollIntoView({ ...defaultOptions, ...options });
    },

    /**
     * 等待函數
     * @param {number} ms 毫秒
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * 重試函數
     * @param {Function} fn 要重試的函數
     * @param {number} retries 重試次數
     * @param {number} delay 延遲時間
     */
    async retry(fn, retries = 3, delay = 1000) {
        try {
            return await fn();
        } catch (error) {
            if (retries > 0) {
                await this.sleep(delay);
                return this.retry(fn, retries - 1, delay);
            }
            throw error;
        }
    }
};

// 導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Helpers;
}
if (typeof window !== 'undefined') {
    window.Helpers = Helpers;
} 