#!/bin/sh

wget https://dist.ballerina.io/downloads/1.2.4/ballerina-1.2.4.zip
docker build \
    --build-arg balDist=ballerina-1.2.4.zip \
    --build-arg balVersion=1.2.4 \
    -t workspace-langserver:0.0.1 \
    . \
