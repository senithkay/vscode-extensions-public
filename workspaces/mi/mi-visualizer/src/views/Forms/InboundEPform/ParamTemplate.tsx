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

export const sampleData: ParamPool = {
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
    }
}
