/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from "@emotion/styled";
import { Card } from "@wso2-enterprise/ui-toolkit";

const CardContainer = styled.div({
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 20,
    justifyContent: "center",
    width: "100%",
});

const CARD_WRAPPER_DATA = {
    INBOUND_ENDPOINT: {
        cards: [
            {
                title: 'HTTP',
                icon: 'http',
                description: 'HTTP protocol',
            },
            {
                title: 'HTTPS',
                icon: 'https',
                description: 'Secure HTTP protocol',
            },
            {
                title: 'File',
                icon: 'file',
                description: 'File system',
            },
            {
                title: 'JMS',
                icon: 'jms',
                description: 'Java Messaging Service',
            },
            {
                title: 'KAFKA',
                icon: 'kafka',
                description: 'Kafka messaging',
            },
            {
                title: 'RABBITMQ',
                icon: 'rabbit-mq',
                description: 'RabbitMQ messaging',
            },
            {
                title: 'HL7',
                icon: 'hl7',
                description: 'Healthcare messaging',
            },
            {
                title: 'MQTT',
                icon: 'mqtt',
                description: 'MQTT messaging',
            },
            {
                title: 'WS',
                icon: 'ws',
                description: 'Web Services',
            },
            {
                title: 'WSO2_MB',
                icon: 'wso2-mb',
                description: 'WSO2 Message Broker',
            },
            {
                title: 'WSS',
                icon: 'wss',
                description: 'Secure Web Services',
            },
            {
                title: 'CXF_WS_RM',
                icon: 'cxf-ws-rm',
                description: 'CXF with WS-RM',
            },
            {
                title: 'Feed',
                icon: 'feed',
                description: 'RSS/Atom feed',
            },
            {
                title: 'Custom',
                icon: 'user-defined-endpoint',
                description: 'User-defined endpoint',
            },
        ]
    },
    MESSAGE_PROCESSOR: {
        cards: [
            {
                title: 'Message Sampling Processor',
                icon: 'message-sampling-processor',
                description: 'Sample messages for processing',
            },
            {
                title: 'Scheduled Message Forwarding Processor',
                icon: 'scheduled-message-forwarding-processor',
                description: 'Forwards messages on a schedule',
            },
            {
                title: 'Scheduled Failover Message Forwarding Processor',
                icon: 'scheduled-failover-message-forwarding-processor',
                description: 'Handle failover scenarios',
            },
            {
                title: 'Custom Message Processor',
                icon: 'custom-message-processor',
                description: 'Configure a custom message processor',
            }
        ]
    },
    ENDPOINT: {
        cards: [
            {
                title: 'Address Endpoint',
                icon: 'address-endpoint',
                description: 'Direct address connection',
            },
            {
                title: 'Default Endpoint',
                icon: 'default-endpoint',
                description: 'Fallback endpoint',
            },
            {
                title: 'Failover Endpoint',
                icon: 'failover-endpoint',
                description: 'Backup endpoint on failure',
            },
            {
                title: 'HTTP Endpoint',
                icon: 'http-endpoint',
                description: 'HTTP connection endpoint',
            },
            {
                title: 'Load Balance Endpoint',
                icon: 'load-balance-endpoint',
                description: 'Distributes load among multiple endpoints',
            },
            {
                title: 'Recipient List Endpoint',
                icon: 'recipient-list-endpoint',
                description: 'Routes messages to multiple destinations',
            },
            {
                title: 'Template Endpoint',
                icon: 'template-endpoint',
                description: 'Reusable endpoint template',
            },
            {
                title: 'WSDL Endpoint',
                icon: 'wsdl-endpoint',
                description: 'Endpoint defined in a WSDL file',
            }
        ]
    },
    TEMPLATE: {
        cards: [
            {
                title: 'Address Endpoint Template',
                icon: 'address-endpoint-template',
                description: 'Specifies a communication URL',
            },
            {
                title: 'Default Endpoint Template',
                icon: 'default-endpoint-template',
                description: 'Adds QoS to the To address',
            },
            {
                title: 'HTTP Endpoint Template',
                icon: 'http-endpoint-template',
                description: 'Defines REST endpoints',
            },
            {
                title: 'WSDL Endpoint Template',
                icon: 'wsdl-endpoint-template',
                description: 'Connects to WSDL definitions',
            },
            {
                title: 'Sequence Template',
                icon: 'sequence-template',
                description: 'Sequential processing specification',
            },
        ]
    },
    LOCAL_ENTRY: {
        cards: [
            {
                title: 'In-Line Text Entry',
                icon: 'in-line-text-entry',
                description: 'Stores text content',
            },
            {
                title: 'In-Line XML Entry',
                icon: 'in-line-xml-entry',
                description: 'Stores XML content',
            },
            {
                title: 'Source URL Entry',
                icon: 'source-url-entry',
                description: 'Stores a URL reference',
            }
        ]
    },
    MESSAGE_STORE: {
        cards: [
            {
                title: 'In Memory Message Store',
                icon: 'in-memory-message-store',
                description: 'Temporarily holds messages in memory',
            },
            {
                title: 'RabbitMQ Message Store',
                icon: 'rabbitMQ-message-store',
                description: 'Utilizes RabbitMQ for message storage',
            },
            {
                title: 'JMS Message Store',
                icon: 'jms-message-store',
                description: 'Stores messages for Java Message Service (JMS) communication.',
            },
            {
                title: 'JDBC Message Store',
                icon: 'jdbc-message-store',
                description: 'Persists messages using a JDBC database',
            },
            {
                title: 'Custom Message Store',
                icon: 'custom-message-store',
                description: 'Allows custom implementations for specific requirements',
            },
            {
                title: 'Resequence Message Store',
                icon: 'resequence-message-store',
                description: 'Reorders messages based on specified criteria',
            },
            {
                title: 'WSO2 MB Message Store',
                icon: 'wso2-mb-message-store',
                description: 'Integrates with WSO2 Message Broker',
            }
        ]
    },
};

type CardWrapperProps = {
    cardsType: keyof typeof CARD_WRAPPER_DATA;
    setType: (type: string) => void;
}

const CardWrapper = (props: CardWrapperProps) => {
    return (
        <CardContainer>
            {CARD_WRAPPER_DATA[props.cardsType].cards.map((card, index) => (
                <Card
                    key={index}
                    icon={card.icon}
                    title={card.title}
                    description={card.description}
                    onClick={() => props.setType(card.title)}
                />
            ))}
        </CardContainer>
    )
}

export default CardWrapper;
