FROM gradle:5.6.4-jdk8 AS build
COPY --chown=gradle:gradle . /home/gradle/project
WORKDIR /home/gradle/project
RUN gradle build --no-daemon

FROM openjdk:8-jre-alpine

# Ballerina runtime distribution filename and version.
ARG balDist
ARG balVersion

ENV BALLERINA_VERSION ${balVersion}

# add Ballerina runtime.
COPY ${balDist} /zip/

# extract Ballerina Runtime
RUN mkdir -p /ballerina/files \
    && apk add --update --no-cache bash \
    && apk update \
    && apk upgrade \
    && unzip /zip/${balDist} -d /ballerina/ > /dev/null 2>&1 \
    && mv /ballerina/ballerina-${balVersion}/distributions/jballerina-${balVersion} /ballerina/runtime \
    && mkdir -p /ballerina/runtime/logs \
    && rm -rf /zip > /dev/null 2>&1 \
    && rm -rf /var/cache/apk/*

# copy server artifacts
WORKDIR /app

COPY --from=build /home/gradle/project/build/libs/ /app/
COPY --from=build /home/gradle/project/build/dependencies/ /app/

# configure user
RUN addgroup choreo \
    && adduser -S -s /bin/bash -g 'appuser' -G choreo -D appuser \
    && chown -R appuser:choreo /ballerina \
    && chown -R appuser:choreo /app

USER appuser

EXPOSE 9090

CMD [ \
        "java", \
        "-Dballerina.home=/ballerina/runtime", \
        "-Dballerina.version=${BALLERINA_VERSION}", \
        "-cp", \
        "/ballerina/runtime/bre/lib/*:/ballerina/runtime/lib/tools/lang-server/lib/*:/app/*", \
        "org.wso2.choreo.workspace.langserver.LangServer" \
    ]
