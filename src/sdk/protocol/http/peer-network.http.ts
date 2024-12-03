import { IPeerCanditateAdapter } from "../../adapters/peer-candidate.adapter";
import { IPeerNetworkAdapter } from "../../adapters/peer.network.adapter";
import { PEER_BASE } from "../../constants";

export class PeerHTTPNetwork implements IPeerNetworkAdapter {
    constructor() { }

    async registryPeer(peerCandidate: IPeerCanditateAdapter, peerURL: string): Promise<boolean> {
        const peer = peerCandidate.getFullUrl();
        const peersList = await this.discoverPeers(peer);

        if (peersList.includes(peerURL)) return false;

        return fetch(`${peer}/peers/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ peer: peerURL })
        })
            .then(() => true)
            .catch(() => {
                console.error(`Failed to register ${peer}`);
                return false;
            });
    }

    async discoverPeers(peerHost: string): Promise<string[]> {
        const bootstrapHost = await fetch(`${PEER_BASE}/peers`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        }).then(res => {
            if (!res.ok) throw new Error(`Error bootstrapping peers: ${res.status}`);
            return res.json();
        });

        const response = await fetch(`${peerHost}/peers`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        }).then(res => {
            if (!res.ok) throw new Error(`Error fetching peers from ${peerHost}: ${res.status}`);
            return res.json();
        });

        const peers: string[] = [];

        for (const peer of bootstrapHost) {
            if (!response.includes(peer) || !peers.includes(peer)) {
                peers.push(peer);
            }
        }

        return peers;
    }
}