/**
 * 本地存儲管理器
 * 提供數據持久化功能
 */
class StorageManager {
    constructor() {
        this.prefix = 'fitness_';
        this.isSupported = this.checkSupport();
    }

    /**
     * 檢查localStorage支持
     */
    checkSupport() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('localStorage不受支援:', e);
            return false;
        }
    }

    /**
     * 設置數據
     * @param {string} key 鍵名
     * @param {any} value 值
     * @param {number} expireTime 過期時間（毫秒）
     */
    set(key, value, expireTime = null) {
        if (!this.isSupported) return false;

        try {
            const data = {
                value: value,
                timestamp: Date.now(),
                expire: expireTime ? Date.now() + expireTime : null
            };

            localStorage.setItem(this.prefix + key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('存儲數據失敗:', e);
            return false;
        }
    }

    /**
     * 獲取數據
     * @param {string} key 鍵名
     * @param {any} defaultValue 默認值
     */
    get(key, defaultValue = null) {
        if (!this.isSupported) return defaultValue;

        try {
            const item = localStorage.getItem(this.prefix + key);
            if (!item) return defaultValue;

            const data = JSON.parse(item);
            
            // 檢查是否過期
            if (data.expire && Date.now() > data.expire) {
                this.remove(key);
                return defaultValue;
            }

            return data.value;
        } catch (e) {
            console.error('讀取數據失敗:', e);
            return defaultValue;
        }
    }

    /**
     * 移除數據
     * @param {string} key 鍵名
     */
    remove(key) {
        if (!this.isSupported) return false;

        try {
            localStorage.removeItem(this.prefix + key);
            return true;
        } catch (e) {
            console.error('移除數據失敗:', e);
            return false;
        }
    }

    /**
     * 清空所有數據
     */
    clear() {
        if (!this.isSupported) return false;

        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (e) {
            console.error('清空數據失敗:', e);
            return false;
        }
    }

    /**
     * 獲取存儲大小
     */
    getSize() {
        if (!this.isSupported) return 0;

        let total = 0;
        for (let key in localStorage) {
            if (key.startsWith(this.prefix)) {
                total += localStorage[key].length;
            }
        }
        return total;
    }

    /**
     * 檢查存儲空間是否充足
     */
    hasSpace() {
        const maxSize = 5 * 1024 * 1024; // 5MB
        return this.getSize() < maxSize;
    }

    /**
     * 備份數據
     */
    backup() {
        if (!this.isSupported) return null;

        const backup = {};
        for (let key in localStorage) {
            if (key.startsWith(this.prefix)) {
                backup[key] = localStorage[key];
            }
        }
        return backup;
    }

    /**
     * 恢復數據
     * @param {Object} backupData 備份數據
     */
    restore(backupData) {
        if (!this.isSupported || !backupData) return false;

        try {
            for (let key in backupData) {
                localStorage.setItem(key, backupData[key]);
            }
            return true;
        } catch (e) {
            console.error('恢復數據失敗:', e);
            return false;
        }
    }

    /**
     * 批量設置
     * @param {Object} data 數據對象
     */
    setMultiple(data) {
        for (let key in data) {
            this.set(key, data[key]);
        }
    }

    /**
     * 批量獲取
     * @param {Array} keys 鍵名數組
     */
    getMultiple(keys) {
        const result = {};
        keys.forEach(key => {
            result[key] = this.get(key);
        });
        return result;
    }
}

// 創建實例
const storage = new StorageManager();

// 導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageManager;
}
if (typeof window !== 'undefined') {
    window.StorageManager = StorageManager;
    window.storage = storage;
} 