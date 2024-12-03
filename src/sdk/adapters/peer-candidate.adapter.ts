export interface IPeerCanditateAdapter {
    getFullUrl(): string;
    setUrl(url: string): void;
    getState(): Promise<any>;
    syncData(data: unknown): Promise<void>;
};
