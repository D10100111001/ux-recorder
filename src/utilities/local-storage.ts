import { ObjectUtility } from "./object";

export class LocalStorageUtility {
    static store<T>(key: string, data: T, dataId: string, conflictResolutionFn: (newData: T, oldData: T) => T, propertiesToIgnore?: string[]) {
        const existingData = JSON.parse(window.localStorage.getItem(key));
        
        let resultData: any;
        if (propertiesToIgnore && propertiesToIgnore.length)
            this.processData(data, propertiesToIgnore);

        if (existingData && dataId in existingData) {
            const oldData = existingData[dataId];
            existingData[dataId] = conflictResolutionFn(data, oldData);
            resultData = existingData;
        } else {
            resultData = { ...existingData, [dataId]: data };
        }
        
        window.localStorage.setItem(key, JSON.stringify(resultData));
        return true;
    }

    private static processData<T>(data: T, propertiesToIgnore: string[]) {
        propertiesToIgnore.forEach(propPath => {
            const propParts = propPath.split('.');
            const lastProp = propParts.slice(-1)[0];
            let objs = [data];
            if (propParts.length > 1) {
                objs = ObjectUtility.getPropertiesByPath(data, propParts.slice(0, -1));
            }
            objs.forEach(obj => {
                delete obj[lastProp];
            });
        });
    }

    static get<T>(key: string) {
        return JSON.parse(window.localStorage.getItem(key)) as Record<string, T>;
    }

    static delete(key: string) {
        window.localStorage.removeItem(key);
    }
}