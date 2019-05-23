import { ObjectUtility } from "./object";

export enum Store {
    Local = 1,
    LocalSession
}

export const StoreMap: Record<Store, Storage> = {
    [Store.Local]: window.localStorage || ObjectUtility.restoreWindowProperty('localStorage'),
    [Store.LocalSession]: window.sessionStorage || ObjectUtility.restoreWindowProperty('sessionStorage')
}

export class StorageUtility {

    private static getStorage(store: Store) {
        return StoreMap[store];
    }

    static mergeStore<T>(key: string, data: T, dataId: string, conflictResolutionFn: (newData: T, oldData: T) => T, propertiesToIgnore?: string[], store = Store.Local) {
        const storage = StorageUtility.getStorage(store);
        const existingData = JSON.parse(storage.getItem(key));

        let resultData: any;
        if (propertiesToIgnore && propertiesToIgnore.length)
            StorageUtility.processData(data, propertiesToIgnore);

        if (existingData && dataId in existingData) {
            const oldData = existingData[dataId];
            existingData[dataId] = conflictResolutionFn(data, oldData);
            resultData = existingData;
        } else {
            resultData = { ...existingData, [dataId]: data };
        }

        storage.setItem(key, JSON.stringify(resultData));
        return true;
    }

    static set<T>(key: string, data: T, store = Store.Local) {
        StorageUtility.getStorage(store).setItem(key, JSON.stringify(data));
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

    static get<T>(key: string, store = Store.Local) {
        return JSON.parse(StorageUtility.getStorage(store).getItem(key)) as T | null;
    }

    static delete(key: string, store = Store.Local) {
        StorageUtility.getStorage(store).removeItem(key);
    }
}