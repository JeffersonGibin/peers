import { IDatabaseAdapter, IDatabaseOutput } from "../adapters/database.adapter";

export type IMemoryOutput = {
    value: unknown;
};

export class MemoryCache implements IDatabaseAdapter<IDatabaseOutput<IMemoryOutput>> {
    private memory: Record<string, IDatabaseOutput>;

    constructor() {
        this.memory = {};
    }

    delete(key: string): void {
        delete this.memory[key];
    }

    put(key: string, data: { timestamp: number; value: unknown; }): IDatabaseOutput {
        this.memory[key] = {
            key,
            value: data.value,
            timestamp: data.timestamp
        };

        return this.memory[key];
    }

    get(key: string): IDatabaseOutput {
        return this.memory[key];
    }

    getAll(): Record<string, IDatabaseOutput> {
        return this.memory;
    }
}