docker build \
    --build-arg balDist=jballerina-tools-1.3.0-SNAPSHOT.zip \
    --build-arg balVersion=1.3.0-SNAPSHOT \
    -t workspace-langserver:0.0.1 \
    . \
