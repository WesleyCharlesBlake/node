#!/bin/sh
services="poet-node poet-node-blockchain-writer bitcoind-1 bitcoind-2 mongo ipfs rabbit"

for i in $services
do
   docker-compose logs $i > /tmp/logs/$i.log
done

