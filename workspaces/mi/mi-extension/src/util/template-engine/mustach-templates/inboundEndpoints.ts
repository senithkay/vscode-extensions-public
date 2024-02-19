/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { render } from "mustache";

interface Parameter {
    [key: string]: string | number | boolean;
}

export interface GetInboundTemplatesArgs {
    name: string;
    type: string;
    sequence: string;
    errorSequence: string;
}

const paramPool: { [key: string]: Parameter } = {
    custom: {
        interval: 1000,
        class: 'org.wso2.carbon.inbound.kafka.KafkaMessageConsumer',
        sequential: true,
        coordination: true,
        'inbound.behavior': 'polling',
    },
    wss: {
        'ws.client.side.broadcast.level': 0,
        'ws.use.port.offset': false,
    },
    cxf_ws_rm: {
        enableSSL: false,
    },
    feed: {
        interval: 1000,
        'feed.type': 'Atom',
    },
    file: {
        interval: 1000,
        sequential: true,
        coordination: true,
        'transport.vfs.ContentType': 'text/plain',
        'transport.vfs.LockReleaseSameNode': false,
        'transport.vfs.AutoLockRelease': false,
        'transport.vfs.ActionAfterFailure': 'DELETE',
        'transport.vfs.FailedRecordsFileName':
            'vfs-move-failed-records.properties',
        'transport.vfs.FailedRecordsFileDestination': 'repository/conf/',
        'transport.vfs.MoveFailedRecordTimestampFormat': 'dd-MM-yyyy HH:mm:ss',
        'transport.vfs.FailedRecordNextRetryDuration': 3000,
        'transport.vfs.ActionAfterProcess': 'DELETE',
        'transport.vfs.ReplyFileName': 'response.xml',
        'transport.vfs.DistributedLock': false,
        'transport.vfs.FileNamePattern': '.*.txt',
        'transport.vfs.Locking': 'enable',
        'transport.vfs.SFTPUserDirIsRoot': false,
        'transport.vfs.FileSortAttribute': 'none',
        'transport.vfs.FileSortAscending': true,
        'transport.vfs.CreateFolder': true,
        'transport.vfs.Streaming': false,
        'transport.vfs.Build': false,
        'transport.vfs.UpdateLastModified': true,
    },
    hl7: {
        'inbound.hl7.AutoAck': true,
        'inbound.hl7.TimeOut': 10000,
        'inbound.hl7.CharSet': 'UTF-8',
        'inbound.hl7.ValidateMessage': true,
        'inbound.hl7.BuildInvalidMessages': true,
        'inbound.hl7.PassThroughInvalidMessages': true,
    },
    http: {
        'inbound.http.port': 8000,
        'inbound.worker.pool.size.core': 400,
        'inbound.worker.pool.size.max': 500,
        'inbound.worker.thread.keep.alive.sec': 60,
        'inbound.worker.pool.queue.length': -1,
        'inbound.thread.id': 'PassThroughInboundWorkerPool',
    },
    https: {
        'inbound.http.port': 8000,
        'inbound.worker.pool.size.core': 400,
        'inbound.worker.pool.size.max': 500,
        'inbound.worker.thread.keep.alive.sec': 60,
        'inbound.worker.pool.queue.length': -1,
        'inbound.thread.id': 'PassThroughInboundWorkerPool',
    },
    jms: {
        interval: 1000,
        sequential: true,
        coordination: true,
        'transport.jms.CacheLevel': 3,
        'transport.jms.SessionAcknowledgement': 'AUTO_ACKNOWLEDGE',
        'transport.jms.SessionTransacted': false,
        'transport.jms.ConnectionFactoryType': 'queue',
        'transport.jms.SharedSubscription': false,
        'transport.jms.ResetConnectionOnPollingSuspension': false,
    },
    kafka: {
        interval: 1000,
        sequential: true,
        coordination: true,
        'zookeeper.connect': 'localhost:2181',
        'group.id': 'sampleGroupID',
        'consumer.type': 'highlevel',
        topics: 'sampleTopic',
        'thread.count': 1,
        'socket.timeout.ms': 30000,
        'socket.receive.buffer.bytes': 65536,
        'fetch.message.max.bytes': 1048576,
        'num.consumer.fetchers': 1,
        'auto.commit.enable': false,
        'auto.commit.interval.ms': 60000,
        'queued.max.message.chunks': 2,
        'rebalance.max.retries': 4,
        'fetch.min.bytes': 1,
        'fetch.wait.max.ms': 100,
        'rebalance.backoff.ms': 2000,
        'refresh.leader.backoff.ms': 200,
        'auto.offset.reset': 'largest',
        'consumer.timeout.ms': 3000,
        'exclude.internal.topics': false,
        'partition.assignment.strategy': 'roundrobin',
        'zookeeper.session.timeout.ms': 6000,
        'zookeeper.connection.timeout.ms': 6000,
        'zookeeper.sync.time.ms': 2000,
        'offsets.storage': 'zookeeper',
        'offsets.channel.backoff.ms': 1000,
        'offsets.channel.socket.timeout.ms': 10000,
        'offsets.commit.max.retries': 5,
        'dual.commit.enabled': true,
    },
    mqtt: {
        sequential: true,
        'mqtt.connection.factory': 'AMQPConnectionFactory',
        'mqtt.subscription.qos': 0,
        'mqtt.session.clean': false,
        'mqtt.reconnection.interval': 1000,
    },
    rabbitmq: {
        sequential: true,
        coordination: true,
        'rabbitmq.connection.factory': 'connection_factory',
        'rabbitmq.server.host.name': 'localhost',
        'rabbitmq.server.port': 5672,
        'rabbitmq.server.user.name': 'guest',
        'rabbitmq.server.password': 'guest',
        'rabbitmq.queue.name': 'queue_name',
        'rabbitmq.exchange.name': 'excahnge_name',
    },
    ws: {
        'ws.client.side.broadcast.level': 0,
        'ws.use.port.offset': false,
    },
    wso2_mb: {
        interval: 1000,
        sequential: true,
        coordination: true,
        'transport.jms.CacheLevel': 3,
        'java.naming.factory.initial':
            'org.wso2.andes.jndi.PropertiesFileInitialContextFactory',
        'transport.jms.SessionAcknowledgement': 'AUTO_ACKNOWLEDGE',
        'transport.jms.SessionTransacted': false,
        'transport.jms.ConnectionFactoryType': 'topic',
        'connectionfactory.TopicConnectionFactory':
            "amqp://admin:admin@clientID/carbon?brokerlist='tcp://localhost:5673'",
        'transport.jms.SharedSubscription': false,
    },
};

export function getInboundEndpointMustacheTemplate() {
    return `<?xml version="1.0" encoding="UTF-8"?>
<inboundEndpoint name="{{name}}" {{#isCustomType}}class="org.wso2.carbon.inbound.kafka.KafkaMessageConsumer" {{/isCustomType}}{{#showSequence}}onError="{{errorSequence}}" sequence="{{sequence}}" {{/showSequence}}{{#protocol}}protocol="{{protocol}}" {{/protocol}}suspend="false" xmlns="http://ws.apache.org/ns/synapse">
    <parameters>
    {{#params}}
        <parameter name="{{key}}">{{value}}</parameter>
    {{/params}}
    </parameters>
</inboundEndpoint>`;
}

export function getInboundEndpointdXml(data: GetInboundTemplatesArgs) {
    const protocol =
        data.type === 'custom' ? false : data.type === 'wso2_mb' ? 'jms' : data.type;

    const showSequence = !['cxf_ws_rm', 'feed', 'http', 'https'].includes(data.type);

    const params: Parameter[] = [];
    Object.entries(paramPool[data.type]).map(([key, value]) => {
        params.push({ key, value });
    });

    const modifiedData = {
        ...data,
        isCustomType: data.type === 'custom',
        showSequence,
        protocol,
        params
    };

    return render(getInboundEndpointMustacheTemplate(), modifiedData);
}
