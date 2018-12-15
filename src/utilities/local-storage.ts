export class LocalStorageUtilities {
    static store<T>(key: string, data: T, dataId: string, conflictResolutionFn: (newData: T, oldData: T) => T) {
        const existingData = JSON.parse(window.localStorage.getItem(key));
        
        let resultData: any;

        if (dataId in existingData) {
            const oldData = existingData[dataId];
            existingData[dataId] = conflictResolutionFn(data, oldData);
            resultData = existingData;
        } else {
            resultData = { ...existingData, [dataId]: data };
        }
        
        window.localStorage.setItem(key, JSON.stringify(resultData));
        return true;
    }

    static get<T>(key: string) {
        return JSON.parse(window.localStorage.getItem(key)) as Record<string, T>;
    }

    static delete(key: string) {
        window.localStorage.removeItem(key);
    }
}