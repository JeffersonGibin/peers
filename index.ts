import { BASE_URL } from './src/sdk/constants';
import { MemoryCache } from './src/sdk/database/memory.database';
import { PeerSyncronizer } from './src/sdk/peer-syncronizer';
import { PeerHTTPCanditate } from './src/sdk/protocol/http/peer-candidate.http';
import { PeerHTTPNetwork } from './src/sdk/protocol/http/peer-network.http';
import {  Server } from './src/server';

const servers = () => {
    const serverFunctions: (() => Promise<void>)[] = [];
    const startRange = 8080;
    const endRange = 8081;
    
    for (let i = startRange; i <= endRange; i++) {
        const f = async () => {
            const database = new MemoryCache();
            const peerServers = new Set<string>();
            peerServers.add(`${BASE_URL}:${i}`);

            const peerNetwork = new PeerHTTPNetwork();
            const peerCandidate = new PeerHTTPCanditate();
            const dependencies = {
                database,
                peerNetwork,
                peerCandidate
            };

            await Server({ 
                peerServers, 
                port: i,
                dependencies
            });

            PeerSyncronizer.execute({
                peerServers,
                interval: 2000,
                currentPeerURL: `${BASE_URL}:${i}`,
                dependencies
            });

        };
        serverFunctions.push(f);
    }
    
    return {
        run: async () => {
            await Promise.all(serverFunctions.map(fn => fn()));
        },
    };
};

servers().run();
