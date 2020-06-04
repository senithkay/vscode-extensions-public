java -cp "/Users/kavithlokuhewage/git/ballerina/distribution/zip/jballerina-tools/build/extracted-distributions/jballerina-tools-2.0.0-SNAPSHOT/bre/lib/*:/Users/kavithlokuhewage/git/ballerina/distribution/zip/jballerina-tools/build/extracted-distributions/jballerina-tools-2.0.0-SNAPSHOT/lib/tools/lang-server/lib/*:./build/libs/*:./build/dependencies/*" \
    -agentlib:jdwp=transport=dt_socket,server=y,suspend=y,address=5005 \
    -Dballerina.home=/Users/kavithlokuhewage/git/ballerina/distribution/zip/jballerina-tools/build/extracted-distributions/jballerina-tools-2.0.0-SNAPSHOT \
    -Dballerina.version=2.0.0-SNAPSHOT \
    org.wso2.choreo.workspace.langserver.LangServer
