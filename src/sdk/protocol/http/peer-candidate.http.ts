import { IPeerCanditateAdapter } from "../../adapters/peer-candidate.adapter";

export class PeerHTTPCanditate implements IPeerCanditateAdapter {
    private url: string;

    constructor() {
        this.url = '';
    }
    getFullUrl(): string {
        return this.url;
    }

    public setUrl(url: string) {
        this.url = url;
    }
    async getState() {
        try {
            const res = await fetch(`${this.url}/peers/state`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            return await res.json();
        } catch {
            return null;
        }
    }

    async syncData(data: any) {
        try {
            await fetch(`${this.url}/peers/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } catch {
            console.log(`Failed to sync key '${data.key}' to peer ${this.url}`);
        }
    }
}
