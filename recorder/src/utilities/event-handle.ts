export class Hook<TIn> {
    constructor(
        public handler: (data?: TIn) => void,
        public once: boolean = false
    ) {}
}

export class Event<TIn> {

    constructor(
        public data?: TIn) {}
}

export class EventHandle<TIn> {
    constructor(private _singleEvent: boolean = false) {}

    private _hooks: Hook<TIn>[] = [];
    private _eventHistory: Event<TIn>[] = [];

    private get _hasHistory() {
        return this._eventHistory.length > 0;
    }

    dispatchEvent(data?: TIn) {
        if (this._singleEvent && this._hasHistory) return;
        this._hooks.forEach(hook => {
            if (hook.once && this._hasHistory) return;
            hook.handler.call(null, data);
        });
        this._eventHistory.push(new Event(data));
    }

    attachHook(hookHandler: Hook<TIn>['handler'], once: boolean = false) {
        this._hooks.push(new Hook(hookHandler, once));
        if (this._singleEvent && this._hasHistory)
            hookHandler.apply(null, this._eventHistory[0].data);
    }

    attachHookOnce(hookHandler: Hook<TIn>['handler']) {
        this.attachHook(hookHandler, true);
    }

}


export class MonoEventHandle<TIn> extends EventHandle<TIn> {
    constructor() {
        super(true);
    }
}