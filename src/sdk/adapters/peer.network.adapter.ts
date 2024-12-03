import { IPeerCanditateAdapter } from "./peer-candidate.adapter";

export interface IPeerNetworkAdapter {
    registryPeer(peerCandidate: IPeerCanditateAdapter, peerURL: string): Promise<boolean>;
    discoverPeers(peerHost: string): Promise<string[]>;
}