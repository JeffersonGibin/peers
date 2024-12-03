
import express, { Request, Response } from 'express';
import { IDatabaseAdapter } from './sdk/adapters/database.adapter';
import { IPeerNetworkAdapter } from './sdk/adapters/peer.network.adapter';
import { IPeerCanditateAdapter } from './sdk/adapters/peer-candidate.adapter';

export type AppServerInput = {
    port: number;
    peerServers: Set<string>;
    dependencies: {
        database: IDatabaseAdapter;
        peerNetwork: IPeerNetworkAdapter;
        peerCandidate: IPeerCanditateAdapter;
    }
};

export type AppServer = (input: AppServerInput) => Promise<void>;

export const Server: AppServer = async (input: AppServerInput) => {
    const app = express();
    app.use(express.json());

    const PORT = input.port;
    const peerServers = input.peerServers;
    const { database } = input.dependencies;

    app.get('/helth', (req: Request<{}, string, {}>, res: Response) => {
        res.status(200).json('OK');
    });

    app.get('/peers/state', (req: Request<{}, unknown, {}>, res: Response) => {
        const data = database.getAll();
        res.status(200).json(data);
    });

    app.post('/peers/register', async (req: Request<{}, { message: string; }, { peer: string; }>, res: Response) => {
        const { peer } = req.body;
        if (!peer || peerServers.has(peer)) {
            res.status(409).json({ message: 'Peer already exists or invalid' });
            return;
        }

        peerServers.add(peer);
        res.status(200).json({ message: 'Peer registered successfully' });
    });

    app.get('/peers', (req: Request<{}, string[], {}>, res: Response) => {
        res.status(200).json([...peerServers]);
    });

    app.post('/peers/sync', (req: Request<{}, {}, { key: string; value: unknown; timestamp: number; }>, res: Response) => {
        const { key, value, timestamp } = req.body;
        const data = database.get(key);
        const receivedTimestamp = timestamp || Date.now();

        if (!data || receivedTimestamp > data.timestamp) {
            database.put(key, { timestamp: receivedTimestamp, value });
        }

        res.status(204).send();
    });

    app.listen(PORT, () => {
        console.log(`[Server ${PORT}]: Server listening`);
    });
}