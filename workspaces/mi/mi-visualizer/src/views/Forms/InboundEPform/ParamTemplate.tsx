/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

interface Paramater {
    name?: string;
    type: string;
    value: string | number | boolean;
    items?: { content: string; value: string }[];
}

interface ParamPool {
    [key: string]: {
        [key: string]: Paramater | {
            [key: string]: Paramater;
        };
    };
}

export const inboundEndpointParams: ParamPool = {
    custom: {
        class: {
            type: 'text',
            value: 'org.wso2.carbon.inbound.kafka.KafkaMessageConsumer',
        },
        'inbound.behavior': {
            name: 'Inbound Endpoint Behavior',
            type: 'dropdown',
            items: [
                {
                    content: "Polling Inbound Endpoint",
                    value: "polling",
                },
                {
                    content: "Listening Inbound Endpoint",
                    value: "listening",
                },
                {
                    content: "Event Based Inbound Endpoint",
                    value: "eventBased",
                },
            ],
            value: 'polling',
        },
        interval: {
            type: 'text',
            value: 1000,
        },
        sequential: {
            type: 'checkbox',
            value: true,
        },
        coordination: {
            type: 'checkbox',
            value: true,
        },
    },
    http: {
        'inbound.http.port': {
            type: 'text',
            value: 8000,
        },
        advance: {
            'inbound.worker.pool.size.core': {
                type: 'text',
                value: 400,
            },
            'inbound.worker.pool.size.max': {
                type: 'text',
                value: 500,
            },
            'inbound.worker.thread.keep.alive.sec': {
                type: 'text',
                value: 60,
            },
            'inbound.worker.pool.queue.length': {
                type: 'text',
                value: -1,
            },
            'inbound.thread.group.id': {
                type: 'text',
                value: '',
            },
            'inbound.thread.id': {
                type: 'text',
                value: 'PassThroughInboundWorkerPool',
            },
            'dispatch.filter.pattern': {
                type: 'text',
                value: '',
            },
        }
    },
    cxf_ws_rm: {
        'inbound.cxf.rm.host': {
            type: 'text',
            value: '',
        },
        'inbound.cxf.rm.port': {
            type: 'text',
            value: '',
        },
        'inbound.cxf.rm.config-file': {
            type: 'text',
            value: '',
        },
        enableSSL: {
            name: 'Enable SSL',
            type: 'checkbox',
            value: false,
        },
    },
    feed: {
        interval: {
            type: 'text',
            value: 1000,
        },
        'feed.url': {
            name: 'Transport Feed URL',
            type: 'text',
            value: '',
        },
        'feed.type': {
            name: 'Transport Feed Type',
            type: 'dropdown',
            items: [
                {
                    content: "RSS",
                    value: "RSS",
                },
                {
                    content: "Atom",
                    value: "Atom",
                },
            ],
            value: 'Atom',
        },
    },
    hl7: {
        'inbound.hl7.Port': {
            name: 'Inbound HL7 Port',
            type: 'text',
            value: '',
        },
        'inbound.hl7.AutoAck': {
            name: 'Inbound HL7 Auto Acknowledgement',
            type: 'checkbox',
            value: true,
        },
        advance: {
            'inbound.hl7.MessagePreProcessor': {
                name: 'Inbound HL7 Message Pre-processor',
                type: 'text',
                value: '',
            },
            'inbound.hl7.CharSet': {
                name: 'Inbound HL7 Char Set',
                type: 'text',
                value: 'UTF-8',
            },
            'inbound.hl7.TimeOut': {
                name: 'Inbound HL7 Time Out',
                type: 'text',
                value: 10000,
            },
            'inbound.hl7.ValidateMessage': {
                name: 'Inbound HL7 Validate Message',
                type: 'checkbox',
                value: true,
            },
            'inbound.hl7.BuildInvalidMessages': {
                name: 'Inbound HL7 Build Invalid Messages',
                type: 'checkbox',
                value: true,
            },
            'inbound.hl7.PassThroughInvalidMessages': {
                name: 'Inbound HL7 Pass Through Invalid Messages',
                type: 'checkbox',
                value: true,
            },
        }
    },
    jms: {
        interval: {
            type: 'text',
            value: 1000,
        },
        sequential: {
            type: 'checkbox',
            value: true,
        },
        coordination: {
            type: 'checkbox',
            value: true,
        },
        'java.naming.factory.initial': {
            type: 'text',
            value: '',
        },
        'java.naming.provider.url': {
            type: 'text',
            value: '',
        },
        'java.naming.security.credentials': {
            type: 'text',
            value: '',
        },
        'java.naming.security.principal': {
            type: 'text',
            value: '',
        },
        'transport.jms.ConnectionFactoryJNDIName': {
            type: 'text',
            name: 'Connection Factory JNDI Name',
            value: '',
        },
        'transport.jms.ConnectionFactoryType': {
            type: 'dropdown',
            name: 'Connection Factory Type',
            value: 'queue',
            items: [
                {
                    content: "queue",
                    value: "queue",
                },
                {
                    content: "topic",
                    value: "topic",
                },
            ],
        },
        'transport.jms.Destination': {
            type: 'text',
            value: '',
        },
        'transport.jms.SessionTransacted': {
            type: 'checkbox',
            name: 'Session Transacted',
            value: false,
        },
        'transport.jms.SessionAcknowledgement': {
            type: 'dropdown',
            name: 'Session Acknowledgement',
            value: 'AUTO_ACKNOWLEDGE',
            items: [
                {
                    content: "AUTO_ACKNOWLEDGE",
                    value: "AUTO_ACKNOWLEDGE",
                },
                {
                    content: "CLIENT_ACKNOWLEDGE",
                    value: "CLIENT_ACKNOWLEDGE",
                },
                {
                    content: "DUPS_OK_ACKNOWLEDGE",
                    value: "DUPS_OK_ACKNOWLEDGE",
                },
                {
                    content: "SESSION_TRANSACTED",
                    value: "SESSION_TRANSACTED",
                }
            ],
        },
        'transport.jms.CacheLevel': {
            type: 'text',
            name: 'Cache Level',
            value: 3,
        },
        advance: {
            'transport.jms.MessageSelector': {
                type: 'text',
                name: 'Message Selector',
                value: '',
            },
            'transport.jms.UserName': {
                type: 'text',
                value: '',
            },
            'transport.jms.Password': {
                type: 'text',
                value: '',
            },
            'transport.jms.SubscriptionDurable': {
                type: 'text',
                name: 'Subscription Durable',
                value: '',
            },
            'transport.jms.JMSSpecVersion': {
                type: 'text',
                value: '',
            },
            'transport.jms.DurableSubscriberClientID': {
                type: 'text',
                name: 'Durable Subscriber Client ID',
                value: '',
            },
            'transport.jms.ReceiveTimeout': {
                type: 'text',
                name: 'Receive Timeout',
                value: '',
            },
            'transport.jms.ContentType': {
                type: 'text',
                name: 'Content Type',
                value: '',
            },
            'transport.jms.ReplyDestination': {
                type: 'text',
                name: 'Reply Destination',
                value: '',
            },
            'transport.jms.PubSubNoLocal': {
                type: 'text',
                name: 'Pub Sub No Local',
                value: '',
            },
            'transport.jms.DurableSubscriberName': {
                type: 'text',
                name: 'Durable Subscriber Name',
                value: '',
            },
            'transport.jms.ContentTypeProperty': {
                type: 'text',
                name: 'Content Type Property',
                value: '',
            },
            'transport.jms.SharedSubscription': {
                type: 'checkbox',
                name: 'Shared Subscription',
                value: false,
            },
            'pinnedServers': {
                type: 'text',
                name: 'Pinned Servers',
                value: '',
            },
            'concurrent.consumers': {
                type: 'text',
                value: '',
            },
            'transport.jms.retry.duration': {
                type: 'text',
                value: '',
            },
            'transport.jms.ResetConnectionOnPollingSuspension': {
                type: 'checkbox',
                name: 'Reset Connection On Polling Suspension',
                value: false,
            },
            'transport.jms.RetriesBeforeSuspension': {
                type: 'text',
                name: 'Retries Before Suspension',
                value: '',
            },
            'transport.jms.PollingSuspensionPeriod': {
                type: 'text',
                name: 'Polling Suspension Period',
                value: '',
            },
            'db_url': {
                type: 'text',
                value: '',
            },
            'transport.jms.MessagePropertyHyphens': {
                type: 'text',
                name: 'Message Property Hyphens',
                value: '',
            },
        }
    },
    file: {
        interval: {
            type: 'text',
            value: 1000,
        },
        sequential: {
            type: 'checkbox',
            value: true,
        },
        coordination: {
            type: 'checkbox',
            value: true,
        },
        'transport.vfs.FileURI': {
            type: 'text',
            name: 'File URI',
            value: '',
        },
        'transport.vfs.ContentType': {
            type: 'text',
            name: 'Content Type',
            value: 'text/plain',
        },
        advance: {
            'transport.vfs.LockReleaseSameNode': {
                type: 'checkbox',
                name: 'Lock Release Same Node',
                value: false,
            },
            'transport.vfs.AutoLockRelease': {
                type: 'checkbox',
                name: 'Auto Lock Release',
                value: false,
            },
            'transport.vfs.ActionAfterFailure': {
                type: 'dropdown',
                name: 'Action After Failure',
                value: 'DELETE',
                items: [
                    {
                        content: "DELETE",
                        value: "DELETE",
                    },
                    {
                        content: "MOVE",
                        value: "MOVE",
                    },
                    {
                        content: "NONE",
                        value: "NONE",
                    },
                ],
            },
            'transport.vfs.MaxRetryCount': {
                type: 'text',
                name: 'Max Retry Count',
                value: '',
            },
            'transport.vfs.MoveAfterFailedMove': {
                type: 'text',
                name: 'Move After Failed Move',
                value: '',
            },
            'transport.vfs.FailedRecordsFileName': {
                type: 'text',
                name: 'Failed Records File Name',
                value: 'vfs-move-failed-records.properties',
            },
            'transport.vfs.FailedRecordsFileDestination': {
                type: 'text',
                name: 'Failed Records File Destination',
                value: 'repository/conf/',
            },
            'transport.vfs.MoveFailedRecordTimestampFormat': {
                type: 'text',
                name: 'Move Failed Record Timestamp Format',
                value: 'dd-MM-yyyy HH:mm:ss',
            },
            'transport.vfs.FailedRecordNextRetryDuration': {
                type: 'text',
                name: 'Failed Record Next Retry Duration',
                value: 3000,
            },
            'transport.vfs.ReconnectTimeout': {
                type: 'text',
                name: 'Reconnect Timeout',
                value: '',
            },
            'transport.vfs.ActionAfterProcess': {
                type: 'dropdown',
                name: 'Action After Process',
                value: 'DELETE',
                items: [
                    {
                        content: "DELETE",
                        value: "DELETE",
                    },
                    {
                        content: "MOVE",
                        value: "MOVE",
                    },
                    {
                        content: "NONE",
                        value: "NONE",
                    },
                ],
            },
            'transport.vfs.MoveAfterFailure': {
                type: 'text',
                name: 'Move After Failure',
                value: '',
            },
            'transport.vfs.ReplyFileURI': {
                type: 'text',
                name: 'Reply File URI',
                value: '',
            },
            'transport.vfs.ReplyFileName': {
                type: 'text',
                name: 'Reply File Name',
                value: 'response.xml',
            },
            'transport.vfs.MoveTimestampFormat': {
                type: 'text',
                name: 'Move Timestamp Format',
                value: '',
            },
            'transport.vfs.DistributedLock': {
                type: 'checkbox',
                name: 'Distributed Lock',
                value: false,
            },
            'transport.vfs.FileNamePattern': {
                type: 'text',
                name: 'File Name Pattern',
                value: '.*.txt',
            },
            'transport.vfs.FileProcessInterval': {
                type: 'text',
                name: 'File Process Interval',
                value: '',
            },
            'transport.vfs.MoveAfterProcess': {
                type: 'text',
                name: 'Move After Process',
                value: '',
            },
            'transport.vfs.Locking': {
                type: 'dropdown',
                name: 'Locking',
                value: 'enable',
                items: [
                    {
                        content: "enable",
                        value: "enable",
                    },
                    {
                        content: "disable",
                        value: "disable",
                    },
                ],
            },
            'transport.vfs.DistributedTimeout': {
                type: 'text',
                name: 'Distributed Timeout',
                value: '',
            },
            'transport.vfs.SFTPIdentities': {
                type: 'text',
                name: 'SFTP Identities',
                value: '',
            },
            'transport.vfs.SFTPIdentityPassPhrase': {
                type: 'text',
                name: 'SFTP Identity Pass Phrase',
                value: '',
            },
            'transport.vfs.SFTPUserDirIsRoot': {
                type: 'checkbox',
                name: 'SFTP User Dir Is Root',
                value: false,
            },
            'transport.vfs.FileSortAttribute': {
                type: 'text',
                name: 'File Sort Attribute',
                value: 'none',
            },
            'transport.vfs.FileSortAscending': {
                type: 'checkbox',
                name: 'File Sort Ascending',
                value: true,
            },
            'transport.vfs.SubFolderTimestampFormat': {
                type: 'text',
                name: 'Sub Folder Timestamp Format',
                value: '',
            },
            'transport.vfs.CreateFolder': {
                type: 'checkbox',
                name: 'Create Folder',
                value: true,
            },
            'transport.vfs.FileProcessCount': {
                type: 'text',
                name: 'File Process Count',
                value: '',
            },
            'transport.vfs.Streaming': {
                type: 'checkbox',
                name: 'Streaming',
                value: false,
            },
            'transport.vfs.Build': {
                type: 'checkbox',
                name: 'Build',
                value: false,
            },
            'transport.vfs.UpdateLastModified': {
                type: 'checkbox',
                name: 'Update Last Modified',
                value: true,
            },
        }
    },
    ws: {
        'inbound.ws.port': {
            type: 'text',
            value: '',
        },
        'ws.client.side.broadcast.level': {
            type: 'dropdown',
            value: '0',
            items: [
                {
                    content: "0",
                    value: '0',
                },
                {
                    content: "1",
                    value: '1',
                },
                {
                    content: "2",
                    value: '2',
                },
            ],
        },
        'ws.outflow.dispatch.sequence': {
            type: 'text',
            value: '',
        },
        'ws.outflow.dispatch.fault.sequence': {
            type: 'text',
            value: '',
        },
        advance: {
            'ws.boss.thread.pool.size': {
                type: 'text',
                value: '',
            },
            'ws.worker.thread.pool.size': {
                type: 'text',
                value: '',
            },
            'ws.subprotocol.handler.class': {
                type: 'text',
                value: '',
            },
            'ws.pipeline.handler.class': {
                type: 'text',
                value: '',
            },
            'ws.default.content.type': {
                type: 'text',
                value: '',
            },
            'ws.shutdown.status.code': {
                type: 'text',
                value: '',
            },
            'ws.shutdown.status.message': {
                type: 'text',
                value: '',
            },
            'ws.use.port.offset': {
                type: 'checkbox',
                value: false,
            },
        }
    },
    https: {
        'inbound.http.port': {
            type: 'text',
            value: 8000,
        },
        'keystore': {
            type: 'text',
            value: '',
        },
        advance: {
            'inbound.worker.pool.size.core': {
                type: 'text',
                value: 400,
            },
            'inbound.worker.pool.size.max': {
                type: 'text',
                value: 500,
            },
            'inbound.worker.thread.keep.alive.sec': {
                type: 'text',
                value: 60,
            },
            'inbound.worker.pool.queue.length': {
                type: 'text',
                value: -1,
            },
            'inbound.thread.group.id': {
                type: 'text',
                value: '',
            },
            'inbound.thread.id': {
                type: 'text',
                value: 'PassThroughInboundWorkerPool',
            },
            'dispatch.filter.pattern': {
                type: 'text',
                value: '',
            },
            'truststore': {
                type: 'text',
                value: '',
            },
            'SSLVerifyClient': {
                type: 'text',
                name: 'SSL Verify Client',
                value: '',
            },
            'SSLProtocol': {
                type: 'text',
                name: 'SSL Protocol',
                value: '',
            },
            'HttpsProtocols': {
                type: 'text',
                name: 'Https Protocols',
                value: '',
            },
            'CertificateRevocationVerifier': {
                type: 'text',
                name: 'Certificate Revocation Verifier',
                value: '',
            },
        }
    },
    wss: {
        'inbound.ws.port': {
            type: 'text',
            value: '',
        },
        'ws.client.side.broadcast.level': {
            type: 'dropdown',
            value: '0',
            items: [
                {
                    content: "0",
                    value: '0',
                },
                {
                    content: "1",
                    value: '1',
                },
                {
                    content: "2",
                    value: '2',
                },
            ],
        },
        'ws.outflow.dispatch.sequence': {
            type: 'text',
            value: '',
        },
        'ws.outflow.dispatch.fault.sequence': {
            type: 'text',
            value: '',
        },
        'wss.ssl.key.store.file': {
            type: 'text',
            value: '',
        },
        'wss.ssl.key.store.pass': {
            type: 'text',
            value: '',
        },
        'wss.ssl.trust.store.file': {
            type: 'text',
            value: '',
        },
        'wss.ssl.trust.store.pass': {
            type: 'text',
            value: '',
        },
        'wss.ssl.cert.pass': {
            type: 'text',
            value: '',
        },
        advance: {
            'ws.boss.thread.pool.size': {
                type: 'text',
                value: '',
            },
            'ws.worker.thread.pool.size': {
                type: 'text',
                value: '',
            },
            'ws.subprotocol.handler.class': {
                type: 'text',
                value: '',
            },
            'ws.default.content.type': {
                type: 'text',
                value: '',
            },
            'ws.shutdown.status.code': {
                type: 'text',
                value: '',
            },
            'ws.shutdown.status.message': {
                type: 'text',
                value: '',
            },
            'ws.use.port.offset': {
                type: 'checkbox',
                value: false,
            },
            'wss.ssl.protocols': {
                type: 'text',
                value: '',
            },
            'wss.ssl.cipher.suites': {
                type: 'text',
                value: '',
            },
        }
    },
    kafka: {
        interval: {
            type: 'text',
            value: 1000,
        },
        sequential: {
            type: 'checkbox',
            value: true,
        },
        coordination: {
            type: 'checkbox',
            value: true,
        },
        'zookeeper.connect': {
            type: 'text',
            value: 'localhost:2181',
        },
        'group.id': {
            type: 'text',
            name: 'Group ID',
            value: 'sampleGroupID',
        },
        'content.type': {
            type: 'text',
            value: '',
        },
        'consumer.type': {
            type: 'dropdown',
            value: 'highlevel',
            items: [
                {
                    content: "high level",
                    value: "highlevel",
                },
                {
                    content: "simple",
                    value: "simple",
                },
            ],
        },
        'topics': {
            type: 'dropdown',
            name: 'Topics or Topics Filter ??',
            value: 'sampleTopic',
        },
        advance: {
            'thread.count': {
                type: 'text',
                value: 1,
            },
            'consumer.id': {
                type: 'text',
                value: '',
            },
            'socket.timeout.ms': {
                type: 'text',
                name: 'Socket Timeout (ms)',
                value: 30000,
            },
            'socket.receive.buffer.bytes': {
                type: 'text',
                value: 65536,
            },
            'fetch.message.max.bytes': {
                type: 'text',
                value: 1048576,
            },
            'num.consumer.fetchers': {
                type: 'text',
                name: 'Number of Consumer Fetchers',
                value: 1,
            },
            'auto.commit.enable': {
                type: 'checkbox',
                value: false,
            },
            'auto.commit.interval.ms': {
                type: 'text',
                name: 'Auto Commit Interval (ms)',
                value: 60000,
            },
            'queued.max.message.chunks': {
                type: 'text',
                value: 2,
            },
            'rebalance.max.retries': {
                type: 'text',
                value: 4,
            },
            'fetch.min.bytes': {
                type: 'text',
                value: 1,
            },
            'fetch.wait.max.ms': {
                type: 'text',
                name: 'Fetch Wait Max (ms)',
                value: 100,
            },
            'rebalance.backoff.ms': {
                type: 'text',
                name: 'Rebalance Backoff (ms)',
                value: 2000,
            },
            'refresh.leader.backoff.ms': {
                type: 'text',
                name: 'Refresh Leader Backoff (ms)',
                value: 200,
            },
            'auto.offset.reset': {
                type: 'dropdown',
                value: 'largest',
                items: [
                    {
                        content: "largest",
                        value: "largest",
                    },
                    {
                        content: "smallest",
                        value: "smallest",
                    },
                ],
            },
            'consumer.timeout.ms': {
                type: 'text',
                name: 'Consumer Timeout (ms)',
                value: 3000,
            },
            'exclude.internal.topics': {
                type: 'checkbox',
                value: false,
            },
            'partition.assignment.strategy': {
                type: 'dropdown',
                value: 'roundrobin',
                items: [
                    {
                        content: "round robin",
                        value: "roundrobin",
                    },
                    {
                        content: "range",
                        value: "range",
                    },
                ],
            },
            'client.id': {
                type: 'text',
                value: '',
            },
            'zookeeper.session.timeout.ms': {
                type: 'text',
                name: 'Zookeeper Session Timeout (ms)',
                value: 6000,
            },
            'zookeeper.connection.timeout.ms': {
                type: 'text',
                name: 'Zookeeper Connection Timeout (ms)',
                value: 6000,
            },
            'zookeeper.sync.time.ms': {
                type: 'text',
                name: 'Zookeeper Sync Time (ms)',
                value: 2000,
            },
            'offsets.storage': {
                type: 'dropdown',
                value: 'zookeeper',
                items: [
                    {
                        content: "zookeeper",
                        value: "zookeeper",
                    },
                    {
                        content: "kafka",
                        value: "kafka",
                    },
                ],
            },
            'offsets.channel.backoff.ms': {
                type: 'text',
                name: 'Offsets Channel Backoff (ms)',
                value: 1000,
            },
            'offsets.channel.socket.timeout.ms': {
                type: 'text',
                name: 'Offsets Channel Socket Timeout (ms)',
                value: 10000,
            },
            'offsets.commit.max.retries': {
                type: 'text',
                value: 5,
            },
            'dual.commit.enabled': {
                type: 'checkbox',
                value: true,
            },
        }
    },
    mqtt: {
        'mqtt.reconnection.interval': {
            type: 'text',
            name: 'Reconnection Interval',
            value: 1000,
        },
        sequential: {
            type: 'checkbox',
            value: true,
        },
        coordination: {
            type: 'checkbox',
            value: true,
        },
        'mqtt.connection.factory': {
            type: 'text',
            value: 'AMQPConnectionFactory',
        },
        'mqtt.server.host.name': {
            type: 'text',
            value: 'nnn',
        },
        'mqtt.server.port': {
            type: 'text',
            value: 'nnn',
        },
        'mqtt.topic.name': {
            type: 'text',
            value: 'nnn',
        },
        // ?? key-store ?
        advance: {
            'mqtt.subscription.qos': {
                type: 'dropdown',
                name: 'Subscription QoS',
                value: '0',
                items: [
                    {
                        content: "0",
                        value: "0",
                    },
                    {
                        content: "1",
                        value: "1",
                    },
                    {
                        content: "2",
                        value: "2",
                    }
                ]
            },
            'mqtt.session.clean': {
                type: 'checkbox',
                name: 'Session Clean',
                value: false,
            },
            'mqtt.ssl.enable': {
                type: 'text',
                name: 'SSL Enable',
                value: '',
            },
            'mqtt.temporary.store.directory': {
                type: 'text',
                name: 'Temporary Store Directory',
                value: '',
            },
            'mqtt.subscription.username': {
                type: 'text',
                name: 'Subscription Username',
                value: '',
            },
            'mqtt.subscription.password': {
                type: 'text',
                name: 'Subscription Password',
                value: '',
            },
            'mqtt.client.id': {
                type: 'text',
                name: 'Client ID',
                value: '',
            },
            // Trust store ???
            'mqtt.ssl.keystore.location': {
                type: 'text',
                name: 'SSL Keystore Location',
                value: '',
            },
            'mqtt.ssl.keystore.type': {
                type: 'text',
                name: 'SSL Keystore Type',
                value: '',
            },
            'mqtt.ssl.keystore.password': {
                type: 'text',
                name: 'SSL Keystore Password',
                value: '',
            },
            'mqtt.ssl.truststore.location': {
                type: 'text',
                name: 'SSL Truststore Location',
                value: '',
            },
            'mqtt.ssl.truststore.type': {
                type: 'text',
                name: 'SSL Truststore Type',
                value: '',
            },
            'mqtt.ssl.truststore.password': {
                type: 'text',
                name: 'SSL Truststore Password',
                value: '',
            },
            'mqtt.ssl.version': {
                type: 'text',
                name: 'SSL Version',
                value: '',
            },
        }
    },
    rabbitmq: {
        sequential: {
            type: 'checkbox',
            value: true,
        },
        coordination: {
            type: 'checkbox',
            value: true,
        },
        'rabbitmq.connection.factory': {
            type: 'text',
            value: 'connection_factory',
        },
        'rabbitmq.server.host.name': {
            type: 'text',
            value: 'localhost',
        },
        'rabbitmq.server.port': {
            type: 'text',
            value: 5672,
        },
        'rabbitmq.server.user.name': {
            type: 'text',
            value: 'guest',
        },
        'rabbitmq.server.password': {
            type: 'text',
            value: 'guest',
        },
        'rabbitmq.queue.name': {
            type: 'text',
            value: 'queue_name',
        },
        'rabbitmq.exchange.name': {
            type: 'text',
            value: 'excahnge_name',
        },
        advance: {
            'rabbitmq.queue.durable': {
                type: 'text',
                name: 'Queue Durable',
                value: '',
            },
            'rabbitmq.queue.exclusive': {
                type: 'text',
                name: 'Queue Exclusive',
                value: '',
            },
            'rabbitmq.queue.auto.delete': {
                type: 'text',
                name: 'Queue Auto Delete',
                value: '',
            },
            'rabbitmq.queue.auto.ack': {
                type: 'text',
                name: 'Queue Auto Ack',
                value: '',
            },
            'rabbitmq.queue.routing.key': {
                type: 'text',
                name: 'Queue Routing Key',
                value: '',
            },
            'rabbitmq.queue.delivery.mode': {
                type: 'text',
                name: 'Queue Delivery Mode',
                value: '',
            },
            'rabbitmq.exchange.type': {
                type: 'text',
                name: 'Exchange Type',
                value: 'mom',
            },
            'rabbitmq.exchange.durable': {
                type: 'text',
                name: 'Exchange Durable',
                value: 'mom',
            },
            'rabbitmq.exchange.auto.delete': {
                type: 'text',
                name: 'Exchange Auto Delete',
                value: 'jnn',
            },
            'rabbitmq.server.virtual.host': {
                type: 'text',
                name: 'Server Virtual Host',
                value: 'inuin',
            },
            'rabbitmq.factory.heartbeat': {
                type: 'text',
                name: 'Factory Heartbeat',
                value: 'iunin',
            },
            'rabbitmq.factory.connection.timeout': {
                type: 'text',
                name: 'Factory Connection Timeout',
                value: '',
            },
            'rabbitmq.connection.factory.network.recovery.interval': {
                type: 'text',
                name: 'Connection Factory Network Recovery Interval',
                value: '',
            },
            'rabbitmq.connection.ssl.enabled': {
                type: 'text',
                name: 'Connection SSL Enabled',
                value: '',
            },
            'rabbitmq.connection.ssl.keystore.location': {
                type: 'text',
                name: 'Connection SSL Keystore Location',
                value: '',
            },
            'rabbitmq.connection.ssl.keystore.type': {
                type: 'text',
                name: 'Connection SSL Keystore Type',
                value: '',
            },
            'rabbitmq.connection.ssl.keystore.password': {
                type: 'text',
                name: 'Connection SSL Keystore Password',
                value: '',
            },
            'rabbitmq.connection.ssl.truststore.location': {
                type: 'text',
                name: 'Connection SSL Truststore Location',
                value: '',
            },
            'rabbitmq.connection.ssl.truststore.type': {
                type: 'text',
                name: 'Connection SSL Truststore Type',
                value: '',
            },
            'rabbitmq.connection.ssl.truststore.password': {
                type: 'text',
                name: 'Connection SSL Truststore Password',
                value: '',
            },
            'rabbitmq.connection.ssl.version': {
                type: 'text',
                name: 'Connection SSL Version',
                value: '',
            },
            'rabbitmq.message.content.type': {
                type: 'text',
                name: 'Message Content Type',
                value: '',
            },
            'rabbitmq.connection.retry.count': {
                type: 'text',
                name: 'Connection Retry Count',
                value: '',
            },
            'rabbitmq.connection.retry.interval': {
                type: 'text',
                name: 'Connection Retry Interval',
                value: '',
            },
            'rabbitmq.server.retry.interval': {
                type: 'text',
                name: 'Server Retry Interval',
                value: '',
            },
            'rabbitmq.queue.autodeclare': {
                type: 'checkbox',
                name: 'Queue Auto Declare',
                value: false,
            },
            'rabbitmq.exchange.autodeclare': {
                type: 'checkbox',
                name: 'Exchange Auto Declare',
                value: false,
            },
            'rabbitmq.message.max.dead.lettered.count': {
                type: 'text',
                name: 'Message Max Dead Lettered Count',
                value: '',
            },
            'rabbitmq.message.requeue.delay': {
                type: 'text',
                name: 'Message Requeue Delay',
                value: '',
            },
            'rabbitmq.consumer.tag': {
                type: 'text',
                name: 'Consumer Tag',
                value: '',
            },
            'rabbitmq.channel.consumer.qos': {
                type: 'text',
                name: 'Consumer Qos Key',
                value: '',
            },
            'rabbitmq.channel.consumer.qos.type': {
                type: 'dropdown',
                name: 'Consumer Qos Type',
                value: 'inline',
                items: [
                    {
                        content: "Inline",
                        value: "inline",
                    },
                    {
                        content: "Registry Reference",
                        value: "registry",
                    },
                ]
            },
            'rabbitmq.message.error.queue.routing.key': {
                type: 'text',
                name: 'Message Error Queue Routing Key',
                value: '',
            },
            'rabbitmq.message.error.exchange.name': {
                type: 'text',
                name: 'Message Error Exchange Name',
                value: '',
            },
        }
    },
    wso2_mb: {
        interval: {
            type: 'text',
            value: 1000,
        },
        sequential: {
            type: 'checkbox',
            value: true,
        },
        coordination: {
            type: 'checkbox',
            value: true,
        },
        'java.naming.factory.initial': {
            type: 'text',
            value: 'org.wso2.andes.jndi.PropertiesFileInitialContextFactory',
        },
        // credentials ???
        // principal ???
        'transport.jms.ConnectionFactoryJNDIName': {
            type: 'text',
            name: 'Connection Factory JNDI Name',
            value: '',
        },
        'mb.connection.url': {
            type: 'text',
            name: 'WSO2 MB Connection URL',
            value: `amqp://admin:admin@clientID/carbon?brokerlist='tcp://localhost:5673'`,
        },
        'transport.jms.ConnectionFactoryType': {
            type: 'dropdown',
            name: 'Connection Factory Type',
            value: 'topic',
            items: [
                {
                    content: "topic",
                    value: "topic",
                },
                {
                    content: "queue",
                    value: "queue",
                },
            ],
        },
        'transport.jms.Destination': {
            type: 'text',
            value: '',
        },
        'transport.jms.SessionTransacted': {
            type: 'checkbox',
            name: 'Session Transacted',
            value: false,
        },
        'transport.jms.SessionAcknowledgement': {
            type: 'dropdown',
            name: 'Session Acknowledgement',
            value: 'AUTO_ACKNOWLEDGE',
            items: [
                {
                    content: "AUTO_ACKNOWLEDGE",
                    value: "AUTO_ACKNOWLEDGE",
                },
                {
                    content: "CLIENT_ACKNOWLEDGE",
                    value: "CLIENT_ACKNOWLEDGE",
                },
                {
                    content: "DUPS_OK_ACKNOWLEDGE",
                    value: "DUPS_OK_ACKNOWLEDGE",
                },
                {
                    content: "SESSION_TRANSACTED",
                    value: "SESSION_TRANSACTED",
                }
            ],
        },
        'transport.jms.CacheLevel': {
            type: 'text',
            name: 'Cache Level',
            value: 3,
        },
        advance: {
            'transport.jms.SharedSubscription': {
                type: 'checkbox',
                name: 'Shared Subscription',
                value: false,
            },
            'transport.jms.SubscriptionName': {
                type: 'text',
                name: 'Subscription Name',
                value: '',
            },
            'pinnedServers': {
                type: 'text',
                value: '',
            },
            'concurrent.consumers': {
                type: 'text',
                value: '',
            },
            'transport.jms.JMSSpecVersion': {
                type: 'text',
                name: 'JMS Spec Version',
                value: '',
            },
            'transport.jms.SubscriptionDurable': {
                type: 'text',
                name: 'Subscription Durable',
                value: '',
            },
            'transport.jms.DurableSubscriberClientID': {
                type: 'text',
                name: 'Durable Subscriber Client ID',
                value: '',
            },
            'transport.jms.MessageSelector': {
                type: 'text',
                name: 'Message Selector',
                value: '',
            },
            'transport.jms.retry.duration': {
                type: 'text',
                value: '',
            },
            'transport.jms.ReceiveTimeout': {
                type: 'text',
                value: '',
            },
            'transport.jms.ContentType': {
                type: 'text',
                value: '',
            },
            'transport.jms.ContentTypeProperty': {
                type: 'text',
                name: 'Content Type Property',
                value: '',
            },
            'transport.jms.ReplyDestination': {
                type: 'text',
                name: 'Reply Destination',
                value: '',
            },
            'transport.jms.PubSubNoLocal': {
                type: 'text',
                value: '',
            },
            'transport.jms.DurableSubscriberName': {
                type: 'text',
                name: 'Durable Subscriber Name',
                value: '',
            }
        }
    }
};
