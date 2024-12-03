## Peers

This project was made to test cache replicas. It uses the HTTP protocol to send data, and the cache is in memory. The idia is simulate peers comunications.

## How does it work?

The project has some endpoints to manage each server peer. When information is persitid with endpoint sync, the data is sent to all other peers.
When new peers join the network, all peerURLs are synchronized first. After that, the peers sync their data.

## How to know if peers need an update?

The rule to check if peers need an update is the timestamp.


## What it doens't project do ?

- There isn't data collision handling.
- There aren't   security between connections peers
