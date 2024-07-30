/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

export interface Paramater {
    name?: string;
    type: 'text' | 'checkbox' | 'dropdown' | 'radio';
    value?: string | number | boolean;
    items?: { content?: string; value: string }[];
    validate?: {
        type: string;
        required?: boolean;
        min?: number;
        max?: number;
    };
    description?: string;
}

interface ParamPool {
    [key: string]: {
        [key: string]: {
            [key: string]: Paramater;
        };
    };
}

export const defaultParameters: { [key: string]: { [key: string]: string | number | boolean; } } = {
    custom: {
        interval: 1000,
        class: 'org.wso2.carbon.inbound.kafka.KafkaMessageConsumer',
        sequential: true,
        coordination: true,
        'inbound.behavior': 'polling',
    },
    wss: {
        'ws.client.side.broadcast.level': "0",
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
        'transport.jms.CacheLevel': "3",
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
        'bootstrap.servers': 'localhost:9092',
        'key.deserializer': 'org.apache.kafka.common.serialization.StringDeserializer',
        'value.deserializer': 'org.apache.kafka.common.serialization.StringDeserializer',
        'poll.timeout': 100,
        'topics': 'topics',
        'topic.name': 'sampleTopic',
        'content.type': 'application/json',
    },
    mqtt: {
        sequential: true,
        'mqtt.connection.factory': 'AMQPConnectionFactory',
        'mqtt.subscription.qos': "0",
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
        'transport.jms.CacheLevel': "3",
        "rabbitmq.exchange.autodeclare": true,
        "rabbitmq.queue.autodeclare": true
    },
    ws: {
        'ws.client.side.broadcast.level': "0",
        'ws.use.port.offset': false,
    },
    wso2_mb: {
        interval: 1000,
        sequential: true,
        coordination: true,
        'transport.jms.CacheLevel': "3",
        'java.naming.factory.initial':
            'org.wso2.andes.jndi.PropertiesFileInitialContextFactory',
        'mb.connection.url': `amqp://admin:admin@clientID/carbon?brokerlist='tcp://localhost:5673'`,
        'transport.jms.SessionAcknowledgement': 'AUTO_ACKNOWLEDGE',
        'transport.jms.SessionTransacted': false,
        'transport.jms.ConnectionFactoryType': 'topic',
        'connectionfactory.TopicConnectionFactory':
            "amqp://admin:admin@clientID/carbon?brokerlist='tcp://localhost:5673'",
        'transport.jms.SharedSubscription': false,
    },
};

export const inboundEndpointParams: ParamPool = {
    custom: {
        basic: {
            class: {
                type: 'text',
                value: 'org.wso2.carbon.inbound.kafka.KafkaMessageConsumer',
                validate: {
                    type: 'string',
                    required: true,
                }
            },
            'inbound.behavior': {
                name: 'Behavior',
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
                description: 'Select the behavior of the inbound endpoint',
            },
            interval: {
                type: 'text',
                value: 1000,
                validate: {
                    type: 'number',
                    required: true,
                    min: 0,
                },
                description: 'Polling interval in milliseconds',
            },
            sequential: {
                type: 'checkbox',
                value: true,
                description: 'Enable sequential processing',
            },
            coordination: {
                type: 'checkbox',
                value: true,
            },
        }
    },
    http: {
        basic: {
            'inbound.http.port': {
                name: 'Port',
                type: 'text',
                value: 8000,
                validate: {
                    type: 'number',
                    required: true,
                },
                description: 'The port on which the endpoint listener should be started.'
            },
        },
        advanced: {
            'inbound.worker.pool.size.core': {
                name: 'Worker Pool Size - Core',
                type: 'text',
                value: 400,
                validate: {
                    type: 'number',
                }
            },
            'inbound.worker.pool.size.max': {
                name: 'Worker Pool Size - Max',
                type: 'text',
                value: 500,
                validate: {
                    type: 'number',
                }
            },
            'inbound.worker.thread.keep.alive.sec': {
                name: 'Thread Keep Alive Time (sec)',
                type: 'text',
                value: 60,
                validate: {
                    type: 'number',
                }
            },
            'inbound.worker.pool.queue.length': {
                name: 'Worker Pool Queue Length',
                type: 'text',
                value: -1,
                validate: {
                    type: 'number',
                }
            },
            'inbound.thread.group.id': {
                name: 'Thread Group ID',
                type: 'text',
                value: '',
            },
            'inbound.thread.id': {
                name: 'Thread ID',
                type: 'text',
                value: 'PassThroughInboundWorkerPool',
                validate: {
                    type: 'string',
                }
            },
            'dispatch.filter.pattern': {
                name: 'Filter Pattern',
                type: 'text',
                value: '',
            },
        }
    },
    cxf_ws_rm: {
        basic: {
            'inbound.cxf.rm.host': {
                name: 'Host',
                type: 'text',
                value: '',
            },
            'inbound.cxf.rm.port': {
                name: 'Port',
                type: 'text',
            },
        },
        advanced: {
            'inbound.cxf.rm.config-file': {
                name: 'Config File',
                type: 'text',
                value: '',
            },
            enableSSL: {
                name: 'Enable SSL',
                type: 'checkbox',
                value: false,
            },
        }
    },
    feed: {
        basic: {
            interval: {
                name: 'Interval',
                type: 'text',
                value: 1000,
                validate: {
                    type: 'number',
                    required: true,
                }
            },
            'feed.url': {
                name: 'URL',
                type: 'text',
                value: '',
            },
            'feed.type': {
                name: 'Type',
                type: 'radio',
                items: [
                    { content: 'RSS', value: "RSS" },
                    { content: 'Atom', value: "Atom" },
                ],
            },
        }
    },
    hl7: {
        basic: {
            'inbound.hl7.Port': {
                name: 'Port',
                type: 'text',
                value: '',
            },
            'inbound.hl7.AutoAck': {
                name: 'Auto Ack',
                type: 'checkbox',
                value: true,
            },
        },
        advanced: {
            'inbound.hl7.MessagePreProcessor': {
                name: 'Message Pre-processor',
                type: 'text',
                value: '',
            },
            'inbound.hl7.CharSet': {
                name: 'CharSet',
                type: 'text',
                value: 'UTF-8',
                validate: {
                    type: 'string',
                }
            },
            'inbound.hl7.TimeOut': {
                name: 'Timeout',
                type: 'text',
                value: 10000,
                validate: {
                    type: 'number',
                }
            },
            'inbound.hl7.ValidateMessage': {
                name: 'Validate Message',
                type: 'checkbox',
                value: true,
            },
            'inbound.hl7.BuildInvalidMessages': {
                name: 'Build Invalid Messages',
                type: 'checkbox',
                value: true,
            },
            'inbound.hl7.PassThroughInvalidMessages': {
                name: 'Passthrough Invalid Messages',
                type: 'checkbox',
                value: true,
            },
        }
    },
    jms: {
        basic: {
            interval: {
                name: 'Polling Interval',
                type: 'text',
                value: 1000,
                validate: {
                    type: 'number',
                    required: true,
                }
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
                validate: {
                    type: 'string',
                    required: true,
                }
            },
            'java.naming.provider.url': {
                type: 'text',
                validate: {
                    type: 'string',
                    required: true,
                }
            },
            'transport.jms.ConnectionFactoryJNDIName': {
                name: 'Connection Factory JNDI Name',
                type: 'text',
                validate: {
                    type: 'string',
                    required: true,
                }
            },
        },
        connection: {
            'transport.jms.ConnectionFactoryType': {
                name: 'Connection Factory Type',
                type: 'radio',
                value: 'queue',
                items: [
                    { content: "queue", value: "queue" },
                    { content: "topic", value: "topic" },
                ],
            },
            'transport.jms.Destination': {
                name: 'Destination Name',
                type: 'text',
                value: '',
            },
            'transport.jms.ReplyDestination': {
                name: 'Reply Destination',
                type: 'text',
                value: '',
            },
        },
        session: {
            'transport.jms.SessionTransacted': {
                name: 'Session Transacted',
                type: 'checkbox',
                value: false,
            },
            'transport.jms.SessionAcknowledgement': {
                name: 'Session Ack',
                type: 'dropdown',
                value: 'AUTO_ACKNOWLEDGE',
                items: [
                    { value: "AUTO_ACKNOWLEDGE" },
                    { value: "CLIENT_ACKNOWLEDGE" },
                    { value: "DUPS_OK_ACKNOWLEDGE" },
                    { value: "SESSION_TRANSACTED" }
                ],
            },
        },
        security: {
            'java.naming.security.credentials': {
                type: 'text',
                value: '',
            },
            'java.naming.security.principal': {
                type: 'text',
                value: '',
            },
            'transport.jms.UserName': {
                name: 'User Name',
                type: 'text',
                value: '',
            },
            'transport.jms.Password': {
                name: 'Password',
                type: 'text',
                value: '',
            },
        },
        message: {
            'transport.jms.CacheLevel': {
                name: 'Cache Level',
                type: 'text',
                value: 3,
                validate: {
                    type: 'number',
                }
            },
            'transport.jms.ContentType': {
                name: 'Content Type',
                type: 'text',
                value: '',
            },
            'transport.jms.JMSSpecVersion': {
                name: 'JMS Spec Version',
                type: 'text',
                value: '',
            },
            'transport.jms.ContentTypeProperty': {
                name: 'Content Type Property',
                type: 'text',
                value: '',
            },
        },
        subscription: {
            'transport.jms.SubscriptionDurable': {
                name: 'Subscription Durable',
                type: 'text',
                value: '',
            },
            'transport.jms.DurableSubscriberClientID': {
                name: 'Durable Subscriber Client ID',
                type: 'text',
                value: '',
            },
            'transport.jms.DurableSubscriberName': {
                name: 'Durable Subscriber Name',
                type: 'text',
                value: '',
            },
            'transport.jms.SharedSubscription': {
                name: 'Shared Subscription',
                type: 'checkbox',
                value: false,
            },
        },
        resilience: {
            'concurrent.consumers': {
                type: 'text',
                value: '',
            },
            'transport.jms.retry.duration': {
                name: 'Retry Duration',
                type: 'text',
                value: '',
                validate: {
                    type: 'number',
                    min: 0,
                }
            },
            'transport.jms.ResetConnectionOnPollingSuspension': {
                name: 'Reset Connection On Polling Suspension',
                type: 'checkbox',
                value: false,
            },
            'transport.jms.RetriesBeforeSuspension': {
                name: 'Retries Before Suspension',
                type: 'text',
                value: '',
            },
            'transport.jms.PollingSuspensionPeriod': {
                name: 'Polling Suspension Period',
                type: 'text',
                value: '',
            },
            'transport.jms.ReceiveTimeout': {
                name: 'Receive Timeout',
                type: 'text',
                value: '',
            },
        },
        other: {
            'transport.jms.MessageSelector': {
                name: 'Message Selector',
                type: 'text',
                value: '',
            },
            'transport.jms.PubSubNoLocal': {
                name: 'PubSub No Local',
                type: 'text',
                value: '',
            },
            'pinnedServers': {
                name: 'Pinned Servers',
                type: 'text',
                value: '',
            },
            'db_url': {
                name: 'DB URL',
                type: 'text',
                value: '',
            },
            'transport.jms.MessagePropertyHyphens': {
                name: 'Message Property Hyphens',
                type: 'text',
                value: '',
            },
        }
    },
    file: {
        basic: {
            'transport.vfs.FileURI': {
                name: 'File URI',
                type: 'text',
                value: '',
            },
            interval: {
                name: 'Polling Interval',
                type: 'text',
                value: 1000,
                validate: {
                    type: 'number',
                    required: true,
                }
            },
            sequential: {
                type: 'checkbox',
                value: true,
            },
            coordination: {
                type: 'checkbox',
                value: true,
            },
            'transport.vfs.ContentType': {
                name: 'Content-Type',
                type: 'text',
                value: 'text/plain',
                validate: {
                    type: 'string',
                }
            },
            'transport.vfs.FileNamePattern': {
                name: 'File Name Pattern',
                type: 'text',
                value: '.*.txt',
                validate: {
                    type: 'string',
                }
            },
            'transport.vfs.FileProcessInterval': {
                name: 'Processing Interval',
                type: 'text',
                value: '',
                validate: {
                    type: 'number',
                    min: 0,
                }
            },
            'transport.vfs.ReplyFileURI': {
                name: 'Reply File URI',
                type: 'text',
                value: '',
            },
            'transport.vfs.ReplyFileName': {
                name: 'Reply File Name',
                type: 'text',
                value: 'response.xml',
                validate: {
                    type: 'string',
                }
            },
        },
        actions: {
            'transport.vfs.ActionAfterProcess': {
                name: 'Action After Process',
                type: 'dropdown',
                value: 'DELETE',
                items: [
                    { value: "DELETE", },
                    { value: "MOVE", },
                    { value: "NONE", },
                ],
            },
            'transport.vfs.MoveAfterProcess': {
                name: 'Move After Process',
                type: 'text',
                value: '',
            },
            'transport.vfs.MoveAfterFailure': {
                name: 'Move After Failure',
                type: 'text',
                value: '',
            },
            'transport.vfs.MoveTimestampFormat': {
                name: 'Move Timestamp Format',
                type: 'text',
                value: '',
            },
            'transport.vfs.ActionAfterFailure': {
                name: 'Action After Failure',
                type: 'dropdown',
                value: 'DELETE',
                items: [
                    { value: "DELETE", },
                    { value: "MOVE", },
                    { value: "NONE", },
                ],
            },
            'transport.vfs.MoveAfterFailedMove': {
                name: 'Move After Failed Move',
                type: 'text',
                value: '',
            },
        },
        resilience: {
            'transport.vfs.MaxRetryCount': {
                name: 'Max Retry Count',
                type: 'text',
                value: '',
                validate: {
                    type: 'number',
                    min: 0,
                }
            },
            'transport.vfs.ReconnectTimeout': {
                name: 'Reconnect Timeout',
                type: 'text',
                value: '',
            },
            'transport.vfs.LockReleaseSameNode': {
                name: 'Lock Release Same Node',
                type: 'checkbox',
                value: false,
            },
            'transport.vfs.FailedRecordsFileName': {
                name: 'Failed Records File Name',
                type: 'text',
                value: 'vfs-move-failed-records.properties',
                validate: {
                    type: 'string',
                }
            },
            'transport.vfs.FailedRecordsFileDestination': {
                name: 'Failed Records File Destination',
                type: 'text',
                value: 'repository/conf/',
                validate: {
                    type: 'string',
                }
            },
            'transport.vfs.MoveFailedRecordTimestampFormat': {
                name: 'Move Failed Record Timestamp Format',
                type: 'text',
                value: 'dd-MM-yyyy HH:mm:ss',
                validate: {
                    type: 'string',
                }
            },
            'transport.vfs.FailedRecordNextRetryDuration': {
                name: 'Failed Record Next Retry Duration',
                type: 'text',
                value: 3000,
                validate: {
                    type: 'number',
                }
            },
            'transport.vfs.AutoLockRelease': {
                type: 'checkbox',
                name: 'Auto Lock Release',
                value: false,
            },
        },
        other: {
            'transport.vfs.DistributedTimeout': {
                name: 'Distributed Timeout',
                type: 'text',
                value: '',
            },
            'transport.vfs.SFTPIdentities': {
                name: 'SFTP Identities',
                type: 'text',
                value: '',
            },
            'transport.vfs.SFTPIdentityPassPhrase': {
                name: 'SFTP Identity Pass Phrase',
                type: 'text',
                value: '',
            },
            'transport.vfs.SFTPUserDirIsRoot': {
                name: 'SFTP User Dirls Root',
                type: 'checkbox',
                value: false,
            },
            'transport.vfs.FileSortAttribute': {
                name: 'File Sort Attribute',
                type: 'dropdown',
                items: [
                    { content: "None", value: "NONE", },
                    { content: "Size", value: "Size", },
                    { content: "Last modified timestamp", value: "Lastmodifiedtimestamp", },
                ],
            },
            'transport.vfs.FileSortAscending': {
                name: 'File Sort Ascending',
                type: 'checkbox',
                value: true,
            },
            'transport.vfs.SubFolderTimestampFormat': {
                name: 'Sub Folder Timestamp Format',
                type: 'text',
                value: '',
            },
            'transport.vfs.CreateFolder': {
                name: 'Create Folder',
                type: 'checkbox',
                value: true,
            },
            'transport.vfs.FileProcessCount': {
                name: 'File Process Count',
                type: 'text',
                value: '',
                validate: {
                    type: 'number',
                }
            },
            'transport.vfs.Streaming': {
                name: 'Streaming',
                type: 'checkbox',
                value: false,
            },
            'transport.vfs.Build': {
                name: 'Build',
                type: 'checkbox',
                value: false,
            },
            'transport.vfs.UpdateLastModified': {
                name: 'Update Last Modified',
                type: 'checkbox',
                value: true,
            },
            'transport.vfs.DistributedLock': {
                type: 'checkbox',
                name: 'Distributed Lock',
                value: false,
            },
            'transport.vfs.Locking': {
                type: 'radio',
                name: 'Locking',
                value: 'enable',
                items: [
                    { content: "enable", value: "enable", },
                    { content: "disable", value: "disable", },
                ],
            },
        }
    },
    ws: {
        basic: {
            'inbound.ws.port': {
                name: 'Port',
                type: 'text',
                validate: {
                    type: 'number',
                    required: true,
                }
            },
            'ws.outflow.dispatch.sequence': {
                name: 'Outflow Sequence',
                type: 'text',
                validate: {
                    type: 'string',
                    required: true,
                }
            },
            'ws.outflow.dispatch.fault.sequence': {
                name: 'Outflow Fault Sequence',
                type: 'text',
                validate: {
                    type: 'string',
                    required: true,
                }
            },
            'ws.client.side.broadcast.level': {
                name: 'Client Side Broadcast Level',
                type: 'radio',
                value: '0',
                items: [
                    { content: "0", value: '0', },
                    { content: "1", value: '1', },
                    { content: "2", value: '2', },
                ],
            },
        },
        advanced: {
            'ws.boss.thread.pool.size': {
                name: 'Boss Thread Pool Size',
                type: 'text',
                value: '',
            },
            'ws.worker.thread.pool.size': {
                name: 'Worker Thread Pool Size',
                type: 'text',
                value: '',
            },
        },
        other: {
            'ws.default.content.type': {
                name: 'Default Content-Type',
                type: 'text',
                value: '',
            },
            'ws.shutdown.status.code': {
                name: 'Shutdown Status Code',
                type: 'text',
                value: '',
            },
            'ws.shutdown.status.message': {
                name: 'Shutdown Status Message',
                type: 'text',
                value: '',
            },
            'ws.use.port.offset': {
                name: 'Use Port Offset',
                type: 'checkbox',
                value: false,
            },
            'ws.subprotocol.handler.class': {
                name: 'Subprotocol Handler Class',
                type: 'text',
                value: '',
            },
            'ws.pipeline.handler.class': {
                name: 'Pipeline Handler Class',
                type: 'text',
                value: '',
            },
        }
    },
    https: {
        basic: {
            'inbound.http.port': {
                name: 'Port',
                type: 'text',
                value: 8000,
                validate: {
                    type: 'number',
                    required: true,
                }
            },
            'HttpsProtocols': {
                name: 'Https Protocols',
                type: 'text',
                value: '',
            },
        },
        security: {
            'keystore': {
                type: 'text',
                value: '',
            },
            'truststore': {
                type: 'text',
                value: '',
            },
            'SSLVerifyClient': {
                name: 'SSL Verify Client',
                type: 'text',
                value: '',
            },
            'SSLProtocol': {
                name: 'SSL Protocol',
                type: 'text',
                value: '',
            },
            'CertificateRevocationVerifier': {
                name: 'Certificate Revocation Verifier',
                type: 'text',
                value: '',
            },
        },
        advanced: {
            'inbound.worker.pool.size.core': {
                name: 'Worker Pool Size - Core',
                type: 'text',
                value: 400,
                validate: {
                    type: 'number',
                }
            },
            'inbound.worker.pool.size.max': {
                name: 'Worker Pool Size - Max',
                type: 'text',
                value: 500,
                validate: {
                    type: 'number',
                }
            },
            'inbound.worker.thread.keep.alive.sec': {
                name: 'Thread Keep Alive Time (sec)',
                type: 'text',
                value: 60,
                validate: {
                    type: 'number',
                }
            },
            'inbound.worker.pool.queue.length': {
                name: 'Worker Pool Queue Length',
                type: 'text',
                value: -1,
                validate: {
                    type: 'number',
                }
            },
            'inbound.thread.group.id': {
                name: 'Thread Group ID',
                type: 'text',
                value: '',
            },
            'inbound.thread.id': {
                name: 'Thread ID',
                type: 'text',
                value: 'PassThroughInboundWorkerPool',
                validate: {
                    type: 'string',
                }
            },
            'dispatch.filter.pattern': {
                name: 'Filter Pattern',
                type: 'text',
                value: '',
            },
        }
    },
    wss: {
        basic: {
            'inbound.ws.port': {
                name: 'Port',
                type: 'text',
                validate: {
                    type: 'number',
                    required: true,
                }
            },
            'ws.outflow.dispatch.sequence': {
                name: 'Outflow Sequence',
                type: 'text',
                validate: {
                    type: 'string',
                    required: true,
                }
            },
            'ws.outflow.dispatch.fault.sequence': {
                name: 'Outflow Fault Sequence',
                type: 'text',
                validate: {
                    type: 'string',
                    required: true,
                }
            },
            'ws.client.side.broadcast.level': {
                name: 'Client Side Broadcast Level',
                type: 'radio',
                value: '0',
                items: [
                    { content: "0", value: '0', },
                    { content: "1", value: '1', },
                    { content: "2", value: '2', },
                ],
            },
            'wss.ssl.key.store.file': {
                name: 'Key Store Location',
                type: 'text',
                validate: {
                    type: 'string',
                    required: true,
                }
            },
            'wss.ssl.key.store.pass': {
                name: 'Key Store Password',
                type: 'text',
                validate: {
                    type: 'string',
                    required: true,
                }
            },
            'wss.ssl.trust.store.file': {
                name: 'Trust Store Location',
                type: 'text',
                validate: {
                    type: 'string',
                    required: true,
                }
            },
            'wss.ssl.trust.store.pass': {
                name: 'Trust Store Password',
                type: 'text',
                validate: {
                    type: 'string',
                    required: true,
                }
            },
            'wss.ssl.cert.pass': {
                name: 'Certificate Password',
                type: 'text',
                validate: {
                    type: 'string',
                    required: true,
                }
            },
        },
        'SSL': {
            'wss.ssl.protocols': {
                name: 'SSL Protocols',
                type: 'text',
                value: '',
            },
            'wss.ssl.cipher.suites': {
                name: 'Cipher Suites',
                type: 'text',
                value: '',
            },
        },
        advanced: {
            'ws.boss.thread.pool.size': {
                name: 'Boss Thread Pool Size',
                type: 'text',
                value: '',
            },
            'ws.worker.thread.pool.size': {
                name: 'Worker Thread Pool Size',
                type: 'text',
                value: '',
            },
        },
        other: {
            'ws.default.content.type': {
                name: 'Default Content-Type',
                type: 'text',
                value: '',
            },
            'ws.shutdown.status.code': {
                name: 'Shutdown Status Code',
                type: 'text',
                value: '',
            },
            'ws.shutdown.status.message': {
                name: 'Shutdown Status Message',
                type: 'text',
                value: '',
            },
            'ws.use.port.offset': {
                name: 'Use Port Offset',
                type: 'checkbox',
                value: false,
            },
            'ws.subprotocol.handler.class': {
                name: 'Subprotocol Handler Class',
                type: 'text',
                value: '',
            },
        }
    },
    kafka: {
        basic: {
            interval: {
                name: 'Polling Interval',
                type: 'text',
                value: 1000,
                validate: {
                    type: 'number',
                    required: true,
                }
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
                name: 'Zookeeper Host:Port',
                type: 'text',
                value: 'localhost:2181',
                validate: {
                    type: 'string',
                    required: true,
                }
            },
            'group.id': {
                name: 'Group ID',
                type: 'text',
                validate: {
                    type: 'string',
                    required: true,
                }
            },
            'content.type': {
                type: 'text',
                validate: {
                    type: 'string',
                    required: true,
                }
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
                name: 'Topics or Topic Filter',
                type: 'radio',
                value: 'topics',
                items: [
                    { content: "topics", value: "topics" },
                    { content: "topic.filter", value: "topic.filter" },
                ],
            },
            'topic.name': {
                name: 'Topic Name',
                type: 'text',
                validate: {
                    type: 'string',
                    required: true,
                }
            },
        },
        connection: {
            'client.id': {
                type: 'text',
                value: '',
            },
            'socket.timeout.ms': {
                name: 'Socket Timeout (ms)',
                type: 'text',
                value: 30000,
                validate: {
                    type: 'number',
                }
            },
        },
        'advanced.connection': {
            'zookeeper.session.timeout.ms': {
                name: 'Zookeeper Session Timeout (ms)',
                type: 'text',
                value: 6000,
                validate: {
                    type: 'number',
                }
            },
            'zookeeper.connection.timeout.ms': {
                name: 'Zookeeper Connection Timeout (ms)',
                type: 'text',
                value: 6000,
                validate: {
                    type: 'number',
                }
            },
            'zookeeper.sync.time.ms': {
                name: 'Zookeeper Sync Timeout (ms)',
                type: 'text',
                value: 2000,
                validate: {
                    type: 'number',
                }
            },
            'socket.receive.buffer.bytes': {
                type: 'text',
                value: 65536,
                validate: {
                    type: 'number',
                }
            },
            'fetch.message.max.bytes': {
                name: 'Fetch Max Bytes',
                type: 'text',
                value: 1048576,
                validate: {
                    type: 'number',
                }
            },
        },
        message: {
            'auto.commit.enable': {
                name: 'Auto Commit Enabled',
                type: 'checkbox',
                value: false,
            },
            'auto.commit.interval.ms': {
                name: 'Auto Commit Interval (ms)',
                type: 'text',
                value: 60000,
                validate: {
                    type: 'number',
                }
            },
        },
        consumer: {
            'consumer.id': {
                name: 'Consumer ID',
                type: 'text',
                value: '',
            },
            'num.consumer.fetchers': {
                name: 'Number of Consumer Fetchers',
                type: 'text',
                value: 1,
                validate: {
                    type: 'number',
                }
            },
            'consumer.timeout.ms': {
                name: 'Consumer Timeout (ms)',
                type: 'text',
                value: 3000,
                validate: {
                    type: 'number',
                }
            },
        },
        advanced: {
            'bootstrap.servers': {
                type: 'text',
            },
            'key.deserializer': {
                type: 'text',
            },
            'value.deserializer': {
                type: 'text',
            },
            'poll.timeout': {
                type: 'text',
                validate: {
                    type: 'number',
                }
            },
            'thread.count': {
                type: 'text',
                value: 1,
                validate: {
                    type: 'number',
                }
            },
            'offsets.storage': {
                type: 'dropdown',
                value: 'zookeeper',
                items: [
                    { value: "zookeeper" },
                    { value: "kafka" },
                ],
            },
            'offsets.channel.backoff.ms': {
                name: 'Offsets Channel Backoff (ms)',
                type: 'text',
                value: 1000,
                validate: {
                    type: 'number',
                }
            },
            'offsets.channel.socket.timeout.ms': {
                name: 'Offsets Channel Socket Timeout (ms)',
                type: 'text',
                value: 10000,
                validate: {
                    type: 'number',
                }
            },
            'offsets.commit.max.retries': {
                type: 'text',
                value: 5,
                validate: {
                    type: 'number',
                }
            },
            'dual.commit.enabled': {
                type: 'checkbox',
                value: true,
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
            'queued.max.message.chunks': {
                type: 'text',
                value: 2,
                validate: {
                    type: 'number',
                }
            },
            'rebalance.max.retries': {
                type: 'text',
                value: 4,
                validate: {
                    type: 'number',
                }
            },
            'fetch.min.bytes': {
                type: 'text',
                value: 1,
                validate: {
                    type: 'number',
                }
            },
            'fetch.wait.max.ms': {
                name: 'Fetch Wait Max Duration (ms)',
                type: 'text',
                value: 100,
                validate: {
                    type: 'number',
                }
            },
            'rebalance.backoff.ms': {
                name: 'Rebalance Backoff Time (ms)',
                type: 'text',
                value: 2000,
                validate: {
                    type: 'number',
                }
            },
            'refresh.leader.backoff.ms': {
                name: 'Refresh Leader Backoff Duration (ms)',
                type: 'text',
                value: 200,
                validate: {
                    type: 'number',
                }
            },
            'auto.offset.reset': {
                type: 'radio',
                value: 'largest',
                items: [
                    { content: "largest", value: "largest" },
                    { content: "smallest", value: "smallest" },
                ],
            },
        }
    },
    mqtt: {
        basic: {
            sequential: {
                type: 'checkbox',
                value: true,
            },
            coordination: {
                type: 'checkbox',
                value: true,
            },
            'mqtt.connection.factory': {
                name: 'Connection Factory',
                type: 'text',
                value: 'AMQPConnectionFactory',
                validate: {
                    type: 'string',
                    required: true,
                }
            },
            'mqtt.server.host.name': {
                name: 'Server Host',
                type: 'text',
                value: '',
                validate: {
                    type: 'string',
                    required: true,
                }
            },
            'mqtt.server.port': {
                name: 'Server Port',
                type: 'text',
                value: '',
                validate: {
                    type: 'number',
                    required: true,
                }
            },
            'mqtt.topic.name': {
                name: 'Topic',
                type: 'text',
                value: '',
                validate: {
                    type: 'string',
                    required: true,
                }
            },
            'content.type': {
                type: 'text',
                validate: {
                    type: 'string',
                    required: true,
                }
            },
        },
        connection: {
            'mqtt.reconnection.interval': {
                name: 'Reconnection Interval',
                type: 'text',
                value: 1000,
                validate: {
                    type: 'number',
                }
            },
        },
        // ?? key-store ?
        subscription: {
            'mqtt.subscription.username': {
                name: 'Username',
                type: 'text',
                value: '',
            },
            'mqtt.subscription.password': {
                name: 'Password',
                type: 'text',
                value: '',
            },
            'mqtt.client.id': {
                name: 'Client ID',
                type: 'text',
                value: '',
            },
            'mqtt.subscription.qos': {
                type: 'radio',
                name: 'QOS Level',
                value: '0',
                items: [
                    { content: "0", value: '0', },
                    { content: "1", value: '1', },
                    { content: "2", value: '2', },
                ]
            },
            'mqtt.session.clean': {
                name: 'Session Clean',
                type: 'checkbox',
                value: false,
            },
        },
        // Trust store ???
        'SSL': {
            'mqtt.ssl.enable': {
                name: 'Enable',
                type: 'text',
                value: '',
            },
            'mqtt.ssl.keystore.location': {
                name: 'Keystore Location',
                type: 'text',
                value: '',
            },
            'mqtt.ssl.keystore.type': {
                name: 'Keystore Type',
                type: 'text',
                value: '',
            },
            'mqtt.ssl.keystore.password': {
                name: 'Keystore Password',
                type: 'text',
                value: '',
            },
            'mqtt.ssl.truststore.location': {
                name: 'Truststore Location',
                type: 'text',
                value: '',
            },
            'mqtt.ssl.truststore.type': {
                name: 'Truststore Type',
                type: 'text',
                value: '',
            },
            'mqtt.ssl.truststore.password': {
                name: 'Truststore Password',
                type: 'text',
                value: '',
            },
            'mqtt.ssl.version': {
                name: 'SSL Version',
                type: 'text',
                value: '',
            },
        },
        other: {
            'mqtt.temporary.store.directory': {
                name: 'Temporary Store Directory',
                type: 'text',
                value: '',
            },
        }
    },
    rabbitmq: {
        basic: {
            sequential: {
                type: 'checkbox',
                value: true,
            },
            coordination: {
                type: 'checkbox',
                value: true,
            },
            'rabbitmq.connection.factory': {
                name: 'Connection Factory',
                type: 'text',
                value: 'connection_factory',
                validate: {
                    type: 'string',
                    required: true,
                }
            },
            'rabbitmq.server.host.name': {
                name: 'Server Host',
                type: 'text',
                value: 'localhost',
                validate: {
                    type: 'string',
                    required: true,
                }
            },
            'rabbitmq.server.port': {
                name: 'Server Port',
                type: 'text',
                value: 5672,
                validate: {
                    type: 'number',
                    required: true,
                }
            },
            'rabbitmq.server.user.name': {
                name: 'Server User Name',
                type: 'text',
                value: 'guest',
                validate: {
                    type: 'string',
                    required: true,
                }
            },
            'rabbitmq.server.password': {
                name: 'Server Password',
                type: 'text',
                value: 'guest',
                validate: {
                    type: 'string',
                    required: true,
                }
            },
            'rabbitmq.queue.name': {
                name: 'Queue Name',
                type: 'text',
                value: 'queue_name',
                validate: {
                    type: 'string',
                    required: true,
                }
            },
        },
        connection: {
            'rabbitmq.exchange.name': {
                name: 'Exchange Name',
                type: 'text',
                value: 'excahnge_name',
                validate: {
                    type: 'string',
                }
            },
            'rabbitmq.server.virtual.host': {
                name: 'Virtual Host',
                type: 'text',
                value: '',
                validate: {
                    type: 'string',
                }
            },
            'rabbitmq.factory.heartbeat': {
                name: 'Factory Heartbeat',
                type: 'text',
                value: '',
                validate: {
                    type: 'number',
                    min: 0,
                }
            },
            'rabbitmq.factory.connection.timeout': {
                name: 'Connection Timeout',
                type: 'text',
                value: '',
                validate: {
                    type: 'number',
                    min: 0,
                }
            },
        },
        resilience: {
            'rabbitmq.connection.retry.count': {
                name: 'Retry Count',
                type: 'text',
                value: '',
                validate: {
                    type: 'number',
                    min: 0,
                }
            },
            'rabbitmq.connection.retry.interval': {
                name: 'Connection Retry Interval',
                type: 'text',
                value: '',
                validate: {
                    type: 'number',
                    min: 0,
                }
            },
            'rabbitmq.server.retry.interval': {
                name: 'Server Retry Interval',
                type: 'text',
                value: '',
                validate: {
                    type: 'number',
                    min: 0,
                }
            },
            'rabbitmq.connection.factory.network.recovery.interval': {
                name: 'Connection Factory Network Recovery Interval',
                type: 'text',
                value: '',
                validate: {
                    type: 'number',
                    min: 0,
                }
            },
        },
        queue: {
            'rabbitmq.queue.durable': {
                name: 'Durable',
                type: 'text',
                value: '',
            },
            'rabbitmq.queue.exclusive': {
                name: 'Exclusive',
                type: 'text',
                value: '',
            },
            'rabbitmq.queue.auto.delete': {
                name: 'Auto Delete',
                type: 'text',
                value: '',
            },
            'rabbitmq.queue.auto.ack': {
                name: 'Auto Ack',
                type: 'text',
                value: '',
            },
            'rabbitmq.queue.routing.key': {
                name: 'Routing Key',
                type: 'text',
                value: '',
            },
            'rabbitmq.queue.delivery.mode': {
                name: 'Delivery Mode',
                type: 'text',
                value: '',
            },
            'rabbitmq.queue.autodeclare': {
                name: 'Auto Declare',
                type: 'checkbox',
                value: true,
            },
        },
        exchange: {
            'rabbitmq.exchange.type': {
                name: 'Type',
                type: 'text',
                value: '',
            },
            'rabbitmq.exchange.durable': {
                name: 'Durable',
                type: 'text',
                value: '',
            },
            'rabbitmq.exchange.auto.delete': {
                name: 'Auto Delete',
                type: 'text',
                value: '',
            },
            'rabbitmq.exchange.autodeclare': {
                name: 'Auto Declare',
                type: 'checkbox',
                value: true,
            },
        },
        'SSL': {
            'rabbitmq.connection.ssl.enabled': {
                name: 'Enabled',
                type: 'text',
                value: '',
            },
            'rabbitmq.connection.ssl.keystore.location': {
                name: 'Keystore Location',
                type: 'text',
                value: '',
            },
            'rabbitmq.connection.ssl.keystore.type': {
                name: 'Keystore Type',
                type: 'text',
                value: '',
            },
            'rabbitmq.connection.ssl.keystore.password': {
                name: 'Keystore Password',
                type: 'text',
                value: '',
            },
            'rabbitmq.connection.ssl.truststore.location': {
                name: 'Truststore Location',
                type: 'text',
                value: '',
            },
            'rabbitmq.connection.ssl.truststore.type': {
                name: 'Truststore Type',
                type: 'text',
                value: '',
            },
            'rabbitmq.connection.ssl.truststore.password': {
                name: 'Truststore Password',
                type: 'text',
                value: '',
            },
            'rabbitmq.connection.ssl.version': {
                name: 'SSL Version',
                type: 'text',
                value: '',
            },
        },
        other: {
            'rabbitmq.message.content.type': {
                name: 'Content-Type',
                type: 'text',
                value: '',
            },
            'rabbitmq.message.max.dead.lettered.count': {
                name: 'Dead Lettered Count',
                type: 'text',
                value: '',
                validate: {
                    type: 'number',
                    min: 0,
                }
            },
            'rabbitmq.message.requeue.delay': {
                name: 'Requeue Delay',
                type: 'text',
                value: '',
                validate: {
                    type: 'number',
                    min: 0,
                }
            },
            'rabbitmq.consumer.tag': {
                name: 'Consumer Tag',
                type: 'text',
                value: '',
            },
            'rabbitmq.channel.consumer.qos': {
                name: 'Consumer QOS',
                type: 'text',
                value: '',
            },
            'rabbitmq.channel.consumer.qos.type': {
                name: 'Consumer QOS Type',
                type: 'dropdown',
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
                name: 'Error Queue Routing Key',
                type: 'text',
                value: '',
            },
            'rabbitmq.message.error.exchange.name': {
                name: 'Error Exchange Name',
                type: 'text',
                value: '',
            },
        }
    },
    wso2_mb: {
        basic: {
            sequential: {
                type: 'checkbox',
                value: true,
            },
            coordination: {
                type: 'checkbox',
                value: true,
            },
            interval: {
                name: 'Polling Interval',
                type: 'text',
                value: 1000,
                validate: {
                    type: 'number',
                    required: true,
                }
            },
            'java.naming.factory.initial': {
                type: 'text',
                value: 'org.wso2.andes.jndi.PropertiesFileInitialContextFactory',
                validate: {
                    type: 'string',
                    required: true,
                }
            },
            'mb.connection.url': {
                name: 'Connection URL',
                type: 'text',
                value: `amqp://admin:admin@clientID/carbon?brokerlist='tcp://localhost:5673'`,
                validate: {
                    type: 'string',
                    required: true,
                }
            },
        },
        // credentials ???
        // principal ???
        connection: {
            'transport.jms.ConnectionFactoryJNDIName': {
                name: 'Connection Factory JNDI Name',
                type: 'text',
                value: '',
            },
            'transport.jms.ConnectionFactoryType': {
                name: 'Connection Factory Type',
                type: 'radio',
                value: 'topic',
                items: [
                    { content: "topic", value: "topic", },
                    { content: "queue", value: "queue", },
                ],
            },
            'transport.jms.Destination': {
                name: 'Destination Name',
                type: 'text',
                value: '',
            },
            'transport.jms.ReplyDestination': {
                name: 'Reply Destination',
                type: 'text',
                value: '',
            },
        },
        session: {
            'transport.jms.SessionTransacted': {
                type: 'checkbox',
                name: 'Session Transacted',
                value: false,
            },
            'transport.jms.SessionAcknowledgement': {
                type: 'dropdown',
                name: 'Session Ack',
                value: 'AUTO_ACKNOWLEDGE',
                items: [
                    { value: "AUTO_ACKNOWLEDGE", },
                    { value: "CLIENT_ACKNOWLEDGE", },
                    { value: "DUPS_OK_ACKNOWLEDGE", },
                    { value: "SESSION_TRANSACTED", }
                ],
            },
        },
        resilience: {
            'concurrent.consumers': {
                type: 'text',
                value: '',
            },
            'transport.jms.retry.duration': {
                name: 'Retry Duration',
                type: 'text',
                value: '',
                validate: {
                    type: 'number',
                }
            },
            'transport.jms.ReceiveTimeout': {
                name: 'Receive Timeout',
                type: 'text',
                value: '',
            },
        },
        message: {
            'transport.jms.CacheLevel': {
                name: 'Cache Level',
                type: 'radio',
                value: "3",
                items: [
                    { content: "1", value: '1', },
                    { content: "2", value: '2', },
                    { content: "3", value: '3', },
                ],
            },
            'transport.jms.JMSSpecVersion': {
                name: 'JMS Spec Version',
                type: 'text',
                value: '',
            },
            'transport.jms.ContentType': {
                name: 'Content Type',
                type: 'text',
                value: '',
            },
            'transport.jms.ContentTypeProperty': {
                name: 'Content Type Property',
                type: 'text',
                value: '',
            },
        },
        subscription: {
            'transport.jms.SharedSubscription': {
                name: 'Shared Subscription',
                type: 'checkbox',
                value: false,
            },
            'transport.jms.SubscriptionName': {
                name: 'Subscription Name',
                type: 'text',
                value: '',
            },
            'transport.jms.SubscriptionDurable': {
                name: 'Subscription Durable',
                type: 'text',
                value: '',
            },
            'transport.jms.DurableSubscriberClientID': {
                name: 'Durable Subscriber Client ID',
                type: 'text',
                value: '',
            },
            'transport.jms.DurableSubscriberName': {
                name: 'Durable Subscriber Name',
                type: 'text',
                value: '',
            },
        },
        other: {
            'transport.jms.MessageSelector': {
                name: 'Message Selector',
                type: 'text',
                value: '',
            },
            'pinnedServers': {
                name: 'Pinned Servers',
                type: 'text',
                value: '',
            },
            'transport.jms.PubSubNoLocal': {
                name: 'PubSub No Local',
                type: 'text',
                value: '',
            },
        }
    }
};
