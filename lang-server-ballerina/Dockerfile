FROM gradle:6.7.0-jdk11-openj9 AS javaBuild
COPY --chown=gradle:gradle ./java /home/gradle/project
WORKDIR /home/gradle/project
RUN gradle build --no-daemon

FROM ballerina/ballerina:swan-lake-preview5 AS ballerinaBuild
COPY --chown=ballerina:troupe ./ballerina /home/ballerina

RUN mkdir /home/ballerina/libs
COPY --from=javaBuild /home/gradle/project/build/libs/choreo-workspace-langserver.jar /home/ballerina/libs/choreo-workspace-langserver.jar 
WORKDIR /home/ballerina
RUN ballerina build -a

FROM choreoipaas/choreo-ballerina:swan-lake-preview5

WORKDIR /lang-server

COPY --from=ballerinaBuild --chown=ballerina:troupe /home/ballerina/target/bin /lang-server/
COPY --chown=ballerina:troupe ./connectors /lang-server/connectors/

ENV DEFAULT_CONNECTOR_FILE /lang-server/connectors/connectors.toml

RUN /ballerina/runtime/bin/ballerina pull ballerinax/sfdc \
    && /ballerina/runtime/bin/ballerina pull ballerinax/twilio \
    && /ballerina/runtime/bin/ballerina pull ballerinax/netsuite \
    && /ballerina/runtime/bin/ballerina pull ballerinax/slack

EXPOSE 9090

CMD [ \
        "java", \
        "-Dballerina.home=/ballerina/runtime/distributions/ballerina-slp5", \
        "-Dballerina.version=swan-lake-preview5", \
        "-cp", \
        "/ballerina/runtime/distributions/ballerina-slp5/bre/lib/*:/ballerina/runtime/distributions/ballerina-slp5/lib/tools/lang-server/lib/*:/lang-server/*", \
        "choreo.langserver.1_0_0.$_init" \
    ]
