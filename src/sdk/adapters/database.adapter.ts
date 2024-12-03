export type IDatabaseOutput<T = any> = {
    key: string;
    value: T;
    timestamp: number;
};

export interface IDatabaseAdapter<T = any> {
    delete(key: string): void;
    put(key: string, data: { timestamp: number; value: unknown; }): T;
    get(key: string): T;
    getAll(): Record<string, T>;
};