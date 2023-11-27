import { ext } from "./extensionVariables";

export interface CacheParams<V, Args extends any[]> {
    readonly expirationTime?: number;
    readonly getDataFunc: (...args: Args) => Promise<V | undefined>;
}

export class Cache<V, Args extends any[]> {
    private _timerIndex: Map<string, NodeJS.Timeout>;
    private readonly _expirationTime: number;

    constructor(private params: CacheParams<V, Args>) {
        this._timerIndex = new Map<string, NodeJS.Timeout>();
        this._expirationTime = params.expirationTime ?? 1000 * 60 * 10; // 10 minutes
    }

    private setExpiration(key: string, ...args: Args): void {
        if (this._timerIndex.has(key)) {
            clearTimeout(this._timerIndex.get(key));
        }
        const timer = setTimeout(async () => {
            this._timerIndex.delete(key);
            await this.invalidate(key, ...args);
        }, this._expirationTime);
        this._timerIndex.set(key, timer);
    }

    public async delete(key: string): Promise<void> {
        await ext.context.globalState.update(key, undefined);
        clearTimeout(this._timerIndex.get(key));
        this._timerIndex.delete(key);
    }

    public async get(key: string, ...args: Args): Promise<V | undefined> {
        const value = ext.context.globalState.get(key);
        if (!!value) {
            if (!this._timerIndex.has(key)) {
                this.setExpiration(key, ...args);
            }
            return value as V;
        }
        const res = await this.params.getDataFunc(...args);
        if (res) {
            await ext.context.globalState.update(key, res);
            this.setExpiration(key, ...args);
            return res;
        }
        return undefined;
    }

    public async invalidate(key: string, ...args: Args): Promise<void> {
        const res = await this.params.getDataFunc(...args);
        if (res) {
            await ext.context.globalState.update(key, res);
            this.setExpiration(key, ...args);
        }
    }
}
