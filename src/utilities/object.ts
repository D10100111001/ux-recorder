export class ObjectUtilities {
    static arrayToObject<TIn, TOut>(arr: TIn[], keyFn: (item: TIn) => string, valFn?: (item: TIn) => TOut) {
        return arr.reduce((obj, item) => {
            obj[keyFn(item)] = valFn(item);
            return obj;
        }, {} as Record<string, TOut>);
    }

    static arrayToObjBoolVal<TIn>(arr: TIn[], keyFn: (item: TIn) => string) {
        return ObjectUtilities.arrayToObject(arr, keyFn, () => true);
    }

}