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
                icon: 'code',
                description: 'HTTP protocol',
            },
            {
                title: 'HTTPS',
                icon: 'code',
                description: 'Secure HTTP protocol',
            },
            {
                title: 'File',
                icon: 'code',
                description: 'File system',
            },
            {
                title: 'JMS',
                icon: 'code',
                description: 'Java Messaging Service',
            },
            {
                title: 'KAFKA',
                icon: 'code',
                description: 'Kafka messaging',
            },
            {
                title: 'RABBITMQ',
                icon: 'code',
                description: 'RabbitMQ messaging',
            },
            {
                title: 'HL7',
                icon: 'code',
                description: 'Healthcare messaging',
            },
            {
                title: 'MQTT',
                icon: 'code',
                description: 'MQTT messaging',
            },
            {
                title: 'WS',
                icon: 'code',
                description: 'Web Services',
            },
            {
                title: 'WSO2_MB',
                icon: 'code',
                description: 'WSO2 Message Broker',
            },
            {
                title: 'WSS',
                icon: 'code',
                description: 'Secure Web Services',
            },
            {
                title: 'CXF_WS_RM',
                icon: 'code',
                description: 'CXF with WS-RM',
            },
            {
                title: 'Feed',
                icon: 'code',
                description: 'RSS/Atom feed',
            },
            {
                title: 'Custom',
                icon: 'code',
                description: 'User-defined endpoint',
            },
        ]
    },
    MESSAGE_PROCESSOR: {
        cards: [
            {
                title: 'Message Sampling Processor',
                icon: 'code',
                description: 'Sample messages for processing',
            },
            {
                title: 'Scheduled Message Forwarding Processor',
                icon: 'code',
                description: 'Forwards messages on a schedule',
            },
            {
                title: 'Scheduled Failover Message Forwarding Processor',
                icon: 'code',
                description: 'Handle failover scenarios',
            },
            {
                title: 'Custom Message Processor',
                icon: 'code',
                description: 'Configure a custom message processor',
            }
        ]
    },
    ENDPOINT: {
        cards: [
            {
                title: 'Address Endpoint',
                icon: 'code',
                description: 'Direct address connection',
            },
            {
                title: 'Default Endpoint',
                icon: 'code',
                description: 'Fallback endpoint',
            },
            {
                title: 'Failover Endpoint',
                icon: 'code',
                description: 'Backup endpoint on failure',
            },
            {
                title: 'HTTP Endpoint',
                icon: 'code',
                description: 'HTTP connection endpoint',
            },
            {
                title: 'Load Balance Endpoint',
                icon: 'code',
                description: 'Distributes load among multiple endpoints',
            },
            {
                title: 'Recipient List Endpoint',
                icon: 'code',
                description: 'Routes messages to multiple destinations',
            },
            {
                title: 'Template Endpoint',
                icon: 'code',
                description: 'Reusable endpoint template',
            },
            {
                title: 'WSDL Endpoint',
                icon: 'code',
                description: 'Endpoint defined in a WSDL file',
            }
        ]
    },
    TEMPLATE: {
        cards: [
            {
                title: 'Address Endpoint Template',
                icon: 'code',
                description: 'Address endpoint specification',
            },
            {
                title: 'Default Endpoint Template',
                icon: 'code',
                description: 'Default endpoint specification',
            },
            {
                title: 'HTTP Endpoint Template',
                icon: 'code',
                description: 'HTTP endpoint specification',
            },
            {
                title: 'WSDL Endpoint Template',
                icon: 'code',
                description: 'WSDL endpoint specification',
            },
            {
                title: 'Sequence Template',
                icon: 'code',
                description: 'Sequential processing specification',
            },
        ]
    },
    LOCAL_ENTRY: {
        cards: [
            {
                title: 'In-Line Text Entry',
                icon: 'code',
                description: 'Stores text content',
            },
            {
                title: 'In-Line XML Entry',
                icon: 'code',
                description: 'Stores XML content',
            },
            {
                title: 'Source URL Entry',
                icon: 'code',
                description: 'Stores a URL reference',
            }
        ]
    },
    MESSAGE_STORE: {
        cards: [
            {
                title: 'In Memory Message Store',
                icon: 'code',
                description: 'Temporarily holds messages in memory',
            },
            {
                title: 'RabbitMQ Message Store',
                icon: 'code',
                description: 'Utilizes RabbitMQ for message storage',
            },
            {
                title: 'JMS Message Store',
                icon: 'code',
                description: 'Stores messages for Java Message Service (JMS) communication.',
            },
            {
                title: 'JDBC Message Store',
                icon: 'code',
                description: 'Persists messages using a JDBC database',
            },
            {
                title: 'Custom Message Store',
                icon: 'code',
                description: 'Allows custom implementations for specific requirements',
            },
            {
                title: 'Resequence Message Store',
                icon: 'code',
                description: 'Reorders messages based on specified criteria',
            },
            {
                title: 'WSO2 MB Message Store',
                icon: 'code',
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
