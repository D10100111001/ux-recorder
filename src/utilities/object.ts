export class ObjectUtility {
    static arrayToObject<TIn, TOut>(arr: TIn[], keyFn: (item: TIn) => string, valFn?: (item: TIn) => TOut) {
        return arr.reduce((obj, item) => {
            obj[keyFn(item)] = valFn(item);
            return obj;
        }, {} as Record<string, TOut>);
    }

    static arrayToObjBoolVal<TIn>(arr: TIn[], keyFn: (item: TIn) => string) {
        return ObjectUtility.arrayToObject(arr, keyFn, () => true);
    }

    static getPropertiesByPath<T>(obj: T, path: string | string[]) {
        const isObj = typeof obj === 'object';
        let currObjs = [obj];
        if (isObj) {
            const pathParts: string[] = Array.isArray(path) ? path : path.split('.');
            let prop;
            while (prop = pathParts.shift()) {
                let objs = []; 
                currObjs.forEach(o => {
                    const value = o[prop];
                    if (Array.isArray(value))
                        objs = objs.concat(value);
                    else
                        objs.push(value);
                });
                currObjs = objs;
            }
            return currObjs;
        }
        return currObjs;
    }

}