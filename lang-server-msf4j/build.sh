# wget https://dist.ballerina.io/downloads/1.2.4/ballerina-1.2.4.zip
docker build \
    --build-arg balDist=jballerina-tools-2.0.0-Preview2-SNAPSHOT.zip \
    --build-arg balVersion=2.0.0-Preview2-SNAPSHOT \
    -t kavith/workspace-langserver:0.0.8 \
    . \
