export enum MutationEventType {
    UNSUPPORTED,
    CHILD_LIST,
    ATTRIBUTES,
    CHARACTER_DATA
}

export const getEventType = (type: string): MutationEventType => {
    return EVENT_TYPE_MAP[type] || MutationEventType.UNSUPPORTED;
}

export const EVENT_TYPE_MAP: Record<MutationRecordType, MutationEventType | MutationEventType[]> = {
    'attributes': MutationEventType.ATTRIBUTES,
    'characterData': MutationEventType.CHARACTER_DATA,
    'childList': MutationEventType.CHILD_LIST,
}

export const EVENT_TYPE_REVERSE_MAP = Object.keys(EVENT_TYPE_MAP).reduce((obj, item) => {
    const val = EVENT_TYPE_MAP[item];
    const isArray = Array.isArray(val);
    const vals = isArray ? val as MutationEventType[] : [val as MutationEventType];
    vals.forEach(v => obj[v] = item);
    return obj;
}, {} as Record<MutationEventType, string>);