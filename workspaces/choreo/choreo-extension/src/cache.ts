export interface CacheParams<V, Args extends any[]> {
    readonly expirationTime?: number;
    readonly getDataFunc: (...args: Args) => Promise<V | undefined>;
}

export class Cache<K, V, Args extends any[]> {
    private readonly _cache: Map<K, V>;
    private _timerIndex: Map<K, any>;
    private readonly _expirationTime: number;

    constructor(private params: CacheParams<V, Args>) {
        this._cache = new Map<K, V>();
        this._timerIndex = new Map<K, any>();
        this._expirationTime = params.expirationTime ?? 1000 * 60 * 10; // 10 minutes
    }

    private has(key: K): boolean {
        return this._cache.has(key);
    }

    private setExpiration(key: K, ...args: Args): void {
        if (this._timerIndex.has(key)) {
            clearTimeout(this._timerIndex.get(key));
        }
        const index = setTimeout(() => {
            this._timerIndex.delete(key);
            this.invalidate(key, ...args);
        }, this._expirationTime);
        this._timerIndex.set(key, index);
    }

    private set(key: K, value: V): void {
        this._cache.set(key, value);
    }

    public delete(key: K): void {
        this._cache.delete(key);
        clearTimeout(this._timerIndex.get(key));
        this._timerIndex.delete(key);
    }

    public async get(key: K, ...args: Args): Promise<V | undefined> {
        if (this.has(key)) {
            return this._cache.get(key);
        }
        const res = await this.params.getDataFunc(...args);
        if (res) {
            this.set(key, res);
            this.setExpiration(key, ...args);
            return res;
        }
        return undefined;
    }

    public async invalidate(key: K, ...args: Args): Promise<void> {
        const res = await this.params.getDataFunc(...args);
        if (res) {
            this.set(key, res);
            this.setExpiration(key, ...args);
        }
    }
}
