FROM gradle:5.6.4-jdk8 AS gradle-builder
COPY --chown=gradle:gradle ./java /home/gradle/project
WORKDIR /home/gradle/project
RUN gradle build --no-daemon

FROM openjdk:8-jre-alpine

# Ballerina runtime distribution filename and version.
ARG balDist
ARG balVersion

ENV BALLERINA_VERSION ${balVersion}
ENV BALLEINA_RUNTIME_PATH /ballerina/runtime
ENV BALLERINA ${BALLEINA_RUNTIME_PATH}/bin/ballerina

# add Ballerina runtime.
COPY ${balDist} /zip/

# extract Ballerina Runtime
RUN mkdir -p /ballerina/files \
    && apk add --update --no-cache bash \
    && apk update \
    && apk upgrade \
    && unzip /zip/${balDist} -d /ballerina/ > /dev/null 2>&1 \
    && mv /ballerina/ballerina*/distributions/jballerina*/ ${BALLEINA_RUNTIME_PATH} \
    && mkdir -p ${BALLEINA_RUNTIME_PATH}/logs \
    && rm -rf /zip > /dev/null 2>&1 \
    && rm -rf /var/cache/apk/*

WORKDIR /lang-server

# copy artifacts
COPY ./ballerina /lang-server/
COPY --from=gradle-builder /home/gradle/project/build/libs/ ./libs/
RUN ${BALLERINA} build -a || test $(find target/bin/ -name *.jar)

# configure user
RUN addgroup choreo \
    && adduser -S -s /bin/bash -g 'appuser' -G choreo -D appuser \
    && chown -R appuser:choreo /ballerina \
    && chown -R appuser:choreo /lang-server

USER appuser

ENV DEFAULT_CONNECTOR_FILE /lang-server/connectors/connectors.toml

# pull required connectors
RUN /ballerina/runtime/bin/ballerina pull wso2/twitter \
    && ${BALLERINA} pull ballerinax/sfdc \
    && ${BALLERINA} pull ballerinax/twilio \
    && ${BALLERINA} pull ballerinax/netsuite \
    && ${BALLERINA} pull ballerinax/slack

ENV BALLEINA_RUNTIME_LIB_TOOLS_PATH ${BALLEINA_RUNTIME_PATH}/lib/tools

EXPOSE 9090

CMD [ \
        "java", \
        "-Dballerina.home=${BALLEINA_RUNTIME_PATH}", \
        "-Dballerina.version=${BALLERINA_VERSION}", \
        "-cp", \
        "${BALLEINA_RUNTIME_PATH}/bre/lib/*:${BALLEINA_RUNTIME_LIB_TOOLS_PATH}/lang-server/lib/*:${BALLEINA_RUNTIME_LIB_TOOLS_PATH}/debug-adaptor/lib/*:/lang-server/target/bin/langserver.jar", \
        "choreo/langserver/___init" \
    ]
