
<div align="center">

![image](https://github.com/user-attachments/assets/71e616f5-e655-49c7-a11f-abce0f238861)

</div>


## Peers

This project was made to test cache replicas. It uses the HTTP protocol for send data to cache on memory. The idea is to simulate peer communication.

## How does it work?

The project has some endpoints to manage each server peer. When information is persitid with endpoint sync, the data is sent to all other peers.
When new peers join the network, all peerURLs are synchronized first. After that, the peers sync their data.

## How to know if peers need an update?

The rule to check if peers need an update is the timestamp.


## What doesn't the project do?

- There isn't data collision handling.
- There isn't security between connections peers
