import { IDatabaseAdapter } from "./adapters/database.adapter";
import { IPeerCanditateAdapter } from "./adapters/peer-candidate.adapter";
import { IPeerNetworkAdapter } from "./adapters/peer.network.adapter";

export interface PeerSyncronizerInput {
    interval: number;
    currentPeerURL: string;
    peerServers: Set<string>;
    dependencies: {
        database: IDatabaseAdapter;
        peerNetwork: IPeerNetworkAdapter;
        peerCandidate: IPeerCanditateAdapter;
    }
};

export type SyncDataInput = {
    peerInput: PeerSyncronizerInput, peerURL: string, cache: Record<string, any>, peerState: any;
}

export class PeerSyncronizer {
    private static syncedPairsRequest: Set<string> = new Set();

    private static async *syncData(input: SyncDataInput) {
        const { currentPeerURL, dependencies } = input.peerInput;
        const { peerCandidate } = dependencies

        for (const key of Object.keys(input.cache)) {
            const localValue = input.cache[key];
            const remoteValue = input.peerState[key];

            const executionKey = String(localValue.timestamp);

            if (PeerSyncronizer.syncedPairsRequest.has(executionKey)) {
                continue;
            }

            if (remoteValue && remoteValue.timestamp === localValue.timestamp) {
                continue;
            }

            await peerCandidate.syncData({
                key,
                timestamp: localValue.timestamp,
                value: localValue.value
            });

            PeerSyncronizer.syncedPairsRequest.add(executionKey);

            yield {
                key,
                timestamp: localValue.timestamp,
                value: localValue.value,
                transferPath: {
                    from: currentPeerURL,
                    to: input.peerURL,
                }
            };
        }
    }

    private static async *processPeers(input: PeerSyncronizerInput) {
        const { currentPeerURL, peerServers, dependencies } = input;
        const { database, peerCandidate, peerNetwork } = dependencies

        const peers = await peerNetwork.discoverPeers(currentPeerURL);

        for (const peerURL of peers) {
            try {
                peerCandidate.setUrl(peerURL);
                const responseRegistry = await peerNetwork.registryPeer(peerCandidate, currentPeerURL);

                peerServers.add(peerURL);

                if (responseRegistry) {
                    yield `[${currentPeerURL}]: registry peer in ${peerURL}`;
                }

                if (!peerServers.has(currentPeerURL)) {
                    peerServers.add(currentPeerURL);
                }

                if (peerURL === currentPeerURL) {
                    continue;
                }

                const cache = database?.getAll();
                const peerState = await peerCandidate.getState() ?? {};

                if (!peerState) {
                    continue;
                }

                yield* PeerSyncronizer.syncData({
                    cache,
                    peerURL,
                    peerState,
                    peerInput: input,
                });

            } catch (err: Error | any) {
                console.log(`[Peer is not available]: ${peerURL}`, err.message);
            }
        }
    }
    static execute(input: PeerSyncronizerInput): NodeJS.Timeout {
        const intervalId = setInterval(async () => {
            for await (const step of PeerSyncronizer.processPeers(input)) {
                console.log(step)
            }
        }, input.interval);

        return intervalId;
    }
}