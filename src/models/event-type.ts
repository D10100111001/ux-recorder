export enum EventType {
    UNSUPPORTED,
    SITE_ENTER,
    MOUSE_DOWN,
    MOUSE_UP,
    MOUSE_CLICK,
    MOUSE_HOVER,
    MOUSE_MOVE,
    DRAG,
    DROP,
    MOUSE_SCROLL,
    KEY_DOWN,
    KEY_PRESS,
    KEY_UP,
    INPUT_FOCUS,
    INPUT_BLUR,
    SITE_EXIT
}

export const getEventType = (target: EventTarget, type: string): EventType => {
    const isSupported = type in EVENT_TYPE_MAP;
    console.log(type);
    let eventType = EventType.UNSUPPORTED;
    if (isSupported) {
        const et = EVENT_TYPE_MAP[type];
        if (Array.isArray(et)) {
            eventType = et[Number(!(target instanceof Window))]
        }
    }
    return eventType;
}

export const EVENT_TYPE_MAP: Record<string, EventType | EventType[]> = {
    'focus': [EventType.SITE_ENTER, EventType.INPUT_FOCUS],
    'blur': [EventType.SITE_EXIT, EventType.INPUT_BLUR],
    'mousedown': EventType.MOUSE_DOWN,
    'mouseup': EventType.MOUSE_UP,
    'dragstart': EventType.DRAG,
    'drop': EventType.DROP,
    'click': EventType.MOUSE_CLICK,
    'mouseenter': EventType.MOUSE_HOVER,
    'mousemove': EventType.MOUSE_MOVE,
    'wheel': EventType.MOUSE_SCROLL,
    'keydown': EventType.KEY_DOWN,
    'keypress': EventType.KEY_PRESS,
    'keyup': EventType.KEY_UP
}

export const EVENT_TYPE_REVERSE_MAP = Object.keys(EVENT_TYPE_MAP).reduce((obj, item) => {
    const val = EVENT_TYPE_MAP[item];
    const isArray = Array.isArray(val);
    const vals = isArray ? val as EventType[] : [val as EventType];
    vals.forEach(v => obj[v] = item);
    return obj;
}, {} as Record<EventType, string>);