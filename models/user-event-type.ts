export enum UserEventType {
    UNSUPPORTED,
    SITE_ENTER,
    MOUSE_DOWN,
    MOUSE_UP,
    MOUSE_CLICK,
    MOUSE_HOVER,
    MOUSE_MOVE,
    DRAG,
    DROP,
    RESIZE,
    MOUSE_SCROLL,
    KEY_DOWN,
    KEY_PRESS,
    KEY_UP,
    INPUT_FOCUS,
    INPUT_BLUR,
    SITE_EXIT
}

export const getEventType = (target: EventTarget, type: string): UserEventType => {
    const isSupported = type in EVENT_TYPE_MAP;
    let eventType = UserEventType.UNSUPPORTED;
    if (isSupported) {
        const et = EVENT_TYPE_MAP[type];
        if (Array.isArray(et)) {
            eventType = et[Number(!(target instanceof Window))]
        } else {
            eventType = et;
        }
    }
    return eventType;
}

export const EVENT_TYPE_MAP: Record<string, UserEventType | UserEventType[]> = {
    'focus': [UserEventType.SITE_ENTER, UserEventType.INPUT_FOCUS],
    'blur': [UserEventType.SITE_EXIT, UserEventType.INPUT_BLUR],
    'mousedown': UserEventType.MOUSE_DOWN,
    'mouseup': UserEventType.MOUSE_UP,
    'dragstart': UserEventType.DRAG,
    'drop': UserEventType.DROP,
    'click': UserEventType.MOUSE_CLICK,
    'mouseenter': UserEventType.MOUSE_HOVER,
    'mousemove': UserEventType.MOUSE_MOVE,
    'wheel': UserEventType.MOUSE_SCROLL,
    'keydown': UserEventType.KEY_DOWN,
    'keypress': UserEventType.KEY_PRESS,
    'keyup': UserEventType.KEY_UP,
    'resize': UserEventType.RESIZE
}

export const EVENT_TYPE_REVERSE_MAP = Object.keys(EVENT_TYPE_MAP).reduce((obj, item) => {
    const val = EVENT_TYPE_MAP[item];
    const isArray = Array.isArray(val);
    const vals = isArray ? val as UserEventType[] : [val as UserEventType];
    vals.forEach(v => obj[v] = item);
    return obj;
}, {} as Record<UserEventType, string>);